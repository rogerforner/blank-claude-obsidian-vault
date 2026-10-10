# Herramientas de usuario: manuales de instalación

## Qué hay aquí

Un manual por herramienta de usuario: cómo se instala, se comprueba, se actualiza y se desinstala en cada sistema, y sus problemas conocidos. Son hechos de la máquina, iguales para cualquier vault. **Por qué esa herramienta y cómo la usa este vault** no está aquí: está en [[herramientas_comunes_de_usuario]].

## Las reglas del manual

- Una herramienta que se instala y funciona se instala **a nivel de usuario**, para todos los coordinadores.
- La primera instalación **deja su manual**.
- Al reinstalar se **sigue el manual** y no se busca en Internet.
- Solo se busca fuera si falta el sistema o un paso falla, y **lo aprendido vuelve al manual en el mismo commit**.
- Sin manual, la instalación **no está terminada**.

## Dónde vive y cómo viaja

En el catálogo, así que viaja con el vault y con la plantilla. Un arreglo hecho aquí se copia a la plantilla en el mismo commit, como todo `general/`. En un vault que no mantiene la plantilla, el arreglo se le pasa a quien la mantiene antes de la siguiente actualización, porque si no la actualización lo pisa.

## Estructura fija de un manual

Un fichero por herramienta, con estas partes en este orden:

1. **Frontmatter:** `name`, `description`, `type: manual` y `version`.
2. **Para qué sirve y quién la usa.**
3. **Requisitos.**
4. **Instalación**, una subsección por sistema (macOS, Debian, Windows 11), con pasos numerados y órdenes exactas, o `[SIN MANUAL PARA ESTE SISTEMA]`.
5. **Configuración tras instalar:** los permisos van en los `settings` de usuario, nunca en los versionados.
6. **Comprobación**, con su salida esperada.
7. **Problemas conocidos:** cada uno como síntoma, causa y solución.
8. **Actualización.**
9. **Desinstalación** (`[SIN MEDIR]` si no se ha hecho).
10. **Medido**, una línea por sistema, con este formato: `Medido: AAAA-MM-DD, <herramienta> <versión>, macOS <versión de sw_vers>, instalada por <IA|persona|sin dato>`. Sin nombres de máquina, de cuenta ni de persona: los manuales se publican con la plantilla.

Lo que viene de terceros y no está medido aquí se marca así, como `[SIN MEDIR]`.

## Índice

| Herramienta | Manual | Estado | Sistemas con manual medido |
|---|---|---|---|
