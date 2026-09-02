---
name: Modelos y nivel de esfuerzo — catálogo, curvas y tabla de situaciones
description: Documento de REFERENCIA (no doctrina) con los hechos de plataforma que cambian solos: qué modelos hay, qué niveles de esfuerzo admite cada uno, cuánto rinde cada nivel, qué cuesta cambiar de modelo o de esfuerzo a media sesión, y la tabla situación → modelo → esfuerzo. Lo consulta el coordinador antes de repartir trabajo y el director antes de abrir una sesión. El CRITERIO vive en [[modelo_por_tarea]]; aquí viven los DATOS y su origen.
type: knowledge
version: 1.0
caduca: 2026-11-30
---

# Modelos y nivel de esfuerzo — referencia consultable

**Esto no es doctrina: son hechos de plataforma, y como tales caducan.** El criterio de reparto —qué propiedad de la tarea decide la gama— vive en [[modelo_por_tarea]] y **no se repite aquí**. Aquí viven los datos que ese criterio necesita, con su origen y su fecha, porque son justo lo que cambia solo.

**Para quién.** Para las dos partes: el **coordinador** lo consulta antes de repartir trabajo o escribir un contrato de tanda; el **director** lo consulta antes de abrir una sesión o de escribir un prompt. Los gestos concretos de arranque están en [la guía de arranque de sesiones](../../_meta/guia-arranque-sesiones.md).

**Cómo se refresca.** Este documento **se actualiza por tandas periódicas**, no por goteo. Lleva `caduca:` en el frontmatter: **cuando esa fecha vence, el verificador deja el kit en rojo** y la sesión siguiente se entera al arrancar. Ese es el mecanismo — no hay que acordarse. Al refrescar: se sube `version`, se mueve `caduca`, se anota qué cambió en el pie, y **se propaga a la plantilla en el mismo commit** (vive en `general/`, así que la puerta de cierre lo exige).

---

## 0. Cómo se lee este documento sin equivocarse

**Tres reglas de lectura. Las tres importan y las tres son fáciles de saltarse.**

**1. El nombre del nivel NO es una unidad de medida.** `high` significa cosas distintas entre familias y entre versiones de la misma familia. Está documentado por el fabricante: *"Effort is a behavioral signal, not a strict token budget"*, y el `medium` de Sonnet 5 se describe como *"comparable to Sonnet 4.6 at high effort"* — mismo nombre, dos significados. Además cada modelo admite un subconjunto distinto de niveles, y **hay modelos que no admiten ninguno**.

> **Consecuencia: las tablas de este documento se leen HACIA ABAJO dentro de un modelo, y CELDA A CELDA entre modelos. Nunca en horizontal por nivel.** Decir *"el `high` de una gama equivale al `high` de otra"* es inventarse una equivalencia que no existe.

**2. Cada dato lleva su origen, y ninguno es "medido" en el sentido de este vault.** Aquí *medido* significa comprobado en esta máquina, y **ni una sola celda lo es**. Marcadores:

| Marca | Significa |
|---|---|
| `[OFICIAL]` | documentación o anuncio del fabricante |
| `[TERCERO]` | plataforma de evaluación independiente |
| `[COMUNIDAD]` | blogs, foros, incidencias públicas |
| `[INFERIDO]` | deducido, no publicado por nadie |

**3. Todo esto llega por informe, no por fuente primaria.** Los datos proceden de dos informes de investigación fechados el **2026-09-02**, que citan documentación oficial pero **no son esa documentación**. El perfil del coordinador deniega la consulta de red, así que contrastarlos exige autorización expresa del director. Mientras no la haya, **este documento está respaldado por informe** — que es un respaldo legítimo si se declara, y aquí queda declarado.

---

## 1. Catálogo de modelos

*Origen: `[OFICIAL]` para catálogo y precios; `[TERCERO]` para el índice. Consultado 2026-09-02.*

| Modelo | Índice a `max` | Precio entrada/salida por MTok | Contexto | Niveles de esfuerzo |
|---|---|---|---|---|
| **Fable 5.1** | **66** — líder | $10 / $50 | 1M | los 5 + cambio por mensaje (beta) |
| **Opus 5** | **63** | $5 / $25 | 1M | los 5 + cambio por mensaje (beta) |
| Fable 5 | 60-62 | $10 / $50 | 1M | los 5 |
| Opus 4.8 | 56-57 | $5 / $25 | 1M | los 5 |
| **Sonnet 5** | **55** *(solo `max` publicado)* | $2 / $10 *(permanente)* | 1M | los 5 |
| **Haiku 4.5** | 30 con razonamiento / 24 sin él | $1 / $5 | **200K** (salida 64K) | **NINGUNO** |
| Mythos 5.1 / Mythos 5 | misma base que Fable | acceso restringido | 1M | los 5 |

