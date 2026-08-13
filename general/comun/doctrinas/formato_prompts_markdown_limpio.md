---
name: Formato markdown limpio en prompts
description: Los prompts .md para sesiones operativas usan markdown limpio (# heading 1, solo headings, sin envoltorio ``` exterior, sin separadores ASCII, sin tiempos ni metadiscurso) para que el director los copie íntegros.
type: convention
version: 1.1
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
8. El prompt se **pega íntegro en Plan Mode**.

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

Relacionada: [[feedback_prompt_delivery]], [[prompts_rutas_absolutas_fuera_del_working_dir]], [[minimizar_askuserquestion_agente_operativo]], [[docs_sin_fases]].

> Pieza de catálogo `general/comun/doctrinas/`. **v1.2 (2026-08-12):** la regla SIN EMOJIS pasa de "todo lo escrito" a un **ámbito acotado** por decisión del director — se exige y se verifica en el catálogo, las plantillas, los ficheros de reglas e identidad y lo que se entrega fuera; **en las zonas de trabajo ya no se persigue**, porque limpiarlas costaba más contexto y cuota de lo que aportaba, y un emoji en un informe de tanda ponía en rojo el kit entero. **v1.1 (2026-08-01):** añadida la regla **SIN EMOJIS** en todo lo escrito: estados como etiquetas de texto, el énfasis lo da el markdown, y flechas, matemáticos y dibujo de árboles NO son emojis. Limpieza oportunista, sin churn dedicado. v1.0 (2026-06-05). Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente.
> Adaptada al enfoque neutro de la plantilla (sin referencias al dominio del software) — 2026-07-29.
