---
name: Modelo apropiado por tarea
description: Cada tarea con el modelo apropiado, no el más capaz. El cuello de botella es la ventana de uso semanal (no el contexto: 1M es estándar en Opus 5, Sonnet 5 y Fable 5; Haiku 4.5 se queda en 200K) → Opus 5 por defecto para lo difícil y la coordinación, Sonnet 5 para volumen, Haiku 4.5 para mecánica, y Fable 5 como escalada MEDIDA en tareas agénticas largas (incluido en Max/Team Premium hasta el 50% del semanal, pesa ~2x). El reparto es un problema de routing, no de racionamiento. Modelo y esfuerzo se FIJAN EN settings.json (`model` y `effortLevel`), no a mano en cada arranque; `max` no persiste ahí. Cambiarlos a media sesión = cache miss. /usage es la única fuente fiable.
type: doctrine
version: 3.5
---

Cada tarea se ejecuta con el modelo apropiado a su naturaleza, no siempre con el más capaz. **El cuello de botella real no es el contexto** —1M es estándar y sin coste en Opus 5, Sonnet 5 y Fable 5 en estos planes— **sino la ventana de uso semanal**. El límite efectivo es *"cuánta capacidad de modelo alto puedo gastar por semana"*, así que el reparto es un problema de **routing** (no gastar Opus/Fable en trabajo que Sonnet termina igual), no de racionamiento.

> **Aplica a Max o a seat Premium de Team.** En **Pro / Team Standard** cambian dos cosas: el default de Claude Code es **Sonnet 5** (no Opus 5) y **Fable 5 NO está incluido** (solo usage credits → vetado). Confirma tu plan antes de aplicar la tabla.

> **Los hechos de esta ficha son de plataforma, no de dominio.** No se suavizan ni se "traducen": versiones, precios, límites y perillas son los mismos trabajes en lo que trabajes. Es la doctrina más volátil del catálogo → refréscala con [[vigilancia_tecnologica_bajo_demanda]].

## Catálogo (verificado a 28-jul-2026, fuente primaria)

- **Opus 5** (`claude-opus-5`, alias `opus`; GA **24-jul-2026**) — **el caballo de batalla para lo difícil**: coordinación, razonamiento duro y **redacción o cálculo exigentes**. **Default de Claude Code en Max/Team Premium** desde **v2.1.219** (por debajo de esa versión ni aparece en el picker y `opus` sigue dando 4.8). **1M** de contexto (default y máximo; el sufijo `[1m]` es redundante), 128k max output, **thinking ON** por defecto, **effort default `high`** (escalera `low/medium/high/xhigh/max`). Precio $5/$25 por Mtok — **el mismo que Opus 4.8** y la mitad de Fable. Gana o empata a Fable en **7 de 12** benchmarks compartidos y dispara **~85% menos falsos positivos** de los clasificadores de seguridad. **No resetea el `effort` al cambiar de modelo**: arrastra el que tuvieras.
- **Sonnet 5** (`claude-sonnet-5`) — **daily driver** para volumen, ejecución y redacción corriente; **1M nativo sin coste** (sin variante 200K ni sufijo `[1m]`). Auto-compacta ~967K (`CLAUDE_CODE_AUTO_COMPACT_WINDOW`). Consume el sub-límite **"Sonnet-only"**, que se agota antes que el global.
- **Haiku 4.5** — subagentes y mecánica ($1/$5 ref. API; ~15-20× más barato). **No consume el sub-límite alto.** **Contexto 200K, no 1M** (verificado 12-ago-2026): es la única clase que no subió, así que un subagente Haiku **no puede tragar lo que traga el padre** — otra razón para acotarle el encargo, además de la salida. No existe "Haiku 5": es la única clase sin actualizar al ciclo 5.
- **Fable 5** (`/model fable`; alias `best`) — **HABILITADO con disciplina**, no vetado: es **parte estándar y permanente** del plan en **Max y seats Premium de Team** (Help Center: *"Fable 5 will be a standard part of your plan"*), **hasta el 50% del límite semanal sin coste extra**. Pero: **no es un pool aparte** (sale del mismo bucket) y **pesa ~2× una sesión de Opus** → puede agotar tu acceso a media semana. Al superar el 50%: usage credits (**vetado**) o cambiar de modelo (`/model claude-opus-5`, no esperar el reset). Mantiene ventaja en **trabajo agéntico autónomo de horizonte largo**. Requiere v2.1.170+.
- **Opus 4.8** — sigue GA, sin fecha de retirada, **desplazado por Opus 5**; hoy su papel es ser el **modelo de fallback de seguridad**.
- **Mythos 5** — restringido (por invitación) → no disponible.

