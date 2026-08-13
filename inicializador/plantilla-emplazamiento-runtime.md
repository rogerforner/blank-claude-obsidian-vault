# Ficha de emplazamiento del runtime — {{ASUNTO}}

> **Qué es esto.** El repositorio de código de un asunto de software **nunca vive en el vault**: vive donde el runtime lo sirve — un servidor de desarrollo local, un volumen de contenedor, una máquina virtual. Esta ficha es lo que el coordinador **pregunta al director en su primera sesión** y las siguientes **leen en vez de volver a preguntar**. Va a `docs/emplazamiento-runtime.md` del contenedor. Instancia canónica de esta plantilla: `inicializador/plantilla-emplazamiento-runtime.md`.
>
> **Separación versionado / rutas de máquina — el mecanismo YA EXISTE, no inventes uno.** Esta ficha (`docs/emplazamiento-runtime.md`) **se versiona** y describe **qué hay y cómo se hace**, sin una sola ruta absoluta de esta máquina. Las rutas reales (dónde está el repositorio en ESTE disco, el socket del contenedor, el host de la VM) van al fichero compañero **`docs/emplazamiento-runtime.local.md`**, que el patrón `**/*.local.md` del `.gitignore` de la raíz ya excluye — confirmado con `git check-ignore -v`, sin tocar el `.gitignore` para nada. Es el mismo patrón "ficha versionada + compañero local" que ya usan `settings.json`/`settings.local.json` (ver `inicializador/plantilla-settings-coordinador.NOTAS.md`, "Cómo se instala"). *Aquí no se escriben rutas de máquina; van en el `.local.md`.*
>
> Rellena, borra este bloque y los `(parametrizar)`, y entrega los dos ficheros (versionado + local).

---

## 0. Lo ESTABLE se registra una vez; lo VOLÁTIL se reconfirma cada sesión

Esta ficha mezcla dos tipos de dato con vida útil muy distinta, y no distinguirlos es la trampa más barata de cometer — suponer del registro algo que ya cambió:

- **ESTABLE** (se escribe una vez y solo cambia si cambia el propio despliegue): la ruta del árbol servido, cómo se ejecuta un comando dentro del runtime, la dirección base de la aplicación. Va en esta ficha, tal cual, y una sesión nueva lo lee en vez de volver a preguntarlo.
- **VOLÁTIL** (caduca entre sesiones): si el runtime está corriendo o parado, los puertos (cambian entre arranques y colisionan entre proyectos) y la versión exacta del runtime (cambia con cada actualización). **No se copia el valor a esta ficha**: se deja escrito el comando barato que lo comprueba, y cada sesión lo ejecuta antes de fiarse de él.

Cada apartado de abajo que mezcle los dos lo marca por línea con `[ESTABLE]` o `[VOLÁTIL — reconfirma con el comando]`.

## 1. Dónde vive el repositorio, y por qué ahí *(parametrizar)*

- **Runtime que lo impone** `[ESTABLE]`: *(servidor de desarrollo local nativo / contenedor Docker-Podman / máquina virtual / otro)*. Qué runtime concreto y por qué el código tiene que estar ahí (no en el vault): *(…)*.
- **Ruta real del repositorio** `[ESTABLE]`: va en `docs/emplazamiento-runtime.local.md`, no aquí.
- **Excepción declarada, si aplica:** si, excepcionalmente, no hay ningún runtime que imponga nada y el repositorio vive dentro del contenedor (`repo/`), dilo aquí explícitamente y por qué — es el caso excepcional que cubre [[estructura_contenedor_asunto]] § convivencia de los dos `.git`, con la red de seguridad del `.gitignore` y del verificador. El caso normal es fuera; esto es la excepción, no el default.

## 2. Cómo se ejecuta la aplicación y cómo se entra a ejecutar un comando DENTRO del runtime *(parametrizar)*

