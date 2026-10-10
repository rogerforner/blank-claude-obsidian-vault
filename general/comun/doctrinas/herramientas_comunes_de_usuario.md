---
name: Herramientas comunes de usuario — se instalan una vez y quedan apuntadas
description: Una herramienta que sirve a varios coordinadores se instala una sola vez a nivel de usuario, no por asunto ni por vault, y queda apuntada con cómo se instala y cómo se comprueba. Entre vaults de la misma máquina, los coordinadores generales se consultan antes de instalar y se avisan al hacerlo. Entradas: el navegador (Playwright CLI), la interfaz de sesiones (Herdr), varias cuentas de Claude Code en una máquina, el cliente de API (Bruno) y las bases de datos (elegidas, sin instalar).
type: doctrine
version: 1.4
index_summary: >-
  **Una herramienta que sirve a varios coordinadores se instala UNA vez a nivel de usuario**, no por asunto ni por vault, y queda apuntada con cómo se instala y cómo se comprueba, para que una máquina nueva la reproduzca y el director pueda hacerlo solo. **Entre vaults de la misma máquina, el general pregunta a los otros generales antes de instalar una y les avisa al hacerlo**, para no acabar con dos herramientas para lo mismo. Entradas: **el navegador es Playwright CLI** (`playwright-cli`, skill de usuario), no el navegador integrado ni Claude in Chrome, que piden confirmación humana y no sirven para trabajo desatendido, y una receta fija de `run-code` para ver los `Set-Cookie`, que `response-headers` no enseña; **la interfaz de sesiones es Herdr**, con su integración y su skill; **varias cuentas de Claude Code en una máquina** se montan con un directorio de configuración por cuenta adicional, nunca para la cuenta por defecto; **el cliente de API es Bruno** (app y CLI a la misma versión, el agente usa la CLI y nunca MCP, y la barrera de escritura es la credencial de solo lectura en el recurso); y **las bases de datos** tienen elegidas `hsql` para el agente y DBeaver CE para la persona, `[ELEGIDA, SIN INSTALAR]` hasta que un asunto tenga que consultar una.
---

Si dos coordinadores necesitan lo mismo, instalarlo dos veces es trabajo repetido y dos versiones que derivan. Una herramienta reutilizable se instala **una vez, a nivel de usuario**, y esta doctrina la apunta con tres datos: por qué esa y no otra, cómo se instala y cómo se comprueba. Con eso una máquina nueva la reproduce y el director puede hacerlo sin ayuda.

Una entrada nueva se añade solo cuando una herramienta ya la necesita más de un coordinador, no por adelantado. Excepción: una herramienta ya elegida pero aún no necesaria puede apuntarse marcada `[ELEGIDA, SIN INSTALAR]`, siempre con su **umbral escrito** (el hecho concreto que dispara la instalación); sin umbral, no se abre.

## Entre vaults de la misma máquina

Una instalación a nivel de usuario la ven todos los vaults de la máquina, no solo este, y en una misma máquina pueden convivir varios (uno personal y otro de trabajo, por ejemplo), cada uno con su coordinador general. Si cada vault elige e instala por su cuenta, acaban dos herramientas para lo mismo, dos versiones y dos formas de usarlas. Por eso, decisión del director del 2026-10-07:

- **Antes de instalar o proponer una herramienta nueva,** el coordinador general pregunta por el canal entre sesiones a los generales de los otros vaults abiertos en la máquina si ya hay una para esa necesidad. Si la hay, se usa esa.
- **Al instalarla,** les avisa con qué es, cómo se instala y cómo se comprueba. Cada vault la apunta en su propio registro (en este vault, esta doctrina) y no copia el del otro.
- **Un coordinador de asunto no lo hace por su cuenta:** si necesita una herramienta nueva, la pide al general de su vault.
- **Lo que cada vault decide sobre si usarla es suyo.** Avisar no obliga al otro vault a adoptarla.

Las investigaciones sobre herramientas de usuario que el director encarga desde un vault viven en su `_meta/estudios/herramientas-de-usuario/`, y su síntesis se comparte con los otros generales de la máquina.

## Navegador: Playwright CLI

### Por qué esta forma

