---
name: linea-de-estado
description: Manual de la linea de estado de Claude Code (contexto y uso de 5 horas y semanal) y de su lectura en Herdr: script versionado, instalacion a nivel de usuario, comprobacion, ficheros que deja y problemas conocidos.
type: manual
version: 1.2
---

# Línea de estado de Claude Code

## Para qué sirve y quién la usa

Deja a la vista, en la propia sesión y en Herdr, el contexto usado y el consumo de la ventana de 5 horas y de la semana. La ve el director; cada coordinador lee los mismos datos de un fichero de su pestaña. La fuente es el JSON que Claude Code pasa a la línea de estado: el script no hace red, no lee credenciales y no guarda la conversación. Por qué se adopta y cómo se decide con ello está en [[herramientas_comunes_de_usuario]] y en [[higiene_contexto_y_tokens]].

## Requisitos

- Claude Code instalado y `jq`.
- Herdr, solo para la barra de pestañas y la barra lateral (ver su manual, `herdr.md`).
- `rate_limits` solo llega en cuentas con suscripción y después del primer mensaje de la sesión.

## Instalación

El script se versiona en el catálogo: `general/comun/scripts/statusline.sh`, con su prueba `general/comun/scripts/probar-statusline.sh`. Lo instalado en `~` es una copia del fichero del vault, que es la fuente. Desde la raíz del vault:

### macOS

1. Copia previa de los ajustes de usuario (no se pisa un `.bak` existente): `cp ~/.claude/settings.json ~/.claude/settings.json.bak-$(date +%Y%m%d%H%M)`
2. `install -m 755 general/comun/scripts/statusline.sh ~/.claude/statusline.sh`
3. Añadir la clave `statusLine` sin pisar el resto, validando antes de sustituir:

       jq '. + {"statusLine": {"type": "command", "command": "~/.claude/statusline.sh"}}' ~/.claude/settings.json > /tmp/settings.nuevo.json
       jq empty /tmp/settings.nuevo.json && mv /tmp/settings.nuevo.json ~/.claude/settings.json

4. Herdr: seguir "Configuración tras instalar" de `herdr.md`.

Si `~/.claude/settings.json` es un enlace (varias cuentas que lo comparten), `mv` lo sustituye por un fichero: edita el destino del enlace o usa `cat /tmp/settings.nuevo.json > ~/.claude/settings.json`.

### Debian

[SIN MANUAL PARA ESTE SISTEMA]

### Windows 11

[SIN MANUAL PARA ESTE SISTEMA]

## Configuración tras instalar

Nada más: la clave `statusLine` del paso 3 es toda la configuración de Claude Code. Dos variables, ambas opcionales:

- `CLAUDE_CONFIG_DIR`: si está definida (cuentas adicionales, ver `claude-code-varias-cuentas.md`), el fichero de límites se llama `latest-<nombre de la carpeta>`, tal cual lleve la carpeta (con `~/.claude-trabajo`, `latest-.claude-trabajo`), y el historial anota esa cuenta en `cuenta`. Sin ella, el fichero es `latest` y la cuenta es `defecto`. Así no se mezclan los límites de cuentas distintas.
- `CLAUDE_USO_MAX_BYTES`: umbral de rotación del historial; por defecto 20971520 (20 MB). Al pasarlo, el historial pasa a `historial.jsonl.1` (uno solo, el anterior se pierde).

## Ficheros que deja

Todos fuera del vault, bajo `~`:

- `~/.cache/claude-limits/latest` (o `latest-<carpeta>`): una línea `<5h %> <7d %> <epoch de reinicio de 5h>`; se escribe solo si llega `rate_limits`. Lo lee la barra de pestañas de Herdr.
- `~/.cache/claude-statusline/<panel>.json`: solo dentro de Herdr (`HERDR_PANE_ID`, con `:` cambiado por `_`). Contexto, `rate_limits`, `session_id` y `written_at`. Lo lee `relevo.mjs` (`--comprobar` da las cifras y el veredicto) y, si hace falta, el coordinador con `cat`.
- `~/.local/share/claude-uso/historial.jsonl`: una línea cuando cambia algún valor de la sesión (hora con zona, sesión, panel, cuenta, `cwd`, modelo, esfuerzo, contexto, 5h, 7d). El último valor por sesión está en `ultimo/<sesión>`.
- En Herdr, el contexto de cada panel va a la barra lateral con `herdr pane report-metadata`; fuera de Herdr no se hace.

