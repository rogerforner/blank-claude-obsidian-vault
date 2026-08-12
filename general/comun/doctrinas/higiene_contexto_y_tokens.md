---
name: Higiene de contexto y tokens
description: El cuello de botella es la ventana de uso, no el contexto. Los mayores ahorros son gratis (sin API): subagentes que resumen y con entregable ACOTADO (lo que devuelven entra íntegro), CLAUDE.md <200 líneas y estable, modelo fijo por sesión (no cambiar a media sesión = cache miss), /clear+artefacto en vez de /compact a ciegas, y medir con /context antes de optimizar. Dos creencias caras que NO valen: partir el CLAUDE.md en importaciones no aligera, y los servidores externos ya se cargan diferidos. "caveman" no aporta y degrada el español.
type: convention
version: 1.2
---

Optimizar **disponibilidad** (la ventana de uso semanal), no "tokens" en abstracto. El mayor desperdicio **no** es la verbosidad de salida (~25% de la sesión) sino **leer ficheros enteros** y el **cache miss por cambiar de modelo**. Las palancas que más amortizan son **gratis** (sin API):

## Reglas (gratis, alto impacto)

1. **Aislar y resumir:** la lectura voluminosa (un expediente completo, un pliego de 80 páginas, un listado de movimientos, un lote de escaneos) va a un **subagente read-only** (Haiku) que devuelve ≤ ~50 líneas densas; el contexto principal no se infla. → [[paralelismo_subagent_opus_principal]]
2. **Caché estable:** **modelo fijo** por sesión (cambiar `/model` o `/effort` = **cache miss total**, porque **la caché es por modelo**: el nuevo relee todo el historial sin un solo acierto); **CLAUDE.md < 200 líneas** y estable (lo largo → skills / reglas por ruta); no conectar/desconectar MCP a media tarea. En suscripción el **TTL de caché es de una hora**, así que la caché sobrevive a pausas cortas: **trabajar en tandas seguidas** es una palanca de cuota, no solo de comodidad.
3. **Frontera limpia:** al cerrar una fase, `handoff.md` + `/clear` (mejor que `/compact` a ciegas, que es *lossy* y caro). Reanudar una sesión larga tras una pausa larga es **la petición más cara que se puede enviar**: relee el historial entero sin caché. Handoff corto + sesión nueva gana casi siempre.
4. **Medir antes de optimizar:** usa `/context` para ver dónde se va el contexto **antes** de instalar tooling de indexado. Es la **única fuente fiable** del reparto, igual que `/usage` lo es de la cuota — y como los dos son paneles interactivos, **los ejecuta el director**, no el agente.
5. **Lo que devuelve un subagente entra íntegro.** Su aislamiento te protege del ruido intermedio, no de un informe verboso: acota el entregable en el encargo (de ahí el "≤ ~50 líneas" de la regla 1) → [[orquestacion_sesiones_por_herramienta]].
6. **La salida del hook de arranque entra como contexto.** De los puntos de enganche, solo unos pocos —el de arranque entre ellos— inyectan su salida en el contexto de la sesión. El hook de higiene debe emitir **poquísimas líneas**; lo que quiera contar largo, que lo escriba en un fichero.

## Dos creencias caras que conviene no heredar

- **Partir el `CLAUDE.md` en importaciones NO ahorra contexto.** Los ficheros importados **se cargan enteros al arrancar**: la partición organiza, no aligera. Lo que de verdad reduce lo cargado son las **reglas por ruta**, que solo entran cuando tocas ficheros que casan con su patrón — con el caveat de que una regla que **debe** cumplirse siempre no puede vivir ahí: se queda en lo siempre-activo, o se impone con una regla de denegación o un hook, que sí son deterministas.
- **Los servidores externos conectados ya no se cargan por adelantado.** Sus definiciones de herramientas están **diferidas**: al arrancar solo entran nombres e instrucciones, y el esquema completo se carga cuando una tarea lo necesita. *(Comprobado en vivo el 2026-08-12 en la sesión del coordinador general: las herramientas de los servidores conectados figuran como diferidas y hay que pedirlas explícitamente para poder usarlas.)* Consecuencia: **desactivar servidores no usados es ahorro marginal**, no la palanca grande que parecía. Antes de tocar nada ahí, medir con `/context`.

## Anti-patrones

- **"caveman" / registros telegráficos:** no superan a un simple "sé breve" ni en ahorro ni en calidad, y **degradan la prosa en español** — inaceptable cuando el producto es un escrito que va a leer un tercero. No adoptar.
- **Output-style "conciso" mal hecho:** puede *aumentar* tokens si apaga las instrucciones nativas de eficiencia.
- **Pegar el documento entero en el chat** cuando basta con la ruta: el agente lo lee él, y un subagente lo resume si es largo.
- **Workflows multiagente masivos:** agotan la ventana de uso ([[modelo_por_tarea]]).

## Sin acuses de recibo entre coordinadores

Un aviso o un encargo de otro coordinador **no se responde por cortesía**. Se responde **solo si el otro necesita un dato para seguir con una tarea**. Lo demás —"recibido", "procesado", "gracias"— gasta contexto de **dos** sesiones y abre un **bucle de conversación que no aporta nada**.

- **Sí justifica respuesta:** un dato que te pidió, un bloqueo que solo tú puedes levantar, o una decisión suya que depende de algo tuyo.
- **No la justifica:** confirmar que lo has leído, resumir lo que hiciste con su aviso, o devolver un "queda cerrado" que él no necesita para trabajar.
- **La constancia va en el ARTEFACTO, no en un mensaje:** la doctrina actualizada, el commit, la cola. Quien lo necesite lo encuentra donde vive — y así no caduca.

Relacionada: [[modelo_por_tarea]], [[paralelismo_subagent_opus_principal]], [[orquestacion_sesiones_por_herramienta]], [[convencion_organizacion_carpeta_trabajo]].

> Pieza de catálogo `general/comun/doctrinas/`. **v1.2 (2026-08-12):** de la vigilancia sobre eficiencia de contexto — el TTL de caché de una hora en suscripción (trabajar en tandas seguidas es palanca de cuota); reanudar una sesión larga es la petición más cara; `/context` como única fuente fiable del reparto y **la ejecuta el director**; que lo devuelto por un subagente entra íntegro (acotar el entregable); que la salida del hook de arranque entra como contexto; y **dos creencias caras corregidas** — partir el `CLAUDE.md` en importaciones no aligera (se cargan enteras; lo que aligera son las reglas por ruta, que no sirven para lo que debe cumplirse siempre) y los servidores externos ya se cargan **diferidos**, comprobado en vivo, así que desactivarlos es ahorro marginal. **v1.1 (2026-08-01):** añadida la regla de **sin acuses de recibo entre coordinadores** — se responde solo si el otro necesita un dato para seguir; la constancia va en el artefacto, no en un mensaje. v1.0 (2026-06-11). A partir del estudio de eficiencia de tokens (1.ª ronda de vigilancia). Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente.
> Adaptada al framing neutro del seed (sin referencias al dominio del software) — 2026-07-29.
