---
name: Ciclo de trabajo por tandas — planificar, ejecutar en pequeño, parar
description: Todo coordinador trabaja igual. Lo no trivial lo planifica un subagente Opus en un plan partido en tandas pequeñas; cada tanda la ejecuta un subagente Sonnet, una tras otra; y al cerrar una tanda suelta o un bloque el coordinador guarda el estado y el tablero y escribe el prompt de relevo; si el bloque siguiente es del mismo plan y no hay nada abierto, se releva él mismo en una sesión nueva (relevo autónomo por Herdr, con un script común); si no, para y pregunta. La tabla viva está en un tablero de nombre fijo, y lo repetitivo se hace con scripts.
type: doctrine
version: 2.0
index_summary: >-
  **Todo coordinador trabaja con el mismo ciclo.** Lo no trivial lo **planifica un subagente Opus** en un plan partido en **tandas pequeñas**; cada tanda la **ejecuta un subagente Sonnet**, una tras otra, y la comprueba el coordinador, que **commitea por pathspec**. Al cerrar una tanda suelta o un bloque, el coordinador **guarda el estado y el tablero y escribe el prompt de relevo**; si el bloque siguiente es del mismo plan y no hay nada abierto, **se releva él mismo en una sesión nueva** (relevo autónomo por Herdr, con un script común), y si no, **para y pregunta**. Así los bloques se encadenan sin acumular contexto, que es lo que degrada la precisión mucho antes de llenar la ventana. La tabla viva está en un **tablero de nombre fijo**, y lo repetitivo se hace con scripts. El estado vive en ficheros, no en la conversación.
---

Todo coordinador —el general y el de cada asunto— trabaja con el mismo ciclo. Existe por una razón: lo que devuelve un subagente entra entero en el contexto de quien lo lanza, y la calidad de una sesión baja mucho antes de llenar la ventana. Tandas pequeñas, informes cortos y un relevo o una parada al cerrar cada bloque mantienen ese contexto corto, y el estado vive en ficheros, no en la conversación.

## El ciclo

1. **Encargo.** Si el trabajo no es trivial —toca varios ficheros, estrena una forma de trabajar o se apoya en premisas sin comprobar—, el coordinador escribe un encargo corto: decisiones ya tomadas, fuentes y restricciones. Lo trivial lo hace él o lo manda directamente a una tanda.
2. **Plan.** Lanza el subagente `planificador` (Opus) con la ruta del encargo. El planificador escribe `plan-tanda-<nombre>.md` —en `_meta/` el general y en `coordinacion/` un asunto— con las premisas falsas del encargo, el inventario, las decisiones abiertas, la tabla de tandas y, por cada tanda, los ficheros, el cambio, el criterio de aceptación y el comando que lo comprueba. Al volver, el coordinador comprueba con `git status --short` que solo existe el plan, lo lee y corrige su encargo. Este es el punto de corrección barato: si nadie va a leer el plan, no se lanza. Después pasa la tabla de tandas al tablero con `tablero.mjs --desde-plan <plan>`: desde ahí la tabla vive en el tablero y el plan remite a él, para que no haya dos copias.
3. **Ejecución.** Cada tanda la ejecuta un subagente `ejecutora` (Sonnet) o `ejecutora-mecanica` si la tanda es literal y no pide criterio, uno por tanda y uno detrás de otro. El coordinador le pasa la tanda tal como está en el plan. Al volver, comprueba que `git status --short` solo muestra los ficheros de esa tanda, corre su comando de comprobación y commitea por pathspec. En el mismo commit deja la tanda como hecha con `tablero.mjs --estado <Id> HECHA`, y el mensaje del commit empieza por el Id ("T03 …"), de modo que se encuentra con `git log --oneline --grep "^T03 "`. Las tandas que van juntas de forma natural forman un bloque.
4. **Relevo o parada.** Al cerrar una tanda suelta o un bloque, el coordinador guarda el estado: un commit con el tablero, la cola y el trabajo en curso al día, y el prompt de relevo en `relevo-actual.local.md` (en `_meta/` el general, en `coordinacion/` un asunto). Después:
   - **Si el vault usa Herdr** y no se da ninguna condición de parada, se releva: `node <ruta>/general/comun/scripts/relevo.mjs --lanzar`, en primer plano y con un tope de Bash de 10 minutos, porque el script espera a que la sesión nueva confirme. Si el vault no usa Herdr, la parada de siempre.
   - **Condiciones de parada:**
     - hay premisas falsas o decisiones abiertas sin resolver;
     - una comprobación de tanda falla;
     - el bloque siguiente toca una puerta humana, o el tablero declara una parada tras el bloque cerrado;
     - el plan se acabó;
     - van tres relevos seguidos sin que intervenga el director;
     - no hay tablero;
     - el script devuelve un código distinto de 0.
   - **Al parar,** remite al tablero (o enseña la tabla si el director la pide) y para; el director decide si sigue en la misma sesión o hace `/clear` y pega el relevo. Si el relevo falla, la sesión vieja sigue viva y avisa, y el director puede pegar a mano `relevo-actual.local.md` en una sesión nueva con la misma carpeta.
   - **Cuando el director interviene,** el coordinador corre `relevo.mjs --reiniciar-cuenta`: la cuenta de relevos seguidos vuelve a cero. Si se olvida, la sesión para antes de tiempo, que es el lado seguro.
