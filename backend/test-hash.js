import bcrypt from 'bcrypt';

async function fixAdminHash() {
  console.log('=== Admin Password Hash Fixer ===\n');

  // Test the seed hash from SQL file
  const seedHash = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8iG7GaxmwoXmxjSPdZRhqUTrWBi3G';
  console.log('1. Testing seed hash from platform_schema.sql...');
  const seedMatch = await bcrypt.compare('password', seedHash);
  console.log(`   Seed hash matches "password": ${seedMatch}\n`);

  // Generate a fresh hash
  console.log('2. Generating fresh hash for "password"...');
  const freshHash = await bcrypt.hash('password', 10);
  console.log(`   Fresh hash: ${freshHash}\n`);

  // Verify the fresh hash works
  console.log('3. Verifying fresh hash...');
  const freshMatch = await bcrypt.compare('password', freshHash);
  console.log(`   Fresh hash matches "password": ${freshMatch}\n`);

  // Provide SQL update command
  console.log('4. SQL to update your admin user:\n');
  console.log('   USE online_menu_platform;');
  console.log(`   UPDATE admin SET password_hash = '${freshHash}' WHERE email = 'owner@example.com';\n`);

  console.log('5. After running the SQL above, login with:');
  console.log('   Email: owner@example.com');
  console.log('   Password: password\n');
}

fixAdminHash().catch(err => console.error('Error:', err));