import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, UserPlus, Truck, Eye, EyeOff } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { inputClass, primaryButtonClass } from '../utils/helpers';

const ROLES = ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'] as const;

const ROLE_DESCRIPTIONS: Record<string, string> = {
  'Fleet Manager': 'Full CRUD across all assets, maintenance, trips, and reports.',
  'Driver': 'View assets, log fuel, update trip statuses.',
  'Safety Officer': 'Monitor safety scores, manage driver registry, view reports.',
  'Financial Analyst': 'Audit expenses, manage ledgers, extract reports.',
};

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  if (token) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || !confirmPassword || !role) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Registration failed.');
      } else {
        setSuccess(`Account created for ${email} as ${role}. You can now sign in.`);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-stretch rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white">
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <UserPlus size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">TransitOps</h2>
              <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">Operations Control</p>
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Create Account</h3>
          <p className="text-sm text-slate-500 mb-6">Fill in your details to get started with role-based access.</p>

          <ErrorMessage message={error} />
          <SuccessMessage message={success} />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inputClass(true)} required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" className="block w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-11 text-sm text-slate-950 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className={inputClass(true)} required />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className={primaryButtonClass(true)}>
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-xs text-slate-500 text-center mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-semibold">Sign in</Link>
          </p>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12 border-t md:border-t-0 md:border-l border-slate-200 bg-slate-50 flex flex-col justify-center">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Choose Your Role</h4>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">Role-Based Access Control is enforced. Select the role that matches your responsibilities in the fleet operations workflow.</p>
          <div className="space-y-3">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`w-full text-left p-4 rounded-xl border transition-all group cursor-pointer ${
                  role === r
                    ? 'bg-white border-indigo-300 shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${role === r ? 'text-indigo-600' : 'text-indigo-600 group-hover:text-indigo-500'} transition-colors`}>{r}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded transition-colors ${role === r ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500 group-hover:text-slate-700'}`}>{role === r ? 'Selected' : 'Select'}</span>
                </div>
                <p className="text-[10px] text-slate-500 group-hover:text-slate-600">{ROLE_DESCRIPTIONS[r]}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
