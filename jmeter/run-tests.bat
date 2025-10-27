@echo off
REM ===================================================================
REM Script de Pruebas de Rendimiento con JMeter para TicketApp
REM ===================================================================

setlocal enabledelayedexpansion

echo.
echo =====================================================
echo     TicketApp - Performance Testing Suite
echo =====================================================
echo.

REM Verificar que JMeter está instalado
where jmeter >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] JMeter no está instalado o no está en el PATH
    echo.
    echo Instala JMeter desde: https://jmeter.apache.org/download_jmeter.cgi
    echo O con Chocolatey: choco install jmeter
    echo.
    pause
    exit /b 1
)

REM Verificar que Java está instalado
where java >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Java no está instalado
    echo Instala Java 8 o superior desde: https://www.oracle.com/java/technologies/downloads/
    echo.
    pause
    exit /b 1
)

echo [OK] JMeter y Java detectados
echo.

REM Verificar que los servicios están corriendo
echo Verificando conectividad con el Gateway...
curl -s http://localhost:8000/health >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Gateway no está respondiendo en http://localhost:8000
    echo.
    echo Por favor inicia los servicios con:
    echo   docker-compose up -d
    echo.
    pause
    exit /b 1
)

echo [OK] Gateway está respondiendo
echo.

REM Crear directorio para resultados si no existe
if not exist "results" mkdir results
if not exist "reports" mkdir reports

REM Obtener timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,8%_%datetime:~8,6%

echo =====================================================
echo Selecciona el tipo de prueba:
echo =====================================================
echo.
echo 1. Prueba Rapida (Health Check + Public Endpoints)
echo 2. Prueba Completa (Todas las pruebas habilitadas)
echo 3. Prueba de Estres (Alta carga)
echo 4. Modo Interactivo (Abrir JMeter GUI)
echo 5. Prueba Personalizada
echo.
set /p CHOICE="Selecciona una opcion (1-5): "

if "%CHOICE%"=="1" goto quick
if "%CHOICE%"=="2" goto full
if "%CHOICE%"=="3" goto stress
if "%CHOICE%"=="4" goto gui
if "%CHOICE%"=="5" goto custom
echo Opcion invalida
pause
exit /b 1

:quick
echo.
echo Ejecutando prueba rapida...
jmeter -n -t TicketApp-Performance-Test.jmx ^
    -l results/quick_%TIMESTAMP%.jtl ^
    -e -o reports/quick_%TIMESTAMP%/
goto end

:full
echo.
echo Ejecutando prueba completa...
echo NOTA: Asegurate de tener tokens validos en el archivo .jmx
pause
jmeter -n -t TicketApp-Performance-Test.jmx ^
    -l results/full_%TIMESTAMP%.jtl ^
    -e -o reports/full_%TIMESTAMP%/
goto end

:stress
echo.
echo Ejecutando prueba de estres...
echo ADVERTENCIA: Esta prueba generara alta carga en el sistema
set /p CONFIRM="¿Continuar? (S/N): "
if /i not "%CONFIRM%"=="S" exit /b 0

jmeter -n -t TicketApp-Performance-Test.jmx ^
    -JthreadCount=200 ^
    -JrampUp=30 ^
    -Jduration=600 ^
    -l results/stress_%TIMESTAMP%.jtl ^
    -e -o reports/stress_%TIMESTAMP%/
goto end

:gui
echo.
echo Abriendo JMeter GUI...
start jmeter -t TicketApp-Performance-Test.jmx
echo.
echo JMeter GUI iniciado. Presiona cualquier tecla para salir de este script.
pause >nul
exit /b 0

:custom
echo.
echo Configuracion personalizada:
echo.
set /p THREADS="Numero de usuarios (threads): "
set /p RAMPUP="Tiempo de ramp-up en segundos: "
set /p LOOPS="Numero de loops: "
echo.
echo Ejecutando con configuracion personalizada...
jmeter -n -t TicketApp-Performance-Test.jmx ^
    -JthreadCount=%THREADS% ^
    -JrampUp=%RAMPUP% ^
    -Jloops=%LOOPS% ^
    -l results/custom_%TIMESTAMP%.jtl ^
    -e -o reports/custom_%TIMESTAMP%/
goto end

:end
echo.
echo =====================================================
echo           Pruebas Completadas
echo =====================================================
echo.
echo Resultados guardados en:
echo   - Datos raw: results\*_%TIMESTAMP%.jtl
echo   - Reporte HTML: reports\*_%TIMESTAMP%\index.html
echo.
echo Para ver el reporte, abre:
echo   reports\*_%TIMESTAMP%\index.html
echo.

REM Abrir reporte automáticamente
for /d %%d in (reports\*_%TIMESTAMP%) do (
    echo Abriendo reporte en el navegador...
    start "" "%%d\index.html"
)

echo.
echo Presiona cualquier tecla para salir...
pause >nul
