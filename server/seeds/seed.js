/*
 * Seed the database with demo data.
 * Usage:
 *   npm run seed            -> populate
 *   npm run seed:destroy    -> wipe all collections
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/User");
const Seller = require("../models/Seller");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Review = require("../models/Review");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");

const CATEGORY_NAMES = [
  "Mobile Covers", "Tempered Glass", "Chargers", "Fast Chargers", "USB Cables",
  "Lightning Cables", "Type-C Cables", "Power Banks", "Wireless Chargers", "Earphones",
  "Headphones", "Bluetooth Speakers", "Phone Holders", "Car Accessories", "Smart Watches",
  "Gaming Accessories", "Mobile Stands", "Cleaning Kits", "OTG Adapters", "Other Accessories",
];

async function run() {
  await connectDB();
  const destroy = process.argv.includes("--destroy");

  console.log("Clearing existing collections...");
  await Promise.all([
    User.deleteMany({}), Seller.deleteMany({}), Category.deleteMany({}),
    Product.deleteMany({}), Review.deleteMany({}), Order.deleteMany({}), Coupon.deleteMany({}),
  ]);

  if (destroy) {
    console.log("Database wiped.");
    return mongoose.disconnect();
  }

  console.log("Seeding categories...");
  const categories = await Category.insertMany(
    CATEGORY_NAMES.map((name) => ({ name, description: `${name} for every phone.`, isActive: true }))
  );
  const catByName = Object.fromEntries(categories.map((c) => [c.name, c]));

  console.log("Seeding demo accounts...");
  const admin = await User.create({ name: "Admin Demo", email: "admin@mobilehub.demo", password: "password123", role: "ADMIN" });
  const customer = await User.create({ name: "Customer Demo", email: "customer@mobilehub.demo", password: "password123", role: "CUSTOMER", phone: "9876543210" });
  const sellerUser1 = await User.create({ name: "UrbanGear Owner", email: "seller@mobilehub.demo", password: "password123", role: "SELLER" });
  const sellerUser2 = await User.create({ name: "VoltPro Owner", email: "seller2@mobilehub.demo", password: "password123", role: "SELLER" });

  const seller1 = await Seller.create({ userId: sellerUser1._id, storeName: "UrbanGear", email: sellerUser1.email, approvalStatus: "APPROVED", rating: 4.4 });
  const seller2 = await Seller.create({ userId: sellerUser2._id, storeName: "VoltPro", email: sellerUser2.email, approvalStatus: "APPROVED", rating: 4.3 });

  console.log("Seeding products...");
  const productDefs = [
    ["Premium Silicone Phone Cover", "Mobile Covers", 399, 599, 34, seller1],
    ["Transparent Shockproof Case", "Mobile Covers", 299, 499, 40, seller1],
    ["9H Tempered Glass Screen Protector", "Tempered Glass", 149, 299, 120, seller1],
    ["20W Fast Charger Adapter", "Fast Chargers", 599, 899, 58, seller2],
    ["33W Fast Charger Adapter", "Fast Chargers", 799, 1199, 22, seller2],
    ["Type-C Fast Charging Cable 1m", "Type-C Cables", 249, 399, 200, seller2],
    ["Lightning Charging Cable 1m", "Lightning Cables", 349, 499, 90, seller2],
    ["10,000mAh Power Bank", "Power Banks", 1299, 1799, 41, seller1],
    ["20,000mAh Power Bank", "Power Banks", 1899, 2599, 15, seller1],
    ["15W Wireless Charging Pad", "Wireless Chargers", 899, 1299, 30, seller2],
    ["Bluetooth Earbuds Pro", "Earphones", 1499, 2299, 70, seller1],
    ["Over-Ear Bluetooth Headphones", "Headphones", 2199, 2999, 18, seller1],
    ["Portable Bluetooth Speaker", "Bluetooth Speakers", 1599, 2199, 26, seller1],
    ["Car Phone Holder Mount", "Car Accessories", 349, 599, 60, seller2],
    ["Adjustable Desk Phone Stand", "Mobile Stands", 249, 399, 45, seller2],
    ["Smart Watch Fitness Band", "Smart Watches", 2499, 3499, 19, seller1],
  ];
  const products = await Product.insertMany(
    productDefs.map(([name, cat, price, mrp, stock, seller], i) => ({
      sellerId: seller._id,
      categoryId: catByName[cat]._id,
      name,
      description: `${name} — a reliable, everyday mobile accessory built for durability and value.`,
      images: [],
      price,
      discountPrice: price,
      stock,
      sku: `MH-${1000 + i}`,
      brand: seller.storeName,
      specifications: [{ key: "Warranty", value: "6 months" }],
      rating: 0,
      reviewCount: 0,
      isFeatured: i % 4 === 0,
    }))
  );

  console.log("Seeding a delivered order + review so the review flow has real data...");
  const p = products[0];
  const order = await Order.create({
    userId: customer._id,
    sellerIds: [p.sellerId],
    items: [{ productId: p._id, sellerId: p.sellerId, name: p.name, image: "", price: p.price, quantity: 1 }],
    shippingAddress: { fullName: "Customer Demo", mobile: "9876543210", house: "12B", street: "MG Road", area: "Andheri", city: "Mumbai", state: "MH", pincode: "400001" },
    paymentMethod: "COD",
    paymentStatus: "PENDING",
    subtotal: p.price, discount: 0, tax: Math.round(p.price * 0.05), shippingCharge: 0, total: p.price + Math.round(p.price * 0.05),
    orderStatus: "DELIVERED",
    timeline: [
      { status: "PENDING", note: "Order placed" }, { status: "CONFIRMED" }, { status: "SHIPPED" }, { status: "DELIVERED" },
    ],
    estimatedDelivery: new Date(),
  });

  await Review.create({
    userId: customer._id, productId: p._id, orderId: order._id,
    rating: 5, comment: "Great quality and fits perfectly. Highly recommend!",
  });
  await Product.updateOne({ _id: p._id }, { rating: 5, reviewCount: 1 });

  console.log("Seeding coupons...");
  await Coupon.insertMany([
    { code: "WELCOME10", type: "PERCENT", value: 10, minimumOrder: 500, maximumDiscount: 300, expiryDate: new Date(Date.now() + 90 * 86400000), usageLimit: 1000 },
    { code: "FLAT200", type: "FIXED", value: 200, minimumOrder: 1000, expiryDate: new Date(Date.now() + 30 * 86400000), usageLimit: 500 },
  ]);

  console.log("\nSeed complete.");
  console.log("Demo accounts (password for all: password123):");
  console.log("  Admin:    admin@mobilehub.demo");
  console.log("  Customer: customer@mobilehub.demo");
  console.log("  Seller:   seller@mobilehub.demo (UrbanGear)");
  console.log("  Seller:   seller2@mobilehub.demo (VoltPro)");

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
