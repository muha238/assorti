import type { Promo } from "@/lib/promo";

export type Category = {
  id: string;
  name: string;
  name_ru?: string | null;
  slug: string;
  sort_order: number;
};

export type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  name_ru?: string | null;
  description: string | null;
  description_ru?: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  promo: Promo | null;
  sort_order: number;
};

export type CategoryWithItems = Category & { menu_items: MenuItem[] };

export type CartItem = {
  id: string;
  name: string;
  name_ru?: string | null;
  price: number;
  image_url: string | null;
  quantity: number;
};

export type OrderStatus = "new" | "cooking" | "ready" | "served" | "cancelled";

/** Клиент → API жіберетін payload (баға жоқ — сервер өзі есептейді) */
export type CreateOrderPayload = {
  tableNumber: string;
  comment?: string;
  items: { id: string; quantity: number }[];
};

export type OrderItemRow = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  free_quantity: number;
};

export type Order = {
  id: string;
  order_number: number;
  table_number: string;
  comment: string | null;
  total: number;
  status: OrderStatus;
  created_at: string;
  order_items: OrderItemRow[];
};
