const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const { getWishlist, addToWishlist, removeFromWishlist } = require("../controllers/wishlistController");

router.use(protect, authorize("CUSTOMER"));
router.get("/", getWishlist);
router.post("/", addToWishlist);
router.delete("/:productId", removeFromWishlist);

module.exports = router;
