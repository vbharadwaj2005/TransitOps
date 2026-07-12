import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, Truck, AlertTriangle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, token } = useContext(AuthContext);
  const navigate = useNavigate();

  // If already logged in, redirect to Dashboard
  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!email || !password) {
      setError('Please fill in all fields.');
      setIsSubmitting(false);
      return;
    }

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  const fillCredentials = (userEmail) => {
    setEmail(userEmail);
    setPassword('transitops123');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-stretch rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white">
        {/* Left Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Truck size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">TransitOps</h2>
              <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">Operations Control</p>
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-2">Welcome Back</h3>
          <p className="text-sm text-slate-500 mb-6">Enter your credentials to access the controller dashboard.</p>

          {error && (
            <div className="flex items-center gap-2 mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              <AlertTriangle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@transitops.com"
                  className="block w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-950 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-950 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 px-4 text-sm font-semibold text-white shadow-md hover:shadow-indigo-600/10 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In to TransitOps'}
            </button>
          </form>
        </div>

        {/* Right Side: Demo Seed Credentials */}
        <div className="w-full md:w-1/2 p-8 md:p-12 border-t md:border-t-0 md:border-l border-slate-200 bg-slate-50 flex flex-col justify-center">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Sandbox Credentials</h4>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Role-Based Access Control is enforced. Click on any sandbox role below to auto-fill its credentials and explore its specific capabilities.
          </p>

          <div className="space-y-3">
            {[
              { role: 'Fleet Manager', email: 'manager@transitops.com', desc: 'Full access: CRUD assets, maintenance & dispatches.' },
              { role: 'Driver', email: 'driver@transitops.com', desc: 'Operational: View registry, log fuel & update trip statuses.' },
              { role: 'Safety Officer', email: 'safety@transitops.com', desc: 'Compliance: Monitor safety scores and track driver registry.' },
              { role: 'Financial Analyst', email: 'analyst@transitops.com', desc: 'Finance: Audit expense ledgers and extract dynamic reports.' }
            ].map((credential) => (
              <button
                key={credential.email}
                onClick={() => fillCredentials(credential.email)}
                className="w-full text-left p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-indigo-600 group-hover:text-indigo-500 transition-colors">
                    {credential.role}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 group-hover:text-slate-700 transition-colors">
                    Auto-Fill
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-800 truncate mb-1">{credential.email}</p>
                <p className="text-[10px] text-slate-500 group-hover:text-slate-600">{credential.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
