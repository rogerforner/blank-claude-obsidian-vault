---
name: Orquestación de sesiones por herramienta — el coordinador divide, no lo ejecuta todo
description: El cwd con el que se LANZA la sesión hija es parte del contrato (decide reglas, hooks y raíz de búsqueda), y toda tanda no trivial va en dos ejecutoras: análisis read-only con fichero de plan y luego ejecución contra la spec corregida. El coordinador coordina; divide el trabajo en sesiones independientes asignadas a la mejor herramienta (Claude Code CLI, Desktop, cowork, chat) y en subagentes read-only, redacta los prompts y verifica. No ejecuta el trabajo voluminoso en su propia sesión, para no agotar su contexto. Dividir y vencer.
type: doctrine
version: 1.7
---

El coordinador **coordina**: su valor es **descomponer** el trabajo, **asignar** cada parte a la **mejor herramienta**, **redactar los prompts** y **verificar/reconciliar** los resultados. **No ejecuta todo en su propia sesión** — eso agota su contexto y desaprovecha herramientas mejores para cada tarea. **Dividir y vencer** supera a una sola sesión que lo hace todo.

## Regla dura: coordinar ≠ ejecutar

El coordinador **NO produce los documentos del asunto** — **ni directamente ni mediante subagentes**. Para cualquier trabajo que escriba o transforme material del asunto (redactar el escrito, tabular las facturas, renombrar el lote de escaneos, generar el PDF), **redacta un prompt estructurado** (con **cabecera Setup**: working dir, modelo, plan mode, esfuerzo) que se lanza en una **sesión CLI dedicada**. Los **subagentes** del coordinador son **solo para lectura/exploración read-only puntual** (p. ej. el reconocimiento inicial de un expediente), **nunca para ejecutar**. Motivo: ejecutar dentro de la sesión del coordinador **agota su contexto/tokens** y obliga a reinicializar coordinadores, además de mezclar coordinación con ejecución. **El coordinador protege su contexto para coordinar.**

## Quién LANZA la sesión ejecutora (v1.2): puede hacerlo el coordinador

Lo que cambia respecto de v1.1 **no es la regla anterior, es quién aprieta el botón**: el coordinador **puede lanzar él mismo** la sesión ejecutora en modo *headless* y recoger el resultado, **sin** que el director haga de transporte. El trabajo sigue ocurriendo **fuera** de su contexto (proceso aparte, contexto limpio), así que la regla dura se respeta.

```bash
cd "<WORKING_DIR>" && claude -p "<tarea + ruta del contrato .md>" \
  --allowedTools "Read,Edit,Bash(git add:*),Bash(git commit:*)" \
  --permission-mode dontAsk --max-turns 20 --max-budget-usd 2.00 \
  --output-format json
```

- **No hereda contexto** del padre y **respeta el `.claude/settings.json` del directorio destino** (sus deny rules no las salta ni `bypassPermissions`).

### El `cwd` de la hija ES el working dir — y se fija al LANZARLA, nunca en el prompt

**Ese `cd` no es cosmético: es la mitad del contrato.** El cwd del proceso decide **qué `CLAUDE.md` y qué `.claude/` se auto-cargan** (las reglas del asunto, sus skills, sus subagentes), **qué hooks corren** (se anclan a `CLAUDE_PROJECT_DIR`), **qué reglas de permiso aplican** y **cuál es la raíz de búsqueda por defecto** de las herramientas que buscan ficheros.

Una hija enraizada en el sitio equivocado sufre varias cosas a la vez, y ninguna avisa:

1. Hereda las reglas de **otro** asunto —o las de coordinación, que le dicen justamente que no ejecute— y **no** carga las del asunto en el que tiene que trabajar.
2. **No dispara los hooks** de ese asunto: la comprobación que debía correr sola no falla, sencillamente no está.
3. **Busca por defecto donde no es**, así que responde con material que solo *describe* lo que buscabas: fuente secundaria con toda la apariencia de primaria. → [[verificacion_fuente_primaria]]
4. Paga tokens por cargar unas reglas que no le sirven, encima del coste fijo de arranque.

