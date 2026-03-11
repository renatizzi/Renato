#!/bin/bash
# =============================================================
# Box Manager - Script per generare l'APK Android
# =============================================================
# Uso: ./build_apk.sh <IP_BACKEND>
# Esempio: ./build_apk.sh 192.168.1.100
# =============================================================

set -e

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Parametro: IP del backend
BACKEND_IP="${1:-192.168.1.100}"
BACKEND_PORT="${2:-8001}"
BACKEND_URL="http://${BACKEND_IP}:${BACKEND_PORT}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Box Manager - Build APK Android${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Backend URL:${NC} ${BACKEND_URL}"
echo ""

# Verifica prerequisiti
command -v node >/dev/null 2>&1 || { echo -e "${RED}Errore: Node.js non installato${NC}"; exit 1; }
command -v yarn >/dev/null 2>&1 || { echo -e "${RED}Errore: Yarn non installato${NC}"; exit 1; }
command -v java >/dev/null 2>&1 || { echo -e "${RED}Errore: Java non installato${NC}"; exit 1; }

if [ -z "$ANDROID_HOME" ]; then
    echo -e "${RED}Errore: ANDROID_HOME non impostato${NC}"
    echo "Imposta: export ANDROID_HOME=/percorso/android-sdk"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="${SCRIPT_DIR}/frontend"

# Step 1: Build frontend
echo -e "\n${YELLOW}[1/4] Build del frontend...${NC}"
cd "$FRONTEND_DIR"
REACT_APP_BACKEND_URL="$BACKEND_URL" yarn build

# Step 2: Sync con Capacitor
echo -e "\n${YELLOW}[2/4] Sync con Capacitor...${NC}"
npx cap copy android

# Step 3: Build APK
echo -e "\n${YELLOW}[3/4] Build APK con Gradle...${NC}"
cd "$FRONTEND_DIR/android"
chmod +x gradlew
./gradlew assembleDebug

# Step 4: Copia APK
echo -e "\n${YELLOW}[4/4] Copia APK...${NC}"
APK_SRC="$FRONTEND_DIR/android/app/build/outputs/apk/debug/app-debug.apk"
APK_DEST="$SCRIPT_DIR/BoxManager-debug.apk"
cp "$APK_SRC" "$APK_DEST"

APK_SIZE=$(du -h "$APK_DEST" | cut -f1)
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  APK generato con successo!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "  File:     ${APK_DEST}"
echo -e "  Dimensione: ${APK_SIZE}"
echo -e "  Backend:  ${BACKEND_URL}"
echo ""
echo -e "  ${YELLOW}Per installare:${NC}"
echo -e "  adb install -r ${APK_DEST}"
echo ""
echo -e "  ${YELLOW}Ricorda:${NC}"
echo -e "  1. Avvia il backend: cd backend && uvicorn server:app --host 0.0.0.0 --port 8001"
echo -e "  2. Collega telefono e PC alla stessa rete WiFi"
echo ""
