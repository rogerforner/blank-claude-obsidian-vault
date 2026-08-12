# Actualizar un vault ya arrancado con esta plantilla

> **Para qué.** Los vaults que ya se crearon desde esta plantilla se quedan con el kit de la fecha en que nacieron. Este contrato pone su kit al día **sin tocar el contenido de sus asuntos**. Lánzalo una vez por vault.
>
> **Cómo se lanza** (ajusta las dos rutas; el `cd` es lo que fija el working dir, no una frase del prompt):
>
> ```bash
> cd "<RUTA_DEL_VAULT_A_ACTUALIZAR>" && claude -p "Ejecuta el contrato descrito en <RUTA_DE_LA_PLANTILLA>/_meta/prompt-actualizar-vault-derivado.md. Escribe tu informe en informe-actualizacion-kit.md" \
>   --add-dir "<RUTA_DE_LA_PLANTILLA>" \
>   --permission-mode dontAsk \
>   --max-turns 120 --max-budget-usd 20.00 \
>   --output-format json
> ```

## Setup

**Working dir:** la raíz del **vault a actualizar** (ahí es donde escribes). La **plantilla** entra por `--add-dir` y es **solo de lectura**: es el origen de las versiones nuevas.

**Fase: tanda de fase única declarada.** No lleva fase de análisis previa, y el motivo es que la decisión ya está tomada y el trabajo es mecánico: **manda el catálogo de la plantilla y se sobrescribe**. Lo que en otra tanda haría el fichero de plan —destapar premisas falsas— aquí lo cubre el **inventario de versiones** que produces tú mismo en el paso 1 y que va en el informe.

## Objetivo

Que el kit de este vault quede **idéntico** al de la plantilla, que el informe diga exactamente qué se movió, y que las configuraciones que dependen de datos con caducidad queden **señaladas para revisión humana** — no cambiadas por tu cuenta.

## Alcance

**SÍ entra** (se sobrescribe con la versión de la plantilla, sin preguntar):

- `general/` completo: doctrinas del core, el pack `codigo/`, los dos índices, los README y el hook.
- `inicializador/` completo: plantillas y checklists.
- **El `CLAUDE.md` de la raíz del vault**, el fichero canónico completo.
- `_meta/guia-arranque-sesiones.md`.
- `_meta/verificar-kit.mjs` (si no existe, se crea).

**NO entra, no lo toques aunque lo veas:**

- **Todo `asuntos/**`**, salvo lo que dice el paso 3. Ahí vive el trabajo real: documentos, originales, colas, charters, notas. **Nada de eso se sobrescribe jamás.**
- `_meta/bitacora.md`, `_meta/cola-pendientes.md`, `_meta/decisiones-abiertas.md`, `_meta/charter-coordinador.md`: son el estado propio de ESE vault.
- Cualquier `settings.local.json` (son de la máquina) y cualquier fichero gitignored.

## Pasos

### 1. Inventario ANTES (esto es lo que hace útil el informe)

Para cada `.md` con frontmatter en `general/` de los dos lados, extrae `name` y `version` y compón una tabla **vault / plantilla**, marcando: `igual`, `desfasado (v_vieja → v_nueva)`, `falta en el vault`, `sobra en el vault`. Cuenta también los ficheros de cada lado. Guarda la tabla: va entera en el informe.

### 2. Sobrescribir el kit

Copia desde la plantilla al vault todo lo del apartado "SÍ entra", **reemplazando**. Si un fichero del vault estaba modificado localmente, **se pierde esa modificación**: es la decisión tomada, y el inventario del paso 1 deja constancia de cuál era. Si en el vault hay doctrinas que **ya no existen** en la plantilla, no las borres: **lístalas** como "sobra en el vault" y deja que las revise una persona.

### 3. Retirar las copias de doctrinas dentro de los asuntos

La política cambió: **el catálogo se lee, no se copia** (ver `estructura_contenedor_asunto`). En cada `asuntos/*/memoria/`:

- Si un fichero es **copia de una doctrina del catálogo** (mismo nombre que una pieza de `general/`), **retíralo**: ya no aporta y su desfase miente. Anótalo en el informe.
- Si un fichero es **propio del asunto** (no existe en el catálogo), **déjalo intacto**: ese es justamente el contenido para el que existe `memoria/`.
- Si el `memoria/README.md` describe el modelo viejo ("doctrinas instaladas por copia"), actualízalo para decir que el catálogo se lee y que ahí solo van las propias del asunto.

### 4. Configuraciones a REVISAR (informe, no cambio automático)

No cambies nada de esto: **encuéntralo y repórtalo** con su ubicación exacta.

- **Rutas de otra máquina.** Busca en todo el vault, incluidos los ficheros no versionados, patrones de ruta absoluta de usuario (`C:\Users\…`, `/home/…`, `/Users/…`) y nombres de máquinas o proyectos que no sean de este vault. Un `settings.local.json` heredado de otro equipo apunta a carpetas que aquí no existen, y falla en silencio.
- **Datos con fecha de caducidad en `modelo_por_tarea`.** La doctrina cita una **ampliación de límites de uso vigente hasta el 19-ago-2026** y un **bug de plataforma por número**. Ambos son ciertos a fecha de escritura y **caducan**: compruébalos en la fuente oficial antes de darlos por buenos, y dilo en el informe si ya han vencido.
- **El veto a `/fast`, marcado `[A CONFIRMAR]`.** La doctrina lo veta porque consumía *usage credits*, y lo hace cumplir `env.CLAUDE_CODE_DISABLE_FAST_MODE = "1"` en `.claude/settings.json`. **La descripción actual del modo rápido dice que usa el modelo grande con salida más rápida y que no lo degrada**, así que el motivo del veto puede haber dejado de aplicar. **No lo cambies**: verifícalo en la documentación oficial y reporta qué encontraste, para que la decisión la tome una persona con el dato delante.
- **El `env` y las deny rules del `.claude/settings.json`** del vault: compara con el de la plantilla y **lista las diferencias**. Las deny rules son la única barrera real (`--allowedTools` concede, no restringe), así que una diferencia ahí importa; pero puede ser deliberada de este vault.

### 5. Comprobar

Ejecuta `node _meta/verificar-kit.mjs` en el vault actualizado y **pega el output literal** en el informe. Si sale en rojo, corrige y vuelve a ejecutar; **no ajustes el verificador para que pase**.

## Definition of done

```
node _meta/verificar-kit.mjs          # tiene que salir VERDE
git status --short                     # solo los ficheros del kit + el informe
find . -name AGENTS.md -not -path "./.git/*"                                                # no debe devolver nada
```

## Reporta al cerrar

1. La **tabla de inventario** antes/después, completa.
2. Los ficheros **sobrescritos**, y cuáles de ellos estaban **modificados localmente** (lo que se ha perdido).
3. Las copias de doctrinas **retiradas** de los asuntos, y las que se dejaron por ser propias.
4. La lista de **configuraciones a revisar** del paso 4, con ubicación y qué hay que comprobar en cada una.
5. El **output literal** del verificador.
6. Lo que **NO** hiciste y por qué.

## Puertas humanas (no las cruces)

No borres nada de `asuntos/**` que no sea una copia de doctrina del catálogo. No cambies decisiones de configuración marcadas `[A CONFIRMAR]`. No hagas commit de material que contenga datos personales sin que una persona lo apruebe.
