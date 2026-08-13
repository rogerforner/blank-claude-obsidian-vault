---
name: Reparto de trabajo entre proveedores de IA
description: El segundo proveedor se ACTIVA con un interruptor de dos caras (valor declarado + deny del CLI en todos los perfiles) y nace APAGADO; sin interruptor el vault no esta protegido, esta sin decidir. Cuando entra un segundo proveedor de IA junto al que coordina, el reparto tiene TRES ejes — lo que el primero no hace (imagen, audio, vídeo), lo que el otro hace mejor (consultar un corpus con cita) y, el que más rinde, REPARTIR CARGA ENTRE DOS CUOTAS INDEPENDIENTES: lo que se manda al segundo no consume la ventana del primero. Un SOLO ESCRITOR del vault, y lo que vuelve se revisa antes de entrar. Lo que no sale nunca son SECRETOS (contraseñas, claves, tokens), no los datos personales. Automatizar la sesión de navegador de un servicio VIOLA sus condiciones de uso y arriesga la cuenta: no se hace aunque funcione.
type: doctrine
version: 1.2
---

Antes o después aparece un segundo proveedor de IA que hace algo que el que coordina no hace. La pregunta que importa **no es "integrar sí o no"**, sino **qué trabajo se le da y con qué barrera** — porque las dos formas de equivocarse aquí son caras: no aprovecharlo, y dejarle tocar lo que no debe.

## La regla que sostiene todo lo demás: UN SOLO ESCRITOR

**El vault lo escribe un único agente, el que coordina.** Ningún agente de otro proveedor recibe permiso de escritura, ni siquiera acotado, ni siquiera "solo para esta carpeta".

No es desconfianza hacia el otro modelo: es que **dos escritores sin árbitro de turno rompen lo que el vault garantiza**. Cada proveedor trae su propio fichero de reglas, su propia forma de compactar el contexto y su propio criterio de formato; el resultado documentado son cabeceras de metadatos rotas, enlaces internos que dejan de resolver y reescrituras masivas que nadie pidió. El árbitro natural del turno es **git**, y funciona precisamente porque solo uno escribe.

**Corolario:** si el segundo proveedor propone un cambio, **lo propone**; lo aplica el coordinador. Un cambio copiado a mano cuesta segundos; un árbol corrompido cuesta una tarde.

## El reparto funcional: TRES ejes, y el tercero es el que más rinde

**Eje 1 — Lo que el coordinador no hace.** Generación multimodal: imagen, audio, vídeo. No hay solapamiento posible, es capacidad nueva.

**Eje 2 — Lo que el otro hace mejor.** Consulta a un corpus depurado **con cita a la fuente**: un cuaderno cerrado, que solo responde con lo que se le subió y señala el pasaje, gana en fidelidad a un modelo que carga ficheros en contexto y desborda a recuperación cuando se llena. Aquí entra un caso de uso grande: **la documentación que hay que releer una y otra vez —manuales, fichas técnicas, normativa— deja de leerse entera en cada sesión y pasa a consultarse**.

**Eje 3 — Repartir carga entre dos cuotas independientes.** Este es el que se olvida al pensar en "capacidades", y es el que más rinde. **Cada proveedor tiene su propia ventana de uso.** El trabajo que se manda al segundo **no consume la del coordinador**: no es solo que salga más barato, es que **estira los límites de cinco horas y semanales del primero**, que son el cuello de botella real.

De ahí se sigue algo que conviene decir explícitamente para no minusvalorar al otro proveedor: **su modelo económico puede ser mejor que el económico propio en tareas concretas**, y su ventana de contexto puede ser mayor. **La regla de "el modelo apropiado a la tarea" no se detiene en la frontera del proveedor** → [[modelo_por_tarea]]. Un barrido de volumen, una extracción de tablas o un resumen largo son exactamente el trabajo que conviene mover.

