import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    const { t, language = 'it' } = this.props;
    
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md border-destructive/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="text-destructive" size={32} />
              </div>
              <CardTitle className="text-xl">
                {language === 'en' ? 'Something went wrong' : 'Qualcosa è andato storto'}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {language === 'en' 
                  ? 'An unexpected error occurred. Please try refreshing the page or go back to home.'
                  : 'Si è verificato un errore inaspettato. Prova a ricaricare la pagina o torna alla home.'}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={this.handleReload} className="w-full rounded-full gap-2">
                <RefreshCw size={16} />
                {language === 'en' ? 'Reload page' : 'Ricarica pagina'}
              </Button>
              <Button onClick={this.handleGoHome} variant="outline" className="w-full rounded-full gap-2">
                <Home size={16} />
                {language === 'en' ? 'Go to home' : 'Vai alla home'}
              </Button>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 p-3 rounded-lg bg-muted text-xs font-mono overflow-auto max-h-32">
                  {this.state.error.toString()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Error messages mapping
export const getErrorMessage = (error, language = 'it') => {
  const errorMessages = {
    it: {
      network: 'Errore di connessione. Verifica la tua connessione internet.',
      server: 'Errore del server. Riprova più tardi.',
      notFound: 'Elemento non trovato.',
      unauthorized: 'Sessione scaduta. Effettua nuovamente l\'accesso.',
      forbidden: 'Non hai i permessi per questa azione.',
      validation: 'Dati non validi. Controlla i campi inseriti.',
      timeout: 'La richiesta ha impiegato troppo tempo. Riprova.',
      unknown: 'Si è verificato un errore. Riprova.',
      cameraPermission: 'Permesso fotocamera negato. Abilita l\'accesso nelle impostazioni del browser.',
      cameraNotFound: 'Nessuna fotocamera trovata sul dispositivo.',
      cameraInUse: 'La fotocamera è in uso da un\'altra applicazione.',
      fileInvalid: 'File non valido. Assicurati che sia nel formato corretto.',
      fileTooLarge: 'File troppo grande. La dimensione massima è 10MB.',
      passwordMismatch: 'Le password non coincidono.',
      passwordTooShort: 'La password deve avere almeno 4 caratteri.',
      duplicateNumber: 'Numero contenitore già esistente.',
    },
    en: {
      network: 'Connection error. Check your internet connection.',
      server: 'Server error. Please try again later.',
      notFound: 'Item not found.',
      unauthorized: 'Session expired. Please log in again.',
      forbidden: 'You don\'t have permission for this action.',
      validation: 'Invalid data. Check the entered fields.',
      timeout: 'Request took too long. Please try again.',
      unknown: 'An error occurred. Please try again.',
      cameraPermission: 'Camera permission denied. Enable access in browser settings.',
      cameraNotFound: 'No camera found on device.',
      cameraInUse: 'Camera is being used by another application.',
      fileInvalid: 'Invalid file. Make sure it\'s in the correct format.',
      fileTooLarge: 'File too large. Maximum size is 10MB.',
      passwordMismatch: 'Passwords don\'t match.',
      passwordTooShort: 'Password must be at least 4 characters.',
      duplicateNumber: 'Container number already exists.',
    }
  };

  const messages = errorMessages[language] || errorMessages.it;

  // Map HTTP status codes to error types
  if (error?.response) {
    const status = error.response.status;
    if (status === 401) return messages.unauthorized;
    if (status === 403) return messages.forbidden;
    if (status === 404) return messages.notFound;
    if (status === 400) return error.response.data?.detail || messages.validation;
    if (status >= 500) return messages.server;
  }

  // Map error names
  if (error?.code === 'ECONNABORTED') return messages.timeout;
  if (error?.message?.includes('Network Error')) return messages.network;
  if (error?.name === 'NotAllowedError') return messages.cameraPermission;
  if (error?.name === 'NotFoundError') return messages.cameraNotFound;
  if (error?.name === 'NotReadableError') return messages.cameraInUse;

  // Return backend error if available
  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }

  return messages.unknown;
};

// Suggested actions for errors
export const getErrorSuggestion = (error, language = 'it') => {
  const suggestions = {
    it: {
      network: 'Controlla la connessione WiFi o dati mobili',
      server: 'Il problema è temporaneo, riprova tra qualche minuto',
      unauthorized: 'Clicca su "Esci" e accedi nuovamente',
      cameraPermission: 'Vai nelle impostazioni del browser > Permessi > Fotocamera',
      cameraNotFound: 'Collega una fotocamera o usa un dispositivo con fotocamera integrata',
      fileInvalid: 'Seleziona un file JSON valido esportato da Box Manager',
      default: 'Se il problema persiste, ricarica la pagina',
    },
    en: {
      network: 'Check your WiFi or mobile data connection',
      server: 'The issue is temporary, try again in a few minutes',
      unauthorized: 'Click "Logout" and log in again',
      cameraPermission: 'Go to browser settings > Permissions > Camera',
      cameraNotFound: 'Connect a camera or use a device with built-in camera',
      fileInvalid: 'Select a valid JSON file exported from Box Manager',
      default: 'If the problem persists, reload the page',
    }
  };

  const msgs = suggestions[language] || suggestions.it;
  
  if (error?.response?.status === 401) return msgs.unauthorized;
  if (error?.message?.includes('Network Error')) return msgs.network;
  if (error?.response?.status >= 500) return msgs.server;
  if (error?.name === 'NotAllowedError') return msgs.cameraPermission;
  if (error?.name === 'NotFoundError') return msgs.cameraNotFound;
  
  return msgs.default;
};

export default ErrorBoundary;
