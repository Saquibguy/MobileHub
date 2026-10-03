const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
} = require("../controllers/productController");
const { getProductReviews, createReview } = require("../controllers/reviewController");

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", protect, authorize("SELLER", "ADMIN"), upload.array("images", 8), createProduct);
router.put("/:id", protect, authorize("SELLER", "ADMIN"), upload.array("images", 8), updateProduct);
router.delete("/:id", protect, authorize("SELLER", "ADMIN"), deleteProduct);

// Nested review routes
router.get("/:id/reviews", getProductReviews);
router.post("/:id/reviews", protect, authorize("CUSTOMER"), createReview);

module.exports = router;
