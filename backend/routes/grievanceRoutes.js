import express from 'express';
import Grievance from '../models/Grievance.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roleCheck.js';
import { upload } from '../middleware/upload.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

// Generate unique ID (e.g., SEVA-2026-ABCD)
const generateTrackingId = () => {
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SEVA-2026-${randomChars}`;
}

// Public tracking
router.get('/track/:id', async (req, res) => {
    try {
        const grievance = await Grievance.findOne({ trackingId: req.params.id })
            .select('trackingId title status category createdAt inProgressAt resolvedAt')
        if (!grievance) return res.status(404).json({ message: 'Grievance not found' });
        res.json(grievance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new grievance
router.post('/', protect, upload.array('images', 3), async (req, res) => {
    try {
        let { title, description, category, location, ward } = req.body;
        const trackingId = generateTrackingId();

        // Normalize ward
        if (ward && !ward.toLowerCase().startsWith('ward')) {
            ward = `Ward ${ward.trim()}`;
        }

        let parsedLocation;
        if (location) {
            try {
                parsedLocation = JSON.parse(location);
            } catch (e) {
                parsedLocation = location;
            }
        }

        const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

        const grievance = await Grievance.create({
            trackingId, title, description, category, location: parsedLocation, ward,
            images,
            createdBy: req.user._id
        });

        // Send confirmation email
        if (req.user.email) {
            await sendEmail(
                req.user.email,
                'SevaSetu - Grievance Received',
                `Your grievance has been successfully submitted. Tracking ID: ${trackingId}`
            );
        }

        res.status(201).json(grievance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's logged in grievances
router.get('/my', protect, async (req, res) => {
    try {
        const grievances = await Grievance.find({ createdBy: req.user._id }).sort('-createdAt');
        res.json(grievances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Dashboard specific access
router.get('/dashboard', protect, async (req, res) => {
    try {
        let grievances;
        if (req.user.role === 'Admin' || req.user.role === 'Mayor') {
            grievances = await Grievance.find().populate('assignedWorker', 'name specialization').sort('-createdAt');
        } else if (req.user.role === 'Ward Member') {
            grievances = await Grievance.find({ ward: req.user.wardNumber }).populate('assignedWorker', 'name specialization').sort('-createdAt');
        } else if (req.user.role === 'Worker') {
            grievances = await Grievance.find({ assignedWorker: req.user._id }).sort('-createdAt');
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }
        res.json(grievances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update grievance
router.put('/:id', protect, authorizeRoles('Admin', 'Ward Member', 'Worker'), async (req, res) => {
    try {
        const { status, assignedWorker } = req.body;
        const grievance = await Grievance.findById(req.params.id).populate('createdBy', 'email name');
        if (!grievance) return res.status(404).json({ message: 'Not found' });

        if (status) {
            grievance.status = status;
            if (status === 'Working on it' && !grievance.inProgressAt) {
                grievance.inProgressAt = new Date();
            }
            if (status === 'Solved' && !grievance.resolvedAt) {
                grievance.resolvedAt = new Date();
            }
        }
        if (assignedWorker) grievance.assignedWorker = assignedWorker;

        await grievance.save();

        if (status === 'Solved' && grievance.createdBy.email) {
            await sendEmail(
                grievance.createdBy.email,
                'SevaSetu - Grievance Resolved',
                `Your grievance (ID: ${grievance.trackingId}) has been resolved. Thank you for using SevaSetu.`
            );
        }

        res.json(grievance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