- **Cómo se arranca/levanta** `[ESTABLE]`: *(comando exacto — `docker compose up`, un servicio systemd, una VM que ya está corriendo…)*.
- **Cómo se entra a ejecutar un comando dentro** (no en el host) `[ESTABLE]`: *(el comando de entrada exacto — `docker exec -it <contenedor> sh`, `ssh <host>`, o "es un proceso nativo del host: no hace falta entrar, se ejecuta directo" si el runtime es un servidor local nativo)*. Esta es la diferencia real entre servidor local nativo, contenedor y máquina virtual, y es lo que necesita saber cualquier sesión antes de tocar nada — → [[verificar_en_el_runtime_no_en_el_host]].
- **Nombre del contenedor/host/VM real** `[ESTABLE]`: va en `docs/emplazamiento-runtime.local.md` si es específico de esta máquina; si es un nombre estable del propio despliegue (no de esta máquina en concreto), puede ir aquí.
- **Comando barato para reconfirmar el estado AHORA** `[VOLÁTIL — reconfirma con el comando, no copies el resultado]`: *(el comando exacto que dice, en segundos, si el runtime está corriendo o parado, qué puertos usa hoy y qué versión del runtime carga — p. ej. `docker compose ps` + `… exec <servicio> <runtime> --version`, o el equivalente de la herramienta que use este asunto)*. El resultado de este comando **no se transcribe aquí como si fuera un hecho fijo**: puertos y versión cambian entre arranques y con cada actualización del proyecto, y una sesión que se fía del valor escrito en vez de ejecutar el comando trabaja sobre un dato que pudo caducar hace un minuto.

## 3. Pruebas, formateador y comprobador estático *(parametrizar)*

| Comprobación | Comando exacto | Dónde se ejecuta (host / dentro del runtime) |
|---|---|---|
| Pruebas | *(…)* | *(…)* |
| Formateador | *(…)* | *(…)* |
| Comprobador estático / typecheck | *(…)* | *(…)* |

Si alguna corre en el host y otra dentro del runtime, dilo explícitamente por fila: es la trampa más fácil de repetir sin darse cuenta ([[verificar_en_el_runtime_no_en_el_host]]).

## 4. Frontend, si hay *(parametrizar)*

- **Dirección donde se sirve:** *(…, o "no aplica: sin frontend")*.
- **Cómo se comprueba:** *(abrir en navegador, captura, comando de smoke…)*.
- **Qué se considera "funciona":** *(criterio observable, no una impresión — p. ej. "la página carga, el formulario X envía y aparece la confirmación Y")*.

## 5. Git del repositorio *(parametrizar)*

- **¿Tiene remoto?** *(sí/no; si sí, proveedor y si es Git puro — [[prohibido_uso_herramientas_github_excepto_commits_push]])*.
- **Rama de trabajo (desarrollo):** *(…)*.
- **Rama de publicación (producción):** *(…)*.
- Gobierna [[rama_desarrollo_y_paso_a_produccion]] y [[no_push_por_subagentes]]: el `push` lo ejecuta la sesión principal como paso final verificado, nunca una ejecutora.

## 6. Lo que NO se toca *(parametrizar)*

- **Datos reales:** *(bases de datos con datos de producción, volúmenes con estado — cuáles y por qué no)*.
- **Ficheros de configuración con secretos:** *(`.env` real, claves, certificados — dónde están y que no se versionan ni se leen sin necesidad)*.
- **Volúmenes con estado que no se pueden regenerar sin más:** *(…)*.

## 7. El `.claude/` del repositorio: ¿es tuyo? *(parametrizar)*

El repositorio externo puede **ya tener** su propia configuración `.claude/` (convenciones de otro proyecto, o compartida con gente que no usa este vault) — no se puede suponer que está vacío ni que es tuyo para pisar.

