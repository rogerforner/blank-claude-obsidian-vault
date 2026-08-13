# Resolución de problemas — Claude Code (CLI / app de escritorio)

Resolución de problemas concretos de Claude Code en Windows. Catálogo transversal, se consulta read-only. Añade una entrada por problema resuelto: **síntoma + causa + solución verificada**. No es doctrina: son hechos de plataforma, y como tales caducan — comprueba la versión antes de aplicar una receta vieja.

---

## `claude update` (CLI nativo, Windows) dice "Successfully updated" pero la versión no cambia

**Síntoma:** en el terminal, `claude update` repite `Current version: X` / `Successfully updated from X to version Y`, pero `claude --version` sigue mostrando **X** una y otra vez. *(Caso real 2026-06-22: atascado en 2.1.183 mientras "actualizaba" a 2.1.185.)*

**Causa raíz:** la instalación **nativa** tiene el binario activo como **fichero normal** (una copia, no un symlink) en `~/.local/bin/claude.exe`. `claude update` **descarga** la versión nueva al store `~/.local/share/claude/versions/<versión>` (un fichero de ~225 MB **nombrado por versión**, no una carpeta), pero el updater corre **desde** `~/.local/bin/claude.exe`, y en **Windows un `.exe` en ejecución no puede sobrescribirse a sí mismo** → la descarga ocurre, pero la activación (copiar la versión nueva sobre el binario activo) no. Por eso "actualiza" cada vez sin avanzar.

**Diagnóstico (PowerShell):**
```powershell
where.exe claude                                              # cuántos claude hay en PATH y dónde
claude --version                                              # versión activa real
Get-ChildItem "$env:USERPROFILE\.local\share\claude\versions" # versiones DESCARGADAS (¿está la nueva?)
Get-Process -Name claude* | Select-Object Id, Path            # qué procesos claude corren (¿CLI o app de escritorio?)
```
Si la versión nueva aparece en `versions\` pero `claude --version` muestra la vieja → es este caso.

**Solución** — activar la versión ya descargada **desde un proceso que NO sea ese `.exe`** (p. ej. otro shell, o con todas las sesiones CLI cerradas; los procesos de la **app de escritorio** no bloquean este binario y pueden seguir abiertos):
```powershell
$src = "$env:USERPROFILE\.local\share\claude\versions\<VERSION_NUEVA>"  # es un FICHERO, no carpeta
$dst = "$env:USERPROFILE\.local\bin\claude.exe"
Copy-Item -LiteralPath $src -Destination $dst -Force
claude --version    # debe mostrar ya la nueva
```
Alternativa oficial: `claude install latest` (o `claude update`) desde un shell **sin** sesión CLI viva — pero tiene el mismo riesgo de auto-reemplazo si corre desde ese binario, así que **la copia manual es lo más fiable**. Reversible: las versiones anteriores siguen en `versions\`.

**Distinción clave — dos instalaciones INDEPENDIENTES:**
- **CLI del terminal:** `~/.local/bin/claude.exe` (en PATH) → lo actualiza `claude update` del terminal.
- **App de escritorio:** trae su **propio** Claude Code en `%APPDATA%\Claude\claude-code\<versión>\`; las sesiones lanzadas **desde la app** corren **esa** versión, no la del terminal. `claude update` del terminal **NO la toca** — la actualiza la propia app (reiniciarla / su autoactualización).
- Comprueba cuál usas: `Get-Process claude* | Select-Object Path`. Si las rutas son `WindowsApps\Claude…` o `AppData\Roaming\Claude\claude-code\…`, tus sesiones van por la **app**, no por el CLI del terminal → actualizar el CLI no cambia tus sesiones.

---

## Cómo añadir una entrada

Una entrada útil tiene: **síntoma literal** (lo que se ve en pantalla), **causa raíz** (por qué pasa, no solo qué lo arregla), **diagnóstico reproducible** (comandos con su output esperado) y **solución verificada** — verificada de verdad, no supuesta ([[verificacion_fuente_primaria]]). Si solo tienes una hipótesis, escríbela **como hipótesis**.

> Pieza de catálogo `general/comun/`. Referencia de troubleshooting (no es doctrina). Rutas con `~`/`%APPDATA%` por portabilidad.
> Adaptada al enfoque neutro de la plantilla (sin referencias a repositorios de software) — 2026-07-29. Lo específico de software vive en el pack `codigo/`.
