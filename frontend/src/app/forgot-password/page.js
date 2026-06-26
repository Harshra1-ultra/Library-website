'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { KeyRound, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const { forgotPassword, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tokenSimulated, setTokenSimulated] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email', 'warning');
      return;
    }

    setSubmitting(true);
    const result = await forgotPassword(email);
    setSubmitting(false);

    if (result.success) {
      setTokenSimulated(true);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetToken || !newPassword) {
      showToast('Reset Token and New Password are required', 'warning');
      return;
    }

    setResetting(true);
    try {
      const { API_URL } = useApp();
      const res = await fetch(`http://localhost:5000/api/auth/reset-password/${resetToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Password reset successful! Logging you in...', 'success');
        setTokenSimulated(false);
        setEmail('');
        setResetToken('');
        setNewPassword('');
      } else {
        showToast(data.message || 'Reset failed', 'error');
      }
    } catch (err) {
      showToast('Network error during reset', 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-card p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="p-3 bg-indigo-600 rounded-2xl inline-block text-white mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Reset Password</h1>
          <p className="text-slate-400 text-xs">Recover your credentials using email token simulation</p>
        </div>

        {!tokenSimulated ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-400 font-semibold">Your Registered Email</label>
              <input
                type="email"
                required
                placeholder="Enter email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 text-xs"
            >
              <span>{submitting ? 'Sending Request...' : 'Send Reset Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-400 font-semibold">Reset Token</label>
              <input
                type="text"
                required
                placeholder="Paste reset token printed in console"
                value={resetToken}
                onChange={e => setResetToken(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-semibold">New Password</label>
              <input
                type="password"
                required
                placeholder="Enter new password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={resetting}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 text-xs"
            >
              <span>{resetting ? 'Resetting...' : 'Change Password'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="bg-slate-900/80 border border-white/5 rounded-2xl p-4 text-[10px] text-slate-400 leading-relaxed">
          <p className="font-bold text-white mb-1">💡 Password Recovery Instructions:</p>
          <p>1. Enter your registered email and click "Send Reset Link".</p>
          <p>2. Go to the **backend console terminal** logs to copy the reset token.</p>
          <p>3. Paste the token above, type your new password, and click change.</p>
        </div>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/5">
          Back to{' '}
          <Link href="/login" className="text-indigo-400 font-bold hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
