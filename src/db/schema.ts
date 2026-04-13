import { sqliteTable, text, integer, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const userTypes = ['parent', 'student'] as const;
export const locationTypes = ['highway', 'residential', 'rural', 'urban', 'parking_lot', 'race_track'] as const;
export const weatherConditions = ['clear', 'rain', 'snow', 'fog', 'ice'] as const;

export type UserType = (typeof userTypes)[number];
export type LocationType = (typeof locationTypes)[number];
export type WeatherCondition = (typeof weatherConditions)[number];

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  userType: text('user_type', { enum: userTypes }).notNull(),
  // null for parent accounts; references users.id for student accounts
  parentId: integer('parent_id').references((): AnySQLiteColumn => users.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
});

export const trips = sqliteTable('trips', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studentId: integer('student_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdBy: integer('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tripDate: text('trip_date').notNull(),
  locationType: text('location_type', { enum: locationTypes }).notNull(),
  weather: text('weather', { enum: weatherConditions }).notNull(),
  daytimeMinutes: integer('daytime_minutes').notNull().default(0),
  nighttimeMinutes: integer('nighttime_minutes').notNull().default(0),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;
