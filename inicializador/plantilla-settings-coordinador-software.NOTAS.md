# Notas de `plantilla-settings-coordinador-software.json` — coordinador de un asunto con software

Variante de [`plantilla-settings-coordinador.json`](plantilla-settings-coordinador.NOTAS.md) para el perfil `asunto con software`. **Mismo aislamiento, mismas denegaciones, una sola adición al `allow`.** Todo lo que dicen las notas del perfil normal (cómo se instala, las dos rutas del hook según profundidad, los caveats de portabilidad) vale aquí sin cambios: no se repite.

## Por qué existe un perfil aparte y no basta con el normal

El coordinador de un asunto de software necesita, desde su propio cwd (el contenedor del asunto, **no** el repositorio — que vive fuera del vault, ver [[estructura_contenedor_asunto]] y `docs/emplazamiento-runtime.md`), **entrar al runtime** para comprobar algo puntual sin delegar cada mirada a una sesión ejecutora: ver si un contenedor está sano, mirar un log, lanzar una comprobación rápida dentro. Sin esta plantilla, cada asunto iría ampliando `allow` a mano y de forma distinta — exactamente lo que el vault evita fijando plantillas.

## Reconversión (2026-08-10): de "gestor de paquetes" a "comando que entra al runtime"

**Esta plantilla nació (tanda `pack-codigo`) con `Bash(pnpm:*)`** para que el coordinador ejecutara el gestor de paquetes, las pruebas, el formateador y el comprobador estático **directamente en su propio cwd**, dando por supuesto que el repositorio estaba anidado dentro del contenedor (`repo/`). **Esa premisa era falsa** (tanda `repo-fuera`): con el repositorio fuera del vault, el coordinador no tiene ningún `pnpm` que correr en su propio directorio — no hay `package.json` ahí. Lo que el coordinador sí necesita ejecutar, según R1/R2 de esta doctrina, es **el comando que entra al runtime**: `docker exec`, `podman exec`, `kubectl exec`, según registre `docs/emplazamiento-runtime.md` del asunto.

**La única diferencia real ahora:** `Bash(docker:*)` / `Bash(podman:*)` / `Bash(kubectl:*)` (y sus equivalentes `PowerShell`). No es una herramienta concreta como antes era `pnpm`: es la **familia acotada** de mecanismos estándar para entrar a ejecutar un comando dentro de un runtime que no es el host — contenedor único, stack Compose, o clúster. Universo cerrado y pequeño (a diferencia de "qué gestor de paquetes" o "qué framework de test", que sí es abierto y no se adivina), y ya es el vocabulario que usa el propio pack ([[verificar_en_el_runtime_no_en_el_host]], `higiene_disco_podman`).

## Por qué NO incluye `ssh`, a propósito

Un runtime en máquina virtual también se "entra" — por SSH. **Deliberadamente no está en el `allow` por defecto.** `ssh` no es un mecanismo acotado a un runtime declarado (como `docker exec <contenedor-que-ya-existe>`): es un primitivo genérico de ejecución remota y reenvío de puertos, de la misma familia de riesgo que `curl`/`wget` — las herramientas que el vault deniega en todos los perfiles como contramedida contra exfiltración vía inyección de instrucciones. Añadir `ssh` por defecto abriría ese mismo agujero con otro nombre. **Si el asunto usa una VM y de verdad hace falta**, el coordinador de ESE asunto añade `Bash(ssh:*)` a su propio `asuntos/<asunto>/.claude/settings.json`, sabiendo exactamente qué abre — la misma decisión, informada y por asunto, que ya pedía el perfil anterior para un stack que no fuera Node.

## Lo que esta plantilla NO hace: adivinar el runtime concreto

**Deliberado, igual que antes con el stack.** No precarga el nombre de un contenedor, un `docker-compose.yml` concreto ni un contexto de `kubectl`: eso es específico del asunto y vive en `docs/emplazamiento-runtime.md` (`inicializador/plantilla-emplazamiento-runtime.md`), no aquí. Esta plantilla solo concede **el binario**; qué contenedor o pod se nombra en cada comando lo decide quien lo ejecuta, leyendo la ficha.

**Cuando el asunto necesita algo más** (un cliente distinto, `ssh` para una VM, un binario propio del proveedor de nube) el coordinador de ESE asunto añade las reglas `allow` que le hagan falta a su propio `asuntos/<asunto>/.claude/settings.json`, con el mismo patrón (`Bash(<binario>:*)`) y sabiendo qué abre. Es una decisión del asunto, no un valor por defecto del kit.

## Lo que sigue exactamente igual que el perfil normal (y por qué)

- **`Bash(git push:*)` / `Bash(git remote:*)` siguen denegados.** Este es el perfil del **coordinador**, con cwd en el contenedor del asunto — nunca en el repositorio de código. Una regla `Bash(...)` no admite ruta ni directorio de trabajo (no hay gramática de ruta para Bash, a diferencia de `Read`/`Edit`): quitar aquí el `deny` del push lo abriría en **cualquier** cwd alcanzable por esta sesión, **incluida la raíz del vault** — que hoy solo está protegida por la ausencia de remoto, una protección mucho más débil que un `deny` explícito. Medido en vivo (ver `informe-tanda-pack-codigo.md`): una sesión con cwd fuera del contenedor del asunto **no** carga este `settings.json` — es una sesión distinta, con su propio perfil ([`plantilla-settings-repo-codigo.NOTAS.md`](plantilla-settings-repo-codigo.NOTAS.md)), y es ahí donde vive el `git push`.
- **`sudo` / `su` / `rm -rf` / lectura de credenciales / `curl` / `wget`** — el suelo de seguridad mínimo del vault, igual de válido dentro de un asunto de software que fuera.
- **`agy` / `antigravity`** — el interruptor del segundo proveedor de IA, apagado. El detalle está en [`plantilla-settings-coordinador.NOTAS.md`](plantilla-settings-coordinador.NOTAS.md) y el estado en `_meta/memoria/proveedor-secundario-ia.md`; aquí no se repite.
- **El catálogo `general/` sigue en solo lectura** (`Write`/`Edit(//**/general/**)`), con el mismo caveat: `Write(ruta)` es inerte (solo se evalúa `Edit(ruta)`); el par se mantiene por convención, lo que protege es el segundo.

## Una lista de permitidos CONCEDE, no restringe

Esto no cambia por añadir tres binarios. Lo único que hace de barrera de verdad es el `deny` — igual que en el perfil normal. `Bash(docker:*)`/`Bash(podman:*)`/`Bash(kubectl:*)` no son "menos peligrosos" por estar en una lista corta: son peligrosos lo mismo que cualquier `allow`, y lo que los mantiene acotados es que **no** pueden tocar `git push`/`git remote` (siguen en `deny`) ni salir de su cwd sin `additionalDirectories`.

## Qué comprobar al instalarlo

Los mismos seis puntos de [`plantilla-settings-coordinador.NOTAS.md`](plantilla-settings-coordinador.NOTAS.md), más uno propio:

7. Con `docs/emplazamiento-runtime.md` ya rellena, el comando de entrada que ahí se registra **corre** desde el cwd del coordinador (si el runtime es un servidor local nativo sin entrada que hacer, este punto no aplica y se dice explícitamente en la ficha).
