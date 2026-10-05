#!/usr/bin/env node
// relevo.mjs: relevo autonomo de un coordinador por Herdr (ciclo_de_tandas).
// Sin dependencias; solo execFile/execFileSync con argumentos separados.
// Salidas: 0 bien, 1 error interno, 2 uso, 3 entorno, 4 precondicion (no se ha tocado nada),
// 5 no se abrio el panel B, 6 B no arranco, 7 B no confirmo, 8 fallo la continuacion,
// 9 A no se cerro (o, en --tomar, A sigue vivo).
import { readFileSync, writeFileSync, existsSync, realpathSync } from 'node:fs';
import { execFile, execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { leerTablero } from './tablero.mjs';

const AQUI = fileURLToPath(import.meta.url);
const TABLERO_MJS = path.join(path.dirname(AQUI), 'tablero.mjs');

const AYUDA = `Uso: node <ruta>/general/comun/scripts/relevo.mjs <modo> [opciones]
Modos:
  --lanzar             lo corre A, el coordinador que se va: el relevo de verdad
  --confirmar          lo corre B, la sesion nueva, en su primer turno
  --tomar              lo corre B en su segundo turno: espera a que A desaparezca, se renombra y sigue
  --comprobar          seco: las precondiciones de A, todas listadas; solo lee Herdr y git
  --prueba             lo corre un shell en una pestana desechable (A sin agente, nombre prueba-relevo)
  --reiniciar-cuenta   pone a 0 los relevos seguidos (cuando el director ha intervenido)
  --ayuda
Opciones: --relevo <ruta>, --tablero <ruta> (solo --comprobar y --prueba, para fixtures)
          --timeout-arranque MS (def. 60000), --timeout-confirmacion MS (def. 240000), --timeout-cierre MS (def. 120000)
          --sin-confirmar (solo --prueba: B recibe un prompt que no confirma)
Salidas: 0 bien; 1 error interno; 2 uso; 3 entorno (fuera de Herdr, sin servidor o sin git);
  4 precondicion, no se releva y no se ha tocado nada; 5 no se abrio el panel B;
  6 B no arranco (B cerrado, A vivo); 7 B no confirmo (B cerrado, A vivo);
  8 fallo la continuacion (B cerrado, A vivo); 9 A no se cerro o, en --tomar, A sigue vivo.`;

class Salida extends Error { constructor(codigo, msg) { super(msg); this.codigo = codigo; } }

// ---------- utilidades ----------

function git(args, cwd) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (e) { return null; }
}

function herdrAsync(args, { timeout = 30000 } = {}) {
  return new Promise((resolve, reject) => {
    execFile('herdr', args, { encoding: 'utf8', timeout, maxBuffer: 8 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        const e = new Error((stderr || stdout || err.message || '').trim());
        e.herdr = true; e.out = `${stdout || ''}${stderr || ''}`;
        return reject(e);
      }
      try { resolve(JSON.parse(stdout)); } catch { resolve({ raw: stdout }); }
    });
  });
}

function herdrSync(args) {
  try {
    const out = execFileSync('herdr', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000 });
    try { return JSON.parse(out); } catch { return { raw: out }; }
  } catch (e) {
    const err = new Error(`${e.stderr || ''}${e.stdout || ''}`.trim() || e.message);
    err.out = `${e.stdout || ''}${e.stderr || ''}`;
    throw err;
  }
}

function raizVault() {
  let d = path.dirname(AQUI);
  for (;;) {
    if (existsSync(path.join(d, '_meta', 'verificar-kit.mjs'))) return d;
    const up = path.dirname(d);
    if (up === d) return null;
    d = up;
  }
}

const real = (p) => { try { return realpathSync(p); } catch { return path.resolve(p); } };
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const ahora = () => new Date().toISOString();