**Una línea *"Working dir: X"* en el prompt no mueve el cwd.** Es la misma familia de falsa barrera que `--allowedTools`: creer que la configuración dice algo que el proceso no aplica.

- **Lo que está fuera de su cwd no existe para la hija:** el contrato `.md`, el material de consulta o la carpeta de temporales quedan inalcanzables salvo `--add-dir` (o los `additionalDirectories` del destino). **Medido en los dos sentidos.** Regla práctica: **la hija se enraíza donde tiene que escribir, y lo que solo necesita leer entra por `--add-dir`**.
- **Los subagentes intra-sesión NO se pueden re-enraizar:** heredan el cwd del padre y no admiten otro. Esa es la razón **técnica** —no solo de disciplina de contexto— de que sean read-only y de exploración.

## Dos ejecutoras: análisis read-only primero, ejecución después

**Toda tanda no trivial se lanza en DOS ejecutoras.** Primero una de **análisis estrictamente read-only** cuyo único entregable de escritura es un fichero `plan-tanda-<nombre>.md`; después la de **ejecución**, lanzada contra la spec **ya corregida** con lo que el plan haya destapado.

**El mecanismo, que es lo que hay que entender o el requisito se degrada:** el valor **no** está en que la ejecutora tenga un plan. Está en que **el coordinador LEA ese plan y corrija su propia spec antes de que se produzca nada**. Lo que se instala no es "que la ejecutora planifique", es **un punto de corrección barato entre la spec y el trabajo**. Un plan que se escribe y nadie lee no aporta nada y solo suma coste — quien lo entienda como burocracia lo cumplirá en la forma y perderá el efecto entero.

### Qué lleva el fichero de plan, obligatoriamente

1. **Verificación en fuente primaria de CADA premisa de la spec, con el comando ejecutado y su salida.** No *"se ha comprobado que"*: el comando y lo que devolvió. → [[verificacion_fuente_primaria]]
2. **Lista explícita de las premisas de la spec que resultan FALSAS.** Es el apartado que convierte el plan en instrumento de corrección y no en resumen. **Si sale vacía, que lo diga vacía.**
3. **Inventario de lo que va a tocar**, con el perímetro pactado.
4. **Decisiones que la spec dejó abiertas sin darse cuenta** y hay que cerrar antes de empezar.
5. **Orden de pasos y riesgos**, incluido qué se hace si un paso falla a mitad.

### El read-only se COMPRUEBA, no se impide

`--allowedTools` **concede y no restringe** (ver abajo), así que la lectura-sola **no es imponible por flags** y **no se instala un guard** para forzarla. Se **declara** en la spec —no modifica material, no registra cambios, deja el historial intacto— y se **mide después**, que es barato y determinista: `git status --short` muestra **solo** el fichero de plan, y `HEAD` no se ha movido. Y **lleva la cuenta** de las fases limpias: el día que una ejecutora de análisis se ponga a producir, el contador lo delata.

### Cuándo SÍ y cuándo NO (esto es lo que evita que se vuelva un impuesto)

**SÍ**, siempre que la tanda **toque varios ficheros**, **estrene una forma de trabajo** que el asunto no tenga, o se apoye en **premisas sobre material que no hayas abierto tú**.

**NO** en tandas mecánicas y pequeñas: **arrancar una hija cuesta ~42.000 tokens fijos de caché aunque no haga nada** (medido en una tanda cuyo único trabajo era responder "PONG"), y ese coste se paga **por lanzamiento, no por trabajo hecho** → trocear de más lo multiplica.

**La excepción se DECLARA.** Saltarse el análisis es legítimo; saltárselo **en silencio**, no: la spec dice *"tanda de fase única declarada"* y por qué.

### Dimensionar los techos

