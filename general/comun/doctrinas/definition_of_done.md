---
name: Definition of Done — nadie cierra sin cruzar la puerta
description: Terminar no es dejar de trabajar. Toda tanda y toda sesión cierran cruzando un DoD ejecutable con dos capas: el DoD del vault (`_meta/dod.mjs`), que es el suelo común e igual para todos los asuntos —kit en verde, árbol limpio, efímeros retirados, techos, documentación al día y artefactos que existen—, y el DoD de la tanda, que comprueba el PRODUCTO de ese trabajo concreto. El del vault sella una huella del CONTENIDO del árbol; si se toca algo después de sellar, el sello caduca solo y el hook de arranque se lo dice a la sesión siguiente. Una puerta que no se ha visto fallar no prueba nada.
type: doctrine
version: 1.0
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
   - Toda doctrina cuyo **cuerpo** cambió sube su `version` **en el mismo commit**. Sin esto, la ficha y su changelog cuentan historias distintas y **releyendo no se nota**, porque las dos son plausibles por separado. **Una errata también es un cambio.**
   - Si la sesión tocó el catálogo o el inicializador, **la plantilla queda sincronizada**. Y al propagar una pieza con divergencia declarada se copia **el cambio, no el fichero**.
6. **Los artefactos declarados existen** — una línea de trabajo en curso que apunta a un fichero que ya no está manda a la sesión siguiente a buscar humo.

## El sello, y por qué es por contenido

Si todas las puertas pasan, el DoD escribe un **sello** con una **huella del contenido** de lo versionado —leyendo los ficheros del disco, **no** el árbol de un commit—, la fecha y qué puertas corrieron. La razón de que sea por contenido es exactamente el caso que más duele: **un sello que colgara del commit diría "todo bien" con cambios sin guardar encima**.

**Consecuencia, y es la que hace que esto funcione sin disciplina: si se toca algo después de sellar, el sello caduca solo.** No hay forma de sellar y seguir editando sin que se note.

**El aviso va al ARRANQUE de la sesión siguiente, no al cierre de la propia.** Un hook de cierre no lo lee nadie —la sesión ya se está yendo—, y bloquear el cierre castiga a quien sí está delante. Al arrancar, en cambio, hay alguien mirando y todavía no se ha tocado nada: es el único momento en que el aviso cambia lo que va a pasar.

## Las reglas que lo sostienen

- **Una puerta que no se ha visto fallar no prueba nada.** Toda puerta nueva se demuestra **en rojo** —metiendo el defecto a mano— antes de darla por buena, y con un caso legítimo que **no** salte. Si no se ha visto fallar, no es una puerta: es una intención.
- **No se ajusta una puerta para que pase.** Si sale en rojo, se arregla lo que denuncia. Cambiar el criterio para que cuadre es el fallo que este kit persigue desde el primer día.
- **Una puerta saltada se DECLARA, nunca se da por buena en silencio.** Cuando algo no se puede comprobar —falta la configuración local, no está el árbol de comparación—, el DoD lo dice y **cuenta como rojo si el trabajo lo necesitaba**. Un salto silencioso es una puerta que miente.
- **El veredicto está en el bloque de resumen.** Se corre solo y sin tubería, igual que el verificador: encadenarlo enmascara su código de salida.

## Quién la aplica

**Todo coordinador** — el general del vault y el de cada asunto — al cerrar sesión, y antes de dar por buena una tanda. **La ejecutora corre el DoD de su tanda**; el del vault lo corre el coordinador, que es quien ve el árbol entero.

Relacionada: [[verificacion_e2e_por_agente]] (lo comprobable se ejecuta y se reporta literal; lo demás, comprobación en campo), y del pack `codigo/`, solo si el asunto lo instala: [[gates_de_calidad_locales]] (las puertas del producto en un asunto con software). También: [[verificacion_fuente_primaria]] (ningún dato derivable se escribe a mano), [[convencion_organizacion_carpeta_trabajo]] (qué es efímero y qué no, y los techos), [[mejora_continua_del_kit]].

> Pieza de catálogo `general/comun/doctrinas/`. **v1.0 (2026-08-24):** nace de un encargo del director, que traía el DoD que ya usa en un vault de software derivado de este kit y pidió lo mismo para todo lo demás — *"un DoD nos dará garantía de que las tareas en cola no dejen archivos residuales tras su finalización, que para las nuevas sesiones todo esté según lo esperado, que la documentación no quede desfasada"*. Lo que se adapta de aquel es **la mecánica** —huella por contenido, sello que caduca solo, puertas que se demuestran en rojo— y lo que cambia es **la sustancia de las puertas**, porque aquí no hay pruebas ni lint que correr: hay estado vivo, higiene y documentación. **La primera ejecución encontró deuda real** —cinco doctrinas cambiadas sin subir `version`, una de ellas veinte minutos antes por el propio coordinador— que ninguna relectura había detectado. Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado y **no se hereda** automáticamente.
