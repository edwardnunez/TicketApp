# Guía de Pruebas de Rendimiento con JMeter para TicketApp

## Tabla de Contenidos
- [Instalación de JMeter](#instalación-de-jmeter)
- [Configuración Inicial](#configuración-inicial)
- [Ejecutar Pruebas](#ejecutar-pruebas)
- [Tipos de Pruebas](#tipos-de-pruebas)
- [Interpretación de Resultados](#interpretación-de-resultados)
- [Escenarios de Prueba Avanzados](#escenarios-de-prueba-avanzados)

---

## Instalación de JMeter

### Requisitos Previos
- **Java 8 o superior** instalado
  ```bash
  java -version
  ```

### Opción 1: Descarga Directa
1. Descargar desde: https://jmeter.apache.org/download_jmeter.cgi
2. Extraer el archivo ZIP
3. Ejecutar:
   - Windows: `bin\jmeter.bat`
   - Linux/Mac: `bin/jmeter.sh`

### Opción 2: Chocolatey (Windows)
```bash
choco install jmeter
```

### Opción 3: Homebrew (Mac)
```bash
brew install jmeter
```

---

## Configuración Inicial

### 1. Preparar el Entorno

Asegúrate de que tu aplicación esté corriendo:

#### ⚠️ IMPORTANTE: Deshabilitar Emails Durante Pruebas de Rendimiento

**Por qué es necesario:**
- Las pruebas de rendimiento generan cientos/miles de compras
- Cada compra intenta enviar un email de confirmación
- Gmail bloquea la cuenta por "Too many login attempts" (Error 454)
- Esto causa que las pruebas fallen

**Solución:**

Antes de ejecutar pruebas de rendimiento, edita el archivo `.env` en la raíz del proyecto:

```bash
# En .env, cambiar:
ENABLE_EMAILS=false
```

Luego reinicia los servicios:

```bash
# Iniciar con Docker Compose (con emails deshabilitados)
cd ticketapp
docker-compose down
docker-compose up -d

# O iniciar servicios individualmente
# Gateway
cd backend/gatewayservice && npm start

# User Service
cd backend/userservice && npm start

# Event Service
cd backend/eventservice && npm start

# Ticket Service
cd backend/ticketservice && npm start

# Location Service
cd backend/locationservice && npm start
```

### 2. Obtener Tokens de Autenticación

#### Token de Usuario:
```bash
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

#### Token de Admin:
```bash
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "adminpass"
  }'
```

Copia los tokens de las respuestas para usarlos en JMeter.

### 3. Configurar Variables en JMeter

Abre el archivo `TicketApp-Performance-Test.jmx` en JMeter y actualiza las variables:

**Variables de Conexión:**
- `GATEWAY_HOST`: localhost (o tu host)
- `GATEWAY_PORT`: 8000

**Variables de Autenticación:**
- `TEST_USERNAME`: Usuario de prueba (por defecto: `testuser`)
- `TEST_PASSWORD`: Contraseña de prueba (por defecto: `Password123`)

**Variables de Datos de Prueba (REQUERIDAS):**
- `TEST_USER_ID`: ID de un usuario existente en el sistema
- `TEST_EVENT_ID`: ID de un evento existente en el sistema

**Cómo obtener TEST_USER_ID:**
```bash
# Después de hacer login, el token contiene el userId
# O consultar directamente:
curl -X GET http://localhost:8000/users/search?username=testuser
```

**Cómo obtener TEST_EVENT_ID:**
```bash
# Listar eventos disponibles
curl -X GET http://localhost:8000/events
# Copiar el _id de cualquier evento
```

---

## Ejecutar Pruebas

### Modo GUI (Desarrollo)

```bash
# Abrir JMeter GUI
jmeter

# Luego: File > Open > TicketApp-Performance-Test.jmx
```

**Pasos:**
1. Abrir JMeter
2. Cargar el archivo `.jmx`
3. Habilitar los Thread Groups que quieres probar
4. Click en el botón verde "Start" ▶️
5. Ver resultados en tiempo real

### Modo CLI (Producción/CI/CD)

```bash
# Prueba básica
jmeter -n -t TicketApp-Performance-Test.jmx -l results.jtl

# Con reporte HTML
jmeter -n -t TicketApp-Performance-Test.jmx \
  -l results.jtl \
  -e -o reports/

# Con variables personalizadas
jmeter -n -t TicketApp-Performance-Test.jmx \
  -JGATEWAY_HOST=production.example.com \
  -JGATEWAY_PORT=443 \
  -l results.jtl
```

---

## Tipos de Pruebas

El archivo `TicketApp-Performance-Test.jmx` contiene dos tipos de escenarios de prueba:

### Comparación Rápida

| Métrica | Pruebas de Rendimiento | Pruebas de Estrés |
|---------|------------------------|-------------------|
| **Usuarios Simultáneos** | 50-100 | 1000-1500 |
| **Total de Requests** | ~6,650 | ~338,000 |
| **Objetivo** | Carga normal | Carga extrema |
| **Estado por Defecto** | ✅ Habilitadas (excepto compra) | ❌ Deshabilitadas |
| **Recursos Requeridos** | Moderados | Altos |
| **Uso Recomendado** | Testing diario | Testing de límites |
| **Asientos Dinámicos** | ✅ Sí | ✅ Sí |

### 🔵 Pruebas de Rendimiento (Carga Normal)
Simulan el uso normal de la aplicación con volúmenes de usuarios moderados. **HABILITADAS por defecto**.

#### 1. Inicio de Sesión - `[RENDIMIENTO] 1. Inicio de Sesión`
- **Usuarios:** 50
- **Ramp-up:** 10 segundos
- **Loops:** 20
- **Total requests:** 1,000
- **Endpoint:** `POST /login`
- **Propósito:** Probar sistema de autenticación bajo carga normal

#### 2. Carga de Eventos - `[RENDIMIENTO] 2. Carga de Eventos`
- **Usuarios:** 80
- **Ramp-up:** 15 segundos
- **Loops:** 30
- **Total requests:** 2,400
- **Endpoint:** `GET /events`
- **Propósito:** Simular usuarios navegando por el catálogo de eventos

#### 3. Selección de Asientos - `[RENDIMIENTO] 3. Selección de Asientos`
- **Usuarios:** 60
- **Ramp-up:** 12 segundos
- **Loops:** 25
- **Total requests:** 1,500
- **Endpoint:** `GET /tickets/occupied/:eventId`
- **Propósito:** Probar consulta de disponibilidad de asientos bajo carga normal

#### 4. Compra de Entradas - `[RENDIMIENTO] 4. Compra de Entradas`
- **Usuarios:** 40
- **Ramp-up:** 15 segundos
- **Loops:** 10
- **Total requests:** 800 (400 login + 400 compra)
- **Endpoint:** `POST /tickets/purchase`
- **Estado:** **DESHABILITADO por defecto** (puede generar muchos datos)
- **Propósito:** Probar transacciones críticas de compra bajo carga normal

**⚠️ IMPORTANTE: Genera Asientos Dinámicos**

Esta prueba usa **IDs de asientos únicos** por cada thread para evitar colisiones:
- IDs generados: `PERF-{threadNum}-{random}`
- Ejemplo: `PERF-1-543210`, `PERF-2-789456`, etc.
- Cada usuario compra asientos diferentes ✅

**Configuración requerida:**
1. Habilitar el Thread Group (cambiar `enabled="false"` a `enabled="true"`)
2. Configurar `TEST_USER_ID` y `TEST_EVENT_ID` en las variables
3. **Nota:** No requiere asientos específicos en el evento (se generan dinámicamente)

#### 5. Cargar Entradas de Usuario - `[RENDIMIENTO] 5. Cargar Entradas de Usuario`
- **Usuarios:** 50
- **Ramp-up:** 10 segundos
- **Loops:** 15
- **Total requests:** 750
- **Endpoint:** `GET /tickets/user/:userId/details`
- **Propósito:** Probar consulta de tickets de usuario bajo carga normal

---

### 🔴 Pruebas de Estrés (Carga Alta - 1000+ Usuarios)
Simulan momentos de máxima carga con grandes volúmenes de usuarios simultáneos. **DESHABILITADAS por defecto**.

⚠️ **ADVERTENCIA**: Estas pruebas generan una carga extremadamente alta. Asegúrate de tener recursos suficientes.

#### 1. Inicio de Sesión - `[ESTRÉS] 1. Inicio de Sesión`
- **Usuarios:** 1,000
- **Ramp-up:** 10 segundos
- **Loops:** 50
- **Total requests:** 50,000
- **Endpoint:** `POST /login`
- **Propósito:** Probar límite de autenticación bajo carga extrema

#### 2. Carga de Eventos - `[ESTRÉS] 2. Carga de Eventos`
- **Usuarios:** 1,500
- **Ramp-up:** 15 segundos
- **Loops:** 80
- **Total requests:** 120,000
- **Endpoint:** `GET /events`
- **Propósito:** Probar límite de consultas de catálogo bajo máxima carga

#### 3. Selección de Asientos - `[ESTRÉS] 3. Selección de Asientos`
- **Usuarios:** 1,200
- **Ramp-up:** 12 segundos
- **Loops:** 60
- **Total requests:** 72,000
- **Endpoint:** `GET /tickets/occupied/:eventId`
- **Propósito:** Probar disponibilidad en escenario de alta concurrencia

#### 4. Compra de Entradas - `[ESTRÉS] 4. Compra de Entradas`
- **Usuarios:** 800
- **Ramp-up:** 15 segundos
- **Loops:** 20
- **Total requests:** 32,000 (16,000 login + 16,000 compra)
- **Endpoint:** `POST /tickets/purchase`
- **Estado:** **DESHABILITADO por defecto**
- **Propósito:** Probar límite de transacciones concurrentes
- **Nota:** Usa IDs de asientos dinámicos para evitar colisiones

#### 5. Cargar Entradas de Usuario - `[ESTRÉS] 5. Cargar Entradas de Usuario`
- **Usuarios:** 1,000
- **Ramp-up:** 10 segundos
- **Loops:** 40
- **Total requests:** 40,000
- **Endpoint:** `GET /tickets/user/:userId/details`
- **Propósito:** Probar consulta de datos de usuario bajo carga extrema

**Para ejecutar las pruebas de estrés:**
1. Abrir el archivo `.jmx` en JMeter GUI
2. Deshabilitar los Thread Groups de `[RENDIMIENTO]`
3. Habilitar los Thread Groups de `[ESTRÉS]`
4. Configurar variables requeridas
5. **Aumentar memoria de JMeter** (ver sección Requisitos de Sistema)
6. Ejecutar las pruebas

#### Requisitos de Sistema para Pruebas de Estrés

Las pruebas de estrés con 1000+ usuarios requieren recursos significativos:

**JMeter (Máquina de Prueba):**
- RAM: Mínimo 4GB, Recomendado 8GB
- CPU: 4+ cores
- Configurar JVM:
  ```bash
  # Windows
  set JVM_ARGS=-Xms2g -Xmx4g -XX:MaxMetaspaceSize=256m

  # Linux/Mac
  export JVM_ARGS="-Xms2g -Xmx4g -XX:MaxMetaspaceSize=256m"
  ```

**Servidor (Sistema bajo prueba):**
- RAM: Mínimo 8GB, Recomendado 16GB
- CPU: 8+ cores
- Base de datos con suficiente capacidad
- Conexiones de red: Aumentar límites del sistema operativo

**Límites del Sistema Operativo:**
```bash
# Linux/Mac - Aumentar límite de archivos abiertos
ulimit -n 65536

# Linux - Aumentar límite de conexiones TCP
sysctl -w net.core.somaxconn=4096
sysctl -w net.ipv4.tcp_max_syn_backlog=4096
```

**Recomendaciones Importantes:**
- ⚠️ **NO ejecutar en producción** sin autorización explícita
- ⚠️ Usar modo CLI (sin GUI) para pruebas de estrés
- ⚠️ Monitorear recursos del servidor durante las pruebas
- ⚠️ Ejecutar una prueba a la vez (no todos los Thread Groups simultáneamente)
- ⚠️ Limpiar base de datos después de pruebas de compra

📘 **Para más detalles sobre pruebas de estrés, consulta:** [STRESS-TEST-GUIDE.md](STRESS-TEST-GUIDE.md)

---

## Interpretación de Resultados

### Métricas Clave

#### 1. Response Time (Tiempo de Respuesta)
- **< 100ms:** Excelente
- **100-300ms:** Bueno
- **300-1000ms:** Aceptable
- **> 1000ms:** Necesita optimización

#### 2. Throughput (Transacciones por segundo)
- Número de requests procesados por segundo
- Mayor = mejor rendimiento

#### 3. Error Rate (Tasa de Errores)
- **< 1%:** Excelente
- **1-5%:** Aceptable
- **> 5%:** Requiere investigación

#### 4. Percentiles
- **90th percentile:** 90% de requests son más rápidos que este valor
- **95th percentile:** Útil para detectar outliers
- **99th percentile:** Casos extremos

### Listeners/Visualizadores Incluidos

1. **View Results Tree:** Ver cada request individual
2. **Summary Report:** Estadísticas generales
3. **View Results in Table:** Tabla con todas las métricas
4. **Graph Results:** Gráfico de rendimiento en tiempo real

### Ejemplo de Análisis

```
Label           Samples  Average  Median  90%  95%  99%  Error%  Throughput
GET /health     100      45ms     42ms    65ms 75ms 95ms 0.00%   50.0/sec
GET /events     2500     125ms    110ms   200ms 250ms 350ms 0.04%  125.5/sec
POST /login     400      180ms    165ms   280ms 320ms 450ms 0.25%  20.8/sec
```

**Interpretación:**
- `/health` está muy rápido ✅
- `/events` tiene buen rendimiento bajo carga ✅
- `/login` podría optimizarse (>300ms en 95th percentile) ⚠️
- Error rates son aceptables ✅

---

## Escenarios de Prueba Avanzados

### 1. Prueba de Estrés Gradual

Crea un nuevo Thread Group con configuración escalonada:

```
Thread Group Name: Stress Test - Gradual Load
- Threads: 100
- Ramp-up: 60 segundos
- Duration: 300 segundos (5 minutos)
```

### 2. Prueba de Picos de Carga (Spike Test)

```
Ultimate Thread Group:
- Stage 1: 0 → 10 users en 10s (calentamiento)
- Stage 2: 10 → 100 users en 10s (pico)
- Stage 3: 100 users durante 60s (mantener)
- Stage 4: 100 → 10 users en 10s (descenso)
```

### 3. Prueba de Resistencia (Soak Test)

```
Thread Group:
- Threads: 50
- Ramp-up: 30 segundos
- Duration: 7200 segundos (2 horas)
- Objetivo: Detectar memory leaks
```

### 4. Prueba de Concurrencia en Compras

Simular muchos usuarios comprando el mismo asiento simultáneamente:

```
Thread Group Name: Concurrent Purchase Test
- Threads: 100
- Ramp-up: 1 segundo
- Loops: 1
- Request: POST /tickets/purchase con mismo seatId
- Expected: Solo 1 debería tener éxito
```

---

## Scripts de Automatización

### Script de Prueba Completa (Windows)

```batch
@echo off
echo "=== TicketApp Performance Test ==="
echo.

echo "1. Verificando servicios..."
curl -s http://localhost:8000/health
if %ERRORLEVEL% neq 0 (
    echo "ERROR: Gateway no está respondiendo"
    exit /b 1
)

echo "2. Ejecutando pruebas..."
jmeter -n -t TicketApp-Performance-Test.jmx ^
    -l results-%date:~-4,4%%date:~-10,2%%date:~-7,2%.jtl ^
    -e -o reports-%date:~-4,4%%date:~-10,2%%date:~-7,2%/

echo "3. Pruebas completadas. Revisa: reports-%date:~-4,4%%date:~-10,2%%date:~-7,2%/index.html"
```

### Script de Prueba Completa (Linux/Mac)

```bash
#!/bin/bash
echo "=== TicketApp Performance Test ==="
echo ""

echo "1. Verificando servicios..."
if ! curl -s http://localhost:8000/health > /dev/null; then
    echo "ERROR: Gateway no está respondiendo"
    exit 1
fi

echo "2. Ejecutando pruebas..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
jmeter -n -t TicketApp-Performance-Test.jmx \
    -l results_${TIMESTAMP}.jtl \
    -e -o reports_${TIMESTAMP}/

echo "3. Pruebas completadas. Revisa: reports_${TIMESTAMP}/index.html"
```

---

## Mejores Prácticas

### ✅ DO (Hacer)
- Ejecutar pruebas en entorno similar a producción
- Empezar con cargas pequeñas y aumentar gradualmente
- Monitorear recursos del servidor (CPU, memoria, red)
- Ejecutar múltiples iteraciones para validar resultados
- Documentar configuración y resultados

### ❌ DON'T (No Hacer)
- Ejecutar pruebas contra producción sin autorización
- Usar GUI mode para pruebas grandes (usa CLI)
- Ignorar errores en los resultados
- Probar sin tener datos baseline
- Hacer cambios múltiples entre pruebas

---

## Integración con CI/CD

### GitHub Actions Example

```yaml
name: Performance Tests

on:
  pull_request:
    branches: [ main ]

jobs:
  performance-test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Setup Java
      uses: actions/setup-java@v2
      with:
        java-version: '11'

    - name: Install JMeter
      run: |
        wget https://archive.apache.org/dist/jmeter/binaries/apache-jmeter-5.6.2.tgz
        tar -xzf apache-jmeter-5.6.2.tgz

    - name: Start Services
      run: docker-compose up -d

    - name: Wait for Services
      run: sleep 30

    - name: Run Performance Tests
      run: |
        apache-jmeter-5.6.2/bin/jmeter -n \
          -t jmeter/TicketApp-Performance-Test.jmx \
          -l results.jtl \
          -e -o reports/

    - name: Upload Results
      uses: actions/upload-artifact@v2
      with:
        name: jmeter-results
        path: reports/
```

---

## Troubleshooting

### Problema: "Error enviando email: Too many login attempts" (Error 454)

**Síntomas:**
```
ticketservice | Error enviando email de confirmación: Error: Invalid login: 454-4.7.0 Too many login attempts
ticketservice | responseCode: 454
ticketservice | code: 'EAUTH'
```

**Causa:** Las pruebas de rendimiento generan muchos intentos de envío de email y Gmail bloquea la cuenta temporalmente.

**Solución Inmediata:**

1. **Deshabilitar el envío de emails** editando [.env](../.env):
   ```bash
   # Cambiar en .env
   ENABLE_EMAILS=false
   ```

2. **Reiniciar los servicios:**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

3. **Verificar que el cambio se aplicó:**
   ```bash
   docker logs ticketservice
   # Deberías ver: "⚠️  Envío de emails deshabilitado (ENABLE_EMAILS=false)"
   ```

4. **Ejecutar las pruebas nuevamente**

**Para volver a habilitar emails después de las pruebas:**
```bash
# En .env
ENABLE_EMAILS=true

# Reiniciar servicios
docker-compose restart ticketservice
```

**Prevención:**
- **SIEMPRE** deshabilitar emails antes de ejecutar pruebas de rendimiento/estrés
- Usar `ENABLE_EMAILS=false` en entornos de testing
- Solo habilitar emails en producción

---

### Problema: "Connection Refused"
**Solución:** Verifica que todos los servicios estén corriendo
```bash
docker-compose ps
curl http://localhost:8000/health
```

### Problema: "Timeout Errors"
**Solución:** Aumenta el timeout en JMeter
- Click derecho en HTTP Request > Add > Timer > Constant Timer
- Set delay to 3000ms

### Problema: "Out of Memory"
**Solución:** Aumenta memoria de JMeter
```bash
# Windows
set JVM_ARGS=-Xms512m -Xmx2048m
jmeter -n -t test.jmx ...

# Linux/Mac
export JVM_ARGS="-Xms512m -Xmx2048m"
jmeter -n -t test.jmx ...
```

### Problema: "Too Many Open Files"
**Solución (Linux/Mac):**
```bash
ulimit -n 10000
```

---

## Recursos Adicionales

- [JMeter Documentation](https://jmeter.apache.org/usermanual/index.html)
- [JMeter Best Practices](https://jmeter.apache.org/usermanual/best-practices.html)
- [Performance Testing Guide](https://martinfowler.com/articles/performance-testing.html)

---

## Contacto y Soporte

Para preguntas sobre estas pruebas, contacta al equipo de QA o revisa la documentación del proyecto.
