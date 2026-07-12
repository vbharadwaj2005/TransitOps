import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, X, AlertTriangle, Check, DollarSign, Fuel, Filter } from 'lucide-react';

const Expenses = () => {
  const { user, hasRole } = useContext(AuthContext);
  const isDriver = hasRole(['Driver']);
  const isFinanceOrManager = hasRole(['Financial Analyst', 'Fleet Manager']);

  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtering
  const [typeFilter, setTypeFilter] = useState('');

  // Log Fuel Form State
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [fuelVehicleId, setFuelVehicleId] = useState('');
  const [fuelDriverId, setFuelDriverId] = useState('');
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [fuelOdometer, setFuelOdometer] = useState('');
  const [fuelDate, setFuelDate] = useState(new Date().toISOString().split('T')[0]);

  // Log Expense Form State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expVehicleId, setExpVehicleId] = useState('');
  const [expType, setExpType] = useState('Other');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expDesc, setExpDesc] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const expRes = await api.get('/expenses');
      setExpenses(expRes.data);

      const vehicleRes = await api.get('/vehicles');
      setVehicles(vehicleRes.data);

      const driverRes = await api.get('/drivers');
      setDrivers(driverRes.data);
    } catch (err) {
      setError('Failed to fetch financial data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openFuelModal = () => {
    setFuelVehicleId('');
    setFuelDriverId('');
    setFuelLiters('');
    setFuelCost('');
    setFuelOdometer('');
    setFuelDate(new Date().toISOString().split('T')[0]);
    setError('');
    setShowFuelModal(true);
  };

  const handleLogFuel = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fuelVehicleId || !fuelLiters || !fuelCost || !fuelDate) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      await api.post('/expenses/fuel', {
        vehicle_id: parseInt(fuelVehicleId),
        driver_id: fuelDriverId ? parseInt(fuelDriverId) : null,
        liters: parseFloat(fuelLiters),
        cost: parseFloat(fuelCost),
        odometer: fuelOdometer ? parseFloat(fuelOdometer) : null,
        date: fuelDate
      });
      setSuccess('Fuel log and corresponding expense recorded successfully.');
      setShowFuelModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit fuel log.');
    }
  };

  const openExpenseModal = () => {
    setExpVehicleId('');
    setExpType('Other');
    setExpAmount('');
    setExpDate(new Date().toISOString().split('T')[0]);
    setExpDesc('');
    setError('');
    setShowExpenseModal(true);
  };

  const handleLogExpense = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!expAmount || !expDate || !expDesc) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      await api.post('/expenses', {
        vehicle_id: expVehicleId ? parseInt(expVehicleId) : null,
        expense_type: expType,
        amount: parseFloat(expAmount),
        date: expDate,
        description: expDesc
      });
      setSuccess('Operational expense logged successfully.');
      setShowExpenseModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record expense.');
    }
  };

  const filteredExpenses = expenses.filter(e => {
    return typeFilter ? e.expense_type === typeFilter : true;
  });

  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Expenses Ledger</h2>
          <p className="text-slate-400 mt-1">Audit vehicle operational expenditures, fuel receipts, and manual bills.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Driver or Admin: Log Fuel */}
          <button
            onClick={openFuelModal}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-[#0e1726] border border-indigo-500/20 text-indigo-400 hover:bg-slate-800 transition-colors"
          >
            <Fuel size={16} />
            Log Fuel
          </button>
          
          {/* Manager/Finance Analyst only: Record Expense */}
          {isFinanceOrManager && (
            <button
              onClick={openExpenseModal}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors text-white shadow-md"
            >
              <Plus size={16} />
              Record Expense
            </button>
          )}
        </div>
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

      {/* Summary Stats & Filter bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Cost Display Card */}
        <div className="glass-card rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Expenditures</p>
            <p className="text-3xl font-extrabold text-white">${totalExpenseAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Filter controls */}
        <div className="md:col-span-2 glass-card rounded-2xl p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-indigo-400" />
            <span className="text-sm font-semibold text-slate-300">Filter Ledger</span>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-[#070a13] py-2 px-4 text-sm text-slate-200 outline-none focus:border-indigo-500 w-48"
          >
            <option value="">All Categories</option>
            <option value="Fuel">Fuel Logs</option>
            <option value="Maintenance">Maintenance Costs</option>
            <option value="Other">Other Expenses</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-card rounded-2xl p-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading ledger logs...</div>
        ) : filteredExpenses.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            No expenses logged under this category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Vehicle</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="py-4">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border ${
                          exp.expense_type === 'Fuel'
                            ? 'bg-blue-950/20 text-blue-400 border-blue-800/30'
                            : exp.expense_type === 'Maintenance'
                            ? 'bg-amber-950/20 text-amber-400 border-amber-800/30'
                            : 'bg-slate-800/30 text-slate-400 border-slate-700/30'
                        }`}
                      >
                        {exp.expense_type}
                      </span>
                    </td>
                    <td className="py-4">
                      {exp.vehicle_reg ? (
                        <div>
                          <p className="font-semibold text-slate-200">{exp.vehicle_reg}</p>
                          <p className="text-[10px] text-slate-500">{exp.vehicle_model}</p>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">General Fleet</span>
                      )}
                    </td>
                    <td className="py-4 text-slate-300 max-w-sm truncate" title={exp.description}>
                      {exp.description}
                    </td>
                    <td className="py-4 text-right font-mono font-bold text-slate-100">
                      ${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FUEL LOG DIALOG */}
      {showFuelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0c101e] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-200">Record Fuel Purchase</h3>
              <button
                onClick={() => setShowFuelModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLogFuel} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Vehicle *</label>
                <select
                  value={fuelVehicleId}
                  onChange={(e) => setFuelVehicleId(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
                  required
                >
                  <option value="">Select vehicle...</option>
                  {vehicles.filter(v => v.status !== 'Retired').map(v => (
                    <option key={v.id} value={v.id}>
                      {v.registration_number} - {v.model} (Odo: {v.odometer}km)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Driver (Optional)</label>
                <select
                  value={fuelDriverId}
                  onChange={(e) => setFuelDriverId(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
                >
                  <option value="">Select driver...</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Liters *</label>
                  <input
                    type="number"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(e.target.value)}
                    placeholder="E.g., 25.5"
                    min="0.1"
                    step="0.01"
                    className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Cost ($) *</label>
                  <input
                    type="number"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    placeholder="E.g., 50.0"
                    min="0.1"
                    step="0.01"
                    className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Odometer Reading (km)</label>
                  <input
                    type="number"
                    value={fuelOdometer}
                    onChange={(e) => setFuelOdometer(e.target.value)}
                    placeholder="E.g., 15200"
                    min="0"
                    className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date *</label>
                  <input
                    type="date"
                    value={fuelDate}
                    onChange={(e) => setFuelDate(e.target.value)}
                    className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFuelModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-800 hover:bg-slate-850 hover:text-slate-200 text-sm font-semibold text-slate-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 transition-colors"
                >
                  Record Fuel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD MANUAL EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0c101e] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-200">Record Operational Expense</h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLogExpense} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={expType}
                    onChange={(e) => setExpType(e.target.value)}
                    className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="Maintenance">Maintenance</option>
                    <option value="Other">Other Operational</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Linked Vehicle (Optional)</label>
                  <select
                    value={expVehicleId}
                    onChange={(e) => setExpVehicleId(e.target.value)}
                    className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="">General Fleet Expense</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.registration_number} - {v.model}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Amount ($) *</label>
                  <input
                    type="number"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="E.g., 120"
                    min="0.01"
                    step="0.01"
                    className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date *</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description *</label>
                <textarea
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="E.g., Toll passes, safety inspections, insurance fee..."
                  rows="3"
                  className="block w-full rounded-lg border border-slate-800 bg-[#070a13] py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-650 outline-none focus:border-indigo-500 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-800 hover:bg-slate-850 hover:text-slate-200 text-sm font-semibold text-slate-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 transition-colors"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
