---
name: claude-code-varias-cuentas
description: Manual de varias cuentas de Claude Code en una misma maquina: un directorio de configuracion por cuenta adicional, que se enlaza, el alias, el login, la comprobacion y su uso con Herdr y claude -p.
type: manual
version: 1.1
---

# Varias cuentas de Claude Code en una máquina

## Para qué sirve y quién la usa

Una persona puede tener en la misma máquina más de una cuenta (una personal y otra de trabajo, por ejemplo). Cada cuenta adicional lleva su propio directorio de configuración, que se elige con `CLAUDE_CONFIG_DIR`. Lo monta quien administra la máquina; el criterio está en [[herramientas_comunes_de_usuario]].

## Requisitos

- Claude Code instalado.
- zsh, para el alias (`~/.zshrc`).
- El titular de cada cuenta, presente para el login.

## Instalación

### macOS

1. Un directorio por cuenta adicional: `mkdir -m 700 ~/.claude-<cuenta>`.
2. Enlaces simbólicos desde ese directorio hacia `~/.claude`: `settings.json`, `hooks/` y cada skill de usuario por separado. **No se enlazan:** las skills sincronizadas de otra organización, `plugins/`, `projects/`, `.claude.json` ni las credenciales. **Cada skill de usuario nueva se enlaza también en cada directorio de cuenta.**
3. Un alias en el `~/.zshrc`, uno por cuenta adicional:

       alias claude-<cuenta>='env -u ANTHROPIC_API_KEY -u CLAUDE_SECURESTORAGE_CONFIG_DIR CLAUDE_CONFIG_DIR=$HOME/.claude-<cuenta> claude'

4. El login lo hace el titular, con la variable puesta: `CLAUDE_CONFIG_DIR=~/.claude-<cuenta> claude auth login` (con `--sso` si la organización lo usa).

La cuenta por defecto nunca define `CLAUDE_CONFIG_DIR`. No se activa `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` ni se define `CLAUDE_SECURESTORAGE_CONFIG_DIR`.

### Debian

[SIN MANUAL PARA ESTE SISTEMA]

### Windows 11

[SIN MANUAL PARA ESTE SISTEMA]

## Configuración tras instalar

Los permisos y los hooks viven en el `settings.json` de usuario, que las cuentas adicionales comparten por el enlace; nunca en los versionados.

## Comprobación

    CLAUDE_CONFIG_DIR=~/.claude-<cuenta> claude auth status --json

- Los tres campos que importan son `configDirectory`, `orgId` y `subscriptionType`.
- Además, la línea `[CUENTA]` del hook de arranque de la sesión.
- Es necesaria pero no suficiente: puede no reflejar el token que realmente se usa. Se complementa con el consumo que muestra claude.ai.

## Problemas conocidos

- **Síntoma:** la cuenta por defecto pierde su sesión. **Causa:** *(dato de terceros, no medido aquí)* la variable cambia la entrada del llavero donde se guarda la credencial. **Solución:** la cuenta por defecto no define nunca la variable.
- **Síntoma:** `/model` cambia en las dos cuentas. **Causa:** *(dato de terceros)* el `settings.json` está compartido. **Solución:** [SIN MEDIR] aceptarlo, o no compartir ese fichero.
- **Herdr:** la variable se pasa con `--env CLAUDE_CONFIG_DIR=...` en `herdr workspace create`, `tab create` y `pane split`. Tras reiniciar el servidor de Herdr la variable se pierde (medido, ver el manual de Herdr): esas pestañas se reabren con su `--env`. El script de relevo (`relevo.mjs`) la propaga solo cuando la sesión la tiene.
- **`claude -p`** hereda la variable del padre; lanzada desde un script, se pasa explícita.

## Actualización

Claude Code se actualiza como siempre y no toca los directorios de cuenta. Tras añadir una skill de usuario, se enlaza en cada directorio de cuenta.

## Desinstalación

[SIN MEDIR] Quitar el alias del `~/.zshrc` y el directorio de la cuenta, después de cerrar su sesión (`claude auth logout` con la variable puesta), sin probar.

## Medido

Medido: 2026-10-07, claude 2.1.296 (versión de hoy, 2026-10-11; el montaje es del 2026-10-07), macOS 27.0.1, instalada por IA
