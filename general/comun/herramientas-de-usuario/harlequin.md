---
name: harlequin
description: Manual de Harlequin, el cliente SQL de terminal para la persona, con su ejecutable hsql para el agente: instalacion con uv, comprobacion y actualizacion.
type: manual
version: 1.1
---

# Harlequin

## Para qué sirve y quién la usa

Harlequin es un cliente SQL de terminal. La persona lo usa con `harlequin` (interfaz de pantalla completa); el agente, con `hsql`, que ejecuta SQL y sale, con salida legible por máquina. Los dos vienen en el mismo paquete. Por qué esta forma y cómo la usa el vault está en [[herramientas_comunes_de_usuario]].

## Requisitos

- `uv` (gestor de herramientas de Python). Descarga el intérprete que necesite.
- Adaptadores incluidos en el paquete: DuckDB y SQLite. PostgreSQL y MySQL entran con los extras de la orden de instalación.

## Instalación

### macOS

1. `uv tool install 'harlequin[postgres,mysql]'`
2. Los ejecutables quedan en el directorio que da `uv tool dir --bin` (`~/.local/bin`): `harlequin` y `hsql`. Ese directorio tiene que estar en el `PATH`.

Esa orden instala la última versión. Para fijar una versión (por ejemplo, reinstalar la medida abajo): `uv tool install 'harlequin[postgres,mysql]==2.16.2'`.

Skill del agente: `hsql --skill -o ~/.claude/skills/hsql/` [SIN MEDIR]. **No se instala** (general, 2026-10-22): una skill en `~/.claude/skills/` la ven todas las sesiones de la máquina, también las de otros vaults, y ningún asunto consulta hoy una base de datos. La sesión que la necesite la lee en el momento con `hsql --skill`, que la imprime sin instalar nada. Si un día se instala, se habla antes con los generales de los otros vaults.

### Debian

[SIN MANUAL PARA ESTE SISTEMA]

### Windows 11

[SIN MANUAL PARA ESTE SISTEMA]

## Configuración tras instalar

- Fichero de perfiles: `~/.config/harlequin/harlequin.toml`, con `read_only` y `timeout` por perfil y sin secretos dentro (las contraseñas con `${VAR}`). [SIN MEDIR]: el fichero no existe y no se ha creado ni probado. `hsql --config` tiene los modos `show`, `list-profiles`, `validate`, `schema` e `init`.
- La barrera real es un usuario de base de datos con solo SELECT y un tiempo máximo por sentencia asignado a ese usuario; los perfiles son una segunda capa (véase la doctrina enlazada arriba).

## Comprobación

    uv tool list
    harlequin --version
    hsql --version
    hsql --help

- `uv tool list` muestra `harlequin v<versión>` con los ejecutables `harlequin` y `hsql`.
- `harlequin --version` da la versión y la lista de adaptadores instalados (duckdb, sqlite, postgres, mysql). `hsql --version` da `hsql, version <versión>`.
- `hsql --help` lista, entre otras, `--read-only` (`-r`), `--timeout SECONDS`, `--stats`, `--config MODE`, `--skill`, `--info`, `--format`, `--limit`, `--profile` y `--adapter`. Códigos de salida: 0 correcto, 1 error de consulta, 2 uso o configuración, 3 conexión, 4 tiempo agotado.

Prueba con una SQLite en un directorio temporal (`d=$(mktemp -d)`), con `gtimeout 30` delante:

    hsql -a sqlite "$d/t.db" -c "create table t(a int); insert into t values (1),(2);"
    hsql -a sqlite -r "$d/t.db" -c "select * from t" --stats
    hsql -a sqlite -r "$d/t.db" -c "insert into t values (3)"
    hsql --info -a sqlite

- La primera sale con 0. La segunda imprime la tabla con `a`, `1`, `2` y `(2 rows)`, y en stderr una línea JSON con `"status":"ok"`, `"rows":2` y `"truncated":false`.
- La tercera falla con `hsql: error: attempt to write a readonly database` y sale con 1.
- La cuarta imprime JSON; para `sqlite` declara `implements_read_only: true` y `implements_cancel: true`.

[SIN MEDIR]: salida 4 de `--timeout`, `--config show` con la contraseña enmascarada, y el comportamiento de `--read-only` y de la telemetría con los adaptadores postgres y mysql.

## Problemas conocidos

Ninguno medido.

## Actualización

[SIN MEDIR] No se ha ejecutado. Por la vía de uv: `uv tool upgrade harlequin`, o reinstalar con `==<versión>`. Después, repetir la comprobación.

## Desinstalación

[SIN MEDIR] No se ha ejecutado: `uv tool uninstall harlequin`. Quita los dos ejecutables.

## Medido

Medido: 2026-10-22, harlequin 2.16.2, macOS 27.0.1, instalada por IA
