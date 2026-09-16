'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, Role } from '@/context/AuthContext';
import { Eye, EyeOff, ShieldCheck, Wallet, UserCheck } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchDemoRole } = useAuth();
  const { success, error } = useToast();

  const [memberId, setMemberId] = useState('EG/2021/8842');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(memberId, password);
      success('Welcome back!', 'Signed into FinFlow.');
      router.push('/dashboard');
    } catch {
      error('Login Failed', 'Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickRole = (role: Role, defaultId: string) => {
    setMemberId(defaultId);
    switchDemoRole(role);
    success('Signed in', `Authenticated as ${role.replace('_', ' ')}.`);
    router.push('/dashboard');
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

        {/* 1-Click Test Sign-ins */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block text-center">
            Quick Test Login:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickRole(Role.PRESIDENT, 'EG/2021/8842')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-center transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <div className="font-bold text-[11px] text-slate-900">President</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickRole(Role.TREASURER, 'TR/2022/1042')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-center transition-colors"
            >
              <Wallet className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <div className="font-bold text-[11px] text-slate-900">Treasurer</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickRole(Role.COMMITTEE_MEMBER, 'MEM/2023/5021')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-center transition-colors"
            >
              <UserCheck className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              <div className="font-bold text-[11px] text-slate-900">Member</div>
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <hr className="w-full border-slate-200" />
          <span className="absolute bg-white px-3 text-[11px] text-slate-400 font-medium">or</span>
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
