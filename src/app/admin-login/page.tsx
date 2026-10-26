'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate admin');
      }

      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F4] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      
      {/* Back to Storefront Link */}
      <div className="absolute top-8 left-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-500 hover:text-[#5433EB] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Storefront
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md">
        
        {/* Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 sm:p-10 shadow-xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-[#F3F0FF] flex items-center justify-center mx-auto mb-5">
              <ShieldCheck className="w-7 h-7 text-[#5433EB]" />
            </div>
            <h1 className="text-[26px] font-medium text-black tracking-tight">
              Admin Portal
            </h1>
            <p className="text-[13px] text-gray-500 mt-2">
              Restricted access — authorized personnel only
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[13px] text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-[0.1em] mb-2">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-[14px] text-black placeholder:text-gray-300 focus:outline-none focus:border-[#5433EB] transition-colors"
                placeholder="admin@freshandfragrant.com"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-[0.1em] mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-[14px] text-black placeholder:text-gray-300 focus:outline-none focus:border-[#5433EB] transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-[#5433EB] hover:bg-[#4524DB] text-white font-medium py-3.5 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-[14px]"
            >
              <Lock className="w-4 h-4" />
              {loading ? 'Authenticating...' : 'Access Dashboard'}
            </button>
          </form>

        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-400 mt-6">
          This is a restricted area. All access attempts are logged.
        </p>

      </div>
    </div>
  );
}