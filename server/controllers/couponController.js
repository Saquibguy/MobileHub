const Coupon = require("../models/Coupon");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, data: coupons });
});

const createCoupon = asyncHandler(async (req, res) => {
  const { code, type, value, minimumOrder, maximumDiscount, expiryDate, usageLimit } = req.body;
  if (!code || !type || value === undefined || !expiryDate) {
    throw new ApiError(400, "code, type, value and expiryDate are required.");
  }
  const coupon = await Coupon.create({ code, type, value, minimumOrder, maximumDiscount, expiryDate, usageLimit });
  res.status(201).json({ success: true, data: coupon });
});

const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found.");
  Object.assign(coupon, req.body);
  await coupon.save();
  res.json({ success: true, data: coupon });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found.");
  await coupon.deleteOne();
  res.json({ success: true, message: "Coupon deleted." });
});

module.exports = { getCoupons, createCoupon, updateCoupon, deleteCoupon };