Los cortacircuitos se ponen con **margen del 100% sobre tu propia línea base medida**, no a ojo: una tanda real **murió por `error_max_budget_usd`** con el techo demasiado bajo, y morir a mitad sale más caro que el margen. Referencia medida: **análisis 65 turnos**, **ejecución grande 300**, con el análisis pesando entre el **10% y el 20%** de la tanda que protege. Recuerda que `--max-budget-usd` es un **cortacircuito nominal, no un cargo**: con `ANTHROPIC_API_KEY` ausente lo que se consume es ventana de suscripción.

### Qué evidencia lo sostiene (y qué NO)

**No hubo A/B controlado y no se presenta como tal.** Hay tres casos con contrafactual: un análisis destapó un **bloqueante que la spec no veía** y que habría hecho fallar el resultado desde el primer minuto; otro encontró un **límite de permisos** que iba a quemar tres intentos, y la tanda se **aparcó con razón escrita** en vez de construirse y tirarse; y la **única** tanda lanzada sin análisis es aquella en la que **cuatro decisiones se le cayeron encima a la ejecutora** por huecos de la spec.

**Y el delimitador:** varias tandas posteriores de **fase única declarada** salieron bien, con las ejecutoras cazando premisas falsas sobre la marcha. No refuta el método —se habrían cazado antes y más barato— pero lo acota: **es para la tanda grande o con forma nueva, no para todas.**
- **Protege tu contexto, en este orden:** (a) **artefacto `.md` como contrato** (la hija escribe el informe, tú lees un extracto) · (b) `--output-format json` (+`--json-schema`) para una salida corta · (c) subagente Explore (Haiku) que resume · (d) ficheros en disco (Bash trunca a 30.000 chars).
- **Lo que devuelve un subagente entra ÍNTEGRO en tu contexto.** El aislamiento te protege del **ruido intermedio** —sus lecturas, sus llamadas, sus descartes se quedan dentro—, **no de un resultado verboso**: un subagente que lee ochenta mil tokens y te escribe un informe de tres mil te cuesta esos tres mil. De ahí que el ahorro no esté en delegar, sino en **acotar el entregable**: el encargo dice **cuántas líneas** y **qué forma** tiene lo que vuelve, igual que el contrato de una tanda. Un subagente sin límite de salida no es un ahorro, es un rodeo.
- **Cortacircuitos obligatorios:** `--max-turns` y `--max-budget-usd`; **timeout/watchdog** en el llamante (hay *silent-freeze* documentado al lanzar `claude -p` desde orquestadores de larga vida) y arranque `bash -c 'exec claude -p …'`. Entradas grandes **por ruta de fichero**, no por stdin (topado a 10 MB).
- **Condición de coste:** consume la ventana de la suscripción **solo mientras siga pausada** la escisión de facturación del Agent SDK/`claude -p`; y **`ANTHROPIC_API_KEY` no debe estar definida** (si lo está, factura API en silencio). **Plan B si se revierte:** subagentes intra-sesión (read-only o `add`+`commit` local). → [[modelo_por_tarea]]
- **Baja concurrencia:** 1 coordinador + **1-2 ejecutoras** secuenciales o poco paralelas. Un enjambre **reduce** el trabajo útil semanal de una persona sola.

## Puertas de aprobación: tres capas (declarativas, no confianza en el prompt)

1. **Deny rules** en `settings.json` para lo **inviolable**: los comandos que sacan algo fuera de la máquina (envío, publicación, sincronización con la nube), las carpetas de **originales** recibidos, los almacenes de credenciales de la máquina, `.git/`, `rm -rf`. **Un `deny` gana a todo**, incluso a `bypassPermissions`.
2. **`defer`** (`permissionDecision` del hook `PreToolUse`, **solo honrado en `-p`**) para lo **irreductiblemente humano**: una comprobación en campo, una autenticación con certificado, una decisión jurídica o económica, y **la entrega fuera** (correo, registro, gestoría, organismo). La sesión se pausa con `stop_reason: "tool_deferred"` y se reanuda con `claude -p --resume <session-id>`; **necesita un wrapper** que lea la petición y decida cuándo reanudar. Precedencia: **`deny > defer > ask > allow`**.
3. **`--allowedTools`** para **declarar la intención**… pero **NO cuenta como defensa** (ver el aviso de abajo).

