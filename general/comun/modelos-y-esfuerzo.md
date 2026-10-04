---
name: Modelos y nivel de esfuerzo — catálogo, curvas y tabla de situaciones
description: Documento de REFERENCIA (no doctrina) con los hechos de plataforma que cambian solos: qué modelos hay, qué niveles de esfuerzo admite cada uno, cuánto rinde cada nivel, qué cuesta cambiar de modelo o de esfuerzo a media sesión, y la tabla situación → modelo → esfuerzo. Lo consulta el coordinador antes de repartir trabajo y el director antes de abrir una sesión. El CRITERIO vive en [[modelo_por_tarea]]; aquí viven los DATOS y su origen.
type: knowledge
version: 2.0
caduca: 2026-12-31
---

# Modelos y nivel de esfuerzo — referencia consultable

**Esto no es doctrina: son hechos de plataforma, y como tales caducan.** El criterio de reparto —qué propiedad de la tarea decide la gama— vive en [[modelo_por_tarea]] y **no se repite aquí**. Aquí viven los datos que ese criterio necesita, con su origen y su fecha, porque son justo lo que cambia solo.

**Para quién.** Para las dos partes: el **coordinador** lo consulta antes de repartir trabajo o escribir un contrato de tanda; el **director** lo consulta antes de abrir una sesión o de escribir un prompt. Los gestos concretos de arranque están en [la guía de arranque de sesiones](../../_meta/guia-arranque-sesiones.md).

**Cómo se refresca.** Este documento **se actualiza por tandas periódicas**, no por goteo. Lleva `caduca:` en el frontmatter: **cuando esa fecha vence, el verificador deja el kit en rojo** y la sesión siguiente se entera al arrancar. Ese es el mecanismo — no hay que acordarse. Al refrescar: se sube `version`, se mueve `caduca`, se anota qué cambió en el pie, y **se propaga a la plantilla en el mismo commit** (vive en `general/`, así que la puerta de cierre lo exige).

---

## 0. Cómo se lee este documento sin equivocarse

**Tres reglas de lectura. Las tres importan y las tres son fáciles de saltarse.**

**1. El nombre del nivel NO es una unidad de medida.** `high` significa cosas distintas entre familias y entre versiones de la misma familia. Está documentado por el fabricante: *"Effort is a behavioral signal, not a strict token budget"*. El `medium` de Sonnet 5 se describía como *"comparable to Sonnet 4.6 at high effort"* — mismo nombre, dos significados — y el `high` de Opus 5.5 no es el `high` de Opus 5 (§2). Además cada modelo admite un subconjunto distinto de niveles, y **hay modelos que no admiten ninguno**.

> **Consecuencia: las tablas de este documento se leen HACIA ABAJO dentro de un modelo, y CELDA A CELDA entre modelos. Nunca en horizontal por nivel.** Decir *"el `high` de una gama equivale al `high` de otra"* es inventarse una equivalencia que no existe.

**2. Cada dato lleva su origen, y casi ninguno es "medido" en el sentido de este vault.** Aquí *medido* significa comprobado en esta máquina, y **solo una celda lo es** (el esfuerzo que aplica el perfil, §1). Marcadores:

| Marca | Significa |
|---|---|
| `[MEDIDO]` | comprobado en esta máquina, con fecha |
| `[OFICIAL]` | documentación o anuncio del fabricante |
| `[TERCERO]` | plataforma de evaluación independiente |
| `[COMUNIDAD]` | blogs, foros, incidencias públicas |
| `[INFERIDO]` | deducido, no publicado por nadie |
| `[POR MEDIR]` | falta el dato; no se supone |

**3. Todo esto llega por informe y contraste, no por la fuente primaria de Claude Code.** Los datos proceden del informe de investigación del **2026-10-04** y de su contraste del mismo día (los dos se retiraron de `_meta/` tras fundirse aquí; están en el historial de git), que comprobó el informe contra **seis páginas oficiales de la API** (guías de prompting de Opus 5.5, Sonnet 5.5 y Fable 5.1, buenas prácticas, resumen de modelos y elegir modelo). **Son páginas de la API, no de Claude Code**: lo que dicen del esfuerzo o de la caché describe la API, y para este cliente hay que medirlo aquí. Los índices de Artificial Analysis, las cuotas y los alias de Claude Code **no están contrastados**: son del informe. Donde informe y contraste chocan, gana el contraste; donde hay medición propia, gana la medición. Mientras no se lea la fuente primaria de Claude Code, este documento **está respaldado por informe** — respaldo legítimo si se declara, y aquí queda declarado.

---

## 1. Catálogo de modelos

*Origen: `[OFICIAL]` para ids, precios y ventanas (contrastados con el resumen de modelos de la API); `[TERCERO]` para el índice. Informe del 2026-10-04.*

