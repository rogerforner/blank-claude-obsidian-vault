---
name: Ciclo de trabajo por tandas — planificar, ejecutar en pequeño, parar
description: Todo coordinador trabaja igual. Lo no trivial lo planifica un subagente Opus en un plan partido en tandas pequeñas; cada tanda la ejecuta un subagente Sonnet, una tras otra, o en paralelo cada una en su worktree si son independientes; y al cerrar una tanda o un bloque el coordinador guarda el estado, cierra el DoD de su ámbito y escribe el prompt de relevo; si queda trabajo y no hay nada abierto, se releva él mismo en una sesión nueva, haya plan o no (relevo autónomo por Herdr, con un script común); si no, para y pregunta. La tabla viva está en un tablero de nombre fijo, y lo repetitivo se hace con scripts.
type: doctrine
version: 2.13
index_summary: >-
  **Todo coordinador trabaja con el mismo ciclo.** Lo no trivial lo **planifica un subagente Opus** en un plan partido en **tandas pequeñas**; cada tanda la **ejecuta un subagente Sonnet**, una tras otra (o en paralelo, cada una en su worktree, si son independientes), y la comprueba el coordinador, que **commitea por pathspec**. Al cerrar una tanda o un bloque, el coordinador **guarda el estado, cierra el DoD de su ámbito y escribe el prompt de relevo**; si queda trabajo y no hay nada abierto, **se releva él mismo en una sesión nueva**, haya plan o no (relevo autónomo por Herdr, con un script común), y si no, **para y pregunta**. Así los bloques se encadenan sin acumular contexto, que es lo que degrada la precisión mucho antes de llenar la ventana. La tabla viva está en un **tablero de nombre fijo**, y lo repetitivo se hace con scripts. El estado vive en ficheros, no en la conversación.
---

Todo coordinador —el general y el de cada asunto— trabaja con el mismo ciclo. Existe por una razón: lo que devuelve un subagente entra entero en el contexto de quien lo lanza, y la calidad de una sesión baja mucho antes de llenar la ventana. Tandas pequeñas, informes cortos y un relevo o una parada al cerrar cada bloque mantienen ese contexto corto, y el estado vive en ficheros, no en la conversación.

## El ciclo

