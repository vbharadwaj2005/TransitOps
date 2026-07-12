import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, DollarSign, Fuel, Filter } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import Modal from '../components/Modal';

interface Expense { id: number; vehicle_id: number | null; amount: number; expense_type: string; description: string; date: string; vehicle_reg?: string; vehicle_model?: string; }
interface Vehicle { id: number; registration_number: string; model: string; status: string; odometer: number; }
interface Driver { id: number; name: string; }

const Expenses = () => {
  const { hasRole } = useContext(AuthContext);
  const isFinanceOrManager = hasRole(['Financial Analyst', 'Fleet Manager']);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [showFuelModal, setShowFuelModal] = useState(false);
  const [fuelVehicleId, setFuelVehicleId] = useState('');
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [fuelDate, setFuelDate] = useState(new Date().toISOString().split('T')[0]);

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expVehicleId, setExpVehicleId] = useState('');
  const [expType, setExpType] = useState('Other');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expDesc, setExpDesc] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try { const [expRes, vehicleRes, driverRes] = await Promise.all([api.get('/expenses'), api.get('/vehicles'), api.get('/drivers')]); setExpenses(expRes.data); setVehicles(vehicleRes.data); setDrivers(driverRes.data); } catch { setError('Failed to fetch financial data.'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogFuel = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!fuelVehicleId || !fuelLiters || !fuelCost || !fuelDate) { setError('Please fill in all required fields.'); return; }
    try { await api.post('/expenses/fuel', { vehicle_id: parseInt(fuelVehicleId), liters: parseFloat(fuelLiters), cost: parseFloat(fuelCost), date: fuelDate }); setSuccess('Fuel log recorded.'); setShowFuelModal(false); fetchData(); } catch (err: any) { setError(err.response?.data?.message || 'Failed to submit fuel log.'); }
  };

  const handleLogExpense = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!expAmount || !expDate || !expDesc) { setError('Please fill in all required fields.'); return; }
    try { await api.post('/expenses', { vehicle_id: expVehicleId ? parseInt(expVehicleId) : null, expense_type: expType, amount: parseFloat(expAmount), date: expDate, description: expDesc }); setSuccess('Expense logged.'); setShowExpenseModal(false); fetchData(); } catch (err: any) { setError(err.response?.data?.message || 'Failed to record expense.'); }
  };

  const filteredExpenses = expenses.filter(e => typeFilter ? e.expense_type === typeFilter : true);
  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="text-3xl font-bold tracking-tight text-slate-900">Expenses Ledger</h2><p className="text-slate-500 mt-1">Audit vehicle operational expenditures, fuel receipts, and manual bills.</p></div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setFuelVehicleId(''); setFuelLiters(''); setFuelCost(''); setFuelDate(new Date().toISOString().split('T')[0]); setError(''); setShowFuelModal(true); }} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"><Fuel size={16} /> Log Fuel</button>
          {isFinanceOrManager && <button onClick={() => { setExpVehicleId(''); setExpType('Other'); setExpAmount(''); setExpDate(new Date().toISOString().split('T')[0]); setExpDesc(''); setError(''); setShowExpenseModal(true); }} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors text-white shadow-md cursor-pointer"><Plus size={16} /> Record Expense</button>}
        </div>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 flex items-center justify-between">
          <div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Expenditures</p><p className="text-3xl font-extrabold text-slate-900">${totalExpenseAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
          <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600"><DollarSign size={24} /></div>
        </div>
        <div className="md:col-span-2 glass-card rounded-2xl p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3"><Filter size={18} className="text-slate-500" /><span className="text-sm font-semibold text-slate-700">Filter Ledger</span></div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-lg border border-slate-300 bg-white py-2 px-4 text-sm outline-none focus:border-indigo-500 w-48"><option value="">All Categories</option><option value="Fuel">Fuel Logs</option><option value="Maintenance">Maintenance Costs</option><option value="Other">Other Expenses</option></select>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        {loading ? (<div className="py-12 text-center text-slate-400">Loading ledger logs...</div>)
        : filteredExpenses.length === 0 ? (<div className="py-12 text-center text-slate-500">No expenses logged under this category.</div>)
        : (<div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead><tr className="border-b border-slate-200 text-slate-500 font-semibold"><th className="pb-3">Date</th><th className="pb-3">Category</th><th className="pb-3">Vehicle</th><th className="pb-3">Description</th><th className="pb-3 text-right">Amount</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => (<tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 text-slate-700">{new Date(exp.date).toLocaleDateString()}</td>
                  <td className="py-4"><StatusBadge status={exp.expense_type} /></td>
                  <td className="py-4">{exp.vehicle_reg ? <div><p className="font-semibold text-slate-900">{exp.vehicle_reg}</p><p className="text-[10px] text-slate-500">{exp.vehicle_model}</p></div> : <span className="text-slate-400 italic text-xs">General Fleet</span>}</td>
                  <td className="py-4 text-slate-700 max-w-sm truncate">{exp.description}</td>
                  <td className="py-4 text-right font-mono font-bold text-slate-900">${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showFuelModal && (
        <Modal title="Record Fuel Purchase" onClose={() => setShowFuelModal(false)}>
            <form onSubmit={handleLogFuel} className="p-6 space-y-4">
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Vehicle *</label><select value={fuelVehicleId} onChange={(e) => setFuelVehicleId(e.target.value)} className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500" required><option value="">Select vehicle...</option>{vehicles.filter(v => v.status !== 'Retired').map(v => <option key={v.id} value={v.id}>{v.registration_number} - {v.model}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Liters *</label><input type="number" value={fuelLiters} onChange={(e) => setFuelLiters(e.target.value)} placeholder="25.5" min="0.1" step="0.01" className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required /></div>
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Cost ($) *</label><input type="number" value={fuelCost} onChange={(e) => setFuelCost(e.target.value)} placeholder="50.0" min="0.1" step="0.01" className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required /></div>
              </div>
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Date *</label><input type="date" value={fuelDate} onChange={(e) => setFuelDate(e.target.value)} className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required /></div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setShowFuelModal(false)} className="px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm font-semibold text-slate-500 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-md cursor-pointer">Record Fuel</button>
              </div>
            </form>
        </Modal>
      )}

      {showExpenseModal && (
        <Modal title="Record Operational Expense" onClose={() => setShowExpenseModal(false)}>
            <form onSubmit={handleLogExpense} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Category</label><select value={expType} onChange={(e) => setExpType(e.target.value)} className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500"><option value="Maintenance">Maintenance</option><option value="Other">Other Operational</option></select></div>
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Linked Vehicle</label><select value={expVehicleId} onChange={(e) => setExpVehicleId(e.target.value)} className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500"><option value="">General Fleet</option>{vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} - {v.model}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Amount ($) *</label><input type="number" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} placeholder="120" min="0.01" step="0.01" className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required /></div>
                <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Date *</label><input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required /></div>
              </div>
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description *</label><textarea value={expDesc} onChange={(e) => setExpDesc(e.target.value)} placeholder="E.g., Toll passes, safety inspections..." rows={3} className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none" required /></div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm font-semibold text-slate-500 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-md cursor-pointer">Record Expense</button>
              </div>
            </form>
        </Modal>
      )}
    </div>
  );
};

export default Expenses;
