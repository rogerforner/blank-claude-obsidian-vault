# Informe — El método de este vault, para llevárselo a otro

>
> **Nota para quien arranca un vault desde esta plantilla.** Este documento **no describe la plantilla**: describe el **método** que la plantilla trae, y lo hace contando **de dónde salió cada regla**. Las mediciones y los errores que cita ocurrieron de verdad, en el vault donde este método se fue puliendo — por eso hay cifras concretas en vez de recomendaciones genéricas. Léelo como el **porqué** del kit que acabas de copiar, y vuelve a él cuando una regla te parezca excesiva: casi todas lo parecen hasta que se lee el error que las originó.
>
> Si vas a llevarte el método a un entorno distinto —otra organización, otro proveedor de IA, otro plan—, **la sección 2 es la que decide**: cada regla lleva escrita la condición de la que cuelga.

Documento de **entrega**, escrito para que otro vault de uso parecido aproveche lo aprendido sin repetir el camino. Es **método, no contenido**: no lleva ni un dato del vault de origen — ni documentos, ni nombres, ni importes. Lo que viaja son las reglas, las mediciones que las justifican y **el error concreto que originó cada una**.

**Por qué importa el porqué:** una regla sin su historia se lee como una preferencia, y se abandona a la primera fricción. Todas las de aquí nacieron de algo que salió mal y costó tiempo.

---

## 0. La idea de fondo, que es lo único que no se negocia

Un agente muere cuando se agota su contexto. Si el estado del trabajo vive en la conversación, **el trabajo muere con ella**.

Todo lo demás es consecuencia de eso: **el estado vivo se escribe en ficheros** —qué está pendiente, qué se decidió y por qué, qué se aprendió—, de modo que una sesión nueva **retoma exactamente donde se quedó la anterior**. El agente no recuerda; el repositorio de trabajo sí.

Si un vault no necesita eso, no necesita casi nada de este informe.

---

## 1. Reglas que se sostienen solas (universales)

Estas no dependen de qué herramienta, qué proveedor ni qué plan se use.

### 1.1 Un fichero de reglas siempre activo, con techo escrito

El fichero de reglas que se auto-carga en cada sesión **se paga en todos los arranques, para siempre**. Aquí está por debajo de 200 líneas a propósito, y es un digest: el detalle vive en piezas aparte que se abren solo cuando hacen falta.

**El error que lo originó:** el fichero de reglas tenía límite escrito y **los ficheros de estado no**, siendo los tres lo que se lee en cada arranque. La asimetría estuvo a la vista meses.

### 1.2 Techo también para los ficheros de estado, medido en KB

La cola de pendientes de un proyecto: **40 KB**. La bitácora: **30 KB**. Al superarlos, lo cerrado baja a un histórico que **no se lee al arrancar**.

**Y va en KB, no en líneas.** La primera redacción de esta regla se escribió en líneas y **no habría marcado el fichero que la motivó**: 620 líneas de párrafo denso eran 197 KB. Se mide lo que se paga, y lo que se paga es el texto.

**La medición que lo justifica:** una cola de 197 KB costaba unos **54.800 tokens solo en leerla**, sobre un arranque total de ~60.400. Ese coordinador gastaba **el equivalente a una sesión entera antes de empezar a trabajar**. Otro proyecto del mismo vault arrancaba en ~17.900 y el coordinador general en ~20.400.

**Lección general:** ningún fichero avisa de que ha crecido. **El techo se comprueba, no se nota** — `wc -c` al cerrar cada tanda.

### 1.3 Coordinar no es ejecutar

Quien coordina **protege su contexto**: lee, decide, redacta encargos y verifica. El trabajo voluminoso va a **sesiones aparte con contrato escrito**, en procesos con contexto limpio.

Y el matiz que casi nadie tiene en cuenta: **lo que devuelve un subagente entra íntegro en el contexto de quien lo lanzó**. El aislamiento protege del ruido intermedio —sus lecturas, sus descartes—, **no de un informe verboso**. Un subagente que lee ochenta mil tokens y escribe tres mil te cuesta esos tres mil.

