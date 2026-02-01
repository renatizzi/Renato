import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { toast } from "sonner";
import { Key, RotateCcw, Save, AlertTriangle, User, Shield, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const PasswordPage = ({ onLogout }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Settings state
  const [username, setUsername] = useState("");
  const [passwordEnabled, setPasswordEnabled] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/auth/settings`);
      setUsername(response.data.username || "");
      setPasswordEnabled(response.data.password_enabled !== false);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/auth/settings`, {
        username: username,
        password_enabled: passwordEnabled
      });
      toast.success("Impostazioni salvate");
      if (!passwordEnabled) {
        toast.info("La password è ora disabilitata. L'accesso sarà libero.");
      }
    } catch (error) {
      toast.error("Errore nel salvare le impostazioni");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Le password non coincidono");
      return;
    }
    
    if (newPassword.length < 4) {
      toast.error("La password deve avere almeno 4 caratteri");
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API}/auth/change-password`, {
        current_password: currentPassword,
        new_password: newPassword
      });
      toast.success("Password modificata con successo");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onLogout();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Errore nella modifica password");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!masterPassword) {
      toast.error("Inserisci la master password");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/reset-password`, {
        master_password: masterPassword
      });
      toast.success(response.data.message);
      setMasterPassword("");
      onLogout();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Master password errata");
    } finally {
      setLoading(false);
    }
  };

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in-up max-w-2xl" data-testid="password-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Password</h1>
        <p className="text-muted-foreground mt-1">Gestisce la password di accesso con possibilità di ripristino di quella originale</p>
      </div>

      {/* User Settings */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            Impostazioni Utente
          </CardTitle>
          <CardDescription>Configura il nome utente e le opzioni di accesso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="username">Nome Utente</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Inserisci il tuo nome"
              className="mt-1"
              data-testid="username-input"
            />
            <p className="text-xs text-muted-foreground mt-1">Questo nome verrà mostrato nell'app</p>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              {passwordEnabled ? (
                <Shield className="text-primary" size={24} />
              ) : (
                <ShieldOff className="text-muted-foreground" size={24} />
              )}
              <div>
                <p className="font-medium">Protezione Password</p>
                <p className="text-sm text-muted-foreground">
                  {passwordEnabled 
                    ? "L'app richiede la password per accedere" 
                    : "L'accesso all'app è libero senza password"}
                </p>
              </div>
            </div>
            <Switch
              checked={passwordEnabled}
              onCheckedChange={setPasswordEnabled}
              data-testid="password-enabled-switch"
            />
          </div>
          
          <Button 
            onClick={handleSaveSettings}
            className="rounded-full gap-2"
            disabled={loading}
            data-testid="save-settings-btn"
          >
            <Save size={16} />
            Salva Impostazioni
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className={`border-border/50 bg-card/50 backdrop-blur-sm ${!passwordEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key size={20} />
            Modifica Password
          </CardTitle>
          <CardDescription>
            {passwordEnabled 
              ? "Cambia la password di accesso all'app" 
              : "Abilita la protezione password per modificare"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="current_password">Password Attuale</Label>
              <Input
                id="current_password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Inserisci la password attuale"
                className="mt-1"
                disabled={!passwordEnabled}
                data-testid="current-password-input"
              />
            </div>
            <div>
              <Label htmlFor="new_password">Nuova Password</Label>
              <Input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimo 4 caratteri"
                className="mt-1"
                disabled={!passwordEnabled}
                data-testid="new-password-input"
              />
            </div>
            <div>
              <Label htmlFor="confirm_password">Conferma Nuova Password</Label>
              <Input
                id="confirm_password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ripeti la nuova password"
                className="mt-1"
                disabled={!passwordEnabled}
                data-testid="confirm-password-input"
              />
            </div>
            <Button 
              type="submit" 
              className="rounded-full gap-2"
              disabled={loading || !currentPassword || !newPassword || !confirmPassword || !passwordEnabled}
              data-testid="change-password-btn"
            >
              <Save size={16} />
              Salva Nuova Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Reset Password */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw size={20} />
            Reset Password
          </CardTitle>
          <CardDescription>
            Ripristina la password di default usando la master password.
            <br />
            <span className="text-xs text-muted-foreground">Master password: masterreset2025</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="master_password">Master Password</Label>
              <Input
                id="master_password"
                type="password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                placeholder="Inserisci la master password"
                className="mt-1"
                data-testid="master-password-input"
              />
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="rounded-full gap-2"
                  disabled={!masterPassword}
                  data-testid="reset-password-btn"
                >
                  <RotateCcw size={16} />
                  Reset Password
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="text-destructive" size={20} />
                    Conferma Reset Password
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    La password verrà ripristinata a "archivio2025". Dovrai effettuare nuovamente l'accesso.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full">Annulla</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleResetPassword}
                    className="rounded-full"
                  >
                    Conferma Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
