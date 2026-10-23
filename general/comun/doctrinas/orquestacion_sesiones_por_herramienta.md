---
name: Orquestación de sesiones por herramienta — el coordinador divide, no lo ejecuta todo
description: El coordinador coordina: planifica, reparte en tandas pequeñas y verifica. El trabajo no trivial pasa por un plan que el coordinador lee y corrige antes de ejecutar, y cada tanda la hace un subagente ejecutora con informe acotado y parada por bloque (ciclo de tandas). claude -p queda para otra raíz u otro perfil, y entonces el cwd con el que se lanza la hija es parte del contrato (decide reglas, hooks y raíz de búsqueda). Asigna cada pieza a la mejor herramienta (Claude Code CLI, Desktop, cowork, chat) y no ejecuta el trabajo voluminoso en su propia sesión, para no agotar su contexto.
type: doctrine
version: 1.35
index_summary: >-
  **"A este asunto le falta otro coordinador" casi siempre es el SÍNTOMA**, no el diagnóstico: o el asunto eran dos —única señal que justifica un rol nuevo, y se resuelve partiéndolo en dos contenedores—, o la especificación está poco acotada, o hay demasiados frentes abiertos a la vez. **En tareas secuenciales con dependencias el multiagente degrada 39-70 %** y amplifica errores **17× entre iguales frente a ~4,4× con coordinador central**: si se opta por varios roles, **topología centralizada**. **El perfil y el modo de una sesión hija lanzada con `claude -p` se DECLARAN al lanzar** (`--settings`, `--permission-mode`): no declararlos no la deja sin permisos, **la deja con los del coordinador** — medido, con el canal abierto y el modelo caro. **Los subagentes no admiten perfil propio**: heredan modelo, esfuerzo y `deny` de la sesión salvo lo que fije su definición (`model:`, `effort:`, `tools`). **Entre el plan y la ejecución va una descomposición en tareas PEQUEÑAS** con resultado observable, y quién ejecuta cada trozo se decide por el trozo. **Coordinar es planificar, repartir y verificar:** el trabajo no trivial pasa por el subagente `planificador`, el coordinador lee el plan y corrige su encargo, y cada tanda la hace un subagente `ejecutora` (o `ejecutora-mecanica` para lo literal) que devuelve un informe acotado; al cerrar una tanda o un bloque se guarda el estado y el coordinador se releva solo por Herdr o para (ciclo de tandas). Lo que devuelve un subagente entra íntegro en el contexto del coordinador, así que el encargo acota el entregable. **La autonomía desatendida es SECUENCIAL con cola y bloqueo**: todas las sesiones comparten cuota, así que el paralelismo no es arriesgado, es **destructivo**. Agotar la cuota devuelve **código 0 con salida vacía** → detector de no-progreso, y se comprueba el disco. **Quitar a la persona del transporte deja una vacante:** hacer de intermediario también es revisar, y al automatizar el fallo pasa de **duplicado visible a invisible** — la puerta de revisión se mueve, no se quita. **El 79 % de los fallos multiagente son de especificación y coordinación** (MAST, NeurIPS 2025), y un modelo mejor no los arregla: por eso el contrato escrito no se debilita. **El canal entre sesiones: los COORDINADORES se hablan directamente (`accept`), las EJECUTORAS no (`refuse`)** porque se rigen por un contrato cerrado; ningún mensaje sale de la máquina sin aprobación. Retener no era opción: deja a la persona de cuello de botella, aprobando en vez de copiando. Un mensaje **no aprueba permisos ni cambia configuración**, así que la puerta humana no se abre — y **nunca le pidas a otra sesión lo que a ti te han denegado**. El canal lleva **texto**: el handoff se deja escrito y el mensaje solo avisa. **Y saber qué tiene abierto cada uno NO depende de preguntar ni de acordarse:** cada contenedor lleva un **estado** **versionado**, un elemento por frente abierto con su dueño y su artefacto, que **el hook de arranque vuelca por contexto solo en la sesión de su propio contenedor** — antes de mandar un handoff a otro coordinador se consulta en ese momento el del destinatario con `estado.mjs --de <espacio>/<asunto>`, y lo pendiente de otros no se revisa. Eso **cierra el hueco del buzón para sesiones apagadas sin herramienta nueva**: el fichero ya era el buzón, lo que faltaba era leerlo al arrancar. **Tres trampas medidas de las sesiones hijas:** una ejecutora **hereda el `CLAUDE.md` del contenedor y se cree coordinadora** e intenta delegar (también un subagente, que lo recibe igual) (1,11 USD en vacío — un rol solo se anula explícitamente, en la especificación **y** en el prompt); **`success` es veredicto del runner, no del trabajo** (comprueba el disco, no el código de salida); y **el modo plan desvía el entregable** fuera del working dir. **Lo que devuelve un subagente entra ÍNTEGRO en el contexto del padre**: el aislamiento protege del ruido intermedio, no de un informe verboso, así que el encargo acota el entregable. El coordinador coordina, no produce él los documentos. **Puede LANZAR él mismo una sesión en headless** cuando hace falta otra raíz u otro perfil (`claude -p` acotado, contexto aparte) con **puertas en 3 capas** (deny rules · `defer` · allow list, que **concede y no restringe**); los hooks **no** pueden auto-arrancar la sucesora (hace falta orquestador externo); `/clear`+handoff mejor que compactar; baja concurrencia, nunca enjambre. La **entrega fuera** nunca se automatiza. **El `cwd` con el que lanzas la hija ES el working dir** (`cd <destino> && claude -p …`): decide qué reglas y hooks se cargan y **dónde busca por defecto**; una frase "Working dir" en el prompt **no** lo mueve, y lo de fuera solo entra por `--add-dir`. **Antes de usar una superficie nueva contra el vault se comprueba DÓNDE ejecuta y QUÉ barrera la gobierna**: compartir marca con la herramienta de siempre **no es heredar sus permisos**, y la ejecución en la nube pasó a ser el valor por defecto de forma silenciosa. **El plan lo escribe un subagente de solo lectura y el coordinador lo lee antes de lanzar nada:** lleva la lista de **premisas FALSAS** de la especificación, el punto de corrección es **el coordinador leyendo el plan**, el solo-lectura **se comprueba después** y la excepción se **declara**. **Las sesiones interactivas se abren en Herdr, un espacio de trabajo por vault (creado con el `--cwd` de la raíz o de un asunto), con una pestaña por coordinador: el general y los de todos sus espacios, aunque el vault tenga varios; las tandas son subagentes de la sesión y no pasan por Herdr, y ninguna herramienta contesta una aprobación por el director.**
---

El coordinador **coordina**: su valor es **descomponer** el trabajo, **asignar** cada parte a la **mejor herramienta**, **redactar los prompts** y **verificar/reconciliar** los resultados. **No ejecuta todo en su propia sesión** — eso agota su contexto y desaprovecha herramientas mejores para cada tarea. **Dividir y vencer** supera a una sola sesión que lo hace todo.

