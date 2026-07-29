# Pack `codigo/` — doctrinas para asuntos que incluyen software propio

Este es un **pack**: un paquete **opcional** de doctrinas para un dominio concreto, que se suma al catálogo transversal (`general/comun/doctrinas/`) **solo si el vault lo necesita**. Hoy es el único pack del seed.

## Qué es un pack (y qué no es)

Un pack es un **añadido**, nunca un sustituto. El catálogo transversal —el **core**— contiene lo que aplica a *cualquier* trabajo coordinado entre el director y la IA, sea una reclamación, una obra, una declaración o un contrato. Un pack contiene lo que **solo tiene sentido dentro de un dominio**, y por eso no puede estar en el core sin ensuciarlo.

Tres propiedades que definen un pack en este vault:

- **El core no depende del pack.** Si ignoras `packs/` entero, no queda ninguna doctrina del core coja. Donde el core rozaba un tema de este pack, lo dice y remite aquí explícitamente — pero se entiende sin abrirlo.
- **El pack sí se apoya en el core.** Las nueve doctrinas de aquí enlazan con normalidad a las del core y las dan por supuestas. Instalar el pack sin el core deja piezas colgando.
- **El pack manda en su dominio, no fuera.** Nada de aquí redefine una regla del core; la **especializa** para el caso del software.

## Cuándo se instala

**Cuando el asunto incluye software propio**: código que el equipo escribe y mantiene, con su repositorio, su ciclo de cambios y su despliegue. Ese es el único disparador.

No se instala por rozar la informática. Usar una herramienta de línea de comandos, montar una hoja de cálculo, automatizar una tarea con un script de un solo uso o pedirle a la IA que procese unos PDF **no** convierte un asunto en un asunto de software: para eso ya está el core. La pregunta que decide es: *¿hay un repositorio de código propio cuyo ciclo de vida hay que gobernar?* Si la respuesta es no, este pack sobra.

Un vault puede tener asuntos de los dos tipos. El pack se instala **por asunto**, no por vault.

## Cómo se instala

**Igual que el core: por copia, y no se hereda.** Es exactamente la regla de oro del catálogo → [`../../README.md`](../../README.md).

1. Abre el índice del pack: [`doctrinas/MEMORY-doctrinas-index-codigo.md`](doctrinas/MEMORY-doctrinas-index-codigo.md).
2. **Copia primero las piezas del core** que el asunto necesite a `asuntos/<asunto>/memoria/` — el pack presupone que están.
3. **Copia después las piezas del pack** que apliquen, al **mismo** `asuntos/<asunto>/memoria/`. No hay subcarpeta `codigo/` en la memoria del asunto: una vez instaladas, core y pack conviven al mismo nivel; la separación es del catálogo, no del asunto.
4. No las copies todas por rutina. `pnpm_supply_chain` solo si hay Node; `higiene_disco_podman` solo si hay contenedores; las tres de git del asunto solo si el repositorio tiene remoto y ramas de entorno.
5. Cada copia es un **snapshot con su `version`**: no se actualiza sola. Cuando el catálogo evolucione, resincroniza a mano lo que te afecte, con su commit y su motivo.
6. Si el asunto tiene repositorio de código, usa además [`README-repo-codigo.md`](README-repo-codigo.md) para su `README.md`, su `CLAUDE.md`/`AGENTS.md` y sus reglas.

## Qué NO hace este pack

- **No sustituye al core.** Un asunto de software necesita las 24 doctrinas transversales igual que cualquier otro: el pack solo añade las 9 que el core no puede tener.
- **No cambia el framing del resto del vault.** El seed usa vocabulario neutro de dominio (**asunto**, **producto**, **verificaciones**, **entregar fuera**); aquí dentro se conserva el vocabulario técnico a propósito, porque el valor del pack es ser concreto. Esa excepción **empieza y acaba en `packs/codigo/`**.
- **No convierte el vault en un repositorio de código.** El vault de coordinación sigue siendo **git local, sin remoto y sin ramas de entorno**. Las doctrinas de rama, push y proveedor de hosting aplican al **repositorio que vive dentro de `asuntos/<asunto>/`**, y cada una lo dice en su cabecera.
- **No documenta stacks.** Las notas de una tecnología concreta se escriben en el propio asunto, no aquí. La única pieza atada a un stack es `pnpm_supply_chain`, y está porque la cadena de suministro de paquetes es un riesgo de seguridad, no una preferencia de tooling.

## Contenido

| Fichero | Qué es |
|---|---|
| [`doctrinas/MEMORY-doctrinas-index-codigo.md`](doctrinas/MEMORY-doctrinas-index-codigo.md) | Índice del pack: una línea por doctrina. **Empieza por aquí.** |
| `doctrinas/` (9 ficheros) | Las doctrinas, con su `version` y su changelog conservados del catálogo de origen. |
| [`README-repo-codigo.md`](README-repo-codigo.md) | Plantilla del `README.md` del repositorio de código y alineación de su `CLAUDE.md`/`AGENTS.md` y sus reglas. |

## Añadir otro pack

Mismo patrón, misma prueba: **¿el core queda cojo sin él?** Si la respuesta es sí, la pieza es transversal y va al core, no a un pack. Un pack nuevo se crea **cuando hay piezas reales que colocar**, nunca de forma preventiva ([[adopcion_tooling_externo_caso_uso_concreto]]).
