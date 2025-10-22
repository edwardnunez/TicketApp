#!/bin/bash

# Script para configurar HTTPS en desarrollo local (Linux/macOS)

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=======================================${NC}"
echo -e "${GREEN} Configuración HTTPS para Desarrollo ${NC}"
echo -e "${GREEN}=======================================${NC}"
echo ""

# Verificar si mkcert está instalado
if ! command -v mkcert &> /dev/null; then
    echo -e "${RED}ERROR: mkcert no está instalado${NC}"
    echo ""
    echo -e "${YELLOW}Opciones de instalación:${NC}"
    echo ""

    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo -e "${CYAN}macOS (con Homebrew):${NC}"
        echo "  brew install mkcert"
        echo "  brew install nss  # Si usas Firefox"
        echo ""
        read -p "¿Quieres instalar mkcert ahora con Homebrew? (s/n): " install_mac
        if [[ $install_mac == "s" || $install_mac == "S" ]]; then
            brew install mkcert
            brew install nss
        else
            echo -e "${YELLOW}Por favor, instala mkcert y ejecuta este script nuevamente.${NC}"
            exit 1
        fi
    else
        echo -e "${CYAN}Ubuntu/Debian:${NC}"
        echo "  sudo apt install mkcert"
        echo ""
        echo -e "${CYAN}Arch Linux:${NC}"
        echo "  sudo pacman -S mkcert"
        echo ""
        echo -e "${CYAN}Fedora:${NC}"
        echo "  sudo dnf install mkcert"
        echo ""
        echo -e "${CYAN}Manual (cualquier Linux):${NC}"
        echo "  curl -JLO https://dl.filippo.io/mkcert/latest?for=linux/amd64"
        echo "  chmod +x mkcert-v*-linux-amd64"
        echo "  sudo cp mkcert-v*-linux-amd64 /usr/local/bin/mkcert"
        echo ""

        read -p "¿Quieres instalarlo automáticamente? (s/n): " install_linux
        if [[ $install_linux == "s" || $install_linux == "S" ]]; then
            if command -v apt &> /dev/null; then
                sudo apt update && sudo apt install -y mkcert
            elif command -v pacman &> /dev/null; then
                sudo pacman -S mkcert
            elif command -v dnf &> /dev/null; then
                sudo dnf install -y mkcert
            else
                echo "Instalando manualmente..."
                curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
                chmod +x mkcert-v*-linux-amd64
                sudo cp mkcert-v*-linux-amd64 /usr/local/bin/mkcert
                rm mkcert-v*-linux-amd64
            fi
        else
            echo -e "${YELLOW}Por favor, instala mkcert y ejecuta este script nuevamente.${NC}"
            exit 1
        fi
    fi
fi

echo -e "${GREEN}mkcert encontrado!${NC}"
echo ""

# Crear directorios necesarios
echo -e "${CYAN}Paso 1: Creando directorios...${NC}"
mkdir -p nginx/certs
echo -e "${GREEN}Directorios creados${NC}"
echo ""

# Instalar CA local
echo -e "${CYAN}Paso 2: Instalando autoridad certificadora local...${NC}"
mkcert -install
echo -e "${GREEN}CA instalada${NC}"
echo ""

# Generar certificados
echo -e "${CYAN}Paso 3: Generando certificados para localhost...${NC}"
cd nginx/certs
mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1 ::1
cd ../..
echo -e "${GREEN}Certificados generados en: nginx/certs/${NC}"
echo ""

# Crear configuración de Nginx para desarrollo
echo -e "${CYAN}Paso 4: Creando configuración de Nginx...${NC}"
cat > nginx/nginx-dev.conf << 'EOF'
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

    # Redirección HTTP a HTTPS
    server {
        listen 80;
        server_name localhost;
        return 301 https://$server_name$request_uri;
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
            rewrite ^/api/(.*) /$1 break;
            proxy_pass http://backend;

            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Frontend React
        location / {
            proxy_pass http://frontend;

            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
EOF
echo -e "${GREEN}Configuración de Nginx creada en: nginx/nginx-dev.conf${NC}"
echo ""

# Crear docker-compose para desarrollo con HTTPS
echo -e "${CYAN}Paso 5: Creando docker-compose-dev-https.yml...${NC}"
cat > docker-compose-dev-https.yml << 'EOF'
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
EOF
echo -e "${GREEN}Docker Compose creado en: docker-compose-dev-https.yml${NC}"
echo ""

# Resumen
echo -e "${GREEN}=======================================${NC}"
echo -e "${GREEN}   ¡Configuración completada!${NC}"
echo -e "${GREEN}=======================================${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo ""
echo -e "${CYAN}1. Iniciar los servicios:${NC}"
echo "   docker-compose -f docker-compose-dev-https.yml up -d"
echo ""
echo -e "${CYAN}2. Acceder a tu aplicación:${NC}"
echo "   https://localhost"
echo ""
echo -e "${CYAN}3. Ver logs (opcional):${NC}"
echo "   docker-compose -f docker-compose-dev-https.yml logs -f"
echo ""
echo -e "${CYAN}4. Detener servicios:${NC}"
echo "   docker-compose -f docker-compose-dev-https.yml down"
echo ""
echo -e "${YELLOW}Notas:${NC}"
echo "- El certificado es válido solo para localhost"
echo "- No habrá advertencias de seguridad en el navegador"
echo "- Para producción, usa Let's Encrypt (ver docs/HTTPS-SETUP.md)"
echo ""
