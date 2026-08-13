---
name: Vigilancia tecnológica bajo demanda
description: La investigación de novedades externas (modelos, herramientas, métodos) no sigue calendario fijo: la dispara el director cuando detecta algo a evaluar. El coordinador la convierte en uno o varios briefs FOCALIZADOS de deep research (Chat Web), sintetiza y funde los hallazgos en doctrinas/decisiones. Investigar ≠ adoptar: toda adopción pasa el filtro (caso de uso, condiciones de uso, soberanía del dato, madurez + piloto).
type: convention
version: 1.0
---

La IA y su ecosistema avanzan rápido. Para no perder oportunidades ni esperar meses, la **investigación de novedades externas** se trata como un **pipeline bajo demanda**, no como un calendario.

## Disparo

Lo activa el **director** (o el coordinador, al detectar algo) **cuando quiera**: "investiga X". **Sin cadencia fija.** Complementa la revisión **interna** periódica del kit ([[revision_periodica_forma_de_trabajo]]), que sí tiene cadencia pero mira hacia dentro (poda de doctrinas), no hacia el ecosistema.

## Flujo

1. **Detección** → tema a evaluar.
2. **Concretar:** el coordinador lo parte en **uno o varios briefs FOCALIZADOS** (no un mega-brief genérico que pierda información), desde `inicializador/plantilla-brief-deep-research.md`.
3. **Deep research en Chat Web** — lo ejecuta el director; **no con subagentes** ([[orquestacion_sesiones_por_herramienta]]).
4. **Síntesis** → `_meta/estudios/<tema>/` (informe + `sintesis-decisiones.md`).
5. **Fundir** los hallazgos accionables en doctrinas/decisiones (p. ej. [[modelo_por_tarea]]) o en `_meta/cola-pendientes.md`.

## Enfoque (cómo SÍ)

Los briefs se redactan para **encontrar cómo encaja algo dentro de las restricciones** (pasos, métodos reproducibles, evidencia real), **no** para concluir "imposible". Si algo no encaja, se dice con la **condición exacta** que lo bloquea. *(Aprendido de un caso real: un enfoque escéptico descartó una herramienta que sí servía; la red mostraba métodos concretos que la pregunta, mal planteada, no dejó ver.)*

## Filtro de adopción (investigar ≠ adoptar)

Toda herramienta candidata pasa, en orden: **caso de uso concreto** ([[adopcion_tooling_externo_caso_uso_concreto]]) · **condiciones de uso y licencia** verificadas en la fuente ([[verificacion_fuente_primaria]]) · **soberanía del dato** (¿sale de la máquina lo que se le da? Si hay datos personales del director o de terceros, el servicio en la nube no pasa el filtro) · **madurez + piloto**. La adopción es **decisión del director**, no automática por un informe favorable.

*(Los criterios equivalentes para proyectos de software —licencias permisivas, infraestructura EU/RGPD, servicios externos de la cadena de construcción— viven en el pack `codigo/`: [[licencias_permisivas_estrictas]], [[infra_europa_rgpd]], [[prohibido_uso_herramientas_github_excepto_commits_push]].)*

## Dónde viven

Estudios de **kit** en `_meta/estudios/<tema>/`; de **asunto** en `asuntos/<asunto>/estudios/<tema>/`.

Relacionada: [[revision_periodica_forma_de_trabajo]], [[cuestionar_premisas_arquitectonicas_antes_deep_research]], [[adopcion_tooling_externo_caso_uso_concreto]], [[orquestacion_sesiones_por_herramienta]].

> Pieza de catálogo `general/comun/doctrinas/`. v1.0 (2026-06-10). Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente.
> Adaptada al enfoque neutro de la plantilla (sin referencias al dominio del software) — 2026-07-29.
