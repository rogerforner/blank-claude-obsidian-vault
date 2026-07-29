# Checklist de arranque de un coordinador de asunto

Pasos para inicializar la coordinación de un asunto nuevo. Lo hace el director junto al coordinador general del vault (o un coordinador que parta de este checklist). El fin: que quien retome el asunto dentro de seis meses —el director, una sesión nueva, o alguien de la familia— **parta de la misma base, con todo documentado**.

## 1. Crear el contenedor

- Copia `inicializador/plantilla-contenedor-asunto/` a `asuntos/<asunto>/`.
- **`<asunto>` = nombre corto y estable del asunto** (`reclamacion-agua-2026`, `obra-cocina`, `renta-2025`, `alquiler-local`). El slug es el nombre de la carpeta y no se cambia después: hay enlaces relativos que dependen de él.
- La estructura del contenedor (qué va en cada sitio, un settings por rol de sesión) sigue [estructura_contenedor_asunto](../general/comun/doctrinas/estructura_contenedor_asunto.md) — uniforme en todos los asuntos.
- El contenedor trae un **`CLAUDE.md` auto-cargado** (reglas siempre-activas del coordinador: higiene y borrado, git local, orquestación, verificación…). Parametriza `{{ASUNTO}}`/`{{SLUG}}`/`{{PERFIL}}` igual que en el charter. Es el mecanismo que garantiza que el coordinador cumpla las doctrinas en cada sesión, sin depender de que alguien se lo recuerde.

## 2. Traer los papeles del asunto

- Trae a `asuntos/<asunto>/docs/` el material que ya existe: escaneos, resoluciones, contratos, facturas, presupuestos, correos relevantes convertidos a texto, la hoja de cálculo donde llevabas las cuentas.
- **Los originales son intocables**: se guardan tal como llegaron y no se editan, no se regeneran, no se "mejoran". Si hay que trabajar sobre uno, se trabaja sobre copia.
- Si el asunto ya venía en marcha con material voluminoso o sensible, **no lo copies a ciegas**: pasa antes por [checklist-migracion-existentes.md](checklist-migracion-existentes.md), que trae el reconocimiento previo y el **gate de confidencialidad**.
- Si el material está en papel o en PDF escaneado, la transcripción va con **tooling local** ([tooling-documentos](../general/comun/tooling-documentos.md)): nada de conversores web, porque estos papeles llevan datos personales.

## 3. Redactar el charter

- Desde `inicializador/plantilla-charter-coordinador.md`: sustituye `{{ASUNTO}}`, `{{SLUG}}`, `{{MATERIA}}` y `{{PERFIL}}` (sin rutas absolutas; las rutas de la máquina —la carpeta del escáner, la unidad de copias— van en `settings.local.json`).
- Rellena **Estado actual**, **Mandato inicial**, **Plazos** y **Decisiones abiertas** con la realidad del asunto. El mandato inicial empieza por **entender el expediente** (reconocimiento y cronología) antes de proponer nada — y ese reconocimiento inicial **lo hace un subagente de solo lectura**, que devuelve un resumen y preserva el contexto del coordinador.
- **Los plazos van al charter y a la cola, con fecha.** Es la diferencia más grande respecto a un asunto sin terceros: un plazo perdido no se recupera con más trabajo.

## 4. Fijar el `.claude/settings.json` de aislamiento

- Copia `inicializador/plantilla-settings-coordinador.json` → `asuntos/<asunto>/.claude/settings.json`. Ya es **portable**: apunta al catálogo con ruta relativa (`../../general`) y no lleva ninguna ruta de máquina que sustituir.
- Crea tu **`asuntos/<asunto>/.claude/settings.local.json`** (gitignored) con las **rutas de esta máquina** que el asunto necesite en `additionalDirectories` (la carpeta donde el escáner deja los PDF, la unidad externa de copias). Distintas por máquina, no se versionan. Plantilla en [plantilla-settings-coordinador.NOTAS.md](plantilla-settings-coordinador.NOTAS.md).
- **Verifica el aislamiento antes de fiarte de él:** que el coordinador escribe en su contenedor, que lee `general/` pero **no puede escribirlo**, y que no anda por otros asuntos. Los caveats conocidos (el deny por ruta relativa no funciona en Windows; la invisibilidad entre asuntos hermanos es blanda) están en las NOTAS. Compruébalo, no lo supongas.

