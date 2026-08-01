---
name: Estructura uniforme del contenedor de asunto
description: Todo asunto vive en asuntos/<asunto>/ con la MISMA estructura (slug = nombre del asunto): ficheros raíz de coordinación, .claude/ con un settings por rol de sesión, y subcarpetas docs/estudios/memoria/coordinacion. Uniforme para todos los asuntos, para orientarse sin reaprender. La instancia canónica es inicializador/plantilla-contenedor-asunto/.
type: convention
version: 1.3
---

Cada asunto se opera desde un **contenedor uniforme** en `asuntos/<asunto>/` (**slug = nombre corto y estable del asunto**: `reclamacion-agua-2026`, `obra-cocina`, `renta-2025`, `alquiler-local`). Mismo sitio para lo mismo en todos los asuntos → uno se orienta sin reaprender, y dentro de seis meses también. La **instancia canónica** que se copia al inicializar es `inicializador/plantilla-contenedor-asunto/` (ver [checklist de arranque](../../../inicializador/checklist-arranque.md)).

## Mapa del contenedor

```
asuntos/<asunto>/
├── README.md                  mapa del contenedor y estado en dos líneas
├── charter-coordinador.md     mandato del coordinador del asunto
├── CLAUDE.md                  reglas siempre-activas (auto-cargado por Claude Code)
├── cola-pendientes.md         estado vivo: hecho / en curso / pendiente (+ PLAZOS)
├── .claude/
│   ├── settings.json          coordinador del asunto (versionado, desde plantilla)
│   ├── settings.local.json    rutas de la máquina (carpeta de escaneos, unidad de copias) — gitignored
│   └── settings.consultor.json  perfil read-only para sesiones consultor (versionado; opcional)
├── docs/                      documentación del asunto + originales recibidos/emitidos
├── estudios/                  estudios/<tema>/ (investigación → decisión)
├── memoria/                   doctrinas PROPIAS del asunto (las del catálogo se LEEN, no se copian)
└── coordinacion/              prompts en vuelo + referencia/ (handoffs y buffers van gitignored)
```

### Qué va en `memoria/`, y qué NO es un olvido

**La fuente de verdad es siempre el catálogo** (`general/comun/doctrinas/`), que todo contenedor tiene en `additionalDirectories`. `memoria/` guarda las doctrinas **propias del asunto** y, **opcionalmente**, copias-snapshot de las del catálogo que ese asunto quiera fijar.

- **Un `[[wikilink]]` sin copia local resuelve al catálogo, y eso es lo normal — no un olvido.** No hay que instalar una doctrina solo porque el `CLAUDE.md` la enlace.
- **Copiar no es gratis: la copia asume el deber de resync.** Una copia **desfasada miente** con la autoridad de estar "instalada", y una copia **idéntica** al catálogo no aporta nada mientras el asunto viva dentro del vault. Por eso el **default es NO copiar**. *(Medido: de 12 copias en dos contenedores, 11 eran idénticas al catálogo y 1 estaba dos versiones por detrás.)*
- **Cuándo SÍ copiar:** cuando el asunto necesita **fijar** una versión concreta (y entonces se dice por qué), o cuando va a **salir del vault** y el catálogo no viaja con él. Quien copia, resincroniza.

## Configs de sesión por rol (dónde viven y cómo se lanzan)

Un contenedor puede operarse con una **flota de sesiones**; cada rol tiene su config en `.claude/`:

| Rol | Settings | cwd | Cómo se lanza | Permisos |
|---|---|---|---|---|
| **Coordinador del asunto** | `.claude/settings.json` (auto-cargado) | el contenedor | sesión por defecto | autonomía con verificación; la entrega fuera es puerta humana |
| **Consultor read-only** | `.claude/settings.consultor.json` | el contenedor | con el flag de settings de Claude Code (ver `inicializador/plantilla-consultor.md`) | solo lectura ([[sesion_consultor_paralelo]]) |
| **Sesiones ejecutoras** | heredan el del contenedor | el contenedor | prompt CLI que prepara el coordinador ([[orquestacion_sesiones_por_herramienta]]) | lo que el prompt autorice, acotado por las **deny rules** |

- **Local vs versionado:** `settings.local.json` (rutas de máquina) es **gitignored**; `settings.json` y `settings.consultor.json` se **versionan** (portables, sin rutas absolutas).
- **Handoffs y buffers** (`handoff-*.md`, `tmp-otros-actual.md`) viven en `coordinacion/` pero son **locales/gitignored** ([[convencion_organizacion_carpeta_trabajo]]).

