const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const seller = require("../controllers/sellerController");

router.use(protect, authorize("SELLER"));
router.get("/dashboard", seller.dashboard);
router.get("/products", seller.getMyProducts);
router.get("/orders", seller.getMyOrders);
router.put("/orders/:id/fulfillment", seller.updateFulfillment);
router.get("/reports", seller.reports);
router.put("/profile", seller.updateProfile);

module.exports = router;
