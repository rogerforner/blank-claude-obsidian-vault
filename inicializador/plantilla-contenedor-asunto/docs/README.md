# `docs/` — documentación del asunto y originales

Todo lo sustantivo del asunto: cronología, plazos, contactos, decisiones, cálculos y guías de trámite, **más los originales recibidos y emitidos**.

## Dos clases de fichero, con reglas distintas

- **Originales — intocables.** Escaneos, resoluciones, acuses, facturas, contratos firmados, correos recibidos. Son **prueba**: no se editan, no se renombran a mejor, no se regeneran "más limpios". Si hay que trabajar sobre uno, se trabaja **sobre copia**. Nómbralos con la fecha delante (`2026-03-14-resolucion.pdf`) para que ordenen solos, y no los toques más.
- **Documentos del vault — vivos.** Cronología, notas, cálculos, borradores de escritos. Los mantiene el coordinador y se corrigen cuando hace falta. Si uno diverge del original, **gana el original** y se corrige la nota ([[verificacion_fuente_primaria]]).

## Transcripciones

Un escaneo transcrito a texto es un **documento nuevo**, no el original. Se genera con tooling **local** (nada de conversores web: estos papeles llevan datos personales) y **se coteja con la fuente** antes de darlo por bueno. El original sigue donde estaba.

## Estilo

Documentación de consulta, **sin narrativa histórica ni identificadores de bloques de trabajo** ([[docs_sin_fases]]): quien la lea dentro de un año necesita saber cómo está el asunto, no por qué fases pasó. El histórico está en git y en la cola.

**Enlaces internos:** markdown relativo (`[texto](archivo.md)`), **no** wikilinks — estos documentos se consultan también fuera de Obsidian, donde los wikilinks no renderizan.

## Al arrancar

Aquí se trae el material que ya existe (checklist paso 2). Si el asunto venía en marcha, pasa antes por el **gate de confidencialidad** de `../../../inicializador/checklist-migracion-existentes.md`: qué entra lo decide el director.
