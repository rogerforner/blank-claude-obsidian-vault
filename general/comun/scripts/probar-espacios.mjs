#!/usr/bin/env node
// probar-espacios.mjs: humo de la estructura en espacios. Construye en un temporal, fuera del
// vault, dos vaults de prueba con copias de los scripts reales y comprueba el modulo espacios.mjs
// (casos M) y que el hook, el DoD, el tablero y el verificador respetan los espacios (H, D, T, V, G),
// y el sello del DoD por ambito (S y H9) y las precondiciones de relevo.mjs --comprobar (R).
// Sin dependencias. Salidas: 0 si todos los casos pasan, 1 si alguno falla, 2 uso.
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync, realpathSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const REAL = path.resolve(AQUI, '..', '..', '..');
const EST = await import(pathToFileURL(path.join(AQUI, 'estado.mjs')).href);
const ESPACIOS = await import(pathToFileURL(path.join(AQUI, 'espacios.mjs')).href);

const AYUDA = `Uso:
  probar-espacios.mjs [--casos <M,H,V2,...>]
  probar-espacios.mjs --ayuda
Sin --casos corre todos (M, H, D, T, V, G, S, R). --casos filtra por prefijo o por id suelto.
Salidas: 0 todos bien, 1 algun caso falla, 2 uso.`;

class Salida extends Error { constructor(codigo, msg) { super(msg); this.codigo = codigo; } }

const CABECERA = '| Id | Bloque | Objetivo | Ficheros | Ejecuta | Depende de | Estado |';
const SEPARADOR = '|---|---|---|---|---|---|---|';
const TABLERO = `# Tablero de tandas

Plan: ninguno
Paradas: ninguna

${CABECERA}
${SEPARADOR}
`;

const marca = (tipo, nombre) => `---\ntipo: ${tipo}\n---\n# ${nombre}\n`;

function escribir(raiz, rel, texto) {
  const f = path.join(raiz, rel);
  mkdirSync(path.dirname(f), { recursive: true });
  writeFileSync(f, texto);
}

function correr(cmd, args, cwd, env) {
  const r = spawnSync(cmd, args, { cwd, env: { ...process.env, ...(env || {}) }, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, input: '' });
  return { codigo: r.status === null ? 1 : r.status, salida: (r.stdout || '') + (r.stderr || '') };
}

const node = (args, cwd, env) => correr(process.execPath, args, cwd, env);
const git = (cwd, ...args) => correr('git', ['-c', 'user.name=prueba', '-c', 'user.email=prueba@localhost', '-c', 'commit.gpgsign=false', ...args], cwd);
// El primer commit va con fecha pasada: las puertas de documentacion del DoD miran los commits de
// hoy, y la siembra no debe contar como trabajo de la sesion.
const FECHA_SIEMBRA = { GIT_AUTHOR_DATE: '2026-01-01T00:00:00', GIT_COMMITTER_DATE: '2026-01-01T00:00:00' };
const gitSiembra = (cwd, ...args) => correr('git', ['-c', 'user.name=prueba', '-c', 'user.email=prueba@localhost', '-c', 'commit.gpgsign=false', ...args], cwd, FECHA_SIEMBRA);

function confirmar(r, que) {
  if (r.codigo !== 0) throw new Error(`${que} fallo al preparar el vault de prueba: ${r.salida.trim()}`);
}

function confirmarGit(cwd, ...args) { confirmar(git(cwd, ...args), `git ${args[0]}`); }

// Copia lo que el vault real aporta al de prueba: el catalogo, el inicializador y los scripts de _meta.
function copiarBase(destino) {
  for (const d of ['general', 'inicializador']) cpSync(path.join(REAL, d), path.join(destino, d), { recursive: true, filter: (s) => path.basename(s) !== '.DS_Store' });
  mkdirSync(path.join(destino, '_meta'), { recursive: true });
  for (const f of readdirSync(path.join(REAL, '_meta')).filter((n) => n.endsWith('.mjs'))) cpSync(path.join(REAL, '_meta', f), path.join(destino, '_meta', f));
  for (const f of ['CLAUDE.md', '.gitignore']) cpSync(path.join(REAL, f), path.join(destino, f));
}

function asunto(raiz, espacio, slug, que) {
  const base = `${espacio}/${slug}`;
  escribir(raiz, `${base}/charter-coordinador.md`, `# Charter de ${slug}\n`);
  escribir(raiz, `${base}/cola-pendientes.md`, `# Cola de ${slug}\n`);
  estadoActivo(raiz, base, `marca-${que}`);
  escribir(raiz, `${base}/coordinacion/tablero-tandas.md`, TABLERO);
}

function vault1(dir) {
  copiarBase(dir);
  escribir(dir, 'esp-uno/README.md', marca('espacio', 'esp-uno'));
  escribir(dir, 'esp-dos/README.md', marca('espacio', 'esp-dos'));
  escribir(dir, 'adjuntos/README.md', marca('libre', 'adjuntos'));
  asunto(dir, 'esp-uno', 'a1', 'uno');
  asunto(dir, 'esp-dos', 'b1', 'dos');
  estadoGeneral(dir, 'marca-raiz');
  // Destinos de los enlaces del CLAUDE.md y del catalogo copiados, para que el verificador cierre en verde (sello S).
  escribir(dir, '_meta/memoria/libertad-tecnica-del-agente.md', '# Libertad tecnica\n');
  escribir(dir, '_meta/guia-arranque-sesiones.md', '# Guia de arranque\n');
  escribir(dir, '_meta/bitacora.md', '# Bitacora\n');
  confirmarGit(dir, 'init', '-q');
  confirmarGit(dir, 'add', '-A');
  confirmar(gitSiembra(dir, 'commit', '-q', '-m', 'vault de prueba'), 'git commit');
  // La "plantilla" falsa: general/ e inicializador/ tal como quedan en el primer commit.
  const plantilla = mkdtempSync(path.join(path.dirname(dir), 'plantilla-'));
  for (const d of ['general', 'inicializador']) cpSync(path.join(dir, d), path.join(plantilla, d), { recursive: true });
  escribir(dir, '_meta/dod.local.json', JSON.stringify({ plantilla }) + '\n');
}

function vault2(dir) {
  copiarBase(dir);
  escribir(dir, 'esp-uno/README.md', marca('espacio', 'esp-uno'));
  escribir(dir, 'esp-tres/README.md', '# esp-tres\n\nSin marca de espacio.\n');
  asunto(dir, 'esp-uno', 'a1', 'uno');
  asunto(dir, 'esp-uno', 'a2', 'dos');
  escribir(dir, 'esp-uno/a2/charter-coordinador.md', '# Charter de a2\n\n## Perfil del asunto: asunto con software\n\nTexto.\n');
  escribir(dir, 'esp-uno/a1/.claude/agents/ejecutora.md', 'distinto de su plantilla\n');
  escribir(dir, 'esp-uno/CLAUDE.md', '# Reglas\n\nTexto.\n');
  escribir(dir, 'esp-uno/x/notas.md', '# Notas\n\nUna carpeta sin charter.\n');
  estadoGeneral(dir, 'marca-raiz');
  confirmarGit(dir, 'init', '-q');
  confirmarGit(dir, 'add', '-A');
  confirmar(gitSiembra(dir, 'commit', '-q', '-m', 'vault de prueba 2'), 'git commit');
}

// Texto de la puerta `nombre` de la salida del DoD: desde su linea `[OK|FALLO] nombre` hasta la siguiente puerta.
function puertaDod(salida, nombre) {
  const lineas = salida.split('\n');
  const i = lineas.findIndex((l) => new RegExp(`^\\s*\\[(OK|FALLO)\\s*\\] ${nombre}\\s*$`).test(l));
  if (i < 0) return null;
  const bloque = [lineas[i]];
  for (let j = i + 1; j < lineas.length && !/^\s*\[(OK|FALLO)\s*\] /.test(lineas[j]) && !/^(RESULTADO|\s*Commits mirados)/.test(lineas[j]); j++) bloque.push(lineas[j]);
  return bloque.join('\n');
}
const enRojo = (salida, nombre) => /\[FALLO/.test((puertaDod(salida, nombre) || '').split('\n')[0]);

function hallazgo(salida, ruta) {
  return salida.split('\n').some((l) => /^\s*\[[^\]]+\] /.test(l) && l.includes(ruta));
}

