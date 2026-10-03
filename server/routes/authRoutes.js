const router = require("express").Router();
const { protect } = require("../middleware/auth");
const {
  register, login, logout, me, forgotPassword, resetPassword,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, me);

module.exports = router;
