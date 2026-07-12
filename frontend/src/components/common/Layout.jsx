import React, { useContext, useState } from 'react';
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
  Search,
  Mail,
  Bell
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const Layout = ({ children, actions }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'] },
    { name: 'Vehicles', path: '/vehicles', icon: Truck, roles: ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'] },
    { name: 'Drivers', path: '/drivers', icon: Users, roles: ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'] },
    { name: 'Trip Planner', path: '/trips', icon: Map, roles: ['Fleet Manager', 'Driver'] },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'] },
    { name: 'Fuel & Expenses', path: '/expenses', icon: DollarSign, roles: ['Fleet Manager', 'Driver', 'Financial Analyst'] },
    { name: 'Reports & Analytics', path: '/analytics', icon: BarChart3, roles: ['Fleet Manager', 'Safety Officer', 'Financial Analyst'] }
  ];

  const filteredNavItems = navItems.filter((item) =>
    user && item.roles.includes(user.role)
  );

  const getPageInfo = (path) => {
    switch (path) {
      case '/': return { title: 'Dashboard', desc: 'Overview of your fleet operations.' };
      case '/vehicles': return { title: 'Vehicles', desc: 'Manage and monitor your fleet assets.' };
      case '/drivers': return { title: 'Drivers', desc: 'Track driver performance and status.' };
      case '/trips': return { title: 'Trip Planner', desc: 'Schedule and dispatch routes.' };
      case '/maintenance': return { title: 'Maintenance', desc: 'Service logs and repair schedules.' };
      case '/expenses': return { title: 'Fuel & Expenses', desc: 'Cost tracking and analytics.' };
      case '/analytics': return { title: 'Reports & Analytics', desc: 'In-depth metrics and reporting.' };
      default: return { title: 'Dashboard', desc: 'Overview of your fleet operations.' };
    }
  };

  const { title, desc: description } = getPageInfo(location.pathname);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 w-64 bg-card border-r border-border p-4 h-screen overflow-y-auto hidden lg:block z-20">
        <div className="flex items-center gap-2 mb-6 group cursor-pointer">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center transition-transform group-hover:scale-110 duration-300 relative">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground absolute" style={{ top: "30%", left: "30%" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground absolute" style={{ top: "30%", right: "30%" }} />
              <div className="w-3 h-1.5 border-b-2 border-primary-foreground rounded-full absolute bottom-2.5" />
            </div>
            <span className="text-lg font-semibold text-foreground">TransitOps</span>
          </Link>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wider">Menu</p>
            <nav className="space-y-0.5">
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      hoveredItem === item.name && !isActive && "translate-x-1"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wider">General</p>
            <nav className="space-y-0.5">
              <button
                onClick={handleLogout}
                onMouseEnter={() => setHoveredItem("Logout")}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-300 text-muted-foreground hover:bg-secondary hover:text-destructive",
                  hoveredItem === "Logout" && "translate-x-1"
                )}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-0 lg:ml-64 overflow-hidden relative">
        <header className="space-y-3 md:space-y-4 animate-slide-in-up p-4 md:p-8 pb-0 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search dashboard..."
                  className="pl-9 pr-3 md:pr-16 h-9 text-sm bg-card border-border transition-all duration-300 focus:shadow-lg focus:shadow-primary/10"
                />
                <kbd className="hidden md:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground bg-muted rounded border border-border">
                  ⌘F
                </kbd>
              </div>
            </div>

            <div className="flex items-center gap-1.5 md:gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-secondary transition-all duration-300 hover:scale-110 h-8 w-8"
              >
                <Mail className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-secondary transition-all duration-300 hover:scale-110 h-8 w-8"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full animate-pulse" />
              </Button>

              <div className="flex items-center gap-2 pl-2 md:pl-3 border-l border-border">
                <Avatar className="w-7 h-7 md:w-8 md:h-8 ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/40">
                  <AvatarFallback className="text-xs uppercase bg-primary text-primary-foreground font-bold">
                    {user?.email?.substring(0, 2) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs hidden sm:block">
                  <p className="font-semibold text-foreground">{user?.email?.split('@')[0] || 'User'}</p>
                  <p className="text-muted-foreground text-[10px] uppercase font-bold">{user?.role || 'Guest'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1">{title}</h1>
              <p className="text-xs md:text-sm text-muted-foreground">{description}</p>
            </div>
            {actions && <div className="flex flex-col sm:flex-row gap-2">{actions}</div>}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 animate-fade-in relative z-0">
          <div className="max-w-7xl mx-auto w-full pb-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
