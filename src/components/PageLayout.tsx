
import { ReactNode } from "react";
import MainNavbar from "./MainNavbar";

interface PageLayoutProps {
  children: ReactNode;
  role?: "student" | "guard" | "admin";
}

const PageLayout = ({ children, role = "student" }: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNavbar role={role} />
      <main className="flex-1 container py-6">
        {children}
      </main>
      <footer className="border-t border-border py-4 bg-card">
        <div className="container text-center text-muted-foreground text-sm">
          <p>© 2025 UniBooker - Система бронирования помещений университета</p>
        </div>
      </footer>
    </div>
  );
};

export default PageLayout;
