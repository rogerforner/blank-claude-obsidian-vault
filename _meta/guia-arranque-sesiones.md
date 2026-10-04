# Guía de arranque de sesiones

Cada bloque de abajo es **copia-pega directo**: se copia entero y se envía. No hay que redactar nada ni sustituir nada, salvo los `<…>` cuando los haya.

La sintaxis de lanzamiento no está aquí: vive en la tabla "Ejecución" del `CLAUDE.md` de la raíz, que es su fuente única.

## Lo único que hay que hacer bien, y no se corrige después

**La carpeta desde la que abres la sesión es lo que le da identidad al agente.** De ella carga su `CLAUDE.md`, su `.claude/`, sus permisos y sus hooks, y de ella depende dónde busca por defecto. Una frase del tipo *"trabaja en tal carpeta"* **no mueve nada**.

- En terminal: `cd <ruta>` y luego `claude`.
- En la app: abre esa carpeta como directorio de trabajo.
**Y tres cosas que NO hay que hacer:** no le expliques su rol ni le enumeres las reglas —todo eso lo carga de la carpeta, y un prompt largo explicándoselo **compite** con lo que ya ha leído—; **no cambies de modelo a media sesión**; y **empieza cada tarea nueva con `/clear`**.

**Al arrancar, comprueba en la cabecera de la sesión el modelo y el esfuerzo.** El alias de modelo puede haber cambiado y el esfuerzo no se hereda de la sesión anterior. Con `effortLevel: "high"` en el perfil, Opus 5.5 arranca en `high` (medido el 2026-10-04); lo que se lee en la cabecera es lo que corre, y es el sitio donde se comprueba.

### Por qué `/clear` entre tareas, y por qué no cambiar de modelo

**[Informe de modelos del 2026-09-02, refrescado el 2026-10-04.]**

- **`/clear` no cuesta nada**: no envía petición. En cambio, **arrastrar el contexto anterior se re-lee y se re-factura en CADA turno siguiente**, así que el coste de una sesión crece de forma **cuadrática con el número de turnos**. En nuestra propia medición, **el 97 % del trabajo de una jornada se ejecutó por encima de 150k de contexto**, con la lectura de caché tres órdenes de magnitud por encima de la salida.
- **Pero el disparador correcto no es "llevo dos horas"**: es **"he terminado la tarea"**. Con la caché caliente, dos horas seguidas en la misma tarea salen **más baratas** que partirlas en cuatro sesiones, porque cada arranque en frío paga la reescritura completa del prefijo. La regla es: **`/clear` entre tareas, `/compact` dentro de una tarea.** Y `/rewind` para abandonar un camino que no llevaba a nada.
- **Cambiar de modelo a media sesión recomputa la petición entera**: cada modelo tiene su propia caché. En una sesión de 150k son **12-20 veces el coste de un turno normal**. Y el contraejemplo que rompe la intuición: **bajar a un modelo barato para una pregunta tonta sale MÁS caro** que dejar que la conteste el que ya está cargado. Si necesitas algo barato, **lanza un subagente**, no cambies el modelo del bucle.
- **El esfuerzo tampoco se cambia a media sesión, y esto ya no es cautela: es decisión.** En la API, cambiar el esfuerzo entre peticiones invalida la caché; solo el cambio por mensaje, en beta, la conserva. Para Claude Code hay quien dice que en los modelos 5.5 la conserva, pero **ninguna sesión de este vault lo ha medido**, así que no se da por cierto. **El motivo no depende de cómo salga esa medición:** una excepción que depende de la versión del cliente, del modelo y de una beta es una regla que a veces se cumple, y las que a veces no se cumplen fallan el día que importa. **Trabajar siempre igual gana a trabajar óptimamente a veces.** Si necesitas otro esfuerzo: **pide el relevo, `/clear`, y arranca de nuevo con el que toque.** Es barato: `/clear` no cuesta nada y **el estado no vive en el contexto, vive en ficheros**. Lo mismo vale para el fichero de reglas, los hooks y las herramientas: se cambian entre tandas, no dentro de una. Detalle y fuentes en [modelos y esfuerzo](../general/comun/modelos-y-esfuerzo.md), §3.

### Por qué aquí `/clear` no da miedo

Porque **el estado no vive en el contexto de ninguna sesión: vive en ficheros versionados**, y la sesión que arranca los relee. Los que lo sostienen, y son estos cuatro:

