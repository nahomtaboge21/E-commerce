const bcrypt = require('bcryptjs');
const User = require('../models/User');

let seedPromise = null;

async function ensureDemoUsers() {
  if (!seedPromise) {
    seedPromise = (async () => {
      const existingUsers = await User.find({
        email: { $in: ['admin@shopvine.com', 'jane@example.com', 'bob@example.com'] }
      }).select('email').lean();
      const existingEmails = new Set(existingUsers.map(user => user.email));
      const usersToInsert = [];

      const adminPass = await bcrypt.hash('admin123', 10);
      const userPass = await bcrypt.hash('user123', 10);
      if (!existingEmails.has('admin@shopvine.com')) usersToInsert.push({ name: 'Admin User', email: 'admin@shopvine.com', password: adminPass, role: 'admin', avatar: 'AU' });
      if (!existingEmails.has('jane@example.com')) usersToInsert.push({ name: 'Jane Smith', email: 'jane@example.com', password: userPass, role: 'user', avatar: 'JS' });
      if (!existingEmails.has('bob@example.com')) usersToInsert.push({ name: 'Bob Johnson', email: 'bob@example.com', password: userPass, role: 'user', avatar: 'BJ' });

      if (usersToInsert.length) {
        await User.insertMany(usersToInsert);
      }
    })().finally(() => {
      seedPromise = null;
    });
  }

  await seedPromise;
  return true;
}

module.exports = ensureDemoUsers;
