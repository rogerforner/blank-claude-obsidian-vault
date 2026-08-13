---
name: pnpm como gestor de paquetes — supply chain security
description: Usar pnpm v11+ como gestor de paquetes en asuntos Node para mitigar ataques de supply chain; minimumReleaseAge evita hot-release attacks, strict mode bloquea phantom dependencies. npm prohibido tras la migración.
type: doctrine
version: 1.0
---

En asuntos con código Node, usar **pnpm v11+** como gestor de paquetes para mitigar ataques de *supply chain*.

## Por qué

1. **Riesgo real de supply chain.** Los compromisos de mantenedores de paquetes populares publican versiones maliciosas con scripts `postinstall` que **exfiltran credenciales**. Estos paquetes son dependencias transitivas de casi cualquier proyecto Node moderno.
2. **El `.env` del entorno puede contener credenciales reales** que un `postinstall` malicioso ejecutado durante `install` exfiltraría.
3. **`minimumReleaseAge` (default 7 días)**: un paquete debe llevar X días publicado antes de instalarse. Mitiga *hot-release attacks*, porque las versiones maliciosas se retiran en horas/días tras su detección.
4. **Beneficios operativos:** strict mode (bloquea *phantom dependencies*), `node_modules` con symlinks (más rápido, menos disco), mejor manejo de monorepos.

## Reglas tras adoptar

1. **Toda dependencia nueva por `pnpm add`** — nunca `npm install`.
2. **Pin exacto** siempre (sin `^`/`~`).
3. Cualquier **excepción a `minimumReleaseAge`** (paquete recién publicado) requiere justificación documentada en el mensaje de commit.
4. **Builds/verificación reproducibles** con `pnpm install --frozen-lockfile`.
5. **Una sola fuente de verdad:** `pnpm-lock.yaml`. `npm` queda **prohibido** tras la migración.
6. **Sin actualizaciones automáticas:** ni Renovate ni Dependabot. Las actualizaciones son **manuales y revisadas**; auditar con `pnpm audit` periódicamente.
7. **Instalar pnpm con corepack** y **pinear su versión** (`corepack prepare pnpm@<X> --activate` + `packageManager` en `package.json`). Nota: algunas versiones recientes de Node ya **no incluyen corepack** (p. ej. Node 26) → *bootstrap*: `npm install -g corepack@latest` → `corepack enable` → `corepack prepare pnpm@<X> --activate`.
8. **Fijar la versión de Node a la LTS activa** (`engines.node` + `.nvmrc`), no la Current (la última) ni una EOL; **validar el build con la versión declarada**. Evita obsolescencias y roturas de toolchain.
9. **Cortar los scripts de build de dependencias:** `onlyBuiltDependencies: []` (ninguna dep ejecuta `postinstall`/`install`) — máxima protección contra postinstall malicioso; añadir excepciones solo si una dep las necesita de verdad.

> **pnpm 10/11+:** los ajustes de comportamiento (`saveExact`, `minimumReleaseAge` —en minutos: 7 días = `10080`—, `engineStrict`, `onlyBuiltDependencies`) van en **`pnpm-workspace.yaml`**, ya **no** en `.npmrc` (verificado empíricamente).

## Riesgos a vigilar

- Dependencias con *peer dependencies* mal declaradas pueden fallar bajo strict mode → resolver caso por caso con justificación.
- Si la migración revela una dependencia maliciosa ya instalada, parar y abrir incidente antes de continuar.

Relacionada: [[licencias_permisivas_estrictas]], [[adopcion_tooling_externo_caso_uso_concreto]], [[verificacion_fuente_primaria]] (la versión y la licencia de un paquete se comprueban en su fuente oficial, no en un proxy).

> Pieza de catálogo `general/comun/packs/codigo/doctrinas/`. v1.0 (2026-06-05). Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado y **no se hereda** automáticamente.

> Adaptada al esqueleto de la plantilla (`asuntos/<asunto>/`) conservando el vocabulario técnico: el enfoque neutro de la plantilla aplica al core, no a este pack — 2026-07-29. Cambios del traslado: en el kit de origen esta pieza vivía en el bucket por tecnología (`general/node/convenciones/`), no en el catálogo común; en la plantilla **el bucket por tecnología no existe** y la pieza entra en el pack `codigo/`, que es el único sitio donde la plantilla habla de stacks concretos. Es, por tanto, la más específica del pack: si el asunto no lleva Node, se ignora. Las reglas se conservan íntegras.