| Fichero | Qué guarda |
|---|---|
| `_meta/cola-pendientes.md` | lo abierto y lo cerrado, con su porqué |
| `_meta/trabajo-en-curso.md` *(y el de cada asunto)* | una línea por frente vivo, con dueño y artefacto |
| `_meta/bitacora.md` | lo que se aprendió, para que no se repita |
| `_meta/decisiones-abiertas.md` | lo que espera decisión del director |

**Y no hace falta acordarse de abrirlos: el disparador de arranque los vuelca solo**, junto con la fecha sellada, el veredicto del verificador y si la sesión anterior cerró su DoD.

> **[MEDIDO 2026-10-04] El hook de arranque corre también tras un `/clear`**: al hacerlo vuelve a salir el bloque que empieza por `[FECHA]`, con el veredicto del verificador y los frentes abiertos. Lo que `/clear` no recarga son las definiciones de agente de una carpeta `.claude/agents/` creada después de arrancar, ni un `CLAUDE.md` cambiado: para eso, sesión nueva.

*(Nota para quien venga de otro vault de esta misma plantilla: aquí **no hay `estado.json` ni `estado.mjs`**. Ese mecanismo es de otro árbol; el equivalente son los cuatro ficheros de arriba.)*

### La escalera por esfuerzo, con lo que cuesta cada escalón

**[Índice independiente v4.3.2, leído entre el 2026-09-22 y el 09-29. Escala distinta de la de septiembre: no se compara con ella.]** Resumen de tres filas por modelo; la curva completa, con `low` y `max` y el origen de cada dato, está en [modelos y esfuerzo](../general/comun/modelos-y-esfuerzo.md), §2.

| Variante | Índice | Coste por tarea |
|---|---|---|
| Opus 5.5 `xhigh` | 56,0 | $3,46 |
| Opus 5.5 `high` | 53,6 | $1,82 |
| **Opus 5.5 `medium`** | **51,2** | **$1,34** |
| Sonnet 5.5 `high` | 46,7 | $1,08 |
| **Sonnet 5.5 `medium`** | **40,7** | **$0,59** |
| Sonnet 5.5 `low` | 35,8 | $0,41 |

**Lo que hay que leer aquí:** para igualar a Opus 5.5 en `medium`, Sonnet 5.5 necesita `xhigh`, y eso sale **1,7 veces más caro** que usar Opus. Para igualar a Opus 5.5 en `high` necesita `max`, a **4,1 veces**. El motivo es la verbosidad, que se concentra arriba: Sonnet 5.5 en `max` es el que más tokens gasta de los medidos. `max` de Opus 5.5 tampoco compensa: de `xhigh` a `max` son 1,6 puntos por 2,52 $ más.

> **Regla: Sonnet 5.5 se usa en `low`, `medium` o `high`, que es donde de verdad es barato; no en `xhigh` ni en `max`. Si una tarea pide más, la respuesta es Opus 5.5, no Sonnet a tope.** Para pensar más se sube de modelo, no de esfuerzo.

*(La tabla se lee por fila: el esfuerzo no es una escala comparable entre familias. Mide precio de API, no consumo de cuota. Y en trabajo de conocimiento largo hay empate técnico entre los dos modelos, medido en inglés.)*

### Qué modelo y qué esfuerzo, por situación

**Sube el ESFUERZO cuando el cuello de botella es pensar. Sube de MODELO cuando el cuello de botella es saber o escribir bien.** Y **subir el esfuerzo no siempre mejora**: en tareas simples o de patrón obvio está documentado que **empeora**, porque el modelo se distrae con lo irrelevante. Con Sonnet 5.5 está medido en `max`.

Resumen de la tabla de [modelos y esfuerzo](../general/comun/modelos-y-esfuerzo.md), §5, que es la fuente y tiene también la escalada a Fable:

