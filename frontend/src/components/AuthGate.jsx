import React, { useState } from 'react';
import { LogIn, UserPlus, Recycle, Lock, Mail, User, ShieldAlert, AlertCircle } from 'lucide-react';

function AuthGate({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onAuthSuccess(data.token, data.user);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = () => {
    setEmail('guardian@ecolocate.org');
    setPassword('password123');
    setIsLogin(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg transition duration-200">
        
        {/* Header Logo */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-100 dark:bg-primary-950/40 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400">
            <Recycle className="h-7 w-7 animate-pulse-slow" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {isLogin ? 'Sign in to EcoLocate' : 'Create an Account'}
          </h2>
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            Join our green community and track your carbon recycling points.
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 text-xs p-3.5 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-4 text-xs font-semibold" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label className="block text-gray-400 uppercase mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-450" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-gray-400 uppercase mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-455" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 uppercase mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-455" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3.5 rounded-xl text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-1.5 mt-6"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            ) : isLogin ? (
              <>
                <LogIn className="h-4 w-4" /> Sign In
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" /> Register Account
              </>
            )}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-[10px] uppercase font-bold tracking-wider">Or</span>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
        </div>

        {/* Alternate login toggle */}
        <div className="text-center flex flex-col gap-3 text-xs">
          <button
            onClick={() => setIsLogin(prev => !prev)}
            className="text-primary-600 dark:text-primary-400 font-bold hover:underline"
          >
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
          </button>

          {/* Quick Demo seeder button */}
          <button
            onClick={handleQuickLogin}
            className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 font-bold py-2 rounded-xl border border-gray-200 dark:border-gray-700/60 flex items-center justify-center gap-1"
          >
            ⚡ Quick-fill Demo Admin credentials
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthGate;