**Consecuencia práctica:** el ahorro no está en delegar, está en **acotar el entregable**. Todo encargo dice cuántas líneas y qué forma tiene lo que vuelve. Un subagente sin límite de salida no es un ahorro, es un rodeo.

### 1.4 Toda tanda no trivial va en dos fases

Primero una sesión de **análisis de solo lectura** cuyo único producto es un fichero de plan que enumera **las premisas falsas de la especificación**. Ese plan lo lee quien escribió la spec, y con él la corrige. Después se ejecuta contra la spec ya corregida.

**El dato que lo justifica:** en una tanda preparada con cuidado, con el inventario medido comando a comando, la fase de análisis encontró **ocho premisas falsas y nueve decisiones que la spec dejaba abiertas sin darse cuenta**. Las ocho eran de quien escribió la spec.

**Los cinco tipos que se repiten**, útiles para revisar cualquier encargo antes de lanzarlo:

1. **Premisas que envejecen mientras escribes** — la spec fijaba un estado en un número; al lanzarse, el estado había avanzado. Cita el estado, no lo claves.
2. **Premisas de simetría** — "copia X y su entrada de índice" solo funciona si la entrada existe. No existía.
3. **Datos que ya estaban mal antes** — una copia hereda los errores del origen si nadie los mira.
4. **Texto que habla de dónde vive** y se contradice al moverlo.
5. **El propio entregable como riesgo** — el verificador también escanea el informe que escribe la sesión hija.

### 1.5 Verificado, no asumido

Lo comprobable por comando **se ejecuta** y se reporta el **output literal**. Lo que no, se convierte en comprobación manual con los pasos exactos y el resultado esperado. **Nunca se ajusta el criterio para que pase.**

**Y una trampa de mecánica que casi cuesta un árbol roto:** encadenar el verificador con una tubería (`verificador | tail && commit`) **no protege nada**, porque el código de salida que ve la shell es el del último comando de la tubería. Cuando algo actúa como puerta, se ejecuta **solo**.

### 1.6 Una regla que solo vive en prosa es una intención

Esta es la más transferible de todas.

"Fija el modelo y el esfuerzo al arrancar" llevaba meses escrita **sin que ningún fichero la ejecutara**: dependía de que una persona eligiera bien en un desplegable. Se convirtió en regla el día que entró en los ficheros de configuración de cada perfil.

**Criterio general:** una regla se vuelve real cuando la ejecuta **un fichero de configuración, un hook o un verificador**. Lo demás es documentación de buenas intenciones.

### 1.7 Puertas automáticas que te paren a ti

Aquí hay un verificador con ocho reglas que se ejecuta tras cada cambio: frontmatter y pie de las piezas de método, índices que cuadren con sus ficheros en los dos sentidos, enlaces internos que resuelvan, ausencia de rutas de máquina, vocabulario prohibido, y **redacciones retiradas**.

**La prueba de que sirve:** al escribir una pieza nueva, su autor —que conocía la regla— usó cinco veces una palabra prohibida. El verificador la cazó con las cinco líneas. **Ninguna revisión por lectura lo habría pillado.**

**Y la octava regla merece explicación aparte, porque es la más barata de copiar y la que más deriva evita:** cuando una política cambia, **subir la versión de la pieza que la contiene no propaga nada**. Aquí una política cambió y su redacción vieja sobrevivió en dos ficheros de la plantilla porque **nadie los comprobaba**. Ahora la redacción retirada entra en una lista y pasa a ser **error duro**. Con dos excepciones obligatorias: los changelogs y las citas mencionan la frase vieja a propósito, así que se ignoran las líneas de cita y lo entrecomillado.

### 1.8 Verificar en la fuente primaria antes de propagar

El documento real es la única fuente de verdad. Un dato que contradice tus notas es **un conflicto a resolver contra el documento**, no licencia para corregir la nota desde un indicio.

**Aplicado a los informes de investigación, esto tiene tres corolarios muy concretos:**