**La escala del índice NO es la de septiembre.** Es el Intelligence Index de Artificial Analysis **v4.3.2**, a su nivel máximo y con el *fallback* por defecto de Anthropic activado. En v4.3.2 Opus 5 a `max` puntúa 51 y Sonnet 5 a `max` 38, frente a los 63 y 55 de las lecturas de septiembre (v4.1.1). **Ninguna cifra de septiembre se puede comparar con estas**, y por eso se han quitado todas.

| Modelo | Índice a `max` (v4.3.2) | Precio entrada/salida por MTok | Contexto / salida | Niveles de esfuerzo y defecto |
|---|---|---|---|---|
| **Fable 5.1** (`claude-fable-5-1`) | 53 | $10 / $50 (lectura de caché $0,25) | 1M / 128K | low–max; `high` por defecto en la API |
| **Opus 5.5** (`claude-opus-5-5`, 2026-09-22) | **58** (57,6) | $4 / $20 (caché $0,20) | 1M / 128K *(300K solo en la Batch API, beta: no cuenta)* | low, medium, high, xhigh, max; **API: `medium`**; **en este cliente con `effortLevel: "high"`, se aplica `high`** `[MEDIDO 2026-10-04]`; pensamiento adaptativo siempre activo |
| **Sonnet 5.5** (`claude-sonnet-5-5`, 2026-09-28) | **56** (56,0) | $2 / $10 (caché $0,20) | 1M / 128K | low, medium, high, xhigh, max; API: `high`; **por defecto en Claude Code sin ajuste: `[POR MEDIR]`** (el informe dice `medium`, el contraste no lo confirma) |
| Haiku 4.5 — **fuera del método** | sin dato en v4.3.2 | $1 / $5 | **200K** / 64K | **NINGUNO** |
| *Opus 5 (legado)* | 51 | $5 / $25 *(del informe; el contraste no lo verifica)* | 1M / 128K | low–max; `high` por defecto en la API |
| *Sonnet 5 (legado)* | 38 | $2 / $10 *(del informe; el contraste no lo verifica)* | 1M / 128K | low–max; `high` |

Fechas de salida, Fable en el plan y consumo de cuota son del informe; el contraste confirma ids, precios, ventanas, caché y los defectos de la API.

**Lo que hay que retener de esta tabla, y no es el ranking:**

- **El esfuerzo del perfil, medido.** El informe afirma que Opus 5.5 ignora el `effortLevel` antiguo y arranca en `medium`. **Es falso para este cliente:** el 2026-10-04, cinco sesiones con Claude Code 2.1.289 y `effortLevel: "high"` mostraron *"Opus 5.5 with high effort"* `[MEDIDO]`. `medium` es el defecto **de la API**. La documentación no dice nada de `effortLevel` ni de `modelSettings`, y su consejo —fijar el esfuerzo explícitamente— es compatible con la medición.
- **Haiku 4.5 sale del método y no tiene parámetro de esfuerzo.** Usa un presupuesto de razonamiento fijo: *"Haiku a `low`"* es incorrecto, no hay nada que poner. `[TERCERO]` **+ comprobado por el director probándolo el 2026-09-02.** Es el único con contexto de 200K y salida de 64K.
- **Fable cuesta 2,5 veces Opus 5.5 por token** (10/50 frente a 4/20) y **conserva el tope del 50 % del semanal en Max** `[OFICIAL, vía informe; el contraste no lo cubre]`.
- Los precios de la API valen aquí **solo como coste relativo entre modelos**: este vault opera por suscripción y **la API está prohibida**.

**Inclusión en el plan y límites** `[OFICIAL, vía informe; sin contrastar]`:

- Opus 5.5 y Sonnet 5.5 entran en los límites del plan sin créditos. Opus 5.5 es el modelo por defecto en los planes de pago desde la v2.1.280.
- **No hay ninguna proporción oficial de consumo entre Opus 5.5 y Sonnet 5.5**: el centro de ayuda solo dice que Opus cuesta varias veces más por turno que Sonnet. La única cifra oficial compara Opus 5.5 con Opus 5: *"priced lower than Opus 5, so your 5-hour and weekly limits go 25% further"*.
- Claude Code tiene **límites semanales propios por familia** además del compartido (*"You've hit your Opus limit"*, *"You've hit your Sonnet limit"*; `seven_day_opus` y `seven_day_sonnet` en el SDK). **Su tamaño no se publica.**
- El 2026-09-22 subieron los límites de 5 horas en Pro, Max y Team: Anthropic no da porcentaje (el 20 % lo dan medios) `[COMUNIDAD]`. El estado real de la cuota de este vault sigue sin medirse desde 2026-08-28: ver §6.2.

### 1.1 Retiradas anunciadas — lo que caduca antes que este documento

*`[OFICIAL]`. El fabricante da 60 días de aviso mínimo.*

