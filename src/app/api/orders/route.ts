import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyNewOrder } from "@/lib/telegram";
import { freeQuantity, isPromo } from "@/lib/promo";
import type { CreateOrderPayload } from "@/types";

const MAX_QTY = 50;

function validate(body: unknown): CreateOrderPayload | string {
  if (!body || typeof body !== "object") return "Қате сұраныс";
  const b = body as Record<string, unknown>;

  const tableNumber = typeof b.tableNumber === "string" ? b.tableNumber.trim() : "";
  if (!tableNumber || tableNumber.length > 10) return "Үстел нөмірін көрсетіңіз";

  const comment = typeof b.comment === "string" ? b.comment.trim().slice(0, 500) : undefined;

  if (!Array.isArray(b.items) || b.items.length === 0) return "Себет бос";
  const items: CreateOrderPayload["items"] = [];
  for (const raw of b.items) {
    const it = raw as Record<string, unknown>;
    const qty = Number(it?.quantity);
    if (typeof it?.id !== "string" || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      return "Себетте қате позиция бар";
    }
    items.push({ id: it.id, quantity: qty });
  }
  return { tableNumber, comment, items };
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON қате" }, { status: 400 });
  }

  const payload = validate(json);
  if (typeof payload === "string") {
    return NextResponse.json({ error: payload }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 1) Бағаны клиенттен АЛМАЙМЫЗ — базадан аламыз
  const ids = [...new Set(payload.items.map((i) => i.id))];
  const { data: dbItems, error: itemsErr } = await supabase
    .from("menu_items")
    .select("id, name, price, is_available, promo")
    .in("id", ids);

  if (itemsErr) {
    console.error(itemsErr);
    return NextResponse.json({ error: "Сервер қатесі" }, { status: 500 });
  }

  const byId = new Map(dbItems.map((i) => [i.id, i]));
  const lines: {
    menu_item_id: string;
    name: string;
    price: number;
    quantity: number;
    free_quantity: number;
  }[] = [];
  const soldOut: string[] = [];
  for (const { id, quantity } of payload.items) {
    const db = byId.get(id);
    if (!db) {
      soldOut.push("белгісіз тағам");
      continue;
    }
    if (!db.is_available) {
      soldOut.push(db.name);
      continue;
    }
    // Акцияны клиенттен АЛМАЙМЫЗ — базадағы promo бойынша есептейміз
    const promo = isPromo(db.promo) ? db.promo : null;
    lines.push({
      menu_item_id: id,
      name: db.name,
      price: db.price,
      quantity,
      free_quantity: freeQuantity(promo, quantity),
    });
  }
  if (soldOut.length > 0) {
    return NextResponse.json(
      { error: `Бітіп қалды: ${soldOut.join(", ")}. Себеттен алып тастаңыз.`, soldOut },
      { status: 409 },
    );
  }
  const total = lines.reduce((s, l) => s + l.price * l.quantity, 0);

  // 2) Тапсырысты жазамыз
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({ table_number: payload.tableNumber, comment: payload.comment || null, total })
    .select("id, order_number")
    .single();

  if (orderErr || !order) {
    console.error(orderErr);
    return NextResponse.json({ error: "Тапсырысты сақтау мүмкін болмады" }, { status: 500 });
  }

  const { error: linesErr } = await supabase
    .from("order_items")
    .insert(lines.map((l) => ({ ...l, order_id: order.id })));

  if (linesErr) {
    console.error(linesErr);
    await supabase.from("orders").delete().eq("id", order.id); // rollback
    return NextResponse.json({ error: "Тапсырысты сақтау мүмкін болмады" }, { status: 500 });
  }

  // 3) Telegram хабарлама (қате болса да тапсырыс сақталып қалады)
  await notifyNewOrder({
    orderNumber: order.order_number,
    tableNumber: payload.tableNumber,
    comment: payload.comment,
    total,
    items: lines,
  });

  return NextResponse.json({ id: order.id, orderNumber: order.order_number, total }, { status: 201 });
}