function opcion(args, nombre, def = null) {
  const i = args.indexOf(nombre);
  if (i < 0) return def;
  const v = args[i + 1];
  if (v === undefined) throw new Salida(2, `falta el valor de ${nombre}`);
  args.splice(i, 2);
  return v;
}
function bandera(args, nombre) {
  const i = args.indexOf(nombre);
  if (i < 0) return false;
  args.splice(i, 1);
  return true;
}
function entero(v, nombre) {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new Salida(2, `${nombre}: numero entero positivo`);
  return n;
}

// ---------- contexto: contenedor, ambito, ficheros ----------

function contexto(cwd, prueba) {
  const raiz = raizVault();
  const c = real(cwd);
  let tipo = null; let slug = null;
  if (raiz && c === real(raiz)) tipo = 'general';
  else if (raiz && path.dirname(c) === real(path.join(raiz, 'asuntos'))) { tipo = 'asunto'; slug = path.basename(c); }
  const dirCoord = tipo === 'general' ? '_meta' : 'coordinacion';
  const ambito = tipo === 'general' ? ['.', ':(exclude)asuntos'] : ['.'];
  const script = tipo === 'asunto' ? '../../general/comun/scripts/relevo.mjs' : 'general/comun/scripts/relevo.mjs';
  return {
    cwd, tipo, slug, dirCoord, ambito, script,
    titulo: tipo === 'general' ? 'coordinador general' : `coordinador de ${slug}`,
    rutaEstado: path.join(dirCoord, prueba ? 'relevo-prueba-estado.local.json' : 'relevo-estado.local.json'),
  };
}

function leerEstado(ctx) {
  const p = path.join(ctx.cwd, ctx.rutaEstado);
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
}
function escribirEstado(ctx, estado) {
  try { writeFileSync(path.join(ctx.cwd, ctx.rutaEstado), JSON.stringify(estado, null, 2) + '\n'); }
  catch (e) { throw new Salida(1, `no puedo escribir ${ctx.rutaEstado}: ${e.message}`); }
}

function hashAmbito(ctx) { return git(['log', '-1', '--format=%h', '--', ...ctx.ambito], ctx.cwd); }

// ---------- el prompt de relevo ----------

function leerRelevo(ruta) {
  const r = { existe: false, plan: null, cerrado: null, hash: null, siguiente: null, ninguna: false };
  if (!existsSync(ruta)) return r;
  let texto;
  try { texto = readFileSync(ruta, 'utf8'); } catch { return r; }
  r.existe = true;
  const l = texto.split('\n');
  const m1 = (l[0] || '').match(/`([^`]*plan-tanda-[^`]+\.md)`/);
  if (m1) r.plan = m1[1];
  const m2 = (l[1] || '').match(/Último bloque cerrado: ([A-Z][0-9]?), en el commit ([0-9a-f]{7,40})\. Siguiente: bloque ([A-Z][0-9]?) — /);
  if (m2) { r.cerrado = m2[1]; r.hash = m2[2]; r.siguiente = m2[3]; }
  r.ninguna = /: ninguna\.\s*$/.test(l[2] || '');
  return r;
}

function hashVigente(ctx, hash) {
  if (!hash) return false;
  const ultimo = hashAmbito(ctx);
  if (!ultimo || !(ultimo.startsWith(hash) || hash.startsWith(ultimo))) return false;
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', hash, 'HEAD'], { cwd: ctx.cwd, stdio: 'ignore' });
    return true;
  } catch { return false; }
}

// ---------- entorno y panel de A ----------

function entorno() {
  const p = [];
  if (process.env.HERDR_ENV !== '1') p.push('HERDR_ENV no es 1 (fuera de Herdr)');
  if (!process.env.HERDR_PANE_ID) p.push('HERDR_PANE_ID vacio');
  if (git(['--version'], undefined) === null) p.push('git no esta disponible');
  if (!p.length) {
    try { execFileSync('herdr', ['status'], { stdio: 'ignore', timeout: 15000 }); }
    catch { p.push('herdr status no responde (sin servidor)'); }
  }
  return p;
}