1. **Encargo.** Si el trabajo no es trivial —toca varios ficheros, estrena una forma de trabajar o se apoya en premisas sin comprobar—, el coordinador escribe un encargo corto: decisiones ya tomadas, fuentes y restricciones. Lo trivial lo hace él o lo manda directamente a una tanda.
2. **Plan.** Lanza el subagente `planificador` (Opus) con la ruta del encargo. El planificador escribe `plan-tanda-<nombre>.md` —en `_meta/` el general y en `coordinacion/` un asunto— con las premisas falsas del encargo, el inventario, las decisiones abiertas, la tabla de tandas y, por cada tanda, los ficheros, el cambio, el criterio de aceptación y el comando que lo comprueba. Al volver, el coordinador comprueba con `git status --short` que solo existe el plan, lo lee y corrige su encargo. Este es el punto de corrección barato: si nadie va a leer el plan, no se lanza. Después pasa la tabla de tandas al tablero con `tablero.mjs --desde-plan <plan>`, que la rechaza si la celda Ficheros de una fila no es literal (ver la plantilla de la tabla): desde ahí la tabla vive en el tablero y el plan remite a él, para que no haya dos copias.
3. **Ejecución.** Cada tanda la ejecuta un subagente `ejecutora` (Sonnet) o `ejecutora-mecanica` si la tanda es literal y no pide criterio, uno por tanda y uno detrás de otro, salvo las tandas independientes, que van a la vez cada una en su worktree (sección "Tandas en paralelo"). El coordinador le pasa la tanda tal como está en el plan. Al volver, comprueba que `git status --short` solo muestra los ficheros de esa tanda, corre su comando de comprobación y commitea por pathspec. En el mismo commit deja la tanda como hecha con `tablero.mjs --estado <Id> HECHA`; en una tanda en serie lo hace todo `worktree-tanda.mjs --cerrar <Id> --foto <fichero> --mensaje "<texto>"`, con la foto de `git status` tomada antes con `--foto <fichero>` (el cierre sale 4 sin tocar nada si cambió un fichero fuera de la celda Ficheros de la fila o ninguno, e ignora lo que otras sesiones ya tenían sin commitear). El mensaje del commit empieza por el Id ("T03 …"), de modo que se encuentra con `git log --oneline --grep "^T03 "`. Las tandas que van juntas de forma natural forman un bloque.
4. **Relevo o parada.** Al cerrar una tanda (la suelta, sin plan) o un bloque (con plan), el coordinador cierra en este orden: commit con el trabajo y, si hay plan, el tablero y el estado (`estado.mjs`) al día; el DoD de su ámbito, que lo sella (`node _meta/dod.mjs`, o `node ../../_meta/dod.mjs` desde un asunto); y el prompt de relevo en `relevo-actual.local.md` (en `_meta/` el general, en `coordinacion/` un asunto). Después:
   - **Si el vault usa Herdr** y no se da ninguna condición de parada, se releva: `node <ruta>/general/comun/scripts/relevo.mjs --lanzar`, en primer plano y con un tope de Bash de 10 minutos, porque el script espera a que la sesión nueva confirme. Si el vault no usa Herdr, la parada de siempre.
   - **Condiciones de parada:**
     - hay premisas falsas o decisiones abiertas sin resolver;
     - una comprobación de tanda falla;
     - el trabajo siguiente toca una puerta humana: en un plan lo declara la línea `Paradas:` del tablero; sin plan no hay `Paradas:` y la ve el coordinador, porque el script no puede;
     - no queda trabajo por hacer (con plan, el bloque siguiente no tiene filas pendientes; sin plan, la línea 2 del relevo no nombra trabajo);
     - van tres relevos seguidos sin que intervenga el director;
     - el script devuelve un código distinto de 0, salvo cuando dice que sigas en esta sesión: entonces sigues con el bloque siguiente sin relevarte;
     - quedan worktrees de tanda sin integrar (`worktree-tanda.mjs --listar` sale 4); la puerta "worktrees de tanda" del DoD ya lo exige antes de relevarse.
   - **Al parar,** remite al tablero (o enseña la tabla si el director la pide) y para; el director decide si sigue en la misma sesión o hace `/clear` y pega el relevo. Si el relevo falla, la sesión vieja sigue viva y avisa, y el director puede pegar a mano `relevo-actual.local.md` en una sesión nueva con la misma carpeta.
   - **Cuando el director interviene,** el coordinador corre `relevo.mjs --reiniciar-cuenta`: la cuenta de relevos seguidos vuelve a cero. Si se olvida, la sesión para antes de tiempo, que es el lado seguro.
5. **Los bloques se encadenan con relevo, no en la misma sesión.** Que la ventana sea de un millón de tokens no es motivo para gastarla: cada turno relee todo lo acumulado y la precisión cae mucho antes de llenarla. El relevo es justo lo que deja encadenar bloques sin acumular contexto: cada bloque lo empieza una sesión con el contexto limpio. **Umbrales:** los de contexto propio y de cuota, con el suelo por debajo del cual no compensa relevarse, están en [[higiene_contexto_y_tokens]], que es su única copia; `relevo.mjs --comprobar` da las cifras de la sesión y el veredicto, y `--lanzar` los aplica.

## El relevo autónomo

El script `general/comun/scripts/relevo.mjs` lo corre la sesión que se va. En cinco líneas:
1. Comprueba todas las precondiciones y las lista juntas, entre ellas el DoD del ámbito sellado y vigente y el contexto y la cuota de la línea de estado de la sesión; si alguna falla, no toca nada.
2. Abre un panel nuevo en la misma pestaña, con la misma carpeta, y arranca en él la sesión nueva con las mismas opciones que la vieja.
3. La sesión nueva corre `--confirmar`, que recalcula el commit del ámbito y lo escribe en `relevo-estado.local.json`; la vieja lee ese fichero y no la pantalla de la nueva.
4. Se le pasa el relevo: la nueva corre `--tomar`, que espera a que la vieja desaparezca, se renombra con el nombre de la vieja y sigue con `relevo-actual.local.md`.
5. La vieja cierra su panel.

