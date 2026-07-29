---
name: Orquestación de sesiones por herramienta — el coordinador divide, no lo ejecuta todo
description: El coordinador coordina; divide el trabajo en sesiones independientes asignadas a la mejor herramienta (Claude Code CLI, Desktop, cowork, chat) y en subagentes read-only, redacta los prompts y verifica. No ejecuta el trabajo voluminoso en su propia sesión, para no agotar su contexto. Dividir y vencer.
type: doctrine
version: 1.3
---

El coordinador **coordina**: su valor es **descomponer** el trabajo, **asignar** cada parte a la **mejor herramienta**, **redactar los prompts** y **verificar/reconciliar** los resultados. **No ejecuta todo en su propia sesión** — eso agota su contexto y desaprovecha herramientas mejores para cada tarea. **Dividir y vencer** supera a una sola sesión que lo hace todo.

## Regla dura: coordinar ≠ ejecutar

El coordinador **NO produce los documentos del asunto** — **ni directamente ni mediante subagentes**. Para cualquier trabajo que escriba o transforme material del asunto (redactar el escrito, tabular las facturas, renombrar el lote de escaneos, generar el PDF), **redacta un prompt estructurado** (con **cabecera Setup**: working dir, modelo, plan mode, esfuerzo) que se lanza en una **sesión CLI dedicada**. Los **subagentes** del coordinador son **solo para lectura/exploración read-only puntual** (p. ej. el reconocimiento inicial de un expediente), **nunca para ejecutar**. Motivo: ejecutar dentro de la sesión del coordinador **agota su contexto/tokens** y obliga a reinicializar coordinadores, además de mezclar coordinación con ejecución. **El coordinador protege su contexto para coordinar.**

## Quién LANZA la sesión ejecutora (v1.2): puede hacerlo el coordinador

Lo que cambia respecto de v1.1 **no es la regla anterior, es quién aprieta el botón**: el coordinador **puede lanzar él mismo** la sesión ejecutora en modo *headless* y recoger el resultado, **sin** que el director haga de transporte. El trabajo sigue ocurriendo **fuera** de su contexto (proceso aparte, contexto limpio), así que la regla dura se respeta.

```bash
claude -p "<tarea + ruta del contrato .md>" \
  --allowedTools "Read,Edit,Bash(git add:*),Bash(git commit:*)" \
  --permission-mode dontAsk --max-turns 20 --max-budget-usd 2.00 \
  --output-format json
```

- **No hereda contexto** del padre y **respeta el `.claude/settings.json` del directorio destino** (sus deny rules no las salta ni `bypassPermissions`).
- **Protege tu contexto, en este orden:** (a) **artefacto `.md` como contrato** (la hija escribe el informe, tú lees un extracto) · (b) `--output-format json` (+`--json-schema`) para una salida corta · (c) subagente Explore (Haiku) que resume · (d) ficheros en disco (Bash trunca a 30.000 chars).
- **Cortacircuitos obligatorios:** `--max-turns` y `--max-budget-usd`; **timeout/watchdog** en el llamante (hay *silent-freeze* documentado al lanzar `claude -p` desde orquestadores de larga vida) y arranque `bash -c 'exec claude -p …'`. Entradas grandes **por ruta de fichero**, no por stdin (topado a 10 MB).
- **Condición de coste:** consume la ventana de la suscripción **solo mientras siga pausada** la escisión de facturación del Agent SDK/`claude -p`; y **`ANTHROPIC_API_KEY` no debe estar definida** (si lo está, factura API en silencio). **Plan B si se revierte:** subagentes intra-sesión (read-only o `add`+`commit` local). → [[modelo_por_tarea]]
- **Baja concurrencia:** 1 coordinador + **1-2 ejecutoras** secuenciales o poco paralelas. Un enjambre **reduce** el trabajo útil semanal de una persona sola.

## Puertas de aprobación: tres capas (declarativas, no confianza en el prompt)

