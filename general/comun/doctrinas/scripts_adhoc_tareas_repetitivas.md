---
name: Scripts ad-hoc para tareas repetitivas
description: Cuando una tarea es mecánica, determinista y verificable, preferir que la IA genere un script ejecutable y se ejecute, en lugar de procesar ítem por ítem cargando contexto. Menos tokens, output determinista, reutilizable y auditable. Vale también para los pasos del propio método que se repiten entre sesiones (el relevo, el tablero), que viven como scripts comunes en general/comun/scripts/.
type: doctrine
version: 2.0
index_summary: >-
  Tarea mecánica + determinista + verificable → generar y ejecutar script, no procesar ítem por ítem. Nunca en el sitio sobre un original. Los pasos del método que se repiten entre sesiones o tienen que salir idénticos también van con script, común en `general/comun/scripts/`.
---

Cuando una tarea es **mecánica, repetitiva y procesable de forma determinista**, suele ser más eficiente que la IA **genere un script** que ejecute la tarea, en lugar de procesar ítem por ítem cargando contexto completo en cada paso.

## Cuándo aplicar (las tres condiciones)

1. **Mecánica y repetitiva** — misma operación sobre múltiples ítems.
2. **Determinista** — la transformación de cada ítem es predecible, no requiere juicio caso por caso.
3. **Verificable** — el resultado se comprueba con un comando, un recuento o una suma.

Ejemplos domésticos: renombrar 200 escaneos a `AAAA-MM-DD-<concepto>.pdf` según su fecha · extraer los importes y las fechas de 40 facturas a una tabla · comprobar que cada anexo citado en un escrito existe como fichero · sumar una columna de un listado y cotejarla con el total declarado · convertir un lote de `.md` a PDF (ver [tooling de documentos](../tooling-documentos.md)).

## Cuándo NO aplicar

- La tarea requiere **juicio contextual** ítem por ítem (¿este gasto es deducible?, ¿esta cláusula es abusiva?).
- **Volumen pequeño** (< 5-10 ítems): el trabajo de escribir el script supera el beneficio. Este umbral no vale para los pasos del método que se repiten en cada sesión (ver abajo).
- La salida es **difícil de verificar** (reformulaciones de sentido, resúmenes).

## Pasos del método que se repiten: script común

Lo repetitivo y determinista del propio método (el relevo, el tablero, el DoD, el verificador) se hace con un script y no con pasos del modelo: ahorra contexto y sale siempre igual.

- **Criterio:** el paso se repite entre sesiones o tiene que salir idéntico. No cuenta el volumen de ítems.
- **Quién lo propone:** el planificador, en la tabla de tandas, como tanda propia que escribe el script y lo prueba, con un modo de prueba y su rojo visto ([[ciclo_de_tandas]]).
- **Dónde viven:** los comunes, en `general/comun/scripts/`: los escribe el general y los asuntos los leen y los ejecutan, sin copiarlos. El script de un asunto vive en su contenedor.
- **Forma:** Node `.mjs` sin dependencias, con `--ayuda`, códigos de salida documentados, sin rutas de máquina y con salida corta.

## Flujo

1. La IA analiza la superficie del problema (lee, lista, identifica el patrón).
2. Propone el script (shell, Node o Python según el entorno).
3. El coordinador o el director hace *sanity check* del script — **especialmente si borra o sobrescribe**.
4. Se ejecuta (idealmente en un subagente barato — ver [[modelo_por_tarea]]), **primero en seco** sobre una copia o con modo de prueba si toca originales.
5. **Verificación empírica** del resultado ([[verificacion_e2e_por_agente]]).
6. **Temporal por defecto** (KISS): se descarta tras verificar. Persistente en `general/comun/scripts/` si es común, o en el contenedor del asunto si es suyo, solo con caso de uso recurrente claro ([[adopcion_tooling_externo_caso_uso_concreto]]).

**Regla dura sobre originales:** un script **nunca** modifica en el sitio el único ejemplar de un documento recibido. Trabaja sobre copia, o produce ficheros nuevos.

Relacionada: [[modelo_por_tarea]], [[verificacion_e2e_por_agente]], [[adopcion_tooling_externo_caso_uso_concreto]].

> Pieza de catálogo `general/comun/doctrinas/`. v2.0 (2026-10-05): sección "Pasos del método que se repiten: script común" y bucket `general/comun/scripts/`. v1.0 (2026-06-05). Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente.
> Adaptada al enfoque neutro de la plantilla (sin referencias al dominio del software) — 2026-07-29.
