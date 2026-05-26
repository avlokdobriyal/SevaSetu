import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Grievance from './models/Grievance.js';

dotenv.config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sevasetu');
        console.log('MongoDB Connected for Seeding');

        await User.deleteMany();
        await Grievance.deleteMany();

        const wards = ['Ward 1', 'Ward 7', 'Ward 9', 'Ward 15', 'Ward 45'];
        const users = [
            {
                name: 'System Admin',
                email: 'admin@sevasetu.gov',
                password: 'password123',
                role: 'Admin'
            },
            {
                name: 'Anita Desai',
                email: 'mayor@sevasetu.gov',
                password: 'password123',
                role: 'Mayor'
            }
        ];

        // Citizens
        for (let i = 1; i <= 5; i++) {
            users.push({
                name: `Citizen ${i}`,
                email: `citizen${i}@example.com`,
                password: 'password123',
                role: 'Citizen'
            });
        }

        // Ward Members & Workers
        wards.forEach((ward, i) => {
            users.push({
                name: `Member ${ward}`,
                email: `member${i}@sevasetu.gov`,
                password: 'password123',
                role: 'Ward Member',
                wardNumber: ward
            });
            users.push({
                name: `Worker A - ${ward}`,
                email: `workerA${i}@sevasetu.gov`,
                password: 'password123',
                role: 'Worker',
                wardNumber: ward,
                specialization: 'Electricity',
                averageRating: Math.floor(Math.random() * 2) + 3.5, // 3.5 to 4.5
                ratingCount: Math.floor(Math.random() * 10) + 1
            });
            users.push({
                name: `Worker B - ${ward}`,
                email: `workerB${i}@sevasetu.gov`,
                password: 'password123',
                role: 'Worker',
                wardNumber: ward,
                specialization: 'Sanitation',
                averageRating: Math.floor(Math.random() * 2) + 3,
                ratingCount: Math.floor(Math.random() * 10) + 1
            });
        });

        const createdUsers = await User.create(users);

        // Update Ward Member ratings based on workers
        for (const ward of wards) {
            const workers = createdUsers.filter(u => u.role === 'Worker' && u.wardNumber === ward);
            const member = createdUsers.find(u => u.role === 'Ward Member' && u.wardNumber === ward);
            
            let totalRating = 0;
            let totalCount = 0;
            workers.forEach(w => {
                totalRating += w.averageRating * w.ratingCount;
                totalCount += w.ratingCount;
            });
            
            if (member && totalCount > 0) {
                member.averageRating = Number((totalRating / totalCount).toFixed(1));
                member.ratingCount = totalCount;
                await member.save();
            }
        }

        console.log('Database seeded successfully with new wards, members, and ratings!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