## Regla dura: coordinar es planificar, repartir y verificar

El coordinador **NO escribe ni transforma el material del asunto en su propio contexto.** Para cualquier trabajo que lo haga (redactar el escrito, tabular las facturas, renombrar el lote de escaneos, generar el PDF), **planifica, parte en tandas pequeñas y las manda a subagentes `ejecutora`**, una tras otra; después **verifica** el resultado y commitea. Los subagentes de **solo lectura** sirven para reconocer o resumir. Motivo: producir dentro de la sesión del coordinador **llena su contexto** y obliga a reinicializar coordinadores, además de mezclar coordinación con ejecución. **El coordinador protege su contexto para coordinar.**

## `claude -p`: para otra raíz u otro perfil

Las tandas ordinarias las ejecutan subagentes (ver más abajo). **`claude -p` queda para lo que un subagente no puede hacer**: trabajar con **otra raíz** (el código de un asunto de software vive fuera del vault) o con **otro perfil** que el de la sesión que lo lanza. En esos casos el coordinador **puede lanzarla él mismo** en modo *headless* y recoger el resultado, **sin** que el director haga de transporte. El trabajo ocurre **fuera** de su contexto (proceso aparte, contexto limpio).

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
- **Los subagentes intra-sesión NO se pueden re-enraizar** (medido el 2026-10-04): heredan el cwd del padre y no admiten otro. Por eso trabajan dentro de la raíz de la sesión que los lanza, y **lo que esté fuera de ella, o necesite otro perfil, va por `claude -p`**.

## Plan y tandas: el planificador primero, las ejecutoras después

**Todo trabajo no trivial pasa por un plan antes de ejecutarse.** Primero el subagente `planificador`, que solo escribe un fichero `plan-tanda-<nombre>.md`; después, **una tanda por subagente `ejecutora`**, en serie, contra el encargo **ya corregido** con lo que el plan haya destapado. El ciclo completo, con su parada por bloque, está en [[ciclo_de_tandas]].

**El mecanismo, que es lo que hay que entender o el requisito se degrada:** el valor **no** está en que exista un plan. Está en que **el coordinador LEA ese plan y corrija su propio encargo antes de que se produzca nada**. Lo que se instala es **un punto de corrección barato entre el encargo y el trabajo**. Un plan que se escribe y nadie lee no aporta nada y solo suma coste — quien lo entienda como burocracia lo cumplirá en la forma y perderá el efecto entero.

### Qué lleva el fichero de plan, obligatoriamente

1. **Verificación en fuente primaria de CADA premisa de la especificación, con el comando ejecutado y su salida.** No *"se ha comprobado que"*: el comando y lo que devolvió. → [[verificacion_fuente_primaria]]
2. **Lista explícita de las premisas de la especificación que resultan FALSAS.** Es el apartado que convierte el plan en instrumento de corrección y no en resumen. **Si sale vacía, que lo diga vacía.**
3. **Inventario de lo que va a tocar**, con el perímetro pactado.
4. **Decisiones que la especificación dejó abiertas sin darse cuenta** y hay que cerrar antes de empezar.
5. **Orden de pasos y riesgos**, incluido qué se hace si un paso falla a mitad.

### El plan se convierte en tareas PEQUEÑAS antes de ejecutarse

**Un plan correcto ejecutado de una sentada sigue siendo una tanda frágil.** Entre el plan y el trabajo va un paso más, y lo fija el director *(2026-08-24)*: **el plan se descompone en tareas y subtareas pequeñas**, cada una con su resultado observable, de modo que la ejecución no dependa de que un modelo sostenga veinte decisiones a la vez. Es la misma razón por la que existe la fase de análisis, un nivel más abajo: **cuanto más pequeño el trozo, más barato es detectar que salió mal y menos se pierde al repetirlo.**

**Y quién ejecuta cada trozo se decide por el trozo, no por la tanda:** los literales, sin criterio, van a `ejecutora-mecanica` y el resto a `ejecutora`, y el planificador reparte esa asignación en la tabla de tandas. → [[modelo_por_tarea]]

### Subagentes que producen: el informe acotado y el relevo o la parada por bloque protegen el contexto del coordinador

**Las tandas las ejecutan subagentes `ejecutora`, y eso no contradice que el coordinador no produzca.** Lo que el coordinador tiene prohibido es **llenar su contexto**, y el motivo es de contexto: lo que devuelve un subagente **entra íntegro en el contexto de quien lo lanzó**. Por eso la ejecutora devuelve un informe de 25 líneas como mucho, el coordinador comprueba el efecto con `git status --short` y el comando de la tanda, y al cerrar cada bloque **guarda el estado y para**. Es el ciclo de [[ciclo_de_tandas]].

Lo que se midió el 2026-10-04 sobre los subagentes, y sobre lo que se apoya el reparto:

- **Heredan los `deny` de la sesión**: son barrera también para las tandas, y no hace falta plan B.
- **`tools` en su definición restringe de verdad.** La ejecutora y el planificador no llevan `Agent`, así que no delegan. Tampoco llevan `SendMessage`, porque no está en su `tools`; un subagente sin `tools` en su definición, como `general-purpose`, sí lo tiene, y ahí que no mande mensajes es solo encargo.
- **`maxTurns` se respeta** y **un hook `PreToolUse` del frontmatter corre.**
- **`effort:` del frontmatter se respeta**; sin él, el subagente hereda el esfuerzo de la sesión.
- **No se re-enraízan**: ven lo que ve la sesión y nada más. Lo que necesite otra raíz u otro perfil va por `claude -p`.
- **Los subagentes de solo lectura siguen siendo legítimos** para reconocer o resumir; su informe también se acota.

### El solo-lectura del planificador se COMPRUEBA, no se impone del todo

`--allowedTools` **concede y no restringe** (ver abajo), así que la lectura-sola **no es imponible por flags**. Al planificador lo limita su definición: no lleva `Agent`, y un hook `PreToolUse` en su frontmatter solo le deja escribir `plan-tanda-*.md` (medido el 2026-10-04: `tools` restringe de verdad y el hook corre). Pero conserva `Bash`, y lo que escriba por ahí no lo cubre el hook, así que se **declara** en el encargo —no modifica material, deja el historial intacto— y se **mide después**, que es barato y determinista: `git status --short` muestra **solo** el fichero de plan, y `HEAD` no se ha movido. Y **lleva la cuenta** de los planes limpios: el día que un planificador se ponga a producir, el contador lo delata.

### Cuándo SÍ y cuándo NO (esto es lo que evita que se vuelva un impuesto)

**SÍ**, siempre que el trabajo **toque varios ficheros**, **estrene una forma de trabajo** que el asunto no tenga, o se apoye en **premisas sobre material que no hayas abierto tú**: se lanza el planificador antes de las tandas.

