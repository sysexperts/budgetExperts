#!/usr/bin/env bash
set -euo pipefail

APP_NAME="moneta"
REPO_URL="https://github.com/sysexperts/budgetExperts.git"

msg() { echo -e "\e[0;34m==>\e[0m $1"; }
success() { echo -e "\e[0;32m$1\e[0m"; }

msg "System aktualisieren"
apt-get update -y
apt-get install -y ca-certificates curl gnupg git

msg "Docker installieren"
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo $VERSION_CODENAME) stable" > /etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

msg "Moneta klonen & starten"
git clone "${REPO_URL}" "/opt/${APP_NAME}"
cd "/opt/${APP_NAME}"
docker compose up -d --build

success "Fertig!"
echo "Web-UI: http://<LXC-IP>:3001"
echo
echo "Update:"
echo "  cd /opt/${APP_NAME} && git pull && docker compose up -d --build"
