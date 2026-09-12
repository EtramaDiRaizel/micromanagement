import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name').notNull(),
  currentStatus: text('current_status').notNull().default('not_available'),
  statusUpdatedAt: text('status_updated_at').notNull(),
  statusExpiresAt: text('status_expires_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const statusHistory = sqliteTable('statusHistory', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  previousStatus: text('previous_status'),
  newStatus: text('new_status').notNull(),
  changedAt: text('changed_at').notNull(),
});