1. **Deny rules** en `settings.json` para lo **inviolable**: los comandos que sacan algo fuera de la máquina (envío, publicación, sincronización con la nube), las carpetas de **originales** recibidos, los almacenes de credenciales de la máquina, `.git/`, `rm -rf`. **Un `deny` gana a todo**, incluso a `bypassPermissions`.
2. **`defer`** (`permissionDecision` del hook `PreToolUse`, **solo honrado en `-p`**) para lo **irreductiblemente humano**: una comprobación en campo, una autenticación con certificado, una decisión jurídica o económica, y **la entrega fuera** (correo, registro, gestoría, organismo). La sesión se pausa con `stop_reason: "tool_deferred"` y se reanuda con `claude -p --resume <session-id>`; **necesita un wrapper** que lea la petición y decida cuándo reanudar. Precedencia: **`deny > defer > ask > allow`**.
3. **`--allowedTools`** para **declarar la intención**… pero **NO cuenta como defensa** (ver el aviso de abajo).

## ⚠ `--allowedTools` CONCEDE, no restringe (medido, no supuesto)

**`--allowedTools` es una lista ADITIVA, no una lista blanca exclusiva**, y `--permission-mode dontAsk` significa *"no preguntes"*, **no** *"deniega lo no listado"*. Verificado empíricamente en **Claude Code 2.1.220** (sesión real, 2026-07-28, cuatro pruebas): una sesión hija lanzada con `--allowedTools "Read"` (sin `Bash`) **ejecutó Bash igualmente**; se descartaron confusores (retirar `bypassPermissions` del settings y lanzar sin `--permission-mode` no cambió nada) y la prueba concluyente pidió el valor de una **variable de entorno aleatoria** generada segundos antes — inalcanzable por `Read` — y la hija lo devolvió.

**Lo que SÍ protege, por orden (también medido):**
1. **Deny rules del `settings.json` del destino** — se pidió ejecutar un comando que el destino tenía **denegado**, **teniéndolo declarado en la propia `--allowedTools`**, y **fue denegado**; y aguantan **incluso bajo `--dangerously-skip-permissions`**.
2. **`--max-turns` y `--max-budget-usd`** (cortacircuitos duros).
3. **Hooks `PreToolUse`** — corren al margen del modo de permisos.
4. **Watchdog/timeout del llamante.**

**Regla que se deriva:** *si quieres impedir algo, exprésalo como **DENY**, nunca como ausencia del allow.* Se sigue pasando `--allowedTools` porque **documenta la intención** y protegería si el comportamiento cambiara, pero **no se cuenta como barrera**.

**Método para probar si una herramienta está realmente disponible:** el dato que pidas debe ser **inalcanzable** por las herramientas que sí concediste. Dos pruebas que parecen válidas y **no lo son**: pedir un `git status` (Claude Code lo **inyecta** en el contexto inicial → la hija responde sin ejecutar nada) y pedir cualquier dato que ya conste **por escrito** en los documentos del asunto (lo ve con `Read`).

**Aviso de espera:** hook `Notification` (PowerShell en Windows, webhook, o Remote Control desde el móvil).

## Preguntas sin humano, y relevos

