'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Role, useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>(Role.COMMITTEE_MEMBER);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match!');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await register(fullName, email, password, studentId, selectedRole);
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Registration failed. Please check your details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col justify-between selection:bg-[#b3d1fd] selection:text-[#3b5a7f]">
      <main className="w-full flex-1 flex flex-col justify-center py-10">
        <div className="w-full max-w-2xl mx-auto px-6">
          
          {/* Header Contextual Bar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex flex-col">
              <span className="font-['Hanken_Grotesk'] text-2xl font-bold tracking-tight text-[#0b1c30]">
                Fin<span className="text-[#38BDF8]">Flow</span>
              </span>
              <span className="font-['JetBrains_Mono'] text-xs text-[#44474c] uppercase tracking-wider">
                Society Accounting System
              </span>
            </div>
            <Link
              href="/login"
              className="text-xs font-semibold text-[#0b1c30] hover:text-[#426086] transition-colors"
            >
              Back to Login
            </Link>
          </div>

          {/* Registration Form Card */}
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-[#c5c6cd]/30 space-y-6">
            <div>
              <h1 className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30]">
                Register Student Account
              </h1>
              <p className="text-xs text-[#44474c] mt-1">
                Create an account to manage student society finances and events.
              </p>
            </div>

            {/* Error message banner if any */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {errorMessage}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleRegister}>
              {/* Personal Details */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#0b1c30]">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Kusal Mendis"
                    className="w-full h-10 px-4 rounded-lg bg-[#f8f9ff] border border-[#c5c6cd] text-sm text-[#0b1c30] focus:outline-none focus:border-[#426086]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#0b1c30]">Student / Member ID</label>
                    <input
                      type="text"
                      required
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. EG/2021/8842"
                      className="w-full h-10 px-4 rounded-lg bg-[#f8f9ff] border border-[#c5c6cd] text-sm text-[#0b1c30] focus:outline-none focus:border-[#426086]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#0b1c30]">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@finflow.org"
                      className="w-full h-10 px-4 rounded-lg bg-[#f8f9ff] border border-[#c5c6cd] text-sm text-[#0b1c30] focus:outline-none focus:border-[#426086]"
                    />
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#44474c]">
                  Select Your Society Role
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[Role.PRESIDENT, Role.TREASURER, Role.COMMITTEE_MEMBER].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`p-3 rounded-lg text-left transition-all border ${
                        selectedRole === role
                          ? 'bg-[#e5eeff] border-[#0e1c2f] ring-2 ring-[#0e1c2f]'
                          : 'bg-[#eff4ff] border-transparent hover:bg-[#e5eeff]/60'
                      }`}
                    >
                      <span className="font-bold text-xs block text-[#0b1c30] capitalize">
                        {role.toLowerCase().replace('_', ' ')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#0b1c30]">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full h-10 px-4 rounded-lg bg-[#f8f9ff] border border-[#c5c6cd] text-sm text-[#0b1c30] focus:outline-none focus:border-[#426086]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#0b1c30]">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full h-10 px-4 rounded-lg bg-[#f8f9ff] border border-[#c5c6cd] text-sm text-[#0b1c30] focus:outline-none focus:border-[#426086]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-lg bg-[#0e1c2f] text-white font-semibold text-sm shadow-md hover:bg-[#1a2d47] transition-all disabled:opacity-70"
              >
                {isLoading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </form>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#eff4ff] border-t border-[#c5c6cd]/30 py-3">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs text-[#44474c]">
          <span>FinFlow — Student Society Accounting System</span>
          <span className="font-['JetBrains_Mono'] text-[11px]">Role-Based Access Control</span>
        </div>
      </footer>
    </div>
  );
}