## `--allowedTools` CONCEDE, no restringe (medido, no supuesto)

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
- **Cruce entre asuntos: el canal directo entre sesiones, no un buzón de ficheros.** *(Corrige la redacción anterior de esta misma línea, que proponía un buzón `_meta/buzon/` — nunca llegó a crearse y ha quedado superado.)* Ver la sección propia más abajo.

*(El aislamiento por worktree para sesiones concurrentes sobre un repositorio de código vive en el pack `codigo/` → [[no_push_por_subagentes]].)*

## El canal entre sesiones: los coordinadores se hablan, las ejecutoras no

**Los coordinadores se mandan hallazgos, decisiones y avisos directamente, sin que una persona copie y pegue entre terminales.** Antes de esto, el canal entre dos coordinadores **era el director**, y eso tiene dos costes: su tiempo, que se ve, y **el trabajo duplicado que no se ve** — dos asuntos llegaron a mantener briefs simultáneos sobre el mismo aparato durante una semana sin saberlo.

**Se configura en el perfil, y el reparto no es uniforme:**

| Rol | Valor | Por qué |
|---|---|---|
| Coordinadores (general y de asunto) | **`accept`** | El canal es para **coordinar**, y es lo que ellos hacen |
| Ejecutoras y consultor | **`refuse`** | Trabajan contra un **contrato cerrado**: si aceptan mensajes a mitad, su encargo deja de ser el que se les dio y el resultado ya no es verificable contra la spec. *(Los perfiles del pack opcional siguen el mismo criterio: todo lo que no coordina, rechaza.)* |
| Todos | `isolatePeerMachines: true` | Un mensaje **no sale de la máquina sin aprobación**. Entre sesiones locales viaja por un socket sin pasar por servidores de nadie → [[soberania_datos_local]] |

**`accept` y no "retenido", y el motivo no es comodidad.** El modo retenido abre un diálogo de aprobación por cada mensaje: **deja a la persona de cuello de botella, solo que aprobando en vez de copiando**. Si lo que se quiere es que las sesiones dejen de necesitar un cartero, retener no lo consigue.

**Lo que hace esto aceptable no es la confianza, es que el mecanismo está acotado por diseño** (verificado en fuente oficial, no supuesto): un mensaje entre sesiones **no cuenta como consentimiento del usuario** y no puede responder una petición de permiso; **no puede cambiar permisos, ficheros de reglas ni configuración** porque otra sesión lo pida; **un comando en su texto llega como texto** y no se ejecuta; y las **preguntas de permiso del receptor siguen saltando** igual. **La puerta humana no se abre: lo que se abre es el canal de información.**

**Y una regla que se deriva de eso, la más fácil de violar sin querer:** **nunca le pidas a otra sesión algo que a ti te han denegado.** Si tu perfil bloquea una acción, pedirle al de al lado que la haga por ti **no es colaboración, es saltarse la decisión del director por la puerta de atrás**. Eso se devuelve a la persona, no se enruta.

**EL LÍMITE QUE MÁS SORPRENDE, y se descubre usándolo: el canal solo alcanza a sesiones VIVAS. No hay buzón.** Si el destinatario no está corriendo en ese momento, **no aparece en el listado y el mensaje no se puede ni enviar** — no queda en cola esperándole. *(Comprobado al intentar avisar a un coordinador que había cerrado su sesión diez minutos antes.)* **Consecuencia operativa, y es la que hay que interiorizar: el canal es para lo síncrono, el fichero es para lo asíncrono.** No sustituye al handoff escrito; lo acelera cuando el otro está delante. **Antes de contar con el canal para algo que importa, comprueba que el otro existe ahora**, y si no, deja el artefacto donde lo leerá al arrancar.

