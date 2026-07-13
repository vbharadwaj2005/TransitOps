import { X } from 'lucide-react';

const ErrorMessage = ({ message, onClose }: { message: string; onClose?: () => void }) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/30 px-4 py-3 text-sm font-semibold text-rose-700 dark:text-rose-300">
      <span className="flex-1">{message}</span>
      {onClose && <button onClick={onClose} className="text-rose-500 hover:text-rose-700 cursor-pointer"><X size={16} /></button>}
    </div>
  );
};

export default ErrorMessage;
