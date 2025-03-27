
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, User, Calendar, Clock, History, Settings, Home, Users, Building } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-mobile";
import LanguageSwitcher from "./LanguageSwitcher";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const MainNavbar = ({ role = "student" }: { role?: "student" | "guard" | "admin" }) => {
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [open, setOpen] = useState(false);

  // Define navigation items based on role
  const getNavItems = (): NavItem[] => {
    switch (role) {
      case "student":
        return [
          { label: "Главная", href: "/student/dashboard", icon: <Home size={18} /> },
          { label: "Профиль", href: "/student/profile", icon: <User size={18} /> },
          { label: "Бронирование", href: "/student/booking", icon: <Calendar size={18} /> },
          { label: "История", href: "/student/history", icon: <History size={18} /> },
        ];
      case "guard":
        return [
          { label: "Главная", href: "/guard/dashboard", icon: <Home size={18} /> },
          { label: "Профиль", href: "/guard/profile", icon: <User size={18} /> },
          { label: "Текущие брони", href: "/guard/bookings", icon: <Calendar size={18} /> },
          { label: "Управление ключами", href: "/guard/keys", icon: <Clock size={18} /> },
        ];
      case "admin":
        return [
          { label: "Главная", href: "/admin/dashboard", icon: <Home size={18} /> },
          { label: "Управление бронями", href: "/admin/bookings", icon: <Calendar size={18} /> },
          { label: "Аудитории", href: "/admin/rooms", icon: <Building size={18} /> },
          { label: "Пользователи", href: "/admin/users", icon: <Users size={18} /> },
          { label: "Настройки", href: "/admin/settings", icon: <Settings size={18} /> },
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
    <header className="border-b border-border sticky top-0 z-30 bg-white dark:bg-slate-900 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-2xl font-bold text-primary">
            UniBooker
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
              {item.label}
            </Link>
          ))}
          <Button variant="outline" size="sm" asChild>
            <Link to="/" className="flex items-center gap-2">
              <LogOut size={18} />
              Выйти
            </Link>
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
                  <h2 className="text-lg font-semibold mb-1">Campus Room Reserve</h2>
                </div>
                <nav className="flex-1">
                  {navItems.map((item, i) => (
                    <Button
                      key={i}
                      variant="ghost"
                      className="w-full justify-start mb-1"
                      onClick={() => {
                        navigate(link.path);
                        setOpen(false);
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </Button>
                  ))}
                </nav>
                <div className="pt-4 border-t">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                      logout();
                      navigate('/');
                      setOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Выйти
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </header>
  );
};

export default MainNavbar;
