import type { Property } from "@/components/property/PropertyCard";
import { createClient } from "./supabase/server";
import { derivePropertyStatus } from "./utils";

function extractStoragePath(imageUrl: string): string | null {
  try {
    const marker = "/property-images/";
    const idx = imageUrl.indexOf(marker);
    if (idx !== -1) {
      return decodeURIComponent(imageUrl.substring(idx + marker.length).split("?")[0]);
    }
    return null;
  } catch {
    return null;
  }
}

export async function getAllProperties(options?: {
  forAdmin?: boolean;
}): Promise<Property[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Database error fetching properties:", error);
    throw new Error(`تعذر جلب السكنات من قاعدة البيانات: ${error.message}`);
  }

  const list = (data || []) as Property[];

  // Admin query: attach owner_phone from the private table
  if (options?.forAdmin) {
    try {
      const { data: privateRows } = await supabase
        .from("property_private")
        .select("property_id, owner_phone");

      if (privateRows && privateRows.length > 0) {
        const phoneMap = new Map<string, string | null>(
          privateRows.map((r: { property_id: string; owner_phone: string | null }) => [
            r.property_id,
            r.owner_phone,
          ])
        );
        return list.map((item) => ({
          ...item,
          owner_phone: phoneMap.get(item.id) || null,
        }));
      }
    } catch (privErr) {
      console.warn("Could not fetch property_private:", privErr);
    }
    return list;
  }

  // Public query: strictly never select/return owner_phone
  return list.map((item) => {
    const { owner_phone, ...safeItem } = item as any;
    return safeItem as Property;
  });
}

export async function getPropertyById(
  id: string,
  options?: { forAdmin?: boolean }
): Promise<Property | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(`Database error fetching property [${id}]:`, error);
    throw new Error(`تعذر جلب بيانات السكن: ${error.message}`);
  }

  if (!data) return null;

  const item = data as Property;

  // Admin query: fetch owner_phone from private table
  if (options?.forAdmin) {
    try {
      const { data: priv } = await supabase
        .from("property_private")
        .select("owner_phone")
        .eq("property_id", id)
        .maybeSingle();

      return {
        ...item,
        owner_phone: priv?.owner_phone || null,
      };
    } catch {
      return item;
    }
  }

  // Public query: strictly never expose owner_phone
  const { owner_phone, ...safeItem } = item as any;
  return safeItem as Property;
}

export async function upsertProperty(
  propertyData: Omit<Property, "id" | "created_at"> & { id?: string }
): Promise<{ success: boolean; property?: Property; error?: string }> {
  try {
    const supabase = await createClient();
    const { id, owner_phone, whatsapp_clicks, ...rawSupabaseData } = propertyData as any;

    // Derive status automatically from available_beds
    const autoStatus = derivePropertyStatus(propertyData.available_beds);
    const supabaseData = {
      ...rawSupabaseData,
      status: autoStatus,
    };

    let savedProperty: Property;

    if (id) {
      const { data, error } = await supabase
        .from("properties")
        .update(supabaseData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      savedProperty = data as Property;
    } else {
      const { data, error } = await supabase
        .from("properties")
        .insert(supabaseData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      savedProperty = data as Property;
    }

    // Save owner_phone into property_private table only
    if (owner_phone !== undefined) {
      const cleanPhone =
        owner_phone && typeof owner_phone === "string" ? owner_phone.trim() : null;

      if (cleanPhone) {
        await supabase.from("property_private").upsert({
          property_id: savedProperty.id,
          owner_phone: cleanPhone,
        });
        savedProperty.owner_phone = cleanPhone;
      } else {
        await supabase
          .from("property_private")
          .delete()
          .eq("property_id", savedProperty.id);
        savedProperty.owner_phone = null;
      }
    }

    return { success: true, property: savedProperty };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "فشلت العملية في قاعدة البيانات";
    return { success: false, error: msg };
  }
}

export async function recordWhatsAppClick(
  propertyId: string
): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();

    // Insert single event row in property_clicks (no counter column read-modify-write)
    const { error } = await supabase.from("property_clicks").insert({
      property_id: propertyId,
    });

    if (error) {
      console.warn("Could not insert into property_clicks:", error);
      return { success: false };
    }

    return { success: true };
  } catch (e) {
    console.warn("Could not record WhatsApp click:", e);
    return { success: false };
  }
}

export async function updatePropertyStatus(
  id: string,
  newStatus: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: prop, error: fetchErr } = await supabase
      .from("properties")
      .select("total_beds")
      .eq("id", id)
      .single();

    if (fetchErr || !prop) {
      return { success: false, error: "السكن غير موجود" };
    }

    const totalBeds = prop.total_beds || 1;
    let available_beds = 0;

    // booked -> 0, one_bed_left -> 1, available -> total_beds
    if (newStatus === "booked") {
      available_beds = 0;
    } else if (newStatus === "one_bed_left") {
      available_beds = 1;
    } else {
      available_beds = totalBeds;
    }

    if (available_beds > totalBeds) {
      available_beds = totalBeds;
    }

    const status = derivePropertyStatus(available_beds);

    const { error } = await supabase
      .from("properties")
      .update({
        available_beds,
        status,
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "فشل تحديث الحالة";
    return { success: false, error: msg };
  }
}

export async function deleteProperty(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // 1. Fetch property to obtain its images
    const property = await getPropertyById(id);

    // 2. Delete images from storage bucket if any exist
    if (property?.images && Array.isArray(property.images) && property.images.length > 0) {
      const pathsToDelete = property.images
        .map(extractStoragePath)
        .filter((p): p is string => typeof p === "string" && p.length > 0);

      if (pathsToDelete.length > 0) {
        try {
          const { error: storageErr } = await supabase.storage
            .from("property-images")
            .remove(pathsToDelete);
          if (storageErr) {
            console.warn("Warning deleting property images from storage:", storageErr);
          }
        } catch (storageException) {
          console.warn("Storage deletion exception:", storageException);
        }
      }
    }

    // 3. Delete property record from DB (property_private cascades automatically)
    const { error } = await supabase.from("properties").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "فشل حذف السكن";
    return { success: false, error: msg };
  }
}
