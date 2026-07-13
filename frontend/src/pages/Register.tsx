import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, Truck } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Driver');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    if (!email || !password) { setError('Email and password required.'); setLoading(false); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
    try { await register(email, password, role); setSuccess('Registration successful! Redirecting...'); setTimeout(() => navigate('/login'), 1500); }
    catch (err: any) { setError(err.response?.data?.message || 'Registration failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-lg mb-4"><Truck className="w-8 h-8 text-white" /></div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Join the TransitOps platform</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl p-8">
          <ErrorMessage message={error} /><SuccessMessage message={success} />
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div><label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" placeholder="you@example.com" /></div>
            <div><label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" placeholder="Min 6 characters" /></div>
            <div><label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">Role</label><select value={role} onChange={e => setRole(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"><option value="Fleet Manager">Fleet Manager</option><option value="Driver">Driver</option><option value="Safety Officer">Safety Officer</option><option value="Financial Analyst">Financial Analyst</option></select></div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white transition-all disabled:opacity-50 cursor-pointer shadow-md">{loading ? <span className="animate-pulse">Registering...</span> : <><UserPlus size={18} /> Register</>}</button>
          </form>
          <p className="mt-6 text-center text-xs text-slate-500">Already have an account? <Link to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
