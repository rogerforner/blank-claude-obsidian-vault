# `general/` — catálogo del vault

## Regla de oro: se LEE, no se copia

`general/` es un **catálogo que se lee**, no un almacén del que haya que copiar ni un proveedor automático de tooling. Todo contenedor de asunto lo tiene declarado como **directorio adicional en modo lectura** (ruta relativa `../../general`): el coordinador de un asunto **lo consulta y lo usa de referencia, pero no puede modificarlo**.

- **Un `[[wikilink]]` sin copia local resuelve al catálogo, y eso es lo correcto** — no es un olvido.
- **El default es NO copiar.** Una copia desfasada miente con la autoridad de estar instalada, y una copia idéntica no aporta nada mientras el asunto viva dentro del vault.
- **Cuándo SÍ copiar:** para **fijar** a propósito una versión concreta (declarando por qué), o si el contenedor va a **salir** del vault. Quien copia, resincroniza.
- `asuntos/<asunto>/memoria/` es para las doctrinas **propias** de ese asunto.

Detalle en [`comun/README.md`](comun/README.md) y en la doctrina [[estructura_contenedor_asunto]].

## Criterio de subdivisión: por disciplina

- **`comun/`** — transversal a cualquier disciplina: doctrinas de coordinación, convenciones, notas de tooling y los **hooks** del vault. Índice: [`comun/doctrinas/MEMORY-doctrinas-index.md`](comun/doctrinas/MEMORY-doctrinas-index.md).
- **`<disciplina>/`** — específico de una disciplina, **si llega a hacer falta**. No se crea por adelantado: un bucket vacío no se monta "por si acaso" ([[adopcion_tooling_externo_caso_uso_concreto]]).

## Pack opcional

**`comun/packs/codigo/`** es un pack **opcional**, con su propio índice, para los asuntos que incluyan **software propio**. El core **no depende** de él y sin él nada queda cojo. Para el resto de asuntos, se ignora.

> Este README documenta el catálogo `general/` en su conjunto; el detalle de `comun/` vive en [`comun/README.md`](comun/README.md).
