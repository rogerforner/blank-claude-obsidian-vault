---
name: Mejora continua del kit — retroalimentar lo aprendido en cada arranque de asunto
description: Cada vez que se arranca un asunto nuevo aparecen correcciones de pasos y mejores formas de trabajar. El coordinador general las anota en la bitácora y las funde en los artefactos del kit (checklist, plantillas, doctrinas) para que los próximos arranques usen los pasos que mejor funcionaron, en el orden adecuado.
type: doctrine
version: 1.0
---

El kit **no es estático: mejora con cada arranque**. Cada vez que se inicializa un asunto —una reclamación, una obra, una declaración, un contrato— aparecen correcciones de pasos y mejores formas de trabajar. Ese aprendizaje **debe volver al kit**.

## Mecanismo

1. **Anota** la mejora en `_meta/bitacora.md`: qué paso falló o mejoró, y el cambio que se aplica al kit.
2. **Funde** el aprendizaje en los artefactos del kit: `inicializador/checklist-arranque.md`, las plantillas y las doctrinas. El conocimiento vive en el kit, no solo en la bitácora.
3. En el próximo arranque, **coordina con los pasos que mejor funcionaron, en el orden adecuado**.

Ejemplo: si al arrancar la tercera reclamación se descubre que conviene escanear y fechar los originales **antes** de redactar nada —porque la fecha del sello decide el plazo—, ese paso sube al checklist de arranque; no se queda como anécdota en la bitácora.

## Quién

El **coordinador general del vault**. Es parte de mantener el kit coherente y vivo. Encaja en la cadencia de [[revision_periodica_forma_de_trabajo]]: la mejora del kit es continua; la poda/revisión amplia, periódica.

## Regla de propagación

Las doctrinas instaladas en `asuntos/<asunto>/memoria/` son **copias con su versión** ([[estructura_contenedor_asunto]]): mejorar el catálogo **no** actualiza las copias solas. Cuando una mejora es relevante para un asunto vivo, su coordinador la resincroniza explícitamente.

Relacionada: [[revision_periodica_forma_de_trabajo]], [[orquestacion_sesiones_por_herramienta]], [[verificacion_fuente_primaria]].

> Pieza de catálogo `general/comun/doctrinas/`. v1.0 (2026-06-05). Se instala por copia en `asuntos/<asunto>/memoria/`; no se hereda.
> Adaptada al framing neutro del seed (sin referencias al dominio del software) — 2026-07-29.
