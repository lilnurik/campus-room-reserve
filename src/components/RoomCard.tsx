
import React from 'react';
import { Room } from '@/context/BookingContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Users, ListChecks } from 'lucide-react';
import { getStatusColor, getStatusName } from '@/lib/utils';

interface RoomCardProps {
  room: Room;
  onSelect: (room: Room) => void;
  isSelected?: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onSelect, isSelected = false }) => {
  const isAvailable = room.status === 'available';
  
  return (
    <Card 
      className={`w-full transition-all duration-300 hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      }`}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{room.name}</CardTitle>
          <Badge 
            className={getStatusColor(room.status)} 
            variant="outline"
          >
            {getStatusName(room.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>{room.building}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>Вместимость: {room.capacity}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ListChecks className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {room.features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          disabled={!isAvailable}
          variant={isSelected ? "default" : "outline"}
          onClick={() => isAvailable && onSelect(room)}
        >
          {isSelected ? 'Выбрано' : 'Выбрать'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RoomCard;
