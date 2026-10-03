const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

async function recalcRating(productId) {
  const stats = await Review.aggregate([
    { $match: { productId, isApproved: true } },
    { $group: { _id: "$productId", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await Product.updateOne({ _id: productId }, { rating: Math.round(avg * 10) / 10, reviewCount: count });
}

// GET /api/products/:id/reviews
const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ productId: req.params.id, isApproved: true })
    .populate("userId", "name avatar")
    .sort({ createdAt: -1 });
  res.json({ success: true, data: reviews });
});

// POST /api/products/:id/reviews  { orderId, rating, comment, images? }
// Only allowed if the user purchased this product (in a DELIVERED order).
const createReview = asyncHandler(async (req, res) => {
  const { orderId, rating, comment, images } = req.body;
  if (!orderId || !rating) throw new ApiError(400, "orderId and rating are required.");

  const order = await Order.findOne({ _id: orderId, userId: req.user._id });
  if (!order) throw new ApiError(404, "Order not found.");
  if (order.orderStatus !== "DELIVERED") throw new ApiError(400, "You can only review products after delivery.");
  const purchased = order.items.some((i) => String(i.productId) === req.params.id);
  if (!purchased) throw new ApiError(400, "This product was not part of that order.");

  const review = await Review.create({
    userId: req.user._id,
    productId: req.params.id,
    orderId,
    rating,
    comment,
    images: images || [],
  });
  await recalcRating(req.params.id);
  res.status(201).json({ success: true, data: review });
});

// PUT /api/reviews/:id
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found.");
  if (String(review.userId) !== String(req.user._id) && req.user.role !== "ADMIN") {
    throw new ApiError(403, "Not authorized.");
  }
  ["rating", "comment", "images", "isApproved"].forEach((f) => {
    if (req.body[f] !== undefined) review[f] = req.body[f];
  });
  await review.save();
  await recalcRating(review.productId);
  res.json({ success: true, data: review });
});

// DELETE /api/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found.");
  if (String(review.userId) !== String(req.user._id) && req.user.role !== "ADMIN") {
    throw new ApiError(403, "Not authorized.");
  }
  const productId = review.productId;
  await review.deleteOne();
  await recalcRating(productId);
  res.json({ success: true, message: "Review deleted." });
});

module.exports = { getProductReviews, createReview, updateReview, deleteReview };
