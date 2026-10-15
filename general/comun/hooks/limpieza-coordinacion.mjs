#!/usr/bin/env node
// general/comun/hooks/limpieza-coordinacion.mjs
//
// Hook SessionStart de higiene de coordinación (doctrina convencion_organizacion_carpeta_trabajo).
// Al arrancar/reanudar una sesión de coordinación:
//   1. AUTO-BORRA los handoffs y buffers `tmp-otros-actual.md` que estén GITIGNORED y ya no sirvan
//      → cero impacto en git. Un handoff ya no sirve por dos motivos independientes:
//        a) SUPERADO: hay otro más reciente en su misma serie.
//        b) CADUCADO: tiene más de DIAS_VIVO días, aunque sea el único de su serie.
//      El (b) existe porque el (a) solo por sí mismo deja un agujero: una serie de UN SOLO
//      elemento nunca tiene sucesor, así que su handoff se conservaba para siempre. Medido en el
//      vault el 2026-08-12: seis handoffs de julio vivos en dos contenedores, cada uno con un
//      nombre distinto y por tanto cada uno su propia serie de uno.
//      Lo de HOY nunca se toca, pase lo que pase.
//   2. AVISA por stdout (que Claude recibe como contexto) de los efimeros TRACKEADOS ya cumplidos,
//      para que el coordinador los quite con `git rm` (con criterio: puede haber en vuelo). Son
//      cuatro formas, todas de fecha distinta de hoy y en cualquier zona:
//        a) un `prompt*` de `coordinacion/` (se avisa siempre, esta o no su informe);
//        b) un `brief*.md` con su `<brief>-informe.md` al lado;
//        c) un `<base>_prompt.md` cuando existe `<base>_informe.md` o `<base>_prompt_informe.md`
//           en la misma carpeta (el prompt de un estudio ya con informe);
//        d) un `brief.md` cuando existe `informe.md` o algun `informe-*.md` en la misma carpeta.
//      Cada fichero se lista una sola vez. Se mira SOLO bajo la raiz de la sesion: cada contenedor
//      ve lo suyo (decision D5 del director, 2026-10-05).
//   3. SELLA LA FECHA del sistema en el contexto (desde 2026-08-23). La sesion no vuelve a deducir
//      que dia es leyendo un fichero: se lo dice una EJECUCION al arrancar. Sale del informe de
//      continuidad, y del caso que lo motivo -- una sesion que arranco desde un handoff fechado y
//      arrastro esa fecha a 38 sitios. Con su limite escrito al lado, que tambien se aprendio
//      caro: esta fecha es la del EQUIPO, asi que sirve para el caso ordinario y NO para dirimir.
//   4. EJECUTA EL VERIFICADOR del kit y avisa SOLO si sale en rojo EN TU AMBITO (desde 2026-08-23;
//      acotado el 2026-10-05 por la decision D5: los hallazgos ajenos ni se muestran). Es el
//      equivalente a la prueba basica de arranque del arnes de referencia: detectar lo que la
//      sesion anterior dejo roto ANTES de tocar nada, en vez de descubrirlo al ir a commitear.
//   5. VUELCA EL ESTADO del PROPIO ambito (`[ESTADO]`, con `estado.mjs`; desde 2026-08-23 como
//      trabajo en curso, acotado el 2026-10-05 por la decision D5: cada coordinador ve solo lo suyo).
//      Un ambito sin `estado.json` recibe la linea que dice como crearlo. Una sesion fuera de la raiz
//      y de un asunto no tiene rol: ni volcado ni hallazgos, solo la linea `[AMBITO]`. Antes de mandar
//      un handoff a otro coordinador se mira el suyo en ese momento, con `estado.mjs --de`. Cierra dos
//      huecos que estaban escritos por separado en la cola y eran el mismo: (a) la mejora que pidio el
//      coordinador de `climatizacion` -- antes de mandar un handoff hay que saber si el
//      destinatario ya tiene ese trabajo abierto --, y (b) el buzon para sesiones apagadas,
//      que no necesitaba herramienta nueva porque el fichero YA es un buzon persistente; lo
//      que faltaba era que alguien lo leyera al arrancar sin tener que acordarse.
//   6bis. AVISA DE LOS HANDOFFS VIVOS que hay en tus zonas (desde 2026-08-28). Un handoff se borra
//      cuando esta cumplido -- esa es la regla -- asi que uno que sigue ahi es, por definicion,
//      trabajo sin despachar. Faltaba, y lo destapo el director: se le dejaron dos handoffs a dos
//      coordinadores y las dos sesiones arrancaron SIN ENTERARSE, porque un handoff es un fichero
//      y nadie les dijo que estaba. El aviso cuesta cuatro lineas y cierra el hueco que quedaba
//      del "buzon para sesiones apagadas": el fichero ya era el buzon, pero nadie lo abria.
//   6. DICE SI LA SESION ANTERIOR CERRO SU DoD (desde 2026-08-24; por ambito desde 2026-10-15).
//      El DoD (`_meta/dod.mjs`) sella, al cerrar, una huella del contenido de los ficheros de SU
//      ambito (el general, `_meta/dod-sello.local.json`; un asunto, el de su `coordinacion/`); aqui
//      se compara con lo que hay en el ambito de esta sesion, con `scripts/sello-dod.mjs`, asi que
//      un commit de otro ambito no caduca tu sello. Con un ambito invalido no hay aviso.
//      Si no hay sello, o el ambito cambio despues de sellarlo, la anterior cerro sin cruzar la
//      puerta y esta sesion se entera ANTES de tocar nada. El aviso va al arranque a proposito:
//      un hook de cierre no lo lee nadie, y bloquear el cierre castiga al que si esta delante.
//
//   7. DICE QUE CUENTA USA LA SESION (CUENTA). Una linea `[CUENTA] <authMethod> · <plan> · <org> ·
//      config: <dir>` leida de `claude auth status --json` (sin correo ni orgId), y un AVISO si
//      la sesion puede facturar por API: `loggedIn` distinto de true, `authMethod` distinto de
//      `claude.ai`, o alguna de ANTHROPIC_API_KEY / ANTHROPIC_AUTH_TOKEN / CLAUDE_CODE_OAUTH_TOKEN
//      en el entorno (ganan al login). Solo informa y no bloquea; si `claude` falla, lo dice y
//      sigue. No corre en modo lista.
//
// Nunca borra nada trackeado. Siempre termina con exit 0 (jamás rompe el arranque).
// Modo prueba: LIMPIEZA_DRY_RUN=1 → reporta lo que borraría, sin borrar.
//
// Se referencia desde el `settings.json` de perfil coordinador:
//   contenedor: node ${CLAUDE_PROJECT_DIR}/../../general/comun/hooks/limpieza-coordinacion.mjs
//   raíz:       node ${CLAUDE_PROJECT_DIR}/general/comun/hooks/limpieza-coordinacion.mjs