- **Lo que escribes en el encargo te vuelve como hallazgo.** La recomendación estrella de un informe se apoyaba en una frase que había escrito quien redactó el encargo. Un informe **no puede corroborar una premisa que le regalaste**. Al leerlo, separa lo que trae de fuera de lo que le diste tú.
- **Una fecha futura que ya pasó es una fuente caducada.** Un informe recomendó como mecanismo principal una herramienta **retirada dos meses antes**; lo delató anunciar en futuro una fecha vencida.
- **Una medición en tu propia máquina gana a una cita.** Un informe afirmaba, con fuente, cuál de dos contadores de consumo era el escaso. Tres líneas de un panel de uso lo refutaron.

### 1.9 Higiene: lo efímero se borra, y se limpia al arrancar

Los insumos ya cumplidos —encargos ejecutados, briefs que ya tienen su informe— **se borran**: el histórico de control de versiones los conserva y el resultado perdura en otro sitio. Los relevos entre sesiones no se versionan siquiera.

**Y se limpia al arrancar, no solo al cerrar**, porque las sesiones a menudo mueren por contexto antes de cerrar. Aquí lo hace un hook de arranque.

**Dos trampas medidas:**

- Un criterio de borrado por "superado por otro de su serie" **deja fuera las series de un solo elemento**: sin caducidad por fecha, un fichero con nombre único no se borra nunca.
- **Proteger y ocultar son la misma operación vista desde dos lados.** Al añadir un patrón de exclusión al control de versiones, **todas las comprobaciones que se apoyaban en "lo que ve el control de versiones" dejan de valer dentro de lo excluido** — y nadie revisa las comprobaciones al añadir un patrón, porque no parecen relacionadas.

### 1.10 Fuente única, dentro y entre documentos

Dos copias del mismo dato **derivan en silencio**. Un dato vive en un sitio y lo demás lo referencia. Incluye el par índice ↔ ficha: si cambias una, la otra se actualiza **en el mismo commit**.

**El caso real:** el reparto de responsabilidades estaba escrito en cuatro sitios con matices distintos. Dos se quedaron en una versión anterior y **nadie lo notó durante dos semanas**, porque el único que se actualizaba era el que el verificador comprobaba.

### 1.11 El directorio de trabajo es la mitad del contrato

Con qué directorio se lanza una sesión **decide qué reglas y qué configuración se cargan, qué hooks corren y dónde busca por defecto**. Una frase en el encargo diciendo "trabaja en tal sitio" **no lo mueve**.

### 1.12 Lo irreversible y lo que sale fuera lo aprueba una persona

Entregar algo a un tercero, firmar, pagar, y cualquier trámite sin vuelta atrás. El agente **prepara, deja listo y para**. No se automatiza ni con hooks ni "porque estaba claro".

---

## 2. Reglas que cuelgan de una condición local — comprobar antes de heredarlas

**Esta sección es la que hace exportable el informe.** Cada regla lleva **la condición de la que depende**. Si en el destino esa condición no se cumple, la regla no aplica tal cual, y heredarla sin más la convierte en falsa.

| Regla aquí | Cuelga de | Si en el destino no se cumple |
|---|---|---|
| **Sin claves de API, de ningún proveedor** | Cuenta personal por suscripción, donde una clave **factura aparte en silencio** y no hay tope configurable | **Con cuenta de empresa esto puede no aplicar**: si hay presupuesto gestionado y tope real, una clave deja de ser un riesgo de facturación. **Reevaluar entero**, porque de esta condición cuelga qué mecanismos de integración son viables |
| **Control de versiones local, sin remoto** | Los documentos son personales y no hay equipo | Con equipo o con obligación de copia, hace falta remoto: cambia el modelo de turno de escritura y la política de secretos |
| **Los secretos no salen; el material de trabajo sí puede ir a un servicio que no entrene con él** | Decisión explícita del responsable, tomada tras ver qué política de datos tiene cada servicio | En un entorno con obligaciones de cumplimiento, **la frontera la fija la organización, no el usuario** |
| **Modelo y esfuerzo concretos por rol** | Un catálogo de modelos y un plan de suscripción determinados | Caduca con cada generación. **Lo que se hereda es el método** —fijarlo en configuración, no cambiarlo a media sesión, medir antes de bajar—, no la tabla |
| **Vetar el modo rápido** | Que en ese producto se facture fuera de la suscripción | Comprobar si sigue siendo cierto allí |
| **Un solo escritor del vault** | Que haya más de un agente capaz de escribir | Si solo hay uno, la regla es vacía; en cuanto entra un segundo, vuelve a ser crítica |
| **Sesiones separadas por proyecto, aisladas por permisos** | Que los proyectos sean independientes entre sí | Con proyectos muy acoplados, el aislamiento estorba más de lo que protege |

