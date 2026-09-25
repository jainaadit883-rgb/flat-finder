import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';

async function getData(code: string) {
  const { data: group } = await supabase
    .from('groups')
    .select('id,code')
    .eq('code', code)
    .maybeSingle();

  if (!group) return null;

  const { data: countData } = await supabase.rpc('get_constraint_count', {
    p_group_id: group.id,
  });

  return { group, count: countData ?? 0 };
}

export default async function GroupPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await getData(code.toUpperCase());
  if (!data) notFound();

  const { group, count } = data;
  const allSubmitted = count >= 3;
  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/${group.code}`;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-gray-500 font-mono">Group code</p>
        <h1 className="text-4xl font-extrabold text-indigo-700 tracking-widest">{group.code}</h1>
        <p className="text-sm text-gray-500 mt-1 break-all">Share link: <span className="font-mono text-gray-700">{shareUrl}</span></p>
      </div>

      {/* Submission status */}
      <div className="p-5 rounded-2xl border border-gray-200 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Submissions</h2>
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${allSubmitted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {count} of 3 submitted
          </span>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors ${i < count ? 'bg-indigo-500' : 'bg-gray-200'}`}
            />
          ))}
        </div>
        {!allSubmitted && (
          <p className="text-sm text-gray-500">
            Results and individual constraints are hidden until all three flatmates have submitted.
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href={`/${group.code}/join`}
          className="p-4 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-colors text-center"
        >
          <p className="text-2xl mb-1">📋</p>
          <p className="font-semibold text-indigo-700 text-sm">Fill constraints</p>
          <p className="text-xs text-gray-500 mt-0.5">Your private form</p>
        </Link>

        <Link
          href={`/${group.code}/listings`}
          className={`p-4 rounded-xl border transition-colors text-center ${
            allSubmitted
              ? 'border-gray-200 bg-white hover:bg-gray-50'
              : 'border-gray-200 bg-gray-50 opacity-60 pointer-events-none'
          }`}
        >
          <p className="text-2xl mb-1">🏘️</p>
          <p className="font-semibold text-gray-700 text-sm">Add listings</p>
          <p className="text-xs text-gray-500 mt-0.5">{allSubmitted ? 'Open' : 'Unlocks after all submit'}</p>
        </Link>

        <Link
          href={`/${group.code}/results`}
          className={`p-4 rounded-xl border transition-colors text-center ${
            allSubmitted
              ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
              : 'border-gray-200 bg-gray-50 opacity-60 pointer-events-none'
          }`}
        >
          <p className="text-2xl mb-1">✨</p>
          <p className="font-semibold text-emerald-700 text-sm">See results</p>
          <p className="text-xs text-gray-500 mt-0.5">{allSubmitted ? 'Ready!' : 'Unlocks after all submit'}</p>
        </Link>
      </div>
    </div>
  );
}
