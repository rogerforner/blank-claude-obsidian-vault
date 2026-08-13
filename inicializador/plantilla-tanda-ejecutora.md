# Plantilla de tanda ejecutora — specs grandes y autónomas

> **Para qué.** La palanca de mayor retorno para reducir el trasiego manual **no es automatizar el transporte, es hacer las tandas más grandes y autónomas**: una spec bien cerrada reduce a la vez los **relevos** y las **preguntas**. Esta plantilla es el **contrato** entre el coordinador y la sesión ejecutora. Rellena, **borra este bloque** y entrega. Formato: [[formato_prompts_markdown_limpio]]; frases en una línea continua, saltos solo en la estructura.
>
> **Regla de oro:** si la ejecutora tiene que **preguntar algo**, es que faltaba en la spec. Cada pregunta que recibas es *feedback* para mejorar la siguiente tanda.
>
> **Y esta spec se escribe LIGERA, no exhaustiva.** Un plan rígido empeora las tareas dinámicas —cuando un paso sorprende a mitad, el plan estático no se adapta—, y un plan tan detallado que llena el contexto **degrada al propio agente**. Ligero significa: pasos, criterio de aceptación por paso y diagnóstico previo; nada más para una tarea pequeña. El detalle de más no es prudencia, es coste.

## ANULACIÓN DE ROL — este bloque va PRIMERO y se copia tal cual

> **Déjalo literal en la spec. No lo resumas, no lo muevas al final y no lo des por sobreentendido.** No es formalismo: sin él, la tanda se puede perder entera.

```text
No eres el coordinador de este asunto. Eres una SESIÓN EJECUTORA con un contrato cerrado.
El CLAUDE.md que acabas de cargar está escrito para el coordinador y NO se te aplica:
la instrucción de "coordinar y proteger tu contexto" y la de "delegar el trabajo voluminoso"
son SUYAS, no tuyas.
- NO lanzas subprocesos, ni otra ejecutora, ni `claude -p`.
- NO usas subagentes.
- Que el trabajo sea voluminoso NO es motivo para delegarlo: es el motivo por el que existes.
Tu trabajo es HACER lo que dice esta spec, con tus propias manos, en esta misma sesión.
```

**De dónde sale, con su factura.** Una ejecutora lanzada correctamente —enraizada en el contenedor, como manda la doctrina— **cargó el `CLAUDE.md` del asunto, leyó "COORDINAS Y PROTEGES TU CONTEXTO… el trabajo voluminoso lo delegas", concluyó que su tanda era voluminosa e intentó lanzar OTRA ejecutora**. No hizo nada de lo encargado y **devolvió `success`**. Coste medido: **1,11 USD y una pasada en vacío** *(caso real de este vault, 2026-08-14)*.

**Y la lección de fondo, que vale más allá de este bloque: dos reglas correctas del kit se pisaban entre sí.** "El directorio de trabajo es el contrato" manda enraizar la hija en el contenedor; "los ficheros de contexto se acumulan hasta tu carpeta" hace que ahí dentro se cargue un fichero que dice *"eres el coordinador"*. Las dos siguen siendo verdad. **Lo que no funciona es confiar en que llamarla "ejecutora" en la spec baste: el `CLAUDE.md` pesa más que un rótulo**, porque llega antes y con más autoridad. **Un rol solo se anula anulándolo explícitamente.**

**Repítelo en el prompt de lanzamiento, no solo en la spec.** Son dos sitios a propósito: la spec la lee cuando abre el fichero; el prompt lo tiene delante desde el primer token.

## Setup

**Working dir: `{{RUTA_ABSOLUTA}}`** — el **cwd real del proceso**, no una frase de este prompt: normalmente el contenedor del asunto. **La ejecutora se lanza DENTRO de él** (`cd "{{RUTA_ABSOLUTA}}" && claude -p …`), porque el cwd decide qué `CLAUDE.md` y qué configuración de proyecto se cargan, qué hooks y permisos aplican y **dónde busca por defecto**: enraizarla en el sitio equivocado le da las reglas de otro asunto, deja sus hooks sin disparar y la manda a buscar donde no está lo que busca. Lo que esté **fuera** de ese directorio se le pasa con **`--add-dir`** (solo para LEER) o **no lo ve**. → [[orquestacion_sesiones_por_herramienta]]