## La regla — tabla rol → modelo

| Rol / tarea | Modelo | Esfuerzo | Condición que haría cambiar la fila |
|---|---|---|---|
| Coordinación / razonamiento duro | **Opus 5** (1M) | **`high`** (el defecto) | Decidido el 2026-08-12: el modelo se queda y lo que baja es el esfuerzo. **Subir a `xhigh` exige una eval propia** que demuestre margen medible en ese rol |
| **Trabajo difícil** (escrito jurídico, cálculo con consecuencias, análisis de un contrato) | **Opus 5** | `high`, `xhigh` si el razonamiento es multi-paso de verdad | Fable solo si Opus 5 falla en tu caso concreto |
| **Investigación con herramientas** (búsqueda web repetida, barrer una base de conocimiento) | **Opus 5** | **`xhigh`** | Es el único uso donde el fabricante recomienda `xhigh` explícitamente. **`max` no**: sobrepiensa y cuesta |
| Ejecución diaria / redacción / volumen | **Sonnet 5** (1M nativo) | **`low`–`medium`** *(piloto, ver abajo)* | El contrato fija el resultado; el esfuerzo alto solo añade tokens y llamadas |
| **Ejecutora de análisis de solo lectura** (el plan con las premisas falsas) | **Sonnet 5**; Opus 5 si el contrato es crítico | `high` | Es **detección de errores**, no generación. Cambiar solo si se mide que Opus detecta premisas que Sonnet no |
| Subagentes / mecánica / lectura voluminosa | **Haiku 4.5** (200K) | **`low`** | `CLAUDE_CODE_SUBAGENT_MODEL=haiku`; no toca el sub-límite alto y **su caché es independiente de la del padre** |
| Consultor (sesión paralela de solo lectura) | **Sonnet 5** | `medium` | Sesión aparte: no toca la caché ni el contexto del coordinador |
| **Tareas agénticas largas** (reelaborar un expediente entero, migrar un archivo documental) | **Opus 5** por defecto; **Fable 5 como escalada medida** | `high` | Fable: tope 50% del semanal, pesa ~2×, y **fuera de textos que rocen la seguridad informática** |
| Plan + ejecución | **`opusplan`** (Opus 5 planifica → Sonnet 5 ejecuta) | `high` | ver advertencia #49623 |

> **La fila de volumen es un PILOTO, no una regla asentada.** Bajar las ejecutoras a `low`–`medium` se apoya en un punto **no verificado**: no existe medición pública de que el modelo capaz reduzca los reintentos lo bastante como para salir más barato en tandas largas. **Criterio de éxito, escrito antes de empezar:** sobre un lote real, el resultado pasa los criterios de aceptación del contrato **con el mismo número de reintentos o menos** que hoy. Si suben los reintentos, se revierte un escalón.

> **Ninguna fila arranca en `max`.** Y `max` tampoco se puede fijar en la configuración: solo existe por sesión.

**El reparto ya no es** "Opus coordina / Sonnet ejecuta / Haiku mecánica / Fable vetado", **sino**: **Opus 5 para lo grande y difícil · Fable 5 como escalada medida en agéntico largo · Sonnet 5 para volumen · Haiku para mecánica.**

## El esfuerzo: `high` YA es el defecto, y subirlo no es gratis

**Poner `high` es idéntico a no poner nada** (docs oficiales *Effort*, consultadas 12-ago-2026). La escalera es `low` / `medium` / `high` / `xhigh` / `max`, y el esfuerzo **no multiplica el precio por token: multiplica los tokens generados** — más pensamiento y más llamadas de herramienta. Medido: **~2,7×** de coste entre el nivel más barato y el más caro sobre las mismas tareas; bajar de `high` a `medium` recorta del orden del 44% y a `low` del 66%.

