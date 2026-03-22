const mongoose = require("mongoose");
const Grievance = require("../../models/Grievance");
const Ward = require("../../models/Ward");
const { User } = require("../../models/User");
const asyncHandler = require("../../utils/asyncHandler");
const { sendEmail } = require("../../services/emailService");
const {
  grievanceCreatedCitizenTemplate,
  grievanceCreatedOfficerTemplate,
  workerAssignedTemplate,
  grievanceResolvedTemplate,
  grievanceClosedTemplate,
  grievanceAppealedTemplate,
} = require("../../services/emailTemplates");

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const sendEmailSafely = async ({ to, subject, html }) => {
  try {
    await sendEmail(to, subject, html);
  } catch (error) {
    console.error(`Email send failed (${subject}): ${error.message}`);
  }
};

const getRefId = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "object" && value._id) {
    return value._id.toString();
  }

  return value.toString();
};

const getDetailedGrievanceById = (id) => {
  return Grievance.findById(id)
    .populate("ward", "name")
    .populate("citizen", "name email phone")
    .populate("assignedOfficer", "name email")
    .populate("assignedWorker", "name email")
    .populate("statusHistory.updatedBy", "name role")
    .populate("comments.user", "name role");
};

const addStatusEntry = (grievance, { status, userId, note }) => {
  grievance.statusHistory.push({
    status,
    timestamp: new Date(),
    updatedBy: userId,
    note,
  });
};

const ensureAccessToGrievance = (grievance, user) => {
  const grievanceCitizenId = getRefId(grievance.citizen);
  const grievanceWardId = getRefId(grievance.ward);
  const grievanceWorkerId = getRefId(grievance.assignedWorker);
  const userId = getRefId(user._id);
  const userWardId = getRefId(user.ward);

  if (user.role === "admin") {
    return true;
  }

  if (user.role === "citizen") {
    return grievanceCitizenId === userId;
  }

  if (user.role === "officer") {
    return grievanceWardId === userWardId;
  }

  if (user.role === "worker") {
    return grievanceWorkerId === userId;
  }

  return false;
};

const fileGrievance = asyncHandler(async (req, res) => {
  const { title, description, category, ward } = req.body;
  const imageUrls = (req.files || []).map((file) => `/uploads/${file.filename}`);

  if (!title || !description || !category || !ward) {
    res.status(400);
    throw new Error("Title, description, category, and ward are required");
  }

  const selectedWard = await Ward.findById(ward).populate("officer");

  if (!selectedWard) {
    res.status(404);
    throw new Error("Selected ward not found");
  }

  if (!selectedWard.officer) {
    res.status(400);
    throw new Error("No officer is assigned to this ward yet");
  }

  const grievance = await Grievance.create({
    title,
    description,
    category,
    ward: selectedWard._id,
    citizen: req.user._id,
    assignedOfficer: selectedWard.officer._id,
    status: "assigned_to_officer",
    imageUrls,
    statusHistory: [
      {
        status: "submitted",
        timestamp: new Date(),
        updatedBy: req.user._id,
        note: "Grievance submitted by citizen",
      },
      {
        status: "assigned_to_officer",
        timestamp: new Date(),
        updatedBy: selectedWard.officer._id,
        note: "Automatically assigned to ward officer",
      },
    ],
  });

  const populated = await Grievance.findById(grievance._id)
    .populate("ward", "name")
    .populate("citizen", "name email phone")
    .populate("assignedOfficer", "name email")
    .populate("assignedWorker", "name email");

  await Promise.all([
    sendEmailSafely({
      to: populated?.citizen?.email,
      subject: `SevaSetu: Grievance ${populated?.grievanceId} submitted`,
      html: grievanceCreatedCitizenTemplate({ grievance: populated }),
    }),
    sendEmailSafely({
      to: populated?.assignedOfficer?.email,
      subject: `SevaSetu: New grievance ${populated?.grievanceId} in your ward`,
      html: grievanceCreatedOfficerTemplate({
        grievance: populated,
        wardName: populated?.ward?.name || "your ward",
      }),
    }),
  ]);

  res.status(201).json({
    success: true,
    message: "Grievance filed successfully",
    data: populated,
  });
});

const getGrievances = asyncHandler(async (req, res) => {
  const { status, category, ward, fromDate, toDate } = req.query;

  const query = {};

  if (req.user.role === "citizen") {
    query.citizen = req.user._id;
  }

  if (req.user.role === "officer") {
    query.ward = req.user.ward;
  }

  if (req.user.role === "worker") {
    query.assignedWorker = req.user._id;
  }

  if (req.user.role === "admin") {
    if (status) query.status = status;
    if (category) query.category = category;
    if (ward) query.ward = ward;

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }
  }

  const grievances = await Grievance.find(query)
    .sort({ createdAt: -1 })
    .populate("ward", "name")
    .populate("citizen", "name email")
    .populate("assignedOfficer", "name email")
    .populate("assignedWorker", "name email");

  res.status(200).json({
    success: true,
    count: grievances.length,
    data: grievances,
  });
});