- **Haiku 4.5: retirada tentativa el 2026-10-15** (el resumen de modelos dice *"no antes del 15 de octubre de 2026"*). **Haiku 4.5 sale del método**, y esa fecha es la razón de hacerlo ahora. Haiku 5.5 está anunciado, sin fecha y sin salir a 2026-10-04 `[COMUNIDAD, vía informe]`. **[CADUCA 2026-10-15]**
- **Sonnet 4.5: 2026-11-30**, con `claude-sonnet-5-5` como sustituto `[OFICIAL, vía informe]`. No lo usamos.
- Los que sí usamos aguantan, **no antes del**: Fable 5.1 2027-09-01, Opus 5.5 2027-09-22 y Sonnet 5.5 2027-09-28 (los tres, en el resumen de modelos). Del legado, según el informe y sin contrastar: Opus 4.8 2027-05-28, Sonnet 5 2027-06-30 y Opus 5 2027-07-24.
- El informe decía *"ninguna retirada de los modelos en uso"*: **es falso**, por Haiku 4.5.

---

## 2. Las curvas de esfuerzo — el dato central

*Origen: `[TERCERO]`, Artificial Analysis Intelligence Index **v4.3.2**, leído 2026-09-22 a 09-29 y revisado el 2-oct; el coste por pasada completa sale de un agregador (tokencost.app) que lee esos datos. **Escala distinta de la de septiembre: no se compara con ella** (§1). Solo hay curva completa para dos modelos, y miden a precio de API, no a consumo de cuota: que ambos coincidan es `[INFERIDO]`.*

| Nivel | Opus 5.5: índice | $ por tarea | $ por pasada completa | Sonnet 5.5: índice | $ por tarea | $ por pasada completa |
|---|---|---|---|---|---|---|
| `low` | 42,3 | 0,55 | 860 | 35,8 | 0,41–0,42 | 544 |
| `medium` | 51,2 | 1,34 | 1.627 | 40,7 | 0,59 | 701 |
| `high` | 53,6 | 1,82 | 2.172 | 46,7 | 1,08 | 1.176 |
| `xhigh` | 56,0 | 3,46 | 4.057 | 51,9 | ≈2,2–2,5 `[INFERIDO]` | 2.738 |
| `max` | 57,6 | 5,98 | 8.708 | 56,0 | 7,67 (7,60 en la primera lectura) | 8.977 |

**Fable 5.1: solo `max` (53) en v4.3.2. No hay curva publicada** y se ha quitado la de septiembre. Su coste por tarea en esta escala es `[POR MEDIR]`: el informe da "unos 3,76 $", que es la cifra de septiembre y no se propaga.

**Lo que leer de la curva de Opus 5.5:**

1. **Cuatro de sus cinco niveles están en la frontera de Pareto** entre inteligencia y coste: *"Opus 5.5 max, xhigh, high, and medium all sit on the Pareto frontier"* `[TERCERO]`.
2. **El salto grande sigue estando abajo:** de `low` a `medium`, +8,9 puntos por 0,79 $.
3. **De `xhigh` a `max`: 1,6 puntos por 2,52 $ más.** `max` sigue sin compensar — decisión del director del 2026-09-02, ahora con su número en la escala nueva. De `high` a `xhigh`: +2,4 puntos por 1,64 $.
4. **Opus 5.5 `high` (53,6) supera a Fable 5.1 `max` (53)**, y `xhigh` (56,0) la supera con holgura. Por eso la escalada a Fable necesita comparar antes con Opus 5.5 `xhigh`. La documentación de la API lo dice igual: pasar a Fable si `xhigh` o `max` se quedan cortos `[OFICIAL]`.

**"Opus 5.5 piensa más por turno", con su matiz.** Anthropic dice que tiende a pensar más por turno que Opus 5, *"especialmente con `xhigh` y `max`"* `[OFICIAL]`: el `high` de Opus 5.5 no es el `high` de Opus 5. Pero la misma página dice que genera más de un 30 % más rápido, que `medium` iguala o supera a Opus 5 en `high` y que *"tiende a terminar la misma tarea con menos tokens"*.

> **Consumo total por tarea: fuentes en conflicto, sin resolver.** Artificial Analysis mide para Opus 5.5 `max` unos 119k tokens de salida por tarea frente a unos 73k de Opus 5 `max` `[TERCERO]`; Anthropic dice lo contrario `[OFICIAL]`. No se escribe ninguna regla que dependa de cuál tenga razón.

### Sonnet 5.5 frente a Opus 5.5, celda a celda

| Para igualar a… | Sonnet 5.5 necesita… | Coste por pasada completa | Lectura |
|---|---|---|---|
| Opus 5.5 `medium` (51,2) | `xhigh` (51,9) | 2.738 frente a 1.627 → **×1,7** | Subirle el esfuerzo a Sonnet sale más caro que usar Opus |
| Opus 5.5 `high` (53,6) | `max` (56,0) | 8.977 frente a 2.172 → **×4,1** | Lo mismo, con 854 s por tarea frente a 216 s |
| Opus 5.5 `xhigh` (56,0) | `max` (56,0) | 8.977 frente a 4.057 → **×2,2** | Mismo resultado al doble de coste |
| Opus 5.5 `low` (42,3) | entre `medium` (40,7) y `high` (46,7) | `medium` un 18 % más barato y 1,6 puntos menos; `high` un 37 % más caro y 4,4 más | Única zona en la que Sonnet compite |