**Lo que garantiza:** la sesión nueva no trabaja nunca con la vieja viva, y si algo falla antes del cierre, la vieja sigue y avisa. Medido el 2026-10-05 en una pestaña desechable: un relevo bueno tarda unos 15 s de principio a fin, y al terminar la vieja ya no existe y la nueva está sola en la pestaña con el nombre de la vieja. Los tres fallos que se provocaron salieron como el script dice: un commit que no es el del ámbito, con salida 4 y nada tocado; una sesión nueva que no arranca, con salida 6 y su panel cerrado, y una que no confirma, con salida 7, su panel cerrado y la vieja viva.

**La comparación del commit es la del ámbito del coordinador,** no la de todos los ámbitos: `git log -1 --format=%h -- <ámbito>`, con `.` menos cada asunto (`':(exclude)<espacio>/<asunto>'`) para el general, que da `node general/comun/scripts/espacios.mjs --pathspec .`, y `.` para un asunto, y además que ese commit sea ancestro de HEAD. Así la sesión nueva ve el mismo estado que dejó la vieja, y el commit de otra sesión en otro ámbito no tumba el relevo. Por lo mismo, el script exige el árbol limpio en el ámbito: un cambio del propio script se commitea antes de probarlo en vivo.

**Para qué no se usa nunca:** arrancar ejecutoras, ni contestar los diálogos que una sesión nueva pueda mostrar. El relevo abre la sucesora del mismo rol en la misma pestaña, y lo hace el propio coordinador sin esperar al director, no un subagente; un coordinador de asunto no arranca a otros coordinadores. Quien arranca coordinadores es el general (decisión del director, 2026-10-22; ver [[orquestacion_sesiones_por_herramienta]]). Para que un coordinador sin trabajo cargue reglas nuevas no se le pide relevarse —el script lo para porque no tiene trabajo siguiente, y es correcto—: el general reinicia su sesión en su misma pestaña con `relevo.mjs --reiniciar-coordinador <nombre>`.

**Dónde se mira.** Los códigos de salida y las opciones están en `node <ruta>/general/comun/scripts/relevo.mjs --ayuda`, que es su única copia. `--comprobar` lista las precondiciones sin tocar nada y sirve para ver por qué no se podría relevar. El script calcula la raíz del vault desde su propia ruta, así que se ejecuta desde donde está en el catálogo y no copiado fuera.

## El tablero de tandas

La tabla viva del plan en curso está en `_meta/tablero-tandas.md` el general y en `coordinacion/tablero-tandas.md` un asunto. Tiene el plan al que remite (`Plan:`), las paradas declaradas (`Paradas:`) y la tabla de tandas. Es la fuente única de la tabla: el plan remite a él y no la copia. Se reemplaza al empezar un plan, con `tablero.mjs --desde-plan`, y se edita con `tablero.mjs --estado` y se valida con `tablero.mjs --comprobar`; `--ayuda` da el uso y los códigos de salida. Cada coordinador mantiene y lee solo el suyo. Mientras un plan vive, su coordinador tiene en el estado un elemento `en_curso` con `porque` al plan, y la tabla no se copia al estado (ver [[estado_vivo_por_comando]]).

Lo que se pierde respecto a enseñar la tabla en el chat en cada bloque es verla sin pedirla; a cambio, el director abre el tablero cuando quiere, sin interrumpir la sesión. El relevo con plan lo lee y se niega a lanzarse si no existe o no es válido; el relevo sin plan no necesita tablero, pero si hay uno con un plan vivo se niega.

## Tamaño de una tanda

