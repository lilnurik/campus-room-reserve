import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import PageLayout from "@/components/PageLayout.tsx";
import { useAuth } from "@/context/AuthContext";
import { Calendar, Users, Clock, Plus, Trash2, Pencil, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/context/LanguageContext";
import { bookingsApi as bookingApi, staffApi } from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

// Schema for staff creation/editing
const staffFormSchema = z.object({
    full_name: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email format"),
    internal_id: z.string().regex(/^\d{3}$/, "Internal ID must be exactly 3 digits"),
    department: z.string().min(2, "Department is required"),
    is_supervisor: z.boolean().default(false)
});

// Type for staff member
interface StaffMember {
    id: number;
    username: string;
    full_name: string;
    email: string;
    internal_id: string;
    department: string;
    is_supervisor: boolean;
    supervisor_id?: number;
    supervisor_name?: string;
    status: string;
}

const StaffDashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [pastBookings, setPastBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
    const [isStaffLoading, setIsStaffLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
    const [isBulkBookingModalOpen, setIsBulkBookingModalOpen] = useState(false);
    const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);
    const [tempPassword, setTempPassword] = useState("");
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [teamMembersCount, setTeamMembersCount] = useState(0);
    const [departmentBookingsCount, setDepartmentBookingsCount] = useState(0);

    // Form for adding/editing staff
    const staffForm = useForm<z.infer<typeof staffFormSchema>>({
        resolver: zodResolver(staffFormSchema),
        defaultValues: {
            full_name: "",
            email: "",
            internal_id: "",
            department: user?.department || "",
            is_supervisor: false
        }
    });

    // Load bookings and staff data on component mount
    useEffect(() => {
        loadBookings();
        if (user?.is_supervisor) {
            loadStaffMembers();
        }
    }, [user]);

    // Load user's bookings
    const loadBookings = async () => {
        try {
            setIsLoading(true);
            const response = await bookingApi.getUserBookings();

            if (response.success && response.data) {
                const now = new Date();
                const upcoming = response.data.filter(booking =>
                    new Date(booking.until_date) >= now
                );
                const past = response.data.filter(booking =>
                    new Date(booking.until_date) < now
                );

                setUpcomingBookings(upcoming);
                setPastBookings(past);
            }
        } catch (error) {
            console.error("Error loading bookings:", error);
            toast.error(t('common.loadError') || "Failed to load bookings");
        } finally {
            setIsLoading(false);
        }
    };

    // Load staff members for supervisors
    const loadStaffMembers = async () => {
        if (!user?.is_supervisor) return;

        try {
            setIsStaffLoading(true);
            const response = await staffApi.getSubordinates();

            if (response.success && response.data) {
                setStaffMembers(response.data);
                setTeamMembersCount(response.data.length);

                // Count department bookings (simplified approach)
                const bookingsResponse = await bookingApi.getUserBookings();
                if (bookingsResponse.success && bookingsResponse.data) {
                    // For now just counting team member bookings - could be refined later
                    setDepartmentBookingsCount(bookingsResponse.data.length);
                }
            }
        } catch (error) {
            console.error("Error loading staff members:", error);
            toast.error(t('staff.loadError') || "Failed to load team members");
        } finally {
            setIsStaffLoading(false);
        }
    };

    // Handler for adding a new staff member
    const handleAddStaff = async (data: z.infer<typeof staffFormSchema>) => {
        try {
            const response = await staffApi.createStaff(data);

            if (response.success) {
                toast.success(t('staff.createSuccess') || "Staff member created successfully");
                loadStaffMembers();
                setIsAddModalOpen(false);
                staffForm.reset();

                // Show the temporary password
                if (response.data && response.data.temporary_password) {
                    setTempPassword(response.data.temporary_password);
                    setShowPasswordDialog(true);
                }
            } else {
                toast.error(response.error || t('staff.createError') || "Failed to create staff member");
            }
        } catch (error) {
            console.error("Error creating staff member:", error);
            toast.error(t('staff.createError') || "Failed to create staff member");
        }
    };

    // Handler for editing a staff member
    const handleEditStaff = async (data: z.infer<typeof staffFormSchema>) => {
        if (!selectedStaff) return;

        try {
            const response = await staffApi.updateStaff(selectedStaff.id, data);

            if (response.success) {
                toast.success(t('staff.updateSuccess') || "Staff member updated successfully");
                loadStaffMembers();
                setIsEditModalOpen(false);
            } else {
                toast.error(response.error || t('staff.updateError') || "Failed to update staff member");
            }
        } catch (error) {
            console.error("Error updating staff member:", error);
            toast.error(t('staff.updateError') || "Failed to update staff member");
        }
    };

    // Handler for deleting a staff member
    const handleDeleteStaff = async () => {
        if (!selectedStaff) return;

        try {
            const response = await staffApi.deleteStaff(selectedStaff.id);

            if (response.success) {
                toast.success(t('staff.deleteSuccess') || "Staff member deleted successfully");
                loadStaffMembers();
                setIsDeleteDialogOpen(false);
            } else {
                toast.error(response.error || t('staff.deleteError') || "Failed to delete staff member");
            }
        } catch (error) {
            console.error("Error deleting staff member:", error);
            toast.error(t('staff.deleteError') || "Failed to delete staff member");
        }
    };

    // Start editing a staff member
    const startEditStaff = (staff: StaffMember) => {
        setSelectedStaff(staff);
        staffForm.reset({
            full_name: staff.full_name,
            email: staff.email,
            internal_id: staff.internal_id,
            department: staff.department,
            is_supervisor: staff.is_supervisor
        });
        setIsEditModalOpen(true);
    };

    // Start delete process
    const startDeleteStaff = (staff: StaffMember) => {
        setSelectedStaff(staff);
        setIsDeleteDialogOpen(true);
    };

    // Handle bulk booking functionality
    const handleBulkBookingClick = () => {
        navigate("/staff/bulk-booking");
    };

    // Get badge color based on booking status
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case "approved":
                return "bg-green-100 text-green-800 border-green-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-800";
            case "rejected":
                return "bg-red-100 text-red-800 border-red-800";
            case "cancelled":
                return "bg-gray-100 text-gray-800 border-gray-800";
            default:
                return "bg-blue-100 text-blue-800 border-blue-800";
        }
    };

    const formatDateRange = (from, until) => {
        const fromDate = new Date(from);
        const untilDate = new Date(until);

        // If same day, just show time range
        if (fromDate.toDateString() === untilDate.toDateString()) {
            return `${fromDate.toLocaleDateString()}, ${fromDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${untilDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        }

        // Otherwise show full range
        return `${fromDate.toLocaleDateString()} ${fromDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${untilDate.toLocaleDateString()} ${untilDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    };

    return (
        <PageLayout role="staff">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {t('dashboard.welcome', { name: user?.full_name })}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('dashboard.staffSubtitle') || "Manage your room bookings and staff operations"}
                        </p>
                    </div>
                    <Button onClick={() => navigate("/staff/booking")}>
                        <Plus className="mr-2 h-4 w-4" /> {t('dashboard.bookRoom')}
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('dashboard.upcomingBookings')}
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoading ? "..." : upcomingBookings.filter(b =>
                                    ["pending", "approved"].includes(b.status)
                                ).length}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => navigate("/staff/history")}
                            >
                                {t('dashboard.viewHistory') || "View History"}
                            </Button>
                        </CardFooter>
                    </Card>

                    {user?.is_supervisor && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {t('dashboard.teamMembers') || "Team Members"}
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {isStaffLoading ? "..." : teamMembersCount}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => navigate("/staff/team")}
                                >
                                    {t('dashboard.manageTeam') || "Manage Team"}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('dashboard.departmentBookings') || "Department Bookings"}
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isStaffLoading ? "..." : departmentBookingsCount}
                            </div>
                        </CardContent>
                        {user?.is_supervisor && (
                            <CardFooter>
                                <Button
                                    variant="ghost"
                                    className="w-full"
                                    onClick={handleBulkBookingClick}
                                >
                                    {t('dashboard.bulkBooking') || "Book for Department"}
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                </div>

                {/* Recent Bookings */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('dashboard.myBookings')}</CardTitle>
                        <CardDescription>
                            {t('dashboard.recentBookingsDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="upcoming">
                            <TabsList>
                                <TabsTrigger value="upcoming">
                                    {t('dashboard.upcomingTab')}
                                </TabsTrigger>
                                <TabsTrigger value="past">
                                    {t('dashboard.pastTab')}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="upcoming">
                                {isLoading ? (
                                    <div className="text-center py-6">
                                        {t('common.loading')}...
                                    </div>
                                ) : upcomingBookings.length > 0 ? (
                                    <div className="divide-y">
                                        {upcomingBookings.map((booking) => (
                                            <div key={booking.id} className="py-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-medium">{booking.room_name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {formatDateRange(booking.from_date, booking.until_date)}
                                                        </div>
                                                        {booking.purpose && (
                                                            <div className="text-sm mt-1">{booking.purpose}</div>
                                                        )}
                                                    </div>
                                                    <Badge className={getStatusBadgeColor(booking.status)}>
                                                        {booking.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground">
                                        {t('dashboard.noBookings')}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="past">
                                {isLoading ? (
                                    <div className="text-center py-6">
                                        {t('common.loading')}...
                                    </div>
                                ) : pastBookings.length > 0 ? (
                                    <div className="divide-y">
                                        {pastBookings.map((booking) => (
                                            <div key={booking.id} className="py-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-medium">{booking.room_name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {formatDateRange(booking.from_date, booking.until_date)}
                                                        </div>
                                                        {booking.purpose && (
                                                            <div className="text-sm mt-1">{booking.purpose}</div>
                                                        )}
                                                    </div>
                                                    <Badge className={getStatusBadgeColor(booking.status)}>
                                                        {booking.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground">
                                        {t('dashboard.noPastBookings')}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                    <CardFooter>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate("/staff/history")}
                        >
                            {t('dashboard.viewAllBookings') || "View All Bookings"}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Staff Management Section (for supervisors) */}
                {user?.is_supervisor && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>{t('staff.teamMembers') || "Team Members"}</CardTitle>
                                <CardDescription>
                                    {t('staff.teamMembersDesc') || "Manage your department staff"}
                                </CardDescription>
                            </div>
                            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t('staff.addStaff') || "Add Staff"}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{t('staff.addNewStaff') || "Add New Staff Member"}</DialogTitle>
                                        <DialogDescription>
                                            {t('staff.addStaffDesc') || "Create a new staff member in your department"}
                                        </DialogDescription>
                                    </DialogHeader>

                                    <Form {...staffForm}>
                                        <form onSubmit={staffForm.handleSubmit(handleAddStaff)} className="space-y-4">
                                            <FormField
                                                control={staffForm.control}
                                                name="full_name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t('staff.fullName') || "Full Name"}</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="John Smith" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={staffForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Email</FormLabel>
                                                        <FormControl>
                                                            <Input type="email" placeholder="email@example.com" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={staffForm.control}
                                                    name="internal_id"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t('staff.internalId') || "3-Digit ID"}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="123" maxLength={3} {...field} />
                                                            </FormControl>
                                                            <FormDescription>
                                                                {t('staff.idDescription') || "3-digit internal ID"}
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={staffForm.control}
                                                    name="department"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t('staff.department') || "Department"}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="IT Department" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={staffForm.control}
                                                name="is_supervisor"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                        <div className="space-y-0.5">
                                                            <FormLabel className="text-base">
                                                                {t('staff.isSupervisor') || "Team Supervisor"}
                                                            </FormLabel>
                                                            <FormDescription>
                                                                {t('staff.supervisorDesc') || "Can manage staff and create bulk bookings"}
                                                            </FormDescription>
                                                        </div>
                                                        <FormControl>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            <DialogFooter>
                                                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                                                    {t('common.cancel') || "Cancel"}
                                                </Button>
                                                <Button type="submit">
                                                    {t('staff.createStaff') || "Create Staff"}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>

                        <CardContent>
                            {isStaffLoading ? (
                                <div className="text-center py-8">
                                    {t('common.loading')}...
                                </div>
                            ) : staffMembers.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    {t('staff.noStaff') || "No staff members found in your department"}
                                </div>
                            ) : (
                                <ScrollArea className="h-[400px]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>{t('staff.name') || "Name"}</TableHead>
                                                <TableHead>{t('staff.email') || "Email"}</TableHead>
                                                <TableHead>{t('staff.internalId') || "ID"}</TableHead>
                                                <TableHead>{t('staff.role') || "Role"}</TableHead>
                                                <TableHead className="text-right">{t('common.actions') || "Actions"}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {staffMembers.map((staff) => (
                                                <TableRow key={staff.id}>
                                                    <TableCell className="font-medium">{staff.full_name}</TableCell>
                                                    <TableCell>{staff.email}</TableCell>
                                                    <TableCell>{staff.internal_id}</TableCell>
                                                    <TableCell>
                                                        {staff.is_supervisor ?
                                                            t('staff.roleManager') || "Manager" :
                                                            t('staff.roleStaff') || "Staff"
                                                        }
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">{t('common.openMenu') || "Open menu"}</span>
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>{t('common.actions') || "Actions"}</DropdownMenuLabel>
                                                                <DropdownMenuItem onClick={() => startEditStaff(staff)}>
                                                                    {t('common.edit') || "Edit"}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => startDeleteStaff(staff)} className="text-red-600">
                                                                    {t('common.delete') || "Delete"}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            )}
                        </CardContent>

                        <CardFooter>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => navigate("/staff/team")}
                            >
                                {t('staff.manageAllTeam') || "Manage All Team Members"}
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>

            {/* Edit Staff Dialog */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('staff.editStaff') || "Edit Staff Member"}</DialogTitle>
                        <DialogDescription>
                            {t('staff.editStaffDesc') || "Update staff member details"}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...staffForm}>
                        <form onSubmit={staffForm.handleSubmit(handleEditStaff)} className="space-y-4">
                            <FormField
                                control={staffForm.control}
                                name="full_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('staff.fullName') || "Full Name"}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={staffForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={staffForm.control}
                                    name="internal_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('staff.internalId') || "3-Digit ID"}</FormLabel>
                                            <FormControl>
                                                <Input maxLength={3} {...field} disabled />
                                            </FormControl>
                                            <FormDescription>
                                                {t('staff.idCannotChange') || "ID cannot be changed"}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={staffForm.control}
                                    name="department"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('staff.department') || "Department"}</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={staffForm.control}
                                name="is_supervisor"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">
                                                {t('staff.isSupervisor') || "Team Supervisor"}
                                            </FormLabel>
                                            <FormDescription>
                                                {t('staff.supervisorDesc') || "Can manage staff and create bulk bookings"}
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                                    {t('common.cancel') || "Cancel"}
                                </Button>
                                <Button type="submit">
                                    {t('common.save') || "Save Changes"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('staff.deleteStaff') || "Delete Staff Member"}</DialogTitle>
                        <DialogDescription>
                            {t('staff.deleteWarning') || "This action cannot be undone."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-center space-x-2 rounded-md border border-yellow-200 bg-yellow-50 p-4">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <div className="text-sm text-yellow-700">
                            {t('staff.deleteConfirmMessage', { name: selectedStaff?.full_name }) ||
                                `Are you sure you want to delete ${selectedStaff?.full_name}?`}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            {t('common.cancel') || "Cancel"}
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleDeleteStaff}>
                            {t('common.delete') || "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Show Temporary Password Dialog */}
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('staff.staffCreated') || "Staff Member Created"}</DialogTitle>
                        <DialogDescription>
                            {t('staff.tempPasswordInfo') ||
                                "Please share the following temporary password with the new staff member. They will be prompted to change it on first login."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-4 bg-muted rounded-md my-4">
                        <div className="text-sm mb-2 text-muted-foreground">
                            {t('staff.tempPassword') || "Temporary Password"}:
                        </div>
                        <p className="text-xl font-mono text-center">{tempPassword}</p>
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setShowPasswordDialog(false)}>
                            {t('common.close') || "Close"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageLayout>
    );
};

export default StaffDashboard;