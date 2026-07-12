import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Edit2, Trash2, AlertOctagon } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import Modal from '../components/Modal';

interface Driver {
  id: number;
  name: string;
  license_number: string;
  license_category: string;
  license_expiry_date: string;
  contact_number: string;
  safety_score: number;
  status: string;
}

const Drivers = () => {
  const { hasRole } = useContext(AuthContext);
  const canModify = hasRole(['Fleet Manager', 'Safety Officer']);

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseCategory, setLicenseCategory] = useState('Class A');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [safetyScore, setSafetyScore] = useState('100');
  const [status, setStatus] = useState('Available');

  const fetchDrivers = async () => {
    setLoading(true);
    try { const r = await api.get('/drivers'); setDrivers(r.data); } catch { setError('Failed to fetch driver list.'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchDrivers(); }, []);

  const openAddModal = () => {
    setEditingId(null); setName(''); setLicenseNumber(''); setLicenseCategory('Class A'); setLicenseExpiryDate(''); setContactNumber(''); setSafetyScore('100'); setStatus('Available'); setError(''); setShowModal(true);
  };

  const openEditModal = (d: Driver) => {
    setEditingId(d.id); setName(d.name); setLicenseNumber(d.license_number); setLicenseCategory(d.license_category);
    setLicenseExpiryDate(d.license_expiry_date.split('T')[0]); setContactNumber(d.contact_number); setSafetyScore(d.safety_score.toString()); setStatus(d.status); setError(''); setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    setError(''); setSuccess('');
    try { await api.delete(`/drivers/${id}`); setSuccess('Driver deleted successfully.'); fetchDrivers(); } catch (err: any) { setError(err.response?.data?.message || 'Failed to delete driver.'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    const payload = { name, license_number: licenseNumber, license_category: licenseCategory, license_expiry_date: licenseExpiryDate, contact_number: contactNumber, safety_score: parseFloat(safetyScore), status };
    if (!name || !licenseNumber || !licenseExpiryDate || !contactNumber) { setError('Please fill in all required fields.'); return; }
    try {
      if (editingId) { await api.put(`/drivers/${editingId}`, payload); setSuccess('Driver information updated successfully.'); } else { await api.post('/drivers', payload); setSuccess('Driver registered successfully.'); }
      setShowModal(false); fetchDrivers();
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to save driver details.'); }
  };

  const isLicenseExpired = (expiryStr: string) => new Date(expiryStr) < new Date(new Date().setHours(0, 0, 0, 0));

  const safetyBadge = (score: number) => {
    if (score < 70) return 'bg-rose-50 text-rose-700 border border-rose-200';
    if (score < 85) return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-3xl font-bold tracking-tight text-slate-900">Driver Registry</h2><p className="text-slate-500 mt-1">Manage driver credentials, safety records, and assignments.</p></div>
        {canModify && <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors text-white shadow-md cursor-pointer"><Plus size={16} /> Register Driver</button>}
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <div className="glass-card rounded-2xl p-6">
        {loading ? (<div className="py-12 text-center text-slate-400">Loading operator database...</div>)
        : drivers.length === 0 ? (<div className="py-12 text-center text-slate-500">No drivers registered.</div>)
        : (<div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="pb-3">Name</th><th className="pb-3">License Number</th><th className="pb-3">Category</th>
                  <th className="pb-3">License Expiry</th><th className="pb-3">Contact</th><th className="pb-3 text-center">Safety Score</th>
                  <th className="pb-3 text-center">Status</th>{canModify && <th className="pb-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drivers.map((d) => {
                  const expired = isLicenseExpired(d.license_expiry_date);
                  return (<tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-semibold text-slate-900">{d.name}</td>
                    <td className="py-4 font-mono text-slate-700">{d.license_number}</td>
                    <td className="py-4 text-slate-700">{d.license_category}</td>
                    <td className="py-4 text-slate-700"><div className="flex items-center gap-1.5"><span>{new Date(d.license_expiry_date).toLocaleDateString()}</span>{expired && (<span className="inline-flex items-center gap-1 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-200"><AlertOctagon size={10} />EXPIRED</span>)}</div></td>
                    <td className="py-4 text-slate-500">{d.contact_number}</td>
                    <td className="py-4 text-center"><span className={`font-bold px-2 py-0.5 rounded text-xs ${safetyBadge(d.safety_score)}`}>{d.safety_score} / 100</span></td>
                    <td className="py-4 text-center"><StatusBadge status={d.status} /></td>
                    {canModify && <td className="py-4 text-right"><div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(d)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-all cursor-pointer"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-all cursor-pointer"><Trash2 size={16} /></button>
                    </div></td>}
                  </tr>);
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editingId ? 'Edit Driver Info' : 'Register Operator'} onClose={() => setShowModal(false)}>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Full Name *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="E.g., John Doe" className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">License Number *</label><input type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="E.g., LIC-JOHN123" className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required /></div>
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">License Category</label><select value={licenseCategory} onChange={(e) => setLicenseCategory(e.target.value)} className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500"><option value="Class A">Class A</option><option value="Class B">Class B</option><option value="Commercial">Commercial</option><option value="Specialized">Specialized</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">License Expiry Date *</label><input type="date" value={licenseExpiryDate} onChange={(e) => setLicenseExpiryDate(e.target.value)} className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required /></div>
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Contact Number *</label><input type="text" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="E.g., +123456789" className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Safety Score (0-100)</label><input type="number" value={safetyScore} onChange={(e) => setSafetyScore(e.target.value)} min="0" max="100" className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" /></div>
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status</label><select value={status} onChange={(e) => setStatus(e.target.value)} className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500"><option value="Available">Available</option><option value="On Trip">On Trip</option><option value="Suspended">Suspended</option></select></div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm font-semibold text-slate-500 transition-colors cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-md transition-colors cursor-pointer">{editingId ? 'Save Changes' : 'Register Driver'}</button>
              </div>
            </form>
        </Modal>
      )}
    </div>
  );
};

export default Drivers;
