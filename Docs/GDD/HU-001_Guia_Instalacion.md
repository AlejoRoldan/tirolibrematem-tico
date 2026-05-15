# HU-001: Guía de Instalación del Entorno de Desarrollo
## Tiro Libre Matemático

**Versión:** 1.0
**Fecha:** Mayo 2026

Sigue este orden exacto. No pases al siguiente paso hasta confirmar que el anterior funcionó correctamente.

---

## Paso 1: Instalar Git

**Descarga:** https://git-scm.com/download/win

Instalación: Next → Next → Finish (todo por defecto).

**Verificación** (abrir CMD o PowerShell):
```
git --version
```
Debe mostrar: `git version 2.x.x`

**Configuración inicial:**
```bash
git config --global user.name "Alejo Roldán"
git config --global user.email "tu-correo@gmail.com"
```

---

## Paso 2: Instalar Unity Hub

**Descarga:** https://unity.com/download

1. Instala Unity Hub (es el gestor de versiones de Unity, como `nvm` para Node.js).
2. Crea cuenta gratuita en: https://id.unity.com
3. Inicia sesión en Unity Hub con esa cuenta.

---

## Paso 3: Instalar Unity 2022.3 LTS

En Unity Hub → **Installs** → **Install Editor** → busca "2022.3 LTS".

**IMPORTANTE:** Marca estos módulos durante la instalación:

| Módulo | Para qué sirve |
| :--- | :--- |
| ✅ Android Build Support | Permite compilar el juego para Android |
| ✅ Android SDK & NDK Tools | Herramientas de desarrollo Android |
| ✅ OpenJDK | Java necesario para compilar Android |
| ✅ Microsoft Visual Studio Community 2022 | Editor de código con soporte para C# y Unity |

**Tiempo estimado de descarga:** 30-60 minutos.

**Verificación:** Unity Hub muestra la versión con ícono verde.

---

## Paso 4: Verificar Visual Studio Community 2022

Se instala automáticamente con Unity si marcaste esa opción.

Si no: https://visualstudio.microsoft.com/vs/community/

Durante instalación de VS, marca:
- ✅ **Desarrollo de juegos con Unity**

**Verificación:** VS se abre correctamente al hacer doble clic en un `.cs` desde Unity.

---

## Paso 5: Clonar el repositorio

Abrir PowerShell y ejecutar:
```bash
git clone https://github.com/AlejoRoldan/tirolibrematem-tico.git
cd tirolibrematem-tico
git checkout develop
```

**Verificación:**
```bash
git branch
```
Debe mostrar: `* develop`

---

## Paso 6: Abrir el proyecto en Unity Hub

1. Unity Hub → **Projects** → **Add** → **Open**.
2. Navega a la carpeta `tirolibrematem-tico` que clonaste.
3. Selecciona la carpeta y haz clic en **Open**.
4. Unity cargará el proyecto (puede tardar unos minutos la primera vez).

**Verificación:** El proyecto se abre sin errores en la consola de Unity.

---

## Checklist de Verificación Final

| Herramienta | Comando de verificación | Resultado esperado |
| :--- | :--- | :--- |
| Git | `git --version` | `git version 2.x.x` |
| Unity | Unity Hub → Installs | Versión 2022.3 LTS con ícono verde |
| Rama activa | `git branch` | `* develop` |
| Proyecto Unity | Abrir en Unity Hub | Sin errores en consola |
