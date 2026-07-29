---
name: Tooling de documentos — transcripción, conversión y PDF (Docling, Pandoc, WeasyPrint)
description: Herramientas LOCALES (sin servicios en la nube) y OPCIONALES para tareas de documentos. Docling = transcripción/extracción de PDF/DOCX/PPTX/imágenes a Markdown/JSON estructurado (con OCR y tablas). Pandoc = conversión universal de formatos. WeasyPrint = HTML/CSS → PDF con estilos. Recomiéndalas cuando surja la necesidad de transcribir, convertir o generar un PDF. Instalación per-máquina, a demanda.
type: knowledge
version: 1.0
---

Tooling **local** (corre en la máquina, **sin subir nada a ningún servicio**) para las tareas de documentos más comunes. **Es OPCIONAL**: no se instala por defecto. Cuando haga falta **transcribir/extraer**, **convertir de un formato a otro** o **generar un PDF**, el coordinador **recomienda estas herramientas y explica por qué**, en vez de ponerse a inventariar qué hay instalado.

**Por qué es una pieza de primera clase en un vault de papeles.** Un asunto doméstico llega casi siempre en el peor formato posible: un PDF escaneado de la aseguradora, un DOCX de la gestoría, una foto del contador hecha con el móvil. Sin transcripción no hay nada que la IA pueda leer, cotejar ni citar; y sin conversión no hay nada presentable que devolver. Esta página es la bisagra entre "papeles" y "trabajo coordinado".

## Cuándo recomendar cada una

| Necesidad | Herramienta | Instalación |
|---|---|---|
| **Transcribir/extraer** texto de PDF/DOCX/PPTX/imágenes a texto **estructurado** (Markdown/JSON), con tablas y OCR | **Docling** | `pip install docling` (Python) |
| **Convertir** entre formatos (Markdown ↔ DOCX ↔ HTML ↔ LaTeX ↔ EPUB ↔ …) | **Pandoc** | binario standalone (no Python) |
| **Generar un PDF con maquetación/estilos** | **WeasyPrint** (HTML/CSS → PDF); normalmente **Pandoc → HTML → WeasyPrint → PDF** | `pip install weasyprint` (Python) |

## Docling

Transcripción/extracción **avanzada** de documentos: convierte PDF (incl. escaneados, con OCR), DOCX, PPTX, HTML e imágenes en **Markdown o JSON estructurado**, preservando estructura (títulos, **tablas**, listas, layout). Más potente que un simple "pdf-a-texto" porque entiende la estructura — y en un expediente lo que importa suele estar **en una tabla** (importes, fechas, referencias).

Cuándo recomendarla: hay que **transcribir** una resolución escaneada, **extraer** los importes de un lote de facturas, o convertir a texto un pliego para poder citarlo por apartados.

## Pandoc

Conversor **universal** de formatos (Markdown, DOCX, HTML, LaTeX, EPUB, RST, etc.). Binario **standalone**. Cuándo recomendarlo: hay que **entregar** un documento en el formato que pide el destinatario — el borrador vive en `.md` en el vault y la gestoría lo quiere en `.docx`, o el organismo exige PDF. Para PDF, Pandoc genera uno básico; para **PDF con estilos** conviene encadenarlo con WeasyPrint.

## WeasyPrint

Renderiza **HTML + CSS → PDF** con control de **maquetación y estilos** (tipografías, márgenes, cabeceras/pies, paginación, numeración). Cuándo recomendarlo: el PDF debe **presentarse** ante alguien —un juzgado, una aseguradora, un cliente— y no ser un volcado plano. **Patrón recomendado:** `Pandoc` convierte el `.md` a **HTML**, una hoja **CSS** da el estilo, y **WeasyPrint** produce el **PDF final maquetado**. Así separas contenido (Markdown, versionado y comparable en git) de presentación (CSS, reutilizable en todos los asuntos).

## Flujos típicos

- **Escaneo → texto trabajable:** Docling sobre el PDF de la resolución → `.md` en `docs/`. El original **no se toca** ([[estructura_contenedor_asunto]]); el `.md` es una transcripción, y como tal se **coteja con la fuente** antes de darlo por bueno ([[verificacion_fuente_primaria]]).
- **Lote de facturas → tabla:** Docling extrae, un script corto tabula importes y fechas, y se suma para cotejar con el total reclamado ([[scripts_adhoc_tareas_repetitivas]]).
- **Borrador → entregable:** `.md` → Pandoc → HTML → WeasyPrint → PDF maquetado, listo para firmar y presentar. El envío es **puerta humana**: el agente deja el PDF hecho, no lo manda.

## Soberanía y datos

Las tres corren **en local** → el documento **no sale de la máquina**. Es la razón por la que se recomiendan estas y no un conversor web: un expediente doméstico lleva DNI, cuentas, informes médicos y datos de terceros, y eso no se sube a un servicio ajeno ([[sensitive_file_guard]]). A diferencia de un servicio en la nube, estas herramientas son **aptas incluso para documentos con datos personales**.

## Licencias

- **Docling** — permisiva (MIT) → uso directo OK.
- **WeasyPrint** — permisiva (BSD-3-Clause) → uso directo OK.
- **Pandoc** — **GPL (copyleft)**, pero aquí se usa como **herramienta de línea de comandos invocada** (se ejecuta el binario; no se incorpora su código a nada nuestro) → invocar una herramienta no contagia su licencia. OK. *(Los criterios de licencia para proyectos de software viven en el pack `codigo/`.)*
- *(Confirmar la variante exacta de licencia en la fuente oficial antes de cualquier decisión vinculante — [[verificacion_fuente_primaria]].)*

## Opcional + adopción

No son obligatorias ni son dependencia del vault: **instalación per-máquina y a demanda** (no se versiona). Pasan el gate de [[adopcion_tooling_externo_caso_uso_concreto]] cuando hay **caso de uso presente** (hay papeles escaneados que transcribir, o un entregable que presentar en PDF/Word). El coordinador **coordina, no ejecuta**: si la tarea es pesada (transcribir un lote, generar muchos PDF), la **delega a una sesión CLI** vía prompt ([[orquestacion_sesiones_por_herramienta]]).

> Pieza de catálogo `general/comun/`. v1.0 (2026-06-15). Tooling LOCAL **opcional** para tareas de documentos (transcripción/conversión/PDF). Se **consulta read-only**; NO se instala por copia en `memoria/` (no es doctrina, es conocimiento de catálogo). La instalación de las herramientas es per-máquina, a demanda.
> Adaptada al framing neutro del seed (sin referencias a repositorios de software) — 2026-07-29. Lo específico de software vive en el pack `codigo/`.
