'use client';

import { useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/browser';

export default function SignInPage() {
  const [email, setEmail] = useState('acummings@apu.edu');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setStatus('error');
      setError(error.message);
      return;
    }
    setStatus('sent');
  }

  return (
    <div className="pt-16">
      <h1 className="mb-2 text-3xl font-black tracking-tight">
        <span className="text-bone">ROLL</span>
        <span className="text-neon"> & </span>
        <span className="text-bone">IRON</span>
      </h1>
      <p className="mb-10 text-sm text-mute">Sign in to log your camp.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            disabled={status === 'sending' || status === 'sent'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={status === 'sending' || status === 'sent'}
        >
          {status === 'sending' ? 'Sending…' :
           status === 'sent'    ? 'Check your email' :
                                  'Send magic link'}
        </button>

        {status === 'sent' && (
          <p className="rounded-md border border-ink-700 bg-ink-900 p-3 text-xs text-mute">
            We sent a sign-in link to <span className="text-bone">{email}</span>.
            Open it on this device.
          </p>
        )}

        {error && (
          <p className="rounded-md border border-neon bg-neon/10 p-3 text-xs text-neon">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
