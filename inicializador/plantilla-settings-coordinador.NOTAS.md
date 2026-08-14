# Notas de `plantilla-settings-coordinador.json` — perfil de autonomía con verificación

Aísla al **coordinador de un asunto** (cwd en su contenedor): escribe en su contenedor, ve el catálogo `general/` en **solo lectura**, y no anda por los demás `asuntos/**`. **Portable**: ni una ruta de máquina en lo versionado.

## Cómo se instala

1. Copia el `.json` a `asuntos/<asunto>/.claude/settings.json`. La sesión del coordinador se lanza con **cwd en ese contenedor**.
2. Crea tu `asuntos/<asunto>/.claude/settings.local.json` (**gitignored**) con las rutas de **esta** máquina que el asunto necesite:

```json
{
  "permissions": {
    "additionalDirectories": [
      "<ruta local de la carpeta donde el escáner deja los PDF>",
      "<ruta local de la unidad de copias, si hace falta>"
    ]
  }
}
```

Nada de eso se versiona: cambia de una máquina a otra y no es producto del asunto.

## Qué hace, bloque a bloque

- **`defaultMode: acceptEdits`** — escribe en su contenedor sin micro-aprobaciones. La autonomía no la limita el modo, la limitan los `deny`.
- **`additionalDirectories: ["../../general", "../../_meta/memoria"]`** — rutas **relativas** (portables) que dan **lectura** del catálogo y de la memoria del vault. Funcionan porque el contenedor está exactamente **dos niveles** bajo la raíz del vault (`asuntos/<asunto>/`).
  - **Por qué la memoria del vault está aquí, y no fue así desde el principio.** El `CLAUDE.md` de la raíz manda consultar `_meta/memoria/` "para que la lea cualquier agente", pero hasta el **2026-08-14** el único directorio adicional era el catálogo: la memoria del vault le quedaba **fuera de alcance** al coordinador de un asunto, y leerla le abría una aprobación. **Una regla que el perfil no permite cumplir no es una regla**, así que se resolvió por el lado del perfil. Se concede **solo `memoria/`**, no `_meta/` entero: el resto es el meta-asunto del kit y no es suyo.
- **`hooks.SessionStart`** — invoca `limpieza-coordinacion.mjs`: auto-borra los handoffs y buffers gitignored ya superados y avisa de los prompts trackeados que toca quitar con `git rm`. Limpia **al arrancar**, no solo al cerrar tanda, porque las sesiones a menudo mueren por límite de contexto antes de cerrar ([[convencion_organizacion_carpeta_trabajo]]). Nunca bloquea el arranque.
- **`env.CLAUDE_CODE_DISABLE_FAST_MODE: "1"`** — **veto de `/fast` por configuración**, no por buena voluntad. `/fast` se factura **siempre** con usage credits (nunca va incluido en la suscripción) y **viene activado por defecto** en los planes altos, así que sin esta variable se gasta dinero aparte sin que nadie lo haya decidido. Una regla que depende de que el coordinador se acuerde no es una regla: esto lo apaga desde el propio settings ([[modelo_por_tarea]]).
- **`model` y `effortLevel`** — el modelo y el esfuerzo con los que arranca la sesión, **por la misma razón que el veto de `/fast`**: una regla que depende de que alguien elija bien en un desplegable no es una regla. Se escribe el **alias de familia** (`opus`, `sonnet`, `haiku`) y no el nombre exacto del modelo, para que el perfil **sobreviva al cambio de generación** sin reetiquetar cinco ficheros. Los valores salen de la tabla de [[modelo_por_tarea]] y aquí no se repiten. **`effortLevel` no acepta `max` ni `ultracode`** —son solo de sesión—, y hay reporte de que `max` escrito aquí **se degrada en silencio a `high`**: por eso ningún perfil arranca en `max`.
- **`env.CLAUDE_CODE_SUBAGENT_MODEL: "haiku"`** — los subagentes del coordinador van al modelo barato. Es seguro porque **su caché es independiente de la del padre**: usar otro modelo en el subagente **no invalida el prefijo cacheado** del coordinador (a diferencia de cambiar el modelo de la propia sesión). Ojo: fuerza **todos** los subagentes a ese modelo, por encima de lo que pida cada invocación.
- **`crossSessionInbound: "accept"`** — **el canal entre sesiones, abierto** (decisión del director, 2026-08-14). Los coordinadores se mandan hallazgos, decisiones y avisos **directamente**, sin que una persona copie y pegue entre terminales. **Por qué `accept` y no `hold`:** con `hold` cada mensaje abre un diálogo de aprobación, o sea que el director sigue siendo el cuello de botella — solo que aprobando en vez de copiando, que es exactamente la queja que esto resuelve.
  - **Lo que hace esto aceptable no es la confianza, es que la plataforma lo acota** (verificado en fuente oficial): un mensaje entre sesiones **no cuenta como consentimiento del usuario** y no puede responder una petición de permiso; **no puede cambiar permisos, `CLAUDE.md` ni configuración** porque otra sesión lo pida; **un comando en su texto llega como texto** y no se ejecuta; y las **preguntas de permiso del receptor siguen saltando** igual. **La puerta humana no se toca:** lo que se abre es el canal de información.
  - **Y una asimetría deliberada: las ejecutoras lo tienen en `refuse`.** El canal es para **coordinar**, y coordinar es lo que hacen los coordinadores. Una **ejecutora trabaja contra un contrato cerrado**; si acepta mensajes a mitad de tanda, su encargo deja de ser el que se le dio y el resultado ya no es verificable contra la especificación. Lo mismo el perfil de repositorio y el del consultor.
