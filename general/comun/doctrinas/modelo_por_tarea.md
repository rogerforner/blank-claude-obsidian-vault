---
name: Modelo apropiado por tarea
description: Cada tarea con el modelo apropiado, no el más capaz. El cuello de botella es la ventana de uso semanal (no el contexto: 1M es estándar en Opus 5, Sonnet 5 y Fable 5) → Opus 5 por defecto para lo difícil y la coordinación, Sonnet 5 para volumen, Haiku 4.5 para mecánica, y Fable 5 como escalada MEDIDA en tareas agénticas largas (incluido en Max/Team Premium hasta el 50% del semanal, pesa ~2x). El reparto es un problema de routing, no de racionamiento. Fijar modelo por sesión (cache miss). /usage es la única fuente fiable.
type: doctrine
version: 3.3
---

Cada tarea se ejecuta con el modelo apropiado a su naturaleza, no siempre con el más capaz. **El cuello de botella real no es el contexto** —1M es estándar y sin coste en Opus 5, Sonnet 5 y Fable 5 en estos planes— **sino la ventana de uso semanal**. El límite efectivo es *"cuánta capacidad de modelo alto puedo gastar por semana"*, así que el reparto es un problema de **routing** (no gastar Opus/Fable en trabajo que Sonnet termina igual), no de racionamiento.

> **Aplica a Max o a seat Premium de Team.** En **Pro / Team Standard** cambian dos cosas: el default de Claude Code es **Sonnet 5** (no Opus 5) y **Fable 5 NO está incluido** (solo usage credits → vetado). Confirma tu plan antes de aplicar la tabla.

> **Los hechos de esta ficha son de plataforma, no de dominio.** No se suavizan ni se "traducen": versiones, precios, límites y perillas son los mismos trabajes en lo que trabajes. Es la doctrina más volátil del catálogo → refréscala con [[vigilancia_tecnologica_bajo_demanda]].

## Catálogo (verificado a 28-jul-2026, fuente primaria)

- **Opus 5** (`claude-opus-5`, alias `opus`; GA **24-jul-2026**) — **el caballo de batalla para lo difícil**: coordinación, razonamiento duro y **redacción o cálculo exigentes**. **Default de Claude Code en Max/Team Premium** desde **v2.1.219** (por debajo de esa versión ni aparece en el picker y `opus` sigue dando 4.8). **1M** de contexto (default y máximo; el sufijo `[1m]` es redundante), 128k max output, **thinking ON** por defecto, **effort default `high`** (escalera `low/medium/high/xhigh/max`). Precio $5/$25 por Mtok — **el mismo que Opus 4.8** y la mitad de Fable. Gana o empata a Fable en **7 de 12** benchmarks compartidos y dispara **~85% menos falsos positivos** de los clasificadores de seguridad. **No resetea el `effort` al cambiar de modelo**: arrastra el que tuvieras.
- **Sonnet 5** (`claude-sonnet-5`) — **daily driver** para volumen, ejecución y redacción corriente; **1M nativo sin coste** (sin variante 200K ni sufijo `[1m]`). Auto-compacta ~967K (`CLAUDE_CODE_AUTO_COMPACT_WINDOW`). Consume el sub-límite **"Sonnet-only"**, que se agota antes que el global.
- **Haiku 4.5** — subagentes y mecánica ($1/$5 ref. API; ~15-20× más barato). **No consume el sub-límite alto.** No existe "Haiku 5": es la única clase sin actualizar al ciclo 5.
- **Fable 5** (`/model fable`; alias `best`) — **HABILITADO con disciplina**, no vetado: es **parte estándar y permanente** del plan en **Max y seats Premium de Team** (Help Center: *"Fable 5 will be a standard part of your plan"*), **hasta el 50% del límite semanal sin coste extra**. Pero: **no es un pool aparte** (sale del mismo bucket) y **pesa ~2× una sesión de Opus** → puede agotar tu acceso a media semana. Al superar el 50%: usage credits (**vetado**) o cambiar de modelo (`/model claude-opus-5`, no esperar el reset). Mantiene ventaja en **trabajo agéntico autónomo de horizonte largo**. Requiere v2.1.170+.
- **Opus 4.8** — sigue GA, sin fecha de retirada, **desplazado por Opus 5**; hoy su papel es ser el **modelo de fallback de seguridad**.
- **Mythos 5** — restringido (por invitación) → no disponible.

