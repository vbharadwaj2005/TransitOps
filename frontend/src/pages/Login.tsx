import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Sun, Moon, LogIn, Truck, UserCircle } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';

const SANDBOX_ACCOUNTS = [
  { label: 'Fleet Manager', email: 'manager@transitops.com', color: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/60 border-indigo-200 dark:border-indigo-700' },
  { label: 'Driver', email: 'driver@transitops.com', color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 border-emerald-200 dark:border-emerald-700' },
  { label: 'Safety Officer', email: 'safety@transitops.com', color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60 border-amber-200 dark:border-amber-700' },
  { label: 'Financial Analyst', email: 'analyst@transitops.com', color: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-900/60 border-cyan-200 dark:border-cyan-700' },
];

const PASSWORD = 'transitops123';

const Login = () => {
  const { login } = useContext(AuthContext);
  const { dark, toggle } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    if (!email || !password) { setError('Email and password required.'); setLoading(false); return; }
    try { await login(email, password); navigate('/'); }
    catch (err: any) { setError(err.response?.data?.message || 'Login failed.'); }
    finally { setLoading(false); }
  };

  const fillCredentials = (acctEmail: string) => {
    setEmail(acctEmail);
    setPassword(PASSWORD);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <button onClick={toggle} className="absolute top-4 right-4 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-lg">
        {dark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-lg mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Sign in to your TransitOps account</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl p-8">
          <ErrorMessage message={error} />
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" placeholder="manager@transitops.com" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" placeholder="transitops123" />
            </div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white transition-all disabled:opacity-50 cursor-pointer shadow-md">
              {loading ? <span className="animate-pulse">Signing in...</span> : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center mb-3 flex items-center justify-center gap-1.5"><UserCircle size={12} /> Sandbox Credentials</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {SANDBOX_ACCOUNTS.map(a => (
                <button key={a.email} type="button" onClick={() => fillCredentials(a.email)} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${email === a.email ? 'ring-2 ring-indigo-400 dark:ring-indigo-500 ring-offset-1 dark:ring-offset-slate-800' : ''} ${a.color}`}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-slate-500">
            Don't have an account? <Link to="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