## 5. Evaluar e instalar herramientas + doctrinas

- Sigue [guia-eleccion-tooling.md](guia-eleccion-tooling.md): inventaría lo disponible y las piezas del catálogo `general/` aplicables a este asunto; aplica los cinco criterios de adopción; instala solo lo aplicable.
- **Instala las doctrinas** por **copia** en `asuntos/<asunto>/memoria/`, registrando su `version`. No se heredan: la copia es un snapshot ([`general/comun/README.md`](../general/comun/README.md)).
- **Baseline a instalar siempre:** perfil de modelos ([[modelo_por_tarea]]), higiene de contexto ([[higiene_contexto_y_tokens]]), estructura del contenedor ([[estructura_contenedor_asunto]]) y verificación por el agente ([[verificacion_e2e_por_agente]]). Si el asunto lleva tablero, con el plugin **Bases** de Obsidian (nota-por-tarjeta), no con una aplicación de base de datos propietaria.

## 6. Fijar cómo se comprueba el material y qué se entrega fuera

- **Comprueba pronto que el material se puede trabajar de verdad**: que los escaneos son legibles y están completos (no falta la página 3), que el PDF abre, que la hoja de cálculo cuadra con los justificantes, que las fechas de los sellos son las que crees. Un escaneo ilegible o un lote incompleto **condiciona todo lo demás**, igual que un plazo mal apuntado. La comprobación va en un **prompt para una sesión ejecutora** (coordinar ≠ ejecutar: no la corres tú ni con subagentes); si algo no cuadra, se reporta como **hallazgo** y sube a lo primero de la cola.
- **Declara qué se entrega fuera y a quién**: correo, registro, gestoría, aseguradora, organismo. Toda entrega fuera es **puerta humana** — el agente prepara el envío y para ahí. Deja escrito en el charter quién firma, por qué canal se presenta y qué acuse hay que guardar.
- **Git local:** un commit por hito con mensaje que se entienda dentro de un año, sin coautoría de la IA ([[sin_coautor_commits]]). No hay destino fuera de esta máquina; el histórico es tuyo y de nadie más.

## 6-bis. Declarar el perfil del asunto y poner las verificaciones (día 1)

Que el asunto **nazca con las comprobaciones puestas** es mucho más barato que añadirlas cuando ya hay veinte documentos y un plazo encima.

- **Declara el perfil** en el charter. Cuatro perfiles, y de cada uno hereda qué es bloqueante:
  - **trámite con terceros** — manda el **plazo** y el **registro de entrada/salida**; nada se da por presentado sin acuse.
  - **obra o proyecto propio** — manda el **producto entregable** (el plano, el presupuesto, la memoria) y su cotejo con la realidad medida.
  - **seguimiento periódico** — manda la **cadencia** y que las cifras cuadren periodo a periodo (cuentas, mantenimiento, renovaciones).
  - **asunto con software** — el asunto incluye software propio; ver el paso condicional de abajo.