- Es el paquete `@playwright/cli`, que lleva dentro `playwright-core`. Para agentes de código, el README oficial de `microsoft/playwright-mcp` recomienda la CLI con skills y no el servidor MCP: "CLI invocations are more token-efficient: they avoid loading large tool schemas and verbose accessibility trees into the model context". El MCP queda para bucles que necesitan estado persistente e introspección continua.
- Comparativas de terceros miden del orden de cuatro veces menos tokens por tarea con la CLI. Es un dato de terceros, no medido aquí.
- Cada orden escribe la instantánea de la página en `.playwright-cli/`, dentro de la carpeta de trabajo, y devuelve la ruta en lugar del árbol entero. De ahí el ahorro.
- Usa el Chrome ya instalado en la máquina: no descarga navegador. Si la máquina no tiene Chrome, `playwright-cli install-browser`.
- El navegador integrado (`mcp__Claude_Browser`) y Claude in Chrome tienen herramientas con interacción de usuario obligatoria: piden confirmación en todos los modos, también en "Omitir permisos". **No se usan para trabajo desatendido.**

### Instalación

    npm install -g @playwright/cli@latest
    playwright-cli install --skills --global

La segunda orden deja la skill en `~/.claude/skills/playwright-cli`, disponible para todas las sesiones del usuario. Se carga en caliente, sin reiniciar la sesión.

### Comprobación

    playwright-cli --version

Y una prueba completa en una carpeta de trabajo cualquiera: `playwright-cli open <url>`, `playwright-cli snapshot` y `playwright-cli close`. Tiene que aparecer una instantánea en `.playwright-cli/` y la orden tiene que devolver su ruta.

### Uso

- **Una sesión con nombre por asunto:** `-s=<asunto>`, para no mezclar páginas de trabajos distintos.
- **`--persistent` solo cuando haga falta iniciar sesión en una web.** Guarda cookies y almacenamiento en `~/Library/Caches/ms-playwright/daemon/<hash>/ud-<sesión>-chrome`, fuera del vault: los inicios de sesión no acaban versionados.
- **Las credenciales nunca se escriben en el vault**, ni en notas, ni en instantáneas guardadas. Si una instantánea las contiene, se borra.
- Sin pantalla por defecto; `--headed` la muestra.
- **`playwright-cli close` al terminar**, para no dejar navegadores abiertos.
- La carpeta `.playwright-cli/` está ignorada por el control de versiones (`**/.playwright-cli/`).
- Entregar algo fuera, firmar o comprometer dinero desde una web sigue siendo puerta humana: la herramienta navega, no decide.

### Cookies que pone una web: la receta de `Set-Cookie`

- **El hueco.** `response-headers <n>` no muestra `Set-Cookie`: usa las cabeceras "seguras" de Playwright, que excluyen las de cookies. `cookie-list` (y `context.cookies()`) solo enseñan lo que Chrome llega a guardar, y Chrome rechaza por política algunas de terceros. Para saber qué cookies pone una web cuentan las cabeceras, no lo guardado.
- **Cómo se usa.** Con la página ya abierta (`playwright-cli -s=<asunto> open <url>`), y la receta del catálogo (`playwright-cli -s=<asunto> run-code --filename=<ruta de la receta>`; la opción existe: `playwright-cli run-code --help`). La receta **recarga la página abierta** para registrar las respuestas desde el principio y espera a que la red quede en reposo; el resultado sale en JSON bajo `### Result`. Solo recoge cookies puestas por cabecera; las que la página escribe con `document.cookie` se ven con `cookie-list`. `run-code` toma una sola expresión de función y no dispone de `require`, `process` ni `fs`.

- **La receta** vive en `general/comun/scripts/receta-set-cookie.js` (desde un asunto, `../../general/comun/scripts/receta-set-cookie.js`) y no se copia: se usa desde ahí, con `playwright-cli -s=<asunto> run-code --filename=<ruta de la receta>`.

- **Medido** (2026-10-08, Playwright CLI 0.1.22, Chrome del sistema, macOS), con un script de un solo uso que levanta dos servidores locales (primera parte, y tercera parte en un iframe; cookies por cabecera en documento, píxel y `fetch`, y una por JavaScript): `requests --static` y `console` ven el iframe de terceros; `response-headers` no enseña `Set-Cookie`; la receta recoge los 4 `Set-Cookie` (1 de primera parte y 3 de tercera); un control negativo sobre una página sin cookies devuelve 0. Cinco comprobaciones [OK].

