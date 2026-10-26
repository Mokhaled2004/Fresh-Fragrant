'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      // Automatically log in after successful signup
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        router.push('/auth/login');
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--theme-bgElevated)] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-[var(--theme-bgElevated)] border border-[var(--theme-bgElevated)] rounded-2xl p-8 shadow-2xl">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-16 h-16 mb-3">
            <Image
              src="/images/logo.png"
              alt="Nike Logo"
              fill
              className="object-contain invert brightness-200"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Create Account</h1>
          <p className="text-sm text-[var(--theme-muted)] mt-1">Join the ultimate collection</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)]/30 text-[var(--theme-accent)] text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--theme-muted)] uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[var(--theme-bgElevated)] border border-[var(--theme-bgElevated)] rounded-xl px-4 py-3 text-foreground placeholder-[var(--theme-mutedStrong)] focus:outline-none focus:border-[var(--theme-accent)] transition-colors text-sm"
              placeholder="Mohamed Khaled"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--theme-muted)] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--theme-bgElevated)] border border-[var(--theme-bgElevated)] rounded-xl px-4 py-3 text-foreground placeholder-[var(--theme-mutedStrong)] focus:outline-none focus:border-[var(--theme-accent)] transition-colors text-sm"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--theme-muted)] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--theme-bgElevated)] border border-[var(--theme-bgElevated)] rounded-xl px-4 py-3 text-foreground placeholder-[var(--theme-mutedStrong)] focus:outline-none focus:border-[var(--theme-accent)] transition-colors text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[var(--theme-accent)] hover:bg-[var(--theme-accentHover)] text-[var(--theme-accentText)] font-medium py-3 rounded-xl transition-all duration-200 shadow-lg shadow-[var(--theme-accent)]/20 disabled:opacity-50 text-sm"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--theme-muted)] mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-foreground font-medium hover:text-[var(--theme-accent)] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
