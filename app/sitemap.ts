import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://sakan-arish.vercel.app";

  let properties: { id: string; created_at: string }[] = [];
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data } = await supabase
        .from("properties")
        .select("id, created_at");
      if (data) {
        properties = data;
      }
    }
  } catch (err) {
    console.warn("Could not load properties for sitemap:", err);
  }

  const propertyEntries: MetadataRoute.Sitemap = properties.map((p) => ({
    url: `${baseUrl}/property/${p.id}`,
    lastModified: new Date(p.created_at || Date.now()),
    changeFrequency: "daily",
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/list-your-property`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...propertyEntries,
  ];
}
