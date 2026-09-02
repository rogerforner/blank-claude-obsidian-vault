# Guía de arranque de sesiones

Cada bloque de abajo es **copia-pega directo**: se copia entero y se envía. No hay que redactar nada ni sustituir nada, salvo los `<…>` cuando los haya.

La sintaxis de lanzamiento no está aquí: vive en la tabla "Ejecución" del `CLAUDE.md` de la raíz, que es su fuente única.

## Lo único que hay que hacer bien, y no se corrige después

**La carpeta desde la que abres la sesión es lo que le da identidad al agente.** De ella carga su `CLAUDE.md`, su `.claude/`, sus permisos y sus hooks, y de ella depende dónde busca por defecto. Una frase del tipo *"trabaja en tal carpeta"* **no mueve nada**.

- En terminal: `cd <ruta>` y luego `claude`.
- En la app: abre esa carpeta como directorio de trabajo.

**Y tres cosas que NO hay que hacer:** no le expliques su rol ni le enumeres las reglas —todo eso lo carga de la carpeta, y un prompt largo explicándoselo **compite** con lo que ya ha leído—; **no cambies de modelo a media sesión**; y **empieza cada tarea nueva con `/clear`**.

### Por qué `/clear` entre tareas, y por qué no cambiar de modelo

**[Informe de modelos del 2026-09-02.]**

- **`/clear` no cuesta nada**: no envía petición. En cambio, **arrastrar el contexto anterior se re-lee y se re-factura en CADA turno siguiente**, así que el coste de una sesión crece de forma **cuadrática con el número de turnos**. En nuestra propia medición, **el 97 % del trabajo de una jornada se ejecutó por encima de 150k de contexto**, con la lectura de caché tres órdenes de magnitud por encima de la salida.
- **Pero el disparador correcto no es "llevo dos horas"**: es **"he terminado la tarea"**. Con la caché caliente, dos horas seguidas en la misma tarea salen **más baratas** que partirlas en cuatro sesiones, porque cada arranque en frío paga la reescritura completa del prefijo. La regla es: **`/clear` entre tareas, `/compact` dentro de una tarea.** Y `/rewind` para abandonar un camino que no llevaba a nada.
- **Cambiar de modelo a media sesión recomputa la petición entera**: cada modelo tiene su propia caché. En una sesión de 150k son **12-20 veces el coste de un turno normal**. Y el contraejemplo que rompe la intuición: **bajar a un modelo barato para una pregunta tonta sale MÁS caro** que dejar que la conteste el que ya está cargado. Si necesitas algo barato, **lanza un subagente**, no cambies el modelo del bucle.
- **El esfuerzo tampoco se cambia a media sesión, y esto ya no es cautela: es decisión.** Cuesta lo mismo que cambiar de modelo, porque la caché está indexada por los dos. Se describe una excepción por mensaje en algunos modelos, pero **depende de la versión, del modelo y de una beta** — o sea, una regla que a veces se cumple. **Trabajar siempre igual gana a trabajar óptimamente a veces.** Si necesitas otro esfuerzo: **pide el relevo, `/clear`, y arranca de nuevo con el que toque.** Es barato: `/clear` no cuesta nada y **el estado no vive en el contexto, vive en ficheros**.

### Por qué aquí `/clear` no da miedo

Porque **el estado no vive en el contexto de ninguna sesión: vive en ficheros versionados**, y la sesión que arranca los relee. Los que lo sostienen, y son estos cuatro:

| Fichero | Qué guarda |
|---|---|
| `_meta/cola-pendientes.md` | lo abierto y lo cerrado, con su porqué |
| `_meta/trabajo-en-curso.md` *(y el de cada asunto)* | una línea por frente vivo, con dueño y artefacto |
| `_meta/bitacora.md` | lo que se aprendió, para que no se repita |
| `_meta/decisiones-abiertas.md` | lo que espera decisión del director |

**Y no hace falta acordarse de abrirlos: el disparador de arranque los vuelca solo**, junto con la fecha sellada, el veredicto del verificador y si la sesión anterior cerró su DoD.

> **[POR COMPROBAR, y cuesta cinco segundos]** El disparador está declarado **sin filtro de evento**, así que debería correr también tras un `/clear` — pero eso **no se ha verificado aquí**. La comprobación es trivial: haz `/clear` y mira si vuelve a aparecer el bloque que empieza por `[FECHA]`. **Si NO aparece**, entonces tras un `/clear` la sesión se queda sin fecha, sin saber si el kit está en rojo y sin ver los frentes abiertos — y habría que pedirle explícitamente que relea el estado.

