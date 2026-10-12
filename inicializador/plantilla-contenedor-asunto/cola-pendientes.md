# Cola de pendientes — {{ASUNTO}}

Esta cola guarda el **porqué** y lo **cerrado**. Lo abierto (qué queda y de quién es) vive en `coordinacion/estado.json` y se consulta y se cambia con `estado.mjs`; cada elemento del estado apunta con `porque` a la entrada de aquí. La cola ya no es lo primero que se lee: lo primero es el estado y el charter.

> **Techo: 40.960 bytes.** Aunque ya no se lee entero en cada arranque, su tamaño se paga cada vez que se abre. Al superarlo, lo **cerrado** baja a `coordinacion/referencia/historico-<asunto>.md` y aquí queda solo lo **vivo**. Compruébalo con `wc -c` al cerrar tanda y compara el número **tal cual**, sin convertir a KB —y en bytes, no en líneas: un párrafo denso son 300 caracteres por línea— porque un fichero que crece no avisa ([[convencion_organizacion_carpeta_trabajo]]).

## Plazos (lo primero)

| Fecha | Qué vence | De dónde sale | Consecuencia si se pasa |
|---|---|---|---|
| {{AAAA-MM-DD}} | {{…}} | {{documento de `docs/` que lo fija}} | {{…}} |

*Un plazo es un elemento del estado con `caduca`; aquí se deja solo el porqué de cada uno y el documento del que sale. Un plazo sin fecha no es un plazo. Si la fecha se deduce de un cómputo, escribe el cómputo.*

## Bloque 1 — {{PRIMER_BLOQUE}}

*(p. ej. reconocimiento del expediente y cronología, antes de redactar nada)*

- …

## Próximos bloques

- …

## Entregado fuera

| Fecha | Qué | A quién / por qué canal | Acuse |
|---|---|---|---|
| {{AAAA-MM-DD}} | {{…}} | {{…}} | {{fichero del acuse en `docs/`}} |

*Nada se da por presentado sin acuse guardado como original.*

## Cerrado

- ~~…~~
