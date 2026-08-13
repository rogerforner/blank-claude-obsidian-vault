---
name: Higiene de contexto y tokens
description: El cuello de botella es la ventana de uso, no el contexto. Los mayores ahorros son gratis (sin API): subagentes que resumen y con entregable ACOTADO (lo que devuelven entra íntegro), CLAUDE.md <200 líneas y estable, modelo fijo por sesión (no cambiar a media sesión = cache miss), /clear+artefacto en vez de /compact a ciegas, y medir con /context antes de optimizar. Dos creencias caras que NO valen: partir el CLAUDE.md en importaciones no aligera, y los servidores externos ya se cargan diferidos. "caveman" no aporta y degrada el español.
type: convention
version: 1.5
---

Optimizar **disponibilidad** (la ventana de uso semanal), no "tokens" en abstracto. El mayor desperdicio **no** es la verbosidad de salida (~25% de la sesión) sino **leer ficheros enteros** y el **cache miss por cambiar de modelo**. Las palancas que más amortizan son **gratis** (sin API):

## Reglas (gratis, alto impacto)

1. **Aislar y resumir:** la lectura voluminosa (un expediente completo, un pliego de 80 páginas, un listado de movimientos, un lote de escaneos) va a un **subagente read-only** (Haiku) que devuelve ≤ ~50 líneas densas; el contexto principal no se infla. → [[paralelismo_subagent_opus_principal]]
2. **Caché estable:** **modelo fijo** por sesión (cambiar `/model` o `/effort` = **cache miss total**, porque **la caché es por modelo**: el nuevo relee todo el historial sin un solo acierto); **CLAUDE.md < 200 líneas** y estable (lo largo → skills / reglas por ruta); no conectar/desconectar MCP a media tarea. En suscripción el **TTL de caché es de una hora**, así que la caché sobrevive a pausas cortas: **trabajar en tandas seguidas** es una palanca de cuota, no solo de comodidad.
3. **Frontera limpia:** al cerrar una fase, `handoff.md` + `/clear` (mejor que `/compact` a ciegas, que es *lossy* y caro). Reanudar una sesión larga tras una pausa larga es **la petición más cara que se puede enviar**: relee el historial entero sin caché. Handoff corto + sesión nueva gana casi siempre.
4. **Medir antes de optimizar:** usa `/context` para ver dónde se va el contexto **antes** de instalar tooling de indexado. Es la **única fuente fiable** del reparto, igual que `/usage` lo es de la cuota — y como los dos son paneles interactivos, **los ejecuta el director**, no el agente.
5. **Lo que devuelve un subagente entra íntegro.** Su aislamiento te protege del ruido intermedio, no de un informe verboso: acota el entregable en el encargo (de ahí el "≤ ~50 líneas" de la regla 1) → [[orquestacion_sesiones_por_herramienta]].
6. **La salida del hook de arranque entra como contexto.** De los puntos de enganche, solo unos pocos —el de arranque entre ellos— inyectan su salida en el contexto de la sesión. El hook de higiene debe emitir **poquísimas líneas**; lo que quiera contar largo, que lo escriba en un fichero.

## La ventana se degrada MUCHO antes de llenarse, y al compactar se pierden reglas

Esto es lo que convierte la regla 3 de "buena práctica" en **mecánica conocida**. Ninguna de estas cifras es documentación oficial del fabricante: vienen de investigación citada por la comunidad y de incidencias abiertas, así que se tratan como **riesgo a vigilar**, no como especificación.

- **La degradación empieza sobre el 70% de ocupación** —precisión visible a la baja—, las invenciones se disparan hacia el 85%, y la compactación automática salta muy tarde, sobre el 95%: **para cuando compacta sola, llevas rato recibiendo trabajo peor**. Del propio equipo del producto sale la recomendación de **compactar a propósito al 50-60%** en vez de esperar.
- **El deterioro aparece alrededor de los 100.000 tokens, sea cual sea el tamaño de la ventana.** Una ventana de 1M **no** significa fidelidad uniforme en todo su recorrido: significa que cabe más, no que se recuerde igual.
- **Respaldo externo, y por eso esto deja de ser una observación de campo** *(dos investigaciones independientes, 2026-08-14)*: el fenómeno está estudiado como **degradación por longitud de contexto** (Chroma Research, 14-jul-2025, 18 modelos frontera) — *"el rendimiento se vuelve cada vez menos fiable a medida que crece la entrada"*, con caídas de precisión **muy por debajo del límite documentado** de la ventana. Y la curva en **U** de Liu et al. (TACL 2024): lo que queda **en el medio** del contexto se recupera peor que lo que está al principio o al final, con caídas de más del 30 %, replicado en seis familias de modelos. **Consecuencia práctica para el método: lo que se auto-carga al arrancar empuja el contrato de trabajo hacia esa zona media.** Cuanto más marco común entra por delante, peor se lee lo que de verdad hay que hacer.
- **Al compactar, el fichero de reglas de la raíz se vuelve a leer entero, pero las reglas de ámbito acotado y el contexto de los hooks NO sobreviven**: quedan en paráfrasis. Hay incidencias abiertas sobre esto. **Consecuencia directa para un vault por asuntos:** tras una compactación, lo que puede evaporarse es justo lo propio del asunto, mientras las reglas comunes siguen firmes — y nada avisa.

**Qué se hace con esto, hoy y sin instalar nada:** lo de siempre, pero ahora con el porqué. **Relevo y sesión nueva antes de llegar al 70%**, no compactación a ciegas; el estado vivo en ficheros, que es lo único que ninguna compactación puede perder; y si una sesión ha compactado, **se asume que sus reglas de asunto están en paráfrasis** y se releen antes de decidir nada delicado.

