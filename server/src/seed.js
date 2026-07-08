import mongoose from 'mongoose';
import 'dotenv/config';
import Company from './models/Company.js';
import User from './models/User.js';
import Role from './models/Role.js';
import { connectDB } from './config/db.js';
import { DEFAULT_ROLES } from './config/permissions.js';
import bcrypt from 'bcryptjs';

async function seed() {
    try {
        await connectDB();

        console.log('[seed] Cleaning database collections (Company, User, Role)...');
        await Company.deleteMany({});
        await User.deleteMany({});
        await Role.deleteMany({});

        // Hash the password 'mani123' for your account
        const mainPasswordHash = await bcrypt.hash('mani123', 10);
        // Hash 'password123' for other tests
        const defaultPasswordHash = await bcrypt.hash('password123', 10);

        // 1. Seed Company A - Fully Completed Profile (Your Profile Setup)
        console.log('[seed] Seeding Company A (Apex Builders - Completed Profile)...');
        const companyA = await Company.create({
            companyCode: 'COMP-APEX',
            companyName: 'Apex Builders Ltd.',
            contactPerson: 'Mani Selvam',
            mobileNo: '9876543210',
            email: 'maniselvam2023@gmail.com', // Link to your email
            gstNo: '22AAAAA1111A1Z1',
            panNo: 'ABCDE1234F',
            registrationNo: 'REG-123456',
            address: '102 Skyline Residency, Tech Park Road',
            city: 'Chennai',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '600001',
            logo: {
                url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=128&h=128&fit=crop',
                publicId: 'apex_logo_mock'
            },
            status: 'Active',
            profileCompleted: true,
            profileCompletionPercentage: 100
        });

        const rolesA = await Role.insertMany(
            DEFAULT_ROLES.map((r) => ({
                companyId: companyA._id,
                name: r.name,
                isSystem: r.isSystem,
                permissions: r.permissions
            }))
        );
        const adminRoleA = rolesA.find((r) => r.name === 'Company Admin');

        const userA = await User.create({
            companyId: companyA._id,
            name: 'Mani Selvam',
            email: 'maniselvam2023@gmail.com', // Setup email
            mobileNo: '9876543210',
            passwordHash: mainPasswordHash,   // Setup password
            roleId: adminRoleA._id,
            isOwner: true,
            status: 'Active'
        });

        // 2. Seed Company B - Blank/Incomplete Profile (Just Signed Up)
        console.log('[seed] Seeding Company B (Zenith Realty - Blank Profile)...');
        const companyB = await Company.create({
            companyCode: 'COMP-ZENI',
            companyName: 'Zenith Realty',
            contactPerson: 'Jessica Tan',
            mobileNo: '9123456789',
            email: 'jessica@zenith.com',
            gstNo: '',
            panNo: '',
            registrationNo: '',
            address: '',
            city: '',
            state: '',
            country: 'Singapore',
            pincode: '',
            logo: {
                url: '',
                publicId: ''
            },
            status: 'Active',
            profileCompleted: false,
            profileCompletionPercentage: 38
        });

        companyB.recalculateProfileCompletion();
        await companyB.save();

        const rolesB = await Role.insertMany(
            DEFAULT_ROLES.map((r) => ({
                companyId: companyB._id,
                name: r.name,
                isSystem: r.isSystem,
                permissions: r.permissions
            }))
        );
        const adminRoleB = rolesB.find((r) => r.name === 'Company Admin');

        const userB = await User.create({
            companyId: companyB._id,
            name: 'Jessica Tan',
            email: 'jessica@zenith.com',
            mobileNo: '9123456789',
            passwordHash: defaultPasswordHash,
            roleId: adminRoleB._id,
            isOwner: true,
            status: 'Active'
        });

        console.log('[seed] Seeding completed successfully!');
        console.log('--------------------------------------------------');
        console.log('Test Accounts:');
        console.log(`1. Company: "${companyA.companyName}" (Code: ${companyA.companyCode})`);
        console.log(`   User Email: ${userA.email} | Password: mani123`);
        console.log(`2. Company: "${companyB.companyName}" (Code: ${companyB.companyCode})`);
        console.log(`   User Email: ${userB.email} | Password: password123`);
        console.log('--------------------------------------------------');

        process.exit(0);
    } catch (err) {
        console.error('[seed] Seeding failed:', err);
        process.exit(1);
    }
}

seed();
