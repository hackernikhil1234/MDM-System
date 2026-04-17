require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mdm_system';

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'admin@mdmportal.com';
    const password = 'adminPassword123!';
    const name = 'System Administrator';

    // Check if we already have an admin with this email
    let adminUser = await User.findOne({ email });

    if (adminUser) {
      console.log('Admin user already exists. Resetting password and ensuring admin role...');
      adminUser.password = password;
      adminUser.role = 'admin';
      adminUser.isActive = true;
      await adminUser.save();
      console.log('✅ Admin user updated successfully.');
    } else {
      console.log('Creating new admin user...');
      adminUser = new User({
        name,
        email,
        password,
        role: 'admin',
        isActive: true
      });
      await adminUser.save();
      console.log('✅ New admin user created successfully.');
    }

    console.log('\n=======================================');
    console.log('🎉 ADMIN CREDENTIALS GENERATED');
    console.log('Email:    ' + email);
    console.log('Password: ' + password);
    console.log('=======================================\n');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

createAdmin();
