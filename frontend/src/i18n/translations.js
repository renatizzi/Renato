// Translations for the app
// Supports Italian (default) and English

export const translations = {
  it: {
    // App
    appName: "Box Manager",
    
    // Login
    loginTitle: "Inserisci la password per accedere",
    loginPlaceholder: "Password",
    loginButton: "Accedi",
    loginError: "Password errata",
    welcome: "Benvenuto!",
    loggedIn: "Accesso effettuato",
    loggedOut: "Disconnesso",
    
    // Dashboard
    dashboardTitle: "Box Manager Dash-Board",
    totalLabel: "Totale",
    functionality: "Funzionalità",
    
    // Menu items
    menuCategories: "Gestione Categorie",
    menuContainers: "Gestione Contenitori",
    menuSearch: "Ricerca Avanzata",
    menuOther: "Altre Funzioni",
    menuExport: "Esporta & Stampa",
    menuBackup: "Backup & Ripristino",
    menuPassword: "Impostazione utente e password",
    menuLogout: "Esci",
    
    // Descriptions
    descCategories: "Crea e organizza la categoria colorata del singolo contenitore (tipologia degli oggetti contenuti, descrizione, caratteristica, ecc.)",
    descContainers: "Crea e organizza i contenitori (numerazione, categoria e posizione) con eventuale creazione e stampa del QR Code, consentendo la gestione degli oggetti ivi riposti.",
    descOther: "Esporta & Stampa, Backup & Ripristino, Password e impostazione utente",
    descSearch: "Trova gli oggetti custoditi nei contenitori mediante ricerca testuale o vocale",
    descExport: "Esporta l'archivio in un file CSV per l'elaborazione immediata con altre applicazioni e Stampa liste complete o parziali dell'archivio",
    descBackup: "Effettua il backup dell'archivio in formato JSON ed il relativo ripristino dei dati",
    descPassword: "Consente di inserire il nome dell'utente e di gestire la password di accesso con possibilità di ripristino di quella originale",
    
    // Categories page
    categoriesTitle: "Gestione Categorie",
    categoriesDesc: "Crea e organizza la categoria colorata del singolo contenitore",
    newCategory: "Nuova Categoria",
    editCategory: "Modifica Categoria",
    categoryName: "Nome Categoria",
    categoryColor: "Colore",
    categoryPlaceholder: "es. Elettronica",
    noCategories: "Nessuna categoria",
    createFirstCategory: "Crea la tua prima categoria",
    deleteCategory: "Eliminare la categoria?",
    deleteCategoryWarning: "Questa azione è irreversibile. La categoria verrà rimossa da tutti i contenitori.",
    
    // Containers page
    containersTitle: "Gestione Contenitori",
    containersDesc: "Crea e organizza i contenitori (numerazione, categoria e posizione) con eventuale creazione e stampa del QR Code",
    newContainer: "Nuovo Contenitore",
    editContainer: "Modifica Contenitore",
    containerName: "Nome",
    containerCategory: "Categoria",
    containerLocation: "Posizione",
    containerNamePlaceholder: "es. Libri Camera",
    containerLocationPlaceholder: "es. Cantina, Scaffale 3",
    noContainers: "Nessun contenitore",
    createFirstContainer: "Crea il tuo primo contenitore per iniziare",
    totalItems: "Totale oggetti",
    viewContent: "Visualizza contenuto",
    deleteContainer: "Eliminare il contenitore?",
    deleteContainerWarning: "Questa azione è irreversibile. Tutti gli oggetti nel contenitore verranno eliminati.",
    allCategories: "Tutte le categorie",
    allLocations: "Tutte le posizioni",
    noCategory: "Nessuna categoria",
    selectCategory: "Seleziona categoria",
    
    // Box detail page
    contentTitle: "Gestione Contenuto/Oggetti",
    contentDesc: "Crea e organizza gli oggetti dei singoli contenitori (nome oggetto, descrizione, eventuale foto)",
    containerSection: "Contenitore",
    itemsSection: "Lista Oggetti",
    addItem: "Aggiungi",
    newItem: "Nuovo Oggetto",
    editItem: "Modifica Oggetto",
    itemName: "Nome",
    itemDescription: "Descrizione (opzionale)",
    itemPhoto: "Foto (opzionale)",
    itemNamePlaceholder: "es. Libro di cucina",
    itemDescPlaceholder: "Aggiungi dettagli...",
    emptyContainer: "Contenitore vuoto",
    addFirstItem: "Aggiungi il primo oggetto",
    deleteItem: "Eliminare l'oggetto?",
    deleteItemWarning: "verrà eliminato permanentemente.",
    
    // Camera
    takePhoto: "Scatta foto",
    newPhoto: "Nuova foto",
    confirmPhoto: "Conferma",
    cameraNotSupported: "Il tuo browser non supporta l'accesso alla fotocamera.",
    cameraPermissionDenied: "Permesso fotocamera negato.",
    cameraNotFound: "Nessuna fotocamera trovata.",
    cameraInUse: "Fotocamera in uso da altra app.",
    cameraError: "Impossibile accedere alla fotocamera.",
    startingCamera: "Avvio fotocamera...",
    waitCamera: "Attendi...",
    retry: "Riprova",
    close: "Chiudi",
    
    // Search page
    searchTitle: "Ricerca Avanzata",
    searchDesc: "Trova gli oggetti custoditi nei contenitori mediante ricerca testuale o vocale",
    searchPlaceholder: "Cerca oggetti...",
    voiceSearch: "Ricerca vocale",
    voiceListening: "In ascolto...",
    stopListening: "Interrompi",
    noResults: "Nessun risultato",
    noResultsDesc: "Prova a cercare con termini diversi",
    resultsFound: "risultati trovati",
    inContainer: "nel contenitore",
    
    // Password page
    passwordTitle: "Impostazione utente e password",
    passwordDesc: "Consente di inserire il nome dell'utente e di gestire la password di accesso con possibilità di ripristino di quella originale",
    userSettings: "Impostazioni Utente",
    userSettingsDesc: "Configura il nome utente e le opzioni di accesso",
    username: "Nome Utente",
    usernamePlaceholder: "Inserisci il tuo nome",
    usernameHelp: "Questo nome verrà mostrato nell'app",
    passwordProtection: "Protezione Password",
    passwordProtectionEnabled: "L'app richiede la password per accedere",
    passwordProtectionDisabled: "L'accesso all'app è libero senza password",
    saveSettings: "Salva Impostazioni",
    changePassword: "Modifica Password",
    changePasswordDesc: "Cambia la password di accesso all'app",
    enablePasswordFirst: "Abilita la protezione password per modificare",
    currentPassword: "Password Attuale",
    currentPasswordPlaceholder: "Inserisci la password attuale",
    newPassword: "Nuova Password",
    newPasswordPlaceholder: "Minimo 4 caratteri",
    confirmPassword: "Conferma Nuova Password",
    confirmPasswordPlaceholder: "Ripeti la nuova password",
    saveNewPassword: "Salva Nuova Password",
    resetPassword: "Reset Password",
    resetPasswordDesc: "Ripristina la password di default usando la master password.",
    masterPasswordHint: "Master password: masterreset2025",
    masterPassword: "Master Password",
    masterPasswordPlaceholder: "Inserisci la master password",
    confirmReset: "Conferma Reset Password",
    confirmResetDesc: "La password verrà ripristinata a \"archivio2025\". Dovrai effettuare nuovamente l'accesso.",
    passwordsDontMatch: "Le password non coincidono",
    passwordTooShort: "La password deve avere almeno 4 caratteri",
    passwordChanged: "Password modificata con successo",
    settingsSaved: "Impostazioni salvate",
    passwordDisabled: "La password è ora disabilitata. L'accesso sarà libero.",
    enterMasterPassword: "Inserisci la master password",
    masterPasswordError: "Master password errata",
    
    // Backup page
    backupTitle: "Backup & Ripristino",
    backupDesc: "Effettua il backup dell'archivio in formato JSON ed il relativo ripristino dei dati",
    createBackup: "Crea Backup",
    createBackupDesc: "Scarica un file JSON contenente tutti i dati dell'archivio (contenitori, oggetti, categorie e impostazioni)",
    downloadBackup: "Scarica Backup",
    backupCreatedAt: "Backup creato il",
    restoreBackup: "Ripristina Backup",
    restoreBackupDesc: "Carica un file di backup JSON per ripristinare i dati. ATTENZIONE: tutti i dati attuali verranno sostituiti.",
    selectFile: "Seleziona File JSON",
    restoreFromFile: "Ripristina da File",
    confirmRestore: "Conferma Ripristino",
    confirmRestoreDesc: "Tutti i dati attuali verranno sostituiti con quelli del backup. Questa azione è irreversibile.",
    restoreSuccess: "Dati ripristinati con successo!",
    restoreError: "Errore nel ripristino. Verifica che il file sia valido.",
    
    // Print page
    printTitle: "Esporta & Stampa",
    printDesc: "Esporta l'archivio in un file CSV per l'elaborazione immediata con altre applicazioni e Stampa liste complete o parziali dell'archivio",
    filters: "Filtri",
    selectAll: "Seleziona tutti",
    deselectAll: "Deseleziona tutti",
    exportCSV: "Esporta CSV",
    print: "Stampa",
    selected: "selezionati",
    containers: "contenitori",
    items: "oggetti",
    
    // QR Code
    qrCodeTitle: "QR Code Contenitore",
    printQR: "Stampa QR Code",
    
    // Common
    save: "Salva",
    cancel: "Annulla",
    delete: "Elimina",
    edit: "Modifica",
    create: "Crea",
    add: "Aggiungi",
    loading: "Caricamento...",
    error: "Errore",
    success: "Successo",
    warning: "Attenzione",
    confirm: "Conferma",
    
    // Default categories
    defaultCategories: [
      "Abiti",
      "Box di cartone",
      "Box di plastica",
      "Casalinghi",
      "Elettricità",
      "Elettronica",
      "Fai da te",
      "Foto & Video",
      "Libri",
      "Materiale vario",
      "Minuteria"
    ]
  },
  
  en: {
    // App
    appName: "Box Manager",
    
    // Login
    loginTitle: "Enter password to access",
    loginPlaceholder: "Password",
    loginButton: "Login",
    loginError: "Wrong password",
    welcome: "Welcome!",
    loggedIn: "Logged in",
    loggedOut: "Logged out",
    
    // Dashboard
    dashboardTitle: "Box Manager Dashboard",
    totalLabel: "Total",
    functionality: "Features",
    
    // Menu items
    menuCategories: "Manage Categories",
    menuContainers: "Manage Containers",
    menuSearch: "Advanced Search",
    menuOther: "Other Functions",
    menuExport: "Export & Print",
    menuBackup: "Backup & Restore",
    menuPassword: "User & Password Settings",
    menuLogout: "Logout",
    
    // Descriptions
    descCategories: "Create and organize colored categories for containers (type of contents, description, characteristics, etc.)",
    descContainers: "Create and organize containers (numbering, category and location) with optional QR Code generation and printing, allowing management of stored items.",
    descOther: "Export & Print, Backup & Restore, Password and user settings",
    descSearch: "Find items stored in containers using text or voice search",
    descExport: "Export the archive to CSV file for immediate processing with other applications and print complete or partial lists",
    descBackup: "Create archive backup in JSON format and restore data from backup",
    descPassword: "Set user name and manage access password with option to restore to original",
    
    // Categories page
    categoriesTitle: "Manage Categories",
    categoriesDesc: "Create and organize colored categories for containers",
    newCategory: "New Category",
    editCategory: "Edit Category",
    categoryName: "Category Name",
    categoryColor: "Color",
    categoryPlaceholder: "e.g. Electronics",
    noCategories: "No categories",
    createFirstCategory: "Create your first category",
    deleteCategory: "Delete category?",
    deleteCategoryWarning: "This action is irreversible. The category will be removed from all containers.",
    
    // Containers page
    containersTitle: "Manage Containers",
    containersDesc: "Create and organize containers (numbering, category and location) with optional QR Code generation and printing",
    newContainer: "New Container",
    editContainer: "Edit Container",
    containerName: "Name",
    containerCategory: "Category",
    containerLocation: "Location",
    containerNamePlaceholder: "e.g. Bedroom Books",
    containerLocationPlaceholder: "e.g. Basement, Shelf 3",
    noContainers: "No containers",
    createFirstContainer: "Create your first container to get started",
    totalItems: "Total items",
    viewContent: "View content",
    deleteContainer: "Delete container?",
    deleteContainerWarning: "This action is irreversible. All items in the container will be deleted.",
    allCategories: "All categories",
    allLocations: "All locations",
    noCategory: "No category",
    selectCategory: "Select category",
    
    // Box detail page
    contentTitle: "Manage Content/Items",
    contentDesc: "Create and organize items in containers (item name, description, optional photo)",
    containerSection: "Container",
    itemsSection: "Item List",
    addItem: "Add",
    newItem: "New Item",
    editItem: "Edit Item",
    itemName: "Name",
    itemDescription: "Description (optional)",
    itemPhoto: "Photo (optional)",
    itemNamePlaceholder: "e.g. Cookbook",
    itemDescPlaceholder: "Add details...",
    emptyContainer: "Empty container",
    addFirstItem: "Add the first item",
    deleteItem: "Delete item?",
    deleteItemWarning: "will be permanently deleted.",
    
    // Camera
    takePhoto: "Take photo",
    newPhoto: "New photo",
    confirmPhoto: "Confirm",
    cameraNotSupported: "Your browser does not support camera access.",
    cameraPermissionDenied: "Camera permission denied.",
    cameraNotFound: "No camera found.",
    cameraInUse: "Camera is being used by another app.",
    cameraError: "Unable to access camera.",
    startingCamera: "Starting camera...",
    waitCamera: "Wait...",
    retry: "Retry",
    close: "Close",
    
    // Search page
    searchTitle: "Advanced Search",
    searchDesc: "Find items stored in containers using text or voice search",
    searchPlaceholder: "Search items...",
    voiceSearch: "Voice search",
    voiceListening: "Listening...",
    stopListening: "Stop",
    noResults: "No results",
    noResultsDesc: "Try searching with different terms",
    resultsFound: "results found",
    inContainer: "in container",
    
    // Password page
    passwordTitle: "User & Password Settings",
    passwordDesc: "Set user name and manage access password with option to restore to original",
    userSettings: "User Settings",
    userSettingsDesc: "Configure username and access options",
    username: "Username",
    usernamePlaceholder: "Enter your name",
    usernameHelp: "This name will be displayed in the app",
    passwordProtection: "Password Protection",
    passwordProtectionEnabled: "The app requires password to access",
    passwordProtectionDisabled: "Access to the app is free without password",
    saveSettings: "Save Settings",
    changePassword: "Change Password",
    changePasswordDesc: "Change the app access password",
    enablePasswordFirst: "Enable password protection to modify",
    currentPassword: "Current Password",
    currentPasswordPlaceholder: "Enter current password",
    newPassword: "New Password",
    newPasswordPlaceholder: "Minimum 4 characters",
    confirmPassword: "Confirm New Password",
    confirmPasswordPlaceholder: "Repeat new password",
    saveNewPassword: "Save New Password",
    resetPassword: "Reset Password",
    resetPasswordDesc: "Restore default password using master password.",
    masterPasswordHint: "Master password: masterreset2025",
    masterPassword: "Master Password",
    masterPasswordPlaceholder: "Enter master password",
    confirmReset: "Confirm Password Reset",
    confirmResetDesc: "Password will be restored to \"archivio2025\". You will need to log in again.",
    passwordsDontMatch: "Passwords don't match",
    passwordTooShort: "Password must be at least 4 characters",
    passwordChanged: "Password changed successfully",
    settingsSaved: "Settings saved",
    passwordDisabled: "Password is now disabled. Access is free.",
    enterMasterPassword: "Enter master password",
    masterPasswordError: "Wrong master password",
    
    // Backup page
    backupTitle: "Backup & Restore",
    backupDesc: "Create archive backup in JSON format and restore data from backup",
    createBackup: "Create Backup",
    createBackupDesc: "Download a JSON file containing all archive data (containers, items, categories and settings)",
    downloadBackup: "Download Backup",
    backupCreatedAt: "Backup created on",
    restoreBackup: "Restore Backup",
    restoreBackupDesc: "Upload a JSON backup file to restore data. WARNING: all current data will be replaced.",
    selectFile: "Select JSON File",
    restoreFromFile: "Restore from File",
    confirmRestore: "Confirm Restore",
    confirmRestoreDesc: "All current data will be replaced with backup data. This action is irreversible.",
    restoreSuccess: "Data restored successfully!",
    restoreError: "Restore error. Check that the file is valid.",
    
    // Print page
    printTitle: "Export & Print",
    printDesc: "Export the archive to CSV file for immediate processing with other applications and print complete or partial lists",
    filters: "Filters",
    selectAll: "Select all",
    deselectAll: "Deselect all",
    exportCSV: "Export CSV",
    print: "Print",
    selected: "selected",
    containers: "containers",
    items: "items",
    
    // QR Code
    qrCodeTitle: "Container QR Code",
    printQR: "Print QR Code",
    
    // Common
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    add: "Add",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    warning: "Warning",
    confirm: "Confirm",
    
    // Default categories
    defaultCategories: [
      "Clothing",
      "Cardboard boxes",
      "Plastic boxes",
      "Household items",
      "Electrical",
      "Electronics",
      "DIY",
      "Photos & Videos",
      "Books",
      "Miscellaneous",
      "Small items"
    ]
  }
};

