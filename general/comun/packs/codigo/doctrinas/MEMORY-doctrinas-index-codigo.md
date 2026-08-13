# Índice de doctrinas del pack `codigo/` — `general/comun/packs/codigo/doctrinas/`

> **Este pack presupone el core.** No es un catálogo alternativo: es un **añadido** a `general/comun/doctrinas/`, que se instala **encima** y **nunca en lugar de él**. Las diez piezas de aquí dan por supuestas las del core (estructura del contenedor de asunto, verificación por el agente, modelo por tarea, commits sin coautor, guarda de ficheros sensibles…) y enlazan a ellas con normalidad. Instalar el pack sin el core deja doctrinas cojas; instalar el core sin el pack **no deja nada cojo** → [`../README.md`](../README.md) para qué es un pack y cómo se instala.
>
> **Aquí sí se habla de software.** El resto de la plantilla usa vocabulario neutro de dominio (asunto, producto, verificaciones); en este pack el vocabulario técnico —repositorio, rama, push, tests, lint, contenedores, gestor de paquetes— **se conserva a propósito**: el valor del pack es ser concreto. Cada pieza **se instala por copia** en `asuntos/<asunto>/memoria/`; **no se hereda**.

## Puertas de calidad y pruebas

- [Gates de calidad locales](gates_de_calidad_locales.md) — *"las pruebas pasan"* deja de ser una afirmación asumida y pasa a ser **una puerta ejecutada** que impide cerrar la tarea en rojo. `PostToolUse` para lo rápido por edición · **el hook `Stop` corre por TURNO**, así que **verifica sello + huella** en vez de ejecutar el DoD (y comprueba `stop_hook_active`, o hay bucle infinito) · pre-commit para secretos e integridad. El `PreToolUse` **solo ve `Edit`/`Write`**: una escritura por Bash lo esquiva ⇒ los invariantes se comprueban también sobre el **estado final** en el DoD. **Mutation score, no cobertura**, y el agente **nunca edita sus criterios de aprobación**.
- [Estrategia de pruebas por tipo de proyecto](estrategia_de_pruebas_por_tipo_de_proyecto.md) — Qué se le exige a cada asunto según su perfil: **greenfield estricto** (todo bloqueante desde el día 1), **legacy en contención** (solo el código nuevo, baseline que solo decrece, no tocar el legacy) e **infra** (contratos declarativos y smoke reproducible). La criticidad es la variable de gobierno, y **el humano revisa la especificación, no la implementación**.

## Git del asunto: ramas, push y proveedor de hosting

*(Las tres aplican al **repositorio de código, que vive fuera del vault** — donde el runtime lo sirve, según `docs/emplazamiento-runtime.md` del asunto —, no al vault de coordinación, que es git local sin remoto.)*

- [Rama de desarrollo y paso a producción](rama_desarrollo_y_paso_a_produccion.md) — La IA edita siempre en la rama de desarrollo, nunca sobre producción; el merge dev→prod, el tag y el push los **ejecuta la IA como paso final verificado**, con el director testeando lo que la IA no puede y dando el go.
- [Los subagentes no hacen push](no_push_por_subagentes.md) — El push lo cierra la **sesión principal**; el subagente es read-only o, como mucho, `add`+`commit` local, y **nunca** reescribe historia ni cambia de rama en árbol compartido (los worktrees aíslan ficheros, no el estado git). El reflog **no distingue al actor**: ante anomalía, preguntar antes de declarar incidencia.
- [Remoto como Git puro, sin el ecosistema del proveedor](prohibido_uso_herramientas_github_excepto_commits_push.md) — Tres acciones permitidas (commits locales, push verificado, visualización read-only); prohibido el CI integrado, la CLI del proveedor y cualquier SaaS externo de build/test/security. Todo se ejecuta en local o en infraestructura propia.

## Dependencias, licencias e infraestructura

- [Licencias permisivas estrictas](licencias_permisivas_estrictas.md) — Tres líneas rojas: sin contagio copyleft al código propio, sin restricciones anti-SaaS al modelo de negocio, y PI defendible. Copyleft solo en microservicio aislado por REST. Zonas grises → al director.
- [Infraestructura en región europea, matizada por exposición](infra_europa_rgpd.md) — EU **obligatoria** cuando el input libre del usuario puede llevar datos personales; EU **deseable** cuando el diseño garantiza que no los hay. La distinción no es laxitud: es honestidad sobre dónde aplica el riesgo.
- [pnpm y cadena de suministro](pnpm_supply_chain.md) — En asuntos con Node: pnpm v11+, `minimumReleaseAge`, pin exacto, `onlyBuiltDependencies: []`, sin Renovate/Dependabot. La más específica del pack: si el asunto no lleva Node, se ignora.

## Contenedores

- [Verificar en el runtime real, no en el host](verificar_en_el_runtime_no_en_el_host.md) — El filesystem que ves no es el que ejecuta: un árbol de dependencias incompleto en el host **NO** significa que la app esté rota (el contenedor las tiene todas), y su presencia tampoco prueba que el runtime las cargue. Comprueba **dentro**, no "arregles" el host; las librerías servidas desde un host externo son **ilegibles** para un agente, así que lo que afirme de ellas es suposición; "verificado en código" ≠ verificado en el runtime.
- [Higiene de disco en stacks Podman/Compose](higiene_disco_podman.md) — Los stacks acumulan disco en silencio. **Medir antes de limpiar** (`podman system df`), **backup verificado antes de destruir**, poda quirúrgica (nunca `system prune -a --volumes` por costumbre), proteger imágenes pesadas y volúmenes con datos, rotar backups.

## Además del catálogo

- [`../README-repo-codigo.md`](../README-repo-codigo.md) — plantilla del README del repositorio de código y cómo alinear su `CLAUDE.md`/`AGENTS.md` y sus reglas con las doctrinas instaladas en el asunto.
