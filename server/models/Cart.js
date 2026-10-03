const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, default: null },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    priceAtAdd: { type: Number, required: true },
    savedForLater: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

cartSchema.virtual("subtotal").get(function subtotal() {
  return this.items
    .filter((i) => !i.savedForLater)
    .reduce((sum, i) => sum + i.priceAtAdd * i.quantity, 0);
});
cartSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Cart", cartSchema);
