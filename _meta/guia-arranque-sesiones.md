# Guía de arranque de sesiones (para el director)

Todo lo necesario para **abrir, relevar y cerrar** sesiones sobre este vault: la carpeta desde la que se abre cada una y el prompt que se le pega. La sintaxis de lanzamiento no está aquí: vive en la tabla "Ejecución" del `CLAUDE.md` de la raíz, que es su fuente única.

## Cómo se usa esta guía

**1. Abre la herramienta con la carpeta correcta.** Es lo único que hay que hacer bien, y no se corrige después: **la carpeta es lo que le da identidad al agente**. Desde ella carga su `CLAUDE.md` y ya sabe quién es, qué reglas cumple, qué puede escribir y dónde busca por defecto. Enraizarlo donde no toca le da las reglas de otro sitio, y **una frase del prompt no lo mueve**.

**2. Copia el prompt de su bloque, tal cual.** Cada rol tiene los suyos **completos**, aunque el del coordinador general y el del coordinador de asunto se parezcan mucho: **están duplicados a propósito** para que no tengas que adaptar nada al pegarlos.

**3. Solo hay que escribir algo donde aparece `<…>`**, y eso pasa únicamente en el consultor, donde el hueco es tu pregunta. **Todos los demás prompts son copiar y pegar sin tocar nada**: ni fechas, ni nombres de asunto, ni rutas. Los que antes pedían una fecha ahora dicen "la de hoy" o "el más reciente", que es algo que el agente resuelve solo.

**Y lo que no hace falta escribir:** no le expliques al agente su rol, ni le enumeres las reglas, ni le digas dónde está. Todo eso lo carga de la carpeta. Un prompt largo explicando el rol no añade nada y se contradice con lo que ya lee.

## Índice

