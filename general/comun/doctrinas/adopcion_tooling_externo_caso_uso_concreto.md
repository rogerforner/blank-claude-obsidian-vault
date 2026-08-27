---
name: Adopción de tooling externo requiere caso de uso concreto
description: Antes de adoptar cualquier herramienta externa nueva, exigir un caso de uso concreto YA presente (no especulativo) y validar cinco criterios; aplica también a estructuras internas preventivas. Verificar disponibilidad y condiciones de uso de los recursos externos al inicio de cada tanda.
type: doctrine
version: 1.1
index_summary: >-
  Caso de uso concreto YA + 5 criterios + piloto; aplica a estructuras internas preventivas; verificar disponibilidad y condiciones de uso de los recursos externos al inicio. **"Es barato" NO es un caso de uso** —sin dolor concreto, umbral escrito y a esperar—; **una verificación que no bloquea es una opinión con formato de informe**, así que antes de comprar una garantía mira si detiene algo; y **describir el método de memoria en el encargo hace que la investigación proponga construir lo que ya existe**.
---

Antes de instalar cualquier herramienta externa nueva, exigir un **caso de uso concreto YA presente**, no especulativo. Las adopciones preventivas "porque suena bien" terminan revertidas tras invertir tiempo en instalación y diagnóstico.

## Los cinco criterios

1. **Caso de uso concreto YA presente.** Una necesidad real identificable hoy, no "podría ser útil cuando…". Si la justificación es condicional o futurista, aparcar.
2. **Coste de mantenimiento conocido y aceptable.** ¿Quién la actualiza? ¿Funciona en la máquina del director sin parches manuales? Incógnitas no resueltas → no adoptar.
3. **Prueba piloto antes de la integración completa.** Probar el valor real de forma aislada —sobre un documento, no sobre los cien— antes de tocar settings, hooks o la estructura del vault.
4. **Reversibilidad documentada.** Si desinstalarla es complejo o deja el vault dependiendo de ella (formatos propietarios, base de datos propia), elevar el listón.
5. **El director confirma el CASO DE USO, no solo la herramienta.** "Instala X" no equivale a "tengo un caso de uso concreto para X". El coordinador ayuda a distinguir adopción reflexiva de impulsiva.

## Estructuras internas también

El principio se extiende a **estructuras preventivas internas**: carpetas, plantillas, taxonomías y convenciones "por si acaso" sin ningún asunto real que las use. Antes de aprobar una estructura transversal, preguntar: *"¿qué problema real existe HOY que esto resuelve?"*. Si la respuesta es "previene problemas futuros hipotéticos", aparcar. *(Por eso los buckets del catálogo se crean cuando hay una pieza real que colocar, no vacíos.)*

## Excepciones

No aplica a: la **mecánica imprescindible** (git, el editor de textos, el escáner), ni a herramientas **ya en el flujo** del director.

**El agente que ejecuta el trabajo NO está exento**, aunque lo parezca por ser la herramienta con la que se trabaja a diario: es una **dependencia sustituible**, se mide y no se deduce, y el que está en uso se declara con su versión. Eximirlo fue un punto ciego real de esta doctrina: dejaba sin criterio justo la pieza que más condiciona el método.

## Recursos externos (formularios, plantillas oficiales, tablas, modelos de IA)

Son recursos controlados por terceros que pueden **desaparecer, cambiar de versión o cambiar sus condiciones de uso sin aviso**. Cualquier tanda que dependa de uno **verifica al inicio**: (a) disponibilidad (la página responde y el contenido es legible), (b) **condiciones de uso verbatim** (ausencia de licencia o de aviso legal = todos los derechos reservados; ojo con reutilizar tablas y formularios), (c) versión/fecha para reproducibilidad —un modelo de impreso caducado invalida una presentación—, (d) **Plan B** documentado. Si la verificación falla, escalar — no improvisar un sustituto.

Relacionada: [[cuestionar_premisas_arquitectonicas_antes_deep_research]], [[revision_periodica_forma_de_trabajo]], [[vigilancia_tecnologica_bajo_demanda]], [[verificacion_fuente_primaria]].

*(Los criterios de licencia para código —contagio copyleft, restricción anti-SaaS— viven en el pack `codigo/` → [[licencias_permisivas_estrictas]].)*

## "Es barato" no es un caso de uso, y una verificación que no bloquea no es una verificación

Dos trampas de adopción que aparecieron el mismo día (2026-08-27) evaluando una familia entera de herramientas, y que valen para cualquier candidato:

- **El coste bajo no sustituye al primer filtro.** Una propuesta puede ser una convención de redacción que no cuesta nada instalar, y **seguir sin tener un trabajo que hoy duela**. Adoptarla porque es barata es exactamente como se llena un kit de piezas que nadie usa: **cada una fue barata, y el conjunto pesa**. Si no hay dolor concreto, **umbral escrito y a esperar**: *"si pasa X dos veces, se pilota"*.
- **Antes de comprar una garantía, mira si de verdad detiene algo.** Se evaluaron tres herramientas cuya bandera era "verifica que el trabajo cumple la especificación", y **las tres eran un modelo emitiendo un informe consultivo que no para el proceso**. Lo único determinista que traían validaba **la estructura del documento**, no su cumplimiento. **Una verificación que no bloquea es una opinión con formato de informe**, y adoptarla por su verificación es comprar una ilusión de garantía. → [[definition_of_done]]

**Y la trampa del que encarga, que es la más cara porque no se ve:** si el encargo describe el método **de memoria** en vez de leerlo, **la investigación propondrá construir lo que ya existe** — y volverá una recomendación madura y bien argumentada para una pieza que llevas meses usando. Pasó con dos de tres propuestas de un informe. **El informe no se equivocó: el encargo no se lo había contado.**

> Pieza de catálogo `general/comun/doctrinas/`. **v1.1 (2026-08-27): dos trampas de adopción vistas evaluando una familia entera de herramientas, y una tercera que es del que encarga.** *(a)* **"Es barato" no es un caso de uso**: una convención que no cuesta nada instalar sigue sin tener un trabajo que hoy duela, y así es como un kit se llena de piezas que nadie usa — sin dolor concreto, **umbral escrito y a esperar**. *(b)* **Antes de comprar una garantía, mira si detiene algo**: tres herramientas cuya bandera era verificar el cumplimiento resultaron ser un modelo emitiendo un informe consultivo; lo único determinista validaba la **estructura** del documento, no su cumplimiento. **Una verificación que no bloquea es una opinión con formato de informe.** *(c)* Y la del encargo: **describir el método de memoria hace que la investigación proponga construir lo que ya existe** — pasó con dos de tres propuestas, y el informe no se equivocó, el encargo no se lo había contado. v1.0 (2026-06-05). Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente.
> Adaptada al enfoque neutro de la plantilla (sin referencias al dominio del software) — 2026-07-29.
