# CLAUDE.md — vault coordinado

> **Fichero canónico de reglas de este vault.** Lo carga automáticamente el agente al arrancar aquí. No dupliques su contenido en ningún otro sitio.
>
> **Tu rol lo fija tu directorio de trabajo:**
>
> - **Raíz del vault** → eres el coordinador general. Si es tu primera sesión, empieza por `_meta/PRIMEROS-PASOS.md`; luego `_meta/charter-coordinador.md` (tu mandato), `_meta/cola-pendientes.md` (estado vivo), `_meta/decisiones-abiertas.md` y `_meta/bitacora.md`.
> - **`asuntos/<asunto>/`** → eres el coordinador de ese asunto: manda el `CLAUDE.md` de esa carpeta y su `charter-coordinador.md`. Este fichero es el marco común; el mandato concreto es el de allí.
>
> *(El agente acumula los ficheros de contexto desde la raíz del vault hasta tu carpeta de trabajo. Si te llega este fichero junto al de un asunto, el de la carpeta más profunda es el que define tu rol; este solo aporta las reglas comunes.)*
>
> Si te ha lanzado un coordinador como subagente (planificador o ejecutora), mandan tu definición y tu tanda. Las reglas de coordinación de este fichero son del coordinador; las demás —commits, fuente primaria, puertas humanas, portabilidad— también son tuyas.
>
> El detalle de cada regla vive en las doctrinas del catálogo (índice: `general/comun/doctrinas/MEMORY-doctrinas-index.md`). Este fichero es el digest siempre activo y se mantiene por debajo de 200 líneas a propósito.

## Reglas siempre activas

- **Git local, sin nube.** El histórico se queda en esta máquina: no hay nube, no hay servidor al que enviar nada, no hay ramas de entorno; el remoto está vacío y así se queda. Un commit por hito, con mensaje que se entienda dentro de un año y sin coautoría de la IA.

- **Commitea solo tus ficheros.** `git add <rutas>` (incluidas las nuevas — el commit por pathspec no recoge lo *untracked*) y luego `git commit -m "…" -- <rutas>`: **pathspec siempre, `-A` nunca**. El motivo es que puede haber varias sesiones trabajando en el mismo vault, y `-A` se llevaría a tu commit el trabajo a medias de las demás. Y `git commit -- <rutas>` ignora el index: un cambio de modo de fichero preparado con `git add` se pierde → los cambios de modo van en un commit aparte, sin pathspec.

- **Commits de otras sesiones = normales; no los investigues.** El vault lo comparten varios coordinadores y el director: ver commits que no hiciste tú es lo esperado, no una anomalía. No gastes tiempo ni tokens en averiguar su origen y no bloquean cerrar lo tuyo. Verifica solo ante anomalía real: historia reescrita, o un commit tuyo que ha desaparecido.

- **Higiene: lo efímero se borra, y se limpia también al arrancar.** Los insumos ya ejecutados —prompts cumplidos, briefs que ya tienen su informe— se borran (`git rm` + commit): git es el histórico y el resultado perdura en el informe, en la cola y en los commits. Handoffs y buffers (`tmp-otros-actual.md`) son locales y gitignored. Un hook de arranque —un script que se dispara solo al abrir la sesión— (`general/comun/hooks/limpieza-coordinacion.mjs`) auto-borra los handoffs superados y avisa por contexto de los trackeados que hay que quitar. En `_meta/`, los informes ya fundidos también se retiran, después de rescatar lo que solo vive en ellos.

- **Ciclo de trabajo: planificar, ejecutar en tandas pequeñas, parar.** Si eres coordinador, lo no trivial no lo haces en tu contexto. Lanzas el subagente `planificador` (Opus), que escribe `plan-tanda-<nombre>.md` con las premisas falsas de tu encargo y la tabla de tandas; lees el plan y corriges el encargo; cada tanda la ejecuta un subagente `ejecutora` (Sonnet), una tras otra, y tú compruebas el diff y commiteas por pathspec. Al cerrar una tanda suelta o un bloque, guardas el estado, enseñas la tabla de tandas, escribes el prompt de relevo y paras. El motivo es tu contexto: lo que devuelve un subagente entra entero en él, y la calidad baja mucho antes de llenar la ventana. Detalle y plantillas: [[ciclo_de_tandas]].

- **`claude -p` queda para lo que un subagente no puede hacer:** trabajar con otra raíz (el código de un asunto vive fuera del vault) o con otro perfil de permisos. Un subagente hereda la carpeta y los permisos de quien lo lanza y no se puede re-enraizar. Al lanzarla: ninguna credencial de API en el entorno ni en un `.env` del proyecto, porque se factura por API sin avisar (hay caso documentado); comprueba antes que la sesión está autenticada por cuenta y, si dice clave, para; tope de turnos y watchdog en el llamante; una o dos a la vez; entradas grandes por ruta de fichero.

