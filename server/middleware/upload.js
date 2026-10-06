const multer = require("multer");

const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_MB = Number(process.env.MAX_UPLOAD_MB || 5);

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(
      new Error("Only JPEG, PNG, WEBP or GIF images are allowed.")
    );
  }

  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_MB * 1024 * 1024,
    files: 8,
  },
});

module.exports = upload;