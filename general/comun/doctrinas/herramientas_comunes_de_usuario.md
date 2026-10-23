---
name: Herramientas comunes de usuario — se instalan una vez y quedan apuntadas
description: Una herramienta que sirve a varios coordinadores se instala una sola vez a nivel de usuario, no por asunto ni por vault. Esta doctrina apunta por qué esa herramienta y cómo la usa el vault; cómo se instala, se comprueba y se actualiza vive en un manual por herramienta, en el catálogo (`general/comun/herramientas-de-usuario/`), que viaja con la plantilla. Entre vaults de la misma máquina, los coordinadores generales se consultan antes de instalar y se avisan al hacerlo. Entradas: el navegador (Playwright CLI), la interfaz de sesiones (Herdr), varias cuentas de Claude Code en una máquina, el cliente de API (Bruno) y las bases de datos (Harlequin). Un MCP cuyo recurso es de un asunto se veta en los demás con `deniedMcpServers` (no se conecta) y `deny` (segunda capa); y una sección dice qué MCP, conectores y skills carga cada coordinador, cómo se apagan y qué ahorra, con la medición.
type: doctrine
version: 2.11
index_summary: >-
  Una herramienta que sirve a varios coordinadores se instala una sola vez a nivel de usuario, no por asunto ni por vault. La instalación vive en un manual por herramienta del catálogo; la doctrina apunta cómo la usa el vault. Entre vaults, los generales se consultan antes. Un MCP de un asunto se veta en los demás con `deniedMcpServers` y `deny`; el perfil decide qué carga cada asunto.
---

Si dos coordinadores necesitan lo mismo, instalarlo dos veces es trabajo repetido y dos versiones que derivan. Una herramienta reutilizable se instala **una vez, a nivel de usuario**, y esta doctrina apunta por qué esa y no otra y cómo la usa el vault. Cómo se instala y se comprueba vive en su manual, en el catálogo (`general/comun/herramientas-de-usuario/`, uno por herramienta), que viaja con la plantilla: con eso una máquina nueva la reproduce y el director puede hacerlo sin ayuda.

Una entrada nueva se añade solo cuando una herramienta ya la necesita más de un coordinador, no por adelantado. Excepción: una herramienta ya elegida pero aún no necesaria puede apuntarse marcada `[ELEGIDA, SIN INSTALAR]`, siempre con su **umbral escrito** (el hecho concreto que dispara la instalación); sin umbral, no se abre. Hoy no hay ninguna en ese estado.

## El manual de instalación

Una herramienta instalada **deja su manual** y al reinstalar se **sigue el manual**, sin buscar en Internet; lo aprendido al instalar vuelve al manual en el mismo commit. Las reglas y la estructura fija de un manual (fuente única) están en [`README.md`](../herramientas-de-usuario/README.md) de esa carpeta. Un manual se corrige en el mismo commit que la desviación que descubre y se copia a la plantilla.

## Entre vaults de la misma máquina

Una instalación a nivel de usuario la ven todos los vaults de la máquina, no solo este, y en una misma máquina pueden convivir varios (uno personal y otro de trabajo, por ejemplo), cada uno con su coordinador general. Si cada vault elige e instala por su cuenta, acaban dos herramientas para lo mismo, dos versiones y dos formas de usarlas. Por eso, decisión del director del 2026-10-07:

- **Antes de instalar o proponer una herramienta nueva,** el coordinador general pregunta por el canal entre sesiones a los generales de los otros vaults abiertos en la máquina si ya hay una para esa necesidad. Si la hay, se usa esa.
- **Al instalarla,** les avisa con qué es y con qué manual. El manual viaja con el catálogo desde la plantilla; cada vault apunta aquí solo por qué la usa y cómo. Si un general corrige un manual, lo sube a la plantilla y avisa a los otros generales para que lo traigan con su próxima actualización.
- **Un coordinador de asunto no lo hace por su cuenta:** si necesita una herramienta nueva, la pide al general de su vault.
- **Lo que cada vault decide sobre si usarla es suyo.** Avisar no obliga al otro vault a adoptarla.
- **Excepción: las herramientas de una máquina concreta** (por ejemplo, las de macOS) las instala el coordinador de equipo de esa máquina y redacta el manual en su `docs/`. El general, tras consultar a los generales de los otros vaults, lo funde en `general/comun/herramientas-de-usuario/` (subsección `### macOS`), porque `general/` es solo lectura para los asuntos; ver [[coordinador_de_equipo]].

