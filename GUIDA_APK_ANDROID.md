# Box Manager - Guida Creazione APK Android

## Indice
1. [Panoramica](#panoramica)
2. [Prerequisiti](#prerequisiti)
3. [Parte A: Preparazione del Backend](#parte-a-preparazione-del-backend)
4. [Parte B: Creazione dell'APK con Capacitor](#parte-b-creazione-dellapk-con-capacitor)
5. [Parte C: Installazione sui dispositivi Android](#parte-c-installazione-sui-dispositivi-android)
6. [Parte D: Aggiornamenti futuri](#parte-d-aggiornamenti-futuri)
7. [Parte E: Distribuzione Google Play (futuro)](#parte-e-distribuzione-google-play-futuro)
8. [Risoluzione problemi](#risoluzione-problemi)

---

## Panoramica

Box Manager è composto da due parti:
- **Frontend** (React) → diventerà l'APK Android
- **Backend** (FastAPI + MongoDB) → deve girare su un server raggiungibile dal telefono

```
┌─────────────────┐         ┌─────────────────────────┐
│   Telefono      │  WiFi   │  Computer/Server        │
│   (APK)         │ ──────> │  FastAPI + MongoDB      │
│   Frontend      │  HTTP   │  Backend (porta 8001)   │
└─────────────────┘         └─────────────────────────┘
```

**Due opzioni per il backend:**
- **Opzione 1 - Rete locale:** Il backend gira sul tuo PC. Funziona solo quando PC e telefono sono sulla stessa rete WiFi. Gratuito, nessun dominio.
- **Opzione 2 - Cloud gratuito:** Il backend gira su Render.com (piano free). Funziona ovunque ci sia internet. Gratuito, nessun dominio personale.

---

## Prerequisiti

Installa questi software sul tuo computer:

### Software obbligatori
| Software | Versione minima | Download |
|----------|----------------|----------|
| Node.js | 18+ | https://nodejs.org |
| Yarn | 1.22+ | `npm install -g yarn` |
| Python | 3.10+ | https://python.org |
| Git | qualsiasi | https://git-scm.com |
| Android Studio | 2024+ | https://developer.android.com/studio |

### Verifica installazione
Apri un terminale e verifica:
```bash
node --version      # deve essere v18+
yarn --version      # deve essere 1.22+
python --version    # deve essere 3.10+
git --version
```

### Android Studio - Configurazione
1. Apri Android Studio
2. Vai su **Settings → Languages & Frameworks → Android SDK**
3. Nella tab **SDK Platforms**: installa **Android 14 (API 34)**
4. Nella tab **SDK Tools**: assicurati siano installati:
   - Android SDK Build-Tools
   - Android SDK Command-line Tools
   - Android Emulator (opzionale, per test senza telefono)
5. Prendi nota del percorso **Android SDK Location** (es. `C:\Users\TUO_NOME\AppData\Local\Android\Sdk`)

### Variabili d'ambiente (Windows)
Aggiungi queste variabili d'ambiente di sistema:
```
ANDROID_HOME = C:\Users\TUO_NOME\AppData\Local\Android\Sdk
```
E aggiungi al PATH:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
```

### Variabili d'ambiente (macOS/Linux)
Aggiungi al file `~/.bashrc` o `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools
```

---

## Parte A: Preparazione del Backend

### A1. Scaricare il codice
Da Emergent, usa il pulsante **"Save to GitHub"** per salvare il progetto su GitHub, poi:
```bash
git clone https://github.com/TUO_UTENTE/TUO_REPO.git
cd TUO_REPO
```

Oppure scarica lo ZIP del progetto da Emergent e estrailo.

### A2. Installare MongoDB
MongoDB è il database dell'app.

**Windows:**
1. Scarica MongoDB Community Server da https://www.mongodb.com/try/download/community
2. Installa con le opzioni predefinite (include MongoDB Compass)
3. MongoDB partirà automaticamente come servizio Windows

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### A3. Configurare il Backend

```bash
cd backend
```

Crea il file `.env`:
```bash
# Su Windows
echo MONGO_URL=mongodb://localhost:27017 > .env
echo DB_NAME=box_manager >> .env

# Su macOS/Linux
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=box_manager
EOF
```

Installa le dipendenze Python:
```bash
pip install -r requirements.txt
```

### A4. Avviare il Backend

```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001
```

Per verificare che funzioni, apri nel browser: http://localhost:8001/api/stats

Dovresti vedere: `{"total_boxes":0,"total_items":0,"total_categories":0}`

### A5. Trovare l'IP del computer (per rete locale)

Se vuoi usare il backend in rete locale (Opzione 1):

**Windows:**
```bash
ipconfig
# Cerca "IPv4 Address" sotto la tua connessione WiFi, es: 192.168.1.100
```

**macOS:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# Es: 192.168.1.100
```

**Linux:**
```bash
hostname -I
# Es: 192.168.1.100
```

Prendi nota dell'IP. Il tuo backend sarà raggiungibile dal telefono a: `http://192.168.1.100:8001`

### A6. (Alternativa) Deploy su Render.com (Cloud gratuito)

Se preferisci che il backend sia sempre raggiungibile da internet:

1. Crea un account su https://render.com (gratuito)
2. Crea un nuovo **Web Service** collegato al tuo repo GitHub
3. Configura:
   - **Runtime:** Python
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free
4. Aggiungi le variabili d'ambiente:
   - `MONGO_URL` = la stringa di connessione MongoDB Atlas (vedi sotto)
   - `DB_NAME` = `box_manager`
5. Per MongoDB cloud, crea un cluster gratuito su https://cloud.mongodb.com
   - Crea un cluster M0 (gratuito)
   - Crea un utente database
   - Ottieni la stringa di connessione (es: `mongodb+srv://utente:password@cluster.xxxxx.mongodb.net`)
6. Dopo il deploy, Render ti darà un URL tipo: `https://box-manager-xxxx.onrender.com`
   - Questo sarà il tuo `REACT_APP_BACKEND_URL`

---

## Parte B: Creazione dell'APK con Capacitor

### B1. Preparare il Frontend

```bash
cd frontend
```

Modifica il file `.env` con l'URL del backend:
```bash
# Se usi rete locale (sostituisci con il TUO IP):
REACT_APP_BACKEND_URL=http://192.168.1.100:8001

# Se usi Render.com:
REACT_APP_BACKEND_URL=https://box-manager-xxxx.onrender.com
```

Installa le dipendenze:
```bash
yarn install
```

Verifica che il frontend funzioni:
```bash
yarn start
# Apri http://localhost:3000 nel browser
```

### B2. Build di produzione del Frontend

```bash
yarn build
```

Questo crea la cartella `build/` con i file ottimizzati.

### B3. Installare Capacitor

```bash
# Installa Capacitor
yarn add @capacitor/core @capacitor/cli

# Inizializza Capacitor
npx cap init "Box Manager" "com.boxmanager.app" --web-dir build
```

Questo crea il file `capacitor.config.ts` (o `.json`). Verificalo:

```bash
cat capacitor.config.ts
```

Deve contenere qualcosa come:
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.boxmanager.app',
  appName: 'Box Manager',
  webDir: 'build'
};

export default config;
```

### B4. Aggiungere la piattaforma Android

```bash
npx cap add android
```

Questo crea la cartella `android/` con il progetto Android Studio.

### B5. Copiare il build nel progetto Android

```bash
# Ogni volta che modifichi il frontend:
yarn build
npx cap copy android
```

### B6. Configurare l'icona dell'app

Copia le icone nella cartella Android:
```bash
# L'icona è già nel progetto come icon-192.png e icon-512.png
# Copiala nelle risorse Android:
cp public/icon-192.png android/app/src/main/res/drawable/icon.png
```

Per un'icona più professionale con le dimensioni corrette per Android:

1. Apri Android Studio
2. Apri il progetto nella cartella `android/`
3. Click destro su `app/src/main/res` → **New → Image Asset**
4. Seleziona **Source Asset → Path** e scegli `public/icon-512.png`
5. Android Studio genererà automaticamente tutte le dimensioni necessarie
6. Clicca **Next → Finish**

### B7. Configurare il traffico HTTP (rete locale)

Se usi la rete locale (HTTP, non HTTPS), devi permettere il traffico non cifrato.

Crea il file `android/app/src/main/res/xml/network_security_config.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

Modifica `android/app/src/main/AndroidManifest.xml`, aggiungi nel tag `<application>`:
```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ... >
```

> **Nota:** Questo passaggio NON è necessario se usi Render.com (HTTPS).

### B8. Generare l'APK

**Metodo 1 - Da terminale (raccomandato):**
```bash
cd android

# APK di debug (più veloce, per test):
./gradlew assembleDebug
# Il file APK sarà in: android/app/build/outputs/apk/debug/app-debug.apk

# APK di release (più piccolo, per uso finale):
./gradlew assembleRelease
# Il file APK sarà in: android/app/build/outputs/apk/release/app-release-unsigned.apk
```

Su **Windows**, usa `gradlew.bat` al posto di `./gradlew`:
```bash
cd android
gradlew.bat assembleDebug
```

**Metodo 2 - Da Android Studio:**
1. Apri Android Studio
2. **File → Open** → seleziona la cartella `android/`
3. Aspetta che Gradle finisca il sync (barra di progresso in basso)
4. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
5. Al termine, clicca su **"locate"** nel pop-up per trovare il file APK

### B9. Firmare l'APK di release (opzionale)

Per un APK di release firmato (necessario per Google Play, ma utile anche per te):

```bash
# Genera un keystore (una sola volta, conservalo bene!)
keytool -genkey -v -keystore boxmanager-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias boxmanager

# Ti chiederà una password e alcuni dati. Ricorda la password!
```

Crea il file `android/key.properties`:
```properties
storeFile=../boxmanager-release-key.jks
storePassword=LA_TUA_PASSWORD
keyAlias=boxmanager
keyPassword=LA_TUA_PASSWORD
```

Modifica `android/app/build.gradle`, aggiungi prima del blocco `android {}`:
```groovy
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

E dentro il blocco `android {}`, aggiungi:
```groovy
signingConfigs {
    release {
        if (keystorePropertiesFile.exists()) {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

Poi ricompila:
```bash
cd android
./gradlew assembleRelease
# APK firmato in: android/app/build/outputs/apk/release/app-release.apk
```

---

## Parte C: Installazione sui dispositivi Android

### C1. Preparare il telefono

1. Vai in **Impostazioni → Info telefono**
2. Tocca **"Numero build"** 7 volte per attivare le opzioni sviluppatore
3. Vai in **Impostazioni → Opzioni sviluppatore**
4. Attiva **"Debug USB"**
5. Vai in **Impostazioni → Sicurezza** (o Privacy)
6. Attiva **"Installa app da fonti sconosciute"** (o "Installa app sconosciute" per il tuo file manager/browser)

### C2. Trasferire e installare l'APK

**Metodo 1 - Cavo USB:**
1. Collega il telefono al computer con un cavo USB
2. Sul telefono, scegli **"Trasferimento file"** nella notifica USB
3. Copia il file `app-debug.apk` (o `app-release.apk`) nella memoria del telefono
4. Sul telefono, apri il **File Manager** e tocca il file APK
5. Conferma l'installazione

**Metodo 2 - ADB (più rapido):**
```bash
# Collega il telefono via USB, poi:
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Metodo 3 - WiFi (senza cavo):**
1. Invia il file APK a te stesso via email, Telegram, Google Drive, ecc.
2. Apri il file sul telefono e installa

### C3. Primo avvio

1. Trova l'icona **"Box Manager"** nel drawer delle app
2. Apri l'app
3. Inserisci la password: `archivio2025`
4. Se usi la rete locale, assicurati che telefono e PC siano sulla stessa rete WiFi

### C4. Installazione su altri dispositivi

Ripeti i passi C1-C3 su ogni dispositivo. Lo stesso file APK funziona su tutti.

---

## Parte D: Aggiornamenti futuri

Quando modifichi l'app e vuoi aggiornare l'APK:

```bash
cd frontend

# 1. Rebuild del frontend
yarn build

# 2. Copia nel progetto Android
npx cap copy android

# 3. Rebuild dell'APK
cd android
./gradlew assembleDebug
# (o assembleRelease per la versione firmata)

# 4. Installa sul telefono
adb install -r app/build/outputs/apk/debug/app-debug.apk
# -r = reinstalla mantenendo i dati
```

---

## Parte E: Distribuzione Google Play (futuro)

Se in futuro vuoi pubblicare su Google Play, ci sono requisiti aggiuntivi.

### Cosa serve in più

| Requisito | Perché | Costo |
|-----------|--------|-------|
| Account Google Play Developer | Per pubblicare | 25$ una tantum |
| Backend sempre online | Gli utenti devono poter usare l'app | Gratuito (Render.com free tier) o ~5$/mese (Railway, Fly.io) |
| HTTPS | Obbligatorio per Google Play | Incluso con Render.com |
| Privacy Policy | Obbligatoria su Google Play | Gratuita (genera su privacypolicygenerator.info) |
| App Bundle (.aab) | Formato richiesto da Google Play | Già supportato da Capacitor |

### Opzione 1: Capacitor (raccomandato)

Capacitor è già configurato nel progetto. Per Google Play basta:

1. Generare un **App Bundle** invece di un APK:
```bash
cd android
./gradlew bundleRelease
# File in: android/app/build/outputs/bundle/release/app-release.aab
```

2. Creare un account su https://play.google.com/console (25$ una tantum)
3. Creare una nuova app e caricare il file `.aab`
4. Compilare la scheda dello store (descrizione, screenshot, privacy policy)
5. Inviare per la revisione (2-7 giorni)

### Opzione 2: TWA (Trusted Web Activity)

TWA è un'alternativa che richiede un **dominio web con HTTPS**. L'app è essenzialmente un "wrapper" del sito web.

**Prerequisiti aggiuntivi:**
- Un dominio (es. `boxmanager.tuodominio.it`) - da ~10$/anno
- Backend deployato su quel dominio con HTTPS
- File `assetlinks.json` per verificare la proprietà del dominio

**Setup con Bubblewrap (strumento Google):**
```bash
# Installa Bubblewrap
npm install -g @nicolo-ribaudo/pwa-to-twa

# Oppure usa Bubblewrap CLI
npm install -g @nicolo-nicolo-nicolo-nicolo  

# Strumento consigliato: PWA Builder
# Vai su https://www.pwabuilder.com
# Inserisci l'URL del tuo sito
# Scarica il pacchetto Android generato
```

**Perché Capacitor è meglio per te:**
| | Capacitor | TWA |
|---|-----------|-----|
| Richiede dominio | No | Si |
| Richiede HTTPS | No (per uso locale) | Si |
| Funziona offline | Parzialmente (con SW) | Dipende dal SW |
| Aspetto | App nativa | Chrome senza barra |
| Facilità | Media | Media |
| Google Play | Si | Si |

**Raccomandazione:** Usa Capacitor. Non richiede dominio, funziona in rete locale, e se vorrai pubblicare su Google Play in futuro, il passo è minimo (genera .aab invece di .apk).

---

## Risoluzione problemi

### L'app non si connette al backend (rete locale)
- Verifica che PC e telefono siano sulla stessa rete WiFi
- Verifica che il backend sia in esecuzione: `curl http://localhost:8001/api/stats`
- Verifica l'IP del PC: l'IP potrebbe cambiare se il router riassegna gli indirizzi
- Controlla il firewall del PC: potrebbe bloccare la porta 8001
  - **Windows:** Impostazioni → Firewall → Regole in entrata → Nuova regola → Porta 8001 → Consenti
  - **macOS:** `sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/python3`
  - **Linux:** `sudo ufw allow 8001`

### Errore "cleartext HTTP traffic not permitted"
Hai dimenticato il passaggio B7. Android blocca il traffico HTTP non cifrato per sicurezza. Aggiungi il `network_security_config.xml`.

### L'APK non si installa
- Assicurati di aver attivato "Installa da fonti sconosciute" (passo C1)
- Se hai già una versione installata, disinstallala prima o usa `adb install -r`

### Gradle non trova l'SDK Android
- Verifica che `ANDROID_HOME` sia impostato correttamente
- Apri il progetto `android/` in Android Studio e lascia che configuri automaticamente i percorsi

### L'app è lenta al primo avvio
Normale. Il WebView di Android deve caricare tutti i file la prima volta. I successivi avvii saranno più rapidi grazie al Service Worker e alla cache.

### Come mantenere il backend sempre acceso (rete locale)
Crea un servizio di sistema per avviare il backend automaticamente:

**Windows** - Crea un file `start_backend.bat`:
```batch
@echo off
cd C:\percorso\del\progetto\backend
python -m uvicorn server:app --host 0.0.0.0 --port 8001
```
Aggiungi una scorciatoia in `shell:startup` per l'avvio automatico.

**Linux** - Crea un servizio systemd `/etc/systemd/system/boxmanager.service`:
```ini
[Unit]
Description=Box Manager Backend
After=network.target mongod.service

[Service]
Type=simple
User=TUO_UTENTE
WorkingDirectory=/percorso/del/progetto/backend
ExecStart=/usr/bin/python3 -m uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always

[Install]
WantedBy=multi-user.target
```
Poi:
```bash
sudo systemctl enable boxmanager
sudo systemctl start boxmanager
```

---

## Riepilogo comandi rapidi

```bash
# === SETUP INIZIALE (una sola volta) ===
cd frontend
yarn install
yarn add @capacitor/core @capacitor/cli
npx cap init "Box Manager" "com.boxmanager.app" --web-dir build
yarn build
npx cap add android

# === BUILD APK (ogni aggiornamento) ===
cd frontend
yarn build
npx cap copy android
cd android
./gradlew assembleDebug

# === INSTALLAZIONE ===
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# === AVVIO BACKEND ===
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001
```
