# 🔒 Configuración HTTPS para TicketApp

Esta guía rápida te ayuda a agregar HTTPS a tu aplicación según tu entorno.

---

## 🚀 Inicio Rápido

### Para Desarrollo Local (Windows/Mac/Linux)

**Opción más fácil: Ejecuta el script automático**

#### Windows (PowerShell como Administrador):
```powershell
.\setup-dev-https.ps1
```

#### Linux/Mac:
```bash
chmod +x setup-dev-https.sh
./setup-dev-https.sh
```

El script automáticamente:
- ✅ Instala mkcert (si no está instalado)
- ✅ Genera certificados SSL para localhost
- ✅ Configura Nginx
- ✅ Crea docker-compose-dev-https.yml

Luego solo ejecuta:
```bash
docker-compose -f docker-compose-dev-https.yml up -d
```

Y accede a: **https://localhost**

---

### Para Producción (Servidor Linux con dominio público)

**Opción recomendada: Let's Encrypt (SSL gratis y automático)**

```bash
# 1. En tu servidor de producción
chmod +x init-letsencrypt.sh
sudo ./init-letsencrypt.sh

# 2. Sigue las instrucciones (te pedirá dominio y email)

# 3. Inicia los servicios
docker-compose -f docker-compose.https.yml up -d
```

**Listo!** Tu app estará en https://tudominio.com con certificado válido.

---

### Para Producción (Fácil): Cloudflare

Si no quieres lidiar con certificados:

1. Crea cuenta gratis en [Cloudflare](https://cloudflare.com)
2. Agrega tu dominio
3. Cambia los nameservers de tu dominio
4. En Cloudflare: SSL/TLS → Full
5. **¡Listo!** Cloudflare maneja todo automáticamente

**Ventajas adicionales:**
- 🛡️ Protección DDoS
- 🚀 CDN global (tu sitio será más rápido)
- 📊 Analytics
- 🔧 Reglas de firewall

---

## 📁 Archivos Creados

```
ticketapp/
├── nginx/
│   ├── nginx.conf              # Producción (Let's Encrypt)
│   ├── nginx-dev.conf          # Desarrollo local
│   └── certs/                  # Certificados de desarrollo
│       ├── localhost.pem
│       └── localhost-key.pem
├── docker-compose-dev-https.yml    # Docker Compose para desarrollo
├── docker-compose.https.yml        # Docker Compose para producción
├── init-letsencrypt.sh            # Script para Let's Encrypt (Linux)
├── setup-dev-https.ps1            # Script para desarrollo (Windows)
└── docs/
    └── HTTPS-SETUP.md             # Guía completa detallada
```

---

## 🎯 ¿Qué opción elegir?

| Situación | Solución Recomendada | Dificultad | Costo |
|-----------|---------------------|------------|-------|
| **Desarrollo en tu PC** | `setup-dev-https.ps1` (Windows) o mkcert | ⭐ Fácil | Gratis |
| **Producción pequeña/personal** | Let's Encrypt (`init-letsencrypt.sh`) | ⭐⭐ Medio | Gratis |
| **Producción sin querer configurar** | Cloudflare | ⭐ Muy fácil | Gratis |
| **Startup/Empresa pequeña** | Cloudflare + Let's Encrypt | ⭐⭐ Medio | Gratis |
| **Empresa grande** | AWS/Azure/GCP con sus servicios SSL | ⭐⭐⭐ Difícil | $$$$ |

---

## ✅ Verificar que HTTPS funciona

Después de configurar, visita:

1. **Tu sitio**: https://tudominio.com (o https://localhost en dev)
2. **Verificar SSL**: https://www.ssllabs.com/ssltest/
   - Debe mostrar grado **A** o **A+**

---

## 🆘 Problemas Comunes

### "No puedo acceder a https://localhost"

**Solución**: Verifica que Nginx esté corriendo
```bash
docker-compose -f docker-compose-dev-https.yml ps
docker-compose -f docker-compose-dev-https.yml logs nginx
```

### "El navegador dice que el sitio no es seguro" (en producción)

**Causas comunes**:
1. El dominio no apunta a tu servidor → Verifica DNS
2. Los puertos 80/443 están bloqueados → Abre firewall
3. El certificado no se generó → Revisa logs de certbot

```bash
# Verificar DNS
nslookup tudominio.com

# Ver logs de certbot
docker-compose -f docker-compose.https.yml logs certbot

# Verificar firewall
sudo ufw status  # Ubuntu
sudo firewall-cmd --list-all  # CentOS
```

### "Error: port 80 is already allocated"

Algo más está usando el puerto 80 (probablemente Apache o Nginx nativo).

**Solución**:
```bash
# Detener Apache
sudo systemctl stop apache2

# O detener Nginx nativo
sudo systemctl stop nginx

# Luego reinicia docker-compose
docker-compose down
docker-compose up -d
```

---

## 📚 Documentación Completa

Para guías detalladas paso a paso, consulta:

📖 **[docs/HTTPS-SETUP.md](docs/HTTPS-SETUP.md)**

Incluye:
- Configuración detallada para cada plataforma
- Configuración avanzada de seguridad
- Optimización de rendimiento
- Troubleshooting completo
- Integración con servicios cloud (AWS, Azure, GCP, Heroku)

---

## 🔐 Recomendaciones de Seguridad

Una vez que tengas HTTPS funcionando:

1. ✅ **Forzar HTTPS**: Redirigir todo HTTP → HTTPS (ya incluido en configs)
2. ✅ **Headers de seguridad**: Configurados en nginx.conf
3. ✅ **Renovación automática**: Configurada en docker-compose.https.yml
4. ⚠️ **Actualizar regularmente**: `docker-compose pull` para actualizaciones
5. ⚠️ **Firewall**: Solo abrir puertos 80, 443, 22 (SSH)
6. ⚠️ **Backups**: Hacer backup de `certbot/conf/` regularmente

---

## 💡 Tips

### Desarrollo
- Usa **mkcert** - es la forma más fácil y no da advertencias
- Puedes usar http://localhost para desarrollo simple sin SSL

### Producción
- **Let's Encrypt** es perfecto para sitios pequeños/medianos
- **Cloudflare** es ideal si quieres protección DDoS gratis
- Los certificados Let's Encrypt **se renuevan automáticamente** cada 3 meses

### Performance
- Usa Cloudflare CDN para sitios globales
- Habilita HTTP/2 (ya configurado en nginx.conf)
- Habilita compresión gzip (ya configurado en nginx.conf)

---

## 🤝 Soporte

Si tienes problemas:

1. **Revisa los logs**:
   ```bash
   docker-compose logs -f nginx
   docker-compose logs -f certbot
   ```

2. **Consulta la guía completa**: [docs/HTTPS-SETUP.md](docs/HTTPS-SETUP.md)

3. **Verifica pre-requisitos**:
   - Dominio apuntando a tu servidor ✅
   - Puertos 80 y 443 abiertos ✅
   - Docker y Docker Compose instalados ✅

---

**¡Ahora tu aplicación es segura con HTTPS! 🎉🔒**