Las investigaciones sobre herramientas de usuario que el director encarga desde un vault viven en su `_meta/estudios/herramientas-de-usuario/`, y su síntesis se comparte con los otros generales de la máquina.

## Uso de Claude y contexto a la vista

- **Por qué.** El consumo de la ventana de 5 horas y semanal y el contexto de cada sesión se ven mientras se trabaja, sin abrir `/usage`, y cada coordinador puede leer el suyo con `cat` para decidir cuándo relevarse.
- **Fuente única: el JSON de la línea de estado.** Claude Code lo pasa al script en cada refresco; es el dato que da la propia herramienta, sin red y sin credenciales. El script y su prueba viven en `general/comun/scripts/` (`statusline.sh`, `probar-statusline.sh`); la instalación, los ficheros que deja y la configuración de Herdr, en el manual.
- **Se descartó** lo que lee el token de la cuenta (consulta la cuenta con una credencial, lo que en este vault no hace ninguna herramienta) y los estimadores tipo `ccusage` (calculan desde los registros locales, no del dato real del servicio).
- **Cómo se decide con estos datos** (consumo de 5 horas frente al tiempo de la ventana, `/compact`, `/clear` o relevo según el contexto): está en [[higiene_contexto_y_tokens]], que es donde viven los umbrales. Aquí no se repiten.

**Manual:** [linea-de-estado.md](../herramientas-de-usuario/linea-de-estado.md)

## Navegador: Playwright CLI

### Por qué esta forma

- Es el paquete `@playwright/cli`, que lleva dentro `playwright-core`. Para agentes de código, el README oficial de `microsoft/playwright-mcp` recomienda la CLI con skills y no el servidor MCP: "CLI invocations are more token-efficient: they avoid loading large tool schemas and verbose accessibility trees into the model context". El MCP queda para bucles que necesitan estado persistente e introspección continua.
- Comparativas de terceros miden del orden de cuatro veces menos tokens por tarea con la CLI. Es un dato de terceros, no medido aquí.
- Cada orden escribe la instantánea de la página en `.playwright-cli/`, dentro de la carpeta de trabajo, y devuelve la ruta en lugar del árbol entero. De ahí el ahorro.
- Usa el Chrome ya instalado en la máquina: no descarga navegador.
- El navegador integrado (`mcp__Claude_Browser`) y Claude in Chrome tienen herramientas con interacción de usuario obligatoria: piden confirmación en todos los modos, también en "Omitir permisos". **No se usan para trabajo desatendido.**

**Manual:** [playwright-cli.md](../herramientas-de-usuario/playwright-cli.md)

### Uso

- **Una sesión con nombre por asunto:** `-s=<asunto>`, para no mezclar páginas de trabajos distintos.
- **`--persistent` solo cuando haga falta iniciar sesión en una web.** Guarda cookies y almacenamiento en `~/Library/Caches/ms-playwright/daemon/<hash>/ud-<sesión>-chrome`, fuera del vault: los inicios de sesión no acaban versionados.
- **Las credenciales nunca se escriben en el vault**, ni en notas, ni en instantáneas guardadas. Si una instantánea las contiene, se borra.
- Sin pantalla por defecto; `--headed` la muestra.
- **`playwright-cli close` al terminar**, para no dejar navegadores abiertos.
- La carpeta `.playwright-cli/` está ignorada por el control de versiones (`**/.playwright-cli/`).
- **Las interfaces las prueba el subagente `probador-ui`, no el coordinador en su sesión** (definición en `.claude/agents/probador-ui.md`, plantilla en `inicializador/plantilla-agente-probador-ui.md`). El coordinador le da URL, pasos, qué se espera, nombre de sesión y fichero `informe-probador-*.md`; el probador solo escribe ese informe (el hook rechaza cualquier otra escritura, medido el 2026-10-22). Conexión al Chrome del director solo a petición expresa.
- **Una página local se prueba servida por http en 127.0.0.1**, no con `file:` (la CLI lo bloquea; ver el manual). El probador no lo esquiva: lo cuenta y para. Medido el 2026-10-22.
- **Un `probador-ui` recién creado tarda unos minutos en aparecer en una sesión ya abierta** (antes, `Agent type 'probador-ui' not found`); ver [[ciclo_de_tandas]]. Lanzado por `claude -p`, necesita `--permission-mode bypassPermissions` (como se lanzan aquí las sesiones); sin él no puede abrir la CLI ni escribir su informe ("This command requires approval"). Con ese modo la prueba de dos pasos salió bien, cerró su sesión y dejó `.playwright-cli/` vacío. Medido el 2026-10-22.
- Entregar algo fuera, firmar o comprometer dinero desde una web sigue siendo puerta humana: la herramienta navega, no decide.

