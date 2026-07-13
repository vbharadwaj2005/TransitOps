import { useState, useEffect } from 'react';
import api from '../services/api';
import { Bell, AlertTriangle, CheckCircle, Info, X, Trash2 } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';
import { secondaryButtonClass } from '../utils/helpers';

interface Alert { id: number; title: string; message: string; alert_type: string; level: string; is_read: boolean; created_at: string; }

const Notifications = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try { const res = await api.get('/alerts'); setAlerts(res.data.data || res.data || []); }
    catch { setError('Failed to fetch notifications.'); }
    finally { setLoading(false); }
  };

  const handleMarkRead = async (id: number) => {
    try { await api.put(`/alerts/${id}/read`); setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a)); }
    catch { setError('Failed to mark as read.'); }
  };

  const handleMarkAllRead = async () => {
    try { await api.put('/alerts/read-all'); setAlerts(prev => prev.map(a => ({ ...a, is_read: true }))); }
    catch { setError('Failed.'); }
  };

  const handleDelete = async (id: number) => {
    try { await api.delete(`/alerts/${id}`); setAlerts(prev => prev.filter(a => a.id !== id)); if (selectedAlert?.id === id) setSelectedAlert(null); }
    catch { setError('Failed to delete.'); }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default: return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800';
      case 'warning': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'info': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'success': return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
      default: return 'bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-700';
    }
  };

  const filtered = filter === 'all' ? alerts : filter === 'unread' ? alerts.filter(a => !a.is_read) : alerts.filter(a => a.level === filter);
  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Notifications</h2><p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">{unreadCount > 0 ? `${unreadCount} unread` : ''}</p></div>
        {unreadCount > 0 && <button onClick={handleMarkAllRead} className={secondaryButtonClass()}><CheckCircle className="w-4 h-4" /> Mark All Read</button>}
      </div>
      <ErrorMessage message={error} />
      <div className="flex gap-2 mb-4 flex-wrap">
        {[{ value: 'all', label: 'All' }, { value: 'unread', label: 'Unread' }, { value: 'critical', label: 'Critical' }, { value: 'warning', label: 'Warnings' }, { value: 'info', label: 'Info' }, { value: 'success', label: 'Success' }].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${filter === f.value ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>{f.label}</button>
        ))}
      </div>
      {loading ? <div className="space-y-3 animate-pulse">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />)}</div> : !filtered.length ? <div className="py-16 text-center text-slate-500 italic rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg"><Bell className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" /><p>No matching notifications.</p></div> : (
        <div className="space-y-2">{filtered.map(alert => (
          <div key={alert.id} onClick={() => setSelectedAlert(alert)} className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-lg ${getLevelBg(alert.level)} ${!alert.is_read ? 'ring-2 ring-indigo-400 dark:ring-indigo-500' : ''}`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getLevelIcon(alert.level)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">{!alert.is_read && <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />}<p className={`text-sm font-bold truncate ${!alert.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{alert.title || alert.message}</p></div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{alert.message}</p>
                <div className="flex items-center gap-3"><span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">{alert.level}</span><span className="text-[9px] text-slate-400">{new Date(alert.created_at).toLocaleString()}</span></div>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                {!alert.is_read && <button onClick={(e) => { e.stopPropagation(); handleMarkRead(alert.id); }} className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700/50 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"><CheckCircle className="w-3.5 h-3.5" /></button>}
                <button onClick={(e) => { e.stopPropagation(); handleDelete(alert.id); }} className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700/50 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}</div>
      )}
      {selectedAlert && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedAlert(null)}><div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">{getLevelIcon(selectedAlert.level)}<h3 className="text-lg font-bold text-slate-800 dark:text-white">{selectedAlert.title || 'Notification'}</h3></div>
          <div className="flex items-center gap-2">{!selectedAlert.is_read && <button onClick={() => { handleMarkRead(selectedAlert.id); setSelectedAlert(prev => prev ? { ...prev, is_read: true } : null); }} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold cursor-pointer">Mark Read</button>}<button onClick={() => setSelectedAlert(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button></div>
        </div>
        <div className="p-6"><p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{selectedAlert.message}</p><div className="flex items-center gap-3"><span className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">{selectedAlert.level}</span><span className="text-xs text-slate-400">{new Date(selectedAlert.created_at).toLocaleString()}</span></div></div>
      </div></div>)}
    </div>
  );
};

export default Notifications;
