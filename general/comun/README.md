# `general/comun/` — catálogo transversal

Piezas de catálogo **transversales a cualquier asunto** (una reclamación, una obra, una declaración, un contrato, un presupuesto). Todo lo de aquí es candidato a instalarse en cualquier asunto del vault.

## La regla de oro

Se **lee** desde el catálogo; **no** se copia salvo motivo declarado y **no se hereda** automáticamente.

Un coordinador de asunto **ve este catálogo pero no puede escribir en él** —su sesión se configura para que solo pueda leerlo— y **lo consulta como referencia**. Un `[[wikilink]]` sin copia local **resuelve aquí, y es lo correcto**: no es un olvido. `asuntos/<asunto>/memoria/` es para las doctrinas **propias** de ese asunto.

Por qué no por copia: copiar no da autonomía, solo **la obligación de acordarse de traer las actualizaciones después**. Una copia desfasada **miente** con la autoridad de estar instalada, y una copia idéntica no aporta nada mientras el asunto viva dentro del vault. Se copia solo para **fijar** a propósito una versión (diciendo por qué) o si el contenedor va a **salir** del vault; entonces es una **copia congelada en ese momento**, con su número de `version` anotado, y **quien copió es quien tiene que traer los cambios posteriores** — el catálogo seguirá avanzando y esa copia no se entera sola.

Y tampoco por herencia automática: nada se auto-provee. Lo que aplica a un asunto se decide al arrancarlo, con su commit y su motivo.

## Buckets

- **[doctrinas/](doctrinas/MEMORY-doctrinas-index.md)** — doctrinas de coordinación entre el director y la IA. **Empieza por el índice.** Están agrupadas en prompts y comunicación · modelo de trabajo y sesiones · criterio y método. *(El recuento no se escribe aquí a propósito: un número en prosa que nadie comprueba acaba mintiendo. El índice es la cuenta.)*
- **[tooling-documentos.md](tooling-documentos.md)** — tooling **local** (sin servicios en la nube) para tareas de documentos: Docling (transcripción/extracción de PDF escaneados), Pandoc (conversión de formatos) y WeasyPrint (PDF maquetado). Pieza de primera clase en un vault de papeles: es lo que convierte un escaneo en texto trabajable y un `.md` en un documento presentable.
- **[troubleshooting-claude-code.md](troubleshooting-claude-code.md)** — resolución de problemas concretos de Claude Code (CLI / app de escritorio) en Windows. Se amplía con una entrada por problema resuelto.
- **`packs/`** — paquetes **opcionales** de doctrinas para un dominio concreto, que solo se instalan si el vault lo toca. Hoy hay uno: el pack `codigo/` → [`packs/codigo/`](packs/codigo/README.md), con lo específico de trabajar con repositorios de software. **El core no depende de ningún pack**: si tu vault no toca software, ignora el bucket entero y nada queda cojo.
- **`convenciones/`**, **`plantillas/`**, **`briefs/`**, **`skills/`**, **`mcps/`** — se crean **cuando hay una pieza real que colocar** (no se crean vacíos; ver [[adopcion_tooling_externo_caso_uso_concreto]]). De momento, las convenciones operativas conviven con las doctrinas en `doctrinas/`, y las plantillas de arranque viven en [`../../inicializador/`](../../inicializador/README.md).

## Versionado de doctrinas

- Cada doctrina/convención lleva **`version`** en el frontmatter. La versión **sube** cuando su contenido cambia de forma sustantiva; el cambio se anota en el **footer** de la propia doctrina (changelog corto) y, si es relevante para el kit, en `_meta/bitacora.md`.
- La **fuente de verdad versionada** es este catálogo `general/`, y los asuntos lo leen de aquí. Si un asunto llega a fijar una copia (motivo declarado), esa copia queda congelada en ese momento y traer los cambios posteriores corre a cargo de quien la hizo.
- Al actualizar una doctrina, **actualiza su entrada en el índice en el mismo commit**: un índice desfasado miente en silencio ([[verificacion_fuente_primaria]]).
