
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, User, Calendar, Clock, History, Settings, Home, Users, Building, AlertTriangle, Briefcase, Plus, UserPlus } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-mobile";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/LanguageContext";

interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ReactNode;
}

const MainNavbar = ({ role = "student" }: { role?: "student" | "guard" | "admin" | "employee" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [open, setOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("2025-04-11 11:40:03");
  const [currentUser] = useState("");

  // Update time periodically
  useEffect(() => {
    // Start with provided time
    setCurrentDateTime("2025-04-11 11:40:03");

    const interval = setInterval(() => {
      const now = new Date();
      const year = now.getUTCFullYear();
      const month = String(now.getUTCMonth() + 1).padStart(2, '0');
      const day = String(now.getUTCDate()).padStart(2, '0');
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');

      setCurrentDateTime(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Define navigation items based on role
  const getNavItems = (): NavItem[] => {
    switch (role) {
      case "student":
        return [
          { labelKey: "common.home", href: "/student/dashboard", icon: <Home size={18} /> },
          { labelKey: "common.profile", href: "/student/profile", icon: <User size={18} /> },
          { labelKey: "common.booking", href: "/student/booking", icon: <Calendar size={18} /> },
          { labelKey: "common.history", href: "/student/history", icon: <History size={18} /> },
        ];
      case "guard":
        return [
          { labelKey: "common.home", href: "/guard/dashboard", icon: <Home size={18} /> },
          { labelKey: "common.profile", href: "/guard/profile", icon: <User size={18} /> },
          { labelKey: "dashboard.currentBookings", href: "/guard/bookings", icon: <Calendar size={18} /> },
          { labelKey: "landingPage.features.keyManagement", href: "/guard/keys", icon: <Clock size={18} /> },
        ];
      case "admin":
        return [
          { labelKey: "common.home", href: "/admin/dashboard", icon: <Home size={18} /> },
          { labelKey: "landingPage.features.scheduleManagement", href: "/admin/bookings", icon: <Calendar size={18} /> },
          { labelKey: "landingPage.stats.rooms", href: "/admin/rooms", icon: <Building size={18} /> },
          { labelKey: "landingPage.features.userControl", href: "/admin/users", icon: <Users size={18} /> },
          { labelKey: "dashboard.filters", href: "/admin/settings", icon: <Settings size={18} /> },
        ];
      case "employee":
        return [
          { labelKey: "common.home", href: "/employee/dashboard", icon: <Home size={18} /> },
          { labelKey: "common.profile", href: "/employee/profile", icon: <User size={18} /> },
          { labelKey: "common.booking", href: "/employee/booking", icon: <Calendar size={18} /> },
          { labelKey: "common.history", href: "/employee/history", icon: <History size={18} /> },
          { labelKey: "employee.manageEmployees", href: "/employee/manage", icon: <UserPlus size={18} /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  // Close mobile menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
      <>
        {/* Running Banner */}
        <div className="overflow-hidden bg-red-500 text-white py-1 whitespace-nowrap relative">
          <div className="animate-marquee inline-block">
            <div className="flex items-center space-x-4">
              <AlertTriangle size={16} />
              <span>{t('landingPage.testMode.warning')}</span>
              <span className="font-medium">•</span>
              <span>{t('landingPage.footer.user')}: {currentUser}</span>
              <span className="font-medium">•</span>

              <AlertTriangle size={16} />
              <span>{t('landingPage.testMode.warning')}</span>
              <span className="font-medium">•</span>
              <span>{t('landingPage.footer.user')}: {currentUser}</span>
              <span className="font-medium">•</span>

            </div>
          </div>
          <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-red-500 to-transparent"></div>
          <div className="absolute top-0 left-0 bottom-0 w-12 bg-gradient-to-r from-red-500 to-transparent"></div>
        </div>

        <header className="border-b border-border sticky top-0 z-30 bg-white dark:bg-slate-900 shadow-sm">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link to="/" className="text-2xl font-bold text-primary">
                <img
                    src="https://turin.uz/wp-content/uploads/2021/05/TTPU_15_en-2048x475.png"
                    alt="TTPU Logo"
                    className="h-15 max-w-[220px] object-contain"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item, i) => (
                  <Link
                      key={i}
                      to={item.href}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary
                  ${location.pathname === item.href ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {item.icon}
                    {t(item.labelKey)}
                  </Link>
              ))}
              <Button variant="outline" size="sm" onClick={() => logout()}>
                <LogOut size={18} className="mr-2" />
                {t('common.logout')}
              </Button>
              <LanguageSwitcher />
            </nav>

            {/* Mobile Navigation */}
            {isMobile && (
                <Sheet open={open} onOpenChange={setOpen}>
                  <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Menu />
                      </Button>
                    </SheetTrigger>
                  </div>
                  <SheetContent side="right">
                    <div className="flex flex-col h-full py-4">
                      <div className="px-2 mb-6">
                        <h2 className="text-lg font-semibold mb-1">UniBooker</h2>
                        <p className="text-sm text-muted-foreground">
                          {t('landingPage.footer.user')}: {currentUser}
                        </p>
                      </div>
                      <nav className="flex-1">
                        {navItems.map((item, i) => (
                            <Button
                                key={i}
                                variant="ghost"
                                className={`w-full justify-start mb-1 ${
                                    location.pathname === item.href ? "bg-primary/10 text-primary" : ""
                                }`}
                                onClick={() => navigate(item.href)}
                            >
                              {item.icon}
                              <span className="ml-2">{t(item.labelKey)}</span>
                            </Button>
                        ))}
                      </nav>
                      <div className="pt-4 border-t">
                        <div className="text-xs text-muted-foreground mb-2 px-2">
                          {currentDateTime}
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => logout()}
                        >
                          <LogOut className="mr-2 h-5 w-5" />
                          {t('common.logout')}
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
            )}
          </div>
        </header>
      </>
  );
};

export default MainNavbar;