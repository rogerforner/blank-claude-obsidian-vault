# Plantilla de tanda ejecutora — specs grandes y autónomas

> **Para qué.** La palanca de mayor retorno para reducir el trasiego manual **no es automatizar el transporte, es hacer las tandas más grandes y autónomas**: una spec bien cerrada reduce a la vez los **relevos** y las **preguntas**. Esta plantilla es el **contrato** entre el coordinador y la sesión ejecutora. Rellena, **borra este bloque** y entrega. Formato: [[formato_prompts_markdown_limpio]]; frases en una línea continua, saltos solo en la estructura.
>
> **Regla de oro:** si la ejecutora tiene que **preguntar algo**, es que faltaba en la spec. Cada pregunta que recibas es *feedback* para mejorar la siguiente tanda.

## Setup

Working dir: `{{RUTA}}` (el contenedor del asunto, o una ruta relativa dentro de él). Modelo: `{{MODELO}}` (Opus 5 para lo difícil —un escrito con consecuencias, un cálculo que sostiene un importe—; Sonnet 5 para volumen; **fija modelo y `effort` al arrancar y no los cambies**: el cambio provoca cache-miss). Effort: `{{EFFORT}}`. Plan mode: `{{SÍ/NO}}`. Git: local, un commit por hito, por pathspec.

*(Si el material que hay que manejar roza el vocabulario de la seguridad informática —contraseñas, cifrado, credenciales, control de accesos— usa **Opus 5**: los clasificadores de seguridad pueden enrutar la petición a otro modelo, y el cambio de modelo rompe el hilo de trabajo. → [[modelo_por_tarea]])*

## Objetivo

{{Una o dos frases: qué debe existir al terminar que no exista ahora. En términos de resultado observable, no de actividad. "Existe el escrito de alegaciones con sus cinco anexos numerados", no "trabajar en las alegaciones".}}

## Alcance

**SÍ entra:** {{ficheros, carpetas o documentos exactos}}
**NO entra (no lo toques aunque lo veas):** {{lo que queda fuera. Los **originales recibidos o emitidos** están fuera SIEMPRE: no se editan, no se renombran, no se regeneran. Si hay que trabajar sobre uno, se trabaja sobre copia.}}

## Contexto verificado (para que no lo re-derives ni lo supongas)

{{Hechos ya confirmados con su ubicación: fichero y línea, número de expediente, fecha del sello, importe y de qué documento sale, nombre del organismo. Marca explícitamente lo que sea "a confirmar" para que la ejecutora lo verifique en lugar de asumirlo.}} → [[verificacion_fuente_primaria]]

## Decisiones ya tomadas (NO las reabras)

{{Las decisiones ya cerradas —de fondo, de forma, económicas o jurídicas— para que la ejecutora no vuelva a plantearlas ni pida confirmación. Esto es lo que más reduce las preguntas.}}

## Criterios de aceptación (el contrato)

{{Lista verificable, en términos de resultado observable. Cada punto debe poder comprobarse con un comando o un cotejo, no con una opinión.}}

Ejemplos de cómo se escribe un criterio **comprobable** en un asunto:

- "La suma de la columna *importe* de las 37 facturas de `docs/facturas/` da 12.480,55 € y **coincide** con el total que figura en el escrito", no "revisar que las cuentas cuadran".
- "El PDF generado abre, tiene **14 páginas** y los cinco anexos citados existen como fichero en `docs/anexos/`", no "generar el PDF".
- "Cada fecha del cronograma sale de un documento de `docs/` **citado por nombre de fichero**", no "poner las fechas bien".
- "Ningún enlace interno del expediente apunta a un fichero inexistente", no "revisar los enlaces".

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

Qué has hecho y **dónde** (ficheros y commits). El **output literal** de los comandos de la definition of done. Los criterios de aceptación, **uno por uno**, con la evidencia de que se cumplen. Lo que **NO** has hecho y por qué. Hallazgos y decisiones que tomaste tú. Y si algo de la spec estaba mal o faltaba, **dilo explícitamente**: es lo que mejora la siguiente tanda.

---

## Variante headless (para que la lance el coordinador, sin trasiego del director)

Cuando la tanda está bien cerrada, el coordinador puede **lanzarla él mismo** y recoger el resultado sin intermediario ([[orquestacion_sesiones_por_herramienta]]). El contrato es este mismo fichero; la ejecutora escribe su informe en un `.md` y el coordinador lee solo el extracto. El trabajo ocurre en un **proceso aparte con contexto limpio**, así que "coordinar ≠ ejecutar" se mantiene intacto.

```bash
claude -p "Ejecuta la tanda descrita en <ruta-de-esta-spec>.md. Escribe tu reporte en <ruta>/informe-tanda.md" \
  --allowedTools "Read,Edit,Bash(git add:*),Bash(git commit:*)" \
  --permission-mode dontAsk \
  --max-turns 30 --max-budget-usd 3.00 \
  --output-format json
```

### ⚠ `--allowedTools` **CONCEDE, no restringe**

**Es una lista ADITIVA, no una lista blanca exclusiva**, y `--permission-mode dontAsk` significa *"no preguntes"*, **no** *"deniega lo no listado"*. Medido, no supuesto: una sesión hija lanzada con `--allowedTools "Read"` (sin `Bash`) **ejecutó Bash igualmente**. Se sigue pasando el flag porque **documenta la intención**, pero **no lo cuentes como barrera**.

**Lo que SÍ protege, por orden:**

1. **Las deny rules del `settings.json` del directorio destino** — la hija las respeta y **no las puede saltar**; aguantan incluso bajo el flag de permisos amplios. Son la única barrera real. **Lo que quieras impedir, exprésalo como DENY, nunca como ausencia del allow.**
2. **`--max-turns` y `--max-budget-usd`** — cortacircuitos duros, obligatorios.
3. **Los hooks `PreToolUse`** — corren al margen del modo de permisos.
4. **El watchdog/timeout del llamante.**

### Antes de usarla, comprueba

- Que **`ANTHROPIC_API_KEY` NO está definida**. Si lo está, Claude Code la prioriza sobre la suscripción y **factura por API en silencio**.
- Que el `.claude/settings.json` del directorio destino tiene sus **deny rules** puestas (ver [plantilla-settings-coordinador.json](plantilla-settings-coordinador.json)): los originales del asunto, los almacenes de credenciales de la máquina, el catálogo `general/` en solo lectura, y los comandos que sacan algo fuera.
- Que pones **`--max-turns` y `--max-budget-usd`** como cortacircuitos.
- Que hay un **timeout/watchdog en el llamante**: hay *silent-freeze* documentado al lanzar `claude -p` desde procesos de larga vida.
- **Entradas grandes por ruta de fichero**, nunca por stdin.
- **Baja concurrencia: 1-2 ejecutoras**, no un enjambre. Un enjambre reduce el trabajo útil semanal de una persona sola.

## Nota de trazabilidad

La conclusión de la que sale esta plantilla —que cerrar mejor la spec rinde más que automatizar el transporte— venía de un estudio interno del kit. **El estudio no viaja en el seed** (es evidencia de las rondas del vault de origen); el argumento y el dato se conservan aquí, en el cuerpo. Lo que se ha retirado es el anexo, no el razonamiento.

*(También se ha retirado del `## Setup` la línea de rama de trabajo y promoción entre entornos: el vault es **git local sin ramas de entorno**, así que no tiene equivalente. Si el asunto incluye software propio, eso vive en el pack `codigo/`.)*
