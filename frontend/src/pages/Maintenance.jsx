import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, X, AlertTriangle, Check, Hammer, CheckCircle2 } from 'lucide-react';

const Maintenance = () => {
  const { hasRole } = useContext(AuthContext);
  const isManager = hasRole(['Fleet Manager']);

  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Open Log Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [vehicleId, setVehicleId] = useState('');
  const [issue, setIssue] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Close Log Form State
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [cost, setCost] = useState('');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const logRes = await api.get('/maintenance');
      setLogs(logRes.data);

      const vehicleRes = await api.get('/vehicles');
      setVehicles(vehicleRes.data);
    } catch (err) {
      setError('Failed to fetch maintenance details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter vehicles that can enter maintenance (must not be 'Retired')
  const maintainableVehicles = vehicles.filter(v => v.status !== 'Retired' && v.status !== 'On Trip');

  const openAddModal = () => {
    setVehicleId('');
    setIssue('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setError('');
    setShowAddModal(true);
  };

  const handleStartMaintenance = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!vehicleId || !issue || !startDate) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      await api.post('/maintenance', {
        vehicle_id: parseInt(vehicleId),
        issue_description: issue,
        start_date: startDate
      });
      setSuccess('Maintenance ticket opened. Vehicle marked as In Shop.');
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to open maintenance ticket.');
    }
  };

  const openCloseModal = (logId) => {
    setSelectedLogId(logId);
    setCost('');
    setEndDate(new Date().toISOString().split('T')[0]);
    setError('');
    setShowCloseModal(true);
  };

  const handleCloseMaintenance = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!cost || !endDate) {
      setError('Please provide the repair cost and completion date.');
      return;
    }

    try {
      await api.post(`/maintenance/${selectedLogId}/close`, {
        cost: parseFloat(cost),
        end_date: endDate
      });
      setSuccess('Maintenance log closed. Vehicle marked as Available and expense logged.');
      setShowCloseModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to close maintenance log.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Maintenance Logs</h2>
          <p className="text-slate-400 mt-1">Schedule servicing, track repair logs, and log operational cost reports.</p>
        </div>
        {isManager && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors text-white shadow-md"
          >
            <Plus size={16} />
            Open Ticket
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-950/20 border border-rose-800/30 text-rose-400 text-sm">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-emerald-400 text-sm">
          <Check size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Tickets List */}
      <div className="glass-card rounded-2xl p-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading maintenance log...</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            No maintenance records found. Click "Open Ticket" to add entries.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">Vehicle</th>
                  <th className="pb-3">Issue Description</th>
                  <th className="pb-3">Start Date</th>
                  <th className="pb-3">End Date</th>
                  <th className="pb-3 text-right">Cost</th>
                  <th className="pb-3 text-center">Status</th>
                  {isManager && <th className="pb-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="py-4">
                      <div className="text-xs">
                        <p className="font-semibold text-slate-200">{log.vehicle_reg}</p>
                        <p className="text-slate-500">{log.vehicle_model}</p>
                      </div>
                    </td>
                    <td className="py-4 font-medium text-slate-200 max-w-xs truncate" title={log.issue_description}>
                      {log.issue_description}
                    </td>
                    <td className="py-4">{new Date(log.start_date).toLocaleDateString()}</td>
                    <td className="py-4">
                      {log.end_date ? new Date(log.end_date).toLocaleDateString() : <span className="text-slate-500 italic">In Progress</span>}
                    </td>
                    <td className="py-4 text-right font-mono">
                      {log.cost !== null ? `$${log.cost.toLocaleString()}` : <span className="text-slate-500 italic">-</span>}
                    </td>
                    <td className="py-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                          log.status === 'Open'
                            ? 'bg-amber-950/20 text-amber-400 border-amber-800/30'
                            : 'bg-emerald-950/20 text-emerald-400 border-emerald-800/30'
                        }`}
                      >
                        {log.status === 'Open' ? 'Active Repair' : 'Closed'}
                      </span>
                    </td>
                    {isManager && (
                      <td className="py-4 text-right">
                        {log.status === 'Open' ? (
                          <button
                            onClick={() => openCloseModal(log.id)}
                            className="flex items-center justify-end gap-1 px-3 py-1 rounded bg-indigo-650 hover:bg-indigo-550 text-xs font-semibold text-white ml-auto transition-colors"
                          >
                            <CheckCircle2 size={12} />
                            Complete Service
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Closed</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* OPEN TICKET MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0c101e] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-200">Open Maintenance Ticket</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStartMaintenance} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Vehicle *</label>
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
                  required
                >
                  <option value="">Choose vehicle to repair...</option>
                  {maintainableVehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.registration_number} - {v.model} (Status: {v.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Issue Description *</label>
                <textarea
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="Describe the mechanical issues or servicing tasks..."
                  rows="3"
                  className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Start Date *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-800 hover:bg-slate-850 hover:text-slate-200 text-sm font-semibold text-slate-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 transition-colors"
                >
                  Open Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLOSE TICKET MODAL */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0c101e] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-200">Complete Repair & Invoice</h3>
              <button
                onClick={() => setShowCloseModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCloseMaintenance} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Repair Cost ($) *</label>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="E.g., 250"
                  min="0.01"
                  step="0.01"
                  className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Completion Date *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-800 hover:bg-slate-850 hover:text-slate-200 text-sm font-semibold text-slate-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white shadow-lg shadow-emerald-600/10 transition-colors"
                >
                  Complete Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
