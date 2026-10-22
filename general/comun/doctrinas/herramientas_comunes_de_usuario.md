---
name: Herramientas comunes de usuario — se instalan una vez y quedan apuntadas
description: Una herramienta que sirve a varios coordinadores se instala una sola vez a nivel de usuario, no por asunto ni por vault. Esta doctrina apunta por qué esa herramienta y cómo la usa el vault; cómo se instala, se comprueba y se actualiza vive en un manual por herramienta, en el catálogo (`general/comun/herramientas-de-usuario/`), que viaja con la plantilla. Entre vaults de la misma máquina, los coordinadores generales se consultan antes de instalar y se avisan al hacerlo. Entradas: el navegador (Playwright CLI), la interfaz de sesiones (Herdr), varias cuentas de Claude Code en una máquina, el cliente de API (Bruno) y las bases de datos (elegidas, sin instalar).
type: doctrine
version: 2.8
index_summary: >-
  **Una herramienta que sirve a varios coordinadores se instala UNA vez a nivel de usuario**, no por asunto ni por vault. La doctrina apunta por qué esa y cómo la usa el vault; **cómo se instala, se comprueba y se actualiza vive en un manual por herramienta en el catálogo** (`general/comun/herramientas-de-usuario/`), que viaja con la plantilla, se sigue al reinstalar sin buscar en Internet y se corrige en el mismo commit que la desviación. **Entre vaults de la misma máquina, el general pregunta a los otros generales antes de instalar una y les avisa al hacerlo**, y el manual llega a los otros vaults con su próxima actualización desde la plantilla. Entradas: **el uso de Claude y el contexto se ven con la línea de estado**, que lee solo el JSON que Claude Code le pasa (nunca el token de la cuenta ni estimadores tipo `ccusage`), con manual propio y la lectura en Herdr; **el navegador es Playwright CLI** (`playwright-cli`, skill de usuario), no el navegador integrado ni Claude in Chrome, que piden confirmación humana y no sirven para trabajo desatendido; **las interfaces las prueba el subagente `probador-ui`, no el coordinador en su sesión**; y una receta fija de `run-code` para ver los `Set-Cookie`, que `response-headers` no enseña; **la interfaz de sesiones es Herdr**, con su integración y su skill; **varias cuentas de Claude Code en una máquina** con un directorio de configuración por cuenta adicional, nunca para la cuenta por defecto; **el cliente de API es Bruno** (app y CLI a la misma versión, el agente usa la CLI y nunca MCP, y la barrera de escritura es la credencial de solo lectura en el recurso); **las bases de datos** tienen elegidas `hsql` para el agente y DBeaver CE para la persona, `[ELEGIDA, SIN INSTALAR]` hasta que un asunto tenga que consultar una; y **un MCP cuyo recurso es de un asunto** (Home Assistant) se instala a nivel de usuario; solo lo leen los asuntos que el director declara consumidores, con la escritura denegada por prefijo en su perfil, y el resto lo tiene denegado entero (medido en "Omitir permisos"); el MCP de Proxmox, solo para su dueño, con la barrera en el token.
---

Si dos coordinadores necesitan lo mismo, instalarlo dos veces es trabajo repetido y dos versiones que derivan. Una herramienta reutilizable se instala **una vez, a nivel de usuario**, y esta doctrina apunta por qué esa y no otra y cómo la usa el vault. Cómo se instala y se comprueba vive en su manual, en el catálogo (`general/comun/herramientas-de-usuario/`, uno por herramienta), que viaja con la plantilla: con eso una máquina nueva la reproduce y el director puede hacerlo sin ayuda.

Una entrada nueva se añade solo cuando una herramienta ya la necesita más de un coordinador, no por adelantado. Excepción: una herramienta ya elegida pero aún no necesaria puede apuntarse marcada `[ELEGIDA, SIN INSTALAR]`, siempre con su **umbral escrito** (el hecho concreto que dispara la instalación); sin umbral, no se abre.

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

