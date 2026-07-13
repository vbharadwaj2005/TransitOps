import { useState, useEffect } from 'react';
import api from '../services/api';
import { ChevronLeft, ChevronRight, MapPin, Circle, Wrench, Calendar as CalendarIcon, Plus, X } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { primaryButtonClass, secondaryButtonClass, inputClass, selectClass, modalBackdropClass, modalPanelClass } from '../utils/helpers';

interface Trip { id: number; route_name: string; date: string; driver_name: string; vehicle_reg: string; status: string; }

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [newRoute, setNewRoute] = useState(''); const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]); const [newDesc, setNewDesc] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = `month=${month + 1}&year=${year}`;
      const tripRes = await api.get(`/trips?${params}`);
      setTrips(tripRes.data.data || tripRes.data || []);
    } catch { /* non-critical */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, [month, year]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!newRoute || !newDate) { setError('Route and date required.'); return; }
    try { await api.post('/bookings', { route_name: newRoute, date: newDate, description: newDesc }); setSuccess('Booking created.'); setShowBookingModal(false); fetchEvents(); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed.'); }
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { trips: trips.filter(t => t.date && t.date.startsWith(dateStr)), dateStr };
  };

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Calendar</h2><p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Track trips, maintenance, and bookings.</p></div>
        <button onClick={() => { setNewDate(selectedDate || new Date().toISOString().split('T')[0]); setError(''); setShowBookingModal(true); }} className={primaryButtonClass()}><Plus className="w-4 h-4" /> New Booking</button>
      </div>
      <ErrorMessage message={error} /><SuccessMessage message={success} />
      {loading && <div className="text-center py-8 text-slate-400 font-medium">Loading...</div>}
      <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-slate-600 dark:text-slate-300 cursor-pointer"><ChevronLeft className="w-5 h-5" /></button>
          <span className="text-lg font-bold text-slate-900 dark:text-white">{monthNames[month]} {year}</span>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-slate-600 dark:text-slate-300 cursor-pointer"><ChevronRight className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-7">
          {dayNames.map(d => <div key={d} className="py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 dark:bg-slate-700/30 border-b border-r border-slate-100 dark:border-slate-700/50 last:border-r-0">{d}</div>)}
          {weeks.flat().map((day, idx) => {
            if (!day) return <div key={`e-${idx}`} className="min-h-[90px] sm:min-h-[120px] bg-slate-50/30 dark:bg-slate-700/10 border-b border-r border-slate-100 dark:border-slate-700/50 last:border-r-0" />;
            const events = getEventsForDay(day);
            const isToday = events.dateStr === todayStr;
            return <div key={day} onClick={() => setSelectedDate(events.dateStr)} className={`min-h-[90px] sm:min-h-[120px] p-1.5 border-b border-r border-slate-100 dark:border-slate-700/50 last:border-r-0 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/20 cursor-pointer ${isToday ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : 'bg-white dark:bg-slate-800'}`}>
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}>{day}</span>
              <div className="mt-1 space-y-0.5">
                {events.trips.slice(0, 3).map(t => <div key={`t-${t.id}`} className="flex items-center gap-1 px-1 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-[9px] font-semibold text-blue-700 dark:text-blue-300 truncate"><Circle className="w-1.5 h-1.5 fill-blue-500 shrink-0" /><span className="truncate">{t.route_name || `${t.driver_name || ''} trip`}</span></div>)}
                {events.trips.length > 3 && <div className="text-[8px] text-slate-400 pl-1 font-semibold">+{events.trips.length - 3} more</div>}
              </div>
            </div>;
          })}
        </div>
      </div>
      {showBookingModal && (<div className={modalBackdropClass()}><div className={modalPanelClass()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700"><h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-indigo-600" />Create Booking</h3><button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button></div>
        <form onSubmit={handleCreateBooking} className="p-6 space-y-4">
          <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Route Name *</label><input value={newRoute} onChange={e => setNewRoute(e.target.value)} className={inputClass()} required placeholder="e.g. Downtown Express" /></div>
          <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Date *</label><input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className={inputClass()} required /></div>
          <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Description</label><textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={3} className={inputClass() + ' resize-none'} placeholder="Optional notes..." /></div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700"><button type="button" onClick={() => setShowBookingModal(false)} className={secondaryButtonClass()}>Cancel</button><button type="submit" className={primaryButtonClass()}>Create Booking</button></div>
        </form>
      </div></div>)}
    </div>
  );
};

export default CalendarPage;
