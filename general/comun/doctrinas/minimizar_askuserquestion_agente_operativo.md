---
name: Minimizar AskUserQuestion del agente operativo
description: El agente operativo no pide confirmación para acciones legítimas y obvias dentro de su scope; solo escala en cuatro casos reales (decisión de fondo, hallazgo bloqueante, conflicto doctrinal, bloqueo técnico).
type: doctrine
version: 1.0
---

El agente operativo **no pide confirmación constante** para acciones legítimas y obvias dentro del scope autorizado del prompt. Opera con autonomía y reporta al cierre.

## Cuándo SÍ escalar (los cuatro casos)

1. **Decisión de fondo significativa** no contemplada en el prompt (p. ej. cambiar el enfoque de una reclamación, o renunciar a una vía de recurso).
2. **Hallazgo bloqueante** que exige cambiar el plan (p. ej. el plazo ya venció, o el documento que el prompt daba por existente no está en el asunto).
3. **Conflicto entre doctrinas** no resoluble autónomamente.
4. **Bloqueo técnico real** que requiere acción del director (ampliar permisos, escanear un original, ejecutar algo manualmente).

## Cuándo NO escalar — proceder

- Confirmar acciones **obvias** dentro del scope ("¿borro el borrador antiguo?" cuando el prompt dice borrarlo).
- **Detalles menores** de redacción o estructura (nombres de fichero, orden de los apartados, elegir entre dos formulaciones válidas).
- **Verificar doctrinas claras** que ya cubren el caso.
- **Hallazgos informativos no bloqueantes** → documentar y seguir, reportar al final.
- Acciones que el prompt **ya autorizó** explícitamente.

**Puerta humana, no escalada:** entregar algo fuera (enviar el correo, presentar en el registro, firmar) **nunca** lo hace el agente, ni siquiera preguntando. Prepara el envío y para. Eso no es una AskUserQuestion: es el final de su scope.

## Implicación para el coordinador

Al redactar prompts: **anticipar** las decisiones menores y autorizarlas en el prompt; **listar explícitamente** qué casos sí requieren escalada; **confiar** en la capacidad del agente de aplicar doctrinas a casos concretos. Si detecta micro-escaladas recurrentes, recordar esta doctrina al agente.

Relacionada: [[verificacion_e2e_por_agente]], [[modelo_por_tarea]], [[formato_prompts_markdown_limpio]].

> Pieza de catálogo `general/comun/doctrinas/`. v1.0 (2026-06-05). Se instala por copia en `asuntos/<asunto>/memoria/`; no se hereda.
> Adaptada al framing neutro del seed (sin referencias al dominio del software) — 2026-07-29.