| Quiero… | Carpeta desde la que abro | Bloque |
|---|---|---|
| Arrancar el coordinador general | raíz del vault | [1.1](#11-arrancar-de-cero) |
| Retomar el coordinador general tras un relevo | raíz del vault | [1.2](#12-retomar-desde-un-handoff) |
| Pedirle el handoff al coordinador general | raíz del vault | [1.3](#13-pedirle-el-handoff-antes-de-que-se-quede-sin-contexto) |
| Arrancar el coordinador de un asunto | `asuntos/<slug>/` | [2.1](#21-arrancar-de-cero) |
| Arrancar el coordinador de un asunto **de software** | `asuntos/<slug>/` | [2.2](#22-arrancar-de-cero-en-un-asunto-de-software) |
| Retomar el coordinador de un asunto tras un relevo | `asuntos/<slug>/` | [2.3](#23-retomar-desde-un-handoff) |
| Pedirle el handoff al coordinador de un asunto | `asuntos/<slug>/` | [2.4](#24-pedirle-el-handoff-antes-de-que-se-quede-sin-contexto) |
| Preguntar algo sin gastar contexto | la del asunto, o la raíz | [3](#3-consultor--preguntar-sin-gastar-el-contexto-del-coordinador) |
| Encargar trabajo voluminoso | — | [4](#4-trabajo-voluminoso-no-lo-lanzas-tú) |
| Poner el vault en una máquina nueva | — | [5](#5-máquina-nueva) |

**El modelo de sesiones es siempre el mismo:** una sesión de coordinador general en la raíz y **una sesión independiente por asunto**. El vault es la memoria compartida entre todas — el estado vivo está en los ficheros, no en el contexto de ninguna sesión. Por eso relevar una sesión no pierde nada, y por eso dos sesiones abiertas a la vez no se estorban.

---

## 1. Coordinador general — carpeta: **la raíz del vault**

Mantiene la estructura del vault: el catálogo, las plantillas, las convenciones, y **inicializa los asuntos**. No trabaja dentro de ningún asunto.

### 1.1 Arrancar de cero

Para el día a día: abrir el vault y ver por dónde va.

```
Arranca como coordinador general de este vault. Lee _meta/PRIMEROS-PASOS.md, el charter, la cola de pendientes, las decisiones abiertas y el índice de doctrinas. Salúdame con el estado en 2-3 líneas y tu propuesta de siguiente paso.
```

### 1.2 Retomar desde un handoff

Cuando la sesión anterior se quedó sin contexto y te dejó el relevo escrito. **Misma carpeta que la sesión que releva.**

```
Retomas como coordinador general de este vault desde un handoff. Lee _meta/PRIMEROS-PASOS.md y el handoff más reciente de _meta/ (el fichero handoff-coordinador-general-*.md), y continúa desde ahí; confírmame el estado antes de seguir.
```

### 1.3 Pedirle el handoff antes de que se quede sin contexto

```
Estamos cerca del límite de contexto. Crea un handoff en _meta/handoff-coordinador-general-<fecha de hoy>.md con: (1) estado del vault, qué se cerró y qué está vivo en cada asunto, (2) pendiente y pipeline, (3) lo que está en vuelo ahora mismo, (4) qué leer primero para continuar sin perder nada. Escríbelo dando por hecho que quien lo lea arranca de cero y no tiene tu contexto.
```

*(La fecha la pone el agente: sabe la de hoy. Tú no tienes que escribirla.)*

---

## 2. Coordinador de asunto — carpeta: **`asuntos/<slug>/`**

Uno por asunto. Ve **solo su asunto** y el catálogo `general/` en solo lectura; los demás asuntos son invisibles para él, y eso es deliberado.

Los prompts de este bloque **no nombran el asunto**: la carpeta desde la que abres ya lo determina, así que el mismo texto sirve para cualquier asunto sin cambiar una palabra.

### 2.1 Arrancar de cero

```
Arranca como coordinador de este asunto. Lee tu charter-coordinador.md, la cola de pendientes, las doctrinas propias de memoria/ y, si existe, el material de referencia en coordinacion/referencia/. Salúdame con el estado del asunto y tu plan de arranque.
```

### 2.2 Arrancar de cero en un asunto **de software**

Mismo gesto y misma carpeta que 2.1. Lo que cambia es **qué comprueba antes de tocar nada**: en un asunto de software el código vive **fuera del vault**, donde el runtime lo sirve, con su propio ciclo de git. Un coordinador que arranca sin saber dónde está su repositorio, en qué rama o si el remoto existe trabaja a ciegas.

> Este coordinador usa el perfil `plantilla-settings-coordinador-software.json`, no el normal, y **no** es la sesión que publica: eso lo hace una sesión aparte, abierta directamente en el repositorio de código con `plantilla-settings-repo-codigo.json`. Detalle en las `.NOTAS.md` de cada perfil.

```
Arranca como coordinador de este asunto de software. Antes de tocar nada: si docs/emplazamiento-runtime.md no existe o le falta algún punto de los siete de inicializador/plantilla-emplazamiento-runtime.md, pregúntamelo ahora y no sigas sin tenerlo. Si ya existe, léelo y confírmame que sigue siendo cierto (una ruta que cambió de sitio, un contenedor que ya no corre) antes de fiarte de él. Con la ficha en la mano, comprueba y repórtame: en qué rama está el repositorio, si tiene remoto configurado, qué puertas de calidad hay instaladas (hooks, pre-commit, script de definition-of-done) y si pasan HOY — todo dentro del runtime que la ficha indica, no en el host. Después lee tu charter-coordinador.md, la cola de pendientes, las doctrinas propias de memoria/ y, si existe, el material de referencia en coordinacion/referencia/. Salúdame con el estado del asunto, el resultado de esas comprobaciones y tu plan de arranque.
```

### 2.3 Retomar desde un handoff

**Misma carpeta que la sesión que releva.**

```
Retomas como coordinador de este asunto desde un handoff. Lee tu charter-coordinador.md y el handoff más reciente de coordinacion/ (el fichero handoff-coordinador-*.md), y continúa desde ahí; confírmame el estado antes de seguir.
```

### 2.4 Pedirle el handoff antes de que se quede sin contexto

```
Estamos cerca del límite de contexto. Crea un handoff en coordinacion/handoff-coordinador-<fecha de hoy>.md con: (1) estado actual del asunto, empezando por el plazo más próximo, (2) pendiente y pipeline, (3) lo que está en vuelo ahora mismo, (4) qué leer primero para continuar sin perder nada. Escríbelo dando por hecho que quien lo lea arranca de cero y no tiene tu contexto.
```

---

## 3. Consultor — preguntar sin gastar el contexto del coordinador

Para una duda factual sobre los documentos o el estado ("¿qué fecha consta en la resolución?", "¿dónde quedó escrito el criterio de X?"). **No edita ni decide nada**: se abre en modo de solo lectura y con el modelo barato.

**Carpeta: la del asunto** — o la raíz, si la duda es del kit.

**Es el único prompt donde escribes algo:** tu pregunta, y el resto tal cual.

```
<tu pregunta>. Responde citando fichero:línea de donde lo has sacado, y si no está escrito en el vault, dilo en vez de deducirlo.
```

La condición del final es la que hace útil la respuesta: sin ella, un consultor deduce con buena letra algo que no está escrito en ninguna parte.

---

## 4. Trabajo voluminoso: no lo lanzas tú

Transcribir un lote de escaneos, tabular cuarenta facturas, redactar un escrito largo, generar el documento maquetado: eso va a una **sesión ejecutora** con contexto limpio, y **la lanza el coordinador**, no tú. Tú solo lo pides, en la sesión del coordinador que corresponda:

```
Esto es voluminoso: prepáralo como tanda ejecutora con su contrato y lánzala tú, acotada, y luego dime la conclusión y qué has verificado. No me traigas el resultado completo.
```

Lo que el coordinador tiene que respetar al lanzarla —topes, una o dos como máximo y nunca un enjambre, comprobar antes que la sesión está autenticada— está en el `CLAUDE.md` y en el contrato de tanda. **No es cosa tuya acordarte.**

---

## 5. Máquina nueva

1. **Copia** la carpeta del vault. Es git local, sin nube: no hay nada que clonar de un remoto.
2. Si aún no es un repositorio, inicialízalo.
3. **Coordinador general y coordinadores de asunto arrancan sin más.** Solo si un asunto lee una carpeta **externa** al vault hay que añadirla al abrir la sesión.
4. Pide al coordinador general que compruebe el kit: `node _meta/verificar-kit.mjs` tiene que salir en verde.

---

## Cuándo pedir el relevo

Tú miras el indicador de contexto y pides el handoff antes del final. Pero hay una **segunda señal, y llega antes que el indicador**: si el agente empieza a **ignorar reglas que sí están escritas, a repetirse o a perder el hilo**, relévalo ya aunque parezca que queda sitio. La fiabilidad cae antes de que la ventana se llene.

**Qué pasa con el handoff después.** Es un fichero **local y gitignored**: sirve hasta que la sesión nueva está al día y entonces sobra. No hay que borrarlo a mano — el hook de higiene que corre al arrancar borra solo los superados y avisa de lo que haya quedado por quitar.
