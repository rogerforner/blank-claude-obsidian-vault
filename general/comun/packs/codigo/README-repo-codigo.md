# Plantilla del README del repo de código + alineación de `CLAUDE.md`/`rules`

Cuando un asunto incluye software propio, el repositorio de código vive **fuera del vault**, en la máquina donde el runtime lo sirve. Ese emplazamiento queda registrado en `docs/emplazamiento-runtime.md`, dentro del contenedor del asunto (`asuntos/<asunto>/`). El repositorio guarda **solo código + un README típico**: toda la documentación de coordinación (arquitectura, decisiones, guías, charters, handoffs, briefs, estudios) vive en el **vault de coordinación**, en `asuntos/<asunto>/`, no en el repositorio. El repositorio **apunta** a ella **por el nombre del vault + la ruta relativa interna**, nunca por una ruta absoluta de una máquina concreta.

## Plantilla de `README.md` del repo

```markdown
# {{ASUNTO}}

<una o dos líneas: qué es y para qué sirve>

## Stack

{{STACK}}

## Cómo empezar

<requisitos, instalación, arranque, tests — todo local>

## Documentación

La documentación de coordinación (arquitectura, decisiones, guías) vive en el vault
de coordinación `{{VAULT}}`, en:

`asuntos/{{ASUNTO}}/docs/`

Consulta esa carpeta en el vault. Este repositorio contiene solo el código;
charters, handoffs, briefs y estudios no se guardan aquí.

## Ramas y paso a producción

- Rama de producción: `{{RAMA_PROD}}`. Rama de desarrollo: `{{RAMA_DEV}}`.
- Todo el trabajo (incluida la IA) va en `{{RAMA_DEV}}`; `{{RAMA_PROD}}` no se edita directamente.
- Versionado/tags: solo al pasar a producción.
- Paso de desarrollo a producción — la IA lo ejecuta como **paso verificado**; el director aporta las pruebas que la IA no puede correr y da el go:
  1. Verificar que `{{RAMA_DEV}}` está estable y probado (tests de la IA + los que el director testea y reporta).
  2. `git switch {{RAMA_PROD}}` + `git merge {{RAMA_DEV}}` + tag de versión (si aplica).
  3. `git push`.
  (Según la gobernanza del asunto: indica quién decide promocionar.)
```

> **Nota:** la **decisión** de promocionar es humana (gobernanza del asunto); la **ejecución** (merge + tag + `push`) la hace la IA como **paso verificado**, con el director testeando lo que la IA no puede y dando el go — [[rama_desarrollo_y_paso_a_produccion]].

> **Nota de portabilidad:** no escribas hacia el vault una ruta absoluta de tu máquina en el README. Refiérete al vault por su **nombre** (`{{VAULT}}`) + la ruta **relativa interna** (`asuntos/{{ASUNTO}}/docs/`) — [[prompts_rutas_absolutas_fuera_del_working_dir]]. Es lo que hace que la instrucción siga valiendo aunque el vault cambie de sitio o de máquina.

> **Nota sobre los dos árboles:** el vault de coordinación es **git local, sin remoto**; el repositorio del asunto **sí** puede tener remoto y ramas de entorno. Son dos repositorios distintos con dos modelos distintos: lo de "ramas y paso a producción" es del repositorio, no del vault ([[no_push_por_subagentes]]).

## Alineación de `CLAUDE.md` / `AGENTS.md` del repo

- **Referencia breve**, no duplicar doctrina: el `CLAUDE.md`/`AGENTS.md` del repositorio resume las convenciones operativas vivas y **apunta** a las doctrinas instaladas (`asuntos/<asunto>/memoria/` del vault) y a `docs/`.
- **Sin referencias a fases ni identificadores históricos** en el contenido ([[docs_sin_fases]]): describe el estado actual del sistema, sus contratos y convenciones.
- **Refleja las doctrinas operativas** que afectan al agente: push verificado por la sesión principal; subagentes no pushean ([[no_push_por_subagentes]]), commits sin `Co-Authored-By` ([[sin_coautor_commits]]), Haiku para mecánica ([[modelo_por_tarea]]), verificación E2E por el agente ([[verificacion_e2e_por_agente]]), y las puertas que impiden cerrar la tarea en rojo ([[gates_de_calidad_locales]]).

## `.claude/rules/` del repo

Reglas operativas vivas, concisas, alineadas con las doctrinas instaladas. La lista de denegación del repositorio bloquea **solo credenciales de máquina** (`~/.ssh`, `~/.aws`, …); la config del asunto (`.env` y demás) es **editable en local** ([[sensitive_file_guard]] v2.0) — en desarrollo no hay datos de producción y así el `.env` no se desfasa del `.env.example`.

## Dónde encaja esto en el contenedor del asunto

La estructura del contenedor la fija [[estructura_contenedor_asunto]]: `asuntos/<asunto>/` con su raíz de coordinación, `.claude/`, `docs/`, `estudios/`, `memoria/` y `coordinacion/`. El repositorio de código vive **fuera de ese contenedor**, con su propio `.git`; el contenedor lo **referencia** por la ficha de emplazamiento (`docs/emplazamiento-runtime.md`), no lo contiene.

> Pieza del pack `codigo/`, adaptada al esqueleto de la plantilla (`asuntos/<asunto>/`) conservando su vocabulario técnico — el detalle del traslado queda en el historial de git.
