import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Edit2, Trash2, X, AlertTriangle, Info, Check } from 'lucide-react';

const Vehicles = () => {
  const { hasRole } = useContext(AuthContext);
  const isManager = hasRole(['Fleet Manager']);

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [regNum, setRegNum] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState('Truck');
  const [maxLoad, setMaxLoad] = useState('');
  const [odometer, setOdometer] = useState('0');
  const [acqCost, setAcqCost] = useState('');
  const [status, setStatus] = useState('Available');

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data);
    } catch (err) {
      setError('Failed to fetch vehicle list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setRegNum('');
    setModel('');
    setType('Truck');
    setMaxLoad('');
    setOdometer('0');
    setAcqCost('');
    setStatus('Available');
    setError('');
    setShowModal(true);
  };

  const openEditModal = (v) => {
    setEditingId(v.id);
    setRegNum(v.registration_number);
    setModel(v.model);
    setType(v.type);
    setMaxLoad(v.max_load_capacity.toString());
    setOdometer(v.odometer.toString());
    setAcqCost(v.acquisition_cost.toString());
    setStatus(v.status);
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/vehicles/${id}`);
      setSuccess('Vehicle deleted successfully.');
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete vehicle.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      registration_number: regNum,
      model,
      type,
      max_load_capacity: parseFloat(maxLoad),
      odometer: parseFloat(odometer),
      acquisition_cost: parseFloat(acqCost),
      status
    };

    if (!regNum || !model || !maxLoad || !acqCost) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/vehicles/${editingId}`, payload);
        setSuccess('Vehicle updated successfully.');
      } else {
        await api.post('/vehicles', payload);
        setSuccess('Vehicle registered successfully.');
      }
      setShowModal(false);
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save vehicle data.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Vehicle Registry</h2>
          <p className="text-slate-400 mt-1">Manage and track fleet assets, statuses, and specifications.</p>
        </div>
        {isManager && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors text-white shadow-md shadow-indigo-600/10"
          >
            <Plus size={16} />
            Register Vehicle
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

      {/* Vehicles Table */}
      <div className="glass-card rounded-2xl p-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading fleet information...</div>
        ) : vehicles.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            No vehicles registered. Click "Register Vehicle" to add fleet assets.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">Registration</th>
                  <th className="pb-3">Model</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Max Load Capacity</th>
                  <th className="pb-3">Current Odometer</th>
                  <th className="pb-3">Acquisition Cost</th>
                  <th className="pb-3 text-center">Status</th>
                  {isManager && <th className="pb-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="py-4 font-semibold text-slate-100">{v.registration_number}</td>
                    <td className="py-4">{v.model}</td>
                    <td className="py-4">{v.type}</td>
                    <td className="py-4">{v.max_load_capacity.toLocaleString()} kg</td>
                    <td className="py-4">{v.odometer.toLocaleString()} km</td>
                    <td className="py-4">${v.acquisition_cost.toLocaleString()}</td>
                    <td className="py-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                          v.status === 'Available'
                            ? 'bg-emerald-950/20 text-emerald-400 border-emerald-800/30'
                            : v.status === 'On Trip'
                            ? 'bg-indigo-950/20 text-indigo-400 border-indigo-800/30'
                            : v.status === 'In Shop'
                            ? 'bg-amber-950/20 text-amber-400 border-amber-800/30'
                            : 'bg-rose-950/20 text-rose-400 border-rose-800/30'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    {isManager && (
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(v)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800/40 transition-all"
                            title="Edit Vehicle"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/40 transition-all"
                            title="Delete Vehicle"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CRUD Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0c101e] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-200">
                {editingId ? 'Edit Vehicle Details' : 'Register New Vehicle'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Registration No *
                  </label>
                  <input
                    type="text"
                    value={regNum}
                    onChange={(e) => setRegNum(e.target.value)}
                    placeholder="E.g., REG-V05"
                    className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Model/Name *
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="E.g., Van-05 / Ford Transit"
                    className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Vehicle Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Box Truck">Box Truck</option>
                    <option value="Sedan">Sedan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Max Capacity (kg) *
                  </label>
                  <input
                    type="number"
                    value={maxLoad}
                    onChange={(e) => setMaxLoad(e.target.value)}
                    placeholder="E.g., 500"
                    min="1"
                    className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Odometer (km)
                  </label>
                  <input
                    type="number"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    min="0"
                    className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Acquisition Cost ($) *
                  </label>
                  <input
                    type="number"
                    value={acqCost}
                    onChange={(e) => setAcqCost(e.target.value)}
                    placeholder="E.g., 25000"
                    min="0"
                    className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {editingId && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Operational Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="In Shop">In Shop</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              )}

              {/* Submit buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-800 hover:bg-slate-850 hover:text-slate-200 text-sm font-semibold text-slate-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 transition-colors"
                >
                  {editingId ? 'Save Changes' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
