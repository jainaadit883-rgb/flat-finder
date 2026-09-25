import { supabase } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import type { Constraint, Listing } from '@/lib/types';
import { matchListings } from '@/lib/matching';
import ResultsView from '@/components/ResultsView';
import Link from 'next/link';

export const revalidate = 0;

export default async function ResultsPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const { data: group } = await supabase
    .from('groups')
    .select('id,code')
    .eq('code', code.toUpperCase())
    .maybeSingle();

  if (!group) notFound();

  const { data: countData } = await supabase.rpc('get_constraint_count', {
    p_group_id: group.id,
  });
  const count = countData ?? 0;

  if (count < 3) redirect(`/${group.code}`);

  const [{ data: rawConstraints }, { data: rawListings }] = await Promise.all([
    supabase.from('constraints').select('*').eq('group_id', group.id),
    supabase.from('listings').select('*').eq('group_id', group.id).order('created_at'),
  ]);

  const constraints = (rawConstraints as Constraint[]) ?? [];
  const listings = (rawListings as Listing[]) ?? [];

  const result = matchListings(listings, constraints);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/${group.code}`} className="text-sm text-indigo-600 hover:underline">← Back to group</Link>
        <h1 className="text-2xl font-bold mt-2">Results</h1>
        <p className="text-sm text-gray-500">
          All three constraints are in. Here&apos;s how the listings stack up.
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-gray-200 bg-gray-50">
          <p className="text-2xl mb-2">🏘️</p>
          <p className="font-semibold text-gray-700">No listings added yet.</p>
          <Link href={`/${group.code}/listings`}
            className="mt-3 inline-block text-indigo-600 underline text-sm">Add listings →</Link>
        </div>
      ) : (
        <ResultsView result={result} />
      )}
    </div>
  );
}
