# Guía de elección de herramientas

Qué investigar para elegir las herramientas y las piezas de catálogo de un asunto nuevo, y cómo evaluarlas. El objetivo no es instalar mucho, sino instalar **lo aplicable y nada más**.

## Principio rector

**Caso de uso concreto YA presente, no especulativo** (doctrina [[adopcion_tooling_externo_caso_uso_concreto]]). Antes de investigar en profundidad o integrar nada, **cuestiona la premisa** ([[cuestionar_premisas_arquitectonicas_antes_deep_research]]): ¿se resuelve con lo que ya hay en la máquina —Obsidian, git, un editor de textos, el escáner— sin añadir una dependencia nueva? Pilota lo mínimo (sobre un documento, no sobre los cien) antes de comprometer nada.

## Qué investigar, por dimensión

1. **Naturaleza del asunto** → determina el perfil (trámite con terceros · obra o proyecto propio · seguimiento periódico · asunto con software) y, con él, qué doctrinas del catálogo `general/comun/` aplican y cuáles no. Un trámite con plazos necesita disciplina de fechas y acuses; un seguimiento periódico necesita cadencia y cotejo de cifras. No son las mismas piezas.
2. **Tipo de entregable** → un escrito que se presenta, una hoja de cálculo que sostiene un importe, un plano, un expediente que hay que dejar consultable. De ahí sale qué formato final se necesita y, por tanto, qué herramienta de conversión o maquetación hace falta. Si es el primer asunto de un tipo nuevo, se crea su pieza en el catálogo **con lo que ese asunto necesitó**, no con lo que se imagina que hará falta.
3. **Datos y soberanía** → el material de un asunto doméstico lleva datos personales y de terceros. La regla es dura: **no sale de la máquina**. Nada de conversores web, ni de servicios de transcripción en la nube, ni de pegar un documento en un chat ([[sensitive_file_guard]]). Esto **descarta candidatos por sí solo**, antes de evaluar nada más.
4. **Ciclo de trabajo** → por defecto, todo **local**: las herramientas corren aquí y el histórico es git local, sin destino fuera. *(Los criterios de proveedor externo y licencia para trabajo con software viven en el pack `codigo/` → [[prohibido_uso_herramientas_github_excepto_commits_push]], [[licencias_permisivas_estrictas]], [[infra_europa_rgpd]].)*
5. **Documentos: transcribir, convertir, presentar** → si hay que **transcribir o extraer** de un escaneo, **convertir de formato** o **generar un PDF presentable**, recomienda el **tooling local opcional** del catálogo —[tooling-documentos](../general/comun/tooling-documentos.md): Docling; Pandoc + WeasyPrint— **antes de ponerte a inventariar qué hay instalado en la máquina**. Local, sin servicio externo → apto incluso para documentos con datos personales.
6. **Recursos de terceros** (formularios oficiales, plantillas, tablas de baremos, modelos de impreso) → verifica al inicio de la tanda que siguen disponibles, con qué **condiciones de uso** y en qué **versión**: un modelo de impreso caducado invalida una presentación, y una tabla sin aviso de licencia son todos los derechos reservados. Ten un plan B escrito ([[adopcion_tooling_externo_caso_uso_concreto]]).

## Cómo evaluar una herramienta o una pieza de catálogo

1. **Inventaria lo disponible:** (a) lo que el director ya tiene o puede instalar sin fricción, y (b) las piezas del **catálogo `general/`** aplicables a este asunto. Empieza por el índice de doctrinas, no por la lista de ficheros.
2. **Aplica los cinco criterios** de [[adopcion_tooling_externo_caso_uso_concreto]]: caso de uso real hoy · coste de mantenimiento conocido · prueba piloto aislada · reversibilidad documentada · **el director confirma el caso de uso**, no solo la herramienta.
3. **Prefiere lo local y lo soberano:** herramienta que corre aquí antes que servicio ajeno; documentación oficial antes que un resumen de tercero; Markdown en disco antes que una aplicación con base de datos propietaria (dentro de diez años el Markdown se sigue leyendo).
4. **Instala solo lo aplicable** en el contenedor del asunto y **registra qué se instaló y por qué**. Una instalación sin motivo escrito se convierte en deuda: nadie sabe si se puede quitar.

## Un aviso sobre lo que parece una barrera y no lo es

Al acotar lo que una sesión puede hacer, **lo que protege son las reglas de denegación** (`deny`) del `settings.json`, no la lista de herramientas concedidas. **Lo que quieras impedir, exprésalo como DENY** — nunca como ausencia del permiso ([[orquestacion_sesiones_por_herramienta]]). Vale igual al elegir herramientas: si una no debe poder tocar los originales, deniégale la carpeta; no confíes en que "no se le ha pedido".

## Salida de esta guía

Una **lista corta de herramientas y piezas a instalar**, cada ítem con su justificación de caso de uso y quién la mantiene. Esa lista alimenta los pasos 5 y 6 de [checklist-arranque.md](checklist-arranque.md).
