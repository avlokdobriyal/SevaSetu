const express = require("express");
const {
  registerCitizen,
  loginUser,
  getMe,
} = require("../controllers/auth/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerCitizen);
router.post("/login", loginUser);
router.get("/me", protect, getMe);

module.exports = router;