- **`xhigh` está recomendado por el fabricante para lo exploratorio** — llamadas repetidas a herramientas, búsqueda web detallada, búsqueda en bases de conocimiento. Ahí sí paga.
- **`max` no**: "añade coste significativo con ganancias pequeñas y a veces sobrepiensa". **No se usa como valor de arranque de ningún rol.**
- **Dónde degrada bajar el esfuerzo:** en razonamiento **multi-paso**, no en leer y redactar. Con listas de comprobación explícitas, `low` aguanta tareas de varias secciones. Y ante razonamiento superficial, la guía dice **subir el esfuerzo en vez de dar rodeos en el prompt**.
- **Regla de oro del fabricante, que es la nuestra:** `high` es el suelo, y solo se baja **cuando se ha medido** que el nivel inferior mantiene la calidad en el trabajo real. No al revés.

## Dónde se fijan: en la configuración, no en la memoria de quien arranca

Una regla que depende de que alguien se acuerde de elegir el modelo en el desplegable **no es una regla, es una intención**. Se fija en `settings.json` del perfil (verificado 12-ago-2026):

| Qué | Clave | Notas |
|---|---|---|
| Modelo | `model` | O los alias por familia `ANTHROPIC_DEFAULT_{OPUS,SONNET,HAIKU,FABLE}_MODEL`, que **sobreviven al cambio de generación** — preferibles a clavar el nombre exacto |
| Esfuerzo | `effortLevel` | Acepta `low`, `medium`, `high`, `xhigh`. **NO acepta `max` ni `ultracode`**: esos son solo de sesión (`/effort`, `--effort`) |
| Esfuerzo por sesión | `CLAUDE_CODE_EFFORT_LEVEL` | La vía fiable si alguna vez hace falta persistir un nivel que la clave no admite |
| Modelo de los subagentes | `CLAUDE_CODE_SUBAGENT_MODEL` | Fuerza **todos** los subagentes a ese modelo: anula el parámetro por invocación y el frontmatter (el bloque de metadatos al inicio del fichero) |

> **Bandera roja (fuente de comunidad con método, 19-abr-2026):** `effortLevel: "max"` escrito en `settings.json` **se degrada en silencio a `high`** tras interactuar con la interfaz. No nos afecta mientras ningún rol arranque en `max` — y ninguno debe.

**Dejar constancia de lo que de verdad se está usando:** `/status` muestra el modelo activo y de dónde sale la configuración; el esfuerzo activo aparece junto al indicador de actividad. **No existe** ninguna variable que estampe automáticamente "modelo + esfuerzo" en lo que la sesión produce: es **convención de método**, no función del producto — quien abre una tanda lo anota en su relevo.

## El fallback de seguridad

Los clasificadores de seguridad **enrutan por categoría** (v2.1.219+): request marcada **cyber → Opus 4.8**; **bio → Opus 5**. El clasificador inspecciona **todo lo que el modelo lee** (memoria, `CLAUDE.md`, conectores, resultados de búsqueda, `git status`), no solo tu último mensaje → puede dispararse en la **primera** request por el contexto del vault. Anthropic admite el *trade-off*: **más falsos positivos en "routine coding and debugging"**. Cada fallback **avisa en el transcript** y etiqueta la respuesta.

