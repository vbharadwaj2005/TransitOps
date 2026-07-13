import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, X, Search, AlertTriangle } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import StatusBadge from '../components/StatusBadge';
import { inputClass, selectClass, primaryButtonClass, secondaryButtonClass, tableHeaderClass } from '../utils/helpers';

interface Driver { id: number; name: string; license_number: string; license_category: string; license_expiry_date: string; contact_number: string; safety_score: number; status: string; }

const Drivers = () => {
  const { hasRole } = useContext(AuthContext);
  const isManager = hasRole(['Fleet Manager', 'Safety Officer']);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState(''); const [licenseNum, setLicenseNum] = useState(''); const [licenseCat, setLicenseCat] = useState('Class A'); const [licenseExpiry, setLicenseExpiry] = useState(''); const [contactNum, setContactNum] = useState(''); const [safetyScore, setSafetyScore] = useState('100'); const [dStatus, setDStatus] = useState('Available');

  const fetchDrivers = async (p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), per_page: '10' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/drivers?${params}`);
      setDrivers(res.data.data || []);
      setTotalPages(res.data.pages || 1);
    } catch { setError('Failed to fetch drivers.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDrivers(page); }, [page, statusFilter]);

  const handleSearch = () => { setPage(1); fetchDrivers(1); };

  const openCreate = () => { setEditId(null); setName(''); setLicenseNum(''); setLicenseCat('Class A'); setLicenseExpiry(''); setContactNum(''); setSafetyScore('100'); setDStatus('Available'); setError(''); setShowModal(true); };

  const openEdit = (d: Driver) => { setEditId(d.id); setName(d.name); setLicenseNum(d.license_number); setLicenseCat(d.license_category); setLicenseExpiry(d.license_expiry_date?.split('T')[0]); setContactNum(d.contact_number); setSafetyScore(String(d.safety_score)); setDStatus(d.status); setError(''); setShowModal(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!name || !licenseNum || !licenseExpiry || !contactNum) { setError('Fill all required fields.'); return; }
    const payload = { name, license_number: licenseNum, license_category: licenseCat, license_expiry_date: licenseExpiry, contact_number: contactNum, safety_score: parseFloat(safetyScore), status: dStatus };
    try {
      if (editId) { await api.put(`/drivers/${editId}`, payload); setSuccess('Driver updated.'); }
      else { await api.post('/drivers', payload); setSuccess('Driver created.'); }
      setShowModal(false); fetchDrivers(page);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed.'); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this driver?')) return;
    try { await api.delete(`/drivers/${id}`); setSuccess('Driver deleted.'); fetchDrivers(page); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed.'); }
  };

  const isExpired = (dateStr: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date(new Date().toDateString());
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Driver Roster</h2><p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">{drivers.length} drivers on record</p></div>
        {isManager && <button onClick={openCreate} className={primaryButtonClass()}><Plus className="w-4 h-4" /> New Driver</button>}
      </div>
      <ErrorMessage message={error} /><SuccessMessage message={success} />
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]"><Search className="w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className={inputClass()} placeholder="Search by name or license..." /></div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className={selectClass() + ' w-40'}><option value="">All Status</option><option value="Available">Available</option><option value="On Trip">On Trip</option><option value="Off Duty">Off Duty</option><option value="Suspended">Suspended</option></select>
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
        {loading ? <div className="py-12 text-center text-slate-400 font-medium">Loading...</div> : drivers.length === 0 ? <div className="py-12 text-center text-slate-500 italic">No drivers.</div> : (
          <><div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full"><thead><tr className="bg-slate-50 dark:bg-slate-700/50"><th className={tableHeaderClass()}>Name</th><th className={tableHeaderClass()}>License</th><th className={tableHeaderClass()}>Category</th><th className={tableHeaderClass()}>Expiry</th><th className={tableHeaderClass() + ' text-right'}>Safety</th><th className={tableHeaderClass()}>Status</th>{isManager && <th className={tableHeaderClass() + ' text-right'}>Actions</th>}</tr></thead>
            <tbody>{drivers.map(d => {
              const expired = isExpired(d.license_expiry_date);
              return <tr key={d.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{d.name}</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{d.license_number}</td>
                <td className="px-4 py-3"><span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 uppercase tracking-wider">{d.license_category}</span></td>
                <td className="px-4 py-3"><div className="flex items-center gap-1.5">{d.license_expiry_date ? new Date(d.license_expiry_date).toLocaleDateString() : '-'}{expired && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" title="License expired" />}</div></td>
                <td className="px-4 py-3 text-right"><span className={`font-bold text-sm ${d.safety_score >= 85 ? 'text-emerald-600' : d.safety_score >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>{d.safety_score}</span></td>
                <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                {isManager && <td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><button onClick={() => openEdit(d)} className={secondaryButtonClass() + ' text-xs px-2 py-1'}>Edit</button><button onClick={() => handleDelete(d.id)} className="px-2 py-1 rounded-lg border border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-xs font-bold transition-colors cursor-pointer">Del</button></div></td>}
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
      {showModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"><div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700"><h3 className="text-lg font-bold text-slate-800 dark:text-white">{editId ? 'Edit Driver' : 'New Driver'}</h3><button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button></div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Name *</label><input value={name} onChange={e => setName(e.target.value)} className={inputClass()} required /></div><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">License # *</label><input value={licenseNum} onChange={e => setLicenseNum(e.target.value)} className={inputClass()} required /></div></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Category *</label><select value={licenseCat} onChange={e => setLicenseCat(e.target.value)} className={selectClass()}><option value="Class A">Class A</option><option value="Class B">Class B</option><option value="Commercial">Commercial</option></select></div><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Expiry *</label><input type="date" value={licenseExpiry} onChange={e => setLicenseExpiry(e.target.value)} className={inputClass()} required /></div></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Contact *</label><input value={contactNum} onChange={e => setContactNum(e.target.value)} className={inputClass()} required /></div><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Safety Score</label><input type="number" value={safetyScore} onChange={e => setSafetyScore(e.target.value)} min="0" max="100" className={inputClass()} /></div></div>
          <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Status</label><select value={dStatus} onChange={e => setDStatus(e.target.value)} className={selectClass()}><option value="Available">Available</option><option value="On Trip">On Trip</option><option value="Off Duty">Off Duty</option><option value="Suspended">Suspended</option></select></div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700"><button type="button" onClick={() => setShowModal(false)} className={secondaryButtonClass()}>Cancel</button><button type="submit" className={primaryButtonClass()}>{editId ? 'Update' : 'Create'}</button></div>
        </form>
      </div></div>)}
    </div>
  );
};

export default Drivers;
