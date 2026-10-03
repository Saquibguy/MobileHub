const Cart = require("../models/Cart");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) cart = await Cart.create({ userId, items: [] });
  return cart;
}

// GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  await cart.populate("items.productId", "name images price discountPrice stock");
  res.json({ success: true, data: cart });
});

// POST /api/cart  { productId, variantId?, quantity }
const addItem = asyncHandler(async (req, res) => {
  const { productId, variantId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new ApiError(404, "Product not found.");
  if (product.stock < quantity) throw new ApiError(400, "Insufficient stock.");

  const cart = await getOrCreateCart(req.user._id);
  const existing = cart.items.find(
    (i) => String(i.productId) === String(productId) && String(i.variantId || "") === String(variantId || "")
  );
  const price = product.discountPrice || product.price;
  if (existing) existing.quantity += Number(quantity);
  else cart.items.push({ productId, variantId: variantId || null, quantity, priceAtAdd: price });

  await cart.save();
  res.status(201).json({ success: true, data: cart });
});

// PUT /api/cart/:itemId  { quantity } or { savedForLater }
const updateItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw new ApiError(404, "Cart item not found.");
  if (req.body.quantity !== undefined) item.quantity = Math.max(1, Number(req.body.quantity));
  if (req.body.savedForLater !== undefined) item.savedForLater = !!req.body.savedForLater;
  await cart.save();
  res.json({ success: true, data: cart });
});

// DELETE /api/cart/:itemId
const removeItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((i) => String(i._id) !== req.params.itemId);
  await cart.save();
  res.json({ success: true, data: cart });
});

// DELETE /api/cart  (clear all)
const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  res.json({ success: true, data: cart });
});

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