**NO** en tandas mecánicas y pequeñas: **una ejecutora nace con unos 16.000 tokens de contexto** (mediana 16.323 en 42 ejecutoras desde el 2026-10-22, medido el 2026-10-23 con `medir-consumo.mjs`; eran 37 mil el 2026-10-04), y ese coste se paga **por lanzamiento, no por trabajo hecho**. Pesa más lo que rodea a cada tanda: el coordinador da varias vueltas con todo su contexto por cada una, y trocear de más multiplica sobre todo eso; repetir una tanda cuesta una ejecutora más esas vueltas (12 % de las tandas se repiten). Cifras y reparto en [[higiene_contexto_y_tokens]] (sección «Dónde se va la ventana, medido»). Para lo literal, sin criterio, existe `ejecutora-mecanica` (Haiku `high`).

**La excepción se DECLARA.** Saltarse el plan es legítimo; saltárselo **en silencio**, no: el encargo dice *"tanda de fase única declarada"* y por qué.

### Dimensionar los techos (para `claude -p`)

Esto vale para las ejecutoras lanzadas con `claude -p`; un subagente no tiene tope de gasto propio, y lo acotan las tandas pequeñas y su `maxTurns`. Los cortacircuitos se ponen con **margen del 100% sobre tu propia línea base medida**, no a ojo: una tanda real **murió por `error_max_budget_usd`** con el techo demasiado bajo, y morir a mitad sale más caro que el margen. Referencia medida: **análisis 65 turnos**, **ejecución grande 300**, con el análisis pesando entre el **10% y el 20%** de la tanda que protege. Recuerda que `--max-budget-usd` es un **cortacircuito nominal, no un cargo**: con `ANTHROPIC_API_KEY` ausente lo que se consume es ventana de suscripción.

### Qué evidencia lo sostiene (y qué NO)

**No hubo A/B controlado y no se presenta como tal.** Hay tres casos con contrafactual: un análisis destapó un **bloqueante que la especificación no veía** y que habría hecho fallar el resultado desde el primer minuto; otro encontró un **límite de permisos** que iba a quemar tres intentos, y la tanda se **aparcó con razón escrita** en vez de construirse y tirarse; y la **única** tanda lanzada sin análisis es aquella en la que **cuatro decisiones se le cayeron encima a la ejecutora** por huecos de la especificación.

**Y el delimitador:** varias tandas posteriores de **fase única declarada** salieron bien, con las ejecutoras cazando premisas falsas sobre la marcha. No refuta el método —se habrían cazado antes y más barato— pero lo acota: **es para la tanda grande o con forma nueva, no para todas.**
- **Protege tu contexto, en este orden** (vale para quien lanza `claude -p`; para los subagentes de las tandas, ver arriba el informe acotado y la parada por bloque): (a) **artefacto `.md` como contrato** (la hija escribe el informe, tú lees un extracto) · (b) `--output-format json` (+`--json-schema`) para una salida corta · (c) subagente de solo lectura (Sonnet) que resume · (d) ficheros en disco (Bash trunca a 30.000 chars).
- **Lo que devuelve un subagente entra ÍNTEGRO en tu contexto.** El aislamiento te protege del **ruido intermedio** —sus lecturas, sus llamadas, sus descartes se quedan dentro—, **no de un resultado verboso**: un subagente que lee ochenta mil tokens y te escribe un informe de tres mil te cuesta esos tres mil. De ahí que el ahorro no esté en delegar, sino en **acotar el entregable**: el encargo dice **cuántas líneas** y **qué forma** tiene lo que vuelve, igual que el contrato de una tanda. Un subagente sin límite de salida no es un ahorro, es un rodeo.
- **Cortacircuitos obligatorios:** `--max-turns` y `--max-budget-usd`; **timeout/watchdog** en el llamante (hay *silent-freeze* documentado al lanzar `claude -p` desde orquestadores de larga vida) y arranque `bash -c 'exec claude -p …'`. Entradas grandes **por ruta de fichero**, no por stdin (topado a 10 MB).
- **Condición de coste:** consume la ventana de la suscripción **solo mientras siga pausada** la escisión de facturación del Agent SDK/`claude -p`; y **`ANTHROPIC_API_KEY` no debe estar definida** (si lo está, factura API en silencio). **Plan B si se revierte:** subagentes intra-sesión (read-only o `add`+`commit` local). → [[modelo_por_tarea]]
- **Baja concurrencia:** 1 coordinador + **1-2 ejecutoras** secuenciales o poco paralelas. Un enjambre **reduce** el trabajo útil semanal de una persona sola.

## Puertas de aprobación: tres capas (declarativas, no confianza en el prompt)

1. **Deny rules** en `settings.json` para lo **inviolable**: los comandos que sacan algo fuera de la máquina (envío, publicación, sincronización con la nube), las carpetas de **originales** recibidos, los almacenes de credenciales de la máquina, `.git/`, `rm -rf`. **Un `deny` gana a todo**, incluso a `bypassPermissions`.
2. **`defer`** (`permissionDecision` del hook `PreToolUse`, **solo honrado en `-p`**) para lo **irreductiblemente humano**: una comprobación en campo, una autenticación con certificado, una decisión jurídica o económica, y **la entrega fuera** (correo, registro, gestoría, organismo). La sesión se pausa con `stop_reason: "tool_deferred"` y se reanuda con `claude -p --resume <session-id>`; **necesita un wrapper** que lea la petición y decida cuándo reanudar. Precedencia: **`deny > defer > ask > allow`**.
3. **`--allowedTools`** para **declarar la intención**… pero **NO cuenta como defensa** (ver el aviso de abajo).

