import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Eye } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import { useTranslation } from "@/context/LanguageContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Status configuration for styling and labels
const statusConfig = {
  pending: { label: "pending", variant: "outline", color: "text-amber-500" },
  approved: { label: "approved", variant: "outline", color: "text-blue-500" },
  rejected: { label: "rejected", variant: "outline", color: "text-red-500" },
  confirmed: { label: "confirmed", variant: "outline", color: "text-blue-500" },
  given: { label: "keyIssued", variant: "default", color: "text-green-500" },
  taken: { label: "completed", variant: "outline", color: "text-slate-500" }
};

const BookingCard = ({ booking }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showCode, setShowCode] = useState(false);

  // Handle date formatting
  const startDate = new Date(booking.start);
  const endDate = new Date(booking.end);

  // Get status styling
  const statusInfo = statusConfig[booking.status] || statusConfig.pending;

  // View booking details
  const handleViewDetails = () => {
    navigate(`/student/booking/${booking.id}`);
  };

  return (
      <div className="mb-3 last:mb-0 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium">{booking.roomName || booking.room}</h3>
            <p className="text-sm text-muted-foreground">{booking.roomCategory || booking.building}</p>
          </div>
          <Badge variant={statusInfo.variant} className={statusInfo.color}>
            {t(`bookings.status.${statusInfo.label}`)}
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm mt-3">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{formatDate(startDate)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>
            {formatTime(startDate)} - {formatTime(endDate)}
          </span>
          </div>
        </div>

        {/* Show access code for relevant bookings */}
        {(booking.status === 'approved' || booking.status === 'confirmed') && booking.secretCode && (
            <div className="mt-2 bg-muted p-2 rounded flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground">{t('bookings.accessCode')}:</p>
                <p className="font-mono font-medium">
                  {showCode ? booking.secretCode : '••••••'}
                </p>
              </div>
              <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowCode(!showCode)}
              >
                {showCode ? t('bookings.hideCode') : t('bookings.showCode')}
              </Button>
            </div>
        )}

        {/* Actions for this booking */}
        <div className="mt-3 flex justify-end">
          <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={handleViewDetails}
          >
            <Eye size={14} />
            {t('bookings.viewDetails')}
          </Button>
        </div>
      </div>
  );
};

export default BookingCard;