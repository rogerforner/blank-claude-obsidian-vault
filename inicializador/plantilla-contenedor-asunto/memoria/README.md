# `memoria/` — doctrinas propias del asunto

## La regla de oro: el catálogo se LEE, no se copia

La fuente de verdad es el **catálogo** (`../../../general/comun/doctrinas/`), que este contenedor tiene en `additionalDirectories` de su `.claude/settings.json`. El coordinador **lo consulta como referencia**, en solo lectura.

- **Un `[[wikilink]]` sin copia local resuelve al catálogo, y eso es lo normal — no un olvido.** No hay que instalar una doctrina solo porque el `CLAUDE.md` o el charter la enlacen.
- **Copiar no es gratis: quien copia se compromete a traer después los cambios del original.** Una copia **desfasada miente** con la autoridad de estar instalada, y una copia idéntica no aporta nada mientras el asunto viva dentro del vault. Por eso el default es **NO copiar**.
- **Cuándo SÍ copiar:** cuando el asunto necesita **fijar** una versión concreta (y entonces se dice por qué), o cuando va a **salir** del vault y el catálogo no viaja con él. Quien copia, resincroniza.

El índice de las transversales disponibles está en `../../../general/comun/doctrinas/MEMORY-doctrinas-index.md`. **Empieza por el índice**, no por la lista de ficheros.

## Qué va aquí

Solo las doctrinas **propias del asunto**: las que no son transversales y por tanto no suben al catálogo. Si una acaba siendo útil para cualquier asunto, se generaliza y **sube al catálogo**; no se queda duplicada aquí.

## El mínimo de reglas que el coordinador lee desde el día uno

Perfil de modelos ([[modelo_por_tarea]]), higiene de contexto ([[higiene_contexto_y_tokens]]), estructura del contenedor ([[estructura_contenedor_asunto]]) y verificación por el agente ([[verificacion_e2e_por_agente]]). El resto, según el perfil declarado en el charter. **Si el perfil es `asunto con software`**, aplica además el pack `codigo/` (`../../../general/comun/packs/codigo/`), que se lee igual que el core.