> **Y esto obliga a medir, no a suponer en ninguna de las dos direcciones.** Ni "el otro no sirve" ni "el otro es mejor" son afirmaciones que se puedan sostener por marca: se sostienen por tarea, con una prueba propia sobre trabajo real. Los rankings públicos sirven para elegir a quién probar, no para decidir.

**Y esto NUNCA se le da:**

- **Coordinar y decidir.** Es del que tiene el contexto del trabajo y responde de él. *(Ejecutar, leer, resumir y extraer sí se le dan: eso es el eje 3.)*
- **Verificar su propio trabajo como si fuera prueba.** Lo que vuelve se comprueba igual que se comprueba lo de una ejecutora propia.
- **Escribir en el vault.** Ver arriba.
- **Secretos: contraseñas, claves de API, tokens, certificados.** Esto no es privacidad, es **seguridad de los sistemas**, y no depende de qué servicio sea ni de qué política de datos tenga → [[sensitive_file_guard]].
- **La memoria persistente del sistema.** Vive en ficheros versionados, no en la memoria propietaria de un tercero. Ese es el punto entero del método.

## Qué material puede salir, y qué no sale nunca

**La frontera NO es "datos personales sí o no". Es esta, y la fijó el director el 2026-08-14:**

- **Nunca sale, a ningún servicio, por muy buena que sea su política de datos: contraseñas, claves de API, tokens, certificados, semillas de recuperación.** Un secreto filtrado **compromete un sistema**; un dato personal filtrado es un problema distinto y de otra magnitud. Confundirlos lleva a proteger mal las dos cosas.
- **A un cuaderno cerrado —el que no entrena con lo que se le sube y solo responde de sus fuentes— sí puede ir el material de trabajo**, incluida documentación con datos del hogar. Ese es el punto: convertirlo en **el sitio donde vive la documentación técnica que hay que consultar**, en vez de leerla entera cada vez.
- **El chat web abierto es otra cosa y conserva su cautela:** entrena por defecto salvo que se desactive el historial, y admite revisión humana. Lo que va allí sigue siendo material no sensible.

> **Una cautela que conviene tener escrita, no como bloqueo sino para decidir con los ojos abiertos:** en un expediente doméstico hay **datos de terceros** —nombres de instaladores, contactos de proveedores, importes de presupuestos ajenos— que no son del director aunque estén en su vault. Sobre los propios decide él sin más; sobre los de terceros conviene al menos saber que se están subiendo. **Quitar cuatro nombres antes de subir un presupuesto cuesta un minuto** y deja el resto del material igual de útil.

## El flujo, y por qué el paso humano sigue estando

**Generar o consultar fuera → la persona revisa → el coordinador escribe y commitea.**

Lo que se automatiza y lo que no tiene un criterio simple: **entra automatizable, sale con revisión**. Consultar un cuaderno, resumir un corpus o pedir una extracción puede lanzarlo el coordinador en una sesión aparte, igual que lanza una ejecutora. Pero **lo que vuelve no entra en el vault sin pasar por una persona**, por la misma razón por la que no entra sin verificar lo que devuelve una ejecutora propia: es material que hay que comprobar, no un hecho.

## La bandera roja que hay que conocer antes de buscar atajos

**Existen herramientas que exponen un servicio de consumidor a un agente externo automatizando un navegador con la sesión iniciada** — cookies extraídas del navegador, control remoto del navegador, a veces con funciones explícitas de evasión de detección. Funcionan. Algunas están muy pulidas.

**No se usan.** Automatizar el acceso a un servicio de ese modo **choca con sus condiciones de uso** —que suelen prohibir literalmente el acceso por medios automatizados— y el riesgo que asumen sus propios autores es la **suspensión de la cuenta**. Cambiar la cuenta que sostiene todo el trabajo por ahorrarse una descarga manual es un intercambio malo.

**Regla operativa:** un mecanismo de integración se evalúa por **tres** cosas, y la tercera se olvida siempre — que funcione, que no exija credenciales de programador, **y que esté permitido**. Si la herramienta necesita disfrazarse de humano para operar, la respuesta ya está dada.

