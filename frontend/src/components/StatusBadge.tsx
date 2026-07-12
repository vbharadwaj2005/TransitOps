import { statusBadgeClass } from '../utils/helpers';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${statusBadgeClass(status)}`}>
    {status}
  </span>
);

export default StatusBadge;
