# `memoria/` — doctrinas del asunto

- **Doctrinas instaladas** desde el catálogo `general/` (copia, con su `version`) — solo las que aplican a este asunto.
- **Doctrinas propias** del asunto, las que no son transversales y por tanto no suben al catálogo.

## La regla de oro

**Se instalan por copia; no se heredan** (ver `../../../general/comun/README.md`). Cada copia es un **snapshot con su `version`**: no se actualiza sola. Cuando el catálogo evoluciona, el coordinador del asunto **resincroniza explícitamente** lo que le afecte, con su commit y su motivo — un asunto abierto no debe cambiar de reglas a mitad de camino porque alguien editara el catálogo.

El índice de las transversales disponibles está en `../../../general/comun/doctrinas/MEMORY-doctrinas-index.md`. **Empieza por el índice**, no por la lista de ficheros.

## Baseline

Instala siempre: perfil de modelos ([[modelo_por_tarea]]), higiene de contexto ([[higiene_contexto_y_tokens]]), estructura del contenedor ([[estructura_contenedor_asunto]]) y verificación por el agente ([[verificacion_e2e_por_agente]]). El resto, según el perfil declarado en el charter.

**Solo si el perfil es `asunto con software`** se instalan además las nueve del pack `codigo/` (`../../../general/comun/packs/codigo/`), al **mismo** nivel que las del core: una vez instaladas conviven sin subcarpeta, porque la separación es del catálogo, no del asunto.
