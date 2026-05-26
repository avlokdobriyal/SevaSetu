import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    role: {
        type: String,
        enum: ['Citizen', 'Ward Member', 'Worker', 'Admin', 'Mayor'],
        default: 'Citizen'
    },
    wardNumber: { type: String },
    specialization: { type: String, enum: ['Electricity', 'Sanitation', 'Road/Pothole', 'Water Supply', 'Other'] },
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 }
}, { timestamps: true });

userSchema.index({ wardNumber: 1 }, { unique: true, partialFilterExpression: { role: 'Ward Member', wardNumber: { $exists: true } } });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

export default mongoose.model('User', userSchema);
