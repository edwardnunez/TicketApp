# 🖥️ Guía de Uso de JMeter GUI - TicketApp

## 📋 Índice
- [Tests Disponibles](#tests-disponibles)
- [Cómo Abrir un Test](#cómo-abrir-un-test)
- [Cómo Ejecutar un Test](#cómo-ejecutar-un-test)
- [Cómo Ver Resultados](#cómo-ver-resultados)
- [Cómo Modificar un Test](#cómo-modificar-un-test)
- [Errores Comunes](#errores-comunes)

---

## 🎯 Tests Disponibles

### 1️⃣ Health Check Test
**Archivo:** `1-Health-Check-Test.jmx`

**¿Qué hace?**
- Verifica que el Gateway está respondiendo
- 10 usuarios virtuales
- 10 loops = 100 requests totales
- Duración: ~10 segundos

**Cuándo usarlo:**
- Primera vez que ejecutas JMeter
- Para verificar que tus servicios están corriendo
- Como prueba rápida antes de tests más complejos

---

### 2️⃣ Events Load Test
**Archivo:** `2-Events-Load-Test.jmx`

**¿Qué hace?**
- Simula usuarios navegando por eventos
- 50 usuarios virtuales
- Cada usuario: Lista eventos → Ve detalles → Ve ubicación
- 5 loops = 750 requests totales
- Duración: ~1-2 minutos

**Cuándo usarlo:**
- Probar rendimiento de endpoints públicos
- Simular tráfico normal de usuarios
- Detectar problemas de performance en queries de eventos

---

### 3️⃣ Authentication Test
**Archivo:** `3-Authentication-Test.jmx`

**¿Qué hace?**
- Prueba el sistema de login
- 20 usuarios virtuales hacen login
- Cada usuario valida su token obtenido
- 3 loops = 60 logins totales
- Duración: ~30 segundos

**Configuración requerida:**
- Usuario y contraseña válidos (ver sección "Configuración")

**Cuándo usarlo:**
- Probar el sistema de autenticación bajo carga
- Validar tiempos de respuesta de login
- Verificar que los tokens se generan correctamente

---

### 4️⃣ Ticket Purchase Concurrency Test
**Archivo:** `4-Ticket-Purchase-Concurrency-Test.jmx`

**¿Qué hace?**
- Simula compra concurrente de tickets
- 30 usuarios virtuales compran al mismo tiempo
- Verifica que no haya overselling
- 2 loops = 60 intentos de compra
- Duración: ~1 minuto

**Configuración requerida:**
- Usuario y contraseña válidos
- ID de evento real (ver sección "Configuración")

**Cuándo usarlo:**
- Probar la lógica de concurrencia
- Verificar que no se venden asientos duplicados
- Simular "flash sales" o eventos populares

---

## 🚀 Cómo Abrir un Test

### Paso 1: Abrir JMeter GUI

```bash
# Opción A: Desde PowerShell/CMD
jmeter

# Opción B: Doble click en jmeter.bat
# Ubicación: C:\Apache\apache-jmeter-5.6.2\bin\jmeter.bat
```

### Paso 2: Abrir el Test

1. En JMeter, ve a: **File > Open** (o `Ctrl + O`)
2. Navega a: `C:\Users\iyanf\OneDrive\Escritorio\ticketapp\jmeter\`
3. Selecciona el test que quieras ejecutar (ej: `1-Health-Check-Test.jmx`)
4. Click **Open**

### Paso 3: Explorar la Estructura

Verás una estructura de árbol:

```
📁 Test Plan
  📁 Thread Group (Grupo de usuarios)
    🌐 HTTP Request 1
    ⏱️ Timer
    🌐 HTTP Request 2
  📊 View Results Tree
  📊 Summary Report
  📊 Graph Results
```

---

## ▶️ Cómo Ejecutar un Test

### Antes de Ejecutar

**1. Asegúrate que tus servicios están corriendo:**

```bash
# Verificar Gateway
curl http://localhost:8000/health
# Respuesta esperada: {"status":"OK"}
```

**2. Limpia resultados anteriores:**

En JMeter: **Run > Clear All** (o `Ctrl + Shift + E`)

### Ejecutar el Test

**Método 1: Botón Start**
- Click en el botón verde **Start** (▶️) en la barra de herramientas
- O presiona `Ctrl + R`

**Método 2: Desde el menú**
- Ve a: **Run > Start**

### Durante la Ejecución

Verás:
- **Contador de threads** (usuarios activos) en la esquina superior derecha
- **Resultados en tiempo real** en los listeners (View Results Tree, Summary Report, etc.)
- **Barra de progreso** (si la has habilitado)

### Detener el Test

- Click en el botón **Stop** (⏹️) o presiona `Ctrl + .` (punto)
- **Detener inmediatamente**: **Run > Shutdown** (mata todos los threads)

---

## 📊 Cómo Ver Resultados

### 1. View Results Tree

**Dónde:** Click en "View Results Tree" en el árbol del test

**Qué muestra:**
- ✅ Cada request individual (verde = éxito, rojo = error)
- Request data (lo que enviaste)
- Response data (lo que recibiste)
- Headers, cookies, etc.

**Cómo usar:**
```
1. Click en un request en la lista
2. Ve a la pestaña "Response data"
3. Selecciona el formato apropiado:
   - Text: Para JSON
   - HTML: Para páginas web
   - JSON Path Tester: Para probar extractores
```

**⚠️ Advertencia:** NO dejes este listener habilitado en tests grandes (consume mucha memoria)

---

### 2. Summary Report

**Dónde:** Click en "Summary Report" en el árbol

**Qué muestra:**

| Columna | Significado |
|---------|-------------|
| **Label** | Nombre del request |
| **# Samples** | Cantidad de requests ejecutados |
| **Average** | Tiempo promedio de respuesta (ms) |
| **Min** | Tiempo mínimo |
| **Max** | Tiempo máximo |
| **Std. Dev.** | Desviación estándar (consistencia) |
| **Error %** | Porcentaje de errores |
| **Throughput** | Requests por segundo |
| **Received KB/sec** | Datos recibidos |
| **Avg. Bytes** | Tamaño promedio de respuesta |

**Interpretación rápida:**
```
Average < 500ms  ✅ Excelente
Average 500-1000ms  ⚠️ Aceptable
Average > 1000ms  ❌ Necesita optimización

Error % < 1%  ✅ Bueno
Error % 1-5%  ⚠️ Revisar
Error % > 5%  ❌ Problemas críticos
```

---

### 3. Aggregate Report

**Dónde:** Click en "Aggregate Report" (si está disponible)

**Similar a Summary Report pero además muestra:**
- **Median (50th percentile):** Tiempo de respuesta del 50% de usuarios
- **90th percentile:** 90% de usuarios tienen este tiempo o menos
- **95th percentile:** Objetivo típico en SLAs
- **99th percentile:** Casos extremos

**Ejemplo:**
```
GET /events
  Average: 125ms
  Median: 110ms
  90%: 200ms  ← 90% de usuarios: ≤ 200ms
  95%: 250ms  ← 95% de usuarios: ≤ 250ms
```

---

### 4. Graph Results

**Dónde:** Click en "Graph Results"

**Qué muestra:**
- Gráfico de tiempos de respuesta en tiempo real
- Líneas de promedio, mediana, throughput

**Interpretación:**
```
Línea estable (plana):  ✅ Sistema estable
Línea ascendente:       ❌ Degradación
Picos ocasionales:      ⚠️ Investigar causa
```

---

## 🔧 Cómo Modificar un Test

### Cambiar Número de Usuarios

1. Click derecho en el **Thread Group**
2. Observa el panel derecho
3. Modifica:
   - **Number of Threads (users):** Cantidad de usuarios virtuales
   - **Ramp-up period (seconds):** Tiempo para llegar a todos los usuarios
   - **Loop Count:** Cuántas veces cada usuario repite el test

**Ejemplos:**

```
Configuración 1: Prueba Rápida
- Threads: 5
- Ramp-up: 1
- Loops: 10
= 5 usuarios × 10 loops = 50 requests en ~5 segundos

Configuración 2: Carga Moderada
- Threads: 50
- Ramp-up: 10
- Loops: 20
= 50 usuarios × 20 loops = 1,000 requests en ~1 minuto

Configuración 3: Stress Test
- Threads: 200
- Ramp-up: 30
- Loops: 50
= 200 usuarios × 50 loops = 10,000 requests en ~10 minutos
```

---

### Cambiar Variables (Host, Port, etc.)

1. Click en el **Test Plan** (raíz del árbol)
2. En el panel derecho, busca **User Defined Variables**
3. Modifica los valores:

| Variable | Descripción | Valor Default |
|----------|-------------|---------------|
| GATEWAY_HOST | Host del gateway | localhost |
| GATEWAY_PORT | Puerto del gateway | 8000 |
| TEST_USERNAME | Usuario para login | testuser |
| TEST_PASSWORD | Contraseña | password123 |
| TEST_EVENT_ID | ID de evento | (debe configurarse) |

**Ejemplo:**
```
Para probar contra un servidor remoto:
  GATEWAY_HOST = ticketapp.example.com
  GATEWAY_PORT = 443
  Protocol = https (cambiar en cada HTTP Request)
```

---

### Agregar un Nuevo Request

1. Click derecho en el **Thread Group**
2. **Add > Sampler > HTTP Request**
3. Configura el nuevo request:
   - **Name:** Nombre descriptivo
   - **Server Name:** `${GATEWAY_HOST}`
   - **Port Number:** `${GATEWAY_PORT}`
   - **Protocol:** `http`
   - **Method:** GET, POST, PUT, DELETE
   - **Path:** `/api/endpoint`

**Ejemplo - Agregar GET /locations:**

```
Name: GET /locations
Server Name or IP: ${GATEWAY_HOST}
Port Number: ${GATEWAY_PORT}
Path: /locations
Method: GET
```

---

### Agregar Assertions (Validaciones)

1. Click derecho en un **HTTP Request**
2. **Add > Assertions > Response Assertion**
3. Configura:
   - **Field to Test:** Response Code, Response Data, etc.
   - **Pattern Matching Rules:** Contains, Matches, Equals
   - **Patterns to Test:** Valor esperado (ej: `200`)

**Ejemplos comunes:**

```
Assertion 1: Verificar HTTP 200
  Field: Response Code
  Pattern: 200

Assertion 2: Verificar JSON contiene "status"
  Field: Response Data (Text)
  Pattern: "status":"OK"

Assertion 3: Verificar tiempo de respuesta < 500ms
  (Usar Duration Assertion)
  Duration: 500
```

---

### Agregar Timers (Pausas)

Simulan el tiempo que un usuario real tarda en pensar/leer.

1. Click derecho en un **HTTP Request** o **Thread Group**
2. **Add > Timer > Constant Timer**
3. Configura:
   - **Thread Delay:** Tiempo en milisegundos (1000 = 1 segundo)

**Ejemplo:**
```
Usuario real navega eventos:
1. GET /events
2. [TIMER 3000ms] ← Usuario lee la lista
3. GET /events/:id
4. [TIMER 5000ms] ← Usuario decide
5. POST /tickets/purchase
```

---

## 🔑 Configuración Requerida para Tests Avanzados

### Test 3 y 4 Requieren Configuración

#### Paso 1: Crear Usuario de Prueba

```bash
# Ejecuta desde PowerShell/CMD
curl -X POST http://localhost:8000/adduser `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test",
    "surname": "User",
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Paso 2: Obtener ID de Evento (para Test 4)

**Método 1: Desde MongoDB Compass**
1. Conecta a tu MongoDB
2. Ve a la colección `events`
3. Copia el `_id` de un evento

**Método 2: Desde curl**
```bash
curl http://localhost:8000/events
# Copia el "_id" del primer evento en la respuesta
```

#### Paso 3: Configurar Variables en JMeter

1. Abre el test en JMeter
2. Click en **Test Plan**
3. Modifica **User Defined Variables**:
   - `TEST_USERNAME`: testuser
   - `TEST_PASSWORD`: password123
   - `TEST_EVENT_ID`: (pega el ID del evento)

**Ejemplo:**
```
TEST_EVENT_ID = 6786d5a2c5e8f9001a1b2c3d
```

---

## ❌ Errores Comunes

### Error 1: Connection Refused

**Síntoma:**
```
Response message: Non HTTP response message: Connection refused: connect
```

**Causa:** Los servicios no están corriendo

**Solución:**
```bash
# Verifica servicios
curl http://localhost:8000/health

# Si no responde, inicia servicios
cd C:\Users\iyanf\OneDrive\Escritorio\ticketapp
docker-compose up -d
```

---

### Error 2: HTTP 401 Unauthorized

**Síntoma:**
```
Response code: 401
Response message: Unauthorized
```

**Causa:** Token inválido o expirado

**Solución para Test 3:**
1. Verifica que el usuario existe
2. Verifica username y password en variables
3. Revisa "View Results Tree" > request "POST /login"
4. Verifica que el token se extrajo correctamente

**Solución para Test 4:**
1. Click en "setUp - Login Once"
2. Verifica que se ejecuta primero (es un SetupThreadGroup)
3. Revisa que el token se guardó en properties

---

### Error 3: HTTP 404 Not Found

**Síntoma:**
```
Response code: 404
Response message: Not Found
```

**Causa:** Endpoint incorrecto o evento no existe

**Solución:**
```
1. Verifica la URL en el HTTP Request
2. Para Test 4: Verifica que TEST_EVENT_ID es válido
3. Prueba el endpoint manualmente:
   curl http://localhost:8000/events/TU_EVENT_ID
```

---

### Error 4: All Threads Failed

**Síntoma:**
```
Error % = 100%
Todos los requests fallan
```

**Solución:**
1. Ejecuta **Run > Clear All** antes de cada test
2. Verifica servicios: `curl http://localhost:8000/health`
3. Reduce número de threads a 1 para debugging
4. Revisa "View Results Tree" para ver el error exacto

---

### Error 5: No Results Showing

**Síntoma:**
- Ejecutas el test pero no ves resultados
- Listeners vacíos

**Solución:**
1. Ejecuta **Run > Clear All** ANTES de ejecutar
2. Verifica que los listeners están al nivel correcto:
   ```
   ✅ Correcto:
   📁 Test Plan
     📁 Thread Group
       🌐 HTTP Request
     📊 Listener (fuera del Thread Group)

   ❌ Incorrecto:
   📁 Test Plan
     📁 Thread Group
       🌐 HTTP Request
       📊 Listener (dentro puede causar problemas)
   ```

---

## 💡 Tips y Trucos

### Tip 1: Ejecutar un Solo Request

Para probar un request específico sin ejecutar todo el test:

1. Click derecho en el **HTTP Request**
2. **Disable** todos los otros requests
3. Ejecuta el test
4. Re-**Enable** los otros después

### Tip 2: Ver JSON Formateado

En "View Results Tree":
1. Click en un request
2. Pestaña "Response data"
3. Selector en la parte inferior: Elige **"JSON"**
4. El JSON se mostrará formateado y con colores

### Tip 3: Copiar Configuración Entre Tests

1. Click derecho en el elemento (Thread Group, HTTP Request, etc.)
2. **Copy** (`Ctrl + C`)
3. Abre otro test
4. Click derecho donde quieras pegarlo
5. **Paste** (`Ctrl + V`)

### Tip 4: Guardar Resultados

Para guardar resultados en un archivo:

1. Click en un Listener (ej: Summary Report)
2. En el panel inferior, ve a "Filename"
3. Click en **Browse...**
4. Elige ubicación y nombre (ej: `results-2025-01-15.csv`)
5. Ejecuta el test
6. Los resultados se guardan automáticamente

### Tip 5: Comparar Resultados

Para comparar rendimiento antes/después de cambios:

```
1. Ejecuta test → Guarda resultados como "baseline.jtl"
2. Haz cambios en tu código
3. Ejecuta test → Guarda resultados como "after-changes.jtl"
4. Compara ambos archivos
```

---

## 📚 Siguientes Pasos

Una vez que domines la GUI:

1. **Aprende CLI:** Para automatizar tests
   ```bash
   jmeter -n -t test.jmx -l results.jtl
   ```

2. **Crea tus propios tests:** Combina y modifica los tests existentes

3. **Integra con CI/CD:** Ejecuta tests automáticamente en cada deploy

4. **Explora plugins:** JMeter tiene muchos plugins útiles
   - Concurrency Thread Group
   - PerfMon (monitoreo de servidor)
   - Dummy Sampler (para debugging)

---

## 🆘 Ayuda

Si tienes problemas:

1. Revisa [QUICKSTART.md](QUICKSTART.md) para configuración básica
2. Revisa [ANALYZING_RESULTS.md](ANALYZING_RESULTS.md) para interpretar resultados
3. Revisa [test-scenarios.md](test-scenarios.md) para casos avanzados

---

**¡Feliz testing! 🚀**
