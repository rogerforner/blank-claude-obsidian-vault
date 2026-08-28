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
//   2. AVISA por stdout (que Claude recibe como contexto) de los prompts/briefs TRACKEADOS ya
//      cumplidos, para que el coordinador los quite con `git rm` (con criterio: puede haber en vuelo).
//   3. SELLA LA FECHA del sistema en el contexto (desde 2026-08-23). La sesion no vuelve a deducir
//      que dia es leyendo un fichero: se lo dice una EJECUCION al arrancar. Sale del informe de
//      continuidad, y del caso que lo motivo -- una sesion que arranco desde un handoff fechado y
//      arrastro esa fecha a 38 sitios. Con su limite escrito al lado, que tambien se aprendio
//      caro: esta fecha es la del EQUIPO, asi que sirve para el caso ordinario y NO para dirimir.
//   4. EJECUTA EL VERIFICADOR del kit y avisa SOLO si sale en rojo (desde 2026-08-23). Es el
//      equivalente a la prueba basica de arranque del arnes de referencia: detectar lo que la
//      sesion anterior dejo roto ANTES de tocar nada, en vez de descubrirlo al ir a commitear.
//   5. VUELCA EL TRABAJO EN CURSO de todo el vault (desde 2026-08-23): las lineas abiertas de
//      cada `trabajo-en-curso.md`, el de la raiz y el de cada asunto. Cierra dos huecos que
//      estaban escritos por separado en la cola y eran el mismo: (a) la mejora que pidio el
//      coordinador de `climatizacion` -- antes de mandar un handoff hay que saber si el
//      destinatario ya tiene ese trabajo abierto --, y (b) el buzon para sesiones apagadas,
//      que no necesitaba herramienta nueva porque el fichero YA es un buzon persistente; lo
//      que faltaba era que alguien lo leyera al arrancar sin tener que acordarse.
//      Se busca desde la RAIZ DEL VAULT, no desde el directorio de trabajo, para que un
//      coordinador de asunto vea tambien lo de los demas sin poder escribir en su contenedor.
//   6bis. AVISA DE LOS HANDOFFS VIVOS que hay en tus zonas (desde 2026-08-28). Un handoff se borra
//      cuando esta cumplido -- esa es la regla -- asi que uno que sigue ahi es, por definicion,
//      trabajo sin despachar. Faltaba, y lo destapo el director: se le dejaron dos handoffs a dos
//      coordinadores y las dos sesiones arrancaron SIN ENTERARSE, porque un handoff es un fichero
//      y nadie les dijo que estaba. El aviso cuesta cuatro lineas y cierra el hueco que quedaba
//      del "buzon para sesiones apagadas": el fichero ya era el buzon, pero nadie lo abria.
//   6. DICE SI LA SESION ANTERIOR CERRO SU DoD (desde 2026-08-24). El DoD (`_meta/dod.mjs`) sella
//      una huella del contenido del arbol al cerrar; aqui se compara esa huella con lo que hay.
//      Si no hay sello, o el arbol cambio despues de sellarlo, la anterior cerro sin cruzar la
//      puerta y esta sesion se entera ANTES de tocar nada. El aviso va al arranque a proposito:
//      un hook de cierre no lo lee nadie, y bloquear el cierre castiga al que si esta delante.
//
// Nunca borra nada trackeado. Siempre termina con exit 0 (jamás rompe el arranque).
// Modo prueba: LIMPIEZA_DRY_RUN=1 → reporta lo que borraría, sin borrar.
//
// Se referencia desde el `settings.json` de perfil coordinador:
//   contenedor: node ${CLAUDE_PROJECT_DIR}/../../general/comun/hooks/limpieza-coordinacion.mjs
//   raíz:       node ${CLAUDE_PROJECT_DIR}/general/comun/hooks/limpieza-coordinacion.mjs

import { readdirSync, statSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, basename, dirname } from 'node:path';
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

// Lineas `- [ABIERTO AAAA-MM-DD] ...` de los `trabajo-en-curso.md` del vault. El formato lo
// comprueba el verificador (regla 12): si deriva, el hook deja de leerlas y el aviso se
// perderia EN SILENCIO, que es el peor modo de fallo de una pieza de higiene.
const ABIERTO = /^- \[ABIERTO (\d{4}-\d{2}-\d{2})\] (.+)$/;
function trabajoEnCurso(raiz) {
  if (!raiz) return [];
  const encontrados = [];
  const buscar = (dir, prof) => {
    if (prof > 3) return;
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.isDirectory()) {
        if (SKIP_DIRS.has(e.name)) continue;
        buscar(join(dir, e.name), prof + 1);
      } else if (e.isFile() && e.name === 'trabajo-en-curso.md') {
        encontrados.push(join(dir, e.name));
      }
    }
  };
  buscar(raiz, 0);
  const out = [];
  for (const f of encontrados.sort()) {
    let texto;
    try { texto = readFileSync(f, 'utf8'); } catch { continue; }
    let enEjemplo = false;
    for (const linea of texto.split('\n')) {
      // Las lineas de dentro de un bloque de codigo son el EJEMPLO de formato, no trabajo real.
      if (linea.startsWith('```')) { enEjemplo = !enEjemplo; continue; }
      if (enEjemplo) continue;
      const m = linea.match(ABIERTO);
      if (m) out.push([f, m[1], m[2]]);
    }
  }
  return out;
}

