'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailForm() {
  const { verifyEmail, showToast } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [tokenInput, setTokenInput] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Auto verify if token is in query params
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setTokenInput(tokenParam);
      handleVerify(tokenParam);
    }
  }, [searchParams]);

  const handleVerify = async (tokenString = tokenInput) => {
    if (!tokenString) {
      showToast('Please enter a verification token', 'warning');
      return;
    }

    setVerifying(true);
    const result = await verifyEmail(tokenString);
    setVerifying(false);

    if (result.success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="w-full max-w-md glass-card p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
      
      <div className="text-center space-y-2">
        <div className="p-3 bg-indigo-600 rounded-2xl inline-block text-white mb-2">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Email Verification</h1>
        <p className="text-slate-400 text-xs">Verify your account to activate full library capabilities</p>
      </div>

      <div className="space-y-4 text-xs">
        <div className="space-y-1.5">
          <label className="text-slate-400 font-semibold">Paste Verification Token</label>
          <input
            type="text"
            required
            placeholder="Enter token logged in backend console"
            value={tokenInput}
            onChange={e => setTokenInput(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
          />
        </div>

        <button
          onClick={() => handleVerify()}
          disabled={verifying}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 text-xs"
        >
          <span>{verifying ? 'Verifying...' : 'Verify Token'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-slate-900/80 border border-white/5 rounded-2xl p-4 text-[10px] text-slate-400 leading-relaxed">
        <p className="font-bold text-white mb-1">💡 Sandbox Instruction:</p>
        <p>When you register, check the **backend console terminal** logs. The email verification token is printed there. Copy and paste it above to verify.</p>
      </div>

      <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/5">
        Back to{' '}
        <Link href="/login" className="text-indigo-400 font-bold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <Suspense fallback={
        <div className="text-center text-slate-400 text-xs">Loading email verifier...</div>
      }>
        <VerifyEmailForm />
      </Suspense>

    </div>
  );
}
