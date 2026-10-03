const Seller = require("../models/Seller");
const Product = require("../models/Product");
const Order = require("../models/Order");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

async function getSellerForUser(userId) {
  const seller = await Seller.findOne({ userId });
  if (!seller) throw new ApiError(400, "Seller profile not found for this account.");
  return seller;
}

// GET /api/seller/dashboard
const dashboard = asyncHandler(async (req, res) => {
  const seller = await getSellerForUser(req.user._id);
  const [totalProducts, lowStock, orders] = await Promise.all([
    Product.countDocuments({ sellerId: seller._id }),
    Product.countDocuments({ sellerId: seller._id, stock: { $gt: 0, $lte: 10 } }),
    Order.find({ sellerIds: seller._id }),
  ]);

  let revenue = 0;
  let pendingOrders = 0;
  for (const order of orders) {
    for (const item of order.items) {
      if (String(item.sellerId) === String(seller._id)) revenue += item.price * item.quantity;
    }
    if (["PENDING", "CONFIRMED", "PROCESSING"].includes(order.orderStatus)) pendingOrders += 1;
  }

  res.json({
    success: true,
    data: {
      totalProducts, lowStock, totalOrders: orders.length, pendingOrders, revenue,
      approvalStatus: seller.approvalStatus,
    },
  });
});

// GET /api/seller/products
const getMyProducts = asyncHandler(async (req, res) => {
  const seller = await getSellerForUser(req.user._id);
  const products = await Product.find({ sellerId: seller._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: products });
});

// GET /api/seller/orders
const getMyOrders = asyncHandler(async (req, res) => {
  const seller = await getSellerForUser(req.user._id);
  const orders = await Order.find({ sellerIds: seller._id }).sort({ createdAt: -1 });
  // Scope each order's visible items to this seller's own line items only
  const scoped = orders.map((o) => ({
    ...o.toObject(),
    items: o.items.filter((i) => String(i.sellerId) === String(seller._id)),
  }));
  res.json({ success: true, data: scoped });
});

// PUT /api/seller/orders/:id/fulfillment  { status, note? }
// Sellers may only progress fulfillment-stage statuses, not full admin lifecycle.
const ALLOWED_SELLER_STATUSES = ["PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY"];
const updateFulfillment = asyncHandler(async (req, res) => {
  const seller = await getSellerForUser(req.user._id);
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found.");
  if (!order.sellerIds.map(String).includes(String(seller._id))) throw new ApiError(403, "Not your order.");
  if (!ALLOWED_SELLER_STATUSES.includes(req.body.status)) {
    throw new ApiError(400, `Sellers may only set status to one of: ${ALLOWED_SELLER_STATUSES.join(", ")}`);
  }
  order.orderStatus = req.body.status;
  order.timeline.push({ status: req.body.status, note: req.body.note || "" });
  await order.save();
  res.json({ success: true, data: order });
});

// GET /api/seller/reports  (daily/weekly/monthly revenue for this seller)
const reports = asyncHandler(async (req, res) => {
  const seller = await getSellerForUser(req.user._id);
  const orders = await Order.find({ sellerIds: seller._id, paymentStatus: "PAID" });
  const byDay = {};
  for (const order of orders) {
    const day = order.createdAt.toISOString().slice(0, 10);
    const sellerTotal = order.items
      .filter((i) => String(i.sellerId) === String(seller._id))
      .reduce((s, i) => s + i.price * i.quantity, 0);
    byDay[day] = (byDay[day] || 0) + sellerTotal;
  }
  const series = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, total]) => ({ date, total }));
  res.json({ success: true, data: series });
});

// PUT /api/seller/profile
const updateProfile = asyncHandler(async (req, res) => {
  const seller = await getSellerForUser(req.user._id);
  ["storeName", "description", "logo", "phone", "email"].forEach((f) => {
    if (req.body[f] !== undefined) seller[f] = req.body[f];
  });
  if (req.body.bankInfo) {
    seller.bankInfo = {
      accountHolder: req.body.bankInfo.accountHolder,
      // Only ever store a masked reference — never persist a full raw account number.
      accountNumberMasked: req.body.bankInfo.accountNumber
        ? `****${String(req.body.bankInfo.accountNumber).slice(-4)}`
        : seller.bankInfo?.accountNumberMasked,
      ifsc: req.body.bankInfo.ifsc,
    };
  }
  await seller.save();
  res.json({ success: true, data: seller });
});

module.exports = { dashboard, getMyProducts, getMyOrders, updateFulfillment, reports, updateProfile };