## La regla — tabla rol → modelo

| Rol / tarea | Modelo | Condición |
|---|---|---|
| Coordinación / razonamiento duro | **Opus 5** (1M) | incluido; nuevo default |
| **Trabajo difícil** (escrito jurídico, cálculo con consecuencias, análisis de un contrato) | **Opus 5** | Fable solo si Opus 5 falla en tu caso concreto |
| Ejecución diaria / redacción / volumen | **Sonnet 5** (1M nativo) | incluido; ojo al sub-límite Sonnet-only |
| Subagentes / mecánica / lectura voluminosa (barrer 40 facturas, resumir un expediente) | **Haiku 4.5** | `CLAUDE_CODE_SUBAGENT_MODEL=haiku`; no toca el sub-límite alto |
| **Tareas agénticas largas** (reelaborar un expediente entero, migrar un archivo documental) | **Opus 5** por defecto; **Fable 5 como escalada medida** | Fable: tope 50% del semanal, pesa ~2×, y **fuera de textos que rocen la seguridad informática** |
| Plan + ejecución | **`opusplan`** (Opus 5 planifica → Sonnet 5 ejecuta) | ver caveat #49623 |

**El reparto ya no es** "Opus coordina / Sonnet ejecuta / Haiku mecánica / Fable vetado", **sino**: **Opus 5 para lo grande y difícil · Fable 5 como escalada medida en agéntico largo · Sonnet 5 para volumen · Haiku para mecánica.**

## El fallback de seguridad

Los clasificadores de seguridad **enrutan por categoría** (v2.1.219+): request marcada **cyber → Opus 4.8**; **bio → Opus 5**. El clasificador inspecciona **todo lo que el modelo lee** (memoria, `CLAUDE.md`, conectores, resultados de búsqueda, `git status`), no solo tu último mensaje → puede dispararse en la **primera** request por el contexto del vault. Anthropic admite el *trade-off*: **más falsos positivos en "routine coding and debugging"**. Cada fallback **avisa en el transcript** y etiqueta la respuesta.

**Consecuencia práctica:** un fallback a mitad de trabajo es un **cambio de modelo** → rompe el hilo agéntico y provoca **cache-miss** (reprocesar el prefijo puede costar ~10× ese turno). Si el material que manejas roza el vocabulario de la seguridad informática (credenciales, cifrado, control de accesos, contraseñas), **trabaja en Opus 5** (85% menos falsos positivos) y deja Fable para lo demás. Diagnóstico: `claude --safe-mode` (aísla si el trigger es tu `CLAUDE.md`/skills/MCP/hooks) y `/config` → desactivar *"switch models when a message is flagged"* para **pausar en vez de saltar de modelo**.

## Ventana de uso y facturación

- Dos límites **independientes**: rolling de **5 h** + **semanal de 7 días**. **Los weekly caps de Claude Code siguen +50% hasta el 19-ago-2026** (extendidos; no expiraron el 19-jul).
- Sub-límites: **"across-all-models"** y **"Sonnet-only"** (este se agota antes). **Ni Opus 5 ni Fable 5 tienen sub-límite propio**; Fable solo el **tope del 50%**.
- **`/usage` es la única fuente en vivo fiable** (Anthropic no publica los pesos por modelo detrás de las barras). Vigilar también `/cost`.
- **Mantener "Extra Usage" OFF**: bug **#39841** (1M facturado como extra usage en Max) **sigue ABIERTO**, sin arreglo.
- **Trabajo headless (`claude -p` / Agent SDK) consume la ventana de la suscripción, no credits**, porque la escisión de facturación prevista para el 15-jun está **PAUSADA** (Help Center 15036540) — **reversible**: si se reactiva, replegar a subagentes intra-sesión ([[orquestacion_sesiones_por_herramienta]]).
- **`ANTHROPIC_API_KEY` no debe estar definida**: Claude Code **la prioriza sobre la suscripción y factura por API en silencio**.

