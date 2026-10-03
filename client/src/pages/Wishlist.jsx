import { useCart } from "../context/CartContext";
import { EmptyState } from "../components/Common";
import ProductCard from "../components/ProductCard";

export default function WishlistPage() {
  const { wishlist } = useCart();
  const items = wishlist?.products || [];
  if (!items.length) return <EmptyState icon="♡" title="Wishlist is empty" subtitle="Save items you love for later." cta="Shop Now" to="/products" />;
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="font-extrabold text-lg mb-4">Wishlist ({items.length})</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
    </div>
  );
}
