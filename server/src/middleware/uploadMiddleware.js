const multer = require("multer");
const path = require("path");

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, path.extname(file.originalname));
    const safeBaseName = baseName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
    cb(null, `${Date.now()}-${safeBaseName}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(new Error("Only JPG and PNG images are allowed"));
    return;
  }

  cb(null, true);
};

const uploadGrievanceImages = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 3,
  },
  fileFilter,
});

module.exports = {
  uploadGrievanceImages,
};
