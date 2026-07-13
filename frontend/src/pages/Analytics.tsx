import { useState, useEffect } from 'react';
import api from '../services/api';
import { FileDown, ArrowUpDown, TrendingUp, TrendingDown, Fuel, ArrowUpRight, DollarSign, Car, Activity } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';
import { tableHeaderClass, secondaryButtonClass } from '../utils/helpers';

interface Report { vehicle_id: number; registration_number: string; model: string; type: string; status: string; distance_traveled: number; fuel_consumed: number; fuel_cost: number; maintenance_cost: number; operational_cost: number; revenue: number; fuel_efficiency: number; roi: number; }

const Analytics = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [sortField, setSortField] = useState('roi');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try { const res = await api.get('/analytics/reports'); setReports(res.data); }
      catch { setError('Failed to fetch analytics.'); }
      finally { setLoading(false); }
    };
    fetchReports();
  }, []);

  const handleSort = (field: string) => { setSortDirection(prev => sortField === field && prev === 'asc' ? 'desc' : 'asc'); setSortField(field); };

  const sorted = [...reports].sort((a, b) => {
    let aVal: any = a[sortField as keyof Report], bVal: any = b[sortField as keyof Report];
    if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = (bVal as string).toLowerCase(); }
    return aVal < bVal ? (sortDirection === 'asc' ? -1 : 1) : aVal > bVal ? (sortDirection === 'asc' ? 1 : -1) : 0;
  });

  const downloadCSV = () => {
    if (!reports.length) return;
    const headers = ['Vehicle ID','Registration','Model','Type','Status','Distance (km)','Fuel (L)','Fuel Cost ($)','Maint Cost ($)','Op Cost ($)','Revenue ($)','Eff (km/L)','ROI (%)'];
    const rows = reports.map(r => [r.vehicle_id, `"${r.registration_number}"`, `"${r.model}"`, `"${r.type}"`, `"${r.status}"`, r.distance_traveled, r.fuel_consumed, r.fuel_cost, r.maintenance_cost, r.operational_cost, r.revenue, r.fuel_efficiency, (r.roi * 100).toFixed(2)]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const a = document.createElement('a'); a.setAttribute('href', encodeURI(csv)); a.setAttribute('download', `report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const totalVehicles = reports.length;
  const totalRevenue = reports.reduce((a, c) => a + c.revenue, 0);
  const avgRoi = totalVehicles ? reports.reduce((a, c) => a + c.roi, 0) / totalVehicles : 0;
  const avgEff = totalVehicles ? reports.reduce((a, c) => a + c.fuel_efficiency, 0) / totalVehicles : 0;

  const stats = [
    { title: 'Total Assets', value: totalVehicles, change: '+12%', trend: 'up', icon: Car, bg: 'bg-blue-500/10', tc: 'text-blue-500' },
    { title: 'Total Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}k`, change: '+5.2%', trend: 'up', icon: DollarSign, bg: 'bg-emerald-500/10', tc: 'text-emerald-500' },
    { title: 'Avg ROI', value: `${(avgRoi * 100).toFixed(1)}%`, change: '+1.1%', trend: 'up', icon: Activity, bg: 'bg-indigo-500/10', tc: 'text-indigo-500' },
    { title: 'Avg Fuel Eff.', value: avgEff.toFixed(1), subtitle: 'km/L', change: '-0.2', trend: 'down', icon: Fuel, bg: 'bg-amber-500/10', tc: 'text-amber-500' },
  ];

  if (loading && !reports.length) return <div className="space-y-6 animate-pulse"><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />)}</div><div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-xl" /></div>;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-end"><button onClick={downloadCSV} disabled={!reports.length} className={secondaryButtonClass()}><FileDown className="w-4 h-4" /> Export CSV</button></div>
      <ErrorMessage message={error} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={s.title} onMouseEnter={() => setHoveredCard(i)} onMouseLeave={() => setHoveredCard(null)}
            className={`p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all duration-500 cursor-pointer ${hoveredCard === i ? 'scale-105 shadow-2xl' : 'shadow-lg'}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2"><div className={`p-2 rounded-full ${s.bg}`}><s.icon className={`w-4 h-4 ${s.tc}`} /></div><h3 className="text-xs font-medium text-slate-500">{s.title}</h3></div>
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center"><ArrowUpRight className="w-3 h-3 text-white" /></div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{s.value}{s.subtitle && <span className="text-sm text-slate-500 ml-1">{s.subtitle}</span>}</p>
            <div className="flex items-center gap-1.5 text-xs">{s.trend === 'up' ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-rose-500" />}<span className={s.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}>{s.change}</span></div>
          </div>
        ))}
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="mb-6"><h3 className="text-lg font-semibold text-slate-900 dark:text-white">Fleet Financial Performance</h3><p className="text-sm text-slate-500">Comprehensive metrics on vehicle ROIs and costs.</p></div>
        {!reports.length ? <div className="py-12 text-center text-slate-500 italic">No data.</div> : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full"><thead><tr className="bg-slate-50 dark:bg-slate-700/50">
              {[{ key: 'registration_number', label: 'Reg' }, { key: 'type', label: 'Type' }, { key: 'distance_traveled', label: 'Dist (km)' }, { key: 'fuel_efficiency', label: 'Eff (km/L)' }, { key: 'operational_cost', label: 'Op. Cost' }, { key: 'revenue', label: 'Revenue' }, { key: 'roi', label: 'ROI %' }].map(f => (
                <th key={f.key} className={`${tableHeaderClass()} ${f.key !== 'registration_number' ? 'text-right' : ''} cursor-pointer`} onClick={() => handleSort(f.key)}>
                  <div className={`flex items-center gap-1 ${f.key !== 'registration_number' ? 'justify-end' : ''}`}>{f.label}<ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
                </th>
              ))}
            </tr></thead>
            <tbody>{sorted.map(r => {
              const roi = r.roi * 100;
              return <tr key={r.vehicle_id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3"><p className="font-semibold text-slate-900 dark:text-white">{r.registration_number}</p><p className="text-[10px] text-slate-500 uppercase tracking-wider">{r.model}</p></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.type}</td>
                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{r.distance_traveled.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{r.fuel_efficiency.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-slate-500">${r.operational_cost.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">${r.revenue.toLocaleString()}</td>
                <td className="px-4 py-3 text-right"><span className={`font-bold ${roi < 0 ? 'text-rose-600' : roi > 0 ? 'text-emerald-600' : 'text-slate-500'}`}>{roi.toFixed(2)}%</span>{roi >= 15 ? <TrendingUp className="w-3 h-3 text-emerald-500 inline ml-1" /> : roi < 0 ? <TrendingDown className="w-3 h-3 text-rose-500 inline ml-1" /> : null}</td>
              </tr>;
            })}</tbody></table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
