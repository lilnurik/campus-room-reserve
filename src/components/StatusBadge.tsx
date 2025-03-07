
import React from 'react';
import { getStatusColor, getStatusName } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  return (
    <span 
      className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(status)} ${className}`}
    >
      {getStatusName(status)}
    </span>
  );
};

export default StatusBadge;
