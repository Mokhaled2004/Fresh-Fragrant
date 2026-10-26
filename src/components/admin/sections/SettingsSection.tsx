'use client';

import { useState, useEffect } from 'react';
import {
  Store, Mail, Phone, MapPin, DollarSign,
  Bell, Package, User, Save, CheckCircle, AlertCircle,
} from 'lucide-react';
import { Loader } from '@/components/ui/Loader'; // <-- New Loader import

interface AdminSettings {
  id: string;
  storeName: string;
  storeEmail: string | null;
  storePhone: string | null;
  storeAddress: string | null;
  storeCurrency: string;
  lowStockThreshold: number;
  notifyOnNewOrder: boolean;
  notifyOnLowStock: boolean;
  notifyOnNewUser: boolean;
  adminName: string | null;
  adminEmail: string | null;
  updatedAt: string;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function SectionCard({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-xl bg-[#F3F0FF] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#5433EB]" />
        </div>
        <h2 className="text-[15px] font-semibold text-black">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] text-black focus:border-[#5433EB] focus:outline-none transition-colors placeholder:text-gray-300';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-[#5433EB]' : 'bg-gray-200'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function SettingsSection() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [form, setForm] = useState<Partial<AdminSettings>>({});
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        setSettings(data.settings);
        setForm(data.settings);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaveState('saving');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setSettings(data.settings);
      setForm(data.settings);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } catch {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2 text-gray-400">
        <Loader />
        <p className="text-[14px]">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-semibold text-black">Settings</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">Manage your store and admin preferences</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saveState === 'saving'}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
            saveState === 'saved'
              ? 'bg-green-50 text-green-600'
              : saveState === 'error'
              ? 'bg-red-50 text-red-600'
              : 'bg-[#5433EB] text-white hover:bg-[#4527D4] disabled:opacity-60'
          }`}
        >
          {saveState === 'saved' ? (
            <><CheckCircle className="w-4 h-4" /> Saved</>
          ) : saveState === 'error' ? (
            <><AlertCircle className="w-4 h-4" /> Failed</>
          ) : (
            <><Save className="w-4 h-4" /> {saveState === 'saving' ? 'Saving…' : 'Save changes'}</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* ── Store Info ── */}
        <SectionCard title="Store Information" icon={Store}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Store Name">
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    className={`${inputCls} pl-9`}
                    value={form.storeName ?? ''}
                    onChange={e => set('storeName', e.target.value)}
                    placeholder="Fresh & Fragrant"
                  />
                </div>
              </Field>
            </div>
            <Field label="Store Email">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  className={`${inputCls} pl-9`}
                  type="email"
                  value={form.storeEmail ?? ''}
                  onChange={e => set('storeEmail', e.target.value)}
                  placeholder="store@example.com"
                />
              </div>
            </Field>
            <Field label="Store Phone">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  className={`${inputCls} pl-9`}
                  value={form.storePhone ?? ''}
                  onChange={e => set('storePhone', e.target.value)}
                  placeholder="+20 100 000 0000"
                />
              </div>
            </Field>
            <div className="col-span-2">
              <Field label="Store Address">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-3.5 h-3.5 text-gray-400" />
                  <textarea
                    className={`${inputCls} pl-9 resize-none`}
                    rows={2}
                    value={form.storeAddress ?? ''}
                    onChange={e => set('storeAddress', e.target.value)}
                    placeholder="123 Main St, Cairo, Egypt"
                  />
                </div>
              </Field>
            </div>
            <Field label="Default Currency">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  className={`${inputCls} pl-9`}
                  value={form.storeCurrency ?? ''}
                  onChange={e => set('storeCurrency', e.target.value)}
                  placeholder="EGP"
                  maxLength={5}
                />
              </div>
            </Field>
          </div>
        </SectionCard>

        {/* ── Right column: Inventory + Notifications + Admin ── */}
        <div className="flex flex-col gap-4">

        {/* ── Inventory ── */}
        <SectionCard title="Inventory" icon={Package}>
          <Field label="Low Stock Threshold">
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={100}
                className={`${inputCls} w-28`}
                value={form.lowStockThreshold ?? 5}
                onChange={e => set('lowStockThreshold', parseInt(e.target.value) || 0)}
              />
              <p className="text-[12px] text-gray-400">
                A <span className="text-orange-500 font-medium">Low Stock Alert</span> notification fires whenever a product's stock is saved below this number.
              </p>
            </div>
          </Field>
        </SectionCard>

        {/* ── Notifications ── */}
        <SectionCard title="Notifications" icon={Bell}>
          <div className="space-y-4">
            {[
              { key: 'notifyOnNewOrder' as const, label: 'New order placed', desc: 'Get notified when a customer places an order' },
              { key: 'notifyOnLowStock' as const, label: 'Low stock alert', desc: 'Get notified when a product falls below the threshold' },
              { key: 'notifyOnNewUser' as const, label: 'New user registered', desc: 'Get notified when someone creates an account' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-black">{label}</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">{desc}</p>
                </div>
                <Toggle
                  checked={!!form[key]}
                  onChange={v => set(key, v)}
                />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Admin Account ── */}
        <SectionCard title="Admin Account" icon={User}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Display Name">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  className={`${inputCls} pl-9`}
                  value={form.adminName ?? ''}
                  onChange={e => set('adminName', e.target.value)}
                  placeholder="Admin"
                />
              </div>
            </Field>
            <Field label="Admin Email">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  className={`${inputCls} pl-9`}
                  type="email"
                  value={form.adminEmail ?? ''}
                  onChange={e => set('adminEmail', e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>
            </Field>
          </div>
          <p className="text-[11px] text-gray-400 mt-3">
            These details are for display purposes only and don't change your login credentials.
          </p>
        </SectionCard>

        </div>{/* end right column */}

      </div>{/* end grid */}

        {/* last updated note */}
        {settings?.updatedAt && (
          <p className="text-[11px] text-gray-400 text-right px-1 mt-2">
            Last saved: {new Date(settings.updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        )}
    </div>
  );
}