import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  Truck,
  Users,
  Map,
  Wrench,
  TrendingUp,
  Activity,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

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

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState(''); // Client-side mock

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

  const handleResetFilters = () => {
    setTypeFilter('');
    setStatusFilter('');
    setRegionFilter('');
  };

  // Filtered vehicles for display card list
  const filteredVehicles = vehicles.filter((v) => {
    const matchesType = typeFilter ? v.type === typeFilter : true;
    const matchesStatus = statusFilter ? v.status === statusFilter : true;
    // Mocking region matches since region is client-only or optional
    const matchesRegion = regionFilter ? true : true; 
    return matchesType && matchesStatus && matchesRegion;
  });

  // Recharts Chart Data
  const chartData = [
    { name: 'Available', value: kpis.available_vehicles, color: '#10b981' },
    { name: 'On Trip', value: kpis.active_vehicles, color: '#6366f1' },
    { name: 'In Shop', value: kpis.in_shop_vehicles, color: '#f59e0b' },
    { name: 'Retired', value: kpis.retired_vehicles, color: '#ef4444' }
  ].filter(item => item.value > 0); // Hide 0 value statuses in chart

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
          <p className="text-slate-400 mt-1">Real-time tracking, metrics, and fleet utilization status.</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
        >
          <RotateCcw size={16} />
          Refresh Stats
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-950/20 border border-rose-800/30 text-rose-400 text-sm">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Fleet Utilization */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:translate-y-[-4px] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-400">Fleet Utilization</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{kpis.fleet_utilization}%</span>
          </div>
          <div className="mt-4 w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(kpis.fleet_utilization, 100)}%` }}
            />
          </div>
        </div>

        {/* Active Vehicles */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:translate-y-[-4px] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-400">Active Vehicles</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Truck size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{kpis.active_vehicles}</span>
            <span className="text-xs text-slate-500">on trip</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Available: {kpis.available_vehicles}</p>
        </div>

        {/* Drivers On Duty */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:translate-y-[-4px] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-400">Drivers On Duty</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Users size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{kpis.drivers_on_duty}</span>
            <span className="text-xs text-slate-500">active</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Total active trips: {kpis.active_trips}</p>
        </div>

        {/* Vehicles in Shop */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:translate-y-[-4px] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-400">In Shop (Maintenance)</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Wrench size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{kpis.in_shop_vehicles}</span>
            <span className="text-xs text-slate-500">repairing</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Pending dispatches: {kpis.pending_trips}</p>
        </div>
      </div>

      {/* Main Panel: Filter & Status Summary + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Filters and List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-200 mb-4">Registry Asset Filter</h3>
            
            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Vehicle Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2 px-3 text-sm text-slate-200 outline-none focus:border-indigo-500"
                >
                  <option value="">All Types</option>
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                  <option value="Box Truck">Box Truck</option>
                  <option value="Sedan">Sedan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2 px-3 text-sm text-slate-200 outline-none focus:border-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="In Shop">In Shop</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Region (Mock)</label>
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2 px-3 text-sm text-slate-200 outline-none focus:border-indigo-500"
                >
                  <option value="">All Regions</option>
                  <option value="North">North Hub</option>
                  <option value="South">South Hub</option>
                  <option value="East">East Hub</option>
                  <option value="West">West Hub</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <span className="text-xs font-semibold text-slate-400">
                Showing {filteredVehicles.length} of {vehicles.length} assets
              </span>
              {(typeFilter || statusFilter || regionFilter) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Quick List Card */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-200 mb-4">Quick Status Check</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3">Reg Number</th>
                    <th className="pb-3">Model</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Capacity (kg)</th>
                    <th className="pb-3">Odometer (km)</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500">
                        No vehicles matching the filters found.
                      </td>
                    </tr>
                  ) : (
                    filteredVehicles.slice(0, 5).map((v) => (
                      <tr key={v.id} className="hover:bg-slate-800/10 transition-colors">
                        <td className="py-3 font-semibold text-slate-100">{v.registration_number}</td>
                        <td className="py-3">{v.model}</td>
                        <td className="py-3">{v.type}</td>
                        <td className="py-3">{v.max_load_capacity} kg</td>
                        <td className="py-3">{v.odometer.toLocaleString()} km</td>
                        <td className="py-3 text-right">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                              v.status === 'Available'
                                ? 'bg-emerald-950/20 text-emerald-400 border-emerald-800/30'
                                : v.status === 'On Trip'
                                ? 'bg-indigo-950/20 text-indigo-400 border-indigo-800/30'
                                : v.status === 'In Shop'
                                ? 'bg-amber-950/20 text-amber-400 border-amber-800/30'
                                : 'bg-rose-950/20 text-rose-400 border-rose-800/30'
                            }`}
                          >
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Status Distribution Chart */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">Fleet Composition</h3>
            <p className="text-xs text-slate-400 mb-4">Visual breakdown of vehicle operational statuses.</p>
          </div>
          
          <div className="h-64 relative flex items-center justify-center">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c101e',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-sm">No data available</div>
            )}
          </div>

          {/* Custom Legends */}
          <div className="space-y-2 mt-4 pt-4 border-t border-slate-800/60">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="font-bold text-slate-100">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
