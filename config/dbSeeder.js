const User = require("../models/User");

async function seedSuperAdmin() {
  try {
    const existingAdmin = await User.findOne({
      email: process.env.SUPER_ADMIN_EMAIL,
    });
    if (!existingAdmin) {
      const superAdmin = new User({
        firstName: process.env.SUPER_ADMIN_FIRSTNAME,
        lastName: process.env.SUPER_ADMIN_LASTNAME,
        email: process.env.SUPER_ADMIN_EMAIL,
        password: process.env.SUPER_ADMIN_PASSWORD,
        role: 0,
        position: 1,
      });

      await superAdmin.save();
      console.log("Super admin seeded successfully");
    } else {
      console.log("Super admin already exists");
    }
  } catch (error) {
    console.error("Error seeding super admin:", error);
  }
}

module.exports = seedSuperAdmin;
