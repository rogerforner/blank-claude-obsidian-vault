---
name: Archivo documental compartido — un documento, un sitio
description: Los documentos transversales a varios asuntos (identificativos, de un inmueble, de un bien) viven en un árbol propio del vault, al mismo nivel que el catálogo y los contenedores. Los asuntos lo enlazan por ruta relativa y nunca lo copian; lo ven en solo lectura. Se versiona la estructura y sus índices, no los originales. Se crea con el primer asunto que lo necesite, no antes.
type: convention
version: 1.0
---

Un vault documental acumula papeles que **no pertenecen a ningún asunto en concreto**: los identificativos de cada persona, los de un inmueble, los de un vehículo, los de una entidad. El mismo documento lo necesitan un expediente de hoy y otro de dentro de dos años.

El kit ofrece dos árboles compartidos y **ninguno sirve para esto**: `general/` es catálogo de método y no admite datos personales, y el contenedor de un asunto está aislado de los demás por diseño. De ahí un **tercer árbol**, al mismo nivel que los otros dos.

```
<vault>/
├── general/                   catálogo de método (se lee, no se copia)
├── <archivo>/                 documentos transversales  <-- esta doctrina
└── asuntos/<asunto>/          contenedores de trabajo
```

## La regla

**Un documento vive en un solo sitio, y lo demás lo referencia.** Los asuntos lo **enlazan por ruta relativa**; nunca lo copian.

Copiar tiene tres costes que no se ven en el momento: duplica peso, crea dos verdades que divergen en silencio, y sobre todo **rompe la renovación** — cuando un documento caduca se sustituye en un sitio y todos los asuntos quedan al día a la vez; con copias, cada una hay que perseguirla.

Es la misma lógica que rige el catálogo ([[estructura_contenedor_asunto]]): quien copia asume el deber de resincronizar, y una copia desfasada miente con la autoridad de estar instalada.

## Aislamiento

Los coordinadores de asunto lo ven en **solo lectura**: montado en `additionalDirectories` con deny de escritura, igual que `general/`. Pueden leer y enlazar, no mover ni borrar. Si un asunto necesita un documento que no está, **se lo pide al director**, que lo archiva; el coordinador no escribe en ese árbol.

**El nombre del árbol debe ser compuesto.** El deny se expresa con un glob independiente del nombre del vault (`//**/<archivo>/**`), así que una palabra genérica —`archivo`, `documentos`, `expediente`— haría que cualquier subcarpeta homónima **dentro de un asunto** quedara en solo lectura sin que nadie lo pidiera. Y en un vault de expedientes, `expediente` es justo la palabra que un asunto usará. Un nombre compuesto (`archivo-familiar`, `archivo-empresa`) no colisiona con nada.

## Qué se versiona

**Los documentos en bruto no.** Son binarios pesados, sin valor en un diff, y su respaldo es el del sistema de ficheros. Se versiona **la estructura de carpetas y sus índices**, para que el árbol sea reproducible en otra máquina.

Al declarar la exclusión, cuidado con el anclaje: una ruta anclada a la raíz **no cubre** las mismas carpetas dentro de los contenedores. La exclusión debe expresarse de forma que aplique a cualquier nivel, o entrará material que se creía excluido.

Un **índice por carpeta** —qué documento hay, dónde y hasta cuándo vale— es lo que permite responder "¿tenemos esto vigente?" sin abrir un solo archivo. El índice se versiona; el documento que describe, no.

## Organización

Dos criterios, y bastan: **por persona** lo que pertenece a alguien (identidad, salud, formación, situación laboral), y **por bien o entidad** lo que pertenece al conjunto o a una cosa. Las subcarpetas se crean **cuando llega el primer documento**, no antes ([[adopcion_tooling_externo_caso_uso_concreto]]).

En el nombre del fichero conviene que vaya la **fecha de caducidad** cuando la haya: un listado ordenado dice de un vistazo qué está por vencer, sin abrir nada.

## Cuándo se crea

**Con el primer asunto que necesite un documento transversal, no antes.** Un vault de un solo asunto no lo necesita: mientras el documento sirva a un único expediente, su sitio es el contenedor de ese expediente. El árbol aparece cuando el segundo asunto pide el mismo papel — o cuando el primero ya arranca sabiendo que lo pedirá.

Relacionada: [[estructura_contenedor_asunto]], [[sensitive_file_guard]], [[convencion_organizacion_carpeta_trabajo]].

> Pieza de catálogo `general/comun/doctrinas/`. Se **lee** desde el catálogo; no se copia salvo motivo declarado. v1.0: nace de una carencia detectada al arrancar el primer asunto de un vault derivado — el kit no contemplaba dónde viven los documentos transversales, y ni el catálogo ni el contenedor aislado servían. La regla del nombre compuesto y la del anclaje de la exclusión son las dos que costaron un fallo real antes de estar escritas.
