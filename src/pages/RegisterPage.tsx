import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { z } from "zod";
import { authApi } from "@/services/api.ts";
import { useTranslation } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const RegisterPage = () => {
  const { t } = useTranslation();

  // Updated student ID schema with translated error message
  const studentIdSchema = z.string().min(3, () => t('auth.studentIdMinLength'));

  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingId, setIsValidatingId] = useState(false);
  const [idValidated, setIdValidated] = useState(false);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const navigate = useNavigate();

  const handleValidateId = async () => {
    try {
      // Validate format (this can be adjusted based on your requirements)
      const result = studentIdSchema.safeParse(studentId);
      if (!result.success) {
        toast.error(result.error.errors[0].message);
        return;
      }

      setIsValidatingId(true);

      // Call the new backend endpoint to check student ID
      const response = await authApi.checkStudentId(studentId);

      if (response.success) {
        if (response.data.status === 'verified') {
          setIdValidated(true);
          toast.success(t('auth.studentIdVerified'));

          // Store student info from API response
          if (response.data.student_info) {
            setStudentInfo(response.data.student_info);
            // Pre-fill form fields if available
            if (response.data.student_info.full_name) {
              setName(response.data.student_info.full_name);
            }
            if (response.data.student_info.email) {
              setEmail(response.data.student_info.email);
            }
          }
        } else if (response.data.status === 'registered') {
          toast.info(t('auth.idAlreadyRegistered'));
          navigate("/login");
        } else {
          toast.error(t('auth.studentIdNotFound'));
        }
      } else {
        toast.error(response.error || t('auth.studentIdCheckError'));
      }
    } catch (error) {
      toast.error(t('auth.studentIdCheckError'));
      console.error(error);
    } finally {
      setIsValidatingId(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate student ID format
    const idResult = studentIdSchema.safeParse(studentId);
    if (!idResult.success) {
      toast.error(idResult.error.errors[0].message);
      return;
    }

    // Validate password
    if (!password) {
      toast.error(t('auth.passwordRequired'));
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      toast.error(t('auth.passwordsDoNotMatch'));
      return;
    }

    // Only proceed if student ID is validated
    if (!idValidated) {
      toast.error(t('auth.pleaseVerifyId'));
      return;
    }

    setIsLoading(true);

    try {
      // Call the new endpoint to complete registration with password
      const result = await authApi.completeRegistration(studentId, password);

      if (result.success) {
        toast.success(t('auth.registrationSuccess'));
        navigate("/login");
      } else {
        toast.error(result.error || t('auth.registrationError'));
      }
    } catch (error) {
      toast.error(t('auth.registrationError'));
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
            <CardTitle className="text-2xl font-bold text-primary">{t('auth.registerTitle')}</CardTitle>
            <CardDescription>{t('auth.registerDescription')}</CardDescription>
          </CardHeader>

          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                      type="text"
                      placeholder={t('auth.studentIdPlaceholder')}
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      disabled={idValidated || isValidatingId}
                      required
                      className="flex-1"
                  />
                  <Button
                      type="button"
                      variant="outline"
                      onClick={handleValidateId}
                      disabled={isValidatingId || idValidated || !studentId}
                  >
                    {isValidatingId
                        ? t('auth.checking')
                        : idValidated
                            ? t('auth.verified')
                            : t('auth.checkId')
                    }
                  </Button>
                </div>
              </div>

              {/* Show student info if validated */}
              {idValidated && studentInfo && (
                  <div className="bg-muted p-3 rounded-md">
                    <h3 className="font-medium mb-1">{t('auth.studentInfo')}:</h3>
                    <p><span className="font-medium">{t('auth.name')}:</span> {studentInfo.full_name}</p>
                    {studentInfo.email && <p><span className="font-medium">Email:</span> {studentInfo.email}</p>}
                    {studentInfo.group && <p><span className="font-medium">{t('auth.group')}:</span> {studentInfo.group}</p>}
                    {studentInfo.faculty && <p><span className="font-medium">{t('auth.faculty')}:</span> {studentInfo.faculty}</p>}
                  </div>
              )}

              <div className="space-y-2">
                <Input
                    type="password"
                    placeholder={t('auth.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!idValidated}
                    required
                />
              </div>

              <div className="space-y-2">
                <Input
                    type="password"
                    placeholder={t('auth.confirmPasswordPlaceholder')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={!idValidated}
                    required
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading || !idValidated}>
                {isLoading ? t('auth.registering') : t('auth.register')}
              </Button>

              <div className="text-sm text-center">
                {t('auth.alreadyHaveAccount')}{" "}
                <Link to="/login" className="text-primary hover:underline">
                  {t('auth.login')}
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
  );
};

export default RegisterPage;