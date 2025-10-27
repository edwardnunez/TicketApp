#!/bin/bash

###################################################################
# Script de Pruebas de Rendimiento con JMeter para TicketApp
###################################################################

set -e

echo ""
echo "====================================================="
echo "     TicketApp - Performance Testing Suite"
echo "====================================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar comandos
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}[ERROR]${NC} $1 no está instalado"
        echo ""
        if [ "$1" == "jmeter" ]; then
            echo "Instala JMeter desde: https://jmeter.apache.org/download_jmeter.cgi"
            echo "O con Homebrew: brew install jmeter"
        elif [ "$1" == "java" ]; then
            echo "Instala Java 8 o superior"
        fi
        exit 1
    fi
}

# Verificar JMeter y Java
check_command jmeter
check_command java
echo -e "${GREEN}[OK]${NC} JMeter y Java detectados"
echo ""

# Verificar servicios
echo "Verificando conectividad con el Gateway..."
if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${RED}[ERROR]${NC} Gateway no está respondiendo en http://localhost:8000"
    echo ""
    echo "Por favor inicia los servicios con:"
    echo "  docker-compose up -d"
    echo ""
    exit 1
fi

echo -e "${GREEN}[OK]${NC} Gateway está respondiendo"
echo ""

# Crear directorios
mkdir -p results reports

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Menú
echo "====================================================="
echo "Selecciona el tipo de prueba:"
echo "====================================================="
echo ""
echo "1. Prueba Rápida (Health Check + Public Endpoints)"
echo "2. Prueba Completa (Todas las pruebas habilitadas)"
echo "3. Prueba de Estrés (Alta carga)"
echo "4. Modo Interactivo (Abrir JMeter GUI)"
echo "5. Prueba Personalizada"
echo ""
read -p "Selecciona una opción (1-5): " CHOICE

case $CHOICE in
    1)
        echo ""
        echo "Ejecutando prueba rápida..."
        jmeter -n -t TicketApp-Performance-Test.jmx \
            -l results/quick_${TIMESTAMP}.jtl \
            -e -o reports/quick_${TIMESTAMP}/
        REPORT_DIR="quick_${TIMESTAMP}"
        ;;
    2)
        echo ""
        echo "Ejecutando prueba completa..."
        echo "NOTA: Asegúrate de tener tokens válidos en el archivo .jmx"
        read -p "Presiona Enter para continuar..."
        jmeter -n -t TicketApp-Performance-Test.jmx \
            -l results/full_${TIMESTAMP}.jtl \
            -e -o reports/full_${TIMESTAMP}/
        REPORT_DIR="full_${TIMESTAMP}"
        ;;
    3)
        echo ""
        echo -e "${YELLOW}[ADVERTENCIA]${NC} Esta prueba generará alta carga en el sistema"
        read -p "¿Continuar? (s/N): " CONFIRM
        if [[ ! "$CONFIRM" =~ ^[Ss]$ ]]; then
            echo "Prueba cancelada"
            exit 0
        fi
        jmeter -n -t TicketApp-Performance-Test.jmx \
            -JthreadCount=200 \
            -JrampUp=30 \
            -Jduration=600 \
            -l results/stress_${TIMESTAMP}.jtl \
            -e -o reports/stress_${TIMESTAMP}/
        REPORT_DIR="stress_${TIMESTAMP}"
        ;;
    4)
        echo ""
        echo "Abriendo JMeter GUI..."
        jmeter -t TicketApp-Performance-Test.jmx &
        echo ""
        echo "JMeter GUI iniciado en background"
        exit 0
        ;;
    5)
        echo ""
        echo "Configuración personalizada:"
        echo ""
        read -p "Número de usuarios (threads): " THREADS
        read -p "Tiempo de ramp-up en segundos: " RAMPUP
        read -p "Número de loops: " LOOPS
        echo ""
        echo "Ejecutando con configuración personalizada..."
        jmeter -n -t TicketApp-Performance-Test.jmx \
            -JthreadCount=${THREADS} \
            -JrampUp=${RAMPUP} \
            -Jloops=${LOOPS} \
            -l results/custom_${TIMESTAMP}.jtl \
            -e -o reports/custom_${TIMESTAMP}/
        REPORT_DIR="custom_${TIMESTAMP}"
        ;;
    *)
        echo -e "${RED}Opción inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo "====================================================="
echo "           Pruebas Completadas"
echo "====================================================="
echo ""
echo "Resultados guardados en:"
echo "  - Datos raw: results/${REPORT_DIR}.jtl"
echo "  - Reporte HTML: reports/${REPORT_DIR}/index.html"
echo ""

# Abrir reporte en navegador (intenta diferentes comandos según el OS)
if command -v xdg-open &> /dev/null; then
    echo "Abriendo reporte en el navegador..."
    xdg-open "reports/${REPORT_DIR}/index.html" &
elif command -v open &> /dev/null; then
    echo "Abriendo reporte en el navegador..."
    open "reports/${REPORT_DIR}/index.html" &
else
    echo "Abre manualmente el reporte en:"
    echo "  $(pwd)/reports/${REPORT_DIR}/index.html"
fi

echo ""
echo -e "${GREEN}✓ Proceso completado${NC}"
echo ""
