---
name: Repo remoto como Git puro; CI/tooling local, no SaaS externo
description: El repositorio remoto se trata como remoto Git puro (commits locales + push como paso verificado + visualización read-only). Prohibido el resto del ecosistema del proveedor de hosting y cualquier SaaS externo de CI/CD/testing/security/build; todo se ejecuta local o en infraestructura propia.
type: doctrine
version: 1.2
---

El repositorio en el proveedor de hosting (GitHub u otro) se trata **exclusivamente como remoto Git puro**. Razón fundacional: **soberanía operativa total + control de datos + cero dependencia de SaaS extranjeros** para procesos críticos del ciclo de desarrollo.

> **Ámbito: el repositorio del asunto, no el vault.** El **vault de coordinación** es git **local sin remoto**: no tiene proveedor de hosting y esta doctrina no le aplica. Aplica al **repositorio de código, que vive fuera del vault** (donde el runtime lo sirve, según `docs/emplazamiento-runtime.md` del asunto), que sí puede tener remoto. La consecuencia práctica se conserva igual en ambos: **nada de SaaS externo** para lo que se puede ejecutar en local.

## Las tres acciones permitidas

1. **Commits locales** (con las reglas del asunto: ver [[sin_coautor_commits]], [[no_push_por_subagentes]]).
2. **Push al remoto Git puro** — como paso final **verificado** ([[no_push_por_subagentes]], [[rama_desarrollo_y_paso_a_produccion]]); lo que importa aquí es que el remoto es Git puro, sin SaaS encima.
3. **Visualización read-only** de la web del proveedor (estado de ramas, commits). No produce acciones técnicas.

## Lo prohibido

- **El ecosistema del proveedor más allá del remoto Git:** CI integrado (Actions y equivalentes), gestión automática de dependencias, *code/secret scanning*, Issues/Projects/Discussions/Pages/Wikis como tracker del asunto, entornos cloud del proveedor, asistentes de PR. La CLI del proveedor (`gh` y equivalentes) **no se usa**.
- **Cualquier SaaS externo de CI/CD, testing, security scanning, code quality, build/release o coverage** alojado por terceros.

## Lo permitido en local / infraestructura propia

Tests, lint, análisis estático (p. ej. Semgrep CLI), auditoría del gestor de paquetes, *pre-commit hooks* de detección de secretos, smoke E2E, builds y reportes de coverage — **todo ejecutado localmente o en infraestructura propia**, sin subir a servicios externos. Git puro sí: `fetch`, `status`, `log`, `diff`, `branch -r`, etc.

## Reapertura

Permanente por defecto. Reapertura puntual para un servicio concreto **solo** bajo análisis explícito que demuestre un caso de uso que la infraestructura local no resuelve, compatibilidad con [[infra_europa_rgpd]] y [[licencias_permisivas_estrictas]], y decisión firmada por el director.

Relacionada: [[no_push_por_subagentes]], [[infra_europa_rgpd]], [[licencias_permisivas_estrictas]], [[adopcion_tooling_externo_caso_uso_concreto]] (el gate general de tooling externo, en el core).

> Pieza de catálogo `general/comun/packs/codigo/doctrinas/`. **v1.2 (2026-08-10):** corregida la frase de ámbito — el repositorio de código no vive "dentro de `asuntos/<asunto>/`", vive **fuera del vault**, donde el runtime lo sirve (tanda `repo-fuera`); solo se toca esa frase, el resto de la doctrina no se reescribe. v1.1 (2026-06-09: "push manual del director" → "push como paso verificado", alineado con el nuevo modelo de autonomía). Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente. Es un default opinado; un asunto con otro modelo de soberanía la adaptaría al instalarla.

> Adaptada al esqueleto del seed (`asuntos/<asunto>/`) conservando el vocabulario técnico: el framing neutro del seed aplica al core, no a este pack — 2026-07-29. Cambios del traslado: "proyecto" pasa a "asunto" como unidad, con el repositorio de código fuera del vault (tanda `repo-fuera` corrige esta mención, que databa de la adaptación original); y se añade el aviso de ámbito de arriba porque el vault del seed no tiene remoto. Lo prohibido y lo permitido se conservan íntegros.
