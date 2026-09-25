'use client';

import type { MatchingResult, MatchedListing, ExcludedListing } from '@/lib/types';

function RentBar({ delta, ceiling }: { delta: number; ceiling: number }) {
  const pct = Math.min(100, Math.max(0, ((ceiling - delta) / ceiling) * 100));
  const color = delta < 0 ? 'bg-red-400' : delta < ceiling * 0.1 ? 'bg-amber-400' : 'bg-emerald-400';
  return (
    <div className="mt-1">
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-500 mt-0.5">
        ₹{Math.round((ceiling - delta)).toLocaleString('en-IN')} / ₹{ceiling.toLocaleString('en-IN')} ceiling
        {delta >= 0 ? ` · ₹${Math.round(delta).toLocaleString('en-IN')} headroom` : ` · ₹${Math.round(-delta).toLocaleString('en-IN')} over!`}
      </p>
    </div>
  );
}

function MemberCard({ mr }: { mr: MatchingResult['matched'][0]['memberResults'][0] }) {
  return (
    <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
      <p className="font-semibold text-sm text-gray-800">{mr.name}</p>
      <RentBar delta={mr.rentDelta} ceiling={mr.rentCeiling} />
      {mr.metSoftPrefs.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {mr.metSoftPrefs.map((p) => (
            <span key={p} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">✓ {p}</span>
          ))}
        </div>
      )}
      {mr.missedSoftPrefs.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {mr.missedSoftPrefs.map((p) => (
            <span key={p} className="px-2 py-0.5 bg-gray-200 text-gray-500 text-xs rounded-full">✗ {p}</span>
          ))}
        </div>
      )}
      {mr.metSoftPrefs.length === 0 && mr.missedSoftPrefs.length === 0 && (
        <p className="text-xs text-gray-400 italic">No soft preferences set</p>
      )}
    </div>
  );
}

function ListingBadge({ listing }: { listing: MatchedListing['listing'] }) {
  const badges = [
    listing.lift && 'Lift',
    listing.parking && 'Parking',
    listing.pet_friendly && 'Pets OK',
    listing.furnished && 'Furnished',
    listing.balcony && 'Balcony',
    listing.gym && 'Gym',
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((b) => (
        <span key={b} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">{b}</span>
      ))}
    </div>
  );
}

function MatchCard({ item, rank }: { item: MatchedListing; rank: number }) {
  const l = item.listing;
  return (
    <div className="rounded-2xl border border-indigo-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-indigo-600 text-white px-5 py-3 flex items-center justify-between">
        <div>
          <span className="text-xs font-medium opacity-80">#{rank} — {l.area}</span>
          <p className="text-lg font-bold">₹{l.total_rent.toLocaleString('en-IN')}/mo · {l.bhk}BHK · Floor {l.floor}</p>
        </div>
        <div className="text-right">
          <p className="text-xs opacity-80">Soft prefs met</p>
          <p className="text-2xl font-bold">{item.totalSoftScore}</p>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <ListingBadge listing={l} />
          {l.link && (
            <a href={l.link} target="_blank" rel="noopener noreferrer"
              className="text-xs text-indigo-600 underline shrink-0 ml-3">View listing ↗</a>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {item.memberResults.map((mr) => <MemberCard key={mr.name} mr={mr} />)}
        </div>
        <p className="text-xs text-gray-400 italic">
          This app does not pick a flat — it only shows tradeoffs. Decide together.
        </p>
      </div>
    </div>
  );
}

function ExcludedCard({ item }: { item: ExcludedListing }) {
  const l = item.listing;
  // Dedupe reasons by member
  const byMember: Record<string, string[]> = {};
  for (const r of item.reasons) {
    byMember[r.member] = [...(byMember[r.member] ?? []), r.reason];
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm text-gray-800">
            {l.area} · ₹{l.total_rent.toLocaleString('en-IN')}/mo · {l.bhk}BHK
          </p>
          {l.link && (
            <a href={l.link} target="_blank" rel="noopener noreferrer"
              className="text-xs text-indigo-600 underline">View ↗</a>
          )}
        </div>
        <span className="shrink-0 text-xs bg-red-200 text-red-700 px-2 py-0.5 rounded-full font-medium">Ruled out</span>
      </div>
      <div className="mt-2 space-y-1">
        {Object.entries(byMember).map(([member, reasons]) => (
          <div key={member}>
            <p className="text-xs font-semibold text-red-700">{member}</p>
            {reasons.map((r) => (
              <p key={r} className="text-xs text-red-600 ml-2">· {r}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResultsView({ result }: { result: MatchingResult }) {
  return (
    <div className="space-y-8">
      {result.matched.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-gray-200 bg-gray-50">
          <p className="text-2xl mb-2">😕</p>
          <p className="font-semibold text-gray-700">No listings pass all three sets of constraints.</p>
          <p className="text-sm text-gray-500 mt-1">Try adding more listings or reviewing the dealbreakers.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Top matches</h2>
          {result.matched.map((item, i) => (
            <MatchCard key={item.listing.id} item={item} rank={i + 1} />
          ))}
        </div>
      )}

      {result.excluded.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-700">Ruled-out listings</h2>
          {result.excluded.map((item) => (
            <ExcludedCard key={item.listing.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
