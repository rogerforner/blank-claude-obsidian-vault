---
name: Formato markdown limpio en prompts
description: Los prompts .md para sesiones operativas usan markdown limpio (# heading 1, solo headings, sin envoltorio ``` exterior, sin separadores ASCII, sin tiempos ni metadiscurso) para que el director los copie íntegros.
type: convention
version: 1.3
index_summary: >-
  Prompts `.md`: `#` heading 1, solo headings, sin envoltorio ``` exterior, sin separadores ASCII, sin tiempos ni metadiscurso. **SIN EMOJIS con ámbito acotado (v1.2)**: se exige y se verifica en el **catálogo, las plantillas, los ficheros de reglas e identidad** (`CLAUDE.md`, `README.md`, charters, índices) y en lo que se **entrega fuera** — estados como etiquetas `[OK]`/`[PENDIENTE]`, el énfasis lo da el markdown. **En las zonas de trabajo (cola, bitácora, estudios, coordinación, informes, chat) NO se persiguen** y no se gasta un token en quitarlos. Flechas, matemáticos y dibujo de árboles **no** son emojis en ninguna parte; limpieza siempre oportunista, nunca dedicada.
---

Los prompts `.md` que el coordinador redacta para sesiones operativas usan **markdown limpio**, para facilitar que el director los copie íntegros y que el agente los lea sin ruido.

## Convención obligatoria

1. **`#` heading 1 como primera línea** del prompt.
2. **Estructura solo con headings markdown** (`#`, `##`, `###`).
3. **SIN envoltorio ` ``` ` exterior** — el prompt empieza directamente con su heading.
4. **SIN separadores ASCII** (`═══`, `───`, `===`): se renderizan como texto plano y rompen la lectura.
5. **Bloques de código internos sí** pueden usar ` ``` ` (comandos de shell, json, texto literal a copiar…).
6. **SIN tiempos estimados** en el cuerpo: eso es para reportar al director, no para el agente.
7. **SIN metadiscurso** sobre el coordinador, sobre cómo se redactó el prompt, ni sobre otras sesiones paralelas. El agente no lo necesita.
8. El prompt se **entrega como encargo a un subagente o se pega en la sesión**.

## Estructura típica

```
# <título> — <identificador de la tanda>

## Setup
- Working dir, modelo, esfuerzo, plan mode

## Contexto y objetivo
## Decisiones cerradas
## Lectura inicial obligatoria
## Plan Mode — decisiones a resolver
## Scope exacto
## Restricciones inviolables
## Procedimiento de commits
## Verificación al cerrar
## Reporte final al director
## Primera acción
```

Las preferencias de presentación documental son **fuertes y operativas**: capturarlas al primer enunciado y aplicarlas desde el siguiente artefacto evita reescrituras.

## SIN EMOJIS — en el kit y en lo que se entrega

**Dónde se exige y se verifica:** el **catálogo** `general/`, las **plantillas** del `inicializador/`, y los ficheros de **reglas e identidad** de cualquier carpeta (`CLAUDE.md`, `README.md`, los charters, los índices `MEMORY-*`) — además de los scripts del kit, cuya salida va directa al contexto del coordinador. Es lo que **se lee muchas veces, lo heredan otras sesiones y viaja a otros vaults**. Y lo mismo en **lo que se entrega fuera**. Si el contexto admite **iconos de verdad** —una tipografía de iconos en un documento maquetado— se usan; si no, **texto plano o nada**.

- **Los estados se escriben como etiquetas:** `[OK]`, `[PENDIENTE]`, `[VERDE]`, `[ALTERADO]`, `[PERDIDO]` — nunca con un icono de check, cruz o semáforo. La etiqueta se puede **buscar con grep** y no depende de cómo la dibuje cada cliente; el pictograma, no.
- **El énfasis lo da el markdown**, no un pictograma: **negrita** para lo que no se puede pasar por alto, y la palabra que corresponda (*OJO*, *PROHIBIDO*, *AVISO*) cuando haga falta gritar.
- **No son emojis** —y por tanto se quedan **en todas partes**— las **flechas** (`→`, `↔`, `⇒`), los **símbolos matemáticos** (`≠`, `≈`, `≥`) y los **caracteres de dibujo de árboles** (`├`, `└`, `│`): son tipografía, no decoración.

**Dónde NO se persigue** *(acotado el 2026-08-12 por decisión del director)*: las **zonas de trabajo** — cola, bitácora, decisiones, `estudios/`, `coordinacion/`, el `docs/` de un asunto, los informes de tanda, los handoffs y el chat. Ahí **un emoji suelto no es un defecto y no se dedica ni un token a quitarlo**. El motivo es de coste: al modelo le sale natural escribirlos, la reescritura para limpiarlos consume contexto y cuota, y el verificador llegaba a poner el kit **entero** en rojo por un emoji en un informe que no forma parte del kit.

- **Documentos existentes:** se limpian **de forma oportunista al editarlos**, sin churn dedicado — también en la zona donde la regla se exige. **Nunca una pasada dedicada a quitar emojis.**

## Cómo se le escribe a un modelo actual

Estas pautas salen de la documentación de la API y están **medidas en Opus 4.5/4.6, no en 5.5**: la propia página avisa de que hay que verificarlas en cada modelo, y para 5.5 no hay una prueba equivalente. Se aplican como punto de partida y se comprueban con el modelo que toque.

- **Di qué hacer y por qué, con redacción normal.** Los modelos recientes responden más a la indicación del sistema y se sobreactivan con el énfasis: donde antes se escribía una alarma en mayúsculas con un "debes", basta "usa esta herramienta cuando…". Dar el motivo les permite aplicar la regla a casos que el texto no previó; una prohibición absoluta sin motivo solo se obedece al pie de la letra.
- **Escribe imperativos literales.** Siguen las instrucciones con precisión: "¿puedes sugerir cambios?" produce sugerencias, no cambios. En un contrato de tanda se escribe "edita", "escribe el plan en tal fichero". Un encargo de solo lectura lo declara como prohibición explícita, no como cortesía.
- **Cierra la tanda cuando el trabajo pedido esté hecho.** Sonnet 5.5 añade tests, documentación y ficheros pequeños en todos los niveles de esfuerzo, más cuanto más alto. Para las tandas sirve este párrafo: "cuando el trabajo pedido esté hecho y comprobado, informa y para; no añadas funciones, pruebas, ficheros, documentación ni refactorizaciones que no se pidieron, y menciónalo al final". Protege además la regla de commitear solo los ficheros propios.
- **No encargues revisores que nadie ha pedido.** En esfuerzo alto lanza subagentes revisores por su cuenta; indicar que no lo haga salvo que se pida una revisión redujo el coste en un tercio. Si la revisión hace falta, se pide por su nombre.
- **Nombra las paradas que se quieren, solo en ejecución desatendida.** En un `claude -p` sin nadie delante, el modelo puede cerrar el turno con texto y el bucle lo toma por final, o preguntar antes de terminar. Se le dice qué paradas son legítimas (la puerta humana) y cuáles no, y el cierre se trata como informe. En coordinación interactiva no se añade: ahí quien está delante sí puede contestar, y el párrafo estorba.
- **Pide consultar la fuente aunque haya seguridad.** Un modelo en esfuerzo bajo da por hecho un cambio sin ejecutar la prueba, o responde de memoria donde una lectura habría detectado novedades. Una línea como "abre el fichero aunque estés seguro de lo que dice" encaja con la regla de fuente primaria. Conviene quitar las frases del tipo "minimiza las llamadas a herramientas", que empujan al mismo error.
- **Regula el razonamiento con el nivel de esfuerzo.** Bajar el esfuerzo reduce el pensamiento con más fiabilidad que cualquier frase del prompt, y a Sonnet pedirle que piense menos no se lo reduce de forma fiable. Por eso no se escribe "piensa menos" ni "piensa con cuidado": lo primero no funciona y lo segundo, en Opus 5.5, sobra.
- **A Fable se le pide esfuerzo `high` y edición quirúrgica.** Narra menos entre herramientas, escribe prosa más densa y tiende a reescribir ficheros enteros; con `xhigh` o `max` puede redactar el entregable en el razonamiento y repetirlo después. Se le indica que edite solo la parte que cambia y se le deja el esfuerzo en `high`.
- **Pide el formato en positivo.** Las instrucciones de formato en negativo funcionan peor que describir lo que se quiere: se escribe "responde en prosa corrida" y no "sin viñetas".
- **No edites `CLAUDE.md` ni los hooks a mitad de una tanda larga.** Cambiar el sistema o las herramientas a mitad de sesión invalida la caché y los bloques de pensamiento, que solo valen en la conversación que los produjo. Los cambios de reglas se hacen entre tandas.

Relacionada: [[feedback_prompt_delivery]], [[prompts_rutas_absolutas_fuera_del_working_dir]], [[minimizar_askuserquestion_agente_operativo]], [[docs_sin_fases]].

> Pieza de catálogo `general/comun/doctrinas/`. **v1.3 (2026-10-04):** sección nueva "Cómo se le escribe a un modelo actual", con las pautas de la documentación de la API para los modelos 5.5 (medidas en Opus 4.5/4.6), y la regla 8 pasa a "se entrega como encargo a un subagente o se pega en la sesión". El `version: 1.1` del frontmatter estaba atrasado respecto a la v1.2 de este mismo pie, y queda corregido. **v1.2 (2026-08-12):** la regla SIN EMOJIS pasa de "todo lo escrito" a un **ámbito acotado** por decisión del director — se exige y se verifica en el catálogo, las plantillas, los ficheros de reglas e identidad y lo que se entrega fuera; **en las zonas de trabajo ya no se persigue**, porque limpiarlas costaba más contexto y cuota de lo que aportaba, y un emoji en un informe de tanda ponía en rojo el kit entero. **v1.1 (2026-08-01):** añadida la regla **SIN EMOJIS** en todo lo escrito: estados como etiquetas de texto, el énfasis lo da el markdown, y flechas, matemáticos y dibujo de árboles NO son emojis. Limpieza oportunista, sin churn dedicado. v1.0 (2026-06-05). Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente.
> Adaptada al enfoque neutro de la plantilla (sin referencias al dominio del software) — 2026-07-29.
