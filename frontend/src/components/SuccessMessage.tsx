import { X } from 'lucide-react';

const SuccessMessage = ({ message, onClose }: { message: string; onClose?: () => void }) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
      <span className="flex-1">{message}</span>
      {onClose && <button onClick={onClose} className="text-emerald-500 hover:text-emerald-700 cursor-pointer"><X size={16} /></button>}
    </div>
  );
};

export default SuccessMessage;
