# Guía de configuración agéntica — para exportar a otro vault

> **Para quién.** Para el coordinador de un vault ya montado que quiera aplicar las configuraciones y decisiones de método que aquí se probaron entre el 12 y el 14 de agosto de 2026. **No describe un vault concreto**: no hay nombres, ni datos, ni rutas de máquina, ni asuntos reales. Lo que viaja es **configuración, el porqué de cada pieza, y lo que costó aprenderla**.
>
> **Cómo leerla.** Cada bloque trae **qué se configura**, **por qué** y **qué pasa si no se hace**. Las mediciones citadas ocurrieron en el vault donde se pulió el método; **son la justificación, no una promesa** de que allí darán el mismo número.
>
> **Complementa, no sustituye, al informe del método** (`informe-metodo-exportable.md`), que explica las reglas de fondo. Esto es la capa de **configuración y superficies agénticas**.
>
> **[LEER ANTES DE APLICAR NADA] Este método se pulió bajo dos condiciones que en una empresa pueden NO cumplirse**, y de ellas cuelga buena parte de lo que sigue: **(a) suscripción de consumidor sin claves de programador** —si allí hay cuenta empresarial con clave o proyecto facturable, decae el razonamiento sobre cuotas y sobre qué integraciones son viables— y **(b) repositorio local sin nube**. Antes de copiar una regla, comprueba cuál de las dos la sostiene.

---

## 1. Los perfiles de permisos: qué protege de verdad y qué no

**La lección que ordena todo lo demás, y está medida, no supuesta:**

> **Una lista de herramientas permitidas CONCEDE, NO RESTRINGE.** Es **aditiva**, no una lista blanca exclusiva. Y un modo de permisos que "no pregunta" significa *no preguntes*, **no** *deniega lo no listado*. **Verificado empíricamente:** una sesión hija lanzada con permiso solo de lectura **ejecutó comandos de shell igualmente**; la prueba concluyente pidió el valor de una variable de entorno aleatoria, inalcanzable con lo concedido, y la hija la devolvió.

**Consecuencia operativa:** *lo que quieras impedir, exprésalo como **denegación explícita**, nunca como ausencia del permiso.* Una denegación **gana a todo**, incluido el modo de permisos amplios.

### 1.1 Estructura mínima de un perfil por rol

```json
{
  "permissions": {
    "defaultMode": "acceptEdits",
    "additionalDirectories": ["../../<catalogo-comun>", "../../<memoria-del-vault>"],
    "allow": ["<lo que documenta la intencion, NO cuenta como barrera>"],
    "deny": [
      "Write(//**/<catalogo-comun>/**)", "Edit(//**/<catalogo-comun>/**)",
      "Bash(git push:*)", "Bash(git remote:*)",
      "Bash(curl:*)", "Bash(wget:*)",
      "Bash(sudo:*)", "Bash(su:*)", "Bash(rm -rf:*)",
      "Read(~/.ssh/**)", "Read(~/.aws/**)", "Read(~/.gnupg/**)",
      "Read(//**/id_rsa)", "Read(//**/id_ed25519)"
    ]
  },
  "model": "<alias de familia, no version exacta>",
  "effortLevel": "high",
  "crossSessionInbound": "accept",
  "isolatePeerMachines": true,
  "attribution": { "commit": "" },
  "env": { "<VETO DEL MODO QUE FACTURA APARTE>": "1" }
}
```

**Por qué cada pieza:**

