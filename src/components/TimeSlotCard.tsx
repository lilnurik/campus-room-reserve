
import React from 'react';
import { formatTime, getStatusColor, getStatusName } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

export interface TimeSlot {
  id: string;
  start: string;
  end: string;
  status: 'available' | 'booked' | 'class' | 'maintenance';
}

export interface TimeSlotCardProps {
  slot: TimeSlot;
  onSelect?: (slot: TimeSlot) => void;
  isSelected?: boolean;
}

const TimeSlotCard: React.FC<TimeSlotCardProps> = ({ 
  slot, 
  onSelect,
  isSelected = false
}) => {
  const isAvailable = slot.status === 'available';
  
  return (
    <div 
      className={`relative p-4 rounded-lg border transition-all duration-300 ${
        isAvailable ? 'hover:border-primary/50 cursor-pointer' : ''
      } ${isSelected ? 'ring-2 ring-primary border-primary' : 'border-slate-200'} ${
        getStatusColor(slot.status)
      }`}
      onClick={() => isAvailable && onSelect && onSelect(slot)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span className="font-medium">{formatTime(slot.start)} - {formatTime(slot.end)}</span>
        </div>
        <span className="text-xs font-medium">{getStatusName(slot.status)}</span>
      </div>
      
      {isAvailable && onSelect && (
        <div className="mt-3 flex justify-end">
          <Button 
            size="sm" 
            variant={isSelected ? "default" : "outline"}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(slot);
            }}
          >
            {isSelected ? 'Выбрано' : 'Выбрать'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TimeSlotCard;
