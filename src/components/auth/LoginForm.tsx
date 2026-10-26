'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F4] flex flex-col justify-center items-center px-4 py-12">
      
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-medium text-black tracking-tight">
            Welcome Back
          </h1>
          <p className="text-[14px] text-gray-500 mt-1.5">
            Sign in to your account to continue
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[13px] text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email Field */}
          <div>
            <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-[0.1em] mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-[14px] text-black placeholder:text-gray-300 focus:outline-none focus:border-[#5433EB] transition-colors"
              placeholder="name@example.com"
            />
          </div>

          {/* Password Field with Forgot Password link */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-[0.1em]">
                Password
              </label>
              <Link 
                href="/auth/forgot-password" 
                className="text-[12px] font-medium text-[#5433EB] hover:text-[#4524DB] hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-[14px] text-black placeholder:text-gray-300 focus:outline-none focus:border-[#5433EB] transition-colors"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#5433EB] hover:bg-[#4524DB] text-white font-medium py-3.5 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-[14px]"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-[13px] text-gray-500 mt-8">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-[#5433EB] font-medium hover:underline transition-colors">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}