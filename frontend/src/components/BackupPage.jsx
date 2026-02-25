import { useState, useRef } from "react";
import axios from "axios";
import { API } from "@/App";
import { useLanguage } from "@/i18n";
import { getErrorMessage, getErrorSuggestion } from "@/components/ErrorBoundary";
import { toast } from "sonner";
import { Download, Upload, AlertTriangle, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Helper: download file with Save As dialog when available
const saveFile = async (blob, suggestedName, fileType) => {
  // Try File System Access API (Chrome/Edge - gives Save As dialog)
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [fileType],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (err) {
      // User cancelled the dialog
      if (err.name === 'AbortError') return false;
      // Fallback if API fails
    }
  }

  // Fallback: standard download with suggested name
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = suggestedName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  // Cleanup after a delay
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 1000);
  return true;
};

export const BackupPage = () => {
  const { t, language } = useLanguage();
  const [restoring, setRestoring] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const fileInputRef = useRef(null);

  const handleBackup = async () => {
    setDownloading(true);
    try {
      const response = await axios.get(`${API}/backup`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/json' });
      const suggestedName = `boxmanager_backup_${new Date().toISOString().slice(0,10)}.json`;

      const saved = await saveFile(blob, suggestedName, {
        description: 'JSON Backup',
        accept: { 'application/json': ['.json'] },
      });

      if (saved) {
        toast.success(language === 'en' ? 'Backup downloaded successfully' : 'Backup scaricato con successo');
      }
    } catch (error) {
      toast.error(getErrorMessage(error, language), { description: getErrorSuggestion(error, language) });
    } finally {
      setDownloading(false);
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleRestoreFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error(language === 'en' ? 'Please select a valid JSON file' : 'Seleziona un file JSON valido');
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
      toast.error(getErrorMessage(error, language), { description: getErrorSuggestion(error, language) });
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

      {/* Backup Card */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download size={20} />
            {t('createBackup')}
          </CardTitle>
          <CardDescription>{t('createBackupDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleBackup}
            className="rounded-full gap-2"
            disabled={downloading}
            data-testid="backup-btn"
          >
            {downloading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Download size={16} />
            )}
            {downloading
              ? (language === 'en' ? 'Creating...' : 'Creazione...')
              : t('downloadBackup')
            }
          </Button>
        </CardContent>
      </Card>

      {/* Restore Card - layout aligned with Backup card */}
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
              <Button
                className="rounded-full gap-2"
                disabled={restoring}
                data-testid="restore-btn"
              >
                {restoring ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Upload size={16} />
                )}
                {restoring
                  ? (language === 'en' ? 'Restoring...' : 'Ripristino...')
                  : t('restoreFromFile')
                }
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
                  <FolderOpen size={16} className="mr-2" />
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