## El segundo proveedor se ACTIVA, no se supone: el interruptor

Todo lo anterior describe **qué trabajo se le da si lo hay**. Falta lo primero: **si lo hay o no, en este vault y hoy**. Sin esa pieza, cada sesión lo deduce del contexto que le toque, y deducirlo mal cuesta en las dos direcciones — o no se aprovecha una cuota que está pagada, o se improvisa una integración que nadie autorizó.

**El estado del vault se declara en un fichero que alcanza cualquier agente**, con un valor que se lee de un vistazo:

```
PROVEEDOR_SECUNDARIO_IA = false   →  ninguna sesión lanza su CLI, ni le manda nada,
                                     ni cuenta con él para planificar una tanda
PROVEEDOR_SECUNDARIO_IA = true    →  canal abierto, con los límites de esta doctrina
```

**Y el interruptor tiene DOS caras, porque una sola no funciona:**

| Cara | Qué es | Qué hace |
|---|---|---|
| **Declarativa** | el valor escrito donde lo lee cualquier coordinador | que un agente **sepa** en qué estado está sin auditar cinco ficheros de configuración |
| **Técnica** | el `deny` del CLI en **todos** los perfiles de `settings.json` | que un agente **no pueda** lanzarlo aunque no haya leído nada |

**La declarativa sola es una nota, no una barrera** — es la misma regla que el kit repite en todas partes: *lo que quieras impedir, exprésalo como prohibición explícita, nunca como ausencia del permiso*. Las dos se cambian **en el mismo commit**; si algún día se contradicen, **gana el `deny`** y lo que hay que corregir es la ficha.

**Lo que el interruptor NO decide** — y conviene tenerlo claro para no darle más poder del que tiene: no toca el **escritor único**, ni la lista de lo que nunca se delega (coordinar, decidir, verificarse a sí mismo, escribir), ni la frontera de datos. Eso es igual con la llave puesta o quitada. **El interruptor decide si existe el canal, no qué se le confía.**

**Nace en `false`, y ahí está su valor.** Un vault sin interruptor no está protegido: está **sin decidir**. La posición apagada es la que impide que una sesión futura, con una tanda pesada delante, se invente la vía y crea que hace lo correcto.

**El procedimiento concreto se deja EN BLANCO hasta que haya un piloto medido en la propia máquina.** Escribir los pasos a partir de un informe es exactamente el error que esta doctrina ya documenta más abajo: un informe llegó a recomendar como mecanismo principal una herramienta retirada dos meses antes. **Un interruptor sin procedimiento es honesto; un procedimiento inventado es una trampa para el que venga.**

## Cómo se evalúa un mecanismo, en cuatro columnas

Cualquier candidato se anota así antes de decidir, y **los descartados se conservan en la tabla con su motivo** — para no volver a investigarlos dentro de seis meses:

| Mecanismo | Autenticación | Vigencia | Veredicto |
|---|---|---|---|
| *nombre* | login de cuenta · **requiere clave** · **requiere proyecto facturable** · DESCONOCIDO | última versión, **y fecha de retirada si la hay** | adelante · piloto · **NO**, con motivo |

**La columna de vigencia no es adorno.** Un informe llegó a recomendar como mecanismo principal una herramienta **retirada dos meses antes**, y lo delató una incoherencia de fechas: anunciaba en futuro una fecha ya pasada. **Una fuente que habla en futuro de una fecha vencida es una fuente caducada** → [[verificacion_fuente_primaria]].

## Estado verificado (12-ago-2026) — esta sección CADUCA

Lo de arriba es método y aguanta. Esto son hechos de plataforma, y son lo más volátil que hay:

