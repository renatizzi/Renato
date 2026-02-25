# Box Manager - PRD

## Problem Statement
App per gestire un archivio di oggetti personali con numerazione univoca contenitori, timestamp, ricerca testuale/vocale, modifica dati, stampa/export liste.

## Tech Stack
- Backend: FastAPI + MongoDB
- Frontend: React + Tailwind + Shadcn/UI
- Voice: Web Speech API (browser native)
- i18n: Custom context (ITA/ENG) - 200+ traduzioni
- Theme: Dark/Light mode con CSS variables

## What's Implemented

### Fase 1-4 (Gen 2025) - Base
- Dashboard, CRUD contenitori/oggetti/categorie
- Ricerca testuale e vocale
- QR Code, Export CSV, Backup JSON
- Password protection, Camera capture

### Fase 5 (Feb 2025) - UI Refactoring COMPLETATA
- A1-A8: Redesign completo UI secondo fig1/fig2/fig3
- A9: Filtri avanzati Esporta & Stampa (posizione, categoria, contenitore, oggetto)
- B1: Gestione errori user-friendly (ErrorBoundary + getErrorMessage)
- B2: Dark mode con CSS variables
- B3: App rinominata "Box Manager"
- B4: Icona app (SVG box stilizzato blu, favicon e header)
- B5: Sistema bilingue ITA/ENG completo (200+ traduzioni)
- B6: Export immagini nel backup JSON

### Bug Fix (Feb 2025)
- Fix CSV export: showSaveFilePicker API con fallback blob download
- Fix Stampa: nuova finestra dedicata con dialog stampante nativa del browser
- Fix Backup download: showSaveFilePicker API con fallback blob download
- Fix layout Ripristino: allineato al layout del Backup (stesso stile bottone)

## Credenziali
- **Password**: archivio2025
- **Master password**: masterreset2025

## File Structure
```
/app/frontend/src/
├── i18n/
│   ├── translations.js
│   ├── LanguageContext.jsx
│   └── index.js
├── theme/
│   ├── ThemeContext.jsx
│   └── index.js
├── components/
│   ├── Dashboard.jsx
│   ├── BoxList.jsx
│   ├── BoxDetail.jsx
│   ├── CategoriesPage.jsx
│   ├── SearchPage.jsx
│   ├── BackupPage.jsx      # Riscritto con saveFile + layout unificato
│   ├── PrintPage.jsx        # Riscritto con saveFile + print window
│   ├── PasswordPage.jsx
│   └── ErrorBoundary.jsx
├── App.js
└── index.css
/app/frontend/public/
├── icon.svg
└── index.html
```

## Backlog / Next Steps

### P1 (Media Priorita)
- C1: Ottimizzazione Android smartphone/tablet
- C2: Commenti al codice
- C3: Istruzioni build Android APK

### P2 (Bassa Priorita)
- D1: Testing finale completo end-to-end

## Test Status
- iteration_8.json: 100% test passati (20/20)
- iteration_9: Code review bug fix confermato
