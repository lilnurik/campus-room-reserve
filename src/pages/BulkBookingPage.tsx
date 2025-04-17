import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/context/LanguageContext";
import { bookingApi, authApi } from "@/services/api";
import { useNavigate } from "react-router-dom";

// Time slot options in 30-minute increments
const TIME_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

const BulkBookingPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [date, setDate] = useState<Date | undefined>(undefined);
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState<string>("");
    const [purpose, setPurpose] = useState("");
    const [subordinates, setSubordinates] = useState([]);
    const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);

                // Load rooms and subordinates in parallel
                const [roomsResponse, subordinatesResponse] = await Promise.all([
                    fetch('/api/rooms').then(res => res.json()),
                    authApi.getSubordinates()
                ]);

                if (roomsResponse.success) {
                    setRooms(roomsResponse.data || []);
                }

                if (subordinatesResponse.success) {
                    setSubordinates(subordinatesResponse.data || []);
                }
            } catch (error) {
                console.error("Error loading data:", error);
                toast.error(t('common.loadError') || "Failed to load data");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const handleStaffSelection = (staffId: number, checked: boolean) => {
        if (checked) {
            setSelectedStaffIds([...selectedStaffIds, staffId]);
        } else {
            setSelectedStaffIds(selectedStaffIds.filter(id => id !== staffId));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!date || !startTime || !endTime || !selectedRoom || !purpose || selectedStaffIds.length === 0) {
            toast.error(t('bookings.allFieldsRequired') || "All fields are required");
            return;
        }

        // Validate time slot
        const startIndex = TIME_SLOTS.indexOf(startTime);
        const endIndex = TIME_SLOTS.indexOf(endTime);
        if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
            toast.error(t('bookings.invalidTimeSlot') || "Invalid time slot selection");
            return;
        }

        setIsSubmitting(true);

        try {
            // Combine date and times into ISO strings
            const bookingDate = new Date(date);

            const [startHours, startMinutes] = startTime.split(":").map(Number);
            const [endHours, endMinutes] = endTime.split(":").map(Number);

            const startDateTime = new Date(bookingDate);
            startDateTime.setHours(startHours, startMinutes, 0);

            const endDateTime = new Date(bookingDate);
            endDateTime.setHours(endHours, endMinutes, 0);

            // Create bulk booking
            const response = await bookingApi.createBulkBooking({
                room_id: parseInt(selectedRoom),
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                purpose,
                staff_ids: selectedStaffIds
            });

            if (response.success) {
                toast.success(t('bookings.bulkBookingSuccess') || "Bulk booking created successfully");
                navigate("/staff/dashboard");
            } else {
                toast.error(response.error || t('bookings.bulkBookingError') || "Failed to create bulk booking");
            }
        } catch (error) {
            console.error("Error creating bulk booking:", error);
            toast.error(t('bookings.bulkBookingError') || "Failed to create bulk booking");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Only supervisors can access this page
    if (user && !user.is_supervisor) {
        return (
            <PageLayout role="staff">
                <div className="flex flex-col items-center justify-center h-[70vh]">
                    <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                    <h1 className="text-2xl font-bold mb-2">
                        {t('staff.accessDenied') || "Access Denied"}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('staff.bulkBookingSupervisorOnly') || "Only supervisors can create bulk bookings for department staff"}
                    </p>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout role="staff">
            <div className="space-y-6">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t('bookings.bulkBooking') || "Book for Department"}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('bookings.bulkBookingDescription') || "Create a booking for multiple staff members at once"}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('bookings.bookingDetails') || "Booking Details"}</CardTitle>
                            <CardDescription>
                                {t('bookings.bookingDetailsDesc') || "Select room, date and time for your department booking"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Room Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="room">{t('bookings.selectRoom') || "Select Room"}</Label>
                                <Select
                                    value={selectedRoom}
                                    onValueChange={setSelectedRoom}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger id="room">
                                        <SelectValue placeholder={t('bookings.selectRoomPlaceholder') || "Select a room"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rooms.map((room) => (
                                            <SelectItem key={room.id} value={room.id.toString()}>
                                                {room.name} ({t('bookings.capacity')}: {room.capacity})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Date Selection */}
                            <div className="space-y-2">
                                <Label>{t('bookings.selectDate') || "Select Date"}</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                            disabled={isLoading}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : t('bookings.pickDate') || "Pick a date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Time Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start-time">{t('bookings.startTime') || "Start Time"}</Label>
                                    <Select
                                        value={startTime}
                                        onValueChange={setStartTime}
                                        disabled={isLoading || !date}
                                    >
                                        <SelectTrigger id="start-time">
                                            <SelectValue placeholder={t('bookings.selectTime') || "Select time"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TIME_SLOTS.map((time) => (
                                                <SelectItem key={`start-${time}`} value={time}>
                                                    {time}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end-time">{t('bookings.endTime') || "End Time"}</Label>
                                    <Select
                                        value={endTime}
                                        onValueChange={setEndTime}
                                        disabled={isLoading || !startTime}
                                    >
                                        <SelectTrigger id="end-time">
                                            <SelectValue placeholder={t('bookings.selectTime') || "Select time"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TIME_SLOTS.filter(
                                                time => TIME_SLOTS.indexOf(time) > TIME_SLOTS.indexOf(startTime)
                                            ).map((time) => (
                                                <SelectItem key={`end-${time}`} value={time}>
                                                    {time}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Purpose */}
                            <div className="space-y-2">
                                <Label htmlFor="purpose">{t('bookings.purpose') || "Purpose"}</Label>
                                <Textarea
                                    id="purpose"
                                    placeholder={t('bookings.purposePlaceholder') || "Enter the purpose of this booking"}
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                    disabled={isLoading}
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>{t('bookings.selectStaff') || "Select Staff Members"}</CardTitle>
                            <CardDescription>
                                {t('bookings.selectStaffDesc') || "Choose which staff members to include in this booking"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-8">
                                    {t('common.loading') || "Loading..."}
                                </div>
                            ) : subordinates.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    {t('staff.noStaff') || "No staff members found in your department"}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="select-all"
                                            checked={selectedStaffIds.length === subordinates.length}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedStaffIds(subordinates.map(staff => staff.id));
                                                } else {
                                                    setSelectedStaffIds([]);
                                                }
                                            }}
                                        />
                                        <Label htmlFor="select-all" className="font-medium">
                                            {t('bookings.selectAll') || "Select All Staff Members"}
                                        </Label>
                                    </div>
                                    <div className="border rounded-md p-4 space-y-3">
                                        {subordinates.map((staff) => (
                                            <div key={staff.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`staff-${staff.id}`}
                                                    checked={selectedStaffIds.includes(staff.id)}
                                                    onCheckedChange={(checked) => handleStaffSelection(staff.id, !!checked)}
                                                />
                                                <Label htmlFor={`staff-${staff.id}`} className="flex-1">
                                                    {staff.full_name}
                                                    <span className="ml-2 text-sm text-muted-foreground">
                            ({staff.internal_id})
                          </span>
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <div className="flex flex-col w-full gap-2">
                                {selectedStaffIds.length > 0 && (
                                    <div className="text-sm text-muted-foreground mb-2">
                                        {t('bookings.selectedStaffCount', { count: selectedStaffIds.length }) ||
                                            `${selectedStaffIds.length} staff members selected`}
                                    </div>
                                )}
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate("/staff/dashboard")}
                                    >
                                        {t('common.cancel') || "Cancel"}
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isLoading || isSubmitting || selectedStaffIds.length === 0}
                                    >
                                        {isSubmitting
                                            ? t('bookings.creating') || "Creating..."
                                            : t('bookings.createBooking') || "Create Booking"
                                        }
                                    </Button>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </PageLayout>
    );
};

export default BulkBookingPage;