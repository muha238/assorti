import "server-only";
import { formatPrice } from "./format";

type NotifyOrder = {
  orderNumber: number;
  tableNumber: string;
  comment?: string | null;
  total: number;
  items: { name: string; price: number; quantity: number }[];
};

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Жаңа тапсырыс туралы Telegram-ға хабарлама.
 * TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID болмаса — үнсіз өткізіп жібереді.
 * Қате болса тапсырысты құлатпайды, тек логқа жазады.
 */
export async function notifyNewOrder(order: NotifyOrder): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const lines = order.items
    .map((i) => `• ${escapeHtml(i.name)} × ${i.quantity} — ${formatPrice(i.price * i.quantity)}`)
    .join("\n");

  const parts = [
    `🛎 <b>Жаңа тапсырыс #${order.orderNumber}</b>`,
    `🪑 Үстел: <b>${escapeHtml(order.tableNumber)}</b>`,
    "",
    lines,
    "",
    `💰 Барлығы: <b>${formatPrice(order.total)}</b>`,
  ];
  if (order.comment) parts.push(`💬 ${escapeHtml(order.comment)}`);
  const text = parts.join("\n");

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    if (!res.ok) console.error("[telegram] error:", res.status, await res.text());
  } catch (err) {
    console.error("[telegram] network error:", err);
  }
}