| Situación | Modelo | Esfuerzo | Por qué |
|---|---|---|---|
| Coordinar la jornada, varias tandas | Opus 5.5 | `high` | Coherencia de horizonte largo. Se fija al arrancar y no se cambia |
| Auditar o revisar a fondo, investigar con herramientas | Opus 5.5 | `xhigh` | Cobertura y búsqueda agéntica: aquí el esfuerzo sí compensa. `max` no |
| Escribir doctrina o método | Opus 5.5 | `high` | Gana el conocimiento y la redacción, no más razonamiento |
| Planificar una tanda no trivial (refutar premisas) | subagente `planificador` | Opus; el esfuerzo es el de la sesión | Detectar errores pide capacidad. Sin `effort:` en su definición hereda el de la sesión |
| Ejecutar un plan revisado | subagente `ejecutora` | Sonnet 5.5, `medium` | El contrato ya fija el resultado; subir esfuerzo solo añade tokens |
| Mecánica: cambios literales, copiar, mover | subagente `ejecutora-mecanica` | Sonnet 5.5, `low` | Patrón obvio: subir esfuerzo no mejora y puede empeorar |
| Consultor de solo lectura | Sonnet 5.5 | `medium` | Leer y contestar, pidiéndole que consulte el fichero aunque esté seguro |
| Brief para el chat web | el capaz | `xhigh` | Allí no hay perfil: se elige a mano. `max` tampoco ahí |

> **Detalle completo, curvas por modelo y origen de cada dato → [modelos y esfuerzo](../general/comun/modelos-y-esfuerzo.md).** Ese documento **se refresca por tandas periódicas** conforme salen modelos nuevos, y **caduca solo**: cuando vence, el kit sale en rojo y la sesión siguiente se entera al arrancar.

**Dos avisos que ahorran disgustos:**

- **`ultracode` está vetado salvo decisión del director.** No es un sexto nivel de esfuerzo: es `xhigh` más orquestación de subagentes en paralelo, y no se guarda como `effortLevel`. Activarlo a media sesión es un cambio de esfuerzo, así que se decide al abrir. Los motivos y cuándo rinde, en [modelos y esfuerzo](../general/comun/modelos-y-esfuerzo.md), §7. `/fast` también está vetado: cambia de modelo, rompe la caché y se paga desde créditos de uso.
- **No se deja `max` escrito en ningún perfil.** El esquema del perfil admitía hasta `xhigh`, y poner `max` no daba error: arrancaba en `high` o en `medium` según la versión, y la sesión creía correr en `max` sin correrlo. Además no compensa. *(Comprobado el 2026-09-02: ninguno de nuestros siete perfiles lo declara.)*

### Y lo que ya no eliges tú

Desde el **2026-08-12** el modelo y el esfuerzo van escritos en el `settings.json` de cada perfil, porque **una regla que depende de que alguien se acuerde de tocar un desplegable no es una regla**. Cada sesión arranca sola con lo que le toca:

| Sesión | Perfil |
|---|---|
| Coordinador general y de asunto | `.claude/settings.json` de su carpeta |
| Consultor | `plantilla-settings-consultor.json` |
| Subagente `planificador` | `.claude/agents/planificador.md`: modelo Opus fijado en su definición; hereda el perfil de la sesión que lo lanza |
| Subagente `ejecutora` | `.claude/agents/ejecutora.md`: Sonnet 5.5 en `medium` fijado en su definición; hereda el perfil de la sesión |
| Subagente `ejecutora-mecanica` | `.claude/agents/ejecutora-mecanica.md`: Sonnet 5.5 en `low` fijado en su definición; hereda el perfil de la sesión |
| `claude -p` (otra raíz, otro perfil o plan B) | el perfil siempre, con `--settings inicializador/plantilla-settings-ejecutora.json` (o `-codigo` si toca código); es un proceso aparte con contexto limpio, pero hereda el entorno del llamante (por eso ninguna clave de API en él) y, sin `--settings`, el perfil de su carpeta |

> **La columna del perfil arregló algo que estaba roto en silencio: no tener perfil no significa correr sin permisos, significa correr con los del de al lado.** Hasta el 2026-08-27 no existía perfil de ejecutora no-código, así que una tanda lanzada desde la raíz heredaba el del **coordinador general**: modelo caro, canal entre sesiones abierto y sin denegación sobre `general/`. Los subagentes heredan lo mismo: por eso el perfil de la sesión que los lanza importa, y por eso su modelo y su esfuerzo se fijan en la definición y no en el prompt.

**Si eliges otra cosa a mano, gana tu elección** — pero solo esa sesión, y **elígela antes de empezar**.

## Índice

