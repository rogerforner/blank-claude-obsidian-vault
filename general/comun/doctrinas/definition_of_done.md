---
name: Definition of Done — nadie cierra sin cruzar la puerta
description: Terminar no es dejar de trabajar. Toda tanda y toda sesión cierran cruzando un DoD ejecutable con dos capas: el DoD del vault (`_meta/dod.mjs`), que es el suelo común e igual para todos los asuntos —kit en verde, árbol limpio, efímeros retirados, techos, documentación al día y artefactos que existen—, y el DoD de la tanda, que comprueba el PRODUCTO de ese trabajo concreto. El del vault sella una huella del CONTENIDO del árbol; si se toca algo después de sellar, el sello caduca solo y el hook de arranque se lo dice a la sesión siguiente. Una puerta que no se ha visto fallar no prueba nada.
type: doctrine
version: 1.4
index_summary: >-
  **Terminar no es dejar de trabajar.** Se cierra cruzando un DoD **ejecutable**, en dos capas: el **DoD del vault** (`node _meta/dod.mjs`), suelo común e idéntico para asuntos de software y de los otros —verificador en verde, **árbol limpio**, **efímeros cumplidos retirados**, **techos de cola y bitácora**, **documentación al día** (toda doctrina cambiada sube su `version` en el mismo commit; el catálogo sincronizado con la plantilla si se tocó) y **artefactos declarados que existen**—, y el **DoD de la tanda**, que comprueba el **producto** de ese trabajo. **El del vault SELLA una huella del CONTENIDO del árbol**, no del commit: si se toca algo después de sellar, **el sello caduca solo** y el **hook de arranque avisa a la sesión siguiente** de que la anterior cerró sin cruzar la puerta — el aviso va al arranque porque un hook de cierre no lo lee nadie. **Una puerta que no se ha visto fallar no prueba nada:** cada una se demuestra en rojo, metiendo el defecto a mano, antes de darla por buena. Y **no se ajusta una puerta para que pase**.
---

**Terminar no es dejar de trabajar.** Una tanda o una sesión están terminadas cuando alguien puede **comprobar** que lo están, y no cuando quien las hizo cree que sí. Este es el mecanismo que convierte *"creo que está cerrado"* en *"está medido sobre este árbol exacto"*.

## Dos capas, y no se sustituyen

| | **DoD del vault** | **DoD de la tanda** |
|---|---|---|
| Qué mira | el **método**: que el estado quede consistente para quien venga después | el **producto**: que lo que se hizo esté bien hecho |
| Quién lo escribe | nadie, **ya está escrito** — es el mismo para todos | el coordinador, **en el contrato de la tanda** |
| Cómo se corre | `node _meta/dod.mjs` | los comandos exactos que fije el contrato |
| Cuándo | al cerrar la sesión, y antes de dar por buena una tanda | al cerrar la tanda, por la ejecutora |

**El del vault es el suelo: nadie cierra por debajo de él.** El de la tanda se le suma encima y cambia con cada trabajo.

## Aplica a los asuntos de software y a los que no

Las puertas del DoD del vault son **del método** —higiene, documentación al día, estado consistente—, así que valen igual para un expediente de trámites que para un asunto con software propio. **Lo que cambia es lo que se le suma encima**:

- **Asunto con software:** las puertas del producto son las del pack `codigo/` y **corren donde vive el código, no en el vault** — pruebas, comprobación estática, reglas de capa, dependencias circulares. → [[gates_de_calidad_locales]]
- **Cualquier otro asunto:** las puertas del producto son las del contrato de su tanda — que la suma de la columna cuadre con el escrito, que el documento generado abra y tenga las páginas esperadas, que ningún anexo citado falte. → [[verificacion_e2e_por_agente]]

**Lo que no se puede comprobar por comando no desaparece del cierre:** pasa a **comprobación en campo** con procedimiento escrito y qué resultado esperar.

## Qué comprueba el DoD del vault