import { readdirSync, statSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join, basename, dirname, relative } from 'node:path';
import { homedir } from 'node:os';
import { execFileSync } from 'node:child_process';

const DRY = process.env.LIMPIEZA_DRY_RUN === '1';
// Modo utilitario: imprime SOLO las rutas trackeadas obsoletas (una por línea), no borra nada.
// Uso para limpieza manual:  LIMPIEZA_LIST_TRACKED=1 node <script> | while IFS= read -r f; do git rm -- "$f"; done
const LIST = process.env.LIMPIEZA_LIST_TRACKED === '1';
const NO_DELETE = DRY || LIST;
const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const ZONES = ['coordinacion', 'estudios', '_meta'];
// Días que se conserva un handoff que sigue siendo el más reciente de su serie. Un handoff sirve
// hasta que arranca la sesión siguiente; dos semanas es margen de sobra y evita que un fichero
// efímero se quede vivo indefinidamente solo porque nadie escribió otro con su mismo nombre.
const DIAS_VIVO = 14;
const MS_VIVO = DIAS_VIVO * 24 * 60 * 60 * 1000;
const SKIP_DIRS = new Set(['cerrados', 'node_modules', '.git', '.claude', 'docs', 'referencia']);

function todayStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function walk(dir, out) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(full, out);
    } else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) {
      out.push(full);
    }
  }
}

function hermanos(dir) {
  try { return readdirSync(dir); } catch { return []; }
}