Una tanda toca pocos ficheros relacionados, se revisa de un vistazo y su comprobación es un comando. Cuanto más pequeña, más barato es ver que salió mal y repetirla. El límite por abajo ya no es el nacimiento del subagente (unos 16.000 tokens de contexto, medido el 2026-10-23) sino las vueltas que el coordinador da con todo su contexto alrededor de cada tanda: no se parte en tres un cambio de una línea. Cifras en [[higiene_contexto_y_tokens]], sección «Dónde se va la ventana, medido».

## Tandas en paralelo, cada una en su worktree

**La regla** (decisión del director, 2026-10-08): las tandas o bloques de un plan que se pueden ejecutar a la vez se lanzan cada uno en su worktree, porque lanzadas sobre el mismo árbol se pisan. Lo que no es independiente sigue en serie.

**Independientes** son las que no comparten ficheros en ningún árbol (tampoco la plantilla ni cualquier otro árbol fuera del vault) y no tienen `Depende de` entre ellas en el tablero.

**Cómo,** con la vía medida el 2026-10-11 (Claude Code, dos subagentes con `isolation: "worktree"` lanzados en un solo mensaje: cada uno nace en `.claude/worktrees/agent-<id>` de la raíz, en la rama `worktree-agent-<id>` y desde el `HEAD` de `main`, que no se mueve; carga el `CLAUDE.md` de la raíz y no trae los ficheros locales ignorados):

1. Antes de lanzar, se anota `git status --porcelain`.
2. Los subagentes se lanzan en un mismo mensaje con `isolation: "worktree"`. Cada worktree nace en `.claude/worktrees/agent-<id>`, en la rama `worktree-agent-<id>` y desde el `HEAD` de `main`, ignorado, y carga el `CLAUDE.md` de la raíz.
3. Al volver, cada tanda se integra y se retira con `node <ruta>/general/comun/scripts/worktree-tanda.mjs --integrar <Id> --worktree <ruta>`, una por una, cada una con su commit "T0x …". El verificador y el DoD se corren después de retirarlos todos; la puerta del DoD "worktrees de tanda" no deja cerrar con un worktree propio colgando.

**Cautelas:**

- Un worktree nace en otra rama y sin los ficheros ignorados (`*.local.*`, `settings.local.json`): la plantilla y la configuración local se localizan desde el directorio común de git (`git rev-parse --git-common-dir`).
- Los hooks de git son comunes a todos los worktrees de un clon.
- Dentro de su worktree, una tanda puede escribir ficheros fuera del vault (por ejemplo, la plantilla), pero el arnés le bloquea `git` sobre otro árbol (medido el 2026-10-11). El `git status` y el commit de ese árbol los hace el coordinador, y dos tandas a la vez solo pueden tocar en él ficheros disjuntos.
- Los subagentes no cambian de rama ni reescriben historia ([[no_push_por_subagentes]], del pack `codigo`).
- Como máximo dos tandas a la vez, y una sola si la ventana de 5 h va por delante de su ritmo; desde su umbral, nada nuevo hasta el reinicio. Los umbrales están en [[higiene_contexto_y_tokens]] y las cifras de la sesión las da `relevo.mjs --comprobar` ([[orquestacion_sesiones_por_herramienta]]: "N sesiones consumen N veces").
- El verificador recorre `.claude/worktrees/`, así que con un worktree vivo duplica hallazgos: se corre después de integrar y retirar.
- `git worktree list` se compara con lo que el método da por hecho.
- Nunca se reescribe el histórico de `main` con otra sesión viva.
- Medido solo desde la raíz del vault: desde un asunto, dónde nace el worktree y si está ignorado `[POR MEDIR]` antes de usarlo.

**El director solo ve `main`.** Revisa en Obsidian sobre la carpeta del vault: los worktrees son internos del coordinador, y nada se le enseña ni se le da una ruta antes de integrar.

## Reglas que acompañan al ciclo

