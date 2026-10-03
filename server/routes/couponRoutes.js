const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const { getCoupons, createCoupon, updateCoupon, deleteCoupon } = require("../controllers/couponController");

router.get("/", protect, authorize("ADMIN"), getCoupons);
router.post("/", protect, authorize("ADMIN"), createCoupon);
router.put("/:id", protect, authorize("ADMIN"), updateCoupon);
router.delete("/:id", protect, authorize("ADMIN"), deleteCoupon);

module.exports = router;
