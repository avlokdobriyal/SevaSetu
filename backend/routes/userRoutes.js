import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roleCheck.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get ward members
router.get('/wardmembers', protect, async (req, res) => {
    try {
        const users = await User.find({ role: 'Ward Member' }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get workers
router.get('/workers', protect, async (req, res) => {
    try {
        let query = { role: 'Worker' };
        if (req.user.role === 'Ward Member') {
            query.wardNumber = req.user.wardNumber;
        }
        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all users (Admin only)
router.get('/', protect, authorizeRoles('Admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Generic manage users function
router.post('/manage', protect, authorizeRoles('Admin', 'Mayor', 'Ward Member'), async (req, res) => {
    try {
        const { name, email, password, role, phoneNumber, wardNumber, specialization } = req.body;

        let targetRole = role;
        let finalWard = wardNumber;
        if (finalWard && !finalWard.toLowerCase().startsWith('ward')) {
            finalWard = `Ward ${finalWard.trim()}`;
        }

        if (req.user.role === 'Mayor') {
            targetRole = 'Ward Member';
        }
        if (req.user.role === 'Ward Member') {
            targetRole = 'Worker';
            finalWard = req.user.wardNumber;
        }

        const user = await User.create({
            name, email, password, role: targetRole, phoneNumber,
            wardNumber: finalWard,
            specialization
        });

        res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete user
router.delete('/:id', protect, authorizeRoles('Admin', 'Mayor', 'Ward Member'), async (req, res) => {
    try {
        const userToDelete = await User.findById(req.params.id);
        if (!userToDelete) return res.status(404).json({ message: 'User not found' });

        if (req.user.role === 'Mayor' && userToDelete.role !== 'Ward Member') {
            return res.status(403).json({ message: 'Not allowed' });
        }
        if (req.user.role === 'Ward Member' && (userToDelete.role !== 'Worker' || userToDelete.wardNumber !== req.user.wardNumber)) {
            return res.status(403).json({ message: 'Not allowed' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
