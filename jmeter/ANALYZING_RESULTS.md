# Guía de Análisis de Resultados de JMeter

## Introducción

Esta guía te ayudará a interpretar los resultados de las pruebas de rendimiento y tomar decisiones basadas en datos.

---

## Métricas Principales

### 1. Response Time (Tiempo de Respuesta)

**Qué medir:**
- Average (Promedio)
- Median (Mediana)
- 90th Percentile
- 95th Percentile
- 99th Percentile
- Min/Max

**Objetivos recomendados para TicketApp:**

| Endpoint | Target Average | Target 95th | Target 99th |
|----------|---------------|-------------|-------------|
| GET /health | < 50ms | < 100ms | < 150ms |
| GET /events | < 200ms | < 400ms | < 600ms |
| GET /events/:id | < 150ms | < 300ms | < 500ms |
| POST /login | < 300ms | < 500ms | < 800ms |
| POST /tickets/purchase | < 500ms | < 1000ms | < 1500ms |
| GET /users (admin) | < 300ms | < 600ms | < 900ms |

**Ejemplo de análisis:**

```
GET /events
  Average: 125ms     ✅ (< 200ms)
  Median: 110ms      ✅
  90th: 200ms        ✅
  95th: 250ms        ✅ (< 400ms)
  99th: 350ms        ✅ (< 600ms)

Conclusión: Excelente rendimiento bajo carga normal
```

```
POST /tickets/purchase
  Average: 850ms     ⚠️ (target: 500ms)
  Median: 750ms      ⚠️
  90th: 1200ms       ⚠️
  95th: 1450ms       ⚠️
  99th: 2100ms       ❌ (> 1500ms)

Conclusión: Necesita optimización
Áreas a investigar:
  - Queries a base de datos
  - Transacciones de tickets
  - Validaciones de asientos
```

---

### 2. Throughput (Rendimiento)

**Qué es:** Número de transacciones procesadas por segundo (TPS)

**Cómo calcularlo:**
```
Throughput = Total Requests / Total Time (seconds)
```

**Objetivos:**

| Escenario | Throughput Mínimo |
|-----------|-------------------|
| Tráfico normal | 50-100 TPS |
| Hora pico | 200-300 TPS |
| Evento de alta demanda | 500+ TPS |

**Ejemplo:**

```
Test Duration: 300 seconds
Total Requests: 25,000
Throughput: 83.33 TPS

Capacidad estimada del sistema:
- Por minuto: ~5,000 requests
- Por hora: ~300,000 requests
- Por día: ~7,200,000 requests
```

---

### 3. Error Rate (Tasa de Errores)

**Fórmula:**
```
Error Rate % = (Failed Requests / Total Requests) × 100
```

**Clasificación:**

| Error Rate | Estado | Acción |
|------------|--------|--------|
| 0% | Perfecto | Mantener |
| < 0.1% | Excelente | Monitorear |
| 0.1-1% | Bueno | Investigar causa |
| 1-5% | Aceptable | Optimizar |
| 5-10% | Malo | Acción urgente |
| > 10% | Crítico | Detener deploy |

**Tipos de errores comunes:**

```
HTTP 401 - No autenticado
  Causa: Token expirado o inválido
  Solución: Implementar refresh token

HTTP 403 - Prohibido
  Causa: Usuario sin permisos
  Solución: Verificar lógica de autorización

HTTP 404 - No encontrado
  Causa: Recurso no existe
  Solución: Validar IDs en pruebas

HTTP 500 - Error del servidor
  Causa: Exception no manejada
  Solución: Revisar logs del servidor

Connection Timeout
  Causa: Servidor sobrecargado
  Solución: Aumentar recursos o optimizar código
```

---

### 4. Percentiles Explicados

**Percentil 50 (Mediana):**
- 50% de usuarios tienen este tiempo o menos
- Representa la experiencia "típica"

**Percentil 90:**
- 90% de usuarios tienen este tiempo o menos
- Útil para objetivos de rendimiento

**Percentil 95:**
- 95% de usuarios tienen este tiempo o menos
- Caso de uso común en SLAs

