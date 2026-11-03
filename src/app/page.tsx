import { CartProvider } from "@/components/cart/CartProvider";
import { MenuView } from "@/components/menu/MenuView";
import { getMenu } from "@/lib/menu";

type Props = {
  searchParams: Promise<{ table?: string }>;
};

/**
 * QR сілтеме форматы:  https://your-domain.kz/?table=7
 */
export default async function MenuPage({ searchParams }: Props) {
  const { table } = await searchParams;
  const categories = await getMenu();

  return (
    <CartProvider>
      <MenuView
        categories={categories}
        initialTable={(table ?? "").slice(0, 10)}
        restaurantName={process.env.NEXT_PUBLIC_RESTAURANT_NAME ?? "Dala Cafe"}
      />
    </CartProvider>
  );
}