const getGrievanceById = asyncHandler(async (req, res) => {
  const grievance = await getDetailedGrievanceById(req.params.id);

  if (!grievance) {
    res.status(404);
    throw new Error("Grievance not found");
  }

  if (!ensureAccessToGrievance(grievance, req.user)) {
    res.status(403);
    throw new Error("You are not allowed to access this grievance");
  }

  res.status(200).json({
    success: true,
    data: grievance,
  });
});

const getPublicGrievanceById = asyncHandler(async (req, res) => {
  const { grievanceId } = req.params;

  if (!grievanceId) {
    res.status(400);
    throw new Error("grievanceId is required");
  }

  const grievance = await Grievance.findOne({ grievanceId: grievanceId.trim().toUpperCase() })
    .populate("ward", "name")
    .populate("statusHistory.updatedBy", "name role")
    .select("grievanceId title category status ward isOverdue createdAt statusHistory");

  if (!grievance) {
    res.status(404);
    throw new Error("Grievance not found");
  }

  res.status(200).json({
    success: true,
    data: grievance,
  });
});

const getOfficerWardStats = asyncHandler(async (req, res) => {
  const wardId = req.user.ward;

  if (!wardId) {
    res.status(400);
    throw new Error("Officer is not assigned to a ward");
  }

  const [total, resolved, overdue, averageResolutionResult] = await Promise.all([
    Grievance.countDocuments({ ward: wardId }),
    Grievance.countDocuments({ ward: wardId, status: { $in: ["resolved", "closed"] } }),
    Grievance.countDocuments({ ward: wardId, isOverdue: true }),
    Grievance.aggregate([
      { $match: { ward: toObjectId(wardId), status: { $in: ["resolved", "closed"] } } },
      {
        $project: {
          resolutionHours: {
            $divide: [{ $subtract: ["$updatedAt", "$createdAt"] }, 1000 * 60 * 60],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgHours: { $avg: "$resolutionHours" },
        },
      },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      total,
      resolved,
      overdue,
      averageResolutionHours: Number((averageResolutionResult[0]?.avgHours || 0).toFixed(2)),
    },
  });
});

const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    res.status(400);
    throw new Error("Comment text is required");
  }

  const grievance = await Grievance.findById(req.params.id)
    .populate("ward", "name")
    .populate("citizen", "name")
    .populate("assignedWorker", "name");

  if (!grievance) {
    res.status(404);
    throw new Error("Grievance not found");
  }

  if (!ensureAccessToGrievance(grievance, req.user)) {
    res.status(403);
    throw new Error("You are not allowed to comment on this grievance");
  }

  grievance.comments.push({
    user: req.user._id,
    text: text.trim(),
    timestamp: new Date(),
  });

  await grievance.save();

  const updated = await getDetailedGrievanceById(grievance._id);

  res.status(201).json({
    success: true,
    message: "Comment added successfully",
    data: updated,
  });
});

const addRating = asyncHandler(async (req, res) => {
  const { rating, ratingComment = "" } = req.body;
  const normalizedRating = Number(rating);

  if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
    res.status(400);
    throw new Error("Rating must be an integer between 1 and 5");
  }

  const grievance = await Grievance.findById(req.params.id);

  if (!grievance) {
    res.status(404);
    throw new Error("Grievance not found");
  }

  if (grievance.citizen.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only rate your own grievances");
  }

  if (grievance.status !== "closed") {
    res.status(400);
    throw new Error("You can rate only after grievance is closed");
  }

  grievance.rating = normalizedRating;
  grievance.ratingComment = (ratingComment || "").trim();
  await grievance.save();

  const updated = await getDetailedGrievanceById(grievance._id);

  res.status(200).json({
    success: true,
    message: "Rating submitted successfully",
    data: updated,
  });
});

const assignWorker = asyncHandler(async (req, res) => {
  const { workerId, note = "Worker assigned by officer" } = req.body;

  if (!workerId) {
    res.status(400);
    throw new Error("workerId is required");
  }

  const grievance = await Grievance.findById(req.params.id).populate("ward", "name");

  if (!grievance) {
    res.status(404);
    throw new Error("Grievance not found");
  }

  if (grievance.ward._id.toString() !== req.user.ward?.toString()) {
    res.status(403);
    throw new Error("You can only manage grievances in your ward");
  }

  const worker = await User.findOne({
    _id: toObjectId(workerId),
    role: "worker",
    ward: req.user.ward,
    isActive: true,
  });

  if (!worker) {
    res.status(400);
    throw new Error("Worker not found in your ward");
  }

  grievance.assignedWorker = worker._id;
  grievance.status = "worker_assigned";
  addStatusEntry(grievance, {
    status: "worker_assigned",
    userId: req.user._id,
    note,
  });

  await grievance.save();

  const updated = await Grievance.findById(grievance._id)
    .populate("ward", "name")
    .populate("citizen", "name email")
    .populate("assignedOfficer", "name email")
    .populate("assignedWorker", "name email")
    .populate("statusHistory.updatedBy", "name role");

  await sendEmailSafely({
    to: updated?.assignedWorker?.email,
    subject: `SevaSetu: You were assigned grievance ${updated?.grievanceId}`,
    html: workerAssignedTemplate({
      grievance: updated,
      workerName: updated?.assignedWorker?.name || "Worker",
    }),
  });

  res.status(200).json({
    success: true,
    message: "Worker assigned successfully",
    data: updated,
  });
});

