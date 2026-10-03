const Product = require("../models/Product");
const Seller = require("../models/Seller");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// GET /api/products
// Query params: search, category, brand, minPrice, maxPrice, rating, inStock,
// sort=priceLow|priceHigh|newest|popularity|rating, page, limit
const getProducts = asyncHandler(async (req, res) => {
  const {
    search, category, brand, minPrice, maxPrice, rating, inStock,
    sort = "popularity", page = 1, limit = 20,
  } = req.query;

  const filter = { isActive: true };
  if (search) filter.$text = { $search: search };
  if (category) filter.categoryId = category;
  if (brand) filter.brand = new RegExp(`^${brand}$`, "i");
  if (rating) filter.rating = { $gte: Number(rating) };
  if (inStock === "true") filter.stock = { $gt: 0 };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    priceLow: { price: 1 },
    priceHigh: { price: -1 },
    newest: { createdAt: -1 },
    rating: { rating: -1 },
    popularity: { reviewCount: -1 },
  };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(sortMap[sort] || sortMap.popularity)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("categoryId", "name slug")
      .populate({ path: "sellerId", select: "storeName rating" }),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// GET /api/products/:id  (id or slug)
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
  const product = await Product.findOne(query)
    .populate("categoryId", "name slug")
    .populate({ path: "sellerId", select: "storeName rating approvalStatus" });
  if (!product) throw new ApiError(404, "Product not found.");
  res.json({ success: true, data: product });
});

// POST /api/products  (SELLER or ADMIN)
const createProduct = asyncHandler(async (req, res) => {
  let sellerId = req.body.sellerId;
  if (req.user.role === "SELLER") {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) throw new ApiError(400, "Seller profile not found for this account.");
    if (seller.approvalStatus !== "APPROVED") throw new ApiError(403, "Your seller account is not yet approved.");
    sellerId = seller._id;
  }
  if (!sellerId) throw new ApiError(400, "sellerId is required.");

  const images = (req.files || []).map((f) => `/uploads/${f.filename}`);
  const product = await Product.create({ ...req.body, sellerId, images: images.length ? images : req.body.images || [] });
  res.status(201).json({ success: true, data: product });
});

// PUT /api/products/:id  (owner SELLER or ADMIN)
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found.");

  if (req.user.role === "SELLER") {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller || String(product.sellerId) !== String(seller._id)) {
      throw new ApiError(403, "You can only edit your own products.");
    }
  }

  const updatable = [
    "name", "description", "price", "discountPrice", "stock", "brand",
    "categoryId", "specifications", "variants", "isFeatured", "isActive", "images",
  ];
  updatable.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });
  if (req.files && req.files.length) {
    product.images = req.files.map((f) => `/uploads/${f.filename}`);
  }
  await product.save();
  res.json({ success: true, data: product });
});

// DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found.");

  if (req.user.role === "SELLER") {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller || String(product.sellerId) !== String(seller._id)) {
      throw new ApiError(403, "You can only delete your own products.");
    }
  }
  await product.deleteOne();
  res.json({ success: true, message: "Product deleted." });
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