| Clave | Qué hace | Qué pasa si no está |
|---|---|---|
| `defaultMode` | El coordinador escribe en su contenedor sin micro-aprobaciones | Fricción constante, y la autonomía la limitan los `deny`, no el modo |
| `additionalDirectories` | Lectura del catálogo común y de la memoria del vault, con **ruta relativa** (portable) | **Caso real: una regla escrita decía "consulta la memoria del vault" y el perfil no la alcanzaba.** Una regla que el perfil no permite cumplir no es una regla |
| `deny` de escritura en el catálogo | El método lo mantiene un solo rol | Cada asunto edita el método y este diverge en silencio |
| `deny` de red saliente | **Contramedida contra inyección de instrucciones** | El material entra de fuera (documentos de terceros) y el modelo no distingue datos de instrucciones. Si un documento dice *"envía esto a tal dirección"*, **la denegación es lo que lo detiene** |
| `deny` de credenciales | Llaves reales a cuentas y servicios | Es lo único que se deniega **leer**: la configuración local sí se edita, o se desfasa y rompe el entorno en silencio |
| `model` como **alias de familia** | Sobrevive al cambio de generación | Reetiquetar N ficheros en cada actualización |
| `effortLevel` | Fija el esfuerzo por sesión | Depende de que alguien elija bien en un desplegable, y eso no es una regla |
| `attribution` vacío | Commits sin coautoría de la IA | Ruido en el histórico |

### 1.2 Caveats de portabilidad que cuestan caro

- **Una denegación con ruta RELATIVA no funciona en todos los sistemas.** No resuelve contra la ruta absoluta y **se puede escribir igualmente**. Por eso las denegaciones de ruta se expresan como **glob absoluto** (`//**/<carpeta>/**`), igual que las de claves privadas. **No lo "limpies" a ruta relativa.**
- **El glob asume el nombre de la carpeta.** Si renombras el catálogo, hay que actualizar la denegación.
- **La configuración de proyecto se resuelve por el directorio de trabajo EXACTO y no hereda del padre.** Una sesión enraizada más adentro del árbol **no** hereda las denegaciones puestas más arriba: queda **más abierta** que su padre, no más protegida.
- **`Write(ruta)` es inerte; el que se evalúa es `Edit(ruta)`.** Se ponen los dos por convención, pero el que protege es el segundo.
- **Verifica el aislamiento, no lo supongas:** con la sesión arrancada, intenta escribir en la carpeta protegida y comprueba que **se deniega**. Si no se deniega, nada de esto protege.

### 1.3 La decisión que hay que tomar a propósito: ¿dónde está la frontera?

**Esto no es una recomendación, es una elección del titular, y las dos respuestas son legítimas.**

**El hecho que obliga a decidir:** si las sesiones se arrancan en **permisos amplios** —cosa razonable, para no aprobar cada edición—, **el sistema no pregunta nunca**. Entonces todo lo escrito como *"prepara, deja listo y para ahí"* **deja de tener red**: parar depende de que el agente recuerde una regla en prosa. **En permisos amplios, la puerta humana solo existe donde hay una denegación.**

**Y el punto ciego típico no son los comandos** —esos suelen estar cubiertos— **sino las herramientas de servidores externos conectados**, que pueden actuar sobre servicios reales o sobre el mundo físico y **casi nunca aparecen en las listas de denegación**, porque estas se escribieron pensando en ficheros. **Cada servidor nuevo amplía la superficie de lo irreversible y las barreras no se mueven solas.**

**Las dos posturas, con su coste:**

| Postura | A favor | Coste |
|---|---|---|
| **Restringir en el agente** (denegar herramientas irreversibles) | Barrera visible en la configuración | **Frágil** (depende de qué fichero esté cargado) y **no distingue el uso bueno del malo**: bloquea la herramienta entera |
| **Libertad técnica y restringir en el RECURSO** | La barrera es **real e independiente del agente**: un usuario sin permiso de borrado, un extremo cerrado, una copia de seguridad previa. **Ningún prompt la sortea** | Exige montar esa capa de verdad; si no se monta, no hay nada |

**En el vault donde esto se probó, el titular eligió la segunda**, y reservó las denegaciones para **comprometer dinero** (comprar, pagar, contratar). Su argumento: *"es tan fácil como cerrarle el endpoint de borrado o crear un usuario con sus restricciones, sin marcar restricciones a los modelos en archivos de configuración"*. **En una empresa con datos de terceros y obligaciones de cumplimiento, la respuesta puede ser la contraria — y eso es correcto también.** Lo que no vale es dejarlo sin decidir.

