import { useState, useRef } from "react";
import axios from "axios";
import { API } from "@/App";
import { toast } from "sonner";
import { Download, Upload, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const BackupPage = () => {
  const [restoring, setRestoring] = useState(false);
  const fileInputRef = useRef(null);

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
      
      toast.success(`Ripristino completato: ${response.data.restored.boxes} contenitori, ${response.data.restored.categories} categorie`);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Errore nel ripristino");
    } finally {
      setRestoring(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-8 animate-slide-in-up max-w-2xl" data-testid="backup-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Backup & Ripristino</h1>
        <p className="text-muted-foreground mt-1">Effettua il backup dell'archivio in formato JSON ed il relativo ripristino dei dati</p>
      </div>

      {/* Backup */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download size={20} />
            Backup Archivio
          </CardTitle>
          <CardDescription>Scarica una copia completa dell'archivio in formato JSON</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleBackup}
            className="rounded-full gap-2"
            data-testid="backup-btn"
          >
            <Download size={16} />
            Scarica Backup
          </Button>
        </CardContent>
      </Card>

      {/* Restore */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload size={20} />
            Ripristino Archivio
          </CardTitle>
          <CardDescription>Ripristina l'archivio da un file di backup JSON</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                className="rounded-full gap-2"
                disabled={restoring}
                data-testid="restore-btn"
              >
                <Upload size={16} />
                {restoring ? "Ripristino in corso..." : "Ripristina da Backup"}
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
          
          <div className="p-4 rounded-xl bg-muted/50 text-sm">
            <p className="font-medium mb-2">Informazioni sul Backup:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Il backup include tutti i contenitori, oggetti e categorie</li>
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
