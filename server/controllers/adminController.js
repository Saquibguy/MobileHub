const User = require("../models/User");
const Seller = require("../models/Seller");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Review = require("../models/Review");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// GET /api/admin/dashboard
const dashboard = asyncHandler(async (req, res) => {
  const [totalUsers, totalSellers, totalProducts, totalOrders, lowStock, recentOrders, recentUsers, revenueAgg] =
    await Promise.all([
      User.countDocuments({ role: "CUSTOMER" }),
      Seller.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments({ stock: { $gt: 0, $lte: 10 } }),
      Order.find().sort({ createdAt: -1 }).limit(10),
      User.find({ role: "CUSTOMER" }).sort({ createdAt: -1 }).limit(10),
      Order.aggregate([
        { $match: { paymentStatus: "PAID" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);
  const pendingOrders = await Order.countDocuments({ orderStatus: { $in: ["PENDING", "CONFIRMED", "PROCESSING"] } });

  res.json({
    success: true,
    data: {
      totalUsers, totalSellers, totalProducts, totalOrders,
      totalRevenue: revenueAgg[0]?.total || 0,
      pendingOrders, lowStock, recentOrders, recentUsers,
    },
  });
});

// GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = { role: "CUSTOMER" };
  if (search) filter.$or = [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }];
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: users });
});

// PUT /api/admin/users/:id/block
const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found.");
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json({ success: true, data: user.toSafeJSON() });
});

// GET /api/admin/sellers
const getSellers = asyncHandler(async (req, res) => {
  const sellers = await Seller.find().populate("userId", "name email isBlocked").sort({ createdAt: -1 });
  res.json({ success: true, data: sellers });
});

// PUT /api/admin/sellers/:id/approval  { status: APPROVED|REJECTED|SUSPENDED }
const updateSellerApproval = asyncHandler(async (req, res) => {
  const seller = await Seller.findById(req.params.id);
  if (!seller) throw new ApiError(404, "Seller not found.");
  seller.approvalStatus = req.body.status;
  await seller.save();
  res.json({ success: true, data: seller });
});

// GET /api/admin/orders
const getAllOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { orderStatus: status } : {};
  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: orders });
});

// GET /api/admin/reviews
const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find().populate("userId", "name").populate("productId", "name").sort({ createdAt: -1 });
  res.json({ success: true, data: reviews });
});

// PUT /api/admin/reviews/:id/hide
const hideReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found.");
  review.isApproved = !review.isApproved;
  await review.save();
  res.json({ success: true, data: review });
});

// GET /api/admin/reports  ?type=revenue|sales|products|sellers
const reports = asyncHandler(async (req, res) => {
  const type = req.query.type || "revenue";
  if (type === "revenue") {
    const data = await Order.aggregate([
      { $match: { paymentStatus: "PAID" } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, total: { $sum: "$total" } } },
      { $sort: { _id: 1 } },
    ]);
    return res.json({ success: true, data });
  }
  if (type === "products") {
    const data = await Product.find().sort({ reviewCount: -1 }).limit(20).select("name reviewCount rating stock price");
    return res.json({ success: true, data });
  }
  if (type === "sellers") {
    const data = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.sellerId", revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
      { $sort: { revenue: -1 } },
    ]);
    return res.json({ success: true, data });
  }
  res.json({ success: true, data: [] });
});

module.exports = {
  dashboard, getUsers, toggleBlockUser, getSellers, updateSellerApproval,
  getAllOrders, getAllReviews, hideReview, reports,
};
