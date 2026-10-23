---
name: Definition of Done — nadie cierra sin cruzar la puerta
description: Terminar no es dejar de trabajar. Toda tanda y toda sesión cierran cruzando un DoD ejecutable con dos capas: el DoD del vault (`_meta/dod.mjs`), que es el suelo común e igual para todos los asuntos —kit en verde, árbol limpio, efímeros retirados, techos, documentación al día y artefactos que existen—, y el DoD de la tanda, que comprueba el PRODUCTO de ese trabajo concreto. El del vault sella, por ámbito, una huella del CONTENIDO de los ficheros del ámbito; si se toca algo suyo después de sellar, el sello caduca solo y el hook de arranque se lo dice a la sesión siguiente. Una puerta que no se ha visto fallar no prueba nada.
type: doctrine
version: 1.10
index_summary: >-
  **Terminar no es dejar de trabajar.** Se cierra cruzando un DoD **ejecutable**, en dos capas: el **DoD del vault** (`node _meta/dod.mjs`), suelo común e idéntico para asuntos de software y de los otros —verificador en verde, **árbol limpio**, **efímeros cumplidos retirados**, **techos de cola y bitácora**, **documentación al día** (toda doctrina cambiada sube su `version` en el mismo commit; el catálogo sincronizado con la plantilla si se tocó) **artefactos declarados que existen** y **sin worktrees de tanda colgando**—, y el **DoD de la tanda**, que comprueba el **producto** de ese trabajo. **El del vault SELLA, por ámbito, una huella del CONTENIDO de los ficheros del ámbito**, no del commit (cada coordinador sella el suyo, y la ventana de doctrinas se cuenta desde su último sello): si se toca algo del ámbito después de sellar, **el sello caduca solo** y el **hook de arranque avisa a la sesión siguiente** de que la anterior cerró sin cruzar la puerta — el aviso va al arranque porque un hook de cierre no lo lee nadie. **Una puerta que no se ha visto fallar no prueba nada:** cada una se demuestra en rojo, metiendo el defecto a mano, antes de darla por buena. Y **no se ajusta una puerta para que pase**.
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
3. **Higiene** — ningún efímero ya cumplido sigue vivo (el prompt ejecutado, el brief que ya tiene informe) en todos los contenedores, la raíz y cada asunto, con `estudios/` incluido; lo que es de otro contenedor ni te bloquea ni se nombra. La regla vive **en el hook**, y el DoD la consulta ahí en vez de reimplementarla, para que no puedan derivar.
4. **Techos** — ninguna cola ni bitácora por encima de su límite de bytes, y tampoco la **vista del estado** de cada ámbito propio (lo que el hook vuelca al arrancar, calculado con la misma función que el hook) por encima de **16.384 B**, con aviso que no bloquea a partir del 85 %. No es estética: esos ficheros entran **enteros** en cada arranque, así que pasarse lo cobran todas las sesiones siguientes. → [[estado_vivo_por_comando]]
5. **Documentación al día** — la puerta que ningún verificador de estructura puede dar: que lo escrito siga describiendo lo que hay.
   - Toda doctrina cuyo **cuerpo** cambió sube su `version` antes de cerrar. Sin esto, la ficha y su changelog cuentan historias distintas y **releyendo no se nota**, porque las dos son plausibles por separado. **Una errata también es un cambio.**
   - **Se juzga la ventana entera, no commit a commit**, y la diferencia no es un tecnicismo: si cambias una doctrina y subes su versión tres commits después, **la deuda está saldada** y no hay nada que denunciar. Una puerta que se queja de algo ya arreglado enseña a ignorarla, que es como se pierde una puerta. Lo que sigue cazando es el caso real: **cerrar con una doctrina cambiada y su versión intacta.**
   - Si la sesión tocó el catálogo o el inicializador, **la plantilla queda sincronizada**. Y al propagar una pieza con divergencia declarada se copia **el cambio, no el fichero**.
6. **Los artefactos declarados existen** — un `porque` que apunta a un fichero que ya no está manda a la sesión siguiente a buscar humo. La puerta mira el `porque` de cada elemento activo del estado: la ruta (la parte anterior a `#`) tiene que existir.
   - **La ruta va desde la RAÍZ DEL VAULT, no desde el contenedor donde se escribe**, y esto se declara aquí porque **dos sesiones han tropezado con lo mismo al estrenar su fichero**: como vive en la carpeta del asunto, la ruta *parece* relativa a ella. Quien la lee —el hook y esta puerta— trabaja sobre el vault entero. **Que el mismo tropiezo se repita no es descuido de quien lo comete: es que la pieza estaba mal escrita**, y por eso la corrección va a la plantilla y no a un aviso.