*(`[INFERIDO de TERCERO]`; la latencia es `[TERCERO]`.)*

**La verbosidad de Sonnet no ha desaparecido: se ha concentrado arriba.** En `max`, Sonnet 5.5 gasta unos 193.000 tokens de salida por tarea, *"the highest token use we have measured, around 60% higher than Opus 5.5 (max) or Sonnet 5 (max)"* `[TERCERO]`. En `medium` y `high` ya no es verboso. **Sonnet 5.5 solo es la opción más barata para su puntuación en `high`** (46,7 por 1.176): ninguna celda de Anthropic llega a esa nota por menos dinero.

> **REGLA, que los datos de la 5.5 mantienen: para pensar más se sube de MODELO, no de esfuerzo. Sonnet 5.5 se usa en `low`, `medium` o `high`; no en `xhigh` ni en `max`.** Si una tarea pide más que eso, la respuesta es Opus 5.5, no Sonnet a tope.

**Matiz del contraste.** La documentación dice que ajustar el esfuerzo suele ser mejor palanca que cambiar de modelo. Eso vale para Sonnet frente a Opus **solo hasta `high`**, y no es principio general: dentro de Opus 5.5 la ruta es `xhigh` o `max` y, solo después, Fable.

**Rigor.** Todo es índice compuesto y coste de API. **En trabajo de conocimiento largo hay empate técnico** (GDPval-AA 1844 frente a 1846, *"parity with Opus 5.5, albeit with significantly higher token usage"* `[TERCERO]`), en inglés y sin datos en español; en trabajo abierto que exige juicio sostenido, Anthropic dice que Opus sigue siendo *"claramente más fuerte"* `[OFICIAL]`, que además tiene interés en venderlo.

Regla práctica de fondo:

> **Sube el ESFUERZO cuando el cuello de botella es pensar. Sube de MODELO cuando el cuello de botella es saber o escribir bien.**

### Cuándo subir el esfuerzo EMPEORA el resultado

*`[OFICIAL]` + literatura académica.* Está documentado que alargar el razonamiento **degrada** la precisión en cierto tipo de tareas — *inverse scaling*. El modo de fallo descrito: el modelo **se distrae cada vez más con información irrelevante**. Las categorías afectadas son tareas de conteo con distractores, regresión con rasgos espurios y deducción con seguimiento de restricciones.

**Traducción operativa:** en tareas simples, de patrón obvio o de salida estructurada, `max` y `xhigh` no solo malgastan tokens — **pueden dar peor respuesta**. La documentación del fabricante lo recoge directamente para salida estructurada.

**Y con Sonnet 5.5 está medido en `max`.** En FrontierCode 1.1 saca un 46,2 % en `max` y un 52,1 % en `xhigh`: según Anthropic, en `max` lanzaba más a menudo una revisión de código con varios subagentes y se salía del alcance de la tarea. Cuesta 20,78 $ por tarea, frente a 6,19 $ de Opus 5.5 en `max` (54,4 %) `[OFICIAL, costes vía TERCERO]`. El contraste confirma el patrón de forma cualitativa: en `xhigh` y `max` es *"especialmente exhaustivo"* y lanza revisiones por su cuenta. Un caso de la comunidad (Simon Willison): en `max` pensó hasta agotar los 128.000 tokens de salida, facturó 1,28 $ y no devolvió nada; el mismo encargo en `xhigh` terminó en 41 segundos por menos de seis céntimos `[COMUNIDAD, un solo caso]`. **En Opus 5.5 no se ha encontrado ninguna regresión publicada** `[—]`.

---

## 3. Cambiar de modelo o de esfuerzo a media sesión

*`[OFICIAL]`, salvo donde se indique. Las páginas contrastadas son de la API: lo que dicen de la caché describe la API, y para Claude Code hay que medirlo aquí.*

### 3.1 La caché por modelo y por esfuerzo, y por qué la regla se queda

Citas de la documentación (versión de septiembre; la del modelo sigue vigente, la del esfuerzo se matiza justo debajo):

> *"Model: each model has its own cache. Switching models recomputes the entire request even when the content is identical."*
>
> *"Effort level: each effort level has its own cache for the same model. Changing effort mid-session recomputes the entire request."*

**Cambiar de modelo reprocesa el contexto entero.** Las seis páginas contrastadas no tratan este punto (el contraste lo marca "NO LO DICE"); la cita de arriba y el informe `[OFICIAL, vía informe]` lo sostienen, y también el cambio de modo de `opusplan` y el cambio automático por seguridad (§3.4).