> **Y una cuarta capa que muchos dan por hecha y puede no existir: LA PREGUNTA.** Si quien opera arranca las sesiones en **permisos amplios** —cosa razonable y frecuente, para no ir aprobando cada edición—, **el sistema no pregunta nunca**. Entonces todo lo que estaba escrito como *"prepara, deja listo y para ahí"* deja de tener red: **parar depende de que el agente se acuerde de una regla en prosa**, y este mismo catálogo dice que una regla que depende de que alguien se acuerde no es una regla.
>
> **Consecuencia operativa, y hay que comprobarla asunto por asunto:** en permisos amplios, **la puerta humana solo existe donde hay un `deny`**. Y el punto ciego típico no son los comandos —esos suelen estar cubiertos— sino **las herramientas de servidores externos conectados**, que pueden actuar sobre **el mundo físico o sobre servicios reales** y casi nunca aparecen en las listas de denegación, porque se añadieron pensando en el sistema de ficheros.
>
> **Caso medido (2026-08-13):** un asunto con un servidor de domótica conectado tenía **cero** denegaciones de sus herramientas, mientras su fichero de reglas declaraba puerta humana —en prosa— para reiniciar el servidor, desemparejar dispositivos o desarmar la alarma. **La exfiltración de datos y el histórico estaban protegidos; lo que actúa sobre el mundo, no.**
>
> **Lo que hay que hacer con eso NO es una receta: es una elección, y la hace el titular.** Enseñar el hueco es obligación del coordinador; decidir dónde va la frontera, no. En ese caso concreto, **el titular decidió abrirla del todo** en lo técnico —configuración, servicios, dispositivos— y **reservar las denegaciones para comprometer dinero**, con dos argumentos que conviene no perder:
>
> - **La restricción va en la capa del RECURSO, no en la del agente.** Un usuario sin permiso de borrado o un extremo cerrado es una barrera **real, independiente del agente y que ningún prompt sortea**. Una denegación en la configuración del cliente es **frágil** —depende de qué fichero esté cargado— **y estorba el uso legítimo de la misma herramienta**, porque no distingue el caso bueno del malo.
> - **Pedir permiso para algo técnico tiene un coste que no se contabiliza:** convierte a la persona en cuello de botella de su propio sistema, que suele ser justo lo que se estaba intentando quitar.
>
> **La regla que queda, y es la única universal:** en permisos amplios **la puerta humana solo existe donde hay un `deny`**, así que **hay que saber qué hay dentro y qué fuera, y que sea a propósito**. Si la frontera se pone solo en el dinero, perfecto — pero **escrito**, no por descuido. Lo que no vale es creer que protege una regla en prosa que nada ejecuta.

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
- **Límite duro:** los hooks **solo hablan por stdout/stderr/exit code**; **no pueden lanzar tool calls ni comandos `/`** → **una sesión no puede auto-arrancar su sucesora**. Hace falta un **orquestador externo** (cron / Programador de tareas / script externo). `SessionEnd` no puede bloquear ni lanzar nada; `PreCompact` sí puede capturar una instantánea y bloquear la compactación.
- **`/clear` + handoff `.md` sigue siendo mejor que la compactación** (determinista, auditable, barato). Automatiza el `.md` con `PreCompact`/`SessionEnd`; que el orquestador arranque la siguiente e inyecte el handoff por `SessionStart`.
- **Cola de tandas:** ficheros `.md` en el vault consumidos por el orquestador (más simple y soberano que la task list experimental de *Agent Teams*, que cuesta ~3-4×). Añade un `PostToolUse` que escriba **audit log** JSON-lines.
- **Cruce entre asuntos: el canal directo entre sesiones, no un buzón de ficheros.** *(Corrige la redacción anterior de esta misma línea, que proponía un buzón `_meta/buzon/` — nunca llegó a crearse y ha quedado superado.)* Ver la sección propia más abajo.

*(El aislamiento por worktree para sesiones concurrentes sobre un repositorio de código vive en el pack `codigo/` → [[no_push_por_subagentes]]; el de las tandas independientes de un plan del vault, en [[ciclo_de_tandas]].)*

## El canal entre sesiones: los coordinadores se hablan, las ejecutoras no

**Los coordinadores se mandan hallazgos, decisiones y avisos directamente, sin que una persona copie y pegue entre terminales.** Antes de esto, el canal entre dos coordinadores **era el director**, y eso tiene dos costes: su tiempo, que se ve, y **el trabajo duplicado que no se ve** — dos asuntos llegaron a mantener briefs simultáneos sobre el mismo aparato durante una semana sin saberlo.

**Se configura en el perfil, y el reparto no es uniforme:**

| Rol | Valor | Por qué |
|---|---|---|
| Coordinadores (general y de asunto) | **`accept`** | El canal es para **coordinar**, y es lo que ellos hacen |
| Ejecutoras y consultor | **`refuse`** | Se rigen por un **contrato cerrado**: si aceptan mensajes a mitad, su encargo deja de ser el que se les dio y el resultado ya no es verificable contra la especificación. *(Los perfiles del pack opcional siguen el mismo criterio: todo lo que no coordina, rechaza.)* |
| Todos | `isolatePeerMachines: true` | Un mensaje **no sale de la máquina sin aprobación**. Entre sesiones locales viaja por un socket sin pasar por servidores de nadie → [[soberania_datos_local]] |

**`accept` y no "retenido", y el motivo no es comodidad.** El modo retenido abre un diálogo de aprobación por cada mensaje: **deja a la persona de cuello de botella, solo que aprobando en vez de copiando**. Si lo que se quiere es que las sesiones dejen de necesitar un cartero, retener no lo consigue.

**Lo que hace esto aceptable no es la confianza, es que el mecanismo está acotado por diseño** (verificado en fuente oficial, no supuesto): un mensaje entre sesiones **no cuenta como consentimiento del usuario** y no puede responder una petición de permiso; **no puede cambiar permisos, ficheros de reglas ni configuración** porque otra sesión lo pida; **un comando en su texto llega como texto** y no se ejecuta; y las **preguntas de permiso del receptor siguen saltando** igual. **La puerta humana no se abre: lo que se abre es el canal de información.**

**Y una regla que se deriva de eso, la más fácil de violar sin querer:** **nunca le pidas a otra sesión algo que a ti te han denegado.** Si tu perfil bloquea una acción, pedirle al de al lado que la haga por ti **no es colaboración, es saltarse la decisión del director por la puerta de atrás**. Eso se devuelve a la persona, no se enruta.

**EL LÍMITE QUE MÁS SORPRENDE, y se descubre usándolo: el canal solo alcanza a sesiones VIVAS. No hay buzón.** Si el destinatario no está corriendo en ese momento, **no aparece en el listado y el mensaje no se puede ni enviar** — no queda en cola esperándole. *(Comprobado al intentar avisar a un coordinador que había cerrado su sesión diez minutos antes.)* **Consecuencia operativa, y es la que hay que interiorizar: el canal es para lo síncrono, el fichero es para lo asíncrono.** No sustituye al handoff escrito; lo acelera cuando el otro está delante. **Antes de contar con el canal para algo que importa, comprueba que el otro existe ahora**, y si no, deja el artefacto donde lo leerá al arrancar.

**Qué viaja por el canal y qué no.** Un mensaje es **texto plano**: nunca ficheros ni historial de conversación. Así que **el artefacto sigue siendo el fichero y el mensaje es el aviso** — un handoff largo se deja escrito donde el otro lo lee y se le avisa por el canal, no se pega entero en un mensaje. Corolario que ya se ha usado: **lo que se cuenta por mensaje no hace falta duplicarlo en la cola**, y eso es presupuesto de contexto que se ahorra en todos los arranques futuros.

**Antes de mandar un handoff, mira si el destinatario ya tiene ese trabajo abierto — y no preguntando.** Preguntar solo funciona si el otro está vivo y si tú te acuerdas de preguntar, o sea que no es un mecanismo: es una intención con dos condiciones. Lo que lo convierte en mecanismo es el **`estado.json` de cada contenedor**, versionado, con un elemento por frente abierto, que **el hook de arranque vuelca por contexto en cada sesión, el de su propio contenedor** (decisión D5 del director, 2026-10-05: cada coordinador ve solo lo suyo). El de otro contenedor no se vuelca: cuando vas a mandarle un handoff a otro coordinador, consultas su estado en ese momento con `estado.mjs --de <espacio>/<asunto>` y miras si ya tiene ese trabajo. Qué campos tiene, cómo se cambia y qué comprueba el verificador: [[estado_vivo_por_comando]]. La historia que sigue habla del antiguo `trabajo-en-curso.md`, que queda como registro de cómo se llegó. Los coordinadores se hablan por el canal cuando uno necesita algo del otro, y no revisan ni comentan el trabajo pendiente ajeno.

