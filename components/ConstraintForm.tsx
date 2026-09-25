'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PUNE_AREAS } from '@/lib/types';

export default function ConstraintForm({ groupId, code }: { groupId: string; code: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    max_rent: '',
    excluded_areas: [] as string[],
    // hard
    requires_lift: false,
    requires_parking: false,
    min_bathrooms: 1,
    requires_pet_friendly: false,
    max_floor_without_lift: 0,
    // soft
    prefers_lift: false,
    prefers_parking: false,
    prefers_pet_friendly: false,
    prefers_furnished: false,
    prefers_balcony: false,
    prefers_gym: false,
  });

  function toggleArea(area: string) {
    setForm((f) => ({
      ...f,
      excluded_areas: f.excluded_areas.includes(area)
        ? f.excluded_areas.filter((a) => a !== area)
        : [...f.excluded_areas, area],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Please enter your name.'); return; }
    if (!form.max_rent || Number(form.max_rent) <= 0) { setError('Enter a valid rent amount.'); return; }

    setLoading(true);
    const { error: dbErr } = await supabase.from('constraints').insert({
      group_id: groupId,
      name: form.name.trim(),
      max_rent: Number(form.max_rent),
      excluded_areas: form.excluded_areas,
      hard: {
        requires_lift: form.requires_lift,
        requires_parking: form.requires_parking,
        min_bathrooms: form.min_bathrooms,
        requires_pet_friendly: form.requires_pet_friendly,
        max_floor_without_lift: form.max_floor_without_lift,
      },
      soft: {
        prefers_lift: form.prefers_lift,
        prefers_parking: form.prefers_parking,
        prefers_pet_friendly: form.prefers_pet_friendly,
        prefers_furnished: form.prefers_furnished,
        prefers_balcony: form.prefers_balcony,
        prefers_gym: form.prefers_gym,
      },
    });

    setLoading(false);
    if (dbErr) {
      if (dbErr.code === '23505') setError('A response with that name already exists for this group.');
      else setError(dbErr.message);
      return;
    }
    router.push(`/${code}`);
  }

  const checkbox = (label: string, key: keyof typeof form) => (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        className="w-4 h-4 accent-indigo-600"
        checked={!!form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
      />
      <span className="text-sm">{label}</span>
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-xl mx-auto">
      {/* Name */}
      <div className="space-y-1">
        <label className="block text-sm font-semibold">Your name</label>
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Riya"
        />
      </div>

      {/* Max rent */}
      <div className="space-y-1">
        <label className="block text-sm font-semibold">Max monthly rent contribution (₹)</label>
        <p className="text-xs text-gray-500">Your share — the app assumes rent is split equally among 3.</p>
        <input
          type="number"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={form.max_rent}
          onChange={(e) => setForm((f) => ({ ...f, max_rent: e.target.value }))}
          placeholder="e.g. 14000"
          min={1}
        />
      </div>

      {/* Excluded areas */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold">Areas you will NOT live in</label>
        <div className="flex flex-wrap gap-2">
          {PUNE_AREAS.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => toggleArea(area)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                form.excluded_areas.includes(area)
                  ? 'bg-red-100 border-red-400 text-red-700'
                  : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Hard requirements */}
      <div className="space-y-3 p-4 rounded-xl bg-red-50 border border-red-200">
        <h3 className="text-sm font-bold text-red-700">Dealbreakers — I will not consider a flat without these</h3>
        <div className="grid grid-cols-2 gap-3">
          {checkbox('Must have lift', 'requires_lift')}
          {checkbox('Must have parking', 'requires_parking')}
          {checkbox('Must be pet-friendly', 'requires_pet_friendly')}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Min bathrooms</label>
            <select
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              value={form.min_bathrooms}
              onChange={(e) => setForm((f) => ({ ...f, min_bathrooms: Number(e.target.value) }))}
            >
              {[1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Max floor if no lift (0 = no limit)</label>
            <select
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              value={form.max_floor_without_lift}
              onChange={(e) => setForm((f) => ({ ...f, max_floor_without_lift: Number(e.target.value) }))}
            >
              {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n === 0 ? 'No limit' : n}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Soft preferences */}
      <div className="space-y-3 p-4 rounded-xl bg-indigo-50 border border-indigo-200">
        <h3 className="text-sm font-bold text-indigo-700">Nice to have — I&apos;d love these but won&apos;t veto without them</h3>
        <div className="grid grid-cols-2 gap-3">
          {checkbox('Lift', 'prefers_lift')}
          {checkbox('Parking', 'prefers_parking')}
          {checkbox('Pet-friendly', 'prefers_pet_friendly')}
          {checkbox('Furnished', 'prefers_furnished')}
          {checkbox('Balcony', 'prefers_balcony')}
          {checkbox('Gym', 'prefers_gym')}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {loading ? 'Submitting…' : 'Submit my constraints'}
      </button>
    </form>
  );
}