1. **El kit en verde** — el verificador entero, que es lo que dice si el kit está bien *escrito*.
2. **El árbol limpio** — sin cambios sin commitear. Cerrar con trabajo a medias es la forma más común de perderlo: la sesión siguiente lo encuentra sin saber de quién es ni si estaba terminado.
3. **Higiene** — ningún efímero ya cumplido sigue vivo (el prompt ejecutado, el brief que ya tiene informe). La regla vive **en el hook**, y el DoD la consulta ahí en vez de reimplementarla, para que no puedan derivar.
4. **Techos** — ninguna cola ni bitácora por encima de su límite de bytes. No es estética: esos ficheros entran **enteros** en cada arranque, así que pasarse lo cobran todas las sesiones siguientes.
5. **Documentación al día** — la puerta que ningún verificador de estructura puede dar: que lo escrito siga describiendo lo que hay.
   - Toda doctrina cuyo **cuerpo** cambió sube su `version` antes de cerrar. Sin esto, la ficha y su changelog cuentan historias distintas y **releyendo no se nota**, porque las dos son plausibles por separado. **Una errata también es un cambio.**
   - **Se juzga la ventana entera, no commit a commit**, y la diferencia no es un tecnicismo: si cambias una doctrina y subes su versión tres commits después, **la deuda está saldada** y no hay nada que denunciar. Una puerta que se queja de algo ya arreglado enseña a ignorarla, que es como se pierde una puerta. Lo que sigue cazando es el caso real: **cerrar con una doctrina cambiada y su versión intacta.**
   - Si la sesión tocó el catálogo o el inicializador, **la plantilla queda sincronizada**. Y al propagar una pieza con divergencia declarada se copia **el cambio, no el fichero**.
6. **Los artefactos declarados existen** — una línea de trabajo en curso que apunta a un fichero que ya no está manda a la sesión siguiente a buscar humo.
   - **La ruta va desde la RAÍZ DEL VAULT, no desde el contenedor donde se escribe**, y esto se declara aquí porque **dos sesiones han tropezado con lo mismo al estrenar su fichero**: como vive en la carpeta del asunto, la ruta *parece* relativa a ella. Quien la lee —el hook y esta puerta— trabaja sobre el vault entero. **Que el mismo tropiezo se repita no es descuido de quien lo comete: es que la pieza estaba mal escrita**, y por eso la corrección va a la plantilla y no a un aviso.

## Con varias sesiones vivas: qué bloquea a quién

**Con dos coordinadores trabajando —que es lo normal, no lo raro— el DoD tropieza con un problema que no tiene cuando hay uno solo:** mira el árbol entero, así que el trabajo a medias de cualquiera bloqueaba el cierre de todos. Un coordinador con su contenedor impecable y sus siete puertas en verde no podía sellar **por ficheros que no puede tocar ni commitear**.

**La corrección NO es acotar la puerta a tu contenedor y ya está** —eso perdería lo único que mira el conjunto—. Es distinguir **dos clases de rojo ajeno**, y el criterio no es de quién es el fichero:

> **Lo que distingue un rojo ajeno de otro es si hay alguien a quien ese rojo pueda mover.**

| Rojo ajeno | ¿A quién mueve? | Qué hace la puerta |
|---|---|---|
| **Árbol sucio de otro** | A nadie más que a su dueño. Tú no puedes commitearlo ni arreglarlo: esperar es lo único que te queda | **No bloquea.** Baja a constancia, con el nombre del dueño, y queda anotado en el sello |
| **Hallazgo del verificador en otro contenedor** | **Al dueño, y llega por ti.** El kit está de verdad incumplido | **Sigue bloqueando**, y el mensaje te dice de quién es y que **tu trabajo es avisarle**, no arreglarlo |

**El segundo caso no es ruido aunque no puedas tocarlo, y hay un caso real que lo demuestra:** un coordinador vio en rojo el charter de **otro** asunto, avisó a quien podía arreglarlo, y se arregló ese mismo día. **Si eso hubiera bajado a nota, se habría quedado invisible** — una nota que no bloquea a nadie, en la sesión de quien no puede actuar, es una nota que no lee nadie.

**Tu ámbito lo fija el directorio desde el que corres el DoD**, igual que el `cwd` fija el rol de una sesión: desde un contenedor respondes de ese contenedor; desde la raíz, de todo lo que no es un asunto ajeno.

