# Brief de investigación a fondo — {{TÍTULO}}

> Plantilla de **brief de investigación a fondo**. La investigación se ejecuta en el **chat web** (función de investigación profunda), **no con subagentes** ([[orquestacion_sesiones_por_herramienta]]). Rellena los `{{…}}` y **borra este bloque**. Vive en `asuntos/<asunto>/estudios/<tema>/`. Vuelve como `informe.md` y se condensa en `sintesis-decisiones.md`.
>
> **Frontera de soberanía — inviolable.** El chat web corre **fuera de esta máquina**. Un brief **no lleva datos personales, ni documentos del asunto, ni nombres de terceros, ni importes identificables**: se redacta en abstracto ("un seguro de hogar con cláusula de daños por agua", no la póliza con su número y su titular). Si la pregunta no se puede formular sin el dato, **no va al chat web**: se resuelve en local ([[sensitive_file_guard]]).

## Para qué

{{Objetivo en 2-3 líneas: qué decisión o mejora fundamenta. La investigación NO decide; aporta la base para que el director decida.}}

## Contexto verificado

{{Hechos ya confirmados —en abstracto— para que la investigación no los re-derive y se centre en lo abierto. Marca explícitamente lo que es "a confirmar".}}

## Restricciones duras (inviolables)

- **Nada de datos del asunto en el chat web** (ver el aviso de arriba). Esta restricción **gana sobre la utilidad** del resultado.
- **Solo cuenta la suscripción; NUNCA API** (ni de pago, ni claves, ni cuentas de terceros).
- **Herramientas locales preferentes**: lo que resuelve algo sin salir de la máquina gana a lo que obliga a subir un documento a un servicio ajeno.
- **Toda herramienta candidata pasa el gate de adopción** ([[adopcion_tooling_externo_caso_uso_concreto]]). Investigar ≠ adoptar.
- **Los recursos de terceros se verifican**: disponibilidad, **condiciones de uso verbatim** (sin aviso de licencia = todos los derechos reservados) y **versión con fecha** — un modelo de impreso caducado invalida una presentación.

*(Los criterios de licencia de software, de proveedor de alojamiento y de región de tratamiento viven en el pack `codigo/` y solo aplican si el asunto incluye software propio.)*

## Enfoque (cómo SÍ)

Busca **cómo encaja dentro de las restricciones** (pasos concretos, métodos reproducibles, evidencia real), **no** razones para descartarlo de entrada. Si algo no encaja, dilo con la **condición exacta** que lo bloquea, no con un "no se puede" genérico.

## Preguntas a investigar

### A. {{Bloque temático 1}}
1. {{pregunta concreta}}
2. {{…}}

### B. {{Bloque temático 2}}
{{…}}

## Cuestionar premisas

{{¿Se logra el objetivo de una forma más simple, más barata o más soberana? ¿Qué damos por sentado que conviene desafiar? ¿Hace falta la herramienta, o basta con lo que ya hay en la máquina? ([[cuestionar_premisas_arquitectonicas_antes_deep_research]])}}

## Fuentes a cubrir (no ceñirse a una)

{{Fuente oficial primero —el organismo, el boletín, la documentación del fabricante—; luego comunidad con **método reproducible**. **Citar la fuente por hallazgo**, con fecha. Una norma o un baremo se citan por su versión vigente, no por un resumen de tercero ([[verificacion_fuente_primaria]]).}}

## Entregable

Informe en `asuntos/<asunto>/estudios/<tema>/informe.md`: **resumen ejecutivo**, **hallazgos por pregunta con cita**, **recomendaciones accionables**, **banderas rojas**, y un **veredicto adelante / no / prueba piloto** por opción evaluada, con la condición que lo decide. Síntesis del coordinador en `sintesis-decisiones.md`.

*(La remisión a la carpeta de estudios del propio kit se ha retirado: los estudios del kit no viajan en el seed. Un brief sobre la forma de trabajar se guarda en `_meta/` del vault temático, donde su coordinador decida.)*
