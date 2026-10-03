import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productService, categoryService } from "../services";
import ProductCard from "../components/ProductCard";
import { LoadingSkeleton } from "../components/Common";

export default function Home() {
  const [featured, setFeatured] = useState(null);
  const [newest, setNewest] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryService.list().then((r) => setCategories(r.data));
    productService.list({ sort: "popularity", limit: 10 }).then((r) => setFeatured(r.data));
    productService.list({ sort: "newest", limit: 10 }).then((r) => setNewest(r.data));
  }, []);

  return (
    <div>
      <div className="mx-4 mt-4 relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-brand to-brand-light text-white p-8 md:p-12 shadow-xl shadow-brand/20">
        <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-6 -bottom-16 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
        <h1 className="relative text-2xl md:text-4xl font-extrabold mb-2 tracking-tight">Everything Your Phone Needs 📱</h1>
        <p className="relative opacity-90 mb-5 max-w-md">Covers, chargers, audio & more — quality accessories at honest prices.</p>
        <Link to="/products" className="relative inline-block bg-white text-brand font-bold px-5 py-2.5 rounded-xl hover:scale-105 active:scale-100 transition-transform shadow-lg">Shop Now</Link>
      </div>

      <section className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="font-extrabold text-lg mb-3">Shop by Category</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map((c) => (
            <Link key={c._id} to={`/products?category=${c._id}`} className="flex flex-col items-center gap-1.5 shrink-0 w-20 group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-2xl shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 group-hover:scale-105 transition-all duration-150">📦</div>
              <span className="text-[11px] font-semibold text-center leading-tight group-hover:text-brand transition-colors">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-4">
        <h2 className="font-extrabold text-lg mb-3">🏆 Best Sellers</h2>
        {featured ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {featured.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        ) : <LoadingSkeleton />}
      </section>

      <section className="max-w-7xl mx-auto px-4 py-4">
        <h2 className="font-extrabold text-lg mb-3">🆕 New Arrivals</h2>
        {newest ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {newest.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        ) : <LoadingSkeleton />}
      </section>
    </div>
  );
}
