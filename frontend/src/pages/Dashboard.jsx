import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  Truck,
  Users,
  Map,
  Wrench,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [kpis, setKpis] = useState({
    active_vehicles: 0,
    available_vehicles: 0,
    in_shop_vehicles: 0,
    retired_vehicles: 0,
    active_trips: 0,
    pending_trips: 0,
    drivers_on_duty: 0,
    fleet_utilization: 0
  });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const kpiRes = await api.get('/analytics/dashboard');
      setKpis(kpiRes.data);

      const vehicleRes = await api.get('/vehicles');
      setVehicles(vehicleRes.data);
    } catch (err) {
      setError('Failed to fetch dashboard data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Recharts Chart Data
  const chartData = [
    { name: 'Available', value: kpis.available_vehicles, color: '#10b981' },
    { name: 'On Trip', value: kpis.active_vehicles, color: '#6366f1' },
    { name: 'In Shop', value: kpis.in_shop_vehicles, color: '#f59e0b' },
    { name: 'Retired', value: kpis.retired_vehicles, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // Mock bar chart data for 'Trips this week'
  const weeklyData = [
    { day: "S", value: 12, label: "Sunday" },
    { day: "M", value: 45, label: "Monday" },
    { day: "T", value: 38, label: "Tuesday" },
    { day: "W", value: 52, label: "Wednesday" },
    { day: "T", value: 40, label: "Thursday" },
    { day: "F", value: 65, label: "Friday" },
    { day: "S", value: 25, label: "Saturday" },
  ];
  const barColors = ["#6366f1", "#4f46e5", "#4338ca", "#3730a3", "#6366f1", "#4f46e5", "#4338ca"];

  const stats = [
    {
      title: "Fleet Utilization",
      value: `${kpis.fleet_utilization}%`,
      subtitle: "Optimal",
      bgColor: "bg-primary",
      textColor: "text-primary-foreground",
      delay: "0ms",
      icon: TrendingUp
    },
    {
      title: "Active Vehicles",
      value: kpis.active_vehicles,
      subtitle: "On trip",
      bgColor: "bg-card",
      textColor: "text-foreground",
      delay: "100ms",
      icon: Truck
    },
    {
      title: "Drivers On Duty",
      value: kpis.drivers_on_duty,
      subtitle: "Active",
      bgColor: "bg-card",
      textColor: "text-foreground",
      delay: "200ms",
      icon: Users
    },
    {
      title: "In Shop (Maint.)",
      value: kpis.in_shop_vehicles,
      subtitle: "Repairing",
      bgColor: "bg-card",
      textColor: "text-foreground",
      delay: "300ms",
      icon: Wrench
    },
  ];

  if (loading && !vehicles.length) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-96 bg-muted rounded-xl"></div>
          <div className="h-96 bg-muted rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Action Row */}
      <div className="flex justify-end mb-4">
        <Button
          onClick={fetchData}
          variant="outline"
          className="h-9 text-sm transition-all duration-300 hover:shadow-md hover:scale-105 bg-transparent"
        >
          <RotateCcw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh Stats
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards (StatsCards style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <Card
            key={stat.title}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ animationDelay: stat.delay }}
            className={`${stat.bgColor} ${stat.textColor} p-4 transition-all duration-500 ease-out animate-slide-in-up cursor-pointer ${
              hoveredCard === index ? "scale-105 shadow-2xl" : "shadow-lg"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xs font-medium opacity-90">{stat.title}</h3>
              <div
                className={`w-6 h-6 rounded-full ${
                  stat.bgColor === "bg-primary" ? "bg-primary-foreground/20" : "bg-primary"
                } flex items-center justify-center transition-transform duration-300 ${
                  hoveredCard === index ? "rotate-45" : ""
                }`}
              >
                <ArrowUpRight
                  className={`w-3 h-3 ${stat.bgColor === "bg-primary" ? "text-primary-foreground" : "text-primary-foreground"}`}
                />
              </div>
            </div>
            <p className="text-3xl font-bold mb-2">{stat.value}</p>
            <div className="flex items-center gap-1.5 text-xs opacity-80">
              <stat.icon className="w-3 h-3" />
              <span>{stat.subtitle}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Project Analytics style chart */}
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          <Card
            className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up bg-gradient-to-br from-background to-muted/20"
            style={{ animationDelay: "400ms" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Trips & Activity</h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                <span>Weekly Activity</span>
              </div>
            </div>

            <div className="h-64 mb-4 relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#4338ca" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-muted/20" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "currentColor", fontSize: 14 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "currentColor", fontSize: 12 }}
                    className="text-muted-foreground"
                    ticks={[0, 25, 50, 75, 100]}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-foreground text-background px-3 py-2 rounded-lg text-xs font-semibold shadow-lg">
                            <p className="font-bold">{payload[0].value} Trips</p>
                            <p className="text-[10px] opacity-80">{payload[0].payload.label}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="url(#barGradient)"
                    radius={[12, 12, 12, 12]}
                    maxBarSize={60}
                    onMouseEnter={(_, index) => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {weeklyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={barColors[index]}
                        className="transition-all duration-300"
                        style={{
                          filter: hoveredBar === index ? "brightness(1.2) drop-shadow(0 4px 8px rgba(99, 102, 241, 0.4))" : "none",
                          transformOrigin: "center bottom",
                        }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="pt-4 border-t border-muted/50 flex items-center justify-between">
              <div className="text-sm">
                <span className="text-muted-foreground">Total This Week: </span>
                <span className="font-semibold text-foreground">227</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Peak Day: </span>
                <span className="font-semibold text-indigo-600">65 Trips</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Project Progress (Pie Chart Replacement) */}
        <div className="space-y-3 md:space-y-4">
          <Card
            className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up overflow-hidden h-full flex flex-col justify-between"
            style={{ animationDelay: "800ms" }}
          >
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Fleet Status</h2>
              <div className="flex flex-col items-center justify-center h-48 relative">
                <div
                  className="absolute inset-0 rounded-full opacity-10"
                  style={{
                    background: "repeating-linear-gradient(45deg, transparent, transparent 6px, currentColor 6px, currentColor 12px)",
                  }}
                />
                <ResponsiveContainer width="100%" height="100%" className="z-10">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.5rem',
                        color: 'hsl(var(--foreground))',
                        fontWeight: 'bold',
                      }}
                      itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                  <span className="text-3xl font-bold text-foreground">{vehicles.length}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Total Assets</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-4 text-xs pt-4 border-t border-border">
              {chartData.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-bold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Lists Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        
        {/* Vehicles List (ProjectList style) */}
        <Card
          className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up lg:col-span-2"
          style={{ animationDelay: "600ms" }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Recent Assets</h2>
            <Button variant="outline" size="sm" className="bg-transparent hover:scale-105 transition-all">
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {vehicles.slice(0, 5).map((v, index) => {
              const statusColor = 
                v.status === 'Available' ? 'bg-emerald-500' :
                v.status === 'On Trip' ? 'bg-indigo-500' :
                v.status === 'In Shop' ? 'bg-amber-500' : 'bg-rose-500';
              
              const StatusIcon = 
                v.status === 'Available' ? CheckCircle2 :
                v.status === 'On Trip' ? Truck :
                v.status === 'In Shop' ? Wrench : AlertCircle;

              return (
                <div
                  key={v.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary transition-all duration-300 cursor-pointer group"
                  style={{ animationDelay: `${700 + index * 100}ms` }}
                >
                  <div className={`${statusColor} text-white w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-sm`}>
                    <StatusIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">{v.registration_number}</p>
                    <p className="text-xs text-muted-foreground truncate">{v.model} &bull; {v.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-foreground">{v.status}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{v.odometer.toLocaleString()} km</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Reminders / Alerts style block */}
        <Card
          className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up flex flex-col"
          style={{ animationDelay: "900ms" }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-6">Action Items</h2>
          <div className="space-y-4 flex-1">
            <div className="bg-card border border-border rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <h3 className="font-semibold text-foreground mb-1">Upcoming Maintenance</h3>
              <p className="text-xs text-muted-foreground mb-4">3 vehicles need service this week</p>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md">
                <Wrench className="w-4 h-4 mr-2" />
                Review Schedule
              </Button>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <h3 className="font-semibold text-foreground mb-1">Driver Certifications</h3>
              <p className="text-xs text-muted-foreground mb-4">2 drivers pending renewal</p>
              <Button variant="outline" className="w-full transition-all">
                <Users className="w-4 h-4 mr-2" />
                View Drivers
              </Button>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default Dashboard;