function ctx() {
  const base = mkdtempSync(path.join(tmpdir(), 'probar-espacios-'));
  const c = { base, hecho: {} };
  const una = (clave, fn) => { if (!(clave in c.hecho)) c.hecho[clave] = fn(); return c.hecho[clave]; };
  c.v1 = () => una('v1', () => { const d = path.join(base, 'v1'); mkdirSync(d); vault1(d); return realpathSync(d); });
  c.v2 = () => una('v2', () => { const d = path.join(base, 'v2'); mkdirSync(d); vault2(d); return realpathSync(d); });
  let n = 0;
  c.clon = () => { const d = path.join(base, `clon-${++n}`); cpSync(c.v1(), d, { recursive: true }); return realpathSync(d); };
  c.limpiar = () => rmSync(base, { recursive: true, force: true });
  return c;
}

const HOOK = ['general/comun/hooks/limpieza-coordinacion.mjs'];

function hook(v, rel) {
  const dir = path.join(v, rel);
  return node([path.join(v, ...HOOK)], dir, { LIMPIEZA_DRY_RUN: '1', CLAUDE_PROJECT_DIR: dir }).salida;
}

// El hook en modo lista (lo que consulta el DoD): solo rutas trackeadas obsoletas, una por linea.
function hookLista(v, rel) {
  const dir = path.join(v, rel);
  return node([path.join(v, ...HOOK)], dir, { LIMPIEZA_LIST_TRACKED: '1', CLAUDE_PROJECT_DIR: dir }).salida;
}
// Commitea `ficheros` (rutas relativas a `v`) con fecha de hace `dias` dias, y pone ese mismo mtime al fichero.
function commitHaceDias(v, ficheros, dias) {
  const d = new Date(Date.now() - dias * 86400000);
  const iso = d.toISOString().slice(0, 19);
  confirmarGit(v, 'add', ...ficheros);
  confirmar(correr('git', ['-c', 'user.name=prueba', '-c', 'user.email=prueba@localhost', '-c', 'commit.gpgsign=false', 'commit', '-q', '-m', 'brief de prueba', '--', ...ficheros], v, { GIT_AUTHOR_DATE: iso, GIT_COMMITTER_DATE: iso }), 'git commit fechado');
  for (const f of ficheros) utimesSync(path.join(v, f), d, d);
}
const BRIEF_VIEJO = 'brief sin informe desde hace';

// Escribe un estado.json canonico con un elemento activo de titulo `titulo` en el asunto `base`.
function estadoActivo(raiz, base, titulo) {
  const e = EST.vacio();
  e.siguiente_id = 2;
  e.elementos.push({ id: 'E1', titulo, situacion: 'abierto', dueno: `coordinador-${base.split('/')[1]}`, abierto: '2026-01-01' });
  escribir(raiz, `${base}/coordinacion/estado.json`, EST.serializar(e));
}

// Lo mismo para el general: `_meta/estado.json`.
function estadoGeneral(raiz, titulo) {
  const e = EST.vacio();
  e.siguiente_id = 2;
  e.elementos.push({ id: 'E1', titulo, situacion: 'abierto', dueno: 'coordinador-general', abierto: '2026-01-01' });
  escribir(raiz, '_meta/estado.json', EST.serializar(e));
}

// Estado canonico y valido (dueno coordinador-<asunto>) en `base`; `extra` mezcla campos en el elemento.
function estadoValido(raiz, base, extra = {}) {
  const e = EST.vacio();
  e.siguiente_id = 2;
  e.elementos.push({ id: 'E1', titulo: 'algo', situacion: 'abierto', dueno: `coordinador-${base.split('/')[1]}`, abierto: '2026-01-01', ...extra });
  escribir(raiz, `${base}/coordinacion/estado.json`, EST.serializar(e));
}
// Lineas de la salida del verificador de la regla "estado vivo" que nombran `ruta`.
const vivo = (salida, ruta) => salida.split('\n').filter((l) => /^\s*\[estado vivo\] /.test(l) && l.includes(ruta));
const verif = (v) => node([path.join(v, '_meta', 'verificar-kit.mjs')], v).salida;

const marcas = (s) => ['marca-uno', 'marca-dos', 'marca-raiz', '[AMBITO]', '[ESTADO]'].filter((m) => s.includes(m)).join(' ') || 'ninguna marca';

