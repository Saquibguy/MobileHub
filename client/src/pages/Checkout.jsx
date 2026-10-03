import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useCart } from "../context/CartContext";
import { orderService } from "../services";
import { EmptyState } from "../components/Common";

const STEPS = ["Address", "Delivery", "Payment", "Confirmation"];

export default function Checkout() {
  const { cart, refresh } = useCart();
  const navigate = useNavigate();
  const items = cart.items.filter((i) => !i.savedForLater);
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState(null);
  const [payment, setPayment] = useState("COD");
  const [order, setOrder] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm();

  if (!items.length && !order) return <EmptyState icon="🛒" title="Nothing to checkout" subtitle="Add items to your cart first." cta="Shop Now" to="/products" />;

  const subtotal = items.reduce((s, i) => s + (i.productId?.discountPrice || i.productId?.price || i.priceAtAdd) * i.quantity, 0);

  const placeOrder = async () => {
    setPlacing(true);
    setError("");
    try {
      const res = await orderService.create({
        shippingAddress: {
          fullName: address.fullName, mobile: address.mobile, house: address.house,
          street: address.street, area: address.area, city: address.city, state: address.state, pincode: address.pincode,
        },
        paymentMethod: payment,
      });
      setOrder(res.data);
      setStep(4);
      refresh();
    } catch (e) {
      setError(e.response?.data?.message || "Could not place order.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex gap-1.5 mb-6">
        {STEPS.map((_, i) => <div key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-gradient-to-r from-brand to-brand-light" : "bg-gray-200 dark:bg-gray-700"}`} />)}
      </div>

      {step === 1 && (
        <form onSubmit={handleSubmit((data) => { setAddress(data); setStep(2); })} className="space-y-3">
          <h1 className="font-extrabold text-lg mb-2">Shipping Address</h1>
          <input className="input" placeholder="Full name" {...register("fullName", { required: true })} />
          <input className="input" placeholder="Mobile number" {...register("mobile", { required: true })} />
          <input className="input" placeholder="House / Building" {...register("house", { required: true })} />
          <input className="input" placeholder="Street / Area" {...register("area", { required: true })} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="City" {...register("city", { required: true })} />
            <input className="input" placeholder="State" {...register("state", { required: true })} />
          </div>
          <input className="input" placeholder="Pincode" {...register("pincode", { required: true })} />
          {Object.keys(errors).length > 0 && <p className="text-red-500 text-xs">Please fill in all address fields.</p>}
          <button className="btn-primary w-full" type="submit">Continue to Delivery</button>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <h1 className="font-extrabold text-lg mb-2">Delivery Option</h1>
          <label className="card p-3 flex items-center gap-3 cursor-pointer"><input type="radio" name="dl" defaultChecked /> Standard (3–5 days) — Free</label>
          <label className="card p-3 flex items-center gap-3 cursor-pointer opacity-60"><input type="radio" name="dl" disabled /> Express (1–2 days) — ₹149 (demo only)</label>
          <button className="btn-primary w-full" onClick={() => setStep(3)}>Continue to Payment</button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <h1 className="font-extrabold text-lg mb-2">Payment Method</h1>
          <label className="card p-3 flex items-center gap-3 cursor-pointer">
            <input type="radio" name="pm" checked={payment === "COD"} onChange={() => setPayment("COD")} /> Cash on Delivery
          </label>
          <label className="card p-3 flex items-center gap-3 cursor-pointer">
            <input type="radio" name="pm" checked={payment === "ONLINE"} onChange={() => setPayment("ONLINE")} /> Online Payment (mock gateway — no real charge)
          </label>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button disabled={placing} className="btn-primary w-full" onClick={placeOrder}>{placing ? "Placing order..." : "Place Order"}</button>
        </div>
      )}

      {step === 4 && order && (
        <div className="text-center">
          <div className="text-5xl mb-3">✅</div>
          <h1 className="font-extrabold text-xl mb-1">Order Confirmed!</h1>
          <p className="text-sm text-gray-500 mb-1">Order ID: <b className="text-gray-900 dark:text-white">{order._id}</b></p>
          <p className="text-sm text-gray-500 mb-3">Estimated delivery: {new Date(order.estimatedDelivery).toDateString()}</p>
          <p className="font-extrabold text-lg mb-5">₹{order.total.toLocaleString("en-IN")} · {order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}</p>
          <div className="flex gap-3 justify-center">
            <button className="btn-outline" onClick={() => navigate("/products")}>Continue Shopping</button>
            <button className="btn-primary" onClick={() => navigate(`/orders/${order._id}`)}>Track Order</button>
          </div>
        </div>
      )}
    </div>
  );
}
