# Notas de `plantilla-settings-ejecutora-codigo.json` — la sesión que EDITA código sin preguntar por cada cambio

Perfil nuevo (tanda `repo-fuera`, R3/D5). **Nace pensado para el repositorio externo**, no para una ruta dentro del vault: el asunto lo instala donde vive el código, según registre `docs/emplazamiento-runtime.md` (`inicializador/plantilla-emplazamiento-runtime.md`).

## Por qué hace falta este perfil (regla 3 y 4 del contrato)

El vault exige que **ninguna edición de código ocurra sin plan previo, incondicional y sin excepción declarable** (ver `general/comun/packs/codigo/README.md` § "Plan antes de tocar código" y `inicializador/plantilla-tanda-ejecutora.md`), pero **una vez que el plan existe**, la sesión que lo ejecuta necesita **permisos amplios sobre el repositorio** para no perder tiempo pidiendo aprobación en cada fichero tocado — regla 3 del contrato de esta tanda: *"amplio sobre el repositorio, no sobre la máquina"*. Sin este perfil, cada asunto de software tendría que construir su propio equilibrio entre autonomía y seguridad desde cero, y lo haría distinto cada vez.

## Mecanismo: el mismo que ya está medido y en uso en este vault

No se inventa nada nuevo — se replica el patrón que ya usa `plantilla-settings-repo-codigo.json` (denegaciones de máquina) combinado con `defaultMode: acceptEdits` (ya en uso en los perfiles de coordinador):

- **`defaultMode: "acceptEdits"`** — edita sin micro-aprobaciones. La autonomía no la da el modo (que **concede**, no restringe — es la misma regla que se repite en todo el vault); la da la combinación con el `deny` de abajo.
- **`allow` acotado a lo que la sesión necesita ejecutar**: gestor de paquetes, pruebas, formateador, comprobador estático — **genéricos**, no atados a un stack, salvo lo que ya declara [[pnpm_supply_chain]] (la única pieza del pack atada a una tecnología, y porque la cadena de suministro de paquetes es un riesgo de seguridad, no una preferencia de tooling). Igual que en `plantilla-settings-coordinador-software.NOTAS.md` (ahora reconvertida a otra cosa): si el asunto no es Node, quien instala este perfil en ESE asunto añade su propia regla `Bash(<binario>:*)` con el mismo patrón — no se adivina el stack por defecto.
- **`deny` exhaustivo de lo que protege la máquina**, idéntico al de `plantilla-settings-repo-codigo.json`: `sudo`, `su`, `rm -rf`, lectura de credenciales (`~/.ssh`, `~/.aws`, `~/.gnupg`, `~/.config/gh`, `id_rsa`, `id_ed25519`), `curl`/`wget`/`Invoke-WebRequest`/`Invoke-RestMethod` (contramedida contra exfiltración vía inyección de instrucciones — el código y los commits que esta sesión ve pueden venir de fuera), `git config --global`, y `agy`/`antigravity` — el interruptor del segundo proveedor de IA en su posición apagada, detallado en [`plantilla-settings-coordinador.NOTAS.md`](plantilla-settings-coordinador.NOTAS.md).

## `git push` y `git remote` siguen DENEGADOS — esta sesión edita, no publica

**No es un descuido, es la doctrina [[no_push_por_subagentes]] aplicada sin excepción:** el push lo cierra la sesión principal como paso final verificado, nunca una sesión de edición — y esta es una sesión de edición, por amplia que sea su autonomía sobre el código. El `push` sigue siendo exclusivo de `plantilla-settings-repo-codigo.json`, lanzada aparte cuando toca ese paso. Aflojar aquí el `deny` de push repetiría exactamente el agujero que ya cerró la tanda `pack-codigo` para el perfil del coordinador: abriría el push en cualquier cwd alcanzable por esta sesión.

## No lleva `additionalDirectories`

Igual que `plantilla-settings-repo-codigo.json` y por el mismo motivo: nace para el repositorio externo, sin ninguna relación de rutas con el vault. Su mundo es el repositorio y nada más — no alcanza el contenedor del asunto ni el catálogo `general/`. Es aislamiento por **ausencia** de concesión, no por `deny`.

## No lleva el hook `SessionStart` de limpieza

El script (`limpieza-coordinacion.mjs`) opera sobre `coordinacion/` del contenedor del asunto, que esta sesión no alcanza (no hay `additionalDirectories`, y el repositorio externo no tiene ruta relativa de vuelta al vault). Cablearlo sería un hook que falla en silencio o resuelve a la ruta equivocada.

## Cómo se instala sin pisar lo que ya haya (D8)

El repositorio externo puede traer ya su propia configuración `.claude/`. Este perfil **no se instala como `.claude/settings.json`** del repositorio: se instala como fichero **con nombre**, `.claude/settings.ejecutora-codigo.json`, y se activa explícitamente al lanzar la sesión con `claude --settings .claude/settings.ejecutora-codigo.json` — el mismo mecanismo del perfil consultor (`inicializador/plantilla-consultor.md`) y del perfil hermano `plantilla-settings-repo-codigo.json`. El `settings.json` propio del repositorio, si existe, no se toca. Regístralo en `docs/emplazamiento-runtime.md` § 7. Si no se puede añadir sin pisar algo, **para y reporta**.

## Regla 4 del contrato: esta sesión nunca es la primera en tocar código

**Este perfil da permisos amplios de edición, pero no exime del plan previo.** La sesión que se lanza con `plantilla-settings-ejecutora-codigo.json` ejecuta **contra un `plan-tanda-<nombre>.md` ya escrito**: para código, a diferencia del resto del vault, no existe la excepción de "fase única declarada" (`inicializador/plantilla-tanda-ejecutora.md`). El `acceptEdits` de este perfil acelera la ejecución del plan, no sustituye al plan.

## Una lista de permitidos CONCEDE, no restringe

Igual que en cualquier otro perfil del kit: lo que de verdad protege es el `deny` de arriba y la ausencia de `additionalDirectories`, no la brevedad o amplitud del `allow`.

## Qué comprobar al instalarlo

1. El `.json` **parsea**.
2. `git push` y `git remote add`/`set-url` **se deniegan**.
3. `sudo`, `rm -rf` y la lectura de `~/.ssh/**` **se deniegan**.
4. El gestor de paquetes/pruebas/formateador/comprobador estático declarado en `docs/emplazamiento-runtime.md` **corre** sin pedir confirmación.
5. No hay **ninguna ruta absoluta** de máquina en el fichero.
6. El repositorio conserva intacto su propio `.claude/settings.json` (si lo tenía): este perfil vive en `.claude/settings.ejecutora-codigo.json`, aparte.
