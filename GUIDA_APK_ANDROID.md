# Box Manager - Guida Installazione APK Android

## Come funziona

L'app è composta da due parti:
- **APK** (sul telefono) = l'interfaccia grafica
- **Backend** (sul tuo PC) = il server con i dati

Il telefono e il PC devono essere sulla **stessa rete WiFi**.

```
   Telefono (APK)  ──── WiFi ────  PC (Backend + MongoDB)
```

---

## Requisiti

| Software | Versione | Download |
|----------|----------|----------|
| Node.js | 18+ | https://nodejs.org |
| Yarn | 1.22+ | Dopo Node: `npm install -g yarn` |
| Python | 3.10+ | https://python.org |
| Java JDK | 17+ | https://adoptium.net |
| Android Studio | qualsiasi | https://developer.android.com/studio |
| MongoDB | 7+ | https://www.mongodb.com/try/download/community |

Dopo aver installato Android Studio:
1. Apri Android Studio → **Settings → Languages & Frameworks → Android SDK**
2. Tab **SDK Platforms**: installa **Android 14 (API 34)**
3. Tab **SDK Tools**: installa **Android SDK Build-Tools** e **Command-line Tools**
4. Prendi nota del percorso SDK (es. `C:\Users\TUO_NOME\AppData\Local\Android\Sdk`)

Imposta la variabile d'ambiente:
```bash
# Windows (Impostazioni di sistema → Variabili d'ambiente)
ANDROID_HOME = C:\Users\TUO_NOME\AppData\Local\Android\Sdk

# macOS/Linux (in ~/.bashrc o ~/.zshrc)
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

---

## Passo 1: Scarica il progetto

Da Emergent, clicca **"Save to GitHub"** e poi clona:
```bash
git clone https://github.com/TUO_UTENTE/TUO_REPO.git
cd TUO_REPO
```

---

## Passo 2: Avvia il Backend

### 2a. Installa MongoDB
Segui le istruzioni per il tuo sistema operativo su https://www.mongodb.com/docs/manual/installation/

### 2b. Configura e avvia

```bash
cd backend

# Crea il file .env
echo "MONGO_URL=mongodb://localhost:27017" > .env
echo "DB_NAME=box_manager" >> .env

# Installa dipendenze
pip install -r requirements.txt

# Avvia il server
uvicorn server:app --host 0.0.0.0 --port 8001
```

Verifica: apri http://localhost:8001/api/stats nel browser. Devi vedere `{"total_boxes":0,...}`.

### 2c. Trova l'IP del tuo PC

```bash
# Windows
ipconfig
# Cerca "IPv4 Address" sotto la connessione WiFi, es: 192.168.1.100

# macOS
ifconfig | grep "inet " | grep -v 127.0.0.1

# Linux
hostname -I
```

**Segna questo IP** (es. `192.168.1.100`). Ti servirà nel passo successivo.

---

## Passo 3: Genera l'APK

### Metodo rapido (script automatico)

```bash
# Sostituisci 192.168.1.100 con il TUO IP
./build_apk.sh 192.168.1.100
```

Il file `BoxManager-debug.apk` verrà creato nella cartella principale.

### Metodo manuale (passo per passo)

```bash
cd frontend

# Installa dipendenze
yarn install

# Build con il tuo IP (IMPORTANTE: sostituisci l'IP!)
REACT_APP_BACKEND_URL=http://192.168.1.100:8001 yarn build

# Copia i file nel progetto Android
npx cap copy android

# Genera l'APK
cd android
chmod +x gradlew
./gradlew assembleDebug
```

L'APK sarà in: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

---

## Passo 4: Installa sul telefono

### Prepara il telefono (una volta sola)

1. **Impostazioni → Info telefono** → tocca "Numero build" **7 volte**
2. **Impostazioni → Opzioni sviluppatore** → attiva "Debug USB"
3. **Impostazioni → Sicurezza** → attiva "Installa app da fonti sconosciute"

### Trasferisci e installa

**Opzione A - Cavo USB + ADB (più rapido):**
```bash
adb install BoxManager-debug.apk
```

**Opzione B - Manuale:**
1. Invia il file APK al telefono (email, Telegram, Google Drive, cavo USB)
2. Apri il file sul telefono
3. Conferma l'installazione

---

## Passo 5: Usa l'app

1. Assicurati che il backend sia in esecuzione sul PC
2. Assicurati che PC e telefono siano sulla **stessa rete WiFi**
3. Apri **Box Manager** sul telefono
4. Password: `archivio2025`

---

## Uso quotidiano

Ogni volta che vuoi usare l'app:

1. Accendi il PC e avvia il backend:
   ```bash
   cd backend
   uvicorn server:app --host 0.0.0.0 --port 8001
   ```
2. Apri Box Manager sul telefono

Per avviare il backend automaticamente all'accensione del PC:

**Windows:** Crea un file `avvia_backend.bat`:
```batch
@echo off
cd C:\percorso\del\progetto\backend
python -m uvicorn server:app --host 0.0.0.0 --port 8001
```
Metti una scorciatoia nella cartella `shell:startup`.

**Linux/macOS:** Aggiungi al crontab:
```bash
crontab -e
# Aggiungi:
@reboot cd /percorso/progetto/backend && uvicorn server:app --host 0.0.0.0 --port 8001 &
```

---

## Aggiornamenti

Quando modifichi l'app e vuoi aggiornare l'APK:

```bash
./build_apk.sh 192.168.1.100

# Installa la nuova versione (sovrascrive la precedente)
adb install -r BoxManager-debug.apk
```

---

## Se l'IP del PC cambia

Se il router assegna un nuovo IP al PC, devi ricompilare l'APK con il nuovo IP:
```bash
./build_apk.sh NUOVO_IP
adb install -r BoxManager-debug.apk
```

**Consiglio:** Assegna un IP statico al PC nelle impostazioni del router, così non cambierà mai.

---

## Risoluzione problemi

| Problema | Soluzione |
|----------|----------|
| L'app non si connette | Verifica che PC e telefono siano sulla stessa WiFi |
| "Connection refused" | Il backend non è in esecuzione. Avvialo con `uvicorn server:app --host 0.0.0.0 --port 8001` |
| L'APK non si installa | Attiva "Installa da fonti sconosciute" nelle impostazioni |
| "cleartext traffic not permitted" | Il file `network_security_config.xml` è già configurato. Se hai problemi, ricompila l'APK |
| Schermo bianco | Controlla che l'IP nel build sia corretto. Ricompila se necessario |
| Il firewall blocca la porta | Windows: Impostazioni → Firewall → consenti porta 8001 |

---

## Google Play Store (futuro)

Se un giorno vuoi pubblicare su Google Play:

1. Serve un account Google Play Developer (25$ una tantum): https://play.google.com/console
2. Il backend deve essere raggiungibile da internet (non solo in rete locale)
   - Opzione gratuita: https://render.com + https://cloud.mongodb.com (cluster M0 gratuito)
3. Genera un App Bundle al posto dell'APK:
   ```bash
   cd frontend/android
   ./gradlew bundleRelease
   ```
4. Carica il file `.aab` su Google Play Console
5. Compila descrizione, screenshot e privacy policy
