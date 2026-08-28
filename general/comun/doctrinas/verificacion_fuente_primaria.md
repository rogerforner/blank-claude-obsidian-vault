---
name: Verificar en la fuente primaria antes de propagar
description: Un dato que contradice lo documentado es un conflicto a resolver en la fuente primaria (el documento real, el escrito registrado, la cifra oficial), NUNCA licencia para "corregir" la nota desde un proxy (tamaño/fecha/nombre de fichero). No lleves una conclusión a docs/doctrina/prompts/commits sin verificarla, y acota la afirmación a lo realmente probado. Como tus notas se propagan a otras sesiones, tu listón de verificación es más alto, no más bajo.
type: practice
version: 1.6
index_summary: >-
  Un dato que contradice la nota es un conflicto a resolver en el documento real, no licencia para corregir desde un proxy (tamaño/fecha/nombre de fichero); no propagues sin verificar; acota a lo probado. El coordinador propaga → listón más alto. **Un dato que caduca lleva su fecha (`[CADUCA AAAA-MM-DD]` o `caduca:` en frontmatter) y el verificador PARA el kit cuando vence** — no es recordatorio. **El marco temporal se EJECUTA:** el hook de arranque sella la fecha del sistema y ninguna sesión la deduce de un fichero; ese sello sirve para lo ordinario y **no para dirimir**, que ahí hace falta testigo externo a la máquina. Y una **prueba negativa vale lo que valga su cobertura**: antes de concluir *no pasó*, escribe qué huella habría dejado si hubiera pasado. **Ningún dato derivable se escribe a mano:** el par índice-ficha se genera desde el `index_summary` de la ficha y el verificador lo comprueba. **Fuente única también DENTRO del documento** (dos copias del mismo dato derivan en silencio; incluye índice↔ficha, que se actualizan en el mismo commit) y **una comprobación favorable no prueba que el procedimiento sea fiable** (ojo: una limitación impuesta puede ser el síntoma de un ajuste ausente). **Lo que viaja en un encargo se etiqueta `[MEDIDO]` (quién/cómo/cuándo) o `[A CONFIRMAR]`**: un dato de apoyo erróneo sobrevive al viaje y el receptor lo hereda como verificado. Y **un comentario que declara algo "defensivo" sin medirlo es peor que no tenerlo**.
---

El coordinador **propaga**: lo que escribe en `docs/`, doctrinas, prompts y commits lo leen y dan por bueno otras sesiones —y el propio director dentro de seis meses—. Por eso su listón de verificación es **más alto**, no más bajo. La regla: **verifica en la fuente primaria ANTES de propagar.**

## Reglas

- **Un dato que contradice lo documentado es un CONFLICTO, no una corrección automática.** Resuélvelo mirando la **fuente primaria** —el documento original, la resolución registrada, el extracto real, la factura escaneada—, no un **proxy** (la fecha o el tamaño del fichero, su nombre, lo que "debería" decir una plantilla). El documento real es la única fuente de verdad (*trust-but-verify*).
- **No propagues sin verificar.** No lleves una conclusión a `docs/`/doctrina/prompt/commit/charter hasta comprobarla contra la fuente. Una hipótesis plausible no es un hecho.
- **Acota la afirmación a lo realmente probado.** "Comprobado en un recibo" ≠ "todos los recibos del año cuadran"; "la plantilla oficial pide el anexo III" ≠ "el organismo lo exige en este trámite"; "el PDF pesa 4 MB" ≠ "el PDF contiene los 12 anexos". Di qué comprobaste y qué no.
- **Distingue medir de inferir.** Si solo tienes un proxy, dilo como proxy ("el fichero es de marzo → *probablemente* la versión antigua"), y **verifica el contenido** antes de declarar un estado (abre el PDF y cuenta las páginas, no mires la fecha).
- **Ante anomalía, investiga la causa; no "arregles" el síntoma en la nota.** Si la nota y la realidad discrepan, la nota puede tener razón y la realidad ser el error (o al revés): determina cuál antes de editar.
- **Un comentario que declara algo "defensivo" sin haberlo medido es PEOR que no tener comentario.** Un comentario también es propagación: el siguiente lo lee como conclusión ya verificada y **deja de mirar**. *(Caso real: una anotación de configuración sostenía que un valor inexistente era "defensivo" y que solo fallaría en un caso marginal; medido, rompía mucho más que ese caso, porque otros procesos heredaban el valor y lo validaban al arrancar. De ahí la regla general: **un valor de configuración inválido no es latente si otros lo heredan y lo comprueban**.)*

