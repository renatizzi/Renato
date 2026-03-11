# Box Manager - PRD

## Problem Statement
App per gestire un archivio di oggetti personali con numerazione univoca contenitori, timestamp, ricerca testuale/vocale, modifica dati, stampa/export liste.

## Tech Stack
- Backend: FastAPI + MongoDB
- Frontend: React + Tailwind + Shadcn/UI
- Voice: Web Speech API (browser native)
- i18n: Custom context (ITA/ENG) - 200+ traduzioni + auto-traduzione categorie
- Theme: Dark/Light mode con CSS variables
- PWA: manifest.json + Service Worker + installabilità

## What's Implemented

### Fase 1-4 (Gen 2025) - Base
- Dashboard, CRUD contenitori/oggetti/categorie
- Ricerca testuale e vocale
- QR Code, Export CSV, Backup JSON
- Password protection, Camera capture

### Fase 5 (Feb 2025) - UI Refactoring
- A1-A8: Redesign completo UI secondo fig1/fig2/fig3
- A9: Filtri avanzati Esporta & Stampa
- B1: Gestione errori user-friendly (ErrorBoundary + getErrorMessage)
- B2: Dark mode con CSS variables
- B3: App rinominata "Box Manager"
- B4: Icona app (SVG + PNG 192/512/180)
- B5: Sistema bilingue ITA/ENG completo
- B6: Export immagini nel backup JSON

### Bug Fix (Feb 2025)
- Fix CSV export: showSaveFilePicker API con fallback
- Fix Stampa: nuova finestra dedicata con dialog stampante nativa
- Fix Backup download: showSaveFilePicker con fallback
- Fix layout Ripristino: allineato al Backup

### C1 + PWA (Feb 2025) - Android & Mobile
- manifest.json con 3 icone (SVG, PNG 192, PNG 512), display standalone
- Service Worker (sw.js) con cache-first per static, network-only per API
- Meta tag PWA: theme-color, mobile-web-app-capable, apple-mobile-web-app
- CSS safe areas per standalone mode (env safe-area-inset)
- Touch target minimi 44px su mobile
- Input font-size 16px per evitare zoom su iOS
- Icona app visibile su tutti i viewport

### Traduzione automatica categorie (Feb 2025)
- Mappatura bidirezionale IT↔EN per 11 categorie default
- LanguageContext traduce automaticamente le categorie nel DB quando si cambia lingua
- Categorie custom (non default) non vengono modificate
- CategoriesPage si aggiorna dopo il cambio lingua

### APK Android (Feb 2025)
- Capacitor 6 configurato e integrato
- Progetto Android generato con icone personalizzate (tutte le densità mipmap)
- network_security_config.xml per traffico HTTP in rete locale
- APK debug generato: `/app/BoxManager-debug.apk` (4.8 MB)
- Script automatico: `/app/build_apk.sh <IP_BACKEND>`
- Guida completa: `/app/GUIDA_APK_ANDROID.md`

## Credenziali
- **Password**: archivio2025
- **Master password**: masterreset2025

## File Structure
```
/app/frontend/
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── sw.js                # Service Worker
│   ├── icon.svg             # Icona SVG
│   ├── icon-192.png         # Icona 192x192
│   ├── icon-512.png         # Icona 512x512
│   ├── apple-touch-icon.png # Icona Apple 180x180
│   └── index.html           # Meta tag PWA
├── src/
│   ├── i18n/
│   │   ├── translations.js  # 200+ traduzioni + categoryMap bidirezionale
│   │   ├── LanguageContext.jsx # handleSetLanguage con auto-traduzione
│   │   └── index.js
│   ├── theme/
│   │   ├── ThemeContext.jsx
│   │   └── index.js
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── BoxList.jsx
│   │   ├── BoxDetail.jsx
│   │   ├── CategoriesPage.jsx # Refresh on language change
│   │   ├── SearchPage.jsx
│   │   ├── BackupPage.jsx     # showSaveFilePicker + layout unificato
│   │   ├── PrintPage.jsx      # showSaveFilePicker + print window
│   │   ├── PasswordPage.jsx
│   │   └── ErrorBoundary.jsx
│   ├── App.js
│   ├── index.js             # SW registration
│   └── index.css            # PWA + mobile CSS
```

## Backlog / Next Steps

### P2 (Bassa Priorita)
- D1: Testing finale completo end-to-end

## Documenti
- `/app/GUIDA_APK_ANDROID.md` - Guida completa creazione APK + Google Play

## Test Status
- iteration_9.json: 100% test passati (19/19) - PWA, traduzione categorie, mobile, regressione desktop
