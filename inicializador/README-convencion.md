# Convención de organización de `coordinacion/`

> Copia este archivo a `asuntos/<asunto>/coordinacion/README-convencion.md`. Generaliza la doctrina [[convencion_organizacion_carpeta_trabajo]].

## Principio

La raíz de `coordinacion/` solo contiene lo **activo** y lo **vivo**. Lo efímero ya usado **se borra** — **git conserva el histórico** (local, en esta máquina) y el resultado perdura en otro sitio. **No se acumulan ficheros obsoletos.**

## Qué se conserva

- `prompt-<activo>.md` — el prompt de la tanda **en curso**.
- `handoff-coordinador-<fecha>.md` — handoff **vivo** *(local, gitignored)*.
- `tmp-otros-actual.md` — buffer sobreescribible *(local, gitignored)*.
- `README-convencion.md` (este) y `referencia/` — documentos vivos sin fecha en el nombre: glosario del asunto, datos de contacto del organismo o del perito, calendario de plazos, el reconocimiento inicial del material.

## Qué se borra (git es el histórico)

- El **prompt ya ejecutado**, cerrada su tanda y capturado el resultado (commit + entrada en `cola-pendientes.md`).
- El **brief**, cuando ya existe su informe.
- Cualquier **handoff superado**.

Los **resultados** (informes, síntesis, escritos) viven en `docs/`, `estudios/` o la cola — no se borran. Y los **originales** recibidos o emitidos (el escaneo del acuse, la resolución, la factura firmada) **nunca** se borran ni se editan: son prueba, y viven en `docs/` ([[estructura_contenedor_asunto]]).

## Cómo

Al cerrar una tanda, el coordinador hace el housekeeping **él mismo**, sin esperar al director: `git rm` del prompt o brief ya cumplido + commit local. La raíz vuelve a quedar limpia.

Además, un **hook `SessionStart`** limpia también **al arrancar** (`general/comun/hooks/limpieza-coordinacion.mjs`): auto-borra los handoffs y buffers gitignored ya superados y avisa de los prompts trackeados que toca quitar. Hace falta porque las sesiones a menudo mueren por límite de contexto antes de cerrar la tanda.

## `tmp-otros-actual.md`

Buffer exclusivo del texto que el director pega como respuesta a una pregunta del asistente (ver [[feedback_prompt_delivery]]). No es canal de instrucciones —eso va en el chat— ni panel de estado. Sobreescribible; si no hay pregunta pendiente, queda vacío.