**Qué viaja por el canal y qué no.** Un mensaje es **texto plano**: nunca ficheros ni historial de conversación. Así que **el artefacto sigue siendo el fichero y el mensaje es el aviso** — un handoff largo se deja escrito donde el otro lo lee y se le avisa por el canal, no se pega entero en un mensaje. Corolario que ya se ha usado: **lo que se cuenta por mensaje no hace falta duplicarlo en la cola**, y eso es presupuesto de contexto que se ahorra en todos los arranques futuros.

**Antes de mandar un handoff, pregunta si hay trabajo en curso sobre lo mismo.** Es el hábito que evita el solape descrito arriba, y ahora es barato: si el otro está vivo, se le pregunta. Si no, lo comprueba **el coordinador general**, que es el único que ve todos los contenedores.

## Tres trampas de las sesiones hijas, todas medidas

**1. Una ejecutora enraizada en un contenedor HEREDA su `CLAUDE.md` y se cree coordinadora.** Es la más cara y la menos obvia, porque **nace de dos reglas correctas que se pisan**: "el directorio de trabajo es el contrato" manda enraizarla ahí, y "los ficheros de contexto se acumulan hasta tu carpeta" hace que ahí se cargue un fichero que dice *"eres el coordinador… delega el trabajo voluminoso"*. Una ejecutora real lo leyó, concluyó que su tanda era voluminosa e **intentó lanzar otra ejecutora**; no hizo nada y devolvió éxito. **Coste medido: 1,11 USD y una pasada en vacío.** **No basta con llamarla "ejecutora" en la spec: el fichero de contexto pesa más que un rótulo**, porque llega antes y con más autoridad. **Un rol solo se anula anulándolo explícitamente**, en la spec **y** en el prompt de lanzamiento → bloque literal en [`plantilla-tanda-ejecutora.md`](../../../inicializador/plantilla-tanda-ejecutora.md).

**2. Un `success` del runner no significa trabajo hecho.** Es el veredicto de la **tubería**, no del modelo. El caso anterior devolvió `success` sin haber tocado nada. **El verde falso puede venir de la herramienta y no del trabajo**, así que **se comprueba el efecto en el disco, no el código de salida** — lo destapó un `wc -c` desde fuera, no el informe de la hija, que ni existió.

**3. El modo plan desvía el entregable.** Una ejecutora de análisis lanzada en modo plan —para tener barrera real de solo lectura— **escribió su plan en el directorio de planes del cliente** en vez de devolverlo, y lo que llegó fue una frase diciendo que estaba en el plan; hubo que recuperarlo del transcript. **Si quieres un fichero de una sesión en modo plan, dale permiso de escritura acotado a ese fichero o recoge la salida por redirección.** No des por hecho que el entregable aparece donde lo pediste.

## Lo que NO se automatiza

**Entregar fuera** (enviar el correo, presentar en el registro, remitir a la gestoría o al organismo) · **firmar** · **comprobaciones en campo** · **autenticaciones interactivas** (certificado, clave, 2FA) · **decisiones jurídicas o económicas** · **pagos**. Todo eso va detrás de una puerta (`defer` o deny rule), nunca automatizado. El agente **prepara** el envío y para; el gesto de enviar es del director.

## Seguridad al subir la autonomía

**Prompt injection** es real (el modelo no distingue datos de instrucciones) — y en un vault doméstico el material de entrada viene **de fuera**: correos, PDF de terceros, resoluciones descargadas. Medidas: sandboxing, **deny de `curl`/`wget`** (deny, no "ausencia de allow"), rutas protegidas, `--max-turns`/`--max-budget-usd`, hooks `PreToolUse`. **NUNCA `--dangerously-skip-permissions` fuera de un entorno aislado** — y ten presente que, aun con ese flag, **las deny rules siguen aplicando** (es la única barrera que aguanta). Y separa **hacer** de **comprobar**: el verificador no puede ser el mismo agente que hizo el trabajo ([[verificacion_e2e_por_agente]]).

