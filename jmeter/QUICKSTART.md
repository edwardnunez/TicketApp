# Quick Start - Pruebas de Rendimiento JMeter

## 🚀 Inicio Rápido (5 minutos)

### Paso 1: Instalar JMeter

**Windows (Chocolatey):**
```bash
choco install jmeter
```

**Mac (Homebrew):**
```bash
brew install jmeter
```

**Linux/Manual:**
```bash
# Descargar desde https://jmeter.apache.org/download_jmeter.cgi
wget https://archive.apache.org/dist/jmeter/binaries/apache-jmeter-5.6.2.tgz
tar -xzf apache-jmeter-5.6.2.tgz
export PATH=$PATH:$(pwd)/apache-jmeter-5.6.2/bin
```

### Paso 2: Iniciar tus servicios

```bash
# En el directorio raíz del proyecto
cd ticketapp
docker-compose up -d

# O iniciar manualmente cada servicio
cd backend/gatewayservice && npm start
```

Espera 30 segundos para que todos los servicios inicien.

### Paso 3: Verificar que funciona

```bash
curl http://localhost:8000/health
# Respuesta esperada: {"status":"OK"}
```

### Paso 4: Ejecutar primera prueba

**Opción A - Script automatizado (Recomendado):**

```bash
# Windows
cd jmeter
run-tests.bat

# Linux/Mac
cd jmeter
./run-tests.sh
```

**Opción B - Comando directo:**

```bash
cd jmeter
jmeter -n -t TicketApp-Performance-Test.jmx \
  -l results/test1.jtl \
  -e -o reports/test1/
```

### Paso 5: Ver resultados

Los resultados se generan automáticamente en HTML:

```bash
# Windows
start reports/test1/index.html

# Mac
open reports/test1/index.html

# Linux
xdg-open reports/test1/index.html
```

---

## 📊 Primeros Resultados - Qué Mirar

### 1. Dashboard Principal

Abre `reports/test1/index.html` y busca:

**Statistics Table:**
```
Label         Samples  Average  Error%  Throughput
/health       100      45ms     0.00%   50.0/sec    ✅ Excelente
/events       2500     125ms    0.04%   125.5/sec   ✅ Bueno
/login        400      280ms    0.25%   20.8/sec    ⚠️ Aceptable
```

**APDEX Score:**
- Verde (> 0.85): ✅ Todo bien
- Amarillo (0.70-0.85): ⚠️ Mejorable
- Rojo (< 0.70): ❌ Problemas

### 2. Gráficos Importantes

**Response Times Over Time:**
- Línea plana = Sistema estable ✅
- Línea ascendente = Degradación ❌

**Throughput Over Time:**
- Constante = Capacidad suficiente ✅
- Decreciente = Sobrecarga ❌

---

## 🎯 Escenarios Comunes

### Prueba Rápida (1 minuto)

```bash
jmeter -n -t TicketApp-Performance-Test.jmx \
  -l results/quick.jtl
```

### Prueba de Carga (5 minutos)

```bash
jmeter -n -t TicketApp-Performance-Test.jmx \
  -JthreadCount=100 \
  -JrampUp=30 \
  -l results/load.jtl \
  -e -o reports/load/
```

### Prueba de Estrés (10 minutos)

```bash
jmeter -n -t TicketApp-Performance-Test.jmx \
  -JthreadCount=500 \
  -JrampUp=60 \
  -Jduration=600 \
  -l results/stress.jtl \
  -e -o reports/stress/
```

---

## 🔧 Configuración Avanzada

### Obtener Tokens para Pruebas Autenticadas

**1. Crear usuario de prueba:**
```bash
curl -X POST http://localhost:8000/adduser \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "surname": "User",
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**2. Login y obtener token:**
```bash
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'