**Lo que hay que retener de esta tabla, y no es el ranking:**

- **Haiku 4.5 no tiene parámetro de esfuerzo.** Usa un presupuesto de razonamiento fijo. Cualquier frase del tipo *"Haiku a `low`"* es incorrecta: no hay nada que poner. `[TERCERO]`, fuente única — pendiente de segunda fuente.
- **Haiku no se compensa con configuración.** Índice 30 frente a 55 de Sonnet 5: para razonamiento hay que **subir de modelo**, no de nivel. Su sitio es la ejecución paralela, los subagentes y el volumen.
- **Haiku es el único que no llega a 1M** de contexto (200K), y el único con salida limitada a 64K.
- **Fable cuesta el doble que Opus 5** por token, y **consume hasta el 50 % del límite semanal**.
- Los precios de la API valen aquí **solo como coste relativo entre modelos**: este vault opera por suscripción y **la API está prohibida**.

### 1.1 Retiradas anunciadas — lo que caduca antes que este documento

*`[OFICIAL]`. El fabricante da 60 días de aviso mínimo.*

**Haiku 4.5 tiene retirada tentativa el 2026-10-15**, antes de que caduque este documento. Es el modelo de nuestros subagentes: **si se retira, hay que elegir sustituto**. Le siguen Sonnet 4.5 (2026-09-29) y Opus 4.5 (2026-11-24), que no usamos. Los que sí usamos aguantan: Sonnet 5 hasta 2027-06-30 y Opus 5 hasta 2027-07-24.

---

## 2. Las curvas de esfuerzo — el dato central

*Origen: `[TERCERO]`, Intelligence Index v4.1.1. **Solo hay curva completa publicada para dos modelos.***

### Opus 5 — curva completa

| Nivel | Índice | Tokens consumidos |
|---|---|---|
| `low` | 52 | 12M |
| `medium` | 59 | 29M |
| `high` | **61** | 52M |
| `xhigh` | **63** | 76M |
| `max` | **63** *(sin ganancia)* | 100M *(+30 % de tokens)* |

**Las dos lecturas que gobiernan nuestro reparto:**

1. **El salto grande está de `low` a `medium`: +7 puntos.** El grueso de la calidad se consigue pronto.
2. **De `xhigh` a `max` no se gana nada y se gasta un 30 % más.** El punto dulce de Opus 5 es **`high`/`xhigh`**.

### Fable 5.1 — curva completa

| Nivel | Índice | Coste por tarea |
|---|---|---|
| `low` | 58 | $0,77 |
| `medium` | 60 | — |
| `xhigh` | **65** | $2,72 |
| `max` | 66 | $3,76 |

**`xhigh` es la mejor compra en Fable 5.1**: un punto menos que `max` por un dólar menos por tarea.

### Sonnet 5 — solo `max` publicado

`max` = **55**. Las páginas de los demás niveles existen pero **no publican índice**. Lo único documentado por el fabricante es que su `medium` es *"comparable a Sonnet 4.6 en `high`"*.

### El dato que decide entre subir esfuerzo y subir modelo

> **Sonnet 5 a `max` (55) queda por debajo de Opus 5 a `high` (61).**

**Subir el esfuerzo de un modelo menor no salva la brecha de tamaño en razonamiento duro.** Y al revés: **un modelo mayor a esfuerzo medio suele ser mejor compra que uno menor a máximo**, también en coste por tarea. Regla práctica:

> **Sube el ESFUERZO cuando el cuello de botella es pensar. Sube de MODELO cuando el cuello de botella es saber o escribir bien.**

### Cuándo subir el esfuerzo EMPEORA el resultado

*`[OFICIAL]` + literatura académica.* Está documentado que alargar el razonamiento **degrada** la precisión en cierto tipo de tareas — *inverse scaling*. El modo de fallo descrito: el modelo **se distrae cada vez más con información irrelevante**. Las categorías afectadas son tareas de conteo con distractores, regresión con rasgos espurios y deducción con seguimiento de restricciones.

**Traducción operativa:** en tareas simples, de patrón obvio o de salida estructurada, `max` y `xhigh` no solo malgastan tokens — **pueden dar peor respuesta**. La documentación del fabricante lo recoge directamente para salida estructurada.

---

## 3. Cambiar de modelo o de esfuerzo a media sesión

*`[OFICIAL]`, salvo donde se indique.*

### 3.1 Las dos reglas, y la excepción que hay que confirmar

**La caché está indexada por modelo Y por nivel de esfuerzo.** Citas literales de la documentación:

