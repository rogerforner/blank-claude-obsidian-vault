---
name: Documentación de onboarding sin referencias a fases ni identificadores históricos
description: La documentación que un nuevo lector consume para entender y empezar (README del asunto, guías operativas, CLAUDE.md) es autocontenida y no menciona fases, identificadores de tanda ni narra el proceso de trabajo; los docs de tracking/histórico interno sí pueden.
type: doctrine
version: 1.2
index_summary: >-
  README/CLAUDE.md/charter autocontenidos, sin identificadores históricos ni narración del proceso; el tracking interno sí puede. **Y una TERCERA clase (v1.1): los docs de DECISIÓN.** El *porqué* deja de vivir solo en el histórico de cambios —que supone que siempre habrá quien lo lea— y entra en `docs/decisiones/`, una ficha numerada por decisión. La distinción: la narrativa de **proceso** sigue fuera, la **razón** entra, con sus alternativas descartadas y **la condición que reabriría el caso**. Se escribe cuando se descarta una alternativa real, no en cada cambio. **Y una CUARTA (v1.2): los docs OPERATIVOS.** El criterio de suficiencia de `docs/` es que el director, sin ninguna IA, pueda operar, mantener y recuperar lo montado: un runbook por cosa montada, con comandos exactos, escrito para quien no estuvo en la sesión y actualizado en la misma tanda que el cambio. Lo que solo está en una conversación no está documentado; los secretos no van, solo dónde están.
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

### Docs de DECISIÓN — el PORQUÉ vive aquí, no solo en el commit

*(Tercera clase, añadida el 2026-09-04 a propuesta del director.)*

**El problema que resuelve, y es real:** las dos clases de arriba dejaban el *porqué* fuera de `docs/` y lo remitían al histórico de cambios y a la cola. **Eso funciona mientras haya quien lea el histórico.** El día que no lo haya —o simplemente cuando nadie vuelva a mirarlo, que es lo que pasa siempre— **quien abra `docs/` verá QUÉ hay montado y no por qué se descartó lo demás.** Y en un asunto técnico se descarta mucho: una topología, un emplazamiento, un producto, una vía entera.

> **La distinción que decide qué entra: la narrativa de PROCESO se queda fuera; la RAZÓN de la decisión entra.**
>
> - **Fuera:** por qué bloques pasó el trabajo, qué tanda lo hizo, en qué orden se probó. **Eso no le importa a nadie dentro de un año.**
> - **Dentro:** qué se decidió, **qué alternativas se descartaron y por qué**, qué restricción lo forzó, y **qué haría reconsiderarlo**.

**Dónde:** `docs/decisiones/`, una ficha por decisión, numeradas y con título hablado — `0001_titulo_en_minusculas.md`. *(Los asuntos que ya numeran sus carpetas de `docs/` pueden mantener su prefijo; lo que no cambia es que la carpeta exista y que la ficha lleve número.)*

**Cuándo se escribe una:** **cuando se descarta una alternativa real**, no en cada cambio. Si no había alternativa, no hay decisión que documentar — hay un hecho, y ese va en la documentación operativa.

**Qué lleva dentro, como mínimo:** la decisión en una frase · el contexto que la forzó · **las alternativas consideradas y el motivo de descarte de cada una** · las consecuencias asumidas · y **la condición que la reabriría**. Ese último punto es el que más se olvida y el que evita que alguien vuelva a proponer lo ya descartado sin dato nuevo.

**Por qué esto no deroga lo anterior, lo afina:** una ficha de decisión **no narra el proceso** —sigue prohibido— y **no es un diario**. Es documentación de consulta como las demás: se lee para entender el sistema, no para reconstruir cómo se llegó a él.

**Y el criterio que lo justifica, en una línea del director:** *la documentación de un asunto tiene que poder seguirla una **persona**, sin IA y sin leer el histórico de cambios.*

### Docs operativos: que una persona sola pueda hacerlo

*(Cuarta clase, añadida el 2026-10-04 por decisión del director: "Es importante la documentación porque es la única manera que si alguna vez he de hacer algo yo sin ayuda de la IA lo pueda hacer.")*

**El criterio de suficiencia de `docs/`:** el director, sin ayuda de ninguna IA, puede operar, mantener y recuperar lo que el asunto ha montado o decidido. Es la única garantía de que el trabajo no depende de que haya una sesión disponible.

**Qué hacer:**
- **Un runbook en `docs/` por cada cosa montada**, con: qué hay y dónde (máquinas, direcciones, rutas, cuentas por su nombre, nunca sus secretos); cómo se opera en el día a día; cómo se comprueba que funciona; cómo se recupera si se rompe; y los comandos exactos, copiables, con lo que debe salir.
- **Escribirlo para alguien que no estuvo en la sesión:** sin "como vimos", sin depender de la cola ni del histórico de git para entender un paso.
- **Lo que solo sabe la IA de la sesión no existe:** si un paso solo está en la conversación o en un informe de tanda, no está documentado.
- **Actualizarlo en la misma tanda que cambia lo que describe**, y es parte del DoD de esa tanda. La puerta "documentación al día" del DoD común ya lo exige; esta sección dice qué significa "al día".
- **Los secretos no van en `docs/`:** el runbook dice dónde están y cómo se recuperan.

**Por qué:** un doc que solo se entiende con la IA al lado no sirve el día que la IA no está, que es justo el día que se necesita.

### Docs de TRACKING / HISTÓRICO INTERNO — sí pueden tener identificadores históricos

Bitácoras, informes de tanda, síntesis de sesiones operativas, memoria del coordinador. Mantienen su nomenclatura histórica, pero **no son lectura de onboarding**; si un README los menciona, debe etiquetarlos como "registro interno, no necesario para empezar".

## Aplicación en prompts del coordinador

Si el documento a tocar es de **onboarding**, prohibir explícitamente al agente introducir referencias a la tanda **en el contenido** del documento. El **mensaje de commit** sí puede mencionar la tanda; el `.md` modificado, no.

Relacionada: [[formato_prompts_markdown_limpio]], [[estructura_contenedor_asunto]].

> Pieza de catálogo `general/comun/doctrinas/`. v1.0 (2026-06-05). Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente.
> Adaptada al enfoque neutro de la plantilla (sin referencias al dominio del software) — 2026-07-29.

> **v1.1 (2026-09-04): entra la tercera clase, los docs de DECISIÓN, a propuesta del director.** Las dos clases originales dejaban el *porqué* fuera de `docs/` y lo remitían al histórico de cambios; eso **supone que siempre habrá quien lea commits**, y este kit ya tiene medido lo contrario — al podar su propia bitácora comprobó que **lo que baja al histórico deja de leerse**, y por eso exige fundir la lección en una regla antes de archivarla. El mismo razonamiento aplica aquí. **No deroga nada:** la narrativa de proceso sigue prohibida; lo que entra es la razón de la decisión con sus alternativas descartadas. *(Y no inventa una práctica: **tres de los cuatro asuntos vivos ya tenían carpeta de decisiones**, cada uno por su cuenta y con nombre distinto, mientras la plantilla no la traía — así que el asunto nuevo nació sin ella. Es el patrón de [[mejora_continua_del_kit]]: se arregla en la plantilla y en la doctrina, no en el contenedor que lo sufrió.)*

> **v1.2 (2026-10-04): entra la cuarta clase, los docs OPERATIVOS**, por decisión del director. No deroga nada: define qué significa "documentación al día" para lo que un asunto monta.
