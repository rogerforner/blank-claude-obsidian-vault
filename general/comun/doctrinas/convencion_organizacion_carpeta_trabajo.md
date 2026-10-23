---
name: Convención de organización de la carpeta de trabajo
description: La carpeta de coordinación mantiene en su raíz solo lo activo y lo vivo. Handoffs y buffers son LOCALES (gitignored, nunca se versionan); los prompts ejecutados y los briefs con informe se versionan en vuelo y se BORRAN al cumplir (git rm; git conserva el histórico). No se acumulan ficheros obsoletos. Y lo que se lee entero en cada arranque —cola, bitácora— tiene TECHO escrito, igual que el CLAUDE.md: 40.960 y 30.720 bytes de `wc -c`, comparados sin convertir.
type: convention
version: 3.5
index_summary: >-
  Raíz solo con lo activo/vivo; prompts/briefs ejecutados se BORRAN (git es el histórico); handoffs y buffers son locales/gitignored; hook `SessionStart` que es el **ritual de arranque** —borra lo **superado por su serie** y lo **caducado a los 14 días**, **sella la fecha del sistema** y **ejecuta el verificador avisando solo si sale en rojo**— (sin lo segundo, un handoff con nombre único no se borraba nunca). **Lo que se lee entero en cada arranque tiene TECHO**: **40.960 bytes** la cola de un asunto, **30.720** la bitácora, comparados contra `wc -c` sin convertir, y lo cerrado baja al histórico (en bytes y no en líneas: 620 líneas de párrafo denso son 197 KB) — el `CLAUDE.md` ya lo tenía y los ficheros de estado no, que es como una cola llegó a costar 53.000 tokens por arranque. **Resumir TARDE produce desfase**: la conclusión sube a la cola en el mismo commit que genera el dato, o el fichero de estado deja de contar el estado — y eso no lo arregla podar. En un asunto en ejecución las palancas se agotan y se puede llegar al 97 % legítimamente; **entonces no se sube el techo, se decide qué se cierra**. Los originales no son efímeros: no se borran.
---

La carpeta de coordinación de un asunto (`<espacio>/<asunto>/coordinacion/`) y su carpeta de estudios (`estudios/`) se mantienen **limpias**: solo lo **activo** y lo **vivo**. No se dejan ficheros obsoletos en el vault: cada coordinador gestiona los suyos, también los de `estudios/`. Los insumos efímeros ya usados **se borran** — git conserva el histórico y el resultado perdura en otro sitio. Así nunca hay ficheros obsoletos que confundan ni que obliguen a leer de más.

## Qué se conserva y qué se borra

**Se conserva:**
- El **prompt en curso** (`prompt-<activo>.md`) mientras la tanda está abierta.
- El **handoff vivo** de la sesión actual *(local, gitignored — ver §Versionado)*.
- **`tmp-otros-actual.md`** — buffer sobreescribible *(local, gitignored)*.
- `README.md` y **`referencia/`** (docs vivas: glosarios, plantillas, datos de contacto del asunto).
- Los **resultados**: escritos, síntesis y los informes de estudios mientras su decisión no esté fundida en `docs/` (viven en `docs/`, `estudios/`, o la cola).
- En `_meta/`, el **plan de tandas** mientras vive: se versiona hasta que se cumple la última tanda.

**Se borra (git es el histórico):**
- El **prompt ya ejecutado**, cerrada su tanda y capturado el resultado (commits y el elemento cerrado en el estado). **No se archiva: se borra.**
- El **brief**, cuando ya existe su informe.
- En `estudios/`, el prompt o el brief de un estudio cuando ya existe su informe: `<base>_prompt.md` con `<base>_informe.md` o `<base>_prompt_informe.md`, o `brief.md` con `informe.md` en la carpeta del tema. **En `estudios/` un brief se llama `<base>_prompt.md` (o `brief.md` en la carpeta del tema) y ningún otro sufijo** (`_cowork`, `_brief`…): es lo único que reconocen el hook y el DoD, y un brief con otro nombre pasa meses sin que lo vea ninguna puerta. Antes de borrarlo se arreglan los enlaces que apuntan a él, porque si no el verificador marca el enlace colgado.
- Los informes de `estudios/` cuya decisión ya está fundida en `docs/` (ficha de decisión, `docs_sin_fases`), después de rescatar lo que solo vive en ellos. Esto es criterio del coordinador del asunto: no lo detecta ninguna puerta, porque saber si una decisión está fundida exige juicio.
- Cualquier **handoff superado** por uno nuevo (borrado local; al ser gitignored ya no está en git).
- En `_meta/`, los **informes cumplidos**, una vez rescatado lo que solo vive en ellos (D6 del método 5.5): no hace falta conservarlos todos, porque lo que mantiene el método al día es vigilar los modelos y las guías de Claude, no el archivo de informes.