## Interfaz de sesiones: Herdr

### Por qué esta forma

Herdr es la interfaz donde viven las sesiones del vault. Por qué una pestaña por rol y cómo se usa está en [[orquestacion_sesiones_por_herramienta]] y en [[ciclo_de_tandas]]; aquí solo se apunta cómo se instala y se comprueba.

### Instalación

    brew install herdr
    herdr integration install claude
    mkdir -p ~/.claude/skills/herdr && herdr --skill > ~/.claude/skills/herdr/SKILL.md

La integración deja un hook "managed by herdr" en el `settings.json` de usuario, que solo informa del estado a Herdr. La skill se genera con la versión instalada.

### Comprobación

    herdr --version
    herdr integration status
    herdr --skill | cmp - ~/.claude/skills/herdr/SKILL.md

`integration status` tiene que mostrar la línea `claude: current`. `cmp` no debe imprimir nada: comprueba que la skill está al día con la versión instalada. Dentro de Herdr, `herdr agent list` lista las sesiones.

### Actualizar

    brew upgrade herdr

y después regenerar la skill con la tercera orden de la instalación. Si `herdr update` convive con la instalación por Homebrew: **[POR MEDIR]**.

## Varias cuentas de Claude Code en una máquina

Una persona puede tener en la misma máquina más de una cuenta (una personal y otra de trabajo, por ejemplo). Cada cuenta adicional lleva su propio directorio de configuración, que se elige con `CLAUDE_CONFIG_DIR`.

- **Un directorio por cuenta adicional:** `mkdir -m 700 ~/.claude-<cuenta>`.
- **La cuenta por defecto nunca define `CLAUDE_CONFIG_DIR`.** Está documentado por un tercero (la variable cambia la entrada del llavero donde se guarda la credencial); no medido aquí.
- **Qué se enlaza** (enlace simbólico desde el directorio de la cuenta hacia `~/.claude`): `settings.json`, `hooks/` y cada skill de usuario por separado. **Qué no se enlaza:** las skills sincronizadas de otra organización, `plugins/`, `projects/`, `.claude.json` y las credenciales. **Cada skill de usuario nueva se enlaza también en cada directorio de cuenta.**
- **Alias** en el `~/.zshrc`, uno por cuenta adicional:

      alias claude-<cuenta>='env -u ANTHROPIC_API_KEY -u CLAUDE_SECURESTORAGE_CONFIG_DIR CLAUDE_CONFIG_DIR=$HOME/.claude-<cuenta> claude'

- **No se activa `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` ni se define `CLAUDE_SECURESTORAGE_CONFIG_DIR`.**
- **El login lo hace el titular**, con la variable puesta: `CLAUDE_CONFIG_DIR=~/.claude-<cuenta> claude auth login` (con `--sso` si la organización lo usa).
- **Herdr:** `--env CLAUDE_CONFIG_DIR=...` en `herdr workspace create`, `tab create` y `pane split`. El script de relevo (`relevo.mjs`) lo propaga solo cuando la sesión la tiene.
- **`claude -p` hereda la variable del padre;** lanzada desde un script, se pasa explícita.
- **Comprobación:** la línea `[CUENTA]` del hook de arranque y `claude auth status --json` (`configDirectory`, `orgId`, `subscriptionType`). Es necesaria pero no suficiente: puede no reflejar el token que realmente se usa. Se complementa con el consumo que muestra claude.ai.
- Un `settings.json` compartido hace que `/model` cambie en las dos cuentas *(dato de terceros)*.

## Cliente de API: Bruno

### Por qué esta forma

Bruno guarda las colecciones como ficheros de texto, que se versionan y se leen sin la aplicación, y tiene CLI para el agente. La comparativa y lo medido están en el registro de estudios del vault, en la síntesis de decisiones de herramientas de usuario.

### Instalación

    brew install --cask bruno
    npm install -g @usebruno/cli@<la misma versión que la app>

### Ajustes