**Dónde vive este contrato:** esta spec y su fichero de plan viven **dentro del working dir** — la hija se enraíza donde tiene que **escribir**, y el plan tiene que nacer donde ella puede escribirlo. Ninguno de los dos se versiona: son material de trabajo y **se borran al cerrar la tanda** ([[convencion_organizacion_carpeta_trabajo]]); el commit por **pathspec** ya impide que se cuelen.

**Fase: `{{análisis | ejecución}}`** — si es ejecución y la tanda lleva análisis, **Plan de referencia:** `plan-tanda-{{NOMBRE}}.md`. *(Ojo: el `Plan mode` de abajo es el modo del CLI y **no** es esto; la fase de análisis es una **ejecutora aparte con entregable escrito**.)*

Modelo: `{{MODELO}}`. Effort: `{{EFFORT}}`. **Los dos salen de la tabla rol → modelo → esfuerzo de [[modelo_por_tarea]]; aquí solo se copian, no se decide de nuevo.** **Fíjalos al arrancar y no los cambies**: el cambio provoca cache-miss completo. Plan mode: `{{SÍ/NO}}`. Git: local, un commit por hito, por pathspec.

*(Si el material que hay que manejar roza el vocabulario de la seguridad informática —contraseñas, cifrado, credenciales, control de accesos— usa **Opus 5**: los clasificadores de seguridad pueden enrutar la petición a otro modelo, y el cambio de modelo rompe el hilo de trabajo. → [[modelo_por_tarea]])*

## Fase de análisis (si la tanda la lleva)

**Cuándo la lleva:** si la tanda **toca varios ficheros**, **estrena una forma de trabajo** que el asunto no tiene, o se apoya en **premisas sobre material que no has abierto tú**. Si no la lleva, escríbelo aquí: **"tanda de fase única declarada"** y por qué — saltársela es legítimo; saltársela en silencio, no.

**Si la tanda EDITA CÓDIGO, "fase única declarada" no existe: nunca se salta.** El pack `codigo/` lo hace incondicional ([`general/comun/packs/codigo/README.md`](../general/comun/packs/codigo/README.md) § "Plan antes de tocar código") — la excepción que el resto de este párrafo permite para otro tipo de material **no aplica aquí**, sea cual sea el tamaño de la tanda.

**Contrato de la ejecutora de análisis:** **no modifica material, no commitea y deja el historial intacto.** Su **único** entregable de escritura es `plan-tanda-{{NOMBRE}}.md` en el working dir, con estos cinco apartados:

1. **Verificación en fuente primaria de CADA premisa de esta spec, con el comando ejecutado y su salida.** No "se ha comprobado que": el comando y lo que devolvió. → [[verificacion_fuente_primaria]]
2. **Premisas de la spec que resultan FALSAS**, listadas explícitamente. Es el apartado que hace útil el plan; **si está vacío, dilo vacío**.
3. **Inventario de lo que va a tocar**, con el perímetro.
4. **Decisiones que la spec dejó abiertas sin darse cuenta** y hay que cerrar antes de empezar.
5. **Orden de pasos y riesgos**, incluido qué hacer si un paso falla a mitad.

**Y luego lo importante, que es tuyo:** lee el plan, **corrige esta spec** con lo que haya destapado, y **solo entonces** lanza la ejecución. El plan no existe para que la ejecutora se organice: existe para que **tú arregles la spec antes de que cueste trabajo**. Si no vas a leerlo, no lances la fase.

**Comprueba que fue read-only de verdad** (un comando, y llevas la cuenta): `git status --short` muestra solo el fichero de plan, y `HEAD` no se ha movido. No se instala ningún guard para forzarlo — se mide después.

> **Y para que esa comprobación signifique algo, no toques el árbol mientras la tanda corre.** El `git status` del cierre no distingue quién escribió qué: si tú editas ficheros en paralelo, la hija se los encuentra modificados y **su propia prueba de inocencia queda inservible**. *(Caso real: una tanda de análisis cerró avisando de cuatro ficheros modificados que no eran suyos —los estaba tocando el coordinador a la vez— y tuvo que razonar por descarte para poder afirmar que no los había escrito ella. Se portó bien; la siguiente puede no darse cuenta, o peor, dar por hecho que sí eran suyos.)* **Si vas a trabajar en paralelo, anota el `git status --short` de partida antes de lanzar** y compara contra él, no contra el vacío.

