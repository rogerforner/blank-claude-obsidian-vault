---
name: Convención de organización de la carpeta de trabajo
description: La carpeta de coordinación mantiene en su raíz solo lo activo y lo vivo. Handoffs y buffers son LOCALES (gitignored, nunca se versionan); los prompts ejecutados y los briefs con informe se versionan en vuelo y se BORRAN al cumplir (git rm; git conserva el histórico). No se acumulan ficheros obsoletos. Y lo que se lee entero en cada arranque —cola, bitácora— tiene TECHO escrito, igual que el CLAUDE.md.
type: convention
version: 2.4
---

La carpeta de coordinación de un asunto (`asuntos/<asunto>/coordinacion/`) se mantiene **limpia**: solo lo **activo** y lo **vivo**. Los insumos efímeros ya usados **se borran** — git conserva el histórico y el resultado perdura en otro sitio. Así nunca hay ficheros obsoletos que confundan ni que obliguen a leer de más.

## Qué se conserva y qué se borra

**Se conserva:**
- El **prompt en curso** (`prompt-<activo>.md`) mientras la tanda está abierta.
- El **handoff vivo** de la sesión actual *(local, gitignored — ver §Versionado)*.
- **`tmp-otros-actual.md`** — buffer sobreescribible *(local, gitignored)*.
- `README.md` y **`referencia/`** (docs vivas: glosarios, plantillas, datos de contacto del asunto).
- Los **resultados**: escritos, informes, síntesis (viven en `docs/`, `estudios/`, o la cola).

**Se borra (git es el histórico):**
- El **prompt ya ejecutado**, cerrada su tanda y capturado el resultado (commits + entrada en `cola-pendientes.md`). **No se archiva: se borra.**
- El **brief**, cuando ya existe su informe.
- Cualquier **handoff superado** por uno nuevo (borrado local; al ser gitignored ya no está en git).

**Nunca se borra:** un **original** recibido o emitido (escaneo, resolución, acuse, factura). No es efímero: es prueba. Vive en `docs/` y es intocable ([[estructura_contenedor_asunto]]).

## Lo que se lee entero en cada arranque tiene TECHO

La cola de pendientes, el charter y la bitácora **no son efímeros**: se conservan. Pero son lo que **cada sesión nueva lee entero antes de hacer nada**, así que su tamaño se paga en **todos** los arranques, para siempre. Un fichero de estado sin techo se convierte en un archivo histórico que nadie decidió crear.

- **Techo de la cola de un asunto: 40 KB.** Al superarlo, lo **cerrado** baja a `coordinacion/referencia/historico-<asunto>.md` y la cola se queda con lo **vivo**: plazos, bloque activo, próximos bloques, decisiones pendientes. El histórico no se lee al arrancar; se abre cuando alguien pregunta por algo cerrado.
- **Techo de la bitácora del kit: 30 KB.** Al superarlo, las entradas cuyo aprendizaje **ya está fundido** en una doctrina, un checklist o una plantilla se resumen a una línea con el puntero a donde vive ahora. La bitácora registra la traza; lo vigente son las reglas.
- **El `CLAUDE.md` ya tenía su techo** (por debajo de 200 líneas) y se respeta. **La asimetría era el fallo:** el fichero de reglas tenía límite escrito y los ficheros de estado no, cuando son los tres los que se leen en cada arranque.

**El techo va en KB, no en líneas, y eso no es un detalle.** Al fijarlo por primera vez se puso en líneas y la primera medición lo tumbó: la cola que había reventado el presupuesto tenía **620 líneas y 197 KB** — párrafos de trescientos caracteres, de modo que por líneas parecía mediana y por peso era cinco veces el techo. **Se mide lo que se paga**, y lo que se paga es el texto: `wc -c` al cerrar tanda.

**Medido el 2026-08-12, que es de donde sale la regla:** la cola de un asunto de este vault había llegado a **197 KB, unos 54.800 tokens estimados**, de modo que su coordinador gastaba del orden de **60.000 tokens en abrir la sesión antes de hacer nada**. La del otro asunto iba por 38 KB (dentro del techo, pero rozándolo) y la bitácora del kit por 25,6 KB. Ningún fichero avisa de que ha crecido: **el techo se comprueba, no se nota.**

## Versionado: local (gitignore) vs versionado-y-borrado

Dos categorías de efímero, con tratamiento de git distinto:

- **Locales — NUNCA se versionan (gitignored).** Handoffs (`handoff-*.md`) y el buffer `tmp-otros-actual.md`. Son de **uso puntual** y por máquina/sesión: el handoff sirve solo hasta arrancar la siguiente sesión y **el director comunica cuándo generar uno**; el buffer es papel de borrador. No aportan al histórico. Patrón en el `.gitignore` raíz del vault: `**/handoff-*.md`, `**/tmp-otros-actual.md`. *(La PLANTILLA `inicializador/plantilla-handoff.md` SÍ se versiona — no empieza por `handoff-`.)*
- **Versionados en vuelo, borrados al cumplir (`git rm`).** Prompts (`prompt-*.md`) y briefs. Se versionan mientras están abiertos y se **borran al cerrar** la tanda; git conserva el histórico.

