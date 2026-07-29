# {{ASUNTO}}

> Plantilla del README del contenedor. Parametriza `{{…}}` y borra esta línea al arrancar (checklist paso 1).

Contenedor de **trabajo con IA** del asunto **{{ASUNTO}}** ({{MATERIA}}). Aquí vive toda la documentación y la coordinación del asunto: los documentos que se reciben, los que se producen y las decisiones que se toman.

**Estado en dos líneas:** *{{qué se está haciendo ahora y cuál es el próximo plazo, con su fecha. Se actualiza; no se deja obsoleto.}}*

## Mapa

```
{{SLUG}}/
├── README.md  charter-coordinador.md  CLAUDE.md  cola-pendientes.md
├── .claude/settings.json         aislamiento del coordinador (checklist paso 4)
├── .claude/settings.local.json   rutas de esta máquina — gitignored
├── coordinacion/                 prompts en vuelo + referencia/ (handoffs y buffers, gitignored)
├── docs/                         documentación del asunto + originales recibidos y emitidos
├── estudios/                     estudios/<tema>/ (investigación → decisión)
└── memoria/                      doctrinas instaladas + las propias del asunto
```

**La carpeta `.claude/` no viene en esta plantilla: se crea al instanciar el contenedor.** Sus ficheros se copian desde el inicializador en el paso 4 del checklist — `plantilla-settings-coordinador.json` → `.claude/settings.json`, y `plantilla-settings-consultor.json` → `.claude/settings.consultor.json` si vas a usar consultor. El `settings.local.json` lo escribes tú y **no se versiona**.

## Cómo se usa

- **Los originales son intocables.** Lo que llegó de fuera (escaneo, resolución, acuse, factura firmada) y lo que se entregó se guardan tal cual en `docs/` y no se editan. Si hay que trabajar sobre uno, se trabaja sobre copia.
- **Los plazos viven en `cola-pendientes.md` y en el charter**, con fecha y con el documento del que salen.
- **Entregar fuera es puerta humana**: el agente prepara el envío; el gesto de enviar, presentar o firmar es del director.

## Arranque

Sigue [../../inicializador/checklist-arranque.md](../../inicializador/checklist-arranque.md). Si el asunto ya venía en marcha, pasa antes por [../../inicializador/checklist-migracion-existentes.md](../../inicializador/checklist-migracion-existentes.md).
