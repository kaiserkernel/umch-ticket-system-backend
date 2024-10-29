const mongoose = require('mongoose');
const seedSuperAdmin = require('./dbSeeder'); 

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');

        // Seed the super admin if not exists
        await seedSuperAdmin();
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
