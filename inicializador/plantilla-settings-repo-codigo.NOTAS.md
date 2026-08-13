# Notas de `plantilla-settings-repo-codigo.json` — la única sesión que puede hacer `git push`

**Este perfil no es una variante de los otros dos: es un perfil nuevo, con su propio cwd y sin heredar nada.** No lo instala el coordinador del asunto en su propio contenedor — lo instala **en el repositorio de código, fuera del vault** (el caso normal: donde el runtime lo sirve, según `docs/emplazamiento-runtime.md`; o, excepcionalmente, dentro de `repo/` si el asunto declaró esa excepción), para una **sesión aparte**, lanzada solo cuando toca el paso final verificado de `[[rama_desarrollo_y_paso_a_produccion]]` / `[[no_push_por_subagentes]]`.

**Cómo se instala sin pisar lo que ya haya (D8):** el repositorio externo puede traer ya su propia configuración `.claude/` (de otro proyecto, o compartida con quien no usa este vault). Este perfil **no se instala como `.claude/settings.json`** del repositorio — eso lo sobrescribiría o entraría en conflicto con lo que ya exista. Se instala como fichero **con nombre**, `.claude/settings.repo-codigo.json`, y se activa explícitamente al lanzar la sesión con `claude --settings .claude/settings.repo-codigo.json` — el mismo mecanismo ya en uso para el perfil consultor (`inicializador/plantilla-consultor.md`). El `settings.json` del repositorio, si existe, sigue cargándose como siempre y no se toca. Regístralo en `docs/emplazamiento-runtime.md` § 7 del asunto (`inicializador/plantilla-emplazamiento-runtime.md`). Si aun así no se puede añadir sin pisar algo, **para y reporta** al director.

## Por qué hace falta un fichero de permisos aparte, y no basta con quitar el `deny` en el del coordinador

**Medido, no supuesto** (comando y salida literal en `informe-tanda-pack-codigo.md`, apartado de medición en vivo): una sesión de Claude Code con cwd fuera del contenedor del asunto **no carga** el `.claude/settings.json` del contenedor — se midió con el caso entonces vigente (repositorio anidado en `repo/`), pero el hecho es más general: `.claude/settings.json` se resuelve por el cwd **exacto** de la sesión, **sin fallback a ningún directorio padre ni ancestro** — y un repositorio externo por completo tiene aún menos relación de parentesco con el vault que uno anidado. Confirmado con un comando que el perfil del contenedor denegaba explícitamente: bloqueado con cwd en el contenedor, permitido con cwd fuera de él.

Consecuencia directa: si `git push` se permitiera aflojando el `deny` de `plantilla-settings-coordinador-software.json`, quedaría abierto en **cualquier** cwd alcanzable por esa sesión — incluida la raíz del vault, protegida hoy solo por la ausencia de remoto. La única forma limpia es la contraria: el coordinador **sigue denegando** push siempre, y una **sesión distinta**, lanzada en el repositorio (fuera del vault, o excepcionalmente en `repo/`), es la que lo tiene permitido. Por eso son dos ficheros, no uno con una excepción.

## "No hereda nada" es literal: hay que reconstruir el suelo, no solo abrir el push

Si este `.json` solo añadiera `git push` a un perfil vacío, la sesión quedaría **más abierta que el coordinador** — justo lo contrario de lo que busca esta tanda. Por eso reconstruye desde cero, **sin partir de una copia recortada del perfil del coordinador**, lo que allí se da por hereditario:

- **`sudo` / `su` / `rm -rf`** — suelo de seguridad mínimo. Sin esto, una sesión con permiso de `git push` y sin restricción de sistema es más peligrosa que cualquier otro perfil del kit.
- **`agy` / `antigravity`** — el interruptor del segundo proveedor de IA, apagado. **Aquí importa más que en ningún otro perfil**, porque este es el único que puede publicar: un segundo agente suelto en la sesión que tiene `git push` es exactamente el escenario que la regla del **escritor único** existe para impedir. Detalle en [`plantilla-settings-coordinador.NOTAS.md`](plantilla-settings-coordinador.NOTAS.md).
- **Lectura de credenciales de máquina** (`~/.ssh`, `~/.aws`, `~/.gnupg`, `~/.config/gh`, `id_rsa`, `id_ed25519`) — las llaves a cuentas reales. Especialmente sensible aquí: es la sesión que sí toca un remoto de verdad.
- **`curl` / `wget` / `Invoke-WebRequest` / `Invoke-RestMethod`** — comandos genéricos de red, contramedida contra inyección de instrucciones (el código y los commits que esta sesión ve pueden venir de fuera).
- **`git config --global`** — no toca configuración de usuario fuera de este repositorio.

