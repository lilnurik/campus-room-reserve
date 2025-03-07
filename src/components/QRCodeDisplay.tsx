
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';

export interface QRCodeDisplayProps {
  bookingId: number;
  roomName: string;
  accessCode: string;
  startTime: string;
  endTime: string;
  onClose?: () => void;
}

// This is a simple QR code display component
// In a real app, you would use a QR code generation library
const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  bookingId,
  roomName,
  accessCode,
  startTime,
  endTime,
  onClose
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  
  useEffect(() => {
    // Create a simple QR code URL using an external service
    // In a real app, you would use a QR code library
    const qrData = `BOOKING:${bookingId}:${accessCode}`;
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`);
  }, [bookingId, accessCode]);
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Код доступа</CardTitle>
        <CardDescription>
          Комната {roomName} • {formatDateTime(startTime)} - {formatDateTime(endTime)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pb-2">
        {qrUrl ? (
          <div className="bg-white p-4 rounded-lg shadow-inner animate-scale-in">
            <img src={qrUrl} alt="QR код" className="w-64 h-64" />
          </div>
        ) : (
          <div className="bg-slate-100 w-64 h-64 rounded-lg flex items-center justify-center">
            Загрузка...
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        <div className="text-xl font-semibold my-2">Код: {accessCode}</div>
        {onClose && (
          <Button variant="outline" className="mt-2" onClick={onClose}>
            Закрыть
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default QRCodeDisplay;
