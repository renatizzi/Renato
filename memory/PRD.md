# Archivio Oggetti Personali - PRD

## Problem Statement
App per gestire un archivio di oggetti personali con numerazione univoca scatole, timestamp inserimento, ricerca testuale e vocale, modifica dati, stampa/export lista.

## User Personas
- Utenti domestici che gestiscono il proprio inventario casalingo
- Persone che organizzano traslochi o riordini

## Core Requirements
- [x] Numerazione univoca e automatica dei contenitori
- [x] Timestamp automatico all'inserimento dati
- [x] Ricerca testuale per nome/descrizione oggetti
- [x] Ricerca vocale (Web Speech API browser)
- [x] Modifica numero contenitore e contenuto
- [x] Categorie per organizzazione
- [x] Stampa lista (PDF via browser)
- [x] Export CSV
- [x] Selezione parziale per stampa/export

## Tech Stack
- Backend: FastAPI + MongoDB
- Frontend: React + Tailwind + Shadcn/UI
- Voice: Web Speech API (browser native)

## What's Implemented

### Fase 1 (20 Gen 2025)
- Dashboard con statistiche (contenitori, oggetti, categorie)
- CRUD completo contenitori con auto-numerazione
- CRUD oggetti dentro i contenitori
- CRUD categorie con colori personalizzati
- Ricerca testuale con risultati
- Ricerca vocale (italiano)
- Modifica numero contenitore
- Modifica contenuto (nome, descrizione)
- Stampa browser (PDF)
- Export CSV
- Selezione parziale per export
- Design responsive mobile/desktop

### Fase 2 (21 Gen 2025)
- **Password di accesso**: Password singola per proteggere l'app
- **URL Immagini**: Campo per aggiungere URL immagine agli oggetti con anteprima
- **Filtro per posizione**: Dropdown per filtrare contenitori per posizione
- **QR Code**: Generazione QR code con numero contenitore per identificazione rapida
- Logout funzionalità
- Immagini visibili nei risultati di ricerca

### Fase 3 (21 Gen 2025)
- **Gestione Password**: Modifica password, reset con master password (masterreset2025)
- **Descrizione Funzioni**: Home page con tabella menu funzionalità
- **Backup/Ripristino**: Export/import completo archivio in formato JSON
- **Pagina Impostazioni**: Nuova sezione per gestire password e backup
- Password salvata in MongoDB (modificabile a runtime)

### Fase 4 (24 Gen 2025)
- **Nuova Dashboard**: "Riepilogo contenitori" con tabella menu funzionalità
- **Menu Altre Funzioni**: Dialog con Esporta & Stampa, Backup & Ripristino, Password
- **Terminologia**: "Scatola" → "Contenitore" in tutta l'app
- **Acquisizione Foto**: Fotocamera dispositivo invece di URL (base64)
- Descrizioni dettagliate per ogni funzionalità
- Contatori per categorie, contenitori e oggetti

### Fase 5 (1 Feb 2025) - COMPLETATA
- **Bug Camera Risolto**: La camera ora mostra messaggi di errore user-friendly invece di crashare
  - "Nessuna fotocamera trovata sul dispositivo"
  - "Permesso fotocamera negato. Abilita l'accesso nelle impostazioni del browser"
  - "La fotocamera è in uso da un'altra applicazione"
  - Pulsanti "Riprova" e "Chiudi"
- **Username Editabile**: Campo per inserire il nome utente nella pagina Password
- **Password Opzionale**: Switch per abilitare/disabilitare la protezione password
- **Menu Hamburger Sincronizzato**: Menu mobile corrisponde esattamente alla dashboard
- **Categorie Alfabetiche**: Liste ordinate alfabeticamente
- **Categorie Default**: Seeding automatico con 11 categorie predefinite se archivio vuoto
- **Logout Funzionante**: Pulsante "Esci" nel menu laterale
- **Dialog Stabili**: I form non si chiudono accidentalmente cliccando fuori

## Credenziali
- **Password attuale**: 1954 (modificata dall'utente)
- **Password default**: archivio2025
- **Master password**: masterreset2025 (per reset)

## API Endpoints
- `/api/auth/verify` - Verifica password
- `/api/auth/check` - Controlla se password è richiesta
- `/api/auth/settings` - GET/POST username e password_enabled
- `/api/auth/change-password` - Modifica password
- `/api/auth/reset-password` - Reset con master password
- `/api/categories` - CRUD categorie
- `/api/boxes` - CRUD contenitori
- `/api/boxes/{id}/items` - CRUD oggetti
- `/api/search` - Ricerca
- `/api/stats` - Statistiche
- `/api/export/csv` - Export CSV
- `/api/backup` - Backup JSON
- `/api/restore` - Ripristino da backup

## Backlog / Future Features

### P1 (Alta Priorità)
- Ordinamento risultati ricerca per rilevanza
- Compressione immagini per ridurre storage

### P2 (Media Priorità)
- Dark mode
- Condivisione archivio con altri utenti
- Notifiche per contenitori non aggiornati da tempo
- Vista calendario per date inserimento
