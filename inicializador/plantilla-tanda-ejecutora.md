# Plantilla de tanda ejecutora — especificaciones grandes y autónomas

> **Para qué.** Una especificación bien cerrada reduce a la vez los relevos y las preguntas, y rinde más que automatizar el transporte. Esta plantilla es el **contrato** de una tanda del plan: la entrada que el coordinador pasa al subagente `ejecutora` (o `ejecutora-mecanica` si la tanda es literal), dentro del ciclo de [[ciclo_de_tandas]]. Rellena, **borra este bloque** y entrega. Formato: [[formato_prompts_markdown_limpio]]; frases en una línea continua, saltos solo en la estructura.
>
> **Regla de oro:** si la ejecutora tiene que **preguntar algo**, es que faltaba en la especificación. Cada pregunta que recibas es *feedback* para mejorar la siguiente tanda.
>
> **Y esta especificación se escribe LIGERA, no exhaustiva.** Un plan rígido empeora las tareas dinámicas —cuando un paso sorprende a mitad, el plan estático no se adapta—, y un plan tan detallado que llena el contexto **degrada al propio agente**. Ligero significa: pasos, criterio de aceptación por paso y diagnóstico previo; nada más para una tarea pequeña. El detalle de más no es prudencia, es coste.

## Anulación de rol: vive en la definición del agente

La anulación del rol de coordinador ya está en la definición del subagente (`plantilla-agente-ejecutora.md`), que es lo que carga la ejecutora; no se copia en cada contrato. El porqué: una ejecutora enraizada en el contenedor cargó el `CLAUDE.md` del coordinador, concluyó que su tanda era voluminosa e intentó lanzar otra ejecutora; no hizo nada de lo encargado y devolvió `success`, con un coste de 1,11 USD *(caso real de este vault, 2026-08-14)*. Llamarla "ejecutora" no basta, porque el `CLAUDE.md` llega antes y pesa más que un rótulo: un rol solo se anula anulándolo explícitamente. Con `claude -p` el prompt de lanzamiento tiene que repetirlo (ver el anexo).

## Setup

**Working dir:** el del coordinador, que el subagente `ejecutora` hereda; la carpeta y los permisos de quien lo lanza son los suyos. Si la tanda necesita otra raíz u otro perfil, no cabe en un subagente: ver el anexo de `claude -p`. → [[orquestacion_sesiones_por_herramienta]]

**Dónde vive este contrato:** el plan y esta especificación viven **dentro del working dir**. El plan se versiona mientras vive, porque tiene que sobrevivir a `/clear` y a los relevos, y se retira con `git rm` al cerrar el trabajo ([[ciclo_de_tandas]], [[convencion_organizacion_carpeta_trabajo]]).

**Fase: `{{análisis | ejecución}}`** — si es ejecución y la tanda lleva análisis, **Plan de referencia:** `plan-tanda-{{NOMBRE}}.md`.

**Quién la ejecuta: `ejecutora`, o `ejecutora-mecanica` si la tanda es literal y no pide criterio.** El modelo, el esfuerzo y el tope de turnos los fija la definición del agente ([`plantilla-agente-ejecutora.md`](plantilla-agente-ejecutora.md)), no este contrato, y no se cambian a mitad: el cambio pierde la caché. La elección sale de [[modelo_por_tarea]]. Git: local, un commit por hito, por pathspec.

## Fase de análisis: el planificador (si la tanda la lleva)

Esta fase la hace el subagente `planificador`, según el ciclo de [[ciclo_de_tandas]]; su plan parte el trabajo en tandas y cada una de ellas es un contrato como este.

**Cuándo la lleva:** si la tanda **toca varios ficheros**, **estrena una forma de trabajo** que el asunto no tiene, o se apoya en **premisas sobre material que no has abierto tú**. Si no la lleva, escríbelo aquí: **"tanda de fase única declarada"** y por qué — saltársela es legítimo; saltársela en silencio, no.

