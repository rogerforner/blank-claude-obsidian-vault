# Checklist de migración de un asunto que ya está en marcha

Para **traer al vault un asunto que ya existe**: papeles en carpetas del disco, una caja de escaneos, hilos de correo, hojas de cálculo sueltas, la carpeta que te pasó la gestoría, notas en el móvil. Complementa [checklist-arranque.md](checklist-arranque.md): este cubre lo **específico de traer lo ya existente**; los pasos comunes (contenedor, charter, settings, doctrinas, lanzar coordinador) se hacen igual que en el arranque.

> **Principio rector:** manda la **convención del vault** — el material entrante **se adapta** a la estructura uniforme, no al revés. Lo irrelevante se ignora; lo crítico a **NO perder es el estado del asunto y sus plazos** (vive en `cola-pendientes.md` + `coordinacion/`, no en `docs/`). Los **originales no se mueven de formato ni se editan**: se copian tal cual y se dejan en paz.

## Qué vive dónde (canónico) — resuélvelo ANTES de copiar

> La pregunta más recurrente de una migración. **Innegociable:** manda la convención del vault. Tabla canónica completa en [[estructura_contenedor_asunto]] § Qué vive dónde.

- **Documentación del asunto** (cronología, plazos, contactos, decisiones, guías de trámite, cálculos) → **canónica en el vault**, `asuntos/<asunto>/docs/`.
- **Coordinación** (charter, cola, handoffs, prompts, estudios) → **vault** (contenedor del asunto).
- **Originales recibidos y emitidos** (escaneos, resoluciones, acuses, facturas, contratos firmados) → `asuntos/<asunto>/docs/`, **inmutables**. Son prueba.
- **Material voluminoso que no es del asunto** (la carpeta entera de fotos del móvil, el volcado del correo, copias de seguridad) → **se queda fuera**. El vault recibe lo que sostiene el asunto, no todo lo que había al lado.
- **Valores sensibles y rutas de máquina** → nunca se versionan; van a ficheros gitignored o se quedan fuera.

**Regla de oro:** lo que se **decide o se redacta** es del vault y lo mantiene el coordinador; lo que se **recibió o se entregó** es intocable; **cada artefacto, un solo hogar** (no duplicar). Y **el documento real gana**: si una nota del vault diverge del papel firmado, se corrige la nota, no el papel (*trust-but-verify* → [[verificacion_fuente_primaria]]).

## 1. Reconocimiento de solo lectura del material (subagente) → inventario y clasificación

Lanza un **subagente de solo lectura** (preserva tu contexto) que **no toque nada** y devuelva un **inventario estructurado**:

- **Árbol real** de dónde está hoy el material y en qué formatos (PDF escaneado, DOCX, hoja de cálculo, imágenes de móvil, correos exportados).
- **Inventario de documentos** con propósito, fecha aparente y tamaño. Marca los **ilegibles o incompletos** — un escaneo al que le falta una página es un hallazgo, no un detalle.
- **Cronología provisional**: qué llegó cuándo y qué plazo abre cada cosa. Es lo que más se pierde en una migración y lo más caro de reconstruir.
- **Clasificación de cada fichero**:
  - **[ENTRA-AL-VAULT]** — sostiene el asunto: originales, decisiones, cálculos, cronología, contactos.
  - **[SE-QUEDA-FUERA]** — voluminoso o ajeno al asunto: volcados de correo completos, carpetas de fotos, copias de seguridad, duplicados.
  - **[NUNCA-VERSIONAR]** — credenciales, claves de firma, contraseñas apuntadas en un `.txt`, rutas de máquina, ficheros de configuración con valores reales.

### Puerta de confidencialidad — **la decisión de qué entra es del director, no tuya**

El material de un asunto doméstico trae, por definición, **datos personales y sensibles**: DNI y números de cuenta, nóminas y declaraciones, informes médicos, escrituras, y **datos de terceros** que no han decidido nada al respecto (el vecino, el arrendatario, el perito, un familiar). El vault es su sitio y no hay que anonimizarlo para trabajarlo ([[sensitive_file_guard]]) — pero **qué entra se decide, no se asume**:

