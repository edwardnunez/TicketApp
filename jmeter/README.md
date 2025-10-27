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

```bash
# Iniciar con Docker Compose
cd ticketapp
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

- `GATEWAY_HOST`: localhost (o tu host)
- `GATEWAY_PORT`: 8000
- `ADMIN_TOKEN`: Tu token de admin
- `USER_TOKEN`: Tu token de usuario

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

### 1. Health Check (Básica)
**Thread Group:** `1. Health Check`
- **Usuarios:** 10
- **Ramp-up:** 2 segundos
- **Loops:** 10
- **Total requests:** 100

**Propósito:** Verificar disponibilidad básica del sistema.

### 2. Carga de Eventos Públicos
**Thread Group:** `2. Public Endpoints - Events List`
- **Usuarios:** 50
- **Ramp-up:** 10 segundos
- **Loops:** 50
- **Total requests:** 2,500

**Propósito:** Simular carga de usuarios navegando por eventos.

### 3. Autenticación de Usuario
**Thread Group:** `3. User Authentication - Login`
- **Usuarios:** 20
- **Ramp-up:** 5 segundos
- **Loops:** 20
- **Total requests:** 400

**Propósito:** Probar sistema de autenticación bajo carga.

### 4. Compra de Tickets (Deshabilitado por defecto)
**Thread Group:** `4. Authenticated - Ticket Purchase`
- **Usuarios:** 30
- **Ramp-up:** 10 segundos
- **Loops:** 30

**Configuración requerida:**
1. Habilitar el Thread Group
2. Reemplazar `EVENT_ID_HERE` con un ID de evento válido
3. Configurar `USER_TOKEN` en variables

**Propósito:** Probar transacciones críticas bajo carga.

### 5. Operaciones de Admin (Deshabilitado por defecto)
**Thread Group:** `5. Admin - Get All Users`
- **Usuarios:** 5
- **Ramp-up:** 2 segundos
- **Loops:** 10

**Configuración requerida:**
1. Habilitar el Thread Group
2. Configurar `ADMIN_TOKEN` en variables

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