**Regla de oro al heredar:** si no sabes de qué condición cuelga una regla, **no la copies todavía**. Búscala primero.

---

## 3. Lo que se probó y se descartó, con su umbral escrito

Descartar bien vale tanto como adoptar bien, y **ahorra la tentación de reintentarlo cada seis meses**.

- **Enjambres de agentes en paralelo.** Cada agente es un contexto completo: multiplica el consumo. Para una persona, el óptimo es **baja concurrencia** — quien coordina, más una o dos sesiones de trabajo.
- **Aislar cada tanda en una copia separada del árbol.** Descartado **mientras no haya dos o más sesiones concurrentes de verdad**. El umbral está escrito para poder revisarlo.
- **Registros telegráficos para ahorrar tokens.** No superan a pedir brevedad, y degradan la prosa. Inaceptable cuando el producto es un escrito que leerá un tercero.
- **Partir el fichero de reglas en importaciones.** No aligera: los importados se cargan enteros. Lo que sí aligera son las reglas por ruta — con el caveat de que **una regla que debe cumplirse siempre no puede vivir ahí**.
- **Automatizar el acceso a un servicio controlando un navegador con la sesión iniciada.** Existen herramientas maduras que lo hacen y funcionan. **Chocan con las condiciones de uso** y el riesgo que declaran sus propios autores es la suspensión de la cuenta. De aquí sale un criterio general: **un mecanismo de integración se evalúa por tres cosas, y la tercera se olvida siempre — que funcione, que no exija credenciales de programador, y que esté permitido.**

---

## 4. Qué llevarse primero

Por relación entre esfuerzo y beneficio, si el vault de destino ya está en marcha:

1. **Los techos de los ficheros de estado, medidos en KB.** Es lo que más contexto recupera y se aplica en una tarde.
2. **El entregable acotado en cada encargo a una sesión hija.** Una línea por encargo.
3. **Un verificador con las reglas que ya tenga sentido allí**, aunque empiece con tres. Su valor no es encontrar cosas raras: es **parar a quien escribió la regla**.
4. **Los techos y el digest del fichero de reglas.**
5. **Las dos fases en las tandas no triviales.** Cuesta una sesión extra y paga sola.
6. **La higiene con limpieza al arrancar.**

**Y lo último, no lo primero:** las tablas de modelos, las integraciones y cualquier cosa que dependa de un producto concreto. Caducan, y adoptarlas antes que lo estructural es optimizar el sitio equivocado.

---

## 5. Lo que NO conviene copiar

- **Las tablas de modelos y versiones.** Caducan en semanas. Cópialas como plantilla vacía y rellénalas midiendo.
- **Los recuentos escritos en prosa** — "27 doctrinas", "catorce sitios". Aquí hubo cuatro y **los cuatro estaban mal**. Se retiraron en vez de corregirse: un número en prosa que nadie comprueba miente antes o después.
- **La estructura de carpetas por adelantado.** Cada pieza entra con un caso de uso concreto delante. Un contenedor vacío "por si acaso" es deuda, no previsión.
- **Las decisiones tomadas con las condiciones de otro entorno**, sin releer la sección 2.

---

## 6. Resumen en seis líneas

1. El estado vivo va en ficheros: el agente no recuerda, el vault sí.
2. Todo lo que se lee en cada arranque tiene techo, y se mide en KB.
3. Quien coordina no ejecuta, y acota lo que le devuelven.
4. Una regla que solo vive en prosa es una intención: hazla ejecutar por algo.
5. Verifica en la fuente primaria, y desconfía de lo que un informe te devuelve porque tú se lo diste.
6. Descartar con el umbral escrito vale tanto como adoptar.
