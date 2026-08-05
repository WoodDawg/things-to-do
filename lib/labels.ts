import type { PlaceStatusValue, PlaceTypeValue } from '@/db/schema';

export const TYPE_LABELS: Record<PlaceTypeValue, string> = {
  outdoors: 'Outdoors',
  attraction: 'Attraction',
  museum: 'Museum',
  food: 'Food',
  drink: 'Drink',
  landmark: 'Landmark',
  event: 'Event',
  shopping: 'Shopping',
  lodging: 'Lodging',
};

export const STATUS_LABELS: Record<PlaceStatusValue, string> = {
  want_to_go: 'Want to go',
  been: 'Been',
  favorite: 'Favorite',
  ruled_out: 'Ruled out',
};

export const SETTING_LABELS = {
  indoor: 'Indoor',
  outdoor: 'Outdoor',
  either: 'Indoor or outdoor',
} as const;

export const DURATION_LABELS = {
  quick: 'Quick stop',
  half_day: 'Half day',
  full_day: 'Full day',
  multi_day: 'Multi-day',
} as const;

export const COST_LABELS = {
  free: 'Free',
  low: '$',
  medium: '$$',
  high: '$$$',
} as const;