**Percentil 99:**
- 99% de usuarios tienen este tiempo o menos
- Captura casos extremos pero realistas

**Ejemplo visual:**

```
100 requests ordenados por tiempo de respuesta:

|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
0    10    20    30    40    50    60    70    80    90   100
          ↑           ↑                 ↑        ↑      ↑
         P25         P50              P75      P90    P95

P50 = 250ms   (50% de usuarios: ≤ 250ms)
P90 = 450ms   (90% de usuarios: ≤ 450ms)
P95 = 520ms   (95% de usuarios: ≤ 520ms)
P99 = 850ms   (99% de usuarios: ≤ 850ms)
```

---

## Análisis del Reporte HTML

### Dashboard Principal

#### 1. APDEX (Application Performance Index)

```
APDEX Score = (Satisfied + (Tolerating / 2)) / Total Samples

Satisfied: Response Time ≤ T
Tolerating: Response Time > T and ≤ 4T
Frustrated: Response Time > 4T

Donde T = umbral definido (ej: 500ms)
```

**Interpretación:**

| Score | Rating |
|-------|--------|
| 0.94-1.00 | Excelente |
| 0.85-0.93 | Bueno |
| 0.70-0.84 | Regular |
| 0.50-0.69 | Pobre |
| 0.00-0.49 | Inaceptable |

#### 2. Statistics Table

Revisa estas columnas clave:

```
Label              | Samples | Average | Min | Max | Std.Dev | Error% | Throughput
-------------------|---------|---------|-----|-----|---------|--------|------------
GET /events        | 2500    | 125ms   | 45  | 890 | 95.2    | 0.04%  | 125.5/sec
POST /login        | 400     | 280ms   | 120 | 650 | 112.3   | 0.25%  | 20.8/sec
POST /tickets/...  | 300     | 520ms   | 210 | 1850| 245.7   | 2.10%  | 15.2/sec
```

**Análisis:**
- ✅ GET /events: Excelente consistencia (bajo Std.Dev)
- ⚠️ POST /login: Aceptable pero mejorable
- ❌ POST /tickets/purchase: Alta variabilidad y error rate

#### 3. Response Times Over Time

**Qué buscar:**

```
Buenos patrones:
  Time (s)     Response Time (ms)
  0-50         ▂▂▂▂▂▂▂▂▂▂
  50-100       ▂▂▂▂▂▂▂▂▂▂
  100-150      ▂▂▂▂▂▂▂▂▂▂
  Resultado: Sistema estable ✅

Patrones problemáticos:
  Time (s)     Response Time (ms)
  0-50         ▂▂▂▂▃▃▄▄▅▅
  50-100       ▅▆▆▇▇██████
  100-150      ██████████
  Resultado: Degradación progresiva ❌
  Posible causa: Memory leak, conexiones no cerradas
```

#### 4. Throughput Over Time

```
Patrón ideal (estable):
  |████████████████████|
  |████████████████████|
  |████████████████████|
  Time →

Patrón con problemas (degradación):
  |████████████████████|
  |████████████▌       |
  |██████▌             |
  Time →
```

---

## Casos de Estudio

### Caso 1: Sistema Sobrecargado

**Síntomas:**
```
Response Times: Crecen exponencialmente
Throughput: Disminuye con el tiempo
Error Rate: Aumenta (503 Service Unavailable)
Server CPU: 95-100%
```

**Diagnóstico:** Capacidad insuficiente

**Soluciones:**
1. Escalar horizontalmente (más instancias)
2. Optimizar queries lentos
3. Implementar caching
4. Aumentar recursos del servidor

### Caso 2: Memory Leak

**Síntomas:**
```
Response Times: Aumentan gradualmente
Throughput: Estable inicialmente, luego cae
Error Rate: Bajo al inicio, alto después de tiempo
Server Memory: Crece constantemente
```

**Diagnóstico:** Pérdida de memoria

**Soluciones:**
1. Revisar listeners de eventos no removidos
2. Verificar conexiones DB no cerradas
3. Analizar con profiler (heap dump)
4. Implementar circuit breakers

