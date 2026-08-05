import {
  BedDouble,
  Beer,
  CalendarDays,
  Castle,
  FerrisWheel,
  Landmark,
  Mountain,
  ShoppingBag,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import type { PlaceTypeValue } from '@/db/schema';

export const TYPE_ICONS: Record<PlaceTypeValue, LucideIcon> = {
  outdoors: Mountain,
  attraction: FerrisWheel,
  museum: Landmark,
  food: UtensilsCrossed,
  drink: Beer,
  landmark: Castle,
  event: CalendarDays,
  shopping: ShoppingBag,
  lodging: BedDouble,
};

export function TypeIcon({
  type,
  className = 'size-5',
}: {
  type: PlaceTypeValue;
  className?: string;
}) {
  const Icon = TYPE_ICONS[type];
  return <Icon className={className} aria-hidden="true" />;
}