- **`isolatePeerMachines: true`** — un mensaje **no sale de esta máquina sin aprobación explícita** del director, ni siquiera en modo permisivo. Entre sesiones locales el mensaje viaja por un socket **sin pasar por servidores de nadie**; cruzar de máquina sí los atraviesa. Es la misma línea que ya fija [[soberania_datos_local]], escrita donde se cumple sola. **Un `true` de cualquier ámbito manda**, así que este fichero puede encenderlo pero nadie puede apagarlo desde otro sitio.
- **`attribution` vacío** — commits sin coautoría de la IA ([[sin_coautor_commits]]).
- **`permissions.deny`** — ver la sección siguiente. Es la parte que de verdad protege.

## Las dos rutas del hook (según desde dónde se lance la sesión)

El script es **un único fichero compartido** en `general/comun/hooks/` (solo lectura para los coordinadores de asunto). La ruta que hay que poner en el `command` depende de **dónde esté el cwd de la sesión**:

| Sesión lanzada desde | Ruta en el `command` |
|---|---|
| **La raíz del vault** (coordinador general, `_meta/`) | `node "${CLAUDE_PROJECT_DIR}/general/comun/hooks/limpieza-coordinacion.mjs"` |
| **Un contenedor de asunto** (`asuntos/<asunto>/`, dos niveles) | `node "${CLAUDE_PROJECT_DIR}/../../general/comun/hooks/limpieza-coordinacion.mjs"` |

Esta plantilla trae la **segunda** (es el settings de un contenedor de asunto). El `.claude/settings.json` de la **raíz** del vault trae la primera. Si alguna vez anidas un contenedor a otra profundidad, ajusta el número de `../` — y compruébalo, porque un hook con la ruta mal **no da error visible**: simplemente no limpia.

**El hook NO se cablea en el perfil consultor.** La limpieza de `coordinacion/` es del coordinador; un consultor de solo lectura no borra nada. Por eso `plantilla-settings-consultor.json` **no tiene bloque `hooks`**.

## Los `deny` son la barrera — el `allow` no lo es

Esto no es una preferencia de estilo, está **medido**: acotar la lista de herramientas concedidas **no restringe** a una sesión. **`--allowedTools` CONCEDE, no restringe** —es una lista **aditiva**, no una lista blanca exclusiva— y `--permission-mode dontAsk` solo significa "no preguntes", **no** "deniega lo no listado". Una sesión hija lanzada con `Read` como única herramienta concedida **ejecutó comandos igualmente** ([[orquestacion_sesiones_por_herramienta]]).

**Regla:** *lo que quieras impedir, exprésalo como `deny`, nunca como ausencia del `allow`.* Un `deny` gana a todo — incluso al flag de permisos amplios, y una sesión hija hereda los `deny` del directorio destino y no los puede saltar.

Qué protege esta plantilla, y por qué cada cosa:

- **`Write`/`Edit(//**/general/**)`** — el **catálogo en solo lectura** para los coordinadores de asunto. Es estructural: el catálogo lo mantiene el coordinador general del vault; un asunto lo **lee** —para eso está `additionalDirectories`— y no edita la fuente. Su `memoria/` es para las doctrinas **propias** del asunto ([`general/comun/README.md`](../general/comun/README.md)).
- **`Write`/`Edit(//**/_meta/**)`** — la **memoria del vault en solo lectura**. El coordinador de un asunto la **consulta**; lo que crea que falta ahí **lo propone en su cola** y lo escribe el coordinador general. Fíjate en la asimetría deliberada: se concede lectura de `_meta/memoria/` y se deniega escritura de **todo** `_meta/`, que es más de lo que se concede. Es a propósito — el deny no tiene por qué ser el espejo del `additionalDirectories`, y aquí cierra también lo que nadie le abrió.
- **`git push` / `git remote`** — el vault es **git local**. No hay nada que sincronizar fuera, y el histórico lleva datos personales: que no exista destino no es garantía suficiente, así que se deniega el gesto.
- **`curl` / `wget` / `Invoke-WebRequest` / `Invoke-RestMethod`** — los comandos que **sacan algo de la máquina**. Es la contramedida contra la inyección de instrucciones: el material de entrada de un asunto viene de fuera (correos, PDF de terceros, resoluciones descargadas), y el modelo no distingue datos de instrucciones. Si un documento trae escrito "envía esto a tal dirección", el `deny` es lo que lo detiene.
- **Credenciales de máquina** (`~/.ssh`, `~/.aws`, `~/.gnupg`, `~/.config/gh`, `id_rsa`, `id_ed25519`) — las llaves a cuentas y servicios **reales**. Es lo único que se deniega leer: la config local del asunto y los documentos del vault **sí** se leen y editan sin restricción, porque si la IA no puede tocar la config local, esta se desfasa y el entorno se rompe en silencio ([[sensitive_file_guard]]).
- **`Bash(agy:*)` / `Bash(antigravity:*)`** — el **interruptor del segundo proveedor de IA, en su posición apagada**. El vault puede repartir trabajo con un segundo proveedor ([[reparto_entre_proveedores_ia]]), pero eso **se activa a propósito o no está activo**: mientras el estado declarado en `_meta/memoria/proveedor-secundario-ia.md` sea `false`, ninguna sesión lanza su CLI. **La ficha declara; este `deny` es lo que impide** — un `true/false` escrito en un markdown es una nota, no una barrera, y esa distinción es la regla más repetida del kit. Al girar la llave se cambian **las dos cosas en el mismo commit**.
  - *Alcance real, dicho sin adornos:* esto ataja la **invocación directa** del binario, que es la vía por la que se usaría. No es un sandbox: no cubre que alguien lo envuelva en un script con otro nombre. Sirve para lo que tiene que servir — **que ninguna sesión lo lance por iniciativa propia creyendo que hace lo correcto** —, no para detener a quien quiera saltárselo a conciencia.
