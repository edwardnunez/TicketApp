# 📚 Índice de Documentación - Pruebas de Rendimiento JMeter

## Resumen Ejecutivo

Esta carpeta contiene todo lo necesario para ejecutar pruebas de rendimiento en TicketApp usando Apache JMeter. Los archivos están organizados para facilitar tanto el uso rápido como el aprendizaje profundo.

---

## 📖 Guías de Documentación

### 🚀 Para Principiantes

**1. [QUICKSTART.md](QUICKSTART.md)** - ⏱️ 5 minutos
```
Lo más básico para empezar:
- Instalación de JMeter
- Primera prueba en 5 minutos
- Ver resultados básicos
- Troubleshooting común

👉 EMPIEZA AQUÍ si es tu primera vez
```

**2. [README.md](README.md)** - ⏱️ 20 minutos
```
Guía completa:
- Configuración detallada
- Tipos de pruebas
- Interpretación de resultados
- Mejores prácticas
- Integración CI/CD

👉 Lee después de completar QuickStart
```

### 📊 Para Análisis

**3. [ANALYZING_RESULTS.md](ANALYZING_RESULTS.md)** - ⏱️ 30 minutos
```
Cómo interpretar los datos:
- Métricas principales explicadas
- Objetivos de rendimiento
- Detectar problemas
- Casos de estudio reales
- Herramientas complementarias

👉 Para entender QUÉ significan los números
```

**4. [test-scenarios.md](test-scenarios.md)** - ⏱️ 40 minutos
```
Escenarios de prueba detallados:
- Casos de uso realistas
- Configuraciones específicas
- Pruebas de estrés
- Casos extremos
- Combinaciones complejas

👉 Para DISEÑAR tus propias pruebas
```

---

## 🔧 Archivos Ejecutables

### Tests de JMeter

**TicketApp-Performance-Test.jmx**
```
Plan de pruebas principal de JMeter
Incluye:
- ✅ Health check
- ✅ Endpoints públicos (eventos, locations)
- ✅ Autenticación (login)
- ⚠️ Compra de tickets (deshabilitado - requiere configuración)
- ⚠️ Admin endpoints (deshabilitado - requiere token)

Uso:
  jmeter -n -t TicketApp-Performance-Test.jmx -l results.jtl
```

### Scripts de Automatización

**run-tests.bat** (Windows)
```batch
Script interactivo para Windows
Opciones:
1. Prueba Rápida
2. Prueba Completa
3. Prueba de Estrés
4. Modo GUI
5. Personalizada

Uso:
  cd jmeter
  run-tests.bat
```

**run-tests.sh** (Linux/Mac)
```bash
Script interactivo para Unix
Mismas opciones que .bat

Uso:
  cd jmeter
  chmod +x run-tests.sh
  ./run-tests.sh
```

### Integración CI/CD

**github-actions-example.yml**
```yaml
Workflow de GitHub Actions
Características:
- Ejecuta en cada PR
- Ejecuta daily a las 2 AM
- Genera reportes
- Compara con baseline
- Alerta en Slack si falla

Instalación:
  Copia a .github/workflows/performance-tests.yml
```

---

## 📁 Estructura de Directorios

```
jmeter/
│
├── 📘 Documentación
│   ├── INDEX.md                    ← Estás aquí
│   ├── QUICKSTART.md              ← Inicio rápido (5 min)
│   ├── README.md                  ← Guía completa
│   ├── ANALYZING_RESULTS.md       ← Cómo analizar
│   └── test-scenarios.md          ← Escenarios avanzados
│
├── 🔧 Archivos Ejecutables
│   ├── TicketApp-Performance-Test.jmx  ← Plan de pruebas JMeter
│   ├── run-tests.bat                    ← Script Windows
│   ├── run-tests.sh                     ← Script Linux/Mac
│   └── github-actions-example.yml       ← CI/CD template
│
├── 📊 Resultados (generados al ejecutar)
│   └── results/
│       ├── test1.jtl
│       ├── test2.jtl
│       └── ...
│
└── 📈 Reportes (generados al ejecutar)
    └── reports/
        ├── test1/
        │   ├── index.html         ← Abre este archivo
        │   ├── statistics.json
        │   └── ...
        └── test2/
```

