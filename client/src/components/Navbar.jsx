import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Search, Heart, ShoppingCart, User, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Logo from "./Logo";

export default function Navbar() {
  const { user } = useAuth();
  const { cartCount, wishlist } = useCart();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const onSearch = (e) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center gap-4 px-4 py-3">
        <Link to="/" className="shrink-0">
          <Logo />
        </Link>
        <form onSubmit={onSearch} className="flex-1 hidden sm:flex items-center bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden focus-within:border-brand">
          <Search size={16} className="ml-3 text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search accessories..." className="flex-1 bg-transparent px-2 py-2 outline-none text-sm" />
        </form>
        <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
          <Link to="/wishlist" className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <Heart size={19} />
            {wishlist?.products?.length > 0 && <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] rounded-full px-1.5 font-bold">{wishlist.products.length}</span>}
          </Link>
          <Link to="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <ShoppingCart size={19} />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] rounded-full px-1.5 font-bold">{cartCount}</span>}
          </Link>
          <Link to={user ? "/profile" : "/login"} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <User size={19} />
          </Link>
        </nav>
        <button className="md:hidden p-2" onClick={() => setMenuOpen((v) => !v)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
      {menuOpen && (
        <div className="md:hidden px-4 pb-3 flex flex-col gap-2 text-sm font-semibold">
          <form onSubmit={onSearch} className="flex items-center bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
            <Search size={16} className="ml-3 text-gray-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="flex-1 bg-transparent px-2 py-2 outline-none text-sm" />
          </form>
          <Link to="/products" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
          <Link to="/seller" onClick={() => setMenuOpen(false)}>Seller Panel</Link>
          <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
        </div>
      )}
    </header>
  );
}
