@echo off
REM Script para Windows - Inicializar certificados SSL con Let's Encrypt
REM IMPORTANTE: Ejecutar este script en el servidor de producción Linux

echo ===============================================
echo   Configuracion de HTTPS para TicketApp
echo ===============================================
echo.

echo NOTA: Este script debe ejecutarse en un servidor Linux con Docker.
echo Si estas en Windows para desarrollo, usa certificados autofirmados.
echo.

set /p CONTINUE="Estas en un servidor Linux? (S/N): "
if /i not "%CONTINUE%"=="S" (
    echo.
    echo Para desarrollo en Windows, sigue estos pasos:
    echo.
    echo 1. Instala mkcert desde: https://github.com/FiloSottile/mkcert/releases
    echo 2. Abre PowerShell como administrador y ejecuta:
    echo    mkcert -install
    echo    mkcert localhost 127.0.0.1 ::1
    echo.
    echo 3. Copia los certificados generados a nginx/certs/
    echo.
    echo 4. Usa docker-compose con la configuracion de desarrollo
    echo.
    echo Consulta la guia completa en: docs/HTTPS-SETUP.md
    echo.
    pause
    exit /b
)

echo.
echo Por favor, ejecuta el script init-letsencrypt.sh en tu servidor Linux:
echo.
echo   chmod +x init-letsencrypt.sh
echo   sudo ./init-letsencrypt.sh
echo.
pause