- **La terminal del segundo proveedor evaluado se autentica por cuenta**, sin clave ni proyecto facturable, y admite servidores locales; su motor de permisos permite dejarla en **solo lectura efectiva con reglas de denegación reales**, no por ausencia de permiso. **Es lanzable en proceso aparte, igual que una ejecutora**, y ese es su uso natural: consultar sin gastar el contexto del coordinador.
  - *Los reparos que se le pusieron —consumo desproporcionado de cuota y compactación agresiva— vienen de **reportes de comunidad marcados NO VERIFICADOS**, no de documentación del fabricante. **No bastan para descartarla**: bastan para pilotarla midiendo. Si consume tanto como se dice, se verá en su propio contador, que es independiente del nuestro.*
- **No existe interfaz pública de consumidor** para el cuaderno de fuentes: la que hay exige proyecto facturable y es producto de empresa. Lo que circula son herramientas que automatizan la sesión — descartadas por lo dicho arriba.
- **Tampoco hay sincronización desde una carpeta del disco**: las fuentes se suben a mano, y son instantáneas estáticas sin conexión viva con el original.
- **Las imágenes generadas llevan marca de agua invisible siempre**, y en los planes intermedios **también visible**.
- **Desactivar el historial de actividad** deja de alimentar el entrenamiento y la revisión humana, pero **el servicio retiene igualmente hasta 72 horas**.
- **El servicio doméstico del mismo proveedor no compensa** cuando ya hay domótica local: sus funciones útiles procesan en la nube, y las de vídeo requieren un plan superior.

Relacionada: [[soberania_datos_local]], [[sensitive_file_guard]], [[adopcion_tooling_externo_caso_uso_concreto]], [[verificacion_fuente_primaria]], [[orquestacion_sesiones_por_herramienta]], [[modelo_por_tarea]].

> Pieza de catálogo `general/comun/doctrinas/`. **v1.2 (2026-08-14): el segundo proveedor pasa a ACTIVARSE con un interruptor, en vez de deducirse del contexto.** Encargo del director al plantear que un vault nuevo debería preguntar si hay cuenta y guardar la respuesta como un valor que el agente entienda. Se añade el interruptor de **dos caras** —el valor declarado donde lo lee cualquier coordinador, y el `deny` del CLI en **todos** los perfiles— porque la cara declarativa sola es una nota y no una barrera. **Nace en `false`, y esa es su función**: apagado es cuando sirve, porque impide que una sesión futura improvise la integración creyendo que hace lo correcto. Y **el procedimiento se deja en blanco** hasta que haya piloto medido en la propia máquina: escribirlo desde un informe es el error que esta misma doctrina documenta. **v1.1 (2026-08-14): corrección del director, y corrige un sesgo mío de la v1.0.** La v1.0 planteaba el reparto como "el segundo hace lo que el primero no hace", y eso deja fuera el argumento más fuerte: **las cuotas son independientes**, así que mover volumen al segundo **estira los límites del primero**, que son el cuello de botella real. Añadido ese tercer eje, y con él que **la regla del modelo apropiado no se detiene en la frontera del proveedor** — el modelo económico del otro puede ganar al propio en tareas concretas, y su ventana puede ser mayor. Se separa además **ejecutar/leer/resumir** (sí se delega) de **coordinar/decidir** (no). **Frontera de datos redefinida por el director:** lo que no sale nunca son **secretos** —contraseñas, claves, tokens—, que es seguridad de sistemas; los **datos personales sí pueden ir a un cuaderno cerrado** que no entrene con ellos, con la cautela escrita sobre datos de terceros. Y los reparos a la terminal del otro proveedor quedan marcados como lo que son: **reportes de comunidad no verificados**, que justifican pilotar midiendo, no descartar. **v1.0 (2026-08-13):** nace de dos investigaciones sobre sumar un segundo proveedor de IA al sistema. Lo estructural —un solo escritor, el reparto funcional, el flujo con puerta humana, la evaluación en cuatro columnas y la prohibición de automatizar sesiones— **no depende del proveedor** y se mantiene. La sección de estado sí caduca: refréscala con [[vigilancia_tecnologica_bajo_demanda]]. **Nada de esto está adoptado todavía**: describe el marco con el que se decidirá cuando exista la cuenta, no una integración en marcha. Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado y **no se hereda** automáticamente.