- **Que la ejecutora resuelva sola en vez de preguntar:** un **MCP local stdio de "fuente de verdad"** que exponga doctrina/decisiones/contratos como herramienta consultable (regístralo con `claude mcp add`, **no** en `settings.json`, que lo ignora en silencio), y/o un hook `SessionStart` que inyecte la doctrina al arrancar.
- **Límite duro:** los hooks **solo hablan por stdout/stderr/exit code**; **no pueden lanzar tool calls ni comandos `/`** → **una sesión no puede auto-arrancar su sucesora**. Hace falta un **orquestador externo** (cron / Programador de tareas / wrapper). `SessionEnd` no puede bloquear ni lanzar nada; `PreCompact` sí puede snapshotear y bloquear la compactación.
- **`/clear` + handoff `.md` sigue siendo mejor que la compactación** (determinista, auditable, barato). Automatiza el `.md` con `PreCompact`/`SessionEnd`; que el orquestador arranque la siguiente e inyecte el handoff por `SessionStart`.
- **Cola de tandas:** ficheros `.md` en el vault consumidos por el orquestador (más simple y soberano que la task list experimental de *Agent Teams*, que cuesta ~3-4×). Añade un `PostToolUse` que escriba **audit log** JSON-lines.
- **Cruce entre asuntos sin romper el aislamiento:** **buzón `_meta/buzon/`** de mensajes `.md`, o un "coordinador de integración" **efímero** para cruces puntuales (p. ej. una obra cuya factura entra en la declaración).

*(El aislamiento por worktree para sesiones concurrentes sobre un repositorio de código vive en el pack `codigo/` → [[no_push_por_subagentes]].)*

## Lo que NO se automatiza

**Entregar fuera** (enviar el correo, presentar en el registro, remitir a la gestoría o al organismo) · **firmar** · **comprobaciones en campo** · **autenticaciones interactivas** (certificado, clave, 2FA) · **decisiones jurídicas o económicas** · **pagos**. Todo eso va detrás de una puerta (`defer` o deny rule), nunca automatizado. El agente **prepara** el envío y para; el gesto de enviar es del director.

## Seguridad al subir la autonomía

**Prompt injection** es real (el modelo no distingue datos de instrucciones) — y en un vault doméstico el material de entrada viene **de fuera**: correos, PDF de terceros, resoluciones descargadas. Medidas: sandboxing, **deny de `curl`/`wget`** (deny, no "ausencia de allow"), rutas protegidas, `--max-turns`/`--max-budget-usd`, hooks `PreToolUse`. **NUNCA `--dangerously-skip-permissions` fuera de un entorno aislado** — y ten presente que, aun con ese flag, **las deny rules siguen aplicando** (es la única barrera que aguanta). Y separa **hacer** de **comprobar**: el verificador no puede ser el mismo agente que hizo el trabajo ([[verificacion_e2e_por_agente]]).

## Herramienta por tipo de tarea

- **Claude Code CLI** — **ejecución** de tareas que implican **edición de ficheros** del vault: redactar, reestructurar, renombrar lotes, convertir formatos, generar PDF. Aprovecha su potencia y el modo *headless*.
- **Claude Code Desktop** — **coordinación y consulta**: el propio coordinador, el consultor read-only y la revisión. No la ejecución voluminosa de edición.
- **Cowork / Claude in Chrome** — tareas de navegador (consultar una web pública, capturas). **Cowork es GA (2026) y está en Team**, pero corre en la **nube de Anthropic** (remote sessions + connectors) y sin audit logs → **frontera de soberanía: datos personales, documentos del asunto y originales NUNCA en Cowork**; solo búsqueda pública o síntesis no sensible. Claude in Chrome (GA en Code/Cowork) opera con **tu sesión real** del navegador → solo sitios de confianza, y **nunca** con una sede electrónica o la banca abiertas.
- **Palancas soberanas en Claude Code local** (preferentes, jul-2026) — **hooks** (incl. `defer` = puerta de aprobación human-in-the-loop), **subagentes/background agents** (2-3 puntuales, **no** swarms), **skills** (`SKILL.md` versionadas en git; ya maduras para encapsular doctrina) y **output styles**. Todo local, versionable y auditable → mejores que Cowork para lo sensible. **NO** dynamic workflows masivos (research preview; sobredimensionados; agotan cuota — ver [[modelo_por_tarea]]).
- **Chat web** — Deep Research multifuente ([[vigilancia_tecnologica_bajo_demanda]]), no Claude Code.
- **Subagentes read-only** (dentro de la sesión del coordinador) — **solo** para *offload* de lectura/exploración voluminosa (devuelven un resumen); **nunca para ejecutar cambios**. Evitan inflar el contexto del coordinador.

