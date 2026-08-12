# Cola de pendientes — {{ASUNTO}}

Estado vivo del asunto: bloques de trabajo en orden, el activo arriba. Los cerrados se tachan o se mueven al histórico. **Este fichero y el charter son lo primero que lee una sesión nueva.**

> **Techo: 40 KB.** Como este fichero se lee **entero en cada arranque**, su tamaño se paga en todas las sesiones futuras. Al superarlo, lo **cerrado** baja a `coordinacion/referencia/historico-<asunto>.md` y aquí queda solo lo **vivo**. Compruébalo con `wc -c` al cerrar tanda —en KB, no en líneas: un párrafo denso son 300 caracteres por línea— porque un fichero que crece no avisa ([[convencion_organizacion_carpeta_trabajo]]).

## Plazos (lo primero)

| Fecha | Qué vence | De dónde sale | Consecuencia si se pasa |
|---|---|---|---|
| {{AAAA-MM-DD}} | {{…}} | {{documento de `docs/` que lo fija}} | {{…}} |

*Un plazo sin fecha no es un plazo. Si la fecha se deduce de un cómputo, escribe el cómputo.*

## Bloque 1 — {{PRIMER_BLOQUE}}

*(p. ej. reconocimiento del expediente y cronología, antes de redactar nada)*

- [ ] …

## Próximos bloques

- …

## Entregado fuera

| Fecha | Qué | A quién / por qué canal | Acuse |
|---|---|---|---|
| {{AAAA-MM-DD}} | {{…}} | {{…}} | {{fichero del acuse en `docs/`}} |

*Nada se da por presentado sin acuse guardado como original.*

## Cerrado

- ~~…~~
