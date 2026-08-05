import {
  boolean,
  char,
  check,
  date,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const placeType = pgEnum('place_type', [
  'outdoors',
  'attraction',
  'museum',
  'food',
  'drink',
  'landmark',
  'event',
  'shopping',
  'lodging',
]);

export const placeStatus = pgEnum('place_status', [
  'want_to_go',
  'been',
  'favorite',
  'ruled_out',
]);

export const placeSetting = pgEnum('place_setting', ['indoor', 'outdoor', 'either']);

export const placeDuration = pgEnum('place_duration', [
  'quick',
  'half_day',
  'full_day',
  'multi_day',
]);

export const placeCost = pgEnum('place_cost', ['free', 'low', 'medium', 'high']);

export const places = pgTable(
  'places',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    // required on the form
    name: text('name').notNull(),
    type: placeType('type').notNull(),
    state: char('state', { length: 2 }).notNull(),

    // location
    locality: text('locality'),
    address: text('address'),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    geocodedAt: timestamp('geocoded_at', { withTimezone: true }),
    mapUrlOverride: text('map_url_override'),

    // planning
    status: placeStatus('status').notNull().default('want_to_go'),
    setting: placeSetting('setting').notNull().default('either'),
    duration: placeDuration('duration'),
    cost: placeCost('cost'),
    reservationRequired: boolean('reservation_required').notNull().default(false),
    priority: boolean('priority').notNull().default(false),

    // links
    websiteUrl: text('website_url'),
    sourceUrl: text('source_url'),

    // after visiting
    rating: integer('rating'),
    lastVisitedAt: date('last_visited_at'),

    notes: text('notes'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check('rating_range', sql`${t.rating} IS NULL OR (${t.rating} BETWEEN 1 AND 5)`),
    index('places_state_idx').on(t.state),
    index('places_status_idx').on(t.status),
    index('places_type_idx').on(t.type),
    index('places_state_locality_idx').on(t.state, t.locality),
  ],
);

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
});

export const placeTags = pgTable(
  'place_tags',
  {
    placeId: uuid('place_id')
      .notNull()
      .references(() => places.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.placeId, t.tagId] })],
);

export type Place = typeof places.$inferSelect;
export type NewPlace = typeof places.$inferInsert;
export type PlaceTypeValue = (typeof placeType.enumValues)[number];
export type PlaceStatusValue = (typeof placeStatus.enumValues)[number];
