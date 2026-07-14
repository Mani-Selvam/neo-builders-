import mongoose from 'mongoose';
import { MaterialRequest } from './src/models/masters/index.js';

// Also need to ensure Employee model is loaded
import { Employee } from './src/models/masters/index.js';

mongoose.connect('mongodb://localhost:27017/realestate')
  .then(async () => {
    // Find all material requests missing raisedByName
    const reqs = await MaterialRequest.find({ $or: [{ raisedByName: '' }, { raisedByName: { $exists: false } }] });
    console.log(`Found ${reqs.length} requests to update`);
    
    for (const req of reqs) {
      // Re-saving will trigger the pre-save hook which fills raisedByName
      await req.save();
      console.log(`Updated request ${req._id}: raisedByName = "${req.raisedByName}"`);
    }
    
    console.log('Migration complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
