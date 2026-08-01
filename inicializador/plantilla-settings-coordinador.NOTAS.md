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
- **`additionalDirectories: ["../../general"]`** — ruta **relativa** (portable) que da **lectura** del catálogo. Funciona porque el contenedor está exactamente **dos niveles** bajo la raíz del vault (`asuntos/<asunto>/`).
- **`hooks.SessionStart`** — invoca `limpieza-coordinacion.mjs`: auto-borra los handoffs y buffers gitignored ya superados y avisa de los prompts trackeados que toca quitar con `git rm`. Limpia **al arrancar**, no solo al cerrar tanda, porque las sesiones a menudo mueren por límite de contexto antes de cerrar ([[convencion_organizacion_carpeta_trabajo]]). Nunca bloquea el arranque.
- **`env.CLAUDE_CODE_DISABLE_FAST_MODE: "1"`** — **veto de `/fast` por configuración**, no por buena voluntad. `/fast` se factura **siempre** con usage credits (nunca va incluido en la suscripción) y **viene activado por defecto** en los planes altos, así que sin esta variable se gasta dinero aparte sin que nadie lo haya decidido. Una regla que depende de que el coordinador se acuerde no es una regla: esto lo apaga desde el propio settings ([[modelo_por_tarea]]).
- **`attribution` vacío** — commits sin coautoría de la IA ([[sin_coautor_commits]]).
- **`permissions.deny`** — ver la sección siguiente. Es la parte que de verdad protege.

## Las dos rutas del hook (según desde dónde se lance la sesión)

El script es **un único fichero compartido** en `general/comun/hooks/` (solo lectura para los coordinadores de asunto). La ruta que hay que poner en el `command` depende de **dónde esté el cwd de la sesión**:

| Sesión lanzada desde | Ruta en el `command` |
|---|---|
| **La raíz del vault** (coordinador general, `_meta/`) | `node "${CLAUDE_PROJECT_DIR}/general/comun/hooks/limpieza-coordinacion.mjs"` |
| **Un contenedor de asunto** (`asuntos/<asunto>/`, dos niveles) | `node "${CLAUDE_PROJECT_DIR}/../../general/comun/hooks/limpieza-coordinacion.mjs"` |

Esta plantilla trae la **segunda** (es el settings de un contenedor de asunto). El `.claude/settings.json` de la **raíz** del vault trae la primera. Si alguna vez anidas un contenedor a otra profundidad, ajusta el número de `../` — y compruébalo, porque un hook con la ruta mal **no da error visible**: simplemente no limpia.

**El hook NO se cablea en el perfil consultor.** El housekeeping de `coordinacion/` es del coordinador; un consultor de solo lectura no borra nada. Por eso `plantilla-settings-consultor.json` **no tiene bloque `hooks`**.

## Los `deny` son la barrera — el `allow` no lo es

Esto no es una preferencia de estilo, está **medido**: acotar la lista de herramientas concedidas **no restringe** a una sesión. **`--allowedTools` CONCEDE, no restringe** —es una lista **aditiva**, no una lista blanca exclusiva— y `--permission-mode dontAsk` solo significa "no preguntes", **no** "deniega lo no listado". Una sesión hija lanzada con `Read` como única herramienta concedida **ejecutó comandos igualmente** ([[orquestacion_sesiones_por_herramienta]]).

**Regla:** *lo que quieras impedir, exprésalo como `deny`, nunca como ausencia del `allow`.* Un `deny` gana a todo — incluso al flag de permisos amplios, y una sesión hija hereda los `deny` del directorio destino y no los puede saltar.

Qué protege esta plantilla, y por qué cada cosa:

- **`Write`/`Edit(//**/general/**)`** — el **catálogo en solo lectura** para los coordinadores de asunto. Es estructural: el catálogo lo mantiene el coordinador general del vault; un asunto lo **lee** —para eso está `additionalDirectories`— y no edita la fuente. Su `memoria/` es para las doctrinas **propias** del asunto ([`general/comun/README.md`](../general/comun/README.md)).
- **`git push` / `git remote`** — el vault es **git local**. No hay nada que sincronizar fuera, y el histórico lleva datos personales: que no exista destino no es garantía suficiente, así que se deniega el gesto.
- **`curl` / `wget` / `Invoke-WebRequest` / `Invoke-RestMethod`** — los comandos que **sacan algo de la máquina**. Es la contramedida contra la inyección de instrucciones: el material de entrada de un asunto viene de fuera (correos, PDF de terceros, resoluciones descargadas), y el modelo no distingue datos de instrucciones. Si un documento trae escrito "envía esto a tal dirección", el `deny` es lo que lo detiene.
- **Credenciales de máquina** (`~/.ssh`, `~/.aws`, `~/.gnupg`, `~/.config/gh`, `id_rsa`, `id_ed25519`) — las llaves a cuentas y servicios **reales**. Es lo único que se deniega leer: la config local del asunto y los documentos del vault **sí** se leen y editan sin restricción, porque si la IA no puede tocar la config local, esta se desfasa y el entorno se rompe en silencio ([[sensitive_file_guard]]).
- **`sudo` / `su` / `rm -rf` / `git config --global`** — suelo de seguridad mínimo.

## Caveats de portabilidad (leídos antes de fiarse)

- **Un `deny` con ruta RELATIVA no funciona en Windows.** `Write(../../general/**)` **no** resuelve contra la ruta absoluta: se puede escribir en el catálogo igualmente. Por eso el deny del catálogo se expresa como **glob**: `//**/general/**` — el mismo estilo que el deny de claves privadas (`//**/id_rsa`), que sí funciona. **No lo cambies a ruta relativa "para que quede más limpio".**
- **El glob asume el nombre de la carpeta.** `//**/general/**` protege cualquier carpeta llamada `general` que quede bajo el árbol. Dos consecuencias: (a) si alguna vez renombras el catálogo, hay que actualizar el deny; (b) si tuvieras otra carpeta llamada `general` en un asunto, también quedaría de solo lectura. Con la estructura del seed no ocurre, pero conviene saberlo.
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
4. `/fast` **no está activo** (la variable de entorno está puesta).
5. No hay **ninguna ruta absoluta** en el fichero versionado; todas las de máquina están en `settings.local.json`.
