# Notas — `plantilla-settings-ejecutora.json`

Perfil para la **sesión ejecutora de un asunto que NO es de software**: la que transcribe un lote, tabula facturas, redacta el escrito largo, barre un árbol de ficheros o produce un informe de análisis. Para las que tocan código propio está `plantilla-settings-ejecutora-codigo.NOTAS.md`, que añade el gestor de paquetes y no trae las denegaciones del kit.

**Se activa con `--settings <ruta>` al lanzar la tanda**, no copiándolo a ningún `.claude/`. Una ejecutora no vive en un contenedor: nace, hace su trabajo y muere.

## Por qué existe, y qué agujero cierra

**Hasta el 2026-08-27 este perfil no existía**, y una ejecutora lanzada desde la raíz del vault **heredaba el `settings.json` del coordinador general**. Eso tenía tres consecuencias medidas, las tres detectadas por una tanda de extracción del propio método:

1. **Heredaba `crossSessionInbound: "accept"`**, o sea el canal entre sesiones **abierto** — cuando el `CLAUDE.md` dice expresamente que las ejecutoras lo tienen **cerrado** porque se rigen por un contrato cerrado. La regla estaba escrita y la configuración decía lo contrario.
2. **Heredaba `"model": "opus"`**, mientras la guía de arranque asignaba a la ejecutora el modelo de volumen. Una tanda de análisis corrió en el modelo caro sin que nadie lo hubiera decidido.
3. **Heredaba las denegaciones del coordinador general, que no incluyen `general/` ni `inicializador/`** — lógico, porque el general **sí** los mantiene. Una ejecutora, no.

**La lección que deja, y vale más que el fichero:** *no tener perfil no significa correr sin permisos, significa correr con los de otro*. Y el de al lado suele ser el más amplio que hay.

## Qué concede

Lo mínimo para leer un árbol y trabajar: listar, leer, buscar, contar y `git` para inspeccionar. **Nada de red, nada de gestor de paquetes.** Si una tanda concreta necesita una herramienta más, se añade **en el lanzamiento** y se declara en el contrato — no se ensancha este fichero.

## Qué deniega, y por qué estas y no otras

- **`git push` y `git remote`** — una ejecutora nunca publica. El histórico es local y quien lo mueve es el director.
- **`general/`, `inicializador/` y `_meta/` cerrados a escritura.** Son el método, y una ejecutora **ejecuta un contrato, no cambia las reglas con las que se la juzga**. Esta es la denegación que más importa: sin ella, una tanda que se cree coordinadora —trampa medida y documentada— podría editar la doctrina que la gobierna.
- **Red cerrada** (`curl`, `wget` y sus equivalentes). Lo que necesite entra **por ruta de fichero** en el contrato. Si una tanda necesita de verdad salir a la red, es una decisión del director, no un detalle de configuración.
- **El segundo proveedor de IA, por nombre de comando** (`agy`, `antigravity`), igual que en todos los perfiles: mientras el interruptor esté en `false`, la barrera es esta y no la ficha que lo declara.
- **Secretos** — claves, credenciales y configuración de herramientas de publicación.

## Lo que este fichero NO hace, y hay que saberlo

- **La lista de `allow` CONCEDE, no restringe.** Es aditiva: no es una barrera. **Lo único que impide algo es el `deny`**, que aguanta incluso bajo permisos amplios. Lo que quieras prohibir, escríbelo como denegación.
- **No anula el rol.** Una ejecutora lanzada dentro de un contenedor **carga el `CLAUDE.md` de ese contenedor** y puede creerse coordinadora — caso medido, con su factura. **El rol se anula explícitamente en el prompt y en el contrato**, no con este fichero.
- **`defaultMode: "acceptEdits"` no gana a lo que traiga el lanzamiento.** Si la sesión se abre en modo plan, la ejecutora **no podrá escribir su entregable** — y el modo plan además desvía lo que escriba fuera del directorio de trabajo. Pasó el 2026-08-27: una tanda de extracción gastó su presupuesto entero, hizo la investigación completa y **no pudo entregar**. Si lanzas en línea de comandos, fija el modo explícitamente.
- **No pone tope de gasto ni de tiempo.** Eso va en el lanzamiento (`--max-budget-usd`) y en el watchdog del llamante.

## Modelo y esfuerzo

`sonnet` / `medium` como punto de partida, **no como dogma**: la elección de modelo es un **criterio por tarea** y se puede subir en el lanzamiento con `--model` y `--effort` cuando el trabajo lo pida — una tanda de análisis que tiene que **refutar premisas** no es lo mismo que una que transcribe. → [[modelo_por_tarea]]