5. **Los bloques se encadenan con relevo, no en la misma sesión.** Que la ventana sea de un millón de tokens no es motivo para gastarla: cada turno relee todo lo acumulado y la precisión cae mucho antes de llenarla. El relevo es justo lo que deja encadenar bloques sin acumular contexto: cada bloque lo empieza una sesión con el contexto limpio.

## El relevo autónomo

El script `general/comun/scripts/relevo.mjs` lo corre la sesión que se va. En cinco líneas:
1. Comprueba todas las precondiciones y las lista juntas; si alguna falla, no toca nada.
2. Abre un panel nuevo en la misma pestaña, con la misma carpeta, y arranca en él la sesión nueva con las mismas opciones que la vieja.
3. La sesión nueva corre `--confirmar`, que recalcula el commit del ámbito y lo escribe en `relevo-estado.local.json`; la vieja lee ese fichero y no la pantalla de la nueva.
4. Se le pasa el relevo: la nueva corre `--tomar`, que espera a que la vieja desaparezca, se renombra con el nombre de la vieja y sigue con `relevo-actual.local.md`.
5. La vieja cierra su panel.

**Lo que garantiza:** la sesión nueva no trabaja nunca con la vieja viva, y si algo falla antes del cierre, la vieja sigue y avisa. Medido el 2026-10-05 en una pestaña desechable: un relevo bueno tarda unos 15 s de principio a fin, y al terminar la vieja ya no existe y la nueva está sola en la pestaña con el nombre de la vieja. Los tres fallos que se provocaron salieron como el script dice: un commit que no es el del ámbito, con salida 4 y nada tocado; una sesión nueva que no arranca, con salida 6 y su panel cerrado, y una que no confirma, con salida 7, su panel cerrado y la vieja viva.

**La comparación del commit es la del ámbito del coordinador,** no la de todos los ámbitos: `git log -1 --format=%h -- <ámbito>`, con `. ':(exclude)asuntos'` para el general y `asuntos/<slug>` para un asunto, y además que ese commit sea ancestro de HEAD. Así la sesión nueva ve el mismo estado que dejó la vieja, y el commit de otra sesión en otro ámbito no tumba el relevo. Por lo mismo, el script exige el árbol limpio en el ámbito: un cambio del propio script se commitea antes de probarlo en vivo.

**Para qué no se usa nunca:** arrancar a otro coordinador o a ejecutoras, ni contestar los diálogos que una sesión nueva pueda mostrar. Solo abre la sucesora del mismo rol, y la lanza el propio coordinador, no un subagente.

**Dónde se mira.** Los códigos de salida y las opciones están en `node <ruta>/general/comun/scripts/relevo.mjs --ayuda`, que es su única copia. `--comprobar` lista las precondiciones sin tocar nada y sirve para ver por qué no se podría relevar. El script calcula la raíz del vault desde su propia ruta, así que se ejecuta desde donde está en el catálogo y no copiado fuera.

## El tablero de tandas

La tabla viva del plan en curso está en `_meta/tablero-tandas.md` el general y en `coordinacion/tablero-tandas.md` un asunto. Tiene el plan al que remite (`Plan:`), las paradas declaradas (`Paradas:`) y la tabla de tandas. Es la fuente única de la tabla: el plan remite a él y no la copia. Se reemplaza al empezar un plan, con `tablero.mjs --desde-plan`, y se edita con `tablero.mjs --estado` y se valida con `tablero.mjs --comprobar`; `--ayuda` da el uso y los códigos de salida. Cada coordinador mantiene y lee solo el suyo.

Lo que se pierde respecto a enseñar la tabla en el chat en cada bloque es verla sin pedirla; a cambio, el director abre el tablero cuando quiere, sin interrumpir la sesión. El relevo lo lee y se niega a lanzarse si no existe o no es válido.

## Tamaño de una tanda

Una tanda toca pocos ficheros relacionados, se revisa de un vistazo y su comprobación es un comando. Cuanto más pequeña, más barato es ver que salió mal y repetirla. El límite por abajo es el coste fijo de arrancar un subagente, unos 37.000 tokens medidos: no se parte en tres un cambio de una línea.

## Reglas que acompañan al ciclo