**No lleva `additionalDirectories`.** Sin esa clave, la sesión no alcanza ni el contenedor del asunto ni el catálogo `general/`: su mundo es el repositorio y nada más — más cierto todavía ahora que el repositorio vive fuera del vault por completo, sin ninguna relación de rutas con él. Es aislamiento por **ausencia** de concesión, no por `deny` — coherente con el resto del vault ("los `deny` son la barrera, el `allow` no lo es", pero aquí ni siquiera hay `allow` de directorio que abrir).

**No lleva el hook `SessionStart` de limpieza.** El script (`limpieza-coordinacion.mjs`) vive en `general/comun/hooks/` y opera sobre `coordinacion/` del contenedor del asunto; ninguno de los dos es alcanzable desde aquí (no hay `additionalDirectories`, y el repositorio externo no tiene ninguna ruta relativa que lo lleve de vuelta al vault). Cablearlo sería un hook que falla en silencio o que resuelve a la ruta equivocada — peor que no tenerlo.

## `git push` sí, `git remote add`/`git remote set-url` no: es PUERTA HUMANA

**`allow: ["Bash(git:*)", "PowerShell(git:*)"]` es deliberadamente amplio** — es lo que permite el `push` sin enumerar cada subcomando. Pero dar de alta o cambiar un remoto es un acto irreversible de gobernanza (a qué servidor, con qué credenciales, de quién es la cuenta), y **eso lo hace el director una vez, a mano**, no el agente. Por eso el `deny` de `git remote add:*` / `git remote set-url:*` es más específico que el `allow` de `git:*` — y gana: es el mismo mecanismo, ya verificado en el perfil normal del coordinador, por el que `Bash(git push:*)` denegado gana sobre `Bash(git:*)` permitido. **El agente empuja a un remoto que ya existe; no lo crea.**

`git remote` sin subcomando (`git remote -v`, `git remote show`) sí queda permitido: es lectura, no gobernanza.

## Lo que esta plantilla asume que YA pasó

Esta sesión no es donde se corren las puertas de calidad ni donde se decide si el código está listo — eso ya lo hizo la sesión ejecutora de código (con `plantilla-settings-ejecutora-codigo.json`, que sí tiene el gestor de paquetes, pruebas, formateador y comprobador estático) antes de lanzar esta sesión. El único trabajo de esta sesión es: comprobar el estado (`git status`, `git log`, `git diff`), y si todo está en orden, `git push`. Si además hace falta re-ejecutar el definition-of-done aquí como última comprobación, el script se lanza igual (no está en `deny`) y, al no estar en `allow`, pedirá confirmación — que es el comportamiento correcto para algo que no es rutina en esta sesión.

## Una lista de permitidos CONCEDE, no restringe

Vale aquí con más motivo que en ningún otro perfil del kit: es el único con `git push` habilitado. Lo que de verdad lo acota es el `deny` de arriba y la ausencia de `additionalDirectories` — no la brevedad del `allow`.

## Qué comprobar al instalarlo

1. El `.json` **parsea**.
2. Lanzado con cwd en `repo/`: `git push` **no pide confirmación de más** (o, si el `defaultMode` local pide aprobación puntual, no está bloqueado por un `deny`).
3. `git remote add <url-de-prueba>` **se deniega**.
4. Un comando denegado en el perfil del coordinador (usado en la medición en vivo) sigue denegado aquí también si coincide con esta lista — y **cualquier otro no cubierto por este `deny` pide confirmación**, no se ejecuta solo.
5. No hay **ninguna ruta absoluta** de máquina en el fichero.
6. `sudo`, `rm -rf` y la lectura de `~/.ssh/**` **se deniegan**.
7. El repositorio conserva intacto su propio `.claude/settings.json` (si lo tenía): este perfil vive en `.claude/settings.repo-codigo.json`, aparte, y no lo ha sobrescrito.
