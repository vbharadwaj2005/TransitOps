import { useState, useEffect, useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import api from '../services/api';
import {
  LayoutDashboard, Truck, Users, Route, Wrench, DollarSign, BarChart3, CalendarDays,
  Trophy, FileText, Bell, LogOut, Menu, X, Sun, Moon, Circle
} from 'lucide-react';

interface Alert { id: number; title: string; message: string; level: string; is_read: boolean; created_at: string; }

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vehicles', label: 'Vehicles', icon: Truck },
  { to: '/drivers', label: 'Drivers', icon: Users },
  { to: '/trips', label: 'Trips', icon: Route },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/expenses', label: 'Expenses', icon: DollarSign },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/driver-performance', label: 'Driver Perf.', icon: Trophy },
  { to: '/trip-templates', label: 'Templates', icon: FileText },
  { to: '/notifications', label: 'Alerts', icon: Bell },
];

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const { dark, toggle } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (user) { api.get('/alerts').then(r => setAlerts(r.data.data || r.data || [])).catch(() => {}); }
  }, [user]);

  const unread = alerts.filter(a => !a.is_read).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">TransitOps</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600 cursor-pointer"><X size={20} /></button>
        </div>
        <nav className="p-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-5rem)]">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 dark:text-slate-400 cursor-pointer"><Menu size={22} /></button>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <div className="relative">
                <button onClick={() => setBellOpen(!bellOpen)} className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                  <Bell size={20} />
                  {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>}
                </button>
                {bellOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800 dark:text-white">Notifications</span>
                      <button onClick={() => navigate('/notifications')} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">View All</button>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {alerts.length === 0 ? <div className="px-4 py-8 text-center text-xs text-slate-400 italic">No alerts</div> :
                        alerts.slice(0, 5).map(a => (
                          <div key={a.id} className={`px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors ${!a.is_read ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`} onClick={() => { setBellOpen(false); navigate('/notifications'); }}>
                            <div className="flex items-center gap-2">
                              {!a.is_read && <Circle className="w-1.5 h-1.5 fill-indigo-600 text-indigo-600 shrink-0" />}
                              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{a.title || a.message}</p>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 truncate">{a.message}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={toggle} className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer" title={dark ? 'Light mode' : 'Dark mode'}>
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className="flex items-center gap-2 ml-2 pl-3 border-l border-slate-200 dark:border-slate-700">
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">{user?.email?.charAt(0).toUpperCase() || 'U'}</div>
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{user?.email?.split('@')[0] || 'User'}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">{user?.role || '-'}</p>
                </div>
                <button onClick={() => { logout(); navigate('/login'); }} className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer" title="Logout"><LogOut size={16} /></button>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