## Flujo

1. El coordinador **descompone** la tarea en piezas con dependencias claras.
2. **Asigna** cada pieza a la herramienta óptima.
3. **Redacta el prompt `.md`** de cada pieza ([[formato_prompts_markdown_limpio]], [[feedback_prompt_delivery]]).
4. El director **relaya** el prompt a la sesión correspondiente (o el coordinador la lanza en headless).
5. El coordinador **verifica y reconcilia** (*trust-but-verify*) y prepara el siguiente paso.

## Ritmo de entrega al director

El coordinador entrega los pasos **de uno en uno** — o **dos a la vez solo si van en herramientas distintas** y son paralelos (p. ej. una tanda CLI + un brief de chat). **No vuelca toda la lista de pasos de golpe**: satura y desorienta al director. Tras cada paso, confirma el resultado y propone el siguiente.

## Quién la aplica

**Todo coordinador** — el general del vault y el de cada asunto. El coordinador **protege su contexto para coordinar**; el trabajo voluminoso vive en sesiones focalizadas.

Relacionada: [[modelo_por_tarea]] (modelo por tarea + evitar workflows multiagente masivos), [[paralelismo_subagent_opus_principal]], [[sesion_consultor_paralelo]], [[recalibracion_tiempos]], [[higiene_contexto_y_tokens]].

> Pieza de catálogo `general/comun/doctrinas/`. **v1.3 (2026-07-28):** **CORRECCIÓN DE SEGURIDAD** — la v1.2 afirmaba que `--allowedTools` acotado restringe a la sesión hija ("con `dontAsk` lo no listado se deniega"). **Es FALSO**: `--allowedTools` **concede** (lista aditiva) y `dontAsk` solo suprime la pregunta. Medido en Claude Code 2.1.220 con prueba de dato inalcanzable (variable de entorno aleatoria), descartando confusores. **Lo que protege son las deny rules** (aguantan hasta bajo `--dangerously-skip-permissions`), los cortacircuitos `--max-turns`/`--max-budget-usd`, los hooks `PreToolUse` y el watchdog. Regla nueva: **lo que quieras impedir, exprésalo como DENY**. Añadido el método de prueba (el dato pedido debe ser inalcanzable por las herramientas concedidas) y los dos falsos positivos clásicos (`git status` va inyectado en el contexto; lo que ya consta por escrito se lee con `Read`). *(Lección: la afirmación venía de un informe de deep research y se propagó sin verificar empíricamente → [[verificacion_fuente_primaria]].)* **v1.2 (2026-07-28):** cambio de fondo — **el coordinador puede LANZAR él mismo la sesión ejecutora** en headless (`claude -p` acotado, contexto aparte → la regla "coordinar ≠ ejecutar" se mantiene), con sus cortacircuitos, la condición de facturación (pausa reversible + `ANTHROPIC_API_KEY` ausente) y plan B; **puertas en 3 capas** con `defer` (GA, solo en `-p`, precedencia `deny > defer > ask > allow`); MCP fuente-de-verdad para que la ejecutora no pregunte; límite duro de los hooks (no pueden auto-arrancar la sucesora → orquestador externo); `/clear`+handoff validado sobre la compactación; buzón entre asuntos; baja concurrencia; y lo que no se automatiza. **v1.1 (2026-07-15):** palancas soberanas locales (hooks, subagentes, skills, output styles); Cowork GA pero cloud; veto a dynamic workflows. *(El frontmatter quedó en 1.0 por descuido en v1.1; corregido en v1.2.)* v1.0 (2026-06-05). Se instala por copia en `asuntos/<asunto>/memoria/`; no se hereda.
> Adaptada al framing neutro del seed (sin referencias al dominio del software) — 2026-07-29.
