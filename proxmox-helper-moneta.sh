#!/usr/bin/env bash
set -euo pipefail

APP_NAME="moneta"
REPO_URL="https://github.com/sysexperts/budgetExperts.git"
CT_ID="110"
HOSTNAME="moneta"
STORAGE="local-lvm"
DISK_SIZE="8"
MEMORY="2048"
CORES="2"
BRIDGE="vmbr0"
IP="dhcp"
GW=""
TEMPLATE="debian-12-standard_12.2-1_amd64.tar.zst"

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
  echo -e "${COLOR_RED}Bitte als root auf dem Proxmox Host ausführen.${COLOR_RESET}"
  exit 1
fi

if ! command -v pct >/dev/null 2>&1; then
  echo -e "${COLOR_RED}pct nicht gefunden. Dieses Script muss auf dem Proxmox Host laufen.${COLOR_RESET}"
  exit 1
fi

clear
echo -e "${COLOR_GREEN}Moneta - Proxmox Helper Script${COLOR_RESET}"
echo -e "${COLOR_BLUE}LXC Erstellung + Installation${COLOR_RESET}"
echo "-------------------------------------------"
echo "CT ID: ${CT_ID}"
echo "Hostname: ${HOSTNAME}"
echo "Storage: ${STORAGE}"
echo "Disk: ${DISK_SIZE}G"
echo "RAM: ${MEMORY} MB"
echo "CPU: ${CORES}"
echo "Bridge: ${BRIDGE}"
echo "IP: ${IP}"
echo "Repo: ${REPO_URL}"
echo "-------------------------------------------"

msg "Template prüfen"
pveam update >/dev/null 2>&1 || true
if ! pveam available | awk '{print $2}' | grep -q "^${TEMPLATE}$"; then
  warn "Template ${TEMPLATE} nicht im Katalog gefunden."
fi

if ! pveam list local | awk '{print $1}' | grep -q "${TEMPLATE}"; then
  msg "Template herunterladen"
  pveam download local "${TEMPLATE}"
fi

if pct status "${CT_ID}" >/dev/null 2>&1; then
  echo -e "${COLOR_RED}CT ${CT_ID} existiert bereits. Bitte CT_ID ändern.${COLOR_RESET}"
  exit 1
fi

msg "LXC erstellen"
pct create "${CT_ID}" local:vztmpl/${TEMPLATE} \
  --hostname "${HOSTNAME}" \
  --cores "${CORES}" \
  --memory "${MEMORY}" \
  --swap 0 \
  --rootfs "${STORAGE}:${DISK_SIZE}" \
  --net0 name=eth0,bridge=${BRIDGE},ip=${IP}${GW:+,gw=${GW}} \
  --unprivileged 1 \
  --features keyctl=1,nesting=1 \
  --onboot 1

msg "LXC starten"
pct start "${CT_ID}"

msg "Moneta im LXC installieren"
pct exec "${CT_ID}" -- bash -c "apt-get update -y && apt-get install -y ca-certificates curl gnupg git"
pct exec "${CT_ID}" -- bash -c "install -m 0755 -d /etc/apt/keyrings"
pct exec "${CT_ID}" -- bash -c "curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg"
pct exec "${CT_ID}" -- bash -c "chmod a+r /etc/apt/keyrings/docker.gpg"
pct exec "${CT_ID}" -- bash -c "echo \"deb [arch=\$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \$(. /etc/os-release && echo \$VERSION_CODENAME) stable\" > /etc/apt/sources.list.d/docker.list"
pct exec "${CT_ID}" -- bash -c "apt-get update -y && apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin"

pct exec "${CT_ID}" -- bash -c "git clone ${REPO_URL} /opt/${APP_NAME}"
pct exec "${CT_ID}" -- bash -c "cd /opt/${APP_NAME} && docker compose up -d --build"

success "Fertig!"
echo "Web-UI: http://<LXC-IP>:3001"
echo
echo "Update-Befehl (im LXC):"
echo "  cd /opt/${APP_NAME} && git pull && docker compose up -d --build"
