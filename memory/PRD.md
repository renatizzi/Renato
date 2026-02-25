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
**Tutte le modifiche UI secondo fig1/fig2/fig3:**
- A1: Dashboard ridisegnata (4 voci menu, no "Gestione Oggetti")
- A2: Header globale "Box Manager" + username + data + Home icon
- A3: Rimosso link "Riepilogo"
- A4: Icona Home su tutte le pagine
- A5: Layout Contenitori secondo fig2
- A6: Layout Contenuto/Oggetti secondo fig3
- A7-A8: Password page "Impostazione utente e password"
- A9: Filtri avanzati Esporta & Stampa (posizione, categoria, contenitore, oggetto)
- B1: Gestione errori user-friendly (ErrorBoundary + getErrorMessage in tutti i componenti)
- B2: Dark mode con CSS variables
- B3: App rinominata "Box Manager"
- B4: Icona app (SVG box stilizzato blu, favicon e header)
- B5: Sistema bilingue ITA/ENG completo (200+ traduzioni)
- B6: Export immagini nel backup JSON (gia funzionante)

**Pagine tradotte:**
- Dashboard, BoxList, BoxDetail
- CategoriesPage, SearchPage
- BackupPage, PrintPage, PasswordPage
- Login, Navigation

## Credenziali
- **Password**: archivio2025
- **Master password**: masterreset2025

## File Structure
```
/app/frontend/src/
├── i18n/
│   ├── translations.js    # 200+ traduzioni ITA/ENG
│   ├── LanguageContext.jsx
│   └── index.js
├── theme/
│   ├── ThemeContext.jsx   # Dark/Light mode
│   └── index.js
├── components/
│   ├── Dashboard.jsx      # Menu tradotto
│   ├── BoxList.jsx        # Layout fig2 + traduzioni + error handling
│   ├── BoxDetail.jsx      # Layout fig3 + traduzioni + error handling
│   ├── CategoriesPage.jsx # Traduzioni + error handling
│   ├── SearchPage.jsx     # Traduzioni + error handling
│   ├── BackupPage.jsx     # Traduzioni + error handling
│   ├── PrintPage.jsx      # Filtri avanzati A9 + error handling
│   ├── PasswordPage.jsx   # Traduzioni complete
│   └── ErrorBoundary.jsx  # B1 Error boundary + getErrorMessage
├── App.js                 # LanguageProvider, ThemeProvider, ErrorBoundary
└── index.css              # CSS variables dark mode
/app/frontend/public/
├── icon.svg               # B4 App icon
└── index.html             # Updated title + favicon
```

## Backlog / Next Steps

### P1 (Media Priorita)
- C1: Ottimizzazione Android smartphone/tablet
- C2: Commenti al codice
- C3: Istruzioni build Android APK

### P2 (Bassa Priorita)
- D1: Testing finale completo end-to-end

## Test Status
- Fase 5-6: 100% test passati (iteration_8.json)
- Frontend: Tutti i componenti tradotti e funzionanti
- Dark mode: Funzionante su tutte le pagine
- Bilingue: ITA/ENG switching funzionante
- ErrorBoundary: Integrato e testato
- Filtri avanzati stampa: 4 filtri funzionanti
- Icona app: Visibile in login, header e favicon
