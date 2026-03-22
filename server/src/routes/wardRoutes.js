const express = require("express");
const {
	getAllWards,
	createWard,
	updateWard,
	deleteWard,
} = require("../controllers/ward/wardController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", getAllWards);
router.post("/", protect, authorize("admin"), createWard);
router.patch("/:id", protect, authorize("admin"), updateWard);
router.delete("/:id", protect, authorize("admin"), deleteWard);

module.exports = router;
