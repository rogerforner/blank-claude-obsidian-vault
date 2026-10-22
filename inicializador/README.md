# `inicializador/` — arranque de un coordinador para un asunto nuevo

Aquí vive todo lo necesario para **inicializar un asunto**: crear su contenedor **y** arrancar su **coordinador independiente** (y, según necesidad, sus sesiones focalizadas como el consultor). Contiene el procedimiento, las plantillas parametrizables y el árbol de contenedor a copiar. El objetivo es que arrancar un asunto nuevo sea **copiar y adaptar**, no rediseñar.

Un **asunto** es cualquier cosa que se lleva de principio a fin con papeles y decisiones detrás: una reclamación a una aseguradora, la obra de una cocina, la declaración anual, el alquiler de un local, el mantenimiento de la caldera. Cada uno vive en `<espacio>/<asunto>/` con la misma estructura.

## Contenido

- **[checklist-arranque.md](checklist-arranque.md)** — los pasos del arranque, en orden. **Empieza siempre por aquí.**
- **[checklist-migracion-existentes.md](checklist-migracion-existentes.md)** — variante para **traer al vault un asunto que ya está en marcha** (papeles en carpetas del disco, correos, hojas de cálculo sueltas, una carpeta de escaneos): reconocimiento previo, clasificación del material entrante con **puerta de confidencialidad**, y qué se queda fuera. Complementa el de arranque.
- **[guia-eleccion-tooling.md](guia-eleccion-tooling.md)** — qué investigar para elegir herramientas según el tipo de asunto, y cómo evaluar herramientas externas y piezas del catálogo `general/`.
- **[plantilla-charter-coordinador.md](plantilla-charter-coordinador.md)** — charter parametrizable (`{{ASUNTO}}` / `{{SLUG}}` / `{{MATERIA}}` / `{{PERFIL}}`), con la sección **"Frontera con otros asuntos"** para los asuntos acoplados.
- **[plantilla-convenciones-dominio.md](plantilla-convenciones-dominio.md)** — plantilla de `docs/convenciones-dominio.md`, **solo si el asunto tiene convenciones documentales propias** (nombrado, metadatos, plantillas de documento, unidades): las reglas de **dominio** se conservan ahí y las de **coordinación** las sustituye el kit. Un asunto que se conforma con la convención del vault **no crea este fichero**.
- **[plantilla-handoff.md](plantilla-handoff.md)** — handoff para relevar a un coordinador cuando su sesión llega al límite de contexto.
- **[plantilla-agente-planificador.md](plantilla-agente-planificador.md)** — definición del subagente `planificador` (Opus), que escribe el plan de un trabajo no trivial partido en tandas y solo puede escribir ficheros `plan-tanda-*.md`. Se copia como `planificador.md` a `.claude/agents/` de cada contenedor ([[ciclo_de_tandas]]).
- **[plantilla-agente-ejecutora.md](plantilla-agente-ejecutora.md)** — definición del subagente `ejecutora` (Sonnet), que hace una tanda de un plan ya revisado y devuelve un informe corto. Se copia como `ejecutora.md`, idéntica en cada contenedor.
- **[plantilla-agente-ejecutora-mecanica.md](plantilla-agente-ejecutora-mecanica.md)** — definición del subagente `ejecutora-mecanica` (Haiku 5.5 en `high`), para tandas literales que no piden criterio. Se copia como `ejecutora-mecanica.md`, idéntica en cada contenedor.
- **[plantilla-agente-probador-ui.md](plantilla-agente-probador-ui.md)** — definición del subagente `probador-ui` (Sonnet), que prueba una interfaz web con Playwright CLI, cuenta lo que ve y solo puede escribir ficheros `informe-probador-*.md`. Vive solo en la raíz del vault y se ve desde los asuntos ([[ciclo_de_tandas]], [[herramientas_comunes_de_usuario]]).
- **[plantilla-tanda-ejecutora.md](plantilla-tanda-ejecutora.md)** — **contrato de tanda**: la entrada de una tanda para el subagente `ejecutora` (anexo para `claude -p`): alcance, contexto verificado, **decisiones ya tomadas** (lo que evita las preguntas), criterios de aceptación y **la lista de comprobaciones que deben pasar en verde para dar el trabajo por terminado** (*definition of done*) sobre el producto, más un anexo para cuando la tanda tiene que ir por `claude -p` (otra raíz u otro perfil). Es la palanca de mayor retorno para reducir relevos y preguntas: **tandas bien cerradas** ([[ciclo_de_tandas]], [[orquestacion_sesiones_por_herramienta]], [[verificacion_e2e_por_agente]]).
- **[plantilla-consultor.md](plantilla-consultor.md)** + **[plantilla-settings-consultor.json](plantilla-settings-consultor.json)** — sesión **consultor read-only** (dudas factuales sobre los documentos y el estado del asunto sin gastar el contexto del coordinador; modo plan + deny de toda escritura).
- **[plantilla-brief-deep-research.md](plantilla-brief-deep-research.md)** — brief de **investigación a fondo** (se ejecuta en el chat web) con restricciones duras + enfoque "cómo SÍ" ([[vigilancia_tecnologica_bajo_demanda]]).
- **[plantilla-settings-coordinador.json](plantilla-settings-coordinador.json)** — el `.claude/settings.json` del coordinador de un asunto (perfil de **autonomía con verificación**; catálogo `general/` en solo lectura). Detalle y salvedades en [plantilla-settings-coordinador.NOTAS.md](plantilla-settings-coordinador.NOTAS.md).
- **[plantilla-contenedor-asunto/](plantilla-contenedor-asunto/)** — árbol a copiar a `<espacio>/<asunto>/`.
- **[plantilla-equipo/](plantilla-equipo/)** — los tres `docs/` de un asunto que es un equipo (análisis, problemas conocidos, registro de cambios), a copiar además del contenedor ([[coordinador_de_equipo]]).
- **[plantilla-settings-coordinador-equipo.json](plantilla-settings-coordinador-equipo.json)** — el `.claude/settings.json` del coordinador de un equipo: el del coordinador más `mcp__ha-mcp` y `mcp__proxmox` denegados enteros. Notas en [plantilla-settings-coordinador-equipo.NOTAS.md](plantilla-settings-coordinador-equipo.NOTAS.md).

