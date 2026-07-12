import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileDown, ArrowUpDown, TrendingUp, TrendingDown, Fuel, AlertTriangle } from 'lucide-react';

const Analytics = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sorting
  const [sortField, setSortField] = useState('roi');
  const [sortDirection, setSortDirection] = useState('desc');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await api.get('/analytics/reports');
      setReports(response.data);
    } catch (err) {
      setError('Failed to fetch analytics reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSort = (field) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const sortedReports = [...reports].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleDownloadCSV = () => {
    if (reports.length === 0) return;

    const headers = [
      'Vehicle ID',
      'Registration Number',
      'Model',
      'Type',
      'Status',
      'Distance Traveled (km)',
      'Fuel Consumed (Liters)',
      'Fuel Cost ($)',
      'Maintenance Cost ($)',
      'Total Operational Cost ($)',
      'Revenue ($)',
      'Fuel Efficiency (km/L)',
      'ROI (%)'
    ];

    const rows = reports.map((r) => [
      r.vehicle_id,
      `"${r.registration_number}"`,
      `"${r.model}"`,
      `"${r.type}"`,
      `"${r.status}"`,
      r.distance_traveled,
      r.fuel_consumed,
      r.fuel_cost,
      r.maintenance_cost,
      r.operational_cost,
      r.revenue,
      r.fuel_efficiency,
      (r.roi * 100).toFixed(2)
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `transitops_fleet_report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Reports & Fleet Analytics</h2>
          <p className="text-slate-500 mt-1">Audit vehicle ROIs, fuel efficiencies, and total operational costs.</p>
        </div>
        <button
          onClick={handleDownloadCSV}
          disabled={reports.length === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-md transition-colors cursor-pointer"
        >
          <FileDown size={16} />
          Export CSV Report
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Reports Grid Table */}
      <div className="glass-card rounded-2xl p-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400">Compiling financial performance metrics...</div>
        ) : reports.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            No active fleet operations data found to generate reports.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-655">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold select-none">
                  <th className="pb-3 cursor-pointer hover:text-slate-800 transition-colors" onClick={() => handleSort('registration_number')}>
                    <div className="flex items-center gap-1">Registration <ArrowUpDown size={12} /></div>
                  </th>
                  <th className="pb-3 cursor-pointer hover:text-slate-800 transition-colors" onClick={() => handleSort('type')}>
                    <div className="flex items-center gap-1">Type <ArrowUpDown size={12} /></div>
                  </th>
                  <th className="pb-3 cursor-pointer hover:text-slate-800 transition-colors text-right" onClick={() => handleSort('distance_traveled')}>
                    <div className="flex items-center justify-end gap-1">Distance (km) <ArrowUpDown size={12} /></div>
                  </th>
                  <th className="pb-3 cursor-pointer hover:text-slate-800 transition-colors text-right" onClick={() => handleSort('fuel_efficiency')}>
                    <div className="flex items-center justify-end gap-1">Efficiency (km/L) <ArrowUpDown size={12} /></div>
                  </th>
                  <th className="pb-3 cursor-pointer hover:text-slate-800 transition-colors text-right" onClick={() => handleSort('operational_cost')}>
                    <div className="flex items-center justify-end gap-1">Operational Cost <ArrowUpDown size={12} /></div>
                  </th>
                  <th className="pb-3 cursor-pointer hover:text-slate-800 transition-colors text-right" onClick={() => handleSort('revenue')}>
                    <div className="flex items-center justify-end gap-1">Revenue <ArrowUpDown size={12} /></div>
                  </th>
                  <th className="pb-3 cursor-pointer hover:text-slate-800 transition-colors text-right" onClick={() => handleSort('roi')}>
                    <div className="flex items-center justify-end gap-1">ROI % <ArrowUpDown size={12} /></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedReports.map((r) => {
                  const roiPercent = r.roi * 100;
                  const isHighRoi = roiPercent >= 15;
                  const isLowEfficiency = r.fuel_efficiency > 0 && r.fuel_efficiency < 3.5; // low efficiency warning

                  return (
                    <tr key={r.vehicle_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4">
                        <div>
                          <p className="font-semibold text-slate-900">{r.registration_number}</p>
                          <p className="text-[10px] text-slate-500">{r.model}</p>
                        </div>
                      </td>
                      <td className="py-4 text-slate-700">{r.type}</td>
                      <td className="py-4 text-right font-mono text-slate-700">{r.distance_traveled.toLocaleString()} km</td>
                      <td className="py-4 text-right font-mono text-slate-700">
                        <div className="flex items-center justify-end gap-1.5">
                          <span>{r.fuel_efficiency.toFixed(2)} km/L</span>
                          {isLowEfficiency && (
                            <Fuel size={12} className="text-amber-500" title="Low Fuel Efficiency Warning" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-right font-mono text-slate-500">${r.operational_cost.toLocaleString()}</td>
                      <td className="py-4 text-right font-mono text-slate-500">${r.revenue.toLocaleString()}</td>
                      <td className="py-4 text-right font-mono">
                        <div className="flex items-center justify-end gap-1.5 font-bold">
                          <span className={roiPercent < 0 ? 'text-rose-600' : roiPercent > 0 ? 'text-emerald-700' : 'text-slate-500'}>
                            {roiPercent.toFixed(2)}%
                          </span>
                          {isHighRoi ? (
                            <TrendingUp size={12} className="text-emerald-600" title="High ROI Asset" />
                          ) : roiPercent < 0 ? (
                            <TrendingDown size={12} className="text-rose-600" title="Negative ROI Warning" />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
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