No se guarda `transcript_path` ni texto de la conversación.

## Comprobación

Desde la raíz del vault:

    cmp general/comun/scripts/statusline.sh ~/.claude/statusline.sh
    general/comun/scripts/probar-statusline.sh
    echo '{"session_id":"x","context_window":{"used_percentage":42.7},"rate_limits":{"five_hour":{"used_percentage":10.5},"seven_day":{"used_percentage":3.2}}}' | ~/.claude/statusline.sh

- `cmp` no imprime nada: la copia instalada es la del vault.
- La prueba da seis líneas `[OK]` (S1 a S6) en un `HOME` aislado, sin tocar `~`.
- La entrada de prueba devuelve `ctx 42% · 5h 10% · 7d 3%`. Ojo: esta orden sí escribe en `~/.cache/claude-limits/latest` y en el historial; bórralo después si no quieres esa fila.
- Tras un mensaje en una sesión real: `cat ~/.cache/claude-limits/latest`, `tail -1 ~/.local/share/claude-uso/historial.jsonl` y, dentro de Herdr, `cat ~/.cache/claude-statusline/*.json`.

## Problemas conocidos

- **Síntoma:** `five_hour` llega `null` en una sesión que ya ha enviado mensajes. **Causa:** la ventana de 5 h acaba de reiniciar y aún no hay uso en la nueva (medido el 2026-10-22: un panel escrito a las 16:50:01, la hora a la que reinició la ventana). **Solución:** ninguna; `relevo.mjs` lo trata como dato ausente y no aplica el umbral de 5 h.
- **Síntoma:** la línea muestra `5h -% · 7d -%`. **Causa:** Claude Code no pasa `rate_limits` (cuenta sin suscripción, o aún no ha habido un mensaje en la sesión). **Solución:** la línea se queda con el contexto; el consumo lo mira el director con `/usage` en una sesión interactiva. Que `/usage` funcione con `claude -p` está `[POR MEDIR]`.
- **Síntoma:** no sale contexto en la barra lateral de Herdr. **Causa:** sesión fuera de Herdr, `herdr` fuera del `PATH` de la línea de estado, o aún sin mensajes. **Solución:** abrir la sesión dentro de Herdr y comprobar `command -v herdr`.
- **Síntoma:** la barra de pestañas muestra los límites de la cuenta por defecto en una sesión de otra cuenta. **Causa:** la barra lee solo `latest`. **Solución:** ninguna por ahora; los de la otra cuenta están en `latest-<carpeta>`.

## Actualización

Cuando cambia `general/comun/scripts/statusline.sh` en el vault: repetir el paso 2 de la instalación y la comprobación `cmp`. No hay que tocar `settings.json`.

## Desinstalación

[SIN MEDIR] Quitar la clave `statusLine` de `~/.claude/settings.json` (con `jq 'del(.statusLine)'` a un temporal, `jq empty` y sustituir), borrar `~/.claude/statusline.sh`, y si se quiere `~/.cache/claude-limits`, `~/.cache/claude-statusline` y `~/.local/share/claude-uso`. Sin ejecutar.

## Medido

Medido: 2026-10-22, Claude Code 2.1.308, macOS 27.0.1, instalada por IA

En la misma medición: Herdr 0.9.3 y jq 1.7.1 (jq-1.7.1-apple); `statusline.sh` no lleva versión propia (la 1.0 era la del manual), es idéntico al instalado en `~/.claude/statusline.sh` y `probar-statusline.sh` da S1 a S6 en `[OK]`. Lo de "instalada por IA" no se puede medir con ninguna orden.

Lo que se midió al instalar, con suscripción Max: llega `rate_limits` con `five_hour` y `seven_day` (porcentaje y `resets_at`), `context_window.context_window_size` (1000000), `model.id`, `effort.level` y `workspace.current_dir`. Las seis sesiones abiertas en Herdr recogieron la `statusLine` sin reiniciar, y su contexto salió en la barra lateral. En una sesión que aún no ha enviado ningún mensaje desde la instalación, `h5` y `d7` llegan vacíos: es el primer problema conocido.
