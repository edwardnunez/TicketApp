# Instalación de JMeter en Windows

## Opción 1: Chocolatey (Recomendada)

### Paso 1: Instalar Chocolatey (si no lo tienes)

1. Abre **PowerShell como Administrador** (click derecho > Ejecutar como administrador)

2. Ejecuta este comando:
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

3. Cierra y abre PowerShell de nuevo

### Paso 2: Instalar JMeter

```powershell
choco install jmeter -y
```

### Paso 3: Verificar instalación

```powershell
jmeter -version
```

---

## Opción 2: Instalación Manual

### Paso 1: Instalar Java

JMeter requiere Java 8 o superior.

**Verificar si Java está instalado:**
```powershell
java -version
```

**Si no está instalado, descarga Java:**
- https://www.oracle.com/java/technologies/downloads/
- O usa Chocolatey: `choco install openjdk11`

### Paso 2: Descargar JMeter

1. Ve a: https://jmeter.apache.org/download_jmeter.cgi
2. Descarga: **apache-jmeter-5.6.2.zip** (Binaries)
3. Guarda en `C:\Apache\`

### Paso 3: Extraer archivos

1. Extrae el archivo ZIP en `C:\Apache\apache-jmeter-5.6.2\`

### Paso 4: Agregar JMeter al PATH

**Opción A - Interfaz Gráfica:**

1. Presiona `Win + Pause` o ve a `Sistema` > `Configuración avanzada del sistema`
2. Click en "Variables de entorno"
3. En "Variables del sistema", busca `Path` y haz click en "Editar"
4. Click en "Nuevo"
5. Agrega: `C:\Apache\apache-jmeter-5.6.2\bin`
6. Click "Aceptar" en todas las ventanas
7. **Cierra y abre PowerShell de nuevo**

**Opción B - PowerShell (como Administrador):**

```powershell
# Agregar JMeter al PATH permanentemente
[Environment]::SetEnvironmentVariable(
    "Path",
    [Environment]::GetEnvironmentVariable("Path", "Machine") + ";C:\Apache\apache-jmeter-5.6.2\bin",
    "Machine"
)
```

### Paso 5: Verificar instalación

Cierra y abre PowerShell de nuevo, luego:

```powershell
jmeter -version
```

Deberías ver algo como:
```
    _    ____   _    ____ _   _ _____       _ __  __ _____ _____ _____ ____
   / \  |  _ \ / \  / ___| | | | ____|     | |  \/  | ____|_   _| ____|  _ \
  / _ \ | |_) / _ \| |   | |_| |  _|    _  | | |\/| |  _|   | | |  _| | |_) |
 / ___ \|  __/ ___ \ |___|  _  | |___  | |_| | |  | | |___  | | | |___|  _ <
/_/   \_\_| /_/   \_\____|_| |_|_____|  \___/|_|  |_|_____| |_| |_____|_| \_\ 5.6.2
```

---

## Opción 3: Ejecutable Portátil (Sin instalación)

Si no quieres instalar en el PATH:

### Paso 1: Descargar y extraer JMeter
```powershell
cd C:\Users\iyanf\OneDrive\Escritorio\ticketapp\jmeter

# Crear directorio para JMeter
New-Item -ItemType Directory -Force -Path "jmeter-portable"
```

### Paso 2: Descargar manualmente
1. Descarga desde: https://jmeter.apache.org/download_jmeter.cgi
2. Extrae en `C:\Users\iyanf\OneDrive\Escritorio\ticketapp\jmeter\jmeter-portable\`

### Paso 3: Usar ruta completa

En lugar de `jmeter`, usa la ruta completa:

```powershell
C:\Users\iyanf\OneDrive\Escritorio\ticketapp\jmeter\jmeter-portable\apache-jmeter-5.6.2\bin\jmeter.bat -n -t TicketApp-Performance-Test.jmx -l results/test1.jtl -e -o reports/test1/
```

O crea un alias en tu sesión:

```powershell
# Agregar esto a tu perfil de PowerShell
Set-Alias jmeter "C:\Users\iyanf\OneDrive\Escritorio\ticketapp\jmeter\jmeter-portable\apache-jmeter-5.6.2\bin\jmeter.bat"
```

---

## Solución de Problemas

### Error: "java: command not found"

**Solución:** Instala Java primero

```powershell
# Con Chocolatey
choco install openjdk11 -y