## Lo que VIAJA en un encargo: marca qué está medido y qué está por confirmar

Un encargo entre coordinadores —o el que te escribes a ti mismo para dentro de tres semanas— lleva **datos de apoyo** además de la petición. Quien lo recibe los hereda **como si estuvieran verificados**, porque del otro lado ya no queda rastro de cómo se obtuvieron. Por eso **un dato de apoyo erróneo sobrevive al viaje** y se convierte en premisa donde nadie puede auditarlo.

**Regla: cada dato de apoyo va etiquetado.** `[MEDIDO]` — con **quién**, **con qué** y **cuándo** (el comando o el documento, y la fecha) — o `[A CONFIRMAR POR EL RECEPTOR]`. Si no sabes en cuál cae, es *a confirmar*. Cuesta una línea y evita que el otro construya sobre arena.

*(Caso real: un encargo afirmaba que cierto sistema "solo ofrecía dos opciones disponibles"; medidas contra el sistema real eran 48. Lo único que importaba para el encargo sí era cierto, así que el encargo era válido — pero el dato de apoyo era falso y viajó entero. Quien lo detectó fue el receptor, al chocar con la realidad.)*

**Y si el dato CADUCA, dilo con una fecha que el verificador entienda: `[CADUCA AAAA-MM-DD]`** en el cuerpo, o `caduca: AAAA-MM-DD` en el frontmatter de una pieza de método. **No es un recordatorio: es una parada.** Cuando esa fecha pasa, el verificador pone el kit en **rojo** con el fichero y la línea, y no vuelve a verde hasta que alguien lo comprueba en su fuente y lo actualiza o lo retira.

Existe porque *"lo miro el día X"* no es un mecanismo: **un dato con caducidad que depende de que alguien mire el calendario ya está caducado, solo que todavía no lo sabes.** Este vault enseñó una política de plataforma abandonada durante dos semanas, y despachó un plazo vencido **un día tarde y por casualidad** — porque la sesión siguiente lo leyó de pasada, no porque nada avisara.

**Qué merece caducidad y qué no:** los datos de **plataforma** (límites, precios, nombres de opciones, versiones), lo que dependa de un **plazo externo**, y todo lo marcado *a confirmar* que aún no se ha confirmado — a eso se le pone la fecha en que deja de ser aceptable seguir sin comprobarlo. Lo que es **conclusión propia medida contra la fuente** no caduca: se revisa cuando cambie el mundo, no cuando pase una fecha.

## El marco temporal se EJECUTA, no se lee

**Ninguna sesión deduce qué día es a partir de un fichero** — ni del nombre de un handoff, ni de la última entrada de la bitácora, ni de lo que diga un conector. El **hook de arranque sella la fecha del sistema** en el contexto, de una ejecución, antes de que nadie escriba nada.

Sale de un caso que costó caro: una sesión arrancó desde un handoff fechado, arrastró esa fecha **a 38 sitios** y hubo que corregirlos uno a uno contra el registro de cambios que respaldaba cada uno — porque los desfases **no eran uniformes** y una sustitución global habría escrito una fecha falsa en más de la mitad.

**Con su límite escrito al lado, que se aprendió igual de caro:** ese sello es el reloj **de este equipo**, así que vale para el caso ordinario y **no para dirimir**. Si lo que está en duda es el reloj mismo, contrastarlo contra `date` es preguntarle al sospechoso: hace falta un **testigo externo a la máquina**, y hay que elegirlo bien — un campo que solo guarda el último estado no sirve; una marca de tiempo puesta por un servidor en el momento del hecho, sí.

**Y el corolario que generaliza más allá de las fechas: una prueba negativa vale lo que valga su cobertura.** Antes de concluir *no pasó*, escribe **qué huella habría dejado si hubiera pasado** y comprueba que es la huella que estás buscando. *(Caso real: se dio por refutado un desfase de reloj porque "no hay ningún registro fechado antes que su padre" — cierto, e irrelevante: un reloj atrasado que se corrige hacia adelante no deja esa huella, deja huecos.)*