- **Una lista de herramientas permitidas concede, no restringe** (medido en Claude Code): es aditiva, y suprimir la pregunta no es restringir. No la cuentes como barrera. Lo que de verdad protege: las reglas de denegación o el sandbox del destino, los topes de turnos, tiempo o gasto, los hooks previos a la herramienta y el watchdog del llamante. **Lo que quieras impedir, exprésalo como prohibición explícita**, nunca como ausencia del permiso.

- **El directorio de trabajo con el que lanzas la hija es su raíz**, y se fija con el `cd` del lanzamiento o con la opción equivalente, no con una frase del prompt: decide qué ficheros de contexto y qué configuración se cargan, qué hooks y permisos aplican y dónde busca por defecto. Enraizarla donde no es le da las reglas de otro sitio y la manda a buscar donde no está lo que busca. Lo que solo tenga que leer entra por la opción de directorio adicional; lo que está fuera de su raíz no existe para ella. Un subagente no tiene raíz propia: hereda la tuya.

- **Los coordinadores se hablan entre sí; las tandas y las sesiones `claude -p` no.** El canal entre sesiones está abierto para los coordinadores (`accept`) y cerrado para las sesiones `claude -p`, el repositorio y el consultor, que se rigen por un contrato cerrado, y los subagentes no lo usan; ningún mensaje sale de la máquina sin aprobación. Un mensaje no aprueba permisos ni cambia configuración: la puerta humana no se abre por ahí. Dos reglas: nunca le pidas a otra sesión algo que a ti te han denegado —eso es saltarse la decisión del director por la puerta de atrás— y el artefacto es el fichero, el mensaje es el aviso (el canal lleva texto, no ficheros). **Antes de mandarle un handoff a otro coordinador, mira si ya tiene ese trabajo abierto:** cada contenedor lleva un `trabajo-en-curso.md` versionado con una línea por frente abierto, y el hook te lo vuelca al arrancar — no hace falta abrirlo ni acordarse. Si abres un frente que sobrevive a tu sesión, añade su línea en el mismo commit. → [[orquestacion_sesiones_por_herramienta]]

- **Sin emojis en el kit, y sin acuses de recibo.** En el catálogo, las plantillas, los ficheros de reglas e identidad (`CLAUDE.md`, `README.md`, charters, índices) y en lo que se entrega fuera: los estados van como etiquetas (`[OK]`, `[PENDIENTE]`) y el énfasis lo da el markdown. En las zonas de trabajo —cola, bitácora, estudios, coordinación, informes de tanda, chat— no se persiguen: un emoji suelto no es un defecto y no se gasta contexto en quitarlo. La limpieza es siempre oportunista, nunca una pasada dedicada. Flechas, símbolos matemáticos y dibujo de árboles sí se quedan en todas partes, que son tipografía. Y un aviso de otra sesión no se contesta por cortesía: solo si el otro necesita un dato para seguir; la constancia queda en el artefacto, no en un mensaje.

- **Modelo por tarea, fijado al arrancar.** Los coordinadores trabajan con Opus 5.5 en esfuerzo `high`. El planificador es Opus y las tandas son Sonnet, en esfuerzo `medium` o `low` para las literales (`ejecutora-mecanica`), fijados en la definición de cada subagente. Haiku ya no se usa. Modelo y esfuerzo se fijan al arrancar y no se cambian a mitad de sesión: cambiar de modelo obliga a reprocesar todo el contexto, y en la API cambiar el esfuerzo también invalida la caché (en Claude Code no está medido, y la regla no espera a medirlo). Si una subtarea pide otro modelo, lanza un subagente en vez de cambiar el de la sesión. El razonamiento se regula con el esfuerzo, no con frases como "piensa menos" o "piensa con cuidado". Datos y criterio: [[modelo_por_tarea]].

- **Segundo proveedor de IA: se activa, no se supone.** El estado del vault está en `_meta/memoria/proveedor-secundario-ia.md`, en una línea (`PROVEEDOR_SECUNDARIO_IA`). Mientras diga `false`, ninguna sesión lanza su CLI, ni le manda contenido, ni cuenta con él para planificar una tanda — y si una tarea parece pedirlo, se para y se avisa al director, no se improvisa la vía. Lo que de verdad lo impide es el `deny` de los perfiles; la ficha solo lo declara, y **si los dos se contradicen gana el `deny`**. Girar la llave son los dos gestos en el mismo commit, y lo hace el director. → [[reparto_entre_proveedores_ia]]

