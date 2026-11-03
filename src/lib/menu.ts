import { createPublicClient } from "./supabase/public";
import type { CategoryWithItems } from "@/types";

export async function getMenu(): Promise<CategoryWithItems[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, sort_order, menu_items(*)")
    .order("sort_order", { ascending: true })
    .order("sort_order", { referencedTable: "menu_items", ascending: true });

  if (error) throw new Error(`Мәзірді жүктеу қатесі: ${error.message}`);
  return (data ?? []) as CategoryWithItems[];
}
