# Notas de `plantilla-settings-coordinador-equipo.json` — coordinador de un equipo

Variante de [`plantilla-settings-coordinador.json`](plantilla-settings-coordinador.NOTAS.md) para el asunto que es **una máquina del director** (`equipos/<equipo>/`, [[coordinador_de_equipo]]). **Mismo aislamiento, mismas denegaciones, dos adiciones al `deny`.** Cómo se instala, las rutas del hook y la portabilidad valen igual que en el perfil normal y no se repiten.

## Qué cambia respecto al perfil de coordinador

- **`mcp__ha-mcp` denegado entero.** Un equipo no es consumidor de Home Assistant: el MCP se instala a nivel de usuario y lo ven todas las sesiones, así que quien no lo consume lo lleva entero en su `deny` ([[herramientas_comunes_de_usuario]], sección "Un MCP cuyo recurso es de un asunto"). Si la causa de un problema está en Home Assistant, se pide a `casa/homeassistant` por el canal.
- **`mcp__proxmox` denegado entero.** Lo usa solo `homelab`, su dueño; los demás asuntos lo tienen denegado y piden lo que necesiten por el canal.

## Lo que se queda igual, a propósito

- **`Bash(sudo:*)` y `Bash(su:*)` siguen denegados** (decisión D5 del plan de adopción). El coordinador de equipo prepara la orden, el director la lanza en su terminal y el coordinador verifica después con una orden de lectura. Una ventana de sudo temporal queda descartada por ahora.
- **El `deny` del llavero de macOS** (`security find-*`, `dump-keychain`, `export` y `~/Library/Keychains`) sigue puesto: capa de protección, no barrera ([[sensitive_file_guard]]).
