---
name: Soberanía de datos y trabajo local
description: Todo el trabajo del vault vive y se procesa en local. git es local (sin nube por defecto); nada de SaaS externo en el flujo; los datos personales no se suben a servicios de terceros. La investigación externa (chat web) se hace con información NO sensible o desensibilizada. Reapertura puntual solo bajo decisión del director.
type: doctrine
version: 1.1
---

El vault y su trabajo se tratan con **soberanía total**: control de los datos + cero dependencia de servicios externos para lo crítico. Razón de fondo en un vault doméstico: buena parte del contenido son **datos personales** (finanzas, contratos, correspondencia, la casa y su entorno) y no tienen por qué salir de tu máquina.

## Lo que es local por defecto

- **git es LOCAL** (sin remoto, sin nube): el historial se queda en tu máquina, para controlar cambios y saber qué borrar sin miedo. No hay envío a un servidor, ni ramas de entorno, ni automatización en la nube. Si quieres copia de seguridad, hazla **local o cifrada**, nunca a un servicio externo con datos personales en claro.
- **El procesamiento** (cálculos, conversión de documentos, generación de PDF — ver [[tooling-documentos]]) corre **local**.
- **La operativa** es el agente de coordinación sobre el vault en local + el chat web para lo puntual.

## Lo que NO se hace

- **Subir datos personales a servicios de terceros.** Ni almacenamiento externo, ni herramientas que ingieran el contenido del vault.
- **Investigación con datos sensibles.** La investigación en **chat web** ([[vigilancia_tecnologica_bajo_demanda]]) se hace con información **NO sensible o desensibilizada** (preguntas de método, normativa, técnicas, productos — nunca tus datos personales). Ver también [[sensitive_file_guard]] y, en el pack `codigo`, [[infra_europa_rgpd]].

## Reapertura

Permanente por defecto. Abrir la puerta a un servicio concreto (por ejemplo una copia de seguridad en la nube, o un conector) **solo** bajo análisis explícito que demuestre el caso de uso y **decisión del director** ([[adopcion_tooling_externo_caso_uso_concreto]]); si además hay tratamiento de datos personales o dependencias de terceros, aplican las piezas del pack `codigo`: [[infra_europa_rgpd]] y [[licencias_permisivas_estrictas]].

> **Nota para asuntos con software:** la variante operativa de esta doctrina (remoto Git puro, verificación antes de publicar, herramientas locales y no servicios externos) vive en el pack `codigo` (`general/comun/packs/codigo/`).

Relacionada: [[sensitive_file_guard]], [[vigilancia_tecnologica_bajo_demanda]], [[adopcion_tooling_externo_caso_uso_concreto]]; y en el pack `codigo`: [[infra_europa_rgpd]], [[licencias_permisivas_estrictas]].

> Pieza de catálogo `general/comun/doctrinas/`. Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente. v1.1 (2026-08-01): conservada al actualizar el kit; adaptada al framing neutro (vocabulario sin términos de software) y marcadas como tales las remisiones al pack `codigo`. Incorporada a la plantilla el 2026-08-10, con su línea de operativa neutralizada de nombre de herramienta.
