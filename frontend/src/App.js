import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { Package, Search, Folders, Printer, Plus, Mic, MicOff, Home, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Components
import { Dashboard } from "@/components/Dashboard";
import { BoxList } from "@/components/BoxList";
import { BoxDetail } from "@/components/BoxDetail";
import { SearchPage } from "@/components/SearchPage";
import { CategoriesPage } from "@/components/CategoriesPage";
import { PrintPage } from "@/components/PrintPage";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Navigation Component
const Navigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { to: "/", icon: Home, label: "Dashboard" },
    { to: "/boxes", icon: Package, label: "Scatole" },
    { to: "/search", icon: Search, label: "Cerca" },
    { to: "/categories", icon: Folders, label: "Categorie" },
    { to: "/print", icon: Printer, label: "Stampa" },
  ];

  const NavContent = () => (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => setIsOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-secondary text-foreground"
            }`
          }
          data-testid={`nav-${item.label.toLowerCase()}`}
        >
          <item.icon size={20} />
          <span className="font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-card/50 backdrop-blur-sm border-r border-border p-6 no-print">
        <div className="mb-8">
          <h1 className="text-xl font-extrabold text-primary tracking-tight">Archivio</h1>
          <p className="text-sm text-muted-foreground">Oggetti Personali</p>
        </div>
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border no-print">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-extrabold text-primary">Archivio</h1>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="mobile-menu-btn">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-6">
              <div className="mb-8">
                <h1 className="text-xl font-extrabold text-primary tracking-tight">Archivio</h1>
                <p className="text-sm text-muted-foreground">Oggetti Personali</p>
              </div>
              <NavContent />
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
};

function AppContent() {
  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1 lg:p-8 p-4 pt-20 lg:pt-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/boxes" element={<BoxList />} />
          <Route path="/boxes/:id" element={<BoxDetail />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/print" element={<PrintPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <AppContent />
      </BrowserRouter>
    </div>
  );
}

export default App;
