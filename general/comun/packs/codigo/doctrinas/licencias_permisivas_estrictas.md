---
name: Doctrina de licencias — tres líneas rojas
description: Tres líneas rojas sobre licencias de dependencias: sin contagio copyleft al código propio, sin restricciones anti-SaaS al modelo de negocio, y propiedad intelectual del código propio defendible. Copyleft aceptable solo en microservicio aislado por REST sin modificar.
type: doctrine
version: 1.0
---

Tres líneas rojas concretas sobre las licencias de las dependencias del asunto.

## Línea roja 1 — Sin contagio al código propio

El código propio debe permanecer propietario sin redistribución forzosa por contagio de licencia.

- **Bloqueado:** importar, linkar en el mismo proceso/binario, o embeber código copyleft (GPL/LGPL/AGPL) **directamente** en el código propio.
- **Aceptable:** usar dependencias copyleft en **microservicio aislado** (proceso/contenedor separado) con comunicación **REST** y sin importar su código; modificar la dependencia copyleft y **publicar esa modificación bajo su licencia original** (el código propio sigue siendo propietario); atribución estándar en `NOTICE`/`LICENSE`.

## Línea roja 2 — Sin restricciones al modelo de negocio (anti-SaaS)

Las licencias que restringen el **modelo de negocio** (no solo el código) se bloquean aunque no contagien.

- **Bloqueado:** Commons Clause, SSPL, BSL, Elastic License, CC-BY-NC, y cualquier "Custom"/"Source Available" que imponga restricciones comerciales, de redistribución o de atribución obligatoria sobre el producto.
- **Aceptable:** permisivas puras (MIT, Apache-2.0, BSD, CC0, ISC, Unlicense, PostgreSQL License, zlib, BlueOak Model License 1.0.0) y **CC-BY-4.0** (atribución simple en `NOTICE`, sin *share-alike* ni *non-commercial*).

## Línea roja 3 — Propiedad intelectual defendible

El código propio debe ser legítimamente propietario para que, ante un incidente de exposición (brecha, filtración, error de configuración), la propiedad intelectual sea defendible. Las líneas 1 y 2 garantizan la 3: si el código no se contagia y el negocio no se restringe, la PI del código propio es siempre defendible.

## Aplicación al coordinador

1. **Verificar empíricamente** la licencia en la fuente oficial (repositorio, `package.json`, model card…).
2. Aplicar las tres líneas **en orden**: ¿contagio? → arquitectura aislada o alternativa; ¿anti-SaaS? → bloqueada; ¿PI defendible? → si no, bloqueada.
3. Permisivas puras / CC-BY-4.0 → **autorización directa**.
4. Copyleft → **solo en microservicio aislado** (sin modificar, o publicando la modificación).
5. Zonas grises o "Custom" → **escalar al director** con análisis específico.

Relacionada: [[adopcion_tooling_externo_caso_uso_concreto]], [[infra_europa_rgpd]], [[verificacion_fuente_primaria]] (la licencia se comprueba en la fuente oficial, no en un proxy).

> Pieza de catálogo `general/comun/packs/codigo/doctrinas/`. v1.0 (2026-06-05). Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente.

> Adaptada al esqueleto del seed (`asuntos/<asunto>/`) conservando el vocabulario técnico: el framing neutro del seed aplica al core, no a este pack — 2026-07-29. Cambios del traslado: "proyecto" pasa a "asunto" como unidad. Nota de alcance: **esta doctrina cubre las licencias de las dependencias de un asunto de software**; el criterio de licencia para las herramientas de documentos del core vive en `general/comun/tooling-documentos.md`, que no depende de este pack. Las tres líneas rojas se conservan íntegras.
