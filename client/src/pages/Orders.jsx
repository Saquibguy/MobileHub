import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { orderService } from "../services";
import { EmptyState } from "../components/Common";

const TIMELINE_STAGES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];

const STATUS_STYLES = {
  PENDING: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  CONFIRMED: "bg-indigo-50 text-brand dark:bg-indigo-950/50",
  PROCESSING: "bg-blue-50 text-blue-600 dark:bg-blue-950/40",
  SHIPPED: "bg-purple-50 text-purple-600 dark:bg-purple-950/40",
  OUT_FOR_DELIVERY: "bg-amber-50 text-amber-600 dark:bg-amber-950/40",
  DELIVERED: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40",
  CANCELLED: "bg-red-50 text-red-600 dark:bg-red-950/40",
  RETURNED: "bg-orange-50 text-orange-600 dark:bg-orange-950/40",
  REFUNDED: "bg-teal-50 text-teal-600 dark:bg-teal-950/40",
};

function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[status] || STATUS_STYLES.PENDING}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function Orders() {
  const [orders, setOrders] = useState(null);
  useEffect(() => { orderService.list().then((r) => setOrders(r.data)); }, []);

  if (!orders) return <div className="p-10 text-center text-gray-400">Loading...</div>;
  if (!orders.length) return <EmptyState icon="📦" title="No orders yet" subtitle="Your order history will show up here." cta="Shop Now" to="/products" />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="font-extrabold text-lg mb-4">My Orders</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <Link to={`/orders/${o._id}`} key={o._id} className="card p-4 block">
            <div className="flex justify-between items-center mb-1">
              <b className="text-sm">{o._id}</b>
              <StatusBadge status={o.orderStatus} />
            </div>
            <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString()} · {o.items.length} item(s) · ₹{o.total.toLocaleString("en-IN")}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => orderService.get(id).then((r) => setOrder(r.data));
  useEffect(() => { load(); }, [id]);

  if (!order) return <div className="p-10 text-center text-gray-400">Loading...</div>;

  const cancel = async () => {
    setBusy(true);
    try { await orderService.cancel(id, "Changed my mind"); await load(); } finally { setBusy(false); }
  };
  const requestReturn = async () => {
    setBusy(true);
    try { await orderService.return(id, "Not satisfied with product"); await load(); } finally { setBusy(false); }
  };

  const stageIndex = TIMELINE_STAGES.indexOf(order.orderStatus);
  const cancellable = !["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED"].includes(order.orderStatus);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-extrabold text-lg mb-1">Order {order._id}</h1>
      <p className="text-xs text-gray-500 mb-5">Placed on {new Date(order.createdAt).toLocaleString()}</p>

      <div className="card p-4 mb-4">
        <p className="font-bold text-sm mb-3">Order Status</p>
        {!["CANCELLED", "RETURNED", "REFUNDED"].includes(order.orderStatus) ? (
          <div className="flex items-center text-[10px] font-bold text-center">
            {TIMELINE_STAGES.map((s, i) => (
              <div key={s} className="flex-1 flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full mb-1 transition-colors ${i <= stageIndex ? "bg-gradient-to-br from-brand to-brand-light" : "bg-gray-200 dark:bg-gray-700"}`} />
                <span className={i <= stageIndex ? "text-brand" : "text-gray-400"}>{s.replace(/_/g, " ")}</span>
                {i < TIMELINE_STAGES.length - 1 && <div className={`h-0.5 w-full ${i < stageIndex ? "bg-gradient-to-r from-brand to-brand-light" : "bg-gray-200 dark:bg-gray-700"}`} />}
              </div>
            ))}
          </div>
        ) : (
          <StatusBadge status={order.orderStatus} />
        )}
      </div>

      <div className="card p-4 mb-4">
        <p className="font-bold text-sm mb-3">Items</p>
        {order.items.map((i) => (
          <div key={i._id} className="flex justify-between text-sm py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <span>{i.name} × {i.quantity}</span>
            <b>₹{(i.price * i.quantity).toLocaleString("en-IN")}</b>
          </div>
        ))}
        <div className="flex justify-between text-sm pt-2 text-gray-500"><span>Subtotal</span><span>₹{order.subtotal.toLocaleString("en-IN")}</span></div>
        <div className="flex justify-between text-sm text-gray-500"><span>Tax</span><span>₹{order.tax.toLocaleString("en-IN")}</span></div>
        <div className="flex justify-between text-sm text-gray-500"><span>Shipping</span><span>{order.shippingCharge === 0 ? "FREE" : `₹${order.shippingCharge}`}</span></div>
        <div className="flex justify-between font-extrabold pt-2 border-t border-dashed border-gray-200 dark:border-gray-700 mt-1"><span>Total</span><span>₹{order.total.toLocaleString("en-IN")}</span></div>
      </div>

      <div className="card p-4 mb-4 text-sm">
        <p className="font-bold mb-1">Shipping Address</p>
        <p className="text-gray-500">{order.shippingAddress.fullName}, {order.shippingAddress.house}, {order.shippingAddress.street}, {order.shippingAddress.area}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
        <p className="text-gray-500 mt-1">{order.shippingAddress.mobile}</p>
      </div>

      <div className="flex gap-3">
        {cancellable && <button disabled={busy} onClick={cancel} className="btn-ghost text-sm">Cancel Order</button>}
        {order.orderStatus === "DELIVERED" && <button disabled={busy} onClick={requestReturn} className="btn-ghost text-sm">Request Return</button>}
      </div>
    </div>
  );
}
