import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { sql } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import * as schema from '../src/lib/schema';
import { VALID_STATUSES } from '../src/lib/statuses';
import * as crypto from 'crypto';

// Load .env.local or .env file
for (const envFileName of ['.env.local', '.env']) {
  try {
    const envFile = readFileSync(resolve(process.cwd(), envFileName), 'utf8');
    envFile.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
    break;
  } catch {
    // Continue to next env file
  }
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;

  console.log('Connecting to database...');
  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  console.log('Creating tables...');
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      current_status TEXT NOT NULL DEFAULT 'not_available',
      status_updated_at TEXT NOT NULL,
      status_expires_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS statusHistory (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      previous_status TEXT,
      new_status TEXT NOT NULL,
      changed_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
  console.log('Tables created successfully.');

  const usersToSeed = [
    {
      username: process.env.USER1_USERNAME || 'user1',
      password: process.env.USER1_PASSWORD || 'dummy',
      displayName: process.env.USER1_DISPLAY_NAME || '|',
    },
    {
      username: process.env.USER2_USERNAME || 'user2',
      password: process.env.USER2_PASSWORD || 'dummy',
      displayName: process.env.USER2_DISPLAY_NAME || 'O',
    },
  ];

  for (const u of usersToSeed) {
    if (!u.username || !u.password || !u.displayName) {
      console.log('Skipping a user due to missing environment variables.');
      continue;
    }

    const existingUser = await db
      .select()
      .from(schema.users)
      .where(sql`username = ${u.username}`)
      .get();

    if (existingUser) {
      await db.update(schema.users)
        .set({
          displayName: u.displayName,
          currentStatus: VALID_STATUSES.has(existingUser.currentStatus) ? existingUser.currentStatus : 'not_available',
          updatedAt: new Date().toISOString(),
        })
        .where(sql`username = ${u.username}`);
      console.log(`User ${u.username} already exists. Skipping.`);
      continue;
    }

    const passwordHash = await bcrypt.hash(u.password, 10);
    const now = new Date().toISOString();

    await db.insert(schema.users).values({
      id: crypto.randomUUID(),
      username: u.username,
      passwordHash,
      displayName: u.displayName,
      currentStatus: 'offline',
      statusUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    console.log(`Created user: ${u.username}`);
  }

  console.log('Seeding complete.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
