---
name: Verificar en el runtime real, no en el host
description: El filesystem que ves no es necesariamente el que ejecuta la aplicación. Antes de concluir que falta una dependencia o que algo está roto, localiza DÓNDE se ejecuta y compruébalo AHÍ DENTRO. Un árbol de dependencias incompleto en el host NO prueba que la app esté rota (el contenedor las tiene todas), y su presencia en el host tampoco prueba que el runtime las cargue. Las comprobaciones se ejecutan dentro del runtime; no se "arregla" el host para que se parezca al runtime.
type: practice
version: 1.1
---

Cuando el código corre en un **contenedor**, en un **entorno remoto** o depende de librerías servidas desde un **host de assets propio**, el estado del host de desarrollo es un **proxy** de la realidad — y un proxy malo. La pregunta que va **antes** de cualquier diagnóstico es: **¿dónde se ejecuta esto?**; y la comprobación se hace **ahí dentro**. Es [[verificacion_fuente_primaria]] aplicada al eje del entorno: la fuente primaria de *"qué dependencias carga la app"* es **el proceso que corre**, no un directorio.

## El falso positivo canónico: "faltan dependencias, hay que reinstalar"

Un agente lista el árbol de dependencias del host, lo ve incompleto y concluye que la aplicación está rota y que toca reinstalar. **Casi siempre se equivoca:** las dependencias están completas **dentro del contenedor**, que es donde el proceso corre. Reinstalar en el host no arregla nada que estuviera roto — gasta tiempo y disco, y **enmascara** la divergencia host↔runtime en vez de dejarla documentada.

**Las dos direcciones fallan, y por eso el host no vale como prueba:**

- **Ausencia en el host ≠ está roto.** Lo que ejecuta no es lo que ves.
- **Presencia en el host ≠ el runtime la usa.** El proceso puede cargar otra versión, otra ruta, o ninguna.

## El protocolo de tres capas, antes de decir "está roto"

Cuando algo falla, la pregunta que va antes de "¿el código está mal?" tiene tres capas, en este orden, y **solo si las tres pasan** el veredicto "es el código" es legítimo:

1. **¿El runtime está sano de verdad, no solo arrancado?** Un contenedor arrancado y un servicio listo no son lo mismo: una base de datos acepta conexión antes de aceptar consultas, la aplicación arranca y casca contra ella, y el fallo se le atribuye al código cuando lo que no estaba listo era el runtime.
2. **¿El comando corrió DENTRO del runtime, con sus versiones?** Correr la comprobación en el host "porque va más rápido" y dar el verde por bueno es un falso positivo de entorno: si la versión que carga el runtime (lenguaje, librerías del sistema) difiere de la del host, ese verde no dice nada de lo que de verdad se ejecuta.
3. **¿Se reproduce en un runtime limpio?** Si el fallo solo aparece en el de larga vida y no en uno recién creado, lo sucio es el entorno acumulado, no el código.

## Variantes del mismo patrón

- **Librerías servidas desde un host de assets externo:** llegan por URL y **no están en el árbol de fuentes**, así que un agente **no puede leerlas**. Cualquier afirmación sobre su comportamiento es una **suposición**, no una verificación — y hay que decirlo como tal.
- **Comportamiento de un tercero que solo se ve en su salida real:** con un renderizador, un motor de plantillas o un conversor, *"verificado en código"* no es verificado. Se confirma generando la salida en el entorno donde corre; hasta entonces, la comprobación queda **pendiente y marcada como tal**.
- **Datos y ficheros que existen solo en el entorno remoto** (base de datos, subidas de usuario): no se planifica reconocimiento de algo que en local no existe **a propósito**.
- **Lo declarado ≠ lo instalado:** el manifiesto de dependencias y la imagen divergen (una etiqueta móvil apuntando a un build viejo). Verifica el **contenido**, no el metadato.

## Cómo aplicarlo

1. **Localiza el runtime** antes de diagnosticar: ¿contenedor, entorno remoto, host de assets?
2. **Ejecuta la comprobación dentro** —con el `exec` del gestor de contenedores, o su equivalente— y **reporta el output literal**.
3. **Si de verdad falta algo, se añade donde se ejecuta** (la imagen o el entorno), nunca en el host. Si no tienes acceso, lo añade y lo verifica quien lo tenga.
4. **Acota lo que afirmas:** "no verificable en código" es una conclusión legítima y útil; "está roto" sin haber mirado dentro, no.
5. **En cuanto el falso positivo muerda una vez, decláralo** en el troubleshooting del proyecto: es recurrente por diseño — cada sesión nueva llega sin ese contexto y repite el mismo diagnóstico erróneo.

Relacionada: [[verificacion_fuente_primaria]] · [[higiene_disco_podman]] (medir dentro del entorno antes de tocar nada).

> Pieza de catálogo `general/comun/packs/codigo/doctrinas/`. **v1.1 (2026-08-10):** añadido el protocolo de tres capas antes de culpar al código (runtime sano de verdad, no solo arrancado; el comando corrió dentro con las versiones del runtime; se reproduce en un runtime limpio) — destilado del mismo estudio que trajo la ficha de emplazamiento y el pack (tanda `brief-runtime`). **v1.0 (2026-08-01):** destilada de tres manifestaciones verificadas del mismo patrón — un falso positivo de dependencias host↔contenedor que mordió **tres veces** (el contenedor servía las doce dependencias del framework web que el host no tenía); librerías de terceros servidas desde un host de assets propio y por tanto ilegibles para un agente; y el comportamiento de un renderizador de PDF que solo se confirma generando el documento real. Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente.
> Adaptada al esqueleto del seed (`asuntos/<asunto>/`) conservando el vocabulario técnico: el framing neutro del seed aplica al core, no a este pack — 2026-08-01.
