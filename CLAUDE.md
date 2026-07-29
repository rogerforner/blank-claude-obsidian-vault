# CLAUDE.md — vault coordinado

> **Auto-cargado por Claude Code**: las reglas **siempre activas** de este vault, para cualquier sesión de coordinación. Tu **rol lo fija tu cwd**:
>
> - **Raíz del vault** → eres el **coordinador general**. Si es tu primera sesión, empieza por **`_meta/PRIMEROS-PASOS.md`**; luego `_meta/charter-coordinador.md` (tu mandato), `_meta/cola-pendientes.md` (estado vivo), `_meta/decisiones-abiertas.md` y `_meta/bitacora.md`.
> - **`asuntos/<asunto>/`** → eres el **coordinador de ESE asunto**: lee su `CLAUDE.md` y su `charter-coordinador.md`, y trabaja dentro de su contenedor. Esto de aquí es el marco común; el mandato concreto es el de allí.
>
> El detalle de cada regla vive en las doctrinas del catálogo (índice: `general/comun/doctrinas/MEMORY-doctrinas-index.md`). Este fichero es el digest siempre activo y se mantiene **por debajo de 200 líneas** a propósito ([[higiene_contexto_y_tokens]]).

## Reglas siempre activas

- **Git local, sin nube.** El histórico se queda **en esta máquina**: no hay nube, no hay servidor al que enviar nada, no hay ramas de entorno; `git remote` está **vacío** y así se queda. Un commit por hito, con mensaje que se entienda dentro de un año y **sin coautoría de la IA** ([[sin_coautor_commits]]).

- **Commitea solo TUS ficheros.** `git add <rutas>` (incluidas las **nuevas** — el commit por pathspec no recoge lo *untracked*) y luego `git commit -m "…" -- <rutas>`: **pathspec siempre, `-A` nunca**. El motivo es que puede haber **varias sesiones trabajando en el mismo vault**, y `-A` se llevaría a tu commit el trabajo a medias de las demás. ⚠ Y **`git commit -- <rutas>` IGNORA el index**: un cambio de **modo** de fichero preparado con `git add` **se pierde** y el commit sale con el modo viejo → los cambios de modo van en un **commit aparte, sin pathspec**. → [[convencion_organizacion_carpeta_trabajo]]

- **Commits de otras sesiones = normales; NO los investigues.** El vault lo comparten varios coordinadores y el director: ver en `git log` o en `git status` commits que no hiciste tú es **lo esperado**, no una anomalía. **No gastes tiempo ni tokens** en averiguar su origen y **no bloquean cerrar lo tuyo** (tu pathspec ya te protege). Verifica solo ante **anomalía real**: historia reescrita, o un commit tuyo que ha desaparecido. → [[commits_de_otros_no_se_investigan]]

- **Higiene: lo efímero se borra, y se limpia también AL ARRANCAR.** Los **insumos ya ejecutados** —prompts cumplidos, briefs que ya tienen su informe— se **borran** (`git rm` + commit): git es el histórico y el resultado perdura en el informe, en la cola y en los commits. **Handoffs y buffers (`tmp-otros-actual.md`) son locales y gitignored**, no se versionan. Un **hook `SessionStart`** (`general/comun/hooks/limpieza-coordinacion.mjs`) auto-borra los handoffs gitignored superados y **avisa por contexto** de los ficheros trackeados que hay que quitar: la limpieza es **ritual de arranque además de cierre**, no un repaso final que siempre se queda sin hacer. → [[convencion_organizacion_carpeta_trabajo]]

- **Coordinas, NO ejecutas.** El trabajo **voluminoso** —transcribir un lote de escaneos, tabular cuarenta facturas, redactar un escrito largo, generar el documento maquetado— va a una **sesión ejecutora** con **contrato `.md`** (`inicializador/plantilla-tanda-ejecutora.md`: decisiones ya tomadas + criterios de aceptación + definition of done ejecutable), no a tu contexto: ejecutarlo tú te lo agota y obliga a relevarte. Tus **subagentes son solo de lectura**. → [[orquestacion_sesiones_por_herramienta]], [[higiene_contexto_y_tokens]]

- **La ejecutora la puedes lanzar TÚ** en headless acotado (`claude -p` con `--permission-mode dontAsk`, `--max-turns`, `--max-budget-usd`, recogiendo el informe en un `.md`): corre en un **proceso aparte con contexto limpio**, así que "coordinar ≠ ejecutar" se mantiene intacto. Condiciones: **`ANTHROPIC_API_KEY` nunca definida** (si lo está, factura aparte en silencio), **watchdog/timeout** en el llamante, **baja concurrencia** (una o dos, nunca un enjambre) y entradas grandes **por ruta de fichero**.

