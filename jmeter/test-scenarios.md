# Escenarios de Pruebas de Rendimiento - TicketApp

## Tabla de Contenidos
- [Escenarios Básicos](#escenarios-básicos)
- [Escenarios Realistas](#escenarios-realistas)
- [Escenarios de Estrés](#escenarios-de-estrés)
- [Escenarios de Casos Extremos](#escenarios-de-casos-extremos)

---

## Escenarios Básicos

### 1. Health Check (Smoke Test)

**Objetivo:** Verificar que el sistema está funcionando

**Configuración:**
```
Threads: 5
Ramp-up: 1 segundo
Loops: 10
Duración total: ~5 segundos
```

**Endpoints:**
- GET /health

**Criterios de éxito:**
- 100% success rate
- Response time < 100ms

**Uso:**
```bash
jmeter -n -t TicketApp-Performance-Test.jmx \
  -JthreadCount=5 \
  -JrampUp=1 \
  -Jloops=10 \
  -l results/smoke.jtl
```

---

### 2. Carga Normal (Load Test)

**Objetivo:** Simular tráfico típico de un día normal

**Configuración:**
```
Threads: 50
Ramp-up: 30 segundos
Duration: 300 segundos (5 minutos)
```

**Mix de endpoints:**
- 60% - GET /events (usuarios navegando)
- 20% - GET /events/:id (viendo detalles)
- 10% - POST /login (iniciando sesión)
- 8% - GET /locations (explorando lugares)
- 2% - POST /tickets/purchase (comprando)

**Criterios de éxito:**
- Error rate < 1%
- Average response time < 500ms
- P95 < 1000ms

---

### 3. Hora Pico (Peak Load Test)

**Objetivo:** Simular tráfico de hora punta

**Configuración:**
```
Threads: 200
Ramp-up: 60 segundos
Duration: 600 segundos (10 minutos)
```

**Patrón de carga:**
```
0-60s:   0 → 200 users (ramp up)
60-540s: 200 users constante
540-600s: 200 → 0 users (ramp down)
```

**Criterios de éxito:**
- Error rate < 3%
- Average response time < 800ms
- System remains stable

---

## Escenarios Realistas

### 4. Venta de Evento Popular (Flash Sale)

**Objetivo:** Simular lanzamiento de evento muy demandado

**Escenario:**
"Concierto de artista famoso sale a la venta. Miles de usuarios intentan comprar al mismo tiempo."

**Configuración:**
```
Phase 1 - Pre-sale (usuarios esperando):
  Threads: 500
  Ramp-up: 30 segundos
  Action: GET /events/:id cada 5 segundos

Phase 2 - Sale starts (todos compran simultáneamente):
  Threads: 500
  Ramp-up: 10 segundos
  Action: POST /tickets/purchase

Phase 3 - After rush (tráfico normal):
  Threads: 100
  Duration: 300 segundos
  Actions: Mixed
```

**Test en JMeter:**
```xml
<ThreadGroup>
  <name>Flash Sale Scenario</name>
  <num_threads>500</num_threads>
  <ramp_time>10</ramp_time>

  <!-- Todos intentan comprar el mismo evento -->
  <HTTPSampler>
    <path>/tickets/purchase</path>
    <body>
    {
      "eventId": "${EVENT_ID}",
      "seats": ["${RANDOM_SEAT}"]
    }
    </body>
  </HTTPSampler>
</ThreadGroup>
```

**Criterios de éxito:**
- Sistema no se cae
- Tickets vendidos = asientos disponibles (sin overselling)
- Error rate por concurrencia < 5%
- Usuarios rechazan correctamente después de sold out

**Métricas esperadas:**
```
Asientos disponibles: 1000
Requests concurrentes: 5000
Tickets vendidos exitosamente: 1000
Requests rechazados (sold out): 4000
Error rate: 0% (rechazos son esperados, no errores)
```

---

### 5. Usuario Típico - Journey Completo

**Objetivo:** Simular el comportamiento real de un usuario comprando tickets

**User Journey:**
```
1. Landing → GET /events (listar eventos)
2. Wait 3s (usuario leyendo)
3. View Event → GET /events/:id (ver detalles)
4. Wait 5s (usuario decidiendo)
5. View Locations → GET /locations/:id (ver mapa)
6. Wait 2s
7. Login → POST /login
8. Wait 1s
9. Check Seats → GET /tickets/occupied/:eventId
10. Wait 5s (seleccionando asientos)
11. Purchase → POST /tickets/purchase
12. Wait 2s
13. View Tickets → GET /tickets/user/:userId
```

**Implementación con JMeter:**
```xml
<ThreadGroup>
  <name>Typical User Journey</name>

  <!-- Step 1: Browse Events -->
  <HTTPSampler name="Browse Events"/>
  <ConstantTimer delay="3000"/>

  <!-- Step 2: View Event Details -->
  <HTTPSampler name="View Event">
    <JSONExtractor var="eventId" jsonPath="$.id"/>
  </HTTPSampler>
  <ConstantTimer delay="5000"/>

  <!-- Step 3-4: Login -->
  <HTTPSampler name="Login">
    <JSONExtractor var="token" jsonPath="$.token"/>
  </HTTPSampler>
  <ConstantTimer delay="1000"/>

  <!-- Step 5: Purchase -->
  <HTTPSampler name="Purchase Tickets">
    <HeaderManager>
      <Header name="Authorization" value="Bearer ${token}"/>
    </HeaderManager>
  </HTTPSampler>
</ThreadGroup>
```

**Configuración:**
```
Threads: 100
Ramp-up: 60 segundos
Total duration: ~30 segundos por usuario
```

---

### 6. Admin Dashboard (Heavy Data)

**Objetivo:** Probar endpoints administrativos con grandes conjuntos de datos

**Escenario:**
```
Admin revisa estadísticas:
1. GET /users (todos los usuarios)
2. GET /events/admin/statistics
3. GET /tickets/admin/statistics
4. Cada 10 segundos
```

**Configuración:**
```
Threads: 10 (pocos admins)
Ramp-up: 5 segundos
Duration: 300 segundos
```

**Criterios especiales:**
- Response time < 2 segundos
- Sin timeout errors
- Database CPU < 80%

---

## Escenarios de Estrés

### 7. Spike Test (Pico Repentino)

**Objetivo:** Verificar comportamiento ante tráfico súbito

**Patrón:**
```
0-60s:    10 users (baseline)
60-90s:   10 → 500 users (spike)
90-180s:  500 users (sustained)
180-210s: 500 → 10 users (recovery)
210-300s: 10 users (verify recovery)
```

**Uso:**
```bash
# Requiere Ultimate Thread Group Plugin
jmeter -n -t spike-test.jmx -l results/spike.jtl
```

**Qué observar:**
- ¿Sistema maneja el spike?
- ¿Se recupera después del spike?
- ¿Hay memory leaks?

---

### 8. Stress Test (Romper el Sistema)

**Objetivo:** Encontrar el límite del sistema

**Configuración:**
```
Incremento gradual:
Step 1: 50 users × 5 min
Step 2: 100 users × 5 min
Step 3: 200 users × 5 min
Step 4: 500 users × 5 min
Step 5: 1000 users × 5 min
...continuar hasta que el sistema falle
```

**Criterios de finalización:**
- Error rate > 50%
- Response time > 10s
- Server crashes
- Database connection pool exhausted

**Resultado esperado:**
```
Sistema aguanta hasta: 750 concurrent users
Error rate comienza a subir en: 600 users
Response time > 3s en: 800 users

Conclusión: Capacidad máxima = ~500-600 users
Recomendación: Configurar auto-scaling en 400 users
```

---

### 9. Soak Test (Resistencia)

**Objetivo:** Detectar degradación a largo plazo (memory leaks, connection leaks)

**Configuración:**
```
Threads: 100 (carga moderada constante)
Duration: 7200 segundos (2 horas)
```

**Qué monitorear:**
```
Cada 10 minutos revisar:
- Heap memory usage
- Database connections
- Response times
- Error rate
- Thread count
- File descriptors
```

**Análisis:**
```
T=0min:    Memory: 500MB, RT: 200ms ✅
T=30min:   Memory: 550MB, RT: 210ms ✅
T=60min:   Memory: 650MB, RT: 220ms ⚠️
T=90min:   Memory: 800MB, RT: 280ms ⚠️
T=120min:  Memory: 1.2GB, RT: 450ms ❌

Diagnóstico: Posible memory leak
Action: Heap dump analysis, revisar event listeners
```

---

## Escenarios de Casos Extremos

### 10. Concurrency - Mismo Asiento

**Objetivo:** Verificar que no se vende el mismo asiento dos veces

**Setup:**
```
Event ID: event-123
Seat ID: A-15 (solo este asiento)
Concurrent Users: 100
```

**Test:**
```javascript
// 100 usuarios intentan comprar simultáneamente
for (i = 0; i < 100; i++) {
  POST /tickets/purchase
  Body: {
    eventId: "event-123",
    seats: ["A-15"]
  }
}

// Resultado esperado:
// - 1 request exitoso (201)
// - 99 requests rechazados (409 Conflict)
```

**Validación:**
```sql
-- Verificar en DB que solo hay 1 ticket para ese asiento
SELECT COUNT(*) FROM tickets
WHERE eventId = 'event-123' AND seatId = 'A-15';
-- Expected: 1
```

---

### 11. Large Payload Test

**Objetivo:** Probar con eventos que tienen muchos asientos

**Escenario:**
```
Crear evento con 10,000 asientos
Usuario compra 50 asientos simultáneamente
```

**Request:**
```json
POST /tickets/purchase
{
  "eventId": "large-event",
  "seats": [
    "A-1", "A-2", "A-3", ..., "A-50"
  ],
  "buyerInfo": {...},
  "paymentMethod": "credit_card"
}
```

**Métricas:**
- Request size: ~5-10KB
- Processing time: < 2s
- Database transaction: Atomic

---

### 12. API Rate Limiting Test

**Objetivo:** Verificar rate limiting funciona correctamente

**Escenario:**
```
Rate limit: 100 requests/minute por IP
Test: Enviar 150 requests en 30 segundos
```

**Expected Results:**
```
Requests 1-100: 200 OK
Requests 101-150: 429 Too Many Requests
```

---

### 13. Token Expiration Test

**Objetivo:** Manejar tokens expirados durante la compra

**Escenario:**
```
1. Usuario hace login → obtiene token (expira en 1 hora)
2. Usuario navega por 61 minutos
3. Usuario intenta comprar → token expirado
```

**Test Steps:**
```
1. Login → Extract token
2. Wait 3700 seconds (> 1 hour)
3. POST /tickets/purchase con token expirado
4. Expected: 401 Unauthorized
5. Frontend debe refrescar token automáticamente
```

---

## Combinaciones Realistas

### 14. Black Friday Scenario

**Múltiples eventos simultáneos:**
```
Evento A: 500 users comprando
Evento B: 300 users comprando
Evento C: 200 users comprando

Usuarios navegando: 1000
Admins monitoreando: 10

Total concurrent: 2010 users
Duration: 30 minutos
```

---

### 15. Post-Release Monitoring

**Después de un deploy:**
```bash
# Baseline comparison test
jmeter -n -t TicketApp-Performance-Test.jmx \
  -l results/post-deploy-$(date +%Y%m%d).jtl

# Comparar con baseline
diff results/baseline.jtl results/post-deploy-*.jtl
```

**Alertas:**
- Response time increase > 20%
- Error rate increase > 0.5%
- Throughput decrease > 15%

---

## Script de Ejemplo: Automated Regression

```bash
#!/bin/bash

# Performance regression test
echo "Running performance regression tests..."

# 1. Run tests
jmeter -n -t TicketApp-Performance-Test.jmx \
  -l results/current.jtl \
  -e -o reports/current/

# 2. Compare with baseline
python3 compare_results.py \
  --baseline results/baseline.jtl \
  --current results/current.jtl \
  --threshold 20

# 3. If regression detected, fail the build
if [ $? -ne 0 ]; then
  echo "❌ Performance regression detected!"
  exit 1
fi

echo "✅ Performance tests passed"
```

---

## Resumen de Configuraciones

| Escenario | Threads | Ramp-up | Duration | Target |
|-----------|---------|---------|----------|--------|
| Smoke | 5 | 1s | 10s | Sanity check |
| Load | 50 | 30s | 5m | Normal traffic |
| Peak | 200 | 60s | 10m | Peak hours |
| Flash Sale | 500 | 10s | 5m | High concurrency |
| Stress | 50-1000 | gradual | 30m | Find limits |
| Soak | 100 | 60s | 2h | Memory leaks |
| Spike | 10→500→10 | sudden | 5m | Recovery |

---

**Última actualización:** 2025-01-15
**Versión:** 1.0