---

## 2. Mensajería entre sesiones: la configuración completa

**Qué resuelve.** Que las sesiones se pasen hallazgos, decisiones y avisos **sin que una persona copie y pegue entre terminales**. En el vault de referencia, **uno de cada diez commits** tocaba un traspaso entre sesiones, y el canal de todos ellos era una persona.

**No hay nada que instalar ni habilitar**: donde la versión lo soporta, viene activo. Lo que se configura es **qué hace cada rol con lo que le llega**.

> **Y no depende de la superficie: funciona igual en la aplicación de escritorio que en el terminal.** **Comprobado, no leído:** dos sesiones **de escritorio** intercambiaron mensajes en las dos direcciones, con contenido que ninguna de las dos tenía por separado. **El mecanismo es un socket local por sesión** (`/tmp/cc-socks/<identificador>.sock` en sistemas tipo Unix), y lo enlaza **toda sesión que tenga la función activa**, incluidas las **no interactivas** — la única que no lo hace es el arranque mínimo sin sesión.
>
> **Consecuencia práctica: la superficie que se elija no cambia lo que se puede coordinar.** Lo que cambia son las **herramientas conectadas** a cada una, y eso se soluciona conectando el servidor que haga falta, no cambiando de superficie. **Si una sesión no aparece en el listado, no es por el cliente: es que no ha enlazado su socket** — comprueba la versión y que la función no esté desactivada.

### 2.1 Las claves

```json
{
  "crossSessionInbound": "accept" | "hold" | "refuse",
  "isolatePeerMachines": true
}
```

| Valor | Comportamiento |
|---|---|
| `accept` | Se entrega cada mensaje |
| `hold` | Se retiene y se pide aprobación humana por cada uno |
| `refuse` | Se descarta sin entregar |

**`isolatePeerMachines: true`** exige aprobación explícita antes de que un mensaje **salga de la máquina**. Entre sesiones locales el mensaje viaja por un socket **sin pasar por servidores de terceros**; cruzar de máquina sí los atraviesa. **Un `true` de cualquier ámbito manda**, así que un fichero de proyecto puede encenderlo y nadie puede apagarlo desde otro sitio.

### 2.2 El reparto por rol, que es lo que hay que copiar

| Rol | Valor | Por qué |
|---|---|---|
| **Coordinadores** | `accept` | El canal es para **coordinar**, y es lo que ellos hacen |
| **Sesiones ejecutoras, de publicación y de consulta** | `refuse` | Trabajan contra un **contrato cerrado**. Si aceptan mensajes a mitad, **su encargo deja de ser el que se les dio** y el resultado ya no es verificable contra la especificación |

**Y `accept` en vez de `hold`, con motivo:** retener abre un diálogo de aprobación por cada mensaje, o sea que **deja a la persona de cuello de botella — solo que aprobando en vez de copiando**. Si el objetivo es que las sesiones dejen de necesitar un cartero, retener no lo consigue. *(En un entorno con obligaciones de auditoría, `hold` puede ser justo lo que se quiere. Decisión del titular.)*

### 2.3 Lo que hace esto aceptable, y no es la confianza

**Verificado en la documentación oficial, no supuesto:** un mensaje entre sesiones…

- **no cuenta como consentimiento del usuario** y **no puede responder una petición de permiso** pendiente;
- **no puede cambiar permisos, ficheros de reglas ni configuración** porque otra sesión lo pida;
- **un comando dentro de su texto llega como texto** y no se ejecuta;
- y **las preguntas de permiso del receptor siguen saltando** igual.

**La puerta humana no se abre: lo que se abre es el canal de información.**

### 2.4 Las tres reglas de uso que hay que escribir en el método