// Devuelve {pane, agente, proc, problemas[]}; nunca lanza por un fallo de lectura.
function panelA(prueba) {
  const r = { paneId: process.env.HERDR_PANE_ID, cwd: null, tab: null, nombre: null, tieneAgente: false, problemas: [] };
  try {
    const g = herdrSync(['pane', 'get', r.paneId]).result.pane;
    r.cwd = g.cwd; r.tab = g.tab_id; r.tieneAgente = Boolean(g.agent);
  } catch (e) { r.problemas.push(`herdr pane get falla: ${e.message}`); return r; }
  try {
    const a = herdrSync(['agent', 'get', r.paneId]).result.agent;
    if (a && a.name) r.nombre = a.name;
  } catch { /* puede faltar */ }
  if (prueba) {
    if (r.tieneAgente) r.problemas.push('--prueba exige un panel sin agente (aqui hay uno)');
    return r;
  }
  try {
    const pi = herdrSync(['pane', 'process-info', '--pane', r.paneId]).result.process_info;
    const cl = (pi.foreground_processes || []).find((x) => x.argv0 === 'claude');
    if (!cl) r.problemas.push('no hay proceso claude en primer plano del panel');
    else {
      if (JSON.stringify(cl.argv) !== JSON.stringify(['claude', '--dangerously-skip-permissions']))
        r.problemas.push(`argv de claude no es exactamente --dangerously-skip-permissions: ${JSON.stringify(cl.argv)}`);
      if (String(cl.pid) !== String(process.env.CLAUDE_PID || ''))
        r.problemas.push(`el pid de claude (${cl.pid}) no coincide con CLAUDE_PID (${process.env.CLAUDE_PID || 'vacio'})`);
    }
  } catch (e) { r.problemas.push(`herdr pane process-info falla: ${e.message}`); }
  return r;
}

function agentesVivos() {
  try { return (herdrSync(['agent', 'list']).result.agents || []).map((a) => a.name).filter(Boolean); }
  catch { return null; }
}

// ---------- precondiciones (pasos 0 a 3): lista de {ok, msg} ----------