**Cambiar de esfuerzo: lo que dicen las fuentes, sin mezclarlas.**

- **API** `[OFICIAL, contrastado 2026-10-04]`: cambiar el `effort` de nivel superior entre peticiones invalida la caché de prompts. Solo el cambio por mensaje (beta, cabecera `mid-conversation-output-config-2026-07-01`) la conserva, y en Sonnet 5.5 no vale con `between_tools`. Es solo de la API, que aquí está prohibida.
- **Claude Code**: el informe cita la documentación del cliente diciendo que en Opus 5.5, Sonnet 5.5 y Fable 5.1 cambiar el esfuerzo conserva la caché `[OFICIAL, vía informe; el contraste no lo cubre]`. Ninguna sesión de este vault lo ha medido: `[POR MEDIR]`. No se da por cierto ni en un sentido ni en el otro.

> **DECISIÓN DEL DIRECTOR (2026-09-02), que se mantiene: el esfuerzo NO se cambia a media sesión, en ningún modelo.** Si hace falta otro esfuerzo: se pide el relevo, se hace `/clear` y se arranca de nuevo con el que toque. El informe proponía reabrirla porque la caché por esfuerzo ya no invalidaría; el contraste lo desmiente para la API y para Claude Code no hay medición, así que la regla y su motivo siguen en pie.

**El motivo es de diseño y no depende de cómo salga esa medición:** una excepción que depende de la versión del cliente, de un modelo concreto y de una beta es una regla que a veces se cumple, y las que a veces no se cumplen fallan el día que importa. Trabajar siempre igual gana a trabajar óptimamente a veces. A eso se suman dos costes que no dependen del esfuerzo: cambiar de modelo reprocesa siempre, y en Fable 5.1, Opus 5.5 y Sonnet 5.5 los bloques de pensamiento valen solo en la conversación exacta que los produjo `[OFICIAL, contraste :54]`. El gesto alternativo es barato: `/clear` no cuesta nada y el estado vive en ficheros que la sesión nueva relee.

**Lo mismo vale para `system` y `tools`.** Cambiar el fichero de reglas (`CLAUDE.md`), los hooks o las herramientas a mitad de una tanda larga invalida caché y bloques de pensamiento `[OFICIAL, contraste :54]`: esos cambios se hacen entre tandas, no dentro de una.

### 3.2 Lo que cuesta, en números

*Sesión de 150k de contexto en Opus 5.5. Aritmética directa con la lectura de caché contrastada (0,20 $/MTok) y con los múltiplos de escritura de la documentación anterior (1,25× a 5 minutos, 2× a una hora), que no se han recontrastado para la 5.5 `[INFERIDO]`.*

| Qué haces | Coste de ese turno |
|---|---|
| Nada: turno normal con caché caliente | **~$0,03** |
| Cambias modelo (caso general) | **~$0,75** a TTL de 5 min · **~$1,20** a TTL de 1 h |

**Entre 25 y 40 veces más caro**, pagado una sola vez tras el cambio (la cifra de septiembre, 12 a 20 veces, era de Opus 5 y de otro precio de caché). Escribir en caché cuesta más que la entrada normal, y por eso cada invalidación en una sesión larga duele.

### 3.3 El contraejemplo que corrige la intuición

> *"Si estás a 100k tokens de conversación con Opus y quieres hacer una pregunta fácil, sería MÁS caro cambiar a Haiku que dejar que responda Opus, porque habría que reconstruir la caché."* `[OFICIAL, versión de septiembre]`

Haiku ya no está en el método, pero el argumento vale para cualquier modelo más barato: en ese turno el barato sale más caro que el que ya está caliente. Por tanto: **para una subtarea barata, lanza un subagente y no cambies el modelo del bucle principal.** Es lo que [[modelo_por_tarea]] ya manda; aquí queda el motivo que lo respalda.

### 3.4 Cambios de modelo que no decides tú

**El cambio automático por seguridad ES un cambio de modelo**, y arranca caché nueva. Cuando un clasificador marca una petición, esta se reejecuta en un modelo de respaldo y la sesión continúa allí `[OFICIAL, vía informe; sin contrastar]`:

| Modelo | Tema marcado | Respaldo |
|---|---|---|
| Opus 5.5 | ciberseguridad | Opus 4.8 |
| Opus 5.5 | biología; desarrollo de modelos de frontera | Opus 5 |
| Opus 5.5 | extracción del razonamiento (destilación) | bloqueo, sin respaldo |
| Sonnet 5.5 | ciberseguridad | Sonnet 5 `[OFICIAL vía COMUNIDAD]` |

