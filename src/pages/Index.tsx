import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Key,
  Shield,
  User,
  Users,
  Building2,
  GraduationCap,
  BookOpen,
  Award,
  Code,
  Github,
  Lightbulb,
  ChevronsRight,
  Headphones,
  MessageCircle
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Index = () => {
  const { language, t } = useTranslation();
  const [currentTime, setCurrentTime] = useState("2025-04-11 11:34:28");
  const [currentUser] = useState("lilnurik");
  const [stats, setStats] = useState({
    rooms: 23,
    bookings: 186,
    users: 142,
    universities: 1
  });

  // Update time periodically
  useEffect(() => {
    // Starting with provided time
    setCurrentTime("2025-04-11 11:34:28");

    const interval = setInterval(() => {
      const now = new Date();
      const year = now.getUTCFullYear();
      const month = String(now.getUTCMonth() + 1).padStart(2, '0');
      const day = String(now.getUTCDate()).padStart(2, '0');
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');

      setCurrentTime(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
      <div className="min-h-screen flex flex-col">
        {/* Test Mode Banner */}
        <div className="bg-red-500 text-white py-2 px-4 text-center font-medium animate-pulse">
          {t('landingPage.testMode.warning')}
        </div>

        {/* Header */}
        <header className="border-b border-border py-4 px-6 bg-white dark:bg-slate-900 shadow-sm">
          <div className="container flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img
                  src="https://turin.uz/wp-content/uploads/2021/05/TTPU_15_en-2048x475.png"
                  alt="TTPU Logo"
                  className="h-15 max-w-[220px] object-contain"
              />
            </div>
            <div className="flex items-center space-x-2">
              <LanguageSwitcher />
              <Button variant="outline" asChild>
                <Link to="/login">{t('landingPage.footer.login')}</Link>
              </Button>
              <Button asChild className="hidden sm:inline-flex">
                <Link to="/register">{t('landingPage.footer.register')}</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero section */}
        <section className="py-16 px-6 flex-1 flex flex-col items-center justify-center text-center bg-gradient-to-b from-background to-secondary/30">
          <div className="container max-w-4xl space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              {t('landingPage.hero.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('landingPage.hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-6">
              <Button size="lg" asChild className="animate-slide-in">
                <Link to="/login">{t('landingPage.hero.bookButton')}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="animate-slide-in delay-100">
                <Link to="/about">{t('landingPage.hero.learnMore')}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-10 bg-primary text-primary-foreground">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-2">
                <p className="text-3xl font-bold">{stats.rooms}</p>
                <p className="text-sm opacity-90">{t('landingPage.stats.rooms')}</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold">{stats.bookings}</p>
                <p className="text-sm opacity-90">{t('landingPage.stats.bookings')}</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold">{stats.users}</p>
                <p className="text-sm opacity-90">{t('landingPage.stats.users')}</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold">{stats.universities}</p>
                <p className="text-sm opacity-90">{t('landingPage.stats.universities')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-6 bg-card">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">{t('landingPage.features.title')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background p-6 rounded-lg shadow-sm border border-border transform transition-transform hover:scale-105">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <User className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('landingPage.features.forStudents')}</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Calendar className="shrink-0 text-primary mt-1" size={16} />
                    <span>{t('landingPage.features.oneClickBooking')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="shrink-0 text-primary mt-1" size={16} />
                    <span>{t('landingPage.features.convenientTimeSelection')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Key className="shrink-0 text-primary mt-1" size={16} />
                    <span>{t('landingPage.features.accessCode')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MessageCircle className="shrink-0 text-primary mt-1" size={16} />
                    <span>{t('landingPage.features.bookingNotifications')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BookOpen className="shrink-0 text-primary mt-1" size={16} />
                    <span>{t('landingPage.features.bookingHistory')}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-background p-6 rounded-lg shadow-sm border border-border transform transition-transform hover:scale-105">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('landingPage.features.forGuards')}</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Key className="shrink-0 text-primary mt-1" size={16} />
                    <span>{t('landingPage.features.keyManagement')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="shrink-0 text-primary mt-1" size={16} />
                    <span>{t('landingPage.features.expiredBookingsControl')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Building2 className="shrink-0 text-primary mt-1" size={16} />
                    <span>{t('landingPage.features.roomStatus')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Award className="shrink-0 text-primary mt-1" size={16} />
                    <span>{t('landingPage.features.accessControl')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Headphones className="shrink-0 text-primary mt-1" size={16} />
                    <span>{t('landingPage.features.support')}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-background p-6 rounded-lg shadow-sm border border-border transform transition-transform hover:scale-105">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('landingPage.features.forAdmins')}</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Calendar className="shrink-0 text-primary mt-1" size={16} />
                    <span>{t('landingPage.features.scheduleManagement')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="shrink-0 text-primary mt-1" size={16} />
                    <span>{t('landingPage.features.userControl')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Building2 className="shrink-0 text-primary mt-1" size={16} />
                    <span>{t('landingPage.features.usageAnalytics')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Code className="shrink-0 text-primary mt-1" size={16} />
                    <span>{t('landingPage.features.scheduleIntegration')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lightbulb className="shrink-0 text-primary mt-1" size={16} />
                    <span>{t('landingPage.features.reports')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 px-6 bg-background">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">{t('landingPage.howItWorks.title')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <User className="text-primary" size={28} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('landingPage.howItWorks.step1')}</h3>
                <p className="text-muted-foreground">{t('landingPage.howItWorks.step1Desc')}</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-primary" size={28} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('landingPage.howItWorks.step2')}</h3>
                <p className="text-muted-foreground">{t('landingPage.howItWorks.step2Desc')}</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <ChevronsRight className="text-primary" size={28} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('landingPage.howItWorks.step3')}</h3>
                <p className="text-muted-foreground">{t('landingPage.howItWorks.step3Desc')}</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Key className="text-primary" size={28} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('landingPage.howItWorks.step4')}</h3>
                <p className="text-muted-foreground">{t('landingPage.howItWorks.step4Desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-6">{t('landingPage.cta.title')}</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
              {t('landingPage.cta.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/login">{t('landingPage.cta.login')}</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/register">{t('landingPage.cta.register')}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Test Mode Alert */}
        <section className="py-8 px-6 bg-background">
          <div className="container">
            <Alert className="border-red-500 bg-red-50 dark:bg-red-950/20">
              <AlertTitle className="text-red-600 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                {t('landingPage.testMode.title')}
              </AlertTitle>
              <AlertDescription className="text-red-600/90">
                {t('landingPage.testMode.warning')}
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8 px-6 bg-card">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <img
                      src="https://turin.uz/wp-content/uploads/2021/05/TTPU_15_en-2048x475.png"
                      alt="TTPU Logo"
                      className="h-15 max-w-[220px] object-contain"
                  />
                </h3>
                <p className="text-muted-foreground">
                  {t('landingPage.footer.systemDescription')}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4">{t('landingPage.footer.navigation')}</h3>
                <ul className="space-y-2">
                  <li><Link to="/" className="text-muted-foreground hover:text-primary">{t('landingPage.footer.home')}</Link></li>
                  <li><Link to="/login" className="text-muted-foreground hover:text-primary">{t('landingPage.footer.login')}</Link></li>
                  <li><Link to="/register" className="text-muted-foreground hover:text-primary">{t('landingPage.footer.register')}</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4">{t('landingPage.footer.contacts')}</h3>
                <address className="not-italic text-muted-foreground">
                  <p>Email: it.support@polito.uz</p>
                  <p>{t('landingPage.footer.phone')}: +998 (71) 203-0777 (127)</p>
                  <p className="mt-2">
                    {t('landingPage.footer.currentTime')} (UTC): <span className="font-mono">{currentTime}</span>
                  </p>
                  <p>
                    {t('landingPage.footer.user')}: <span className="font-medium">{currentUser}</span>
                  </p>
                </address>
              </div>
            </div>

            <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-center md:text-left text-muted-foreground">
                © 2025 {t('landingPage.footer.systemName')}
              </p>
              <div className="flex items-center gap-2">
                <a
                    href="https://github.com/lilnurik"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  <Github size={18} />
                  <span>{t('landingPage.footer.developedBy')} <span className="font-medium">Buriyev Nurmuxammad</span></span>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
  );
};

export default Index;