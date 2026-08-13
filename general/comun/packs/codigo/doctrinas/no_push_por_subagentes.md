---
name: Push verificado; los subagentes no hacen push
description: El push (y lo que toca remotos o reescribe historia) lo ejecuta la SESIÓN PRINCIPAL como paso final verificado, nunca un subagente (que permanece read-only o, como mucho, add+commit local). Seguridad por proceso (rama de desarrollo + tests + minuciosidad), no por bloqueo de permiso. El reflog no distingue al actor: ante anomalía de remoto, preguntar antes de declarar incidencia.
type: doctrine
version: 2.4
---

> **Sintaxis:** el mecanismo de aislamiento por `isolation: worktree` es de Claude Code. Detalle → tabla "Ejecución" en [`../README.md`](../README.md).

El **push lo ejecuta la sesión principal** (coordinador o sesión de ejecución supervisada) como **paso final verificado** del flujo (ver [[rama_desarrollo_y_paso_a_produccion]]): solo después de que las pruebas pasen —las que la IA no puede ejecutar las testea el director y reporta el resultado— y con producción protegida por la rama de desarrollo. **No es un bloqueo de permiso, es disciplina de proceso.**

> **Ámbito: el repositorio del asunto, no el vault.** El **vault de coordinación** es git **local sin remoto**: allí no hay push que dar. Esta doctrina aplica al **repositorio de código, que vive fuera del vault** (donde el runtime lo sirve, según `docs/emplazamiento-runtime.md` del asunto). Lo que sí sobrevive tal cual en el vault es la parte de **no reescribir historia desde un subagente** y la de **no cambiar de rama en un árbol compartido**.

> **"Las pruebas pasan" se EJECUTA, no se asume (v2.1).** Donde el asunto tenga puertas instaladas, esa precondición la comprueba una **puerta determinista** (hook `Stop`/`SubagentStop` con **exit 2**, que impide cerrar el turno con la puerta en rojo), no la afirmación del agente en su reporte. Un "todo OK" sin puerta ejecutada **no cuenta como verificación**. → [[gates_de_calidad_locales]], [[estrategia_de_pruebas_por_tipo_de_proyecto]]

## Lo que NO cambia: los subagentes no pushean

Un subagente delegado es trabajo **menos supervisado y con contexto parcial**. Se limita a su scope (lectura read-only, o como mucho `git add`+`git commit` local cuando el prompt lo pida) y **nunca** toca remotos (`push`/force-push) ni reescribe historia (`rebase`/`reset`). Ante algo ambiguo: *"operación fuera de mi scope, escalo a la sesión principal"*. Es defensa en profundidad: la sesión principal tiene el contexto completo, la verificación y el go del director; el subagente no.

**Tampoco `git switch`/`checkout` de rama en un árbol compartido (v2.2).** Los worktrees **aíslan ficheros, no el estado git**: un subagente que cambia de rama —incluso con `isolation: worktree`— **puede mover el HEAD del repositorio padre** (bug #55708) y arrastrar a las demás sesiones. Regla: el **worktree se asigna a nivel de sesión CLI**, no de subagente; los subagentes trabajan sobre la rama que ya está activa; las ramas automáticas van con prefijo propio (p. ej. `claude/`) y **nunca** se promueve a `main`/producción automáticamente.

## El reflog no distingue al actor

El reflog, la historia git y los *timestamps* distinguen "ocurrió" vs "no ocurrió", pero **no** humano vs agente vs otra sesión. Ante "el remoto se ha movido", **preguntar primero al director si fue acción suya** (o de otra sesión del vault compartido) antes de aceptar el diagnóstico de un agente como incidencia.

## Estado de cierre correcto

Tras verificar, el cierre correcto es: pruebas OK (las propias + las que reportó el director) → **push ejecutado** → working tree limpio. Si falta una prueba que la IA no puede ejecutar, el cierre correcto es: *"pendiente del test del director; push tras su go"*. Un push de trabajo **no verificado** nunca es correcto.

Relacionada: [[rama_desarrollo_y_paso_a_produccion]], [[sin_coautor_commits]], [[prohibido_uso_herramientas_github_excepto_commits_push]], [[gates_de_calidad_locales]], [[commits_de_otros_no_se_investigan]] (la otra cara: los commits ajenos son normales, no incidencia).

> Pieza de catálogo `general/comun/packs/codigo/doctrinas/`. **v2.4 (2026-08-10):** corregida la frase de ámbito — el repositorio de código no vive "dentro de `asuntos/<asunto>/`", vive **fuera del vault**, donde el runtime lo sirve (tanda `repo-fuera`); solo se toca esa frase, el resto de la doctrina no se reescribe. **v2.3 (2026-08-10):** añadida la remisión a la tabla "Ejecución según el agente" del `README.md` del pack, sin reescribir la doctrina. **v2.2 (2026-07-28):** los subagentes tampoco cambian de rama en árbol compartido (los worktrees aíslan ficheros, no el estado git: #55708) → worktree por **sesión CLI**, no por subagente. **v2.1 (2026-07-28):** la precondición "las pruebas pasan" pasa de **asumida** (afirmación del agente) a **ejecutada** por gate determinista (hook `Stop`/`SubagentStop` con exit 2) donde el asunto los tenga instalados. **v2.0 (2026-06-09):** cambio de modelo — de "push solo el director" a "push verificado por la sesión principal; los subagentes nunca". Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente.

> Adaptada al esqueleto de la plantilla (`asuntos/<asunto>/`) conservando el vocabulario técnico: el enfoque neutro de la plantilla aplica al core, no a este pack — 2026-07-29. Cambios del traslado: la unidad pasa de `proyectos/<repo>/` a `asuntos/<asunto>/`; se añade el aviso de ámbito de arriba, que además marca **qué parte sí sobrevive en un vault sin remoto** (no reescribir historia, no cambiar de rama en árbol compartido). El contenido se conserva íntegro.
