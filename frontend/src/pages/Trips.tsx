import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import Modal from '../components/Modal';

interface Trip {
  id: number; source: string; destination: string; vehicle_id: number; driver_id: number;
  cargo_weight: number; planned_distance: number; revenue: number; final_odometer: number | null;
  fuel_consumed: number | null; status: string; vehicle_odometer?: number;
  vehicle_reg?: string; vehicle_model?: string; driver_name?: string;
}

interface Vehicle { id: number; registration_number: string; model: string; max_load_capacity: number; status: string; odometer: number; }
interface Driver { id: number; name: string; license_category: string; license_expiry_date: string; status: string; }

const Trips = () => {
  const { hasRole } = useContext(AuthContext);
  const isManager = hasRole(['Fleet Manager']);
  const canModifyStatus = isManager || hasRole(['Driver']);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [plannedDistance, setPlannedDistance] = useState('');
  const [revenue, setRevenue] = useState('');

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [finalOdo, setFinalOdo] = useState('');
  const [fuelConsumed, setFuelConsumed] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [selectedTripCurrentOdo, setSelectedTripCurrentOdo] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tripRes, vehicleRes, driverRes] = await Promise.all([api.get('/trips'), api.get('/vehicles'), api.get('/drivers')]);
      setTrips(tripRes.data); setVehicles(vehicleRes.data); setDrivers(driverRes.data);
    } catch { setError('Failed to fetch data from backend server.'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  const availableDrivers = drivers.filter(d => d.status === 'Available');

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    const selectedVehicle = vehicles.find(v => v.id === parseInt(vehicleId));
    const selectedDriver = drivers.find(d => d.id === parseInt(driverId));
    if (!selectedVehicle || !selectedDriver) { setError('Please select a valid vehicle and driver.'); return; }
    if (parseFloat(cargoWeight) > selectedVehicle.max_load_capacity) { setError(`Cargo weight exceeds the vehicle max load capacity of ${selectedVehicle.max_load_capacity} kg.`); return; }
    if (new Date(selectedDriver.license_expiry_date) < new Date()) { setError('Cannot dispatch: Selected driver license has expired.'); return; }
    try {
      await api.post('/trips', { source, destination, vehicle_id: parseInt(vehicleId), driver_id: parseInt(driverId), cargo_weight: parseFloat(cargoWeight), planned_distance: parseFloat(plannedDistance), revenue: parseFloat(revenue || '0') });
      setSuccess('Trip schedule drafted successfully.'); setShowAddModal(false); fetchData();
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to create trip planning entry.'); }
  };

  const handleDispatch = async (tripId: number) => {
    setError(''); setSuccess('');
    try { await api.post(`/trips/${tripId}/dispatch`); setSuccess('Trip dispatched successfully.'); fetchData(); } catch (err: any) { setError(err.response?.data?.message || 'Failed to dispatch trip.'); }
  };

  const handleCancel = async (tripId: number) => {
    if (!window.confirm('Are you sure you want to cancel this trip?')) return;
    setError(''); setSuccess('');
    try { await api.post(`/trips/${tripId}/cancel`); setSuccess('Trip cancelled successfully.'); fetchData(); } catch (err: any) { setError(err.response?.data?.message || 'Failed to cancel trip.'); }
  };

  const openCompleteModal = (trip: Trip) => {
    setSelectedTripId(trip.id); setSelectedTripCurrentOdo(trip.vehicle_odometer || 0);
    setFinalOdo(((trip.vehicle_odometer || 0) + trip.planned_distance).toString()); setFuelConsumed(''); setFuelCost(''); setError(''); setShowCompleteModal(true);
  };

  const handleCompleteTrip = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    const odoVal = parseFloat(finalOdo);
    if (odoVal <= selectedTripCurrentOdo) { setError(`Final odometer must be strictly greater than start odometer of ${selectedTripCurrentOdo} km.`); return; }
    try {
      await api.post(`/trips/${selectedTripId}/complete`, { final_odometer: odoVal, fuel_consumed: parseFloat(fuelConsumed || '0'), fuel_cost: parseFloat(fuelCost || '0') });
      setSuccess('Trip completed.'); setShowCompleteModal(false); fetchData();
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to complete trip.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-3xl font-bold tracking-tight text-slate-900">Trip Planner</h2><p className="text-slate-500 mt-1">Schedule cargo dispatches, transition statuses, and log metrics.</p></div>
        {isManager && <button onClick={() => { setShowAddModal(true); setError(''); }} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors text-white shadow-md cursor-pointer"><Plus size={16} /> Plan Trip</button>}
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <div className="glass-card rounded-2xl p-6">
        {loading ? (<div className="py-12 text-center text-slate-400">Loading scheduled dispatches...</div>)
        : trips.length === 0 ? (<div className="py-12 text-center text-slate-500">No trips scheduled.</div>)
        : (<div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead><tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="pb-3">Route</th><th className="pb-3">Vehicle</th><th className="pb-3">Driver</th>
                <th className="pb-3">Cargo</th><th className="pb-3">Distance</th><th className="pb-3">Revenue</th>
                <th className="pb-3 text-center">Status</th><th className="pb-3 text-right">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {trips.map((t) => (<tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4"><div className="flex items-center gap-2"><span className="font-semibold text-slate-900">{t.source}</span><ArrowRight size={14} className="text-indigo-600" /><span className="font-semibold text-slate-900">{t.destination}</span></div></td>
                  <td className="py-4 text-xs"><p className="font-semibold text-slate-900">{t.vehicle_reg}</p><p className="text-slate-500">{t.vehicle_model}</p></td>
                  <td className="py-4"><p className="font-semibold text-slate-900">{t.driver_name}</p></td>
                  <td className="py-4 text-slate-700">{t.cargo_weight} kg</td>
                  <td className="py-4 text-slate-700">{t.planned_distance} km</td>
                  <td className="py-4 font-mono font-semibold text-emerald-700">${t.revenue?.toLocaleString()}</td>
                  <td className="py-4 text-center"><StatusBadge status={t.status} /></td>
                  <td className="py-4 text-right"><div className="flex items-center justify-end gap-2">
                    {t.status === 'Draft' && isManager && <button onClick={() => handleDispatch(t.id)} className="flex items-center gap-1 px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer shadow-sm"><Play size={12} /> Dispatch</button>}
                    {t.status === 'Dispatched' && canModifyStatus && (<><button onClick={() => openCompleteModal(t)} className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors cursor-pointer shadow-sm"><CheckCircle2 size={12} /> Complete</button><button onClick={() => handleCancel(t.id)} className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition-colors cursor-pointer shadow-sm">Cancel</button></>)}
                    {(t.status === 'Completed' || t.status === 'Cancelled') && <span className="text-xs text-slate-400 italic">No actions</span>}
                  </div></td>
                </tr>))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <Modal title="Plan New Dispatch" onClose={() => setShowAddModal(false)}>
            <form onSubmit={handleCreateTrip} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Source *</label><input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Warehouse A" className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required /></div>
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Destination *</label><input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Retail Outlet B" className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required /></div>
              </div>
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Assign Vehicle *</label><select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500" required><option value="">Select Available Vehicle...</option>{availableVehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} - {v.model} (Max Load: {v.max_load_capacity}kg)</option>)}</select></div>
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Assign Driver *</label><select value={driverId} onChange={(e) => setDriverId(e.target.value)} className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500" required><option value="">Select Available Driver...</option>{availableDrivers.map(d => <option key={d.id} value={d.id}>{d.name} (License: {d.license_category})</option>)}</select></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Cargo (kg) *</label><input type="number" value={cargoWeight} onChange={(e) => setCargoWeight(e.target.value)} placeholder="200" min="1" className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required /></div>
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Distance (km) *</label><input type="number" value={plannedDistance} onChange={(e) => setPlannedDistance(e.target.value)} placeholder="120" min="1" className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required /></div>
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Revenue ($) *</label><input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} placeholder="400" min="0" className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required /></div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm font-semibold text-slate-500 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-md cursor-pointer">Draft Trip</button>
              </div>
            </form>
        </Modal>
      )}

      {showCompleteModal && (
        <Modal title="Log Trip Metrics & Complete" onClose={() => setShowCompleteModal(false)}>
            <form onSubmit={handleCompleteTrip} className="p-6 space-y-4">
              <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200 text-slate-600 text-xs">Completing this trip requires logging operational costs.</div>
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Final Odometer (km) * (Must exceed {selectedTripCurrentOdo})</label><input type="number" value={finalOdo} onChange={(e) => setFinalOdo(e.target.value)} className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Fuel Consumed (L) *</label><input type="number" value={fuelConsumed} onChange={(e) => setFuelConsumed(e.target.value)} min="0.1" step="0.01" className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required /></div>
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Fuel Cost ($) *</label><input type="number" value={fuelCost} onChange={(e) => setFuelCost(e.target.value)} min="0.01" step="0.01" className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required /></div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setShowCompleteModal(false)} className="px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm font-semibold text-slate-500 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white shadow-md cursor-pointer">Complete Trip</button>
              </div>
            </form>
        </Modal>
      )}
    </div>
  );
};

export default Trips;
