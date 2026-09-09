'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [memberId, setMemberId] = useState('EG/2021/8842');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await login(memberId, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Login failed. Please check your Member ID and Password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col justify-between selection:bg-[#b3d1fd] selection:text-[#3b5a7f]">
      <main className="w-full flex-1 flex flex-col justify-center">
        <div className="w-full min-h-[calc(100vh-64px)] flex flex-col lg:flex-row">
          
          {/* LEFT PANE: FinFlow Consistent System Description */}
          <div className="lg:w-5/12 xl:w-9/20 bg-[#0e1c2f] text-white flex flex-col justify-between p-6 md:p-10 lg:p-12 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-[#38BDF8]/10 blur-3xl pointer-events-none"></div>
            
            {/* Brand Header */}
            <div className="relative z-10 space-y-2">
              <span className="font-['Hanken_Grotesk'] text-3xl font-bold tracking-tight text-white block">
                Fin<span className="text-[#38BDF8]">Flow</span>
              </span>
              <span className="font-['JetBrains_Mono'] text-xs text-[#77849c] uppercase tracking-widest block">
                Society Accounting System
              </span>
            </div>

            {/* Consistent System Description */}
            <div className="relative z-10 my-12 space-y-4">
              <h2 className="font-['Hanken_Grotesk'] text-2xl font-bold text-white">
                Student Club Financial Management
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed max-w-md">
                Event-driven financial management and accounting for university student societies.
              </p>
            </div>

            {/* Footer */}
            <div className="relative z-10 pt-4 text-gray-400 font-['JetBrains_Mono'] text-[11px]">
              FinFlow System v1.0
            </div>
          </div>

          {/* RIGHT PANE: FinFlow Login Console */}
          <div className="lg:w-7/12 xl:w-11/20 bg-[#f8f9ff] flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-20 py-12">
            <div className="max-w-md w-full mx-auto space-y-6">
              
              {/* Login Header */}
              <div className="space-y-2">
                <h1 className="font-['Hanken_Grotesk'] text-3xl font-bold tracking-tight text-[#0b1c30]">
                  Sign in to FinFlow
                </h1>
                <p className="text-sm text-[#44474c]">
                  Access your society financial management portal and treasury workspace.
                </p>
              </div>

              {/* Error message banner if any */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  {errorMessage}
                </div>
              )}

              {/* Login Form (Member ID & Password) */}
              <form className="space-y-4" onSubmit={handleLogin}>
                {/* Student / Member ID */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#0b1c30]">
                    Student / Member ID
                  </label>
                  <input
                    type="text"
                    required
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    placeholder="e.g. EG/2021/8842"
                    className="w-full px-4 py-2.5 bg-white text-[#0b1c30] rounded border border-[#c5c6cd] text-sm shadow-sm focus:outline-none focus:border-[#426086] transition-colors"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#0b1c30]">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-4 pr-12 py-2.5 bg-white text-[#0b1c30] rounded border border-[#c5c6cd] text-sm shadow-sm focus:outline-none focus:border-[#426086] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#426086] hover:text-[#0b1c30]"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 rounded-lg bg-[#0e1c2f] text-white font-semibold text-sm shadow-md hover:bg-[#1a2d47] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  <span>{isLoading ? 'Authenticating...' : 'Sign In to FinFlow'}</span>
                </button>
              </form>

              {/* Registration Link */}
              <div className="p-4 rounded-lg bg-[#e5eeff] text-center space-y-1">
                <p className="text-xs text-[#44474c]">
                  New society member or committee appointee?
                </p>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0e1c2f] hover:text-[#426086] transition-colors"
                >
                  <span>Register a new account</span>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#eff4ff] border-t border-[#c5c6cd]/30 py-3">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs text-[#44474c]">
          <span>FinFlow — Society Accounting System</span>
        </div>
      </footer>
    </div>
  );
}



