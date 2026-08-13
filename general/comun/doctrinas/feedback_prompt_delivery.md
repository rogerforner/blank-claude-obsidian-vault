---
name: Entrega de prompts en .md y respuestas vía buffer "Otros"
description: Los prompts para sesiones operativas se entregan en archivos .md en el working dir activo, no inline en el chat; las respuestas a AskUserQuestion del agente se escriben completas en un buffer sobreescribible que el director pega en "Otros".
type: convention
version: 1.0
---

## Entrega de prompts en `.md`

Todo prompt para una sesión operativa se entrega **en un archivo `.md`** dentro de la carpeta de trabajo activa, nombrado `prompt-<identificador>.md`, incluyendo tanto el **setup** (working dir, modelo, esfuerzo, plan mode) como el **cuerpo** del prompt. En el chat, el coordinador **solo confirma la ruta** y resume el setup en una línea; **no repite el cuerpo** en el chat.

**Por qué:** el director copia el prompt a sesiones nuevas; tenerlo en archivo le evita re-scrollear el chat de coordinación y le permite versionarlo.

## Respuestas a AskUserQuestion del agente — buffer "Otros"

Cuando el agente operativo lanza una AskUserQuestion, el coordinador **no responde solo "pulsa la opción N"**. En su lugar:

1. Analiza y decide la opción correcta.
2. Escribe la **guía completa** (decisión, por qué esa y no las otras, verificaciones previas, caveats, restricciones específicas) en un archivo **sobreescribible** (`tmp-otros-actual.md`) en la raíz de la carpeta de trabajo.
3. En el chat indica en **una línea** la opción recomendada y su razón principal, avisando de que el texto completo está en el buffer.
4. El director, en la UI del agente, selecciona **"Otros"** (no la opción numerada) y pega el contenido del buffer.

**Por qué:** las opciones numeradas que ofrece el agente son siempre simplificadas. La opción correcta casi siempre lleva caveats, verificaciones o procedimientos que no caben en la etiqueta corta. Ejemplo doméstico: el agente pregunta *"¿envío la reclamación por el formulario web o por correo certificado?"*; la respuesta útil no es "la 2", sino "correo certificado **con acuse**, conservando el resguardo escaneado en `docs/`, y **solo después** de comprobar que el plazo no vence esta semana". Si el director solo pulsa "Opción N", el agente pierde toda esa guía.

El buffer sigue las mismas convenciones de [[formato_prompts_markdown_limpio]] (heading 1, sin envoltorio ``` exterior, sin separadores ASCII).

Relacionada: [[formato_prompts_markdown_limpio]], [[prompts_rutas_absolutas_fuera_del_working_dir]], [[convencion_organizacion_carpeta_trabajo]].

> Pieza de catálogo `general/comun/doctrinas/`. v1.0 (2026-06-05). Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente.
> Adaptada al enfoque neutro de la plantilla (sin referencias al dominio del software) — 2026-07-29.
