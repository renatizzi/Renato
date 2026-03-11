# Box Manager - PRD

## Problem Statement
App per gestire un archivio di oggetti personali con contenitori, oggetti, categorie, ricerca, stampa/export, backup.

## Tech Stack
- Backend: FastAPI + MongoDB (Motor)
- Frontend: React + Tailwind + Shadcn/UI
- PWA: manifest.json + Service Worker
- i18n: Custom context (ITA/ENG) + auto-traduzione categorie
- Theme: Dark/Light mode con CSS variables
- Mobile: Capacitor 6 per APK Android

## Implementato (tutto testato D1 - 100%)

### Core
- Dashboard con 4 voci menu + statistiche
- CRUD Categorie (11 default + custom) con colori
- CRUD Contenitori con posizione, categoria, QR Code
- CRUD Oggetti con nome, descrizione, immagine (camera/upload)
- Ricerca testuale e vocale

### Export & Stampa
- CSV export con showSaveFilePicker (dialog "Salva con nome")
- Stampa in finestra dedicata (dialog stampante nativa)
- 4 filtri avanzati: posizione, categoria, contenitore, oggetto

### Backup & Ripristino
- Download JSON con showSaveFilePicker
- Ripristino da file con conferma dialog
- Include immagini nel backup

### Autenticazione
- Password DISABILITATA di default (accesso diretto)
- Attivabile da Impostazioni Utente
- Reset con master password: masterreset2025
- Username personalizzabile

### UI/UX
- Bilingue ITA/ENG con 200+ traduzioni
- Traduzione automatica categorie default al cambio lingua
- Dark/Light mode
- Header globale con icona, lingua, tema, data, Home
- ErrorBoundary con messaggi errore localizzati
- Layout responsive (mobile 412px+)

### PWA & Android
- manifest.json + Service Worker + meta tag
- Capacitor 6 con progetto Android generato
- Icone per tutte le densità Android
- network_security_config.xml per HTTP locale
- Script build automatico: build_apk.sh

## File principali
```
/app/backend/server.py
/app/frontend/src/App.js
/app/frontend/src/components/*.jsx
/app/frontend/src/i18n/
/app/frontend/src/theme/
/app/frontend/android/
/app/BoxManager-debug.apk
/app/build_apk.sh
/app/GUIDA_APK_ANDROID.md
```

## Credenziali
- Login: nessuna (password disabilitata)
- Master password: masterreset2025

## Test Reports
- D1 finale: /app/test_reports/iteration_1.json (97% backend, 100% frontend)
