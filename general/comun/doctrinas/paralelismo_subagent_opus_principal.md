---
name: Paralelismo subagente read-only + agente principal
description: Paralelizar un subagente read-only en background con trabajo independiente del agente principal ahorra wall-clock sin interferencias, con reconciliación de hallazgos antes del checkpoint.
type: doctrine
version: 1.3
index_summary: >-
  Subagente read-only en background paralelo al principal ahorra wall-clock; reconciliar y citar fuente antes del checkpoint.
---

Esta doctrina habla del **subagente de solo lectura en paralelo**: el que investiga o tabula mientras el principal trabaja y no escribe nada. Las tandas que **escriben** no entran aquí: van en serie sobre el mismo árbol, o a la vez cada una en su worktree si son independientes ([[ciclo_de_tandas]]): dos escritores sobre el mismo árbol se pisan.

Lanzar un **subagente read-only en background** (Agent tool con `run_in_background`) en paralelo a trabajo **independiente** del agente principal ahorra tiempo de pared sin riesgo de que dos procesos se pisen el mismo fichero.

## Cuándo aplicar

1. El **subagente es read-only por diseño** (sin Edit/Write).
2. El **trabajo del agente principal es independiente** del output del subagente (si lo necesita para decidir su siguiente paso, NO paralelizar: secuencial).
3. La fase **admite reconciliación al final** sin romper la linealidad de los *checkpoints*.

Ejemplo: mientras el principal redacta el escrito, un subagente read-only barre las 40 facturas escaneadas del asunto y devuelve la tabla de importes y fechas. El escrito no depende de esa tabla hasta el apartado de cuantía → paralelizable.

## Cuándo NO aplicar

- El subagente puede escribir/modificar archivos → riesgo de pisarse con lo que el principal también lee.
- El trabajo del principal depende secuencialmente del subagente (p. ej. no puede redactar la petición sin la cuantía).
- Hay *checkpoint* humano entre el subagente y el trabajo del principal.

## Reglas operativas

1. **Spawnear con `run_in_background`**: la notificación llega sola al terminar; **no hacer polling**.
2. **Time-budget acotado** para el subagente; si lo excede sin progreso, escalar con opciones de mitigación.
3. **Reconciliación obligatoria antes del checkpoint**: fusionar duplicados, **citar la fuente** de cada hallazgo (`fichero:línea`, o el documento y su página), no agrupar arbitrariamente hallazgos distintos.
4. **Excepciones que rompen el paralelismo**: un hallazgo crítico (un plazo que vence, un dato personal expuesto, una contradicción con el original) exige interrupción y escalada inmediata.

Relacionada: [[modelo_por_tarea]], [[higiene_contexto_y_tokens]], [[orquestacion_sesiones_por_herramienta]].

> Pieza de catálogo `general/comun/doctrinas/`. Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda**. Historial de versiones: [[historial-doctrinas#paralelismo_subagent_opus_principal]].
