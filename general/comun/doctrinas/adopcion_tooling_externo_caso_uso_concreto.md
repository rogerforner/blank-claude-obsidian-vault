---
name: Adopción de tooling externo requiere caso de uso concreto
description: Antes de adoptar cualquier herramienta externa nueva, exigir un caso de uso concreto YA presente (no especulativo) y validar cinco criterios; aplica también a estructuras internas preventivas. Verificar disponibilidad y condiciones de uso de los recursos externos al inicio de cada tanda.
type: doctrine
version: 1.0
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

No aplica a: la **mecánica imprescindible** (git, el propio Claude Code, el editor de textos, el escáner), ni a herramientas **ya en el flujo** del director.

## Recursos externos (formularios, plantillas oficiales, tablas, modelos de IA)

Son recursos controlados por terceros que pueden **desaparecer, cambiar de versión o cambiar sus condiciones de uso sin aviso**. Cualquier tanda que dependa de uno **verifica al inicio**: (a) disponibilidad (la página responde y el contenido es legible), (b) **condiciones de uso verbatim** (ausencia de licencia o de aviso legal = todos los derechos reservados; ojo con reutilizar tablas y formularios), (c) versión/fecha para reproducibilidad —un modelo de impreso caducado invalida una presentación—, (d) **Plan B** documentado. Si la verificación falla, escalar — no improvisar un sustituto.

Relacionada: [[cuestionar_premisas_arquitectonicas_antes_deep_research]], [[revision_periodica_forma_de_trabajo]], [[vigilancia_tecnologica_bajo_demanda]], [[verificacion_fuente_primaria]].

*(Los criterios de licencia para código —contagio copyleft, restricción anti-SaaS— viven en el pack `codigo/` → [[licencias_permisivas_estrictas]].)*

> Pieza de catálogo `general/comun/doctrinas/`. v1.0 (2026-06-05). Se instala por copia en `asuntos/<asunto>/memoria/`; no se hereda.
> Adaptada al framing neutro del seed (sin referencias al dominio del software) — 2026-07-29.