**Si la tanda EDITA CÓDIGO, "fase única declarada" no existe: nunca se salta.** El pack `codigo/` lo hace incondicional ([`general/comun/packs/codigo/README.md`](../general/comun/packs/codigo/README.md) § "Plan antes de tocar código") — la excepción que el resto de este párrafo permite para otro tipo de material **no aplica aquí**, sea cual sea el tamaño de la tanda.

**Contrato del planificador:** **no modifica material, no commitea y deja el historial intacto.** Su **único** entregable de escritura es `plan-tanda-{{NOMBRE}}.md`, con estos apartados:

1. **Verificación en fuente primaria de CADA premisa de esta especificación, con el comando ejecutado y su salida.** No "se ha comprobado que": el comando y lo que devolvió. → [[verificacion_fuente_primaria]]
2. **Premisas de la especificación que resultan FALSAS**, listadas explícitamente. Es el apartado que hace útil el plan; **si está vacío, dilo vacío**.
3. **Inventario de lo que va a tocar**, con el perímetro.
4. **Decisiones que la especificación dejó abiertas sin darse cuenta** y hay que cerrar antes de empezar.
5. **Tabla de tandas, orden de pasos y riesgos**, incluido qué hacer si un paso falla a mitad.

**Y luego lo importante, que es tuyo:** lee el plan, **corrige tu especificación** con lo que haya destapado, y **solo entonces** lanza la primera tanda. El plan existe para que **tú arregles la especificación antes de que cueste trabajo**. Si no vas a leerlo, no lances la fase.

**Comprueba que fue read-only de verdad** (un comando, y llevas la cuenta): `git status --short` muestra solo el fichero de plan, y `HEAD` no se ha movido.

> **Y escribe el comando de cierre con el MISMO alcance que declaraste arriba** *(fallo real del coordinador, 2026-08-20)*. Una especificación excluía un fichero en su § Alcance y luego cerraba con un `grep` sobre `_meta` entero, donde ese fichero también vive: el recuento salió **6** contra las **4** exigidas y la tanda se dio por fallida sin serlo. **Lo que excluye el alcance hay que excluirlo también en el comando**, o el criterio miente. *(La ejecutora hizo lo correcto: lo reportó y paró en vez de ajustar el `grep` para que pasara.)* No se instala ninguna salvaguarda para forzarlo — se mide después.

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

**Etiqueta cada dato, sin excepción: `[MEDIDO]`** — con quién, con qué y cuándo — **o `[A CONFIRMAR]`**, para que la ejecutora lo verifique en vez de suponerlo. Si dudas de en cuál cae, es *a confirmar*. Un dato de apoyo erróneo **sobrevive al viaje** y quien lo recibe lo hereda como verificado. → [[verificacion_fuente_primaria]]

Si la tanda maneja datos de varias fuentes que pueden contradecirse (un informe y su contraste, una nota y el documento original), el contrato dice cuál gana: la fuente primaria o la verificación sobre la que dependa, y la medición propia por encima de las dos. Sin esa línea, la ejecutora se queda con la primera que lee.

**Y si el dato caduca, ponle la fecha: `[CADUCA AAAA-MM-DD]`.** El verificador **para el kit en rojo** cuando vence, así que no depende de que nadie se acuerde. Va sobre todo en dos sitios: los datos de **plataforma** (límites, precios, nombres de opciones, versiones) y **todo lo que dejes marcado como *a confirmar*** — ahí la fecha es *hasta cuándo es aceptable seguir sin comprobarlo*. Lo que sea conclusión propia medida contra su fuente **no lleva caducidad**.

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

> **Esto es la SEGUNDA capa.** Debajo hay un suelo que no se escribe aquí porque es igual para todas las tandas: el **DoD del vault** (`node _meta/dod.mjs`), que comprueba que el estado queda consistente para quien venga después — árbol limpio, efímeros retirados, techos, documentación al día. **Lo corre el coordinador**, que es quien ve el árbol entero. Lo de abajo es lo tuyo: el **producto** de esta tanda. → [[definition_of_done]]

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

