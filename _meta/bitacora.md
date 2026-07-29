# Bitácora del kit — qué se aprendió y qué se cambió

> Registro de lo que falla o mejora al usar el kit. Cada entrada son **dos cosas**: el **aprendizaje** y el **cambio aplicado** (con el fichero donde se aplicó). Un aprendizaje sin cambio aplicado no es una entrada de bitácora, es una queja. Doctrina: [[mejora_continua_del_kit]].

## Cómo se escribe una entrada

- **Una sección por fecha** (`## AAAA-MM-DD — de qué iba la sesión`), entradas en viñetas dentro.
- Formato de la viñeta: **qué se aprendió** — el hecho concreto, con el síntoma que lo delató. *Aplicado:* el cambio y **dónde** (`inicializador/checklist-arranque.md`, tal doctrina, tal plantilla).
- **Lo más nuevo arriba**: quien lee la bitácora busca lo reciente.
- **Anótalo el mismo día.** Un aprendizaje de hace dos semanas se recuerda como "algo de las fechas no cuadraba", y eso no sirve para arreglar nada.
- **Y fúndelo.** El paso 2 de la doctrina es el que cuenta: si el aprendizaje no llega al checklist, a la plantilla o a la doctrina, el próximo arranque repite el mismo error con la bitácora escrita al lado.
- Si el cambio afecta a una doctrina, **sube su `version`**, anota el changelog en su footer y **actualiza el índice en el mismo commit** ([[verificacion_fuente_primaria]]).

## Qué NO va aquí

- El **estado del trabajo** → eso es `cola-pendientes.md`.
- Lo que **está por decidir** → eso es `decisiones-abiertas.md`.
- El **detalle de lo hecho** → eso está en los commits. Aquí va la lección, no la crónica.

---

> **Arranca vacía a propósito.** Debajo queda una entrada de ejemplo con la forma. Bórrala en cuanto tengas la primera de verdad, y **borra también este bloque**. No traigas entradas de otro vault: su aprendizaje ya está fundido en sus artefactos, y aquí solo sería ruido.

## AAAA-MM-DD — *(ejemplo)* primer asunto inicializado

- **Los plazos que se deducen de un cómputo hay que escribir el cómputo, no solo la fecha** — al revisar la cola nadie sabía de dónde salía una de las fechas y hubo que reabrir el expediente para recalcularla. *Aplicado:* nota en la plantilla de cola (`inicializador/plantilla-contenedor-asunto/cola-pendientes.md`): *"si la fecha se deduce de un cómputo, escribe el cómputo"*.
- **Comprobar que los escaneos están completos ANTES de redactar** — faltaba una página en el lote y el escrito ya citaba lo que decía. *Aplicado:* subido como comprobación temprana al paso 6 de `inicializador/checklist-arranque.md`.