**Nunca se borra:** un **original** recibido o emitido (escaneo, resolución, acuse, factura). No es efímero: es prueba. Vive en `docs/` y es intocable ([[estructura_contenedor_asunto]]).

## Lo que se lee entero en cada arranque tiene TECHO

La cola de pendientes, el charter, la bitácora y el estado (`coordinacion/estado.json`) **no son efímeros**: se conservan. Pero son lo que **cada sesión nueva lee antes de hacer nada** (del estado, la vista que vuelca el hook), así que su tamaño se paga en **todos** los arranques, para siempre. Un fichero de estado sin techo se convierte en un archivo histórico que nadie decidió crear. → [[estado_vivo_por_comando]]

- **Techo de la cola de un asunto: 40 KB = 40.960 bytes.** Al superarlo, lo **cerrado** baja a `coordinacion/referencia/historico-<asunto>.md` y la cola se queda con lo **vivo**: plazos, bloque activo, próximos bloques, decisiones pendientes. El histórico no se lee al arrancar; se abre cuando alguien pregunta por algo cerrado.
- **Techo de la bitácora del kit: 30 KB = 30.720 bytes.** Al superarlo, las entradas cuyo aprendizaje **ya está fundido** en una doctrina, un checklist o una plantilla se resumen a una línea con el puntero a donde vive ahora. La bitácora registra la traza; lo vigente son las reglas.
- **El `CLAUDE.md` ya tenía su techo** (por debajo de 200 líneas) y se respeta. **La asimetría era el fallo:** el fichero de reglas tenía límite escrito y los ficheros de estado no, cuando son los tres los que se leen en cada arranque.

**El techo va en KB, no en líneas, y eso no es un detalle.** Al fijarlo por primera vez se puso en líneas y la primera medición lo tumbó: la cola que había reventado el presupuesto tenía **620 líneas y 197 KB** — párrafos de trescientos caracteres, de modo que por líneas parecía mediana y por peso era cinco veces el techo. **Se mide lo que se paga**, y lo que se paga es el texto: `wc -c` al cerrar tanda.

**Y la unidad del techo es EL BYTE QUE DEVUELVE `wc -c`, en binario.** No es pedantería: "40 KB" se lee de dos maneras que se llevan un 2,4 % —40.000 o 40.960 bytes—, y esta misma doctrina llegó a citar **la misma medición** como 197 KB en el cuerpo y 192 KB en el changelog (197.319 bytes decimales, 192,7 KiB binarios). No mentía ninguna de las dos, pero un techo que cada cual convierte a ojo deja de ser un techo. **Se compara el número de `wc -c` contra 40.960 y 30.720, y se acabó la conversión.**

**Medido el 2026-08-12, que es de donde sale la regla:** la cola de un asunto de este vault había llegado a **197 KB, unos 54.800 tokens estimados**, de modo que su coordinador gastaba del orden de **60.000 tokens en abrir la sesión antes de hacer nada**. La del otro asunto iba por 38 KB (dentro del techo, pero rozándolo) y la bitácora del kit por 25,6 KB. Ningún fichero avisa de que ha crecido: **el techo se comprueba, no se nota.**

### El techo obliga a resumir, y resumir TARDE es lo que produce el desfase

**Un fichero de estado no se estropea solo por engordar: se estropea por contar el estado con retraso.** Al podar una cola de 197 KB apareció algo que el tamaño tapaba: **dos jornadas de una serie de medición se habían registrado en `docs/` y nunca subieron a la cola**. El coordinador llegó a **un fichero de estado que no contaba el estado** — y eso no lo arregla podar, porque el problema no era lo que sobraba sino lo que faltaba.

**El hábito que lo evita no es podar más, es apuntar antes:** la conclusión sube a la cola **en el mismo commit que genera el dato**, no en una pasada de mantenimiento posterior. Una línea escrita en caliente vale más que un resumen escrito tres semanas después, cuando ya hay que reconstruir qué pasó. **Es la misma regla de fuente única aplicada al tiempo: si el dato vive en dos sitios y uno se actualiza después, ese uno miente mientras tanto.**

