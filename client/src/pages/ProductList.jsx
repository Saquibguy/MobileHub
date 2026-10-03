import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { productService, categoryService } from "../services";
import ProductCard from "../components/ProductCard";
import { LoadingSkeleton, EmptyState } from "../components/Common";
import { SlidersHorizontal, X, Check, RotateCcw } from "lucide-react";

function RadioPill({ checked, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-150 ${
        checked ? "bg-brand/10 text-brand font-bold" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
    >
      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? "border-brand bg-brand" : "border-gray-300 dark:border-gray-600"}`}>
        {checked && <Check size={10} strokeWidth={3.5} className="text-white" />}
      </span>
      <span className="text-sm truncate">{children}</span>
    </button>
  );
}

export default function ProductList() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const search = params.get("search") || "";
  const category = params.get("category") || "";
  const sort = params.get("sort") || "popularity";
  const page = Number(params.get("page") || 1);
  const minPrice = params.get("minPrice") || "";
  const maxPrice = params.get("maxPrice") || "";
  const rating = params.get("rating") || "";
  const activeFilterCount = [category, minPrice, maxPrice, rating].filter(Boolean).length;

  useEffect(() => { categoryService.list().then((r) => setCategories(r.data)); }, []);

  useEffect(() => {
    setData(null);
    productService
      .list({ search, category, sort, page, minPrice, maxPrice, rating, limit: 20 })
      .then((r) => setData(r));
  }, [search, category, sort, page, minPrice, maxPrice, rating]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    next.delete("page");
    setParams(next);
  };

  const clearAll = () => {
    const next = new URLSearchParams();
    if (search) next.set("search", search);
    setParams(next);
  };

  const FilterPanel = () => (
    <div className="text-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="font-extrabold text-xs uppercase tracking-wide text-gray-400">Category</p>
      </div>
      <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto pr-1 mb-5">
        <RadioPill checked={!category} onClick={() => setParam("category", "")}>All Categories</RadioPill>
        {categories.map((c) => (
          <RadioPill key={c._id} checked={category === c._id} onClick={() => setParam("category", c._id)}>{c.name}</RadioPill>
        ))}
      </div>

      <div className="h-px bg-gray-100 dark:bg-gray-800 mb-5" />

      <p className="font-extrabold text-xs uppercase tracking-wide text-gray-400 mb-3">Price Range</p>
      <div className="flex items-center gap-2 mb-5">
        <input className="input py-2 text-xs" placeholder="₹ Min" defaultValue={minPrice} onBlur={(e) => setParam("minPrice", e.target.value)} />
        <span className="text-gray-300 shrink-0">–</span>
        <input className="input py-2 text-xs" placeholder="₹ Max" defaultValue={maxPrice} onBlur={(e) => setParam("maxPrice", e.target.value)} />
      </div>

      <div className="h-px bg-gray-100 dark:bg-gray-800 mb-5" />

      <p className="font-extrabold text-xs uppercase tracking-wide text-gray-400 mb-3">Minimum Rating</p>
      <div className="flex flex-col gap-0.5 mb-2">
        {[4, 3, 2].map((r) => (
          <RadioPill key={r} checked={rating === String(r)} onClick={() => setParam("rating", String(r))}>
            <span className="text-amber-500">{"★".repeat(r)}</span><span className="text-gray-300">{"★".repeat(5 - r)}</span> <span className="ml-1">& up</span>
          </RadioPill>
        ))}
      </div>

      {activeFilterCount > 0 && (
        <button onClick={clearAll} className="flex items-center gap-1.5 text-brand text-xs font-bold mt-3 hover:underline">
          <RotateCcw size={12} /> Clear all filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-5 flex gap-6">
      <aside className="hidden md:block w-64 shrink-0">
        <div className="card p-5 sticky top-20 hover:translate-y-0 hover:shadow-sm">
          <h2 className="font-extrabold text-base mb-4 flex items-center gap-2"><SlidersHorizontal size={16} className="text-brand" /> Filters</h2>
          <FilterPanel />
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h1 className="font-extrabold text-lg">{search ? `Results for "${search}"` : "All Products"} {data && <span className="text-gray-400 text-xs font-medium">({data.pagination.total})</span>}</h1>
          <div className="flex gap-2">
            <button className="md:hidden btn-ghost relative flex items-center gap-1.5 text-xs" onClick={() => setFilterOpen(true)}>
              <SlidersHorizontal size={14} /> Filters
              {activeFilterCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-brand text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>}
            </button>
            <select className="input py-1.5 text-xs w-auto" value={sort} onChange={(e) => setParam("sort", e.target.value)}>
              <option value="popularity">Popularity</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        {!data && <LoadingSkeleton count={12} />}
        {data && data.data.length === 0 && <EmptyState icon="🔍" title="No products found" subtitle="Try adjusting your filters or search terms." />}
        {data && data.data.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.data.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
            {data.pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: data.pagination.pages }).map((_, i) => (
                  <button key={i} onClick={() => setParam("page", String(i + 1))}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${page === i + 1 ? "bg-gradient-to-br from-brand to-brand-light text-white shadow-md shadow-brand/30" : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {filterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:hidden" onClick={() => setFilterOpen(false)}>
          <div className="bg-white dark:bg-gray-900 w-full rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto animate-fadein" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4" />
            <div className="flex justify-between items-center mb-4">
              <p className="font-extrabold text-base flex items-center gap-2"><SlidersHorizontal size={16} className="text-brand" /> Filters</p>
              <button onClick={() => setFilterOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X size={18} /></button>
            </div>
            <FilterPanel />
            <button className="btn-primary w-full mt-5" onClick={() => setFilterOpen(false)}>Show Results</button>
          </div>
        </div>
      )}
    </div>
  );
}
