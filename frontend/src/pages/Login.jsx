import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, Truck, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

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
    <div className="flex min-h-screen bg-background">
      {/* Left Side: Branded Split */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 relative overflow-hidden flex-col justify-between p-12">
        {/* Abstract background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-primary/10 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xl shadow-primary/20">
            <Truck size={26} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">TransitOps</h2>
            <p className="text-xs text-primary/80 font-bold uppercase tracking-[0.15em]">Operations Control</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-6">
            Logistics management, <span className="text-primary">elevated.</span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            Experience real-time fleet tracking, intelligent dispatching, and predictive maintenance in one unified controller.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-zinc-300 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
              <Activity className="text-emerald-400" size={24} />
              <span className="font-medium">99.9% System Uptime</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-300 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
              <ShieldCheck className="text-primary" size={24} />
              <span className="font-medium">Enterprise-grade Security</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Truck size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">TransitOps</h2>
              <p className="text-[10px] text-primary font-bold uppercase tracking-[0.15em]">Control</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h3>
            <p className="text-muted-foreground">Sign in to your controller dashboard.</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
              <AlertTriangle size={18} className="flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <Card className="p-8 mb-8 border-border shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
                    <Mail size={18} />
                  </div>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="manager@transitops.com"
                    className="pl-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
                    <Lock size={18} />
                  </div>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-11"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 mt-2 text-sm font-bold shadow-md shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In'}
              </Button>
            </form>
          </Card>

          {/* Sandbox Credentials */}
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="flex-1 h-px bg-border"></span>
              Sandbox Credentials
              <span className="flex-1 h-px bg-border"></span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { role: 'Manager', email: 'manager@transitops.com' },
                { role: 'Driver', email: 'driver@transitops.com' },
                { role: 'Safety', email: 'safety@transitops.com' },
                { role: 'Analyst', email: 'analyst@transitops.com' }
              ].map((credential) => (
                <button
                  key={credential.email}
                  onClick={() => fillCredentials(credential.email)}
                  type="button"
                  className="text-left p-3 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    {credential.role}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate mt-0.5">{credential.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
