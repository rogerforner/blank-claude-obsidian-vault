---
name: commits_de_otros_no_se_investigan
description: En un vault trabajado por varias sesiones (varios coordinadores + el director, trabajo concurrente), los commits que una sesión no hizo son NORMALES; no se investiga su procedencia ni bloquean cerrar tareas. Verificar solo ante anomalía real (historia reescrita, commit propio perdido).
type: convention
version: 1.0
---

El vault es **compartido en el tiempo y entre sesiones**: el coordinador general, los coordinadores de cada asunto, las sesiones ejecutoras y el propio director trabajan de forma intercalada y commitean sobre el mismo árbol local.

**Ver en `git log` / `git status` commits que TÚ no hiciste es LO ESPERADO, no una anomalía.** Los hizo otra sesión o el director.

- **NO dediques tiempo ni tokens a averiguar de dónde salió un commit ajeno.** No es un misterio a resolver, y su existencia **no impide cerrar tus tareas**.
- Tu propia disciplina ya te protege: commiteas por **pathspec** (`git commit -- <tus rutas>`, **nunca `-A`**), así no pisas lo de otras sesiones ni ellas lo tuyo. Con eso basta.
- **Verifica SOLO ante una anomalía real**, y de forma **breve**:
  - Historia **no lineal / reescrita**, o **tu** commit que ha desaparecido → ahí sí: mira `git log` y **pregunta** antes de asumir.
  - Un commit nuevo de otra sesión **NO es** ninguna de estas cosas → sigue con lo tuyo.
- **Motivo:** el tiempo y los tokens son escasos; gastarlos rastreando commits ajenos es puro desperdicio.

El git de este vault es **local**: no hay nada que sincronizar con fuera, así que tampoco hay conflictos de sincronización que resolver. Un cambio de estado que sí exige parar es que falte un **documento** que dabas por presente — eso no es un commit ajeno, es un hallazgo bloqueante ([[minimizar_askuserquestion_agente_operativo]]).

Relacionada: [[sin_coautor_commits]], [[convencion_organizacion_carpeta_trabajo]], [[verificacion_fuente_primaria]].

> Pieza de catálogo `general/comun/doctrinas/`. v1.0 (2026-06-23). Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente.
> Adaptada al framing neutro del seed (sin referencias al dominio del software) — 2026-07-29.