## Fuente única también DENTRO del documento

**Y cuando la copia es inevitable, que la escriba una máquina.** Un dato que vive en dos sitios deriva en silencio, y el par más caro de este kit era **índice ↔ ficha**: se corregía la ficha y su resumen del índice seguía describiendo la versión anterior. No se detecta releyendo, porque **las dos redacciones son plausibles por separado**. Por eso el resumen vive ahora en el `index_summary` del frontmatter de la ficha —fuente única— y **el índice es derivado**: `generar-indice-doctrinas.mjs` lo rellena desde ahí, y el verificador lo ejecuta en modo comprobación, así que una ficha corregida sin su resumen **deja el kit en rojo** en vez de dejar una mentira suelta. Lo que sigue siendo criterio editorial y se escribe a mano es el **esqueleto**: las secciones temáticas, el orden y el título de cada entrada.

**La regla general que queda:** *ningún dato derivable se escribe a mano*. Si hay que escribirlo dos veces, se genera una de las dos y se comprueba la coincidencia; si no se puede generar, no se copia: se referencia.

**Si un documento explica el mismo hallazgo en dos sitios, colápsalo a uno.** Con dos copias basta que se corrija una para que la otra empiece a **mentir**, y esa deriva **no se detecta leyendo** (ambas versiones son plausibles por separado). Deja **una** explicación canónica y que el resto **remita** a ella, quedándose solo con lo accionable en su contexto.

Vale igual para el par **índice ↔ ficha**: un índice que resume una doctrina es una copia, y se desfasa en silencio cuando la doctrina cambia de versión. Al actualizar una pieza, **actualiza su entrada en el índice en el mismo commit**.

*(Caso tipo: un escrito de alegaciones daba la cuantía reclamada en el encabezado y otra vez en el apartado de petición; se corrigió solo el encabezado tras un nuevo presupuesto, y el escrito salió contradiciéndose a sí mismo.)*

## Una comprobación favorable no prueba que el procedimiento sea fiable

**Un solo resultado bueno no demuestra ausencia de fallo** en nada que no sea determinista: plazos, acuses de recibo, colas de registro telemático, disponibilidad de cita previa, envíos que a veces rebotan. Declarar resuelto un procedimiento porque **una** vez funcionó es exactamente el error que esta doctrina previene: es acotar mal lo probado.

Corolario de diagnóstico: **una limitación que alguien impuso "porque si no falla" suele ser el SÍNTOMA de una configuración ausente**, no una preferencia. Antes de quitarla, busca la causa — retirar el límite sin arreglar lo que lo hacía necesario es lo temerario. *(Caso tipo: se enviaban los anexos "de tres en tres porque el registro rechaza los envíos grandes". Era cierto que rechazaba, pero el motivo real era que los escaneos iban a 600 ppp sin comprimir; el límite del registro nunca fue el problema. Lo relevante no era el número, sino el ajuste ausente detrás.)*

## Cómo aplicarlo

1. ¿De dónde sale este dato: fuente primaria o proxy? 2. Si es proxy y hay contradicción, **ve a la fuente** antes de tocar nada. 3. Acota la afirmación a lo probado — y si el procedimiento no es determinista, **una vez no basta**. 4. ¿Estoy escribiendo esto **dos veces** en el mismo documento? Colápsalo. 5. Solo entonces propaga (doc/prompt/commit). La velocidad no justifica propagar algo sin verificar: lo que propagas, otros lo heredan.

> Lección que la origina: se dio por caducado un presupuesto porque el fichero era viejo y el nombre decía "borrador" (proxy); lo caduco era la inferencia — el contenido real (validez de 6 meses, firmada) lo desmentía. Verificar el contenido, no el metadato.

Relacionada: [[higiene_contexto_y_tokens]], [[mejora_continua_del_kit]], [[commits_de_otros_no_se_investigan]] (ante anomalía del histórico que no distingue actor, preguntar en vez de dar algo por hecho).