**Cuatro banderas rojas más, con el mismo peso que la de arriba:**

- **Montar el socket de control del gestor de contenedores dentro del contenedor del propio agente equivale a darle la máquina entera.** Anula el aislamiento que ese mismo contenedor pretendía dar: desde dentro se puede lanzar y controlar cualquier otro contenedor del host, incluido el que no está aislado.
- **El sandbox no lo cubre todo.** Por defecto, la **lectura** del sistema de ficheros suele ser amplia (puede alcanzar secretos fuera del propio proyecto si no se deniegan explícitamente) y el comportamiento de red varía según el sistema operativo. Reducir el riesgo no es eliminarlo: lo que de verdad hay que impedir se **deniega explícitamente** (secretos, credenciales, claves de acceso), no se da por cubierto porque hay un sandbox de por medio.
- **Permisos amplios sin preguntas, solo dentro de un entorno aislado y sin red.** En el host, nunca — las dos condiciones son necesarias a la vez, no una sola: un entorno aislado con red abierta sigue dejando salir lo que entró por una instrucción inyectada.
- **Nunca credenciales de producción en una verificación** — ni de frontend, ni de backend, ni como dato de prueba de apariencia real. Si la comprobación necesita un dato con forma real, se genera un fixture; jamás se apunta al dato de verdad.

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
4. **Lanza él mismo** la sesión (headless, con su `cd`) — o la relaya el director si la herramienta lo exige. **El director no es el transporte por defecto.**
5. Si la pieza es **no trivial**, ese lanzamiento es primero el de **análisis read-only**: el coordinador **lee el plan**, **corrige su spec** con las premisas falsas que aparezcan, y **solo entonces** lanza la ejecución.
6. El coordinador **verifica y reconcilia** (*trust-but-verify*) y prepara el siguiente paso.

## Ritmo de entrega al director

El coordinador entrega los pasos **de uno en uno** — o **dos a la vez solo si van en herramientas distintas** y son paralelos (p. ej. una tanda CLI + un brief de chat). **No vuelca toda la lista de pasos de golpe**: satura y desorienta al director. Tras cada paso, confirma el resultado y propone el siguiente.

## Quién la aplica

**Todo coordinador** — el general del vault y el de cada asunto. El coordinador **protege su contexto para coordinar**; el trabajo voluminoso vive en sesiones focalizadas.

Relacionada: [[modelo_por_tarea]] (modelo por tarea + evitar workflows multiagente masivos), [[paralelismo_subagent_opus_principal]], [[sesion_consultor_paralelo]], [[recalibracion_tiempos]], [[higiene_contexto_y_tokens]].