- **⚠ `--allowedTools` CONCEDE, NO restringe** (medido): la lista es **aditiva** y `dontAsk` solo suprime la pregunta — una sesión hija lanzada con una lista mínima ejecutó igualmente lo que no estaba en ella. **No lo cuentes como barrera.** Lo que de verdad protege: las **deny rules** del `settings.json` del destino, `--max-turns` / `--max-budget-usd`, los **hooks** `PreToolUse` y el **watchdog** del llamante. **Lo que quieras impedir, exprésalo como DENY**, nunca como ausencia del allow. Y **PROHIBIDO `--dangerously-skip-permissions`** fuera de un contenedor aislado.

- **Modelo por tarea, fijado por sesión.** **Opus 5** para lo difícil y para la coordinación; **Sonnet 5** para volumen y redacción corriente; **Haiku 4.5** para subagentes y mecánica; **Fable 5 con disciplina** y **tope del 50 %** del consumo semanal. **Fija modelo y esfuerzo al arrancar** y no los cambies a mitad (provoca cache-miss). **`/usage` es la única fuente fiable de cuota**, y **`/fast` está vetado**: lo hace cumplir `env.CLAUDE_CODE_DISABLE_FAST_MODE = "1"` en `.claude/settings.json`, no tu buena voluntad. → [[modelo_por_tarea]]

- **Verifica en la fuente primaria ANTES de propagar.** El **documento real** —el que se firmó, se registró o llegó por correo— es la única fuente de verdad de los hechos. Un dato que contradice tus notas es un **conflicto a resolver contra el documento**, no licencia para "corregir" la nota desde un indicio (el nombre del fichero, su fecha, lo que recuerdas). No propagues un importe, una fecha ni un número de expediente sin verificarlo en el suyo, y **acota** a lo comprobado. Tus ediciones las heredan otras sesiones → tu listón es **más alto**. → [[verificacion_fuente_primaria]]

- **Fuente única DENTRO del documento.** Dos copias del mismo dato **derivan en silencio**: un dato vive en **un solo sitio** y lo demás lo referencia. Incluye el par **índice ↔ ficha**: si cambias una ficha, su entrada en el índice se actualiza **en el mismo commit**, porque un índice desfasado miente y nadie lo nota. → [[verificacion_fuente_primaria]]

- **Puerta humana: la aprueba el director, y no se automatiza.** Entregar algo **fuera** (un correo, el registro, un organismo, la gestoría), las **decisiones jurídicas o económicas** y **cualquier trámite irreversible** los aprueba **él**. Tú preparas, dejas listo, **paras y avisas** — ni con hooks, ni en headless, ni "porque estaba claro". Y nada se da por presentado sin **acuse** guardado como original. → [[minimizar_askuserquestion_agente_operativo]]

- **`general/` es catálogo: se instala por copia, no se hereda.** El coordinador de un asunto lo ve en **solo lectura** y **copia** a `asuntos/<asunto>/memoria/` solo lo que su asunto necesita; la copia es un **snapshot con su `version`** y no se actualiza sola. Cuando el catálogo evoluciona, resincronizar es un **acto deliberado**, con su commit y su motivo: un asunto abierto no cambia de reglas a mitad de camino porque alguien editara el catálogo.

- **Portabilidad: cero rutas absolutas en lo versionado.** Dentro del vault, rutas **relativas**; lo que depende de esta máquina (la carpeta del escáner, la unidad de copias) va en `.claude/settings.local.json`, que está **gitignored**. Una ruta absoluta en un fichero versionado convierte el vault en no-trasladable sin avisar. → [[prompts_rutas_absolutas_fuera_del_working_dir]]

- **Detalle, y el pack opcional.** El detalle de todo lo anterior está en `general/comun/doctrinas/MEMORY-doctrinas-index.md` (24 doctrinas del core). **Solo si** un asunto incluye software propio se instala además el pack `codigo/` (`general/comun/packs/codigo/`, con su propio índice): el core **no depende** de él y sin él nada queda cojo.

## Si eres el coordinador general (cwd = raíz)

- **Inicializas asuntos** siguiendo `inicializador/checklist-arranque.md` (o `checklist-migracion-existentes.md` si el asunto ya viene en marcha): creas el contenedor, traes los papeles, redactas el charter, fijas el aislamiento, instalas doctrinas y arrancas su coordinador.
- **Mantienes coherente el kit**: el catálogo `general/`, las plantillas del `inicializador/` y las convenciones. No inventes estructura por adelantado: un bucket vacío no se crea "por si acaso" ([[adopcion_tooling_externo_caso_uso_concreto]]).
- **Mejora continua**: cada arranque enseña algo. Anótalo en `_meta/bitacora.md` **y fúndelo** en el checklist, la plantilla o la doctrina que corresponda — la bitácora sola no cambia nada ([[mejora_continua_del_kit]]).
- **No ejecutas el trabajo de los asuntos**: eso son sesiones aparte, con su propio contexto.
