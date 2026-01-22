# Proxmox LXC Helper Script – moneta

Dieses Script installiert moneta als Docker-App in einem Debian/Ubuntu LXC und folgt dem Proxmox-Helper-Style (Banner, Status-Ausgaben, Update-Hinweis).

## Voraussetzungen
- Proxmox LXC mit Debian (empfohlen: Debian 12)
- Root-Zugriff im Container

## Installation

```bash
bash proxmox-lxc-install.sh
```

## Update

```bash
cd /opt/moneta
git pull
docker compose up -d --build
```

## Hinweise
- Web-UI läuft unter: `http://<LXC-IP>:3001`
- Daten liegen im Docker-Volume `budget-data`
- Script kann jederzeit erneut ausgeführt werden (macht automatisch `git pull`)
