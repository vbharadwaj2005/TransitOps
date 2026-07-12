import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Edit2, Trash2, X, AlertTriangle, AlertOctagon, Check, ShieldAlert } from 'lucide-react';

const Drivers = () => {
  const { hasRole } = useContext(AuthContext);
  const canModify = hasRole(['Fleet Manager', 'Safety Officer']);

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseCategory, setLicenseCategory] = useState('Class A');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [safetyScore, setSafetyScore] = useState('100');
  const [status, setStatus] = useState('Available');

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/drivers');
      setDrivers(response.data);
    } catch (err) {
      setError('Failed to fetch driver list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setLicenseNumber('');
    setLicenseCategory('Class A');
    setLicenseExpiryDate('');
    setContactNumber('');
    setSafetyScore('100');
    setStatus('Available');
    setError('');
    setShowModal(true);
  };

  const openEditModal = (d) => {
    setEditingId(d.id);
    setName(d.name);
    setLicenseNumber(d.license_number);
    setLicenseCategory(d.license_category);
    setLicenseExpiryDate(d.license_expiry_date.split('T')[0]); // Extract date
    setContactNumber(d.contact_number);
    setSafetyScore(d.safety_score.toString());
    setStatus(d.status);
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/drivers/${id}`);
      setSuccess('Driver deleted successfully.');
      fetchDrivers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete driver.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      name,
      license_number: licenseNumber,
      license_category: licenseCategory,
      license_expiry_date: licenseExpiryDate,
      contact_number: contactNumber,
      safety_score: parseFloat(safetyScore),
      status
    };

    if (!name || !licenseNumber || !licenseExpiryDate || !contactNumber) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/drivers/${editingId}`, payload);
        setSuccess('Driver information updated successfully.');
      } else {
        await api.post('/drivers', payload);
        setSuccess('Driver registered successfully.');
      }
      setShowModal(false);
      fetchDrivers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save driver details.');
    }
  };

  // Check if license is expired
  const isLicenseExpired = (expiryStr) => {
    const expiry = new Date(expiryStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expiry < today;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Driver Registry</h2>
          <p className="text-slate-400 mt-1">Manage driver credentials, safety records, and assignments.</p>
        </div>
        {canModify && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors text-white shadow-md"
          >
            <Plus size={16} />
            Register Driver
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

      {/* Drivers List */}
      <div className="glass-card rounded-2xl p-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading operator database...</div>
        ) : drivers.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            No drivers registered. Click "Register Driver" to seed entries.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">License Number</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">License Expiry</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3 text-center">Safety Score</th>
                  <th className="pb-3 text-center">Status</th>
                  {canModify && <th className="pb-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {drivers.map((d) => {
                  const expired = isLicenseExpired(d.license_expiry_date);
                  const isLowScore = d.safety_score < 70;
                  return (
                    <tr key={d.id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-4">
                        <div className="font-semibold text-slate-100">{d.name}</div>
                      </td>
                      <td className="py-4 font-mono">{d.license_number}</td>
                      <td className="py-4">{d.license_category}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-1.5">
                          <span>{new Date(d.license_expiry_date).toLocaleDateString()}</span>
                          {expired && (
                            <span
                              className="inline-flex items-center gap-1 rounded bg-rose-950/40 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-800/20"
                              title="License Expired"
                            >
                              <AlertOctagon size={10} />
                              EXPIRED
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-slate-400">{d.contact_number}</td>
                      <td className="py-4 text-center">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-xs ${
                            isLowScore
                              ? 'bg-rose-950/30 text-rose-400 border border-rose-800/20'
                              : d.safety_score < 85
                              ? 'bg-amber-950/30 text-amber-400 border border-amber-800/20'
                              : 'bg-emerald-950/30 text-emerald-400 border border-emerald-800/20'
                          }`}
                        >
                          {d.safety_score} / 100
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                            d.status === 'Available'
                              ? 'bg-emerald-950/20 text-emerald-400 border-emerald-800/30'
                              : d.status === 'On Trip'
                              ? 'bg-indigo-950/20 text-indigo-400 border-indigo-800/30'
                              : 'bg-rose-950/20 text-rose-400 border-rose-800/30'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      {canModify && (
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(d)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800/40 transition-all"
                              title="Edit Driver"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(d.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/40 transition-all"
                              title="Delete Driver"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
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
                {editingId ? 'Edit Driver Info' : 'Register Operator'}
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
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g., John Doe"
                  className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    License Number *
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="E.g., LIC-JOHN123"
                    className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    License Category
                  </label>
                  <select
                    value={licenseCategory}
                    onChange={(e) => setLicenseCategory(e.target.value)}
                    className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="Class A">Class A</option>
                    <option value="Class B">Class B</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Specialized">Specialized</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    License Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={licenseExpiryDate}
                    onChange={(e) => setLicenseExpiryDate(e.target.value)}
                    className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="E.g., +123456789"
                    className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Safety Score (0 - 100)
                  </label>
                  <input
                    type="number"
                    value={safetyScore}
                    onChange={(e) => setSafetyScore(e.target.value)}
                    min="0"
                    max="100"
                    className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

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
                  {editingId ? 'Save Changes' : 'Register Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;
