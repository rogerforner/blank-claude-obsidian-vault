# `coordinacion/`

Prompts, handoffs y briefs del asunto. Convención completa: [[convencion_organizacion_carpeta_trabajo]]; la versión larga para copiar aquí está en `../../../inicializador/README-convencion.md`.

## Principio

La raíz solo contiene lo **activo** y lo **vivo**. Lo efímero ya usado **se borra** (git conserva el histórico local; el resultado perdura en `estudios/`, `docs/` o la cola). **Nada de ficheros obsoletos.**

- **Se conserva:** `prompt-<activo>.md` (la tanda en curso), `handoff-coordinador-<fecha>.md` (el vivo), `tmp-otros-actual.md` (buffer), `README.md`, y `referencia/` — documentos vivos sin fecha en el nombre: glosario del asunto, contactos del organismo o del perito, calendario de plazos, el reconocimiento inicial del material.
- **Se borra (git es el histórico):** el prompt ya ejecutado y cerrada su tanda, el brief cuando ya existe su informe, el handoff superado.

## Qué se versiona y qué no

- **Locales, nunca versionados** (gitignored): `handoff-*.md` y `tmp-otros-actual.md`. Sirven para una sesión y no aportan al histórico.
- **Versionados en vuelo, borrados al cumplir:** `prompt-*.md` y los briefs. `git rm` + commit local al cerrar.

El coordinador hace este housekeeping **al cerrar cada tanda**, sin esperar al director. Y un **hook `SessionStart`** limpia también **al arrancar**, porque las sesiones a menudo mueren por límite de contexto antes de cerrar.

## Lo que NO va aquí

Los **originales** recibidos o emitidos y los **documentos del asunto** van a `docs/`, no a `coordinacion/`. Aquí solo vive el trabajo con la IA, que es efímero por diseño.
