# Installation Guide

## Quick Install (Recommended)

### Linux/Proxmox (LXC/Container)
```bash
# Download and run installer
curl -sSL https://raw.githubusercontent.com/sysexperts/budgetExperts/main/install-moneta.sh | bash

# Or download first
wget https://raw.githubusercontent.com/sysexperts/budgetExperts/main/install-moneta.sh
chmod +x install-moneta.sh
sudo ./install-moneta.sh
```

### Windows
```powershell
# Download and run (PowerShell as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/sysexperts/budgetExperts/main/install-moneta-windows.ps1" -OutFile "install-moneta-windows.ps1"
.\install-moneta-windows.ps1
```

## Manual Installation

### Docker (Recommended)
```bash
# Clone repository
git clone https://github.com/sysexperts/budgetExperts.git
cd budgetExperts

# Start with Docker Compose
docker compose up -d

# Access at http://localhost:3001
```

### Node.js (Bare Metal/LXC)
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and build
git clone https://github.com/sysexperts/budgetExperts.git
cd budgetExperts
npm install
npm run build

# Start
npm start
```

## Default Access

- **URL**: http://your-server:3001
- **Email**: vapurserdar@gmail.com  
- **Password**: Kayseri3838

## Proxmox LXC Template

Create LXC with:
- Template: Ubuntu 22.04
- RAM: 512MB
- Storage: 2GB
- Network: Bridge

Then run the installer script inside the container.

## Docker Compose File

```yaml
version: '3.8'
services:
  moneta:
    build: .
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
      - ./budget.db:/app/budget.db
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

## Service Management

### Docker
```bash
# Status
docker ps | grep moneta

# Logs
docker logs moneta-app

# Stop
docker compose down

# Restart
docker compose restart
```

### Systemd (Linux)
```bash
# Status
sudo systemctl status moneta

# Logs
sudo journalctl -u moneta -f

# Stop
sudo systemctl stop moneta

# Restart
sudo systemctl restart moneta
```

### Windows Service
```powershell
# Status
Get-Service moneta

# Stop
Stop-Service moneta

# Start
Start-Service moneta
```

## Configuration

Environment variables:
- `PORT=3001` - Application port
- `NODE_ENV=production` - Production mode

## Data Persistence

- **Docker**: Data stored in `./data` and `./budget.db` volumes
- **Bare Metal**: Data stored in application directory
- **Backups**: Copy `budget.db` file for backup

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3001
sudo netstat -tulpn | grep :3001

# Kill process
sudo kill -9 <PID>
```

### Permission Issues
```bash
# Fix permissions
sudo chown -R moneta:moneta /opt/moneta
sudo chmod +x /opt/moneta
```

### Docker Issues
```bash
# Reset Docker
docker system prune -a
docker compose down -v
docker compose up -d --build
```

## Security Notes

- Change default password after first login
- Use HTTPS in production (nginx reverse proxy)
- Regularly backup `budget.db` file
- Keep dependencies updated

## Support

For issues:
1. Check logs: `docker logs moneta-app` or `journalctl -u moneta`
2. Verify port accessibility
3. Check system requirements
4. Review configuration files
