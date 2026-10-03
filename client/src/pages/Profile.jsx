import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const doLogout = () => { logout(); navigate("/"); };

  return (
    <div className="max-w-sm mx-auto px-4 py-8">
      <div className="card p-6 text-center mb-4">
        <div className="text-4xl mb-2">👤</div>
        <p className="font-extrabold">{user.name}</p>
        <p className="text-gray-500 text-sm">{user.email}</p>
        <span className="inline-block mt-2 text-[10px] font-bold bg-indigo-50 dark:bg-gray-800 text-brand px-2.5 py-1 rounded-full">{user.role}</span>
        <button onClick={doLogout} className="btn-ghost w-full mt-4 text-sm">Logout</button>
      </div>
      <div className="space-y-2">
        {user.role === "CUSTOMER" && <Link to="/orders" className="card p-4 flex justify-between items-center text-sm font-semibold">📦 My Orders <span>›</span></Link>}
        {user.role === "CUSTOMER" && <Link to="/wishlist" className="card p-4 flex justify-between items-center text-sm font-semibold">♡ Wishlist <span>›</span></Link>}
        {user.role === "SELLER" && <Link to="/seller" className="card p-4 flex justify-between items-center text-sm font-semibold">🏪 Seller Panel <span>›</span></Link>}
        {user.role === "ADMIN" && <Link to="/admin" className="card p-4 flex justify-between items-center text-sm font-semibold">🛠️ Admin Panel <span>›</span></Link>}
      </div>
    </div>
  );
}
