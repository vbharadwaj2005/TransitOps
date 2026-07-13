import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, X, Search } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import StatusBadge from '../components/StatusBadge';
import { inputClass, selectClass, primaryButtonClass, secondaryButtonClass, tableHeaderClass } from '../utils/helpers';

interface Vehicle { id: number; registration_number: string; model: string; type: string; max_load_capacity: number; odometer: number; acquisition_cost: number; status: string; }

const Vehicles = () => {
  const { hasRole } = useContext(AuthContext);
  const isManager = hasRole(['Fleet Manager']);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [regNum, setRegNum] = useState(''); const [model, setModel] = useState(''); const [vType, setVType] = useState('Van'); const [loadCap, setLoadCap] = useState(''); const [odometer, setOdometer] = useState(''); const [acqCost, setAcqCost] = useState(''); const [vStatus, setVStatus] = useState('Available');

  const fetchVehicles = async (p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), per_page: '10' });
      if (search) params.set('search', search);
      if (typeFilter) params.set('type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/vehicles?${params}`);
      setVehicles(res.data.data || []);
      setTotalPages(res.data.pages || 1);
    } catch { setError('Failed to fetch vehicles.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVehicles(page); }, [page, typeFilter, statusFilter]);

  const handleSearch = () => { setPage(1); fetchVehicles(1); };

  const openCreate = () => { setEditId(null); setRegNum(''); setModel(''); setVType('Van'); setLoadCap(''); setOdometer(''); setAcqCost(''); setVStatus('Available'); setError(''); setShowModal(true); };

  const openEdit = (v: Vehicle) => { setEditId(v.id); setRegNum(v.registration_number); setModel(v.model); setVType(v.type); setLoadCap(String(v.max_load_capacity)); setOdometer(String(v.odometer)); setAcqCost(String(v.acquisition_cost)); setVStatus(v.status); setError(''); setShowModal(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!regNum || !model || !loadCap) { setError('Fill all required fields.'); return; }
    const payload = { registration_number: regNum, model, type: vType, max_load_capacity: parseFloat(loadCap), odometer: odometer ? parseFloat(odometer) : 0, acquisition_cost: acqCost ? parseFloat(acqCost) : 0, status: vStatus };
    try {
      if (editId) { await api.put(`/vehicles/${editId}`, payload); setSuccess('Vehicle updated.'); }
      else { await api.post('/vehicles', payload); setSuccess('Vehicle created.'); }
      setShowModal(false); fetchVehicles(page);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed.'); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try { await api.delete(`/vehicles/${id}`); setSuccess('Vehicle deleted.'); fetchVehicles(page); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed.'); }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Fleet Registry</h2><p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">{vehicles.length} vehicles registered</p></div>
        {isManager && <button onClick={openCreate} className={primaryButtonClass()}><Plus className="w-4 h-4" /> New Vehicle</button>}
      </div>
      <ErrorMessage message={error} /><SuccessMessage message={success} />
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]"><Search className="w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className={inputClass()} placeholder="Search by reg or model..." /></div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className={selectClass() + ' w-36'}><option value="">All Types</option><option value="Truck">Truck</option><option value="Van">Van</option><option value="Box Truck">Box Truck</option><option value="Sedan">Sedan</option></select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className={selectClass() + ' w-40'}><option value="">All Status</option><option value="Available">Available</option><option value="On Trip">On Trip</option><option value="In Shop">In Shop</option><option value="Retired">Retired</option></select>
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
        {loading ? <div className="py-12 text-center text-slate-400 font-medium">Loading...</div> : vehicles.length === 0 ? <div className="py-12 text-center text-slate-500 italic">No vehicles.</div> : (
          <><div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full">
              <thead><tr className="bg-slate-50 dark:bg-slate-700/50"><th className={tableHeaderClass()}>Reg #</th><th className={tableHeaderClass()}>Model</th><th className={tableHeaderClass()}>Type</th><th className={tableHeaderClass() + ' text-right'}>Capacity</th><th className={tableHeaderClass() + ' text-right'}>Odometer</th><th className={tableHeaderClass()}>Status</th>{isManager && <th className={tableHeaderClass() + ' text-right'}>Actions</th>}</tr></thead>
              <tbody>{vehicles.map(v => (
                <tr key={v.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{v.registration_number}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{v.model}</td>
                  <td className="px-4 py-3"><span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 uppercase tracking-wider">{v.type}</span></td>
                  <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{v.max_load_capacity.toLocaleString()} kg</td>
                  <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{v.odometer.toLocaleString()} km</td>
                  <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                  {isManager && <td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><button onClick={() => openEdit(v)} className={secondaryButtonClass() + ' text-xs px-2 py-1'}>Edit</button><button onClick={() => handleDelete(v.id)} className="px-2 py-1 rounded-lg border border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-xs font-bold transition-colors cursor-pointer">Del</button></div></td>}
                </tr>
              ))}</tbody>
            </table>
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
      {showModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"><div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700"><h3 className="text-lg font-bold text-slate-800 dark:text-white">{editId ? 'Edit Vehicle' : 'New Vehicle'}</h3><button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"><X className="w-5 h-5" /></button></div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Reg Number *</label><input value={regNum} onChange={e => setRegNum(e.target.value)} className={inputClass()} required /></div><div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Model *</label><input value={model} onChange={e => setModel(e.target.value)} className={inputClass()} required /></div></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Type</label><select value={vType} onChange={e => setVType(e.target.value)} className={selectClass()}><option value="Truck">Truck</option><option value="Van">Van</option><option value="Box Truck">Box Truck</option><option value="Sedan">Sedan</option></select></div><div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Status</label><select value={vStatus} onChange={e => setVStatus(e.target.value)} className={selectClass()}><option value="Available">Available</option><option value="On Trip">On Trip</option><option value="In Shop">In Shop</option><option value="Retired">Retired</option></select></div></div>
          <div className="grid grid-cols-3 gap-4"><div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Capacity (kg) *</label><input type="number" value={loadCap} onChange={e => setLoadCap(e.target.value)} min="0" className={inputClass()} required /></div><div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Odometer (km)</label><input type="number" value={odometer} onChange={e => setOdometer(e.target.value)} min="0" className={inputClass()} /></div><div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Cost ($)</label><input type="number" value={acqCost} onChange={e => setAcqCost(e.target.value)} min="0" className={inputClass()} /></div></div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700"><button type="button" onClick={() => setShowModal(false)} className={secondaryButtonClass()}>Cancel</button><button type="submit" className={primaryButtonClass()}>{editId ? 'Update' : 'Create'}</button></div>
        </form>
      </div></div>)}
    </div>
  );
};

export default Vehicles;