- **Una tanda a la vez sobre el mismo árbol.** Dos ejecutoras en paralelo se pisan, y la comprobación de alcance con `git status` deja de servir. Los subagentes de solo lectura sí pueden correr en paralelo con el coordinador.
- **El plan se versiona mientras vive y se retira al cerrar el trabajo.** Tiene que sobrevivir a `/clear` y a los relevos; cuando el trabajo termina, sale con `git rm`, como un prompt cumplido.
- **Quién commitea: el coordinador.** La ejecutora deja los cambios en el árbol; el coordinador revisa el diff y commitea por pathspec. Es la comprobación de que solo cambió lo que la tanda nombraba.
- **Lo que un subagente no puede hacer va por `claude -p`:** trabajar con otra raíz o con otro perfil. Un subagente hereda la carpeta y los permisos de quien lo lanza.
- **Puertas humanas.** Ni el planificador ni la ejecutora las cruzan. El plan marca dónde se para y la ejecutora se detiene ahí.
- **Las definiciones de los tres subagentes** están en el `.claude/agents/` de cada contenedor, copiadas de `inicializador/plantilla-agente-planificador.md`, `inicializador/plantilla-agente-ejecutora.md` e `inicializador/plantilla-agente-ejecutora-mecanica.md`.
- **Modelo, esfuerzo y topes van en la definición.** El planificador corre en Opus con el esfuerzo de la sesión; la ejecutora, en Sonnet `medium`, y la mecánica, en Sonnet `low`, con `maxTurns` como tope. Un subagente sin `effort` en su definición hereda el de la sesión. El planificador lleva un hook que solo le deja escribir `plan-tanda-*.md`. Está medido el 2026-10-04.
- **Lo repetitivo y determinista del ciclo se hace con scripts comunes** (`general/comun/scripts/`): el relevo y el tablero ya lo son, y salen siempre igual sin gastar contexto → [[scripts_adhoc_tareas_repetitivas]].
- **Cuando cambian los agentes o las reglas.** Un cambio en un `.claude/agents/` que ya existía al arrancar la sesión se recarga solo; si la carpeta se creó después, o si cambia un `CLAUDE.md`, hace falta una sesión nueva, porque `/clear` no recarga las definiciones. Medido el 2026-10-04.

## Plantilla de la tabla de tandas

| Id | Bloque | Objetivo | Ficheros | Ejecuta | Depende de | Estado |
|---|---|---|---|---|---|---|
| T01 | A | qué existe al terminar que hoy no existe | `ruta/uno.md`, `ruta/dos.md` | ejecutora | — | [PENDIENTE] |

Estados: `[PENDIENTE]`, `[EN CURSO]`, `[HECHA]` y `[BLOQUEADA: motivo]`, sin hash: el commit de cada tanda empieza por su Id y se encuentra con `git log --oneline --grep`. `tablero.mjs --comprobar` acepta `[HECHA <hash>]` por compatibilidad. Bajo la tabla del plan va la línea `Paradas:`, con los bloques tras los cuales el coordinador para en vez de relevarse (por ejemplo `Paradas: tras el bloque B, tras el bloque E`, o `Paradas: ninguna`). Al pasar la tabla al tablero, la tabla sale del plan y queda solo allí.

## Plantilla del prompt de relevo

    Retomas el trabajo "<nombre>" como <coordinador general | coordinador de <asunto>>. El estado vive en ficheros, no en la conversación anterior: lee `<ruta del plan>`, el tablero (`<ruta del tablero>`), la cola y el trabajo en curso.
    Último bloque cerrado: <letra>, en el commit <hash corto>. Siguiente: bloque <letra> — <objetivo en una frase>.
    Decisiones de la sesión anterior que no estén ya escritas en el plan o en la cola: ninguna.
    Antes de lanzar nada, comprueba que el último commit de tu ámbito es <hash corto> (`git log -1 --format=%h -- <ámbito>`); si te ha lanzado el relevo autónomo, eso ya lo ha comprobado el script. Si el plan, el tablero y el estado versionado discrepan, gana el estado: dímelo y para. Si no, sigue con el bloque siguiente mientras se cumplan las condiciones de relevo de `ciclo_de_tandas`; cuando dejen de cumplirse, dime en tres líneas dónde estamos y para.

La tercera línea tiene que decir "ninguna". Si no puede, lo que falte se escribe en el plan o en la cola antes de parar, porque lo que solo está en el relevo se pierde con él. El script lee las tres primeras líneas con expresiones fijas (el plan entre acentos graves, `Último bloque cerrado: <letra>, en el commit <hash>. Siguiente: bloque <letra> — ` y el final `: ninguna.`), así que la plantilla se sigue al pie de la letra.

Relacionada: [[orquestacion_sesiones_por_herramienta]], [[scripts_adhoc_tareas_repetitivas]], [[modelo_por_tarea]], [[higiene_contexto_y_tokens]], [[definition_of_done]].

> Pieza de catálogo `general/comun/doctrinas/`. **v1.0 (2026-10-04):** nace con la decisión D4 del director del 2026-10-04: todo coordinador trabaja con el mismo ciclo de planificar, ejecutar en tandas pequeñas y parar al cerrar cada bloque. Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado y **no se hereda** automáticamente.
> **v2.0 (2026-10-05):** decisiones D1, D2 y D3 del director: relevo autónomo por Herdr con sus condiciones de parada, tablero de tandas y scripts.
