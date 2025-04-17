import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useTranslation } from "@/context/LanguageContext";
import { authApi } from "@/services/api";
import { PlusCircle, User, Pencil, Trash } from "lucide-react";

const StaffTeamPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [subordinates, setSubordinates] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newStaff, setNewStaff] = useState({
        full_name: "",
        email: "",
        internal_id: "",
        department: user?.department || "",
        is_supervisor: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [temporaryPassword, setTemporaryPassword] = useState("");
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    useEffect(() => {
        loadSubordinates();
    }, []);

    const loadSubordinates = async () => {
        try {
            setIsLoading(true);
            const response = await authApi.getSubordinates();
            if (response.success) {
                setSubordinates(response.data);
            } else {
                toast.error(t('staff.loadError') || "Failed to load team members");
            }
        } catch (error) {
            console.error("Error loading team members:", error);
            toast.error(t('staff.loadError') || "Failed to load team members");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!newStaff.full_name || !newStaff.email || !newStaff.internal_id || !newStaff.department) {
            toast.error(t('staff.allFieldsRequired') || "All fields are required");
            return;
        }

        // Validate internal ID format (3 digits)
        if (!/^\d{3}$/.test(newStaff.internal_id)) {
            toast.error(t('auth.staffIdFormat') || "Staff ID must be exactly 3 digits");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await authApi.createStaff(newStaff);

            if (response.success) {
                toast.success(t('staff.createSuccess') || "Staff member created successfully");
                setTemporaryPassword(response.data.temporary_password);
                setShowSuccessDialog(true);
                loadSubordinates();
                setIsDialogOpen(false);

                // Reset form
                setNewStaff({
                    full_name: "",
                    email: "",
                    internal_id: "",
                    department: user?.department || "",
                    is_supervisor: false
                });
            } else {
                toast.error(response.error || t('staff.createError') || "Failed to create staff member");
            }
        } catch (error) {
            console.error("Error creating staff member:", error);
            toast.error(t('staff.createError') || "Failed to create staff member");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Only supervisors can access this page
    if (user && !user.is_supervisor) {
        return (
            <PageLayout role="staff">
                <div className="flex flex-col items-center justify-center h-[70vh]">
                    <User className="h-16 w-16 text-muted-foreground mb-4" />
                    <h1 className="text-2xl font-bold mb-2">
                        {t('staff.accessDenied') || "Access Denied"}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('staff.supervisorOnly') || "Only supervisors can access the team management page"}
                    </p>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout role="staff">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {t('staff.teamMembers') || "Team Members"}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('staff.teamMembersDesc') || "Manage your department staff"}
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="h-4 w-4 mr-2" /> {t('staff.addStaff') || "Add Staff"}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px]">
                            <DialogHeader>
                                <DialogTitle>{t('staff.addNewStaff') || "Add New Staff Member"}</DialogTitle>
                                <DialogDescription>
                                    {t('staff.addStaffDesc') || "Create a new staff member in your department"}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateStaff}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="full_name">{t('staff.fullName') || "Full Name"}</Label>
                                            <Input
                                                id="full_name"
                                                value={newStaff.full_name}
                                                onChange={(e) => setNewStaff({...newStaff, full_name: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={newStaff.email}
                                                onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="internal_id">{t('staff.internalId') || "3-Digit Internal ID"}</Label>
                                            <Input
                                                id="internal_id"
                                                value={newStaff.internal_id}
                                                onChange={(e) => setNewStaff({...newStaff, internal_id: e.target.value})}
                                                pattern="\d{3}"
                                                maxLength={3}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="department">{t('staff.department') || "Department"}</Label>
                                            <Input
                                                id="department"
                                                value={newStaff.department}
                                                onChange={(e) => setNewStaff({...newStaff, department: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="is_supervisor"
                                            checked={newStaff.is_supervisor}
                                            onCheckedChange={(checked) => setNewStaff({...newStaff, is_supervisor: checked})}
                                        />
                                        <Label htmlFor="is_supervisor">
                                            {t('staff.isSupervisor') || "Is team supervisor"}
                                        </Label>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting
                                            ? t('staff.creating') || "Creating..."
                                            : t('staff.createStaff') || "Create Staff"
                                        }
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Success Dialog with Temporary Password */}
                    <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t('staff.staffCreated') || "Staff Member Created"}</DialogTitle>
                                <DialogDescription>
                                    {t('staff.tempPasswordInfo') || "Please share the following temporary password with the new staff member. They will be prompted to change it on first login."}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <div className="p-3 bg-muted rounded-md text-center">
                                    <p className="mb-1 text-sm text-muted-foreground">{t('staff.tempPassword') || "Temporary Password"}:</p>
                                    <p className="text-lg font-mono">{temporaryPassword}</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => setShowSuccessDialog(false)}>
                                    {t('common.close') || "Close"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('staff.departmentStaff') || "Department Staff"}</CardTitle>
                        <CardDescription>
                            {t('staff.manageDepartmentDesc') || "View and manage staff members in your department"}
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
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('staff.name') || "Name"}</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>{t('staff.internalId') || "Internal ID"}</TableHead>
                                            <TableHead>{t('staff.isSupervisor') || "Supervisor"}</TableHead>
                                            <TableHead className="text-right">{t('common.actions') || "Actions"}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subordinates.map((staff) => (
                                            <TableRow key={staff.id}>
                                                <TableCell className="font-medium">{staff.full_name}</TableCell>
                                                <TableCell>{staff.email}</TableCell>
                                                <TableCell>{staff.internal_id}</TableCell>
                                                <TableCell>
                                                    {staff.is_supervisor ? (
                                                        <span className="text-green-600">✓</span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end space-x-2">
                                                        <Button variant="outline" size="icon">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="icon" className="text-red-500">
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
};

export default StaffTeamPage;