- **El respaldo conserva el esfuerzo** de la petición señalada y es de alcance de sesión: volver al modelo original es otro cambio, o sea otra reescritura.
- **En un subagente no se ve.** La incidencia #97687 documenta un subagente que pidió `model: "opus"` y siguió 321 llamadas en `claude-opus-4-8` tras un rechazo de ciberseguridad, mientras el informe del padre seguía diciendo "Opus" `[COMUNIDAD, con registro reproducible]`. Un informe de subagente no prueba qué modelo corrió: si importa, se mira la transcripción.
- **Se puede pausar en vez de cambiar:** el cambio automático se desactiva en *Config > MODEL & OUTPUT* y la conversación se pausa `[OFICIAL, vía informe]`. Activarlo o no en cada perfil es decisión del director: `[POR MEDIR]` qué hace en una sesión desatendida.
- **Fable 5.1 y su enrutado:** la regla de septiembre decía que Fable reejecuta en Opus y que, para material que roce esos temas, lo mejor es ir directo a Opus. El informe de octubre no trae la tabla de respaldos de Fable: la regla se mantiene sin recontrastar.

---

## 4. Higiene de contexto: `/clear`, `/compact`, `/rewind`

*`[OFICIAL]` + `[COMUNIDAD]` reproducible.*

| Gesto | Qué cuesta | Cuándo |
|---|---|---|
| **`/clear`** | **Nada.** *"It sends no request, so it costs nothing"* | **Entre tareas distintas.** Es el gesto por defecto al cambiar de tarea |
| **`/compact`** | Barato con caché caliente; **caro con caché fría** (reprocesa todo sin cachear) | **Dentro de una misma tarea**, cuando el contexto se llena |
| **`/rewind`** | Trunca a un prefijo ya cacheado; no reconstruye | Cuando quieres **abandonar un camino** que no llevaba a ningún sitio |

**La regla que resume las tres:**

> **`/clear` entre tareas, `/compact` dentro de una tarea.**

**Y el motivo por el que arrastrar contexto no es gratis aunque esté cacheado:** se **re-lee en cada turno**, y en sesión larga eso domina la factura. El coste acumulado crece **de forma cuadrática con el número de turnos**, porque el contexto crece y se reenvía entero cada vez. **El contexto que llega pronto es el más caro**: se re-lee en todos los turnos posteriores.

**Empezar tarea nueva con `/clear` sale más barato que arrastrar el contexto anterior aunque esté cacheado.** Al reanudar una sesión vieja, `/clear` sale más barato que `/compact`.

**Y el matiz que corrige la intuición contraria:** con caché caliente, **dos horas seguidas en una sesión suelen costar menos que partir el mismo trabajo en cuatro sesiones**, porque cada arranque en frío paga una reescritura completa. **El disparador de reset no es "llevo X horas abierto": es "tarea completada" o "a punto de compactar".**

**Tiempo de vida de la caché:** la conversación principal usa **1 hora**; los subagentes y todo lo demás, **5 minutos**. *(Documentación de septiembre, sin recontrastar.)*

---

## 5. Tabla situación → modelo → esfuerzo

**Para quien abre la sesión.** El criterio que hay detrás está en [[modelo_por_tarea]]; esta tabla es su aplicación a situaciones concretas. Las tandas y la mecánica corren como subagentes cuyo modelo y esfuerzo se fijan en su definición (`.claude/agents/`), no en el prompt.

| Situación | Modelo | Esfuerzo | Por qué |
|---|---|---|---|
| **Coordinar** jornada larga, varias tandas | Opus 5.5 | `high` | Coherencia de horizonte largo. Fijar al arrancar y no cambiar |
| **Auditar o revisar a fondo**, **investigar con herramientas** | Opus 5.5 | `xhigh` | Cobertura exhaustiva y búsqueda agéntica: aquí el esfuerzo sí compensa. `max` no (§2) |
| **Escribir doctrina o método** | Opus 5.5 | `high` | Gana el conocimiento y la redacción, no más razonamiento `[informe :122]` |
| **Planificar** una tanda no trivial (refutar premisas) | subagente `planificador` | el modelo es Opus, fijado en su definición; el esfuerzo es el de la sesión | Detectar errores pide capacidad, no generación. Sin `effort:` en su frontmatter hereda el de la sesión `[MEDIDO 2026-10-04]` |
| **Tandas**: ejecutar un plan revisado | subagente `ejecutora` | Sonnet 5.5, `medium` fijado en su definición | El contrato ya fija el resultado; subir esfuerzo solo añade tokens. Un `effort:` en el frontmatter de un subagente se respeta `[MEDIDO 2026-10-04]` |
| **Mecánica**: cambios literales, copiar, mover | subagente `ejecutora-mecanica` | Sonnet 5.5, `low` fijado en su definición | Patrón obvio: subir esfuerzo no mejora y puede empeorar. Sonnet 5.5 `low` (35,8) cuesta 0,41 $ por tarea (§2) |
| **Consultor** de solo lectura | Sonnet 5.5 | `medium` | Leer y contestar. Pedirle que consulte el fichero aunque esté seguro: de memoria acierta menos que Opus `[TERCERO, vía informe]` |
| **Brief para el chat web** | el capaz | `xhigh` | Allí no hay perfil: se elige a mano. `max` tampoco ahí |
| **Escalada** en tarea agéntica larga | Fable 5.1 | `high`, edición quirúrgica | Solo tras comparar con Opus 5.5 `xhigh`, que supera a Fable `max` (§2). Fable con `xhigh` o `max` puede redactar el entregable en el pensamiento y repetirlo `[OFICIAL, contraste :53]` |

