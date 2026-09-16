'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, login } = useAuth();
  const { success, error } = useToast();

  const [memberId, setMemberId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.push('/dashboard');
    }
  }, [isAuthLoading, user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId.trim() || !password) {
      error('Missing Credentials', 'Please enter your Member ID/Email and password.');
      return;
    }
    setIsLoading(true);
    try {
      await login(memberId, password);
      success('Welcome back!', 'Signed into FinFlow.');
      router.push('/dashboard');
    } catch (err: any) {
      error('Login Failed', err?.message || 'Invalid Member ID / Email or Password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Light-mode Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-blue-100/50 via-indigo-50/30 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-8 shadow-xl shadow-slate-200/70 space-y-6 relative z-10">
        {/* Brand */}
        <div className="text-center space-y-1">
          <Link href="/" className="inline-flex items-center">
            <span className="font-bold text-2xl text-slate-900 tracking-tight">
              Fin<span className="text-blue-600">Flow</span>
            </span>
          </Link>
          <p className="text-xs text-slate-500 mt-1">Sign in to your society financial workspace</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Member ID / Email
            </label>
            <input
              type="text"
              required
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="e.g. EG/2021/8842 or member@finflow.org"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          New member?{' '}
          <Link href="/register" className="font-semibold text-blue-600 hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
