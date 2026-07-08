import mongoose from 'mongoose';
import 'dotenv/config';

async function listCollections() {
    try {
        const uri = process.env.MONGODB_URI;
        console.log('Connecting to:', uri);
        await mongoose.connect(uri);

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('--- Collections in DB ---');
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`Collection: ${col.name} - Documents: ${count}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listCollections();