### Cookies que pone una web: la receta de `Set-Cookie`

- **El hueco.** `response-headers <n>` no muestra `Set-Cookie`: usa las cabeceras "seguras" de Playwright, que excluyen las de cookies. `cookie-list` (y `context.cookies()`) solo enseñan lo que Chrome llega a guardar, y Chrome rechaza por política algunas de terceros. Para saber qué cookies pone una web cuentan las cabeceras, no lo guardado.
- **Cómo se usa.** Con la página ya abierta (`playwright-cli -s=<asunto> open <url>`), y la receta del catálogo (`playwright-cli -s=<asunto> run-code --filename=<ruta de la receta>`; la opción existe: `playwright-cli run-code --help`). La receta **recarga la página abierta** para registrar las respuestas desde el principio y espera a que la red quede en reposo; el resultado sale en JSON bajo `### Result`. Solo recoge cookies puestas por cabecera; las que la página escribe con `document.cookie` se ven con `cookie-list`. `run-code` toma una sola expresión de función y no dispone de `require`, `process` ni `fs`.

- **La receta** vive en `general/comun/scripts/receta-set-cookie.js` (desde un asunto, `../../general/comun/scripts/receta-set-cookie.js`) y no se copia: se usa desde ahí, con `playwright-cli -s=<asunto> run-code --filename=<ruta de la receta>`.

- **Medido** (2026-10-08, Playwright CLI 0.1.22, Chrome del sistema, macOS), con un script de un solo uso que levanta dos servidores locales (primera parte, y tercera parte en un iframe; cookies por cabecera en documento, píxel y `fetch`, y una por JavaScript): `requests --static` y `console` ven el iframe de terceros; `response-headers` no enseña `Set-Cookie`; la receta recoge los 4 `Set-Cookie` (1 de primera parte y 3 de tercera); un control negativo sobre una página sin cookies devuelve 0. Cinco comprobaciones [OK].

## Interfaz de sesiones: Herdr

Herdr es la interfaz donde viven las sesiones del vault. Por qué una pestaña por rol y cómo se usa está en [[orquestacion_sesiones_por_herramienta]] y en [[ciclo_de_tandas]]; la instalación, la integración y la skill están en el manual.

**Manual:** [herdr.md](../herramientas-de-usuario/herdr.md)

## Varias cuentas de Claude Code en una máquina

Una persona puede tener en la misma máquina más de una cuenta (una personal y otra de trabajo, por ejemplo). Criterio: cada cuenta adicional lleva su propio directorio de configuración, la cuenta por defecto no se toca, y lo compartido entre cuentas se enlaza en lugar de copiarse. El montaje, el alias, el login y la comprobación están en el manual.

**Manual:** [claude-code-varias-cuentas.md](../herramientas-de-usuario/claude-code-varias-cuentas.md)

## Cliente de API: Bruno

### Por qué esta forma

Bruno guarda las colecciones como ficheros de texto, que se versionan y se leen sin la aplicación, y tiene CLI para el agente. La comparativa y lo medido están en el registro de estudios del vault, en la síntesis de decisiones de herramientas de usuario.
**Manual:** [bruno.md](../herramientas-de-usuario/bruno.md)

### Uso por el agente

- **La CLI (`bru run`), nunca un MCP:** el MCP devuelve el cuerpo entero de la respuesta al contexto.
- **Secretos** en un `.env` de la colección ignorado por git o en variables del proceso, nunca en el `.bru`. La CLI carga el `.env` de la colección (medido).
- **Informe** con `--reporter-json` a un temporal, y recorte con `jq`: el estado HTTP sale con `jq '.[0].results[0].response.status' <informe>` (medido).
- **`--reporter-skip-headers Authorization`** para que la credencial no acabe en el informe.
- **Barrera:** la credencial de solo lectura en el recurso. Las reglas de permisos del agente no cuentan como barrera: no restringen en "Omitir permisos" y su fiabilidad la discuten terceros. Escribir en producción sigue siendo decisión del titular.

