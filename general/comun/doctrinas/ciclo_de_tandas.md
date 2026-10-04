---
name: Ciclo de trabajo por tandas — planificar, ejecutar en pequeño, parar
description: Todo coordinador trabaja igual. Lo no trivial lo planifica un subagente Opus en un plan partido en tandas pequeñas; cada tanda la ejecuta un subagente Sonnet, una tras otra; y al cerrar una tanda suelta o un bloque el coordinador guarda el estado, enseña la tabla de tandas, escribe el prompt de relevo y para. No se encadenan bloques sin parar.
type: doctrine
version: 1.0
index_summary: >-
  **Todo coordinador trabaja con el mismo ciclo.** Lo no trivial lo **planifica un subagente Opus** en un plan partido en **tandas pequeñas**; cada tanda la **ejecuta un subagente Sonnet**, una tras otra, y la comprueba el coordinador, que **commitea por pathspec**. Al cerrar una tanda suelta o un bloque, el coordinador **guarda el estado, enseña la tabla de tandas, escribe el prompt de relevo y PARA**: no se encadenan bloques sin parar, porque lo que devuelve un subagente entra entero en el contexto y la precisión cae mucho antes de llenar la ventana. El estado vive en ficheros, no en la conversación.
---

Todo coordinador —el general y el de cada asunto— trabaja con el mismo ciclo. Existe por una razón: lo que devuelve un subagente entra entero en el contexto de quien lo lanza, y la calidad de una sesión baja mucho antes de llenar la ventana. Tandas pequeñas, informes cortos y una parada al cerrar cada bloque mantienen ese contexto corto, y el estado vive en ficheros, no en la conversación.

## El ciclo

1. **Encargo.** Si el trabajo no es trivial —toca varios ficheros, estrena una forma de trabajar o se apoya en premisas sin comprobar—, el coordinador escribe un encargo corto: decisiones ya tomadas, fuentes y restricciones. Lo trivial lo hace él o lo manda directamente a una tanda.
2. **Plan.** Lanza el subagente `planificador` (Opus) con la ruta del encargo. El planificador escribe `plan-tanda-<nombre>.md` —en `_meta/` el general y en `coordinacion/` un asunto— con las premisas falsas del encargo, el inventario, las decisiones abiertas, la tabla de tandas y, por cada tanda, los ficheros, el cambio, el criterio de aceptación y el comando que lo comprueba. Al volver, el coordinador comprueba con `git status --short` que solo existe el plan, lo lee y corrige su encargo. Este es el punto de corrección barato: si nadie va a leer el plan, no se lanza.
3. **Ejecución.** Cada tanda la ejecuta un subagente `ejecutora` (Sonnet) o `ejecutora-mecanica` si la tanda es literal y no pide criterio, uno por tanda y uno detrás de otro. El coordinador le pasa la tanda tal como está en el plan. Al volver, comprueba que `git status --short` solo muestra los ficheros de esa tanda, corre su comando de comprobación y commitea por pathspec. Las tandas que van juntas de forma natural forman un bloque.
4. **Parada.** Al cerrar una tanda suelta o un bloque, el coordinador guarda el estado (commit, cola y trabajo en curso al día), enseña la tabla de tandas con su estado, escribe el prompt de relevo y para. El director decide si sigue en la misma sesión o hace `/clear` y pega el relevo.
5. **No se encadenan bloques sin parar.** Que la ventana sea de un millón de tokens no es motivo para gastarla: cada turno relee todo lo acumulado y la precisión cae mucho antes de llenarla.

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
- **Cuando cambian los agentes o las reglas.** Un cambio en un `.claude/agents/` que ya existía al arrancar la sesión se recarga solo; si la carpeta se creó después, o si cambia un `CLAUDE.md`, hace falta una sesión nueva, porque `/clear` no recarga las definiciones. Medido el 2026-10-04.

## Plantilla de la tabla de tandas

| Id | Bloque | Objetivo | Ficheros | Ejecuta | Depende de | Estado |
|---|---|---|---|---|---|---|
| T01 | A | qué existe al terminar que hoy no existe | `ruta/uno.md`, `ruta/dos.md` | ejecutora | — | [PENDIENTE] |

Estados: `[PENDIENTE]`, `[EN CURSO]`, `[HECHA <commit corto>]`, `[BLOQUEADA: motivo]`. La tabla vive en el plan; el coordinador la actualiza al cerrar cada tanda y la enseña al parar.

## Plantilla del prompt de relevo

    Retomas el trabajo "<nombre>" como <coordinador general | coordinador de <asunto>>. El estado vive en ficheros, no en la conversación anterior: lee `<ruta del plan>` (tabla de tandas), la cola y el trabajo en curso.
    Último bloque cerrado: <id>, en el commit <hash corto>. Siguiente: <tanda o bloque> — <objetivo en una frase>.
    Decisiones de la sesión anterior que no estén ya escritas en el plan o en la cola: ninguna.
    Antes de lanzar nada, comprueba que `git log -1 --format=%h` da <hash corto> y dime en tres líneas dónde estamos. Si el plan y el estado versionado discrepan, gana el estado: dímelo y para.

La tercera línea tiene que decir "ninguna". Si no puede, lo que falte se escribe en el plan o en la cola antes de parar, porque lo que solo está en el relevo se pierde con él.

Relacionada: [[orquestacion_sesiones_por_herramienta]], [[modelo_por_tarea]], [[higiene_contexto_y_tokens]], [[definition_of_done]].

> Pieza de catálogo `general/comun/doctrinas/`. **v1.0 (2026-10-04):** nace con la decisión D4 del director del 2026-10-04: todo coordinador trabaja con el mismo ciclo de planificar, ejecutar en tandas pequeñas y parar al cerrar cada bloque. Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado y **no se hereda** automáticamente.
