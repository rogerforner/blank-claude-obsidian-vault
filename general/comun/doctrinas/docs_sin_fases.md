---
name: Documentación de onboarding sin referencias a fases ni identificadores históricos
description: La documentación que un nuevo lector consume para entender y empezar (README del asunto, guías operativas, CLAUDE.md) es autocontenida y no menciona fases, identificadores de tanda ni narra el proceso de trabajo; los docs de tracking/histórico interno sí pueden.
type: doctrine
version: 1.0
---

La documentación de **onboarding** debe ser **autocontenida, minimalista y directa**, estilo "de usuario para usuario". Su único objetivo es que alguien que llega de nuevo —el director dentro de seis meses, un familiar, la gestoría, un perito— entienda el asunto y pueda operar rápido. **No es registro histórico ni narración del proceso.**

## Distinción canónica

### Docs de ONBOARDING — sin fases, sin identificadores de tanda, sin historia interna

Ficheros cuyo propósito es **explicar qué es el asunto y cómo trabajar con él**: `README.md`, `CLAUDE.md`, `charter-coordinador.md`, y los `docs/*.md` cuando son guías operativas o resúmenes de estado.

**Reglas:**
1. **No mencionar fases** ni etapas internas.
2. **No mencionar identificadores de tanda** (B-XX, R-XX, etc.).
3. **No narrar el proceso** de trabajo ("durante la segunda tanda se redactó…").
4. **Sí** describir el estado actual del asunto, sus plazos, sus contratos y sus convenciones.
5. Estilo directo, conciso, frases cortas, tablas y listas cuando aporten. Cero floritura.

Ejemplo: el `README.md` de una reclamación dice *"reclamación por daños de agua; presentada el 3-mar; pendiente de resolución, plazo de respuesta hasta el 3-jun"*, **no** *"en la fase 2 se recopilaron los presupuestos y en la fase 3 se redactó el escrito"*.

### Docs de TRACKING / HISTÓRICO INTERNO — sí pueden tener identificadores históricos

Bitácoras, informes de tanda, síntesis de sesiones operativas, memoria del coordinador. Mantienen su nomenclatura histórica, pero **no son lectura de onboarding**; si un README los menciona, debe etiquetarlos como "registro interno, no necesario para empezar".

## Aplicación en prompts del coordinador

Si el documento a tocar es de **onboarding**, prohibir explícitamente al agente introducir referencias a la tanda **en el contenido** del documento. El **mensaje de commit** sí puede mencionar la tanda; el `.md` modificado, no.

Relacionada: [[formato_prompts_markdown_limpio]], [[estructura_contenedor_asunto]].

> Pieza de catálogo `general/comun/doctrinas/`. v1.0 (2026-06-05). Se instala por copia en `asuntos/<asunto>/memoria/`; no se hereda.
> Adaptada al framing neutro del seed (sin referencias al dominio del software) — 2026-07-29.