const markInProgress = asyncHandler(async (req, res) => {
  const { note = "Worker started the task" } = req.body;

  const grievance = await Grievance.findById(req.params.id);

  if (!grievance) {
    res.status(404);
    throw new Error("Grievance not found");
  }

  if (grievance.assignedWorker?.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only update grievances assigned to you");
  }

  if (!["worker_assigned", "appealed"].includes(grievance.status)) {
    res.status(400);
    throw new Error("Grievance must be worker_assigned or appealed before in_progress");
  }

  grievance.status = "in_progress";
  addStatusEntry(grievance, {
    status: "in_progress",
    userId: req.user._id,
    note,
  });

  await grievance.save();

  res.status(200).json({
    success: true,
    message: "Grievance marked as in progress",
    data: grievance,
  });
});

const markResolved = asyncHandler(async (req, res) => {
  const { resolutionNote } = req.body;

  if (!resolutionNote || !resolutionNote.trim()) {
    res.status(400);
    throw new Error("resolutionNote is required");
  }

  const grievance = await Grievance.findById(req.params.id);

  if (!grievance) {
    res.status(404);
    throw new Error("Grievance not found");
  }

  if (grievance.assignedWorker?.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only resolve grievances assigned to you");
  }

  if (grievance.status !== "in_progress") {
    res.status(400);
    throw new Error("Only in_progress grievances can be marked resolved");
  }

  grievance.status = "resolved";
  grievance.resolutionNote = resolutionNote.trim();
  addStatusEntry(grievance, {
    status: "resolved",
    userId: req.user._id,
    note: "Worker marked grievance as resolved",
  });

  await grievance.save();

  const updated = await Grievance.findById(grievance._id)
    .populate("citizen", "name email")
    .populate("assignedOfficer", "name email");

  await Promise.all([
    sendEmailSafely({
      to: updated?.citizen?.email,
      subject: `SevaSetu: Grievance ${updated?.grievanceId} marked resolved`,
      html: grievanceResolvedTemplate({ grievance: updated }),
    }),
    sendEmailSafely({
      to: updated?.assignedOfficer?.email,
      subject: `SevaSetu: Grievance ${updated?.grievanceId} marked resolved`,
      html: grievanceResolvedTemplate({ grievance: updated }),
    }),
  ]);

  res.status(200).json({
    success: true,
    message: "Grievance marked as resolved",
    data: updated,
  });
});

const closeGrievance = asyncHandler(async (req, res) => {
  const { note = "Officer verified and closed grievance" } = req.body;

  const grievance = await Grievance.findById(req.params.id).populate("ward", "name");

  if (!grievance) {
    res.status(404);
    throw new Error("Grievance not found");
  }

  if (grievance.ward._id.toString() !== req.user.ward?.toString()) {
    res.status(403);
    throw new Error("You can only close grievances in your ward");
  }

  if (grievance.status !== "resolved") {
    res.status(400);
    throw new Error("Only resolved grievances can be closed");
  }

  grievance.status = "closed";
  grievance.isOverdue = false;
  addStatusEntry(grievance, {
    status: "closed",
    userId: req.user._id,
    note,
  });

  await grievance.save();

  const updated = await Grievance.findById(grievance._id).populate("citizen", "name email");

  await sendEmailSafely({
    to: updated?.citizen?.email,
    subject: `SevaSetu: Grievance ${updated?.grievanceId} closed`,
    html: grievanceClosedTemplate({ grievance: updated }),
  });

  res.status(200).json({
    success: true,
    message: "Grievance closed successfully",
    data: updated,
  });
});

const appealGrievance = asyncHandler(async (req, res) => {
  const { note = "Citizen requested re-open" } = req.body;

  const grievance = await Grievance.findById(req.params.id);

  if (!grievance) {
    res.status(404);
    throw new Error("Grievance not found");
  }

  if (grievance.citizen.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only appeal your own grievances");
  }

  if (grievance.status !== "closed") {
    res.status(400);
    throw new Error("Only closed grievances can be appealed");
  }

  grievance.status = "appealed";
  grievance.assignedWorker = null;
  grievance.rating = null;
  grievance.ratingComment = "";
  addStatusEntry(grievance, {
    status: "appealed",
    userId: req.user._id,
    note,
  });

  await grievance.save();

  const updated = await Grievance.findById(grievance._id).populate("assignedOfficer", "name email");

  await sendEmailSafely({
    to: updated?.assignedOfficer?.email,
    subject: `SevaSetu: Grievance ${updated?.grievanceId} appealed by citizen`,
    html: grievanceAppealedTemplate({ grievance: updated }),
  });

  res.status(200).json({
    success: true,
    message: "Grievance appealed successfully",
    data: updated,
  });
});

module.exports = {
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
};
