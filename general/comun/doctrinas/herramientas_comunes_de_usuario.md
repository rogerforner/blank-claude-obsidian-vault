---
name: Herramientas comunes de usuario — se instalan una vez y quedan apuntadas
description: Una herramienta que sirve a varios coordinadores se instala una sola vez a nivel de usuario, no por asunto ni por vault, y queda apuntada con cómo se instala y cómo se comprueba. Entre vaults de la misma máquina, los coordinadores generales se consultan antes de instalar y se avisan al hacerlo. Primera entrada: el navegador, con Playwright CLI.
type: doctrine
version: 1.1
index_summary: >-
  **Una herramienta que sirve a varios coordinadores se instala UNA vez a nivel de usuario**, no por asunto ni por vault, y queda apuntada con cómo se instala y cómo se comprueba, para que una máquina nueva la reproduzca y el director pueda hacerlo solo. **Entre vaults de la misma máquina, el general pregunta a los otros generales antes de instalar una y les avisa al hacerlo**, para no acabar con dos herramientas para lo mismo. Primera entrada: **el navegador es Playwright CLI** (`playwright-cli`, skill de usuario), no el navegador integrado ni Claude in Chrome, que piden confirmación humana y no sirven para trabajo desatendido.
---

Si dos coordinadores necesitan lo mismo, instalarlo dos veces es trabajo repetido y dos versiones que derivan. Una herramienta reutilizable se instala **una vez, a nivel de usuario**, y esta doctrina la apunta con tres datos: por qué esa y no otra, cómo se instala y cómo se comprueba. Con eso una máquina nueva la reproduce y el director puede hacerlo sin ayuda.

Una entrada nueva se añade solo cuando una herramienta ya la necesita más de un coordinador, no por adelantado.

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

Relacionada: [[orquestacion_sesiones_por_herramienta]], [[higiene_contexto_y_tokens]], [[adopcion_tooling_externo_caso_uso_concreto]].

> Pieza de catálogo `general/comun/doctrinas/`. **v1.0 (2026-10-04):** nace con la decisión del director del 2026-10-04: una herramienta común de navegador para todos los coordinadores, instalada una sola vez. **v1.1 (2026-10-07):** sección *Entre vaults de la misma máquina*, por decisión del director: los generales se consultan antes de instalar y se avisan al hacerlo. Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado y **no se hereda** automáticamente.
