---
name: Rama de desarrollo obligatoria; dev→prod y push como paso verificado de la IA
description: La IA edita siempre sobre una rama de desarrollo, nunca sobre producción; al inicializar se analiza si el repositorio del asunto ya tiene rama de desarrollo y, si no, se crea desde producción. El merge dev→prod, el versionado/tags y el push los EJECUTA la IA como paso final verificado: las pruebas que la IA no puede correr las testea el director y reporta, y entonces la IA promociona/pushea. Producción protegida por la rama de desarrollo, no por un bloqueo de permiso.
type: doctrine
version: 2.1
---

Para que el trabajo con IA **no rompa lo que funciona en producción**, toda edición con IA ocurre sobre una **rama de desarrollo**, nunca directamente sobre la de producción.

> **Ámbito: el repositorio del asunto, no el vault.** Esta doctrina habla del **repositorio de código, que vive fuera del vault** (donde el runtime lo sirve, según `docs/emplazamiento-runtime.md` del asunto) y que sí puede tener remoto, ramas de entorno y despliegue. El **vault de coordinación** es git **local sin remoto** y no tiene ramas dev/prod: nada de lo de aquí se le aplica.

## Reglas

- **Rama de desarrollo obligatoria.** La IA trabaja en `desarrollo` (o `development`, etc.), **nunca sobre `master`/`main`** (producción). Aísla la versión que funciona.
- **Al inicializar: analizar si el repositorio ya tiene rama de desarrollo.** Si existe, úsala; si no, **créala desde producción** antes de cualquier edición.
- **Versionado/tags:** cuando algo funciona y va a producción, **no antes**.
- **dev→prod y push = paso final VERIFICADO que ejecuta la IA.** El trabajo es **paso a paso, con pruebas por el medio**. La IA ejecuta el merge `desarrollo→producción`, el tag y el `push`. La seguridad **no** la da un bloqueo de permiso, sino: (1) la **rama de desarrollo** que aísla producción, (2) la **minuciosidad** paso a paso, (3) las **pruebas**. Las pruebas que la IA **no puede** ejecutar (sin MCP/cowork: smoke en navegador, en una store, en un entorno externo…) **las hace el director y reporta el resultado**; con ese resultado, la IA promociona/pushea. **Nunca se pushea trabajo no verificado.**
- **Gobernanza de promoción (en el charter):** nombres de las ramas dev/prod y quién decide promocionar. La IA no promociona con la verificación abierta.
- **Documentar dev→prod en el README del repositorio** para que cualquiera lo siga.

## Subagentes

Los subagentes **no pushean ni promocionan** ([[no_push_por_subagentes]]); el push lo cierra la **sesión principal** tras la verificación.

## Refuerzo

El **suelo de permisos** de las sesiones bloquea solo lo peligroso/irreversible (lectura de secretos, `sudo`/`su`, `git config --global`, `rm -rf`) — **no** `push`/`merge`, que son flujo legítimo verificado. La gobernanza vive además en el README del repositorio y en el charter del asunto.

Relacionada: [[no_push_por_subagentes]], [[prohibido_uso_herramientas_github_excepto_commits_push]], [[docs_sin_fases]], [[estructura_contenedor_asunto]] (dónde vive el repositorio, fuera del vault).

> Pieza de catálogo `general/comun/packs/codigo/doctrinas/`. **v2.1 (2026-08-10):** corregida la frase de ámbito — el repositorio de código no vive "dentro de `asuntos/<asunto>/`", vive **fuera del vault**, donde el runtime lo sirve (tanda `repo-fuera`); solo se tocan esas menciones, el resto de la doctrina no se reescribe. **v2.0 (2026-06-09):** de "push y dev→prod humanos (gateados por deny)" a "la IA los ejecuta como paso verificado; el humano testea lo no-automatizable y da el go". Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente.

> Adaptada al esqueleto de la plantilla (`asuntos/<asunto>/`) conservando el vocabulario técnico: el enfoque neutro de la plantilla aplica al core, no a este pack — 2026-07-29. Cambios del traslado: la unidad pasa de `proyectos/<repo>/` a `asuntos/<asunto>/`, con el repositorio de código fuera del vault, donde el runtime lo sirve; y se añade el aviso de ámbito de arriba, porque el vault de la plantilla es **git local sin remoto** y sin esa aclaración la doctrina parecería contradecirlo. El contenido de las reglas se conserva íntegro.
