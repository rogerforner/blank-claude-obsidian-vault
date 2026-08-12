# Guía de arranque de sesiones (para el director)

Arrancar y relevar sesiones sobre este vault. Aquí solo hay **prompts para copiar** y la carpeta desde la que arrancar; la sintaxis de lanzamiento vive en la tabla "Ejecución" del `CLAUDE.md`, que es su fuente única.

**Lo único que hay que hacer bien antes de escribir el prompt: abrir la herramienta con la carpeta correcta como directorio de trabajo.** Esa carpeta **es** lo que le da su identidad al agente: carga su `CLAUDE.md` y ya sabe quién es, sin que se lo expliques. Enraizarlo donde no toca le da las reglas de otro sitio. **No se corrige con una frase del prompt.**

El **modelo de sesiones** es siempre el mismo: una sesión de coordinador general en la raíz, y **una sesión independiente por asunto**. El vault es la memoria compartida entre todas: el estado vivo está en los ficheros, no en el contexto de ninguna sesión.

## Índice

| Quiero… | Carpeta desde la que arranco |
|---|---|
| [Arrancar el coordinador general](#arrancar-el-coordinador-general) | raíz del vault |
| [Arrancar un coordinador de asunto](#arrancar-un-coordinador-de-asunto) | `asuntos/<slug>/` |
| [Arrancar un coordinador de asunto de software](#arrancar-un-coordinador-de-asunto-de-software) | `asuntos/<slug>/` |
| [Preguntar algo sin gastar contexto (consultor)](#preguntar-algo-sin-gastar-contexto-consultor) | `asuntos/<slug>/` |
| [Relevar una sesión (handoff)](#relevar-una-sesión-handoff) | la misma de la sesión que releva |
| [Trabajo voluminoso](#trabajo-voluminoso-no-lo-lanzas-tú) | — |
| [Máquina nueva](#máquina-nueva) | — |

---

## Arrancar el coordinador general

**Carpeta: la raíz del vault.**

**Prompt:**

```
Arranca como coordinador general de este vault. Lee _meta/PRIMEROS-PASOS.md, el charter, la cola de pendientes, las decisiones abiertas y el índice de doctrinas. Salúdame con el estado en 2-3 líneas y tu propuesta de siguiente paso.
```

---

## Arrancar un coordinador de asunto

**Carpeta: `asuntos/<slug>/`.** Es lo que le da su identidad y lo que acota dónde escribe.

**Prompt:**

```
Arranca como coordinador de este asunto. Lee tu charter-coordinador.md, la cola de pendientes, las doctrinas propias de memoria/ y, si existe, el material de referencia en coordinacion/referencia/. Salúdame con el estado del asunto y tu plan de arranque.
```

---

## Arrancar un coordinador de asunto de software

**Carpeta: `asuntos/<slug>/`.** Es el mismo gesto que arrancar cualquier coordinador de asunto — lo único que cambia es qué comprueba antes de tocar nada, porque aquí el código vive **fuera del vault**, donde el runtime lo sirve, con su propio ciclo de git. Un asunto de software que arranca sin saber dónde está su repositorio, en qué rama o si el remoto existe trabaja a ciegas.

> Este coordinador usa el perfil `plantilla-settings-coordinador-software.json`, no el normal, y **no** es la sesión que hace `push`: eso lo hace una sesión aparte, lanzada directamente en el repositorio de código (fuera del vault, según diga `docs/emplazamiento-runtime.md`), con `plantilla-settings-repo-codigo.json`. Detalle en `inicializador/plantilla-settings-coordinador-software.NOTAS.md` y `inicializador/plantilla-settings-repo-codigo.NOTAS.md`.

**Prompt:**

```
Arranca como coordinador de este asunto de software. Antes de tocar nada: si docs/emplazamiento-runtime.md no existe o le falta algún punto de los siete de inicializador/plantilla-emplazamiento-runtime.md, pregúntamelo ahora y no sigas sin tenerlo. Si ya existe, léelo y confírmame que sigue siendo cierto (una ruta que cambió de sitio, un contenedor que ya no corre) antes de fiarte de él. Con la ficha en la mano, comprueba y repórtame: en qué rama está el repositorio, si tiene remoto configurado, qué puertas de calidad hay instaladas (hooks, pre-commit, script de definition-of-done) y si pasan HOY — todo dentro del runtime que la ficha indica, no en el host. Después lee tu charter-coordinador.md, la cola de pendientes, las doctrinas propias de memoria/ y, si existe, el material de referencia en coordinacion/referencia/. Salúdame con el estado del asunto, el resultado de esas comprobaciones y tu plan de arranque.
```

---

## Preguntar algo sin gastar contexto (consultor)

Para resolver una duda factual sin quemar el contexto del coordinador. **No edita ni decide nada.** Se arranca en **modo de solo lectura** y con el modelo barato.

**Carpeta: la del asunto (o la raíz, si la duda es del kit).**

**Prompt** — es tu pregunta directa, con una condición al final:

```
<tu pregunta>. Responde citando fichero:línea de donde lo has sacado, y si no está escrito en el vault, dilo en vez de deducirlo.
```

---

## Relevar una sesión (handoff)

Cuando se acaba el contexto: **pides el handoff → abres una sesión nueva en la MISMA carpeta, que lo lee**. El handoff es local y gitignored; se borra cuando la nueva sesión ya está al día (el hook de arranque lo hace solo).

**Cuándo pedirlo.** Tú miras el indicador de contexto y lo pides antes del final, como haces ahora. Hay una **señal además del indicador**: si el agente empieza a **ignorar reglas que sí están escritas, a repetirse o a perder el hilo**, relévalo ya aunque quede sitio — la fiabilidad cae antes de llenarse la ventana.

### Paso 1 — en la sesión que se acaba

**Prompt** — coordinador de asunto:

```
Estamos cerca del límite de contexto. Crea un handoff en coordinacion/handoff-<fecha>.md con: (1) estado actual, (2) pendiente/pipeline, (3) lo que está en vuelo, (4) qué leer primero para continuar sin perder nada. Escríbelo dando por hecho que quien lo lea arranca de cero y no tiene tu contexto.
```

**Prompt** — coordinador general: igual, pero el fichero es `_meta/handoff-coordinador-general-<fecha>.md`, y el punto (1) es *estado del vault: qué se cerró y qué está vivo en cada asunto*.

### Paso 2 — en la sesión nueva, misma carpeta

**Prompt:**

```
Retomas como coordinador de este asunto desde un handoff. Lee tu charter-coordinador.md y coordinacion/handoff-<fecha>.md, y continúa desde ahí; confírmame el estado antes de seguir.
```

Para el **coordinador general**, cambia los dos ficheros por `_meta/PRIMEROS-PASOS.md` y `_meta/handoff-coordinador-general-<fecha>.md`.

---

## Trabajo voluminoso: no lo lanzas tú

Transcribir un lote de escaneos, tabular cuarenta facturas, redactar un escrito largo, generar el documento maquetado: eso va a una **sesión ejecutora** con contexto limpio, y **la lanza el coordinador**, no tú. Tú solo lo pides:

```
Esto es voluminoso: prepáralo como tanda ejecutora con su contrato y lánzala tú, acotada, y luego dime la conclusión y qué has verificado. No me traigas el resultado completo.
```

Lo que el coordinador tiene que respetar al lanzarla (topes, una o dos como máximo y nunca un enjambre) está en el `CLAUDE.md` y en las notas de la plantilla de configuración. **No es cosa tuya acordarte.**

---

## Máquina nueva

1. **Copia** la carpeta del vault. Por defecto es git local, sin nube: no hay nada que clonar de un remoto.
2. Si aún no es un repositorio, inicialízalo.
3. **Coordinador general y coordinadores de asunto:** arrancan sin más. Solo si un asunto lee una carpeta **externa** al vault hay que añadirla al lanzar.
4. Pide al coordinador general que compruebe el kit: `node _meta/verificar-kit.mjs` debe salir en verde.
