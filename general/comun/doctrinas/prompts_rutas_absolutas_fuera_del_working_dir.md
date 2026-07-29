---
name: Rutas absolutas para referencias fuera del working dir
description: En los prompts operativos, toda referencia a un fichero fuera del working dir de la sesión va con ruta absoluta desde la raíz de la unidad; las relativas a otro árbol fallan en silencio.
type: convention
version: 1.0
---

Los prompts operativos se ejecutan en sesiones rooteadas en un **asunto concreto**. Una ruta **relativa a otro árbol** del disco (el vault de documentación, la carpeta de escaneos, el archivo de otro asunto) **la sesión no la puede resolver**: no encuentra el fichero y trabaja solo con lo que diga el prompt, **sin error visible** y sin que el director lo perciba.

## Regla

- **Fuera del working dir** de la sesión → **ruta absoluta** desde la raíz de la unidad (p. ej. `D:\Archivo\escrituras\nota-simple.pdf`). Si aplica, indicar que el fichero está fuera del working dir y pedir que se permita su lectura si el entorno la solicita.
- **Dentro del contenedor** del asunto → ruta **relativa** al working dir (correcto y preferible).

Aplica a referencias a documentación, carpetas del vault, doctrinas de memoria, originales escaneados, informes, etc.

Relacionada: [[formato_prompts_markdown_limpio]], [[feedback_prompt_delivery]].

> Pieza de catálogo `general/comun/doctrinas/`. v1.0 (2026-06-05). Se instala por copia en `asuntos/<asunto>/memoria/`; no se hereda.
> Adaptada al framing neutro del seed (sin referencias al dominio del software) — 2026-07-29.
