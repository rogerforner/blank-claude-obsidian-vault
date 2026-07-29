---
name: Infraestructura en región europea, matizada por exposición a datos personales
description: Región EU obligatoria para servicios que procesan input no controlable del usuario (puede contener datos personales); EU deseable pero no bloqueante para servicios con input controlado por construcción donde un mecanismo garantiza la ausencia de datos personales por diseño.
type: doctrine
version: 1.0
---

La elección de región de infraestructura/proveedores se **matiza por la superficie de exposición a datos personales**. No es una regla absoluta, sino una distinción honesta sobre dónde aplica realmente el riesgo.

## Categoría 1 — Input NO controlable del usuario final → región EU OBLIGATORIA

Servicios que reciben texto libre del usuario final, donde **no se puede impedir a nivel de plataforma** que circulen datos personales reales (chat, ingesta de documentos del cliente, cualquier endpoint con input libre).

→ **EU estricto, sin excepciones.** Si un proveedor no tiene región EU, no se usa; escalar al director si es un componente crítico.

## Categoría 2 — Input CONTROLADO por construcción → región EU DESEABLE, no bloqueante

Servicios donde **no hay datos personales posibles por diseño**: porque un mecanismo de anonimización/placeholders garantiza su ausencia antes de salir del entorno controlado, o porque el input lo controla el propio equipo (corpus público, textos técnicos fijos).

→ **EU se prioriza** si existe sin coste ni pérdida técnica significativa. Si la única opción viable es otra región, se acepta **documentando la decisión** — porque no hay datos que proteger.

## Principio de fondo

Cuando **puede circular un dato personal** (aunque sea por mal uso del usuario), EU-strict refleja el compromiso del producto. Cuando un diseño **garantiza su ausencia**, la región se elige por criterios operativos (disponibilidad, latencia, coste). La distinción **no es laxitud**: es honestidad sobre dónde aplica el riesgo.

## Regla operativa

1. **Clasificar primero la categoría** (1 input no controlable / 2 input controlado).
2. Categoría 1 → EU-strict; sin EU disponible → escalar con alternativas reales.
3. Categoría 2 → EU preferido; si no disponible, usar alternativa **documentando** la decisión.
4. **Ante duda sobre la categorización → escalar al director, no extrapolar** (requiere conocer el contrato de uso del servicio).

Relacionada: [[licencias_permisivas_estrictas]], [[prohibido_uso_herramientas_github_excepto_commits_push]], [[sensitive_file_guard]] (los datos personales viven en el vault pero **no salen de la máquina**: aquí se decide qué pasa cuando algo sí tiene que salir a un servicio).

> Pieza de catálogo `general/comun/packs/codigo/doctrinas/`. v1.0 (2026-06-05). Se instala por copia en `asuntos/<asunto>/memoria/`; no se hereda.

> Adaptada al esqueleto del seed (`asuntos/<asunto>/`) conservando el vocabulario técnico: el framing neutro del seed aplica al core, no a este pack — 2026-07-29. Cambios del traslado: "proyecto" pasa a "asunto" como unidad. Nota de alcance: esta doctrina decide **región de infraestructura de un servicio que se despliega**, por eso está en el pack; la regla general del seed —los datos personales viven en el vault y **no salen de la máquina**— es del core ([[sensitive_file_guard]]) y no depende de este pack. Las dos categorías se conservan íntegras.