> *"Model: each model has its own cache. Switching models recomputes the entire request even when the content is identical."*
>
> *"Effort level: each effort level has its own cache for the same model. Changing effort mid-session recomputes the entire request."*

**Cambiar cualquiera de los dos reprocesa el contexto entero.** No hay diferencia de coste entre cambiar de modelo y cambiar de esfuerzo.

**[A CONFIRMAR] La excepción:** en **Opus 5, Fable 5.1 y Mythos 5.1** existe un cambio de esfuerzo **por mensaje** (beta) que **preserva la caché**. **No está comprobado si eso llega a las sesiones de este vault o es solo del lado API** — y como la API está prohibida aquí, la diferencia decide la respuesta. **Hasta confirmarlo, la regla operativa no se relaja: se fija el esfuerzo al arrancar y no se toca.**

### 3.2 Lo que cuesta, en números

*Sesión de 150k de contexto en Opus 5. `[OFICIAL]` para las tarifas, aritmética directa para el resto.*

| Qué haces | Coste de ese turno |
|---|---|
| Nada: turno normal con caché caliente | **~$0,075** |
| Cambias modelo **o** esfuerzo (caso general) | **~$0,94** a TTL de 5 min · **~$1,50** a TTL de 1 h |

**Entre 12 y 20 veces más caro**, pagado una sola vez tras el cambio. Y hay un detalle que casi nadie tiene en cuenta: **escribir en caché cuesta MÁS que la entrada normal** (1,25× a 5 minutos, 2× a una hora). Por eso cada invalidación en una sesión larga duele.

### 3.3 El contraejemplo que corrige la intuición

> *"Si estás a 100k tokens de conversación con Opus y quieres hacer una pregunta fácil, sería MÁS caro cambiar a Haiku que dejar que responda Opus, porque habría que reconstruir la caché."* `[OFICIAL]`

**El modelo barato cuesta ~2× más en ese turno.** Por tanto: **para una subtarea barata, lanza un subagente — no cambies el modelo del bucle principal.** Es exactamente lo que [[modelo_por_tarea]] ya manda; aquí queda el número que lo respalda.

### 3.4 Un cambio de modelo que no decides tú

**El enrutado de seguridad de Fable ES un cambio de modelo**, y arranca caché nueva. Cuando un clasificador marca una petición (ciberseguridad, biología, destilación de modelos), la petición se reejecuta en un modelo de respaldo y **la sesión continúa allí**. Volver es **otro** cambio de modelo, o sea **otra reescritura**: dos por cada ida y vuelta.

**Mitigación, y es la que ya aplica el kit:** para material que roce esos temas, **ir directo a Opus** — es el mismo destino del respaldo, a mitad de precio y sin la ida y vuelta.

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

**Tiempo de vida de la caché:** la conversación principal usa **1 hora**; los subagentes y todo lo demás, **5 minutos**.

---

## 5. Tabla situación → modelo → esfuerzo

**Para quien abre la sesión.** El criterio que hay detrás está en [[modelo_por_tarea]]; esta tabla es su aplicación a situaciones concretas.

| Situación | Modelo | Esfuerzo | Por qué |
|---|---|---|---|
| **Coordinar jornada larga**, varias tandas | Opus 5 | `high` | Coherencia de horizonte largo. Fijar al arrancar y no cambiar |
| **Auditar o revisar a fondo**, sin dejarse nada | Opus 5 | `xhigh` | Cobertura exhaustiva y razonamiento multi-paso: aquí el esfuerzo **sí** compensa |
| **Razonamiento duro** (cálculo, deducción, ciencia) | Opus 5 | `high`/`xhigh` | No se suple con Sonnet a `max`: 55 frente a 61 |
| **Escribir doctrina o documentación** | Opus 5 | `high` | Gana el conocimiento y la redacción, no más razonamiento. `max` arriesga sobrepensar |
| **Investigar con herramientas** | Opus 5 | `xhigh` | La búsqueda agéntica y el uso repetido de herramientas se benefician del esfuerzo alto |
| **Fase de análisis** (refutar premisas) | Sonnet 5 | **`high`** | Es trabajo sensible a inteligencia: `high` es el suelo. **Cambia respecto de lo anterior** |
| **Ejecutar volumen** (transcribir, tabular) | Sonnet 5 | `medium` | El contrato ya fija el resultado; subir esfuerzo solo añade tokens |
| **Implementación mecánica y acotada** | Sonnet 5 | `low`/`medium` | Patrón obvio: subir esfuerzo no mejora y **puede empeorar** |
| **Traducir o revisar textos** | Sonnet 5 | `medium` | Tarea de leer y redactar: el esfuerzo no compensa |
| **Consultar un dato** | Sonnet 5 | `medium` | Búsqueda simple; el esfuerzo máximo sería sobrepensar |
| **Subagente de lectura** | Haiku 4.5 | **— (no admite)** | Devuelve resumen acotado sin quemar el contexto principal |
| **Brief para el chat web** | el capaz | `xhigh` | Allí no hay perfil: se elige a mano. `max` tampoco ahí |