*(Nota para quien venga de otro vault de esta misma plantilla: aquí **no hay `estado.json` ni `estado.mjs`**. Ese mecanismo es de otro árbol; el equivalente son los cuatro ficheros de arriba.)*

### La escalera por esfuerzo, con lo que cuesta cada escalón

**[Índice independiente, leído el 2026-09-02.]**

| Variante | Índice | Coste por tarea |
|---|---|---|
| Opus 5 · `max` | 63,1 | $2,34 |
| Opus 5 · `xhigh` | 62,5 | $1,80 |
| Opus 5 · `high` | 61,5 | $1,23 |
| **Opus 5 · `medium`** | **58,6** | **$0,72** |
| Opus 4.8 · `max` | 57 | — |
| **Sonnet 5 · `max`** | **55** | **$1,72** |
| Opus 5 · `low` | 52 | $0,43 |

**Lo que hay que leer aquí, porque invierte una intuición cara:** **Sonnet 5 a tope no alcanza a Opus 5 en `medium`** — y cuesta **más del doble por tarea**. El motivo es la **verbosidad**: Sonnet en `max` genera 300M de tokens contra los 29M de Opus en `medium`, y la verbosidad es lo que se paga.

> **Regla: Sonnet se usa en esfuerzo bajo o medio, que es donde de verdad es barato. En cuanto una tarea pide subirle el esfuerzo, la respuesta es Opus en esfuerzo bajo — no Sonnet en esfuerzo alto.**

**Y el tramo caro de Opus es el de arriba:** de `medium` a `max` se pagan **$1,62 más por 4,5 puntos**. De `xhigh` a `max`, **0,6 puntos por $0,54** — o sea, nada. **El punto dulce es `xhigh`, y muchas veces `high` ya basta.**

*(Sonnet 5 solo está evaluado en `max`; sus niveles `high` y `xhigh` figuran como N/A. La conclusión de calidad se sostiene igual —si su techo ya pierde, `high` también—, pero **en coste solo está medido el extremo**. Y la tabla se lee **por fila**: el esfuerzo no es una escala comparable entre familias.)*

**Una excepción honesta al "Sonnet a tope no llega":** en pruebas **agénticas de trabajo de oficina**, hay evidencia de que Sonnet 5 a esfuerzo alto **iguala a Opus 4.8** — no a Opus 5. La conclusión general se sostiene en el índice compuesto y en razonamiento científico o factual, que es donde la brecha no se cierra con configuración.

### Qué modelo y qué esfuerzo, por situación

**Sube el ESFUERZO cuando el cuello de botella es pensar. Sube de MODELO cuando el cuello de botella es saber o escribir bien.** Y **subir el esfuerzo no siempre mejora**: en tareas simples o de patrón obvio está documentado que **empeora** — el modelo se distrae con lo irrelevante.

| Situación | Modelo | Esfuerzo | Por qué |
|---|---|---|---|
| Coordinar la jornada, varias tandas | **Opus 5** | **`high`** | Coherencia de horizonte largo. `ultracode` **solo** el día que la verificación independiente valga más que el ahorro |
| Auditar o revisar algo amplio, sin dejarse nada | **Opus 5** | **`xhigh`** | Cobertura y razonamiento multi-paso: aquí el esfuerzo **sí** compensa |
| Investigar con herramientas | **Opus 5** | **`xhigh`** | Búsqueda agéntica y llamadas repetidas sí se benefician |
| Escribir doctrina o documentación | **Opus 5** | **`high`** | Gana el conocimiento y la redacción, no más tokens de razonamiento |
| **Refutar premisas** (fase de análisis) | **Opus 5** | **`medium`** | **Corregido el 02-sep.** Es detección de errores, no generación: pide capacidad. Y Opus a `medium` **supera a Sonnet a tope costando menos** |
| Volumen, traducción, revisión de textos | **Sonnet 5** | **`medium`** | Leer y redactar, no razonar en cadena. **Si pide más esfuerzo, sube a Opus `low`** |
| Implementación mecánica y acotada | **Sonnet 5** | **`low`/`medium`** | Patrón obvio y salida estrecha: subir esfuerzo no mejora y puede empeorar |
| Consultor de solo lectura | **Sonnet 5** | **`medium`** | Sesión aparte que no toca la caché del coordinador |
| Subagente de lectura | **Haiku 4.5** | **— (no admite `effort`)** | Devuelve resumen sin quemar el contexto del principal. Índice **30**, muy por debajo de Sonnet: sirve para **leer y resumir, no para razonar**, y eso **no se compensa con configuración** |
| Brief para el chat web | el capaz | **`xhigh`** | Allí no hay perfil: se elige a mano. `max` tampoco ahí |

