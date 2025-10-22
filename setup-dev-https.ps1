# Script PowerShell para configurar HTTPS en desarrollo local (Windows)
# Requiere: mkcert instalado

Write-Host "=======================================" -ForegroundColor Green
Write-Host " Configuracion HTTPS para Desarrollo  " -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""

# Verificar si mkcert esta instalado
$mkcertInstalled = Get-Command mkcert -ErrorAction SilentlyContinue

if (-not $mkcertInstalled) {
    Write-Host "ERROR: mkcert no esta instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Opciones de instalacion:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Con Chocolatey (recomendado):" -ForegroundColor Cyan
    Write-Host "   choco install mkcert" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Con Scoop:" -ForegroundColor Cyan
    Write-Host "   scoop bucket add extras" -ForegroundColor White
    Write-Host "   scoop install mkcert" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Descarga manual:" -ForegroundColor Cyan
    Write-Host "   https://github.com/FiloSottile/mkcert/releases" -ForegroundColor White
    Write-Host ""

    $installChoco = Read-Host "¿Quieres instalar Chocolatey ahora? (S/N)"
    if ($installChoco -eq "S" -or $installChoco -eq "s") {
        Write-Host "Instalando Chocolatey..." -ForegroundColor Yellow
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

        Write-Host "Instalando mkcert..." -ForegroundColor Yellow
        choco install mkcert -y

        Write-Host ""
        Write-Host "Por favor, cierra y vuelve a abrir PowerShell, luego ejecuta este script nuevamente." -ForegroundColor Green
        pause
        exit
    } else {
        Write-Host "Por favor, instala mkcert manualmente y vuelve a ejecutar este script." -ForegroundColor Yellow
        pause
        exit
    }
}

Write-Host "mkcert encontrado!" -ForegroundColor Green
Write-Host ""

# Crear directorios necesarios
Write-Host "Paso 1: Creando directorios..." -ForegroundColor Cyan
$nginxDir = Join-Path $PSScriptRoot "nginx"
$certsDir = Join-Path $nginxDir "certs"

if (-not (Test-Path $nginxDir)) {
    New-Item -ItemType Directory -Path $nginxDir | Out-Null
}

if (-not (Test-Path $certsDir)) {
    New-Item -ItemType Directory -Path $certsDir | Out-Null
}

Write-Host "Directorios creados" -ForegroundColor Green
Write-Host ""

# Instalar CA local
Write-Host "Paso 2: Instalando autoridad certificadora local..." -ForegroundColor Cyan
mkcert -install
Write-Host "CA instalada" -ForegroundColor Green
Write-Host ""

# Generar certificados
Write-Host "Paso 3: Generando certificados para localhost..." -ForegroundColor Cyan
Set-Location $certsDir
mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1 ::1
Set-Location $PSScriptRoot
Write-Host "Certificados generados en: $certsDir" -ForegroundColor Green
Write-Host ""

