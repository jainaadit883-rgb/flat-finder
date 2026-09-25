'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Listing, Group } from '@/lib/types';
import AddListingForm from '@/components/AddListingForm';
import Link from 'next/link';

export default function ListingsPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async (groupId: string) => {
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });
    setListings((data as Listing[]) ?? []);
  }, []);

  useEffect(() => {
    async function init() {
      const { data: g } = await supabase
        .from('groups')
        .select('*')
        .eq('code', code.toUpperCase())
        .maybeSingle();
      if (!g) { router.push('/'); return; }

      const { data: cnt } = await supabase.rpc('get_constraint_count', { p_group_id: g.id });
      if ((cnt ?? 0) < 3) { router.push(`/${code}`); return; }

      setGroup(g as Group);
      await fetchListings(g.id);
      setLoading(false);
    }
    init();
  }, [code, router, fetchListings]);

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/${code}`} className="text-sm text-indigo-600 hover:underline">← Back to group</Link>
        <h1 className="text-2xl font-bold mt-2">Listings</h1>
        <p className="text-sm text-gray-500">Add flats you&apos;re considering. Anyone in the group can add.</p>
      </div>

      <AddListingForm groupId={group!.id} onAdded={() => fetchListings(group!.id)} />

      {listings.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-700">{listings.length} listing{listings.length !== 1 ? 's' : ''} added</h2>
          {listings.map((l) => (
            <div key={l.id} className="p-4 rounded-xl border border-gray-200 bg-white flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-800">{l.area} · ₹{l.total_rent.toLocaleString('en-IN')}/mo · {l.bhk}BHK · Floor {l.floor}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {l.bathrooms} bath{l.bathrooms > 1 ? 's' : ''}
                  {l.lift ? ' · Lift' : ''}
                  {l.parking ? ' · Parking' : ''}
                  {l.pet_friendly ? ' · Pets OK' : ''}
                  {l.furnished ? ' · Furnished' : ''}
                  {l.balcony ? ' · Balcony' : ''}
                  {l.gym ? ' · Gym' : ''}
                </p>
              </div>
              {l.link && (
                <a href={l.link} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-indigo-600 underline shrink-0">View ↗</a>
              )}
            </div>
          ))}
        </div>
      )}

      {listings.length > 0 && (
        <Link
          href={`/${code}/results`}
          className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          See results →
        </Link>
      )}
    </div>
  );
}