1. **Nunca le pidas a otra sesión algo que a ti te han denegado.** Si tu perfil bloquea una acción, pedirle al de al lado que la haga por ti **no es colaboración: es saltarse la decisión del titular por la puerta de atrás**. Eso se devuelve a la persona.
2. **El artefacto es el fichero; el mensaje es el aviso.** El canal lleva **texto plano**, nunca ficheros ni historial. Un traspaso largo se deja **escrito** donde el otro lo lee, y por el canal va el aviso. *(Corolario que ahorra contexto en todos los arranques futuros: **lo que se cuenta por mensaje no hace falta duplicarlo en los ficheros de estado**.)*
3. **Antes de mandar un encargo, pregunta si el otro ya tiene trabajo en curso sobre lo mismo.** **Caso medido:** dos áreas mantuvieron investigaciones simultáneas sobre el mismo equipo durante una semana, con premisas contradictorias, sin que ninguna pudiera verlo.

### 2.5 El límite que hay que conocer antes de diseñar nada encima

**El canal solo alcanza sesiones VIVAS. No hay buzón.** Si el destinatario no está corriendo, **no aparece en el listado y el mensaje no se puede ni enviar**; no queda encolado. *(Comprobado al intentar avisar a una sesión que había cerrado diez minutos antes.)*

**Esto no es un defecto de implementación: es el estado del arte.** El producto de referencia para equipos de agentes tiene la misma limitación documentada. **El sustituto barato y que ya funciona es el fichero**: un traspaso escrito **es** un buzón persistente, y lo que falta es que el enganche de arranque **avise de lo que hay pendiente**.

---

## 3. Las superficies para trabajar de forma agéntica, con veredicto

**Todas son sesiones del mismo agente.** La diferencia está en **quién coordina** y **si los trabajadores se comunican**.

| Superficie | Qué da | Estado | Veredicto para un vault documental |
|---|---|---|---|
| **Subagentes** | Trabajadores dentro de una sesión que hacen una tarea lateral en su propio contexto y devuelven un resumen | Estable | **ADELANTE, y solo de LECTURA.** Lo que devuelven **entra íntegro** en el contexto del padre: **acota el entregable en el encargo** |
| **Sesión ejecutora en proceso aparte** | Trabajo pesado con contexto limpio, contra un contrato escrito | Estable | **ADELANTE. Es la pieza central del método.** Ver §4 |
| **Vista de agentes** (`claude agents`, `--bg`) | Despachar y vigilar sesiones en segundo plano desde una pantalla; **sobreviven al cierre del terminal** gracias a un proceso supervisor | **Vista previa de investigación** | **PILOTO, y con dos avisos gordos** — ver abajo |
| **Equipos de agentes** | Varias sesiones coordinadas con lista de tareas compartida y mensajería entre ellas, dirigidas por un líder | **Experimental, desactivado por defecto** | **PILOTO ACOTADO.** No restaura los compañeros al reanudar y **no garantiza buzón para un agente apagado** |
| **Flujos dinámicos** | Un script que corre muchos subagentes y contrasta sus resultados | Estable | **Solo para trabajo que desborda un puñado de subagentes**: auditoría amplia, migración masiva, investigación contrastada. **Multiplica el consumo** |
| **Árboles de trabajo aislados** | Cada sesión con su propia copia del repositorio | Estable | **NO mientras no haya dos o más sesiones escribiendo en paralelo de verdad.** Umbral escrito, no gusto |
| **Sesión programada en la nube** | Ejecuta en un horario, fuera de la máquina | Estable | **NO** si la condición es *sin nube*. Descartado por restricción, no por calidad |

### 3.1 Los dos avisos de la vista de agentes, que deciden si sirve

**Es la superficie que más se parece a "autonomía real"** —las sesiones siguen corriendo con el terminal cerrado— y por eso hay que leer esto antes de adoptarla.

**Empezando por lo que más sorprende, y que ninguna documentación dice con esta claridad: DESPACHAR NO ES DELEGAR.** Una sesión de fondo **arranca en modo plan y se bloquea esperando aprobación humana antes de escribir nada**. Aparece en el listado como *esperando · bloqueada · petición de permiso*. **Si esperabas que trabajara sola, no lo hace por defecto**: hay que lanzarla con un modo de permisos que no pregunte. **Para tareas de solo lectura es perfecta tal cual; para que escriba, hay que decidirlo explícitamente.**