- Márcalo **[CONFIDENCIAL → PUERTA DIRECTOR]** y **no lo copies** hasta su OK explícito. Ante duda, **en pausa**: deja solo un puntero (p. ej. `docs/medico/README.md` diciendo qué hay y dónde, sin el contenido).
- **Categorías que siempre pasan por la puerta:** salud, antecedentes, situación laboral o económica de un tercero, material de un procedimiento con abogado, y cualquier documento cuyo titular no sea el director.
- **"El git es local" NO autoriza por sí solo.** Reduce el riesgo de exposición, no lo elimina: el histórico viaja en la copia de seguridad, en el disco externo que se presta y en el portátil que se lleva de viaje. Y lo que entra al histórico **se queda** aunque después borres el fichero.
- **Datos de terceros:** entran porque hacen falta para el asunto, no para otra cosa; y al cerrar el asunto se conserva lo que la ley obliga y poco más ([[revision_periodica_forma_de_trabajo]]).
- Registra en `coordinacion/referencia/` **qué quedó fuera y por qué**. Un "esto no está porque el director decidió que no entra" ahorra que la siguiente sesión lo vuelva a proponer.

Guarda el inventario en `coordinacion/referencia/reconocimiento-<fecha>.md` (documento vivo; **no** lo borres) para que el coordinador del asunto no repita el reconocimiento.

## 2. Crear el contenedor estándar (= checklist-arranque pasos 1, 3, 4, 5)

- Contenedor `asuntos/<asunto>/` desde la plantilla; **slug = nombre corto y estable del asunto**. Aunque dos asuntos compartan protagonista o inmueble, **un contenedor estándar por asunto** ([[estructura_contenedor_asunto]]).
- Charter + `CLAUDE.md` + configuración del agente + `settings.local.json` (rutas de esta máquina, gitignored).
- Doctrinas baseline por copia, registrando su `version`. Si el asunto trae una casuística nueva para el catálogo, **generaliza la doctrina al catálogo** y luego instálala ([[mejora_continua_del_kit]]).

## 3. Traer la documentación (copiar al vault, adaptar)

- Copia los ficheros **[ENTRA-AL-VAULT]** a `docs/`, **espejando la estructura de carpetas de origen** cuando ya tenga sentido, para no romper referencias entre documentos. Si el asunto tiene varios frentes (la obra, el seguro, la comunidad), organiza `docs/` **por frente**.
- **Adapta** (puede diferirse a un bloque posterior, pero anótalo en la cola): arreglar referencias internas rotas; **quitar la narrativa histórica** de los documentos de consulta ([[docs_sin_fases]]); el estado y los pendientes **no van a `docs/`** sino a `cola-pendientes.md` + `coordinacion/`.
- **Transcribe lo escaneado** con tooling local ([tooling-documentos](../general/comun/tooling-documentos.md)); la transcripción es un documento nuevo que **se coteja con el original** antes de darlo por bueno, y el original no se toca.
- **Coordinación previa fuera del vault** (borradores, cálculos, la lista de pendientes que llevabas en una nota): tráela a `coordinacion/`/`estudios/`/`cola-pendientes.md` **preservando el estado y los plazos** — es lo crítico a no perder.

### 3.1 Reparar los enlaces internos — por script, y comprobado con un checker

Al mover el material, **los enlaces relativos se rompen por dos motivos a la vez**: el fichero cambia de nivel (`04_mantenimiento/investigaciones/` → `estudios/` sube uno) y además gana prefijo (`docs/`). Por eso **una sustitución global no vale**: el número de `../` correcto **depende de la profundidad de cada fichero**, así que la reparación se hace con un script que **recalcula el prefijo fichero a fichero** ([[scripts_adhoc_tareas_repetitivas]]), nunca a mano ni con un reemplazo único para todo el árbol.

- **Verifica con un checker de enlaces rotos, no a ojo.** Recorre los `.md` traídos, resuelve cada enlace relativo contra el árbol nuevo y lista los que no existen. **"Están todos reparados" sin checker es una afirmación, no un hecho**, y es el checker el que dice cuándo has terminado.
- **Las referencias al material podado se neutralizan a texto plano.** Una poda selectiva deja enlaces apuntando a lo que decidiste **no** traer. Se convierten en texto —el nombre del documento, sin enlace— para que se lea que existió y no parezca un enlace roto pendiente de arreglar.
- **Para cifrar cuánta deuda de enlaces hay, busca por el nombre de los ficheros podados contra el árbol ya traído.** No lo estimes ni lo delegues a un escaneo semántico: en la primera migración uno los contó en 25 cuando eran del orden de 39, porque su búsqueda no cubrió las secciones de referencias de todos los documentos.

