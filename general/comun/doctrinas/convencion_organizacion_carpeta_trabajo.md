---
name: Convención de organización de la carpeta de trabajo
description: La carpeta de coordinación mantiene en su raíz solo lo activo y lo vivo. Handoffs y buffers son LOCALES (gitignored, nunca se versionan); los prompts ejecutados y los briefs con informe se versionan en vuelo y se BORRAN al cumplir (git rm; git conserva el histórico). No se acumulan ficheros obsoletos.
type: convention
version: 2.2
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

- **Auto-borra** los handoffs y buffers `tmp-otros-actual.md` **gitignored y superados** (conserva el más reciente de cada serie y los de hoy; cero impacto en git).
- **Avisa** por contexto de los **prompts/briefs trackeados** ya cumplidos, para que el coordinador los quite con `git rm` (con criterio: puede haber prompts en vuelo). One-liner de apoyo: `LIMPIEZA_LIST_TRACKED=1 node <script> | while IFS= read -r f; do git rm -- "$f"; done`.

Nunca bloquea el arranque (exit 0). La limpieza es, por tanto, **ritual de arranque además de cierre**. El script es un único fichero compartido en `general/` (read-only para los coordinadores de asunto); se referencia con `${CLAUDE_PROJECT_DIR}/../../general/comun/hooks/…` (contenedor a 2 niveles bajo la raíz) y `${CLAUDE_PROJECT_DIR}/general/comun/hooks/…` desde la raíz.

## `tmp-otros-actual.md`

Buffer **exclusivo** de texto que el director pega como respuesta a la pregunta de un asistente. No es canal de instrucciones (eso va en el chat) ni panel de estado. Sobreescribible; si no hay pregunta pendiente, queda vacío.

> v2.0 (2026-06-08): se sustituye el archivado en `cerrados/` por **borrado** (git es el histórico). Mantener los directorios sin ficheros obsoletos.
> v2.1 (2026-06-09): se distingue **local/gitignored** (handoffs, buffers — nunca se versionan) de **versionado-y-borrado** (prompts, briefs). Añadidos al `.gitignore` raíz `**/handoff-*.md`.
> v2.2 (2026-07-14): enforcement por **hook `SessionStart`** (auto-borra handoffs gitignored superados + avisa de prompts/briefs trackeados) → la limpieza es **ritual de arranque además de cierre**. Motivado por acumulación real observada (las sesiones morían antes de limpiar al cerrar).

Relacionada: [[feedback_prompt_delivery]], [[formato_prompts_markdown_limpio]], [[orquestacion_sesiones_por_herramienta]], [[estructura_contenedor_asunto]].

> Pieza de catálogo `general/comun/doctrinas/`. v2.2 (2026-07-14). Se instala por copia en `asuntos/<asunto>/memoria/`; no se hereda. *(Las copias ya instaladas se resincronizan por el coordinador del asunto; modelo snapshot.)*
> Adaptada al framing neutro del seed (sin referencias al dominio del software) — 2026-07-29.
