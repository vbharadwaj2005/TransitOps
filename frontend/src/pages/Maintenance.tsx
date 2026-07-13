import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, X, Search, Wrench } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import StatusBadge from '../components/StatusBadge';
import { inputClass, selectClass, primaryButtonClass, secondaryButtonClass, tableHeaderClass, modalBackdropClass, modalPanelClass } from '../utils/helpers';

interface MaintenanceLog { id: number; vehicle_id: number; issue_description: string; cost: number; start_date: string; end_date: string; status: string; vehicle_reg: string; vehicle: { registration_number: string; }; }
interface Vehicle { id: number; registration_number: string; status: string; }

const Maintenance = () => {
  const { hasRole } = useContext(AuthContext);
  const isManager = hasRole(['Fleet Manager']);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [mVehicleId, setMVehicleId] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeLogId, setCloseLogId] = useState<number | null>(null);
  const [closeCost, setCloseCost] = useState('');
  const [closeEndDate, setCloseEndDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = `page=${page}&per_page=10${search ? `&search=${search}` : ''}`;
      const [maintRes, vehRes] = await Promise.all([
        api.get(`/maintenance?${params}`),
        api.get('/vehicles'),
      ]);
      setLogs(maintRes.data.data || []);
      setTotalPages(maintRes.data.pages || 1);
      setVehicles(vehRes.data.data || vehRes.data || []);
    } catch { setError('Failed to fetch.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleSearch = () => { if (page !== 1) setPage(1); else fetchData(); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!mVehicleId || !issueDesc) { setError('Fill all required fields.'); return; }
    try { await api.post('/maintenance', { vehicle_id: parseInt(mVehicleId), issue_description: issueDesc, start_date: startDate }); setSuccess('Maintenance log created.'); setShowModal(false); fetchData(); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed.'); }
  };

  const handleClose = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!closeCost) { setError('Cost is required.'); return; }
    try { await api.post(`/maintenance/${closeLogId}/close`, { cost: parseFloat(closeCost), end_date: closeEndDate }); setSuccess('Maintenance closed.'); setShowCloseModal(false); fetchData(); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed.'); }
  };

  const availVehicles = vehicles.filter(v => v.status !== 'Retired');

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Maintenance Board</h2><p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">{logs.length} logs</p></div>
        {isManager && <button onClick={() => { setMVehicleId(''); setIssueDesc(''); setStartDate(new Date().toISOString().split('T')[0]); setError(''); setShowModal(true); }} className={primaryButtonClass()}><Plus className="w-4 h-4" /> New Ticket</button>}
      </div>
      <ErrorMessage message={error} /><SuccessMessage message={success} />
      <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
        <Search className="w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className={inputClass()} placeholder="Search issues..." />
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
        {loading ? <div className="py-12 text-center text-slate-400 font-medium">Loading...</div> : logs.length === 0 ? <div className="py-12 text-center text-slate-500 italic">No maintenance logs.</div> : (
          <><div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full"><thead><tr className="bg-slate-50 dark:bg-slate-700/50"><th className={tableHeaderClass()}>Issue</th><th className={tableHeaderClass()}>Vehicle</th><th className={tableHeaderClass()}>Start</th><th className={tableHeaderClass()}>End</th><th className={tableHeaderClass() + ' text-right'}>Cost</th><th className={tableHeaderClass()}>Status</th>{isManager && <th className={tableHeaderClass() + ' text-right'}>Actions</th>}</tr></thead>
            <tbody>{logs.map(l => {
              const reg = l.vehicle_reg || l.vehicle?.registration_number || `V#${l.vehicle_id}`;
              return <tr key={l.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white max-w-xs truncate">{l.issue_description}</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{reg}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-sm">{l.start_date ? new Date(l.start_date).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-sm">{l.end_date ? new Date(l.end_date).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">${l.cost ? l.cost.toFixed(2) : '0.00'}</td>
                <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                {isManager && <td className="px-4 py-3 text-right">{l.status === 'Open' && <button onClick={() => { setCloseLogId(l.id); setCloseCost(''); setCloseEndDate(new Date().toISOString().split('T')[0]); setError(''); setShowCloseModal(true); }} className={secondaryButtonClass() + ' text-xs px-2 py-1'}>Close</button>}</td>}
              </tr>;
            })}</tbody></table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-all cursor-pointer disabled:cursor-default">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all cursor-pointer ${p === page ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>{p}</button>)}
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-all cursor-pointer disabled:cursor-default">Next</button>
            </div>
          )}</>
        )}
      </div>
      {showModal && (<div className={modalBackdropClass()}><div className={modalPanelClass()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700"><h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2"><Wrench className="w-4 h-4 text-indigo-600" />New Maintenance Ticket</h3><button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button></div>
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Vehicle *</label><select value={mVehicleId} onChange={e => setMVehicleId(e.target.value)} className={selectClass()} required><option value="">Select...</option>{availVehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number}</option>)}</select></div>
          <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Issue Description *</label><textarea value={issueDesc} onChange={e => setIssueDesc(e.target.value)} rows={3} className={inputClass() + ' resize-none'} required /></div>
          <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Start Date</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass()} /></div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700"><button type="button" onClick={() => setShowModal(false)} className={secondaryButtonClass()}>Cancel</button><button type="submit" className={primaryButtonClass()}>Create</button></div>
        </form>
      </div></div>)}
      {showCloseModal && (<div className={modalBackdropClass()}><div className={modalPanelClass()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700"><h3 className="text-lg font-bold text-slate-800 dark:text-white">Close Maintenance</h3><button onClick={() => setShowCloseModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button></div>
        <form onSubmit={handleClose} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Cost ($) *</label><input type="number" value={closeCost} onChange={e => setCloseCost(e.target.value)} min="0" step="0.01" className={inputClass()} required /></div><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">End Date</label><input type="date" value={closeEndDate} onChange={e => setCloseEndDate(e.target.value)} className={inputClass()} /></div></div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700"><button type="button" onClick={() => setShowCloseModal(false)} className={secondaryButtonClass()}>Cancel</button><button type="submit" className={primaryButtonClass()}>Close Ticket</button></div>
        </form>
      </div></div>)}
    </div>
  );
};

export default Maintenance;
