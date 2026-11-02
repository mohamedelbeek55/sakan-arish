import fs from "fs/promises";
import path from "path";
import type { Property } from "@/components/property/PropertyCard";
import { createClient } from "./supabase/server";

const DATA_FILE = path.join(process.cwd(), "data", "properties.json");

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return url.length > 0 && !url.includes("your-project") && !url.includes("placeholder");
}

export async function getLocalProperties(): Promise<Property[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    try {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await fs.writeFile(DATA_FILE, "[]", "utf-8");
    } catch {
      // ignore
    }
  }
  return [];
}

export async function saveLocalProperties(properties: Property[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(properties, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to properties.json:", err);
  }
}

export async function getAllProperties(): Promise<Property[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Property[];
      }
    } catch {
      // Fallback to local
    }
  }
  return await getLocalProperties();
}

export async function getPropertyById(id: string): Promise<Property | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        return data as Property;
      }
    } catch {
      // Fallback
    }
  }

  const locals = await getLocalProperties();
  return locals.find((p) => p.id === id) || null;
}

export async function upsertProperty(
  propertyData: Omit<Property, "id" | "created_at"> & { id?: string }
): Promise<{ success: boolean; property: Property; error?: string }> {
  let savedProperty: Property;

  // 1. Try Supabase first
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { id, ...supabaseData } = propertyData;

      if (id && !id.startsWith("prop-")) {
        const { data, error } = await supabase
          .from("properties")
          .update(supabaseData)
          .eq("id", id)
          .select()
          .single();

        if (!error && data) {
          savedProperty = data as Property;
          const currentList = await getLocalProperties();
          const index = currentList.findIndex((p) => p.id === id);
          if (index >= 0) currentList[index] = savedProperty;
          else currentList.unshift(savedProperty);
          await saveLocalProperties(currentList);
          return { success: true, property: savedProperty };
        }
      } else {
        const { data, error } = await supabase
          .from("properties")
          .insert(supabaseData)
          .select()
          .single();

        if (!error && data) {
          savedProperty = data as Property;
          const currentList = await getLocalProperties();
          currentList.unshift(savedProperty);
          await saveLocalProperties(currentList);
          return { success: true, property: savedProperty };
        }
      }
    } catch (e) {
      console.warn("Supabase operation failed, falling back to local storage:", e);
    }
  }

  // 2. Local fallback
  const currentList = await getLocalProperties();
  if (propertyData.id) {
    const index = currentList.findIndex((p) => p.id === propertyData.id);
    savedProperty = {
      ...propertyData,
      id: propertyData.id,
      created_at: index >= 0 ? currentList[index].created_at : new Date().toISOString(),
    } as Property;
    if (index >= 0) {
      currentList[index] = savedProperty;
    } else {
      currentList.unshift(savedProperty);
    }
  } else {
    savedProperty = {
      ...propertyData,
      id: "prop-" + Date.now(),
      created_at: new Date().toISOString(),
    } as Property;
    currentList.unshift(savedProperty);
  }

  await saveLocalProperties(currentList);
  return { success: true, property: savedProperty };
}

export async function updatePropertyStatus(
  id: string,
  newStatus: string
): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      if (!id.startsWith("prop-")) {
        await supabase.from("properties").update({ status: newStatus }).eq("id", id);
      }
    } catch {
      // ignore
    }
  }

  const currentList = await getLocalProperties();
  const index = currentList.findIndex((p) => p.id === id);
  if (index >= 0) {
    currentList[index].status = newStatus;
    await saveLocalProperties(currentList);
  }

  return true;
}

export async function deleteProperty(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      if (!id.startsWith("prop-")) {
        await supabase.from("properties").delete().eq("id", id);
      }
    } catch {
      // ignore
    }
  }

  const currentList = await getLocalProperties();
  const filtered = currentList.filter((p) => p.id !== id);
  await saveLocalProperties(filtered);

  return true;
}
