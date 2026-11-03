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

  // Defense-in-depth: Never expose owner_phone publicly
  if (!options?.forAdmin) {
    return list.map((item) => {
      const { owner_phone, ...safeItem } = item;
      return safeItem as Property;
    });
  }

  return list;
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

  // Defense-in-depth: Never expose owner_phone publicly
  if (!options?.forAdmin) {
    const { owner_phone, ...safeItem } = item;
    return safeItem as Property;
  }

  return item;
}

export async function upsertProperty(
  propertyData: Omit<Property, "id" | "created_at"> & { id?: string }
): Promise<{ success: boolean; property?: Property; error?: string }> {
  try {
    const supabase = await createClient();
    const { id, ...rawSupabaseData } = propertyData;

    // Derive status automatically from available_beds
    const autoStatus = derivePropertyStatus(propertyData.available_beds);
    const supabaseData = {
      ...rawSupabaseData,
      status: autoStatus,
    };

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
      return { success: true, property: data as Property };
    } else {
      const { data, error } = await supabase
        .from("properties")
        .insert(supabaseData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, property: data as Property };
    }
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

    // 1. Record event row in property_clicks
    await supabase.from("property_clicks").insert({
      property_id: propertyId,
    });

    // 2. Increment counter on the property record
    const { data: currentProp } = await supabase
      .from("properties")
      .select("whatsapp_clicks")
      .eq("id", propertyId)
      .maybeSingle();

    const currentCount = currentProp?.whatsapp_clicks || 0;
    await supabase
      .from("properties")
      .update({ whatsapp_clicks: currentCount + 1 })
      .eq("id", propertyId);

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
    const { error } = await supabase
      .from("properties")
      .update({ status: newStatus })
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

    // 3. Delete property record from DB
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