## Bases de datos: elegida, sin instalar

`[ELEGIDA, SIN INSTALAR]`. **Umbral:** se instala con el primer asunto que tenga que consultar una base de datos. Su manual nace con la primera instalación, en `general/comun/herramientas-de-usuario/`.

- **Agente: `hsql`**, con los perfiles `read_only` y `timeout` en `~/.config/harlequin/harlequin.toml`, sin secretos en el fichero (con `${VAR}`). **La barrera es un usuario de base de datos con solo SELECT** y un tiempo máximo por sentencia asignado a ese usuario; los perfiles son una segunda capa.
- **Persona: DBeaver CE**, con la IA integrada sin proveedor configurado y sin guardar contraseñas de producción. El agente no lee nunca su configuración.
- **Reserva: DBHub**, solo para SQL Server o si hace falta MCP.
- **Receta** *(documentada, sin medir)*: `uv tool install 'harlequin[postgres,mysql]==<versión fijada>'`; `hsql --skill -o ~/.claude/skills/hsql/` (y el enlace en cada directorio de cuenta). Comprobaciones: `--info`; una escritura rechazada; `timeout` con salida 4; `--stats` con `truncated`; `--config show` con la contraseña enmascarada.
- **Sin confirmar:** que el adaptador MySQL cumpla `implements_read_only`, la telemetría de hsql y su versión real.

## Un MCP cuyo recurso es de un asunto

Caso: un asunto es dueño de un recurso técnico (en este vault, Home Assistant y Proxmox) y otros asuntos pueden necesitar leerlo. El MCP del recurso se instala **una vez, a nivel de usuario**, y por eso lo ven todas las sesiones; su manual vive en el `docs/` del asunto dueño, no aquí, porque es del recurso y no del kit.

- **Solo leen los asuntos que tienen datos útiles allí**, y lo decide el director, asunto por asunto: que el MCP llegue a todos no significa que todos deban usarlo. Un asunto que no es consumidor lleva el servidor entero en su `deny` (`mcp__<servidor>`) y no ve ninguna de sus herramientas. En este vault, `ha-mcp` lo leen `climatizacion` y `homelab` e `iptv` lo tiene denegado entero; `proxmox` lo usa solo `homelab`, su dueño, y los demás asuntos lo tienen denegado entero y le piden lo que necesiten por el canal (director, 2026-10-14). **La raíz no lo deniega** (director, 2026-10-15): un `deny` en el `settings.local.json` de la raíz alcanza a todas las sesiones del vault, también a la del dueño (medido: con él, `homelab` no veía ninguna herramienta de Proxmox; sin él, las ve), y el `settings.json` de la raíz es del kit. El general ve el MCP y no lo usa: lo que necesite de Proxmox se lo pide a `homelab`.
- **El dueño puede escribir, y su barrera está en el recurso:** el token del MCP lleva solo los permisos que el dueño necesita (en Proxmox, auditor en todo y operación en una sola VM), y el secreto sale del llavero a través de un envoltorio local, nunca escrito en la configuración del cliente. El código del MCP se revisa antes de instalarlo, se fija un commit y las dependencias se instalan sin scripts; su ruta, su envoltorio y cómo se actualiza van al manual del dueño.

