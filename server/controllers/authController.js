const crypto = require("crypto");
const User = require("../models/User");
const Seller = require("../models/Seller");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");
const ApiError = require("../utils/ApiError");

// POST /api/auth/register  { name, email, password, phone, role? , storeName? (if SELLER) }
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, storeName } = req.body;
  if (!name || !email || !password) throw new ApiError(400, "Name, email and password are required.");
  if (password.length < 6) throw new ApiError(400, "Password must be at least 6 characters.");

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, "An account with this email already exists.");

  const requestedRole = role === "SELLER" ? "SELLER" : "CUSTOMER"; // ADMIN cannot self-register
  const user = await User.create({ name, email, password, phone, role: requestedRole });

  if (requestedRole === "SELLER") {
    if (!storeName) throw new ApiError(400, "storeName is required to register as a seller.");
    await Seller.create({ userId: user._id, storeName, email, phone, approvalStatus: "PENDING" });
  }

  const token = generateToken(user);
  res.status(201).json({ success: true, token, user: user.toSafeJSON() });
});

// POST /api/auth/login { email, password }
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password are required.");

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) throw new ApiError(401, "Invalid email or password.");
  if (user.isBlocked) throw new ApiError(403, "Your account has been blocked. Contact support.");

  const match = await user.comparePassword(password);
  if (!match) throw new ApiError(401, "Invalid email or password.");

  const token = generateToken(user);
  res.json({ success: true, token, user: user.toSafeJSON() });
});

// POST /api/auth/logout — stateless JWT: client just discards the token.
const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: "Logged out. Discard the token client-side." });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeJSON() });
});

// POST /api/auth/forgot-password { email }
// Demo-safe: generates a reset token and returns it directly instead of emailing
// (no email provider is configured). In production, email this token instead.
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || "").toLowerCase() });
  // Always respond the same way to avoid leaking which emails exist
  if (!user) return res.json({ success: true, message: "If that email exists, a reset link was sent." });

  const rawToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  res.json({
    success: true,
    message: "If that email exists, a reset link was sent.",
    devOnlyResetToken: process.env.NODE_ENV !== "production" ? rawToken : undefined,
  });
});

// POST /api/auth/reset-password { token, password }
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) throw new ApiError(400, "Token and new password are required.");

  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) throw new ApiError(400, "Reset token is invalid or has expired.");

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Password has been reset. You can now log in." });
});

module.exports = { register, login, logout, me, forgotPassword, resetPassword };