## Bases de datos: Harlequin

Instalada en macOS (2.16.2, por `uv tool`). Decisión del director del 2026-10-22: Harlequin para la persona y para la IA, y **DBeaver CE descartado y desinstalado** (no se usaba; Harlequin es más liviano). Se reabriría si hace falta algo que Harlequin no da (por ejemplo, un diagrama de relaciones o editar datos con interfaz gráfica) y entonces se decide de nuevo.

- **Persona: `harlequin`**, interfaz de pantalla completa en terminal. Sin guardar contraseñas de producción.
- **Agente: `hsql`**, con los perfiles `read_only` y `timeout` en `~/.config/harlequin/harlequin.toml`, sin secretos en el fichero (con `${VAR}`). **La barrera es un usuario de base de datos con solo SELECT** y un tiempo máximo por sentencia asignado a ese usuario; los perfiles son una segunda capa. El agente no lee nunca la configuración de las conexiones.
- **Reserva: DBHub**, solo para SQL Server o si hace falta MCP.
- **Medido con SQLite:** `hsql -r` rechaza la escritura (salida 1) y `--stats` da `truncated`. **Sin medir:** `harlequin.toml`, la salida 4 de `--timeout`, `--config` y la solo lectura con postgres y mysql (incluida la telemetría).
- **Decisión pendiente (general, con los otros vaults):** la skill `hsql --skill -o ~/.claude/skills/hsql/` no está instalada, porque se vería en todas las sesiones de la máquina.

**Manual:** [harlequin.md](../herramientas-de-usuario/harlequin.md)

## Un MCP cuyo recurso es de un asunto

Caso: un asunto es dueño de un recurso técnico (en este vault, Home Assistant y Proxmox) y otros asuntos pueden necesitar leerlo. El MCP del recurso se instala **una vez, a nivel de usuario**, y por eso lo ven todas las sesiones; su manual vive en el `docs/` del asunto dueño, no aquí, porque es del recurso y no del kit.

- **Solo leen los asuntos que tienen datos útiles allí**, y lo decide el director, asunto por asunto: que el MCP llegue a todos no significa que todos deban usarlo. Un asunto que no es consumidor lleva el servidor **en `deniedMcpServers`** (`{"serverName": "<servidor>"}`, en el `settings.json` del asunto: el servidor no se conecta y no entra ni una herramienta ni sus instrucciones) **y además** entero en su `deny` (`mcp__<servidor>`). El `deny` solo quita las herramientas y deja las instrucciones del servidor en el contexto (en `ha-mcp`, unos 740 tokens, medido); se mantiene como segunda capa por si `deniedMcpServers` deja de respetarse desde un proyecto (el esquema lo describe como ajuste de empresa). En este vault, `ha-mcp` es de `homeassistant`, su dueño; lo leen `climatizacion` y `homelab`; y los demás asuntos lo tienen vetado. `proxmox` lo usa solo `homelab`, su dueño, y los demás asuntos lo tienen vetado y le piden lo que necesiten por el canal (director, 2026-10-14). **La raíz no lo deniega** (director, 2026-10-15): un `deny` en el `settings.local.json` de la raíz alcanza a todas las sesiones del vault, también a la del dueño (medido: con él, `homelab` no veía ninguna herramienta de Proxmox; sin él, las ve), y el `settings.json` de la raíz es del kit. **Ni `deniedMcpServers` ni `deny` van nunca en el `settings.local.json` de la raíz:** es el local canónico de todo el vault y alcanza también al dueño (medido). El general ve el MCP y no lo usa: lo que necesite de Proxmox se lo pide a `homelab`.
- **El dueño puede escribir, y su barrera está en el recurso:** el token del MCP lleva solo los permisos que el dueño necesita (en Proxmox, auditor en todo y operación en una sola VM), y el secreto sale del llavero a través de un envoltorio local, nunca escrito en la configuración del cliente. El código del MCP se revisa antes de instalarlo, se fija un commit y las dependencias se instalan sin scripts; su ruta, su envoltorio y cómo se actualiza van al manual del dueño.