- **¿El repositorio ya trae `.claude/settings.json` propio?** *(sí/no)*. Si sí: *(qué contiene, en dos líneas, y si hay algo con lo que un perfil de este vault podría chocar)*.
- **Mecanismo para añadir sin pisar:** los perfiles de este vault para sesiones de código (`plantilla-settings-repo-codigo.json`, `plantilla-settings-ejecutora-codigo.json`) se instalan como **ficheros de settings con nombre** (`.claude/settings.repo-codigo.json`, `.claude/settings.ejecutora-codigo.json`) — nunca sobrescriben `.claude/settings.json` del repositorio — y se activan explícitamente al lanzar la sesión con `--settings <ruta>`, el mismo mecanismo ya en uso para el perfil consultor (`inicializador/plantilla-consultor.md`). El `settings.json` del repositorio, si existe, sigue cargándose solo como siempre y no se toca.
- **Si aun así no se puede añadir sin pisar algo:** para y reporta al director — no se fuerza.

## 8. Trampas de ficheros compartidos entre host y runtime (diagnóstico rápido)

Cuando el árbol se comparte entre el host y el runtime (montaje, carpeta compartida, sincronización), estas cuatro son las que hacen perder una hora — cada una con su síntoma, cómo se comprueba en segundos y qué **no** la arregla:

- **Identidad de usuario distinta entre host y runtime.** Síntoma: lo que escribe un lado queda inaccesible o "de otro dueño" para el otro (permiso denegado sobre un fichero recién creado al otro lado). Diagnóstico en treinta segundos: compara el identificador numérico de usuario a los dos lados — **con identificadores numéricos**, nunca con el listado normal, que resuelve nombres del sistema local y por eso **miente**. Dentro del runtime: el comando de identidad de usuario. Fuera: un listado que fuerce números en vez de nombres. Qué **NO** lo arregla: abrir permisos a todo el mundo — eso es un riesgo nuevo, no una solución, y no toca la causa (el número no coincide).
- **El vigilante de cambios no ve las modificaciones al cruzar una frontera de sistema de ficheros.** Síntoma: editas, el runtime no recompila ni relanza, y parece que el cambio no se aplicó. Diagnóstico: mira el **tipo** de sistema de ficheros del directorio (no el nombre de la carpeta) — si no es el nativo del runtime, los eventos de cambio no cruzan esa frontera. Qué **NO** lo arregla: subir el límite de vigilantes del sistema — el problema es de dónde viene el cambio, no de cuántos vigilantes hay disponibles.
- **Finales de línea de Windows rompiendo la primera línea de un script.** Síntoma: "intérprete no válido" al ejecutar un script dentro de un runtime Linux, aunque el fichero se vea normal en el editor. Diagnóstico: mira los finales de línea del fichero, no su contenido visible. Qué **NO** lo arregla: corregir la primera línea a mano una vez — vuelve a romperse en el siguiente guardado si el editor sigue escribiendo el final de línea equivocado; lo previene la declaración de finales de línea del propio repositorio, que este vault ya usa.
- **Cachés que no ven el cambio.** Síntoma: el fichero está modificado pero el runtime sigue sirviendo la versión anterior. Diagnóstico: comprueba la fecha de modificación **dentro** del runtime, no en el host — si no coincide con el guardado reciente, hay una capa de caché de por medio. Qué **NO** lo arregla: reiniciar el editor o el IDE — la caché vive en el runtime, no ahí.

→ [[verificar_en_el_runtime_no_en_el_host]] para el mismo principio aplicado a diagnosticar si algo está roto.

---

## Cómo se lee esta ficha

- **Si no existe, o le falta algún punto de los siete de arriba:** lo primero que hace el coordinador del asunto es **preguntarlo al director**, no trabajar a ciegas. Detalle del prompt: `_meta/guia-arranque-sesiones.md` § "Arrancar un coordinador de asunto de software".
- **Si existe:** se lee y se **confirma que sigue siendo cierta** antes de tocar nada (una ruta que cambió de sitio, un contenedor que ya no corre) — no se da por buena solo porque está escrita.
