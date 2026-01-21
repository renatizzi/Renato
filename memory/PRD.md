# Archivio Oggetti Personali - PRD

## Problem Statement
App per gestire un archivio di oggetti personali con numerazione univoca scatole, timestamp inserimento, ricerca testuale e vocale, modifica dati, stampa/export lista.

## User Personas
- Utenti domestici che gestiscono il proprio inventario casalingo
- Persone che organizzano traslochi o riordini

## Core Requirements
- [x] Numerazione univoca e automatica delle scatole
- [x] Timestamp automatico all'inserimento dati
- [x] Ricerca testuale per nome/descrizione oggetti
- [x] Ricerca vocale (Web Speech API browser)
- [x] Modifica numero scatola e contenuto
- [x] Categorie per organizzazione
- [x] Stampa lista (PDF via browser)
- [x] Export CSV
- [x] Selezione parziale per stampa/export

## User Choices (20 Gen 2025)
- Tema: scelta designer (Organic & Earthy)
- Ricerca vocale: Web Speech API
- Export: PDF + CSV
- Extra: Categorie
- Auth: Nessuna (accesso diretto)

## Tech Stack
- Backend: FastAPI + MongoDB
- Frontend: React + Tailwind + Shadcn/UI
- Voice: Web Speech API (browser native)

## What's Implemented (20 Gen 2025)
- Dashboard con statistiche (scatole, oggetti, categorie)
- CRUD completo scatole con auto-numerazione
- CRUD oggetti dentro le scatole
- CRUD categorie con colori personalizzati
- Ricerca testuale con risultati
- Ricerca vocale (italiano)
- Modifica numero scatola
- Modifica contenuto (nome, descrizione)
- Stampa browser (PDF)
- Export CSV
- Selezione parziale per export
- Design responsive mobile/desktop

## What's Implemented (21 Gen 2025) - Update
- **Password di accesso**: Password singola per proteggere l'app (archivio2025)
- **URL Immagini**: Campo per aggiungere URL immagine agli oggetti con anteprima
- **Filtro per posizione**: Dropdown per filtrare scatole per posizione
- **QR Code**: Generazione QR code con numero scatola per identificazione rapida
- Logout funzionalità
- Immagini visibili nei risultati di ricerca

## What's Implemented (21 Gen 2025) - Update 2
- **Gestione Password**: Modifica password, reset con master password (masterreset2025)
- **Descrizione Funzioni**: Home page con 6 card che descrivono le funzionalità principali
- **Backup/Ripristino**: Export/import completo archivio in formato JSON
- **Pagina Impostazioni**: Nuova sezione per gestire password e backup
- Password salvata in MongoDB (modificabile a runtime)

## Backlog / Next Features (P0-P2)
### P1
- Ordinamento risultati ricerca
- Upload file immagini (storage server)

### P2
- Dark mode
- Condivisione archivio con altri utenti
- Notifiche per scatole non aggiornate da tempo