**Y esto cierra MEDIO hueco del buzón para sesiones apagadas — la otra mitad tardó cuatro días más en verse.** El fichero **ya era** un buzón persistente: sobrevive al cierre, entra en el histórico, lo lee cualquiera. Lo que faltaba era que alguien lo leyese al arrancar.

**Pero el trabajo en curso y un handoff sin leer no son lo mismo, y darlos por el mismo cierre fue precipitado.** El 2026-08-24 se dio por resuelto el hueco entero con este fichero; el **28-ago** el director destapó lo que faltaba: se dejaron **dos handoffs a dos coordinadores y las dos sesiones arrancaron sin enterarse**, porque **un handoff es un fichero y nadie les dijo que estaba ahí**. El trabajo en curso dice *qué se está haciendo*; un handoff dice *qué tienes que hacer tú*, y el hook solo volcaba lo primero.

**Ahora el hook avisa también de los handoffs vivos**, y la regla que lo hace fiable ya existía: **un handoff cumplido se BORRA**. Así que uno que sigue ahí es, por definición, trabajo sin despachar — avisar de él **nunca es ruido** y no hace falta rastrear si se leyó. *(La primera vez que el aviso corrió, cazó un handoff del propio coordinador general sin actualizar.)*

**Y la lección que vale más que la pieza: cuando un hueco tiene dos mitades parecidas, cerrar una y declarar el hueco cerrado deja la otra invisible** — precisamente porque la entrada ya no está en la cola para que alguien la mire.

**Dos límites escritos, porque los dos se probaron.** *(a)* El volcado del hook es **deliberadamente laxo**: reconoce una línea por su prefijo, así que una mal escrita **se vuelca igual, mutilada**, en vez de desaparecer del aviso — fallar a la vista es mejor que fallar en silencio, y el verificador del kit la caza aparte para que recupere sus campos. *(b)* Lo que empieza y termina en una misma sesión **no entra ahí**: si entra todo, el volcado se convierte en ruido y se deja de leer, que es exactamente como se pierde un aviso de arranque.

## El perfil de la hija lanzada con `claude -p`: no tener uno no es correr sin permisos

Esta sección vale para las sesiones hijas que se lanzan con `claude -p`. Los subagentes de las tandas no llevan perfil propio y tienen su regla más abajo.

**Es correr con los del de al lado, y el de al lado suele ser el más amplio que hay.** Una sesión hija lanzada sin `--settings` **hereda el `settings.json` de la carpeta donde se lanza**, que normalmente es la del coordinador. Medido el 2026-08-27, cuando no existía perfil de ejecutora no-código: una tanda lanzada en la raíz del vault corrió **con el modelo caro** —mientras la guía le asignaba el de volumen—, **con el canal entre sesiones abierto** cuando la regla dice expresamente que las ejecutoras lo tienen cerrado, y **sin denegación sobre el catálogo**, que el coordinador general sí puede tocar porque es suyo.

- **El perfil se pasa en el lanzamiento (`--settings <ruta>`), no se copia a ninguna carpeta.** Una ejecutora no vive en un sitio: nace con su tanda y muere con ella.
- **Y hay que fijar el MODO de permisos explícitamente.** No des por hecho el que venga por defecto: en esa misma tanda no se pasó ninguno, la sesión salió **en modo plan**, y **no pudo escribir su entregable** — hizo la investigación entera, gastó su presupuesto y devolvió *"está en el plan"*. **Una sesión que tiene que escribir se lanza diciéndolo.**
- **Los subagentes no admiten perfil propio y heredan de la sesión que los lanza** (medido el 2026-10-04). Heredan el modelo y el esfuerzo, salvo lo que fije su definición: `model:` y `effort:` del frontmatter se respetan. Heredan también los `deny` de la sesión, que son barrera para ellos. No se pueden re-enraizar. Lo que sí restringe es `tools` en su definición; que un subagente sin `tools` sea de solo lectura lo sostiene el encargo, no una barrera.

**Y sobre el perfil de solo lectura que el método prometía para la fase de análisis: no existe, y no se va a construir.** El único modo que impone lectura de verdad es el modo plan, y **en modo plan la fase de análisis no puede escribir su propio plan** — que es justo su entregable. **La decisión, declarada: el solo-lectura de esa fase se comprueba AL VOLVER** (`git status` contra el estado de partida) **y no se impone al lanzar**. Es más débil, y se elige a sabiendas: una barrera que impide entregar no protege nada, solo desplaza el fallo.

**La regla que queda: antes de lanzar con `claude -p`, di con qué perfil y en qué modo corre la hija.** Si no lo dices, alguien lo ha decidido por ti, y no es quien crees.

## "A este asunto le falta otro coordinador": casi siempre es el síntoma, no el diagnóstico

**La sensación es real y conviene tomarla en serio, pero el remedio que sugiere suele ser el equivocado.** *"A veces un coordinador funciona bien y otras es como que le falta alguno más"* describe un asunto **cuyo alcance no está estable**, y hay tres causas posibles. Se distinguen por señales que se pueden mirar, no por intuición:

| Señal observable | Qué está pasando de verdad | Qué se hace |
|---|---|---|
| **Puedes trazar una línea de propiedad de ficheros entre los supuestos roles, sin solape** — y tendrían permisos o reglas de dominio distintos | **El asunto eran dos asuntos** | **Partirlo en dos contenedores**, cada uno con su coordinador y su frontera técnica. No añadir un coordinador al mismo asunto |
| **El contrato de una tanda no cabe en una frase de entregable claro**; se reabren los mismos frentes y las ejecutoras devuelven trabajo que no encaja | **La especificación está poco acotada** | **Acotar el contrato.** Más roles **multiplican** una especificación floja, no la arreglan |
| **El registro de frentes tiene muchas entradas simultáneas del mismo dueño, y crecen sin cerrarse** | **Un coordinador con demasiados frentes abiertos a la vez** | **Serializar**: cerrar antes de abrir. No paralelizar con más coordinadores |

**Solo la primera justifica un rol nuevo** — y entonces la respuesta correcta es *"este asunto son dos asuntos"*, que ya se resuelve sin ninguna pieza nueva: **un asunto, un contenedor, un coordinador**.

**Por qué no se resuelve añadiendo roles, con los números delante** *(investigación externa, agosto de 2026)*: en tareas **secuenciales con dependencias** —que es lo que es un asunto— **todas las variantes multiagente probadas degradaron entre un 39 % y un 70 %**. Y los errores se amplifican: **hasta 17× entre iguales**, frente a **~4,4× con un coordinador central**. El multiagente gana en lo contrario —trabajo que se parte en direcciones independientes y cuyo resultado vale muchos tokens—, y aun ahí a costa de un orden de magnitud más de consumo.