| Quiero… | Carpeta | Sección |
|---|---|---|
| Arrancar el **coordinador general** | raíz del vault | [↓](#coordinador-general) |
| Arrancar el coordinador de **un asunto** | `asuntos/<slug>/` | [↓](#coordinador-de-asunto) |
| Arrancar el coordinador de un asunto **de software** | `asuntos/<slug>/` | [↓](#coordinador-de-asunto-de-software) |
| Arrancar un **consultor** de solo lectura | la del asunto, o la raíz | [↓](#consultor-de-solo-lectura) |
| **Relevar** una sesión que se queda sin contexto | la misma | [↓](#relevar-una-sesión) |
| Encargar **un trabajo** (ciclo de tandas) | la del coordinador | [↓](#encargar-un-trabajo-ciclo-de-tandas) |
| Poner el vault en una **máquina nueva** | — | [↓](#máquina-nueva) |

**El modelo de sesiones es siempre el mismo:** una de coordinador general en la raíz y **una independiente por asunto**. El vault es la memoria compartida — el estado vivo está en los ficheros, no en el contexto de ninguna sesión. Por eso relevar no pierde nada, y por eso dos sesiones abiertas a la vez no se estorban.

---

## Coordinador general

**Carpeta: la raíz del vault.** Mantiene la estructura —catálogo, plantillas, convenciones— e **inicializa los asuntos**. No trabaja dentro de ninguno.

```
Arranca como coordinador general de este vault. Lee _meta/PRIMEROS-PASOS.md, el charter, la cola de pendientes, las decisiones abiertas y el índice de doctrinas. Salúdame con el estado en 2-3 líneas y tu propuesta de siguiente paso.
```

---

## Coordinador de asunto

**Carpeta: `asuntos/<slug>/`.** Ve **solo su asunto** y el catálogo `general/` en solo lectura; los demás asuntos son invisibles para él, y eso es deliberado.

**No hace falta nombrar el asunto:** la carpeta ya lo determina, y **el mismo texto sirve para todos**.

```
Arranca como coordinador de este asunto. Lee tu charter-coordinador.md, la cola de pendientes, las doctrinas propias de memoria/ y, si existe, el material de referencia en coordinacion/referencia/. Salúdame con el estado del asunto y tu plan de arranque.
```

---

## Coordinador de asunto de software

**Misma carpeta que el anterior.** Lo que cambia es **qué comprueba antes de tocar nada**: en un asunto de software el código vive **fuera del vault**, donde el runtime lo sirve, con su propio ciclo de git. Un coordinador que arranca sin saber dónde está su repositorio, en qué rama o si el remoto existe **trabaja a ciegas**.

```
Arranca como coordinador de este asunto de software. Antes de tocar nada: si docs/emplazamiento-runtime.md no existe o le falta algún punto de los siete de inicializador/plantilla-emplazamiento-runtime.md, pregúntamelo ahora y no sigas sin tenerlo. Si ya existe, léelo y confírmame que sigue siendo cierto (una ruta que cambió de sitio, un contenedor que ya no corre) antes de fiarte de él. Con la ficha en la mano, comprueba y repórtame: en qué rama está el repositorio, si tiene remoto configurado, qué puertas de calidad hay instaladas (hooks, pre-commit, script de definition-of-done) y si pasan HOY — todo dentro del runtime que la ficha indica, no en el host. Después lee tu charter-coordinador.md, la cola de pendientes, las doctrinas propias de memoria/ y, si existe, el material de referencia en coordinacion/referencia/. Salúdame con el estado del asunto, el resultado de esas comprobaciones y tu plan de arranque.
```

**Dos cosas de este perfil que conviene tener presentes:**

- Usa `plantilla-settings-coordinador-software.json`, **no el normal**.
- **No es la sesión que publica.** Eso lo hace una sesión aparte, abierta directamente en el repositorio de código con `plantilla-settings-repo-codigo.json`. Detalle en las `.NOTAS.md` de cada perfil.

---

## Consultor de solo lectura

Para una duda factual sobre los documentos o el estado ("¿qué fecha consta en la resolución?", "¿dónde quedó escrito el criterio de X?"). **No edita ni decide nada.**

**Carpeta: la del asunto** — o la raíz, si la duda es del kit. **Es el único bloque donde escribes algo:** tu pregunta, y el resto tal cual.

```
<tu pregunta>. Responde citando fichero:línea de donde lo has sacado, y si no está escrito en el vault, dilo en vez de deducirlo.
```

La condición del final es la que hace útil la respuesta: **sin ella, un consultor deduce con buena letra algo que no está escrito en ninguna parte.**

---

## Relevar una sesión

**El caso normal no necesita handoff.** Se relevan las sesiones entre bloques, cuando el plan ya está al día en el vault: el coordinador cierra el bloque, commitea y escribe el prompt de relevo de la sección "Plantilla del prompt de relevo" de [[ciclo_de_tandas]]. Ese prompt se pega en una sesión nueva con la misma carpeta, y no se copia aquí para que no haya dos versiones. Lo que tiene que sobrevivir ya está en el plan, la cola y los commits.

**El handoff queda para cuando la sesión muere a mitad de bloque**, sin haber llegado a un punto de parada. Entonces son dos pasos: **le pides el handoff a la sesión que se acaba, y abres una nueva con la MISMA carpeta que lo lee.**

**No esperes al aviso de contexto.** La señal temprana es cualitativa: cuando la sesión empieza a **repreguntar cosas ya decididas, a reabrir asuntos cerrados o a perder el hilo** de por qué se hizo algo, **ya está cerca**. En ese momento el handoff todavía sale bien escrito; veinte mil tokens después, no.

### 1) Pedir el handoff — a la sesión que se acaba

```
Estamos cerca del límite de contexto. Antes de nada, deja tu estado donde sobreviva al relevo: actualiza los ficheros de estado que toque y commitéalo. Después escribe un handoff en tu carpeta de coordinación, fechado hoy, con (1) en qué punto está cada cosa, (2) lo que está EN VUELO ahora mismo, (3) qué decisiones se tomaron hoy y por qué, (4) qué leer primero para continuar sin perder nada. Escríbelo dando por hecho que quien lo lea arranca de cero y no tiene tu contexto.
```

**Lo primero de ese prompt no es un adorno:** un handoff está **fuera de git**, es invisible a `grep`, un hook puede borrarlo y no existe si la sesión nueva arranca con otra carpeta. **Lo que tiene que sobrevivir va versionado**; el handoff solo es el atajo.

### 2) Retomar — en la sesión nueva, misma carpeta

```
Retomas esta sesión desde un handoff. Lee el handoff más reciente de tu carpeta de coordinación y confírmame en 3 líneas dónde estamos y qué ibas a hacer a continuación. Si el handoff contradice al estado versionado, gana el estado: dímelo en vez de seguir.
```

**Qué pasa con el handoff después.** No hay que borrarlo a mano: **el hook de higiene que corre al arrancar borra solo los superados** y avisa de lo que haya quedado por quitar.

---

## Encargar un trabajo (ciclo de tandas)

Cuando el trabajo no es trivial (toca varios ficheros, estrena una forma de trabajo o se apoya en premisas sin comprobar), el coordinador lo hace con el ciclo de [[ciclo_de_tandas]]: planifica primero con el subagente `planificador`, ejecuta después con el subagente `ejecutora` en tandas pequeñas y para al cerrar cada bloque. Los subagentes son del propio coordinador, así que no hace falta que hagas de transporte. `claude -p` queda para otra raíz u otro perfil.

```
Esto no es trivial: planifícalo con el planificador, enséñame las premisas falsas y la tabla de tandas, y ejecútalo por bloques parando al cerrar cada uno
```

Lo que el coordinador tiene que respetar al lanzar —el plan antes de las tandas, la comprobación de cada una y la parada al cerrar el bloque— está en la doctrina y en el contrato de tanda. No es cosa tuya acordarte.

---

## Máquina nueva

1. **Copia** la carpeta del vault. Es git local, sin nube: **no hay nada que clonar de un remoto, y nada que empujar**.
2. Si aún no es un repositorio, inicialízalo.
3. **Coordinador general y coordinadores de asunto arrancan sin más.** Solo si un asunto lee una carpeta **externa** al vault hay que añadirla al abrir la sesión.
4. Pide al coordinador general que compruebe el kit: `node _meta/verificar-kit.mjs` tiene que salir en verde.
5. **Herramientas comunes de usuario.** Viven fuera del vault y hay que reinstalarlas: `npm install -g @playwright/cli@latest` y `playwright-cli install --skills --global`. Se comprueba con `playwright-cli --version`. Detalle y prueba completa en [[herramientas_comunes_de_usuario]].
