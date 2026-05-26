import mongoose from 'mongoose';

const grievanceSchema = new mongoose.Schema({
    trackingId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['Electricity', 'Sanitation', 'Road/Pothole', 'Water Supply', 'Other']
    },
    location: {
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String }
    },
    ward: { type: String },
    images: [{ type: String }],
    status: {
        type: String,
        enum: ['Pending', 'Working on it', 'Solved'],
        default: 'Pending'
    },
    inProgressAt: { type: Date },
    resolvedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    isRated: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Grievance', grievanceSchema);
