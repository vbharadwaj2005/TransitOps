import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, X, Fuel, DollarSign, Filter } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { inputClass, selectClass, primaryButtonClass, secondaryButtonClass, tableHeaderClass } from '../utils/helpers';

interface Expense { id: number; date: string; expense_type: string; vehicle_reg: string; vehicle_model: string; description: string; amount: number; }
interface Vehicle { id: number; registration_number: string; model: string; odometer: number; status: string; }
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [fuelVehicleId, setFuelVehicleId] = useState(''); const [fuelDriverId, setFuelDriverId] = useState(''); const [fuelLiters, setFuelLiters] = useState(''); const [fuelCost, setFuelCost] = useState(''); const [fuelOdometer, setFuelOdometer] = useState(''); const [fuelDate, setFuelDate] = useState(new Date().toISOString().split('T')[0]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expVehicleId, setExpVehicleId] = useState(''); const [expType, setExpType] = useState('Other'); const [expAmount, setExpAmount] = useState(''); const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]); const [expDesc, setExpDesc] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = `page=${page}&per_page=10${typeFilter ? `&expense_type=${typeFilter}` : ''}`;
      const expRes = await api.get(`/expenses?${params}`);
      setExpenses(expRes.data.data || []);
      setTotalPages(expRes.data.pages || 1);
      const vehRes = await api.get('/vehicles');
      setVehicles(vehRes.data.data || vehRes.data || []);
      const drvRes = await api.get('/drivers');
      setDrivers(drvRes.data.data || drvRes.data || []);
    } catch { setError('Failed to fetch data.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, typeFilter]);

  const handleLogFuel = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!fuelVehicleId || !fuelLiters || !fuelCost || !fuelDate) { setError('Fill all required fields.'); return; }
    try { await api.post('/expenses/fuel', { vehicle_id: parseInt(fuelVehicleId), driver_id: fuelDriverId ? parseInt(fuelDriverId) : null, liters: parseFloat(fuelLiters), cost: parseFloat(fuelCost), odometer: fuelOdometer ? parseFloat(fuelOdometer) : null, date: fuelDate }); setSuccess('Fuel log recorded.'); setShowFuelModal(false); fetchData(); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed.'); }
  };

  const handleLogExpense = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!expAmount || !expDate || !expDesc) { setError('Fill all required fields.'); return; }
    try { await api.post('/expenses', { vehicle_id: expVehicleId ? parseInt(expVehicleId) : null, expense_type: expType, amount: parseFloat(expAmount), date: expDate, description: expDesc }); setSuccess('Expense logged.'); setShowExpenseModal(false); fetchData(); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed.'); }
  };

  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Expenses Ledger</h2><p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Audit vehicle operational expenditures.</p></div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setFuelVehicleId(''); setFuelDriverId(''); setFuelLiters(''); setFuelCost(''); setFuelOdometer(''); setFuelDate(new Date().toISOString().split('T')[0]); setError(''); setShowFuelModal(true); }} className={secondaryButtonClass()}><Fuel size={18} /> Log Fuel</button>
          {isFinanceOrManager && <button onClick={() => { setExpVehicleId(''); setExpType('Other'); setExpAmount(''); setExpDate(new Date().toISOString().split('T')[0]); setExpDesc(''); setError(''); setShowExpenseModal(true); }} className={primaryButtonClass()}><Plus size={18} /> Record Expense</button>}
        </div>
      </div>
      <ErrorMessage message={error} /><SuccessMessage message={success} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-between">
          <div><p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total</p><p className="text-3xl font-extrabold text-slate-900 dark:text-white">${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"><DollarSign size={24} /></div>
        </div>
        <div className="md:col-span-2 p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center gap-4">
          <Filter size={18} className="text-slate-500" /><span className="text-sm font-bold text-slate-700 dark:text-slate-300">Filter</span>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className={selectClass() + ' w-48'}><option value="">All Categories</option><option value="Fuel">Fuel Logs</option><option value="Maintenance">Maintenance</option><option value="Other">Other</option></select>
        </div>
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
        {loading ? <div className="py-12 text-center text-slate-400 font-medium">Loading...</div> : expenses.length === 0 ? <div className="py-12 text-center text-slate-500 italic">No expenses found.</div> : (
          <><div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full"><thead><tr className="bg-slate-50 dark:bg-slate-700/50"><th className={tableHeaderClass()}>Date</th><th className={tableHeaderClass()}>Category</th><th className={tableHeaderClass()}>Vehicle</th><th className={tableHeaderClass()}>Description</th><th className={tableHeaderClass() + ' text-right'}>Amount</th></tr></thead>
            <tbody>{expenses.map(exp => (<tr key={exp.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
              <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{new Date(exp.date).toLocaleDateString()}</td>
              <td className="px-4 py-3"><span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${exp.expense_type === 'Fuel' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700' : exp.expense_type === 'Maintenance' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'}`}>{exp.expense_type}</span></td>
              <td className="px-4 py-3">{exp.vehicle_reg ? <><p className="font-bold text-slate-900 dark:text-white">{exp.vehicle_reg}</p><p className="text-[10px] text-slate-500 uppercase tracking-wider">{exp.vehicle_model}</p></> : <span className="text-slate-400 italic text-xs">General</span>}</td>
              <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-sm truncate">{exp.description}</td>
              <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">${exp.amount.toFixed(2)}</td>
            </tr>))}</tbody></table>
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
      {showFuelModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"><div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700"><h3 className="text-lg font-bold text-slate-800 dark:text-white">Record Fuel Purchase</h3><button onClick={() => setShowFuelModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18} /></button></div>
        <form onSubmit={handleLogFuel} className="p-6 space-y-4">
          <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Vehicle *</label><select value={fuelVehicleId} onChange={e => setFuelVehicleId(e.target.value)} className={selectClass()} required><option value="">Select...</option>{vehicles.filter(v => v.status !== 'Retired').map(v => <option key={v.id} value={v.id}>{v.registration_number}</option>)}</select></div>
          <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Driver</label><select value={fuelDriverId} onChange={e => setFuelDriverId(e.target.value)} className={selectClass()}><option value="">Optional</option>{drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Liters *</label><input type="number" value={fuelLiters} onChange={e => setFuelLiters(e.target.value)} min="0.1" step="0.01" className={inputClass()} required /></div><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Cost ($) *</label><input type="number" value={fuelCost} onChange={e => setFuelCost(e.target.value)} min="0.1" step="0.01" className={inputClass()} required /></div></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Odometer (km)</label><input type="number" value={fuelOdometer} onChange={e => setFuelOdometer(e.target.value)} min="0" className={inputClass()} /></div><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Date *</label><input type="date" value={fuelDate} onChange={e => setFuelDate(e.target.value)} className={inputClass()} required /></div></div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700"><button type="button" onClick={() => setShowFuelModal(false)} className={secondaryButtonClass()}>Cancel</button><button type="submit" className={primaryButtonClass()}>Record Fuel</button></div>
        </form>
      </div></div>)}
      {showExpenseModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"><div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700"><h3 className="text-lg font-bold text-slate-800 dark:text-white">Record Expense</h3><button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18} /></button></div>
        <form onSubmit={handleLogExpense} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Category</label><select value={expType} onChange={e => setExpType(e.target.value)} className={selectClass()}><option value="Maintenance">Maintenance</option><option value="Other">Other</option></select></div><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Vehicle</label><select value={expVehicleId} onChange={e => setExpVehicleId(e.target.value)} className={selectClass()}><option value="">General Fleet</option>{vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number}</option>)}</select></div></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Amount ($) *</label><input type="number" value={expAmount} onChange={e => setExpAmount(e.target.value)} min="0.01" step="0.01" className={inputClass()} required /></div><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Date *</label><input type="date" value={expDate} onChange={e => setExpDate(e.target.value)} className={inputClass()} required /></div></div>
          <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Description *</label><textarea value={expDesc} onChange={e => setExpDesc(e.target.value)} rows={3} className={inputClass() + ' resize-none'} required /></div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700"><button type="button" onClick={() => setShowExpenseModal(false)} className={secondaryButtonClass()}>Cancel</button><button type="submit" className={primaryButtonClass()}>Record Expense</button></div>
        </form>
      </div></div>)}
    </div>
  );
};

export default Expenses;
