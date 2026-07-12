import { Check } from 'lucide-react';

interface SuccessMessageProps {
  message: string;
}

const SuccessMessage = ({ message }: SuccessMessageProps) => (
  message ? (
    <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
      <Check size={18} className="flex-shrink-0" />
      <span>{message}</span>
    </div>
  ) : null
);

export default SuccessMessage;