> **Y una trampa que estrena el perfil de software: `git status` limpio ya NO prueba que no haya restos.** El `.gitignore` excluye `asuntos/*/repo/` para que el vault no versione el código ni lo trate como submódulo accidental — con el efecto de que **git no ve nada dentro de esa ruta**. Una tanda que cree ahí un directorio de prueba puede reportar `git status --short` vacío con toda honestidad y **habérselo dejado en disco**; y `git clean -ffd` **tampoco lo borra**, porque sin `-x` no toca lo ignorado. *(Caso real: una ejecutora reportó la limpieza correctamente y el resto siguió ahí hasta que alguien mirón el disco.)* Si tu tanda toca `repo/`, la comprobación de limpieza es **mirar el disco** (`ls` o `find` sobre la ruta), y el borrado necesita `git clean -ffdx -- <ruta acotada>`.


## Objetivo

{{Una o dos frases: qué debe existir al terminar que no exista ahora. En términos de resultado observable, no de actividad. "Existe el escrito de alegaciones con sus cinco anexos numerados", no "trabajar en las alegaciones".}}

## Alcance

**SÍ entra:** {{ficheros, carpetas o documentos exactos}}
**NO entra (no lo toques aunque lo veas):** {{lo que queda fuera. Los **originales recibidos o emitidos** están fuera SIEMPRE: no se editan, no se renombran, no se regeneran. Si hay que trabajar sobre uno, se trabaja sobre copia.}}

### Tamaño de la tanda

Dimensiona por la **menor** de estas tres cosas — y dilo como lo que es, una **analogía**, no una medición: no hay estudio que mida el tamaño óptimo de tanda para un agente; la cifra que circula (unos cientos de líneas por revisión) es de revisión humana de código, y se traslada aquí por analogía razonada con esa práctica, no por evidencia directa sobre agentes. Presentarla como medida en agentes sería folclore.

1. **Una unidad de comportamiento completa y verificable** (un test que pasa, una comprobación que da OK o FALLO).
2. **Un diff o un volumen de cambio que quepa en una revisión humana.**
3. **Lo que el director pueda revisar de una sentada.**

Si la tanda no cabe en la menor de las tres, se trocea antes de lanzarla.

## Contexto verificado (para que no lo re-derives ni lo supongas)

{{Hechos ya confirmados con su ubicación: fichero y línea, número de expediente, fecha del sello, importe y de qué documento sale, nombre del organismo.}}

**Etiqueta cada dato, sin excepción: `[MEDIDO]`** — con quién, con qué y cuándo — **o `[A CONFIRMAR]`**, para que la ejecutora lo verifique en vez de asumirlo. Si dudas de en cuál cae, es *a confirmar*. Un dato de apoyo erróneo **sobrevive al viaje** y quien lo recibe lo hereda como verificado. → [[verificacion_fuente_primaria]]

## Decisiones ya tomadas (NO las reabras)

{{Las decisiones ya cerradas —de fondo, de forma, económicas o jurídicas— para que la ejecutora no vuelva a plantearlas ni pida confirmación. Esto es lo que más reduce las preguntas.}}

## Criterios de aceptación (el contrato)

**Esto es lo que más rinde de todo el contrato — más que el plan mismo.** No es una preferencia de este vault: es lo que el fabricante señala como la práctica de mayor apalancamiento para un agente — darle una forma de verificar su propio trabajo (un test que pasa, un comando que devuelve OK o FALLO, una comprobación observable). Sin este apartado bien escrito, el agente produce trabajo que **parece** correcto y no lo es; con él, el trabajo se verifica solo.

{{Lista verificable, en términos de resultado observable. Cada punto debe poder comprobarse con un comando o un cotejo, no con una opinión.}}

Ejemplos de cómo se escribe un criterio **comprobable** en un asunto:

- "La suma de la columna *importe* de las 37 facturas de `docs/facturas/` da 12.480,55 € y **coincide** con el total que figura en el escrito", no "revisar que las cuentas cuadran".
- "El PDF generado abre, tiene **14 páginas** y los cinco anexos citados existen como fichero en `docs/anexos/`", no "generar el PDF".
- "Cada fecha del cronograma sale de un documento de `docs/` **citado por nombre de fichero**", no "poner las fechas bien".
- "Ningún enlace interno del expediente apunta a un fichero inexistente", no "revisar los enlaces".

