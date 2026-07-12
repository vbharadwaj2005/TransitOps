import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import Modal from '../components/Modal';

interface Log {
  id: number; vehicle_id: number; issue_description: string; cost: number | null;
  start_date: string; end_date: string | null; status: string;
  vehicle_reg?: string; vehicle_model?: string;
}
interface Vehicle { id: number; registration_number: string; model: string; status: string; }

const Maintenance = () => {
  const { hasRole } = useContext(AuthContext);
  const isManager = hasRole(['Fleet Manager']);

  const [logs, setLogs] = useState<Log[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [vehicleId, setVehicleId] = useState('');
  const [issue, setIssue] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
  const [cost, setCost] = useState('');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = async () => {
    setLoading(true);
    try { const [logRes, vehicleRes] = await Promise.all([api.get('/maintenance'), api.get('/vehicles')]); setLogs(logRes.data); setVehicles(vehicleRes.data); } catch { setError('Failed to fetch maintenance details.'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const maintainableVehicles = vehicles.filter(v => v.status !== 'Retired' && v.status !== 'On Trip');

  const handleStartMaintenance = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!vehicleId || !issue || !startDate) { setError('Please fill in all required fields.'); return; }
    try { await api.post('/maintenance', { vehicle_id: parseInt(vehicleId), issue_description: issue, start_date: startDate }); setSuccess('Maintenance ticket opened.'); setShowAddModal(false); fetchData(); } catch (err: any) { setError(err.response?.data?.message || 'Failed to open maintenance ticket.'); }
  };

  const handleCloseMaintenance = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!cost || !endDate) { setError('Please provide the repair cost and completion date.'); return; }
    try { await api.post(`/maintenance/${selectedLogId}/close`, { cost: parseFloat(cost), end_date: endDate }); setSuccess('Maintenance log closed.'); setShowCloseModal(false); fetchData(); } catch (err: any) { setError(err.response?.data?.message || 'Failed to close maintenance log.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-3xl font-bold tracking-tight text-slate-900">Maintenance Logs</h2><p className="text-slate-500 mt-1">Schedule servicing, track repair logs, and log operational cost reports.</p></div>
        {isManager && <button onClick={() => { setVehicleId(''); setIssue(''); setStartDate(new Date().toISOString().split('T')[0]); setError(''); setShowAddModal(true); }} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors text-white shadow-md cursor-pointer"><Plus size={16} /> Open Ticket</button>}
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <div className="glass-card rounded-2xl p-6">
        {loading ? (<div className="py-12 text-center text-slate-400">Loading maintenance log...</div>)
        : logs.length === 0 ? (<div className="py-12 text-center text-slate-500">No maintenance records found.</div>)
        : (<div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead><tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="pb-3">Vehicle</th><th className="pb-3">Issue</th><th className="pb-3">Start Date</th><th className="pb-3">End Date</th><th className="pb-3 text-right">Cost</th><th className="pb-3 text-center">Status</th>{isManager && <th className="pb-3 text-right">Actions</th>}
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (<tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 text-xs"><p className="font-semibold text-slate-900">{log.vehicle_reg}</p><p className="text-slate-500">{log.vehicle_model}</p></td>
                  <td className="py-4 font-medium text-slate-900 max-w-xs truncate">{log.issue_description}</td>
                  <td className="py-4 text-slate-700">{new Date(log.start_date).toLocaleDateString()}</td>
                  <td className="py-4 text-slate-700">{log.end_date ? new Date(log.end_date).toLocaleDateString() : <span className="text-slate-500 italic">In Progress</span>}</td>
                  <td className="py-4 text-right font-mono text-slate-700">{log.cost !== null ? `$${log.cost.toLocaleString()}` : <span className="text-slate-500 italic">-</span>}</td>
                  <td className="py-4 text-center"><StatusBadge status={log.status === 'Open' ? 'Open' : 'Closed'} /></td>
                  {isManager && <td className="py-4 text-right">{log.status === 'Open' ? <button onClick={() => { setSelectedLogId(log.id); setCost(''); setEndDate(new Date().toISOString().split('T')[0]); setError(''); setShowCloseModal(true); }} className="flex items-center justify-end gap-1 px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white ml-auto transition-colors cursor-pointer shadow-sm"><CheckCircle2 size={12} /> Complete Service</button> : <span className="text-xs text-slate-400 italic">Closed</span>}</td>}
                </tr>))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <Modal title="Open Maintenance Ticket" onClose={() => setShowAddModal(false)}>
            <form onSubmit={handleStartMaintenance} className="p-6 space-y-4">
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Vehicle *</label><select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500" required><option value="">Choose vehicle to repair...</option>{maintainableVehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} - {v.model} (Status: {v.status})</option>)}</select></div>
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Issue Description *</label><textarea value={issue} onChange={(e) => setIssue(e.target.value)} placeholder="Describe the mechanical issues..." rows={3} className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none" required /></div>
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Start Date *</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required /></div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm font-semibold text-slate-500 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-md cursor-pointer">Open Ticket</button>
              </div>
            </form>
        </Modal>
      )}

      {showCloseModal && (
        <Modal title="Complete Repair & Invoice" onClose={() => setShowCloseModal(false)}>
            <form onSubmit={handleCloseMaintenance} className="p-6 space-y-4">
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Repair Cost ($) *</label><input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="E.g., 250" min="0.01" step="0.01" className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required /></div>
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Completion Date *</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required /></div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setShowCloseModal(false)} className="px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm font-semibold text-slate-500 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white shadow-md cursor-pointer">Complete Service</button>
              </div>
            </form>
        </Modal>
      )}
    </div>
  );
};

export default Maintenance;