- **Lectura sí, escritura no.** Los consumidores leen estados, entidades, historial y configuración; los cambios se le piden al dueño. La línea la pone el dueño del recurso.
- **Barrera de escritura:** cada asunto consumidor lleva en el `deny` de su perfil las herramientas de escritura del MCP, **por prefijo** (`mcp__<servidor>__<prefijo>*`). Medido el 2026-10-14 en Claude Code con "Omitir permisos": la herramienta denegada desaparece de la sesión y las de lectura siguen funcionando; la prueba de control sin la regla la mostraba. La capa del recurso —un usuario sin permisos de escritura para los consumidores— no está montada: se monta el día que un consumidor necesite escribir.
- **Prefijos de `ha-mcp`** que se deniegan: `ha_bulk_`, `ha_call_`, `ha_config_set_`, `ha_config_remove_`, `ha_config_delete_`, `ha_manage_`, `ha_reload_`, `ha_restart`, `ha_remove_`, `ha_set_` y `ha_report_`. Quedan `ha_get_`, `ha_config_get_`, `ha_config_list_`, `ha_list_`, `ha_search` y `ha_eval_template`.
- **Al actualizar el MCP**, el dueño lista sus herramientas y mira si alguna de escritura ha entrado con un prefijo nuevo; si es así, se añade al `deny` de cada consumidor. Una herramienta nueva con un prefijo no denegado entra abierta sin avisar.
- **Comprobación**, desde la carpeta del consumidor: `claude -p` con "Omitir permisos" que haga una búsqueda de lectura y pida con ToolSearch una herramienta de escritura. Tiene que leer y no encontrar la de escritura.

Relacionada: [[orquestacion_sesiones_por_herramienta]], [[higiene_contexto_y_tokens]], [[adopcion_tooling_externo_caso_uso_concreto]].

> Pieza de catálogo `general/comun/doctrinas/`. **v1.0 (2026-10-04):** nace con la decisión del director del 2026-10-04: una herramienta común de navegador para todos los coordinadores, instalada una sola vez. **v1.1 (2026-10-07):** sección *Entre vaults de la misma máquina*, por decisión del director: los generales se consultan antes de instalar y se avisan al hacerlo. **v1.2 (2026-10-07):** entradas de Herdr (interfaz de sesiones) y de varias cuentas de Claude Code en una máquina. **v1.3 (2026-10-07):** entradas de Bruno (cliente de API) y de bases de datos (elegida, sin instalar), y la excepción `[ELEGIDA, SIN INSTALAR]` con umbral. **v1.4 (2026-10-11):** receta fija de `run-code` para ver los `Set-Cookie`, que `response-headers` no enseña. **v2.0 (2026-10-11):** la instalación, la comprobación, los ajustes y la actualización de cada herramienta pasan a un manual por herramienta en `general/comun/herramientas-de-usuario/` (fuente única); la doctrina conserva el porqué y el uso, y la sección *El manual de instalación*. **v2.1 (2026-10-14):** sección *Un MCP cuyo recurso es de un asunto*, por el encargo de `homeassistant` del 2026-08-16 y la decisión del director del 2026-10-14 (el MCP basta, sin tokens por asunto): lectura para todos, escritura denegada por prefijo en el perfil de cada consumidor, medido. **v2.2 (2026-10-14):** no todos los asuntos leen el MCP: solo los consumidores que declara el director, y el resto lo tiene denegado entero (`iptv`, decisión del director del mismo día). **v2.3 (2026-10-14):** segundo caso, el MCP de Proxmox: solo lo usa su dueño (`homelab`), con escritura acotada por el token en el recurso; el resto y la raíz lo tienen denegado entero, y el `deny` de la raíz no alcanza a los asuntos (medido). Revisión del código, commit fijado y secreto en el llavero. **v2.4 (2026-10-14):** el `deny` de un MCP de la máquina, en la raíz, va en su `settings.local.json`: el `settings.json` de la raíz es del kit y viaja con la plantilla. **v2.5 (2026-10-15):** el `deny` de la raíz en su `settings.local.json` alcanzaba también al dueño y dejaba a `homelab` sin el MCP (medido); la raíz deja de denegarlo, por decisión del director, y el general no lo usa. **v2.8 (2026-10-22):** quién instala las herramientas de una máquina y quién funde su manual (coordinador de equipo). **v2.6 (2026-10-22):** sección *Uso de Claude y contexto a la vista*: línea de estado como fuente, lo descartado y remisión a la higiene de contexto para las decisiones. Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado y **no se hereda** automáticamente.
