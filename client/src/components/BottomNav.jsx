import { NavLink } from "react-router-dom";
import { Home, Search, ShoppingCart, Heart, User } from "lucide-react";

const items = [
  { to: "/", icon: Home, label: "Home", end: true },
  { to: "/products", icon: Search, label: "Shop" },
  { to: "/cart", icon: ShoppingCart, label: "Cart" },
  { to: "/wishlist", icon: Heart, label: "Wishlist" },
  { to: "/profile", icon: User, label: "You" },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-t border-gray-100 dark:border-gray-800 flex pb-[env(safe-area-inset-bottom)]">
      {items.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold ${isActive ? "text-brand" : "text-gray-400"}`
          }
        >
          <Icon size={19} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
