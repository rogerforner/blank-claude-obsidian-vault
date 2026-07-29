# `_meta/` — el kit tratado como un asunto más

`_meta/` es el espacio del **coordinador general** del vault: el rol que **inicializa asuntos y mantiene coherente toda la estructura** (el catálogo `general/`, las plantillas del `inicializador/`, las convenciones). Es un rol **permanente**, no un montaje de una sola vez: el kit se usa, se rompe por algún sitio y se arregla, y esa evolución se gestiona aquí igual que un `asuntos/<asunto>/` gestiona su asunto.

La idea de fondo: **el kit no es infraestructura invisible, es un asunto con su charter, su cola y su bitácora.** Si mejorar la forma de trabajar no tiene un sitio donde anotarse y una cola donde priorizarse, no se mejora — se comenta y se olvida.

## Contenido

- **[PRIMEROS-PASOS.md](PRIMEROS-PASOS.md)** — el arranque real del coordinador general: orden de lectura, saludo, qué hace y qué no, las reglas que no se negocian y el mapa del vault. **Empieza por aquí** si es tu primera sesión.
- **[charter-coordinador.md](charter-coordinador.md)** — el mandato del coordinador general: qué construir, en qué orden y **dónde parar**.
- **[cola-pendientes.md](cola-pendientes.md)** — el estado vivo del kit: bloques de trabajo pendientes, en curso y cerrados.
- **[decisiones-abiertas.md](decisiones-abiertas.md)** — decisiones de diseño aún sin cerrar, cada una con su recomendación; se resuelven **con el director**.
- **[bitacora.md](bitacora.md)** — qué se aprendió al usar el kit y **qué cambio se aplicó** a raíz de ello ([[mejora_continua_del_kit]]).
- **[plantilla-brief-chat-web.md](plantilla-brief-chat-web.md)** — plantilla de brief para investigar **fuera de esta herramienta**, en el chat web, cuando la pregunta es sobre la forma de trabajar (un modelo nuevo, una herramienta, un método) y no sobre un asunto concreto ([[vigilancia_tecnologica_bajo_demanda]]).

Los estudios y los briefs de este vault, cuando existan, viven **aquí dentro**, junto a lo demás del kit. El hook de higiene barre esta carpeta igual que las de coordinación: un brief que ya tiene su informe se **borra** ([[convencion_organizacion_carpeta_trabajo]]).

## Distinción importante (no la confundas)

Gobiernan **permisos opuestos**:

| | **Construir el kit** (lo que se hace desde aquí) | **Coordinar un asunto** (lo que hacen los coordinadores que este kit arranca) |
|---|---|---|
| cwd | la **raíz** del vault | `asuntos/<asunto>/` |
| Alcance de escritura | todo el vault, incluido `general/` | **solo su contenedor**; el catálogo `general/` en **solo lectura** |
| Otros asuntos | los ve y los mantiene coherentes | **no son asunto suyo** |
| Settings | `.claude/settings.json` de la raíz | `inicializador/plantilla-settings-coordinador.json`, copiado a su contenedor |

Confundirlos tiene un coste concreto: un coordinador de asunto que edita el catálogo cambia las reglas de **todos** los asuntos sin que nadie lo haya decidido, y un coordinador general que se pone a trabajar el asunto se queda sin contexto para lo que sí es suyo.

## Cómo se mantiene esto vivo

1. Lo que se aprende **se anota en la bitácora** el mismo día, con el cambio que se aplicó.
2. Lo que hay que hacer **entra en la cola** con su bloque; lo que hay que decidir, en decisiones abiertas con una recomendación.
3. Un cambio de doctrina **sube su `version`**, anota su changelog en el footer de la propia doctrina y **actualiza su entrada en el índice en el mismo commit** — índice y ficha son una sola fuente ([[verificacion_fuente_primaria]]).
4. La cadencia de repaso es ligera y está escrita: [[revision_periodica_forma_de_trabajo]]. El ritmo importa más que el rigor.