**Dos reglas que la tabla aplica, y no se repiten fila a fila.** Para pensar más se sube de modelo y no de esfuerzo, dentro de lo que dice el matiz de §2: Sonnet 5.5 solo llega a `high`. Y el esfuerzo se regula con el parámetro, no con frases del tipo "piensa poco" en el fichero de reglas: bajar el esfuerzo reduce el pensamiento de forma más fiable que una instrucción `[OFICIAL, contraste :46]`.

**Lo que cambió respecto a septiembre.** La fase de análisis dejó de ser una fila con modelo y esfuerzo y pasó a ser el subagente `planificador`; las tandas pasaron de sesiones `claude -p` a subagentes `ejecutora`. El motivo de entonces se conserva: subirle el esfuerzo a Sonnet para refutar premisas era el error, y la respuesta era cambiar de modelo. La fila de subagentes de lectura con Haiku desaparece con el modelo.

---

## 6. Dos avisos operativos que ahorran dinero y disgustos

### 6.1 Qué manda cuando hay varios sitios que fijan modelo o esfuerzo

**Modelo de un subagente** `[MEDIDO 2026-10-04]`:

- El parámetro `model` de la llamada a Agent gana a `CLAUDE_CODE_SUBAGENT_MODEL`.
- El `model` del frontmatter de la definición también pisa a esa variable.
- La variable es solo el modelo por defecto de un subagente que no declara ninguno. Por eso las tres definiciones del kit fijan `model` en su frontmatter y no dependen de ella.
- Entre el parámetro de la llamada y el `model` del frontmatter: `[POR MEDIR]`, no se midió.
- Al cambiar con `/model`, el cambio llega también a los subagentes que heredan el modelo `[OFICIAL, vía informe]`.

**Esfuerzo de un subagente** `[MEDIDO 2026-10-04]`: el `effort:` del frontmatter se respeta; sin él, el subagente hereda el de la sesión.

**Esfuerzo de una sesión.** Orden de precedencia, de más fuerte a más débil: variable de entorno → opción de lanzamiento → frontmatter de habilidad o subagente → comando en sesión → perfil `[COMUNIDAD]`. Es la lista de la versión anterior de este documento; la medición de arriba confirma solo el eslabón del frontmatter.