# Copia el token de la respuesta
```

**3. Actualizar archivo JMeter:**

Abre `TicketApp-Performance-Test.jmx` y busca:
```xml
<stringProp name="Argument.value">YOUR_USER_TOKEN_HERE</stringProp>
```

Reemplaza con tu token real.

**4. Habilitar pruebas autenticadas:**

En JMeter GUI o editando el XML, cambia:
```xml
<ThreadGroup testname="4. Authenticated - Ticket Purchase" enabled="false">
```
a:
```xml
<ThreadGroup testname="4. Authenticated - Ticket Purchase" enabled="true">
```

---

## 📁 Estructura de Archivos

```
jmeter/
├── TicketApp-Performance-Test.jmx  # Plan de pruebas principal
├── README.md                        # Guía completa
├── QUICKSTART.md                    # Esta guía
├── ANALYZING_RESULTS.md             # Cómo analizar resultados
├── test-scenarios.md                # Escenarios de prueba
├── run-tests.bat                    # Script Windows
├── run-tests.sh                     # Script Linux/Mac
├── results/                         # Archivos .jtl generados
└── reports/                         # Reportes HTML generados
```

---

## ❓ Troubleshooting Rápido

### "Command not found: jmeter"

```bash
# Verifica instalación
which jmeter   # Linux/Mac
where jmeter   # Windows

# Si no está instalado, instala según Paso 1
```

### "Connection refused" al ejecutar pruebas

```bash
# Verifica que el gateway está corriendo
curl http://localhost:8000/health

# Si no responde, inicia los servicios
docker-compose up -d
```

### "Out of memory" durante pruebas

```bash
# Aumenta memoria de JMeter
export JVM_ARGS="-Xms512m -Xmx2048m"  # Linux/Mac
set JVM_ARGS=-Xms512m -Xmx2048m       # Windows

# Luego ejecuta tu prueba normalmente
```

### Resultados muestran muchos errores

1. Verifica que el sistema esté funcionando:
   ```bash
   curl http://localhost:8000/events
   ```

2. Revisa logs del servidor:
   ```bash
   docker-compose logs gateway
   ```

3. Reduce la carga:
   ```bash
   jmeter -n -t TicketApp-Performance-Test.jmx \
     -JthreadCount=10 \
     -l results/debug.jtl
   ```

---

## 📚 Siguientes Pasos

Una vez que completes la prueba básica:

1. **Lee** [README.md](README.md) para entender todas las opciones
2. **Explora** [test-scenarios.md](test-scenarios.md) para casos más complejos
3. **Aprende** [ANALYZING_RESULTS.md](ANALYZING_RESULTS.md) para interpretar datos
4. **Personaliza** el archivo `.jmx` según tus necesidades

---

## 🎓 Conceptos Básicos

### Threads (Usuarios Virtuales)
Número de usuarios simultáneos que ejecutan la prueba.
- 10 threads = 10 usuarios navegando al mismo tiempo

### Ramp-up Period
Tiempo para alcanzar el número total de threads.
- 10 threads en 5 segundos = 2 nuevos usuarios por segundo

### Loop Count
Cuántas veces cada thread repite las acciones.
- 10 loops = cada usuario hace 10 veces el flujo

### Cálculo Total de Requests
```
Total Requests = Threads × Loops × Samplers

Ejemplo:
10 threads × 5 loops × 3 samplers = 150 requests totales
```

---

## ✅ Checklist Primera Prueba

- [ ] JMeter instalado y funcionando
- [ ] Servicios de TicketApp corriendo
- [ ] Health check responde OK
- [ ] Primera prueba ejecutada sin errores
- [ ] Reporte HTML generado y abierto
- [ ] Entendimiento básico de métricas

---

## 🆘 Ayuda

Si tienes problemas:

1. Revisa [README.md](README.md) sección Troubleshooting
2. Verifica logs: `docker-compose logs`
3. Revisa documentación oficial: https://jmeter.apache.org/

---

**¡Listo!** Ya tienes las pruebas de rendimiento funcionando. 🎉

Para casos de uso más avanzados, consulta los otros archivos de documentación en este directorio.
