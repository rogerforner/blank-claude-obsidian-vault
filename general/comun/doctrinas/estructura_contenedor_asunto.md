---
name: Estructura uniforme del contenedor de asunto
description: Todo asunto vive en <espacio>/<asunto>/ con la MISMA estructura (slug = nombre del asunto): ficheros raíz de coordinación, .claude/ con un settings por rol de sesión, y subcarpetas docs/estudios/memoria/coordinacion. Uniforme para todos los asuntos, para orientarse sin reaprender. En el perfil `asunto con software` el código vive FUERA del vault, donde el runtime lo sirve (docs/emplazamiento-runtime.md); repo/ dentro del contenedor es la excepción, no el caso normal. La instancia canónica es inicializador/plantilla-contenedor-asunto/.
type: convention
version: 2.1
index_summary: >-
  Todo asunto vive en `<espacio>/<asunto>/` con la misma estructura: raíz de coordinación, `.claude/` con un settings por rol y las subcarpetas docs, estudios, memoria y coordinacion. Lo recibido o entregado es intocable. `memoria/` guarda solo las doctrinas propias del asunto: las del catálogo se leen, no se copian, y un wikilink sin copia local resuelve al catálogo.
---

Cada asunto se opera desde un **contenedor uniforme** en `<espacio>/<asunto>/` (**slug = nombre corto y estable del asunto**: `reclamacion-agua-2026`, `obra-cocina`, `renta-2025`, `alquiler-local`). Mismo sitio para lo mismo en todos los asuntos → uno se orienta sin reaprender, y dentro de seis meses también. La **instancia canónica** que se copia al inicializar es `inicializador/plantilla-contenedor-asunto/` (ver [checklist de arranque](../../../inicializador/checklist-arranque.md)).

## Espacios

Un **espacio** agrupa asuntos que comparten dominio (p. ej. `casa/`). Es una carpeta hija directa de la raíz del vault; los asuntos viven dentro, a **profundidad 2**: `<espacio>/<asunto>/`.

- **Marca.** El `README.md` de la carpeta empieza por un frontmatter con `tipo:`: `espacio` (agrupa asuntos), `archivo` (árbol de documentos transversales, [[archivo_documental_compartido]]) o `libre` (carpeta de la raíz sin rol de coordinación). Una carpeta de la raíz sin marca y que no sea de sistema es un directorio sin dueño, y el verificador (regla 17) lo señala.
- **Lista de sistema.** `_meta`, `general` e `inicializador` son de sistema: no llevan marca.
- **Nombres reservados.** Un espacio no puede llamarse como un nombre de sistema ni como `docs`, `referencia`, `cerrados`, `node_modules`, `repo`, `coordinacion`, `estudios` o `memoria`: chocarían con las carpetas internas de un asunto. Fuente: `RESERVADOS` en `general/comun/scripts/espacios.mjs`.
- **Slug único.** El slug de un asunto es único en todo el vault, aunque estén en espacios distintos: dos iguales se confunden en el relevo, el tablero y la cola.
- **Todo hijo de un espacio es un asunto**, con su `charter-coordinador.md` (regla 17).
- **Sin `CLAUDE.md` ni `.claude/` a nivel de espacio**: se cargarían en todos sus asuntos sin que nadie lo decidiera (regla 18).
- **Los ficheros de nivel espacio** (el `README.md` con la marca y lo que cuelgue de ahí) son del coordinador general.
- **Una sesión abierta en un espacio no tiene rol**: el rol lo fija estar en `<espacio>/<asunto>/` o en la raíz.
- **La profundidad 2 es un invariante.** Las rutas relativas al vault y el hook de arranque del asunto suben dos niveles; la regla 18 comprueba que cada `additionalDirectories` y el hook resuelven a algo que existe dentro del vault desde `<espacio>/<asunto>`.

## Mapa del contenedor

