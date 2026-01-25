#!/bin/bash

# moneta Budget Planner - Installation Script
# Supports both Docker and LXC installation on Proxmox

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="moneta"
APP_DIR="/opt/moneta"
SERVICE_NAME="moneta"
PORT="3001"
DEFAULT_USER="vapurserdar@gmail.com"
DEFAULT_PASS="Kayseri3838"

# Helper functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root"
        exit 1
    fi
}

# Detect system
detect_system() {
    if [ -f /proc/1/environ ] && grep -q container=lxc /proc/1/environ; then
        echo "lxc"
    elif command -v docker >/dev/null 2>&1; then
        echo "docker"
    else
        echo "baremetal"
    fi
}

# Install Docker if not present
install_docker() {
    if ! command -v docker >/dev/null 2>&1; then
        print_status "Installing Docker..."
        apt-get update
        apt-get install -y ca-certificates curl gnupg lsb-release
        
        # Add Docker's official GPG key
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        
        # Set up the repository
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        # Install Docker Engine
        apt-get update
        apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
        
        # Start Docker
        systemctl start docker
        systemctl enable docker
        
        print_success "Docker installed successfully"
    else
        print_status "Docker already installed"
    fi
}

# Install Docker method
install_docker_method() {
    print_status "Installing moneta using Docker..."
    
    # Create application directory
    mkdir -p $APP_DIR
    cd $APP_DIR
    
    # Create docker-compose.yml
    cat > docker-compose.yml << EOF
version: '3.8'

services:
  moneta:
    build: .
    ports:
      - "${PORT}:3001"
    volumes:
      - ./data:/app/data
      - ./budget.db:/app/budget.db
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    container_name: moneta-app
EOF

    # Create Dockerfile
    cat > Dockerfile << EOF
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
EOF

    # Create .dockerignore
    cat > .dockerignore << EOF
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
.coverage
.cache
dist
EOF

    # Download source code
    print_status "Downloading moneta source code..."
    if command -v git >/dev/null 2>&1; then
        git clone https://github.com/sysexperts/budgetExperts.git .
    else
        print_error "Git not found. Please install git first"
        exit 1
    fi
    
    # Build and start the container
    print_status "Building and starting moneta container..."
    docker compose up -d --build
    
    # Wait for container to be ready
    print_status "Waiting for moneta to start..."
    sleep 10
    
    # Check if container is running
    if docker ps | grep -q moneta-app; then
        print_success "moneta is now running on port $PORT"
        print_status "Default login: $DEFAULT_USER / $DEFAULT_PASS"
        print_status "Access URL: http://$(hostname -I | awk '{print $1}'):$PORT"
    else
        print_error "Failed to start moneta container"
        docker compose logs moneta
        exit 1
    fi
}

# Install LXC/Bare Metal method
install_baremetal_method() {
    print_status "Installing moneta on bare metal/LXC..."
    
    # Update system
    apt-get update
    apt-get upgrade -y
    
    # Install required packages
    print_status "Installing Node.js and dependencies..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs git nginx sqlite3
    
    # Create application user
    if ! id "$APP_NAME" &>/dev/null; then
        useradd -r -s /bin/false -d $APP_DIR $APP_NAME
    fi
    
    # Create application directory
    mkdir -p $APP_DIR
    chown $APP_NAME:$APP_NAME $APP_DIR
    
    # Download and setup application
    cd $APP_DIR
    print_status "Setting up moneta application..."
    
    # Clone repository
    if command -v git >/dev/null 2>&1; then
        git clone https://github.com/sysexperts/budgetExperts.git .
    else
        print_error "Git not found. Please install git first"
        exit 1
    fi
    
    # Install dependencies and build
    print_status "Installing dependencies..."
    sudo -u $APP_NAME npm ci --production
    sudo -u $APP_NAME npm run build
    
    # Create systemd service
    cat > /etc/systemd/system/$SERVICE_NAME.service << EOF
[Unit]
Description=moneta Budget Planner
After=network.target

[Service]
Type=simple
User=$APP_NAME
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=$PORT

[Install]
WantedBy=multi-user.target
EOF

    # Enable and start service
    systemctl daemon-reload
    systemctl enable $SERVICE_NAME
    systemctl start $SERVICE_NAME
    
    # Setup nginx reverse proxy (optional)
    if command -v nginx >/dev/null 2>&1; then
        setup_nginx
    fi
    
    # Wait for service to start
    sleep 5
    
    # Check if service is running
    if systemctl is-active --quiet $SERVICE_NAME; then
        print_success "moneta service is running"
        print_status "Default login: $DEFAULT_USER / $DEFAULT_PASS"
        print_status "Access URL: http://$(hostname -I | awk '{print $1}'):$PORT"
    else
        print_error "Failed to start moneta service"
        systemctl status $SERVICE_NAME
        exit 1
    fi
}

# Setup nginx reverse proxy
setup_nginx() {
    print_status "Setting up nginx reverse proxy..."
    
    cat > /etc/nginx/sites-available/$SERVICE_NAME << EOF
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    # Enable site
    ln -sf /etc/nginx/sites-available/$SERVICE_NAME /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and restart nginx
    nginx -t && systemctl restart nginx
    
    print_success "nginx reverse proxy configured"
}

# Create systemd service for Docker method
create_docker_service() {
    cat > /etc/systemd/system/moneta-docker.service << EOF
[Unit]
Description=moneta Docker Container
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable moneta-docker
}

# Main installation function
main() {
    echo "=========================================="
    echo "    moneta Budget Planner Installer"
    echo "=========================================="
    echo
    
    check_root
    
    # Detect installation method
    SYSTEM_TYPE=$(detect_system)
    print_status "Detected system: $SYSTEM_TYPE"
    
    # Ask for installation method
    echo "Choose installation method:"
    echo "1) Docker (recommended)"
    echo "2) Bare Metal / LXC"
    echo "3) Auto-detect"
    echo
    
    read -p "Enter choice [1-3]: " choice
    
    case $choice in
        1)
            install_docker
            install_docker_method
            create_docker_service
            ;;
        2)
            install_baremetal_method
            ;;
        3)
            if command -v docker >/dev/null 2>&1 && [ "$SYSTEM_TYPE" != "lxc" ]; then
                print_status "Auto-detected Docker installation"
                install_docker_method
                create_docker_service
            else
                print_status "Auto-detected Bare Metal installation"
                install_baremetal_method
            fi
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    echo
    print_success "Installation completed!"
    echo
    echo "=========================================="
    echo "Application Details:"
    echo "=========================================="
    echo "Name: moneta Budget Planner"
    echo "URL: http://$(hostname -I | awk '{print $1}'):$PORT"
    echo "Login: $DEFAULT_USER"
    echo "Password: $DEFAULT_PASS"
    echo
    echo "Service Management:"
    if command -v docker >/dev/null 2>&1 && docker ps | grep -q moneta-app; then
        echo "Status: docker ps | grep moneta-app"
        echo "Logs: docker logs moneta-app"
        echo "Stop: docker compose down -d $APP_DIR/docker-compose.yml"
    else
        echo "Status: systemctl status $SERVICE_NAME"
        echo "Logs: journalctl -u $SERVICE_NAME -f"
        echo "Stop: systemctl stop $SERVICE_NAME"
    fi
    echo "=========================================="
}

# Run main function
main "$@"