function isIgnored(file) {
  // git check-ignore: exit 0 = ignorado; exit 1 = no ignorado; error = asumir NO ignorado (seguro).
  try {
    execFileSync('git', ['check-ignore', '-q', file], { cwd: ROOT, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function mtimeOf(file) {
  try { return statSync(file).mtime; } catch { return new Date(0); }
}

// Clave de serie de un handoff: nombre sin la fecha final (para agrupar series paralelas).
function seriesKey(file) {
  const b = basename(file).replace(/\.md$/i, '');
  const stripped = b.replace(/[-_]?\d{4}-\d{2}-\d{2}.*$/, '');
  return dirname(file) + '::' + (stripped || b);
}

// Raiz del vault: la carpeta que contiene `_meta/verificar-kit.mjs`, subiendo desde ROOT.
// Un coordinador de asunto arranca con ROOT en su contenedor, asi que sin esto solo veria
// lo suyo -- y el aviso serviria justo para lo contrario de para lo que existe.
function raizDelVault() {
  let dir = ROOT;
  for (let i = 0; i < 4; i++) {
    if (existsSync(join(dir, '_meta', 'verificar-kit.mjs'))) return dir;
    const padre = dirname(dir);
    if (padre === dir) break;
    dir = padre;
  }
  return null;
}

// AMBITO de la sesion (decision D5): un asunto responde de `<espacio>/<slug>/`; la raiz, de todo lo
// que no esta bajo un asunto. Lo calcula `scripts/espacios.mjs`, cargado con import() dinamico
// dentro de try (ruta relativa a este fichero) para que un fallo de carga no rompa el arranque.
// Si no carga, o ROOT no es la raiz ni un asunto, el ambito es invalido y no pasa nada.
let ESP = null;
try { ESP = await import(new URL('../scripts/espacios.mjs', import.meta.url).href); } catch { /* ambito invalido */ }
// Estado por comando (`scripts/estado.mjs`), cargado igual: si no carga, el volcado de estado no sale.
let EST = null;
try { EST = await import(new URL('../scripts/estado.mjs', import.meta.url).href); } catch { /* sin volcado de estado */ }
// Sello del DoD por ambito (`scripts/sello-dod.mjs`), cargado igual: si no carga, no hay aviso.
let SELLO = null;
try { SELLO = await import(new URL('../scripts/sello-dod.mjs', import.meta.url).href); } catch { /* sin aviso del DoD */ }
const INVALIDO = { tipo: 'invalido' };
function ambitoDeLaSesion(raiz) {
  try { return raiz && ESP ? ESP.ambitoDe(raiz, ROOT) : INVALIDO; } catch { return INVALIDO; }
}
function esDelAmbito(ambito, ruta) {
  try { return ambito.tipo !== 'invalido' && ESP.esDelAmbito(ambito, ruta, ESP.listarAsuntos(raizDelVault())); } catch { return false; }
}

// Estado del sello del DoD de la sesion anterior, en SU ambito. Devuelve null si este arbol no usa
// DoD o el ambito es invalido. La huella y el veredicto viven en `scripts/sello-dod.mjs`, que
// comparten `_meta/dod.mjs` y `relevo.mjs`: asi los tres dan el mismo veredicto sobre el mismo sello.
function estadoDoD(raiz) {
  if (!raiz || !SELLO) return null;
  const ambito = ambitoDeLaSesion(raiz);
  if (ambito.tipo === 'invalido') return null;
  return SELLO.estadoSello(raiz, ambito);
}

// Cuenta con la que arranca la sesion. Devuelve lineas y NUNCA lanza. No imprime correo ni orgId.
const VARS_FACTURACION = ['ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN', 'CLAUDE_CODE_OAUTH_TOKEN'];
function cuenta() {
  const out = [];
  try {
    const motivos = [];
    for (const v of VARS_FACTURACION) if (process.env[v]) motivos.push(`${v} en el entorno`);
    try {
      const j = JSON.parse(execFileSync('claude', ['auth', 'status', '--json'],
        { encoding: 'utf8', timeout: 5000, stdio: ['ignore', 'pipe', 'ignore'] }));
      const home = homedir();
      let dir = String(j.configDirectory ?? '?');
      if (dir === home || dir.startsWith(home + '/')) dir = '~' + dir.slice(home.length);
      // En cuentas personales orgName es "<correo>'s Organization": el correo no se imprime.
      const org = /@/.test(String(j.orgName ?? '')) ? '(organizacion personal)' : String(j.orgName ?? '?');
      out.push(`[CUENTA] ${j.authMethod ?? '?'} · ${j.subscriptionType ?? '?'} · ${org} · config: ${dir}`);
      if (j.loggedIn !== true) motivos.push('loggedIn no es true');
      if (j.authMethod !== 'claude.ai') motivos.push(`authMethod es ${j.authMethod ?? 'desconocido'}`);
    } catch {
      out.push('[CUENTA] No se pudo leer la cuenta (claude auth status fallo); compruebala con /status.');
    }
    if (motivos.length) out.push(`[CUENTA] AVISO: esta sesion puede facturar por API sin avisar (${motivos.join('; ')}). No lances claude -p ni tandas hasta aclararlo con el director.`);
  } catch { /* la cuenta nunca rompe el arranque */ }
  return out;
}

function main() {
  const files = [];
  for (const z of ZONES) walk(join(ROOT, z), files);
  // NO se sale aqui aunque `files` venga vacio, y esto costo encontrarlo: habia un `return` que
  // cortaba el hook entero cuando no habia ningun .md en `coordinacion/`, `estudios/` ni `_meta/`
  // bajo esta raiz. Pero de las seis cosas que hace este hook, solo las dos primeras -- borrar
  // efimeros y avisar de trackeados -- dependen de esa lista. Las otras cuatro NO: el sello de
  // fecha, el verificador, el volcado del estado y el aviso del DoD tienen que salir
  // SIEMPRE. Con el `return`, una sesion abierta en una carpeta sin efimeros arrancaba sin fecha,
  // sin saber si el kit estaba en rojo y sin ver el estado de nadie -- y en silencio,
  // que es el peor modo de fallo para una pieza cuyo trabajo es avisar. Lo cazo una tanda de
  // extraccion del propio metodo (2026-08-27) leyendo el codigo, no usandolo: por definicion,
  // el caso que rompe es aquel en el que el hook no dice nada.

  const today = todayStr();
  const deleted = [];
  const surfaced = [];

  // --- 1. Handoffs + tmp gitignored superados → auto-borrar ---
  const handoffs = files.filter((f) => /^handoff[-_]/i.test(basename(f)));
  const groups = new Map();
  for (const f of handoffs) {
    const k = seriesKey(f);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(f);
  }
  const ahora = Date.now();
  for (const [, group] of groups) {
    group.sort((a, b) => mtimeOf(b) - mtimeOf(a)); // más reciente primero
    const newest = group[0];
    for (const f of group) {
      const st = statSync(f);
      if (st.mtime.toISOString().slice(0, 10) === today) continue; // lo de hoy no se toca nunca
      const caducado = ahora - st.mtime.getTime() > MS_VIVO;
      if (f === newest && !caducado) continue; // el vivo de la serie se conserva mientras no caduque
      if (!isIgnored(f)) { surfaced.push([f, 'handoff TRACKEADO (revisar)']); continue; }
      if (!NO_DELETE) { try { rmSync(f); } catch { continue; } }
      deleted.push(f);
    }
  }
  for (const f of files.filter((x) => basename(x).toLowerCase() === 'tmp-otros-actual.md')) {
    const st = statSync(f);
    if (st.mtime.toISOString().slice(0, 10) === today) continue;
    if (!isIgnored(f)) continue;
    if (!NO_DELETE) { try { rmSync(f); } catch { continue; } }
    deleted.push(f);
  }

  // --- 2. Prompts + briefs-con-informe trackeados y no-de-hoy → avisar (no borrar) ---
  // `files` se listó ANTES de borrar, así que aquí ya hay rutas muertas. Sin este filtro, el
  // primer statSync sobre una de ellas lanza ENOENT, el catch de main() se lo traga y se pierde
  // TODO el informe -- de modo que el hook solo informaba las veces que NO borraba nada, que es
  // justo al revés de lo que hace falta. Detectado el 2026-08-12 probando el borrado de verdad.
  for (const f of files.filter((x) => existsSync(x))) {
    const b = basename(f);
    const st = statSync(f);
    const isToday = st.mtime.toISOString().slice(0, 10) === today;
    if (isToday) continue;
    if (/^prompt/i.test(b) && f.includes(`${'coordinacion'}`)) {
      if (isIgnored(f)) continue; // solo trackeados
      surfaced.push([f, 'prompt ejecutado (git rm si ya cumplido)']);
      continue;
    }
    const dir = dirname(f);
    let motivo = null;
    if (/brief/i.test(b) && !/-informe\.md$/i.test(b) &&
        existsSync(f.replace(/\.md$/i, '-informe.md'))) {
      motivo = 'brief ya con informe (git rm)';
    } else if (/^brief\.md$/i.test(b) && hermanos(dir).some((n) => /^informe\.md$/i.test(n) || /^informe-.*\.md$/i.test(n))) {
      motivo = 'brief ya con informe (git rm)';
    } else if (/_prompt\.md$/i.test(b)) {
      const base = b.replace(/_prompt\.md$/i, '');
      if (existsSync(join(dir, `${base}_informe.md`)) || existsSync(join(dir, `${base}_prompt_informe.md`))) {
        motivo = 'prompt de estudio ya con informe (git rm)';
      }
    }
    if (motivo && !isIgnored(f) && !surfaced.some(([x]) => x === f)) surfaced.push([f, motivo]);
  }

  // Modo lista: solo rutas trackeadas obsoletas, sin decoración (para `git rm`).
  if (LIST) {
    for (const [f] of surfaced) process.stdout.write(f + '\n');
    return;
  }

  // --- sello de fecha (SIEMPRE, haya o no hallazgos) ---
  // Es lo primero que se emite a proposito: quien lea el contexto ve el marco temporal antes
  // que cualquier otra cosa. Y lleva su propia advertencia de alcance, porque una fecha que se
  // presenta sin limites se usa para todo -- incluido aquello para lo que no vale.
  const sello = [];
  try {
    const ahora = new Date();
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const iso = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString();
    sello.push(`[FECHA] Hoy es ${dias[ahora.getDay()]} ${iso.slice(0, 10)}, ${iso.slice(11, 16)} (reloj de ESTE equipo, leido al arrancar).`);
    sello.push('  No deduzcas la fecha de ningun fichero, ni del nombre de un handoff: usa esta. Para DIRIMIR una duda sobre fechas ya escritas, esta no vale — cuelga del mismo reloj que estarias poniendo en duda, y hace falta un testigo externo a la maquina.');
  } catch { /* el sello nunca rompe el arranque */ }

  // --- salida (stdout → contexto de Claude) ---
  const rel = (f) => f.startsWith(ROOT) ? f.slice(ROOT.length + 1).replace(/\\/g, '/') : f;
  const lines = [];
  if (deleted.length) {
    lines.push(`[HIGIENE] Coordinación: ${DRY ? '[DRY-RUN] borraría' : 'borrados'} ${deleted.length} handoff/buffer superado(s) (gitignored, cero impacto git):`);
    for (const f of deleted) lines.push(`  - ${rel(f)}`);
  }
  if (surfaced.length) {
    lines.push(`[AVISO] Higiene de coordinación: ${surfaced.length} fichero(s) trackeado(s) probablemente obsoleto(s). Revísalos y quita con \`git rm\` los ya cumplidos (git conserva el histórico); CONSERVA los que sigan en vuelo. Doctrina: convencion_organizacion_carpeta_trabajo.`);
    for (const [f, why] of surfaced) lines.push(`  - ${rel(f)}  (${why})`);
  }
  // --- verificador del kit al arrancar (solo avisa si sale en ROJO) ---
  // Se busca subiendo desde el directorio de trabajo: la raiz del vault lo tiene en `_meta/`,
  // y un contenedor de asunto lo alcanza subiendo dos niveles. Si no aparece, no pasa nada.
  const rojo = [];
  if (ambitoDeLaSesion(raizDelVault()).tipo === 'invalido') {
    rojo.push('[AMBITO] Esta sesion no esta en la raiz del vault ni en <espacio>/<asunto>: no tiene rol, y no se vuelcan estado ni hallazgos del verificador.');
  }
  try {
    let dir = ROOT;
    for (let i = 0; i < 4; i++) {
      const v = join(dir, '_meta', 'verificar-kit.mjs');
      if (existsSync(v)) {
        try {
          execFileSync(process.execPath, [v], { encoding: 'utf8', timeout: 20000, stdio: ['ignore', 'pipe', 'ignore'] });
        } catch (e) {
          // Solo los hallazgos (`  [regla] ruta :: detalle`) cuya ruta es de MI ambito (D5): los
          // ajenos ni se muestran. Sin ninguno mio, el kit esta "en verde para tu ambito".
          const ambito = ambitoDeLaSesion(raizDelVault());
          const propios = (e.stdout || '').split('\n')
            .filter((l) => /^\s*\[[^\]]+\] (\S+) ::/.test(l))
            .filter((l) => esDelAmbito(ambito, l.match(/^\s*\[[^\]]+\] (\S+) ::/)[1]));
          if (propios.length) {
            rojo.push('[VERIFICADOR] El kit NO esta en verde AL ARRANCAR en tu ambito, o sea que algo quedo roto de antes. Arreglalo antes de empezar nada nuevo, y no ajustes el verificador para que pase:');
            for (const l of propios) rojo.push('  ' + l.trim());
          } else if (ambito.tipo !== 'invalido') {
            rojo.push('[VERIFICADOR] El kit esta en verde para tu ambito.');
          }
        }
        break;
      }
      const padre = dirname(dir);
      if (padre === dir) break;
      dir = padre;
    }
  } catch { /* el verificador nunca rompe el arranque */ }

  // --- estado del propio ambito (SIEMPRE: sin estado.json tambien se avisa) ---
  const raiz = raizDelVault();
  const curso = [];
  try {
    const ambito = ambitoDeLaSesion(raiz);
    const rutaEst = EST && raiz && (ambito.tipo === 'general' || ambito.tipo === 'asunto') ? EST.rutaEstado(raiz, ambito) : null;
    if (rutaEst && existsSync(rutaEst)) {
      let est = null;
      try { est = EST.leer(rutaEst); } catch (e) {
        curso.push(`[ESTADO] ERROR: no se puede leer ${relative(raiz, rutaEst).replace(/\\/g, '/')} (${e.message}); corre estado.mjs --verificar antes de seguir.`);
      }
      const n = est && Array.isArray(est.elementos) ? est.elementos.filter((e) => EST.ACTIVAS.includes(e.situacion)).length : 0;
      if (est && n) {
        curso.push(`[ESTADO] ${n} elemento(s) activo(s) en tu ambito. El detalle de uno, con estado.mjs --id <Id>; el de otro coordinador, con estado.mjs --de <espacio>/<asunto> antes de mandarle un handoff; lo que abras o cierres va al estado en el mismo commit:`);
        for (const l of EST.vista(est).split('\n')) curso.push('  ' + l);
      } else if (est) curso.push('[ESTADO] Nada activo en tu ambito.');
    } else if (rutaEst) {
      curso.push('[ESTADO] Tu ámbito no tiene estado.json: créalo con estado.mjs --iniciar.');
    }
  } catch { /* el volcado nunca rompe el arranque */ }

  // --- handoffs vivos: los que quedaron tras la limpieza del punto 1 ---
  // `handoffs` se listo ANTES de borrar, asi que se filtra por lo que sigue existiendo. No se
  // intenta adivinar si ya se leyo: la regla es que un handoff cumplido se BORRA, asi que uno
  // vivo es trabajo pendiente y avisar de el nunca es ruido.
  const pendientes = [];
  try {
    for (const f of handoffs) {
      if (!existsSync(f)) continue;                       // borrado hace un momento por superado
      pendientes.push(rel(f));
    }
    if (pendientes.length) {
      lines.push(`[HANDOFF] ${pendientes.length} handoff(s) sin despachar. Un handoff cumplido se BORRA, asi que si sigue aqui es trabajo pendiente — leelo antes de entrar en materia y borralo al cumplirlo:`);
      for (const f of pendientes) lines.push(`  - ${f}`);
    }
  } catch { /* el aviso nunca rompe el arranque */ }

  // --- estado del DoD de la sesion anterior ---
  const dod = [];
  try {
    const e = estadoDoD(raiz);
    if (e && !e.ok) {
      dod.push(`[DoD] La sesion anterior de tu ambito NO cerro su Definition of Done — ${e.por}.`);
      dod.push('  Antes de dar por bueno lo que encuentres, corre `node _meta/dod.mjs` (desde la raiz) o `node ../../_meta/dod.mjs` (desde un asunto) y mira que puerta esta en rojo: puede haber efimeros sin retirar, una doctrina cambiada sin subir version, una cola por encima de su techo o trabajo sin commitear.');
    }
  } catch { /* el estado del DoD nunca rompe el arranque */ }

  const cuentaLineas = cuenta();
  const salida = [...sello, ...cuentaLineas, ...lines, ...rojo, ...curso, ...dod];
  if (salida.length) process.stdout.write(salida.join('\n') + '\n');
}

// No usar process.exit(): trunca el buffer de stdout (Node/Windows con pipe) y se
// perdería el aviso. Salida natural con exitCode 0 → drena stdout antes de terminar.
try { main(); } catch { /* nunca romper el arranque */ }
process.exitCode = 0;
