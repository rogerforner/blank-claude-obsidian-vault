# Pack `codigo/` — doctrinas para asuntos que incluyen software propio

Este es un **pack**: un paquete **opcional** de doctrinas para un dominio concreto, que se suma al catálogo transversal (`general/comun/doctrinas/`) **solo si el vault lo necesita**. Hoy es el único pack de la plantilla.

## Qué es un pack (y qué no es)

Un pack es un **añadido**, nunca un sustituto. El catálogo transversal —el **core**— contiene lo que aplica a *cualquier* trabajo coordinado entre el director y la IA, sea una reclamación, una obra, una declaración o un contrato. Un pack contiene lo que **solo tiene sentido dentro de un dominio**, y por eso no puede estar en el core sin ensuciarlo.

Tres propiedades que definen un pack en este vault:

- **El core no depende del pack.** Si ignoras `packs/` entero, no queda ninguna doctrina del core coja. Donde el core rozaba un tema de este pack, lo dice y remite aquí explícitamente — pero se entiende sin abrirlo.
- **El pack sí se apoya en el core.** Las diez doctrinas de aquí enlazan con normalidad a las del core y las dan por supuestas. Leer el pack sin el core deja piezas colgando.
- **El pack manda en su dominio, no fuera.** Nada de aquí redefine una regla del core; la **especializa** para el caso del software.

## Cuándo se instala

**Cuando el asunto incluye software propio**: código que el equipo escribe y mantiene, con su repositorio, su ciclo de cambios y su despliegue. Ese es el único disparador.

No se instala por rozar la informática. Usar una herramienta de línea de comandos, montar una hoja de cálculo, automatizar una tarea con un script de un solo uso o pedirle a la IA que procese unos PDF **no** convierte un asunto en un asunto de software: para eso ya está el core. La pregunta que decide es: *¿hay un repositorio de código propio cuyo ciclo de vida hay que gobernar?* Si la respuesta es no, este pack sobra.

Un vault puede tener asuntos de los dos tipos. El pack se instala **por asunto**, no por vault.

## Cómo se usa

**Igual que el core: se LEE, no se copia, y no se hereda.** Es exactamente la regla de oro del catálogo → [`../../README.md`](../../README.md).

1. Abre el índice del pack: [`doctrinas/MEMORY-doctrinas-index-codigo.md`](doctrinas/MEMORY-doctrinas-index-codigo.md).
2. **Declara el perfil `asunto con software` en el charter.** Eso es lo que activa el pack: no hay nada que instalar. El contenedor ya ve todo el catálogo —core y packs— en solo lectura vía `additionalDirectories: ../../general`, así que un `[[wikilink]]` a una pieza de aquí **resuelve solo**.
3. **Instala los tres perfiles de permisos del asunto**: `inicializador/plantilla-settings-coordinador-software.json` para el coordinador (sigue denegando `push`/`remote` igual que el normal; su `allow` añade el comando que entra al runtime, no un gestor de paquetes), `inicializador/plantilla-settings-ejecutora-codigo.json` para las sesiones que **editan** el código con permisos amplios sobre el repositorio (siempre contra un plan previo, ver más abajo), y `inicializador/plantilla-settings-repo-codigo.json` para la sesión aparte que hace el `push`. Los dos últimos se instalan **en el repositorio de código, fuera del vault** (`docs/emplazamiento-runtime.md` dice dónde), como ficheros de settings con nombre para no pisar la configuración que el repositorio ya pudiera tener. Por qué son tres y no uno, en sus `.NOTAS.md` respectivos.
4. **Arranca el coordinador con el prompt de software**, no el genérico: `_meta/guia-arranque-sesiones.md` § "Arrancar un coordinador de asunto de software" — le hace comprobar rama, remoto y puertas de calidad **antes de tocar nada**.
5. **El core va primero:** el pack lo presupone y enlaza a él con normalidad. Leer el pack sin el core deja piezas colgando.
6. **No apliques todas por rutina.** `pnpm_supply_chain` solo si hay Node; `higiene_disco_podman` solo si hay contenedores; las de git del asunto solo si el repositorio tiene remoto y ramas de entorno. Lo que aplica se dice en el charter.
7. **Si copias, es la excepción:** solo para **fijar** a propósito una versión (diciendo por qué) o si el contenedor va a **salir** del vault. Entonces es un **copia congelada con su `version`** y **quien copia asume traer los cambios posteriores**. Van al mismo `memoria/` que las del core, sin subcarpeta `codigo/`: la separación es del catálogo, no del asunto.
8. Si el asunto tiene repositorio de código, usa además [`README-repo-codigo.md`](README-repo-codigo.md) para su `README.md`, su `CLAUDE.md`/`AGENTS.md` y sus reglas.