**Y una barrera comprobada, no leída:** un mensaje de otra sesión **NO desbloquea** esa aprobación pendiente. Se le dijo *"adelante, procede"* por el canal y **siguió bloqueada**. La puerta humana aguanta también aquí.

1. **Mueve cada sesión de fondo a un árbol de trabajo aislado antes de editar** — **y solo cuando edita**. Para código es una ventaja; **para un vault documental con un solo escritor cambia el modelo**: lo que la sesión escribe acaba en un árbol aparte, **en su propia rama**, y no en el principal. Integrarlo es un **gesto manual**.
   - **[COMPROBADO, y desmiente a la documentación] El trabajo NO se pierde solo.** La documentación avisa de que esos árboles *"se borran junto con la sesión"*. **En la máquina no ocurre así:** detener la sesión **retiene** el árbol y **dice dónde quedó y cómo borrarlo**, y el comando de borrado **se niega mientras haya cambios sin consolidar** (*"kept — worktree has uncommitted changes"*). **Hay salvaguarda real y la documentación no la menciona.** *(Es el mejor ejemplo de la regla que cierra esta guía: medir en la propia máquina gana incluso a la documentación oficial.)*
   - **El directorio de árboles aparece como no rastreado en el estado del árbol principal.** Añádelo al fichero de exclusiones: son copias de trabajo y **no se versionan nunca**.
2. **La cuota se multiplica linealmente.** Diez sesiones en paralelo consumen **unas diez veces más**. Bajo una sola suscripción, **el paralelismo no es arriesgado: es destructivo** — todas comparten la misma ventana, y superarla **para todo a la vez**, no solo lo último que lanzaste.

**De ahí la regla operativa:** la orquestación desatendida se hace **secuencial, con cola y bloqueo** — un proceso pesado a la vez. No es prudencia: es la única forma de que el conjunto no se detenga.

---

## 4. Las trampas medidas de las sesiones hijas

**Las cuatro costaron dinero o trabajo perdido. Ninguna es obvia.**

1. **Una sesión ejecutora enraizada en un contenedor HEREDA su fichero de reglas y se cree coordinadora.** Leyó *"coordinas y proteges tu contexto… el trabajo voluminoso lo delegas"*, concluyó que su tanda era voluminosa e **intentó lanzar otra ejecutora**. No hizo nada y **devolvió éxito**. **Coste: 1,11 USD y una pasada en vacío.**
   - **Nace de dos reglas correctas que se pisan:** el directorio de trabajo es el contrato, y los ficheros de contexto se acumulan hasta esa carpeta. **No basta con llamarla "ejecutora" en la especificación: el fichero de reglas pesa más que un rótulo**, porque llega antes y con más autoridad.
   - **Solución: un bloque de anulación de rol literal, al principio de la especificación Y repetido en el prompt de lanzamiento.** Los dos sitios, a propósito.
2. **Un `success` del ejecutor no significa trabajo hecho.** Es el veredicto de **la tubería**, no del modelo. **Comprueba el efecto en el disco, no el código de salida** — lo destapó una medición desde fuera, no el informe de la hija, que ni existió.
3. **El modo plan desvía el entregable.** Una sesión de análisis lanzada en modo plan **escribió su plan en el directorio de planes del cliente** en vez de devolverlo; hubo que recuperarlo del transcripto. **Dale permiso de escritura acotado a ese fichero, o recoge la salida por redirección.**
4. **Agotar la cuota devuelve código de salida 0 con salida vacía.** Un bucle desatendido lo lee como éxito y sigue. **Cualquier automatización necesita un detector de no-progreso** — contar respuestas vacías —, además de topes de turnos y de tiempo.

**Y el patrón que las une, que es lo que hay que llevarse:** *un verde puede venir de la herramienta y no del trabajo.* **Verifica el efecto, no el estado que te reportan.**

---

