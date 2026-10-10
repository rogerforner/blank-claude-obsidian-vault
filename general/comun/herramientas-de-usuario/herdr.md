---
name: herdr
description: Manual de Herdr, la interfaz de sesiones de los coordinadores: instalacion con Homebrew, integracion con Claude Code, comprobacion y actualizacion.
type: manual
version: 1.0
---

# Herdr

## Para qué sirve y quién la usa

Herdr es la interfaz de terminal donde viven las sesiones del vault: un espacio de trabajo por espacio del vault y una pestaña por rol. La usa el director y, a través de su API, el coordinador general para el relevo. Por qué esa forma y cómo se usa está en [[orquestacion_sesiones_por_herramienta]] y en [[ciclo_de_tandas]].

## Requisitos

- Homebrew (en macOS).
- Claude Code instalado, para su integración.

## Instalación

### macOS

1. `brew install herdr`
2. `herdr integration install claude`
3. `mkdir -p ~/.claude/skills/herdr && herdr --skill > ~/.claude/skills/herdr/SKILL.md`

La integración deja un hook "managed by herdr" en el `settings.json` de usuario, que solo informa del estado a Herdr. La skill se genera con la versión instalada.

### Debian

[SIN MANUAL PARA ESTE SISTEMA]

### Windows 11

[SIN MANUAL PARA ESTE SISTEMA]

## Configuración tras instalar

La integración (paso 2) y la skill (paso 3) son toda la configuración. El hook queda en el `settings.json` de usuario, nunca en los versionados.

## Comprobación

    herdr --version
    herdr integration status
    herdr --skill | cmp - ~/.claude/skills/herdr/SKILL.md

- `herdr --version` devuelve la versión instalada (por ejemplo `herdr 0.9.3`).
- `integration status` tiene que mostrar la línea `claude: current`.
- `cmp` no debe imprimir nada: la skill está al día con la versión instalada.
- Dentro de Herdr, `herdr agent list` lista las sesiones.

## Problemas conocidos

Ninguno de estos está confirmado:

- [POR MEDIR] **Síntoma:** `herdr update` y la instalación por Homebrew pueden pisarse. **Causa:** sin averiguar. **Solución:** sin confirmar; mientras tanto se actualiza solo con Homebrew.
- [POR MEDIR] **Síntoma:** un `--env` dado a un espacio de trabajo puede perderse tras reiniciar el servidor de Herdr. **Causa:** sin averiguar. **Solución:** sin confirmar.
- [POR MEDIR] **Síntoma:** dentro de Herdr, `SSH_AUTH_SOCK` apunta a un socket de Herdr y no al agente del sistema. **Causa:** sin comprobar. **Solución:** mirarlo antes de que una sesión dentro de Herdr dependa de SSH.

## Actualización

1. `brew upgrade herdr`
2. Regenerar la skill: `mkdir -p ~/.claude/skills/herdr && herdr --skill > ~/.claude/skills/herdr/SKILL.md`

## Desinstalación

[SIN MEDIR] La orden de quitar la integración existe (`herdr integration uninstall claude`, según `herdr integration --help`) y no se ha ejecutado. Para el resto, `brew uninstall herdr` y quitar `~/.claude/skills/herdr`, sin probar.

## Medido

Medido: 2026-10-11, herdr 0.9.3, macOS 27.0.1, instalada por sin dato
