import { CartProvider } from "@/components/cart/CartProvider";
import { MenuView } from "@/components/menu/MenuView";
import { AutoRefresh } from "@/components/ui/AutoRefresh";
import { getMenu } from "@/lib/menu";

export const dynamic = "force-dynamic";

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
    <CartProvider menuItems={categories.flatMap((c) => c.menu_items)}>
      {/* Админ «бітті» / «1+1» қойса — қонақ бетті жаңартпай-ақ 30 с ішінде көреді */}
      <AutoRefresh seconds={30} />
      <MenuView
        categories={categories}
        initialTable={(table ?? "").slice(0, 10)}
        restaurantName={process.env.NEXT_PUBLIC_RESTAURANT_NAME ?? "Dala Cafe"}
      />
    </CartProvider>
  );
}
