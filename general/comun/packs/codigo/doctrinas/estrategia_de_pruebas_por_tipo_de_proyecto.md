---
name: Estrategia de pruebas por tipo de proyecto
description: Qué garantías se exigen según el tipo de proyecto: greenfield estricto (todo bloqueante desde el día 1), legacy en contención (solo el código nuevo, con baseline que solo decrece; nunca tocar el legacy) e infra (contratos declarativos y smoke reproducible). La criticidad es la variable de gobierno: la batería completa solo donde el riesgo lo justifica. El humano revisa la ESPECIFICACIÓN (acceptance criteria, contratos, diffs de tests), no la implementación.
type: doctrine
version: 1.1
---

No todos los asuntos de software admiten las mismas garantías, y **exigir la batería completa en todos es tan dañino como no exigir nada** (frena el trabajo y genera gates que se acaban ignorando). La **criticidad es la variable de gobierno**. Esta doctrina fija **qué se exige a quién**; la mecánica de cómo se monta está en [[gates_de_calidad_locales]].

## El reparto de revisión (el humano sube una capa)

El modelo que hace viable **no leer la implementación** no es "gates en vez de humano", es **"el humano revisa la especificación, no el código"**:

| Artefacto | Lo escribe | Lo revisa el humano |
|---|---|---|
| Implementación | Agente | **No** (por diseño) |
| Unit tests | Agente | **No** — su garantía es el **mutation score** |
| **Acceptance criteria / contratos / schemas** | Agente | **SÍ** (rigor según criticidad) |
| **Diffs de tests, umbrales y config de gates** | Agente | **SÍ, siempre** ([[gates_de_calidad_locales]] §antifraude) |
| **Invariantes de producto** (p. ej. "la IA nunca ve PII real") | Agente | **SÍ** + gate bloqueante dedicado |
| Arquitectura / decisiones (ADR) | Agente propone | **SÍ** |
| Test manual / de campo | — | **SÍ**, periódicamente y en lo que no es automatizable |

> **Modelo adoptado (director, 2026-07-28).** Se adopta el **modelo matizado**: *no leer la implementación línea a línea, pero **sí** revisar arquitectura, contratos, acceptance criteria, diffs de tests/umbrales y los invariantes críticos*. La variante maximalista ("no revisar nada") **no está respaldada por la evidencia** y desplaza el modo de fallo a un acceptance test sutilmente equivocado que pase un *spot check*. **Límite explícito que se acepta:** los acceptance tests también los escribe el agente → el modelo **desplaza** el modo de fallo una capa arriba, no lo elimina; por eso revisar esa capa es lo que sostiene todo lo demás.

## Los tres perfiles

### 1. Greenfield estricto (patrón moderno, se puede exigir todo) — *p. ej. un servicio nuevo que se arranca desde cero*

Nace con las puertas puestas el **día 1**. **Bloqueante:** lint + typecheck · secretos · complejidad/tamaño · unit tests · **cobertura del diff** · reglas de arquitectura (fitness functions) · **contract tests** de la API (schema-driven) · **tests de seguridad/aislamiento** (authz, multi-tenant) · **invariantes de producto** · migraciones probadas · E2E/smoke rápido · **mutation score por módulo crítico** (con ratchet). **Informativo:** cobertura global, duplicación, property-based (bloqueante en módulos puros críticos), fuzzing (periódico).

### 2. Legacy en contención (no se puede cubrir; se contiene) — *p. ej. una aplicación heredada que ya está en producción y hay que seguir manteniendo*

**Principio: no tocar el legacy y que la deuda no crezca.** No hay cobertura retroactiva ni refactor masivo. **Bloqueante:** análisis estático **con baseline congelada** (bloquea solo regresiones **nuevas**) · secretos · **cobertura del diff solo en el código nuevo** · reglas de arquitectura que impidan que **lo nuevo herede lo viejo** (el módulo moderno no importa del núcleo legacy salvo por puertos declarados). **Informativo:** mutation score en lo nuevo, taint analysis de seguridad. **Tests de caracterización solo donde se toca.**

**Regla del ratchet:** la baseline **solo puede decrecer**; **nunca** la auto-actualiza el gate. Métrica de progreso = nº de entradas de la baseline bajando, **sin bloquear el trabajo diario**. Si el entorno de ejecución no es local (runtime/BD en la nube), los tests del código nuevo se escriben para **no requerir BD** (dobles de prueba) o contra un contenedor local equivalente.

