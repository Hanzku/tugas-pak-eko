import { execSync } from 'node:child_process';

/**
 * Menjalankan `prisma db push` ke database produksi saat build di Vercel.
 * - Skip di lokal (DATABASE_URL SQLite / tidak ada).
 * - Prisma CLI butuh koneksi langsung (bukan prisma:// Accelerate),
 *   jadi pilih URL postgres yang tersedia.
 */
const candidates = [
  process.env.DATABASE_POSTGRES_URL,
  process.env.DATABASE_PRISMA_DATABASE_URL,
  process.env.DATABASE_URL,
].filter(Boolean);

const directUrl = candidates.find((u) => u.startsWith('postgres://') || u.startsWith('postgresql://'));

if (!directUrl) {
  console.log('[db-push] Tidak ada URL postgres langsung, skip prisma db push (lokal / accelerate).');
  process.exit(0);
}

console.log('[db-push] Menjalankan prisma db push ke database...');
execSync(`npx prisma db push --skip-generate --accept-data-loss --url "${directUrl}"`, {
  stdio: 'inherit',
});