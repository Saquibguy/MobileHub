import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productService } from "../services";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { RatingStars, PriceDisplay } from "../components/Common";
import ProductCard from "../components/ProductCard";
import { Heart, Minus, Plus } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    productService.get(id).then((r) => {
      setProduct(r.data);
      productService.list({ category: r.data.categoryId?._id, limit: 5 }).then((rr) =>
        setRelated(rr.data.filter((p) => p._id !== r.data._id))
      );
      productService.reviews(r.data._id).then((rr) => setReviews(rr.data));
    });
  }, [id]);

  if (!product) return <div className="p-10 text-center text-gray-400">Loading...</div>;
  const wished = wishlist?.products?.some((p) => (p._id || p) === product._id);
  const price = product.discountPrice || product.price;

  const guardAuth = (fn) => {
    if (!user) return navigate("/login");
    fn();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-7xl overflow-hidden shadow-sm">
          {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" /> : "📦"}
          {product.price > price && (
            <span className="absolute top-3 left-3 bg-gradient-to-br from-red-500 to-orange-500 text-white text-xs font-extrabold px-3 py-1 rounded-lg shadow-md">
              {Math.round((1 - price / product.price) * 100)}% OFF
            </span>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold mb-2 tracking-tight">{product.name}</h1>
          <RatingStars rating={product.rating} count={product.reviewCount} />
          <div className="my-3"><PriceDisplay price={price} mrp={product.price !== price ? product.price : null} /></div>
          <p className={`inline-block text-xs font-bold mb-3 px-2.5 py-1 rounded-full ${product.stock > 0 ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40" : "text-red-700 bg-red-50 dark:bg-red-950/40"}`}>
            {product.stock > 0 ? `In stock — ${product.stock} left` : "Out of stock"}
          </p>
          <p className="text-sm text-gray-500 mb-4">{product.description}</p>
          <p className="text-sm mb-1"><b>Sold by:</b> {product.sellerId?.storeName}</p>
          <p className="text-sm mb-4"><b>Delivery:</b> 3–5 business days</p>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center border-2 border-gray-200 dark:border-gray-700 rounded-xl">
              <button className="px-3 py-2 hover:text-brand transition-colors" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus size={14} /></button>
              <span className="px-2 font-bold">{qty}</span>
              <button className="px-3 py-2 hover:text-brand transition-colors" onClick={() => setQty((q) => q + 1)}><Plus size={14} /></button>
            </div>
            <button onClick={() => guardAuth(() => toggleWishlist(product._id))} className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${wished ? "border-red-400 bg-red-50 dark:bg-red-950/40 text-red-500" : "border-gray-200 dark:border-gray-700 hover:border-red-300"}`}>
              <Heart size={16} fill={wished ? "currentColor" : "none"} />
            </button>
          </div>
          <div className="hidden md:flex gap-3">
            <button disabled={product.stock <= 0} className="btn-primary flex-1" onClick={() => guardAuth(() => addToCart(product._id, qty))}>Add to Cart</button>
            <button disabled={product.stock <= 0} className="btn-outline flex-1" onClick={() => guardAuth(async () => { await addToCart(product._id, qty); navigate("/checkout"); })}>Buy Now</button>
          </div>
        </div>
      </div>

      {/* Sticky buy bar on mobile so purchase actions stay reachable while scrolling reviews */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-t border-gray-100 dark:border-gray-800 p-3 flex gap-2">
        <button disabled={product.stock <= 0} className="btn-primary flex-1 text-sm" onClick={() => guardAuth(() => addToCart(product._id, qty))}>Add to Cart</button>
        <button disabled={product.stock <= 0} className="btn-outline flex-1 text-sm" onClick={() => guardAuth(async () => { await addToCart(product._id, qty); navigate("/checkout"); })}>Buy Now</button>
      </div>

      <section className="mt-10">
        <h2 className="font-extrabold text-lg mb-3">Customer Reviews ({reviews.length})</h2>
        {reviews.length === 0 && <p className="text-gray-400 text-sm">No reviews yet.</p>}
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="card p-4">
              <div className="flex justify-between items-center mb-1">
                <p className="font-bold text-sm">{r.userId?.name}</p>
                <RatingStars rating={r.rating} />
              </div>
              <p className="text-sm text-gray-500">{r.comment}</p>
            </div>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="font-extrabold text-lg mb-3">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
