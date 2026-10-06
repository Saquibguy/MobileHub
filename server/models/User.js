const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const addressSchema = new mongoose.Schema(
  {
    fullName: String,
    mobile: String,
    house: String,
    street: String,
    area: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["CUSTOMER", "SELLER", "ADMIN"],
      default: "CUSTOMER",
    },
    avatar: { type: String, default: "" },
    isBlocked: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    addresses: [addressSchema],
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