**Antes de convertir un invariante en criterio, comprueba que el entorno lo cumple HOY.** Un criterio que el entorno **viola por su cuenta** es un falso positivo garantizado, y acompañado de un *"para en seco si difiere"* **frena la tanda sin que nada esté roto**. *(Caso real: "el recuento de filas es idéntico antes y después", sobre unos datos que otro proceso estaba usando en vivo — cambiaron solos en 11 segundos.)* Para *"no se ha perdido nada"*, el invariante correcto no es el contenido volátil sino la **identidad** de lo que quieres proteger (un identificador estable, una fecha de creación, un recuento que no dependa del uso).

**No fijes como criterio el comando de una herramienta que no has ejecutado nunca**: verifica su *idiom* real primero. *(Caso real: una aserción suelta de una herramienta de comprobación era inválida — exigía abrir declarando el plan y cerrar con su función de cierre.)* → [[verificacion_fuente_primaria]]

## Definition of done (comandos exactos)

```
{{Los comandos que deben pasar en verde. En un asunto son verificaciones sobre el PRODUCTO:
 - recuento de ficheros del lote y cotejo contra lo que dice el escrito;
 - suma de una columna con un script corto y comparación con el total escrito;
 - que el documento generado ABRE y tiene las páginas esperadas;
 - que las fechas y los importes cuadran entre el documento y su fuente;
 - que no falta ningún anexo citado, y que ninguna referencia interna queda colgada.}}
```

La ejecutora **ejecuta estos comandos y reporta el output literal** antes de cerrar; si algo falla, **corrige y vuelve a ejecutar** — no cierra con la puerta en rojo, ni "ajusta" el criterio para que pase. Lo que **no** se pueda comprobar por comando no desaparece del cierre: se entrega como **comprobación en campo** con los pasos exactos y qué resultado esperar. → [[verificacion_e2e_por_agente]], [[scripts_adhoc_tareas_repetitivas]]

## Qué hacer si algo no encaja

**Resuelve tú** (sin preguntar): ambigüedad de estilo o de nombres, orden interno del trabajo, elección entre dos formas equivalentes de cumplir los criterios de aceptación.
**Escala solo en estos casos** ([[minimizar_askuserquestion_agente_operativo]]): decisión de fondo que contradice el contexto verificado · hallazgo bloqueante (una cifra que no cuadra con su fuente, un plazo que ya venció, un documento que falta) · conflicto con una doctrina · bloqueo real. En esos casos **para y reporta**; no improvises una decisión que no es tuya.

## Puertas humanas (no las cruces)

{{Lo que requiere al director: **entregar fuera** (enviar el correo, presentar en el registro, remitir a la gestoría o al organismo), **firmar**, **pagar**, autenticarse con certificado o clave, medir algo en campo, y cualquier decisión jurídica o económica. La ejecutora **prepara** y para ahí, dejándolo anotado.}} Git: commits por **pathspec** (nunca `-A`), sin coautoría de la IA ([[sin_coautor_commits]]); el histórico es local, no hay nada que sincronizar fuera.

## Reporta al cerrar

**Límite del informe: `{{N}}` líneas.** *(Campo obligatorio, no adorno.)* Lo que devuelve una sesión hija **entra íntegro en el contexto de quien la lanzó**: el aislamiento protege del ruido intermedio —tus lecturas, tus descartes— pero no de un informe verboso. Un informe sin límite no es un ahorro, es un rodeo. Si no cabe en el límite, **el detalle va a un fichero** y el informe lo referencia. → [[orquestacion_sesiones_por_herramienta]]

Dentro de ese límite: qué has hecho y **dónde** (ficheros y commits). El **output literal** de los comandos de la definition of done. Los criterios de aceptación, **uno por uno**, con la evidencia de que se cumplen. Lo que **NO** has hecho y por qué. Hallazgos y decisiones que tomaste tú. Y si algo de la spec estaba mal o faltaba, **dilo explícitamente**: es lo que mejora la siguiente tanda.

**Y una línea de constancia al arrancar:** con qué **modelo y esfuerzo** estás corriendo de verdad (`/status` lo dice, y el esfuerzo aparece junto al indicador de actividad). No existe ninguna variable que lo estampe sola: es convención, y sirve para saber después con qué se hizo un trabajo — sobre todo si un clasificador te cambió el modelo por el camino.

---

## Variante headless (para que la lance el coordinador, sin trasiego del director)

