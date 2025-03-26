
import React from 'react';
import { Booking } from '@/context/BookingContext';
import { formatDate, formatTime, isBookingActive, isBookingOverdue, isBookingUpcoming } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, DoorOpen, KeyRound, AlertCircle, LockKeyhole } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface BookingCardProps {
  booking: Booking;
  onCancel?: (id: number) => void;
  onIssueKey?: (id: number) => void;
  onReturnKey?: (id: number) => void;
  onViewDetails?: (booking: Booking) => void;
  showKeyControls?: boolean;
  showCancelButton?: boolean;
  showAccessCode?: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onCancel,
  onIssueKey,
  onReturnKey,
  onViewDetails,
  showKeyControls = false,
  showCancelButton = false,
  showAccessCode = true
}) => {
  const isActive = isBookingActive(booking.start, booking.end);
  const isUpcoming = isBookingUpcoming(booking.start);
  const isOverdue = isBookingOverdue(booking.end) && !booking.key_returned && booking.key_issued;
  
  return (
    <Card className="w-full transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{booking.room}</CardTitle>
            <CardDescription>{booking.student_name || `Студент ID: ${booking.student_id}`}</CardDescription>
          </div>
          <StatusBadge status={isOverdue ? 'overdue' : booking.status} />
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <span>
              {formatDate(booking.start)}, {formatTime(booking.start)} - {formatTime(booking.end)}
            </span>
          </div>
          
          {booking.key_issued && (
            <div className="flex items-center gap-2 text-sm">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              <span>{booking.key_returned ? 'Ключ возвращен' : 'Ключ выдан'}</span>
              {isOverdue && !booking.key_returned && (
                <Badge variant="destructive" className="ml-2">Просрочено</Badge>
              )}
            </div>
          )}
          
          {showAccessCode && booking.status === 'confirmed' && booking.access_code && (
            <div className="flex items-center gap-2 text-sm">
              <LockKeyhole className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-green-600">Код доступа: {booking.access_code}</span>
            </div>
          )}
          
          {booking.access_code && (
            <div className="flex items-center gap-2 text-sm">
              <DoorOpen className="h-4 w-4 text-muted-foreground" />
              <span>Код доступа: {booking.access_code}</span>
            </div>
          )}
          
          {booking.notes && (
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <span>{booking.notes}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex flex-wrap gap-2">
        {showKeyControls && (
          <>
            {!booking.key_issued && booking.status === 'confirmed' && onIssueKey && (
              <Button variant="outline" size="sm" onClick={() => onIssueKey(booking.id)}>
                Выдать ключ
              </Button>
            )}
            
            {booking.key_issued && !booking.key_returned && onReturnKey && (
              <Button variant="outline" size="sm" onClick={() => onReturnKey(booking.id)}>
                Принять ключ
              </Button>
            )}
          </>
        )}
        
        {showCancelButton && booking.status === 'pending' && onCancel && (
          <Button variant="outline" size="sm" className="border-red-200 hover:bg-red-50" onClick={() => onCancel(booking.id)}>
            Отменить
          </Button>
        )}
        
        {onViewDetails && (
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => onViewDetails(booking)}>
            Подробнее
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BookingCard;
