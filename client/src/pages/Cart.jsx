import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { EmptyState } from "../components/Common";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function CartPage() {
  const { cart, updateCartItem, removeCartItem } = useCart();
  const navigate = useNavigate();
  const items = cart.items.filter((i) => !i.savedForLater);

  if (!items.length) return <EmptyState icon="🛒" title="Your cart is empty" subtitle="Browse products and add something you like." cta="Shop Now" to="/products" />;

  const subtotal = items.reduce((s, i) => s + (i.productId?.discountPrice || i.productId?.price || i.priceAtAdd) * i.quantity, 0);
  const tax = Math.round(subtotal * 0.05);
  const shipping = subtotal > 999 ? 0 : 79;
  const total = subtotal + tax + shipping;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="font-extrabold text-lg mb-4">Your Cart ({items.reduce((s, i) => s + i.quantity, 0)})</h1>
      <div className="space-y-3 mb-6">
        {items.map((item) => {
          const p = item.productId;
          if (!p) return null;
          return (
            <div key={item._id} className="card p-3 flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-indigo-50 dark:bg-gray-800 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                {p.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-cover" /> : "📦"}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${p.slug || p._id}`} className="font-semibold text-sm line-clamp-1">{p.name}</Link>
                <p className="font-extrabold text-sm mt-0.5">₹{(p.discountPrice || p.price)?.toLocaleString("en-IN")}</p>
                <div className="flex items-center border-2 border-gray-200 dark:border-gray-700 rounded-lg w-fit mt-1.5">
                  <button className="px-2 py-1" onClick={() => updateCartItem(item._id, { quantity: Math.max(1, item.quantity - 1) })}><Minus size={12} /></button>
                  <span className="px-2 text-xs font-bold">{item.quantity}</span>
                  <button className="px-2 py-1" onClick={() => updateCartItem(item._id, { quantity: item.quantity + 1 })}><Plus size={12} /></button>
                </div>
              </div>
              <button onClick={() => removeCartItem(item._id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
            </div>
          );
        })}
      </div>
      <div className="card p-4">
        <div className="flex justify-between text-sm text-gray-500 mb-1.5"><span>Subtotal</span><b className="text-gray-900 dark:text-white">₹{subtotal.toLocaleString("en-IN")}</b></div>
        <div className="flex justify-between text-sm text-gray-500 mb-1.5"><span>Tax (5%)</span><b className="text-gray-900 dark:text-white">₹{tax.toLocaleString("en-IN")}</b></div>
        <div className="flex justify-between text-sm text-gray-500 mb-3"><span>Shipping</span><b className={shipping === 0 ? "text-emerald-600" : "text-gray-900 dark:text-white"}>{shipping === 0 ? "FREE" : `₹${shipping}`}</b></div>
        <div className="flex justify-between text-lg font-extrabold border-t border-dashed border-gray-200 dark:border-gray-700 pt-3 mb-3"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
        <button className="btn-primary w-full" onClick={() => navigate("/checkout")}>Proceed to Checkout →</button>
      </div>
    </div>
  );
}
