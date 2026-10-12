---
name: Estado vivo por comando — qué queda y de quién es, en un fichero de datos
description: El estado vivo de cada coordinador (qué queda abierto y de quién es) es un fichero de datos que se consulta y se cambia por comando; el porqué sigue en prosa. Un pendiente vive en el estado o en la prosa, nunca en los dos, y se actualiza en el mismo commit que el trabajo. El hook vuelca la vista al arrancar, el verificador comprueba los invariantes y el DoD mide la vista.
type: doctrine
version: 1.0
index_summary: >-
  **El estado vivo de cada coordinador es un fichero de datos** —qué queda abierto y de quién es— que **se consulta y se cambia por comando** (`estado.mjs`); el porqué sigue en prosa, en la cola y en `docs/`. **Un pendiente vive en el estado o en la prosa, nunca en los dos**, y se actualiza **en el mismo commit que el trabajo**. Cada coordinador escribe solo el suyo y lee el de otro con `--de` antes de mandarle un handoff. El **hook vuelca la vista** al arrancar (la cola ya no se lee entera), la **regla 12 del verificador** comprueba los invariantes, la doble fuente y los pendientes en prosa, y el **DoD** mide la vista contra su techo. Un activo del director lleva `caduca`; lo que espera un disparador sin fecha va `diferido`; la `nota` es corta.
---

El estado vivo de un coordinador —qué queda abierto y de quién es— es un fichero de datos que se consulta y se cambia por comando. Existe porque una cola en prosa se lee entera al arrancar, crece con cada frente y mezcla lo abierto con lo cerrado y con el porqué: lo abierto se pierde entre párrafos y el arranque cuesta cada vez más. Con un fichero de datos, el arranque paga solo la vista de lo activo, y el porqué se abre cuando hace falta.

## Dónde vive

- El general: `_meta/estado.json`.
- Cada asunto: `<espacio>/<asunto>/coordinacion/estado.json`, junto al tablero.

El script es uno, común: `general/comun/scripts/estado.mjs`, y deduce el fichero del directorio de trabajo. No hay envoltorio por ámbito. Los modos, los campos aceptados y los códigos de salida viven solo en `estado.mjs --ayuda`: esta doctrina no los copia, para que no deriven.

## La regla

- **Un pendiente vive en el estado o en la prosa, nunca en los dos.** El estado guarda qué y de quién; la prosa guarda el porqué. En un ámbito con estado, la cola no lleva etiquetas de pendiente.
- **Se actualiza en el mismo commit que el trabajo.** Un estado que va por detrás del árbol miente.
- **Entra lo que sobrevive a la sesión.** Lo que se hace y se cierra dentro de una sesión no necesita elemento.
- **Lo cambia el coordinador, no las ejecutoras**, salvo una tanda de migración que lo pida.
- **Cada coordinador escribe solo el suyo.** El de otro se lee con `--de`, y se hace antes de mandarle un handoff, para no mandarle lo que ya tiene abierto.

## Los campos y sus límites

- `id`: estable, del tipo `E1`, `E2`, por fichero. El fichero guarda `siguiente_id`, así que un id no se reutiliza nunca, ni tras podar. Entre ámbitos se cita como `general#E3` o `casa/homelab#E2`.
- `titulo` (hasta 140 caracteres), `situacion` (`abierto`, `en_curso`, `bloqueado`, `diferido`, `cerrado`), `dueno` (un rol, nunca una persona), `abierto` y `cerrado` (fechas).
- `porque`: puntero a la prosa (la entrada de la cola, un plan, un documento de `docs/`). El detalle largo va allí, no en el estado.
- `nota` y `resultado`: hasta 300 caracteres. Una nota que se vuelve párrafo es la señal de que su contenido va en `porque`.
- `caduca`: obligatorio en todo elemento activo (`abierto`, `en_curso`, `bloqueado`) cuyo dueño sea `director`. Vencido en un activo es hallazgo y para el kit, igual que un `[CADUCA]` en prosa; en un cerrado o un diferido no cuenta. Lo que espera un disparador sin fecha ("la primera vez que…") va `diferido`, con el disparador en la `nota`.
- `bloqueado_por_decision`: solo en el general; un número de `_meta/decisiones-abiertas.md`. Si esa decisión está marcada resuelta y el elemento sigue activo, es hallazgo. En el estado de un asunto el campo es hallazgo, porque los asuntos no numeran decisiones.

## Los mecanismos

- **El hook de arranque vuelca la vista** del ámbito: una línea por elemento activo, sin la `nota` (se pide con `--id`), con los caducados y los que llevan `caduca` primero; si el fichero no se lee, lo dice en vez de callar. La cola no se lee entera al arrancar: se abre por la entrada a la que apunta `porque`.
- **La regla 12 del verificador** da los invariantes del fichero, la doble fuente (un `trabajo-en-curso.md` con líneas abiertas junto a un estado) y los pendientes en prosa de un ámbito con estado.
- **El DoD** mide la vista de cada ámbito propio contra 16.384 B (aviso al 85 %) y comprueba que existe cada `porque`. El JSON no tiene techo: la `nota` va acotada y la poda quita lo cerrado.
- Las escrituras se verifican antes de escribir y dejan el fichero en formato canónico; editarlo a mano sigue siendo posible y el formato lo delata.

## Cerrar y podar

Se cierra con `--cerrar` y un `resultado` corto: el elemento cerrado se queda un tiempo como constancia. `--podar` quita los cerrados de más de 30 días; git es el histórico, y `siguiente_id` no baja.

## Transición

Mientras un asunto no tenga `estado.json`, su `trabajo-en-curso.md` sigue valiendo: el hook, el verificador y el DoD lo leen como antes. Tener los dos con líneas abiertas es hallazgo de doble fuente. Cuando migran todos, esta sección y la vía vieja se retiran.

## De dónde sale

- Decisión del director del 2026-10-08.
- El diseño viene del piloto en otro vault del director, donde el arranque pasó de 36.834 B a 2.756 B. No se trajo código: el script de aquí se escribió nuevo desde el comportamiento documentado.
- Lo que no se trajo, y por qué: `comprobar` (nunca se usó, y ejecutaría comandos sacados de datos en cada arranque), `deriva_de`, `origen` y `criterios_de_exito` (uso casi nulo), el envoltorio por ámbito (aquí los scripts comunes se ejecutan desde el catálogo) y el script que parte colas en vivo e histórico (ninguna cola supera su techo; se trae si una poda a mano no cuadra o una cola lo supera).
- Reabre el descarte del 2026-09-04 ("el piloto no se hace"), que fijó como umbral de reapertura una cola con más de 25 elementos abiertos. Medido el 2026-10-12, el umbral se cumple: 53 y 34 pendientes abiertos en dos colas.

## Relacionadas

- [[ciclo_de_tandas]] — el relevo y el paso de cierre leen el tablero y el estado.
- [[definition_of_done]] — la puerta de techos y la de trabajo en curso.
- [[convencion_organizacion_carpeta_trabajo]] — dónde cae cada fichero.
- [[orquestacion_sesiones_por_herramienta]] — el handoff entre coordinadores.
- [[scripts_adhoc_tareas_repetitivas]] — por qué esto es un script y no prosa.

> Pieza de catálogo `general/comun/doctrinas/`. **v1.0 (2026-10-12):** nace con la decisión del director del 2026-10-08 de llevar el estado vivo a un fichero de datos que se consulta y se cambia por comando. Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado y **no se hereda** automáticamente.