- **Sobre el mismo árbol, una tanda a la vez; en paralelo, cada una en su worktree (sección "Tandas en paralelo").** Dos ejecutoras en paralelo se pisan, y la comprobación de alcance con `git status` deja de servir. Los subagentes de solo lectura sí pueden correr en paralelo con el coordinador.
- **El plan se versiona mientras vive y se retira al cerrar el trabajo.** Tiene que sobrevivir a `/clear` y a los relevos; cuando el trabajo termina, sale con `git rm`, como un prompt cumplido.
- **Quién commitea: el coordinador.** La ejecutora deja los cambios en el árbol; el coordinador revisa el diff y commitea por pathspec. Es la comprobación de que solo cambió lo que la tanda nombraba.
- **Lo que un subagente no puede hacer va por `claude -p`:** trabajar con otra raíz o con otro perfil. Un subagente hereda la carpeta y los permisos de quien lo lanza.
- **Puertas humanas.** Ni el planificador ni la ejecutora las cruzan. El plan marca dónde se para y la ejecutora se detiene ahí.
- **Las definiciones de los tres subagentes** están en el `.claude/agents/` de cada contenedor, copiadas de `inicializador/plantilla-agente-planificador.md`, `inicializador/plantilla-agente-ejecutora.md` e `inicializador/plantilla-agente-ejecutora-mecanica.md`. Además, el subagente `probador-ui` (`inicializador/plantilla-agente-probador-ui.md`) prueba interfaces con Playwright CLI: vive solo en el `.claude/agents/` de la raíz y se ve desde los asuntos, y su hook solo le deja escribir `informe-probador-*.md`.
- **Modelo, esfuerzo y topes van en la definición.** El planificador corre en Opus con el esfuerzo de la sesión; la ejecutora, en Sonnet `medium`, y la mecánica, en Haiku `high`, con `maxTurns` como tope. Un subagente sin `effort` en su definición hereda el de la sesión. El planificador lleva un hook que solo le deja escribir `plan-tanda-*.md`. Está medido el 2026-10-04.
- **Lo repetitivo y determinista del ciclo se hace con scripts comunes** (`general/comun/scripts/`): el relevo, el tablero y `worktree-tanda.mjs` ya lo son, y salen siempre igual sin gastar contexto → [[scripts_adhoc_tareas_repetitivas]].
- **Cuando cambian los agentes o las reglas.** Un cambio en un `.claude/agents/` que ya existía al arrancar la sesión no se vio en los primeros minutos (el cambio de modelo de un agente existente siguió saliendo con el anterior en la sesión abierta); para medir un cambio de agente, una `claude -p` nueva. Medido el 2026-10-22. Si la carpeta se creó después, o si cambia un `CLAUDE.md`, hace falta una sesión nueva, porque `/clear` no recarga las definiciones. Medido el 2026-10-04. Un agente **nuevo** en una carpeta `.claude/agents/` que ya existía no está disponible nada más crearlo (`Agent type 'probador-ui' not found`), pero aparece solo en la misma sesión unos minutos después, sin reiniciar; si corre prisa, una `claude -p` nueva ya lo ve. Medido el 2026-10-22.

## Plantilla de la tabla de tandas

| Id | Bloque | Objetivo | Ficheros | Ejecuta | Depende de | Estado |
|---|---|---|---|---|---|---|
| T01 | A | qué existe al terminar que hoy no existe | `ruta/uno.md`, `ruta/dos.md` | ejecutora | — | [PENDIENTE] |

Estados: `[PENDIENTE]`, `[EN CURSO]`, `[HECHA]` y `[BLOQUEADA: motivo]`, sin hash: el commit de cada tanda empieza por su Id y se encuentra con `git log --oneline --grep`. `tablero.mjs --comprobar` acepta `[HECHA <hash>]` por compatibilidad. Bajo la tabla del plan va la línea `Paradas:`, con los bloques tras los cuales el coordinador para en vez de relevarse (por ejemplo `Paradas: tras el bloque B, tras el bloque E`, o `Paradas: ninguna`). Al pasar la tabla al tablero, la tabla sale del plan y queda solo allí.