> Pieza de catálogo `general/comun/doctrinas/`. **v1.3 (2026-07-28):** **CORRECCIÓN DE SEGURIDAD** — la v1.2 afirmaba que `--allowedTools` acotado restringe a la sesión hija ("con `dontAsk` lo no listado se deniega"). **Es FALSO**: `--allowedTools` **concede** (lista aditiva) y `dontAsk` solo suprime la pregunta. Medido en Claude Code 2.1.220 con prueba de dato inalcanzable (variable de entorno aleatoria), descartando confusores. **Lo que protege son las deny rules** (aguantan hasta bajo `--dangerously-skip-permissions`), los cortacircuitos `--max-turns`/`--max-budget-usd`, los hooks `PreToolUse` y el watchdog. Regla nueva: **lo que quieras impedir, exprésalo como DENY**. Añadido el método de prueba (el dato pedido debe ser inalcanzable por las herramientas concedidas) y los dos falsos positivos clásicos (`git status` va inyectado en el contexto; lo que ya consta por escrito se lee con `Read`). *(Lección: la afirmación venía de un informe de deep research y se propagó sin verificar empíricamente → [[verificacion_fuente_primaria]].)* **v1.2 (2026-07-28):** cambio de fondo — **el coordinador puede LANZAR él mismo la sesión ejecutora** en headless (`claude -p` acotado, contexto aparte → la regla "coordinar ≠ ejecutar" se mantiene), con sus cortacircuitos, la condición de facturación (pausa reversible + `ANTHROPIC_API_KEY` ausente) y plan B; **puertas en 3 capas** con `defer` (GA, solo en `-p`, precedencia `deny > defer > ask > allow`); MCP fuente-de-verdad para que la ejecutora no pregunte; límite duro de los hooks (no pueden auto-arrancar la sucesora → orquestador externo); `/clear`+handoff validado sobre la compactación; buzón entre asuntos; baja concurrencia; y lo que no se automatiza. **v1.1 (2026-07-15):** palancas soberanas locales (hooks, subagentes, skills, output styles); Cowork GA pero cloud; veto a dynamic workflows. *(El frontmatter quedó en 1.0 por descuido en v1.1; corregido en v1.2.)* v1.0 (2026-06-05). Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente.
> **v1.7 (2026-08-14): el canal entre sesiones se abre para los coordinadores y se cierra para las ejecutoras, y tres trampas medidas de las sesiones hijas.** Decisión del director: los coordinadores dejan de necesitar que una persona copie y pegue entre terminales (`accept`), mientras que ejecutoras y consultor lo **rechazan** porque trabajan contra un contrato cerrado; y ningún mensaje sale de la máquina sin aprobación. **Retener no era opción**: deja a la persona de cuello de botella, solo que aprobando en vez de copiando. Con la regla derivada de **no pedirle a otra sesión lo que a ti te han denegado**, y con el reparto artefacto/aviso — el canal lleva texto, así que el handoff se deja escrito y el mensaje solo avisa. **Sustituye la propuesta de buzón de ficheros de la v1.2, que nunca llegó a crearse.** Y tres trampas, las tres medidas el mismo día: una ejecutora **hereda el `CLAUDE.md` del contenedor y se cree coordinadora** (1,11 USD y una pasada en vacío; dos reglas correctas que se pisan, y un rol solo se anula explícitamente), **`success` es el veredicto del runner y no del trabajo**, y **el modo plan desvía el entregable** fuera del working dir.
> **v1.6 (2026-08-10):** cuatro banderas rojas añadidas a "Seguridad al subir la autonomía" — montar el socket de control del gestor de contenedores dentro del contenedor del agente equivale a darle la máquina; el sandbox no cubre todo (lectura de sistema de ficheros amplia por defecto, hay que denegar secretos explícitamente); permisos amplios sin preguntas solo en entorno aislado **y** sin red, las dos condiciones a la vez; nunca credenciales de producción en una verificación — destilado del mismo estudio que trajo la ficha de emplazamiento y el pack de código (tanda `brief-runtime`).
> **v1.5 (2026-08-01):** dos ejecutoras — análisis read-only con entregable `plan-tanda-<nombre>.md` y luego ejecución contra la spec ya corregida; lo que se instala no es que la ejecutora planifique, sino un punto de corrección barato entre la spec y el trabajo. Con los cinco apartados obligatorios (el de premisas FALSAS es el que lo hace instrumento y no resumen), el cuándo NO anclado en los ~42.000 tokens fijos por lanzamiento, la excepción declarada y el read-only comprobado a posteriori en vez de impuesto por flags. **v1.4 (2026-08-01):** el `cwd` de la hija ES el working dir y se fija con el `cd` del lanzamiento: decide reglas auto-cargadas, hooks, permisos y raíz de búsqueda; una línea "Working dir" en el prompt no lo mueve, y los subagentes intra-sesión no se pueden re-enraizar.
>
> Adaptada al framing neutro del seed (sin referencias al dominio del software) — 2026-08-01.
