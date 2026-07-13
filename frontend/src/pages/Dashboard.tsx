import { useState, useEffect } from 'react';
import api from '../services/api';
import { Truck, Users, Wrench, Route, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface KPI { active_vehicles: number; available_vehicles: number; in_shop_vehicles: number; retired_vehicles: number; active_trips: number; pending_trips: number; drivers_on_duty: number; fleet_utilization: number; }
interface Report { vehicle_id: number; registration_number: string; model: string; distance_traveled: number; revenue: number; fuel_efficiency: number; roi: number; }
interface RecentItem { id: number; label: string; subtitle: string; status: string; }

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

const Dashboard = () => {
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [recentTrips, setRecentTrips] = useState<RecentItem[]>([]);
  const [recentMaintenance, setRecentMaintenance] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [kpiRes, reportRes, tripRes, maintRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/reports'),
          api.get('/trips?per_page=5'),
          api.get('/maintenance?per_page=5'),
        ]);
        setKpi(kpiRes.data);
        setReports(reportRes.data || []);
        setRecentTrips((tripRes.data.data || tripRes.data || []).slice(0, 5).map((t: any) => ({ id: t.id, label: `${t.source} → ${t.destination}`, subtitle: t.vehicle_reg || `V#${t.vehicle_id}`, status: t.status })));
        setRecentMaintenance((maintRes.data.data || maintRes.data || []).slice(0, 5).map((m: any) => ({ id: m.id, label: m.issue_description, subtitle: m.vehicle_reg || `V#${m.vehicle_id}`, status: m.status })));
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading && !kpi) return <div className="space-y-6 animate-pulse"><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />)}</div><div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-xl" /></div>;

  const pieData = kpi ? [
    { name: 'On Trip', value: kpi.active_vehicles },
    { name: 'Available', value: kpi.available_vehicles },
    { name: 'In Shop', value: kpi.in_shop_vehicles },
    { name: 'Retired', value: kpi.retired_vehicles },
  ] : [];

  const topVehicles = [...reports].sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  const totalRevenue = reports.reduce((a, c) => a + c.revenue, 0);
  const avgEfficiency = reports.length ? reports.reduce((a, c) => a + c.fuel_efficiency, 0) / reports.length : 0;

  const cards = [
    { title: 'Fleet Utilization', value: kpi ? `${kpi.fleet_utilization.toFixed(1)}%` : '-', change: '+3.2%', trend: 'up', icon: Activity, bg: 'bg-indigo-50 dark:bg-indigo-900/30', tc: 'text-indigo-600 dark:text-indigo-400' },
    { title: 'Active Trips', value: kpi?.active_trips ?? '-', change: '+1', trend: 'up', icon: Route, bg: 'bg-blue-50 dark:bg-blue-900/30', tc: 'text-blue-600 dark:text-blue-400' },
    { title: 'Drivers On Duty', value: kpi?.drivers_on_duty ?? '-', change: kpi && kpi.drivers_on_duty > 0 ? 'Dispatching' : 'Standby', trend: kpi && kpi.drivers_on_duty > 0 ? 'up' : 'neutral', icon: Users, bg: 'bg-emerald-50 dark:bg-emerald-900/30', tc: 'text-emerald-600 dark:text-emerald-400' },
    { title: 'Open Maintenance', value: kpi?.in_shop_vehicles ?? '-', change: kpi && kpi.in_shop_vehicles > 0 ? `${kpi.in_shop_vehicles} vehicle(s)` : 'Clear', trend: kpi && kpi.in_shop_vehicles > 0 ? 'down' : 'up', icon: Wrench, bg: 'bg-amber-50 dark:bg-amber-900/30', tc: 'text-amber-600 dark:text-amber-400' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div><h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Dashboard</h2><p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Real-time fleet performance overview.</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={c.title} onMouseEnter={() => setHoveredCard(i)} onMouseLeave={() => setHoveredCard(null)}
            className={`p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg transition-all duration-300 cursor-pointer ${hoveredCard === i ? 'scale-105 shadow-2xl' : ''}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${c.bg}`}><c.icon className={`w-5 h-5 ${c.tc}`} /></div>
              <div className="flex items-center gap-1 text-xs">{c.trend === 'up' ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : c.trend === 'down' ? <TrendingDown className="w-3 h-3 text-rose-500" /> : <span className="w-3 h-3" />}<span className={c.trend === 'up' ? 'text-emerald-500' : c.trend === 'down' ? 'text-rose-500' : 'text-slate-400'}>{c.change}</span></div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{c.value}</p>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{c.title}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Fleet Distribution</h3>
          {kpi && kpi.available_vehicles + kpi.active_vehicles + kpi.in_shop_vehicles + kpi.retired_vehicles > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie></PieChart>
            </ResponsiveContainer>
          ) : <div className="py-12 text-center text-slate-400 italic">No data</div>}
          <div className="flex flex-wrap justify-center gap-4 mt-2">{pieData.map((d, i) => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />{d.name}: <span className="font-bold text-slate-700 dark:text-slate-300">{d.value}</span></div>
          ))}</div>
        </div>
        <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Top Vehicles by Revenue</h3>
          {topVehicles.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topVehicles} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <XAxis dataKey="registration_number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="py-12 text-center text-slate-400 italic">No data</div>}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Recent Trips</h3>
          {recentTrips.length === 0 ? <div className="py-8 text-center text-slate-400 italic">No recent trips</div> :
            <div className="space-y-1.5">{recentTrips.map(t => (
              <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-700/30">
                <Route className="w-4 h-4 text-indigo-500 shrink-0" />
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{t.label}</p><p className="text-[10px] text-slate-500 truncate">{t.subtitle}</p></div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${t.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : t.status === 'Dispatched' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : t.status === 'Draft' ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'}`}>{t.status}</span>
              </div>
            ))}</div>}
        </div>
        <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Recent Maintenance</h3>
          {recentMaintenance.length === 0 ? <div className="py-8 text-center text-slate-400 italic">No recent maintenance</div> :
            <div className="space-y-1.5">{recentMaintenance.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-700/30">
                <Wrench className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{m.label}</p><p className="text-[10px] text-slate-500 truncate">{m.subtitle}</p></div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${m.status === 'Closed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{m.status}</span>
              </div>
            ))}</div>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
