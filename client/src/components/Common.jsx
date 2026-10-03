export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 text-center text-sm text-gray-500 py-8 mt-8 pb-24 md:pb-8">
      MobileHub — Everything Your Phone Needs © {new Date().getFullYear()}
    </footer>
  );
}

export function RatingStars({ rating = 0, count }) {
  return (
    <div className="text-amber-500 text-xs flex items-center gap-1">
      <span>{"★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating))}</span>
      {count !== undefined && <span className="text-gray-400 font-medium">({count})</span>}
    </div>
  );
}

export function PriceDisplay({ price, mrp }) {
  const off = mrp && mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
  return (
    <div className="font-extrabold text-sm">
      ₹{price?.toLocaleString("en-IN")}
      {off > 0 && <span className="text-gray-400 line-through font-normal text-xs ml-1.5">₹{mrp.toLocaleString("en-IN")}</span>}
      {off > 0 && <span className="ml-1.5 text-emerald-600 text-xs font-bold">{off}% off</span>}
    </div>
  );
}

export function LoadingSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-3 animate-pulse hover:translate-y-0 hover:shadow-sm">
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl mb-2" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-4/5 mb-2" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon = "📦", title, subtitle, cta, to }) {
  return (
    <div className="text-center py-16 px-4 animate-fadein">
      <div className="text-5xl mb-3">{icon}</div>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      {subtitle && <p className="text-gray-500 text-sm mb-4">{subtitle}</p>}
      {cta && to && <a href={to} className="btn-primary inline-block">{cta}</a>}
    </div>
  );
}