# O descarga manualmente desde:
# https://adoptium.net/
```

### Error: "jmeter no se reconoce"

**Solución 1:** Verifica que JMeter está en el PATH
```powershell
$env:Path -split ';' | Select-String jmeter
```

**Solución 2:** Reinicia PowerShell después de agregar al PATH

**Solución 3:** Usa ruta completa al ejecutable

### Error: "JAVA_HOME is not set"

**Solución:**
```powershell
# Encuentra dónde está Java
Get-Command java | Select-Object -ExpandProperty Source

# Configura JAVA_HOME (ajusta la ruta según tu instalación)
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-11", "Machine")
```

---

## Verificación Completa

Una vez instalado todo, ejecuta estos comandos para verificar:

```powershell
# Verificar Java
java -version

# Verificar JMeter
jmeter -version

# Ver dónde está instalado JMeter
Get-Command jmeter | Select-Object -ExpandProperty Source
```

**Salida esperada:**

```
PS> java -version
openjdk version "11.0.X" ...

PS> jmeter -version
    _    ____   _    ____ _   _ _____       _ __  __ _____ _____ _____ ____
   / \  |  _ \ / \  / ___| | | | ____|     | |  \/  | ____|_   _| ____|  _ \
  ...
  5.6.2
```

---

## Script de Instalación Automática

Guarda esto como `install-jmeter.ps1` y ejecútalo como administrador:

```powershell
# Script de instalación automática de JMeter en Windows

Write-Host "=== Instalador de JMeter para Windows ===" -ForegroundColor Green
Write-Host ""

# Verificar Java
Write-Host "Verificando Java..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1
    Write-Host "✓ Java está instalado" -ForegroundColor Green
} catch {
    Write-Host "✗ Java no está instalado" -ForegroundColor Red
    Write-Host "Instalando Java..." -ForegroundColor Yellow

    if (Get-Command choco -ErrorAction SilentlyContinue) {
        choco install openjdk11 -y
    } else {
        Write-Host "Por favor instala Java manualmente desde:" -ForegroundColor Red
        Write-Host "https://adoptium.net/" -ForegroundColor Yellow
        exit 1
    }
}

# Instalar JMeter
Write-Host ""
Write-Host "Instalando JMeter..." -ForegroundColor Yellow

if (Get-Command choco -ErrorAction SilentlyContinue) {
    choco install jmeter -y

    Write-Host ""
    Write-Host "✓ JMeter instalado exitosamente" -ForegroundColor Green

    # Verificar
    Write-Host ""
    Write-Host "Verificando instalación..." -ForegroundColor Yellow
    jmeter -version

    Write-Host ""
    Write-Host "¡Listo! Ahora puedes ejecutar:" -ForegroundColor Green
    Write-Host "  jmeter -n -t TicketApp-Performance-Test.jmx -l results/test1.jtl" -ForegroundColor Cyan

} else {
    Write-Host "Chocolatey no está instalado." -ForegroundColor Yellow
    Write-Host "Opciones:" -ForegroundColor Yellow
    Write-Host "  1. Instalar Chocolatey primero (recomendado)" -ForegroundColor Cyan
    Write-Host "  2. Descargar JMeter manualmente desde:" -ForegroundColor Cyan
    Write-Host "     https://jmeter.apache.org/download_jmeter.cgi" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Para instalar Chocolatey, ve a:" -ForegroundColor Yellow
    Write-Host "  https://chocolatey.org/install" -ForegroundColor Cyan
}
```

**Uso:**
```powershell
# Ejecutar como Administrador
.\install-jmeter.ps1
```

---

## Siguientes Pasos

Una vez instalado JMeter:

1. Cierra y abre PowerShell de nuevo
2. Navega al directorio del proyecto:
   ```powershell
   cd C:\Users\iyanf\OneDrive\Escritorio\ticketapp\jmeter
   ```
3. Ejecuta tu primera prueba:
   ```powershell
   jmeter -n -t TicketApp-Performance-Test.jmx -l results/test1.jtl -e -o reports/test1/
   ```

---

**¿Necesitas ayuda?** Revisa [QUICKSTART.md](QUICKSTART.md) para más información.
