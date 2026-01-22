#!/usr/bin/env bash
set -euo pipefail

APP_NAME="moneta"
REPO_URL="https://github.com/sysexperts/budgetExperts.git"
INSTALL_DIR="/opt/${APP_NAME}"
COMPOSE_FILE="docker-compose.yml"

COLOR_RED='\033[0;31m'
COLOR_GREEN='\033[0;32m'
COLOR_BLUE='\033[0;34m'
COLOR_YELLOW='\033[1;33m'
COLOR_RESET='\033[0m'

msg() {
  echo -e "${COLOR_BLUE}==>${COLOR_RESET} $1"
}

warn() {
  echo -e "${COLOR_YELLOW}WARN:${COLOR_RESET} $1"
}

success() {
  echo -e "${COLOR_GREEN}$1${COLOR_RESET}"
}

if [ "$(id -u)" -ne 0 ]; then
  echo -e "${COLOR_RED}Bitte als root ausführen.${COLOR_RESET}"
  exit 1
fi

clear
echo -e "${COLOR_GREEN}Moneta - Proxmox Helper Script${COLOR_RESET}"
echo -e "${COLOR_BLUE}LXC Installer (Docker)${COLOR_RESET}"
echo "-------------------------------------------"
echo "Repo: ${REPO_URL}"
echo "Ziel: ${INSTALL_DIR}"
echo "Port: 3001"
echo "-------------------------------------------"

if ! grep -qiE "debian|ubuntu" /etc/os-release; then
  warn "Dieses Script ist für Debian/Ubuntu LXC getestet."
fi

msg "System aktualisieren"
apt-get update -y
apt-get install -y ca-certificates curl gnupg git

if ! command -v docker >/dev/null 2>&1; then
  msg "Docker installieren"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo $VERSION_CODENAME) stable" > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

if [ -d "${INSTALL_DIR}" ]; then
  msg "Repo vorhanden: ${INSTALL_DIR}"
  cd "${INSTALL_DIR}"
  git pull
else
  msg "Repo klonen"
  git clone "${REPO_URL}" "${INSTALL_DIR}"
  cd "${INSTALL_DIR}"
fi

msg "Container bauen & starten"
docker compose -f "${COMPOSE_FILE}" up -d --build

success "Fertig!"
echo "Web-UI: http://<LXC-IP>:3001"
echo
echo "Update-Befehl:"
echo "  cd ${INSTALL_DIR} && git pull && docker compose -f ${COMPOSE_FILE} up -d --build"
