---
name: Guarda de ficheros sensibles y flags de lanzamiento
description: La config local del asunto la lee y edita la IA sin restricción; la deny-list solo bloquea las credenciales de máquina/usuario (~/.ssh, ~/.aws, …). Los datos personales SÍ viven en el vault —es su sitio—; lo que no sale NUNCA son los secretos (contraseñas, claves, tokens), y desde 2026-08-14 el material de trabajo sí puede ir a un cuaderno cerrado que no entrene con él. Las tandas que tocan masivamente .claude/ o hooks se lanzan con el flag de permisos amplios desde el inicio.
type: convention
version: 2.2
---

## Ámbito ESTRICTO: secretos y credenciales reales, nada más

Esta doctrina **solo** ampara proteger **secretos y credenciales de verdad**. **NO ampara** proteger el trabajo: ni los documentos del asunto, ni las comprobaciones, ni la configuración de calidad. Si un mecanismo **impide escribir** algo que es trabajo legítimo, no pertenece aquí y se retira — un mecanismo que bloquea no mide nada, solo produce parálisis.

**Y el flag de permisos amplios es lo NORMAL en local**, no una excepción que haya que justificar: lo que sigue protegiendo son las **deny rules**, que aguantan incluso bajo él.

## Config local del asunto: editable sin restricción

Los ficheros de configuración local de un asunto —`settings.local.json` con las rutas de la máquina, ajustes de una herramienta local, tokens desechables de algo que corre en el propio equipo— **la IA los lee y los edita sin restricción**. No dan acceso a nada de fuera.

**Por qué importa (no es solo comodidad):** si la IA no puede tocar la config local, esta se **desfasa** de la plantilla versionada (que va ganando claves nuevas) y el entorno se rompe en silencio. Que la IA mantenga sincronizadas la config local y su plantilla mantiene el vault coherente entre máquinas. Aplica a **todas** las sesiones: coordinación **y** ejecución.

**Lo único que la lista de denegación bloquea** son las **credenciales de máquina/usuario** — las llaves a cuentas y servicios **reales**, cuya lectura sí podría comprometer algo de fuera:

- **Bloqueado (deny `Read`):** `~/.ssh/**`, `~/.aws/**`, `~/.gnupg/**`, claves privadas `id_rsa` / `id_ed25519`, y el almacén de credenciales de cualquier herramienta instalada (`~/.config/<herramienta>/`).
- **Sin deny:** todo lo demás, incluida la config local del asunto y los documentos del vault.

**Dónde viven estos denies:** el hogar natural es el `~/.claude/settings.json` **global** (per-máquina, no versionado) — un único suelo que cubre **toda** sesión en **cualquier** directorio, incluidos los contenedores sin `settings.json` propio. `deny` gana sobre `allow`, así que el suelo global se impone aunque el `allow` global sea amplio (`Read(*)`). Los settings versionados del vault repiten el deny para portabilidad entre máquinas.

## Los datos personales sí viven en el vault — y lo que no sale nunca son los secretos

Un vault doméstico contiene, por definición, material sensible: DNI, escrituras, nóminas, informes médicos, números de cuenta, datos de terceros (el vecino, el perito, el arrendatario). **Ese es su sitio**: el vault es local y su git no tiene destino fuera. No hay que anonimizarlo para trabajarlo.

Las tres reglas duras, en capas distintas:

1. **Lo que no sale nunca son los SECRETOS** — contraseñas, claves de API, tokens, certificados, semillas de recuperación —, a ningún servicio y por ningún canal: **eso compromete sistemas**, y es distinto de la privacidad. *(Actualizado el 2026-08-14 por decisión del director: antes esta capa decía "nada de esto sale" para todo el material sensible a la vez. La frontera ahora distingue por servicio y por tipo → [[soberania_datos_local]] v1.2.)* **El material de trabajo puede subirse a un cuaderno cerrado** que no entrene con él; **el chat web abierto conserva la cautela** porque entrena por defecto; y las **categorías especialmente sensibles de esta lista** —identificativos, salud, financieros completos— las decide el director **caso a caso, no por defecto**. Las herramientas de documentos siguen siendo **locales** (ver [tooling de documentos](../tooling-documentos.md)).
2. **No se versionan valores que no son del asunto.** Contraseñas, claves de firma y rutas de la máquina van a ficheros **gitignored**; al vault solo van **nombres** y plantillas de ejemplo. Trabajar un documento en local **no** es meter una credencial en el histórico.
3. **Los datos de terceros son de terceros.** Aparecen en el asunto porque hacen falta para el asunto; no se reutilizan para otra cosa, y al cerrar el asunto se conserva lo que la ley obliga y poco más ([[revision_periodica_forma_de_trabajo]]).

→ [[verificacion_fuente_primaria]] antes de propagar cualquier dato personal a otro documento: un número de cuenta mal copiado es un error caro.

## Flags de lanzamiento para tandas que tocan archivos sensibles

Cuando una tanda modifica **masivamente** archivos de configuración de sesión (`.claude/settings.json`, `.claude/agents/*`, `.claude/rules/*`, hooks), el agente recibe interrupciones de permiso frecuentes que fragmentan la sesión.

**Solución:** el director lanza la CLI con el flag de permisos amplios (`--dangerously-skip-permissions`) **desde el inicio**. Una vez iniciada la sesión sin el flag, no se puede añadir retroactivamente sin reiniciar y perder contexto, así que debe decidirse de antemano.

El coordinador indica en el `## Setup` del prompt si la tanda lo requiere. **Criterio:** ¿la tanda va a escribir 5 o más archivos en `.claude/` o en hooks? Si sí, incluir el flag (y usar la CLI, no Desktop/web). La config local y los documentos del asunto **no** disparan interrupciones (no están en la lista de denegación), así que por sí solos no requieren el flag.

**Recordatorio:** ni con ese flag se saltan las **deny rules** — son la única barrera que aguanta ([[orquestacion_sesiones_por_herramienta]]). Por eso lo que quieras impedir se expresa como DENY.

Relacionada: [[minimizar_askuserquestion_agente_operativo]], [[verificacion_fuente_primaria]], [[estructura_contenedor_asunto]], [[orquestacion_sesiones_por_herramienta]].

> Pieza de catálogo `general/comun/doctrinas/`. **v2.2 (2026-08-14):** la primera de las tres reglas duras se reescribe por decisión del director. Decía "nada de esto sale de la máquina" metiendo en el mismo saco una contraseña y el plano de una casa; ahora la línea intocable son los **secretos** —lo que compromete un sistema— y el **material de trabajo puede ir a un cuaderno cerrado** que no entrene con él. Las categorías especialmente sensibles de la lista las decide él caso a caso. → [[soberania_datos_local]] v1.2. **v2.1 (2026-08-01):** ámbito acotado a secretos y credenciales reales — **no ampara** proteger el trabajo ni la configuración de calidad, y el flag de permisos amplios pasa a ser **lo normal** en local (lo que protege son las deny rules, que aguantan bajo él). **v2.0 (2026-06-18):** config local editable sin restricción; la deny-list se reduce a credenciales de máquina (la v1.0 bloqueaba también la config del asunto). v1.0 (2026-06-05). Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente.
> Adaptada al enfoque neutro de la plantilla (sin referencias al dominio del software) — 2026-07-29.
