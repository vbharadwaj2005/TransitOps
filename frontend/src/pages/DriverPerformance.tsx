import { useState, useEffect } from 'react';
import api from '../services/api';
import { TrendingUp, TrendingDown, ArrowUpDown, TriangleAlert } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';
import { tableHeaderClass } from '../utils/helpers';

interface Performance { driver_id: number; name: string; email: string; total_trips: number; completed_trips: number; cancelled_trips: number; total_distance: number; total_hours: number; avg_rating: number; safety_score: number; efficiency_score: number; on_time_percentage: number; }

const DriverPerformance = () => {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState('safety_score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchPerformances = async () => {
      setLoading(true);
      try { const res = await api.get('/analytics/driver-performance'); setPerformances(res.data); }
      catch { setError('Failed to fetch driver performance.'); }
      finally { setLoading(false); }
    };
    fetchPerformances();
  }, []);

  const handleSort = (field: string) => { setSortDirection(prev => sortField === field && prev === 'asc' ? 'desc' : 'asc'); setSortField(field); };

  const sorted = [...performances].sort((a, b) => {
    let aVal: any = a[sortField as keyof Performance], bVal: any = b[sortField as keyof Performance];
    if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = (bVal as string).toLowerCase(); }
    return aVal < bVal ? (sortDirection === 'asc' ? -1 : 1) : aVal > bVal ? (sortDirection === 'asc' ? 1 : -1) : 0;
  });

  const getScoreColor = (score: number) => score >= 85 ? 'text-emerald-600 dark:text-emerald-400' : score >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400';
  const getBar = (score: number) => score >= 85 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500';

  const avgSafety = performances.length ? performances.reduce((a, c) => a + c.safety_score, 0) / performances.length : 0;
  const avgEfficiency = performances.length ? performances.reduce((a, c) => a + c.efficiency_score, 0) / performances.length : 0;
  const avgOnTime = performances.length ? performances.reduce((a, c) => a + c.on_time_percentage, 0) / performances.length : 0;
  const totalTrips = performances.reduce((a, c) => a + c.total_trips, 0);

  const fields = [
    { key: 'name', label: 'Driver' },
    { key: 'total_trips', label: 'Trips' },
    { key: 'avg_rating', label: 'Rating' },
    { key: 'safety_score', label: 'Safety' },
    { key: 'efficiency_score', label: 'Efficiency' },
    { key: 'on_time_percentage', label: 'On-Time' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div><h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Driver Performance</h2><p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Safety scores, efficiency, and trip completion metrics.</p></div>
      <ErrorMessage message={error} />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[{ label: 'Avg Safety Score', value: avgSafety, icon: TriangleAlert }, { label: 'Avg Efficiency Score', value: avgEfficiency, icon: TrendingUp }, { label: 'Avg On-Time %', value: avgOnTime, icon: TrendingUp }, { label: 'Total Trips', value: totalTrips, icon: TrendingUp }].map(s => (
          <div key={s.label} className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{s.label}</p>
            <p className={`text-3xl font-extrabold ${s.label.includes('Score') || s.label.includes('On-Time') ? getScoreColor(s.value as number) : 'text-slate-900 dark:text-white'}`}>
              {s.label.includes('Total') ? s.value : typeof s.value === 'number' ? s.value.toFixed(1) + (s.label.includes('On-Time') ? '%' : '') : 'N/A'}
            </p>
          </div>
        ))}
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
        {loading ? <div className="py-12 text-center text-slate-400 font-medium">Loading...</div> : !performances.length ? <div className="py-12 text-center text-slate-500 italic">No performance data.</div> : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full"><thead><tr className="bg-slate-50 dark:bg-slate-700/50">{fields.map(f => <th key={f.key} className={`${tableHeaderClass()} ${f.key !== 'name' ? 'text-right' : ''} cursor-pointer`} onClick={() => handleSort(f.key)}><div className={`flex items-center gap-1 ${f.key !== 'name' ? 'justify-end' : ''}`}>{f.label}<ArrowUpDown className="w-3 h-3 text-slate-400" /></div></th>)}</tr></thead>
            <tbody>{sorted.map(p => {
              const completionRate = p.total_trips > 0 ? (p.completed_trips / p.total_trips) * 100 : 0;
              return <tr key={p.driver_id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-4"><p className="font-bold text-slate-900 dark:text-white">{p.name}</p><p className="text-[10px] text-slate-500 uppercase tracking-wider">{p.email}</p></td>
                <td className="px-4 py-4 text-right"><p className="font-bold text-slate-900 dark:text-white">{p.completed_trips}<span className="text-slate-400 font-normal text-xs">/{p.total_trips}</span></p><p className="text-[10px] font-semibold text-slate-500">{completionRate.toFixed(1)}%</p></td>
                <td className="px-4 py-4 text-right font-bold text-slate-700 dark:text-slate-300">{p.avg_rating ? `${p.avg_rating.toFixed(1)} / 5` : '-'}</td>
                <td className="px-4 py-4"><div className="flex items-center justify-end gap-2"><div className="w-20 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div className={`h-full rounded-full transition-all ${getBar(p.safety_score)}`} style={{ width: `${p.safety_score}%` }} /></div><span className={`text-xs font-bold w-7 text-right ${getScoreColor(p.safety_score)}`}>{p.safety_score}</span></div></td>
                <td className="px-4 py-4"><div className="flex items-center justify-end gap-2"><div className="w-20 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div className={`h-full rounded-full ${getBar(p.efficiency_score)}`} style={{ width: `${p.efficiency_score}%` }} /></div><span className={`text-xs font-bold w-7 text-right ${getScoreColor(p.efficiency_score)}`}>{p.efficiency_score}</span></div></td>
                <td className="px-4 py-4"><span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getScoreColor(p.on_time_percentage)} bg-slate-100 dark:bg-slate-700`}>{p.on_time_percentage.toFixed(1)}%</span></td>
              </tr>;
            })}</tbody></table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverPerformance;