**El nivel `max` escrito en un perfil.** `[COMUNIDAD]`, confirmado en varias versiones a través de incidencias públicas del repositorio de la herramienta (#33937, #45453, #65651). El esquema del fichero de perfil admitía solo `low`/`medium`/`high`/`xhigh`; escribir `max` ahí no daba error: arrancaba en `high` (o en `medium`, según versión) sin decir nada. El informe dice que los dos modelos 5.5 admiten `max` en Claude Code `[OFICIAL, vía informe]`, y que no encontró si `max` se guarda por modelo o dura solo la sesión: `[POR MEDIR]`, se comprueba con `/effort` y reiniciando.

**Comprobado en este vault el 2026-09-02: ninguno de los siete perfiles declara `max`.** Aquí no se escribe `max` en ningún perfil: no compensa (§2) y su comportamiento al guardarlo no está medido.

### 6.2 La cuota: qué vigilar y qué no

**Hay límites semanales propios por familia** además del compartido: *"You've hit your Opus limit"* y *"You've hit your Sonnet limit"* (`seven_day_opus` y `seven_day_sonnet` en el SDK) `[OFICIAL, vía informe; sin contrastar]`. **Su tamaño no se publica.** Si algo frena este vault, será el de la familia con más uso y no la ventana corta. Repartir trabajo hacia Sonnet alivia el límite de Opus aunque no reduzca el compartido en la misma proporción `[INFERIDO]`.

**[A CONFIRMAR] El estado real de la cuota lo dirime `/usage`, y lo corre el director.** El informe afirma que la cuota ya no es la restricción activa; la última medición propia es del **2026-08-28** (semanal 11 %, ventana de 5 h 20 %, Fable 0 %), anterior a Opus 5.5, a la subida de los límites de 5 horas y al reinicio de límites. **No se propaga la cifra del informe sin comprobarla aquí.** Comparar `/usage` antes y después de un bloque de tandas con esa medición es la medida válida del consumo dentro de la suscripción.

**Lo que sí es seguro:** el recargo por contexto largo ya no existe (eliminado el 2026-03-13 para los modelos vigentes). **El coste de las sesiones largas no es de tarifa: es de higiene de contexto** (§4).

---

## 7. Vetos y decisiones del director

**Vetos, que no se levantan sin decisión del director:**

- **`/fast`.** Corre sobre Opus 5.5 a 8/40 $ y se paga desde créditos de uso, aunque quede cuota en el plan; al activarlo cambia de modelo y rompe la caché. Se apaga del todo con `CLAUDE_CODE_DISABLE_FAST_MODE=1`. La documentación contrastada confirma que Opus 5.5 lo admite y que Sonnet 5.5 no figura; el precio y los créditos son del informe `[OFICIAL, vía informe]`.
- **Fable 5.1 en `claude -p`.** Según el plan, el selector puede mostrar "Requires usage credits"; en modo no interactivo el cliente lo cobra sin pedir confirmación `[OFICIAL, vía informe]`. Ninguna ejecutora desatendida usa Fable.
- **Créditos de uso.** Se cobran aparte a precio de API una vez agotado el plan, y solo si se activan. Mientras estén desactivados, ninguno de los caminos anteriores puede cobrar `[OFICIAL, vía informe]`.
- **`ultracode`: vetado salvo decisión del director** (informe `:185`). Es un ajuste de Claude Code, no un nivel del modelo: envía `xhigh` y hace que la sesión orqueste subagentes en paralelo para cada tarea sustancial. Se activa con `/effort ultracode` (dura la sesión), con `--effort ultracode` o con la palabra clave en un mensaje (solo ese turno); no se guarda como `effortLevel` `[OFICIAL, vía informe]`. Gasta cuota normal; que no facture aparte es `[INFERIDO por ausencia]`.

**`ultracode`, para quien tenga que decidir.** No da más inteligencia por turno: aporta orquestación, y ataca tres fallos de una sola ventana (abandonar tareas largas a medias, autoevaluarse con indulgencia, perder el hilo al compactar). No choca con el veto de [[modelo_por_tarea]], que es el fan-out masivo y no repartir una revisión en tres o cuatro lectores. Evidencia propia: el 2026-09-01 y 02, cuatro repartos de 2 a 4 agentes de lectura; tres auditores adversariales cazaron cuatro cifras estructurales mal en un documento ya dado por bueno, y dos agentes de análisis evitaron dos errores de forma; coste medido, 1,70 M de tokens de subagentes. Rinde en auditoría amplia y en trabajo donde la verificación independiente valga más que el ahorro; no rinde en tareas de un paso ni en la coordinación ordinaria. Activarlo a media sesión es un cambio de esfuerzo: se decide al abrir.

**Decisión abierta: Fable 5.1.** Con el índice de v4.3.2 no es la mejor compra: Opus 5.5 `high` (53,6) supera a Fable `max` (53) y `xhigh` (56,0) la supera con holgura, a menos de la mitad de tarifa (§2). El informe da el tope del 50 % del semanal en Max como vigente `[OFICIAL, vía informe]`; el contraste no lo verifica, así que se trata como dato del informe y no como confirmado. La escalada sigue la regla de la tabla de §5.

---

*Documento de referencia. **Se refresca por tanda periódica, no por goteo.** Origen: el informe de investigación del 2026-10-04 y su contraste del mismo día contra seis páginas oficiales de la API, que son las claves siguientes. `PE` = `https://platform.claude.com/docs/es/build-with-claude/prompt-engineering/` (con `prompting-claude-opus-5-5`, `prompting-claude-sonnet-5-5`, `prompting-claude-fable-5-1` y `claude-prompting-best-practices`); `OV` = `https://platform.claude.com/docs/es/models/overview`; `CH` = `https://platform.claude.com/docs/es/about-claude/models/choosing-a-model`. Mediciones propias del 2026-10-04: el esfuerzo del perfil (§1) y el comportamiento de los subagentes (§5, §6.1). Lo demás de Claude Code llega por informe y no se ha leído en su fuente primaria. Caduca el **2026-12-31**, a la vez que [[modelo_por_tarea]], a propósito: cuando toque repasar, se repasa todo junto.*

*v1.0 (2026-09-02) — primera versión. Catálogo con Fable 5.1 y Mythos 5.1, curvas de esfuerzo de Opus 5 y Fable 5.1, caché por modelo y por esfuerzo, higiene de `/clear` y `/compact` y tabla de situaciones.*

*v2.0 (2026-10-04) — refresco para el método 5.5. Catálogo y curvas de Opus 5.5 y Sonnet 5.5 en la escala v4.3.2 (§1, §2); la caché por esfuerzo se matiza (API invalida, Claude Code sin medir) y la regla de no cambiarlo se mantiene por diseño (§3); tabla por situación con planificador, ejecutora y ejecutora-mecanica (§5); precedencia de modelo y esfuerzo en subagentes, medida (§6.1); vetos de `/fast`, Fable en `-p` y `ultracode` (§7). Haiku sale del método.*
