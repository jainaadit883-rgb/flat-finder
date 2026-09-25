export const PUNE_AREAS = [
  'Baner', 'Hinjewadi', 'Kothrud', 'Wakad', 'Aundh',
  'Viman Nagar', 'Kharadi', 'Hadapsar', 'Koregaon Park',
  'Kalyani Nagar', 'Shivajinagar', 'Deccan', 'Pimple Saudagar',
] as const;

export type PuneArea = (typeof PUNE_AREAS)[number];

export interface HardRequirements {
  requires_lift: boolean;
  requires_parking: boolean;
  min_bathrooms: number;
  requires_pet_friendly: boolean;
  max_floor_without_lift: number; // 0 = no limit
}

export interface SoftPreferences {
  prefers_lift: boolean;
  prefers_parking: boolean;
  prefers_pet_friendly: boolean;
  prefers_furnished: boolean;
  prefers_balcony: boolean;
  prefers_gym: boolean;
}

export interface Constraint {
  id: string;
  group_id: string;
  name: string;
  max_rent: number;
  excluded_areas: string[];
  hard: HardRequirements;
  soft: SoftPreferences;
  created_at: string;
}

export interface Listing {
  id: string;
  group_id: string;
  area: string;
  total_rent: number;
  bhk: number;
  floor: number;
  lift: boolean;
  parking: boolean;
  bathrooms: number;
  pet_friendly: boolean;
  furnished: boolean;
  balcony: boolean;
  gym: boolean;
  link: string | null;
  created_at: string;
}

export interface Group {
  id: string;
  code: string;
  created_at: string;
}

export interface MemberResult {
  name: string;
  perPersonRent: number;
  rentCeiling: number;
  rentDelta: number; // ceiling - actual (positive = headroom)
  metSoftPrefs: string[];
  missedSoftPrefs: string[];
}

export interface MatchedListing {
  listing: Listing;
  totalSoftScore: number;
  memberResults: MemberResult[];
}

export interface ExcludedListing {
  listing: Listing;
  reasons: { member: string; reason: string }[];
}

export interface MatchingResult {
  matched: MatchedListing[];
  excluded: ExcludedListing[];
}