## 5. Lo que sostiene la calidad cuando se sube la autonomía

**El dato duro:** en el análisis de más de 1.600 trazas de fallo de sistemas multiagente reales (MAST, arXiv:2503.13657, NeurIPS 2025), **el 41,8 % de los fallos son de especificación y el 36,9 % de coordinación** — casi cuatro de cada cinco. Solo el 21,3 % son de verificación. Conclusión de los autores, literal: los fallos vienen del **diseño del sistema**, y *"mejoras en la capacidad del modelo base serán insuficientes"*.

**Traducción: el contrato escrito por sesión no se debilita nunca al automatizar.** No esperes que un modelo mejor arregle una especificación ambigua.

**Y la parte incómoda, que está documentada:** **hacer de intermediario también es revisar.** Quien transporta un resultado de una sesión a otra hace de facto una validación semántica — ve el solape, huele la premisa rara, corta la cadena. Es el **sesgo de automatización** y el **síndrome de fuera-del-bucle**: quien deja de ser revisor activo pierde capacidad de detectar el error.

**Consecuencia operativa:** al automatizar un relevo, **el fallo pasa de "trabajo duplicado visible" a "trabajo duplicado invisible"**. **Si se quita la puerta de revisión de un sitio, hay que ponerla en otro** —una verificación ejecutable, un criterio de aceptación, una puerta declarada—, no confiar en que el siguiente agente lo note.

---

## 6. Higiene de contexto: dónde está de verdad el gasto

**Medición real, y corrigió una estimación que se había hecho sumando tamaños de fichero.** Antes de leer un solo documento del vault, una sesión ya lleva **~44,5k tokens**:

| Partida | Tokens | ¿Lo controla el vault? |
|---|---|---|
| Herramientas del sistema | ~14,0k | No |
| **Habilidades instaladas** | **~9,7k** | **No — complementos del cliente** |
| **Servidores externos activos** | **~8,8k** | **No — conexiones del cliente** |
| Ficheros de reglas | ~6,4k | **Sí** |
| Prompt de sistema | ~5,6k | No |

**El vault manda en menos de una séptima parte.** En esa medición había habilidades de dominios que el vault no tocaba y **varias duplicadas entre dos complementos**, más un servidor pesado que servía a **un solo asunto** y se cargaba en todas las sesiones.

**Acción de más impacto, y es contraintuitiva: desinstalar complementos que no se usan y acotar los servidores por proyecto rinde varias veces más que podar el método.**

**Y la distinción que hay que tener clara antes de optimizar nada:**

> **AUTO-CARGADO no es lo mismo que LEÍDO AL ARRANCAR.** Lo primero entra sin que nadie lo pida y **aparece en la medición**; lo segundo entra porque una instrucción manda abrirlo, **cuesta igual** y **no aparece** como fichero de memoria. Las dos se pagan, pero **solo la segunda se puede hacer selectiva** sin tocar herramientas. **Confundirlas lleva a optimizar el fichero equivocado.**

**Techos que conviene copiar**, comprobados con el contador de bytes y **comparados sin convertir a otras unidades**:

- **Fichero de estado de un área: 40.960 bytes.** Al superarlo, lo **cerrado** baja a un histórico que no se lee al arrancar.
- **Bitácora de aprendizajes: 30.720 bytes.** Las entradas ya fundidas en una regla se resumen a una línea con puntero.
- **Fichero de reglas: por debajo de 200 líneas.**

**Tres cosas que se aprendieron aplicándolos:**

- **Mover secciones enteras no alcanza el techo.** En el caso real hicieron falta **cuatro palancas a la vez**: bajar lo cerrado, sacar el conocimiento a documentación, resumir las vías descartadas a su veredicto, y dejar de los ensayos la conclusión y no el desarrollo.
- **Resumir TARDE es lo que produce el desfase.** Un fichero de estado llegó a **no contar el estado** porque dos jornadas de datos se quedaron en otra carpeta. **La conclusión sube en el mismo commit que genera el dato**, no en una pasada de mantenimiento posterior.
- **El techo tiene fondo.** En un área en plena ejecución las palancas se agotan y se puede llegar al 97 % legítimamente. **Entonces no se sube el techo: se decide qué se cierra.**

