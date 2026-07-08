import mongoose from 'mongoose';
import 'dotenv/config';
import Company from './models/Company.js';
import User from './models/User.js';
import fs from 'fs';

async function test() {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri);

        const companies = await Company.find().lean();
        const users = await User.find().lean();

        fs.writeFileSync('db-inspect-full.json', JSON.stringify({
            companies,
            users
        }, null, 2));

        console.log('Inspection successful. Written to db-inspect-full.json');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