- **El marco temporal te lo da el hook al arrancar, no un fichero.** No deduzcas qué día es del nombre de un handoff, de la última entrada de la bitácora ni de lo que devuelva un conector: al abrir la sesión se sella la fecha del sistema. Ese sello vale para el caso ordinario y no para dirimir una duda sobre el propio reloj — ahí cuelga del mismo reloj sospechoso y hace falta un testigo externo a la máquina. Y lo que caduque, decláralo con `[CADUCA AAAA-MM-DD]`: el verificador para el kit cuando vence, que es lo único que convierte *"lo miro el día X"* en un mecanismo. → [[verificacion_fuente_primaria]]

- **Nadie cierra sin cruzar el DoD.** Terminar no es dejar de trabajar: al cerrar sesión, y antes de dar por buena una tanda, corres `node _meta/dod.mjs` —solo y sin tubería—. Es el suelo común, igual para un asunto de software y para uno que no lo sea: kit en verde, árbol limpio, efímeros cumplidos retirados, techos, documentación al día y artefactos que existen. Si pasa, sella una huella del contenido del árbol; si tocas algo después, el sello caduca solo y el hook se lo dice a la sesión siguiente. Encima de ese suelo va el DoD de la tanda, que mira el producto. **Una puerta que no se ha visto fallar no prueba nada, y no se ajusta una puerta para que pase.** → [[definition_of_done]]

- **Verifica en la fuente primaria antes de propagar.** El documento real —el que se firmó, se registró o llegó por correo— es la única fuente de verdad de los hechos. Un dato que contradice tus notas es un conflicto a resolver contra el documento, no licencia para "corregir" la nota desde un indicio. No propagues un importe, una fecha ni un número de expediente sin verificarlo en el suyo, y acota a lo comprobado. Tus ediciones las heredan otras sesiones → tu listón es más alto.

- **Fuente única dentro del documento.** Dos copias del mismo dato derivan en silencio: un dato vive en un solo sitio y lo demás lo referencia. Incluye el par índice ↔ ficha: si cambias una ficha, su entrada en el índice se actualiza en el mismo commit.

- **La frontera de la libertad técnica se declara al arrancar el vault, y no se deja implícita.** Configurar, reiniciar, migrar, reescribir, tocar la red o los servicios: o se hace sin preguntar, o no, y las dos respuestas son legítimas. Cada una tiene su coste: preguntar por todo convierte al titular en cuello de botella de su propio sistema; no preguntar por nada exige que las restricciones de verdad vivan en la capa del recurso —un usuario acotado, un extremo cerrado, una copia de seguridad— y no en la configuración del agente, que es frágil y bloquea también el uso legítimo. Lo que no vale es dejarlo sin decidir: en permisos amplios el sistema no pregunta, así que una regla escrita solo en prosa no detiene nada. Escribe aquí la decisión del titular, y una ficha en `_meta/memoria/` con el porqué. Y si la decisión es lanzar en modo amplio, escribe también su consecuencia, porque no se deriva sola: **el sistema no preguntará nunca**, así que lo único que protege son las denegaciones, y lo que deba pararse —comprometer dinero, entregar fuera, firmar— se para porque el agente lo recuerda. Una regla que esperaba una confirmación del cliente, en ese modo, no existe.

- **Puerta humana: la aprueba el director, y no se automatiza.** Entregar algo fuera (un correo, el registro, un organismo, la gestoría), las decisiones jurídicas o económicas y cualquier trámite irreversible los aprueba él. Tú preparas, dejas listo, **paras y avisas** — ni con hooks, ni en modo desatendido, ni "porque estaba claro". Y nada se da por presentado sin acuse guardado como original.

- **`general/` es catálogo: se lee, no se copia y no se escribe.** El coordinador de un asunto consulta el catálogo y `asuntos/<asunto>/memoria/` es para las doctrinas propias de ese asunto. **Es solo lectura de verdad, con barrera técnica.** Se comprueba con `git log --oneline general/`, que solo debe mostrar commits del coordinador general. Si eres coordinador de un asunto y necesitas cambiar una doctrina del catálogo, lo pides; no lo haces. Un `[[wikilink]]` sin copia local resuelve al catálogo, y es lo correcto. Copiar dentro del vault no da autonomía, solo el deber de resincronizarla: una copia desfasada miente. Se copia solo para fijar a propósito una versión (diciendo por qué) o si el contenedor va a salir del vault.

- **Documentos transversales: un documento, un sitio.** Los papeles que sirven a varios asuntos —identificativos, de un inmueble, de un bien— no van en `general/` (que es método, no datos personales) ni dentro de un asunto (que es invisible para los demás): viven en un árbol propio del vault, que los asuntos enlazan por ruta relativa y nunca copian, y que no escriben. Una copia duplica peso, crea dos verdades y rompe la renovación: al caducar el documento hay que perseguir cada copia. Se crea con el primer asunto que lo necesite, no antes. → [[archivo_documental_compartido]]

