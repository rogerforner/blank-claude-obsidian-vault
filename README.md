# Vault coordinado

**Una plantilla para llevar los asuntos de tu vida real con una IA que trabaja igual en cada sesión, en tu máquina y sin nube.**

Un **asunto** es cualquier cosa que se lleva de principio a fin con papeles y decisiones detrás: una reclamación a una aseguradora, la obra de una cocina, la declaración anual, el alquiler de un local, el mantenimiento de la caldera, una herencia, la instalación eléctrica que estás haciendo tú mismo. Esta plantilla no trae el contenido de ningún asunto: trae **el método y el andamiaje**, listos para copiar la carpeta y empezar.

Se publica por si le sirve a alguien en la misma situación. Es un trabajo doméstico, no un producto: no hay soporte, no hay hoja de ruta y no hay nada que instalar más allá de copiar una carpeta.

---

## Índice

1. [El problema que resuelve](#1-el-problema-que-resuelve)
2. [Quién lo escribe](#2-quién-lo-escribe)
3. [Cómo se hizo: con Claude, sesión a sesión](#3-cómo-se-hizo-con-claude-sesión-a-sesión)
4. [Por qué Claude y no otro](#4-por-qué-claude-y-no-otro)
5. [Cómo está organizado el trabajo](#5-cómo-está-organizado-el-trabajo)
6. [Los roles: quién hace qué](#6-los-roles-quién-hace-qué)
7. [El flujo de trabajo completo](#7-el-flujo-de-trabajo-completo)
8. [Ejemplo de uso, de principio a fin](#8-ejemplo-de-uso-de-principio-a-fin)
9. [Puesta en marcha](#9-puesta-en-marcha)
10. [Con qué trabajo](#10-con-qué-trabajo)
11. [Mapa de carpetas](#11-mapa-de-carpetas)
12. [Las reglas que no se negocian](#12-las-reglas-que-no-se-negocian)
13. [Qué NO es esto](#13-qué-no-es-esto)
14. [Licencia](#14-licencia)

---

## 1. El problema que resuelve

Trabajar con una IA sobre asuntos reales falla siempre por los mismos cinco sitios:

- **El trabajo se pierde al cerrar la conversación.** Lo que se decidió el martes no existe el jueves.
- **La IA no trabaja igual dos veces.** Lo que se pactó el mes pasado depende de que alguien se acuerde de repetirlo.
- **Los plazos se pasan.** Un asunto con un tercero enfrente —un organismo, una aseguradora, un juzgado— vive de fechas, y un plazo perdido no se recupera con más trabajo.
- **Se hace algo irreversible.** Un correo enviado, un formulario presentado, un pago hecho.
- **Los datos salen de la máquina.** Los papeles de casa llevan DNI, cuentas, nóminas, informes médicos y datos de terceros que no han decidido nada al respecto.

La respuesta de esta plantilla a cada uno. Como aparece aquí por primera vez el vocabulario del método, va explicado: el **charter** es el documento de mandato de un asunto (qué se lleva, con qué alcance y con qué plazos), la **cola de pendientes** es la lista viva de lo que falta, la **bitácora** es el diario de lo aprendido, y las **doctrinas** son las reglas del catálogo, versionadas una por fichero.

| Fallo | Respuesta |
|---|---|
| El trabajo se pierde | **El estado vivo está escrito**, no en el contexto de una conversación: cola de pendientes, charter, bitácora. Relevar una sesión no pierde nada. |
| La IA no trabaja igual | Las reglas viven en un **`CLAUDE.md` canónico** que se auto-carga, y en un catálogo de **doctrinas versionadas**. |
| Los plazos | Van al charter y a la cola **con fecha**, y salen en la lectura de arranque de cada sesión. |
| Lo irreversible | **Puerta humana**: entregar fuera, firmar, pagar y las decisiones jurídicas o económicas las aprueba una persona. La IA prepara, deja listo y para. |
| Los datos | **Git local, sin nube.** No hay remoto, no hay servidor al que enviar nada. La transcripción y la conversión de documentos se hacen con herramientas locales. |

**A quién le sirve.** A alguien que ya usa una IA para trabajo de verdad, tiene varios asuntos abiertos a la vez y se ha dado cuenta de que el cuello de botella no es el modelo: es que cada conversación empieza de cero.

**A quién no.** Si tienes un asunto suelto y pequeño, esto es más andamiaje del que necesitas. Abre un chat y ya está.

---

## 2. Quién lo escribe

Soy **Roger Forner Fabre**, de Roquetes (Terres de l'Ebre, Cataluña). Estoy felizmente casado, tengo un hijo pequeñito y, a eso, hay que sumarle que soy desarrollador y trabajo en Privacy Driver.

Tengo la necesidad de estar en movimiento, de sacar adelante proyectos que me ayuden a experimentar y a aprender: domótica, reformas, jardinería, instalaciones eléctricas, algún proyecto de sostenibilidad en la finca. Cosas que hago yo mismo, en los pocos ratos que consigo libres.

Llevo años usando la IA para programar. En algún momento **empecé a usarla también para todo lo demás**, y ahí es donde se complicó un poquitín.

**Y de ahí salió esto.** Cada una de esas cosas arrastra papeles, presupuestos, plazos, cálculos y decisiones que hay que recordar meses después, además de la necesidad de intentar estar al día. La IA me ayudaba con cada trozo, pero cada conversación empezaba de cero: volvía a explicar el contexto, volvía a pactar cómo quería trabajar, y lo decidido la semana anterior no existía o estaba desfasado. Así que fui montando lo que me faltaba —el sitio donde vive el estado, las reglas que no hay que repetir, la forma de encargar trabajo— hasta que dejó de ser un apaño y se convirtió en un método.

**Y no está terminado.** Sigue creciendo: cada semana algo enseña que una regla sobraba, que otra estaba mal escrita o que faltaba una tercera. Son cosas que van pivotando poco a poco, y eso pese a que la IA avanza más rápido que Han Solo por el _Corredor de Kessel_.

Si a alguien le sirve, que lo coja y lo haga suyo — que experimente, que cambie lo que no le encaje y que lo adapte a su forma de trabajar, que seguramente no es la mía. Esto es lo que a mí me funciona hoy, no una receta.

---

## 3. Cómo se hizo: con Claude, sesión a sesión

**Este vault no se diseñó y luego se escribió. Se fue construyendo con Claude, poco a poco, mientras se usaba.** Cada regla que hay aquí nació de algo que salió mal una vez, se midió, y se convirtió en regla para que no volviera a pasar.

Ese ciclo es explícito y tiene sitio propio en la estructura:

1. **Pasa algo** — una sesión se pierde, una **tanda** (un encargo de trabajo con contrato escrito, explicado en la sección 7) devuelve trabajo vacío, una cifra viaja mal de un documento a otro.
2. **Se anota en la bitácora** (`_meta/bitacora.md`) con lo que costó.
3. **Se funde donde cambia el comportamiento**: la doctrina, el checklist o la plantilla que corresponda. La bitácora sola no cambia nada — anotar sin fundir es una forma cómoda de no arreglar el problema.
4. **La doctrina sube de `version`** y se anota su changelog en el pie, con fecha y motivo.

Por eso las doctrinas del catálogo llevan un pie con su historial de versiones, y por eso muchas frases del kit vienen con una cifra al lado. Un par de ejemplos que verás citados dentro:

- Una sesión ejecutora cargó el fichero de reglas del coordinador, se creyó coordinadora, decidió que su trabajo era voluminoso e **intentó delegarlo en otra sesión**. No hizo nada de lo encargado y **devolvió éxito**. Coste: 1,11 USD y una pasada en vacío. De ahí salió el bloque de **anulación de rol** que hoy encabeza todo contrato de tanda.
- Una lista de herramientas permitidas resultó ser **aditiva**: una sesión lanzada sin permiso de shell ejecutó shell igualmente. De ahí salió la regla de que **lo que quieras impedir se expresa como denegación explícita**, nunca como ausencia de permiso.
- Una comprobación de "no se ha perdido nada" comparaba un recuento sobre datos que otro proceso estaba usando en vivo: **cambiaron solos en 11 segundos** y frenaron una tanda sin que nada estuviera roto. De ahí salió la regla de comprobar la **identidad** de lo que quieres proteger, no su contenido volátil.

**Y una aclaración sobre esas cifras en dólares, porque se malinterpretan fácil: no son facturas. Aquí no se ha pagado ni un céntimo aparte.** Todo esto corre con **la suscripción de Claude Code y nada más** — sin clave de programador, sin API, sin consumo facturado por uso. Lo que la herramienta reporta como coste de una sesión es **una forma de medir cuánto trabajo se llevó**: sirve para comparar una tanda con otra, para detectar que algo se fue de madre y para decidir si merece la pena repetirlo. Es un cuentakilómetros, no un recibo. Los topes que verás en los contratos de tanda funcionan igual: **cortan la sesión al llegar al número, pero no cobran nada**.

**Consecuencia práctica para quien se lo descargue:** las reglas que parecen exageradas suelen ser las que más costaron —en tiempo, en trabajo rehecho y en tardes perdidas—. Si vas a quitar una, quita la que entiendas del todo.

*(Este README también lo ha redactado Claude Code, trabajando como coordinador general del vault, y lo he revisado y aprobado yo. Sería raro esconderlo en un repositorio que va justamente de eso.)*

---

## 4. Por qué Claude y no otro

Honestamente: **por el límite de contexto, no por fidelidad a una marca.**

Mi primer intento serio de este método fue con GPT. Me pasé **un día entero** montando la configuración equivalente —el fichero `AGENTS.md`, las reglas, la estructura— y **tuve que desistir**: los modelos no aguantaban el contexto que un vault así necesita para arrancar una sesión sabiendo quién es, qué reglas cumple y en qué estado está el asunto. No era un problema de calidad de las respuestas; era que no cabía.

Con Claude Code sí funciona, así que el método se quedó aquí. **Toda la configuración de aquel intento se eliminó**, y no queda ningún resto en este repositorio.

Dicho esto, el método **no es propiedad de ninguna herramienta**. Lo que es específico de Claude Code está deliberadamente acotado a una sola tabla —la de "Ejecución" en el `CLAUDE.md`— que traduce cada necesidad del método a su comando concreto. Todo lo demás está escrito en términos de *qué hace falta*, no de *qué botón se pulsa*. Si algún día otra herramienta aguanta el contexto, se cambia esa tabla y el resto sigue en pie.

---

## 5. Cómo está organizado el trabajo

**Un vault por ámbito de la vida, no uno gigante para todo.** Yo llevo dos:

- **Uno técnico y doméstico** — electricidad DIY, reformas, el diseño del jardín, la domótica, el mantenimiento de la casa.
- **Uno personal** — lo que no tiene nada que ver con lo anterior y no debe compartir contexto con ello.

La razón no es el orden estético: es que **cada vault carga sus reglas en cada sesión**, y mezclar ámbitos hace que el agente arranque con contexto que no le sirve. Separar por ámbito real es lo que mantiene los arranques ligeros.

**Dentro de un vault, cada asunto tiene su carpeta y su sesión**, y trabaja solo con lo suyo.

### ¿Esto es un asunto o son dos?

Es la duda que aparece siempre. Pongamos un caso: **la obra del baño** y **la reclamación al seguro que la provocó**. ¿Van juntas o separadas?

La pregunta que lo decide es esta: **¿las dos tienen que tocar la misma cosa del mundo real?** El mismo presupuesto, el mismo aparato, el mismo contrato.

- **Si la respuesta es sí, es un solo asunto.** Separarlas te obliga a copiar cada dato de un lado al otro cada vez que algo cambia. Y el día que se te olvide copiarlo —que se te olvidará— tendrás dos versiones distintas de la misma cifra y ninguna forma de saber cuál vale.
- **Si es no, son dos asuntos**, cada uno con su carpeta y su sesión.

Y una pista para cuando dudes: **si tienes que ponerte a explicar por escrito dónde acaba uno y empieza el otro, es que probablemente son el mismo.** Cuando de verdad son dos cosas distintas, no hace falta explicar nada: se ve solo.

*(Esto lo aprendí equivocándome. Tuve dos asuntos separados investigando **el mismo aparato** durante una semana, cada uno por su lado, llegando a conclusiones que se contradecían, y sin que ninguno de los dos supiera que el otro estaba en lo mismo.)*

### Lo que comparten todos

Si cada asunto va por su cuenta, ¿qué pasa con lo que necesitan varios? El DNI, las escrituras de la casa, la ficha técnica del coche, la póliza del seguro: papeles que hoy hacen falta para una reclamación y dentro de dos años para otra cosa.

**No se copian en cada carpeta.** Van a un sitio común del vault, y cada asunto **enlaza** el que necesite. Hay dos carpetas comunes, con contenidos muy distintos:

- **El catálogo** — las reglas del método. Sin datos de nadie.
- **El archivo de documentos** — los papeles que sirven a varios asuntos a la vez.

**Todas las sesiones las ven, y las ven a la vez.** Que dos estén trabajando en asuntos distintos no les impide consultar el mismo documento al mismo tiempo: nadie lo bloquea ni tiene que esperar.

**Por qué no copiarlos**, que es lo que uno haría por instinto: el día que renuevas el DNI, lo cambias en un sitio y **todos los asuntos quedan al día de golpe**. Con copias repartidas tendrías que perseguirlas una a una, y la que se te escape seguirá enseñando el documento viejo con toda la naturalidad del mundo.

Dos detalles de cómo está montado:

- **Las sesiones pueden leer ese archivo, pero no escribir en él.** Si a un asunto le falta un papel, te lo pide y lo archivas tú. Así no hay ninguna sesión moviendo o renombrando documentos que otras están usando.
- **Esa carpeta no existe hasta que hace falta.** Se crea con el primer asunto que necesite compartir un documento, no antes: una carpeta vacía "por si acaso" solo es una cosa más que mantener.

### Separados, pero se hablan

Aquí hay algo que cambió hace poco y que quita bastante trabajo. Antes, si la sesión de un asunto descubría algo que le servía a otra, **el recadero era yo**: copiar el hallazgo de una ventana, pegarlo en la otra, y esperar no haberme dejado nada por el camino.

Ahora **las sesiones se mandan mensajes directamente**. Lo tengo probado en las dos direcciones: una sesión detecta algo, se lo dice a la otra, la otra responde y corrige — sin que yo tenga que estar en medio.

Y esto es justamente lo que hace que **separar asuntos no salga caro**: están aislados para que cada uno vaya a lo suyo, pero si comparten algo pueden decírselo.

Con dos límites puestos a propósito:

- **Solo se hablan entre sí las sesiones que coordinan.** Las que están haciendo un encargo cerrado no reciben mensajes: si les cambias el encargo a mitad, ya no hay forma de comprobar que hicieron lo que se les pidió.
- **Un mensaje no da permisos.** Una sesión no puede autorizar a otra a hacer algo que tú no has autorizado. Lo que necesita tu visto bueno lo sigue necesitando, venga de donde venga.

---

## 6. Los roles: quién hace qué

El modelo es de **sesiones independientes**, cada una abierta desde la carpeta que le da identidad. **La carpeta desde la que abres la sesión es lo que determina el rol** — no una frase del prompt. Desde ella se cargan el fichero de reglas, la configuración, los permisos y los hooks.

| Rol | Se abre desde | Qué hace | Qué NO hace |
|---|---|---|---|
| **Director** | — | Tú. Decides, apruebas lo irreversible y lees los informes. | No transportas información entre sesiones a mano; para eso está el canal. |
| **Coordinador general** | raíz del vault | Mantiene el kit, inicializa asuntos, lleva la cola y las decisiones abiertas. | No trabaja dentro de ningún asunto. |
| **Coordinador de asunto** | `asuntos/<slug>/` | Lleva **su** asunto: estado, plazos, prompts, verificación. | No ejecuta el trabajo voluminoso, y no ve los demás asuntos. |
| **Consultor** | la del asunto, o la raíz | Responde dudas factuales citando fichero y línea, en modo de solo lectura. | No edita, no decide, no deduce lo que no está escrito. |
| **Sesión ejecutora** | el contenedor del asunto | Hace el trabajo voluminoso con contexto limpio, contra un contrato cerrado. | No coordina, no delega, no lanza otras sesiones. |
| **Subagentes** | dentro de una sesión | Reconocimiento y lectura en paralelo. **Siempre de solo lectura.** | No escriben nada. |

**La regla que sostiene todo el modelo: coordinar no es ejecutar.** Si el coordinador se pone a transcribir cuarenta facturas, se queda sin contexto a mitad y hay que relevarlo — y entonces el asunto avanza a base de relevos en vez de a base de trabajo. El trabajo voluminoso va a un **proceso aparte con contexto limpio**.

**Y el reparto de modelos va por rol, no por gusto:** el modelo capaz para coordinar y para lo difícil, el modelo de volumen para las tandas grandes, el barato para subagentes y mecánica. Van fijados en el `settings.json` de cada perfil, **no elegidos a mano al arrancar**: una regla que depende de que alguien se acuerde de tocar un desplegable no es una regla. *(Los nombres concretos de modelo caducan rápido; están en la doctrina `modelo_por_tarea`, que es la pieza más volátil del catálogo a propósito.)*

---

## 7. El flujo de trabajo completo

Este es el corazón del método, y el orden importa: **primero se investiga, después se planifica, y solo entonces se lanza el trabajo.** Cada fase existe para que la siguiente no se haga a ciegas.

### Fase 0 — El brief, antes de arrancar nada

**Nada empieza con "ponte a ello".** Empieza con un **brief escrito**: un fichero que dice qué decisión hay que fundamentar, qué se da ya por verificado, qué restricciones son inviolables y qué preguntas concretas hay que responder.

**Por qué, y esto es lo que más consistencia aporta de todo el método:** un encargo hablado se interpreta distinto cada vez. Un brief escrito se puede releer, se puede corregir, y —lo importante— **se puede comparar con lo que volvió**. Sin brief no hay forma de saber si la respuesta contestó la pregunta o contestó otra.

Las dos plantillas de brief, según a qué se dirija la investigación:

- **`_meta/plantilla-brief-chat-web.md`** — para la **forma de trabajar** del vault: un modelo nuevo, una herramienta, un método.
- **`inicializador/plantilla-brief-deep-research.md`** — para el contenido de **un asunto concreto**.

Tres cosas que un brief bien escrito lleva siempre:

1. **Contexto verificado**, para que no se re-derive lo que ya se sabe — con cada dato etiquetado como `[MEDIDO]` o `[A CONFIRMAR]`. Un dato de apoyo erróneo **sobrevive al viaje** y quien lo recibe lo hereda como bueno.
2. **Restricciones duras**, que ganan sobre la utilidad del resultado.
3. **Preguntas cerradas y verificables.** *"¿Qué opinas de X?"* vuelve como ensayo; *"¿qué límite tiene X, medido cuándo y dónde lo dice?"* vuelve como dato.

**Y una frontera que no se cruza:** la investigación abierta se ejecuta **fuera** de la sesión de coordinación —en el chat web— y por tanto **fuera de la máquina**. Un brief no lleva datos personales, ni documentos, ni nombres de terceros, ni importes identificables: se pregunta en abstracto. **Si la pregunta no se puede formular sin el dato, no sale: se resuelve en local.**

*(Efecto lateral que se descubrió usándolo: un brief escrito en abstracto es además **portátil**. Se puede lanzar en la cuenta que tenga cuota disponible, incluso ajena, sin filtrar nada.)*

### Fase 1 — Investigar, que no es adoptar

La investigación vuelve como **informe**, al lado del brief. Y entonces tiene que superar un **filtro de adopción** de cinco puntos antes de que nada entre en el vault:

1. **Caso de uso concreto YA** — un trabajo real que hoy duele, no uno hipotético para dentro de un año.
2. **Qué sustituye o simplifica** — si se suma sin quitar nada, el mantenimiento sube y la ganancia es dudosa.
3. **Soberanía del dato** — dónde vive lo que le entregas y qué se hace con ello.
4. **Condiciones de uso y coste real**, incluido el de aprenderlo y el de abandonarlo.
5. **Piloto acotado y reversible**, con el criterio de éxito escrito **antes** de empezar.

Y antes de los cinco: **cuestiona la premisa.** ¿Hace falta la herramienta, o basta con lo que ya hay en la máquina y un poco de convención?

**Que algo exista, funcione y esté bien no es razón para meterlo en el vault.**

### Fase 2 — Planificar: el contrato de tanda

Cuando hay que hacer trabajo de verdad, el coordinador escribe un **contrato**, no un encargo. La plantilla es `inicializador/plantilla-tanda-ejecutora.md` y sus apartados son deliberados:

- **Objetivo** en términos de resultado observable — *"existe el escrito con sus cinco anexos numerados"*, no *"trabajar en las alegaciones"*.
- **Alcance**, con lo que **NO** entra dicho explícitamente. Los originales están fuera siempre.
- **Contexto verificado**, con cada dato etiquetado.
- **Decisiones ya tomadas, que no se reabren.** Es lo que más reduce las preguntas.
- **Criterios de aceptación** — cada uno comprobable con un comando o un cotejo, no con una opinión.
- **Definition of done**: los comandos exactos que deben pasar en verde.
- **Puertas humanas**, que la ejecutora prepara y no cruza.
- **Límite de líneas del informe.** Campo obligatorio, no adorno: lo que devuelve una sesión hija **entra íntegro** en el contexto de quien la lanzó.

**La regla de oro:** si la ejecutora tiene que **preguntar algo**, es que faltaba en la especificación. Cada pregunta es información para mejorar la siguiente tanda.

**Y la especificación se escribe ligera, no exhaustiva.** Un plan rígido empeora las tareas que sorprenden a mitad, y un plan tan detallado que llena el contexto degrada al propio agente. El detalle de más no es prudencia, es coste.

### Fase 3 — La ejecutora de análisis, y por qué existe

**Toda tanda no trivial va en DOS sesiones ejecutoras.** La primera no ejecuta nada: **analiza**.

Es de **solo lectura** —no modifica material, no hace commits, deja el historial intacto— y su **único** entregable de escritura es un fichero: **`plan-tanda-<nombre>.md`**, con cinco apartados:

1. **Verificación en fuente primaria de CADA premisa de la especificación**, con el comando ejecutado y su salida literal. No *"se ha comprobado que"*: el comando y lo que devolvió.
2. **Las premisas de la especificación que resultan FALSAS**, listadas explícitamente. Si está vacío, se dice vacío.
3. **Inventario de lo que va a tocar**, con el perímetro.
4. **Decisiones que la especificación dejó abiertas sin darse cuenta.**
5. **Orden de pasos y riesgos**, incluido qué hacer si un paso falla a mitad.

**Y aquí está la razón de todo el mecanismo, que es lo que más se malinterpreta:**

> **El plan no existe para que la ejecutora se organice. Existe para que TÚ corrijas la especificación antes de que equivocarse cueste trabajo.**

El punto de corrección es **el coordinador leyendo el plan**. Si no vas a leerlo, no lances la fase: te habrás gastado una sesión en generar un fichero que nadie usa.

**Que se paga sola, medido:** en una poda de una cola de pendientes, la especificación del coordinador mandaba 75 líneas al archivo histórico. La tanda de análisis demostró que **59 de ellas eran plan de ejecución vivo con tareas abiertas**, no material archivable: moverlas habría **escondido trabajo pendiente** de la lectura de arranque. Además rescató **cuatro pendientes** atrapados en secciones que bajaban. Sin esa pasada, la tanda habría salido en verde y mal.

**Saltársela es legítimo; saltársela en silencio, no.** Si la tanda es pequeña y sabes lo que hay, se declara en la especificación: *"tanda de fase única declarada"*, y por qué.

### Fase 4 — Lanzar la ejecución

Con la especificación ya corregida por lo que destapó el plan, se lanza la segunda sesión. **La lanza el coordinador**, no el director: corre en un proceso aparte con contexto limpio, así que *coordinar ≠ ejecutar* se mantiene intacto.

Lo esencial de la sintaxis, en una línea: **la sesión se lanza dentro del directorio donde tiene que escribir** (`cd "<ruta>" && claude -p "<prompt>"`), lo que solo tiene que leer entra por `--add-dir`, y se ponen cortacircuitos duros de turnos y de gasto.

> **Fuente única:** los comandos completos, con sus opciones y sus techos medidos, están en `inicializador/plantilla-tanda-ejecutora.md` § *Variante headless*, y la traducción necesidad → comando, en la tabla "Ejecución" del `CLAUDE.md`. **No se duplican aquí a propósito**: dos copias de lo mismo derivan en silencio, y esa también es una regla del kit.

**Cuatro trampas medidas, y las cuatro hacen que una tanda mala parezca buena:**

1. **El fichero de reglas pesa más que el rótulo.** Una sesión enraizada en el contenedor del asunto carga el fichero de reglas del **coordinador** y se cree coordinadora. Por eso todo contrato empieza con un **bloque de anulación de rol** literal, que va **en el contrato y también en el prompt de lanzamiento** — el contrato lo lee al abrir el fichero; el prompt lo tiene delante desde el primer token.
2. **`success` no significa que el trabajo se haya hecho.** Ese aviso lo pone el programa que ha ejecutado la sesión, no el modelo que ha razonado sobre la tarea: solo informa de que el proceso terminó sin romperse, no de que hiciera lo que pediste. **Se comprueba mirando los ficheros que debían cambiar**, no ese aviso.
3. **La lista de herramientas permitidas concede, no restringe.** Es aditiva. Lo que protege de verdad, por orden: las **reglas de denegación** del destino, los **cortacircuitos** de turnos y gasto, los **hooks previos a la herramienta** y el **watchdog** del que lanza.
4. **El modo plan desvía el entregable.** El modo plan es una forma de arrancar una sesión en la que solo propone lo que haría, sin llegar a hacerlo. Si lanzas la ejecutora así por descuido, en vez de dejar el resultado donde se lo pediste puede guardar su propuesta en una carpeta interna de la herramienta, y lo único que te llega es una frase diciendo que el plan está ahí.

Y antes de lanzar nada, dos comprobaciones que no se saltan: que **la sesión del agente está autenticada por cuenta** (no por clave de programador), y que **no hay ninguna clave de API definida**, ni en el entorno ni en un fichero de entorno del proyecto — si la hay, se factura aparte y en silencio.

**Baja concurrencia: una o dos sesiones, nunca un enjambre.** Todas comparten la misma cuota, así que el paralelismo aquí no es arriesgado: es destructivo.

### Fase 5 — Verificar

**Verificado, no supuesto.** Lo que se puede comprobar por comando se **ejecuta** y se reporta el **output literal**. Lo que no —medir una estancia, cotejar contra el papel original, entrar en una sede electrónica con certificado, confirmar que el envío llegó— **no desaparece del cierre**: se convierte en **comprobación en campo**, con los pasos exactos y qué resultado esperar. La hace el director y la reporta.

**Nunca se ajusta el criterio para que pase.** Es la frase más repetida del kit y la que más disciplina exige.

### Fase 6 — Fundir el aprendizaje

Al cerrar: qué falló, qué costó, y **dónde se cambia para que no vuelva a pasar**. Doctrina, checklist o plantilla; se sube la `version`, se actualiza el índice **en el mismo commit**, y se anota en la bitácora.

Con esto el ciclo vuelve a la Fase 0, y es literalmente cómo se construyó lo que estás leyendo.

### Y cuando una sesión necesita hablar con otra

Cómo funciona y por qué solo se hablan las que coordinan está en la sección 5. Aquí van las dos reglas de uso, que son las que evitan los dos malos usos previsibles:

- **Nunca le pidas a otra sesión algo que a ti te han denegado.** Eso es colarse por la puerta de atrás a una decisión ya tomada.
- **El mensaje avisa; el trabajo va en un fichero.** Por el canal solo viaja texto, así que lo que se hace se deja escrito donde tiene que estar y el mensaje solo dice que ya está.

---

## 8. Ejemplo de uso, de principio a fin

Un caso completo y ficticio: **una reclamación a la aseguradora por daños de agua**. Sirve para ver el flujo entero; los nombres de carpeta y los prompts son los reales del kit.

**Punto de partida:** hay una carpeta en el disco con escaneos del parte, dos presupuestos de reparación, fotos y un burofax. Y un plazo de alegaciones dentro de tres semanas.

**1. Abres el coordinador general** — sesión de Claude Code con la carpeta de trabajo en la **raíz del vault**:

```
Arranca como coordinador general de este vault. Lee _meta/PRIMEROS-PASOS.md, el charter, la cola de pendientes, las decisiones abiertas y el índice de doctrinas. Salúdame con el estado en 2-3 líneas y tu propuesta de siguiente paso.
```

**2. Le pides que inicialice el asunto.** Como ya viene en marcha y con material sensible, el coordinador pasa por `inicializador/checklist-migracion-existentes.md` antes de copiar nada: reconocimiento del material y **puerta de confidencialidad** —qué entra al vault se decide, no se asume—. Después crea `asuntos/reclamacion-agua-2026/` desde la plantilla de contenedor, redacta el charter con **el plazo escrito con fecha**, y fija el perfil de permisos que le da el catálogo en solo lectura.

**3. Abres el coordinador del asunto**, esta vez con la carpeta de trabajo en `asuntos/reclamacion-agua-2026/`:

```
Arranca como coordinador de este asunto. Lee tu charter-coordinador.md, la cola de pendientes, las doctrinas propias de memoria/ y, si existe, el material de referencia en coordinacion/referencia/. Salúdame con el estado del asunto y tu plan de arranque.
```

Su primer trabajo es **entender el expediente**: cronología y reconocimiento. Y eso lo hace con **subagentes de solo lectura**, que devuelven un resumen en vez de meterle los cuarenta documentos en el contexto.

**4. Antes de redactar nada, un brief.** Hay una duda que decide el enfoque entero: qué plazos y qué requisitos formales aplican a este tipo de reclamación. El coordinador escribe el brief con la plantilla de investigación, **en abstracto y sin un solo dato del expediente**, y se ejecuta fuera. Vuelve un informe con las respuestas y sus citas fechadas.

**5. Se planifica.** Con el informe encima, el coordinador escribe el contrato de la tanda: transcribir los escaneos, tabular los importes de los dos presupuestos y cotejarlos contra el parte. Con criterios comprobables:

> *"La suma de la columna importe de los presupuestos de `docs/presupuestos/` coincide con el total que figura en el escrito"* — no *"revisar que las cuentas cuadran"*.

**6. Sale la ejecutora de análisis.** Devuelve `plan-tanda-transcripcion.md` y encuentra dos premisas falsas: **a un escaneo le falta una página** y uno de los presupuestos está **sin firmar**, así que no sirve como prueba. Eso, en la tanda de ejecución, habría salido a mitad y con el trabajo ya hecho.

**7. Corriges el contrato y lanzas la ejecución.** El coordinador la lanza acotada, con sus topes, y recoge un informe corto. La tanda hace el trabajo y **para** ante lo que no le toca: la página que falta es un **hallazgo** que sube a lo primero de la cola, no algo que la ejecutora improvise.

**8. Se verifica.** Los comandos de la definition of done se ejecutan y se reporta su salida literal. Lo que no se puede comprobar por comando —volver a escanear la página que falta— se entrega como **comprobación en campo**, con los pasos exactos.

**9. La puerta humana.** El escrito queda listo, con sus anexos numerados y comprobados. **Presentarlo lo haces tú.** El agente prepara y para ahí, y nada se da por presentado sin **acuse** guardado como original.

**10. Se funde lo aprendido.** Si algo de la especificación estaba mal, se corrige la plantilla; si el fallo fue de método, se sube la versión de la doctrina. La siguiente tanda arranca mejor que esta.

**Lo que hay que retener del ejemplo:** entre el "tengo una carpeta con papeles" y el "existe un escrito comprobado" no hay ni una sola vez en la que alguien haya tenido que acordarse de una regla. Todo lo que gobierna ese recorrido está **escrito y se carga solo**.

---

## 9. Puesta en marcha

### Lo que hace falta

- **Claude Code, con una suscripción normal de pago. No hace falta ninguna clave de API ni ninguna cuenta de programador**, ni aquí ni en las sesiones que el coordinador lanza por su cuenta: todo el método funciona con lo que da la suscripción y nada más. De hecho, tener una clave definida es **contraproducente** — se prioriza sobre la suscripción y empieza a **facturar por uso en silencio**, así que el kit comprueba que no la haya antes de lanzar una tanda.
- **Node.js** — solo para dos cosas: el verificador del kit y el hook de higiene que corre al arrancar cada sesión.
- **git**, que se usa **en local**: sin remoto, sin nube.
- **Obsidian, opcional.** El vault es markdown con enlaces `[[wikilink]]`, así que Obsidian va muy bien para leerlo; nada del método depende de él, y la configuración de su interfaz está excluida del control de versiones a propósito.

### Los pasos

1. **Copia la carpeta y renómbrala** por su ámbito (`casa`, `finanzas`, `reclamaciones`). Un vault por ámbito, no uno gigante para todo.
2. **Decide el histórico.** La copia trae el git de la plantilla. Si prefieres empezar limpio, borra `.git` y haz `git init`. En cualquier caso **no configures ningún destino externo**: el `.claude/settings.json` ya lo refuerza con reglas de denegación.
3. **Abre la primera sesión con la carpeta de trabajo en la raíz.** Serás el coordinador general. El `CLAUDE.md` se auto-carga; empieza por **[`_meta/PRIMEROS-PASOS.md`](_meta/PRIMEROS-PASOS.md)**, que es el arranque real. Los prompts listos para copiar, por rol, están en **[`_meta/guia-arranque-sesiones.md`](_meta/guia-arranque-sesiones.md)**.
4. **Contesta las dos preguntas que el vault necesita de ti** y que no se pueden suponer:
   - **¿Dónde está tu frontera de libertad técnica?** Qué puede hacer el agente sin preguntar y qué no. **No hay respuesta universal**: la fija el titular del vault, y el `CLAUDE.md` la trae como pregunta, no como afirmación.
   - **¿Hay un segundo proveedor de IA?** El vault nace con esa llave **apagada** (`_meta/memoria/proveedor-secundario-ia.md`), y se gira a propósito o no está girada.
5. **Ajusta el `_meta/` a tu ámbito**: el charter, los primeros bloques de la cola y las decisiones abiertas. Llegan **vacíos a propósito**, con su estructura y un ejemplo.
6. **Inicializa el primer asunto** con [`inicializador/checklist-arranque.md`](inicializador/checklist-arranque.md), o con [`checklist-migracion-existentes.md`](inicializador/checklist-migracion-existentes.md) si ya viene en marcha. La carpeta `asuntos/` **no existe todavía**: aparece con el primero.
7. **Comprueba que el kit está sano**: `node _meta/verificar-kit.mjs` tiene que salir en **verde**. Comprueba ocho reglas estructurales —enlaces colgados, índices desincronizados, rutas absolutas de máquina coladas en lo versionado—. **Y no se ajusta el verificador para que pase.**

**Lo que NO hay que hacer al arrancar:** rellenar carpetas por adelantado, instalar herramientas "por si acaso" ni traer todos los papeles de golpe. Cada pieza entra con un caso de uso concreto delante.

---

## 10. Con qué trabajo

**Nada de esto es obligatorio y el método no depende de ninguna de estas herramientas.** Lo cuento porque cuando alguien enseña un sistema y no dice con qué lo mueve, hay que reconstruirlo a base de prueba y error. Esto es de dónde partir; si tienes algo mejor o simplemente distinto, cámbialo.

| Para qué | Qué uso | Por qué esa |
|---|---|---|
| Coordinar y ejecutar | **Claude Code** | Aguanta el contexto que el método necesita. La sección 4 cuenta el intento anterior |
| Leer y escribir el vault | **Obsidian** | Cómodo para navegar enlaces, pero **opcional**: son ficheros markdown y se leen con cualquier cosa |
| El histórico | **git**, en local | Sin remoto y sin nube |
| Transcribir escaneos y extraer tablas | **Docling** | Convierte PDF escaneados, DOCX e imágenes a markdown **conservando la estructura**. En un expediente, lo que importa suele estar en una tabla |
| Convertir entre formatos | **Pandoc** | Universal y sin dependencias: el borrador vive en `.md` y la gestoría lo quiere en `.docx` |
| Generar el PDF que se presenta | **Pandoc + CSS + WeasyPrint** | Ver abajo |
| Investigar antes de decidir | **El chat web** | Fuera de la sesión de trabajo, para no quemar su contexto |

### El PDF, que es el caso que más se repite

Cuando hay que entregar algo presentable —a una aseguradora, a un organismo, a un instalador— la cadena es:

```
borrador.md  →  Pandoc  →  HTML  →  + hoja CSS  →  WeasyPrint  →  PDF final
```

**Y el motivo de dar ese rodeo en vez de generar el PDF de una vez:** separa el **contenido** de la **presentación**. El `.md` se versiona en git y se compara línea a línea, así que se ve qué cambió entre dos versiones de un escrito; la hoja de CSS lleva los márgenes, la tipografía, los encabezados y la numeración, y **se reutiliza en todos los asuntos**. Pandoc solo genera un PDF básico; el maquetado lo pone WeasyPrint.

### Lo que tienen en común, y es lo que las eligió

**Las tres de documentos corren en local.** Un expediente doméstico lleva DNI, cuentas, informes médicos y datos de terceros que no han decidido nada al respecto: eso **no se sube a un conversor web**, por cómodo que sea. Esa es la razón de la lista, no que sean las más populares.

*(La ficha completa —qué instala cada una, sus licencias y los flujos típicos— está en [`general/comun/tooling-documentos.md`](general/comun/tooling-documentos.md). Y hay un caso que ninguna cubre y que aprendí a base de intentos: **rellenar un modelo `.docx` ajeno sin romperlo**, que exige editar el XML del original en vez de convertirlo y reconstruirlo. También está ahí.)*

### Cómo entró cada una: primero se investiga, después se decide

**Ninguna de estas herramientas se adoptó porque sonara bien.** Cada vez que aparecía una necesidad —transcribir un lote de escaneos, entregar un PDF decente, repartir trabajo entre dos proveedores de IA— el procedimiento fue siempre el mismo:

1. **Escribo un brief** con la plantilla del kit: qué decisión hay que fundamentar, qué doy ya por verificado, qué restricciones son inviolables y qué preguntas concretas quiero respondidas.
2. **Lo lanzo en una sesión de investigación en el chat web**, fuera del vault y **en abstracto, sin un solo dato de casa**.
3. **Vuelve como informe** y pasa el filtro de cinco puntos de la sección 7: caso de uso presente, qué sustituye, dónde viven los datos, condiciones y coste real, y piloto acotado con criterio de éxito escrito **antes** de empezar.
4. **Lo que entra, se funde** en la doctrina o la plantilla que toque; lo que no, se descarta **con el motivo escrito**, para no volver a evaluarlo dentro de seis meses.

Así es como el vault ha ido pivotando: no de un diseño inicial, sino de una cadena de briefs, informes y decisiones pequeñas. **Por eso la plantilla trae las plantillas de brief**: son la herramienta con la que esto sigue creciendo.

---

## 11. Mapa de carpetas

| Ruta | Qué es |
|---|---|
| `README.md` | Esto. |
| `CLAUDE.md` | Las reglas **siempre activas**, canónicas y auto-cargadas. Tu rol lo fija tu carpeta de trabajo: raíz → coordinador general; `asuntos/<asunto>/` → coordinador de ese asunto. Se mantiene por debajo de 200 líneas a propósito. |
| `.claude/settings.json` | Perfil de la sesión coordinadora de la raíz: hook de higiene (un script que se dispara solo al arrancar la sesión y limpia lo que sobra), modelo y esfuerzo fijados, y **reglas de denegación** (credenciales de la máquina, destinos externos para git). |
| `.gitignore` | Qué no se versiona y **por qué**, comentado línea a línea. |
| [`general/comun/`](general/comun/README.md) | **Catálogo** transversal: las doctrinas del core con su índice, el hook de higiene, el tooling **local** de documentos y la resolución de problemas de la herramienta. Se **LEE**: no se copia ni se hereda, y para un coordinador de asunto es **solo lectura con barrera técnica**. |
| [`general/comun/packs/codigo/`](general/comun/packs/codigo/README.md) | Pack **opcional**, solo si un asunto incluye **software propio**. Si tu vault no toca software, ignóralo entero: el core no depende de él. |
| [`inicializador/`](inicializador/README.md) | **Procedimiento y plantillas** para arrancar un asunto: los dos checklists, el charter, el contrato de tanda, el handoff, el consultor, los perfiles de permisos por rol y el árbol de contenedor a copiar. |
| [`_meta/`](_meta/README.md) | **El kit tratado como un asunto más**: charter, cola, decisiones abiertas, bitácora, primeros pasos, guía de arranque de sesiones y el verificador. Aquí se gestiona la evolución del propio vault. |
| `asuntos/<asunto>/` | Los asuntos, uno por carpeta, todos con la misma estructura. **No existe hasta que inicializas el primero.** |
| *(el archivo de documentos)* | Los papeles que sirven a **varios** asuntos —identificativos, de la vivienda, de un vehículo—, en un sitio y enlazados desde cada asunto en lugar de copiados (sección 5). Las sesiones lo leen pero **no escriben en él**, y **no existe hasta que el primer asunto lo necesita**: el nombre se lo pones tú al crearlo. |

---

## 12. Las reglas que no se negocian

El detalle vive en el catálogo de doctrinas; esto es el resumen.

- **Git local, sin nube.** Un commit por hito, con mensaje que se entienda dentro de un año y **sin coautoría de la IA**.
- **Commitea solo tus ficheros**, por pathspec, **nunca con `-A`**: puede haber varias sesiones trabajando en el mismo vault y `-A` se llevaría el trabajo a medias de las demás.
- **Coordinar no es ejecutar.** El trabajo voluminoso va a una sesión aparte con contrato escrito.
- **Puerta humana.** Entregar fuera, firmar, pagar y las decisiones jurídicas o económicas las aprueba una persona. Ni con hooks, ni en modo desatendido, ni "porque estaba claro".
- **Verifica en la fuente primaria antes de propagar.** El documento real es la única fuente de verdad. Un dato que contradice tus notas es un conflicto a resolver contra el documento, no licencia para corregir la nota desde un indicio.
- **Fuente única dentro del documento.** Dos copias del mismo dato **derivan en silencio**: un dato vive en un sitio y lo demás lo referencia.
- **Lo efímero se borra.** Los prompts cumplidos y los briefs que ya tienen su informe se borran: git es el histórico. Los relevos entre sesiones son locales y no se versionan.
- **Portabilidad: cero rutas absolutas en lo versionado.** Lo que depende de una máquina va a ficheros locales excluidos del control de versiones.
- **Lo que quieras impedir, exprésalo como prohibición explícita**, nunca como ausencia de permiso.
- **Los secretos no salen de la máquina.** Contraseñas, claves, tokens y certificados: a ningún servicio y por ningún canal.

---

## 13. Qué NO es esto

Para que nadie pierda una tarde averiguándolo:

- **No es un producto.** No hay soporte, ni versiones, ni compatibilidad garantizada hacia atrás. Es el método de trabajo de una persona, publicado tal como está.
- **No es un asistente autónomo.** Está diseñado justamente al revés: para que lo irreversible pase por una persona.
- **No es multiusuario.** Un vault, una máquina, un titular. El histórico es local y no se sincroniza con nadie.
- **No trae datos de ningún asunto.** Ni míos ni de nadie. Es andamiaje vacío a propósito.
- **No es consejo jurídico, fiscal ni financiero.** Ayuda a organizar el trabajo alrededor de esas decisiones; no las toma.
- **Los datos de plataforma que cita caducan.** Nombres de modelo, límites de uso y opciones de configuración cambian rápido: están concentrados en las piezas marcadas como volátiles, y se verifican antes de fiarse de ellos.

---

## 14. Licencia

**MIT.** Haz lo que quieras con esto: úsalo, modifícalo, redistribúyelo, quítale lo que no te sirva. Sin garantía de ningún tipo. El texto completo está en [`LICENSE`](LICENSE).

Si acabas montando el tuyo y alguna regla te sale mal o te sale mejor de otra forma, esa era exactamente la idea.