Cuando la tanda está bien cerrada, el coordinador puede **lanzarla él mismo** y recoger el resultado sin intermediario ([[orquestacion_sesiones_por_herramienta]]). El contrato es este mismo fichero; la ejecutora escribe su informe en un `.md` y el coordinador lee solo el extracto. El trabajo ocurre en un **proceso aparte con contexto limpio**, así que "coordinar ≠ ejecutar" se mantiene intacto.

**El `cd`/`--cd` del lanzamiento no es decorativo:** es lo que fija el working dir del § Setup — sin él, la hija se enraíza donde estés tú.

Esto de aquí abajo es **sintaxis**: cómo se lanza la ejecutora.

| Necesidad | Claude Code |
|---|---|
| Lanzar la ejecutora | `cd "<ruta>" && claude -p "<prompt>"` |
| Informe a fichero | `--output-format json` |
| Directorio adicional (solo para LEER) | `--add-dir` |
| Fase de análisis, solo lectura | perfil de `settings.json` en modo plan |
| Fase de ejecución | perfil por defecto del destino |
| Tope de turnos y de gasto | `--max-turns`, `--max-budget-usd` |

**Primero, la de análisis** (si la tanda la lleva). Único entregable: el fichero de plan.

```bash
cd "<RUTA_ABSOLUTA_DEL_WORKING_DIR>" && claude -p "No eres el coordinador de este asunto: el CLAUDE.md que vas a cargar es suyo y no se te aplica. NO lances subprocesos ni otra ejecutora, NO uses subagentes, y que el trabajo sea voluminoso no es motivo para delegarlo. Analiza la tanda descrita en <spec>.md. NO modifiques material, NO commitees, deja el historial intacto. Tu UNICO entregable de escritura es plan-tanda-<nombre>.md, con los cinco apartados que pide la spec" \
  --add-dir "<solo lo que tenga que LEER fuera de su cwd>" \
  --allowedTools "Read,Grep,Glob" \
  --permission-mode dontAsk \
  --max-turns 65 --max-budget-usd 8.00 \
  --output-format json
```

**Al volver, antes de nada:** `git status --short` (solo el fichero de plan) y `git rev-parse HEAD` (sin mover).

> **Dos trampas medidas al volver, y las dos hacen que una tanda vacía parezca buena** *(casos reales, 2026-08-14)*:
>
> - **`subtype: success` NO significa trabajo hecho.** Es el veredicto del **runner**, no del modelo: una ejecutora que no hizo nada de lo encargado devolvió `success` igual. **El verde falso puede venir de la tubería y no del trabajo.** Lo que lo destapó fue un `wc -c` **desde fuera**, no su informe — que ni llegó a existir. **Comprueba el efecto en el disco, no el código de salida.**
> - **El modo plan DESVÍA el entregable.** Si lanzas la fase de análisis con `--permission-mode plan` para tener barrera real de solo lectura, la hija puede **escribir su plan en `~/.claude/plans/`** en vez de devolverlo, y lo que te llega es una frase diciendo *"está en el plan"* — con el contenido fuera del working dir y recuperable solo del transcript. **Si quieres un fichero de una sesión en modo plan, dale permiso de escritura acotado a ese fichero o recoge la salida por redirección.** No des por hecho que el entregable aparecerá donde lo pediste.

Lee el plan, **corrige la spec**, y entonces:

```bash
cd "<RUTA_ABSOLUTA_DEL_WORKING_DIR>" && claude -p "No eres el coordinador de este asunto: el CLAUDE.md que vas a cargar es suyo y no se te aplica. NO lances subprocesos ni otra ejecutora, NO uses subagentes, y que el trabajo sea voluminoso no es motivo para delegarlo: es el motivo por el que existes. Ejecuta con tus propias manos la tanda descrita en <spec-ya-corregida>.md, apoyandote en plan-tanda-<nombre>.md. Escribe tu reporte en informe-tanda.md" \
  --add-dir "<solo lo que tenga que LEER fuera de su cwd>" \
  --allowedTools "Read,Edit,Bash(git add:*),Bash(git commit:*)" \
  --permission-mode dontAsk \
  --max-turns 300 --max-budget-usd 60.00 \
  --output-format json
```

