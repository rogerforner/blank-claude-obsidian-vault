# Brief para el chat web — {{TÍTULO}}

> **Plantilla.** Brief de investigación sobre la **forma de trabajar** del vault (un modelo nuevo, una herramienta, un método, un cambio en las herramientas que ya usamos). Rellena los `{{…}}`, **borra este bloque** y guarda el brief aquí, en `_meta/`. Vuelve como `{{nombre}}-informe.md` al lado, y lo que se decida se funde en el kit. Cuando el brief ya tiene su informe, **el brief se borra** ([[convencion_organizacion_carpeta_trabajo]]).
>
> **Dónde se ejecuta: en el CHAT WEB, no aquí.** La investigación abierta —muchas fuentes, mucha lectura, mucho descarte— es exactamente lo que **no** debe correr en una sesión de coordinación ni en subagentes: quema el contexto que hace falta para decidir, y lo que se necesita de vuelta es un **informe**, no la búsqueda entera ([[orquestacion_sesiones_por_herramienta]], [[higiene_contexto_y_tokens]]). Para lo que sí toca a un asunto concreto, usa `inicializador/plantilla-brief-deep-research.md`.
>
> ⚠ **Frontera de soberanía — inviolable.** El chat web corre **fuera de esta máquina**. Un brief **no lleva datos personales, ni documentos de ningún asunto, ni nombres de terceros, ni importes identificables**: se pregunta en abstracto. Si la pregunta no se puede formular sin el dato, **no va al chat web**: se resuelve en local ([[sensitive_file_guard]]).

## Para qué

{{Objetivo en dos o tres líneas: qué decisión sobre la forma de trabajar fundamenta. La investigación **no decide**; aporta la base para que el director decida.}}

## Contexto verificado (para que no se re-derive)

{{Lo que ya está confirmado y no hace falta investigar: qué herramientas se usan hoy, qué se descartó y por qué, qué restricción no se va a levantar. Marca explícitamente lo que es "a confirmar" — si va sin marcar, volverá dado por bueno.}}

## Restricciones duras (inviolables)

- **Nada de datos del vault en el chat web** (ver el aviso de arriba). Esta restricción **gana sobre la utilidad** del resultado.
- **Solo cuenta lo que entra en la suscripción**: nada que exija una clave de programador, una cuenta de pago aparte ni facturación por consumo.
- **Herramientas locales preferentes**: lo que resuelve algo sin salir de la máquina gana a lo que obliga a subir un documento a un servicio ajeno, aunque el segundo sea más cómodo.
- **Git local, sin nube:** ninguna propuesta que dé por supuesto un servicio de alojamiento en línea o una integración automática con servicios externos.
- **Sin rutas absolutas de máquina** en nada de lo que se proponga versionar.
- **Cita con fecha y versión.** Lo que cambia rápido (modelos, límites de uso, precios, nombres de opciones de configuración) caduca: un hallazgo sin fecha no es un hallazgo ([[verificacion_fuente_primaria]]).

## El gate: investigar ≠ adoptar

**Que algo exista, funcione y esté bien no es razón para meterlo en el vault.** Todo candidato pasa el gate de adopción antes de entrar ([[adopcion_tooling_externo_caso_uso_concreto]]):

1. **Caso de uso concreto YA** — un trabajo real que hoy duele, no uno hipotético para dentro de un año. Sin esto, se descarta sin más análisis.
2. **Qué sustituye o simplifica** — si se suma a lo que ya hay sin quitar nada, el coste de mantenimiento sube y la ganancia es dudosa.
3. **Soberanía del dato** — dónde vive lo que se le entrega y qué se hace con ello.
4. **Condiciones de uso verbatim** y **coste real** — incluido el coste de aprenderlo y el de abandonarlo.
5. **Piloto acotado y reversible** antes de adoptarlo de verdad, con un criterio de éxito escrito **antes** de empezar.

Y antes de todo eso: **cuestiona la premisa** ([[cuestionar_premisas_arquitectonicas_antes_deep_research]]). ¿Hace falta la herramienta, o basta con lo que ya hay en la máquina y un poco de convención? ¿Se resuelve más simple, más barato o más soberano?

## Enfoque (cómo SÍ)

Busca **cómo encaja dentro de las restricciones**: pasos concretos, procedimientos reproducibles, evidencia real de que alguien lo ha hecho. **No** busques razones para descartarlo de entrada. Si algo no encaja, dilo con la **condición exacta** que lo bloquea, no con un "no se puede" genérico — porque esa condición puede cambiar, y entonces habrá que saber cuál era.

## Preguntas a investigar

### A. {{Bloque temático 1}}

1. {{pregunta concreta, respondible con evidencia}}
2. {{…}}

### B. {{Bloque temático 2}}

{{…}}

*Preguntas **cerradas y verificables**. "¿Qué opinas de X?" vuelve como ensayo; "¿qué límite tiene X en el plan que tenemos, medido cuándo y dónde lo dice?" vuelve como dato.*

## Fuentes a cubrir (no ceñirse a una)

{{La fuente oficial primero —la documentación del fabricante, el organismo, el boletín—; después comunidad, pero solo con **método reproducible**. **Una cita por hallazgo, con fecha.** Un resumen de tercero no sustituye a la fuente ([[verificacion_fuente_primaria]]).}}

## Entregable

Informe en `_meta/{{nombre}}-informe.md` con:

- **Resumen ejecutivo** — qué cambia y qué no, en diez líneas.
- **Hallazgos por pregunta**, cada uno con su cita y su fecha.
- **Banderas rojas** — lo que desaconseja adoptarlo, dicho claro.
- **Un veredicto por opción evaluada**: adelante / no / piloto acotado, **con la condición que lo decide**.
- **Qué habría que cambiar en el kit** si se adopta: qué doctrina, qué plantilla, qué checklist. Si no se puede nombrar el fichero, la propuesta no está madura.

Después, el coordinador **sintetiza y funde** lo aceptado: sube la `version` de la doctrina afectada, actualiza el índice **en el mismo commit** y anota en `_meta/bitacora.md` el aprendizaje y el cambio aplicado ([[mejora_continua_del_kit]], [[vigilancia_tecnologica_bajo_demanda]]).