```
<espacio>/<asunto>/
├── README.md                  mapa del contenedor y estado en dos líneas
├── charter-coordinador.md     mandato del coordinador del asunto
├── CLAUDE.md                  reglas siempre-activas del asunto (fichero canónico)
├── cola-pendientes.md         el porqué y lo cerrado; lo abierto, en `coordinacion/estado.json`
├── .claude/
│   ├── settings.json          coordinador del asunto (versionado, desde plantilla)
│   ├── settings.local.json    rutas de la máquina (carpeta de escaneos, unidad de copias) — gitignored
│   ├── settings.consultor.json  perfil read-only para sesiones consultor (versionado; opcional)
│   └── agents/                planificador.md, ejecutora.md, ejecutora-mecanica.md (copias idénticas de inicializador/plantilla-agente-*)
├── docs/                      documentación del asunto + originales recibidos/emitidos (+ emplazamiento-runtime.md si hay software)
├── estudios/                  estudios/<tema>/ (investigación → decisión)
├── memoria/                   doctrinas PROPIAS del asunto (las del catálogo se LEEN, no se copian)
├── coordinacion/              prompts en vuelo, `estado.json`, `tablero-tandas.md` y referencia/ (handoffs y buffers van gitignored)
└── repo/                      EXCEPCIÓN — perfil `asunto con software` sin runtime propio; ver docs/emplazamiento-runtime.md
```

**El código NUNCA vive en el vault como caso normal.** Cuando el perfil del asunto es `asunto con software`, el código vive **donde el runtime lo sirve** — un servidor de desarrollo local, un volumen de contenedor, una máquina virtual —, y el contenedor del asunto es **coordinación**: charter, cola, documentación, estudios. Qué runtime lo sirve, cómo se entra a ejecutar un comando dentro y cómo se comprueba lo registra `docs/emplazamiento-runtime.md` del contenedor, que el coordinador rellena preguntando al director en su primera sesión (plantilla: [`plantilla-emplazamiento-runtime.md`](../../../inicializador/plantilla-emplazamiento-runtime.md)). Qué va ahí lo fija el pack `codigo/` ([`README-repo-codigo.md`](../packs/codigo/README-repo-codigo.md)): código y un `README.md` típico; la documentación de coordinación sigue viviendo en `docs/`, `estudios/` y `memoria/` del contenedor, nunca junto al código.

**`repo/` dentro del contenedor es la EXCEPCIÓN**, no un añadido normal del perfil `asunto con software`: solo aparece cuando, declaradamente, ningún runtime externo impone dónde vive el código. En cualquier otro caso ese hueco no existe y no hay que crear una carpeta vacía "por si acaso".

## Convivencia de los dos `.git`, cuando — excepcionalmente — el código queda dentro (`repo/`)

Esto es la **red de seguridad del caso excepcional**, no la forma normal de trabajar (ver el bloque de arriba). Si `repo/` está declarado como excepción en `docs/emplazamiento-runtime.md`, trae **su propio `.git`**, distinto del `.git` del vault. Dos repositorios git, uno dentro del otro, es un caso que hay que declarar y proteger — y esto es lo que se **midió**, no lo que se supone (comando y salida literal en `informe-tanda-pack-codigo.md`):

