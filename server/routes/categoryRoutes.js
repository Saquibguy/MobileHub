const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getCategories, createCategory, updateCategory, deleteCategory,
} = require("../controllers/categoryController");

router.get("/", getCategories);
router.post("/", protect, authorize("ADMIN"), createCategory);
router.put("/:id", protect, authorize("ADMIN"), updateCategory);
router.delete("/:id", protect, authorize("ADMIN"), deleteCategory);

module.exports = router;
