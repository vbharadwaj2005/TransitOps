import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileDown, ArrowUpDown, TrendingUp, TrendingDown, Fuel } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';

interface Report {
  vehicle_id: number; registration_number: string; model: string; type: string; status: string;
  distance_traveled: number; fuel_consumed: number; fuel_cost: number; maintenance_cost: number;
  operational_cost: number; revenue: number; fuel_efficiency: number; roi: number; acquisition_cost: number;
}

const Analytics = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState('roi');
  const [sortDirection, setSortDirection] = useState('desc');

  const fetchReports = async () => {
    setLoading(true);
    try { const r = await api.get('/analytics/reports'); setReports(r.data); } catch { setError('Failed to fetch analytics reports.'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleSort = (field: string) => {
    setSortDirection(prev => sortField === field && prev === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };

  const sortedReports = [...reports].sort((a, b) => {
    let aVal = (a as any)[sortField], bVal = (b as any)[sortField];
    if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = (bVal as string).toLowerCase(); }
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleDownloadCSV = () => {
    if (reports.length === 0) return;
    const headers = ['Vehicle ID', 'Registration', 'Model', 'Type', 'Status', 'Distance (km)', 'Fuel (L)', 'Fuel Cost ($)', 'Maint Cost ($)', 'Total Cost ($)', 'Revenue ($)', 'Efficiency (km/L)', 'ROI (%)'];
    const rows = reports.map(r => [r.vehicle_id, `"${r.registration_number}"`, `"${r.model}"`, `"${r.type}"`, `"${r.status}"`, r.distance_traveled, r.fuel_consumed, r.fuel_cost, r.maintenance_cost, r.operational_cost, r.revenue, r.fuel_efficiency, (r.roi * 100).toFixed(2)]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transitops_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const SortHeader = ({ field, label, align = 'left' }: { field: string; label: string; align?: string }) => (
    <th className={`pb-3 cursor-pointer hover:text-slate-800 transition-colors ${align === 'right' ? 'text-right' : ''}`} onClick={() => handleSort(field)}>
      <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>{label}<ArrowUpDown size={12} /></div>
    </th>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-3xl font-bold tracking-tight text-slate-900">Reports & Fleet Analytics</h2><p className="text-slate-500 mt-1">Audit vehicle ROIs, fuel efficiencies, and total operational costs.</p></div>
        <button onClick={handleDownloadCSV} disabled={reports.length === 0} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-md transition-colors cursor-pointer"><FileDown size={16} /> Export CSV</button>
      </div>

      <ErrorMessage message={error} />

      <div className="glass-card rounded-2xl p-6">
        {loading ? (<div className="py-12 text-center text-slate-400">Compiling financial performance metrics...</div>)
        : reports.length === 0 ? (<div className="py-12 text-center text-slate-500">No active fleet operations data found.</div>)
        : (<div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead><tr className="border-b border-slate-200 text-slate-500 font-semibold select-none">
                <SortHeader field="registration_number" label="Registration" />
                <SortHeader field="type" label="Type" />
                <SortHeader field="distance_traveled" label="Distance (km)" align="right" />
                <SortHeader field="fuel_efficiency" label="Efficiency (km/L)" align="right" />
                <SortHeader field="operational_cost" label="Op. Cost" align="right" />
                <SortHeader field="revenue" label="Revenue" align="right" />
                <SortHeader field="roi" label="ROI %" align="right" />
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {sortedReports.map((r) => {
                  const roiPercent = r.roi * 100;
                  const isLowEfficiency = r.fuel_efficiency > 0 && r.fuel_efficiency < 3.5;
                  return (<tr key={r.vehicle_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4"><div><p className="font-semibold text-slate-900">{r.registration_number}</p><p className="text-[10px] text-slate-500">{r.model}</p></div></td>
                    <td className="py-4 text-slate-700">{r.type}</td>
                    <td className="py-4 text-right font-mono text-slate-700">{r.distance_traveled.toLocaleString()} km</td>
                    <td className="py-4 text-right font-mono text-slate-700"><div className="flex items-center justify-end gap-1.5"><span>{r.fuel_efficiency.toFixed(2)} km/L</span>{isLowEfficiency && <Fuel size={12} className="text-amber-500" />}</div></td>
                    <td className="py-4 text-right font-mono text-slate-500">${r.operational_cost.toLocaleString()}</td>
                    <td className="py-4 text-right font-mono text-slate-500">${r.revenue.toLocaleString()}</td>
                    <td className="py-4 text-right font-mono"><div className="flex items-center justify-end gap-1.5 font-bold">
                      <span className={roiPercent < 0 ? 'text-rose-600' : roiPercent > 0 ? 'text-emerald-700' : 'text-slate-500'}>{roiPercent.toFixed(2)}%</span>
                      {roiPercent >= 15 ? <TrendingUp size={12} className="text-emerald-600" /> : roiPercent < 0 ? <TrendingDown size={12} className="text-rose-600" /> : null}
                    </div></td>
                  </tr>);
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
