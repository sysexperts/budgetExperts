# 🌟 monetaX - Moderner Budget-Planer

<div align="center">

![monetaX Logo](public/favicon.svg)

**Eine moderne, web-basierte Anwendung zur Budget-Planung und Finanzverwaltung für Einzelpersonen und Familien**

[![GitHub stars](https://img.shields.io/github/stars/sysexperts/moneta-x?style=social)](https://github.com/sysexperts/moneta-x)
[![GitHub forks](https://img.shields.io/github/forks/sysexperts/moneta-x?style=social)](https://github.com/sysexperts/moneta-x)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Tech Stack](https://img.shields.io/badge/Tech%20Stack-React%20%7C%20TypeScript%20%7C%20TailwindCSS-blue)](https://github.com/sysexperts/moneta-x)

[Live Demo](http://localhost:3001) • [Report Bug](https://github.com/sysexperts/moneta-x/issues) • [Request Feature](https://github.com/sysexperts/moneta-x/issues)

</div>

## 📋 Inhaltsverzeichnis

- [✨ Features](#-features)
- [🚀 Schnellstart](#-schnellstart)
- [📦 Installation](#-installation)
- [🛠️ Tech Stack]((#️-tech-stack))
- [📱 Screenshots](#-screenshots)
- [🤝 Mitwirken](#-mitwirken)
- [📄 Lizenz](#-lizenz)

## ✨ Features

### 🏠 **Haushalts-Management**
- **Mehrere Haushalte** verwalten
- **Familienmitglieder** hinzufügen und zuweisen
- **Zentralisierte Datenverwaltung**

### 💰 **Ausgaben-Tracking**
- **Fixkosten** (Miete, Versicherungen, etc.)
- **Abonnements** (Netflix, Spotify, etc.)
- **Ratenpläne** (Kredite, Finanzierungen)
- **Monatliche Zahlungen** im Überblick

### 🎯 **Sparziele**
- **Persönliche Sparziele** setzen
- **Fortschritt verfolgen**
- **Motivation durch Visualisierung**

### 📊 **Moderne Analytics**
- **Interaktive Charts** mit Recharts
- **Pie Charts** für Ausgabenverteilung
- **Bar Charts** für monatliche Vergleiche
- **Line Charts** für Zeitreihen
- **Area Charts** für Trends

### 🎨 **Benutzererlebnis**
- **Responsive Design** für Desktop, Tablet & Mobile
- **Minimalistische UI** mit TailwindCSS
- **Dunkles/Lichtes Theme** (geplant)
- **Persistent State** - Tabs werden gespeichert

### 🔐 **Sicherheit & Datenschutz**
- **Lokale Daten** - Keine Cloud-Abhängigkeit
- **Session-basierte Authentifizierung**
- **Keine Registration** erforderlich
- **Daten-Export** (CSV & JSON)

## 🚀 Schnellstart

### 🐳 Docker (empfohlen)

```bash
# Repository klonen
git clone https://github.com/sysexperts/moneta-x.git
cd moneta-x

# Anwendung starten
docker compose up -d

# Zugriff unter: http://localhost:3001
```

### ⚡ Manuelles Setup

```bash
# Repository klonen
git clone https://github.com/sysexperts/moneta-x.git
cd moneta-x

# Abhängigkeiten installieren
npm install

# Anwendung bauen und starten
npm run build
npm start

# Zugriff unter: http://localhost:3001
```

## 📦 Installation

### 🐳 Docker Installation (Empfohlen)

**Voraussetzungen:**
- Docker & Docker Compose

**Schritte:**
```bash
# 1. Repository klonen
git clone https://github.com/sysexperts/moneta-x.git
cd moneta-x

# 2. Anwendung starten
docker compose up -d

# 3. Überprüfen ob alles läuft
docker compose ps

# 4. Logs ansehen (falls nötig)
docker compose logs -f
```

**Zugriff:** `http://localhost:3001`

---

### 🖥️ Manuelles Setup

**Voraussetzungen:**
- Node.js 18+ 
- npm oder yarn

**Schritte:**
```bash
# 1. Repository klonen
git clone https://github.com/sysexperts/moneta-x.git
cd moneta-x

# 2. Abhängigkeiten installieren
npm install

# 3. Entwicklungsserver starten
npm run dev

# ODER für Produktion:
npm run build
npm start
```

**Zugriff:** `http://localhost:3001`

---

### 🐧 Linux/Proxmox (LXC/Container)

**Automatische Installation:**
```bash
curl -sSL https://raw.githubusercontent.com/sysexperts/moneta-x/main/install-moneta.sh | bash
```

**Manuelle Installation:**
```bash
# 1. System aktualisieren
sudo apt update && sudo apt upgrade -y

# 2. Docker installieren
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Repository klonen und starten
git clone https://github.com/sysexperts/moneta-x.git
cd moneta-x
docker compose up -d
```

---

### 🪟 Windows

**Automatische Installation:**
```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/sysexperts/moneta-x/main/install-moneta-windows.ps1" -OutFile "install-moneta-windows.ps1"
.\install-moneta-windows.ps1
```

**Manuelle Installation:**
```powershell
# 1. Repository klonen
git clone https://github.com/sysexperts/moneta-x.git
cd moneta-x

# 2. Abhängigkeiten installieren
npm install

# 3. Anwendung starten
npm run build
npm start
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - Moderne UI-Komponenten
- **TypeScript** - Type-Safe Entwicklung
- **TailwindCSS** - Utility-First CSS Framework
- **Vite** - Schneller Build-Tool
- **Lucide React** - Moderne Icon-Bibliothek

### Backend
- **Express.js** - Webserver Framework
- **SQLite** - Leichte Datenbank
- **Session-Management** - Sichere Authentifizierung

### Visualisierung
- **Recharts** - Moderne Chart-Bibliothek
- **Responsive Charts** - Für alle Geräte

### DevOps
- **Docker** - Containerisierung
- **Docker Compose** - Multi-Container Setup

## 📱 Screenshots

*(Coming Soon - Screenshots der Anwendung werden hinzugefügt)*

## 🤝 Mitwirken

Contributions sind willkommen! Bitte lies die [Contributing Guidelines](CONTRIBUTING.md) für Details.

### Wie man mitwirkt

1. **Fork** das Projekt
2. **Feature Branch** erstellen (`git checkout -b feature/AmazingFeature`)
3. **Änderungen committen** (`git commit -m 'Add some AmazingFeature'`)
4. **Push zum Branch** (`git push origin feature/AmazingFeature`)
5. **Pull Request** öffnen

## 📄 Lizenz

Dieses Projekt ist unter der MIT License lizenziert - siehe [LICENSE](LICENSE) für Details.

## 🙏 Danksagungen

- [React](https://reactjs.org/) - Für das großartige UI-Framework
- [TailwindCSS](https://tailwindcss.com/) - Für das exzellente CSS-Framework
- [Recharts](https://recharts.org/) - Für die beeindruckenden Charts
- [Lucide](https://lucide.dev/) - Für die schönen Icons

---

<div align="center">

**[⬆ Nach oben](#-monetax--moderner-budget-planer)**

Made with ❤️ by [sysexperts](https://github.com/sysexperts)

</div>
