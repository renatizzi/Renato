import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { Package, Search, Folders, Home, Menu, Lock, LogOut, MoreHorizontal, Sun, Moon, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LanguageProvider, useLanguage } from "@/i18n";
import { ThemeProvider, useTheme } from "@/theme";
import ErrorBoundary from "@/components/ErrorBoundary";

// Components
import { Dashboard } from "@/components/Dashboard";
import { BoxList } from "@/components/BoxList";
import { BoxDetail } from "@/components/BoxDetail";
import { SearchPage } from "@/components/SearchPage";
import { CategoriesPage } from "@/components/CategoriesPage";
import { PrintPage } from "@/components/PrintPage";
import { PasswordPage } from "@/components/PasswordPage";
import { BackupPage } from "@/components/BackupPage";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;
export const APP_NAME = "Box Manager";

// Format date helper
const formatSystemDate = (lang) => {
  const date = new Date();
  const locale = lang === 'en' ? 'en-GB' : 'it-IT';
  return date.toLocaleDateString(locale, { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

// Login Component
const LoginPage = ({ onLogin }) => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkPasswordRequired();
  }, []);

  const checkPasswordRequired = async () => {
    try {
      const response = await axios.get(`${API}/auth/check`);
      const isRequired = response.data.password_enabled !== false;
      
      if (!isRequired) {
        localStorage.setItem("archivio_auth", "true");
        onLogin();
        toast.success(t('welcome'));
      }
    } catch (err) {
      console.error("Auth check error:", err);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await axios.post(`${API}/auth/verify`, { password });
      localStorage.setItem("archivio_auth", "true");
      onLogin();
      toast.success(t('loggedIn'));
    } catch (err) {
      setError(t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with language and theme */}
      <header className="flex items-center justify-end gap-2 p-4">
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-24 h-9">
            <Globe size={16} className="mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="it">ITA</SelectItem>
            <SelectItem value="en">ENG</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
      </header>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm animate-slide-in-up">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <img src="/icon.svg" alt="Box Manager" className="w-10 h-10" />
            </div>
            <CardTitle className="text-2xl font-extrabold">{APP_NAME}</CardTitle>
            <p className="text-muted-foreground">{t('loginTitle')}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('loginPlaceholder')}
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
                  t('loginButton')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Global Header Component
const GlobalHeader = ({ username, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isHome = location.pathname === "/";

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border no-print">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Left side - App name + username */}
        <div className="flex items-center gap-3">
          <img src="/icon.svg" alt="Box Manager" className="w-8 h-8 md:w-9 md:h-9" />
          <div>
            <h1 className="text-lg md:text-xl font-extrabold text-primary tracking-tight">
              {APP_NAME}
            </h1>
            {username && (
              <p className="text-sm text-muted-foreground">{username}</p>
            )}
          </div>
        </div>
        
        {/* Right side - Language, Theme, Date, Home icon */}
        <div className="flex items-center gap-2 md:gap-4">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-20 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="it">ITA</SelectItem>
              <SelectItem value="en">ENG</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full h-8 w-8">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          
          <span className="hidden sm:block text-sm text-muted-foreground">
            {formatSystemDate(language)}
          </span>
          
          {!isHome && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/")}
              className="rounded-full"
              data-testid="home-btn"
              title="Home"
            >
              <Home size={20} />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

// Navigation Component
const Navigation = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showOtherMenu, setShowOtherMenu] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const navItems = [
    { to: "/categories", icon: Folders, labelKey: "menuCategories" },
    { to: "/boxes", icon: Package, labelKey: "menuContainers" },
    { to: "/search", icon: Search, labelKey: "menuSearch" },
    { to: "/other", icon: MoreHorizontal, labelKey: "menuOther", isSubmenu: true },
  ];

  const otherFunctionsItems = [
    { to: "/print", labelKey: "menuExport" },
    { to: "/backup", labelKey: "menuBackup" },
    { to: "/password", labelKey: "menuPassword" },
  ];

  const handleNavClick = (item) => {
    if (item.isSubmenu) {
      setShowOtherMenu(!showOtherMenu);
    } else {
      navigate(item.to);
      setIsOpen(false);
      setShowOtherMenu(false);
    }
  };

  const NavContent = () => (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => (
        <div key={item.to || item.labelKey}>
          {item.isSubmenu ? (
            <>
              <button
                onClick={() => handleNavClick(item)}
                className="flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 hover:bg-secondary text-foreground w-full text-left"
              >
                <item.icon size={20} />
                <span className="font-medium">{t(item.labelKey)}</span>
              </button>
              {showOtherMenu && (
                <div className="ml-8 mt-1 space-y-1">
                  {otherFunctionsItems.map((subItem) => (
                    <NavLink
                      key={subItem.to}
                      to={subItem.to}
                      onClick={() => { setIsOpen(false); setShowOtherMenu(false); }}
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-secondary text-foreground"
                        }`
                      }
                    >
                      {t(subItem.labelKey)}
                    </NavLink>
                  ))}
                </div>
              )}
            </>
          ) : (
            <NavLink
              to={item.to}
              onClick={() => { setIsOpen(false); setShowOtherMenu(false); }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary text-foreground"
                }`
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{t(item.labelKey)}</span>
            </NavLink>
          )}
        </div>
      ))}
      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 hover:bg-destructive/10 text-destructive mt-4"
        data-testid="logout-btn"
      >
        <LogOut size={20} />
        <span className="font-medium">{t('menuLogout')}</span>
      </button>
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-card/50 backdrop-blur-sm border-r border-border p-6 pt-4 no-print">
        <NavContent />
      </aside>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50 no-print">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              size="icon" 
              className="h-14 w-14 rounded-full shadow-lg"
              data-testid="mobile-menu-btn"
            >
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-extrabold text-primary">{APP_NAME}</h2>
              <p className="text-sm text-muted-foreground">Menu</p>
            </div>
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

function AppContent({ onLogout, username }) {
  return (
    <div className="min-h-screen flex flex-col">
      <GlobalHeader username={username} onLogout={onLogout} />
      <div className="flex flex-1">
        <Navigation onLogout={onLogout} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/boxes" element={<BoxList />} />
            <Route path="/boxes/:id" element={<BoxDetail />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/print" element={<PrintPage />} />
            <Route path="/password" element={<PasswordPage onLogout={onLogout} />} />
            <Route path="/backup" element={<BackupPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function AppWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [username, setUsername] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    const auth = localStorage.getItem("archivio_auth");
    setIsAuthenticated(auth === "true");
    setCheckingAuth(false);
    
    if (auth === "true") {
      fetchUsername();
    }
  }, []);

  const fetchUsername = async () => {
    try {
      const response = await axios.get(`${API}/auth/settings`);
      setUsername(response.data.username || "");
    } catch (err) {
      console.error("Error fetching username:", err);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    fetchUsername();
  };

  const handleLogout = () => {
    localStorage.removeItem("archivio_auth");
    setIsAuthenticated(false);
    setUsername("");
    toast.info(t('loggedOut'));
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <AppContent onLogout={handleLogout} username={username} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </>
  );
}

// Wrapper to pass language context to ErrorBoundary (class component)
const ErrorBoundaryWithLanguage = ({ children }) => {
  const { language } = useLanguage();
  return <ErrorBoundary language={language}>{children}</ErrorBoundary>;
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="App">
          <BrowserRouter>
            <Toaster position="top-right" richColors />
            <ErrorBoundaryWithLanguage>
              <AppWrapper />
            </ErrorBoundaryWithLanguage>
          </BrowserRouter>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
