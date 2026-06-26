'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, BookOpen } from 'lucide-react';

export default function LoginPage() {
  const { login, showToast } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      // Fetch user role and redirect accordingly
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (savedUser && savedUser.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
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
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Welcome Back</h1>
          <p className="text-slate-400 text-xs">Enter credentials to access your study portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="student@thestudypointlibrary.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-slate-400 font-semibold">Password</label>
              <Link href="/forgot-password" className="text-indigo-400 hover:underline text-[10px]">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 text-xs"
          >
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/5">
          Don't have an account?{' '}
          <Link href="/register" className="text-indigo-400 font-bold hover:underline">
            Sign Up
          </Link>
        </div>

        {/* Mock testing credentials helper */}
        <div className="bg-slate-900/80 border border-white/5 rounded-2xl p-4 text-[10px] text-slate-400 space-y-1 leading-relaxed">
          <p className="font-bold text-white mb-1">🔑 Sandbox Testing Credentials:</p>
          <p>• Student: <span className="text-indigo-300 select-all">student@thestudypointlibrary.com</span> (pwd: <span className="text-slate-200">studentpassword</span>)</p>
          <p>• Admin: <span className="text-indigo-300 select-all">admin@thestudypointlibrary.com</span> (pwd: <span className="text-slate-200">adminpassword</span>)</p>
        </div>

      </div>
    </div>
  );
}
