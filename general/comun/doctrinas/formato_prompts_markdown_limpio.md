---
name: Formato markdown limpio en prompts
description: Los prompts .md para sesiones operativas usan markdown limpio (# heading 1, solo headings, sin envoltorio ``` exterior, sin separadores ASCII, sin tiempos ni metadiscurso) para que el director los copie íntegros.
type: convention
version: 1.0
---

Los prompts `.md` que el coordinador redacta para sesiones operativas usan **markdown limpio**, para facilitar que el director los copie íntegros y que el agente los lea sin ruido.

## Convención obligatoria

1. **`#` heading 1 como primera línea** del prompt.
2. **Estructura solo con headings markdown** (`#`, `##`, `###`).
3. **SIN envoltorio ` ``` ` exterior** — el prompt empieza directamente con su heading.
4. **SIN separadores ASCII** (`═══`, `───`, `===`): se renderizan como texto plano y rompen la lectura.
5. **Bloques de código internos sí** pueden usar ` ``` ` (comandos de shell, json, texto literal a copiar…).
6. **SIN tiempos estimados** en el cuerpo: eso es para reportar al director, no para el agente.
7. **SIN metadiscurso** sobre el coordinador, sobre cómo se redactó el prompt, ni sobre otras sesiones paralelas. El agente no lo necesita.
8. El prompt se **pega íntegro en Plan Mode**.

## Estructura típica

```
# <título> — <identificador de la tanda>

## Setup
- Working dir, modelo, esfuerzo, plan mode

## Contexto y objetivo
## Decisiones cerradas
## Lectura inicial obligatoria
## Plan Mode — decisiones a resolver
## Scope exacto
## Restricciones inviolables
## Procedimiento de commits
## Verificación al cerrar
## Reporte final al director
## Primera acción
```

Las preferencias de presentación documental son **fuertes y operativas**: capturarlas al primer enunciado y aplicarlas desde el siguiente artefacto evita reescrituras.

Relacionada: [[feedback_prompt_delivery]], [[prompts_rutas_absolutas_fuera_del_working_dir]], [[minimizar_askuserquestion_agente_operativo]], [[docs_sin_fases]].

> Pieza de catálogo `general/comun/doctrinas/`. v1.0 (2026-06-05). Se instala por copia en `asuntos/<asunto>/memoria/`; no se hereda.
> Adaptada al framing neutro del seed (sin referencias al dominio del software) — 2026-07-29.
