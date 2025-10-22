# Guía para Configurar HTTPS en TicketApp

Esta guía te muestra cómo agregar HTTPS a tu aplicación en diferentes entornos.

## 📋 Tabla de Contenidos

1. [HTTPS en Desarrollo Local (localhost)](#desarrollo-local)
2. [HTTPS en Producción con Let's Encrypt](#producción-con-lets-encrypt)
3. [HTTPS con Cloudflare (Alternativa Fácil)](#cloudflare)
4. [HTTPS con servicios cloud (AWS, Azure, etc.)](#servicios-cloud)

---

## 🏠 Desarrollo Local

Para desarrollo en `localhost`, usa certificados autofirmados:

### Opción A: Usando mkcert (Recomendado)

```bash
# 1. Instalar mkcert
# Windows (con Chocolatey):
choco install mkcert

# macOS:
brew install mkcert

# Linux:
sudo apt install mkcert   # Ubuntu/Debian
# o
sudo pacman -S mkcert     # Arch Linux

# 2. Instalar la CA local
mkcert -install

# 3. Crear certificados para localhost
cd ticketapp
mkdir -p nginx/certs
mkcert -key-file nginx/certs/localhost-key.pem -cert-file nginx/certs/localhost.pem localhost 127.0.0.1 ::1

# 4. Crear configuración de Nginx para desarrollo
cat > nginx/nginx-dev.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server gateway:8000;
    }

    upstream frontend {
        server frontend:3000;
    }

    # HTTP - Redirigir a HTTPS
    server {
        listen 80;
        server_name localhost;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS
    server {
        listen 443 ssl http2;
        server_name localhost;

        ssl_certificate /etc/nginx/certs/localhost.pem;
        ssl_certificate_key /etc/nginx/certs/localhost-key.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers off;

        location /api/ {
            rewrite ^/api/(.*) /$1 break;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

# 5. Crear docker-compose-dev-https.yml
cat > docker-compose-dev-https.yml << 'EOF'
version: "3.8"

services:
  # ... (copia tus servicios de docker-compose.yml)

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
EOF

# 6. Iniciar
docker-compose -f docker-compose-dev-https.yml up -d

# 7. Acceder a https://localhost
```

### Opción B: Certificados autofirmados con OpenSSL

```bash
# 1. Crear certificados
mkdir -p nginx/certs
cd nginx/certs

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout localhost-key.pem \
  -out localhost.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

cd ../..

# 2. Usar la misma configuración de nginx-dev.conf del paso anterior

# Nota: Con OpenSSL, el navegador mostrará advertencia de seguridad
# Acepta la advertencia para continuar (solo en desarrollo)
```

---

## 🌐 Producción con Let's Encrypt

Para un dominio público con certificado SSL **gratuito** y **automático**:

### Pre-requisitos

1. ✅ Dominio registrado (ejemplo: ticketapp.com)
2. ✅ Dominio apuntando a la IP de tu servidor
3. ✅ Puertos 80 y 443 abiertos en el firewall
4. ✅ Servidor Linux (Ubuntu, Debian, CentOS, etc.)

### Pasos

```bash
# 1. Clonar o actualizar tu proyecto en el servidor
cd /var/www/ticketapp  # o donde esté tu proyecto

# 2. Actualizar el dominio en nginx.conf
# Reemplaza "tudominio.com" con tu dominio real
nano nginx/nginx.conf

# 3. Dar permisos de ejecución al script
chmod +x init-letsencrypt.sh

# 4. Ejecutar el script de inicialización
sudo ./init-letsencrypt.sh

# El script te pedirá:
# - Tu dominio (ejemplo: ticketapp.com)
# - Tu email para notificaciones

# 5. Iniciar todos los servicios
docker-compose -f docker-compose.https.yml up -d

# 6. Verificar que todo funciona
docker-compose -f docker-compose.https.yml ps
docker-compose -f docker-compose.https.yml logs -f nginx

# 7. Acceder a tu dominio
# https://tudominio.com
```

### Renovación Automática

Los certificados de Let's Encrypt se renuevan automáticamente cada 12 horas gracias al servicio `certbot` en el docker-compose.

### Comandos útiles

```bash
# Ver logs de Nginx
docker-compose -f docker-compose.https.yml logs -f nginx

# Ver logs de Certbot
docker-compose -f docker-compose.https.yml logs -f certbot

# Forzar renovación manual (si es necesario)
docker-compose -f docker-compose.https.yml run --rm certbot renew

# Reiniciar Nginx
docker-compose -f docker-compose.https.yml restart nginx
```

---

## ☁️ Cloudflare (Alternativa Fácil)

Si no quieres configurar certificados manualmente, Cloudflare ofrece SSL gratis:

### Configuración

1. **Crear cuenta en Cloudflare** (gratis): https://cloudflare.com

2. **Agregar tu dominio**:
   - Dashboard → Add a Site
   - Ingresar tu dominio
   - Copiar los nameservers que te da Cloudflare

3. **Cambiar los nameservers de tu dominio**:
   - Ir a tu registrador de dominios (GoDaddy, Namecheap, etc.)
   - Cambiar los nameservers por los de Cloudflare
   - Esperar 24-48 horas para propagación

4. **Configurar SSL en Cloudflare**:
   - Dashboard → SSL/TLS → Overview
   - Seleccionar "Full" o "Full (Strict)"

5. **Configurar registro DNS**:
   - Dashboard → DNS
   - Agregar registro A:
     - Type: A
     - Name: @
     - Content: [IP de tu servidor]
     - Proxy status: ✅ Proxied (naranja)
   - Agregar registro A para www:
     - Type: A
     - Name: www
     - Content: [IP de tu servidor]
     - Proxy status: ✅ Proxied (naranja)

6. **Listo!** Cloudflare automáticamente:
   - Genera certificados SSL
   - Redirige HTTP a HTTPS
   - Protege contra ataques DDoS
   - Caché para mejor rendimiento

### Configuración adicional del backend

Si usas Cloudflare, tu docker-compose puede ser más simple:

```yaml
# docker-compose-cloudflare.yml
version: "3.8"

services:
  # ... tus servicios normales ...

  frontend:
    # ... configuración normal ...
    ports:
      - "80:3000"  # Solo HTTP, Cloudflare maneja HTTPS
    environment:
      - REACT_APP_API_ENDPOINT=https://tudominio.com/api
```

---

## 🔧 Servicios Cloud

### AWS (con ALB + ACM)

```bash
# 1. Crear Application Load Balancer
# 2. Solicitar certificado en AWS Certificate Manager (ACM)
# 3. Configurar ALB para usar certificado
# 4. Apuntar dominio a ALB
```

### Azure (con App Gateway)

```bash
# 1. Crear Application Gateway
# 2. Importar o crear certificado SSL
# 3. Configurar listeners HTTPS
# 4. Apuntar dominio a Application Gateway
```

### Google Cloud (con Load Balancer)

```bash
# 1. Crear HTTPS Load Balancer
# 2. Google maneja certificados automáticamente
# 3. Apuntar dominio a Load Balancer
```

### Heroku

```bash
# Heroku incluye SSL automático (gratis)
# Solo necesitas configurar tu dominio personalizado:

heroku domains:add tudominio.com
heroku certs:auto:enable
```

### DigitalOcean

```bash
# 1. Crear Load Balancer
# 2. Let's Encrypt está integrado
# 3. Marca la opción "HTTPS" al crear el LB
```

---

## 🔒 Verificar tu configuración SSL

Después de configurar HTTPS, verifica la seguridad:

1. **SSL Labs**: https://www.ssllabs.com/ssltest/
   - Debe obtener calificación A o A+

2. **SecurityHeaders.com**: https://securityheaders.com/
   - Verifica headers de seguridad

3. **Mozilla Observatory**: https://observatory.mozilla.org/

---

## ❓ Problemas Comunes

### Error: "Certificate verification failed"

**Solución**: Verifica que el dominio esté apuntando correctamente a tu servidor.

```bash
# Verificar DNS
nslookup tudominio.com

# Verificar que Nginx esté escuchando
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

### Error: "Port 80/443 already in use"

**Solución**: Detener otros servicios que usen esos puertos.

```bash
# Ver qué está usando el puerto
sudo lsof -i :80
sudo lsof -i :443

# Detener Apache si está corriendo
sudo systemctl stop apache2

# O detener Nginx si existe fuera de Docker
sudo systemctl stop nginx
```

### Certificado no se renueva automáticamente

**Solución**: Verificar logs de certbot.

```bash
docker-compose -f docker-compose.https.yml logs certbot

# Forzar renovación
docker-compose -f docker-compose.https.yml run --rm certbot renew --force-renewal
```

---

## 📚 Recursos Adicionales

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Nginx SSL Configuration](https://nginx.org/en/docs/http/configuring_https_servers.html)
- [Cloudflare SSL Guide](https://developers.cloudflare.com/ssl/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)

---

## 🎯 Recomendaciones

1. **Para desarrollo**: Usa mkcert (fácil y sin advertencias)
2. **Para producción pequeña**: Usa Let's Encrypt (gratis y automático)
3. **Para producción grande**: Usa Cloudflare (protección DDoS incluida)
4. **Para apps cloud**: Usa el servicio SSL nativo de tu proveedor

---

**¿Necesitas ayuda?** Revisa los logs y la sección de problemas comunes. Si el problema persiste, verifica que tu firewall y DNS estén configurados correctamente.
