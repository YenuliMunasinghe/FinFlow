'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Role, useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function RegisterPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, register } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.COMMITTEE_MEMBER);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.push('/dashboard');
    }
  }, [isAuthLoading, user, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      error('Missing Fields', 'Please complete all required fields.');
      return;
    }
    setIsLoading(true);
    try {
      await register(name, email, password, memberId, role);
      success('Account Created', `Welcome ${name}!`);
      router.push('/dashboard');
    } catch (err: any) {
      error('Registration Failed', err?.message || 'Please verify your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Light-mode Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-blue-100/50 via-indigo-50/30 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-8 shadow-xl shadow-slate-200/70 space-y-6 relative z-10">
        <div className="text-center space-y-1">
          <Link href="/" className="inline-flex items-center">
            <span className="font-bold text-2xl text-slate-900 tracking-tight">
              Fin<span className="text-blue-600">Flow</span>
            </span>
          </Link>
          <h2 className="text-lg font-bold text-slate-900 mt-2">Create an Account</h2>
          <p className="text-xs text-slate-500">Register to manage society finances</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Kusal Mendis"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Member ID</label>
              <input
                type="text"
                required
                placeholder="e.g. EG/2024/9901"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                <option value={Role.PRESIDENT}>President</option>
                <option value={Role.TREASURER}>Treasurer</option>
                <option value={Role.COMMITTEE_MEMBER}>Member</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="member@finflow.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
