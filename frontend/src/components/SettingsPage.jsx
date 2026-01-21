import { useState, useRef } from "react";
import axios from "axios";
import { API } from "@/App";
import { toast } from "sonner";
import { Settings, Key, Download, Upload, RotateCcw, Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const SettingsPage = ({ onLogout }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const fileInputRef = useRef(null);

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
      // Force re-login with new password
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

  const handleBackup = async () => {
    try {
      const response = await axios.get(`${API}/backup`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = `archivio_backup_${new Date().toISOString().slice(0,10)}.json`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Backup scaricato con successo");
    } catch (error) {
      toast.error("Errore nel backup");
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleRestoreFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.json')) {
      toast.error("Seleziona un file JSON valido");
      return;
    }
    
    setRestoring(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API}/restore`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success(`Ripristino completato: ${response.data.restored.boxes} scatole, ${response.data.restored.categories} categorie`);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Errore nel ripristino");
    } finally {
      setRestoring(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-8 animate-slide-in-up max-w-2xl" data-testid="settings-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Impostazioni</h1>
        <p className="text-muted-foreground mt-1">Gestisci password e backup dell'archivio</p>
      </div>

      {/* Change Password */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key size={20} />
            Modifica Password
          </CardTitle>
          <CardDescription>Cambia la password di accesso all'app</CardDescription>
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
                data-testid="confirm-password-input"
              />
            </div>
            <Button 
              type="submit" 
              className="rounded-full gap-2"
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
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

      {/* Backup & Restore */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download size={20} />
            Backup & Ripristino
          </CardTitle>
          <CardDescription>Salva o ripristina l'intero archivio in formato JSON</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleBackup}
              className="rounded-full gap-2 flex-1"
              data-testid="backup-btn"
            >
              <Download size={16} />
              Scarica Backup
            </Button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleRestoreFile}
              accept=".json"
              className="hidden"
            />
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="rounded-full gap-2 flex-1"
                  disabled={restoring}
                  data-testid="restore-btn"
                >
                  <Upload size={16} />
                  {restoring ? "Ripristino..." : "Ripristina Backup"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="text-destructive" size={20} />
                    Conferma Ripristino
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    <strong>Attenzione:</strong> Il ripristino cancellerà tutti i dati attuali e li sostituirà con quelli del backup. Questa azione è irreversibile.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full">Annulla</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleRestoreClick}
                    className="rounded-full bg-destructive"
                  >
                    Seleziona File e Ripristina
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <div className="p-4 rounded-xl bg-muted/50 text-sm">
            <p className="font-medium mb-2">Informazioni sul Backup:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Il backup include tutte le scatole, oggetti e categorie</li>
              <li>Formato file: JSON (leggibile e modificabile)</li>
              <li>Il ripristino sovrascrive completamente i dati esistenti</li>
              <li>Consigliato: effettua backup regolari</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
