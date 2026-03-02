'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, Mail, Lock, LogIn, AlertCircle, Users } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Care Provider System</h1>
          <p className="text-blue-100 text-sm">Secure Manager Dashboard</p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {loading ? (
                <>
                  <Activity className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Test Accounts Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Users className="w-4 h-4 text-gray-400" />
              <p className="text-sm font-semibold text-gray-600">Test Accounts</p>
            </div>
            <div className="space-y-2">
              {/* Landlord Account - Highest privilege */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-transparent rounded-lg border-2 border-red-200 shadow-sm">
                <div>
                  <p className="text-xs font-bold text-gray-800 flex items-center">
                    Landlord
                    <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-semibold">SUPER ADMIN</span>
                  </p>
                  <p className="text-xs text-gray-500 font-medium">landlord@careservice.com</p>
                </div>
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold">
                  landlord123
                </span>
              </div>

              {/* Admin Account */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg border border-blue-100">
                <div>
                  <p className="text-xs font-semibold text-gray-700">Admin</p>
                  <p className="text-xs text-gray-500">admin@careservice.com</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                  admin123
                </span>
              </div>
              
              {/* Manager Account */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-lg border border-purple-100">
                <div>
                  <p className="text-xs font-semibold text-gray-700">Manager</p>
                  <p className="text-xs text-gray-500">manager@careservice.com</p>
                </div>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                  manager123
                </span>
              </div>

              {/* DSP Account */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-transparent rounded-lg border border-green-100">
                <div>
                  <p className="text-xs font-semibold text-gray-700">DSP</p>
                  <p className="text-xs text-gray-500">dsp@careservice.com</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                  dsp123
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