## Qué NO hace este pack

- **No sustituye al core.** Un asunto de software necesita **todas** las doctrinas transversales del core igual que cualquier otro: el pack solo añade las 10 que el core no puede tener.
- **No cambia el enfoque del resto del vault.** La plantilla usa vocabulario neutro de dominio (**asunto**, **producto**, **verificaciones**, **entregar fuera**); aquí dentro se conserva el vocabulario técnico a propósito, porque el valor del pack es ser concreto. Esa excepción **empieza y acaba en `packs/codigo/`**.
- **No convierte el vault en un repositorio de código.** El vault de coordinación sigue siendo **git local, sin remoto y sin ramas de entorno**. Las doctrinas de rama, push y proveedor de hosting aplican al **repositorio de código, que vive fuera del vault** (excepcionalmente dentro de `repo/`, solo si el asunto declaró esa excepción en `docs/emplazamiento-runtime.md`), y cada una lo dice en su cabecera.
- **No documenta stacks.** Las notas de una tecnología concreta se escriben en el propio asunto, no aquí. La única pieza atada a un stack es `pnpm_supply_chain`, y está porque la cadena de suministro de paquetes es un riesgo de seguridad, no una preferencia de tooling.

## Contenido

| Fichero | Qué es |
|---|---|
| [`doctrinas/MEMORY-doctrinas-index-codigo.md`](doctrinas/MEMORY-doctrinas-index-codigo.md) | Índice del pack: una línea por doctrina. **Empieza por aquí.** |
| `doctrinas/` (10 ficheros) | Las doctrinas, con su `version` y su changelog conservados del catálogo de origen. |
| [`README-repo-codigo.md`](README-repo-codigo.md) | Plantilla del `README.md` del repositorio de código y alineación de su `CLAUDE.md`/`AGENTS.md` y sus reglas. |

## Ejecución

Las doctrinas de este pack —sobre todo [`gates_de_calidad_locales`](doctrinas/gates_de_calidad_locales.md)— están escritas con el vocabulario de **hooks de Claude Code**: `PreToolUse`/`PostToolUse`/`Stop`/`SubagentStop`, `exit 2`, precedencia `deny > defer > ask > allow`.

| Necesidad del pack | Claude Code |
|---|---|
| Dónde se declaran los hooks de la puerta | `.claude/settings.<rol>.json` **en el repositorio de código** (fuera del vault) (`PreToolUse` por edición, `Stop`/`SubagentStop` al cerrar turno) |
| Cómo se expresa una barrera inviolable (push a producción, `rm -rf`, `.env`) | regla `deny` de permisos — gana incluso a `bypassPermissions` |
| Precedencia entre decisiones | `deny > defer > ask > allow` |
| Impedir cerrar el turno con el DoD en rojo (patrón sello + huella, [[gates_de_calidad_locales]]) | hook `Stop`/`SubagentStop` con `exit 2` |
| Lint/formateo automático por fichero tocado (`PostToolUse`) | hook `PostToolUse` |
| Handler `defer` (pausa para aprobación humana) | funciona solo en modo no interactivo (`-p`); en interactivo se ignora con warning |
| pre-commit (secretos, lint-staged) | mecanismo de git, no del agente |

## Plan antes de tocar código: sin excepción, ni siquiera "fase única"

**Ninguna edición de código ocurre sin un fichero de plan previo.** El resto del vault permite declarar una tanda no trivial como "fase única" y saltarse la ejecutora de análisis si se dice explícitamente por qué ([`../../../../inicializador/plantilla-tanda-ejecutora.md`](../../../../inicializador/plantilla-tanda-ejecutora.md)). **Para código esa salida no existe: siempre hay plan, sin excepción declarable.** Por dos motivos:

