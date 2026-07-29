---
name: Higiene de contexto y tokens
description: El cuello de botella es la ventana de uso, no el contexto. Los mayores ahorros son gratis (sin API): subagentes que resumen, CLAUDE.md <200 líneas y estable, modelo fijo por sesión (no cambiar a media sesión = cache miss), /clear+artefacto en vez de /compact a ciegas, y medir con /context antes de optimizar. "caveman" no aporta y degrada el español.
type: convention
version: 1.0
---

Optimizar **disponibilidad** (la ventana de uso semanal), no "tokens" en abstracto. El mayor desperdicio **no** es la verbosidad de salida (~25% de la sesión) sino **leer ficheros enteros** y el **cache miss por cambiar de modelo**. Las palancas que más amortizan son **gratis** (sin API):

## Reglas (gratis, alto impacto)

1. **Aislar y resumir:** la lectura voluminosa (un expediente completo, un pliego de 80 páginas, un listado de movimientos, un lote de escaneos) va a un **subagente read-only** (Haiku) que devuelve ≤ ~50 líneas densas; el contexto principal no se infla. → [[paralelismo_subagent_opus_principal]]
2. **Caché estable:** **modelo fijo** por sesión (cambiar `/model` o `/effort` = **cache miss total**); **CLAUDE.md < 200 líneas** y estable (lo largo → skills / reglas por ruta); no conectar/desconectar MCP a media tarea; **desactivar MCP no usados**.
3. **Frontera limpia:** al cerrar una fase, `handoff.md` + `/clear` (mejor que `/compact` a ciegas, que es *lossy* y caro).
4. **Medir antes de optimizar:** usa `/context` para ver dónde se va el contexto **antes** de instalar tooling de indexado.

## Anti-patrones

- **"caveman" / registros telegráficos:** no superan a un simple "sé breve" ni en ahorro ni en calidad, y **degradan la prosa en español** — inaceptable cuando el producto es un escrito que va a leer un tercero. No adoptar.
- **Output-style "conciso" mal hecho:** puede *aumentar* tokens si apaga las instrucciones nativas de eficiencia.
- **Pegar el documento entero en el chat** cuando basta con la ruta: el agente lo lee él, y un subagente lo resume si es largo.
- **Workflows multiagente masivos:** agotan la ventana de uso ([[modelo_por_tarea]]).

Relacionada: [[modelo_por_tarea]], [[paralelismo_subagent_opus_principal]], [[orquestacion_sesiones_por_herramienta]], [[convencion_organizacion_carpeta_trabajo]].

> Pieza de catálogo `general/comun/doctrinas/`. v1.0 (2026-06-11). A partir del estudio de eficiencia de tokens (1.ª ronda de vigilancia). Se instala por copia en `asuntos/<asunto>/memoria/`; no se hereda.
> Adaptada al framing neutro del seed (sin referencias al dominio del software) — 2026-07-29.