### 3.2 Si el material trae convenciones documentales propias

Material que ya venía organizado con método (frontmatter, un nombrado propio de ficheros, plantillas de documento, un fichero de estado) trae **dos clases de reglas mezcladas**, y se separan:

- **Reglas de coordinación** (cómo se trabaja, quién decide, qué se verifica) → **se sustituyen** por el `CLAUDE.md` del kit y las doctrinas del catálogo. **No se vuelcan** al `CLAUDE.md` del contenedor, que es de coordinación y se mantiene corto.
- **Reglas de dominio** (frontmatter, nombrado, plantillas propias del tema) → **se conservan** en `docs/convenciones-dominio.md`, desde [plantilla-convenciones-dominio.md](plantilla-convenciones-dominio.md). Son valiosas y no las cubre el kit: perderlas obliga al coordinador a reinventar el criterio documento a documento.
- **El estado vivo** (pendientes, plazos, qué está en curso) → charter + `cola-pendientes.md`. Nunca se queda en `docs/`.

## 4. Cross-links si hay asuntos acoplados

- Define los vínculos en ambos sentidos (el asunto dependiente enlaza al que le da origen; el origen lista en su README los que lo consumen) con **rutas relativas**. Documenta el acoplamiento —importes que viajan de uno a otro, fechas que fijan plazos, un mismo perito o un mismo contrato— **citando el documento fuente, sin copiar la cifra**. Convención en [[estructura_contenedor_asunto]] § Cross-links.

## 5. Dejar ordenado el origen — **prompt para una sesión ejecutora** (no lo ejecutas tú)

Redacta el prompt (coordinar ≠ ejecutar) que: (1) deja en la carpeta de origen un **puntero al vault** por el nombre del vault, no por ruta absoluta, para que dentro de un año se sepa dónde está lo bueno; (2) **retira los duplicados** de lo ya traído, dejando los originales donde el director quiera conservarlos; (3) unifica nombres de fichero con fecha delante (`2026-03-14-resolucion.pdf`) para que ordenen solos.

**Antes de versionar nada — escaneo del material entrante.** Barato, y evita algo irreversible:

- Búsqueda de ficheros por nombre y extensión: `*.key`, `*.pem`, `*credenciales*`, `*contraseñas*`, `*.kdbx`, ficheros de configuración con valores reales.
- Búsqueda por contenido de los patrones que no deben quedar en el histórico: claves privadas (`BEGIN PRIVATE KEY`), tokens de servicios, y las contraseñas apuntadas a mano en un `.txt` o en la última página de un escaneo.
- Cotejo contra la lista **[NUNCA-VERSIONAR]** del paso 1 y contra los **[CONFIDENCIAL → PUERTA DIRECTOR]** sin OK.

Limpio = adelante. **Un hallazgo = te detienes** y lo sacas *antes* del primer commit; sacarlo después obliga a reescribir el histórico. Que el git sea local **no** elimina este paso.

## 6. Lanzar el coordinador propio (= checklist-arranque paso 7)

- El director lanza la sesión con cwd en `asuntos/<asunto>/`. El coordinador lee charter + doctrinas + el reconocimiento de `coordinacion/referencia/` y arranca por **fijar la cronología y los plazos** y **comprobar que el material se puede trabajar** (que los escaneos son legibles y completos, que las cifras cuadran con los justificantes). Lo que no pueda comprobar por comando lo entrega como **comprobación en campo** con procedimiento escrito ([[verificacion_e2e_por_agente]]). Material ilegible o plazo sin fecha = **hallazgo** prioritario.

## Mejora continua

Anota en [`../_meta/bitacora.md`](../_meta/bitacora.md) lo aprendido y fúndelo aquí ([[mejora_continua_del_kit]]).

## Lo que no aplica en un vault de asuntos (retirado a propósito)

- La comprobación de **si el destino era privado o público** —que antes se hacía sobre el alojamiento externo de un proyecto de software, para decidir si el material podía copiarse— se ha retirado: aquí no hay alojamiento externo. Lo que **sí se conserva** es su conclusión, que era la parte importante: *la privacidad del destino no autoriza por sí sola; la decisión es del director*.
- El reparto entre **operativos del código** (`.claude/`, `AGENTS.md`, manifiestos acoplados al código) y documentación de proyecto solo tiene sentido con software propio: vive en el pack `codigo/`.
