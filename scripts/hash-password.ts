/**
 * Generate the bcrypt hash for APP_PASSWORD_HASH.
 * Usage: npx tsx scripts/hash-password.ts 'your-password-here'
 */
import bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password) {
  console.error("Usage: npx tsx scripts/hash-password.ts 'your-password-here'");
  process.exit(1);
}

console.log(bcrypt.hashSync(password, 12));
