# Vault coordinado — plantilla

Este es un **vault semilla**: la estructura, las reglas y las plantillas para llevar **asuntos de la vida real** coordinando al director con la IA, en la máquina del director y **sin nube**. No trae contenido de ningún asunto: trae el **método** y el **andamiaje**, listos para que copies la carpeta y empieces.

Un **asunto** es cualquier cosa que se lleva de principio a fin con papeles y decisiones detrás: una reclamación a una aseguradora, la obra de una cocina, la declaración anual, el alquiler de un local, el mantenimiento de la caldera, una herencia. Cada asunto vive en `asuntos/<asunto>/` con **la misma estructura**, de modo que quien lo retome dentro de seis meses —el director, una sesión nueva, alguien de la familia— encuentra las cosas donde espera.

## Para qué sirve

- **Que el trabajo no se pierda.** El estado vivo está escrito (cola, charter, bitácora), no en la memoria de una conversación que se cerró.
- **Que la IA trabaje igual en cada sesión.** Las reglas están en un `CLAUDE.md` **auto-cargado** y en un catálogo de **doctrinas versionadas**, no en el recuerdo de lo que se pactó el mes pasado.
- **Que los plazos no se pasen.** Los asuntos con terceros enfrente (un organismo, una aseguradora, un juzgado) viven de fechas; el andamiaje las pone delante.
- **Que lo irreversible lo decida una persona.** Entregar fuera, firmar, pagar y las decisiones jurídicas o económicas son **puerta humana**, siempre.
- **Que los datos no salgan de la máquina.** Los papeles llevan DNI, cuentas, nóminas, informes médicos y datos de terceros: viven aquí y se trabajan aquí, con herramientas locales. Git es **local**: no hay nube, ni servidor al que enviar nada.

## Cómo se arranca un vault temático a partir de esta plantilla

1. **Copia la carpeta y renómbrala** por el tema (`casa`, `finanzas`, `reclamaciones`). Un vault por tema, no uno gigante para todo: el aislamiento entre asuntos y el tamaño del contexto se agradecen.
2. **Decide el histórico.** La copia trae ya el git de la plantilla, con su commit inicial. Si prefieres empezar de cero, borra la carpeta `.git` y haz `git init` otra vez. En cualquier caso **no configures ningún destino externo**: este vault es git local, y el `.claude/settings.json` lo refuerza con reglas de denegación.
3. **Abre la primera sesión con cwd en la raíz.** Serás el **coordinador general** de ese vault. El `CLAUDE.md` se auto-carga; tú empieza por **[`_meta/PRIMEROS-PASOS.md`](_meta/PRIMEROS-PASOS.md)**, que es el arranque real: orden de lectura, qué haces y qué no, y el mapa.
4. **Ajusta el `_meta/` a tu tema.** `_meta/charter-coordinador.md` (una línea sobre de qué va el vault), `_meta/cola-pendientes.md` (los dos o tres primeros bloques) y `_meta/decisiones-abiertas.md`. Llegan **vacíos a propósito**, con su estructura y un ejemplo: no son la cola de nadie más.
5. **Inicializa el primer asunto** con [`inicializador/checklist-arranque.md`](inicializador/checklist-arranque.md) — o con [`checklist-migracion-existentes.md`](inicializador/checklist-migracion-existentes.md) si ese asunto ya viene en marcha, con papeles repartidos por el disco. Al copiar `inicializador/plantilla-contenedor-asunto/` a `asuntos/<asunto>/` se crea la carpeta `asuntos/`, que **no existe todavía**: aparece con el primer asunto.
6. **No instales doctrinas: el catálogo `general/` se LEE.** Cada asunto lo ve en solo lectura (vía `additionalDirectories`) y trabaja contra él; su `memoria/` es solo para las doctrinas **propias**. No se hereda ni se auto-provee.

Lo que **no** hay que hacer al arrancar: rellenar carpetas por adelantado, instalar herramientas "por si acaso" ni traer todos los papeles de golpe. Cada pieza entra con un caso de uso concreto delante.

## Mapa de carpetas

| Ruta | Qué es |
|---|---|
| `README.md` | Esto: qué es la plantilla y cómo se arranca un vault temático con ella. |
| `CLAUDE.md` | Las reglas **siempre activas**, auto-cargadas en cada sesión. Tu rol lo fija tu cwd: raíz → coordinador general; `asuntos/<asunto>/` → coordinador de ese asunto. |
| `.claude/settings.json` | Perfil de la sesión coordinadora de la raíz: hook de higiene al arrancar, veto de `/fast` por configuración y reglas de **denegación** (credenciales de la máquina, y nada de destinos externos para git). |
| `.gitignore` | Qué no se versiona y **por qué**: handoffs y buffers (efímeros), config local de la máquina, interfaz de Obsidian. |
| [`general/comun/`](general/comun/README.md) | **Catálogo** transversal: 24 **doctrinas** del core con su índice, el **hook** de higiene, el tooling **local** de documentos y la resolución de problemas de la herramienta. Se **instala por copia; no se hereda**, y para un coordinador de asunto es **solo lectura**. |
| [`general/comun/packs/codigo/`](general/comun/packs/codigo/README.md) | Pack **opcional**: 10 doctrinas que solo tienen sentido si un asunto incluye **software propio**. Si tu vault no toca software, ignóralo entero — el core no depende de él. |
| [`inicializador/`](inicializador/README.md) | **Procedimiento + plantillas** para arrancar un asunto: los dos checklists, el charter, el contrato de tanda ejecutora, el handoff, el consultor, los `settings.json` por rol y el árbol `plantilla-contenedor-asunto/` a copiar. |
| [`_meta/`](_meta/README.md) | **El kit tratado como un asunto más**: el charter del coordinador general, la cola, las decisiones abiertas, la bitácora de mejora continua y los primeros pasos. Aquí se gestiona la evolución del propio vault. |
| `asuntos/<asunto>/` | Los asuntos, uno por carpeta, todos con la misma estructura. **No existe hasta que inicializas el primero.** |

## Tres reglas que conviene saber antes de empezar

- **Coordinar no es ejecutar.** El coordinador organiza, verifica y redacta prompts; el trabajo voluminoso va a una **sesión ejecutora** con contrato escrito. Sus subagentes son de **solo lectura**. Si el coordinador se pone a producir, se queda sin contexto y hay que relevarlo.
- **Verificado, no asumido.** Lo que se puede comprobar por comando se **ejecuta** y se reporta el **output literal**; lo que no, se convierte en **comprobación en campo** con los pasos exactos y el resultado esperado. Nunca se ajusta el criterio para que pase.
- **Portabilidad.** Cero rutas absolutas de máquina en lo versionado: las de esta máquina van a `.claude/settings.local.json`, que está gitignored. Es lo que permite que el vault se copie a otro disco y siga funcionando.
