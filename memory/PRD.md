# Box Manager - PRD

## Problem Statement
App per gestire un archivio di oggetti personali con numerazione univoca contenitori, timestamp, ricerca testuale/vocale, modifica dati, stampa/export liste.

## User Personas
- Utenti domestici che gestiscono inventario casalingo
- Persone che organizzano traslochi o riordini

## Tech Stack
- Backend: FastAPI + MongoDB
- Frontend: React + Tailwind + Shadcn/UI
- Voice: Web Speech API (browser native)
- i18n: Custom context (ITA/ENG)
- Theme: Dark/Light mode con CSS variables

## What's Implemented

### Phase 1-4 (Gen 2025)
- Dashboard con statistiche
- CRUD contenitori e oggetti
- CRUD categorie con colori
- Ricerca testuale e vocale
- QR Code generation
- Export CSV e backup JSON
- Password protection
- Camera capture per foto oggetti

### Phase 5 (Feb 2025) - UI Refactoring
**Completato:**
- ✅ A1: Dashboard ridisegnata secondo fig1 (4 voci menu, no "Gestione Oggetti")
- ✅ A2: Header globale con "Box Manager" + username + data + Home icon
- ✅ A3: Rimosso link "Riepilogo" dall'header
- ✅ A4: Icona Home in alto a destra su tutte le pagine
- ✅ A5: Layout Contenitori aggiornato secondo fig2
- ✅ A6: Layout Contenuto/Oggetti aggiornato secondo fig3
- ✅ A7-A8: Password page rinominata "Impostazione utente e password"
- ✅ B2: Dark mode implementata con CSS variables
- ✅ B3: App rinominata "Box Manager"
- ✅ B5: Sistema bilingue ITA/ENG con selettore lingua

**Da completare:**
- A9: Filtri avanzati in Esporta & Stampa
- B1: Gestione errori user-friendly
- B4: Icona app con box stilizzato
- B6: Export immagini nel backup JSON
- C1-C3: Ottimizzazione Android/APK/Play Store + istruzioni build

## Credenziali
- **Password**: archivio2025
- **Master password**: masterreset2025

## API Endpoints
- `/api/auth/verify`, `/api/auth/check`, `/api/auth/settings`
- `/api/auth/change-password`, `/api/auth/reset-password`
- `/api/categories` - CRUD
- `/api/boxes` - CRUD
- `/api/boxes/{id}/items` - CRUD
- `/api/search`, `/api/stats`
- `/api/export/csv`, `/api/backup`, `/api/restore`

## File Structure
```
/app/
├── backend/
│   ├── server.py
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.jsx
    │   │   ├── BoxList.jsx
    │   │   ├── BoxDetail.jsx
    │   │   ├── SearchPage.jsx
    │   │   ├── CategoriesPage.jsx
    │   │   ├── PrintPage.jsx
    │   │   ├── PasswordPage.jsx
    │   │   └── BackupPage.jsx
    │   ├── i18n/
    │   │   ├── translations.js
    │   │   ├── LanguageContext.jsx
    │   │   └── index.js
    │   ├── theme/
    │   │   ├── ThemeContext.jsx
    │   │   └── index.js
    │   ├── App.js
    │   └── index.css
    └── package.json
```

## Backlog / Next Steps

### P0 (Alta Priorità)
- A9: Migliorare filtri Esporta & Stampa (posizione, categoria, contenitore, oggetto)
- B6: Export immagini nel backup JSON

### P1 (Media Priorità)
- B1: Gestione errori user-friendly in tutta l'app
- B4: Creare icona app con box stilizzato
- Completare traduzioni in tutti i componenti

### P2 (Bassa Priorità)
- C1: Ottimizzazione per Android smartphone/tablet
- C2: Aggiungere commenti al codice
- C3: Istruzioni per build Android APK

### Backlog Futuro
- Notifiche per contenitori non aggiornati
- Condivisione archivio tra utenti
- Compressione immagini per ridurre storage
