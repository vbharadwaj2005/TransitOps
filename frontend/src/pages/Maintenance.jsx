import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, X, AlertTriangle, Check, Hammer, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Pagination } from '../components/ui/pagination';

const Maintenance = () => {
  const { hasRole } = useContext(AuthContext);
  const isManager = hasRole(['Fleet Manager']);

  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
      const logRes = await api.get(`/maintenance?page=${page}&search=${encodeURIComponent(search)}`);
      setLogs(logRes.data.data);
      setTotalPages(logRes.data.pages);

      const vehicleRes = await api.get('/vehicles');
      setVehicles(vehicleRes.data);
    } catch (err) {
      setError('Failed to fetch maintenance details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search]);

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
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Maintenance Logs</h2>
          <p className="text-slate-500 mt-1 font-medium">Schedule servicing, track repair logs, and log operational cost reports.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Input 
            placeholder="Search logs..." 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full sm:w-64"
          />
          {isManager && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all cursor-pointer focus-ring"
            >
              <Plus size={18} strokeWidth={2.5} />
              Open Ticket
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          <Check size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Tickets List */}
      <div className="card p-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400 font-medium">Loading maintenance log...</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-medium italic">
            No maintenance records found. Click "Open Ticket" to add entries.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Issue Description</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th className="text-right">Cost</th>
                  <th className="text-center">Status</th>
                  {isManager && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div>
                        <p className="font-bold text-slate-900">{log.vehicle_reg}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{log.vehicle_model}</p>
                      </div>
                    </td>
                    <td className="font-medium text-slate-700 max-w-xs truncate" title={log.issue_description}>
                      {log.issue_description}
                    </td>
                    <td className="font-medium text-slate-700">{new Date(log.start_date).toLocaleDateString()}</td>
                    <td className="font-medium text-slate-700">
                      {log.end_date ? new Date(log.end_date).toLocaleDateString() : <span className="text-slate-400 italic font-medium">In Progress</span>}
                    </td>
                    <td className="text-right font-mono font-bold text-slate-900">
                      {log.cost !== null ? `$${log.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : <span className="text-slate-400 font-medium italic">-</span>}
                    </td>
                    <td className="text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                          log.status === 'Open'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {log.status === 'Open' ? 'Active Repair' : 'Closed'}
                      </span>
                    </td>
                    {isManager && (
                      <td className="text-right">
                        {log.status === 'Open' ? (
                          <button
                            onClick={() => openCloseModal(log.id)}
                            className="flex items-center justify-end gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 text-xs font-bold ml-auto transition-colors cursor-pointer border border-indigo-200 focus-ring"
                          >
                            <CheckCircle2 size={14} strokeWidth={2.5} />
                            Complete Service
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 italic">Closed</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && logs.length > 0 && (
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={setPage} 
          />
        )}
      </div>

      {/* OPEN TICKET MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">Open Maintenance Ticket</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStartMaintenance} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Vehicle *</label>
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="block w-full rounded-lg border border-slate-350 bg-white py-2.5 px-3.5 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Issue Description *</label>
                <textarea
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="Describe the mechanical issues or servicing tasks..."
                  rows="3"
                  className="block w-full rounded-lg border border-slate-350 bg-white py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-405 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Start Date *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full rounded-lg border border-slate-350 bg-white py-2.5 px-3.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 hover:text-slate-700 text-sm font-semibold text-slate-500 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-md transition-colors cursor-pointer"
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
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">Complete Repair & Invoice</h3>
              <button
                onClick={() => setShowCloseModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCloseMaintenance} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Repair Cost ($) *</label>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="E.g., 250"
                  min="0.01"
                  step="0.01"
                  className="block w-full rounded-lg border border-slate-355 bg-white py-2.5 px-3.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Completion Date *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full rounded-lg border border-slate-355 bg-white py-2.5 px-3.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 hover:text-slate-700 text-sm font-semibold text-slate-500 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white shadow-md transition-colors cursor-pointer"
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
