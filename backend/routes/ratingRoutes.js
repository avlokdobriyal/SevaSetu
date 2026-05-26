import express from 'express';
import Grievance from '../models/Grievance.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/rate/:id', protect, async (req, res) => {
    try {
        const { rating } = req.body;
        if (rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });

        const grievance = await Grievance.findById(req.params.id);
        if (!grievance) return res.status(404).json({ message: 'Not found' });
        if (grievance.status !== 'Solved') return res.status(400).json({ message: 'Only solved grievances can be rated' });
        if (grievance.isRated) return res.status(400).json({ message: 'Already rated' });
        if (grievance.createdBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Unauthorized' });

        grievance.rating = rating;
        grievance.isRated = true;
        await grievance.save();

        if (grievance.assignedWorker) {
            const worker = await User.findById(grievance.assignedWorker);
            if (worker) {
                const total = worker.averageRating * worker.ratingCount;
                worker.ratingCount += 1;
                worker.averageRating = Number(((total + rating) / worker.ratingCount).toFixed(1));
                await worker.save();

                const wardMember = await User.findOne({ role: 'Ward Member', wardNumber: worker.wardNumber });
                if (wardMember) {
                    const mTotal = wardMember.averageRating * wardMember.ratingCount;
                    wardMember.ratingCount += 1;
                    wardMember.averageRating = Number(((mTotal + rating) / wardMember.ratingCount).toFixed(1));
                    await wardMember.save();
                }
            }
        }

        res.json({ message: 'Rated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/wards', async (req, res) => {
    try {
        const members = await User.find({ role: 'Ward Member' }).select('wardNumber averageRating ratingCount name');
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/ward/:wardNumber/workers', async (req, res) => {
    try {
        const workers = await User.find({ role: 'Worker', wardNumber: req.params.wardNumber }).select('name specialization averageRating ratingCount');
        res.json(workers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
