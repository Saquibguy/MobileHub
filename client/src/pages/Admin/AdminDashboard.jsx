import { useEffect, useState } from "react";
import { NavLink, Routes, Route } from "react-router-dom";
import { adminService, couponService, categoryService } from "../../services";
import { orderService } from "../../services";

function DashCard({ label, value, accent = "from-indigo-500 to-violet-500" }) {
  return (
    <div className="card p-4 text-center relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accent}`} />
      <b className="text-xl block mt-1">{value}</b>
      <span className="text-xs text-gray-500 font-semibold">{label}</span>
    </div>
  );
}

function Overview() {
  const [data, setData] = useState(null);
  useEffect(() => { adminService.dashboard().then((r) => setData(r.data)); }, []);
  if (!data) return <p className="text-gray-400">Loading...</p>;
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <DashCard label="Customers" value={data.totalUsers} />
        <DashCard label="Sellers" value={data.totalSellers} />
        <DashCard label="Products" value={data.totalProducts} />
        <DashCard label="Orders" value={data.totalOrders} />
        <DashCard label="Revenue" value={`₹${data.totalRevenue.toLocaleString("en-IN")}`} />
        <DashCard label="Low Stock" value={data.lowStock} />
      </div>
      <h2 className="font-bold mb-2">Recent Orders</h2>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-400 text-xs"><th className="p-3">Order</th><th className="p-3">Total</th><th className="p-3">Status</th></tr></thead>
          <tbody>
            {data.recentOrders.map((o) => (
              <tr key={o._id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="p-3">{o._id}</td><td className="p-3">₹{o.total.toLocaleString("en-IN")}</td><td className="p-3">{o.orderStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const load = () => adminService.orders().then((r) => setOrders(r.data));
  useEffect(() => { load(); }, []);
  const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED"];
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-gray-400 text-xs"><th className="p-3">Order</th><th className="p-3">Total</th><th className="p-3">Update Status</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id} className="border-t border-gray-100 dark:border-gray-800">
              <td className="p-3">{o._id}</td><td className="p-3">₹{o.total.toLocaleString("en-IN")}</td>
              <td className="p-3">
                <select className="input py-1 text-xs w-auto" defaultValue={o.orderStatus} onChange={async (e) => { await orderService.updateStatus(o._id, e.target.value); load(); }}>
                  {statuses.map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const load = () => adminService.users().then((r) => setUsers(r.data));
  useEffect(() => { load(); }, []);
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-gray-400 text-xs"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-t border-gray-100 dark:border-gray-800">
              <td className="p-3">{u.name}</td><td className="p-3">{u.email}</td>
              <td className="p-3">{u.isBlocked ? <span className="text-red-500 font-bold">Blocked</span> : <span className="text-emerald-600 font-bold">Active</span>}</td>
              <td className="p-3"><button className="btn-ghost text-xs py-1" onClick={async () => { await adminService.toggleBlockUser(u._id); load(); }}>{u.isBlocked ? "Unblock" : "Block"}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SellersTab() {
  const [sellers, setSellers] = useState([]);
  const load = () => adminService.sellers().then((r) => setSellers(r.data));
  useEffect(() => { load(); }, []);
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-gray-400 text-xs"><th className="p-3">Store</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
        <tbody>
          {sellers.map((s) => (
            <tr key={s._id} className="border-t border-gray-100 dark:border-gray-800">
              <td className="p-3">{s.storeName}</td><td className="p-3">{s.approvalStatus}</td>
              <td className="p-3 flex gap-2">
                <button className="btn-ghost text-xs py-1" onClick={async () => { await adminService.updateSellerApproval(s._id, "APPROVED"); load(); }}>Approve</button>
                <button className="btn-ghost text-xs py-1" onClick={async () => { await adminService.updateSellerApproval(s._id, "SUSPENDED"); load(); }}>Suspend</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CouponsTab() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: "", type: "PERCENT", value: "", minimumOrder: "", expiryDate: "" });
  const load = () => couponService.list().then((r) => setCoupons(r.data));
  useEffect(() => { load(); }, []);
  const create = async (e) => {
    e.preventDefault();
    await couponService.create(form);
    setForm({ code: "", type: "PERCENT", value: "", minimumOrder: "", expiryDate: "" });
    load();
  };
  return (
    <div>
      <form onSubmit={create} className="card p-4 mb-4 grid grid-cols-2 md:grid-cols-5 gap-2 items-end">
        <input className="input text-xs" placeholder="CODE" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <select className="input text-xs" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="PERCENT">Percent</option><option value="FIXED">Fixed</option>
        </select>
        <input className="input text-xs" type="number" placeholder="Value" required value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
        <input className="input text-xs" type="date" required value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
        <button className="btn-primary text-xs py-2">+ Add Coupon</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-400 text-xs"><th className="p-3">Code</th><th className="p-3">Type</th><th className="p-3">Value</th><th className="p-3">Status</th></tr></thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="p-3">{c.code}</td><td className="p-3">{c.type}</td><td className="p-3">{c.value}</td>
                <td className="p-3">{c.isActive ? <span className="text-emerald-600 font-bold">Active</span> : <span className="text-gray-400">Inactive</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const load = () => categoryService.list(true).then((r) => setCategories(r.data));
  useEffect(() => { load(); }, []);
  const create = async (e) => {
    e.preventDefault();
    if (!name) return;
    await categoryService.create({ name });
    setName("");
    load();
  };
  const toggle = async (c) => { await categoryService.update(c._id, { isActive: !c.isActive }); load(); };
  return (
    <div>
      <form onSubmit={create} className="flex gap-2 mb-4">
        <input className="input" placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn-primary shrink-0">+ Add</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-400 text-xs"><th className="p-3">Name</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.isActive ? <span className="text-emerald-600 font-bold">Active</span> : <span className="text-gray-400">Disabled</span>}</td>
                <td className="p-3"><button className="btn-ghost text-xs py-1" onClick={() => toggle(c)}>{c.isActive ? "Disable" : "Enable"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const load = () => adminService.reviews().then((r) => setReviews(r.data));
  useEffect(() => { load(); }, []);
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-gray-400 text-xs"><th className="p-3">Product</th><th className="p-3">User</th><th className="p-3">Rating</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r._id} className="border-t border-gray-100 dark:border-gray-800">
              <td className="p-3">{r.productId?.name}</td><td className="p-3">{r.userId?.name}</td><td className="p-3">{r.rating}★</td>
              <td className="p-3">{r.isApproved ? <span className="text-emerald-600 font-bold">Visible</span> : <span className="text-red-500 font-bold">Hidden</span>}</td>
              <td className="p-3"><button className="btn-ghost text-xs py-1" onClick={async () => { await adminService.hideReview(r._id); load(); }}>{r.isApproved ? "Hide" : "Unhide"}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDashboard() {
  const tabs = [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/orders", label: "Orders" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/sellers", label: "Sellers" },
    { to: "/admin/categories", label: "Categories" },
    { to: "/admin/coupons", label: "Coupons" },
    { to: "/admin/reviews", label: "Reviews" },
  ];
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="font-extrabold text-xl mb-4">🛠️ Admin Dashboard</h1>
      <div className="flex gap-2 mb-5 overflow-x-auto">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${isActive ? "bg-brand text-white" : "bg-gray-100 dark:bg-gray-800"}`}>{t.label}</NavLink>
        ))}
      </div>
      <Routes>
        <Route index element={<Overview />} />
        <Route path="orders" element={<OrdersTab />} />
        <Route path="users" element={<UsersTab />} />
        <Route path="sellers" element={<SellersTab />} />
        <Route path="categories" element={<CategoriesTab />} />
        <Route path="coupons" element={<CouponsTab />} />
        <Route path="reviews" element={<ReviewsTab />} />
      </Routes>
    </div>
  );
}
