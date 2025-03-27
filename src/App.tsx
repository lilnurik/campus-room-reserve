import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import { LanguageProvider } from "./context/LanguageContext";
import StudentDashboard from "./pages/student/StudentDashboard";
import BookingPage from "./pages/student/BookingPage";
import HistoryPage from "./pages/student/HistoryPage";
import ProfilePage from "./pages/student/ProfilePage";
import GuardDashboard from "./pages/guard/GuardDashboard";
import GuardProfilePage from "./pages/guard/ProfilePage";
import BookingsPage from "./pages/guard/BookingsPage";
import KeysPage from "./pages/guard/KeysPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookingsPage from "./pages/admin/BookingsPage";
import UsersPage from "./pages/admin/UsersPage";
import SettingsPage from "./pages/admin/SettingsPage";
import RoomsPage from "./pages/admin/RoomsPage";
import ApiTest from "@/components/ApiTest.tsx";
import BookingHistoryPage from "./pages/student/BookingHistoryPage";
import BookingDetailsPage from "./pages/student/BookingDetailsPage";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <BookingProvider>
            <LanguageProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />


                  {/* Student Routes */}
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  <Route path="/student/booking" element={<BookingPage />} />
                  <Route path="/student/history" element={<HistoryPage />} />
                  <Route path="/student/profile" element={<ProfilePage />} />
                  <Route path="/student/api-test" element={<ApiTest />} />

                  {/* New Room Booking Routes */}
                  <Route path="/student/bookings" element={<BookingHistoryPage />} />
                  <Route path="/student/bookings/:bookingId" element={<BookingDetailsPage />} />

                  {/* Guard Routes */}
                  <Route path="/guard/dashboard" element={<GuardDashboard />} />
                  <Route path="/guard/profile" element={<GuardProfilePage />} />
                  <Route path="/guard/bookings" element={<BookingsPage />} />
                  <Route path="/guard/keys" element={<KeysPage />} />

                  {/* Admin Routes */}
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/bookings" element={<AdminBookingsPage />} />
                  <Route path="/admin/users" element={<UsersPage />} />
                  <Route path="/admin/settings" element={<SettingsPage />} />
                  <Route path="/admin/rooms" element={<RoomsPage />} />

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </LanguageProvider>
          </BookingProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
);

export default App;