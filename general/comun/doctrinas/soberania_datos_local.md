---
name: Soberanía de datos y trabajo local
description: El trabajo del vault vive y se procesa en local: git local sin nube, procesamiento local. Lo que NO sale nunca, a ningún servicio, son los SECRETOS (contraseñas, claves de API, tokens, certificados) — eso es seguridad de sistemas, no privacidad. Desde 2026-08-14 la frontera distingue por servicio: el material de trabajo SÍ puede subirse a un cuaderno cerrado que no entrene con él, aunque lleve datos personales incidentales; el chat web abierto conserva su cautela porque entrena y admite revisión humana.
type: doctrine
version: 1.2
---

El vault y su trabajo se tratan con **soberanía total**: control de los datos + cero dependencia de servicios externos para lo crítico. Razón de fondo en un vault doméstico: buena parte del contenido son **datos personales** (finanzas, contratos, correspondencia, la casa y su entorno) y no tienen por qué salir de tu máquina.

## Lo que es local por defecto

- **git es LOCAL** (sin remoto, sin nube): el historial se queda en tu máquina, para controlar cambios y saber qué borrar sin miedo. No hay envío a un servidor, ni ramas de entorno, ni automatización en la nube. Si quieres copia de seguridad, hazla **local o cifrada**, nunca a un servicio externo con datos personales en claro.
- **El procesamiento** (cálculos, conversión de documentos, generación de PDF — ver [[tooling-documentos]]) corre **local**.
- **La operativa** es el agente de coordinación sobre el vault en local + el chat web para lo puntual.

## Lo que NO se hace

- **Sacar SECRETOS de la máquina: contraseñas, claves de API, tokens, certificados, semillas de recuperación.** A ningún servicio, con ninguna política de datos, por ningún canal. **Esto no es privacidad: es seguridad de los sistemas**, y es la línea que no se mueve. Un secreto filtrado da control sobre algo; un dato personal filtrado es un problema distinto y de otra magnitud — confundirlos lleva a proteger mal las dos cosas.
- **Investigación con datos sensibles en el chat web abierto.** El chat web ([[vigilancia_tecnologica_bajo_demanda]]) **entrena con lo que recibe salvo que se desactive el historial**, y admite revisión humana: se usa con información **no sensible o desensibilizada** — preguntas de método, normativa, técnicas, productos. Ver [[sensitive_file_guard]] y, en el pack `codigo`, [[infra_europa_rgpd]].

## Lo que SÍ puede salir, desde el 2026-08-14 (decisión del director)

**La frontera dejó de ser "datos personales sí o no" y pasó a distinguir por servicio y por tipo de dato.** El motivo es práctico: un **cuaderno de fuentes cerrado** —el que no entrena con lo que se le sube y solo responde a partir de sus fuentes— no es lo mismo que un chat web abierto, y tratarlos igual impedía un uso que rinde mucho.

- **El material de trabajo puede subirse a un cuaderno cerrado** aunque contenga datos personales incidentales: documentación técnica, manuales, fichas, cálculos. **Ese es el punto** — convertirlo en el sitio donde vive lo que hay que consultar una y otra vez, en vez de releerlo entero en cada sesión.
- **Sigue mereciendo criterio, y lo aplica el director caso a caso**, el material de categorías especialmente sensibles: identificativos, salud, datos financieros completos. No está prohibido; está **decidido por él y no por defecto**.
- **Y una cautela sobre lo que no es suyo:** un expediente doméstico contiene **datos de terceros** —nombres de instaladores, contactos, importes de presupuestos ajenos—. Sobre los propios decide él; de los de terceros conviene al menos ser consciente al subirlos. Quitar cuatro nombres cuesta un minuto y no resta nada de utilidad.

Lo que **no** cambia con esto: git sigue local, el procesamiento sigue local, y los secretos siguen sin salir.

## Reapertura

Permanente por defecto. Abrir la puerta a un servicio concreto (por ejemplo una copia de seguridad en la nube, o un conector) **solo** bajo análisis explícito que demuestre el caso de uso y **decisión del director** ([[adopcion_tooling_externo_caso_uso_concreto]]); si además hay tratamiento de datos personales o dependencias de terceros, aplican las piezas del pack `codigo`: [[infra_europa_rgpd]] y [[licencias_permisivas_estrictas]].

> **Nota para asuntos con software:** la variante operativa de esta doctrina (remoto Git puro, verificación antes de publicar, herramientas locales y no servicios externos) vive en el pack `codigo` (`general/comun/packs/codigo/`).

Relacionada: [[sensitive_file_guard]], [[vigilancia_tecnologica_bajo_demanda]], [[adopcion_tooling_externo_caso_uso_concreto]]; y en el pack `codigo`: [[infra_europa_rgpd]], [[licencias_permisivas_estrictas]].

> Pieza de catálogo `general/comun/doctrinas/`. **v1.2 (2026-08-14): el director mueve la frontera, y la mueve al sitio correcto.** Hasta aquí la línea era "los datos personales no salen", lo que metía en el mismo saco una contraseña y el plano de una casa. Ahora: **los secretos no salen nunca** —contraseñas, claves, tokens, certificados: eso compromete sistemas— y el **material de trabajo sí puede ir a un cuaderno cerrado** que no entrene con él, aunque lleve datos personales incidentales. El chat web abierto conserva su cautela porque entrena por defecto y admite revisión humana. **El motivo del cambio es de uso, no de relajación:** poner los manuales y la documentación técnica en un cuaderno consultable evita releerlos enteros en cada sesión, y esa es la palanca. La reapertura que esta misma doctrina preveía es exactamente lo que se ha ejercido. Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente. v1.1 (2026-08-01): conservada al actualizar el kit; adaptada al framing neutro (vocabulario sin términos de software) y marcadas como tales las remisiones al pack `codigo`. Incorporada a la plantilla el 2026-08-10, con su línea de operativa neutralizada de nombre de herramienta.
