# Guía de Despliegue en Azure con GitHub Actions

Esta guía explica cómo desplegar **TicketApp** en una máquina virtual de Azure completamente **GRATIS** usando Azure for Students, con despliegue automático mediante GitHub Actions.

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Arquitectura del Despliegue](#arquitectura-del-despliegue)
3. [Crear Máquina Virtual en Azure](#crear-máquina-virtual-en-azure)
4. [Configurar la VM](#configurar-la-vm)
5. [Configurar GitHub Secrets](#configurar-github-secrets)
6. [Desplegar la Aplicación](#desplegar-la-aplicación)
7. [Verificar el Despliegue](#verificar-el-despliegue)
8. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)
9. [Solución de Problemas](#solución-de-problemas)

---

## 🎓 Requisitos Previos

### 1. Cuenta de Azure for Students

- **Crédito gratis:** $100 USD durante 12 meses
- **Servicios gratuitos:** Incluye máquinas virtuales B1s (1 vCPU, 1GB RAM) durante 12 meses
- **Registro:** https://azure.microsoft.com/es-es/free/students/

### 2. Cuenta de GitHub

- Repositorio con el código de TicketApp
- Permisos para crear GitHub Actions

### 3. Conocimientos Básicos

- SSH y línea de comandos de Linux
- Docker y Docker Compose
- Git y GitHub

---

## 🏗️ Arquitectura del Despliegue

```
┌──────────────────────────────────────────────────────────┐
│                    GitHub Repository                      │
│                  (Código + Workflows)                     │
└───────────────────────┬──────────────────────────────────┘
                        │
                        │ git push (trigger)
                        ▼
┌──────────────────────────────────────────────────────────┐
│                  GitHub Actions                           │
│  1. Build Docker images                                   │
│  2. Push to GitHub Container Registry (ghcr.io)          │
│  3. SSH to Azure VM                                       │
│  4. Deploy with docker-compose                           │
└───────────────────────┬──────────────────────────────────┘
                        │
                        │ SSH + Docker commands
                        ▼
┌──────────────────────────────────────────────────────────┐
│              Azure VM (Ubuntu 22.04)                      │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Docker Compose                                     │  │
│  │  ┌─────────┐ ┌─────────┐ ┌──────────┐             │  │
│  │  │ MongoDB │ │ Backend │ │ Frontend │             │  │
│  │  │         │ │Services │ │  (React) │             │  │
│  │  └─────────┘ └─────────┘ └──────────┘             │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  Puertos Expuestos:                                       │
│  - 80 (Frontend - HTTP)                                   │
│  - 8000 (Gateway API)                                     │
└──────────────────────────────────────────────────────────┘
                        │
                        │ Internet
                        ▼
                   👥 Usuarios
```

---

## 🖥️ Crear Máquina Virtual en Azure

### Paso 1: Acceder al Portal de Azure

1. Ve a https://portal.azure.com
2. Inicia sesión con tu cuenta de estudiante
3. Haz clic en **"Crear un recurso"**

### Paso 2: Configurar la Máquina Virtual

1. Busca **"Máquina virtual"** y haz clic en **"Crear"**

2. **Configuración Básica:**
   - **Suscripción:** Azure for Students
   - **Grupo de recursos:** Crear nuevo → `ticketapp-rg`
   - **Nombre de VM:** `ticketapp-vm`
   - **Región:** `West Europe` (o la más cercana)
   - **Opciones de disponibilidad:** Sin redundancia de infraestructura necesaria
   - **Imagen:** `Ubuntu Server 22.04 LTS - x64 Gen2`
   - **Tamaño:** `Standard_B2s` (2 vCPUs, 4 GiB RAM) - **GRATIS durante 12 meses**
     - Si no aparece, haz clic en "Ver todos los tamaños" y busca `B2s`

3. **Cuenta de Administrador:**
   - **Tipo de autenticación:** `Clave pública SSH`
   - **Nombre de usuario:** `azureuser` (o el que prefieras)
   - **Origen de clave pública SSH:** `Generar nuevo par de claves`
   - **Nombre del par de claves:** `ticketapp-vm_key`

4. **Reglas de puerto de entrada:**
   - Selecciona:
     - ✅ SSH (22)
     - ✅ HTTP (80)
     - ✅ HTTPS (443)

5. Haz clic en **"Revisar y crear"**

6. Haz clic en **"Crear"**

7. **IMPORTANTE:** Azure mostrará un diálogo para descargar la clave privada:
   - Haz clic en **"Descargar clave privada y crear recurso"**
   - Guarda el archivo `ticketapp-vm-key.pem` en un lugar seguro
   - **NO PIERDAS ESTA CLAVE**, es necesaria para conectarte por SSH

### Paso 3: Configurar Reglas de Red Adicionales

Una vez creada la VM:

1. Ve a **"Grupos de seguridad de red"** (NSG)
2. Selecciona el NSG de tu VM (ej: `ticketapp-vm-nsg`)
3. Haz clic en **"Reglas de seguridad de entrada"**
4. Añade una regla para el puerto 8000 (API Gateway):
   - **Origen:** `Any`
   - **Intervalos de puertos de origen:** `*`
   - **Destino:** `Any`
   - **Intervalos de puertos de destino:** `8000`
   - **Protocolo:** `TCP`
   - **Acción:** `Permitir`
   - **Prioridad:** `320`
   - **Nombre:** `AllowPort8000`

5. Haz clic en **"Agregar"**

### Paso 4: Obtener la IP Pública

1. Ve a tu máquina virtual `ticketapp-vm`
2. En el panel derecho, busca **"Dirección IP pública"**
3. Copia la IP (ejemplo: `20.123.45.67`)
4. **Guarda esta IP**, la necesitarás para GitHub Secrets

---

## ⚙️ Configurar la VM

### Paso 1: Conectar por SSH

**En Windows (PowerShell):**

```powershell
# Asignar permisos a la clave
icacls "ticketapp-vm-key.pem" /inheritance:r
icacls "ticketapp-vm-key.pem" /grant:r "$($env:USERNAME):(R)"

# Conectar
ssh -i ticketapp-vm_key.pem azureuser@TU_IP_PUBLICA
```

**En macOS/Linux:**

```bash
# Asignar permisos a la clave
chmod 400 ticketapp-vm-key.pem

# Conectar
ssh -i ticketapp-vm_key.pem azureuser@TU_IP_PUBLICA
```

### Paso 2: Instalar Docker

Una vez conectado a la VM:

```bash
# Actualizar paquetes
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
sudo apt install -y ca-certificates curl gnupg lsb-release

# Añadir clave GPG oficial de Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Añadir repositorio de Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verificar instalación
docker --version
docker compose version

# Añadir usuario al grupo docker (para ejecutar sin sudo)
sudo usermod -aG docker $USER

# Aplicar cambios de grupo (o desconectar y volver a conectar)
newgrp docker

# Verificar que funciona sin sudo
docker ps
```

### Paso 3: Crear Directorio de Trabajo

```bash
# Crear directorio para la aplicación
mkdir -p ~/ticketapp
cd ~/ticketapp

# Verificar
pwd
# Debe mostrar: /home/azureuser/ticketapp
```

### Paso 4: Configurar Firewall (UFW)

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH, HTTP, HTTPS y puerto 8000
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8000/tcp

# Verificar reglas
sudo ufw status

# Debe mostrar:
# Status: active
#
# To                         Action      From
# --                         ------      ----
# 22/tcp                     ALLOW       Anywhere
# 80/tcp                     ALLOW       Anywhere
# 443/tcp                    ALLOW       Anywhere
# 8000/tcp                   ALLOW       Anywhere
```

---

## 🔐 Configurar GitHub Secrets

### Paso 1: Preparar la Clave SSH

Necesitas convertir la clave privada descargada de Azure al formato que GitHub Actions espera.

   *En tu computadora local:**

```bash
# Ver el contenido de la clave
cat ticketapp-vm-key.pem

# Copiar TODO el contenido, incluyendo:
# -----BEGIN RSA PRIVATE KEY-----
# ...
# -----END RSA PRIVATE KEY-----
```

### Paso 2: Añadir Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. Haz clic en **"Settings"** → **"Secrets and variables"** → **"Actions"**
3. Haz clic en **"New repository secret"**

Añade los siguientes secrets uno por uno:

#### **A) AZURE_VM_HOST**
- **Nombre:** `AZURE_VM_HOST`
- **Valor:** La IP pública de tu VM (ej: `20.123.45.67`)

#### **B) AZURE_VM_USER**
- **Nombre:** `AZURE_VM_USER`
- **Valor:** `azureuser` (o el usuario que configuraste)

#### **C) AZURE_VM_SSH_KEY**
- **Nombre:** `AZURE_VM_SSH_KEY`
- **Valor:** Pega TODO el contenido de `ticketapp-vm-key.pem`

#### **D) SMTP_HOST**
- **Nombre:** `SMTP_HOST`
- **Valor:** `smtp.gmail.com`

#### **E) SMTP_PORT**
- **Nombre:** `SMTP_PORT`
- **Valor:** `587`

#### **F) SMTP_USER**
- **Nombre:** `SMTP_USER`
- **Valor:** Tu email de Gmail (ej: `tu-email@gmail.com`)

#### **G) SMTP_PASS**
- **Nombre:** `SMTP_PASS`
- **Valor:** Tu contraseña de aplicación de Gmail (no tu contraseña normal)

  **Cómo obtenerla:**
  1. Ve a https://myaccount.google.com/apppasswords
  2. Selecciona **"Correo"** y **"Otro (nombre personalizado)"**
  3. Escribe `TicketApp`
  4. Haz clic en **"Generar"**
  5. Copia la contraseña de 16 caracteres

#### **H) SMTP_FROM**
- **Nombre:** `SMTP_FROM`
- **Valor:** `TicketApp <no-reply@ticketapp.com>`

#### **I) REACT_APP_API_ENDPOINT**
- **Nombre:** `REACT_APP_API_ENDPOINT`
- **Valor:** `http://TU_IP_PUBLICA:8000` (ej: `http://20.123.45.67:8000`)

#### **J) REACT_APP_PAYPAL_CLIENT_ID**
- **Nombre:** `REACT_APP_PAYPAL_CLIENT_ID`
- **Valor:** Tu PayPal Client ID

#### **K) REACT_APP_PAYPAL_ENVIRONMENT**
- **Nombre:** `REACT_APP_PAYPAL_ENVIRONMENT`
- **Valor:** `sandbox`

### Paso 3: Verificar Secrets

Deberías tener **11 secrets** configurados:

1. ✅ AZURE_VM_HOST
2. ✅ AZURE_VM_USER
3. ✅ AZURE_VM_SSH_KEY
4. ✅ SMTP_HOST
5. ✅ SMTP_PORT
6. ✅ SMTP_USER
7. ✅ SMTP_PASS
8. ✅ SMTP_FROM
9. ✅ REACT_APP_API_ENDPOINT
10. ✅ REACT_APP_PAYPAL_CLIENT_ID
11. ✅ REACT_APP_PAYPAL_ENVIRONMENT

---

## 🚀 Desplegar la Aplicación

### Paso 1: Hacer Commit y Push

```bash
cd c:\Users\iyanf\OneDrive\Escritorio\ticketapp

# Añadir archivos nuevos
git add .github/workflows/deploy.yml
git add docker-compose.prod.yml
git add .gitignore
git add .env.example

# Commit
git commit -m "Add Azure deployment with GitHub Actions"

# Push a main
git push origin main
```

### Paso 2: Verificar GitHub Actions

1. Ve a tu repositorio en GitHub
2. Haz clic en la pestaña **"Actions"**
3. Deberías ver un workflow corriendo: **"Deploy to Azure VM"**
4. Haz clic en el workflow para ver el progreso en tiempo real

**Fases del workflow:**

1. ✅ **Build-and-push (Matriz 6x):**
   - Construye imágenes Docker de cada servicio
   - Las sube a GitHub Container Registry (ghcr.io)
   - Tiempo: ~10-15 minutos

2. ✅ **Deploy:**
   - Conecta por SSH a tu VM en Azure
   - Descarga `docker-compose.prod.yml`
   - Crea archivo `.env` con secrets
   - Hace login en ghcr.io
   - Descarga las imágenes
   - Lanza los contenedores
   - Tiempo: ~3-5 minutos

**Total: ~15-20 minutos** para el primer despliegue.

### Paso 3: Monitorear el Despliegue en la VM

Mientras GitHub Actions trabaja, puedes conectarte a la VM para ver el proceso:

```bash
# Conectar por SSH
ssh -i ticketapp-vm-key.pem azureuser@TU_IP_PUBLICA

# Ver logs de Docker Compose
cd ~/ticketapp
docker compose logs -f

# Ver estado de contenedores
docker ps

# Deberías ver 7 contenedores corriendo:
# - mongo
# - userservice
# - ticketservice
# - eventservice
# - locationservice
# - gateway
# - frontend
```

---

## ✅ Verificar el Despliegue

### 1. Verificar Contenedores

```bash
# En la VM
docker ps

# Debe mostrar 7 contenedores con estado "Up"
```

### 2. Verificar API Gateway

**Desde tu navegador:**

```
http://TU_IP_PUBLICA:8000/health
```

Deberías ver:
```json
{"status": "OK"}
```

### 3. Verificar Frontend

**Desde tu navegador:**

```
http://TU_IP_PUBLICA
```

Deberías ver la aplicación TicketApp funcionando.

### 4. Probar Funcionalidades

1. **Registro de Usuario:**
   - Ve a la página de registro
   - Crea una cuenta nueva
   - Verifica que se guarda en MongoDB

2. **Login:**
   - Inicia sesión con el usuario creado
   - Verifica que obtienes un token JWT

3. **Ver Eventos:**
   - Navega a la lista de eventos
   - Verifica que se cargan desde el backend

4. **Comprar Ticket (si tienes eventos):**
   - Selecciona un evento
   - Elige asientos
   - Completa el proceso de compra

---

## 📊 Monitoreo y Mantenimiento

### Ver Logs de los Servicios

```bash
# Conectar a la VM
ssh -i ticketapp-vm-key.pem azureuser@TU_IP_PUBLICA

# Ver logs de todos los servicios
cd ~/ticketapp
docker compose logs

# Ver logs de un servicio específico
docker compose logs frontend
docker compose logs gateway
docker compose logs userservice

# Ver logs en tiempo real
docker compose logs -f

# Ver últimas 100 líneas
docker compose logs --tail=100
```

### Reiniciar Servicios

```bash
# Reiniciar todos los servicios
docker compose restart

# Reiniciar un servicio específico
docker compose restart frontend
docker compose restart gateway
```

### Actualizar la Aplicación

Simplemente haz push a la rama `main`:

```bash
# En tu computadora local
git add .
git commit -m "Update feature X"
git push origin main

# GitHub Actions desplegará automáticamente
```

### Hacer Rollback

Si algo sale mal, puedes volver a una versión anterior:

```bash
# En la VM
cd ~/ticketapp

# Ver imágenes disponibles
docker images | grep ticketapp

# Editar docker-compose.yml y cambiar el tag de la imagen
# De: image: ghcr.io/usuario/ticketapp-frontend:latest
# A: image: ghcr.io/usuario/ticketapp-frontend:main-abc123 (commit SHA anterior)

# Relanzar
docker compose down
docker compose up -d
```

### Backup de MongoDB

```bash
# En la VM
# Crear backup
docker exec mongo mongodump --out /data/backup

# Copiar backup a la VM
docker cp mongo:/data/backup ~/mongodb-backup-$(date +%Y%m%d)

# Restaurar backup (si es necesario)
docker exec -i mongo mongorestore /data/backup
```

---

## 🔧 Solución de Problemas

### Problema 1: GitHub Actions falla en "Build and push"

**Síntoma:**
```
Error: denied: permission_denied: write_package
```

**Solución:**

1. Ve a **Settings → Actions → General**
2. En **"Workflow permissions"**, selecciona:
   - ✅ **"Read and write permissions"**
3. Guarda cambios
4. Re-ejecuta el workflow

---

### Problema 2: No se puede conectar por SSH desde GitHub Actions

**Síntoma:**
```
ssh: connect to host X.X.X.X port 22: Connection refused
```

**Solución:**

1. Verifica que la VM esté encendida en Azure Portal
2. Verifica que el puerto 22 esté abierto en el NSG
3. Verifica que `AZURE_VM_SSH_KEY` tenga el formato correcto (con saltos de línea)

---

### Problema 3: Contenedores no inician

**Síntoma:**
```
docker ps
# No muestra contenedores
```

**Solución:**

```bash
# Ver logs de error
docker compose logs

# Verificar variables de entorno
cat .env

# Verificar que las imágenes se descargaron
docker images | grep ticketapp

# Reintentar
docker compose down
docker compose pull
docker compose up -d
```

---

### Problema 4: Frontend no se conecta al backend

**Síntoma:**
El frontend carga pero no muestra datos, consola del navegador muestra errores CORS o 404.

**Solución:**

1. Verifica que `REACT_APP_API_ENDPOINT` esté correcto en los secrets de GitHub:
   ```
   http://TU_IP_PUBLICA:8000
   ```

2. Verifica que el gateway esté corriendo:
   ```bash
   docker ps | grep gateway
   ```

3. Verifica que el puerto 8000 esté abierto:
   ```bash
   sudo ufw status | grep 8000
   curl http://localhost:8000/health
   ```

---

### Problema 5: MongoDB sin datos

**Síntoma:**
Los eventos o usuarios no aparecen.

**Solución:**

```bash
# Conectar a MongoDB
docker exec -it mongo mongosh

# Listar bases de datos
show dbs

# Seleccionar base de datos
use eventdb

# Ver colecciones
show collections

# Ver documentos
db.events.find()

# Salir
exit
```

Si no hay datos, es posible que necesites insertar datos de prueba o migrar datos existentes.

---

## 💰 Costos y Free Tier

### Azure for Students

- **Crédito:** $100 USD durante 12 meses
- **VM B2s:** GRATIS durante 12 meses (750 horas/mes)
- **Almacenamiento:** 64 GB GRATIS
- **Transferencia de datos:** 15 GB salida/mes GRATIS

### Después de 12 meses

Si tu crédito expira o se agota:

- **VM B2s:** ~$30 USD/mes
- **Almacenamiento:** ~$5 USD/mes
- **Transferencia:** ~$0.05 USD/GB

**Total estimado:** $35-40 USD/mes

### Optimización de Costos

1. **Apagar la VM cuando no la uses:**
   ```bash
   # Desde Azure Portal o CLI
   az vm deallocate --resource-group ticketapp-rg --name ticketapp-vm
   ```

2. **Usar VM más pequeña (B1s):**
   - 1 vCPU, 1 GB RAM
   - Más lenta pero gratuita durante 12 meses

---

## 🎉 ¡Listo!

Tu aplicación TicketApp está ahora:

- ✅ Desplegada en Azure VM (GRATIS durante 12 meses)
- ✅ Con despliegue automático desde GitHub
- ✅ Accesible mediante URL pública
- ✅ Con MongoDB persistente
- ✅ Con SSL/TLS configurado (si añades dominio)

**URLs de tu aplicación:**

- **Frontend:** `http://TU_IP_PUBLICA`
- **API Gateway:** `http://TU_IP_PUBLICA:8000`
- **Health Check:** `http://TU_IP_PUBLICA:8000/health`

---

## 📚 Recursos Adicionales

- [Documentación de Azure for Students](https://azure.microsoft.com/es-es/free/students/)
- [Documentación de GitHub Actions](https://docs.github.com/es/actions)
- [Documentación de Docker Compose](https://docs.docker.com/compose/)
- [Documentación de MongoDB](https://www.mongodb.com/docs/)

---

## 🤝 Soporte

Si encuentras problemas:

1. Revisa los logs de GitHub Actions
2. Revisa los logs de Docker en la VM
3. Consulta la sección de Solución de Problemas
4. Abre un issue en el repositorio

---

**¡Disfruta de tu aplicación en producción!** 🚀