**Y un límite honesto del techo, medido en un asunto en ejecución:** cuando la cola son **bloques activos reales** —fases abiertas, tareas con casillas sin marcar, series de medición en curso—, las palancas de poda se agotan. Bajar lo cerrado ya no da nada porque no hay nada cerrado, y **la única que queda es sacar conocimiento a `docs/`**, que también tiene fondo. Un asunto puede llegar legítimamente al 97 % del techo con estado vivo. **Cuando eso pase, la respuesta no es subir el techo:** es reconocer que el asunto tiene más frente abierto del que cabe leer en cada arranque, y decidir **qué se cierra**, no qué se esconde.

## Versionado: local (gitignore) vs versionado-y-borrado

Dos categorías de efímero, con tratamiento de git distinto:

- **Locales — NUNCA se versionan (gitignored).** Handoffs (`handoff-*.md`) y el buffer `tmp-otros-actual.md`. Son de **uso puntual** y por máquina/sesión: el handoff sirve solo hasta arrancar la siguiente sesión y **el director comunica cuándo generar uno**; el buffer es papel de borrador. No aportan al histórico. Patrón en el `.gitignore` raíz del vault: `/_meta/handoff-*.md` y `**/coordinacion/handoff-*.md` para los handoffs, `**/tmp-otros-actual.md` para el buffer. **El patrón de los handoffs va anclado a las dos carpetas donde vive lo efímero, y no como comodín amplio**: un `**/handoff-*.md` capturaba también `_meta/memoria/handoff-*.md` y dejaba una memoria invisible para git desde que se escribía. **Un patrón de higiene no debe poder tragarse contenido.** *(La PLANTILLA `inicializador/plantilla-handoff.md` SÍ se versiona — no empieza por `handoff-`.)*
- **Versionados en vuelo, borrados al cumplir (`git rm`).** Prompts (`prompt-*.md`) y briefs. Se versionan mientras están abiertos y se **borran al cerrar** la tanda; git conserva el histórico; lo mismo vale para los informes de `_meta/`, que se retiran tras el rescate.

> **No basta con borrar el fichero del disco para "dejar de versionar" un handoff** ya versionado: hay que sacarlo del tracking (`git rm`) y que el patrón del `.gitignore` lo cubra. Lo nuevo, al estar gitignored desde el inicio, no ensucia git.

## Al cerrar/usar una tanda

**Limpieza automática del coordinador** (no se espera al director):
1. **Borrar** el prompt ejecutado y los briefs ya con informe (`git rm` + **commit local**).
2. Confirmar que la raíz queda solo con lo activo/vivo.

El resultado perdura en los commits, en `docs/`/`estudios/` y en la cola. Si alguna vez hiciera falta el prompt antiguo, está en el histórico de git.

## Enforcement: limpiar también al ARRANCAR (hook SessionStart)

La limpieza no puede depender solo del cierre de tanda: las sesiones a menudo **mueren por límite de contexto** antes de cerrar, y el efímero se acumula. Por eso hay un **hook `SessionStart`** (`general/comun/hooks/limpieza-coordinacion.mjs`, cableado en el `settings.json` de perfil coordinador) que, al arrancar/reanudar cualquier sesión de coordinación:

- **Auto-borra** los handoffs y buffers `tmp-otros-actual.md` **gitignored** que ya no sirven, por cualquiera de dos motivos independientes: **superados** (hay otro más reciente en su misma serie) o **caducados** (más de 14 días, aunque sean los únicos de su serie). Los de **hoy** no se tocan nunca; cero impacto en git. La caducidad no es redundante: **una serie de un solo elemento no tiene sucesor que la desplace**, así que sin ella un handoff con nombre único se conservaba para siempre.
- **Avisa** por contexto de los **prompts/briefs trackeados** ya cumplidos, para que el coordinador los quite con `git rm` (con criterio: puede haber prompts en vuelo). Detecta cuatro casos: un `prompt*` de `coordinacion/`; un `brief*.md` con su `<brief>-informe.md` al lado; en `estudios/`, un `<base>_prompt.md` cuando existe `<base>_informe.md` o `<base>_prompt_informe.md`; y un `brief.md` cuando hay un `informe.md` o `informe-*.md` en su carpeta. El DoD (`_meta/dod.mjs`) consulta esa misma detección en todos los contenedores, la raíz y cada asunto, y deja como rojo solo lo del ámbito de quien lo corre: cada dueño ve y retira lo suyo. Además, **avisa por contexto —sin poner el DoD en rojo— de un brief de `estudios/` sin informe cuyo último commit tiene más de 30 días** (`<base>_prompt.md` o `brief.md`): «lánzalo o retíralo». Va aparte y no entra en la lista que consulta el DoD, porque un brief en espera puede depender del director (las investigaciones las lanza él). One-liner de apoyo: `LIMPIEZA_LIST_TRACKED=1 node <script> | while IFS= read -r f; do git rm -- "$f"; done`.

