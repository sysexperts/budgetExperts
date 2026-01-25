# moneta Budget Planner - Windows Installation Script
# For Windows systems with Docker Desktop

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("docker", "node")]
    [string]$Method = "docker",
    
    [Parameter(Mandatory=$false)]
    [int]$Port = 3001,
    
    [Parameter(Mandatory=$false)]
    [string]$InstallPath = "C:\moneta"
)

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    White = "White"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Colors[$Color]
}

function Write-Status {
    param([string]$Message)
    Write-ColorOutput "[INFO] $Message" "Blue"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "[SUCCESS] $Message" "Green"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "[WARNING] $Message" "Yellow"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "[ERROR] $Message" "Red"
}

# Check admin privileges
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Check Docker installation
function Test-Docker {
    try {
        $null = Get-Command docker -ErrorAction Stop
        $null = docker version 2>$null
        return $true
    }
    catch {
        return $false
    }
}

# Check Node.js installation
function Test-NodeJS {
    try {
        $null = Get-Command node -ErrorAction Stop
        $version = node --version
        return $version -match "^v1[6-9]|^v2[0-9]"
    }
    catch {
        return $false
    }
}

# Install Docker Desktop
function Install-Docker {
    Write-Status "Docker not found. Please install Docker Desktop manually:"
    Write-Status "1. Download from: https://www.docker.com/products/docker-desktop"
    Write-Status "2. Run the installer"
    Write-Status "3. Start Docker Desktop"
    Write-Status "4. Run this script again"
    exit 1
}

# Install Node.js
function Install-NodeJS {
    Write-Status "Installing Node.js..."
    
    # Download Node.js installer
    $nodeUrl = "https://nodejs.org/dist/v18.19.0/node-v18.19.0-x64.msi"
    $installerPath = "$env:TEMP\node-installer.msi"
    
    try {
        Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath -UseBasicParsing
        Write-Status "Starting Node.js installer..."
        Start-Process -FilePath $installerPath -ArgumentList "/quiet" -Wait
        Remove-Item $installerPath -Force
        
        # Refresh PATH
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
        
        Write-Success "Node.js installed successfully"
    }
    catch {
        Write-Error "Failed to install Node.js: $_"
        Write-Status "Please install Node.js manually from: https://nodejs.org/"
        exit 1
    }
}

# Docker installation method
function Install-DockerMethod {
    Write-Status "Installing moneta using Docker..."
    
    # Create installation directory
    if (-not (Test-Path $InstallPath)) {
        New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
    }
    
    Set-Location $InstallPath
    
    # Create docker-compose.yml
    $dockerCompose = @"
version: '3.8'

services:
  moneta:
    build: .
    ports:
      - "$($Port):3001"
    volumes:
      - ./data:/app/data
      - ./budget.db:/app/budget.db
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    container_name: moneta-app
"@
    
    $dockerCompose | Out-File -FilePath "docker-compose.yml" -Encoding UTF8
    
    # Create Dockerfile
    $dockerfile = @"
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
"@
    
    $dockerfile | Out-File -FilePath "Dockerfile" -Encoding UTF8
    
    # Create .dockerignore
    $dockerignore = @"
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
"@
    
    $dockerignore | Out-File -FilePath ".dockerignore" -Encoding UTF8
    
    # Copy application files
    $projectPath = $PSScriptRoot
    if (Test-Path "$projectPath\package.json") {
        Write-Status "Copying application files..."
        Copy-Item "$projectPath\*" -Destination $InstallPath -Recurse -Force
    } else {
        Write-Status "Cloning from GitHub repository..."
        try {
            git clone https://github.com/sysexperts/budgetExperts.git $InstallPath
            Set-Location $InstallPath
        }
        catch {
            Write-Error "Failed to clone repository. Please install Git or copy files manually."
            exit 1
        }
    }
    
    # Build and start container
    Write-Status "Building and starting moneta container..."
    docker compose up -d --build
    
    # Wait for container to start
    Write-Status "Waiting for moneta to start..."
    Start-Sleep -Seconds 10
    
    # Check if container is running
    $containerStatus = docker ps --filter "name=moneta-app" --format "table {{.Names}}\t{{.Status}}"
    if ($containerStatus -match "moneta-app") {
        Write-Success "moneta is now running on port $Port"
        Write-Status "Default login: vapurserdar@gmail.com / Kayseri3838"
        Write-Status "Access URL: http://localhost:$Port"
    } else {
        Write-Error "Failed to start moneta container"
        docker compose logs moneta
        exit 1
    }
}