// Estado del sello del DoD de la sesion anterior. Devuelve null si este arbol no usa DoD.
// Se compara por CONTENIDO -- misma huella que escribe `_meta/dod.mjs` -- para que tocar un
// fichero despues de sellar invalide el sello solo, sin que nadie tenga que acordarse.
function estadoDoD(raiz) {
  if (!raiz || !existsSync(join(raiz, '_meta', 'dod.mjs'))) return null;
  const sello = join(raiz, '.dod-seal.json');
  if (!existsSync(sello)) return { ok: false, por: 'no hay sello: la sesion anterior cerro sin correr el DoD' };
  let s;
  try { s = JSON.parse(readFileSync(sello, 'utf8')); } catch { return { ok: false, por: 'el sello esta ilegible' }; }
  let ficheros;
  try {
    // MISMA lista que `_meta/dod.mjs` calcula en su `huella()`: trackeados + nuevos sin ignorar.
    // Si las dos no coinciden, el hook y el DoD dan veredictos distintos sobre el mismo sello, que
    // es el fallo de fuente duplicada que este kit persigue. (La primera version de las dos usaba
    // `ls-files` a secas y dejaba pasar los ficheros nuevos.)
    ficheros = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'],
      { cwd: raiz, encoding: 'utf8' }).split('\n').filter(Boolean).sort();
  } catch { return null; }                                  // sin git no hay nada que comparar
  const h = createHash('sha256');
  let contados = 0;
  for (const f of ficheros) {
    const ruta = join(raiz, f);
    if (!existsSync(ruta)) continue;
    h.update(f); h.update(readFileSync(ruta)); contados++;
  }
  const actual = h.digest('hex').slice(0, 16);
  if (actual === s.hash) return { ok: true, por: `sellado el ${String(s.fecha).slice(0, 16).replace('T', ' ')} sobre ${s.ficheros} ficheros` };
  return { ok: false, por: `el sello es del ${String(s.fecha).slice(0, 16).replace('T', ' ')} y el arbol ha cambiado desde entonces (${s.ficheros} → ${contados} ficheros)` };
}

function main() {
  const files = [];
  for (const z of ZONES) walk(join(ROOT, z), files);
  // NO se sale aqui aunque `files` venga vacio, y esto costo encontrarlo: habia un `return` que
  // cortaba el hook entero cuando no habia ningun .md en `coordinacion/`, `estudios/` ni `_meta/`
  // bajo esta raiz. Pero de las seis cosas que hace este hook, solo las dos primeras -- borrar
  // efimeros y avisar de trackeados -- dependen de esa lista. Las otras cuatro NO: el sello de
  // fecha, el verificador, el volcado de trabajo en curso y el aviso del DoD tienen que salir
  // SIEMPRE. Con el `return`, una sesion abierta en una carpeta sin efimeros arrancaba sin fecha,
  // sin saber si el kit estaba en rojo y sin ver el trabajo en curso de nadie -- y en silencio,
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
    } else if (/brief/i.test(b) && !/-informe\.md$/i.test(b)) {
      const informe = f.replace(/\.md$/i, '-informe.md');
      if (existsSync(informe) && !isIgnored(f)) {
        surfaced.push([f, 'brief ya con informe (git rm)']);
      }
    }
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
  try {
    let dir = ROOT;
    for (let i = 0; i < 4; i++) {
      const v = join(dir, '_meta', 'verificar-kit.mjs');
      if (existsSync(v)) {
        try {
          execFileSync(process.execPath, [v], { encoding: 'utf8', timeout: 20000, stdio: ['ignore', 'pipe', 'ignore'] });
        } catch (e) {
          const salida = (e.stdout || '').trim();
          if (salida) {
            rojo.push('[VERIFICADOR] El kit NO esta en verde AL ARRANCAR, o sea que algo quedo roto de antes. Arreglalo antes de empezar nada nuevo, y no ajustes el verificador para que pase:');
            for (const l of salida.split('\n')) rojo.push('  ' + l);
          }
        }
        break;
      }
      const padre = dirname(dir);
      if (padre === dir) break;
      dir = padre;
    }
  } catch { /* el verificador nunca rompe el arranque */ }

  // --- trabajo en curso de todo el vault (SIEMPRE que haya alguno) ---
  const raiz = raizDelVault();
  const curso = [];
  try {
    const abiertos = trabajoEnCurso(raiz);
    if (abiertos.length) {
      curso.push(`[EN CURSO] ${abiertos.length} trabajo(s) abierto(s) en el vault. Antes de abrir un frente nuevo o de mandar un handoff, mira si ya esta aqui — y si abres uno que sobrevive a tu sesion, anadelo a su fichero en el mismo commit:`);
      for (const [f, fecha, texto] of abiertos) {
        const dueno = f.startsWith(raiz) ? f.slice(raiz.length + 1).replace(/\\/g, '/') : f;
        curso.push(`  - (desde ${fecha}) ${texto}`);
        curso.push(`      ${dueno}`);
      }
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
      dod.push(`[DoD] La sesion anterior NO cerro su Definition of Done — ${e.por}.`);
      dod.push('  Antes de dar por bueno lo que encuentres, corre `node _meta/dod.mjs` y mira que puerta esta en rojo: puede haber efimeros sin retirar, una doctrina cambiada sin subir version, una cola por encima de su techo o trabajo sin commitear.');
    }
  } catch { /* el estado del DoD nunca rompe el arranque */ }

  const salida = [...sello, ...lines, ...rojo, ...curso, ...dod];
  if (salida.length) process.stdout.write(salida.join('\n') + '\n');
}

// No usar process.exit(): trunca el buffer de stdout (Node/Windows con pipe) y se
// perdería el aviso. Salida natural con exitCode 0 → drena stdout antes de terminar.
try { main(); } catch { /* nunca romper el arranque */ }
process.exitCode = 0;