**Lo que cambió respecto de la práctica anterior:** la **fase de análisis sube de `medium` a `high`**. El motivo: su entregable es **refutar las premisas de quien encarga el trabajo**, que es exactamente el tipo de tarea sensible a inteligencia para la que la documentación fija `high` como suelo. La ejecutora de **volumen** se queda en `medium`.

---

## 6. Dos avisos operativos que ahorran dinero y disgustos

### 6.1 El nivel `max` escrito en un perfil se ignora en silencio

`[COMUNIDAD]`, confirmado en varias versiones a través de incidencias públicas del repositorio de la herramienta (#33937, #45453, #65651). **El esquema del fichero de perfil solo admite `low`/`medium`/`high`/`xhigh`.** Escribir `max` ahí **no da error**: arranca en `high` (o en `medium`, según versión) **sin decir nada**.

**Comprobado en este vault el 2026-09-02: ninguno de los siete perfiles declara `max`.** Todos llevan `high` o `medium`, que son válidos. **No estamos en ese fallo** — pero conviene saberlo antes de que a alguien se le ocurra escribirlo.

**Orden de precedencia**, de más fuerte a más débil: variable de entorno → opción de lanzamiento → frontmatter de habilidad o subagente → comando en sesión → perfil.

### 6.2 La cuota: qué vigilar y qué no

**Hay un límite semanal específico del modelo alto**, que se mide y se resetea aparte del agregado. Si algo frena este vault, será ese — no la ventana corta.

**[A CONFIRMAR] El estado real de la cuota lo dirime `/usage`, y lo corre el director.** El informe de origen afirma que la cuota ya no es la restricción activa; la última medición propia de este vault es del **2026-08-28** (semanal 11 %, ventana de 5 h 20 %, Fable 0 %). **No se propaga la cifra del informe sin comprobarla aquí**, porque de ese número cuelga si conviene o no relajar la política de reparto.

**Lo que sí es seguro:** **el recargo por contexto largo ya no existe** (eliminado el 2026-03-13 para los modelos vigentes). Un contexto de 900k se factura a la misma tarifa por token que uno de 9k. **El coste de las sesiones largas no es de tarifa: es de higiene de contexto** — la re-lectura acumulada de §4.

---

## 7. Lo que este documento NO puede decidir

Dos cosas quedan **abiertas para el director**, con su coste declarado:

1. **`ultracode`.** Uno de los informes lo recomienda para coordinación de jornada larga, con un argumento estructural: no da más inteligencia por turno que `xhigh`, pero **reparte el trabajo en varios contextos limpios**, lo que ataca tres fallos conocidos de una sola ventana —abandonar tareas largas a medias, autoevaluarse con indulgencia y perder el hilo al compactar—. **Choca de frente con el veto de [[modelo_por_tarea]] a la orquestación multiagente automática**, que es justo lo que habilita. Fuente única y de comunidad. **Es decisión, no actualización de dato.**
2. **Fable 5.1.** Lidera el índice con 66 frente a los 63 de Opus 5, **pero no es la mejor compra**: Opus 5 a `xhigh` da 63 a **mitad de tarifa** y sin el enrutado de seguridad de §3.4. **[A CONFIRMAR]** si Fable 5.1 hereda el tope del 50 % del semanal que tiene Fable 5 — sin ese dato no se puede escribir ninguna regla operativa sobre ella.

---

*Documento de referencia. **Se refresca por tanda periódica, no por goteo.** Origen: dos informes de investigación del 2026-09-02, respaldados por documentación oficial que este vault **no ha contrastado en fuente primaria** (requiere autorización de red). Caduca el **2026-11-30**, a la vez que [[modelo_por_tarea]], a propósito: cuando toque repasar, se repasa todo junto.*

*v1.0 (2026-09-02) — primera versión. Recoge el catálogo con Fable 5.1 y Mythos 5.1, las curvas completas de esfuerzo de Opus 5 y Fable 5.1, la mecánica de caché por modelo y por esfuerzo con su excepción a confirmar, la higiene de `/clear` y `/compact`, y la tabla de situaciones. Corrige tres cosas que el kit tenía mal: que Haiku admita nivel de esfuerzo (no lo admite), que subir a `xhigh` careciera de respaldo publicado (ya hay curva completa), y que la fase de análisis fuera a `medium` (sube a `high`).*
