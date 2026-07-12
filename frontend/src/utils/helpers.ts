export function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    'Available': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'On Trip': 'bg-blue-50 text-blue-700 border-blue-200',
    'Dispatched': 'bg-blue-50 text-blue-700 border-blue-200',
    'In Shop': 'bg-amber-50 text-amber-700 border-amber-200',
    'Open': 'bg-amber-50 text-amber-700 border-amber-200',
    'Retired': 'bg-rose-50 text-rose-700 border-rose-200',
    'Suspended': 'bg-rose-50 text-rose-700 border-rose-200',
    'Cancelled': 'bg-rose-50 text-rose-700 border-rose-200',
    'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Closed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Draft': 'bg-slate-100 text-slate-700 border-slate-200',
    'Fuel': 'bg-blue-50 text-blue-700 border-blue-200',
    'Maintenance': 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return map[status] || 'bg-slate-100 text-slate-700 border-slate-200';
}

export function safetyScoreBadgeClass(score: number): string {
  if (score < 70) return 'bg-rose-50 text-rose-700 border border-rose-200';
  if (score < 85) return 'bg-amber-50 text-amber-700 border border-amber-200';
  return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
}

export function expenseTypeBadgeClass(type: string): string {
  const map: Record<string, string> = {
    'Fuel': 'bg-blue-50 text-blue-700 border-blue-200',
    'Maintenance': 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return map[type] || 'bg-slate-100 text-slate-700 border-slate-200';
}

export function inputClass(hasIcon = false): string {
  return `block w-full rounded-xl border border-slate-300 bg-white py-3 ${hasIcon ? 'pl-11' : 'px-4'} pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all`;
}

export function selectClass(): string {
  return 'block w-full rounded-xl border border-slate-300 bg-white py-3 px-4 text-sm text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all';
}

export function primaryButtonClass(fullWidth = false): string {
  return `${fullWidth ? 'w-full' : ''} rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 px-4 text-sm font-semibold text-white shadow-md hover:shadow-indigo-600/10 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`;
}

export function secondaryButtonClass(): string {
  return 'px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm font-semibold text-slate-500 transition-colors cursor-pointer';
}

export function tableHeaderClass(): string {
  return 'pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider';
}
