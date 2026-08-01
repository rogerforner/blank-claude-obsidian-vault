# `general/comun/` — catálogo transversal

Piezas de catálogo **transversales a cualquier asunto** (una reclamación, una obra, una declaración, un contrato, un presupuesto). Todo lo de aquí es candidato a instalarse en cualquier asunto del vault.

## La regla de oro

**Se **lee** desde el catálogo; **no** se copia salvo motivo declarado y **no se hereda** automáticamente.**

Un coordinador de asunto **ve este catálogo en read-only** y **copia** a `asuntos/<asunto>/memoria/` solo las piezas que su asunto necesita. La copia es un **snapshot con su `version`**: no se actualiza sola. Cuando el catálogo evoluciona, el coordinador del asunto **resincroniza** explícitamente lo que le afecte.

Por qué así y no por herencia automática: un asunto abierto no debe cambiar de reglas a mitad de camino porque alguien haya editado el catálogo. La actualización es un acto deliberado, con su commit y su motivo.

## Buckets

- **[doctrinas/](doctrinas/MEMORY-doctrinas-index.md)** — doctrinas de coordinación entre el director y la IA. **Empieza por el índice.** Son 24 piezas del core, agrupadas en prompts y comunicación · modelo de trabajo y sesiones · criterio y método.
- **[tooling-documentos.md](tooling-documentos.md)** — tooling **local** (sin servicios en la nube) para tareas de documentos: Docling (transcripción/extracción de PDF escaneados), Pandoc (conversión de formatos) y WeasyPrint (PDF maquetado). Pieza de primera clase en un vault de papeles: es lo que convierte un escaneo en texto trabajable y un `.md` en un documento presentable.
- **[troubleshooting-claude-code.md](troubleshooting-claude-code.md)** — resolución de problemas concretos de Claude Code (CLI / app de escritorio) en Windows. Se amplía con una entrada por problema resuelto.
- **`packs/`** — paquetes **opcionales** de doctrinas para un dominio concreto, que solo se instalan si el vault lo toca. Hoy hay uno: el pack `codigo/` → [`packs/codigo/`](packs/codigo/README.md), con lo específico de trabajar con repositorios de software. **El core no depende de ningún pack**: si tu vault no toca software, ignora el bucket entero y nada queda cojo.
- **`convenciones/`**, **`plantillas/`**, **`briefs/`**, **`skills/`**, **`mcps/`** — se crean **cuando hay una pieza real que colocar** (no se crean vacíos; ver [[adopcion_tooling_externo_caso_uso_concreto]]). De momento, las convenciones operativas conviven con las doctrinas en `doctrinas/`, y las plantillas de arranque viven en [`../../inicializador/`](../../inicializador/README.md).

## Versionado de doctrinas

- Cada doctrina/convención lleva **`version`** en el frontmatter. La versión **sube** cuando su contenido cambia de forma sustantiva; el cambio se anota en el **footer** de la propia doctrina (changelog corto) y, si es relevante para el kit, en `_meta/bitacora.md`.
- La **fuente de verdad versionada** es este catálogo `general/`. Las copias instaladas en los asuntos son snapshots.
- Al actualizar una doctrina, **actualiza su entrada en el índice en el mismo commit**: un índice desfasado miente en silencio ([[verificacion_fuente_primaria]]).
