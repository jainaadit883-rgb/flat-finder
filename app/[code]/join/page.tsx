import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ConstraintForm from '@/components/ConstraintForm';
import Link from 'next/link';

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { data: group } = await supabase
    .from('groups')
    .select('id,code')
    .eq('code', code.toUpperCase())
    .maybeSingle();

  if (!group) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/${group.code}`} className="text-sm text-indigo-600 hover:underline">← Back to group</Link>
        <h1 className="text-2xl font-bold mt-2">Your constraints</h1>
        <p className="text-sm text-gray-500">
          Fill this privately. No one can see your answers until all three flatmates have submitted.
        </p>
      </div>
      <ConstraintForm groupId={group.id} code={group.code} />
    </div>
  );
}
