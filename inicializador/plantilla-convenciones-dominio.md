# Convenciones documentales — {{ASUNTO}}

> **Plantilla parametrizable** para `asuntos/<slug>/docs/convenciones-dominio.md`. Sustituye `{{ASUNTO}}` y rellena solo las secciones que este asunto necesite de verdad; **borra las que no**, junto con este bloque. Una sección vacía "por si acaso" es deuda, no previsión ([[adopcion_tooling_externo_caso_uso_concreto]]).
>
> **Cuándo se crea este fichero:** solo si el asunto tiene **convenciones documentales propias** — porque llegó con método propio en una migración, o porque su materia impone una forma de nombrar, fechar o estructurar los documentos. **Un asunto que se conforma con la convención del vault no necesita este fichero**, y crearlo vacío solo añade un sitio más que mantener.

## Qué es esto y qué NO es

Aquí viven las reglas de **cómo se escriben y se nombran los documentos de este asunto**: nombrado, metadatos, plantillas propias, unidades, vocabulario. Es **documentación del asunto**, no coordinación.

**Lo que NO va aquí, y dónde va:**

| Eso | Su sitio |
|---|---|
| Cómo se trabaja, quién decide, qué se verifica antes de cerrar | el `CLAUDE.md` del contenedor y el charter |
| Reglas transversales (prompts, commits, modelo por tarea, higiene) | el catálogo `general/`, que se **lee**, no se copia |
| Estado, pendientes y plazos | `cola-pendientes.md` y `coordinacion/` |
| Doctrinas propias de este asunto | `memoria/` |

Si una regla de aquí **contradice** una del catálogo, no se resuelve por antigüedad: se lleva al director. Una convención de dominio **especializa** la del vault; no la deroga.

## Nombrado de ficheros *(parametrizar)*

- *Patrón, con un ejemplo real de este asunto. Por defecto el del vault: fecha delante en formato `AAAA-MM-DD` para que ordenen solos, descripción en minúsculas y con guiones, sin espacios ni acentos en el nombre.*
- *Qué hacer cuando un documento no tiene fecha propia (la de recepción, la del sello, la del escaneo) — y decirlo, porque es la duda que se repite.*
- *Cómo se nombra una versión posterior del mismo documento, y cómo se distingue el borrador del entregado.*

## Metadatos al principio del documento *(parametrizar)*

- *Si este asunto usa frontmatter: qué campos son **obligatorios**, cuáles opcionales, y qué valores admite cada uno. Un campo con valores libres deriva en cuatro formas de escribir lo mismo.*
- *Un ejemplo completo, copiable. Vale más que la descripción de los campos.*
- *Qué se hace con un documento heredado al que le falta el frontmatter: se completa al tocarlo, o se deja como está y se anota. Decidirlo aquí evita que cada sesión elija distinto.*

## Plantillas de documento propias *(parametrizar)*

- *Los tipos de documento recurrentes de este asunto (una ficha de visita, un parte, una medición, un escrito tipo) y dónde vive la plantilla de cada uno.*
- *Qué secciones son fijas y cuáles opcionales.*

## Unidades, formatos y vocabulario *(parametrizar)*

- *Unidades y su formato (decimales con coma, separador de millares, unidad siempre escrita). Una magnitud escrita de dos formas en el mismo asunto acaba en una comparación mal hecha.*
- *Términos del dominio con un significado preciso en este asunto, y los que se parecen y no significan lo mismo. Es lo que más se malinterpreta entre sesiones.*
- *Cómo se citan los documentos entre sí: por nombre de fichero y ruta relativa, nunca copiando la cifra o el dato — el dato vive en un solo sitio ([[verificacion_fuente_primaria]]).*

## De dónde salen estas convenciones *(parametrizar)*

- *Si vienen de material migrado: de dónde, y qué se decidió conservar frente a lo que se sustituyó por la convención del vault. Sin esto, la siguiente sesión propone "unificarlo todo al estándar" sin saber que ya se decidió una vez.*

---

> Documento de `docs/` de este asunto: **documentación, no coordinación**. Se mantiene al día en el mismo commit en que cambia la convención que describe; una convención escrita que ya no se sigue es peor que no tenerla.