> **Detalle completo, curvas por modelo y origen de cada dato → [modelos y esfuerzo](../general/comun/modelos-y-esfuerzo.md).** Ese documento **se refresca por tandas periódicas** conforme salen modelos nuevos, y **caduca solo**: cuando vence, el kit sale en rojo y la sesión siguiente se entera al arrancar.

**Dos avisos que ahorran disgustos:**

- **`ultracode` no es un sexto nivel de esfuerzo:** es `xhigh` **más permiso permanente para que la sesión reparta trabajo en varios agentes**. Solo se activa por sesión y **se pierde al reiniciar**. No rinde en tareas de un solo paso ni en la coordinación ordinaria; **rinde donde la verificación independiente vale más que el ahorro** — auditoría amplia, refutar premisas. *(No choca con el veto del kit: lo vetado es el fan-out de mil subagentes, no repartir una revisión entre tres lectores desechables.)*
- **Ni `max` ni `ultracode` se pueden dejar escritos en la configuración.** Si alguien pone `effortLevel: "max"` en un `settings.json`, **se degrada en silencio** —a `high` o a `medium` según la versión— y la sesión cree correr en `max` sin correr en `max`. *(Comprobado el 2026-09-02: ninguno de nuestros siete perfiles lo declara, así que no nos afecta.)*

### Y lo que ya no eliges tú

Desde el **2026-08-12** el modelo y el esfuerzo van escritos en el `settings.json` de cada perfil, porque **una regla que depende de que alguien se acuerde de tocar un desplegable no es una regla**. Cada sesión arranca sola con lo que le toca:

| Sesión | Perfil |
|---|---|
| Coordinador general y de asunto | `.claude/settings.json` de su carpeta |
| Consultor | `plantilla-settings-consultor.json` |
| Ejecutora | `--settings inicializador/plantilla-settings-ejecutora.json` (o `-codigo` si toca código) |
| Sus subagentes | ninguno: **heredan el de la sesión que los lanza** |

> **La columna del perfil arregló algo que estaba roto en silencio: no tener perfil no significa correr sin permisos, significa correr con los del de al lado.** Hasta el 2026-08-27 no existía perfil de ejecutora no-código, así que una tanda lanzada desde la raíz heredaba el del **coordinador general**: modelo caro, canal entre sesiones abierto y sin denegación sobre `general/`.

**Si eliges otra cosa a mano, gana tu elección** — pero solo esa sesión, y **elígela antes de empezar**.

## Índice

| Quiero… | Carpeta | Sección |
|---|---|---|
| Arrancar el **coordinador general** | raíz del vault | [↓](#coordinador-general) |
| Arrancar el coordinador de **un asunto** | `asuntos/<slug>/` | [↓](#coordinador-de-asunto) |
| Arrancar el coordinador de un asunto **de software** | `asuntos/<slug>/` | [↓](#coordinador-de-asunto-de-software) |
| Arrancar un **consultor** de solo lectura | la del asunto, o la raíz | [↓](#consultor-de-solo-lectura) |
| **Relevar** una sesión que se queda sin contexto | la misma | [↓](#relevar-una-sesión) |
| Encargar **trabajo voluminoso** | la del coordinador | [↓](#trabajo-voluminoso-el-coordinador-no-lo-ejecuta) |
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

Dos pasos: **le pides el handoff a la sesión que se acaba, y abres una nueva con la MISMA carpeta que lo lee.**

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

## Trabajo voluminoso: el coordinador no lo ejecuta

Transcribir un lote de escaneos, tabular cuarenta facturas, redactar un escrito largo, generar el documento maquetado: eso va a una **sesión ejecutora** con contexto limpio, y **la lanza el coordinador él mismo**. No hace falta que hagas de transporte.

```
Esto es voluminoso: prepáralo como tanda ejecutora con su contrato y lánzala tú, acotada, y luego dime la conclusión y qué has verificado. No me traigas el resultado completo.
```

Lo que el coordinador tiene que respetar al lanzarla —topes, una o dos como máximo y nunca un enjambre, comprobar antes que la sesión está autenticada por cuenta y no por clave— está en el `CLAUDE.md` y en el contrato de tanda. **No es cosa tuya acordarte.**

---

## Máquina nueva

1. **Copia** la carpeta del vault. Es git local, sin nube: **no hay nada que clonar de un remoto, y nada que empujar**.
2. Si aún no es un repositorio, inicialízalo.
3. **Coordinador general y coordinadores de asunto arrancan sin más.** Solo si un asunto lee una carpeta **externa** al vault hay que añadirla al abrir la sesión.
4. Pide al coordinador general que compruebe el kit: `node _meta/verificar-kit.mjs` tiene que salir en verde.
