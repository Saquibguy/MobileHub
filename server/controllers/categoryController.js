const Category = require("../models/Category");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const getCategories = asyncHandler(async (req, res) => {
  const filter = req.query.all === "true" ? {} : { isActive: true };
  const categories = await Category.find(filter).sort({ name: 1 });
  res.json({ success: true, data: categories });
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, isActive } = req.body;
  if (!name) throw new ApiError(400, "Category name is required.");
  const category = await Category.create({ name, description, image, isActive });
  res.status(201).json({ success: true, data: category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found.");
  ["name", "description", "image", "isActive"].forEach((f) => {
    if (req.body[f] !== undefined) category[f] = req.body[f];
  });
  await category.save();
  res.json({ success: true, data: category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found.");
  await category.deleteOne();
  res.json({ success: true, message: "Category deleted." });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
