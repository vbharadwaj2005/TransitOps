import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, X, Search, Send, CheckCircle, XCircle, Route } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import StatusBadge from '../components/StatusBadge';
import { inputClass, selectClass, primaryButtonClass, secondaryButtonClass, tableHeaderClass, modalBackdropClass, modalPanelClass } from '../utils/helpers';

interface Trip { id: number; source: string; destination: string; status: string; vehicle_id: number; driver_id: number; cargo_weight: number; planned_distance: number; revenue: number; vehicle_reg: string; driver_name: string; }
interface Vehicle { id: number; registration_number: string; max_load_capacity: number; status: string; }
interface Driver { id: number; name: string; status: string; }

const Trips = () => {
  const { hasRole } = useContext(AuthContext);
  const isFmDriver = hasRole(['Fleet Manager', 'Driver']);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [source, setSource] = useState(''); const [dest, setDest] = useState(''); const [vehicleId, setVehicleId] = useState(''); const [driverId, setDriverId] = useState(''); const [cargoWeight, setCargoWeight] = useState(''); const [plannedDist, setPlannedDist] = useState(''); const [revenue, setRevenue] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tripRes, vehRes, drvRes] = await Promise.all([
        api.get(`/trips?page=${page}&per_page=10${search ? `&search=${search}` : ''}`),
        api.get('/vehicles'),
        api.get('/drivers'),
      ]);
      setTrips(tripRes.data.data || []);
      setTotalPages(tripRes.data.pages || 1);
      setVehicles(vehRes.data.data || vehRes.data || []);
      setDrivers(drvRes.data.data || drvRes.data || []);
    } catch { setError('Failed to fetch.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleSearch = () => { if (page !== 1) setPage(1); else fetchData(); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!source || !dest || !vehicleId || !driverId || !cargoWeight || !plannedDist) { setError('Fill all required fields.'); return; }
    try { await api.post('/trips', { source, destination: dest, vehicle_id: parseInt(vehicleId), driver_id: parseInt(driverId), cargo_weight: parseFloat(cargoWeight), planned_distance: parseFloat(plannedDist), revenue: revenue ? parseFloat(revenue) : 0 }); setSuccess('Trip created.'); setShowModal(false); fetchData(); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed.'); }
  };

  const handleDispatch = async (id: number) => {
    try { await api.post(`/trips/${id}/dispatch`); setSuccess('Trip dispatched.'); fetchData(); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed.'); }
  };

  const handleComplete = async (id: number) => {
    const odo = prompt('Final odometer (km):'); if (!odo) return;
    const fuel = prompt('Fuel consumed (L):'); if (!fuel) return;
    const cost = prompt('Fuel cost ($):'); if (!cost) return;
    try { await api.post(`/trips/${id}/complete`, { final_odometer: parseFloat(odo), fuel_consumed: parseFloat(fuel), fuel_cost: parseFloat(cost) }); setSuccess('Trip completed.'); fetchData(); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed.'); }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm('Cancel this trip?')) return;
    try { await api.post(`/trips/${id}/cancel`); setSuccess('Trip cancelled.'); fetchData(); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed.'); }
  };

  const availVehicles = vehicles.filter(v => v.status === 'Available');
  const availDrivers = drivers.filter(d => d.status === 'Available');

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Shipping Dispatch</h2><p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">{trips.length} trips</p></div>
        {isFmDriver && <button onClick={() => { setSource(''); setDest(''); setVehicleId(''); setDriverId(''); setCargoWeight(''); setPlannedDist(''); setRevenue(''); setError(''); setShowModal(true); }} className={primaryButtonClass()}><Plus className="w-4 h-4" /> New Trip</button>}
      </div>
      <ErrorMessage message={error} /><SuccessMessage message={success} />
      <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
        <Search className="w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className={inputClass()} placeholder="Search by source or destination..." />
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
        {loading ? <div className="py-12 text-center text-slate-400 font-medium">Loading...</div> : trips.length === 0 ? <div className="py-12 text-center text-slate-500 italic">No trips scheduled.</div> : (
          <><div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full"><thead><tr className="bg-slate-50 dark:bg-slate-700/50"><th className={tableHeaderClass()}>Route</th><th className={tableHeaderClass()}>Vehicle</th><th className={tableHeaderClass()}>Driver</th><th className={tableHeaderClass() + ' text-right'}>Cargo</th><th className={tableHeaderClass()}>Status</th><th className={tableHeaderClass() + ' text-right'}>Actions</th></tr></thead>
            <tbody>{trips.map(t => (
              <tr key={t.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3"><p className="font-bold text-slate-900 dark:text-white">{t.source} → {t.destination}</p><p className="text-[10px] text-slate-500">{t.planned_distance} km</p></td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{t.vehicle_reg || `V#${t.vehicle_id}`}</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{t.driver_name || `D#${t.driver_id}`}</td>
                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{t.cargo_weight} kg</td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1.5">
                  {t.status === 'Draft' && isFmDriver && <><button onClick={() => handleDispatch(t.id)} className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer" title="Dispatch"><Send className="w-3.5 h-3.5" /></button><button onClick={() => handleCancel(t.id)} className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer" title="Cancel"><XCircle className="w-3.5 h-3.5" /></button></>}
                  {t.status === 'Dispatched' && isFmDriver && <><button onClick={() => handleComplete(t.id)} className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer" title="Complete"><CheckCircle className="w-3.5 h-3.5" /></button><button onClick={() => handleCancel(t.id)} className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer" title="Cancel"><XCircle className="w-3.5 h-3.5" /></button></>}
                </div></td>
              </tr>
            ))}</tbody></table>
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700"><h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2"><Route className="w-4 h-4 text-indigo-600" />New Trip</h3><button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"><X className="w-5 h-5" /></button></div>
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Source *</label><input value={source} onChange={e => setSource(e.target.value)} className={inputClass()} required /></div><div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Destination *</label><input value={dest} onChange={e => setDest(e.target.value)} className={inputClass()} required /></div></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Vehicle *</label><select value={vehicleId} onChange={e => setVehicleId(e.target.value)} className={selectClass()} required><option value="">Select...</option>{availVehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} (Cap: {v.max_load_capacity}kg)</option>)}</select></div><div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Driver *</label><select value={driverId} onChange={e => setDriverId(e.target.value)} className={selectClass()} required><option value="">Select...</option>{availDrivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div></div>
          <div className="grid grid-cols-3 gap-4"><div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Cargo (kg) *</label><input type="number" value={cargoWeight} onChange={e => setCargoWeight(e.target.value)} min="0" className={inputClass()} required /></div><div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Distance (km) *</label><input type="number" value={plannedDist} onChange={e => setPlannedDist(e.target.value)} min="0" className={inputClass()} required /></div><div><label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Revenue ($)</label><input type="number" value={revenue} onChange={e => setRevenue(e.target.value)} min="0" className={inputClass()} /></div></div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700"><button type="button" onClick={() => setShowModal(false)} className={secondaryButtonClass()}>Cancel</button><button type="submit" className={primaryButtonClass()}>Create Trip</button></div>
        </form>
      </div></div>)}
    </div>
  );
};

export default Trips;