- **Qué ve el vault:** git trata la raíz de `repo/` como una **frontera propia**. `git status` en el vault no desciende dentro: lo lista como un único directorio sin trackear, sin bajar a `README.md` ni a `.git/` por dentro. `git rev-parse --show-toplevel` ejecutado dentro de `repo/` devuelve la ruta de `repo/`, no la del vault: son dos raíces distintas también a efectos de qué `.claude/settings.json` carga cada sesión — es lo que sostiene que haga falta un perfil de permisos aparte para la sesión que sincroniza con el remoto (`plantilla-settings-repo-codigo.json` / `.NOTAS.md`, en `inicializador/`; detalle operativo en el pack `codigo/`).
- **Qué no debe versionar el vault:** el **contenido** de `repo/`. Lo versiona el **árbol de código** por su cuenta, con su propio histórico y (si lo tiene) su propio remoto; el `.git` del vault no debe registrar ni un fichero de ahí dentro. Un `.claude/settings.json` colocado en `repo/.claude/` (la plantilla `plantilla-settings-repo-codigo.json`) pasa a ser **de `repo/`**, versionado por su propio `.git` si el asunto así lo decide — no por el del vault.
- **Cómo se evita el submódulo accidental:** sin exclusión, un `git add` del vault que alcance el directorio que contiene `repo/` (por ejemplo `git add <espacio>/<asunto>/`) genera el aviso `adding embedded git repository` y registra `repo/` como **gitlink** (modo `160000` en el índice) — el mecanismo interno de un submódulo, dado de alta sin querer y sin `.gitmodules`. Es exactamente el riesgo que impedía cerrar este hueco. La mitigación **medida** que funciona: un patrón de exclusión en el `.gitignore` del vault (`/*/*/repo/`) hace que `repo/` **desaparezca** de `git status` (ni siquiera aparece como sin trackear) y que un `git add` sobre él se rechace con *"paths are ignored by one of your .gitignore files"* salvo que se fuerce explícitamente con `-f` — que ya no es un accidente.

### Qué va en `memoria/`, y qué NO es un olvido

**La fuente de verdad es siempre el catálogo** (`general/comun/doctrinas/`), que todo contenedor tiene en `additionalDirectories`. `memoria/` guarda las doctrinas **propias del asunto** y, **opcionalmente**, copias fijadas de las del catálogo que ese asunto quiera fijar.

- **Un `[[wikilink]]` sin copia local resuelve al catálogo, y eso es lo normal — no un olvido.** No hay que instalar una doctrina solo porque el `CLAUDE.md` la enlace.
- **Copiar no es gratis: la copia asume el deber de resincronizarse.** Una copia **desfasada miente** con la autoridad de estar "instalada", y una copia **idéntica** al catálogo no aporta nada mientras el asunto viva dentro del vault. Por eso el **default es NO copiar**. *(Medido: de 12 copias en dos contenedores, 11 eran idénticas al catálogo y 1 estaba dos versiones por detrás.)*
- **Cuándo SÍ copiar:** cuando el asunto necesita **fijar** una versión concreta (y entonces se dice por qué), o cuando va a **salir del vault** y el catálogo no viaja con él. Quien copia, resincroniza.

## Variante de equipo

El asunto de un equipo (una máquina del director, en el espacio `equipos/`; [[coordinador_de_equipo]]) usa el mismo contenedor con dos diferencias: `docs/` lleva tres documentos más, `analisis-equipo.md`, `registro-de-cambios.md` y `problemas-conocidos.md`, y el coordinador arranca con un perfil propio, `plantilla-settings-coordinador-equipo.json` (en `inicializador/`), en lugar del genérico.

## Configs de sesión por rol (dónde viven y cómo se lanzan)

Un contenedor puede operarse con una **flota de sesiones**; cada rol tiene su config en `.claude/`:

| Rol | Settings | cwd | Cómo se lanza | Permisos |
|---|---|---|---|---|
| **Coordinador del asunto** | `.claude/settings.json` (auto-cargado) | el contenedor | sesión por defecto | autonomía con verificación; la entrega fuera es puerta humana |
| **Consultor read-only** | `.claude/settings.consultor.json` | el contenedor | con el flag de settings de Claude Code (ver `inicializador/plantilla-consultor.md`) | solo lectura ([[sesion_consultor_paralelo]]) |
| **Tandas** | subagente `ejecutora` (o `ejecutora-mecanica` si es literal); hereda el `settings.json` del contenedor | el contenedor | las lanza el coordinador como subagente ([[orquestacion_sesiones_por_herramienta]]) | lo que la tanda autorice, acotado por las **deny rules** |

- **Local vs versionado:** `settings.local.json` (rutas de máquina) es **gitignored**; `settings.json` y `settings.consultor.json` se **versionan** (portables, sin rutas absolutas).
- **Handoffs y buffers** (`handoff-*.md`, `tmp-otros-actual.md`) viven en `coordinacion/` pero son **locales/gitignored** ([[convencion_organizacion_carpeta_trabajo]]).