**La celda Ficheros es literal.** Rutas enteras, cada una entre acentos graves y separadas por comas, desde la carpeta del coordinador (la raíz del vault el general, la del asunto un asunto); una carpeta entera, con su barra final; lo de fuera del vault, con `~/`; y `ninguno` si la tanda no toca ficheros. Ni comodines ni prosa: `worktree-tanda.mjs --integrar` compara esas rutas con lo que cambió el worktree y para con salida 4 si no casan, y `tablero.mjs --desde-plan` rechaza la tabla (salida 4, sin escribir ni el tablero ni el plan) si una celda no cumple. Lo que haga falta explicar va en el Objetivo o en la sección de la tanda del plan. `--comprobar` no lo exige, para que los tableros vivos con filas antiguas sigan valiendo.

## Plantilla del prompt de relevo

Con plan de tandas:

    Retomas el trabajo "<nombre>" como <coordinador general | coordinador de <asunto>>. El estado vive en ficheros, no en la conversación anterior: lee `<ruta del plan>`, el tablero (`<ruta del tablero>`) y el estado (`estado.mjs`).
    Último bloque cerrado: <letra>, en el commit <hash corto>. Siguiente: bloque <letra> — <objetivo en una frase>.
    Decisiones de la sesión anterior que no estén ya escritas en el plan o en la cola: ninguna.
    Antes de lanzar nada, comprueba que el último commit de tu ámbito es <hash corto> (<`git log -1 --format=%h -- $(node general/comun/scripts/espacios.mjs --pathspec .)` | `git log -1 --format=%h -- .`>, el general o un asunto); si te ha lanzado el relevo autónomo, eso ya lo ha comprobado el script. Si el plan, el tablero y el estado versionado discrepan, gana el estado: dímelo y para. Si no, sigue con el bloque siguiente mientras se cumplan las condiciones de relevo de `ciclo_de_tandas`; cuando dejen de cumplirse, dime en tres líneas dónde estamos y para.

Sin plan de tandas (una tanda suelta, o el plan acabado con trabajo por delante):

    Retomas el trabajo "<nombre>" como <coordinador general | coordinador de <asunto>>, sin plan de tandas. El estado vive en ficheros, no en la conversación anterior: lee el estado (`estado.mjs`) y lo que nombre la línea siguiente.
    Último cierre: <qué se cerró, en una frase>, en el commit <hash corto>. Siguiente: <qué hacer, en una frase, o la ruta del handoff que lo cuenta>.
    Decisiones de la sesión anterior que no estén ya escritas en el estado o en la cola: ninguna.
    Antes de lanzar nada, comprueba que el último commit de tu ámbito es <hash corto> (<`git log -1 --format=%h -- $(node general/comun/scripts/espacios.mjs --pathspec .)` | `git log -1 --format=%h -- .`>, el general o un asunto); si te ha lanzado el relevo autónomo, eso ya lo ha comprobado el script. Si el estado versionado y este prompt discrepan, gana el estado: dímelo y para. Si no, haz lo que dice la línea 2 y, al cerrar, vuelve a relevarte o para según las condiciones de `ciclo_de_tandas`.

El fichero es siempre `relevo-actual.local.md`; un handoff no lo sustituye (si el estado no cabe en la línea 2, esta nombra la ruta del handoff). El script distingue las dos plantillas por la línea 1: si nombra un `plan-tanda-*.md` entre acentos graves es con plan, y si no, sin plan. Sin plan se niega si la línea 2 dice `nada`, `ninguno` o `ninguna`, si el tablero tiene filas en curso o bloqueadas, o si tiene un plan vivo (`Plan:` distinto de `ninguno` con filas sin HECHA): entonces se usa el relevo con plan.

En la cuarta línea, el ámbito del general es `.` menos cada asunto, el mismo que calcula `relevo.mjs` con `espacios.mjs --pathspec .`; un `git log -- .` desde la raíz daría el último commit de cualquier asunto. Medido el 2026-10-22: desde la raíz, `-- .` dio un commit de un asunto, y el pathspec, el del general.