---

## 🎯 Flujo de Trabajo Recomendado

### Primera Vez (Día 1)

```
1. Lee QUICKSTART.md                    (5 min)
2. Instala JMeter                       (5 min)
3. Ejecuta prueba básica               (2 min)
4. Revisa resultados HTML              (5 min)
   Total: ~20 minutos
```

### Aprendiendo (Día 2-3)

```
1. Lee README.md completo              (20 min)
2. Ejecuta diferentes escenarios       (30 min)
3. Experimenta con configuraciones     (30 min)
4. Lee ANALYZING_RESULTS.md            (30 min)
   Total: ~2 horas
```

### Dominando (Semana 1)

```
1. Lee test-scenarios.md               (40 min)
2. Crea tus propios escenarios         (2 horas)
3. Implementa en CI/CD                 (1 hora)
4. Documenta tus baselines             (30 min)
   Total: ~4 horas
```

### Práctica Continua

```
- Ejecuta tests antes de cada release
- Compara resultados con baseline
- Optimiza endpoints lentos
- Mantén documentación actualizada
```

---

## 📋 Checklist de Setup

### Requisitos Previos
- [ ] Java 8+ instalado (`java -version`)
- [ ] JMeter instalado (`jmeter -version`)
- [ ] Node.js instalado para los servicios
- [ ] Docker (opcional pero recomendado)
- [ ] Git para control de versiones

### Configuración Inicial
- [ ] Servicios de TicketApp corriendo
- [ ] Health endpoint responde (`curl http://localhost:8000/health`)
- [ ] Primer test ejecutado sin errores
- [ ] Reporte HTML generado exitosamente
- [ ] Scripts tienen permisos de ejecución (Linux/Mac)

### Configuración Avanzada (Opcional)
- [ ] Tokens de autenticación configurados en .jmx
- [ ] Tests autenticados habilitados
- [ ] Baseline establecido y documentado
- [ ] CI/CD pipeline configurado
- [ ] Alertas configuradas (Slack, email, etc.)

---

## 🎓 Recursos de Aprendizaje

