const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const admin = require("../controllers/adminController");

router.use(protect, authorize("ADMIN"));
router.get("/dashboard", admin.dashboard);
router.get("/users", admin.getUsers);
router.put("/users/:id/block", admin.toggleBlockUser);
router.get("/sellers", admin.getSellers);
router.put("/sellers/:id/approval", admin.updateSellerApproval);
router.get("/orders", admin.getAllOrders);
router.get("/reviews", admin.getAllReviews);
router.put("/reviews/:id/hide", admin.hideReview);
router.get("/reports", admin.reports);

module.exports = router;
