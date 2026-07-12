import { AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage = ({ message }: ErrorMessageProps) => (
  message ? (
    <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
      <AlertTriangle size={18} className="flex-shrink-0" />
      <span>{message}</span>
    </div>
  ) : null
);

export default ErrorMessage;
