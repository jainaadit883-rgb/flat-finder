'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function randomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  async function createGroup() {
    setLoading(true);
    const code = randomCode();
    const { error } = await supabase.from('groups').insert({ code });
    setLoading(false);
    if (error) { alert('Failed to create group: ' + error.message); return; }
    router.push(`/${code}`);
  }

  async function joinGroup(e: React.FormEvent) {
    e.preventDefault();
    setJoinError('');
    const code = joinCode.trim().toUpperCase();
    if (!code) { setJoinError('Enter a group code.'); return; }
    const { data } = await supabase.from('groups').select('code').eq('code', code).maybeSingle();
    if (!data) { setJoinError('Group not found. Check the code and try again.'); return; }
    router.push(`/${code}`);
  }

  return (
    <div className="space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900">Find a flat, together</h1>
        <p className="text-gray-500 max-w-sm mx-auto">
          Each flatmate fills their constraints privately. Once all three submit, the app shows which listings work — and the tradeoffs for each person.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Create */}
        <div className="p-6 rounded-2xl bg-indigo-600 text-white space-y-3">
          <h2 className="font-bold text-lg">Create a group</h2>
          <p className="text-sm opacity-80">You&apos;ll get a code to share with your two flatmates.</p>
          <button
            onClick={createGroup}
            disabled={loading}
            className="w-full bg-white text-indigo-700 font-semibold py-2.5 rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Create group →'}
          </button>
        </div>

        {/* Join */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-3">
          <h2 className="font-bold text-lg text-gray-800">Join with a code</h2>
          <p className="text-sm text-gray-500">Got a code from a flatmate? Enter it here.</p>
          <form onSubmit={joinGroup} className="space-y-2">
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. DEMO01"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              maxLength={10}
            />
            {joinError && <p className="text-xs text-red-600">{joinError}</p>}
            <button
              type="submit"
              className="w-full bg-gray-900 text-white font-semibold py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
            >
              Join →
            </button>
          </form>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-400">
          Want to try the demo? Use group code <span className="font-mono font-bold">DEMO01</span> — Riya, Meera and Kavita&apos;s constraints are pre-seeded.
        </p>
      </div>
    </div>
  );
}