**Límite del informe: 25 líneas como mucho.** Lo que devuelve una sesión hija entra íntegro en el contexto de quien la lanzó: el aislamiento protege del ruido intermedio, pero no de un informe verboso. Si no cabe, el detalle va a un fichero y el informe lo referencia. → [[orquestacion_sesiones_por_herramienta]]

Dentro de ese límite: la salida de `git status --short`, el output literal del comando de comprobación, los criterios de aceptación uno por uno con su evidencia, lo que no has hecho y por qué, y si algo de la tanda estaba mal o faltaba, dicho explícitamente: es lo que mejora la siguiente tanda. **No commitea: commitea el coordinador**, por pathspec, tras revisar el diff.

Una línea de constancia al arrancar: con qué modelo estás corriendo de verdad. El modelo y el esfuerzo los fija la definición del agente, no el contrato; la ejecutora no puede declarar su esfuerzo desde dentro (`/status` es un comando del cliente), así que no se le pide como criterio.

---

## Anexo: cuando la tanda tiene que ser `claude -p`

El camino normal es el subagente `ejecutora` ([[ciclo_de_tandas]]). Se recurre a `claude -p` solo si la tanda necesita **otra raíz**, **otro perfil** o es el plan B. El trabajo ocurre en un proceso aparte con contexto limpio, y la ejecutora escribe su informe en un `.md` ([[orquestacion_sesiones_por_herramienta]]).

**El `cd` del lanzamiento es lo que fija el working dir**: sin él, la hija se enraíza donde estés tú. **Una sesión `claude -p` no carga la definición del agente**, así que no trae la anulación de rol del coordinador y el prompt tiene que repetirla. Texto corto, tomado de `plantilla-agente-ejecutora.md`: "Eres la ejecutora de una tanda. Las reglas comunes de los `CLAUDE.md` que has cargado también son tuyas; las que dicen que coordinas, que delegas o que proteges tu contexto son del coordinador. Que la tanda sea larga no es motivo para delegarla: es el motivo por el que existes."

| Necesidad | Claude Code |
|---|---|
| Lanzar la ejecutora | `cd "<ruta>" && claude -p "<prompt>"` |
| Perfil (se pasa siempre) | `--settings inicializador/plantilla-settings-ejecutora.json` |
| Modo de permisos | `--permission-mode acceptEdits` |
| Informe de la tanda | `--verbose --output-format stream-json` |
| Nombre de la sesión | `--name "<nombre>"` |
| Directorio adicional (solo para LEER) | `--add-dir` |
| Tope de turnos y de gasto | `--max-turns`, `--max-budget-usd` |

```bash
cd "<RUTA_DEL_WORKING_DIR>" && claude -p "<anulación de rol, texto de arriba>. Ejecuta la tanda descrita en <spec>.md. Escribe tu reporte en informe-tanda.md" \
  --name "ejecucion-<nombre>" \
  --settings inicializador/plantilla-settings-ejecutora.json \
  --permission-mode acceptEdits \
  --add-dir "<solo lo que tenga que LEER fuera de su cwd>" \
  --max-turns 300 --max-budget-usd 60.00 \
  --verbose --output-format stream-json > salida.jsonl
```

Los topes son una referencia medida: pon los tuyos con margen del 100% sobre tu línea base, porque una tanda murió por `error_max_budget_usd` con el techo ajustado y morir a mitad sale más caro que el margen. Cada lanzamiento cuesta unos 42.000 tokens fijos aunque no haga nada.

**Nombre.** `--name` hace la sesión reconocible en el listado y reanudable por nombre; sin él, varias tandas del mismo asunto son indistinguibles. Las ejecutoras llevan `crossSessionInbound: "refuse"` a propósito, para que la tanda siga siendo verificable contra su especificación. Nombrar no abre el buzón, y el precio es ir a buscar el resultado al disco.

