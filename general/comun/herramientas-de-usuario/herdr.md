---
name: herdr
description: Manual de Herdr, la interfaz de sesiones de los coordinadores: instalacion con Homebrew, integracion con Claude Code, comprobacion y actualizacion.
type: manual
version: 1.6
---

# Herdr

## Para qué sirve y quién la usa

Herdr es la interfaz de terminal donde viven las sesiones del vault: un espacio de trabajo por vault, con los coordinadores de todos sus espacios (también los de `equipos/`), y una pestaña por coordinador, que lo identifica y no se mueve ni se duplica. La usa el director y, a través de su API, cada coordinador para su propio relevo y el general para arrancar coordinadores. Por qué esa forma y cómo se usa está en [[orquestacion_sesiones_por_herramienta]] y en [[ciclo_de_tandas]].

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

Para ver el uso de Claude y el contexto (script y ficheros en `linea-de-estado.md`), se añade a `~/.config/herdr/config.toml` este bloque, con copia previa y validación:

1. `cp ~/.config/herdr/config.toml ~/.config/herdr/config.toml.bak-$(date +%Y%m%d%H%M)`
2. Añadir al fichero:

       [ui]
       tab_bar_right = [
         { type = "command", command = "awk '{printf \"5h %s%% · 7d %s%%\", $1, $2}' ~/.cache/claude-limits/latest", interval_seconds = 30, timeout_seconds = 2 },
       ]

       [ui.sidebar.agents.rows_by_agent]
       claude = [ ["state_icon", "workspace", "tab"], ["agent", "$ctx"] ]

   Si el fichero ya tiene `[ui]`, las claves se añaden bajo la tabla existente y no se repite la cabecera.
3. `herdr config check`
4. `herdr server reload-config`

`tab_bar_right` muestra en la barra de pestañas los porcentajes de 5 horas y semanal (los de la cuenta por defecto, ver Problemas conocidos de `linea-de-estado.md`). `rows_by_agent` pone en la barra lateral, por cada sesión de Claude, el estado, el espacio de trabajo y la pestaña, y debajo el agente con su contexto (`$ctx`, que rellena la línea de estado).

## Comprobación

    herdr --version
    herdr integration status
    herdr --skill | cmp - ~/.claude/skills/herdr/SKILL.md

- `herdr --version` devuelve la versión instalada (por ejemplo `herdr 0.9.3`).
- `integration status` tiene que mostrar la línea `claude: current`.
- `cmp` no debe imprimir nada: la skill está al día con la versión instalada.
- Dentro de Herdr, `herdr agent list` lista las sesiones.

## Problemas conocidos

Problemas conocidos y cómo se resuelven:

- **Síntoma:** tras reiniciar el servidor de Herdr, las pestañas vuelven pero sin el `--env` con que se crearon. **Causa:** el servidor restaura la disposición y abre shells nuevas; el entorno no se guarda (medido el 2026-10-22 en una sesión aislada, `herdr --session <prueba> server`: la variable se ve antes del reinicio y falta después, tanto en las pestañas restauradas como en una nueva del mismo espacio de trabajo). **Solución:** la sesión que dependa de una variable (por ejemplo `CLAUDE_CONFIG_DIR`) se vuelve a abrir con su `--env` después del reinicio.
- **`herdr update` no se usa.** Herdr se instala y se actualiza solo con Homebrew (`brew upgrade herdr`); `herdr update` descarga el binario por su cuenta y no se ha comprobado cómo convive con el de Homebrew, así que no se prueba sobre la instalación buena.

Medido y descartado (2026-10-22): dentro de Herdr, `SSH_AUTH_SOCK` vale `~/.config/herdr/herdr.sock.agent`, que es un enlace simbólico al socket del agente SSH del sistema (`launchd`); `ssh-add -l` lista las claves del llavero. No es un agente propio de Herdr: el enlace fijo es lo que deja la ruta estable entre reconexiones de la interfaz. Si una sesión no ve las claves, `ls -l "$SSH_AUTH_SOCK"` debe apuntar a `/var/run/com.apple.launchd.*/Listeners`.

## Actualización

1. `brew upgrade herdr`
2. Regenerar la skill: `mkdir -p ~/.claude/skills/herdr && herdr --skill > ~/.claude/skills/herdr/SKILL.md`

## Desinstalación

[SIN MEDIR] La orden de quitar la integración existe (`herdr integration uninstall claude`, según `herdr integration --help`) y no se ha ejecutado. Para el resto, `brew uninstall herdr` y quitar `~/.claude/skills/herdr`, sin probar.

## Medido

Medido: 2026-10-11, herdr 0.9.3, macOS 27.0.1, instalada por sin dato