- **Lectura sí, escritura no.** Los consumidores leen estados, entidades, historial y configuración; los cambios se le piden al dueño. La línea la pone el dueño del recurso.
- **Las entradas por herramienta** del `deny` (`mcp__<servidor>__<prefijo>*`, la barrera de escritura de un consumidor) **no** van en `deniedMcpServers`: un servidor vetado ahí no conecta en ese asunto, ni para leer.
- **Barrera de escritura:** cada asunto consumidor lleva en el `deny` de su perfil las herramientas de escritura del MCP, **por prefijo** (`mcp__<servidor>__<prefijo>*`). Medido el 2026-10-14 en Claude Code con "Omitir permisos": la herramienta denegada desaparece de la sesión y las de lectura siguen funcionando; la prueba de control sin la regla la mostraba. La capa del recurso —un usuario sin permisos de escritura para los consumidores— no está montada: se monta el día que un consumidor necesite escribir.
- **Prefijos de `ha-mcp`** que se deniegan: `ha_bulk_`, `ha_call_`, `ha_config_set_`, `ha_config_remove_`, `ha_config_delete_`, `ha_manage_`, `ha_reload_`, `ha_restart`, `ha_remove_`, `ha_set_` y `ha_report_`. Quedan `ha_get_`, `ha_config_get_`, `ha_config_list_`, `ha_list_`, `ha_search` y `ha_eval_template`.
- **Al actualizar el MCP**, el dueño lista sus herramientas y mira si alguna de escritura ha entrado con un prefijo nuevo; si es así, se añade al `deny` de cada consumidor. Una herramienta nueva con un prefijo no denegado entra abierta sin avisar.
- **Comprobación**, desde la carpeta del asunto: `node general/comun/scripts/medir-arranque.mjs <carpeta> --esperar-ausente <servidor>` en un no consumidor (el servidor no debe aparecer entre los MCP conectados) y `--esperar-presente <servidor>` en el dueño o un consumidor; sale 1 si no se cumple. En un consumidor, además, `claude -p` con "Omitir permisos" que haga una búsqueda de lectura y pida con ToolSearch una herramienta de escritura: tiene que leer y no encontrarla. Cada medición es una sesión `-p` de un turno contra la cuota.

## Qué carga cada asunto: MCP, conectores y skills

Cada coordinador arranca con lo que cargan sus ajustes, y cada cosa que carga y no usa cuesta contexto en todas las peticiones. El kit lo recorta **por perfil** (`.claude/settings.json` del asunto, en el vault; las plantillas del `inicializador/`), sin tocar `~/.claude.json` ni ningún `settings.local.json`. El cómo, paso a paso, está en las NOTAS de cada plantilla (`inicializador/plantilla-settings-*.NOTAS.md`) y en `inicializador/checklist-arranque.md`; aquí va el criterio y lo medido.

| Qué | Mecanismo en el `settings.json` | Efecto |
|---|---|---|
| MCP de usuario, por asunto | `deniedMcpServers: [{"serverName": "<servidor>"}]` | **No se conecta**: desaparece con sus herramientas y sus instrucciones |
| MCP, solo herramientas | `permissions.deny: ["mcp__<servidor>"]` | **Se conecta y se deniega**: las herramientas desaparecen, las instrucciones del servidor siguen en contexto |
| Conectores de claude.ai, todos | `"disableClaudeAiConnectors": true` | No se piden ni se conectan (basta que lo diga un solo ajuste) |
| Un conector suelto | `deniedMcpServers: [{"serverName": "claude.ai Gmail"}]` | No se conecta |
| Skill | `skillOverrides: {"<nombre>": "off"}`; valores `on`, `name-only` (solo el nombre, sin descripción), `user-invocable-only` (oculta al modelo y deja `/nombre`) y `off` (oculta a los dos) | `off` la quita del contexto y de `/` |
| Plugin | `enabledPlugins: {"<plugin>@<marketplace>": false}` | No se carga |