### Caso 3: Database Bottleneck

**Síntomas:**
```
Response Times: Altos en endpoints con DB
Throughput: Limitado
Error Rate: Bajo
Server CPU: 20-40% (bajo)
Database CPU: 90-100% (alto)
```

**Diagnóstico:** Base de datos es el cuello de botella

**Soluciones:**
1. Agregar índices
2. Optimizar queries (EXPLAIN ANALYZE)
3. Implementar connection pooling
4. Considerar read replicas
5. Implementar caching (Redis)

### Caso 4: Punto de Contención

**Síntomas:**
```
Response Times: Altos solo en un endpoint
Throughput: Normal en otros endpoints
Error Rate: Ocasionales timeouts
Server: Recursos normales
```

**Diagnóstico:** Lock contention o recurso compartido

**Soluciones:**
1. Revisar transacciones de DB
2. Implementar optimistic locking
3. Reducir scope de locks
4. Usar queue system para operaciones pesadas

---

## Checklist de Análisis

### Pre-Producción

- [ ] Response time promedio < target
- [ ] 95th percentile < target × 2
- [ ] Error rate < 1%
- [ ] Throughput > demanda esperada × 1.5
- [ ] Sistema estable durante 30+ minutos
- [ ] Sin memory leaks visibles
- [ ] CPU < 70% bajo carga máxima
- [ ] Database connections estables

### Monitoreo Continuo

- [ ] Establecer baseline después de cada deploy
- [ ] Alertas para degradación > 20%
- [ ] Pruebas semanales automatizadas
- [ ] Revisión mensual de tendencias
- [ ] Comparación pre/post cambios

---

## Herramientas Complementarias

### 1. Monitoring en Tiempo Real

```bash
# htop - CPU/Memory
htop

# iostat - Disk I/O
iostat -x 1

# netstat - Conexiones
netstat -an | grep ESTABLISHED | wc -l

# Docker stats
docker stats
```

### 2. Database Monitoring

```sql
-- PostgreSQL: Queries lentos
SELECT * FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- MongoDB: Current operations
db.currentOp()

-- Ver índices
db.collection.getIndexes()
```

### 3. Application Logs

```bash
# Buscar errores
grep -i error logs/app.log | tail -100

# Contar por tipo
grep -i "HTTP 5" logs/access.log | cut -d' ' -f9 | sort | uniq -c

# Response times > 1s
awk '$10 > 1000' logs/access.log
```

---

## Recomendaciones Finales

### 1. Establecer Baselines

Después de cada prueba exitosa:
```
Baseline Report:
  Date: 2025-01-15
  Version: v2.1.0
  Configuration: 4 CPU, 8GB RAM

  GET /events
    - Average: 125ms
    - P95: 250ms
    - Throughput: 125 TPS
    - Error Rate: 0.04%
```

### 2. Comparar Cambios

```
Feature: Añadir cache de Redis

Before:
  GET /events - Avg: 125ms, P95: 250ms

After:
  GET /events - Avg: 45ms, P95: 85ms

Improvement: 64% faster, 66% better P95 ✅
```

### 3. Documentar Problemas

```
Issue #123: Ticket Purchase Timeout

Test Results:
  - 30 concurrent users
  - 15% error rate
  - Average: 2.5s (target: 500ms)

Root Cause:
  - Missing index on tickets.eventId
  - N+1 query problem en seat validation

Fix Applied:
  - Added composite index
  - Implemented eager loading

New Results:
  - Error rate: 0.1%
  - Average: 420ms ✅
```

---

## Recursos Adicionales

- [JMeter Best Practices](https://jmeter.apache.org/usermanual/best-practices.html)
- [Google SRE Book - Monitoring](https://sre.google/sre-book/monitoring-distributed-systems/)
- [Performance Testing Guidance](https://martinfowler.com/articles/performance-testing.html)
- [Web Performance Working Group](https://www.w3.org/webperf/)

---

**Última actualización:** 2025-01-15
