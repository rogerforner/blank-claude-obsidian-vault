# Memoria — vault

Índice de memorias. Una línea por memoria; el contenido vive en su fichero.

- [Segundo proveedor de IA: interruptor](proveedor-secundario-ia.md) — **`PROVEEDOR_SECUNDARIO_IA = false`**: ninguna sesión lanza su CLI ni le manda nada. Qué habilita cada estado, qué NO cambia al girarlo, y los cuatro pasos para ponerlo en `true`.

*(Al nacer de la plantilla solo está la de arriba, que es método y viene puesta a propósito. Lo demás se puebla según el vault opera: cada memoria nueva añade aquí su línea en el mismo commit que crea su fichero.)*

## Convención

Un fichero markdown por memoria en este directorio, con frontmatter (`name`, `description`, `metadata: { node_type: memory, type: user|feedback|project|reference }`) y cuerpo con la regla o el hecho; cuando aplique, cierra con **Why:** (la razón o el incidente que lo motivó) y **How to apply:** (cuándo entra en juego). Los hechos duraderos sobre el director y sobre cómo trabajar van aquí; lo derivable del repositorio o del histórico de git, no.