### Nivel Básico
1. [QUICKSTART.md](QUICKSTART.md) - Tu primer test
2. [JMeter Basics Tutorial](https://jmeter.apache.org/usermanual/get-started.html)
3. HTTP Status Codes - [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

### Nivel Intermedio
1. [README.md](README.md) - Guía completa
2. [ANALYZING_RESULTS.md](ANALYZING_RESULTS.md) - Interpretación
3. [JMeter Best Practices](https://jmeter.apache.org/usermanual/best-practices.html)

### Nivel Avanzado
1. [test-scenarios.md](test-scenarios.md) - Casos complejos
2. [JMeter Functions](https://jmeter.apache.org/usermanual/functions.html)
3. [Performance Testing Guidance](https://martinfowler.com/articles/performance-testing.html)

---

## 🔍 Referencia Rápida de Comandos

### Comandos Básicos

```bash
# Ejecutar test simple
jmeter -n -t test.jmx -l results.jtl

# Ejecutar con reporte HTML
jmeter -n -t test.jmx -l results.jtl -e -o reports/

# Ejecutar con variables
jmeter -n -t test.jmx -JthreadCount=100 -JrampUp=30

# Abrir GUI
jmeter -t test.jmx

# Ver versión
jmeter -version
```

### Comandos de Verificación

```bash
# Verificar servicios
curl http://localhost:8000/health
curl http://localhost:8000/events

# Ver logs Docker
docker-compose logs gateway

# Ver estadísticas de containers
docker stats

# Verificar puertos
netstat -an | grep 8000
```

### Análisis de Resultados

```bash
# Contar errores
grep "false" results.jtl | wc -l

# Ver response times
awk -F',' '{print $2}' results.jtl | sort -n

# Calcular promedio
awk -F',' '{sum+=$2; count++} END {print sum/count}' results.jtl

# Generar reporte desde .jtl existente
jmeter -g results.jtl -o reports/
```

---

## 🐛 Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| "Command not found: jmeter" | Instala JMeter (ver QUICKSTART.md) |
| "Connection refused" | Verifica servicios: `curl http://localhost:8000/health` |
| "Out of memory" | Aumenta heap: `export JVM_ARGS="-Xmx2048m"` |
| Muchos errores 401 | Actualiza tokens en archivo .jmx |
| Slow performance | Reduce threads: `-JthreadCount=10` |
| "Port already in use" | Detén servicios anteriores: `docker-compose down` |

---

## 📞 Soporte y Contribución

### Reportar Problemas
- Abre un issue en el repositorio
- Incluye: logs, configuración, screenshots
- Especifica: OS, versión JMeter, versión Node

### Contribuir
- Mejoras a documentación: siempre bienvenidas
- Nuevos escenarios: documenta en test-scenarios.md
- Optimizaciones: con benchmarks antes/después
- Correcciones: con descripción clara

---

## 📊 Métricas Objetivo (Quick Reference)

| Endpoint | Target Avg | Target P95 | Throughput |
|----------|-----------|-----------|------------|
| GET /health | < 50ms | < 100ms | 100+ TPS |
| GET /events | < 200ms | < 400ms | 50+ TPS |
| POST /login | < 300ms | < 500ms | 20+ TPS |
| POST /tickets/purchase | < 500ms | < 1000ms | 10+ TPS |

**Error Rate:** < 1% en todos los endpoints

---

## 🗓️ Maintenance

### Actualizaciones Recomendadas

**Semanalmente:**
- [ ] Ejecutar suite de tests
- [ ] Comparar con baseline
- [ ] Documentar cambios significativos

**Mensualmente:**
- [ ] Actualizar JMeter a última versión
- [ ] Revisar y actualizar escenarios
- [ ] Actualizar objetivos de rendimiento
- [ ] Limpiar archivos de resultados antiguos

**Por Release:**
- [ ] Ejecutar tests completos
- [ ] Establecer nuevo baseline si cambios mayores
- [ ] Documentar impacto de cambios
- [ ] Actualizar CI/CD si necesario

---

## ✨ Features Destacadas

### 🎯 Incluido en este Package

- ✅ Tests pre-configurados para todos los endpoints principales
- ✅ Scripts automatizados para Windows y Linux/Mac
- ✅ Documentación completa en español
- ✅ Ejemplos de integración CI/CD
- ✅ Casos de estudio reales
- ✅ Guías de troubleshooting
- ✅ Checklist de mejores prácticas

### 🚀 Beneficios

- ⚡ Setup en menos de 5 minutos
- 📊 Reportes HTML automáticos y visuales
- 🔄 Integración CI/CD lista para usar
- 📚 Documentación exhaustiva
- 🛠️ Scripts listos para producción
- 🎓 Material educativo incluido

---

## 📝 Changelog

### Version 1.0 (2025-01-15)
- ✨ Creación inicial del package completo
- 📘 Documentación completa en español
- 🔧 Scripts de automatización
- 🎯 Plan de pruebas base
- 📊 Guías de análisis
- 🚀 Ejemplos CI/CD

---

## 📄 Licencia

Este material de pruebas es parte del proyecto TicketApp y sigue la misma licencia del proyecto principal.

---

## 👥 Créditos

Creado para el proyecto TicketApp
Documentación y scripts desarrollados en 2025

---

**¿Por dónde empezar?**

👉 Si es tu primera vez: [QUICKSTART.md](QUICKSTART.md)

👉 Para entender todo: [README.md](README.md)

👉 Para análisis profundo: [ANALYZING_RESULTS.md](ANALYZING_RESULTS.md)

👉 Para casos avanzados: [test-scenarios.md](test-scenarios.md)

---

**¡Felices pruebas de rendimiento! 🚀**
