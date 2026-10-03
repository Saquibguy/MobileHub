const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createOrder, getMyOrders, getOrder, updateStatus, cancelOrder, returnOrder,
} = require("../controllers/orderController");

router.post("/", protect, authorize("CUSTOMER"), createOrder);
router.get("/", protect, authorize("CUSTOMER"), getMyOrders);
router.get("/:id", protect, getOrder);
router.put("/:id/status", protect, authorize("ADMIN", "SELLER"), updateStatus);
router.post("/:id/cancel", protect, authorize("CUSTOMER"), cancelOrder);
router.post("/:id/return", protect, authorize("CUSTOMER"), returnOrder);

module.exports = router;