> **Trampas medidas al volver; todas hacen que una tanda vacía parezca buena** *(casos reales, 2026-08-14, 08-20 y 08-27)*:
>
> - **`subtype: success` no significa trabajo hecho.** Es el veredicto del runner, no del modelo: una ejecutora que no hizo nada de lo encargado devolvió `success`, y agotar la cuota devuelve éxito con salida vacía. **Comprueba el efecto en el disco, no el código de salida**, y por comando: `node _meta/comprobar-tanda.mjs <salida.json> <entregable>`. Verde significa "produjo algo", no "es correcto": eso lo dice leer el informe.
> - **Si la sesión no puede escribir su entregable, que pare y lo diga**, en vez de dejarlo donde caiga. Una tanda arrancó en modo plan sin que nadie lo pidiera, hizo la investigación completa, gastó su presupuesto y no pudo entregar.
> - **Fija el modo de permisos al lanzar**, no des por hecho el que traiga por defecto, y pasa siempre el perfil con `--settings`: sin él hereda el del coordinador, más amplio, con el canal entre sesiones abierto.
> - **El modo plan desvía el entregable.** Con `--permission-mode plan` la hija puede escribir su plan en `~/.claude/plans/` en vez de devolverlo. Si quieres un fichero de una sesión en modo plan, dale permiso de escritura acotado a ese fichero o recoge la salida por redirección.
> - **`--output-format json` no emite nada hasta que la tanda termina** *(medido el 2026-08-20)*: si el watchdog la corta, no queda ni un byte. Para una tanda que pueda pasar de unos minutos, usa `--verbose --output-format stream-json`.
> - **El watchdog que manda es el más corto de los dos.** Si tu llamante corta a los 10 minutos, poner 15 en el `timeout` no sirve. Si la tanda puede ser larga, lánzala en segundo plano.
> - **Una lista de permitidos concede, no restringe** *(medido: una hija con `--allowedTools "Read"` ejecutó Bash igualmente)*. Lo que protege son las deny rules del `settings.json` del directorio destino, que se resuelve por el directorio de trabajo exacto y no hereda del padre; después, `--max-turns`/`--max-budget-usd`, los hooks `PreToolUse` y el watchdog. Lo que quieras impedir, exprésalo como deny.

### Antes de usarla, comprueba

- **Que la sesión del agente está autenticada, y compruébalo en el propio agente, no en la tuya.** Sin ello no se lanza nada y la sesión padre no lo ve venir, porque se autentican por vías distintas. Se comprueba con `claude auth status` (JSON, no interactivo); se arregla con `claude auth login`, que es interactivo y lo hace el director. *(Medido el 2026-08-10: `loggedIn: false` mientras la sesión del coordinador funcionaba; la tanda murió en 1,3 segundos con 0 tokens.)*
- Que **`ANTHROPIC_API_KEY` no está definida**, ni como variable de entorno ni en un `.env` bajo el directorio de trabajo: si lo está, Claude Code la prioriza sobre la suscripción y factura por API en silencio.
- Que la barrera del destino está puesta: el `.claude/settings.json` con sus deny rules (ver [plantilla-settings-coordinador.json](plantilla-settings-coordinador.json)).
- Que pones los topes y un timeout o watchdog en el llamante: hay *silent-freeze* documentado al lanzar `claude -p` desde procesos de larga vida.
- Entradas grandes por ruta de fichero, nunca por stdin, y baja concurrencia: 1-2 ejecutoras, no un enjambre.

## Nota de trazabilidad

La conclusión de la que sale este documento —que cerrar mejor la especificación rinde más que automatizar el transporte— venía de un estudio interno del kit. **Ese estudio no viaja con la plantilla** (es evidencia de las rondas del vault de origen); el argumento y el dato se conservan aquí, en el cuerpo. Lo que se ha retirado es el anexo, no el razonamiento.

*(También se ha retirado del `## Setup` la línea de rama de trabajo y promoción entre entornos: el vault es **git local sin ramas de entorno**, así que no tiene equivalente. Si el asunto incluye software propio, eso vive en el pack `codigo/`.)*
