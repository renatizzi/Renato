import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { Package, Search, Folders, Printer, Home, Menu, Lock, LogOut, Settings, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Components
import { Dashboard } from "@/components/Dashboard";
import { BoxList } from "@/components/BoxList";
import { BoxDetail } from "@/components/BoxDetail";
import { SearchPage } from "@/components/SearchPage";
import { CategoriesPage } from "@/components/CategoriesPage";
import { PrintPage } from "@/components/PrintPage";
import { SettingsPage } from "@/components/SettingsPage";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Login Component
const LoginPage = ({ onLogin }) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await axios.post(`${API}/auth/verify`, { password });
      localStorage.setItem("archivio_auth", "true");
      onLogin();
      toast.success("Accesso effettuato");
    } catch (err) {
      setError("Password errata");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm animate-slide-in-up">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Lock className="text-primary" size={32} />
          </div>
          <CardTitle className="text-2xl font-extrabold">Archivio Personale</CardTitle>
          <p className="text-muted-foreground">Inserisci la password per accedere</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="h-12 text-center text-lg"
              data-testid="login-password-input"
              autoFocus
            />
            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}
            <Button 
              type="submit" 
              className="w-full h-12 rounded-full btn-bounce"
              disabled={loading || !password}
              data-testid="login-submit-btn"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                "Accedi"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Navigation Component
const Navigation = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { to: "/", icon: Home, label: "Riepilogo" },
    { to: "/boxes", icon: Package, label: "Contenitori" },
    { to: "/search", icon: Search, label: "Cerca" },
    { to: "/categories", icon: Folders, label: "Categorie" },
    { to: "/print", icon: Printer, label: "Stampa" },
    { to: "/settings", icon: Settings, label: "Impostazioni" },
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
      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 hover:bg-destructive/10 text-destructive mt-4"
        data-testid="logout-btn"
      >
        <LogOut size={20} />
        <span className="font-medium">Esci</span>
      </button>
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

function AppContent({ onLogout }) {
  return (
    <div className="flex min-h-screen">
      <Navigation onLogout={onLogout} />
      <main className="flex-1 lg:p-8 p-4 pt-20 lg:pt-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/boxes" element={<BoxList />} />
          <Route path="/boxes/:id" element={<BoxDetail />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/print" element={<PrintPage />} />
          <Route path="/settings" element={<SettingsPage onLogout={onLogout} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem("archivio_auth");
    setIsAuthenticated(auth === "true");
    setCheckingAuth(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("archivio_auth");
    setIsAuthenticated(false);
    toast.info("Disconnesso");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        {isAuthenticated ? (
          <AppContent onLogout={handleLogout} />
        ) : (
          <LoginPage onLogin={handleLogin} />
        )}
      </BrowserRouter>
    </div>
  );
}

export default App;
