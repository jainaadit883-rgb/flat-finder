'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PUNE_AREAS } from '@/lib/types';

interface Props {
  groupId: string;
  onAdded: () => void;
}

const BLANK = {
  area: PUNE_AREAS[0] as string,
  total_rent: '',
  bhk: 2,
  floor: 1,
  lift: false,
  parking: false,
  bathrooms: 1,
  pet_friendly: false,
  furnished: false,
  balcony: false,
  gym: false,
  link: '',
};

export default function AddListingForm({ groupId, onAdded }: Props) {
  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bool = (label: string, key: keyof typeof form) => (
    <label key={key} className="flex items-center gap-2 cursor-pointer select-none text-sm">
      <input
        type="checkbox"
        className="w-4 h-4 accent-indigo-600"
        checked={!!form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
      />
      {label}
    </label>
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.total_rent || Number(form.total_rent) <= 0) {
      setError('Enter total rent.');
      return;
    }
    setLoading(true);
    const { error: dbErr } = await supabase.from('listings').insert({
      group_id: groupId,
      area: form.area,
      total_rent: Number(form.total_rent),
      bhk: form.bhk,
      floor: form.floor,
      lift: form.lift,
      parking: form.parking,
      bathrooms: form.bathrooms,
      pet_friendly: form.pet_friendly,
      furnished: form.furnished,
      balcony: form.balcony,
      gym: form.gym,
      link: form.link || null,
    });
    setLoading(false);
    if (dbErr) { setError(dbErr.message); return; }
    setForm(BLANK);
    onAdded();
  }

  return (
    <form onSubmit={submit} className="space-y-4 p-5 rounded-2xl border border-gray-200 bg-white">
      <h2 className="font-semibold text-gray-800">Add a listing</h2>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600">Area</label>
          <select
            className="w-full mt-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
            value={form.area}
            onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
          >
            {PUNE_AREAS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Total rent (₹/mo)</label>
          <input
            type="number"
            className="w-full mt-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
            value={form.total_rent}
            onChange={(e) => setForm((f) => ({ ...f, total_rent: e.target.value }))}
            placeholder="e.g. 36000"
            min={1}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">BHK</label>
          <select
            className="w-full mt-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
            value={form.bhk}
            onChange={(e) => setForm((f) => ({ ...f, bhk: Number(e.target.value) }))}
          >
            {[1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Floor</label>
          <input
            type="number"
            className="w-full mt-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
            value={form.floor}
            onChange={(e) => setForm((f) => ({ ...f, floor: Number(e.target.value) }))}
            min={0}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Bathrooms</label>
          <select
            className="w-full mt-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
            value={form.bathrooms}
            onChange={(e) => setForm((f) => ({ ...f, bathrooms: Number(e.target.value) }))}
          >
            {[1, 2, 3].map((n) => <option key={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Listing link (optional)</label>
          <input
            type="url"
            className="w-full mt-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
            value={form.link}
            onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
            placeholder="https://…"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1">
        {bool('Lift', 'lift')}
        {bool('Parking', 'parking')}
        {bool('Pet-friendly', 'pet_friendly')}
        {bool('Furnished', 'furnished')}
        {bool('Balcony', 'balcony')}
        {bool('Gym', 'gym')}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
      >
        {loading ? 'Adding…' : 'Add listing'}
      </button>
    </form>
  );
}
