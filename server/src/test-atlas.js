import mongoose from 'mongoose';
import Company from './models/Company.js';
import User from './models/User.js';

async function testAtlas() {
    const atlasUri = 'mongodb+srv://mani001:admin@cluster0.tzie1yt.mongodb.net/realestate?retryWrites=true&w=majority';
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(atlasUri);

        console.log('Connected. Finding user maniselvam2023@gmail.com...');
        const user = await User.findOne({ email: 'maniselvam2023@gmail.com' }).lean();

        if (user) {
            console.log('--- User Found on Atlas ---');
            console.log(JSON.stringify(user, null, 2));

            const company = await Company.findById(user.companyId).lean();
            console.log('--- Company Found on Atlas ---');
            console.log(JSON.stringify(company, null, 2));
        } else {
            console.log('User maniselvam2023@gmail.com not found on Atlas.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Atlas Connection Error:', err);
        process.exit(1);
    }
}

testAtlas();
