import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import Modal from '../components/Modal';

interface Vehicle {
  id: number;
  registration_number: string;
  model: string;
  type: string;
  max_load_capacity: number;
  odometer: number;
  acquisition_cost: number;
  status: string;
}

const Vehicles = () => {
  const { hasRole } = useContext(AuthContext);
  const isManager = hasRole(['Fleet Manager']);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [regNum, setRegNum] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState('Truck');
  const [maxLoad, setMaxLoad] = useState('');
  const [odometer, setOdometer] = useState('0');
  const [acqCost, setAcqCost] = useState('');
  const [status, setStatus] = useState('Available');

  const fetchVehicles = async () => {
    setLoading(true);
    try { const r = await api.get('/vehicles'); setVehicles(r.data); } catch { setError('Failed to fetch vehicle list.'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const openAddModal = () => {
    setEditingId(null); setRegNum(''); setModel(''); setType('Truck'); setMaxLoad(''); setOdometer('0'); setAcqCost(''); setStatus('Available'); setError(''); setShowModal(true);
  };

  const openEditModal = (v: Vehicle) => {
    setEditingId(v.id); setRegNum(v.registration_number); setModel(v.model); setType(v.type);
    setMaxLoad(v.max_load_capacity.toString()); setOdometer(v.odometer.toString()); setAcqCost(v.acquisition_cost.toString()); setStatus(v.status); setError(''); setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    setError(''); setSuccess('');
    try { await api.delete(`/vehicles/${id}`); setSuccess('Vehicle deleted successfully.'); fetchVehicles(); } catch (err: any) { setError(err.response?.data?.message || 'Failed to delete vehicle.'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    const payload = { registration_number: regNum, model, type, max_load_capacity: parseFloat(maxLoad), odometer: parseFloat(odometer), acquisition_cost: parseFloat(acqCost), status };
    if (!regNum || !model || !maxLoad || !acqCost) { setError('Please fill in all required fields.'); return; }
    try {
      if (editingId) { await api.put(`/vehicles/${editingId}`, payload); setSuccess('Vehicle updated successfully.'); } else { await api.post('/vehicles', payload); setSuccess('Vehicle registered successfully.'); }
      setShowModal(false); fetchVehicles();
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to save vehicle data.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Vehicle Registry</h2>
          <p className="text-slate-500 mt-1">Manage and track fleet assets, statuses, and specifications.</p>
        </div>
        {isManager && <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors text-white shadow-md cursor-pointer"><Plus size={16} /> Register Vehicle</button>}
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <div className="glass-card rounded-2xl p-6">
        {loading ? (<div className="py-12 text-center text-slate-400">Loading fleet information...</div>)
        : vehicles.length === 0 ? (<div className="py-12 text-center text-slate-500">No vehicles registered. Click "Register Vehicle" to add fleet assets.</div>)
        : (<div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="pb-3">Registration</th><th className="pb-3">Model</th><th className="pb-3">Type</th>
                  <th className="pb-3">Max Load Capacity</th><th className="pb-3">Current Odometer</th><th className="pb-3">Acquisition Cost</th>
                  <th className="pb-3 text-center">Status</th>{isManager && <th className="pb-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-semibold text-slate-900">{v.registration_number}</td>
                    <td className="py-4 text-slate-700">{v.model}</td>
                    <td className="py-4 text-slate-700">{v.type}</td>
                    <td className="py-4 text-slate-700">{v.max_load_capacity.toLocaleString()} kg</td>
                    <td className="py-4 text-slate-700">{v.odometer.toLocaleString()} km</td>
                    <td className="py-4 text-slate-700">${v.acquisition_cost.toLocaleString()}</td>
                    <td className="py-4 text-center"><StatusBadge status={v.status} /></td>
                    {isManager && <td className="py-4 text-right"><div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(v)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-all cursor-pointer" title="Edit Vehicle"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(v.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-all cursor-pointer" title="Delete Vehicle"><Trash2 size={16} /></button>
                    </div></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editingId ? 'Edit Vehicle Details' : 'Register New Vehicle'} onClose={() => setShowModal(false)}>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Registration No *</label><input type="text" value={regNum} onChange={(e) => setRegNum(e.target.value)} placeholder="E.g., REG-V05" className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required /></div>
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Model/Name *</label><input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="E.g., Van-05 / Ford Transit" className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Vehicle Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500"><option value="Truck">Truck</option><option value="Van">Van</option><option value="Box Truck">Box Truck</option><option value="Sedan">Sedan</option></select></div>
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Max Capacity (kg) *</label><input type="number" value={maxLoad} onChange={(e) => setMaxLoad(e.target.value)} placeholder="E.g., 500" min="1" className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Odometer (km)</label><input type="number" value={odometer} onChange={(e) => setOdometer(e.target.value)} min="0" className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" /></div>
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Acquisition Cost ($) *</label><input type="number" value={acqCost} onChange={(e) => setAcqCost(e.target.value)} placeholder="E.g., 25000" min="0" className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required /></div>
              </div>
              {editingId && (<div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Operational Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500"><option value="Available">Available</option><option value="On Trip">On Trip</option><option value="In Shop">In Shop</option><option value="Retired">Retired</option></select></div>)}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm font-semibold text-slate-500 transition-colors cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-md transition-colors cursor-pointer">{editingId ? 'Save Changes' : 'Register Vehicle'}</button>
              </div>
            </form>
        </Modal>
      )}
    </div>
  );
};

export default Vehicles;