## Tablero del asunto (si se usa)

Tableros con el plugin **Bases** de Obsidian, **nota-por-tarjeta** (`estado`/`responsable`/`asunto` en el frontmatter de cada nota) → versionado en **Markdown**, comparable en git y **operable por la IA** igual que el resto del vault. **No** usar apps con base de datos propietaria: rompen el Markdown-en-disco, y con él la única garantía de que dentro de diez años el asunto se siga pudiendo leer.

## Cross-links entre asuntos acoplados

Cuando dos asuntos están **acoplados** (la obra de la cocina y la reclamación al seguro por los daños que la motivaron; el alquiler de un local y la declaración anual que lo declara), **cada uno sigue siendo su propio contenedor estándar** (no se colapsan en uno solo) y se **enlazan entre sí** con rutas relativas, sin duplicar contenido:

- El asunto **dependiente** enlaza al que le da origen (p. ej. `../obra-cocina/docs/`).
- El asunto **origen** lista en su README los asuntos que lo consumen (`../reclamacion-agua-2026/`).
- El **acoplamiento de datos** (importes que viajan de uno a otro, fechas que fijan plazos, un mismo perito) se documenta en los `docs/`, **citando el documento fuente**, no copiando la cifra.
- La documentación se organiza **donde nació**; el otro asunto la **referencia**, no la copia.

## Qué vive dónde (canónico) — INNEGOCIABLE

Cada artefacto tiene **UN solo hogar canónico**; no se duplica.

| Artefacto | Hogar canónico | Por qué |
|---|---|---|
| **Documentación del asunto** (estado, cronología, plazos, contactos, decisiones, guías de trámite) | `asuntos/<asunto>/docs/` | la mantiene el coordinador; todo asunto tiene su doc en el mismo sitio |
| **Coordinación** (charter, cola, handoffs, prompts, estudios) | contenedor del asunto | es trabajo-con-IA, no producto |
| **Originales recibidos y emitidos** (escaneos, resoluciones, acuses, facturas, contratos firmados) | `asuntos/<asunto>/docs/` — **inmutables** | son **prueba**: no se editan, no se regeneran, no se "mejoran". Si hay que trabajar sobre ellos, se hace sobre copia |
| **Productos en elaboración** (borradores de escritos, hojas de cálculo, cartas) | `asuntos/<asunto>/docs/` | son lo que se entrega; el borrador se versiona, el enviado se conserva como original |
| **Valores sensibles y rutas de máquina** | nunca versionar valores reales | ver [[sensitive_file_guard]] |

**Regla de oro:** lo que se **decide o se redacta** es del vault y lo mantiene el coordinador; lo que se **recibió o se entregó** es intocable. **Anti-desincronización:** el **documento real** (el que se firmó, se registró o llegó por correo) es la única fuente de verdad de los hechos; si una nota del vault diverge, **gana el documento** y el coordinador actualiza la nota (*trust-but-verify* → [[verificacion_fuente_primaria]]).

## Por qué uniforme

Que el director opere sus asuntos **al unísono y con tranquilidad**: el mismo gesto sirve en cualquiera de ellos, y una sesión nueva se orienta sola. Las divergencias por asunto van en su `charter-coordinador.md` (quién decide, qué plazos mandan, con quién se trata fuera), no en mover de sitio las piezas comunes.

Relacionada: [[convencion_organizacion_carpeta_trabajo]], [[sesion_consultor_paralelo]], [[orquestacion_sesiones_por_herramienta]], [[sensitive_file_guard]], [[docs_sin_fases]].

> Pieza de catálogo `general/comun/doctrinas/`. **v1.3 (2026-08-01):** declarada la política de `memoria/`, que era ambigua y parecía un olvido — la fuente de verdad es el catálogo, un wikilink sin copia local resuelve allí y es lo normal, el default es NO copiar, y quien copia asume el resync (una copia desfasada miente con autoridad de instalada). v1.2 (2026-06-15): cuadro "Qué vive dónde (canónico)". v1.1 (2026-06-12): sección de cross-links entre contenedores acoplados. v1.0 (2026-06-09). Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente. Instancia canónica: `inicializador/plantilla-contenedor-asunto/`.
> Adaptada al framing neutro del seed (sin referencias al dominio del software) — 2026-07-29. Renombrada desde `estructura_contenedor_proyecto` (el contenedor pasa de `proyectos/…` a `asuntos/<asunto>/`).
