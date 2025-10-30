
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoaderCircle } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: loginError } = await login(email, password);

    if (loginError) {
      setError(loginError.message || 'Invalid email or password.');
    } else {
      setError('');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10 space-y-8">
        <div className="text-center">
            <svg className="h-12 w-auto text-zankli-orange-600 mx-auto" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z" />
            </svg>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Zankli Medical Centre</h1>
          <p className="text-gray-500">Performance Appraisal System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zankli-orange-500 focus:border-transparent sm:text-sm"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zankli-orange-500 focus:border-transparent sm:text-sm"
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-zankli-orange-600 hover:bg-zankli-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zankli-orange-500 transition-all duration-300 transform hover:scale-105 disabled:bg-zankli-orange-400 disabled:cursor-not-allowed"
          >
            {loading && <LoaderCircle className="h-5 w-5 animate-spin"/>}
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;