## El sello, y por qué es por contenido

Si todas las puertas pasan, el DoD escribe un **sello** con una **huella del contenido** de lo versionado —leyendo los ficheros del disco, **no** el árbol de un commit—, la fecha y qué puertas corrieron. La razón de que sea por contenido es exactamente el caso que más duele: **un sello que colgara del commit diría "todo bien" con cambios sin guardar encima**.

**Consecuencia, y es la que hace que esto funcione sin disciplina: si se toca algo después de sellar, el sello caduca solo.** No hay forma de sellar y seguir editando sin que se note.

**El aviso va al ARRANQUE de la sesión siguiente, no al cierre de la propia.** Un hook de cierre no lo lee nadie —la sesión ya se está yendo—, y bloquear el cierre castiga a quien sí está delante. Al arrancar, en cambio, hay alguien mirando y todavía no se ha tocado nada: es el único momento en que el aviso cambia lo que va a pasar.

## Las reglas que lo sostienen

- **Una puerta que no se ha visto fallar no prueba nada.** Toda puerta nueva se demuestra **en rojo** —metiendo el defecto a mano— antes de darla por buena, y con un caso legítimo que **no** salte. Si no se ha visto fallar, no es una puerta: es una intención.
- **No se ajusta una puerta para que pase.** Si sale en rojo, se arregla lo que denuncia. Cambiar el criterio para que cuadre es el fallo que este kit persigue desde el primer día.
- **Una puerta saltada se DECLARA, nunca se da por buena en silencio.** Cuando algo no se puede comprobar —falta la configuración local, no está el árbol de comparación—, el DoD lo dice y **cuenta como rojo si el trabajo lo necesitaba**. Un salto silencioso es una puerta que miente.
- **El veredicto está en el bloque de resumen.** Se corre solo y sin tubería, igual que el verificador: encadenarlo enmascara su código de salida.

## Nada OBLIGA a correr el DoD, y es una decisión, no un descuido

**Se puede cerrar una sesión sin cruzarlo.** No hay hook que lo impida ni comando que lo exija, y conviene decirlo en vez de dejar creer lo contrario. **Se estudió obligarlo y se descartó con motivo:** el único punto donde se podría bloquear es el cierre de la propia sesión, y ahí el aviso **no lo lee nadie** —la sesión ya se está yendo— mientras que el bloqueo **castiga a quien sí está delante**, que suele ser el único que iba a hacerlo bien.

**Lo que se hace en su lugar es más barato y llega a quien puede actuar: el incumplimiento se vuelve VISIBLE en el arranque siguiente.** Si la sesión anterior no selló, o selló y siguió tocando, el hook lo dice antes de que nadie toque nada. **No impide saltárselo; impide saltárselo en silencio**, que es lo que de verdad hace daño: lo que nadie ve, nadie arregla.

**Y hay una asimetría que lo sostiene:** saltárselo no da ninguna ventaja —no ahorra trabajo, solo lo aplaza— mientras que la sesión siguiente **empieza sabiendo** que hay algo sin revisar. El coste recae sobre quien lo omitió, no sobre quien viene detrás.

## Quién la aplica

**Todo coordinador** — el general del vault y el de cada asunto — al cerrar sesión, y antes de dar por buena una tanda. **La ejecutora corre el DoD de su tanda**; el del vault lo corre el coordinador, que es quien ve el árbol entero.

Relacionada: [[verificacion_e2e_por_agente]] (lo comprobable se ejecuta y se reporta literal; lo demás, comprobación en campo), y del pack `codigo/`, solo si el asunto lo instala: [[gates_de_calidad_locales]] (las puertas del producto en un asunto con software). También: [[verificacion_fuente_primaria]] (ningún dato derivable se escribe a mano), [[convencion_organizacion_carpeta_trabajo]] (qué es efímero y qué no, y los techos), [[mejora_continua_del_kit]].

