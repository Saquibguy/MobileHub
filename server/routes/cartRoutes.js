const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const { getCart, addItem, updateItem, removeItem, clearCart } = require("../controllers/cartController");

router.use(protect, authorize("CUSTOMER"));
router.get("/", getCart);
router.post("/", addItem);
router.put("/:itemId", updateItem);
router.delete("/:itemId", removeItem);
router.delete("/", clearCart);

module.exports = router;
