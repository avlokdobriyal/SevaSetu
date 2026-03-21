const mongoose = require("mongoose");
const {
  GRIEVANCE_STATUSES,
  GRIEVANCE_CATEGORIES,
  CATEGORY_SLA_DAYS,
} = require("../utils/grievanceConstants");

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: GRIEVANCE_STATUSES,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, "Status note cannot exceed 500 characters"],
      default: "",
    },
  },
  { _id: false }
);

const grievanceCommentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const grievanceSchema = new mongoose.Schema(
  {
    grievanceId: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [3000, "Description cannot exceed 3000 characters"],
    },
    category: {
      type: String,
      enum: GRIEVANCE_CATEGORIES,
      required: [true, "Category is required"],
    },
    status: {
      type: String,
      enum: GRIEVANCE_STATUSES,
      default: "submitted",
      required: true,
    },
    ward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ward",
      required: [true, "Ward is required"],
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Citizen reference is required"],
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    imageUrls: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
      validate: {
        validator: function validateImages(images) {
          return images.length <= 3;
        },
        message: "A grievance can have at most 3 images",
      },
    },
    slaDeadline: {
      type: Date,
      required: true,
    },
    isOverdue: {
      type: Boolean,
      default: false,
      index: true,
    },
    resolutionNote: {
      type: String,
      trim: true,
      maxlength: [2000, "Resolution note cannot exceed 2000 characters"],
      default: "",
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
      default: null,
    },
    ratingComment: {
      type: String,
      trim: true,
      maxlength: [1000, "Rating comment cannot exceed 1000 characters"],
      default: "",
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
    comments: {
      type: [grievanceCommentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

grievanceSchema.index({ status: 1, ward: 1, createdAt: -1 });
grievanceSchema.index({ category: 1, createdAt: -1 });
grievanceSchema.index({ citizen: 1, createdAt: -1 });
grievanceSchema.index({ assignedOfficer: 1, status: 1 });
grievanceSchema.index({ assignedWorker: 1, status: 1 });

grievanceSchema.pre("validate", async function setDefaults() {
  if (this.isNew && !this.grievanceId) {
    const currentYear = new Date().getFullYear();
    const start = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const end = new Date(`${currentYear + 1}-01-01T00:00:00.000Z`);

    const countThisYear = await this.constructor.countDocuments({
      createdAt: { $gte: start, $lt: end },
    });

    const sequence = String(countThisYear + 1).padStart(5, "0");
    this.grievanceId = `GRV-${currentYear}-${sequence}`;
  }

  if (this.isNew && !this.slaDeadline) {
    const days = CATEGORY_SLA_DAYS[this.category] || 5;
    const now = new Date();
    this.slaDeadline = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  }

  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.status || "submitted",
      timestamp: new Date(),
      updatedBy: this.citizen,
      note: "Grievance submitted by citizen",
    });
  }
});

module.exports = mongoose.model("Grievance", grievanceSchema);
