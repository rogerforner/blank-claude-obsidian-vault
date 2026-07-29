---
name: Verificación de extremo a extremo ejecutada por el agente
description: Las comprobaciones que se pueden ejecutar con comandos (sin interacción humana) las ejecuta el agente como criterio de cierre y reporta el output literal; no se delegan al director. Lo que no se puede comprobar por comando se comprueba EN CAMPO y se documenta el procedimiento.
type: doctrine
version: 1.1
---

Cualquier comprobación de extremo a extremo que pueda ejecutarse con comandos automáticos la **ejecuta el agente de la sesión** como parte del criterio de cierre, **no el director**.

> **Comprobación en campo (v1.1).** Lo que no se puede automatizar no desaparece del criterio de cierre: se convierte en una **comprobación en campo** con procedimiento escrito. El agente ejecuta todo lo comprobable por comando y **reporta el output literal**; para el resto entrega **los pasos exactos** que el director debe seguir y **qué resultado esperar**. *(El refuerzo mecánico por hook, que impide cerrar el turno con la puerta en rojo, vive en el pack `codigo/` → [[gates_de_calidad_locales]].)*

## Qué es comprobable por comando en un vault de trabajo

- **Que el fichero existe donde se dice** y no está vacío (`ls`, `certutil -hashfile`, tamaño).
- **Que el documento generado abre y tiene lo que debe**: número de páginas del PDF, que el `.docx` no está corrupto, que el anexo citado existe como fichero.
- **Que las cifras cuadran**: sumar una columna con un comando o un script corto y comparar con el total escrito ([[scripts_adhoc_tareas_repetitivas]]).
- **Que las referencias internas no están colgadas**: cada enlace y cada anexo citado apunta a algo que existe.
- **Que no se ha colado un dato que no debía versionarse** ([[sensitive_file_guard]]).

## Patrón en el prompt

1. Incluir los **comandos exactos** en la sección "Verificación al cerrar".
2. Marcar explícitamente que el agente los ejecuta **antes** de generar el reporte final.
3. Reportar el **output literal** al director — no un resumen, no un "todo correcto".
4. Si el output revela un problema, el agente **escala** antes de cerrar — no genera un reporte de "todo OK" que lo tape.

## Cómo distinguir qué ejecuta el agente y qué el director

Pregunta: *"¿puede el agente ejecutar esta comprobación con sus herramientas y el entorno disponible, sin interacción humana?"*

- **Sí** → lo ejecuta el agente y reporta el output.
- **No** → lo hace el director **en campo**, y el agente **documenta el procedimiento** para que sea reproducible.

Comprobaciones en campo legítimas: medir algo físicamente (una obra, un metro cuadrado), cotejar con un original en papel que no está escaneado, entrar en una sede electrónica con certificado, llamar por teléfono a un organismo, o comprobar que un envío llegó. Todas se **documentan**, no se dan por hechas.

Relacionada: [[modelo_por_tarea]], [[minimizar_askuserquestion_agente_operativo]], [[verificacion_fuente_primaria]], [[scripts_adhoc_tareas_repetitivas]].

> Pieza de catálogo `general/comun/doctrinas/`. **v1.1 (2026-07-28):** lo no automatizable pasa a **comprobación en campo** con procedimiento escrito, en vez de quedar fuera del criterio de cierre. v1.0 (2026-06-05). Se instala por copia en `asuntos/<asunto>/memoria/`; no se hereda.
> Adaptada al framing neutro del seed (sin referencias al dominio del software) — 2026-07-29.
