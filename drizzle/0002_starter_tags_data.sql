-- Starter tag vocabulary (spec §3) so autocomplete has something on day one.
INSERT INTO "tags" ("name") VALUES
  ('hike'), ('waterfall'), ('scenic-drive'), ('overlook'), ('state-park'),
  ('national-park'), ('zoo'), ('aquarium'), ('brewery'), ('winery'), ('farm'),
  ('historic'), ('dog-friendly'), ('kid-friendly'), ('date-night'), ('crowded'),
  ('seasonal')
ON CONFLICT ("name") DO NOTHING;
