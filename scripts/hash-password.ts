/**
 * Generate the bcrypt hash for APP_PASSWORD_HASH.
 * Usage: npm run hash-password -- 'your-password-here'
 *
 * Output is a ready-to-paste .env line with every `$` backslash-escaped —
 * Next's env loader expands unescaped `$…` sequences, which silently
 * corrupts bcrypt hashes.
 */
import bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password) {
  console.error("Usage: npm run hash-password -- 'your-password-here'");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log('Paste this line into .env.local (and the unescaped value into Vercel):\n');
console.log(`APP_PASSWORD_HASH=${hash.replaceAll('$', '\\$')}`);
console.log(`\nUnescaped (for the Vercel env-var form, which does no expansion):\n\n${hash}`);