### 3. Infraestructura (el producto es el stack) — *p. ej. un stack de contenedores de desarrollo que da servicio a los demás asuntos*

La garantía no es unitaria, es **contractual y reproducible**. **Bloqueante:** lint de ficheros de contenedor · **estado del contenedor como contrato declarativo** (puertos, procesos, ficheros, healthchecks) · **healthcheck como contrato** · **smoke automatizado** incluyendo **anti-regresión de configuración** (que sobreviva a un `--force-recreate`) · secretos. **Informativo:** tamaño máximo de imagen, mutation testing sobre la lógica crítica del servicio.

## Criterio de "hecho" por tarea (definition of done)

Una tarea está hecha cuando: **(1)** el script de definition-of-done pasa **en verde** al cerrar el turno (gate `Stop` con exit 2 si no) · **(2)** los **diffs de acceptance criteria y de config de gates** están revisados por el humano · **(3)** periódicamente, el **test manual/de campo** de lo no automatizable. Sin las tres, no está hecha.

## Día 1 de un asunto de software nuevo

1. **Declarar el perfil** (greenfield / legacy / infra) → hereda su columna de exigencias. **AVISO: el perfil describe el OBJETIVO, no el estado.** Escribirlo en el `CLAUDE.md` **no** implanta los gates: el siguiente que lo lea dará por implantado lo que solo está declarado, y actuará como si midiera algo que no mide. Mientras no existan, **dilo en el propio sitio** ("perfil infra; smoke pendiente") y trátalo como deuda con dueño. *(Caso real: un proyecto de infraestructura llevaba meses con el perfil descrito y **sin ningún smoke a nivel de stack**; se descubrió al necesitar dónde anclar una verificación nueva.)* → [[verificacion_fuente_primaria]]
2. Instalar los **hooks** (`PostToolUse` lint rápido · `Stop` → definition-of-done con exit 2).
3. **pre-commit**: detección de secretos + lint-staged + **guard antifraude** de tests.
4. Framework de test nativo del stack + **mutation testing** configurado con `break` bajo inicial.
5. **Fitness function** de arquitectura con las capas declaradas.
6. **Umbrales como config protegida** (el agente no la edita).
7. **ADR inicial**: "criterios de aprobación de este repositorio".

## Adopción en un asunto existente (sin frenarlo)

En este orden: **(a)** lo barato y no bloqueante (lint informativo, secretos) → **(b)** **baseline** para congelar la deuda → **(c)** subir a bloqueante **gate por gate**, con ratchet. **Nunca** meter mutation testing ni E2E como bloqueantes de golpe, y menos en legacy.

Relacionada: [[gates_de_calidad_locales]] (la mecánica), [[verificacion_e2e_por_agente]], [[no_push_por_subagentes]], [[rama_desarrollo_y_paso_a_produccion]], [[docs_sin_fases]] (los ADR describen estado, no historia), [[adopcion_tooling_externo_caso_uso_concreto]].

> Pieza de catálogo `general/comun/packs/codigo/doctrinas/`. **v1.1 (2026-08-01):** añadido que **el perfil describe el objetivo, no el estado** — declararlo en un `CLAUDE.md` no implanta los gates, y quien lo lea los dará por puestos; mientras no existan, se dice y se trata como deuda con dueño. v1.0 (2026-07-28), a partir de un estudio de deep research verificado (tesis de R. C. Martin verificada en su forma real, no en la versión simplificada). Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente. Las notas concretas por stack no viajan en el seed: se escriben en el propio asunto.

> Adaptada al esqueleto del seed (`asuntos/<asunto>/`) conservando el vocabulario técnico: el framing neutro del seed aplica al core, no a este pack — 2026-07-29. Cambios del traslado: la unidad pasa de `proyectos/<repo>/` a `asuntos/<asunto>/` (el asunto es el contenedor; el repositorio de código vive dentro); los tres perfiles conservan su ejemplo, pero **sustituido** por su equivalente genérico, porque los ejemplos originales nombraban asuntos reales del kit de origen y el seed no los lleva; y la remisión al estudio de origen se retira porque los estudios **no viajan en el seed** (la evidencia y el modelo adoptado se conservan íntegros en el cuerpo).
