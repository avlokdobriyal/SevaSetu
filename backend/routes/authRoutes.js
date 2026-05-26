import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

router.post('/register', async (req, res) => {
    const { name, email, password, role, ward } = req.body;
    try {
        const normalizedEmail = email.trim().toLowerCase();
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        // Allow Mayor / Admin creation only manually (in real world via admin route)
        // For this assignment, we allow it directly.
        const userRole = role || 'Citizen';

        const user = await User.create({ name, email: normalizedEmail, password, role: userRole, ward });
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                ward: user.ward,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const normalizedEmail = email.trim();
        // Use a case-insensitive search so existing seeds with uppercase letters work flawlessly
        const user = await User.findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                wardNumber: user.wardNumber,
                specialization: user.specialization,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/me', protect, async (req, res) => {
    res.json(req.user);
});

export default router;