7. **Sin worktrees de tanda colgando** — un worktree sin integrar es trabajo que el director no ve en Obsidian y que el verificador recorre dos veces. Reparto por ámbito (D5): un worktree **dentro del vault** es del dueño de su ruta relativa y le bloquea; uno **fuera del vault** es del coordinador general; los ajenos solo se cuentan ("N worktree(s) ajenos: no te bloquean"), sin ruta ni dueño. El remedio va en el propio mensaje: integrarlo con `node general/comun/scripts/worktree-tanda.mjs --integrar <Id> --worktree <ruta>` o retirarlo con `git worktree remove`.

## Con varias sesiones vivas: cada coordinador ve y responde solo de su ámbito

**Con dos coordinadores trabajando —que es lo normal, no lo raro— el DoD tropezaba con un problema que no tiene cuando hay uno solo:** miraba el árbol entero, así que el trabajo a medias de cualquiera bloqueaba el cierre de todos. Un coordinador con su contenedor impecable y sus puertas en verde no podía sellar por ficheros que no puede tocar ni commitear.

**La regla es que cada coordinador ve y responde solo de su ámbito, y lo ajeno ni bloquea ni se nombra** (decisión D5 del director, 2026-10-05). Vale para todas las puertas que miran el conjunto: el verificador cuenta solo los hallazgos de tu ámbito, la higiene lista solo los efímeros de tu ámbito y el árbol sucio ajeno se reduce a un recuento sin dueño ("N ficheros ajenos sin commitear: no te bloquean"). Ni la ruta ni el nombre del dueño aparecen.

**Por qué no se avisa del rojo ajeno.** Hasta la v1.4 el hallazgo del verificador en otro contenedor seguía bloqueando y se pedía avisar a su dueño. Se retiró: obligaba a revisar trabajo de otros, y quien tiene algo que necesita del otro se lo dice por el canal entre coordinadores. Un coordinador no revisa ni comenta lo pendiente de otro salvo que se lo pida. El verificador en sí no cambia, y el coordinador general lo sigue corriendo entero cuando mantiene el kit.

**Tu ámbito lo fija el directorio desde el que corres el DoD**, igual que el `cwd` fija el rol de una sesión: desde un contenedor respondes de ese contenedor; desde la raíz, de todo lo que no es un asunto. El hook de arranque aplica el mismo criterio a su aviso del verificador y a su volcado del trabajo en curso, que es solo el de tu contenedor.

## El sello, y por qué es por contenido

Si todas las puertas pasan, el DoD escribe un **sello** con una **huella del contenido** de lo versionado —leyendo los ficheros del disco, **no** el árbol de un commit—, el commit (`HEAD`) al sellar, la fecha y qué puertas corrieron. La razón de que sea por contenido es exactamente el caso que más duele: **un sello que colgara del commit diría "todo bien" con cambios sin guardar encima**.

**Un sello por ámbito, en su carpeta.** El general sella en `_meta/dod-sello.local.json` y cada asunto en `<espacio>/<asunto>/coordinacion/dod-sello.local.json`; ambos son `*.local.json`, gitignored. **La huella mira solo los ficheros del ámbito** (los versionados y los nuevos sin ignorar), de modo que un commit o un cambio de otro ámbito no caduca tu sello. **La ventana de "doctrinas al día" va desde el último sello del propio ámbito**, por rango de commits (`<commit sellado>..HEAD`); si ese commit ya no es ancestro de `HEAD`, cae a la fecha del sello, y sin sello a hoy. El caso del 2026-10-14 explica por qué: con un sello común, el cierre de un asunto movía la ventana del general y la deuda de una doctrina cambiada sin subir versión pasó sin que nadie la marcara. El `.dod-seal.json` de la raíz es legado y sigue ignorado.

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

**Todo coordinador** — el general del vault y el de cada asunto — al cerrar sesión, y antes de dar por buena una tanda. **Cada coordinador sella su ámbito**: el sello de uno no cubre ni caduca el de otro. **La ejecutora corre el DoD de su tanda**; el del vault lo corre el coordinador, que es quien ve el árbol entero.

Relacionada: [[verificacion_e2e_por_agente]] (lo comprobable se ejecuta y se reporta literal; lo demás, comprobación en campo), y del pack `codigo/`, solo si el asunto lo instala: [[gates_de_calidad_locales]] (las puertas del producto en un asunto con software). También: [[verificacion_fuente_primaria]] (ningún dato derivable se escribe a mano), [[convencion_organizacion_carpeta_trabajo]] (qué es efímero y qué no, y los techos), [[mejora_continua_del_kit]].

> Pieza de catálogo `general/comun/doctrinas/`. Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda**. Historial de versiones: [[historial-doctrinas#definition_of_done]].