- **Sella la fecha del sistema** en el contexto, siempre y sea cual sea el resto. La sesión no vuelve a deducir qué día es leyendo un fichero: se lo dice una **ejecución**. Va con su alcance escrito al lado —sirve para el caso ordinario, no para dirimir una duda sobre el propio reloj— porque una fecha que se entrega sin límites se acaba usando para aquello que no cubre. → [[verificacion_fuente_primaria]]
- **Ejecuta el verificador del kit y avisa SOLO si sale en rojo.** Es la *prueba básica de arranque*: descubrir lo que la sesión anterior dejó roto **antes** de tocar nada, en vez de descubrirlo al ir a commitear. Lo busca subiendo desde el directorio de trabajo, así que funciona igual desde la raíz que desde un contenedor; si no lo encuentra, no dice nada.

Nunca bloquea el arranque (exit 0). La limpieza es, por tanto, **ritual de arranque además de cierre**. El script es un único fichero compartido en `general/` (read-only para los coordinadores de asunto); se referencia con `${CLAUDE_PROJECT_DIR}/../../general/comun/hooks/…` (contenedor a 2 niveles bajo la raíz) y `${CLAUDE_PROJECT_DIR}/general/comun/hooks/…` desde la raíz.

## `tmp-otros-actual.md`

Buffer **exclusivo** de texto que el director pega como respuesta a la pregunta de un asistente. No es canal de instrucciones (eso va en el chat) ni panel de estado. Sobreescribible; si no hay pregunta pendiente, queda vacío.

Relacionada: [[feedback_prompt_delivery]], [[formato_prompts_markdown_limpio]], [[orquestacion_sesiones_por_herramienta]], [[estructura_contenedor_asunto]].

## Antes de archivar: cómo se comprueba que no entierras trabajo abierto

**Es la operación más peligrosa del kit** —mover una sección cerrada al histórico— y ya ha rescatado algo **cuatro veces**. Pero la comprobación se hace a mano cada vez, y el 2026-08-28 **falló**: el patrón capturó una etiqueta de dentro de una **cita de código** (`grep '^- \[ABIERTO'` escrito como ejemplo), abortó por un falso positivo y **por poco tapa dos hallazgos reales**.

**Procedimiento, con la cobertura declarada:**

1. **Quita los literales entre acentos graves ANTES de buscar.** Una cita de código no es una marca. *(Es exactamente lo que las reglas del verificador ya hacían y lo que la comprobación a mano no hacía: el criterio existía, no se aplicó.)*
2. **Busca TODAS las etiquetas que significan trabajo por hacer, no dos**: `PENDIENTE`, `ABIERTO`, `A CONFIRMAR`, `TODO`, `POR HACER`, `PARA EL DIRECTOR`, `EN STANDBY`, `CADUCA`. **Las dos que se rescataron ese día eran `PARA EL DIRECTOR` y `CADUCA`** — ninguna de las dos habría salido con un patrón de solo *pendiente* y *abierto*.
3. **Lo que salga se RESCATA a la cola antes de mover el resto**, no se mueve "porque va con su bloque".
4. **Escribe la cobertura, no solo el resultado.** *"Comprobado y sin trabajo abierto"* no dice nada; *"barrido de estas ocho etiquetas sobre el bloque, con los literales fuera, más lectura completa"* sí.

**Y por qué esto NO se automatiza del todo:** decidir si algo es trabajo abierto **es criterio**, y una etiqueta es solo el indicio. El patrón se escribe para que nadie lo improvise peor; la lectura sigue siendo obligatoria.

> Pieza de catálogo `general/comun/doctrinas/`. Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda**. Historial de versiones: [[historial-doctrinas#convencion_organizacion_carpeta_trabajo]].