**Y si alguna vez se optase por varios roles: en topología CENTRALIZADA.** Un coordinador que orquesta, nunca roles hablando de igual a igual. La diferencia entre 4,4× y 17× de amplificación de errores es exactamente esa.

## Trabajar en paralelo sobre el mismo árbol: el procedimiento

**Pasa constantemente y no estaba escrito.** Mientras una tanda corre, el coordinador sigue trabajando; y en un vault compartido puede haber además otra sesión viva. **La hija ve el árbol entero, no una foto**, así que se encuentra ficheros que no escribió ella.

**Lo que se hace, y es de las dos partes:**

- **Quien lanza: anota el estado de partida.** `git status --porcelain` **antes** de lanzar, guardado. Sin eso, la comprobación de solo-lectura al volver no vale nada: no se puede distinguir lo que escribió la hija de lo que escribiste tú mientras corría.
- **Quien lanza: no toques lo que la tanda va a tocar.** El contrato ya dice qué ficheros son suyos; **esos son suyos hasta que vuelva**. Lo demás es tuyo.
- **La hija: compara contra el estado de partida, no contra el vacío.** Si encuentra cambios que no son suyos, **lo dice en el informe** en vez de callarlo o de razonar por descarte que no fueron ella.
- **La hija: nunca hace `git add -A` ni `git commit` sin pathspec.** Se llevaría por delante el trabajo a medias de otro. En realidad **una ejecutora no debería commitear**: entrega ficheros y quien lanzó decide qué entra.

**Y hay una operación que NO se hace nunca con otra sesión viva: reescribir el histórico.** Si una sesión tiene commits que dejan de existir —una reescritura, un `reset` que descarta, un `rebase`—, **su `HEAD` queda apuntando a algo que ya no está** y lo que haga a partir de ahí es impredecible. Por eso una limpieza de histórico tiene **condición previa y no negociable**: que el director confirme que **no queda ninguna otra sesión abierta sobre el vault**, y una copia de seguridad completa **con su `.git`, fuera del árbol**, que es la única red de una operación irreversible.

*(Rescatado el 2026-08-28 de un plan de sesión de hace dieciséis días que vivía fuera del vault. Su trabajo se había ejecutado y su lección no se había fundido: **un plan cumplido puede seguir llevando dentro la única copia de una regla**, que es exactamente por lo que esos ficheros no se borran sin mirarlos.)*

**El caso que lo motivó (2026-08-27):** una tanda de extracción encontró a mitad de trabajo tres ficheros modificados y tres sin trackear que no eran suyos —eran del coordinador, arreglando en paralelo lo que la propia tanda acababa de destapar—. Pudo distinguirlos **porque los revisó uno a uno**, no porque el procedimiento se lo diera hecho. Y en la misma jornada, **dos de los desfases que iba a reportar ya estaban corregidos cuando escribió**: los verificó otra vez y los reportó con su estado real. **Eso salió bien por criterio de la hija, y el método no puede depender de eso.**

## Tres trampas de las sesiones hijas, todas medidas

Las tres se midieron con sesiones `claude -p`; la primera vale también para los subagentes, y se explica en ella.

**1. Una ejecutora enraizada en un contenedor HEREDA su `CLAUDE.md` y se cree coordinadora.** Es la más cara y la menos obvia, porque **nace de dos reglas correctas que se pisan**: "el directorio de trabajo es el contrato" manda enraizarla ahí, y "los ficheros de contexto se acumulan hasta tu carpeta" hace que ahí se cargue un fichero que dice *"eres el coordinador… delega el trabajo voluminoso"*. Una ejecutora real lo leyó, concluyó que su tanda era voluminosa e **intentó lanzar otra ejecutora**; no hizo nada y devolvió éxito. **Coste medido: 1,11 USD y una pasada en vacío.** **Lo mismo vale para un subagente** (medido el 2026-10-04): el `CLAUDE.md` también le llega, así que puede creerse coordinador. Se mitiga con la definición del agente, que le dice qué es y qué no hace, y con los `CLAUDE.md` ya reescritos para el ciclo de tandas, que dejan de decir que toda tarea voluminosa se delega. **No basta con llamarla "ejecutora" en la especificación: el fichero de contexto pesa más que un rótulo**, porque llega antes y con más autoridad. **Un rol solo se anula anulándolo explícitamente**, en la especificación **y** en el prompt de lanzamiento → bloque literal en [`plantilla-tanda-ejecutora.md`](../../../inicializador/plantilla-tanda-ejecutora.md).

**2. Un `success` del runner no significa trabajo hecho.** Es el veredicto de la **tubería**, no del modelo. El caso anterior devolvió `success` sin haber tocado nada. **El verde falso puede venir de la herramienta y no del trabajo**, así que **se comprueba el efecto en el disco, no el código de salida** — lo destapó un `wc -c` desde fuera, no el informe de la hija, que ni existió.

**3. El modo plan desvía el entregable.** Una ejecutora de análisis lanzada en modo plan —para tener barrera real de solo lectura— **escribió su plan en el directorio de planes del cliente** en vez de devolverlo, y lo que llegó fue una frase diciendo que estaba en el plan; hubo que recuperarlo del transcript. **Si quieres un fichero de una sesión en modo plan, dale permiso de escritura acotado a ese fichero o recoge la salida por redirección.** No des por hecho que el entregable aparece donde lo pediste.

## Autonomía desatendida: SECUENCIAL, y con el cortacircuito que de verdad salta

*(Confirmado por dos investigaciones independientes, 2026-08-13.)*

**El paralelismo es destructivo bajo una sola suscripción de consumidor.** Todas las sesiones **comparten la misma cuota** —ventana rodante corta más tope semanal—, así que **N sesiones consumen N veces**, y cada iteración de un agente retransmite su historial entero. Un puñado de procesos simultáneos agota la ventana y **para todo a la vez**, no solo al último. **Por eso la orquestación desatendida se hace con cola y bloqueo: un proceso pesado a la vez.** No es prudencia, es la única forma de que el conjunto no se detenga. No confundir con las tandas independientes de un plan, que el coordinador lanza a la vez cada una en su worktree, con tope ([[ciclo_de_tandas]]): la cuota se reparte igual, y por eso el tope.

**Y el cortacircuito que salta primero no es el que se diseña.** Se ponen topes de turnos, de tiempo y de gasto, pero en la práctica **el primero que interrumpe es el límite de la plataforma**, que actúa como freno bruto. Los que hay que poner igualmente, porque el freno bruto llega tarde: **tope de turnos**, **tope de tiempo**, y sobre todo **detector de no-progreso**.

