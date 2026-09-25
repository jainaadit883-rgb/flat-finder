import type {
  Constraint,
  Listing,
  MatchingResult,
  MatchedListing,
  ExcludedListing,
  MemberResult,
} from './types';

function softPrefLabel(key: string): string {
  const map: Record<string, string> = {
    prefers_lift: 'Lift',
    prefers_parking: 'Parking',
    prefers_pet_friendly: 'Pet-friendly',
    prefers_furnished: 'Furnished',
    prefers_balcony: 'Balcony',
    prefers_gym: 'Gym',
  };
  return map[key] ?? key;
}

function getExclusionReasons(
  listing: Listing,
  constraints: Constraint[]
): { member: string; reason: string }[] {
  const reasons: { member: string; reason: string }[] = [];

  for (const c of constraints) {
    const perPerson = listing.total_rent / 3;

    if (perPerson > c.max_rent) {
      reasons.push({
        member: c.name,
        reason: `Rent ₹${perPerson.toFixed(0)}/mo exceeds ceiling of ₹${c.max_rent}`,
      });
    }

    if (c.excluded_areas.includes(listing.area)) {
      reasons.push({ member: c.name, reason: `Area "${listing.area}" is excluded` });
    }

    const h = c.hard;
    if (h.requires_lift && !listing.lift) {
      reasons.push({ member: c.name, reason: 'Requires lift — flat has none' });
    }
    if (h.requires_parking && !listing.parking) {
      reasons.push({ member: c.name, reason: 'Requires parking — flat has none' });
    }
    if (listing.bathrooms < h.min_bathrooms) {
      reasons.push({
        member: c.name,
        reason: `Needs ≥${h.min_bathrooms} bathrooms — flat has ${listing.bathrooms}`,
      });
    }
    if (h.requires_pet_friendly && !listing.pet_friendly) {
      reasons.push({ member: c.name, reason: 'Requires pet-friendly — flat is not' });
    }
    if (
      !listing.lift &&
      h.max_floor_without_lift > 0 &&
      listing.floor > h.max_floor_without_lift
    ) {
      reasons.push({
        member: c.name,
        reason: `Floor ${listing.floor} without lift exceeds limit of ${h.max_floor_without_lift}`,
      });
    }
  }

  return reasons;
}

function memberResult(listing: Listing, c: Constraint): MemberResult {
  const perPersonRent = listing.total_rent / 3;
  const s = c.soft;

  const softChecks: { key: keyof typeof s; met: boolean }[] = [
    { key: 'prefers_lift', met: listing.lift },
    { key: 'prefers_parking', met: listing.parking },
    { key: 'prefers_pet_friendly', met: listing.pet_friendly },
    { key: 'prefers_furnished', met: listing.furnished },
    { key: 'prefers_balcony', met: listing.balcony },
    { key: 'prefers_gym', met: listing.gym },
  ];

  const metSoftPrefs: string[] = [];
  const missedSoftPrefs: string[] = [];

  for (const { key, met } of softChecks) {
    if (!s[key]) continue; // they don't care about this
    if (met) metSoftPrefs.push(softPrefLabel(key));
    else missedSoftPrefs.push(softPrefLabel(key));
  }

  return {
    name: c.name,
    perPersonRent,
    rentCeiling: c.max_rent,
    rentDelta: c.max_rent - perPersonRent,
    metSoftPrefs,
    missedSoftPrefs,
  };
}

export function matchListings(
  listings: Listing[],
  constraints: Constraint[]
): MatchingResult {
  const matched: MatchedListing[] = [];
  const excluded: ExcludedListing[] = [];

  for (const listing of listings) {
    const reasons = getExclusionReasons(listing, constraints);
    if (reasons.length > 0) {
      excluded.push({ listing, reasons });
      continue;
    }

    const memberResults = constraints.map((c) => memberResult(listing, c));
    const totalSoftScore = memberResults.reduce(
      (sum, r) => sum + r.metSoftPrefs.length,
      0
    );

    matched.push({ listing, totalSoftScore, memberResults });
  }

  matched.sort((a, b) => b.totalSoftScore - a.totalSoftScore);

  return { matched: matched.slice(0, 3), excluded };
}