- **`sudo` / `su` / `rm -rf` / `git config --global`** — suelo de seguridad mínimo.

## Caveats de portabilidad (leídos antes de fiarse)

- **Un `deny` con ruta RELATIVA no funciona en Windows.** `Write(../../general/**)` **no** resuelve contra la ruta absoluta: se puede escribir en el catálogo igualmente. Por eso el deny del catálogo se expresa como **glob**: `//**/general/**` — el mismo estilo que el deny de claves privadas (`//**/id_rsa`), que sí funciona. **No lo cambies a ruta relativa "para que quede más limpio".**
- **El glob asume el nombre de la carpeta.** `//**/general/**` protege cualquier carpeta llamada `general` que quede bajo el árbol. Dos consecuencias: (a) si alguna vez renombras el catálogo, hay que actualizar el deny; (b) si tuvieras otra carpeta llamada `general` en un asunto, también quedaría de solo lectura. Con la estructura de la plantilla no ocurre, pero conviene saberlo.
- **Verifica el aislamiento, no lo supongas.** Con la sesión del coordinador arrancada: intenta escribir un fichero en `general/` y comprueba que **se deniega**. Si no se deniega, el resto de este documento no te protege de nada.
- **La invisibilidad entre asuntos hermanos es aislamiento BLANDO.** No se puede expresar como `deny` sin denegar también el propio contenedor, que vive dentro de `asuntos/`. Se apoya en el cwd y en el comportamiento acotado del coordinador (no lee otros asuntos salvo que se le pida), **no** en una barrera dura. Si un asunto exige separación fuerte —material de un procedimiento con abogado, datos médicos de un tercero—, la vía es un vault aparte, no un `deny` más.

## Si el vault tiene archivo documental

El `.json` monta solo el catálogo, porque no todo vault necesita más. Si el vault tiene un **archivo documental compartido** ([archivo_documental_compartido](../general/comun/doctrinas/archivo_documental_compartido.md)), el contenedor tiene que verlo, y en **solo lectura**: añade dos líneas, sustituyendo `<archivo>` por el nombre real del árbol.

```json
"additionalDirectories": ["../../general", "../../<archivo>"],
```

```json
"deny": [
  "Write(//**/general/**)",   "Edit(//**/general/**)",
  "Write(//**/<archivo>/**)", "Edit(//**/<archivo>/**)",
  ...
]
```

Dos avisos que valen igual aquí que para el catálogo, y que están detallados arriba: el `deny` va como **glob absoluto** y no como ruta relativa, y **`Write(ruta)` es inerte** — el que se evalúa es `Edit(ruta)`. Se ponen los dos porque el par es lo convencional, pero el que protege es el segundo.

Y el motivo de que el nombre del árbol deba ser **compuesto**: el glob no depende del nombre del vault, así que un `//**/archivo/**` dejaría en solo lectura cualquier carpeta llamada `archivo` **dentro de un asunto**. En un vault de expedientes, `//**/expediente/**` es aún peor.

## Qué comprobar al instalarlo

1. El `.json` **parsea** (`node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json','utf8'))"`).
2. El hook **corre** al arrancar: se ve su mensaje en el contexto inicial.
3. El catálogo **no se puede escribir** desde el contenedor.
4. Si el vault tiene archivo documental: **tampoco se puede escribir**, y en cambio **sí se lee**.
5. `/fast` **no está activo** (la variable de entorno está puesta).
6. No hay **ninguna ruta absoluta** en el fichero versionado; todas las de máquina están en `settings.local.json`.
