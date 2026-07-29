# `inicializador/` — arranque de un coordinador para un asunto nuevo

Aquí vive todo lo necesario para **inicializar un asunto**: crear su contenedor **y** arrancar su **coordinador independiente** (y, según necesidad, sus sesiones focalizadas como el consultor). Contiene el procedimiento, las plantillas parametrizables y el árbol de contenedor a copiar. El objetivo es que arrancar un asunto nuevo sea **copiar y adaptar**, no rediseñar.

Un **asunto** es cualquier cosa que se lleva de principio a fin con papeles y decisiones detrás: una reclamación a una aseguradora, la obra de una cocina, la declaración anual, el alquiler de un local, el mantenimiento de la caldera. Cada uno vive en `asuntos/<asunto>/` con la misma estructura.

## Contenido

- **[checklist-arranque.md](checklist-arranque.md)** — los pasos del arranque, en orden. **Empieza siempre por aquí.**
- **[checklist-migracion-existentes.md](checklist-migracion-existentes.md)** — variante para **traer al vault un asunto que ya está en marcha** (papeles en carpetas del disco, correos, hojas de cálculo sueltas, una carpeta de escaneos): reconocimiento previo, clasificación del material entrante con **gate de confidencialidad**, y qué se queda fuera. Complementa el de arranque.
- **[guia-eleccion-tooling.md](guia-eleccion-tooling.md)** — qué investigar para elegir herramientas según el tipo de asunto, y cómo evaluar herramientas externas y piezas del catálogo `general/`.
- **[plantilla-charter-coordinador.md](plantilla-charter-coordinador.md)** — charter parametrizable (`{{ASUNTO}}` / `{{SLUG}}` / `{{MATERIA}}` / `{{PERFIL}}`).
- **[plantilla-handoff.md](plantilla-handoff.md)** — handoff para relevar a un coordinador cuando su sesión llega al límite de contexto.
- **[plantilla-tanda-ejecutora.md](plantilla-tanda-ejecutora.md)** — **contrato de tanda** para una sesión ejecutora: alcance, contexto verificado, **decisiones ya tomadas** (lo que evita las preguntas), criterios de aceptación y **definition of done ejecutable** sobre el producto, más la variante **headless** para que la lance el propio coordinador. Es la palanca de mayor retorno para reducir relevos y trasiego: **tandas más grandes y autónomas** ([[orquestacion_sesiones_por_herramienta]], [[verificacion_e2e_por_agente]]).
- **[plantilla-consultor.md](plantilla-consultor.md)** + **[plantilla-settings-consultor.json](plantilla-settings-consultor.json)** — sesión **consultor read-only** (dudas factuales sobre los documentos y el estado del asunto sin gastar el contexto del coordinador; modo plan + deny de toda escritura).
- **[plantilla-brief-deep-research.md](plantilla-brief-deep-research.md)** — brief de **investigación a fondo** (se ejecuta en el chat web) con restricciones duras + enfoque "cómo SÍ" ([[vigilancia_tecnologica_bajo_demanda]]).
- **[plantilla-settings-coordinador.json](plantilla-settings-coordinador.json)** — el `.claude/settings.json` del coordinador de un asunto (perfil de **autonomía con verificación**; catálogo `general/` en solo lectura). Detalle y caveats en [plantilla-settings-coordinador.NOTAS.md](plantilla-settings-coordinador.NOTAS.md).
- **[plantilla-contenedor-asunto/](plantilla-contenedor-asunto/)** — árbol a copiar a `asuntos/<asunto>/`.

*(La plantilla del README de un repositorio de código y la alineación de sus reglas no viven aquí: se fueron al pack `codigo/` → `general/comun/packs/codigo/README-repo-codigo.md`. Solo hacen falta si el asunto incluye software propio.)*

## Convención clave

- **El slug del contenedor = nombre corto y estable del asunto.** `asuntos/<asunto>/` se llama como el asunto en el lenguaje del director (`reclamacion-agua-2026`, `obra-cocina`, `renta-2025`, `alquiler-local`), no como el organismo ni como el año a secas. Si el nombre no se entiende dentro de dos años, no sirve.
- **El coordinador de un asunto solo ve su asunto + `general/` (solo lectura).** El refuerzo técnico está en [plantilla-settings-coordinador.json](plantilla-settings-coordinador.json), y lo que de verdad lo sostiene son las **deny rules**, no la lista de herramientas permitidas.
- **Estructura uniforme del contenedor** — qué va en cada sitio y un settings por rol de sesión: [estructura_contenedor_asunto](../general/comun/doctrinas/estructura_contenedor_asunto.md). La instancia canónica es [plantilla-contenedor-asunto/](plantilla-contenedor-asunto/).
- **Un asunto, un contenedor.** Dos asuntos acoplados (la obra y la reclamación al seguro que la motivó) no se colapsan en uno: se enlazan con rutas relativas.

## Punto de partida

Empieza siempre por **[checklist-arranque.md](checklist-arranque.md)**.
