const express = require("express");

const router = express.Router();

// Admin and role-based user management routes go here.
router.get("/", (req, res) => {
  res.json({ message: "User routes ready" });
});

module.exports = router;