## Vetado bajo "sin API / sin facturación aparte"

- **`/fast`** — **siempre usage credits** en Claude Code, nunca incluido; viene **default-ON en Max** sobre Opus → desactivar con `CLAUDE_CODE_DISABLE_FAST_MODE=1`. *(El `/fast` de Opus 4.7 se retiró el 24-jul-2026; hoy aplica a Opus 5 y 4.8.)*
- **Fable 5 por encima del 50%** del semanal, y **Fable en Pro / Team Standard** (credits desde el primer token).
- **`sonnet[1m]` de Sonnet 4.6** — innecesario: Sonnet 5 trae 1M nativo.

## Modos y perillas

`opusplan` / `opusplan[1m]`: Opus 5 planifica → Sonnet 5 ejecuta. **Bug #49623** (no auto-upgrade a 1M en plan mode) **cerrado como "not planned" sin arreglo** → el **workaround sigue siendo necesario**: forzar `opusplan[1m]` (o `ANTHROPIC_DEFAULT_OPUS_MODEL`) si quieres 1M en la fase de plan. No existe `fableplan` ni `opus5plan`. Perillas vigentes: `CLAUDE_CODE_SUBAGENT_MODEL`, `ANTHROPIC_DEFAULT_HAIKU_MODEL` (sustituye a `ANTHROPIC_SMALL_FAST_MODEL`), `ANTHROPIC_DEFAULT_OPUS_MODEL`, `ANTHROPIC_DEFAULT_SONNET_MODEL`, `ANTHROPIC_DEFAULT_FABLE_MODEL`.

## No cambiar de modelo a media sesión

Cada modelo tiene **caché propia**: cambiar con `/model` (o de `effort`) provoca **cache miss completo**. **Fija modelo y effort por sesión** — y ahora importa más, porque los **fallbacks de seguridad** pueden cambiártelo solos. Patrón para horizonte largo: **Opus 5 coordina (1M) → Sonnet 5/Haiku ejecutan tras handoff `.md`**, u orquestador + subagentes Haiku (caché propia, no invalidan el prefijo del padre).

## Evitar el fan-out masivo

Los **dynamic workflows** (~1.000 subagentes) están **vetados**: preview y cuota prohibitiva. Cada subagente/teammate es un **contexto completo** → multiplica tokens (un *Agent Team* de 3 ≈ **3-4×** una sesión más el round-trip). Para una persona el óptimo es **baja concurrencia**: 1 coordinador + 1-2 ejecutoras.

Relacionada: [[orquestacion_sesiones_por_herramienta]], [[paralelismo_subagent_opus_principal]], [[higiene_contexto_y_tokens]], [[vigilancia_tecnologica_bajo_demanda]].

*(La versión de esta doctrina para trabajo con software, con sus gates de calidad, vive en el pack `codigo/` → [[gates_de_calidad_locales]].)*

> Pieza de catálogo `general/comun/doctrinas/`. **v3.3 (2026-07-28):** **corrige el veto de Fable de la v3.2** — con fuente primaria (Help Center) Fable 5 es **inclusión permanente** en Max/Team Premium hasta el **50%** del semanal, así que pasa a **HABILITADO con disciplina** (la v3.2 lo vetó a partir de una fuente secundaria); añade el **matiz de plan** (Pro/Team Standard: default Sonnet 5 y Fable no incluido), Opus 5 como **default en Max/Team Premium** con sus detalles (`effort high` que **arrastra**, thinking ON, v2.1.219+), **Opus 4.8 como fallback de seguridad**, el **fallback por categoría** (cyber→4.8, bio→Opus 5) con su coste de cache-miss y los diagnósticos (`--safe-mode`, `/config`), **caps +50% hasta el 19-ago-2026**, `/fast` de 4.7 retirado, y **#49623 cerrado sin arreglo** (workaround vigente). **v3.2 (2026-07-28):** Opus 5 GA; Fable vetado *(corregido aquí)*. **v3.1 (2026-07-15):** Sonnet 5 daily driver, 1M nativo. v3.0 (2026-06-29). Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente.
> Adaptada al framing neutro del seed (sin referencias al dominio del software) — 2026-07-29.
