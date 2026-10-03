const mongoose = require("mongoose");
const slugify = require("slugify");

const variantSchema = new mongoose.Schema(
  {
    name: String, // e.g. "Color", "Storage"
    value: String, // e.g. "Black", "64GB"
    priceDelta: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    sku: String,
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true, index: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, unique: true, index: true },
    description: { type: String, default: "" },
    images: [{ type: String }],
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, required: true, unique: true },
    brand: { type: String, default: "" },
    specifications: [{ key: String, value: String }],
    variants: [variantSchema],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.pre("validate", function setSlug(next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(`${this.name}-${this.sku || Date.now()}`, { lower: true, strict: true });
  }
  next();
});

productSchema.index({ name: "text", description: "text", brand: "text" });
productSchema.index({ categoryId: 1, isActive: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model("Product", productSchema);
