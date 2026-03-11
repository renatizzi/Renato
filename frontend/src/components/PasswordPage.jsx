import { useState, useEffect } from "react";
import apiClient from "@/services/apiClient";
import { API } from "@/App";
import { useLanguage } from "@/i18n";
import { toast } from "sonner";
import { Key, RotateCcw, Save, AlertTriangle, User, Shield, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const PasswordPage = ({ onLogout }) => {
  const { t } = useLanguage();
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
      const response = await apiClient.get(`${API}/auth/settings`);
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
      await apiClient.post(`${API}/auth/settings`, {
        username: username,
        password_enabled: passwordEnabled
      });
      toast.success(t('settingsSaved'));
      if (!passwordEnabled) {
        toast.info(t('passwordDisabled'));
      }
    } catch (error) {
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error(t('passwordsDontMatch'));
      return;
    }
    
    if (newPassword.length < 4) {
      toast.error(t('passwordTooShort'));
      return;
    }
    
    setLoading(true);
    try {
      await apiClient.post(`${API}/auth/change-password`, {
        current_password: currentPassword,
        new_password: newPassword
      });
      toast.success(t('passwordChanged'));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onLogout();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!masterPassword) {
      toast.error(t('enterMasterPassword'));
      return;
    }
    
    setLoading(true);
    try {
      const response = await apiClient.post(`${API}/auth/reset-password`, {
        master_password: masterPassword
      });
      toast.success(response.data.message);
      setMasterPassword("");
      onLogout();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('masterPasswordError'));
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
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t('passwordTitle')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('passwordDesc')}</p>
      </div>

      {/* User Settings */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            {t('userSettings')}
          </CardTitle>
          <CardDescription>{t('userSettingsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="username">{t('username')}</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('usernamePlaceholder')}
              className="mt-1"
              data-testid="username-input"
            />
            <p className="text-xs text-muted-foreground mt-1">{t('usernameHelp')}</p>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              {passwordEnabled ? (
                <Shield className="text-primary" size={24} />
              ) : (
                <ShieldOff className="text-muted-foreground" size={24} />
              )}
              <div>
                <p className="font-medium">{t('passwordProtection')}</p>
                <p className="text-sm text-muted-foreground">
                  {passwordEnabled 
                    ? t('passwordProtectionEnabled')
                    : t('passwordProtectionDisabled')}
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
            {t('saveSettings')}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className={`border-border/50 bg-card/50 backdrop-blur-sm ${!passwordEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key size={20} />
            {t('changePassword')}
          </CardTitle>
          <CardDescription>
            {passwordEnabled 
              ? t('changePasswordDesc')
              : t('enablePasswordFirst')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="current_password">{t('currentPassword')}</Label>
              <Input
                id="current_password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={t('currentPasswordPlaceholder')}
                className="mt-1"
                disabled={!passwordEnabled}
                data-testid="current-password-input"
              />
            </div>
            <div>
              <Label htmlFor="new_password">{t('newPassword')}</Label>
              <Input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('newPasswordPlaceholder')}
                className="mt-1"
                disabled={!passwordEnabled}
                data-testid="new-password-input"
              />
            </div>
            <div>
              <Label htmlFor="confirm_password">{t('confirmPassword')}</Label>
              <Input
                id="confirm_password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('confirmPasswordPlaceholder')}
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
              {t('saveNewPassword')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Reset Password */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw size={20} />
            {t('resetPassword')}
          </CardTitle>
          <CardDescription>
            {t('resetPasswordDesc')}
            <br />
            <span className="text-xs text-muted-foreground">{t('masterPasswordHint')}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="master_password">{t('masterPassword')}</Label>
              <Input
                id="master_password"
                type="password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                placeholder={t('masterPasswordPlaceholder')}
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
                  {t('resetPassword')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="text-destructive" size={20} />
                    {t('confirmReset')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('confirmResetDesc')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full">{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleResetPassword}
                    className="rounded-full"
                  >
                    {t('confirm')}
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