- **La criticidad gobierna.** No impongas la batería completa a un asunto que no la justifica: una renovación de seguro no necesita el aparato de una reclamación con plazo judicial.
- **Escribe las verificaciones como comandos, no como intenciones.** Lo que se puede comprobar por comando lo ejecuta el agente y **reporta el output literal**: recuento de ficheros del lote, suma de una columna cotejada contra el total escrito, número de páginas del PDF generado, que cada anexo citado existe como fichero, que ningún enlace interno está colgado ([[verificacion_e2e_por_agente]], [[scripts_adhoc_tareas_repetitivas]]).
- **Lo que no se puede comprobar por comando no desaparece del criterio de cierre: se convierte en comprobación en campo** con procedimiento escrito — medir la estancia, cotejar contra el original en papel, entrar en la sede electrónica con certificado, llamar al organismo, confirmar que el envío llegó. El agente entrega los **pasos exactos** y **qué resultado esperar**; el director la ejecuta y la reporta. **Documentada, nunca dada por hecha.**
- **Antes de versionar material entrante, escanéalo** buscando lo que no debe quedar en el histórico (paso 1 de [checklist-migracion-existentes.md](checklist-migracion-existentes.md)). Que el git sea local no elimina el paso: el histórico también se lleva en la copia de seguridad y en el disco que se presta.
- **Paso condicional — solo si el perfil es `asunto con software`:** instala el pack `codigo/` (`general/comun/packs/codigo/`), que trae las nueve doctrinas de software y la plantilla del README del repositorio. Ese pack es donde viven las puertas de calidad mecánicas —hooks de formateo y comprobación por fichero tocado, script de cierre con exit 2, pre-commit con detección de secretos, umbrales protegidos— y el ciclo de vida de un repositorio ([[gates_de_calidad_locales]], [[estrategia_de_pruebas_por_tipo_de_proyecto]], [[prohibido_uso_herramientas_github_excepto_commits_push]], [[licencias_permisivas_estrictas]]). **En cualquier otro perfil no instales el pack**: el equivalente de la puerta de calidad es la **verificación en campo** que ya cubre [[verificacion_e2e_por_agente]], y el core no queda cojo sin el pack.
- **En un asunto que ya viene en marcha, en este orden:** (a) lo barato y no bloqueante primero —inventario del material, cronología, detección de datos que no deben versionarse—; (b) **congela el estado** tal como está para no perderlo; (c) sube el listón **comprobación a comprobación**. Nunca de golpe.

## 7. Lanzar el coordinador y saludar

- El director lanza la sesión de Claude Code con **cwd en `asuntos/<asunto>/`**, sin el flag de permisos amplios salvo que la tanda toque masivamente `.claude/` o los hooks ([[sensitive_file_guard]]).
- El coordinador lee el charter + las doctrinas instaladas y **saluda** con su plan de arranque.
- **(Opcional) Sesión consultor de solo lectura:** si el asunto se beneficia de consultas paralelas sin gastar el contexto del coordinador, instálala desde [plantilla-consultor.md](plantilla-consultor.md) + [plantilla-settings-consultor.json](plantilla-settings-consultor.json) ([[sesion_consultor_paralelo]], [[estructura_contenedor_asunto]]).
- Modelo de trabajo tras el arranque: **coordina, no ejecuta** — todo trabajo que escriba o transforme material del asunto va en **prompts para sesiones ejecutoras** (los subagentes del coordinador, solo lectura); ejecutar en la sesión del coordinador le agota el contexto ([[orquestacion_sesiones_por_herramienta]]).

## Al cerrar el arranque

Anota en `_meta/bitacora.md` lo que falló o mejoró en estos pasos y **fúndelo aquí**: el checklist es lo que mejora arranque a arranque, no la anécdota ([[mejora_continua_del_kit]]).

## Lo que no aplica en un vault de asuntos (retirado a propósito)

Para que la próxima regeneración no lo reintroduzca por descuido:

- **La alineación del repositorio de código** (su README, sus reglas, su `CLAUDE.md`) y el ciclo de ramas y promoción **no están en este checklist**: solo aplican al perfil `asunto con software` y viven en el pack `codigo/`.
- **La referencia a un estudio interno del kit** que sostenía el paso de las puertas de calidad se ha retirado: los estudios no viajan en el seed. El argumento se conserva aquí en el cuerpo (poner las comprobaciones el día 1 sale más barato que añadirlas después); lo que no viaja es el anexo.
- **Un enlace a una nota de un stack concreto** (paridad de empaquetado en extensiones de navegador) se ha retirado: era específico de un producto de software y no tiene equivalente doméstico.