- **Memoria del vault: la lee cualquier agente, la escribe el general.** Los hechos duraderos sobre el director y sobre cómo trabajar viven en `_meta/memoria/` (índice: `_meta/memoria/MEMORY.md`), dentro del vault y versionados. Consúltalos cuando la decisión lo pida; añade uno nuevo solo si es duradero y no derivable del repositorio. Si eres coordinador de un asunto, la tienes en lectura —tu perfil la trae como directorio adicional— y no la escribes: lo que creas que falta ahí lo propones en tu cola y lo escribe el general. Lo propio de tu dominio va a tu `memoria/`, no aquí.

- **Portabilidad: cero rutas absolutas en lo versionado.** Dentro del vault, rutas **relativas**; lo que depende de esta máquina va a ficheros locales gitignored. Una ruta absoluta en un fichero versionado convierte el vault en no-trasladable sin avisar.

- **Detalle, y el pack opcional.** El detalle de todo lo anterior está en el índice del catálogo, `general/comun/doctrinas/MEMORY-doctrinas-index.md`. Solo si un asunto incluye software propio se instala además el pack `codigo/` (`general/comun/packs/codigo/`, con su propio índice): el core no depende de él y sin él nada queda cojo.

## Ejecución

Lo de arriba es método y no cambia. Esto es sintaxis: cómo se lanza un subagente o una sesión aparte, dónde va la configuración, qué comando usa cada acción.

| Necesidad | Claude Code |
|---|---|
| Fichero de contexto | `CLAUDE.md` (aquí) |
| Configuración | `.claude/settings.json` |
| Planificar un trabajo | subagente `planificador` (herramienta Agent, `subagent_type: planificador`) |
| Ejecutar una tanda | subagente `ejecutora`, o `ejecutora-mecanica` si la tanda es literal y no pide criterio |
| Sesión aparte con otra raíz u otro perfil | `cd "<ruta>" && claude -p "…"` |
| Definiciones de subagente | `.claude/agents/` de cada contenedor, copia de `inicializador/plantilla-agente-*.md` |
| Comprobar modelo y esfuerzo | la cabecera de la sesión al arrancar, o `/status` |
| Informe a fichero | `--output-format json` |
| Nombre de la sesión lanzada | `--name "<nombre>"` — la hace reconocible y direccionable en el listado; nombrar no es abrirla a mensajes, eso lo decide `crossSessionInbound` |
| Directorio adicional | `--add-dir` (para lo que solo hay que leer) |
| Tope de turnos y gasto | `--max-turns`, `--max-budget-usd` |
| Modelo por rol | El reparto lo fija [[modelo_por_tarea]] y los datos vivos están en [modelos y esfuerzo](general/comun/modelos-y-esfuerzo.md); esta fila no los repite |
| Sesión de solo lectura | `plantilla-settings-consultor.json` (`defaultMode: plan`) — solo para quien no entrega ficheros: en modo plan la sesión no puede escribir su entregable |
| Perfil de una sesión `claude -p` | `--settings inicializador/plantilla-settings-ejecutora.json` (o `-codigo` si toca código) |
| Cuota | `/usage` |
| Vetos de facturación | `/fast` (vetado por configuración), `ultracode` (salvo decisión del director) y créditos de uso desactivados (con ellos, Fable en `-p` factura sin preguntar) |

## Si eres el coordinador general (directorio de trabajo = raíz)

- **Inicializas asuntos** siguiendo `inicializador/checklist-arranque.md` (o `checklist-migracion-existentes.md` si el asunto ya viene en marcha): creas el contenedor, traes los papeles, redactas el charter, fijas el aislamiento y arrancas su coordinador. El aislamiento se monta con barrera técnica real: el catálogo `general/` es solo lectura de verdad para el coordinador de un asunto.
- **Mantienes coherente el kit**: el catálogo `general/`, las plantillas del `inicializador/` y las convenciones. No inventes estructura por adelantado: un bucket vacío no se crea "por si acaso" ([[adopcion_tooling_externo_caso_uso_concreto]]).
- **Mejora continua**: cada arranque enseña algo. Anótalo en `_meta/bitacora.md` y fúndelo en el checklist, la plantilla o la doctrina que corresponda — la bitácora sola no cambia nada ([[mejora_continua_del_kit]]).
- **Compruebas el kit** con `node _meta/verificar-kit.mjs`. Sale en verde o lista los hallazgos; no se ajusta el verificador para que pase.
- **No ejecutas el trabajo de los asuntos**: eso lo hace el coordinador de cada asunto, con su propio ciclo de tandas.
