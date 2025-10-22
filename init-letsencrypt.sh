#!/bin/bash

# Script para inicializar certificados SSL con Let's Encrypt
# IMPORTANTE: Ejecutar este script SOLO UNA VEZ cuando configures HTTPS por primera vez

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Inicializador de Certificados SSL Let's Encrypt ===${NC}\n"

# 1. Configurar variables
echo -e "${YELLOW}Paso 1: Configuración${NC}"
read -p "Ingresa tu dominio (ejemplo: ticketapp.com): " DOMAIN
read -p "Ingresa tu email para notificaciones de Let's Encrypt: " EMAIL

# Validar que se ingresaron los datos
if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo -e "${RED}Error: Debes ingresar un dominio y un email${NC}"
    exit 1
fi

echo -e "${GREEN}Dominio: $DOMAIN${NC}"
echo -e "${GREEN}Email: $EMAIL${NC}\n"

# 2. Crear estructura de directorios
echo -e "${YELLOW}Paso 2: Creando directorios necesarios...${NC}"
mkdir -p certbot/conf certbot/www
echo -e "${GREEN}Directorios creados${NC}\n"

# 3. Actualizar nginx.conf con el dominio correcto
echo -e "${YELLOW}Paso 3: Actualizando configuración de Nginx...${NC}"
sed -i "s/tudominio.com/$DOMAIN/g" nginx/nginx.conf
echo -e "${GREEN}Nginx configurado${NC}\n"

# 4. Descargar parámetros recomendados de SSL
echo -e "${YELLOW}Paso 4: Descargando parámetros SSL recomendados...${NC}"
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > certbot/conf/options-ssl-nginx.conf
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > certbot/conf/ssl-dhparams.pem
echo -e "${GREEN}Parámetros SSL descargados${NC}\n"

# 5. Crear certificado dummy temporal
echo -e "${YELLOW}Paso 5: Creando certificado temporal...${NC}"
mkdir -p certbot/conf/live/$DOMAIN

openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout certbot/conf/live/$DOMAIN/privkey.pem \
    -out certbot/conf/live/$DOMAIN/fullchain.pem \
    -subj "/CN=$DOMAIN"

echo -e "${GREEN}Certificado temporal creado${NC}\n"

# 6. Iniciar Nginx temporalmente
echo -e "${YELLOW}Paso 6: Iniciando Nginx...${NC}"
docker-compose -f docker-compose.https.yml up -d nginx
echo -e "${GREEN}Nginx iniciado${NC}\n"

# 7. Esperar a que Nginx esté listo
echo -e "${YELLOW}Esperando a que Nginx esté listo...${NC}"
sleep 5

# 8. Eliminar certificado dummy
echo -e "${YELLOW}Paso 7: Eliminando certificado temporal...${NC}"
docker-compose -f docker-compose.https.yml run --rm --entrypoint "\
  rm -rf /etc/letsencrypt/live/$DOMAIN && \
  rm -rf /etc/letsencrypt/archive/$DOMAIN && \
  rm -rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot
echo -e "${GREEN}Certificado temporal eliminado${NC}\n"

# 9. Solicitar certificado real de Let's Encrypt
echo -e "${YELLOW}Paso 8: Solicitando certificado SSL de Let's Encrypt...${NC}"
echo -e "${YELLOW}Esto puede tardar unos momentos...${NC}\n"

docker-compose -f docker-compose.https.yml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN -d www.$DOMAIN" certbot

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}¡Certificado SSL obtenido exitosamente!${NC}\n"
else
    echo -e "\n${RED}Error al obtener el certificado SSL${NC}"
    echo -e "${YELLOW}Asegúrate de que:${NC}"
    echo -e "  1. Tu dominio está apuntando a la IP de este servidor"
    echo -e "  2. Los puertos 80 y 443 están abiertos en el firewall"
    echo -e "  3. No hay otros servicios usando los puertos 80 o 443"
    exit 1
fi

# 10. Recargar Nginx
echo -e "${YELLOW}Paso 9: Recargando Nginx con el certificado real...${NC}"
docker-compose -f docker-compose.https.yml exec nginx nginx -s reload
echo -e "${GREEN}Nginx recargado${NC}\n"

# 11. Información final
echo -e "${GREEN}=== ¡Configuración completada! ===${NC}\n"
echo -e "${GREEN}Tu aplicación ahora está disponible en:${NC}"
echo -e "  https://$DOMAIN"
echo -e "  https://www.$DOMAIN\n"
echo -e "${YELLOW}Notas importantes:${NC}"
echo -e "  - Los certificados se renovarán automáticamente cada 12 horas"
echo -e "  - Para iniciar todos los servicios: docker-compose -f docker-compose.https.yml up -d"
echo -e "  - Para ver logs: docker-compose -f docker-compose.https.yml logs -f"
echo -e "  - Para detener: docker-compose -f docker-compose.https.yml down\n"