> **El fallo silencioso que hay que cazar: agotar la cuota devuelve código de salida 0 con salida vacía.** Un bucle desatendido lo interpreta como éxito y sigue. Es la misma familia que la trampa 2 de la sección anterior —**un `success` es veredicto del runner, no del trabajo**— y se ataja igual: **contar respuestas vacías y comprobar el efecto en el disco**, nunca el código de salida.

**Lo que NO se usa para disparar:** los hooks no pueden lanzar sesiones (ver arriba). Hace falta algo **externo al agente** — planificador del sistema o proceso residente que vigile una carpeta. **Y lo que se lance debe seguir consumiendo la suscripción**: cualquier vía que factura aparte queda fuera por la restricción de siempre.

## Más autonomía no es gratis: lo que se pierde al quitar a la persona del medio

**Hacer de intermediario también es revisar.** Cuando una persona transporta un resultado de una sesión a otra, hace de facto una validación semántica: ve el solape, huele la premisa rara, corta la cadena. **Quitarla del transporte no elimina esa función: la deja vacante.**

Está documentado como **sesgo de automatización** y **síndrome de fuera-del-bucle**: quien deja de ser revisor activo pierde capacidad de detectar el error, y los más confiados en el sistema son los que menos fallos ven. La supervisión útil es **evaluación activa**, no aprobación pasiva.

**Consecuencia operativa, y es la que importa:** al automatizar un relevo, **el modo de fallo cambia de "trabajo duplicado visible" a "trabajo duplicado invisible"**, y una premisa corrupta se propaga por la cadena a velocidad que impide corregirla. **Si se quita la puerta de revisión de un sitio, hay que ponerla en otro** —una verificación ejecutable, un criterio de aceptación, una puerta declarada—, no confiar en que el siguiente agente lo note.

**Y el respaldo de por qué el contrato escrito no se debilita nunca:** en el análisis de más de 1.600 trazas de fallo de sistemas multiagente reales (MAST, arXiv:2503.13657, NeurIPS 2025), **el 41,8 % de los fallos son de especificación y el 36,9 % de coordinación entre agentes** — casi cuatro de cada cinco. Solo el 21,3 % son de verificación. La conclusión de los autores es literal: los fallos vienen del **diseño del sistema**, y *"mejoras en la capacidad del modelo base serán insuficientes"* para resolverlos. **No esperes que un modelo mejor arregle una especificación ambigua.**

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
- **Claude Code Desktop** — **coordinación y consulta**: el propio coordinador, el consultor read-only y la revisión. No la ejecución voluminosa de edición. **No es la interfaz de las sesiones:** esa es Herdr (decisión del director, 2026-10-22, que desinstaló la app). Le falta el relevo autónomo (`relevo.mjs` exige Herdr) y el estado por pestaña, y las denegaciones y el hook de arranque `[NO COMPROBADOS en la app]`; quien la use contra un vault aplica antes la regla de dónde ejecuta y qué barrera la gobierna (más abajo).
- **Herdr — interfaz de las sesiones interactivas** (desde el 2026-10-04; sustituye a Orca, que se quitó). **Un espacio de trabajo de Herdr por vault**, con el general y los coordinadores de todos sus espacios, `equipos/` incluido (decisión del director, 2026-10-22: un espacio del vault no abre espacio de trabajo propio); se crea con el `--cwd` de la raíz o de un asunto, nunca con el de la carpeta de un espacio, y **una pestaña por coordinador**, abierta con `--cwd` en su carpeta `<espacio>/<asunto>/` (la del general, en la raíz). **La pestaña identifica al coordinador y no se mueve ni se duplica** (decisión del director, 2026-10-22): si ya existe, no se crea otra con el mismo nombre ni se pasa a otro espacio de trabajo, y la del general se queda donde está. Ese `--cwd` **es** el `cd` del lanzamiento, así que es lo que fija la identidad. **Prueba de entrada superada el 2026-10-04** con los cinco roles (raíz y cuatro asuntos), en modo de omitir permisos: el directorio era el correcto, cada sesión cargó el `CLAUDE.md` de su carpeta y se declaró su coordinador, y una orden de git que el perfil deniega **la paró la denegación**, no la red. Herdr lanza el agente con exactamente los argumentos que se le pasan (comprobado en su respuesta) y no usa worktrees. Dos límites, que son lo que lo mantiene dentro del método:
  - **Las tandas no pasan por Herdr.** Son subagentes de la sesión del coordinador, así que viven dentro de esa pestaña. Lo que se lance con `claude -p` (otra raíz u otro perfil) sigue yendo en modo no interactivo, con su perfil, sus topes y su informe a fichero. Arrancar ejecutoras con `herdr agent start` sería **otro camino de lanzamiento sin `--settings`, sin topes y sin informe**: saltarse el contrato de tanda, y no se hace.
  - **La puerta humana no se delega en ninguna herramienta.** Herdr puede leer la pantalla de otra sesión y mandarle teclas, o sea, contestar un diálogo de aprobación desde fuera. Eso no se hace nunca: una sesión parada en una pregunta o en una aprobación la atiende el director. Ninguna herramienta contesta una aprobación por él.
  - **Skill e integración de estado** (decisión D5 del director, 2026-10-04): la skill `herdr` y la integración de estado están instaladas a nivel de usuario. La skill se usa si el director lo pide, para el relevo propio y para que el general arranque coordinadores (más abajo). La integración solo informa del estado de cada sesión y no añade nada al contexto.
  - **El relevo propio, autorizado de forma permanente** (decisión D1 del director, 2026-10-05; afina la D5): un coordinador puede abrir su sucesora en su misma pestaña con `general/comun/scripts/relevo.mjs`, y es de **todo coordinador, sin esperar al director**: abre la sesión nueva en su misma pestaña, la arranca con su prompt y, cuando ha arrancado, cierra la vieja. Un coordinador de asunto no lo usa para arrancar a otros coordinadores ni ejecutoras, ni para contestar diálogos. No se salta el contrato de tanda porque la sucesora es el mismo rol, con la misma carpeta y por tanto con el mismo perfil, los mismos hooks y las mismas reglas: no es una tanda. Es la pieza externa que la v1.2 pedía, porque un hook no puede arrancar la sucesora. El procedimiento, lo que garantiza y lo medido el 2026-10-05 en una pestaña desechable están en [[ciclo_de_tandas]] y no se repiten aquí.
  - **El general arranca coordinadores** (decisión del director, 2026-10-22): el general lleva todo el vault y se encarga de que funcione y de que las mejoras lleguen enteras a cada coordinador. Por eso puede abrir con Herdr la pestaña de un coordinador de asunto (al crear el asunto o cuando haga falta), arrancar `claude` con `herdr agent start <nombre> --kind claude --pane <panel> -- --dangerously-skip-permissions` y pasarle su prompt de arranque. Medido el 2026-10-22 con el coordinador de un equipo: una pestaña con el nombre del asunto (entonces en un espacio de trabajo propio; desde la v1.32 va en el del vault), y la sesión arrancó en Opus 5.5 `high` y empezó a trabajar. **Para que un coordinador sin trabajo cargue reglas nuevas** (un `CLAUDE.md`, un agente o una doctrina que cambiaron), no se le pide que se releve: `relevo.mjs` lo para porque no tiene trabajo siguiente, y es correcto. El general reinicia su sesión en su misma pestaña con `node general/comun/scripts/relevo.mjs --reiniciar-coordinador <nombre>` (`--seco` lista las precondiciones sin tocar nada): comprueba que está parado y sin trabajo abierto —sin turno en curso ni diálogo, árbol limpio en su ámbito, sin plan vivo, sin relevo a medias y con su DoD sellado—, le manda `/exit`, espera a que el panel vuelva a la shell (sin ningún proceso con `argv0` `claude`: su `name` es la versión, no `claude`), arranca `claude` con las mismas opciones (reintentando mientras Herdr no suelta el nombre del agente) y le pasa un prompt de arranque. Al que tiene trabajo no se le reinicia: carga las reglas en su próximo relevo, con `--recargar` si va por debajo del suelo de contexto. Medido el 2026-10-22 con un coordinador sin trabajo (homelab): la shell volvió a primer plano (`foreground_process_group_id` igual a `shell_pid`) y el primer `agent start` falló porque Herdr aún no había soltado el nombre; el reintento entró un instante después, y la sesión nueva arrancó en su pestaña y respondió. Lo que no cambia: las ejecutoras y las tandas no pasan por Herdr, ninguna herramienta contesta una aprobación por el director y un coordinador de asunto no arranca a otros, solo a su sucesora.
