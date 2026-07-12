import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Truck,
  Users,
  Map,
  Wrench,
  DollarSign,
  BarChart3,
  LogOut,
  User as UserIcon
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: <LayoutDashboard size={20} />,
      roles: ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst']
    },
    {
      name: 'Vehicles',
      path: '/vehicles',
      icon: <Truck size={20} />,
      roles: ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst']
    },
    {
      name: 'Drivers',
      path: '/drivers',
      icon: <Users size={20} />,
      roles: ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst']
    },
    {
      name: 'Trip Planner',
      path: '/trips',
      icon: <Map size={20} />,
      roles: ['Fleet Manager', 'Driver']
    },
    {
      name: 'Maintenance',
      path: '/maintenance',
      icon: <Wrench size={20} />,
      roles: ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst']
    },
    {
      name: 'Fuel & Expenses',
      path: '/expenses',
      icon: <DollarSign size={20} />,
      roles: ['Fleet Manager', 'Driver', 'Financial Analyst']
    },
    {
      name: 'Reports & Analytics',
      path: '/analytics',
      icon: <BarChart3 size={20} />,
      roles: ['Fleet Manager', 'Safety Officer', 'Financial Analyst']
    }
  ];

  const filteredNavItems = navItems.filter((item) =>
    user && item.roles.includes(user.role)
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col justify-between border-r border-slate-800 bg-slate-900 px-4 py-6">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Truck size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                TransitOps
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Fleet Controller
              </p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          {user && (
            <div className="flex items-center gap-3 px-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 border border-slate-700">
                <UserIcon size={18} className="text-slate-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate text-slate-200">
                  {user.email.split('@')[0]}
                </p>
                <p className="text-xs text-indigo-400 font-medium truncate">
                  {user.role}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              System Live
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-500">Current Session</p>
              <p className="text-xs font-semibold text-slate-700">{user?.email}</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