- **Fija el orden.** Deja escrito qué paso depende de cuál, y qué se rompe si se ejecutan en el orden equivocado — y permite afinar el resultado antes de que cueste trabajo deshacerlo.
- **Hace barato abortar.** Un plan mal orientado se descarta sin haber tocado una línea de código; una ejecución mal orientada hay que revertirla, con el riesgo de dejar el repositorio a medias.

La sesión que ejecuta el plan puede llevar permisos amplios sobre el repositorio (`../../../../inicializador/plantilla-settings-ejecutora-codigo.json`); esa amplitud **acelera** la ejecución del plan, no la sustituye.

## Verificación honesta de frontend: la lista de falsos verdes

Un frontend puede dar verde por varias vías que **no prueban que funcione**, y cada una es indistinguible de un éxito real si la comprobación solo mira el código de estado HTTP:

- **Compila pero la página sale en blanco** — el empaquetador no ejecuta el runtime; compilar no es renderizar.
- **Código 200 con un error de JavaScript** — el servidor devuelve el envoltorio y el script casca en el navegador; el estado sigue en 200.
- **Una aplicación de una sola página devuelve 200 en cualquier ruta**, incluida una que no existe — un monitor que solo mira el estado reporta "funciona" para todo esto.
- **Instantáneas de comparación que se regraban solas** — siempre pasan, verde vacío.
- **Errores de hidratación silenciosos** — la página está en el DOM pero no responde a nada.
- **"El servidor arranca" no dice nada del render.**

**Verificación honesta, el mínimo exigible:**

1. El DOM renderizado **contiene** algo real esperado — no solo el código de estado.
2. **Consola limpia**, capturando el texto y la traza completa del **primer** error si lo hay, no solo el recuento de líneas rojas.
3. **Red** sin errores ni peticiones colgadas.
4. **Una interacción real** (un clic, un envío) y se vuelve a mirar consola y red — no basta con cargar la página una vez.

Una comprobación por código de estado **no sirve** para una aplicación de una sola página: solo ve el envoltorio inicial, nunca lo que el JavaScript construye después.

**Datos al probar un frontend con backend con estado:** o backend efímero, o intercepción de las llamadas de red; si se usa una base compartida, la prueba va envuelta en una transacción con marcha atrás. **Nunca credenciales ni base de datos de producción en una verificación — regla dura, sin excepción.**

## Aislamiento por árbol de trabajo (`git worktree`) por tanda: NO se adopta, con umbral de revisión

**Decisión: no se usa un árbol de trabajo aislado por tanda mientras no se corran dos o más sesiones en paralelo de verdad.** Con un runtime que sirve **una ruta fija** (el caso normal de este pack, ver `docs/emplazamiento-runtime.md`), el árbol paralelo trae un coste real y sin retorno si solo hay una sesión trabajando:

- **El árbol paralelo no queda servido** — el runtime apunta a la ruta original; el árbol hermano no responde.
- **Las dependencias no se comparten** — hay que reinstalarlas en cada árbol.
- **Los ficheros no versionados no aparecen** — configuración local, variables de entorno; la aplicación no arranca en el árbol nuevo sin copiarlos a mano.
- **Los hooks de git se comparten entre todos los árboles** del mismo clon, con un caso documentado de que configurarlos mal en uno **deshabilita en silencio los de todos**.

El beneficio de un árbol por tanda es el **paralelismo**, y solo existe si de verdad hay varias sesiones corriendo a la vez. Con una sola sesión, una rama normal con commits frecuentes cubre lo mismo sin el coste.

**Umbral para revisar esta decisión:** en cuanto se corran dos o más sesiones de agente en paralelo de forma habitual sobre el mismo repositorio.

## Añadir otro pack

Mismo patrón, misma prueba: **¿el core queda cojo sin él?** Si la respuesta es sí, la pieza es transversal y va al core, no a un pack. Un pack nuevo se crea **cuando hay piezas reales que colocar**, nunca de forma preventiva ([[adopcion_tooling_externo_caso_uso_concreto]]).