*(La plantilla del README de un repositorio de código y la alineación de sus reglas no viven aquí: se fueron al pack `codigo/` → `general/comun/packs/codigo/README-repo-codigo.md`. Solo hacen falta si el asunto incluye software propio.)*

## Convención clave

- **El slug del contenedor = nombre corto y estable del asunto.** `<espacio>/<asunto>/` se llama como el asunto en el lenguaje del director (`reclamacion-agua-2026`, `obra-cocina`, `renta-2025`, `alquiler-local`), no como el organismo ni como el año a secas. Si el nombre no se entiende dentro de dos años, no sirve.
- **El coordinador de un asunto solo ve su asunto + `general/` (solo lectura).** El refuerzo técnico está en [plantilla-settings-coordinador.json](plantilla-settings-coordinador.json), y lo que de verdad lo sostiene son las **deny rules**, no la lista de herramientas permitidas.
- **Estructura uniforme del contenedor** — qué va en cada sitio y un settings por rol de sesión: [estructura_contenedor_asunto](../general/comun/doctrinas/estructura_contenedor_asunto.md). La instancia canónica es [plantilla-contenedor-asunto/](plantilla-contenedor-asunto/).
- **Un asunto, un contenedor.** Dos asuntos acoplados (la obra y la reclamación al seguro que la motivó) no se colapsan en uno: se citan por nombre del asunto.

## Punto de partida

Empieza siempre por **[checklist-arranque.md](checklist-arranque.md)**.
