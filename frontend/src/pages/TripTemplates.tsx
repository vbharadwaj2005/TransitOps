import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, X, Copy, Clock, MapPin, Users, DollarSign, Route } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { inputClass, selectClass, primaryButtonClass, secondaryButtonClass } from '../utils/helpers';

interface Template { id: number; name: string; route_name: string; driver_name: string; driver_id: number; vehicle_reg: string; vehicle_id: number; departure_time: string; estimated_duration: number; estimated_distance: number; estimated_cost: number; estimated_revenue: number; passenger_capacity: number; recurring: string; notes: string; }
interface Vehicle { id: number; registration_number: string; capacity: number; status: string; }
interface Driver { id: number; name: string; }

const TripTemplates = () => {
  const { hasRole } = useContext(AuthContext);
  const isManager = hasRole(['Fleet Manager']);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState(''); const [routeName, setRouteName] = useState(''); const [driverId, setDriverId] = useState(''); const [vehicleId, setVehicleId] = useState(''); const [departureTime, setDepartureTime] = useState('08:00'); const [duration, setDuration] = useState(''); const [distance, setDistance] = useState(''); const [cost, setCost] = useState(''); const [revenue, setRevenue] = useState(''); const [capacity, setCapacity] = useState(''); const [recurring, setRecurring] = useState('daily'); const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const tempRes = await api.get(`/trip-templates?page=${page}&per_page=15`);
        const data = tempRes.data;
        setTemplates(data.data || data.templates || data || []);
        setTotalPages(data.pages || 1);
        const vehRes = await api.get('/vehicles'); setVehicles((vehRes.data.data || vehRes.data || []).filter((v: Vehicle) => v.status !== 'Retired'));
        const drvRes = await api.get('/drivers'); setDrivers(drvRes.data.data || drvRes.data || []);
      } catch { setError('Failed to fetch templates.'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [page]);

  const openCreate = () => { setEditId(null); setName(''); setRouteName(''); setDriverId(''); setVehicleId(''); setDepartureTime('08:00'); setDuration(''); setDistance(''); setCost(''); setRevenue(''); setCapacity(''); setRecurring('daily'); setNotes(''); setError(''); setShowModal(true); };

  const openEdit = (t: Template) => { setEditId(t.id); setName(t.name); setRouteName(t.route_name); setDriverId(String(t.driver_id || '')); setVehicleId(String(t.vehicle_id || '')); setDepartureTime(t.departure_time); setDuration(String(t.estimated_duration || '')); setDistance(String(t.estimated_distance || '')); setCost(String(t.estimated_cost || '')); setRevenue(String(t.estimated_revenue || '')); setCapacity(String(t.passenger_capacity || '')); setRecurring(t.recurring || 'daily'); setNotes(t.notes || ''); setError(''); setShowModal(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!name || !routeName || !departureTime) { setError('Name, route, departure time required.'); return; }
    const payload = { name, route_name: routeName, driver_id: driverId ? parseInt(driverId) : null, vehicle_id: vehicleId ? parseInt(vehicleId) : null, departure_time: departureTime, estimated_duration: duration ? parseFloat(duration) : null, estimated_distance: distance ? parseFloat(distance) : null, estimated_cost: cost ? parseFloat(cost) : null, estimated_revenue: revenue ? parseFloat(revenue) : null, passenger_capacity: capacity ? parseInt(capacity) : null, recurring, notes };
    try {
      if (editId) { await api.put(`/trip-templates/${editId}`, payload); setSuccess('Template updated.'); }
      else { await api.post('/trip-templates', payload); setSuccess('Template created.'); }
      setShowModal(false);
      const res = await api.get(`/trip-templates?page=${page}&per_page=15`);
      setTemplates(res.data.data || res.data.templates || res.data || []);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed.'); }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Trip Templates</h2><p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Reusable trip configurations.</p></div>
        {isManager && <button onClick={openCreate} className={primaryButtonClass()}><Plus className="w-4 h-4" /> New Template</button>}
      </div>
      <ErrorMessage message={error} /><SuccessMessage message={success} />
      {loading && !templates.length ? <div className="py-16 text-center text-slate-400 italic">Loading...</div> : !templates.length ? <div className="py-16 text-center text-slate-500 italic rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">No trip templates yet.</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(t => (
            <div key={t.id} className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-3">
                <div><h3 className="font-bold text-slate-900 dark:text-white">{t.name}</h3><p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{t.route_name}</p></div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600">{t.recurring?.charAt(0).toUpperCase() + t.recurring?.slice(1)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{t.departure_time}</div>
                <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{t.estimated_distance ? `${t.estimated_distance} km` : '-'}</div>
                <div className="flex items-center gap-1.5"><Users className="w-3 h-3" />{t.passenger_capacity ? `${t.passenger_capacity} seats` : '-'}</div>
                <div className="flex items-center gap-1.5"><DollarSign className="w-3 h-3" />{t.estimated_revenue ? `$${t.estimated_revenue}` : '-'}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={async () => {
                  try {
                    const parts = t.route_name.split(' to ');
                    await api.post('/trips', {
                      source: parts[0] || t.route_name,
                      destination: parts[1] || t.route_name,
                      vehicle_id: t.vehicle_id,
                      driver_id: t.driver_id,
                      cargo_weight: (t.passenger_capacity || 1) * 50,
                      planned_distance: t.estimated_distance || 0,
                      revenue: t.estimated_revenue || 0
                    });
                    setSuccess('Trip created from template.');
                  } catch (err: any) { setError(err.response?.data?.message || 'Failed.'); }
                }} className="flex-1 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"><Copy className="w-3 h-3" /> Use</button>
                {isManager && <><button onClick={() => openEdit(t)} className={secondaryButtonClass() + ' text-xs px-3 py-2'}>Edit</button></>}
              </div>
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-all cursor-pointer disabled:cursor-default">Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all cursor-pointer ${p === page ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>{p}</button>)}
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-all cursor-pointer disabled:cursor-default">Next</button>
        </div>
      )}
      {showModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"><div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700"><h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2"><Route className="w-4 h-4 text-indigo-600" />{editId ? 'Edit Template' : 'New Template'}</h3><button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button></div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Name *</label><input value={name} onChange={e => setName(e.target.value)} className={inputClass()} required /></div><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Route Name *</label><input value={routeName} onChange={e => setRouteName(e.target.value)} className={inputClass()} required /></div></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Driver</label><select value={driverId} onChange={e => setDriverId(e.target.value)} className={selectClass()}><option value="">None</option>{drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Vehicle</label><select value={vehicleId} onChange={e => setVehicleId(e.target.value)} className={selectClass()}><option value="">None</option>{vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number}</option>)}</select></div></div>
          <div className="grid grid-cols-3 gap-4"><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Departure *</label><input type="time" value={departureTime} onChange={e => setDepartureTime(e.target.value)} className={inputClass()} required /></div><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Duration (hrs)</label><input type="number" value={duration} onChange={e => setDuration(e.target.value)} min="0" step="0.5" className={inputClass()} /></div><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Distance (km)</label><input type="number" value={distance} onChange={e => setDistance(e.target.value)} min="0" step="0.1" className={inputClass()} /></div></div>
          <div className="grid grid-cols-3 gap-4"><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Cost ($)</label><input type="number" value={cost} onChange={e => setCost(e.target.value)} min="0" step="0.01" className={inputClass()} /></div><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Revenue ($)</label><input type="number" value={revenue} onChange={e => setRevenue(e.target.value)} min="0" step="0.01" className={inputClass()} /></div><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Capacity</label><input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} min="0" className={inputClass()} /></div></div>
          <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Recurring</label><select value={recurring} onChange={e => setRecurring(e.target.value)} className={selectClass()}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="weekdays">Weekdays</option><option value="custom">Custom</option></select></div>
          <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={inputClass() + ' resize-none'} /></div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700"><button type="button" onClick={() => setShowModal(false)} className={secondaryButtonClass()}>Cancel</button><button type="submit" className={primaryButtonClass()}>{editId ? 'Update' : 'Create'}</button></div>
        </form>
      </div></div>)}
    </div>
  );
};

export default TripTemplates;