# Crear configuracion de Nginx para desarrollo
Write-Host "Paso 4: Creando configuracion de Nginx..." -ForegroundColor Cyan
$nginxConfig = @"
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    upstream backend {
        server gateway:8000;
    }

    upstream frontend {
        server frontend:3000;
    }

    # Redireccion HTTP a HTTPS
    server {
        listen 80;
        server_name localhost;
        return 301 https://`$server_name`$request_uri;
    }

    # Servidor HTTPS
    server {
        listen 443 ssl http2;
        server_name localhost;

        ssl_certificate /etc/nginx/certs/localhost.pem;
        ssl_certificate_key /etc/nginx/certs/localhost-key.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers off;

        client_max_body_size 10M;

        # API Gateway
        location /api/ {
            rewrite ^/api/(.*) /`$1 break;
            proxy_pass http://backend;

            proxy_http_version 1.1;
            proxy_set_header Upgrade `$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host `$host;
            proxy_set_header X-Real-IP `$remote_addr;
            proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto `$scheme;
            proxy_cache_bypass `$http_upgrade;
        }

        # Frontend React
        location / {
            proxy_pass http://frontend;

            proxy_http_version 1.1;
            proxy_set_header Upgrade `$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host `$host;
            proxy_set_header X-Real-IP `$remote_addr;
            proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto `$scheme;
            proxy_cache_bypass `$http_upgrade;
        }
    }
}
"@

$nginxConfigPath = Join-Path $nginxDir "nginx-dev.conf"
$nginxConfig | Out-File -FilePath $nginxConfigPath -Encoding UTF8
Write-Host "Configuracion de Nginx creada en: $nginxConfigPath" -ForegroundColor Green
Write-Host ""

# Crear docker-compose para desarrollo con HTTPS
Write-Host "Paso 5: Creando docker-compose-dev-https.yml..." -ForegroundColor Cyan
$dockerCompose = @"
version: "3.8"

services:
  mongo:
    image: mongo
    container_name: mongo
    ports:
      - "27017:27017"
    networks:
      - ticketapp-network

  userservice:
    build: ./backend/userservice
    container_name: userservice
    ports:
      - "8001:8001"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/userdb
    depends_on:
      - mongo
    networks:
      - ticketapp-network

  ticketservice:
    build: ./backend/ticketservice
    container_name: ticketservice
    ports:
      - "8002:8002"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/ticketdb
      - USER_SERVICE_URL=http://userservice:8001
      - EVENT_SERVICE_URL=http://eventservice:8003
    depends_on:
      - mongo
    networks:
      - ticketapp-network

  locationservice:
    build: ./backend/locationservice
    container_name: locationservice
    ports:
      - "8004:8004"
    environment:
      - MONGODB_URI_LOCATION=mongodb://mongo:27017/locationdb
      - MONGODB_URI_SEATMAP=mongodb://mongo:27017/seatmapdb
    depends_on:
      - mongo
    networks:
      - ticketapp-network

  eventservice:
    build: ./backend/eventservice
    container_name: eventservice
    ports:
      - "8003:8003"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/eventdb
      - TICKET_SERVICE_URL=http://ticketservice:8002
      - LOCATION_SERVICE_URL=http://locationservice:8004
      - USER_SERVICE_URL=http://userservice:8001
    depends_on:
      - mongo
      - ticketservice
      - locationservice
    networks:
      - ticketapp-network

  gateway:
    build: ./backend/gatewayservice
    container_name: gateway
    ports:
      - "8000:8000"
    environment:
      - USER_SERVICE_URL=http://userservice:8001
      - TICKET_SERVICE_URL=http://ticketservice:8002
      - EVENT_SERVICE_URL=http://eventservice:8003
      - LOCATION_SERVICE_URL=http://locationservice:8004
    depends_on:
      - userservice
      - ticketservice
      - eventservice
      - locationservice
    networks:
      - ticketapp-network

  frontend:
    build: ./frontend
    container_name: frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_ENDPOINT=https://localhost/api
    depends_on:
      - gateway
    networks:
      - ticketapp-network

  nginx:
    image: nginx:alpine
    container_name: nginx-dev
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx-dev.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro
    depends_on:
      - frontend
      - gateway
    networks:
      - ticketapp-network

networks:
  ticketapp-network:
    driver: bridge
"@

$dockerComposePath = Join-Path $PSScriptRoot "docker-compose-dev-https.yml"
$dockerCompose | Out-File -FilePath $dockerComposePath -Encoding UTF8
Write-Host "Docker Compose creado en: $dockerComposePath" -ForegroundColor Green
Write-Host ""

# Resumen
Write-Host "=======================================" -ForegroundColor Green
Write-Host "   Configuracion completada!" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Iniciar los servicios:" -ForegroundColor Cyan
Write-Host "   docker-compose -f docker-compose-dev-https.yml up -d" -ForegroundColor White
Write-Host ""
Write-Host "2. Acceder a tu aplicacion:" -ForegroundColor Cyan
Write-Host "   https://localhost" -ForegroundColor White
Write-Host ""
Write-Host "3. Ver logs (opcional):" -ForegroundColor Cyan
Write-Host "   docker-compose -f docker-compose-dev-https.yml logs -f" -ForegroundColor White
Write-Host ""
Write-Host "4. Detener servicios:" -ForegroundColor Cyan
Write-Host "   docker-compose -f docker-compose-dev-https.yml down" -ForegroundColor White
Write-Host ""
Write-Host "Notas:" -ForegroundColor Yellow
Write-Host "- El certificado es valido solo para localhost" -ForegroundColor Gray
Write-Host "- No habra advertencias de seguridad en el navegador" -ForegroundColor Gray
Write-Host "- Para produccion, usa Let's Encrypt (ver docs/HTTPS-SETUP.md)" -ForegroundColor Gray
Write-Host ""

pause
