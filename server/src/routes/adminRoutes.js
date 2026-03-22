const express = require("express");
const { getAnalytics } = require("../controllers/admin/adminController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/analytics", protect, authorize("admin"), getAnalytics);

module.exports = router;