La app guarda las preferencias en `~/Library/Application Support/bruno/preferences.json` (medido tras apagar la actualización desde la propia app). Claves, bajo `preferences`:

- **Actualización automática: se apaga, obligatorio.** `autoupdate.downloadUpdates` en `false`. App y CLI tienen que ir a la misma versión y se actualizan juntas a mano; la cask lleva además `auto_updates`.
- **Telemetría: opcional.** `telemetry.enabled`; por defecto `true`. Envía un aviso diario anónimo con el sistema operativo y la versión. Se apaga desde los ajustes de la app.
- **Mock Server: opcional.** Servidor local activado por defecto desde la 4.2.0: `beta.mock-server` en `true`. Se apaga desde los ajustes de la app, en la sección beta.

### Actualizar

Las dos a la vez y a la misma versión: `brew upgrade --cask bruno` y `npm install -g @usebruno/cli@<versión>`.

### Comprobación

La versión de la app (`CFBundleShortVersionString` de su `Info.plist`) tiene que ser igual a la salida de `bru --version`.

### Uso por el agente

- **La CLI (`bru run`), nunca un MCP:** el MCP devuelve el cuerpo entero de la respuesta al contexto.
- **Secretos** en un `.env` de la colección ignorado por git o en variables del proceso, nunca en el `.bru`. La CLI carga el `.env` de la colección (medido).
- **Informe** con `--reporter-json` a un temporal, y recorte con `jq`: el estado HTTP sale con `jq '.[0].results[0].response.status' <informe>` (medido).
- **`--reporter-skip-headers Authorization`** para que la credencial no acabe en el informe.
- **Barrera:** la credencial de solo lectura en el recurso. Las reglas de permisos del agente no cuentan como barrera: no restringen en "Omitir permisos" y su fiabilidad la discuten terceros. Escribir en producción sigue siendo decisión del titular.

## Bases de datos: elegida, sin instalar

`[ELEGIDA, SIN INSTALAR]`. **Umbral:** se instala con el primer asunto que tenga que consultar una base de datos.

- **Agente: `hsql`**, con los perfiles `read_only` y `timeout` en `~/.config/harlequin/harlequin.toml`, sin secretos en el fichero (con `${VAR}`). **La barrera es un usuario de base de datos con solo SELECT** y un tiempo máximo por sentencia asignado a ese usuario; los perfiles son una segunda capa.
- **Persona: DBeaver CE**, con la IA integrada sin proveedor configurado y sin guardar contraseñas de producción. El agente no lee nunca su configuración.
- **Reserva: DBHub**, solo para SQL Server o si hace falta MCP.
- **Receta** *(documentada, sin medir)*: `uv tool install 'harlequin[postgres,mysql]==<versión fijada>'`; `hsql --skill -o ~/.claude/skills/hsql/` (y el enlace en cada directorio de cuenta). Comprobaciones: `--info`; una escritura rechazada; `timeout` con salida 4; `--stats` con `truncated`; `--config show` con la contraseña enmascarada.
- **Sin confirmar:** que el adaptador MySQL cumpla `implements_read_only`, la telemetría de hsql y su versión real.

Relacionada: [[orquestacion_sesiones_por_herramienta]], [[higiene_contexto_y_tokens]], [[adopcion_tooling_externo_caso_uso_concreto]].

> Pieza de catálogo `general/comun/doctrinas/`. **v1.0 (2026-10-04):** nace con la decisión del director del 2026-10-04: una herramienta común de navegador para todos los coordinadores, instalada una sola vez. **v1.1 (2026-10-07):** sección *Entre vaults de la misma máquina*, por decisión del director: los generales se consultan antes de instalar y se avisan al hacerlo. **v1.2 (2026-10-07):** entradas de Herdr (interfaz de sesiones) y de varias cuentas de Claude Code en una máquina. **v1.3 (2026-10-07):** entradas de Bruno (cliente de API) y de bases de datos (elegida, sin instalar), y la excepción `[ELEGIDA, SIN INSTALAR]` con umbral. **v1.4 (2026-10-11):** receta fija de `run-code` para ver los `Set-Cookie`, que `response-headers` no enseña. Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado y **no se hereda** automáticamente.