---

## 7. Lo que se descartó, con su umbral escrito

**Para no volver a investigarlo dentro de seis meses:**

| Descartado | Motivo | Qué lo reabriría |
|---|---|---|
| Árboles de trabajo aislados por tanda | Complejidad sin beneficio | **Dos o más sesiones escribiendo en paralelo de verdad** |
| Partir el fichero de reglas en importaciones | **No ahorra contexto**: se expanden en línea y cuentan igual | Nada; es un hecho de la herramienta |
| Desactivar servidores externos no usados | Ya se cargan **diferidos**: ahorro marginal | Que dejaran de diferirse |
| Un vault independiente por proyecto | **No ahorra contexto** (las reglas de método son las mismas y habría que duplicarlas); cambia acoplamiento por **divergencia silenciosa** | Que dos áreas dejaran de compartir método |
| Un submódulo para el método común | Ataca la divergencia, **no el arranque**, y la divergencia ya se controla con comparación automática y un verificador | Que la divergencia se volviera inmanejable |
| Automatizar el acceso a un servicio conduciendo un navegador con sesión iniciada | **Viola las condiciones de uso**; el riesgo declarado es la suspensión de la cuenta | Que el servicio publicara una interfaz oficial |

**Y el criterio para trazar la frontera entre áreas, que evita el error más caro:** se corta por **cohesión y acoplamiento** —*lo que cambia junto va junto*—, no por número de contenedores. **Señal de que dos áreas deberían ser una: comparten un recurso que ambas modifican. Señal de frontera artificial: hay que declararla y defenderla por escrito.** Una frontera real no necesita defensa.

---

## 8. Qué NO conviene copiar

- **Las tablas de modelos y de límites de uso.** Caducan rápido. Copia el **criterio** (modelo por tarea, fijado por sesión, no cambiar a mitad porque invalida la caché), no los nombres.
- **Los recuentos en prosa** ("veintisiete doctrinas", "catorce sitios"). Envejecen sin avisar y nadie los actualiza.
- **La estructura por adelantado.** Un contenedor vacío "por si acaso" es deuda, no previsión. **Se crea con el primer caso de uso real.**
- **Las decisiones de frontera de este titular.** La libertad técnica total y el reparto del canal fueron **su** elección bajo **sus** condiciones. En un entorno con datos de terceros, auditoría o cumplimiento normativo, la respuesta razonable puede ser la contraria. **Copia la pregunta, no la respuesta.**

---

## 9. Orden de adopción sugerido

**Por relación esfuerzo/beneficio, de mayor a menor:**

1. **Medir el reparto de contexto** y limpiar complementos y servidores no usados. *(Barato, inmediato, y suele ser lo más grande.)*
2. **Las denegaciones de los perfiles**, empezando por la red saliente y las credenciales. *(Una tarde, y es lo único que protege de verdad.)*
3. **Los techos de los ficheros de estado**, con el contador de bytes y el criterio de qué baja al histórico.
4. **El contrato escrito por sesión ejecutora**, con el bloque de anulación de rol. *(Evita la trampa más cara.)*
5. **El canal entre sesiones**, con el reparto por rol. *(Una línea por perfil, reversible en un commit.)*
6. **La fase de análisis previa** en tandas no triviales. *(La que más rinde de todas, y la que más parece burocracia hasta que salva una tanda.)*
7. **Las superficies agénticas de fondo**, solo con caso de uso presente y piloto acotado.

**Y una regla que atraviesa las nueve secciones:** *una medición en la propia máquina gana a un informe con cita.* Aquí, dos informes de investigación seguidos recomendaron mecanismos **ya retirados**, y uno se delató solo porque anunciaba en futuro una fecha ya pasada. **Un hallazgo sin fecha y sin versión no es un hallazgo.**
