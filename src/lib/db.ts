import { drizzle } from 'drizzle-orm/libsql';
import { sql } from 'drizzle-orm';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const createDb = () => {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL || 'file:local.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return drizzle(client, { schema });
};

// Global cache for dev mode to avoid multiple clients
const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof createDb> | undefined;
};

export const db = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

const globalForDbInitialization = globalThis as unknown as {
  initialization: Promise<void> | undefined;
};

export const ensureDatabase = globalForDbInitialization.initialization ?? (async () => {
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

  const now = new Date().toISOString();
  await db.run(sql`
    INSERT OR IGNORE INTO users (
      id, username, password_hash, display_name, current_status,
      status_updated_at, created_at, updated_at
    ) VALUES
      ('user-1', 'user1', '', '|', 'not_available', ${now}, ${now}, ${now}),
      ('user-2', 'user2', '', 'O', 'not_available', ${now}, ${now}, ${now});
  `);
})();

globalForDbInitialization.initialization = ensureDatabase;
