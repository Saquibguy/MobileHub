const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { updateReview, deleteReview } = require("../controllers/reviewController");

router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
