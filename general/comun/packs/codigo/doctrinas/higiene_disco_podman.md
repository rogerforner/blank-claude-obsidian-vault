---
name: Higiene de disco en stacks Podman/Compose
description: Los stacks de contenedores acumulan disco en silencio (imágenes y capas colgantes, build cache, volúmenes huérfanos, logs, dumps de BD). Medir antes de limpiar (podman system df), podar quirúrgicamente (no system prune -a a ciegas), backup verificado ANTES de toda operación destructiva, proteger imágenes pesadas y volúmenes con datos, y rotar backups. Aplica a cualquier asunto con contenedores (Podman o Docker).
type: practice
version: 1.0
---

Un stack de contenedores **acumula disco en silencio**: imágenes y capas *dangling* tras cada rebuild, **build cache**, volúmenes huérfanos, logs, y **dumps de BD** que crecen sin límite. En stacks con **imágenes pesadas** (p. ej. un microservicio de IA/NER con modelos cacheados puede rondar **>10 GB**) la presión de disco es aguda y, cuando se agota, **rompe builds y arranques de forma confusa**. En Windows el disco de la VM de Podman/WSL2 (`ext4.vhdx`) **crece y no se reduce solo**.

## Reglas

- **Mide antes de limpiar.** `podman system df` (y `-v`) para ver qué ocupan imágenes, contenedores, volúmenes y build cache **antes** de podar. No optimices a ciegas. → [[higiene_contexto_y_tokens]] (mismo principio: medir antes).
- **Backup verificado ANTES de toda operación destructiva.** Nunca `compose down -v` (borra volúmenes = **destruye datos**) sin un **dump reciente verificado**. Usa un script de backup con **confirmación interactiva** (`read -p`, bypass `--yes`) y haz dump antes de cada hito que escriba en BD.
- **Distingue `down` de `down -v`.** `compose down` conserva los **volúmenes con nombre** (datos, p. ej. `pgdata`); `down -v` los **elimina**. Documenta qué volúmenes son datos (proteger) y cuáles desechables (p. ej. un volumen anónimo de `node_modules` para mitigar el rendimiento de symlinks en WSL2, que se repuebla solo).
- **Poda quirúrgica, no a ciegas.** Prefiere lo específico: `podman image prune` (capas *dangling*), `podman builder prune` (build cache), `podman volume prune` (solo huérfanos, **tras confirmar que no hay datos**). **Evita `podman system prune -a --volumes`**: borra imágenes base pesadas que habrá que **re-descargar/re-construir** (caro) y volúmenes con nombre que pueden contener datos.
- **Protege las imágenes pesadas.** Imágenes grandes con SHA pineado y build offline son **caras de reconstruir** (a veces decenas de minutos): no las podes por rutina; trátalas como activo a conservar entre limpiezas.
- **Rota los backups/dumps.** `backups/` crece sin límite → política de retención (últimos N + hitos relevantes), **gitignored**. Los `.dump` son datos, **nunca se versionan**.
- **Límites de recursos (opcional).** Si un servicio puede dispararse, fija `mem_limit`/`cpus` en el compose para no asfixiar la máquina.
- **Windows/WSL2:** si el `vhdx` de la VM ha crecido mucho, recupéralo compactándolo (parar la VM y compactar el disco), no esperando a que se reduzca solo.

## Cómo aplicarlo

1. `podman system df` → ¿qué crece? 2. Si vas a destruir, **dump primero** y verifícalo. 3. Poda lo específico (`image`/`builder`/`volume prune`), nunca `system prune -a --volumes` por costumbre. 4. Conserva imágenes pesadas y volúmenes con datos. 5. Aplica retención a `backups/`. La seguridad la dan el **backup + la confirmación**, no la prisa por liberar espacio.

Relacionada: [[rama_desarrollo_y_paso_a_produccion]] (verificar antes de promover), [[cuestionar_premisas_arquitectonicas_antes_deep_research]] (¿necesitas esa imagen/servicio?), [[higiene_contexto_y_tokens]] (medir antes de optimizar), [[estrategia_de_pruebas_por_tipo_de_proyecto]] (el perfil *infra*: el producto es el stack).

> Pieza de catálogo `general/comun/packs/codigo/doctrinas/`. v1.0 (2026-06-12). Generalizada a partir de un stack de contenedores real (Podman) que documentaba el backup-antes-de-destruir y el tamaño de una imagen de anonimización con modelos cacheados (~14,5 GB), pero no la política de poda/rotación; esta doctrina la añade como criterio transversal a cualquier asunto con contenedores. Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente.

> Adaptada al esqueleto de la plantilla (`asuntos/<asunto>/`) conservando el vocabulario técnico: el enfoque neutro de la plantilla aplica al core, no a este pack — 2026-07-29. Cambios del traslado: la unidad pasa de `proyectos/<repo>/` a `asuntos/<asunto>/`, y en el changelog se retiran los nombres del asunto y del stack de origen, conservando el dato medido (~14,5 GB) y el motivo por el que nació la doctrina. Las reglas se conservan íntegras.