> Pieza de catálogo `general/comun/doctrinas/`. **v1.4 (2026-08-28): qué bloquea a quién cuando hay varias sesiones vivas.** Lo destaparon **los dos coordinadores el mismo día, por separado y sin poder sellar**: el DoD miraba el árbol entero, así que el trabajo a medias de uno bloqueaba el cierre del otro por ficheros que no puede tocar. **La corrección no es acotar la puerta al contenedor** —eso perdería lo único que mira el conjunto— sino distinguir dos clases de rojo ajeno con un criterio que aportó uno de ellos y es mejor que el que yo tenía: **lo que las distingue no es de quién es el fichero, sino si hay alguien a quien ese rojo pueda mover**. El **árbol sucio ajeno** no mueve a nadie más que a su dueño → baja a constancia con su nombre y queda en el sello. El **hallazgo del verificador en otro contenedor** sí mueve a su dueño y **llega por ti** → sigue bloqueando, y el mensaje te dice de quién es y que tu trabajo es **avisarle**. Con el caso real que lo sostiene: un coordinador vio en rojo el charter de otro asunto, avisó, y se arregló ese día. El ámbito lo fija **el directorio desde el que se corre el DoD**. **v1.3 (2026-08-27): se declara que NADA obliga a correr el DoD, y por qué no se obliga.** Una auditoría del método lo listó como hueco —*"ningún mecanismo obliga a correr el DoD"*— y es cierto como hecho, pero **no es un olvido: es una decisión con motivo**, y no estaba escrita. Obligarlo solo sería posible bloqueando el cierre de la propia sesión, donde el aviso no lo lee nadie y el bloqueo castiga a quien sí está delante. Lo que se hace en su lugar es que **el incumplimiento sea visible en el arranque siguiente**: no impide saltárselo, impide saltárselo **en silencio**. **Un hueco que en realidad es una decisión sin declarar se sigue leyendo como descuido cada vez que alguien audita el método** — por eso se escribe. **v1.2 (2026-08-24): la ruta del artefacto va desde la raíz del vault, y se dice.** Lo destapó la puerta a la primera en dos contenedores distintos —incluido el del propio coordinador general— porque la plantilla ponía `<ruta>` sin decir desde dónde y el fichero vive en la carpeta del asunto. **La corrección va a la plantilla, al mensaje de error del verificador y al de la propia puerta, no a un aviso suelto:** un tropiezo que se repite no es descuido de quien lo comete, es una pieza mal escrita. *(Y la puerta hizo justo lo que se le pide: cazarlo el primer día, en vez de dejar cuatro rutas muertas apuntando a ninguna parte.)* **v1.1 (2026-08-24), y la corrección la provocó la propia puerta el mismo día que nació:** la de documentación juzgaba **commit a commit**, así que una deuda **ya saldada** —cinco doctrinas cambiadas y versionadas tres commits después, en la misma jornada— la seguía denunciando y **habría bloqueado el cierre para siempre**. Pasa a evaluar **la ventana como conjunto**. No es relajar el criterio, es **arreglar la pregunta**: lo que importa no es *"¿ese commit subió la versión?"* sino *"¿queda alguna doctrina cambiada con su versión intacta al cerrar?"*. Comprobado que sigue cazando el caso real con un commit de ensayo —cambio en el cuerpo y `version` sin tocar—, que salta, y retirado después. **La tentación era ajustar la puerta para que pasara; lo correcto era mirar por qué preguntaba mal.** **v1.0 (2026-08-24):** nace de un encargo del director, que traía el DoD que ya usa en un vault de software derivado de este kit y pidió lo mismo para todo lo demás — *"un DoD nos dará garantía de que las tareas en cola no dejen archivos residuales tras su finalización, que para las nuevas sesiones todo esté según lo esperado, que la documentación no quede desfasada"*. Lo que se adapta de aquel es **la mecánica** —huella por contenido, sello que caduca solo, puertas que se demuestran en rojo— y lo que cambia es **la sustancia de las puertas**, porque aquí no hay pruebas ni lint que correr: hay estado vivo, higiene y documentación. **La primera ejecución encontró deuda real** —cinco doctrinas cambiadas sin subir `version`, una de ellas veinte minutos antes por el propio coordinador— que ninguna relectura había detectado. Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado y **no se hereda** automáticamente.
