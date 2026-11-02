"use server";

import { revalidatePath } from "next/cache";
import { upsertProperty, updatePropertyStatus, deleteProperty } from "@/lib/properties-store";
import type { Property } from "@/components/property/PropertyCard";

export async function savePropertyAction(data: Omit<Property, "id" | "created_at"> & { id?: string }) {
  const result = await upsertProperty(data);
  revalidatePath("/");
  revalidatePath("/admin/dashboard");
  if (data.id) {
    revalidatePath(`/property/${data.id}`);
  }
  return result;
}

export async function updateStatusAction(id: string, status: string) {
  const result = await updatePropertyStatus(id, status);
  revalidatePath("/");
  revalidatePath("/admin/dashboard");
  revalidatePath(`/property/${id}`);
  return result;
}

export async function deletePropertyAction(id: string) {
  const result = await deleteProperty(id);
  revalidatePath("/");
  revalidatePath("/admin/dashboard");
  return result;
}