// Get translation by key
export const getTranslation = (lang, key) => {
  const keys = key.split('.');
  let value = translations[lang] || translations['it'];
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to Italian
      value = translations['it'];
      for (const k2 of keys) {
        value = value?.[k2];
      }
      break;
    }
  }
  return value || key;
};

// Bidirectional mapping of default categories IT <-> EN
export const categoryMap = {
  "Abiti": "Clothing",
  "Box di cartone": "Cardboard boxes",
  "Box di plastica": "Plastic boxes",
  "Casalinghi": "Household items",
  "Elettricità": "Electrical",
  "Elettronica": "Electronics",
  "Fai da te": "DIY",
  "Foto & Video": "Photos & Videos",
  "Libri": "Books",
  "Materiale vario": "Miscellaneous",
  "Minuteria": "Small items"
};

// Reverse map EN -> IT
export const categoryMapReverse = Object.fromEntries(
  Object.entries(categoryMap).map(([it, en]) => [en, it])
);

// Translate a category name from one language to another
export const translateCategory = (name, toLang) => {
  if (toLang === 'en') {
    return categoryMap[name] || name;
  }
  return categoryMapReverse[name] || name;
};

// Check if a category name is a known default
export const isDefaultCategory = (name) => {
  return name in categoryMap || name in categoryMapReverse;
};

export default translations;