> **No basta con borrar el fichero del disco para "dejar de versionar" un handoff** ya versionado: hay que sacarlo del tracking (`git rm`) y que el patrón del `.gitignore` lo cubra. Lo nuevo, al estar gitignored desde el inicio, no ensucia git.

## Al cerrar/usar una tanda

Housekeeping **automático del coordinador** (no se espera al director):
1. **Borrar** el prompt ejecutado y los briefs ya con informe (`git rm` + **commit local**).
2. Confirmar que la raíz queda solo con lo activo/vivo.

El resultado perdura en los commits, en `docs/`/`estudios/` y en la cola. Si alguna vez hiciera falta el prompt antiguo, está en el histórico de git.

## Enforcement: limpiar también al ARRANCAR (hook SessionStart)

La limpieza no puede depender solo del cierre de tanda: las sesiones a menudo **mueren por límite de contexto** antes de cerrar, y el efímero se acumula. Por eso hay un **hook `SessionStart`** (`general/comun/hooks/limpieza-coordinacion.mjs`, cableado en el `settings.json` de perfil coordinador) que, al arrancar/reanudar cualquier sesión de coordinación:

- **Auto-borra** los handoffs y buffers `tmp-otros-actual.md` **gitignored** que ya no sirven, por cualquiera de dos motivos independientes: **superados** (hay otro más reciente en su misma serie) o **caducados** (más de 14 días, aunque sean los únicos de su serie). Los de **hoy** no se tocan nunca; cero impacto en git. La caducidad no es redundante: **una serie de un solo elemento no tiene sucesor que la desplace**, así que sin ella un handoff con nombre único se conservaba para siempre.
- **Avisa** por contexto de los **prompts/briefs trackeados** ya cumplidos, para que el coordinador los quite con `git rm` (con criterio: puede haber prompts en vuelo). One-liner de apoyo: `LIMPIEZA_LIST_TRACKED=1 node <script> | while IFS= read -r f; do git rm -- "$f"; done`.

Nunca bloquea el arranque (exit 0). La limpieza es, por tanto, **ritual de arranque además de cierre**. El script es un único fichero compartido en `general/` (read-only para los coordinadores de asunto); se referencia con `${CLAUDE_PROJECT_DIR}/../../general/comun/hooks/…` (contenedor a 2 niveles bajo la raíz) y `${CLAUDE_PROJECT_DIR}/general/comun/hooks/…` desde la raíz.

## `tmp-otros-actual.md`

Buffer **exclusivo** de texto que el director pega como respuesta a la pregunta de un asistente. No es canal de instrucciones (eso va en el chat) ni panel de estado. Sobreescribible; si no hay pregunta pendiente, queda vacío.

> v2.0 (2026-06-08): se sustituye el archivado en `cerrados/` por **borrado** (git es el histórico). Mantener los directorios sin ficheros obsoletos.
> v2.1 (2026-06-09): se distingue **local/gitignored** (handoffs, buffers — nunca se versionan) de **versionado-y-borrado** (prompts, briefs). Añadidos al `.gitignore` raíz `**/handoff-*.md`.
> v2.2 (2026-07-14): enforcement por **hook `SessionStart`** (auto-borra handoffs gitignored superados + avisa de prompts/briefs trackeados) → la limpieza es **ritual de arranque además de cierre**. Motivado por acumulación real observada (las sesiones morían antes de limpiar al cerrar).
> v2.4 (2026-08-12): **techo escrito para lo que se lee entero en cada arranque** — 40 KB la cola de un asunto, 30 KB la bitácora del kit, con el criterio de qué baja al histórico. El techo va **en KB y no en líneas** porque la primera versión de esta misma regla, escrita en líneas, no habría marcado el fichero que la motivó: 620 líneas de párrafo denso son 197 KB. Sale de medir: una cola había llegado a 192 KB (~53.400 tokens), y su coordinador gastaba ~60.000 tokens en abrir la sesión antes de trabajar. La asimetría estaba a la vista desde el principio: el `CLAUDE.md` tenía límite y los ficheros de estado no, siendo los tres lo que se lee en cada arranque.
> v2.3 (2026-08-12): el hook añade **caducidad a los 14 días**, porque "superado por otro de su serie" dejaba fuera las series de **un solo elemento** — medidos seis handoffs de julio vivos en dos contenedores, cada uno con nombre propio y por tanto sin sucesor posible. Corregido además un fallo del propio hook que hacía que **solo informase las veces que no borraba nada**: listaba los ficheros antes de borrar y luego consultaba los ya borrados, con lo que la excepción se tragaba el informe entero.

Relacionada: [[feedback_prompt_delivery]], [[formato_prompts_markdown_limpio]], [[orquestacion_sesiones_por_herramienta]], [[estructura_contenedor_asunto]].

> Pieza de catálogo `general/comun/doctrinas/`. v2.2 (2026-07-14). Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente. *(Las copias ya instaladas se resincronizan por el coordinador del asunto; modelo snapshot.)*
> Adaptada al framing neutro del seed (sin referencias al dominio del software) — 2026-07-29.