La tercera línea tiene que decir "ninguna". Si no puede, lo que falte se escribe en el plan o en la cola antes de parar, porque lo que solo está en el relevo se pierde con él. El script lee las tres primeras líneas con expresiones fijas (con plan: el plan entre acentos graves, `Último bloque cerrado: <letra>, en el commit <hash>. Siguiente: bloque <letra> — `; sin plan: `Último cierre: <texto>, en el commit <hash>. Siguiente: <texto>`; y en las dos el final `: ninguna.`), así que la plantilla se sigue al pie de la letra.

Relacionada: [[orquestacion_sesiones_por_herramienta]], [[scripts_adhoc_tareas_repetitivas]], [[modelo_por_tarea]], [[higiene_contexto_y_tokens]], [[definition_of_done]].

> Pieza de catálogo `general/comun/doctrinas/`. **v1.0 (2026-10-04):** nace con la decisión D4 del director del 2026-10-04: todo coordinador trabaja con el mismo ciclo de planificar, ejecutar en tandas pequeñas y parar al cerrar cada bloque. Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado y **no se hereda** automáticamente.
> **v2.0 (2026-10-05):** decisiones D1, D2 y D3 del director: relevo autónomo por Herdr con sus condiciones de parada, tablero de tandas y scripts.
> **v2.1 (2026-10-10):** con el vault en espacios, el ámbito del general es `.` menos cada asunto y lo da `espacios.mjs --pathspec .`.
> **v2.2 (2026-10-11):** las tandas independientes de un plan van en paralelo, cada una en su worktree, con `worktree-tanda.mjs` para integrarlas y retirarlas (decisión del director del 2026-10-08; vía medida el 2026-10-11).
> **v2.3 (2026-10-12):** el estado vivo se guarda y se lee con `estado.mjs`: el paso 4 y la plantilla del relevo nombran el estado en vez de los ficheros sueltos de antes, y el plan vivo tiene su elemento `en_curso` ([[estado_vivo_por_comando]]).
> **v2.4 (2026-10-14):** decisión del director del 2026-10-14 (E22): el relevo se hace al cerrar una tanda o un bloque, haya plan o no, con el DoD del ámbito sellado como precondición; se añade la plantilla sin plan y salen de las paradas "el plan se acabó" y "no hay tablero".
> **v2.8 (2026-10-22):** umbrales de relevo por contexto propio (30 % / 50 %) y límite de concurrencia según el ritmo de la cuota (D4, T11); el detalle vive en [[higiene_contexto_y_tokens]].
> **v2.9 (2026-10-22):** el relevo es de todo coordinador, sin esperar al director, y el arranque de coordinadores queda para el general (decisión del director, 2026-10-22); la pestaña de cada coordinador es una y no se mueve ni se duplica.
> **v2.10 (2026-10-22):** la celda Ficheros de la tabla de tandas es literal y `tablero.mjs --desde-plan` lo exige; `worktree-tanda.mjs` la lee desde la carpeta del coordinador; la cuarta línea del relevo da el comando del ámbito del general y del asunto (E24).
> **v2.13 (2026-10-23):** el cierre de una tanda en serie lo hace `worktree-tanda.mjs --foto` y `--cerrar`, que compara los cambios con la celda Ficheros y commitea por pathspec.
> **v2.12 (2026-10-23):** el límite por abajo del tamaño de una tanda pasa del coste de arrancar un subagente (37 mil tokens, ya medido en unos 16.000) a las vueltas del coordinador por tanda (T03 del plan de consumo).
> **v2.11 (2026-10-22):** los umbrales de contexto y cuota se remiten a [[higiene_contexto_y_tokens]], que es su única copia, y `relevo.mjs` los aplica: dice seguir en la misma sesión por debajo del suelo de contexto y no lanza la sucesora con la cuota en su umbral; el general reinicia al coordinador sin trabajo que tiene que cargar reglas nuevas (E28).
