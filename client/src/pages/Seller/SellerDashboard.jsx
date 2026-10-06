import { useEffect, useState } from "react";
import { NavLink, Link, Routes, Route } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { sellerService, productService } from "../../services";
import { useToast } from "../../context/ToastContext";
import AddProduct from "./AddProduct";

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
  useEffect(() => { sellerService.dashboard().then((r) => setData(r.data)); }, []);
  if (!data) return <p className="text-gray-400">Loading...</p>;
  return (
    <div>
      {data.approvalStatus !== "APPROVED" && (
        <div className="card p-3 mb-4 text-sm text-amber-700 bg-amber-50 dark:bg-amber-950/40">
          Your seller account is <b>{data.approvalStatus}</b>. You can browse this dashboard, but product listing requires admin approval.
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashCard label="Products" value={data.totalProducts} />
        <DashCard label="Orders" value={data.totalOrders} />
        <DashCard label="Pending" value={data.pendingOrders} />
        <DashCard label="Revenue" value={`₹${data.revenue.toLocaleString("en-IN")}`} />
      </div>
    </div>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { showToast } = useToast();

  const load = () => sellerService.products().then((r) => setProducts(r.data));
  useEffect(() => { load(); }, []);

  const handleDelete = async (product) => {
    const confirmed = window.confirm(`Delete "${product.name}"? This cannot be undone.`);
    if (!confirmed) return;
    setDeletingId(product._id);
    try {
      await productService.remove(product._id);
      showToast("Product deleted");
      await load();
    } catch (err) {
      showToast(err.response?.data?.message || "Couldn't delete product.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-3">
        <Link to="/seller/products/new" className="btn-primary text-sm flex items-center gap-1.5 w-fit">
          <Plus size={15} /> Add Product
        </Link>
      </div>
      {products === null ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : products.length === 0 ? (
        <div className="card p-10 text-center text-sm text-gray-400">No products yet — click "Add Product" to list your first one.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-400 text-xs"><th className="p-3">Name</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3"></th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="p-3">{p.name}</td><td className="p-3">₹{p.price}</td>
                  <td className="p-3">{p.stock === 0 ? <span className="text-red-500 font-bold">Out</span> : p.stock < 20 ? <span className="text-amber-600 font-bold">{p.stock} (Low)</span> : p.stock}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(p)}
                      disabled={deletingId === p._id}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-40"
                      title="Delete product"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const load = () => sellerService.orders().then((r) => setOrders(r.data));
  useEffect(() => { load(); }, []);
  const statuses = ["PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY"];
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-gray-400 text-xs"><th className="p-3">Order</th><th className="p-3">Status</th><th className="p-3">Update</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id} className="border-t border-gray-100 dark:border-gray-800">
              <td className="p-3">{o._id}</td><td className="p-3">{o.orderStatus}</td>
              <td className="p-3">
                <select className="input py-1 text-xs w-auto" defaultValue="" onChange={async (e) => { if (e.target.value) { await sellerService.updateFulfillment(o._id, e.target.value); load(); } }}>
                  <option value="">Set status...</option>
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SellerDashboard() {
  const tabs = [
    { to: "/seller", label: "Dashboard", end: true },
    { to: "/seller/products", label: "Products" },
    { to: "/seller/orders", label: "Orders" },
  ];
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="font-extrabold text-xl mb-4">🏪 Seller Panel</h1>
      <div className="flex gap-2 mb-5">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `px-4 py-1.5 rounded-full text-xs font-bold ${isActive ? "bg-brand text-white" : "bg-gray-100 dark:bg-gray-800"}`}>{t.label}</NavLink>
        ))}
      </div>
      <Routes>
        <Route index element={<Overview />} />
        <Route path="products" element={<ProductsTab />} />
        <Route path="products/new" element={<AddProduct />} />
        <Route path="orders" element={<OrdersTab />} />
      </Routes>
    </div>
  );
}
