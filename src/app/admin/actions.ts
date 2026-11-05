"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPromo } from "@/lib/promo";
import type { OrderStatus } from "@/types";

const STATUSES: OrderStatus[] = ["new", "cooking", "ready", "served", "cancelled"];

export async function updateOrderStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  if (!id || !STATUSES.includes(status)) return;

  const supabase = createAdminClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

/** Тағамды «бітті» / «бар» деп белгілеу */
export async function setItemAvailability(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const available = formData.get("available") === "true";
  if (!id) return;

  const supabase = createAdminClient();
  const { error } = await supabase.from("menu_items").update({ is_available: available }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/menu");
  revalidatePath("/");
}

/** Тағамға акция жариялау / алып тастау (promo бос болса — акция жоқ) */
export async function setItemPromo(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const raw = String(formData.get("promo") ?? "");
  if (!id) return;
  if (raw && !isPromo(raw)) return;

  const supabase = createAdminClient();
  const { error } = await supabase.from("menu_items").update({ promo: raw || null }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/menu");
  revalidatePath("/");
}

/** Барлық тағамдағы акцияны бірден тоқтату */
export async function clearAllPromos() {
  const supabase = createAdminClient();
  const { error } = await supabase.from("menu_items").update({ promo: null }).not("promo", "is", null);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/menu");
  revalidatePath("/");
}