- **Precedencia y dónde está el "local".** En una skill gana el ajuste local sobre el de proyecto. El `settings.local.json` canónico es el **de la raíz git** del vault; el del asunto se sigue leyendo como legado y se funde. Por eso el local de la raíz llega a todos los asuntos, y una línea `"on"` en el `settings.json` de un asunto no reactiva lo que el local de la raíz apaga.
- **Lo que es del vault entero.** `disabledMcpServers` en un `settings.json` de proyecto se ignora: es una clave de `~/.claude.json` por proyecto, y el proyecto es la raíz git. El alcance local de un MCP también es del vault entero. Por eso un MCP de usuario no se recorta por asunto con eso, sino con `deniedMcpServers`.
- **`.mcp.json`** en una carpeta alcanza a esa y a sus hijas (uno en la raíz o en un espacio llega a todos los asuntos de debajo) y conecta sin pedir aprobación en `-p`. `${VAR}` se expande con el entorno del proceso que lanza, no con el `env` de los ajustes. **No hay `.mcp.json` versionado con secretos:** `ha-mcp` lleva un segmento secreto en su URL, que vive en `~/.claude.json`, fuera del vault, y `.gitignore` no ignora `.mcp.json`. Las claves de este cuadro no llevan secreto y van en el `settings.json` versionado.
- **Decisión por perfil (coordinador general, 2026-10-22, por la delegación de método del director).** Conectores de claude.ai fuera en todos los coordinadores y en las plantillas, incluidas las de ejecutora, repo de código y consultor. Skills apagadas en los asuntos: `code-review`, `simplify`, `security-review`, `init`, `run`, `keybindings-help`, `fewer-permission-prompts`, `schedule`, `loop`, `update-config`, `anthropic-skills:docx` y `anthropic-skills:xlsx`, y `anthropic-skills:pdf` salvo en el asunto que trabaja con fichas técnicas en PDF. Se quedan `herdr` y `playwright-cli`. La plantilla de coordinador y la de equipo apagan las diez primeras (un vault de papeles quiere los formatos); la de software, solo `keybindings-help`, `fewer-permission-prompts`, `schedule`, `loop` y `update-config`. La raíz no cambia sus skills ni veta `ha-mcp` ni `proxmox`: hacerlo exigiría igualarlo en la plantilla publicada y bloquearía el servidor a un vault nuevo que lo instalase.
- **Medido: 2026-10-22, Claude Code 2.1.308** (`medir-arranque.mjs`, contexto de la primera petición; el "antes" es con Claude Docs conectado):

| Ámbito | Antes | Después | Diferencia |
|---|---|---|---|
| raíz | 40.669 | 38.687 | -1.982 |
| dueño de un MCP | 41.558 | 37.586 | -3.972 |
| lector de un MCP, con PDF | 40.724 | 37.097 | -3.627 |
| dueño de un MCP y lector del otro | 42.251 | 38.496 | -3.755 |
| no consumidor (tres asuntos) | 39.186–40.317 | 34.530–35.505 | -4.656 a -4.822 |

  El ruido entre mediciones es de unos 60 tokens (`ha-mcp` cambia sus instrucciones). En interactivo, en un asunto no consumidor reiniciado, `/context` no muestra la categoría de herramientas MCP y las skills pesan 144 tokens (solo `herdr` y `playwright-cli`).
- **Se aplica en caliente, y el aviso engaña.** Un `settings.json` de proyecto con `disableClaudeAiConnectors` se aplica a una sesión ya abierta, sin reiniciar (visto en la del general). Claude Code lo anuncia como "blocked by the organization's managed policy" aunque sea un ajuste de proyecto: no es un bloqueo de la organización.
- **Riesgo: `deniedMcpServers` está descrito como lista de empresa** ("Enterprise denylist") y se respeta desde un `settings.json` de proyecto en la 2.1.308, pero puede cambiar sin aviso. El `deny` se queda como segunda capa, y `medir-arranque.mjs --esperar-ausente` lo delata tras una actualización de Claude Code: al actualizarla, se mide una vez en un asunto que veta un servidor. Cada medición cuesta una sesión `-p` de un turno contra la cuota.
- **Fuera del vault no hay perfil.** Una sesión en `~/Downloads` o una `claude -p` con otra raíz carga los MCP de usuario con todas sus herramientas, porque el `deny` y `deniedMcpServers` viven en los ajustes del vault. Mover los MCP de alcance de usuario al de proyecto o al local cambiaría lo que ven las sesiones de fuera y los otros vaults: es decisión del director y otro plan.

Relacionada: [[orquestacion_sesiones_por_herramienta]], [[higiene_contexto_y_tokens]], [[adopcion_tooling_externo_caso_uso_concreto]].

> Pieza de catálogo `general/comun/doctrinas/`. Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda**. Historial de versiones: [[historial-doctrinas#herramientas_comunes_de_usuario]].
