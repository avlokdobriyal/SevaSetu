const express = require("express");
const {
  fileGrievance,
  getGrievances,
  getGrievanceById,
  getPublicGrievanceById,
  getOfficerWardStats,
  assignWorker,
  markInProgress,
  markResolved,
  closeGrievance,
  appealGrievance,
  addComment,
  addRating,
} = require("../controllers/grievance/grievanceController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { uploadGrievanceImages } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.route("/public/track/:grievanceId").get(getPublicGrievanceById);

router.use(protect);

router.route("/officer/stats").get(authorize("officer"), getOfficerWardStats);

router
  .route("/")
  .post(authorize("citizen"), uploadGrievanceImages.array("images", 3), fileGrievance)
  .get(authorize("citizen", "officer", "worker", "admin"), getGrievances);

router
  .route("/:id")
  .get(authorize("citizen", "officer", "worker", "admin"), getGrievanceById);

router
  .route("/:id/assign-worker")
  .patch(authorize("officer"), assignWorker);

router
  .route("/:id/start-work")
  .patch(authorize("worker"), markInProgress);

router
  .route("/:id/resolve")
  .patch(authorize("worker"), markResolved);

router
  .route("/:id/close")
  .patch(authorize("officer"), closeGrievance);

router
  .route("/:id/appeal")
  .patch(authorize("citizen"), appealGrievance);

router
  .route("/:id/comments")
  .post(authorize("citizen", "officer", "worker", "admin"), addComment);

router
  .route("/:id/rating")
  .post(authorize("citizen"), addRating);

module.exports = router;
