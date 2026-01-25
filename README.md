# moneta

A modern, web-based budget planning application for individuals and families.

## Features

- **User Authentication**: Secure login system with user-specific data
- **Household Management**: Manage multiple households and family members
- **Expense Tracking**: Fixed costs, subscriptions, and installment plans
- **Savings Goals**: Set and track personal savings objectives
- **Analytics**: Visual charts and spending insights
- **Data Export**: CSV and JSON export functionality

## Quick Install

### Linux/Proxmox (LXC/Container)
```bash
curl -sSL https://raw.githubusercontent.com/sysexperts/budgetExperts/main/install-moneta.sh | bash
```

### Windows
```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/sysexperts/budgetExperts/main/install-moneta-windows.ps1" -OutFile "install-moneta-windows.ps1"
.\install-moneta-windows.ps1
```

## Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS
- **Backend**: Express.js, SQLite
- **Authentication**: Session-based with SHA256 encryption
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build**: Vite

## Default User

- **Email**: vapurserdar@gmail.com
- **Password**: Kayseri3838

## Project Structure

```
moneta/
├── src/                 # React frontend
│   ├── components/      # UI components
│   ├── types.ts        # TypeScript definitions
│   └── App.tsx         # Main application
├── server/             # Express backend
│   └── index.js        # API server
├── dist/               # Production build
└── package.json        # Dependencies
```

## Manual Installation

### Docker (Recommended)
```bash
git clone https://github.com/sysexperts/budgetExperts.git
cd budgetExperts
docker compose up -d
```

### Node.js
```bash
git clone https://github.com/sysexperts/budgetExperts.git
cd budgetExperts
npm install
npm run build
npm start
```

## Access

Application runs on `http://localhost:3001`

## License

MIT