## No cuentes a mano lo que una pieza del kit ya cuenta

**Un recuento propio hecho con un comando rápido es un dato sin verificar, aunque el comando sea tuyo y lo hayas escrito bien.** Caso medido (2026-08-28): se contaron los frentes abiertos de dos asuntos con `grep '^- \[ABIERTO'` y **salió uno de más en los dos a la vez** — el patrón contaba también la **línea de ejemplo** que vive dentro del bloque de código del propio fichero. El hook y la puerta del DoD la saltan correctamente, porque llevan control de bloque: **la pieza que ya existía contaba bien y el atajo contaba mal.**

**Y el daño no fue el número, fue lo que se colgó de él:** con esa cifra inflada se le dijo a un coordinador que *"las señales de partir el asunto te tocan de cerca"*. Con el número real, el argumento no se sostenía. **Un dato de más se propaga a una recomendación, y la recomendación no lleva escrito de dónde salió el dato.**

- **Si el kit ya tiene una pieza que cuenta algo, se le pregunta a ella** —o se replica su criterio, no su apariencia.
- **Un recuento que va a sostener una recomendación se verifica dos veces**, y por caminos distintos. Es exactamente la regla de fuente primaria aplicada a los números propios: **el atajo es un proxy, y un proxy no es la fuente.**
- **Lo detectó el destinatario**, que conocía su propio fichero. **Un dato sobre el trabajo de otro se contrasta con él antes de construir un argumento encima.**

> Pieza de catálogo `general/comun/doctrinas/`. **v1.6 (2026-08-28): no cuentes a mano lo que una pieza del kit ya cuenta.** Se contaron los frentes abiertos de dos asuntos con un `grep` propio y salió **uno de más en los dos**: el patrón incluía la línea de ejemplo del bloque de código, que el hook y el DoD saltan bien. **El atajo contaba mal y la pieza existente contaba bien.** El daño no fue el número sino **la recomendación que se colgó de él**, que con la cifra real no se sostenía. Regla: si el kit ya tiene una pieza que cuenta algo se le pregunta a ella, un recuento que va a sostener una recomendación se verifica por dos caminos, y **un dato sobre el trabajo de otro se contrasta con él antes de construir un argumento encima** — lo detectó el destinatario, que conocía su fichero. **v1.5 (2026-08-23):** el par **índice ↔ ficha** deja de mantenerse a mano: el resumen pasa al `index_summary` del frontmatter y el índice se **genera**, con el verificador comprobándolo. Cierra el fallo que no se detecta releyendo, porque las dos redacciones son plausibles por separado. **v1.4 (2026-08-23):** entra la **caducidad declarada** (`[CADUCA AAAA-MM-DD]` / `caduca:` en frontmatter), que el verificador convierte en **parada** y no en recordatorio, con el criterio de qué merece caducar y qué no; y la sección del **marco temporal**, que pasa a **ejecutarse** en el hook de arranque en vez de leerse de un fichero. Las dos salen del informe de continuidad entre sesiones y de tres incidentes propios de la misma semana. Se añade además el corolario de la **prueba negativa**, que es el que evita el error más caro de esa tanda: refutar la prueba de alguien y dar por refutada su conclusión. **v1.3 (2026-08-01):** dos reglas nacidas de encargos reales — lo que viaja en un encargo se etiqueta `[MEDIDO]` / `[A CONFIRMAR]` (un dato de apoyo erróneo sobrevive al viaje y el receptor lo hereda como verificado) y un comentario que declara algo "defensivo" sin haberlo medido es peor que no tenerlo, con su corolario de que un valor de configuración inválido no es latente si otros procesos lo heredan. **v1.1 (2026-07-29):** añadidas dos reglas aportadas por la implantación real — **fuente única dentro del propio documento** (la deriva entre copias no se detecta leyendo; incluye el par índice↔ficha, que se actualiza en el mismo commit) y **una comprobación favorable no prueba que el procedimiento sea fiable**, con su corolario de diagnóstico (una limitación impuesta puede ser el síntoma de un ajuste ausente). v1.0 (2026-06-15). Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente.
> Adaptada al enfoque neutro de la plantilla (sin referencias al dominio del software) — 2026-07-29.