## Tablero del asunto (si se usa)

Tableros con el plugin **Bases** de Obsidian, **nota-por-tarjeta** (`estado`/`responsable`/`asunto` en el frontmatter (bloque de metadatos al inicio del fichero) de cada nota) → versionado en **Markdown**, comparable en git y **operable por la IA** igual que el resto del vault. **No** usar apps con base de datos propietaria: rompen el Markdown-en-disco, y con él la única garantía de que dentro de diez años el asunto se siga pudiendo leer.

## Cross-links entre asuntos acoplados

Cuando dos asuntos están **acoplados** (la obra de la cocina y la reclamación al seguro por los daños que la motivaron; el alquiler de un local y la declaración anual que lo declara), **cada uno sigue siendo su propio contenedor estándar** (no se colapsan en uno solo) y se **enlazan entre sí por nombre de asunto**, no con `../`: entre espacios cambiaría la profundidad y el enlace se rompería. Sin duplicar contenido:

- El asunto **dependiente** enlaza al que le da origen (p. ej. el asunto `obra-cocina`, por su nombre y no por `../`).
- El asunto **origen** lista en su README los asuntos que lo consumen (el asunto `reclamacion-agua-2026`).
- El **acoplamiento de datos** (importes que viajan de uno a otro, fechas que fijan plazos, un mismo perito) se documenta en los `docs/`, **citando el documento fuente**, no copiando la cifra.
- La documentación se organiza **donde nació**; el otro asunto la **referencia**, no la copia.

## Qué vive dónde (canónico) — INNEGOCIABLE

Cada artefacto tiene **UN solo hogar canónico**; no se duplica.

| Artefacto | Hogar canónico | Por qué |
|---|---|---|
| **Documentación del asunto** (estado, cronología, plazos, contactos, decisiones, guías de trámite) | `<espacio>/<asunto>/docs/` | la mantiene el coordinador; todo asunto tiene su doc en el mismo sitio |
| **Coordinación** (charter, cola, handoffs, prompts, estudios) | contenedor del asunto | es trabajo-con-IA, no producto |
| **Originales recibidos y emitidos** (escaneos, resoluciones, acuses, facturas, contratos firmados) | `<espacio>/<asunto>/docs/` — **inmutables** | son **prueba**: no se editan, no se regeneran, no se "mejoran". Si hay que trabajar sobre ellos, se hace sobre copia |
| **Productos en elaboración** (borradores de escritos, hojas de cálculo, cartas) | `<espacio>/<asunto>/docs/` | son lo que se entrega; el borrador se versiona, el enviado se conserva como original |
| **Valores sensibles y rutas de máquina** | nunca versionar valores reales | ver [[sensitive_file_guard]] |

**Regla de oro:** lo que se **decide o se redacta** es del vault y lo mantiene el coordinador; lo que se **recibió o se entregó** es intocable. **Anti-desincronización:** el **documento real** (el que se firmó, se registró o llegó por correo) es la única fuente de verdad de los hechos; si una nota del vault diverge, **gana el documento** y el coordinador actualiza la nota (*trust-but-verify* → [[verificacion_fuente_primaria]]).

## Por qué uniforme

Que el director opere sus asuntos **al unísono y con tranquilidad**: el mismo gesto sirve en cualquiera de ellos, y una sesión nueva se orienta sola. Las divergencias por asunto van en su `charter-coordinador.md` (quién decide, qué plazos mandan, con quién se trata fuera), no en mover de sitio las piezas comunes.

Relacionada: [[convencion_organizacion_carpeta_trabajo]], [[sesion_consultor_paralelo]], [[orquestacion_sesiones_por_herramienta]], [[sensitive_file_guard]], [[docs_sin_fases]].

> Pieza de catálogo `general/comun/doctrinas/`. Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda**. Historial de versiones: [[historial-doctrinas#estructura_contenedor_asunto]].
