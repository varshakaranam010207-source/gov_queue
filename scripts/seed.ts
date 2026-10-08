import { db } from '../api/lib/db.ts';

async function seed() {
  try {
    console.log('Seeding demo accounts for GovQueue AI...');
    await db.seedDemoUsers();
    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed demo accounts:', error);
    process.exit(1);
  }
}

seed();