function precondiciones(ctx, a, opts) {
  const L = [];
  const add = (ok, msg) => L.push({ ok: Boolean(ok), msg });
  const prueba = opts.prueba;

  const env = entorno();
  add(env.length === 0, env.length ? `entorno: ${env.join('; ')}` : 'entorno Herdr y git');
  if (a) {
    add(a.problemas.length === 0, a.problemas.length ? `panel de A: ${a.problemas.join('; ')}` : 'panel de A (cwd, proceso y agente)');
  }
  add(ctx.tipo !== null, ctx.tipo ? `contenedor: ${ctx.tipo === 'general' ? 'raiz del vault' : `asuntos/${ctx.slug}`}` : `contenedor: ${ctx.cwd} no es la raiz del vault ni asuntos/<slug>`);
  if (!ctx.tipo) return L;

  const sucio = git(['status', '--porcelain', '--', ...ctx.ambito], ctx.cwd);
  add(sucio === '', sucio === '' ? 'arbol limpio en el ambito' : `arbol sucio en el ambito (${(sucio || '?').split('\n').length} entradas)`);

  const rutaRelevo = opts.relevo || path.join(ctx.dirCoord, 'relevo-actual.local.md');
  const rel = leerRelevo(path.resolve(ctx.cwd, rutaRelevo));
  add(rel.existe && rel.plan && rel.cerrado, rel.existe ? (rel.plan && rel.cerrado ? 'fichero de relevo legible (plan y bloques)' : 'fichero de relevo: no casan las lineas 1 o 2 con la plantilla') : `fichero de relevo inexistente: ${rutaRelevo}`);
  add(hashVigente(ctx, rel.hash), `el hash del relevo (${rel.hash || 'ninguno'}) es el ultimo del ambito y ancestro de HEAD`);
  add(rel.ninguna, 'la linea 3 del relevo dice "ninguna" (sin decisiones por escribir)');

  const rutaTab = opts.tablero || path.join(ctx.dirCoord, 'tablero-tandas.md');
  const tabAbs = path.resolve(ctx.cwd, rutaTab);
  let tab = null;
  if (!existsSync(tabAbs)) add(false, `tablero inexistente: ${rutaTab}`);
  else {
    let valido = true; let detalle = '';
    try { execFileSync('node', [TABLERO_MJS, '--comprobar', tabAbs], { stdio: 'pipe', encoding: 'utf8' }); }
    catch (e) { valido = false; detalle = String(e.stderr || '').trim().split('\n').join(' / '); }
    add(valido, valido ? 'el tablero pasa --comprobar' : `el tablero no pasa --comprobar: ${detalle}`);
    if (valido) tab = leerTablero(readFileSync(tabAbs, 'utf8'));
  }
  if (tab) {
    add(rel.plan && tab.plan === rel.plan, `el Plan del tablero (${tab.plan}) es el plan del relevo (${rel.plan})`);
    const versionado = rel.plan ? git(['ls-files', '--error-unmatch', rel.plan], ctx.cwd) !== null : false;
    add(versionado, `el plan del relevo existe y esta versionado (${rel.plan})`);
    const delBloque = tab.filas.filter((f) => f.bloque === rel.cerrado);
    add(delBloque.length > 0 && delBloque.every((f) => /^\[HECHA/.test(f.estado)), `todas las filas del bloque cerrado ${rel.cerrado} estan HECHA`);
    const abiertas = tab.filas.filter((f) => f.estado === '[EN CURSO]' || f.estado.startsWith('[BLOQUEADA'));
    add(abiertas.length === 0, abiertas.length ? `hay filas en curso o bloqueadas: ${abiertas.map((f) => f.id).join(', ')}` : 'ninguna fila en curso ni bloqueada');
    const pend = tab.filas.filter((f) => f.bloque === rel.siguiente && f.estado === '[PENDIENTE]');
    add(pend.length > 0, `el bloque siguiente ${rel.siguiente} tiene filas PENDIENTE (si no, el plan se acabo)`);
    add(!tab.paradas.includes(rel.cerrado), tab.paradas.includes(rel.cerrado) ? `el bloque cerrado ${rel.cerrado} es una parada declarada` : 'el bloque cerrado no es una parada declarada');
  }

  const prev = leerEstado(ctx);
  const seguidos = prev && Number.isInteger(prev.seguidos) ? prev.seguidos : 0;
  add(prueba || seguidos < 3, prueba ? 'cuenta de relevos seguidos: no aplica en la prueba' : `relevos seguidos ${seguidos} (tiene que ser menor que 3)`);

  const vivos = agentesVivos();
  const base = opts.base;
  const nombreB = opts.nombreB;
  add(vivos !== null && !vivos.includes(nombreB), vivos === null ? 'herdr agent list falla' : `el nombre ${nombreB} esta libre`);
  L.rel = rel; L.base = base; L.seguidos = seguidos; L.tab = tab;
  return L;
}

function imprimir(L) {
  for (const x of L) console.log(`${x.ok ? '[OK]' : '[NO]'} ${x.msg}`);
  return L.filter((x) => !x.ok).length;
}

function nombres(prueba, ctx, a) {
  if (prueba) return { base: 'prueba-relevo', nombreB: 'prueba-relevo-b' };
  const base = (a && a.nombre) || (ctx.tipo === 'asunto' ? ctx.slug : 'general');
  return { base, nombreB: `${base}-relevo` };
}

// ---------- modos ----------

function comprobar(args) {
  const opts = { relevo: opcion(args, '--relevo'), tablero: opcion(args, '--tablero'), prueba: false };
  if (args.length) throw new Salida(2, `argumento sobrante: ${args.join(' ')}`);
  const hayEnv = entorno().length === 0;
  const a = hayEnv ? panelA(false) : null;
  const cwd = (a && a.cwd) || process.cwd();
  const ctx = contexto(cwd, false);
  Object.assign(opts, nombres(false, ctx, a));
  const L = precondiciones(ctx, a, opts);
  const n = imprimir(L);
  if (n === 0) { console.log('RELEVO POSIBLE'); return; }
  throw new Salida(4, `RELEVO NO POSIBLE (${n})`);
}

function reiniciarCuenta() {
  const ctx = contexto(process.cwd(), false);
  if (!ctx.tipo) throw new Salida(4, 'el cwd no es la raiz del vault ni asuntos/<slug>');
  const prev = leerEstado(ctx) || {};
  escribirEstado(ctx, { ...prev, seguidos: 0 });
  console.log('relevos seguidos: 0');
}

function textos(ctx, prueba, sinConfirmar, extra) {
  const cmd = (m) => `node ${ctx.script} ${m}${prueba ? ' --prueba' : ''}${extra}`;
  const t1 = sinConfirmar
    ? 'Relevo de sesión de prueba: contesta solo: vale'
    : `Relevo de sesión: ejecuta \`${cmd('--confirmar')}\` y contesta solo con la última línea que imprima. No hagas nada más hasta el siguiente mensaje.`;
  const t2 = prueba
    ? `Relevo confirmado: ejecuta \`${cmd('--tomar')}\`. Es una prueba: no leas el relevo ni hagas nada más; di solo la última línea que imprima.`
    : `Relevo confirmado: ejecuta \`${cmd('--tomar')}\`. Si sale 0, lee \`${ctx.dirCoord}/relevo-actual.local.md\`: es tu prompt de relevo, y lo sigues. Si sale otro código, no sigas: dile al director lo que ha impreso y para.`;
  return { t1, t2 };
}

async function lanzar(args, prueba) {
  const opts = {
    relevo: prueba ? opcion(args, '--relevo') : null,
    tablero: prueba ? opcion(args, '--tablero') : null,
    prueba,
  };
  const sinConfirmar = prueba ? bandera(args, '--sin-confirmar') : false;
  const tArranque = entero(opcion(args, '--timeout-arranque', 60000), '--timeout-arranque');
  const tConf = entero(opcion(args, '--timeout-confirmacion', 240000), '--timeout-confirmacion');
  if (args.length) throw new Salida(2, `argumento sobrante: ${args.join(' ')}`);

  // Paso 0
  const env = entorno();
  if (env.length) throw new Salida(3, env.join('\n'));
  // Pasos 1 y 2
  const a = panelA(prueba);
  if (a.problemas.length) throw new Salida(4, a.problemas.join('\n'));
  const ctx = contexto(a.cwd, prueba);
  if (!ctx.tipo) throw new Salida(4, `el cwd del panel (${a.cwd}) no es la raiz del vault ni asuntos/<slug>`);
  Object.assign(opts, nombres(prueba, ctx, a));
  // Paso 3
  const L = precondiciones(ctx, a, opts);
  if (imprimir(L)) throw new Salida(4, 'RELEVO NO POSIBLE: no se ha tocado nada');
  const { rel, seguidos } = L;
  const nombreA = a.nombre || opts.base;
  const hash = rel.hash;

  // Paso 4
  const extra = (opts.relevo ? ` --relevo "${opts.relevo}"` : '') + (opts.tablero ? ` --tablero "${opts.tablero}"` : '');
  const { t1, t2 } = textos(ctx, prueba, sinConfirmar, extra);
  const estado = {
    modo: prueba ? 'prueba' : 'lanzar', fecha: ahora(), contenedor: ctx.tipo === 'general' ? '.' : `asuntos/${ctx.slug}`,
    relevo: opts.relevo || path.join(ctx.dirCoord, 'relevo-actual.local.md'), hash,
    bloqueCerrado: rel.cerrado, bloqueSiguiente: rel.siguiente,
    paneA: a.paneId, nombreA, paneB: null, nombreB: opts.nombreB, seguidos, fase: 'lanzado',
    confirmacion: null, resultado: null,
  };
  escribirEstado(ctx, estado);

  let paneB = null; let fase = 'lanzado';
  const cerrarB = () => { if (paneB) { try { herdrSync(['pane', 'close', paneB]); } catch { /* ya no esta */ } } };
  const fallo = (codigo, motivo) => {
    estado.fase = 'fallido'; estado.resultado = { codigo, motivo }; escribirEstado(ctx, estado);
    throw new Salida(codigo, motivo);
  };
  const alSenal = () => {
    if (paneB && fase === 'lanzado') {
      cerrarB();
      estado.fase = 'fallido'; estado.resultado = { codigo: 7, motivo: 'interrumpido por senal' };
      try { escribirEstado(ctx, estado); } catch { /* nada */ }
      process.exit(7);
    }
    process.exit(130);
  };
  process.on('SIGINT', alSenal); process.on('SIGTERM', alSenal);

  // Paso 5
  try {
    const s = await herdrAsync(['pane', 'split', a.paneId, '--direction', 'right', '--cwd', a.cwd, '--no-focus']);
    paneB = s.result.pane.pane_id;
  } catch (e) { fallo(5, `no se abrio el panel B: ${e.message}`); }
  estado.paneB = paneB; escribirEstado(ctx, estado);

  // Paso 6: no se contesta ningun dialogo
  try {
    await herdrAsync(['agent', 'start', opts.nombreB, '--kind', 'claude', '--pane', paneB, '--timeout', String(tArranque), '--', '--dangerously-skip-permissions'], { timeout: tArranque + 15000 });
  } catch (e) { cerrarB(); fallo(6, `B no arranco: ${e.message}`); }

  // Pasos 7 y 8: no se reenvia
  const diagnostico = async () => {
    try {
      const r = await herdrAsync(['agent', 'read', opts.nombreB, '--source', 'recent-unwrapped', '--lines', '40']);
      console.error(typeof r.raw === 'string' ? r.raw : JSON.stringify(r.result || r));
    } catch { /* sin diagnostico */ }
  };
  try {
    await herdrAsync(['agent', 'prompt', opts.nombreB, t1, '--wait', '--timeout', String(tConf)], { timeout: tConf + 15000 });
  } catch (e) { await diagnostico(); cerrarB(); fallo(7, `B no confirmo: ${e.message}`); }
  const est = leerEstado(ctx);
  const c = est && est.confirmacion;
  if (!c || c.hash !== hash || c.pane !== paneB) { await diagnostico(); cerrarB(); fallo(7, 'B no escribio una confirmacion valida'); }
  estado.confirmacion = c;

  // Paso 9
  fase = 'confirmado';
  estado.seguidos = prueba ? seguidos : seguidos + 1; estado.fase = 'confirmado';
  escribirEstado(ctx, estado);

  // Paso 10
  try {
    const g = await herdrAsync(['pane', 'get', paneB]);
    if (g.result.pane.tab_id !== a.tab) throw new Error(`B esta en la pestana ${g.result.pane.tab_id}, no en ${a.tab}`);
  } catch (e) { cerrarB(); fallo(8, `B no esta donde debia: ${e.message}`); }

  // Paso 11
  try { await herdrAsync(['agent', 'prompt', opts.nombreB, t2]); }
  catch (e) { cerrarB(); fallo(8, `no se pudo enviar la continuacion: ${e.message}`); }

  // Paso 12
  estado.fase = 'continuado'; escribirEstado(ctx, estado);
  try { await herdrAsync(['pane', 'close', a.paneId]); }
  catch (e) { fallo(9, `A no se cerro: ${e.message}`); }
}

function entornoB(args, prueba) {
  const env = entorno();
  if (env.length) throw new Salida(3, env.join('\n'));
  const cwd = process.cwd();
  const ctx = contexto(cwd, prueba);
  if (!ctx.tipo) throw new Salida(4, 'el cwd no es la raiz del vault ni asuntos/<slug>');
  return ctx;
}

function confirmar(args) {
  const prueba = bandera(args, '--prueba');
  const relevo = opcion(args, '--relevo');
  opcion(args, '--tablero');
  const env = entorno();
  if (env.length) { console.log(`RELEVO NO CONFIRMADO: ${env.join('; ')}`); throw new Salida(3, ''); }
  const ctx = entornoB(args, prueba);
  const motivo = (m) => { console.log(`RELEVO NO CONFIRMADO: ${m}`); throw new Salida(4, ''); };
  const est = leerEstado(ctx);
  if (!est) motivo(`no hay ${ctx.rutaEstado}`);
  if (est.fase !== 'lanzado') motivo(`la fase es ${est.fase}, no lanzado`);
  if (est.paneB !== process.env.HERDR_PANE_ID) motivo(`este panel (${process.env.HERDR_PANE_ID}) no es el paneB del estado (${est.paneB})`);
  const rel = leerRelevo(path.resolve(ctx.cwd, relevo || est.relevo));
  if (!rel.existe) motivo('el fichero de relevo no se lee');
  if (!hashVigente(ctx, rel.hash)) motivo(`el hash del relevo (${rel.hash}) no es el ultimo del ambito o no es ancestro de HEAD`);
  const hash = hashAmbito(ctx);
  est.confirmacion = { hash: rel.hash, pane: process.env.HERDR_PANE_ID, fecha: ahora() };
  escribirEstado(ctx, est);
  console.log(`RELEVO CONFIRMADO ${hash}`);
}

async function tomar(args) {
  const prueba = bandera(args, '--prueba');
  const tCierre = entero(opcion(args, '--timeout-cierre', 120000), '--timeout-cierre');
  const ctx = entornoB(args, prueba);
  const est = leerEstado(ctx);
  const sale = (msg, cod) => { console.log(msg); throw new Salida(cod, ''); };
  if (!est) sale(`no hay ${ctx.rutaEstado}`, 4);
  if (!['continuado', 'confirmado'].includes(est.fase)) sale(`la fase es ${est.fase}, no continuado ni confirmado`, 4);
  if (est.paneB !== process.env.HERDR_PANE_ID) sale('este panel no es el paneB del estado', 4);
  const t0 = Date.now(); let ido = false;
  while (Date.now() - t0 < tCierre) {
    try { await herdrAsync(['pane', 'get', est.paneA]); }
    catch (e) { if (/pane_not_found/.test(e.out || e.message)) { ido = true; break; } }
    await dormir(2000);
  }
  if (!ido) {
    est.fase = 'fallido'; est.resultado = { codigo: 9, motivo: 'A sigue vivo' }; escribirEstado(ctx, est);
    sale('A SIGUE VIVO: no sigas', 9);
  }
  try { herdrSync(['agent', 'rename', process.env.HERDR_PANE_ID, est.nombreA]); }
  catch (e) { console.error(`aviso: no se pudo renombrar a ${est.nombreA}: ${e.message}`); }
  est.fase = 'tomado'; est.resultado = { codigo: 0, motivo: 'tomado' }; escribirEstado(ctx, est);
  console.log('RELEVO TOMADO');
}

async function main() {
  const args = process.argv.slice(2);
  const modo = args.shift();
  switch (modo) {
    case '--ayuda': console.log(AYUDA); return;
    case '--comprobar': return comprobar(args);
    case '--lanzar': return lanzar(args, false);
    case '--prueba': return lanzar(args, true);
    case '--confirmar': return confirmar(args);
    case '--tomar': return tomar(args);
    case '--reiniciar-cuenta': return reiniciarCuenta();
    default: throw new Salida(2, `modo desconocido o ausente: ${modo || '(ninguno)'}\n${AYUDA}`);
  }
}

main().catch((e) => {
  if (e instanceof Salida) { if (e.message) console.error(e.message); process.exit(e.codigo); }
  console.error(e && e.message ? e.message : String(e));
  process.exit(1);
});
