import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { z } from "zod";
import { useTranslation } from "@/context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";

const ChangePasswordPage = () => {
    const { t } = useTranslation();
    const { user, changeFirstLoginPassword, isFirstLogin } = useAuth();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if not first login
    if (!isFirstLogin) {
        navigate("/");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!newPassword) {
            toast.error(t('auth.passwordRequired') || "Password is required");
            return;
        }

        if (newPassword.length < 8) {
            toast.error(t('auth.passwordTooShort') || "Password must be at least 8 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error(t('auth.passwordsDoNotMatch') || "Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            const result = await changeFirstLoginPassword(newPassword);

            if (!result.success) {
                toast.error(result.error || t('auth.changePasswordError') || "Failed to change password");
            }
            // On success, the auth context will redirect to the appropriate dashboard
        } catch (error) {
            console.error("Change password error:", error);
            toast.error(t('auth.changePasswordError') || "Failed to change password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/30 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <LockKeyhole className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-primary">
                        {t('auth.changePasswordTitle') || "Change Your Password"}
                    </CardTitle>
                    <CardDescription>
                        {t('auth.firstLoginMessage') ||
                            "This is your first login. Please change your password to continue."}
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4 pt-6">
                        {user && (
                            <div className="bg-muted p-3 rounded-md mb-4">
                                <p><span className="font-medium">{t('auth.name') || "Name"}:</span> {user.full_name}</p>
                                {user.department &&
                                    <p><span className="font-medium">{t('auth.department') || "Department"}:</span> {user.department}</p>
                                }
                            </div>
                        )}

                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder={t('auth.newPasswordPlaceholder') || "New password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder={t('auth.confirmPasswordPlaceholder') || "Confirm new password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>

                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading
                                ? t('auth.changing') || "Changing..."
                                : t('auth.changePassword') || "Change Password"
                            }
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default ChangePasswordPage;