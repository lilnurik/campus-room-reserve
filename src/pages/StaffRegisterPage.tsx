import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { z } from "zod";
import { useTranslation } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const StaffRegisterPage = () => {
    const { t } = useTranslation();

    // Staff ID schema - 3 digits
    const staffIdSchema = z.string().refine(
        (val) => /^\d{3}$/.test(val),
        () => t('auth.staffIdFormat') || "Staff ID must be exactly 3 digits"
    );

    const [internalId, setInternalId] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isValidatingId, setIsValidatingId] = useState(false);
    const [idValidated, setIdValidated] = useState(false);
    const [staffInfo, setStaffInfo] = useState<any>(null);
    const navigate = useNavigate();
    const { validateStaffId, registerStaff } = useAuth();

    const handleValidateId = async () => {
        try {
            // Validate format
            const result = staffIdSchema.safeParse(internalId);
            if (!result.success) {
                toast.error(result.error.errors[0].message);
                return;
            }

            setIsValidatingId(true);

            // Call backend to validate staff ID
            const response = await validateStaffId(internalId);

            if (response.success) {
                if (response.data.status === 'verified') {
                    setIdValidated(true);
                    toast.success(t('auth.staffIdVerified') || "Staff ID verified successfully");

                    // Store staff info from API response
                    if (response.data.staff_info) {
                        setStaffInfo(response.data.staff_info);
                    }
                } else if (response.data.status === 'registered') {
                    toast.info(t('auth.idAlreadyRegistered'));
                    navigate("/login");
                } else {
                    toast.error(t('auth.staffIdNotFound') || "Staff ID not found");
                }
            } else {
                toast.error(response.error || t('auth.staffIdCheckError') || "Error verifying staff ID");
            }
        } catch (error) {
            toast.error(t('auth.staffIdCheckError') || "Error verifying staff ID");
            console.error(error);
        } finally {
            setIsValidatingId(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate staff ID format
        const idResult = staffIdSchema.safeParse(internalId);
        if (!idResult.success) {
            toast.error(idResult.error.errors[0].message);
            return;
        }

        // Validate password
        if (!password) {
            toast.error(t('auth.passwordRequired') || "Password is required");
            return;
        }

        // Validate password match
        if (password !== confirmPassword) {
            toast.error(t('auth.passwordsDoNotMatch') || "Passwords do not match");
            return;
        }

        // Only proceed if staff ID is validated
        if (!idValidated) {
            toast.error(t('auth.pleaseVerifyId') || "Please verify your staff ID first");
            return;
        }

        setIsLoading(true);

        try {
            // Call API to complete registration with password
            const result = await registerStaff(internalId, password);

            if (result.success) {
                toast.success(t('auth.registrationSuccess') || "Registration successful");
                navigate("/login");
            } else {
                toast.error(result.error || t('auth.registrationError') || "Registration failed");
            }
        } catch (error) {
            toast.error(t('auth.registrationError') || "Registration failed");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/30 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-end mb-2">
                        <LanguageSwitcher />
                    </div>
                    <img
                        src="https://turin.uz/wp-content/uploads/2021/05/TTPU_15_en-2048x475.png"
                        alt="TTPU Logo"
                        className="h-15 max-w-[220px] mx-auto object-contain mb-2"
                    />
                    <CardTitle className="text-2xl font-bold text-primary">
                        {t('auth.staffRegisterTitle') || "Staff Registration"}
                    </CardTitle>
                    <CardDescription>
                        {t('auth.staffRegisterDescription') || "Register with your 3-digit internal ID"}
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleRegister}>
                    <CardContent className="space-y-4 pt-6">
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    placeholder={t('auth.staffIdPlaceholder') || "3-digit Staff ID"}
                                    value={internalId}
                                    onChange={(e) => setInternalId(e.target.value)}
                                    disabled={idValidated || isValidatingId}
                                    required
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleValidateId}
                                    disabled={isValidatingId || idValidated || !internalId}
                                >
                                    {isValidatingId
                                        ? t('auth.checking') || "Checking..."
                                        : idValidated
                                            ? t('auth.verified') || "Verified"
                                            : t('auth.checkId') || "Check ID"
                                    }
                                </Button>
                            </div>
                        </div>

                        {/* Show staff info if validated */}
                        {idValidated && staffInfo && (
                            <div className="bg-muted p-3 rounded-md">
                                <h3 className="font-medium mb-1">{t('auth.staffInfo') || "Staff Information"}:</h3>
                                <p><span className="font-medium">{t('auth.name') || "Name"}:</span> {staffInfo.full_name}</p>
                                {staffInfo.email && <p><span className="font-medium">Email:</span> {staffInfo.email}</p>}
                                {staffInfo.department && <p><span className="font-medium">{t('auth.department') || "Department"}:</span> {staffInfo.department}</p>}
                                {staffInfo.supervisor && <p><span className="font-medium">{t('auth.supervisor') || "Supervisor"}:</span> {staffInfo.supervisor}</p>}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder={t('auth.passwordPlaceholder') || "Password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={!idValidated}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder={t('auth.confirmPasswordPlaceholder') || "Confirm password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={!idValidated}
                                required
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={isLoading || !idValidated}>
                            {isLoading
                                ? t('auth.registering') || "Registering..."
                                : t('auth.register') || "Register"
                            }
                        </Button>

                        <div className="text-sm text-center">
                            {t('auth.alreadyHaveAccount') || "Already have an account?"}{" "}
                            <Link to="/login" className="text-primary hover:underline">
                                {t('auth.login') || "Login"}
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default StaffRegisterPage;