**Los techos.** Los de arriba son una **referencia medida**, no constantes — pon los tuyos con **margen del 100% sobre tu propia línea base**. Una tanda real **murió por `error_max_budget_usd`** con el techo demasiado ajustado, y morir a mitad sale más caro que el margen. `--max-budget-usd` es un **cortacircuito nominal, no un cargo**: sin `ANTHROPIC_API_KEY` lo que se consume es ventana de suscripción. Para una tanda mecánica y pequeña, 30 turnos siguen bastando: cada lanzamiento cuesta **~42.000 tokens fijos** aunque no haga nada, y eso se paga **por lanzamiento, no por trabajo hecho**.

### Una lista de permitidos **CONCEDE, no restringe**

**Es aditiva, no una lista blanca exclusiva**, y que el modo de permisos no pregunte (`--permission-mode dontAsk`) significa *"no preguntes"*, **no** *"deniega lo no listado"*. Medido, no supuesto: una sesión hija lanzada con `--allowedTools "Read"` (sin `Bash`) **ejecutó Bash igualmente**. Se sigue pasando la opción porque **documenta la intención**, pero **no la cuentes como barrera**.

**Lo que SÍ protege:** las **deny rules del `settings.json` del directorio destino** — la hija las respeta y **no las puede saltar**; aguantan incluso bajo el flag de permisos amplios. Son la única barrera real, y **lo que quieras impedir, exprésalo como DENY, nunca como ausencia del allow**. Dato medido (2026-08-10): el `settings.json` de un proyecto se resuelve por el **directorio de trabajo exacto**, **sin heredar del directorio padre** — una sesión enraizada más adentro del árbol (p. ej. en un `repo/` dentro del contenedor) **no** hereda las deny rules puestas más arriba; si necesita las suyas, van **en su propio directorio**, o queda más abierta que su padre en vez de más protegida.

**Lo que protege de verdad, por orden:**

1. **Las deny rules** del `settings.json`, por ruta.
2. **Los cortacircuitos duros** — `--max-turns`/`--max-budget-usd`.
3. **Los hooks previos a la herramienta** (`PreToolUse`) — corren al margen del modo de permisos.
4. **El watchdog/timeout del llamante.**

### Antes de usarla, comprueba

- **Que la sesión del agente está autenticada, y compruébalo en el propio agente, no en la tuya.** Es lo **primero**, porque sin ello **no se lanza nada** y es un fallo que la sesión padre no ve venir: tú puedes estar trabajando con normalidad y el binario del agente **no tener sesión guardada**, porque se autentican por vías distintas. Se comprueba con `claude auth status`, que responde en JSON y no es interactivo; se arregla con `claude auth login`, que **sí** lo es — y por tanto **lo hace el director**, no el agente. *(Medido el 2026-08-10: `claude auth status` devolvía `loggedIn: false` mientras la sesión del coordinador funcionaba sin problema. La tanda murió en **1,3 segundos con 0 tokens** y `Failed to authenticate`, sin escribir una línea de su entregable. Fallar rápido y barato es la suerte de este caso; no cuentes con ella.)*
- Que **`ANTHROPIC_API_KEY` NO está definida**, ni como variable de entorno ni en un **`.env` bajo el directorio de trabajo**: si lo está, Claude Code la prioriza sobre la suscripción y **factura por API en silencio**.
- Que la barrera del destino está puesta: el `.claude/settings.json` del directorio destino con sus **deny rules** (ver [plantilla-settings-coordinador.json](plantilla-settings-coordinador.json)) — los originales del asunto, los almacenes de credenciales de la máquina, el catálogo `general/` en solo lectura, y los comandos que sacan algo fuera.
- Que pones los cortacircuitos: `--max-turns` y `--max-budget-usd`.
- Que hay un **timeout/watchdog en el llamante**: hay *silent-freeze* documentado al lanzar `claude -p` desde procesos de larga vida.
- **Entradas grandes por ruta de fichero**, nunca por stdin.
- **Baja concurrencia: 1-2 ejecutoras**, no un enjambre. Un enjambre reduce el trabajo útil semanal de una persona sola.

## Nota de trazabilidad

La conclusión de la que sale esta plantilla —que cerrar mejor la spec rinde más que automatizar el transporte— venía de un estudio interno del kit. **El estudio no viaja en el seed** (es evidencia de las rondas del vault de origen); el argumento y el dato se conservan aquí, en el cuerpo. Lo que se ha retirado es el anexo, no el razonamiento.

*(También se ha retirado del `## Setup` la línea de rama de trabajo y promoción entre entornos: el vault es **git local sin ramas de entorno**, así que no tiene equivalente. Si el asunto incluye software propio, eso vive en el pack `codigo/`.)*
