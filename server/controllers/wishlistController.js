const Wishlist = require("../models/Wishlist");
const asyncHandler = require("../utils/asyncHandler");

async function getOrCreate(userId) {
  let wl = await Wishlist.findOne({ userId });
  if (!wl) wl = await Wishlist.create({ userId, products: [] });
  return wl;
}

const getWishlist = asyncHandler(async (req, res) => {
  const wl = await getOrCreate(req.user._id);
  await wl.populate("products", "name images price discountPrice stock rating");
  res.json({ success: true, data: wl });
});

const addToWishlist = asyncHandler(async (req, res) => {
  const wl = await getOrCreate(req.user._id);
  const { productId } = req.body;
  if (!wl.products.map(String).includes(String(productId))) wl.products.push(productId);
  await wl.save();
  res.status(201).json({ success: true, data: wl });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const wl = await getOrCreate(req.user._id);
  wl.products = wl.products.filter((p) => String(p) !== req.params.productId);
  await wl.save();
  res.json({ success: true, data: wl });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
