---
name: Mejora continua del kit — retroalimentar lo aprendido en cada arranque de asunto
description: Cada vez que se arranca un asunto nuevo aparecen correcciones de pasos y mejores formas de trabajar. El coordinador general las anota en la bitácora y las funde en los artefactos del kit (checklist, plantillas, doctrinas) para que los próximos arranques usen los pasos que mejor funcionaron, en el orden adecuado.
type: doctrine
version: 1.1
index_summary: >-
  Anotar en `_meta/bitacora.md` lo aprendido en cada arranque y fundirlo en checklist/plantillas/doctrinas.
---

El kit **no es estático: mejora con cada arranque**. Cada vez que se inicializa un asunto —una reclamación, una obra, una declaración, un contrato— aparecen correcciones de pasos y mejores formas de trabajar. Ese aprendizaje **debe volver al kit**.

## Mecanismo

1. **Anota** la mejora en `_meta/bitacora.md`: qué paso falló o mejoró, y el cambio que se aplica al kit.
2. **Funde** el aprendizaje en los artefactos del kit: `inicializador/checklist-arranque.md`, las plantillas y las doctrinas. El conocimiento vive en el kit, no solo en la bitácora.
3. En el próximo arranque, **coordina con los pasos que mejor funcionaron, en el orden adecuado**.

Ejemplo: si al arrancar la tercera reclamación se descubre que conviene escanear y fechar los originales **antes** de redactar nada —porque la fecha del sello decide el plazo—, ese paso sube al checklist de arranque; no se queda como anécdota en la bitácora.

## Quién

El **coordinador general del vault**. Es parte de mantener el kit coherente y vivo. Encaja en la cadencia de [[revision_periodica_forma_de_trabajo]]: la mejora del kit es continua; la poda/revisión amplia, periódica.

## Se arregla el HÁBITO, no el sitio

**Cuando una pieza del kit falla, la pregunta no es "cómo lo arreglo aquí" sino "dónde va a volver a pasar".** Arreglar solo el sitio donde dolió deja la mina puesta para la pieza siguiente, y **la pieza siguiente la escribe otro que no vio el fallo**.

**Tres casos medidos, y los tres del mismo patrón:**

- Un falso positivo de una regla de verificación se corrigió **en la regla y no en el texto que lo sufrió**, con el motivo escrito: *"un parche en ese texto le habría funcionado a él y el asunto siguiente habría tropezado igual"*.
- Un criterio ya resuelto —distinguir una **cita** de una **afirmación**— se volvió a fallar **cuatro veces en piezas nuevas**, porque estaba resuelto en dos reglas antiguas y no escrito donde se iba a volver a necesitar.
- Una puerta se acotó por ámbito **en una sola de sus comprobaciones** y las otras cinco siguieron dando instrucciones ajenas como propias. Lo diagnosticó otro coordinador, con el argumento que cierra el caso: *"un aviso que no es para ti se aprende a ignorar rápido"*.

> **Regla: un criterio resuelto en un sitio NO está resuelto en el kit hasta que está escrito donde se va a volver a necesitar.** Y el sitio correcto casi nunca es donde dolió: es la **plantilla**, el **checklist** o la **regla** de la que nacerá la pieza siguiente.

**Corolario para quien pode la bitácora:** una entrada **no se archiva hasta que su lección vive en una regla**. El histórico ya no se lee — bajar allí algo que solo estaba escrito ahí **es perderlo**. *(Esta misma sección nació así: al podar el 2026-09-02 se comprobó una a una si las lecciones estaban fundidas, y esta era la única que no lo estaba pese a llevar semanas usándose.)*

## Regla de propagación

Las doctrinas instaladas en `asuntos/<asunto>/memoria/` son **copias con su versión** ([[estructura_contenedor_asunto]]): mejorar el catálogo **no** actualiza las copias solas. Cuando una mejora es relevante para un asunto vivo, su coordinador la resincroniza explícitamente.

Relacionada: [[revision_periodica_forma_de_trabajo]], [[orquestacion_sesiones_por_herramienta]], [[verificacion_fuente_primaria]].

> Pieza de catálogo `general/comun/doctrinas/`. **v1.1 (2026-09-02): entra *se arregla el hábito, no el sitio*, que llevaba semanas usándose y no estaba escrita en ninguna parte** — lo destapó podar la bitácora comprobando, entrada por entrada, si su lección vivía ya en una regla. Con su corolario, que es el que hace la poda segura: **una entrada no se archiva hasta que su lección está fundida**, porque el histórico ya no se lee. v1.0 (2026-06-05). Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente.
> Adaptada al enfoque neutro de la plantilla (sin referencias al dominio del software) — 2026-07-29.