**Consecuencia práctica:** un fallback a mitad de trabajo es un **cambio de modelo** → rompe el hilo agéntico y obliga a **reprocesar el contexto ya cacheado** (puede costar ~10× ese turno). **Y volver con `/model` no lo arregla: suele re-disparar el clasificador**, porque el contenido que lo activó sigue en el contexto (issue #67246). El **esfuerzo se arrastra** al modelo nuevo. La salida es `/clear` + relevo, o desactivar el cambio automático antes de empezar. Si el material que manejas roza el vocabulario de la seguridad informática (credenciales, cifrado, control de accesos, contraseñas), **trabaja en Opus 5** (85% menos falsos positivos) y deja Fable para lo demás. Diagnóstico: `claude --safe-mode` (aísla si el trigger es tu `CLAUDE.md`/skills/MCP/hooks) y `/config` → desactivar *"switch models when a message is flagged"* para **pausar en vez de saltar de modelo**.

## Ventana de uso y facturación

- Dos límites **independientes**: rolling de **5 h** + **semanal de 7 días**. La ampliación de **+50%** de los weekly caps de Claude Code **VENCIÓ el 19-ago-2026 a las 23:59 PT** — se extendió dos veces y **a la tercera no consta ninguna prórroga**, así que **se planifica con los límites base**, no con los ampliados. *(Confirmado en fuente oficial el 12-ago-2026; el vencimiento se anotó el 20-ago-2026, con la fecha ya pasada.)* **Lo que de verdad queda en la ventana lo dice `/usage`, no esta línea:** compruébalo antes de dimensionar una tanda larga.
- Sub-límites: **"across-all-models"** y **"Sonnet-only"** (este se agota antes). **Ni Opus 5 ni Fable 5 tienen sub-límite propio**; Fable solo el **tope del 50%**.

> **[RESUELTO EN VIVO el 12-ago-2026 — medido, no deducido.]** Una investigación de ese mismo día sostenía lo contrario: que el cupo escaso era el de **Opus**. **`/usage` lo refuta.** En una sesión trabajada **íntegramente con Opus 5**, el reporte da tres contadores: `session` al 39%, `weekly_all` al **13%** y `weekly_scoped` al **0%**. Si el contador acotado fuese el de Opus, no podría estar a cero después de esa sesión. **Queda refutado que el sub-límite acotado sea de Opus**, y el párrafo de arriba se sostiene.
>
> Matiz que conviene no saltarse: la medición **descarta** que el acotado sea de Opus, pero **no prueba positivamente** de qué modelo es — solo que no cuenta a Opus. Cerrarlo del todo cuesta una comprobación barata: trabajar un rato en Sonnet y volver a mirar `/usage`. **Y la lección de método es la que vale:** una afirmación de plataforma tomada de un informe, aunque venga con cita, **no desplaza a una medición en la propia máquina**.
- **`/usage` es la única fuente en vivo fiable** (Anthropic no publica los pesos por modelo detrás de las barras). Vigilar también `/cost`.
- **Mantener "Extra Usage" OFF**: bug **#39841** (1M facturado como extra usage en Max) **sigue ABIERTO**, sin arreglo.
- **Trabajo headless (`claude -p` / Agent SDK) consume la ventana de la suscripción, no credits**, porque la escisión de facturación prevista para el 15-jun está **PAUSADA** (Help Center 15036540) — **reversible**: si se reactiva, replegar a subagentes intra-sesión ([[orquestacion_sesiones_por_herramienta]]).
- **`ANTHROPIC_API_KEY` no debe estar definida**: Claude Code **la prioriza sobre la suscripción y factura por API en silencio**.

## Vetado bajo "sin API / sin facturación aparte"

- **`/fast`** — **siempre usage credits** en Claude Code, nunca incluido; viene **default-ON en Max** sobre Opus → desactivar con `CLAUDE_CODE_DISABLE_FAST_MODE=1`. *(El `/fast` de Opus 4.7 se retiró el 24-jul-2026; hoy aplica a Opus 5 y 4.8.)*
- **Fable 5 por encima del 50%** del semanal, y **Fable en Pro / Team Standard** (credits desde el primer token).
- **`sonnet[1m]` de Sonnet 4.6** — innecesario: Sonnet 5 trae 1M nativo.

## Modos y perillas

`opusplan` / `opusplan[1m]`: Opus 5 planifica → Sonnet 5 ejecuta. **Bug #49623** (no auto-upgrade a 1M en plan mode) **cerrado como "not planned" sin arreglo** → el **workaround sigue siendo necesario**: forzar `opusplan[1m]` (o `ANTHROPIC_DEFAULT_OPUS_MODEL`) si quieres 1M en la fase de plan. No existe `fableplan` ni `opus5plan`. **Las perillas y sus claves están arriba, en "Dónde se fijan": aquí no se repiten.** Solo un dato que no cabe allí: `ANTHROPIC_SMALL_FAST_MODEL` está **deprecada** en favor de `ANTHROPIC_DEFAULT_HAIKU_MODEL`.

## No cambiar de modelo a media sesión

Cada modelo tiene **caché propia**: cambiar con `/model` (o de `effort`) provoca **cache miss completo**. **Fija modelo y effort por sesión** — y ahora importa más, porque los **fallbacks de seguridad** pueden cambiártelo solos. Patrón para horizonte largo: **Opus 5 coordina (1M) → Sonnet 5/Haiku ejecutan tras handoff `.md`**, u orquestador + subagentes Haiku (caché propia, no invalidan el prefijo del padre).

## Evitar el fan-out masivo

Los **dynamic workflows** (~1.000 subagentes) están **vetados**: preview y cuota prohibitiva. Cada subagente/teammate es un **contexto completo** → multiplica tokens (un *Agent Team* de 3 ≈ **3-4×** una sesión más el round-trip). Para una persona el óptimo es **baja concurrencia**: 1 coordinador + 1-2 ejecutoras.

Relacionada: [[orquestacion_sesiones_por_herramienta]], [[paralelismo_subagent_opus_principal]], [[higiene_contexto_y_tokens]], [[vigilancia_tecnologica_bajo_demanda]].

*(La versión de esta doctrina para trabajo con software, con sus puertas de calidad, vive en el pack `codigo/` → [[gates_de_calidad_locales]].)*

> Pieza de catálogo `general/comun/doctrinas/`. **v3.5 (2026-08-20):** la ampliación de **+50%** de los límites semanales **vence y pasa a pretérito**: la ficha dejaba de ser cierta el mismo día 20, porque anunciaba en futuro una prórroga que ya había expirado, y ahora manda planificar con los **límites base** y comprobar la ventana con `/usage`. **El dato no se retira ni se reescribe:** se corrige el tiempo verbal de un hecho con caducidad, que es justo lo que la propia ficha advierte de sí misma. **v3.4 (2026-08-12):** llega el informe del brief de modelos por rol y se funde **solo lo que es hecho de plataforma**. Nuevo: **dónde se fijan modelo y esfuerzo** (`model` y `effortLevel` en `settings.json`, alias por familia preferibles al nombre exacto, `CLAUDE_CODE_EFFORT_LEVEL`, y que **`max`/`ultracode` NO persisten** en la clave, con el bug que degrada `max` a `high` en silencio); la sección del **esfuerzo** (`high` ya es el defecto y ponerlo es no poner nada; ~2,7× de coste entre extremos; `xhigh` recomendado para lo exploratorio, `max` nunca de arranque; degrada en razonamiento multi-paso, no en leer y redactar; y solo se baja **después de medir**); **Haiku 4.5 se queda en 200K** mientras el resto va a 1M; que volver con `/model` tras un fallback **re-dispara el clasificador**; y la ampliación de límites **confirmada hasta el 19-ago-2026 sin extensión documentada**, que cierra el pendiente que llevaba abierto desde el 28-jul. Declarado además un **[CONFLICTO ABIERTO]** sobre qué sub-límite es el escaso: el informe lo sitúa en Opus con una fuente de junio, anterior a la verificación de julio que dice lo contrario — **no se funde, lo dirime `/usage`**. La tabla gana **columna de esfuerzo** y tres filas (investigación con herramientas, ejecutora de análisis, consultor). **Sobre bajar la coordinación de modelo: el informe lo recomendaba y el director decidió que NO** — se queda Opus 5 y lo que baja es el esfuerzo, de `max`/`ultracode` a `high`. Motivo declarado: el ahorro grande está en el esfuerzo y tiene fuente oficial, mientras que bajar de modelo se apoyaba en un argumento del propio brief y en el conflicto de sub-límites sin resolver. La fila de volumen queda como **piloto con criterio de éxito escrito**, no como regla. **v3.3 (2026-07-28):** **corrige el veto de Fable de la v3.2** — con fuente primaria (Help Center) Fable 5 es **inclusión permanente** en Max/Team Premium hasta el **50%** del semanal, así que pasa a **HABILITADO con disciplina** (la v3.2 lo vetó a partir de una fuente secundaria); añade el **matiz de plan** (Pro/Team Standard: default Sonnet 5 y Fable no incluido), Opus 5 como **default en Max/Team Premium** con sus detalles (`effort high` que **arrastra**, thinking ON, v2.1.219+), **Opus 4.8 como fallback de seguridad**, el **fallback por categoría** (cyber→4.8, bio→Opus 5) con su coste de cache-miss y los diagnósticos (`--safe-mode`, `/config`), **caps +50% hasta el 19-ago-2026**, `/fast` de 4.7 retirado, y **#49623 cerrado sin arreglo** (workaround vigente). **v3.2 (2026-07-28):** Opus 5 GA; Fable vetado *(corregido aquí)*. **v3.1 (2026-07-15):** Sonnet 5 daily driver, 1M nativo. v3.0 (2026-06-29). Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente.
> Adaptada al enfoque neutro de la plantilla (sin referencias al dominio del software) — 2026-07-29.