- **Cowork / Claude in Chrome** — tareas de navegador (consultar una web pública, capturas). **Cowork es GA (2026) y está en Team**, pero corre en la **nube de Anthropic** (remote sessions + connectors) y sin audit logs → **frontera de soberanía: datos personales, documentos del asunto y originales NUNCA en Cowork**; solo búsqueda pública o síntesis no sensible. Claude in Chrome (GA en Code/Cowork) opera con **tu sesión real** del navegador → solo sitios de confianza, y **nunca** con una sede electrónica o la banca abiertas.
  - **[INVESTIGADO 2026-08-14, y hay dos cosas que agravan lo anterior]** Primera: **la ejecución en la nube pasó a ser el valor por defecto el 7-jul-2026 y el cambio fue silencioso**, con un interruptor de "ejecutar en la nube" que hay que ir a mirar — o sea que **"corre en local" dejó de poderse suponer y hay que comprobarlo antes de cada uso**. Y lo que se procesa allí incluye **el contenido de los ficheros locales que abra por el puente de la aplicación de escritorio**, no solo lo que se teclee.
  - **[LO QUE MÁS IMPORTA AL MÉTODO, y NO está verificado en fuente oficial] Las reglas de denegación de Claude Code NO gobiernan Cowork.** Tiene su propio modelo de permisos (modos de aprobación + permisos por conector + instrucciones de carpeta), y un `CLAUDE.md` en la carpeta vinculada le llega como **contexto persuasivo, no como barrera**. La evidencia es un caso reproducible publicado en el registro de incidencias del propio fabricante (24-abr-2026), **no documentación**: por eso va etiquetado y **no se propaga como hecho**. Si alguna vez se pilota, esto se comprueba primero, porque **es la barrera sobre la que se apoya todo el kit**.
  - **La regla general que sale de aquí, y esa sí vale para cualquier superficie futura: antes de usar una superficie nueva contra el vault, se comprueban dos cosas — DÓNDE ejecuta y QUÉ barrera la gobierna.** Que una superficie lleve la misma marca que la herramienta de siempre **no significa que herede sus permisos**. Dar eso por hecho es exactamente la familia de error de la lista de permitidos que concede en vez de restringir.
- **Palancas soberanas en Claude Code local** (preferentes, jul-2026) — **hooks** (incl. `defer` = puerta de aprobación human-in-the-loop), **subagentes/background agents** (2-3 puntuales, **no** swarms), **skills** (`SKILL.md` versionadas en git; ya maduras para encapsular doctrina) y **output styles**. Todo local, versionable y auditable → mejores que Cowork para lo sensible. **NO** dynamic workflows masivos (research preview; sobredimensionados; agotan cuota — ver [[modelo_por_tarea]]).
- **Chat web** — Deep Research multifuente ([[vigilancia_tecnologica_bajo_demanda]]), no Claude Code.
- **Subagentes** (dentro de la sesión del coordinador) — de **solo lectura** para reconocer o resumir lectura voluminosa (devuelven un resumen acotado), y `planificador` y `ejecutora` (o `ejecutora-mecanica`, para lo literal) para las tandas. Los de solo lectura evitan inflar el contexto del coordinador; los de las tandas producen el trabajo con un informe acotado → [[ciclo_de_tandas]].

## Flujo

El ciclo completo está en [[ciclo_de_tandas]]; aquí queda lo que toca a la elección de herramienta.

1. El coordinador **descompone** la tarea en piezas con dependencias claras.
2. **Asigna** cada pieza a la herramienta óptima: subagente `ejecutora` o `ejecutora-mecanica` para las tandas, `claude -p` si hace falta otra raíz u otro perfil.
3. **Redacta el encargo `.md`** de cada pieza ([[formato_prompts_markdown_limpio]], [[feedback_prompt_delivery]]).
4. Si la pieza es **no trivial**, lanza primero el `planificador`: el coordinador **lee el plan**, **corrige su encargo** con las premisas falsas que aparezcan, y **solo entonces** lanza las tandas, una tras otra o, las independientes, a la vez en worktrees.
5. Tras cada tanda, el coordinador **verifica** (`git status --short` y el comando de la tanda), commitea por pathspec y prepara la siguiente. Al cerrar una tanda o un bloque guarda el estado y se releva o para ([[ciclo_de_tandas]]).
6. **El director no es el transporte por defecto**; si una herramienta exige que él relaye algo, se le pide ese gesto y nada más.

## Ritmo de entrega al director

El coordinador entrega los pasos **de uno en uno** — o **dos a la vez solo si van en herramientas distintas** y son paralelos (p. ej. una tanda CLI + un brief de chat). **No vuelca toda la lista de pasos de golpe**: satura y desorienta al director. Tras cada paso, confirma el resultado y propone el siguiente.

## Quién la aplica

**Todo coordinador** — el general del vault y el de cada asunto. El coordinador **protege su contexto para coordinar**; el trabajo voluminoso vive en sesiones focalizadas.

Relacionada: [[modelo_por_tarea]] (modelo por tarea + evitar workflows multiagente masivos), [[paralelismo_subagent_opus_principal]], [[sesion_consultor_paralelo]], [[recalibracion_tiempos]], [[higiene_contexto_y_tokens]].

> Pieza de catálogo `general/comun/doctrinas/`. Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda**. Historial de versiones: [[historial-doctrinas#orquestacion_sesiones_por_herramienta]].
