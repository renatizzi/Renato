import { useState, useRef } from "react";
import axios from "axios";
import { API } from "@/App";
import { useLanguage } from "@/i18n";
import { getErrorMessage, getErrorSuggestion } from "@/components/ErrorBoundary";
import { toast } from "sonner";
import { Download, Upload, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const BackupPage = () => {
  const { t, language } = useLanguage();
  const [restoring, setRestoring] = useState(false);
  const fileInputRef = useRef(null);

  const handleBackup = async () => {
    try {
      const response = await axios.get(`${API}/backup`, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = `boxmanager_backup_${new Date().toISOString().slice(0,10)}.json`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(t('success'));
    } catch (error) {
      toast.error(t('error'));
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleRestoreFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.json')) {
      toast.error(t('selectFile'));
      return;
    }
    
    setRestoring(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await axios.post(`${API}/restore`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success(t('restoreSuccess'));
    } catch (error) {
      toast.error(t('restoreError'));
    } finally {
      setRestoring(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-slide-in-up max-w-2xl" data-testid="backup-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t('backupTitle')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('backupDesc')}</p>
      </div>

      {/* Backup */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download size={20} />
            {t('createBackup')}
          </CardTitle>
          <CardDescription>{t('createBackupDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleBackup} className="rounded-full gap-2" data-testid="backup-btn">
            <Download size={16} />
            {t('downloadBackup')}
          </Button>
        </CardContent>
      </Card>

      {/* Restore */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload size={20} />
            {t('restoreBackup')}
          </CardTitle>
          <CardDescription>{t('restoreBackupDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input type="file" ref={fileInputRef} onChange={handleRestoreFile} accept=".json" className="hidden" />
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="rounded-full gap-2" disabled={restoring} data-testid="restore-btn">
                <Upload size={16} />
                {restoring ? t('loading') : t('restoreFromFile')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="text-destructive" size={20} />
                  {t('confirmRestore')}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  <strong>{t('warning')}:</strong> {t('confirmRestoreDesc')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full">{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleRestoreClick} className="rounded-full bg-destructive">
                  {t('selectFile')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <div className="p-4 rounded-xl bg-muted/50 text-sm">
            <p className="font-medium mb-2">{language === 'en' ? 'Backup Info:' : 'Informazioni sul Backup:'}</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>{language === 'en' ? 'Backup includes all containers, items and categories' : 'Il backup include tutti i contenitori, oggetti e categorie'}</li>
              <li>{language === 'en' ? 'File format: JSON (readable and editable)' : 'Formato file: JSON (leggibile e modificabile)'}</li>
              <li>{language === 'en' ? 'Restore completely overwrites existing data' : 'Il ripristino sovrascrive completamente i dati esistenti'}</li>
              <li>{language === 'en' ? 'Recommended: make regular backups' : 'Consigliato: effettua backup regolari'}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
