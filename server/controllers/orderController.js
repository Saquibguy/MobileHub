const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const TAX_RATE = 0.05;
const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_CHARGE = 79;

async function applyCoupon(code, subtotal) {
  if (!code) return { discount: 0, coupon: null };
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) throw new ApiError(400, "Invalid or inactive coupon.");
  if (coupon.expiryDate < new Date()) throw new ApiError(400, "Coupon has expired.");
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) throw new ApiError(400, "Coupon usage limit reached.");
  if (subtotal < coupon.minimumOrder) throw new ApiError(400, `Minimum order of ${coupon.minimumOrder} required for this coupon.`);

  let discount = coupon.type === "PERCENT" ? (subtotal * coupon.value) / 100 : coupon.value;
  if (coupon.maximumDiscount !== null) discount = Math.min(discount, coupon.maximumDiscount);
  return { discount: Math.round(discount), coupon };
}

// POST /api/orders  { shippingAddress, paymentMethod, couponCode? }
// This is the payment abstraction: paymentMethod "COD" needs no gateway.
// "ONLINE" is a mock success here — swap this block for a real gateway call later
// (e.g. Razorpay/Stripe) without changing the rest of the order flow.
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod = "COD", couponCode } = req.body;
  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.mobile || !shippingAddress.pincode) {
    throw new ApiError(400, "A complete shipping address is required.");
  }

  const cart = await Cart.findOne({ userId: req.user._id }).populate("items.productId");
  if (!cart || !cart.items.filter((i) => !i.savedForLater).length) {
    throw new ApiError(400, "Your cart is empty.");
  }

  const activeItems = cart.items.filter((i) => !i.savedForLater);
  const orderItems = [];
  const sellerIds = new Set();
  let subtotal = 0;

  for (const item of activeItems) {
    const product = item.productId;
    if (!product || !product.isActive) throw new ApiError(400, `A product in your cart is no longer available.`);
    if (product.stock < item.quantity) throw new ApiError(400, `Insufficient stock for ${product.name}.`);
    const price = product.discountPrice || product.price;
    subtotal += price * item.quantity;
    sellerIds.add(String(product.sellerId));
    orderItems.push({
      productId: product._id,
      sellerId: product.sellerId,
      name: product.name,
      image: product.images?.[0] || "",
      price,
      quantity: item.quantity,
    });
  }

  const { discount, coupon } = await applyCoupon(couponCode, subtotal);
  const tax = Math.round((subtotal - discount) * TAX_RATE);
  const shippingCharge = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
  const total = subtotal - discount + tax + shippingCharge;

  // Mock payment handling
  let paymentStatus = "PENDING";
  let transactionId = "";
  if (paymentMethod === "ONLINE") {
    paymentStatus = "PAID"; // mock gateway: always "succeeds" in demo mode
    transactionId = `MOCK-${Date.now()}`;
  }

  const order = await Order.create({
    userId: req.user._id,
    sellerIds: [...sellerIds],
    items: orderItems,
    shippingAddress,
    paymentMethod,
    paymentStatus,
    transactionId,
    couponCode: coupon ? coupon.code : "",
    subtotal,
    discount,
    tax,
    shippingCharge,
    total,
    orderStatus: "CONFIRMED",
    timeline: [
      { status: "PENDING", note: "Order placed" },
      { status: "CONFIRMED", note: "Order confirmed" },
    ],
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  });

  // Decrement stock
  for (const item of orderItems) {
    await Product.updateOne({ _id: item.productId }, { $inc: { stock: -item.quantity } });
  }
  if (coupon) await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } });

  // Clear purchased items from cart, keep saved-for-later
  cart.items = cart.items.filter((i) => i.savedForLater);
  await cart.save();

  res.status(201).json({ success: true, data: order });
});

// GET /api/orders  (own orders for customer, or seller/admin scoped in their controllers)
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: orders });
});

// GET /api/orders/:id
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found.");
  const isOwner = String(order.userId) === String(req.user._id);
  if (!isOwner && req.user.role === "CUSTOMER") throw new ApiError(403, "Not authorized to view this order.");
  res.json({ success: true, data: order });
});

// PUT /api/orders/:id/status  { status, note? }  (SELLER/ADMIN)
const updateStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found.");
  order.orderStatus = status;
  order.timeline.push({ status, note });
  await order.save();
  res.json({ success: true, data: order });
});

// POST /api/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found.");
  if (String(order.userId) !== String(req.user._id)) throw new ApiError(403, "Not authorized.");
  if (["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.orderStatus)) {
    throw new ApiError(400, "Order can no longer be cancelled at this stage.");
  }
  order.orderStatus = "CANCELLED";
  order.timeline.push({ status: "CANCELLED", note: req.body.reason || "Cancelled by customer" });
  await order.save();
  for (const item of order.items) {
    await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } });
  }
  res.json({ success: true, data: order });
});

// POST /api/orders/:id/return
const returnOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found.");
  if (String(order.userId) !== String(req.user._id)) throw new ApiError(403, "Not authorized.");
  if (order.orderStatus !== "DELIVERED") throw new ApiError(400, "Only delivered orders can be returned.");
  order.orderStatus = "RETURNED";
  order.timeline.push({ status: "RETURNED", note: req.body.reason || "Return requested by customer" });
  await order.save();
  res.json({ success: true, data: order });
});

module.exports = { createOrder, getMyOrders, getOrder, updateStatus, cancelOrder, returnOrder };