const dod = (v, rel) => node([path.join(v, '_meta', 'dod.mjs'), '--sin-sello'], path.join(v, rel));
// El DoD de verdad (escribe el sello del ambito de `rel`); solo se corre dentro de un vault temporal.
const dodSella = (v, rel) => node([path.join(v, '_meta', 'dod.mjs')], path.join(v, rel));
// Motivo de un sello que no cierra: la puerta o puertas en rojo, para arreglar el vault de prueba.
const noCierra = (rel, r) => `el sello de ${rel} no cierra (sale ${r.codigo}): ${r.salida.split('\n').filter((l) => /\[FALLO|^\s{3,}\S/.test(l) && !/\[OK/.test(l)).join(' | ').slice(0, 900)}`;
const dodEstado = (v, rel) => node([path.join(v, '_meta', 'dod.mjs'), '--estado'], path.join(v, rel));
// ---- relevo.mjs --comprobar (casos R) ----
// Hash corto del ultimo commit del ambito de `rel` (lo que el relevo tiene que citar).
function hashAmbito(v, rel) {
  const amb = ESPACIOS.ambitoDe(v, path.join(v, rel));
  return git(v, 'log', '-1', '--format=%h', '--', ...ESPACIOS.pathspecDe(amb, ESPACIOS.listarAsuntos(v))).salida.trim();
}
// Escribe el texto del relevo en el directorio de coordinacion del ambito y corre `relevo.mjs --comprobar`
// con cwd en el ambito, sin entorno Herdr. Devuelve las lineas [OK]/[NO].
function comprobarRelevo(v, rel, textoRelevo, { tablero, lineaEstado, sesion } = {}) {
  const dir = path.join(v, rel);
  escribir(dir, path.join(rel === '.' ? '_meta' : 'coordinacion', 'relevo-actual.local.md'), textoRelevo);
  const args = [path.join(v, 'general', 'comun', 'scripts', 'relevo.mjs'), '--comprobar'];
  if (tablero) args.push('--tablero', tablero);
  if (lineaEstado) args.push('--linea-estado', lineaEstado);
  const r = node(args, dir, { HERDR_ENV: '', HERDR_PANE_ID: '', CLAUDE_CODE_SESSION_ID: sesion || '' });
  return r.salida.split('\n').filter((l) => /^\[(OK|NO|AVISO)\] /.test(l));
}
// Las lineas que dependen de la maquina (entorno y nombre libre) no se evaluan.
const dependeMaquina = (l) => /^\[(OK|NO)\] (entorno|el nombre |herdr agent list falla)/.test(l);
const noOtras = (L) => L.filter((l) => l.startsWith('[NO]') && !dependeMaquina(l));
const con = (L, pref, texto) => L.filter((l) => l.startsWith(pref) && l.includes(texto));
const PLAN_REL = '_meta/plan-tanda-prueba.md';
const tituloRel = (rel) => (rel === '.' ? 'coordinador general' : `coordinador de ${rel.split('/')[1]}`);
function relevoConPlan(rel, hash, { cerrado = 'A', siguiente = 'B' } = {}) {
  return [
    `Retomas el trabajo "prueba" como ${tituloRel(rel)}. El estado vive en ficheros, no en la conversación anterior: lee \`${PLAN_REL}\`, el tablero (\`_meta/tablero-tandas.md\`) y el estado (\`estado.mjs\`).`,
    `Último bloque cerrado: ${cerrado}, en el commit ${hash}. Siguiente: bloque ${siguiente} — objetivo de prueba.`,
    'Decisiones de la sesión anterior que no estén ya escritas en el plan o en la cola: ninguna.',
    'Antes de lanzar nada, comprueba el último commit de tu ámbito.',
  ].join('\n') + '\n';
}
function relevoSinPlan(rel, hash, { siguiente = 'revisar la cola', decisiones = 'ninguna' } = {}) {
  return [
    `Retomas el trabajo "prueba" como ${tituloRel(rel)}, sin plan de tandas. El estado vive en ficheros, no en la conversación anterior: lee el estado (\`estado.mjs\`) y lo que nombre la línea siguiente.`,
    `Último cierre: se cerró una tarea suelta, en el commit ${hash}. Siguiente: ${siguiente}.`,
    `Decisiones de la sesión anterior que no estén ya escritas en el estado o en la cola: ${decisiones}.`,
    'Antes de lanzar nada, comprueba el último commit de tu ámbito.',
  ].join('\n') + '\n';
}
// Tablero de prueba fuera del repositorio de prueba (para no ensuciar el arbol); `filas` = [[id, bloque, estado]].
function tableroPrueba(v, nombre, plan, filas) {
  const f = path.join(path.dirname(v), `tablero-${nombre}.md`);
  const cuerpo = filas.map(([id, b, e]) => `| ${id} | ${b} | objetivo | \`x.md\` | ejecutora | — | ${e} |`).join('\n');
  writeFileSync(f, `# Tablero de tandas\n\nPlan: ${plan === 'ninguno' ? 'ninguno' : '`' + plan + '`'}\nParadas: ninguna\n\n${CABECERA}\n${SEPARADOR}\n${cuerpo}\n`);
  return f;
}
// Fichero de linea de estado de prueba fuera del repositorio de prueba, con el formato de statusline.sh.
// haceS: segundos desde written_at; quedan5h/quedan7d: segundos hasta resets_at. null en un porcentaje = dato ausente.
function lineaEstadoPrueba(v, nombre, { ctx = 20, tam = 1000000, h5 = 10, quedan5h = 4 * 3600, d7 = 10, quedan7d = 5 * 86400, haceS = 5, sesion = 'sesion-prueba' } = {}) {
  const ahora = Date.now();
  const escrita = new Date(ahora - haceS * 1000).toISOString().slice(0, 19) + '+0000';
  const s = Math.floor(ahora / 1000);
  const json = {
    session_id: sesion, written_at: escrita,
    context_window: { used_percentage: ctx, context_window_size: tam },
    rate_limits: {
      five_hour: { used_percentage: h5, resets_at: h5 === null ? null : s + quedan5h },
      seven_day: { used_percentage: d7, resets_at: d7 === null ? null : s + quedan7d },
    },
  };
  const f = path.join(path.dirname(v), `linea-estado-${nombre}.json`);
  writeFileSync(f, JSON.stringify(json, null, 2) + '\n');
  return f;
}
const hhmm = (epoch) => { const d = new Date(epoch * 1000); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
// Commitea un plan de prueba en el general.
function planCommiteado(v) {
  escribir(v, PLAN_REL, '# Plan de prueba\n');
  confirmarGit(v, 'add', '-A'); confirmarGit(v, 'commit', '-q', '-m', 'plan de prueba');
}
const espera = (ms) => { spawnSync('sleep', [String(ms / 1000)]); };
// Cambia el cuerpo de una doctrina sin subir la version y lo commitea (como D5).
function doctrinaCambiada(v) {
  const doc = readdirSync(path.join(v, 'general', 'comun', 'doctrinas')).find((n) => n.endsWith('.md') && !n.startsWith('MEMORY-'));
  const f = path.join(v, 'general', 'comun', 'doctrinas', doc);
  writeFileSync(f, readFileSync(f, 'utf8') + '\nLinea de prueba que cambia el cuerpo sin subir la version.\n');
  confirmarGit(v, 'add', '-A'); confirmarGit(v, 'commit', '-q', '-m', 'doctrina cambiada');
}

function casos(c, esp) {
  const R = (cond, motivo) => (cond ? null : motivo);
  // Plan de prueba dentro del clon, con una fila por cada cuarta celda de `celdas`.
  const planLiteral = (asu, celdas) => {
    const filas = celdas.map((f, i) => `| T0${i + 1} | A | Objetivo ${i + 1} | ${f} | ejecutora | - | [PENDIENTE] |`);
    const f = path.join(asu, 'coordinacion', 'plan-tanda-prueba-literal.md');
    writeFileSync(f, ['# Plan de prueba', '', CABECERA, SEPARADOR, ...filas, '', 'Paradas: ninguna', ''].join('\n'));
    return f;
  };
  // Una celda no literal: sale 4, la salida nombra la fila y ni el plan ni el tablero cambian.
  const celdaPlan = (celda, fila) => {
    const v = c.clon(); const asu = path.join(v, 'esp-uno', 'a1'); const plan = planLiteral(asu, [celda]);
    const tab = path.join(asu, 'coordinacion', 'tablero-tandas.md');
    const p0 = readFileSync(plan, 'utf8'); const t0 = readFileSync(tab, 'utf8');
    const r = node([path.join(v, 'general', 'comun', 'scripts', 'tablero.mjs'), '--desde-plan', 'coordinacion/plan-tanda-prueba-literal.md'], asu);
    const intacto = readFileSync(plan, 'utf8') === p0 && readFileSync(tab, 'utf8') === t0;
    return R(r.codigo === 4 && r.salida.includes(fila) && intacto, `sale ${r.codigo} (4), nombra ${fila}=${r.salida.includes(fila)}, intacto=${intacto}: ${r.salida.trim()}`);
  };
  return [
    ['M1', () => { const l = esp.listarEspacios(c.v1()); return R(JSON.stringify(l) === '["esp-dos","esp-uno"]', `espacios: ${JSON.stringify(l)}`); }],
    ['M2', () => { const a = esp.ambitoDe(c.v1(), path.join(c.v1(), 'esp-uno', 'a1')); return R(a.tipo === 'asunto' && a.exacto === true && a.prefijo === 'esp-uno/a1/', JSON.stringify(a)); }],
    ['M3', () => { const a = esp.ambitoDe(c.v1(), c.v1()); return R(a.tipo === 'general', JSON.stringify(a)); }],
    ['M4', () => { const a = esp.ambitoDe(c.v1(), path.join(c.v1(), 'esp-uno')); return R(a.tipo === 'invalido', JSON.stringify(a)); }],
    ['M5', () => { const a = esp.ambitoDe(c.v1(), path.join(c.v1(), 'general', 'comun')); return R(a.tipo === 'invalido', JSON.stringify(a)); }],
    ['M6', () => {
      const v = c.v1(); const as = esp.listarAsuntos(v);
      const g = esp.ambitoDe(v, v); const a1 = esp.ambitoDe(v, path.join(v, 'esp-uno', 'a1'));
      const ok = esp.esDelAmbito(g, 'esp-uno/README.md', as) && !esp.esDelAmbito(a1, 'esp-uno/README.md', as)
        && esp.esDelAmbito(a1, 'esp-uno/a1/x.md', as) && !esp.esDelAmbito(g, 'esp-uno/a1/x.md', as);
      return R(ok, 'esDelAmbito no reparte esp-uno/README.md al general y esp-uno/a1/x.md al asunto');
    }],

    ['H1', () => { const s = hook(c.v1(), 'esp-uno/a1'); return R(s.includes('marca-uno') && !s.includes('marca-dos') && !s.includes('marca-raiz'), `el hook vuelca ${marcas(s)}`); }],
    ['H2', () => { const s = hook(c.v1(), 'esp-uno'); return R(/^\[AMBITO\]/m.test(s) && !s.includes('[ESTADO]'), `el hook vuelca ${marcas(s)}`); }],
    ['H3', () => { const s = hook(c.v1(), 'general/comun'); return R(/^\[AMBITO\]/m.test(s) && !s.includes('[ESTADO]'), `el hook vuelca ${marcas(s)}`); }],
    ['H4', () => { const s = hook(c.v1(), '.'); return R(s.includes('marca-raiz') && !s.includes('marca-uno') && !s.includes('marca-dos'), `el hook vuelca ${marcas(s)}`); }],
    ['H5', () => {
      const v = c.clon(); estadoActivo(v, 'esp-uno/a1', 'estado-uno');
      const s = hook(v, 'esp-uno/a1');
      return R(s.includes('[ESTADO]') && s.includes('estado-uno') && !s.includes('marca-uno'), `el hook vuelca ${marcas(s)}${s.includes('[ESTADO]') ? ' [ESTADO]' : ''}`);
    }],
    ['H6', () => {
      const v = c.clon(); rmSync(path.join(v, 'esp-uno', 'a1', 'coordinacion', 'estado.json'));
      const s = hook(v, 'esp-uno/a1');
      return R(s.includes('[ESTADO] Tu ámbito no tiene estado.json: créalo con estado.mjs --iniciar.'), `el hook no avisa de que falta el estado.json; vuelca ${marcas(s)}`);
    }],
    ['H7', () => {
      const v = c.clon(); estadoActivo(v, 'esp-uno/a1', 'estado-uno');
      const s = hook(v, 'esp-dos/b1');
      return R(s.includes('marca-dos') && !s.includes('estado-uno'), `el hook vuelca ${marcas(s)}`);
    }],
    ['H8', () => {
      const v = c.clon(); escribir(v, 'esp-uno/a1/coordinacion/estado.json', '{ roto');
      const s = hook(v, 'esp-uno/a1');
      return R(s.includes('[ESTADO] ERROR'), 'el hook calla ante un estado.json ilegible');
    }],

    ['D1', () => { const r = dod(c.v1(), 'esp-uno/a1'); return R(r.salida.includes('coordinador de `a1`'), 'el DoD desde esp-uno/a1 no dice "coordinador de `a1`"'); }],
    ['D2', () => { const r = dod(c.v1(), 'general/comun'); return R(!r.salida.includes('coordinador general') && r.codigo !== 0, `desde general/comun: salida ${r.codigo} ${r.salida.includes('coordinador general') ? 'y se declara coordinador general' : ''}`); }],
    ['D3', () => {
      const v = c.clon();
      writeFileSync(path.join(v, 'esp-dos', 'b1', 'cola-pendientes.md'), '#'.repeat(41000));
      confirmarGit(v, 'add', 'esp-dos/b1/cola-pendientes.md'); confirmarGit(v, 'commit', '-q', '-m', 'cola grande');
      const r = dod(v, 'esp-dos/b1');
      return R(enRojo(r.salida, 'techos'), 'el DoD desde esp-dos/b1 no marca techos en rojo con una cola de 41000 B');
    }],
    ['D4', () => {
      const v = c.clon();
      writeFileSync(path.join(v, 'esp-uno', 'README.md'), marca('espacio', 'esp-uno') + 'cambio sin commitear\n');
      const raiz = puertaDod(dod(v, '.').salida, 'arbol limpio') || '';
      const asu = dod(v, 'esp-uno/a1').salida;
      const tuyo = /TUYOS/.test(raiz) && raiz.includes('esp-uno/README.md');
      return R(tuyo && !asu.includes('esp-uno/README.md'), `desde la raiz tuyo=${tuyo}; desde esp-uno/a1 ${asu.includes('esp-uno/README.md') ? 'lo nombra' : 'no lo nombra'}`);
    }],
    ['D5', () => {
      const v = c.clon();
      const doc = readdirSync(path.join(v, 'general', 'comun', 'doctrinas')).find((n) => n.endsWith('.md') && !n.startsWith('MEMORY-'));
      const f = path.join(v, 'general', 'comun', 'doctrinas', doc);
      writeFileSync(f, readFileSync(f, 'utf8') + '\nLinea de prueba que cambia el cuerpo sin subir la version.\n');
      confirmarGit(v, 'add', '-A'); confirmarGit(v, 'commit', '-q', '-m', 'doctrina cambiada');
      const raiz = dod(v, '.').salida; const asu = dod(v, 'esp-uno/a1').salida;
      const ok = enRojo(raiz, 'doctrinas al dia') && enRojo(raiz, 'sincronia con la plantilla') && !enRojo(asu, 'doctrinas al dia') && !enRojo(asu, 'sincronia con la plantilla');
      return R(ok, `raiz: doctrinas ${enRojo(raiz, 'doctrinas al dia')}, sincronia ${enRojo(raiz, 'sincronia con la plantilla')}; esp-uno/a1: doctrinas ${enRojo(asu, 'doctrinas al dia')}, sincronia ${enRojo(asu, 'sincronia con la plantilla')} (se esperaba true, true, false, false)`);
    }],

    ['D5b', () => {
      // El index_summary es un bloque plegado: cambiar SOLO su texto (y la description) no exige subir la version;
      // cambiar ademas una linea del cuerpo, si.
      const toca = (v, cuerpo) => {
        const doc = readdirSync(path.join(v, 'general', 'comun', 'doctrinas')).find((n) => n.endsWith('.md') && !n.startsWith('MEMORY-'));
        const f = path.join(v, 'general', 'comun', 'doctrinas', doc);
        let t = readFileSync(f, 'utf8');
        const t0 = t;
        t = t.replace(/(^index_summary: >-\n)((?:[ \t]+.*\n)+)/m, (_, k, b) => k + b.replace(/\n$/, '') + ' Texto nuevo del resumen.\n');
        t = t.replace(/^description: .*$/m, (l) => l + ' Y mas.');
        if (cuerpo) t += '\nLinea de prueba que cambia el cuerpo sin subir la version.\n';
        if (t === t0) return false;
        writeFileSync(f, t);
        confirmarGit(v, 'add', '-A'); confirmarGit(v, 'commit', '-q', '-m', 'doctrina: solo frontmatter derivado');
        return true;
      };
      const v1 = c.clon(); const v2 = c.clon();
      if (!toca(v1, false) || !toca(v2, true)) return 'la ficha de prueba no tiene un bloque index_summary: >- que cambiar';
      const solo = dod(v1, '.').salida; const con = dod(v2, '.').salida;
      return R(!enRojo(solo, 'doctrinas al dia') && enRojo(con, 'doctrinas al dia'), `solo bloque+description en rojo=${enRojo(solo, 'doctrinas al dia')} (se esperaba false): ${(puertaDod(solo, 'doctrinas al dia') || '').split('\n')[0]}; con cuerpo en rojo=${enRojo(con, 'doctrinas al dia')} (se esperaba true)`);
    }],

    ['D6', () => {
      const v = c.clon(); estadoValido(v, 'esp-uno/a1', { porque: 'no/existe.md#x' });
      confirmarGit(v, 'add', '-A'); confirmarGit(v, 'commit', '-q', '-m', 'estado con porque roto');
      const asu = puertaDod(dod(v, 'esp-uno/a1').salida, 'artefactos declarados') || '';
      const raiz = dod(v, '.').salida;
      const ok = enRojo(dod(v, 'esp-uno/a1').salida, 'artefactos declarados') && asu.includes('E1') && asu.includes('no/existe.md') && !raiz.includes('esp-uno/a1/coordinacion/estado.json');
      return R(ok, `desde esp-uno/a1: rojo=${enRojo(dod(v, 'esp-uno/a1').salida, 'artefactos declarados')}, nombra E1=${asu.includes('E1')}; desde la raiz nombra la ruta=${raiz.includes('esp-uno/a1/coordinacion/estado.json')} (se esperaba true, true, false)`);
    }],
    ['D7', () => {
      const v = c.clon();
      const e = EST.vacio(); e.siguiente_id = 121;
      for (let i = 1; i <= 120; i++) e.elementos.push({ id: `E${i}`, titulo: 'x'.repeat(140), situacion: 'abierto', dueno: 'coordinador-b1', abierto: '2026-01-01' });
      escribir(v, 'esp-dos/b1/coordinacion/estado.json', EST.serializar(e));
      confirmarGit(v, 'add', '-A'); confirmarGit(v, 'commit', '-q', '-m', 'estado grande');
      const r = dod(v, 'esp-dos/b1').salida;
      return R(enRojo(r, 'techos') && (puertaDod(r, 'techos') || '').includes('vista del estado'), 'el DoD desde esp-dos/b1 no marca techos en rojo con una vista del estado de mas de 16384 B');
    }],
    // D8 y D9: el DoD rechaza una opcion que no conoce (sale 2, sin tocar el sello) y --ayuda imprime el uso (sale 0).
    ['D8', () => {
      const v = c.clon(); const sello = path.join(v, '_meta', 'dod-sello.local.json');
      const antes = existsSync(sello) ? readFileSync(sello, 'utf8') : null;
      const r = node([path.join(v, '_meta', 'dod.mjs'), '--opcion-que-no-existe'], v);
      const despues = existsSync(sello) ? readFileSync(sello, 'utf8') : null;
      return R(r.codigo === 2 && r.salida.includes('Uso:') && antes === despues, `sale ${r.codigo} (se esperaba 2), Uso: ${r.salida.includes('Uso:')}, sello intacto=${antes === despues}`);
    }],
    ['D9', () => {
      const v = c.clon(); const sello = path.join(v, '_meta', 'dod-sello.local.json');
      const antes = existsSync(sello) ? readFileSync(sello, 'utf8') : null;
      const r = node([path.join(v, '_meta', 'dod.mjs'), '--ayuda'], v);
      const despues = existsSync(sello) ? readFileSync(sello, 'utf8') : null;
      return R(r.codigo === 0 && r.salida.includes('Uso:') && antes === despues, `sale ${r.codigo} (se esperaba 0), Uso: ${r.salida.includes('Uso:')}, sello intacto=${antes === despues}`);
    }],

    ['T1', () => { const r = node([path.join(c.v1(), 'general', 'comun', 'scripts', 'tablero.mjs'), '--comprobar'], path.join(c.v1(), 'esp-uno', 'a1')); return R(r.codigo === 0, `sale ${r.codigo}: ${r.salida.trim()}`); }],
    ['T2', () => { const r = node([path.join(c.v1(), 'general', 'comun', 'scripts', 'tablero.mjs'), '--comprobar'], path.join(c.v1(), 'esp-uno')); return R(r.codigo === 2, `sale ${r.codigo}, se esperaba 2`); }],

    // T3 a T5: --desde-plan exige la celda Ficheros literal y rechaza argumentos sobrantes, sin escribir nada.
    ['T3', () => celdaPlan('`docs/*.md`', 'T01')],
    ['T4', () => celdaPlan('los seis ficheros de T04', 'T01')],
    ['T5', () => {
      const v = c.clon(); const asu = path.join(v, 'esp-uno', 'a1'); const plan = planLiteral(asu, ['`docs/a.md`, `docs/b/`', 'ninguno']);
      const tab = path.join(asu, 'coordinacion', 'tablero-tandas.md'); const script = path.join(v, 'general', 'comun', 'scripts', 'tablero.mjs');
      const p0 = readFileSync(plan, 'utf8'); const t0 = readFileSync(tab, 'utf8');
      const r1 = node([script, '--desde-plan', 'coordinacion/plan-tanda-prueba-literal.md', '--tablro', 'x'], asu);
      const intacto = readFileSync(plan, 'utf8') === p0 && readFileSync(tab, 'utf8') === t0;
      const r2 = node([script, '--desde-plan', 'coordinacion/plan-tanda-prueba-literal.md'], asu);
      const t = readFileSync(tab, 'utf8'); const pl = readFileSync(plan, 'utf8');
      const ok = r1.codigo === 2 && intacto && r2.codigo === 0 && t.includes('| T01 |') && t.includes('| T02 |') && pl.includes('La tabla de tandas vive en el tablero');
      return R(ok, `opcion mala sale ${r1.codigo} (2), intacto=${intacto}; literales sale ${r2.codigo} (0): ${r2.salida.trim()}`);
    }],

    ['V1', () => {
      const r2 = node([path.join(c.v2(), '_meta', 'verificar-kit.mjs')], c.v2()).salida;
      const r1 = node([path.join(c.v1(), '_meta', 'verificar-kit.mjs')], c.v1()).salida;
      if (hallazgo(r1, 'adjuntos')) return 'el vault 1 da un hallazgo con adjuntos/ (tipo: libre)';
      return R(hallazgo(r2, 'esp-tres'), 'ningun hallazgo con esp-tres (README sin marca)');
    }],
    ['V2', () => R(hallazgo(node([path.join(c.v2(), '_meta', 'verificar-kit.mjs')], c.v2()).salida, 'esp-uno/a2/docs/emplazamiento-runtime.md'), 'ningun hallazgo con esp-uno/a2/docs/emplazamiento-runtime.md')],
    ['V3', () => R(hallazgo(node([path.join(c.v2(), '_meta', 'verificar-kit.mjs')], c.v2()).salida, 'esp-uno/a1/.claude/agents/ejecutora.md'), 'ningun hallazgo con esp-uno/a1/.claude/agents/ejecutora.md')],
    ['V4', () => R(hallazgo(node([path.join(c.v2(), '_meta', 'verificar-kit.mjs')], c.v2()).salida, 'esp-uno/CLAUDE.md'), 'ningun hallazgo con esp-uno/CLAUDE.md')],
    ['V5', () => R(hallazgo(node([path.join(c.v2(), '_meta', 'verificar-kit.mjs')], c.v2()).salida, 'esp-uno/x'), 'ningun hallazgo con esp-uno/x')],
    ['V6', () => {
      const v = c.clon();
      escribir(v, 'general/x.md', '# X\n\nVive en `asuntos/<a>/` todavia.\n');
      escribir(v, 'general/y.md', '# Y\n\n> Pieza de catalogo adaptada de asuntos/<a>/ (pie de registro).\n');
      const lineas = node([path.join(v, '_meta', 'verificar-kit.mjs')], v).salida.split('\n').filter((l) => /residuo de la estructura vieja/.test(l));
      const enX = lineas.some((l) => l.includes('general/x.md')); const enY = lineas.some((l) => l.includes('general/y.md'));
      return R(enX && !enY, `regla 19: hallazgo en x.md=${enX} (se esperaba true), en y.md=${enY} (se esperaba false)`);
    }],
    ['V7', () => {
      const v = c.clon(); estadoValido(v, 'esp-uno/a1', { dueno: 'director' });
      const l = vivo(verif(v), 'esp-uno/a1/coordinacion/estado.json');
      return R(l.length > 0, 'ningun hallazgo de estado vivo con un activo del director sin caduca');
    }],
    ['V8', () => {
      const v = c.clon();
      escribir(v, 'esp-uno/a1/coordinacion/trabajo-en-curso.md', '# Trabajo en curso\n');
      escribir(v, '_meta/trabajo-en-curso.md', '# Trabajo en curso\n');
      const s = verif(v);
      const a = hallazgo(s, 'esp-uno/a1/coordinacion/trabajo-en-curso.md'); const g = hallazgo(s, '_meta/trabajo-en-curso.md');
      return R(a && g, `hallazgo sobre un trabajo-en-curso.md: en un asunto=${a}, en el general=${g} (se esperaba true, true)`);
    }],
    ['V9', () => {
      const v = c.clon(); estadoValido(v, 'esp-uno/a1');
      writeFileSync(path.join(v, 'esp-uno', 'a1', 'cola-pendientes.md'), '# Cola de a1\n\n- [ ] algo\n');
      writeFileSync(path.join(v, 'esp-dos', 'b1', 'cola-pendientes.md'), '# Cola de b1\n\n- [ ] algo\n');
      const s = verif(v);
      const a = vivo(s, 'esp-uno/a1/cola-pendientes.md'); const b = vivo(s, 'esp-dos/b1/cola-pendientes.md');
      return R(a.length > 0 && b.length > 0, `hallazgos sobre la cola de a1=${a.length} y de b1=${b.length} (se esperaba >0 en las dos: todo ambito tiene estado)`);
    }],
    ['V10', () => {
      const v = c.clon(); estadoValido(v, 'esp-uno/a1');
      const l = verif(v).split('\n').filter((x) => /^\s*\[estado vivo\] /.test(x));
      return R(l.length === 0, `hallazgos de estado vivo con un estado valido: ${l.join(' | ')}`);
    }],
    ['V11', () => {
      const v = c.clon();
      rmSync(path.join(v, 'esp-dos', 'b1', 'coordinacion', 'estado.json')); rmSync(path.join(v, '_meta', 'estado.json'));
      const s = verif(v);
      const a = vivo(s, 'esp-dos/b1').length; const g = vivo(s, '_meta/estado.json').length;
      return R(a > 0 && g > 0, `hallazgos por falta de estado.json: asunto=${a}, general=${g} (se esperaba >0 en los dos)`);
    }],
    ['V12', () => {
      const v = c.clon();
      writeFileSync(path.join(v, 'esp-uno', 'a1', 'cola-pendientes.md'), '# Cola de a1\n\n- **[ ] casilla en negrita**\n');
      const l = vivo(verif(v), 'esp-uno/a1/cola-pendientes.md');
      return R(l.length > 0, 'ningun hallazgo con una casilla en negrita (- **[ ] ...**) en la cola');
    }],

    ['S1', () => {
      const v = c.clon();
      const a = dodSella(v, '.'); if (a.codigo !== 0) return noCierra('.', a);
      espera(1200); doctrinaCambiada(v); espera(1200);
      const b = dodSella(v, 'esp-uno/a1'); if (b.codigo !== 0) return noCierra('esp-uno/a1', b);
      return R(enRojo(dod(v, '.').salida, 'doctrinas al dia'), 'tras sellar el asunto, el DoD de la raiz no marca doctrinas al dia en rojo: el sello del asunto movio la ventana del general');
    }],
    ['S2', () => {
      const v = c.clon();
      const a = dodSella(v, '.'); if (a.codigo !== 0) return noCierra('.', a);
      espera(1200);
      writeFileSync(path.join(v, 'esp-uno', 'a1', 'cola-pendientes.md'), '# Cola de a1\n\nCambio de otro ambito.\n');
      confirmarGit(v, 'add', '-A'); confirmarGit(v, 'commit', '-q', '-m', 'cola de a1');
      const r = dodEstado(v, '.');
      return R(r.codigo === 0 && r.salida.includes('VALIDO'), `--estado desde la raiz sale ${r.codigo}: ${r.salida.trim()}`);
    }],
    ['S3', () => {
      const v = c.clon();
      const a = dodSella(v, '.'); if (a.codigo !== 0) return noCierra('.', a);
      writeFileSync(path.join(v, 'esp-uno', 'README.md'), marca('espacio', 'esp-uno') + 'cambio sin commitear\n');
      const r = dodEstado(v, '.');
      return R(r.codigo === 1, `--estado desde la raiz sale ${r.codigo} con un cambio propio sin commitear (se esperaba 1): ${r.salida.trim()}`);
    }],
    ['S4', () => {
      const v = c.clon();
      const a = dodSella(v, 'esp-uno/a1'); if (a.codigo !== 0) return noCierra('esp-uno/a1', a);
      const local = existsSync(path.join(v, 'esp-uno', 'a1', 'coordinacion', 'dod-sello.local.json'));
      const raiz = existsSync(path.join(v, '.dod-seal.json'));
      const limpio = git(v, 'status', '--porcelain').salida.trim() === '';
      return R(local && !raiz && limpio, `esp-uno/a1/coordinacion/dod-sello.local.json existe=${local}, .dod-seal.json en la raiz existe=${raiz}, arbol limpio=${limpio} (se esperaba true, false, true)`);
    }],
    ['S5', () => {
      const v = c.clon();
      const a = dodSella(v, '.'); if (a.codigo !== 0) return noCierra('.', a);
      const r = dodEstado(v, 'esp-uno/a1');
      return R(r.codigo === 1 && r.salida.includes('NO HAY'), `--estado desde esp-uno/a1 sale ${r.codigo} (se esperaba 1 con NO HAY): ${r.salida.trim()}`);
    }],
    ['H9', () => {
      const v = c.clon();
      const a = dodSella(v, '.'); if (a.codigo !== 0) return noCierra('.', a);
      espera(1200);
      writeFileSync(path.join(v, 'esp-uno', 'a1', 'cola-pendientes.md'), '# Cola de a1\n\nCambio de otro ambito.\n');
      confirmarGit(v, 'add', '-A'); confirmarGit(v, 'commit', '-q', '-m', 'cola de a1');
      const g = hook(v, '.'); const s = hook(v, 'esp-uno/a1');
      const ok = !g.includes('[DoD]') && s.includes('[DoD]') && s.includes('../../_meta/dod.mjs');
      return R(ok, `hook en la raiz: [DoD]=${g.includes('[DoD]')} (se esperaba false); hook en esp-uno/a1: [DoD]=${s.includes('[DoD]')}, nombra ../../_meta/dod.mjs=${s.includes('../../_meta/dod.mjs')} (se esperaba true, true)`);
    }],

    ['H10', () => {
      const v = c.clon(); escribir(v, 'esp-uno/a1/estudios/x_prompt.md', '# Brief x\n');
      commitHaceDias(v, ['esp-uno/a1/estudios/x_prompt.md'], 40);
      const s = hook(v, 'esp-uno/a1'); const l = hookLista(v, 'esp-uno/a1');
      return R(s.includes(BRIEF_VIEJO) && s.includes('x_prompt.md') && !l.includes('x_prompt.md'), `brief de 40 dias sin informe: avisa=${s.includes(BRIEF_VIEJO)} (se esperaba true), en modo lista=${l.includes('x_prompt.md')} (se esperaba false)`);
    }],
    ['H11', () => {
      const v = c.clon(); escribir(v, 'esp-uno/a1/estudios/x_prompt.md', '# Brief x\n');
      commitHaceDias(v, ['esp-uno/a1/estudios/x_prompt.md'], 5);
      const s = hook(v, 'esp-uno/a1');
      return R(!s.includes(BRIEF_VIEJO) && !s.includes('x_prompt.md'), `brief de 5 dias sin informe: avisa=${s.includes(BRIEF_VIEJO)} (se esperaba false)`);
    }],
    ['H12', () => {
      const v = c.clon(); escribir(v, 'esp-uno/a1/estudios/x_prompt.md', '# Brief x\n'); escribir(v, 'esp-uno/a1/estudios/x_informe.md', '# Informe x\n');
      commitHaceDias(v, ['esp-uno/a1/estudios/x_prompt.md', 'esp-uno/a1/estudios/x_informe.md'], 40);
      const s = hook(v, 'esp-uno/a1'); const l = hookLista(v, 'esp-uno/a1');
      return R(s.includes('prompt de estudio ya con informe') && !s.includes(BRIEF_VIEJO) && l.includes('x_prompt.md'), `prompt con informe: aviso de siempre=${s.includes('prompt de estudio ya con informe')} (true), aviso de brief viejo=${s.includes(BRIEF_VIEJO)} (false), en modo lista=${l.includes('x_prompt.md')} (true)`);
    }],

    ['R1', () => {
      const v = c.clon();
      const a = dodSella(v, '.'); if (a.codigo !== 0) return noCierra('.', a);
      const L = comprobarRelevo(v, '.', relevoSinPlan('.', hashAmbito(v, '.')));
      return R(noOtras(L).length === 0 && con(L, '[OK]', 'DoD').length === 1, `sin plan y sellado: [NO] ajenas a la maquina=${JSON.stringify(noOtras(L))}, lineas [OK] con DoD=${con(L, '[OK]', 'DoD').length} (se esperaba 0 y 1)`);
    }],
    ['R2', () => {
      const v = c.clon();
      const L = comprobarRelevo(v, '.', relevoSinPlan('.', hashAmbito(v, '.')));
      return R(con(L, '[NO]', 'DoD').length === 1, `sin sello: lineas [NO] con DoD=${con(L, '[NO]', 'DoD').length} (se esperaba 1)`);
    }],
    ['R3', () => {
      const v = c.clon();
      const a = dodSella(v, '.'); if (a.codigo !== 0) return noCierra('.', a);
      writeFileSync(path.join(v, '_meta', 'bitacora.md'), '# Bitacora\n\nCambio posterior al sello.\n');
      confirmarGit(v, 'add', '-A'); confirmarGit(v, 'commit', '-q', '-m', 'cambio en el ambito');
      const L = comprobarRelevo(v, '.', relevoSinPlan('.', hashAmbito(v, '.')));
      return R(con(L, '[NO]', 'DoD').length === 1, `sello caducado por un commit del ambito: lineas [NO] con DoD=${con(L, '[NO]', 'DoD').length} (se esperaba 1)`);
    }],
    ['R4', () => {
      const v = c.clon();
      const a = dodSella(v, '.'); if (a.codigo !== 0) return noCierra('.', a);
      const L1 = comprobarRelevo(v, 'esp-uno/a1', relevoSinPlan('esp-uno/a1', hashAmbito(v, 'esp-uno/a1')));
      const b = dodSella(v, 'esp-uno/a1'); if (b.codigo !== 0) return noCierra('esp-uno/a1', b);
      const L2 = comprobarRelevo(v, 'esp-uno/a1', relevoSinPlan('esp-uno/a1', hashAmbito(v, 'esp-uno/a1')));
      return R(con(L1, '[NO]', 'DoD').length === 1 && con(L2, '[OK]', 'DoD').length === 1, `a1 con solo el general sellado: [NO] con DoD=${con(L1, '[NO]', 'DoD').length} (se esperaba 1); tras sellar a1: [OK] con DoD=${con(L2, '[OK]', 'DoD').length} (se esperaba 1)`);
    }],
    ['R5', () => {
      const v = c.clon();
      const L = comprobarRelevo(v, '.', relevoSinPlan('.', hashAmbito(v, '.'), { decisiones: 'queda por escribir un criterio' }));
      return R(con(L, '[NO]', 'linea 3').length === 1, `linea 3 distinta de "ninguna": lineas [NO] de decisiones=${con(L, '[NO]', 'linea 3').length} (se esperaba 1)`);
    }],
    ['R6', () => {
      const v = c.clon();
      const L = comprobarRelevo(v, '.', relevoSinPlan('.', hashAmbito(v, '.'), { siguiente: 'nada' }));
      return R(con(L, '[NO]', 'trabajo siguiente').length === 1, `Siguiente: nada: lineas [NO] con "trabajo siguiente"=${con(L, '[NO]', 'trabajo siguiente').length} (se esperaba 1)`);
    }],
    ['R7', () => {
      const v = c.clon();
      const tab = tableroPrueba(v, 'r7', PLAN_REL, [['T01', 'A', '[HECHA]'], ['T02', 'B', '[PENDIENTE]']]);
      const L = comprobarRelevo(v, '.', relevoSinPlan('.', hashAmbito(v, '.')), { tablero: tab });
      return R(con(L, '[NO]', 'plan vivo').length === 1, `sin plan con un plan vivo en el tablero: lineas [NO] con "plan vivo"=${con(L, '[NO]', 'plan vivo').length} (se esperaba 1)`);
    }],
    ['R8', () => {
      const v = c.clon();
      planCommiteado(v);
      const a = dodSella(v, '.'); if (a.codigo !== 0) return noCierra('.', a);
      const tab = tableroPrueba(v, 'r8', PLAN_REL, [['T01', 'A', '[HECHA]'], ['T02', 'B', '[PENDIENTE]']]);
      const L = comprobarRelevo(v, '.', relevoConPlan('.', hashAmbito(v, '.')), { tablero: tab });
      return R(noOtras(L).length === 0 && con(L, '[OK]', 'DoD').length === 1, `con plan y sellado: [NO] ajenas a la maquina=${JSON.stringify(noOtras(L))}, lineas [OK] con DoD=${con(L, '[OK]', 'DoD').length} (se esperaba 0 y 1)`);
    }],
    ['R9', () => {
      const v = c.clon();
      planCommiteado(v);
      const tab = tableroPrueba(v, 'r9', PLAN_REL, [['T01', 'A', '[HECHA]'], ['T02', 'B', '[HECHA]']]);
      const L = comprobarRelevo(v, '.', relevoConPlan('.', hashAmbito(v, '.')), { tablero: tab });
      return R(con(L, '[NO]', 'bloque siguiente').length === 1, `bloque siguiente sin filas PENDIENTE: lineas [NO] del bloque siguiente=${con(L, '[NO]', 'bloque siguiente').length} (se esperaba 1)`);
    }],
    ['R10', async () => {
      const v = c.clon();
      const mod = await import(pathToFileURL(path.join(v, 'general', 'comun', 'scripts', 'relevo.mjs')).href);
      if (typeof mod.leerRelevo !== 'function') return 'relevo.mjs no exporta leerRelevo';
      const lee = (nombre, texto) => { const f = path.join(path.dirname(v), nombre); writeFileSync(f, texto); return mod.leerRelevo(f); };
      const p = lee('r10-plan.md', relevoConPlan('.', 'abc1234'));
      const s = lee('r10-sinplan.md', relevoSinPlan('.', 'abc1234'));
      const n = lee('r10-ninguna.md', 'Un texto que no casa con ninguna plantilla.\nNi esta linea.\n');
      const ok = p.modo === 'plan' && p.hash === 'abc1234' && s.modo === 'sinplan' && s.hash === 'abc1234' && n.existe === true && n.modo === null;
      return R(ok, `leerRelevo: plan=${JSON.stringify([p.modo, p.hash])}, sinplan=${JSON.stringify([s.modo, s.hash])}, ninguna=${JSON.stringify([n.existe, n.modo])}`);
    }],

    ['R11', () => {
      const v = c.clon();
      const a = dodSella(v, '.'); if (a.codigo !== 0) return noCierra('.', a);
      const L = comprobarRelevo(v, '.', relevoSinPlan('.', hashAmbito(v, '.')));
      const l = L.filter((x) => x.startsWith('[AVISO] linea de estado:'));
      return R(l.length === 1 && l[0].includes('sin HERDR_PANE_ID') && noOtras(L).length === 0, `sin fichero: lineas [AVISO] linea de estado=${JSON.stringify(l)} (una, con "sin HERDR_PANE_ID"), [NO] ajenas=${JSON.stringify(noOtras(L))}`);
    }],
    ['R12', () => {
      const v = c.clon();
      const a = dodSella(v, '.'); if (a.codigo !== 0) return noCierra('.', a);
      const L = comprobarRelevo(v, '.', relevoSinPlan('.', hashAmbito(v, '.')), { lineaEstado: path.join(path.dirname(v), 'no-existe.json') });
      const l = L.filter((x) => x.startsWith('[AVISO] linea de estado:'));
      return R(l.length === 1 && l[0].includes('no existe') && noOtras(L).length === 0, `fichero ausente: lineas [AVISO] linea de estado=${JSON.stringify(l)} (una, con "no existe"), [NO] ajenas=${JSON.stringify(noOtras(L))}`);
    }],
    ['R13', () => {
      const v = c.clon();
      const a = dodSella(v, '.'); if (a.codigo !== 0) return noCierra('.', a);
      const f = lineaEstadoPrueba(v, 'r13', { haceS: 20 * 60, h5: 95 });
      const L = comprobarRelevo(v, '.', relevoSinPlan('.', hashAmbito(v, '.')), { lineaEstado: f, sesion: 'sesion-prueba' });
      const l = L.filter((x) => x.startsWith('[AVISO] linea de estado:'));
      const no5 = L.filter((x) => x.startsWith('[NO] 5 h'));
      return R(l.length === 1 && l[0].includes('min') && no5.length === 0, `fichero viejo: lineas [AVISO] linea de estado=${JSON.stringify(l)} (una, con "min"), lineas [NO] 5 h=${JSON.stringify(no5)} (ninguna)`);
    }],
    ['R14', () => {
      const v = c.clon();
      const a = dodSella(v, '.'); if (a.codigo !== 0) return noCierra('.', a);
      const f = lineaEstadoPrueba(v, 'r14', { sesion: 'otra' });
      const L = comprobarRelevo(v, '.', relevoSinPlan('.', hashAmbito(v, '.')), { lineaEstado: f, sesion: 'esta' });
      const l = L.filter((x) => x.startsWith('[AVISO] linea de estado:'));
      return R(l.length === 1 && l[0].includes('otra sesion'), `fichero de otra sesion: lineas [AVISO] linea de estado=${JSON.stringify(l)} (una, con "otra sesion")`);
    }],
    ['R15', () => {
      const v = c.clon();
      const a = dodSella(v, '.'); if (a.codigo !== 0) return noCierra('.', a);
      const f = lineaEstadoPrueba(v, 'r15', { h5: 92, quedan5h: 3600 });
      const hora = hhmm(JSON.parse(readFileSync(f, 'utf8')).rate_limits.five_hour.resets_at);
      const L = comprobarRelevo(v, '.', relevoSinPlan('.', hashAmbito(v, '.')), { lineaEstado: f, sesion: 'sesion-prueba' });
      const l = L.filter((x) => x.startsWith('[NO] 5 h al 92 %'));
      return R(l.length === 1 && l[0].includes('reinicio') && l[0].includes(hora), `5 h en el umbral: lineas [NO] 5 h al 92 %=${JSON.stringify(l)} (una, con "reinicio" y "${hora}")`);
    }],
    ['R16', () => {
      const v = c.clon();
      const a = dodSella(v, '.'); if (a.codigo !== 0) return noCierra('.', a);
      const f = lineaEstadoPrueba(v, 'r16', { h5: 60, quedan5h: 4 * 3600 });
      const L = comprobarRelevo(v, '.', relevoSinPlan('.', hashAmbito(v, '.')), { lineaEstado: f, sesion: 'sesion-prueba' });
      const l = L.filter((x) => x.startsWith('[AVISO] 5 h al 60 %'));
      return R(l.length === 1 && l[0].includes('por delante') && noOtras(L).length === 0, `5 h por delante: lineas [AVISO] 5 h al 60 %=${JSON.stringify(l)} (una, con "por delante"), [NO] ajenas=${JSON.stringify(noOtras(L))}`);
    }],
    ['R17', () => {
      const v = c.clon();
      const a = dodSella(v, '.'); if (a.codigo !== 0) return noCierra('.', a);
      const f = lineaEstadoPrueba(v, 'r17', { d7: 93 });
      const L = comprobarRelevo(v, '.', relevoSinPlan('.', hashAmbito(v, '.')), { lineaEstado: f, sesion: 'sesion-prueba' });
      const l = L.filter((x) => x.startsWith('[NO] semanal al 93 %'));
      return R(l.length === 1, `semanal en el umbral: lineas [NO] semanal al 93 %=${JSON.stringify(l)} (una)`);
    }],
    ['R18', () => {
      const v = c.clon();
      const a = dodSella(v, '.'); if (a.codigo !== 0) return noCierra('.', a);
      const rel = relevoSinPlan('.', hashAmbito(v, '.'));
      const f1 = lineaEstadoPrueba(v, 'r18a', { ctx: 35, d7: 50, quedan7d: 6 * 86400 });
      const L1 = comprobarRelevo(v, '.', rel, { lineaEstado: f1, sesion: 'sesion-prueba' });
      const c1 = L1.filter((x) => x.startsWith('[OK] contexto 35 %') && x.includes('30 %'));
      const s1 = L1.filter((x) => x.startsWith('[AVISO] semanal al 50 %') && x.includes('por delante'));
      const f2 = lineaEstadoPrueba(v, 'r18b', { ctx: 55 });
      const L2 = comprobarRelevo(v, '.', rel, { lineaEstado: f2, sesion: 'sesion-prueba' });
      const c2 = L2.filter((x) => x.startsWith('[OK] contexto 55 %') && x.includes('50 %'));
      return R(c1.length === 1 && s1.length === 1 && c2.length === 1, `contexto y semanal: ctx 35=${c1.length} (1), semanal por delante=${s1.length} (1), ctx 55=${c2.length} (1)`);
    }],
    ['R19', async () => {
      const v = c.clon();
      const mod = await import(pathToFileURL(path.join(v, 'general', 'comun', 'scripts', 'relevo.mjs')).href);
      if (typeof mod.veredictoLineaEstado !== 'function') return 'relevo.mjs no exporta veredictoLineaEstado';
      if (!mod.UMBRALES) return 'relevo.mjs no exporta UMBRALES';
      const d = (ctx, tam = 1000000) => ({ session_id: 's', written_at: new Date().toISOString(), context_window: { used_percentage: ctx, context_window_size: tam }, rate_limits: { five_hour: { used_percentage: 1, resets_at: Math.floor(Date.now() / 1000) + 3600 }, seven_day: { used_percentage: 1, resets_at: Math.floor(Date.now() / 1000) + 5 * 86400 } } });
      const ver = mod.veredictoLineaEstado;
      const u = [ver(d(5)).sigue === true, ver(d(5), { recargar: true }).sigue === false, ver(d(5), { prueba: true }).sigue === false, ver(d(12)).sigue === false, ver(d(5, null)).sigue === false];
      const a = dodSella(v, '.'); if (a.codigo !== 0) return noCierra('.', a);
      const f = lineaEstadoPrueba(v, 'r19', { ctx: 5 });
      const L = comprobarRelevo(v, '.', relevoSinPlan('.', hashAmbito(v, '.')), { lineaEstado: f, sesion: 'sesion-prueba' });
      const l = L.filter((x) => x.startsWith('[OK] contexto 5 %') && x.includes('sigue en esta sesion'));
      return R(u.every(Boolean) && l.length === 1, `suelo: unitarios=${JSON.stringify(u)} (todos true), lineas [OK] contexto 5 % con "sigue en esta sesion"=${l.length} (1)`);
    }],
    ['R20', async () => {
      const v = c.clon();
      const mod = await import(pathToFileURL(path.join(v, 'general', 'comun', 'scripts', 'relevo.mjs')).href);
      if (!mod.UMBRALES) return 'relevo.mjs no exporta UMBRALES';
      const U = mod.UMBRALES;
      const doc = readFileSync(path.join(v, 'general', 'comun', 'doctrinas', 'higiene_contexto_y_tokens.md'), 'utf8');
      const ini = doc.indexOf('## Umbrales de relevo y ritmo de cuota');
      if (ini < 0) return 'higiene_contexto_y_tokens.md no tiene la seccion "Umbrales de relevo y ritmo de cuota"';
      const resto = doc.slice(ini + 3); const fin = resto.indexOf('\n## ');
      const sec = fin < 0 ? resto : resto.slice(0, fin);
      const P = [...new Set([...sec.matchAll(/\*\*(\d+) %\*\*/g)].map((m) => Number(m[1])))].sort((x, y) => x - y);
      const E = [...new Set([U.contextoCierre, U.contextoFrontera, U.cincoHoras, U.semanal])].sort((x, y) => x - y);
      const suelo = !(U.sueloTokens > 0) || sec.includes(`**${U.sueloTokens.toLocaleString('de-DE')} tokens**`);
      const fresc = sec.includes(`**${U.frescuraMin} min**`);
      return R(JSON.stringify(P) === JSON.stringify(E) && suelo && fresc, `umbrales: doctrina ${JSON.stringify(P)} frente a script ${JSON.stringify(E)}; suelo=${suelo}; frescura=${fresc}`);
    }],

    ['R21', () => {
      const v = c.clon();
      const rel = path.join(v, 'general', 'comun', 'scripts', 'relevo.mjs');
      const sinHerdr = { HERDR_ENV: '', HERDR_PANE_ID: '' };
      const a = node([rel, '--reiniciar-coordinador'], v, sinHerdr);
      const b = node([rel, '--reiniciar-coordinador', 'a1'], path.join(v, 'esp-uno', 'a1'), sinHerdr);
      const d = node([rel, '--reiniciar-coordinador', 'a1', '--seco'], v, sinHerdr);
      const e = node([rel, '--reiniciar-coordinador', 'a1', '--sobra'], v, sinHerdr);
      const ok = a.codigo === 2 && b.codigo === 4 && b.salida.includes('solo el coordinador general') && d.codigo === 3 && e.codigo === 2 && e.salida.includes('argumento sobrante');
      return R(ok, `reiniciar uso y ambito: sin nombre=${a.codigo} (2), desde a1=${b.codigo} (4, con "solo el coordinador general": ${b.salida.includes('solo el coordinador general')}), --seco fuera de Herdr=${d.codigo} (3), --sobra=${e.codigo} (2, con "argumento sobrante": ${e.salida.includes('argumento sobrante')})`);
    }],
    ['R22', async () => {
      const v = c.clon();
      const mod = await import(pathToFileURL(path.join(v, 'general', 'comun', 'scripts', 'relevo.mjs')).href);
      if (typeof mod.precondicionesReinicio !== 'function') return 'relevo.mjs no exporta precondicionesReinicio';
      const pre = mod.precondicionesReinicio;
      const no = (L, t) => L.filter((x) => !x.ok && x.msg.includes(t)).length;
      const a = dodSella(v, 'esp-uno/a1'); if (a.codigo !== 0) return noCierra('esp-uno/a1', a);
      const fallos = [];
      const L1 = pre(v, path.join(v, 'esp-uno', 'a1'));
      if (!L1.every((x) => x.ok)) fallos.push(`sellado y limpio: no ok=${JSON.stringify(L1.filter((x) => !x.ok))}`);
      const L2 = pre(v, v);
      if (no(L2, 'no es la carpeta de un asunto') !== 1) fallos.push(`raiz como carpeta: ${JSON.stringify(L2)}`);
      const w = c.clon();
      const L3 = pre(w, path.join(w, 'esp-uno', 'a1'));
      if (no(L3, 'DoD') !== 1) fallos.push(`sin sellar: ${JSON.stringify(L3)}`);
      escribir(v, 'esp-uno/a1/sucio.txt', 'x\n');
      const L4 = pre(v, path.join(v, 'esp-uno', 'a1'));
      if (no(L4, 'arbol sucio') !== 1) fallos.push(`arbol sucio: ${JSON.stringify(L4)}`);
      rmSync(path.join(v, 'esp-uno', 'a1', 'sucio.txt'));
      const tab = tableroPrueba(v, 'r22', 'coordinacion/plan-tanda-x.md', [['T01', 'A', '[HECHA]'], ['T02', 'B', '[PENDIENTE]']]);
      const L5 = pre(v, path.join(v, 'esp-uno', 'a1'), { tablero: tab });
      if (no(L5, 'plan vivo') !== 1) fallos.push(`plan vivo: ${JSON.stringify(L5)}`);
      escribir(v, 'esp-uno/a1/coordinacion/relevo-estado.local.json', '{"fase":"lanzado"}\n');
      const L6 = pre(v, path.join(v, 'esp-uno', 'a1'));
      if (no(L6, 'relevo a medias') !== 1) fallos.push(`relevo a medias (el clon ${existsSync(path.join(v, '.gitignore')) ? 'trae' : 'no trae'} .gitignore): ${JSON.stringify(L6)}`);
      return R(fallos.length === 0, `precondicionesReinicio: ${fallos.join(' | ')}`);
    }],

    ['G1', () => {
      const v = c.clon();
      escribir(v, 'esp-uno/a1/repo/f', 'x\n');
      const s = git(v, 'status', '--porcelain').salida;
      return R(!/repo/.test(s), `git status lista el repo/ de un asunto:\n${s.trim()}`);
    }],
  ];
}

function selecciona(id, filtros) {
  return !filtros || filtros.some((f) => id === f || id.startsWith(f));
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--ayuda') { console.log(AYUDA); return 0; }
  let filtros = null;
  if (args.length) {
    if (args[0] !== '--casos' || !args[1] || args.length > 2) throw new Salida(2, AYUDA);
    filtros = args[1].split(',').map((s) => s.trim()).filter(Boolean);
  }
  const esp = await import(pathToFileURL(path.join(AQUI, 'espacios.mjs')).href);
  const c = ctx();
  let fallos = 0;
  try {
    const lista = casos(c, esp).filter(([id]) => selecciona(id, filtros));
    if (!lista.length) throw new Salida(2, `ningun caso coincide con ${args[1]}`);
    for (const [id, fn] of lista) {
      let motivo;
      try { motivo = await fn(); } catch (e) { motivo = `error: ${e && e.message ? e.message : e}`; }
      if (motivo) { fallos++; console.log(`[FALLA] ${id}: ${motivo}`); } else console.log(`[OK] ${id}`);
    }
    console.log(fallos ? `\n${fallos} caso(s) fallan de ${lista.length}.` : `\nTodos los casos pasan (${lista.length}).`);
  } finally { c.limpiar(); }
  return fallos ? 1 : 0;
}

main().then((codigo) => { process.exitCode = codigo; }, (e) => {
  if (e instanceof Salida) { console.error(e.message); process.exitCode = e.codigo; return; }
  console.error(e && e.message ? e.message : String(e)); process.exitCode = 1;
});