# Node.js installation method
function Install-NodeMethod {
    Write-Status "Installing moneta using Node.js..."
    
    # Create installation directory
    if (-not (Test-Path $InstallPath)) {
        New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
    }
    
    Set-Location $InstallPath
    
    # Copy application files
    $projectPath = $PSScriptRoot
    if (Test-Path "$projectPath\package.json") {
        Write-Status "Copying application files..."
        Copy-Item "$projectPath\*" -Destination $InstallPath -Recurse -Force
    } else {
        Write-Status "Cloning from GitHub repository..."
        try {
            git clone https://github.com/sysexperts/budgetExperts.git $InstallPath
            Set-Location $InstallPath
        }
        catch {
            Write-Error "Failed to clone repository. Please install Git or copy files manually."
            exit 1
        }
    }
    
    # Install dependencies
    Write-Status "Installing dependencies..."
    npm ci --production
    
    # Build application
    Write-Status "Building application..."
    npm run build
    
    # Create Windows service
    $serviceName = "moneta"
    $serviceScript = @"
# moneta Windows Service Script
`$servicePath = "$InstallPath"
`$port = $Port

cd `$servicePath
npm start
"@
    
    $serviceScript | Out-File -FilePath "$InstallPath\start-service.ps1" -Encoding UTF8
    
    # Install NSSM (Non-Sucking Service Manager) for Windows service
    Write-Status "Installing Windows service..."
    
    $nssmUrl = "https://nssm.cc/release/nssm-2.24.zip"
    $nssmPath = "$env:TEMP\nssm.zip"
    $nssmExtractPath = "$env:TEMP\nssm"
    
    try {
        Invoke-WebRequest -Uri $nssmUrl -OutFile $nssmPath -UseBasicParsing
        Expand-Archive -Path $nssmPath -DestinationPath $nssmExtractPath -Force
        
        $nssmExe = Get-ChildItem -Path $nssmExtractPath -Recurse -Filter "nssm.exe" | Select-Object -First 1
        $nssmPath = $nssmExe.FullName
        
        # Install service
        & $nssmPath install $serviceName powershell.exe -ExecutionPolicy Bypass -File "$InstallPath\start-service.ps1"
        & $nssmPath set $serviceName DisplayName "moneta Budget Planner"
        & $nssmPath set $serviceName Description "Web-based budget planning application"
        & $nssmPath start $serviceName
        
        # Cleanup
        Remove-Item $nssmPath -Force
        Remove-Item $nssmExtractPath -Recurse -Force
        
        Write-Success "Windows service installed and started"
    }
    catch {
        Write-Error "Failed to install Windows service: $_"
        Write-Status "You can start moneta manually with: cd $InstallPath && npm start"
    }
    
    # Wait for service to start
    Start-Sleep -Seconds 5
    
    Write-Success "moneta installation completed!"
    Write-Status "Access URL: http://localhost:$Port"
    Write-Status "Default login: vapurserdar@gmail.com / Kayseri3838"
}

# Main installation
function Main {
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "    moneta Budget Planner Installer" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Check admin privileges for Windows service
    if ($Method -eq "node" -and -not (Test-Administrator)) {
        Write-Warning "Windows service installation requires administrator privileges"
        Write-Status "Running without service creation..."
    }
    
    # Check prerequisites
    if ($Method -eq "docker") {
        if (-not (Test-Docker)) {
            Install-Docker
        }
        Write-Success "Docker is available"
        Install-DockerMethod
    }
    elseif ($Method -eq "node") {
        if (-not (Test-NodeJS)) {
            Install-NodeJS
        }
        Write-Success "Node.js is available"
        Install-NodeMethod
    }
    
    Write-Host ""
    Write-Success "Installation completed!"
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "Application Details:" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "Name: moneta Budget Planner" -ForegroundColor White
    Write-Host "URL: http://localhost:$Port" -ForegroundColor White
    Write-Host "Login: vapurserdar@gmail.com" -ForegroundColor White
    Write-Host "Password: Kayseri3838" -ForegroundColor White
    Write-Host ""
    Write-Host "Service Management:" -ForegroundColor White
    if ($Method -eq "docker") {
        Write-Host "Status: docker ps | findstr moneta-app" -ForegroundColor Gray
        Write-Host "Logs: docker logs moneta-app" -ForegroundColor Gray
        Write-Host "Stop: docker compose down" -ForegroundColor Gray
    } else {
        Write-Host "Status: Get-Service moneta" -ForegroundColor Gray
        Write-Host "Stop: Stop-Service moneta" -ForegroundColor Gray
        Write-Host "Start: Start-Service moneta" -ForegroundColor Gray
    }
    Write-Host "==========================================" -ForegroundColor Green
}

# Run main function
Main
