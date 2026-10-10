---
name: playwright-cli
description: Manual de Playwright CLI, el navegador comun del usuario para los agentes: instalacion, comprobacion, actualizacion y problemas conocidos.
type: manual
version: 1.0
---

# Playwright CLI

## Para qué sirve y quién la usa

Navegar y leer páginas web desde la línea de órdenes, con una skill de usuario para los agentes. La usan todos los coordinadores de la máquina. Es el paquete `@playwright/cli`. Por qué se eligió y cómo se usa (sesiones con nombre, `--persistent`, credenciales, la receta de `Set-Cookie`) está en [[herramientas_comunes_de_usuario]], no aquí.

## Requisitos

- Node con `npm`.
- Chrome instalado en el sistema: la herramienta no descarga navegador.

## Instalación

### macOS

1. `npm install -g @playwright/cli@latest`
2. `playwright-cli install --skills --global`

La segunda orden deja la skill en `~/.claude/skills/playwright-cli`, disponible para todas las sesiones del usuario. Se carga en caliente, sin reiniciar la sesión.

### Debian

[SIN MANUAL PARA ESTE SISTEMA]

### Windows 11

[SIN MANUAL PARA ESTE SISTEMA]

## Configuración tras instalar

- Ignorar la carpeta de instantáneas en el `.gitignore` del vault: `**/.playwright-cli/`.
- El permiso `Bash(playwright-cli:*)` solo hace falta fuera de "Omitir permisos". Si se añade, va en los `settings` de usuario, nunca en los versionados.

## Comprobación

1. `playwright-cli --version` devuelve la versión instalada (por ejemplo `0.1.22`).
2. Prueba completa en una carpeta de trabajo cualquiera: `playwright-cli open <url>`, `playwright-cli snapshot` y `playwright-cli close`. Tiene que aparecer una instantánea en `.playwright-cli/` y la orden tiene que devolver su ruta.

## Problemas conocidos

- **Síntoma:** la orden `open` falla por falta de navegador. **Causa:** la máquina no tiene Chrome. **Solución:** `playwright-cli install-browser`.

## Actualización

1. `npm install -g @playwright/cli@latest`
2. `playwright-cli install --skills --global`, para regenerar la skill con la versión nueva.

## Desinstalación

[SIN MEDIR] Órdenes previstas, sin ejecutar: `npm uninstall -g @playwright/cli` y quitar `~/.claude/skills/playwright-cli`.

## Medido

Medido: 2026-10-11, playwright-cli 0.1.22, macOS 27.0.1, instalada por IA
