import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { RatingStars, PriceDisplay } from "./Common";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/getImageUrl";

const CAT_ICON = "📦";

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const navigate = useNavigate();
  const wished = wishlist?.products?.some((p) => (p._id || p) === product._id);
  const outOfStock = product.stock <= 0;

  const guardAuth = (fn) => (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    fn();
  };

  return (
    <div className="card p-3 animate-fadein">
      <Link to={`/products/${product.slug || product._id}`}>
        <div className="relative aspect-square rounded-xl mb-2 bg-gradient-to-br from-indigo-50 to-violet-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-3xl overflow-hidden">
          {product.images?.[0] ? (
            <img
  src={getImageUrl(product.images[0])}
  alt={product.name}
  className="w-full h-full object-cover"
  loading="lazy"
/>
          ) : (
            CAT_ICON
          )}
          {product.price > (product.discountPrice || product.price) && (
            <span className="absolute top-1.5 left-1.5 bg-gradient-to-br from-red-500 to-orange-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow-md">
              {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
            </span>
          )}
        </div>
        <p className="text-sm font-semibold leading-snug line-clamp-2 min-h-[2.5rem]">{product.name}</p>
        <RatingStars rating={product.rating} count={product.reviewCount} />
        <PriceDisplay price={product.discountPrice || product.price} mrp={product.price !== product.discountPrice ? product.price : null} />
        {outOfStock && <span className="inline-block mt-1 text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded-full">Out of stock</span>}
      </Link>
      <div className="flex gap-1.5 mt-2">
        <button disabled={outOfStock} onClick={guardAuth(() => addToCart(product._id))} className="btn-primary text-xs py-2 flex-1 disabled:opacity-40">
          Add to cart
        </button>
        <button onClick={guardAuth(() => toggleWishlist(product._id))} className={`p-2 rounded-xl border-2 transition-all duration-150 hover:scale-105 active:scale-95 ${wished ? "border-red-400 bg-red-50 dark:bg-red-950/40 text-red-500" : "border-gray-200 dark:border-gray-700 hover:border-red-300"}`}>
          <Heart size={15} fill={wished ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}