*(Mitigación pendiente de piloto, no adoptada: un enganche de arranque con disparador de compactación que reinyecte las reglas del asunto. Es barato y encaja con el hook que ya existe, pero **no se instala sin caso de uso medido** → [[adopcion_tooling_externo_caso_uso_concreto]].)*

## Dónde está el contexto de verdad: la mayor parte NO la controla el vault

**Medido el 2026-08-14 con `/context`, y corrigió una cifra que el propio coordinador había derivado sumando tamaños de fichero.** Antes de leer un solo documento del vault, una sesión ya lleva **~44,5k tokens** repartidos así: **herramientas del sistema ~14k**, **habilidades ~9,7k**, **servidores externos activos ~8,8k**, **ficheros de reglas ~6,4k** y **prompt de sistema ~5,6k**.

**El vault manda en menos de una séptima parte.** Todo lo demás es **configuración del cliente**: complementos instalados y servidores conectados. En la medición había habilidades de dominios que ese vault no toca —jurídico, ingeniería de software— y varias **duplicadas entre dos complementos**, más un servidor pesado que servía a **un solo asunto** y se cargaba en todas las sesiones.

**Consecuencia práctica, y es contraintuitiva: desinstalar lo que no se usa y acotar los servidores por proyecto rinde varias veces más que podar el kit.** Optimizar los ficheros de reglas sin haber mirado esto es trabajar en el 14 % del problema.

> **Y la distinción que hay que tener clara antes de optimizar nada: AUTO-CARGADO no es lo mismo que LEÍDO AL ARRANCAR.**
>
> - **Auto-cargado** es lo que entra sin que nadie lo pida —el fichero de reglas de la raíz y los que se acumulan hasta la carpeta de trabajo—. Aparece en `/context` como ficheros de memoria y **no se puede evitar**, solo adelgazar.
> - **Leído al arrancar** es lo que entra porque una instrucción lo manda abrir —el índice del catálogo, la cola, el charter—. **No aparece como fichero de memoria**, cuesta igual cuando se lee, y **sí se puede hacer selectivo** sin tocar ninguna herramienta.
>
> **Confundirlos lleva a optimizar el fichero equivocado.** La regla operativa no cambia: **`/context` primero, decisiones después**. Sumar bytes de ficheros **no es medir contexto**.

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

> Pieza de catálogo `general/comun/doctrinas/`. **v1.5 (2026-08-14): medido con `/context`, y la mayor parte del contexto NO la controla el vault.** ~44,5k tokens antes de leer nada, de los que los ficheros de reglas son 6,4k: el resto son **habilidades y servidores instalados en el cliente**, con dominios que el vault no toca y duplicados entre complementos. **Desinstalar lo que no se usa y acotar servidores por proyecto rinde más que podar el kit.** Y se fija la distinción que faltaba —**auto-cargado ≠ leído al arrancar**—, porque confundirlas lleva a optimizar el fichero equivocado. **Nació de un error propio:** el coordinador derivó un porcentaje **sumando tamaños de fichero** en vez de medir, y la regla de medir primero ya estaba escrita en esta misma doctrina. **v1.4 (2026-08-14): la degradación por contexto largo deja de ser observación de campo y pasa a tener respaldo externo datado** — Chroma Research (14-jul-2025, 18 modelos frontera) y la curva en U de Liu et al. (TACL 2024), traídos por dos investigaciones independientes sobre el mismo encargo. **Lo que añade de operativo, y no es menor:** lo que queda **en el medio** del contexto se recupera peor, así que **todo lo que se auto-carga al arrancar empuja el contrato de trabajo hacia esa zona**. Cuanto más marco común entra por delante, peor se lee lo que hay que hacer. **v1.3 (2026-08-12):** de la vigilancia sobre integración con una segunda IA, que trajo de paso lo más útil **sobre la herramienta que ya usamos**: la ventana **se degrada mucho antes de llenarse** (visible al ~70%, invenciones al ~85%, compactación automática al ~95%, y deterioro alrededor de los 100.000 tokens **sea cual sea el tamaño de la ventana**), y **al compactar sobreviven las reglas de la raíz pero no las de ámbito acotado ni el contexto de los hooks**. Eso convierte "relevo mejor que compactar" de preferencia en mecánica, y añade una consecuencia propia de un vault por asuntos: tras compactar, lo que se evapora es justo lo del asunto. Cifras de comunidad e incidencias abiertas, **no de documentación oficial**: se tratan como riesgo a vigilar. El enganche de reinyección queda **propuesto y sin instalar**, a la espera de caso de uso medido. **v1.2 (2026-08-12):** de la vigilancia sobre eficiencia de contexto — el TTL de caché de una hora en suscripción (trabajar en tandas seguidas es palanca de cuota); reanudar una sesión larga es la petición más cara; `/context` como única fuente fiable del reparto y **la ejecuta el director**; que lo devuelto por un subagente entra íntegro (acotar el entregable); que la salida del hook de arranque entra como contexto; y **dos creencias caras corregidas** — partir el `CLAUDE.md` en importaciones no aligera (se cargan enteras; lo que aligera son las reglas por ruta, que no sirven para lo que debe cumplirse siempre) y los servidores externos ya se cargan **diferidos**, comprobado en vivo, así que desactivarlos es ahorro marginal. **v1.1 (2026-08-01):** añadida la regla de **sin acuses de recibo entre coordinadores** — se responde solo si el otro necesita un dato para seguir; la constancia va en el artefacto, no en un mensaje. v1.0 (2026-06-11). A partir del estudio de eficiencia de tokens (1.ª ronda de vigilancia). Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente.
> Adaptada al framing neutro del seed (sin referencias al dominio del software) — 2026-07-29.
