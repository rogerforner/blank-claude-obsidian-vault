#!/usr/bin/env node
// relevo.mjs: relevo autonomo de un coordinador por Herdr (ciclo_de_tandas).
// Sin dependencias; solo execFile/execFileSync con argumentos separados.
// Salidas: 0 bien, 1 error interno, 2 uso, 3 entorno, 4 precondicion (no se ha tocado nada),
// 5 no se abrio el panel B, 6 B no arranco, 7 B no confirmo, 8 fallo la continuacion,
// 9 A no se cerro (o, en --tomar, A sigue vivo), 10 sigue en esta sesion.
// --reiniciar-coordinador: 2 uso, 3 entorno, 4 precondicion, 6 la nueva no arranco, 7 la vieja no salio, 8 sin prompt de arranque.
import { readFileSync, writeFileSync, existsSync, realpathSync } from 'node:fs';
import os from 'node:os';
import { execFile, execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { leerTablero } from './tablero.mjs';
import { ambitoDe, listarAsuntos, pathspecDe } from './espacios.mjs';
import { estadoSello } from './sello-dod.mjs';

const AQUI = fileURLToPath(import.meta.url);
const TABLERO_MJS = path.join(path.dirname(AQUI), 'tablero.mjs');

const AYUDA = `Uso: node <ruta>/general/comun/scripts/relevo.mjs <modo> [opciones]
Modos:
  --lanzar             lo corre A, el coordinador que se va: el relevo de verdad
  --confirmar          lo corre B, la sesion nueva, en su primer turno
  --tomar              lo corre B en su segundo turno: espera a que A desaparezca, se renombra y sigue
  --comprobar          seco: las precondiciones de A, todas listadas; solo lee Herdr, git y la linea de estado
  --prueba             lo corre un shell en una pestana desechable (A sin agente, nombre prueba-relevo)
  --reiniciar-cuenta   pone a 0 los relevos seguidos (cuando el director ha intervenido)
  --reiniciar-coordinador <nombre>   solo desde la raiz del vault: el general reinicia la sesion de un coordinador sin trabajo
                       (/exit, espera a la shell, herdr agent start y prompt de arranque); --seco solo lista las precondiciones
  --ayuda
Opciones: --relevo <ruta>, --tablero <ruta> (solo --comprobar y --prueba, para fixtures)
          --linea-estado <ruta> (solo --comprobar y --prueba: fichero de la linea de estado, para fixtures)
          --recargar (--lanzar, --prueba, --comprobar: relevarse aunque el contexto este por debajo del suelo, para cargar reglas o agentes nuevos)
          --timeout-arranque MS (def. 60000), --timeout-confirmacion MS (def. 240000), --timeout-cierre MS (def. 120000)
          --sin-confirmar (solo --prueba: B recibe un prompt que no confirma)
          --seco, --prompt <texto>, --timeout-salida MS (def. 60000) (solo --reiniciar-coordinador; usa tambien --timeout-arranque)
Salidas: 0 bien; 1 error interno; 2 uso; 3 entorno (fuera de Herdr, sin servidor o sin git);
  4 precondicion, no se releva y no se ha tocado nada; 5 no se abrio el panel B;
  6 B no arranco (B cerrado, A vivo); 7 B no confirmo (B cerrado, A vivo);
  8 fallo la continuacion (B cerrado, A vivo); 9 A no se cerro o, en --tomar, A sigue vivo;
  10 sigue en esta sesion (contexto por debajo del suelo; no se ha tocado nada).
--reiniciar-coordinador: 2 uso; 3 entorno; 4 precondicion, nada tocado; 6 la sesion nueva no arranco (el panel queda en la shell); 7 la vieja no salio (no se arranco nada); 8 la nueva no recibio el prompt.
Umbrales: higiene_contexto_y_tokens, seccion 'Umbrales de relevo y ritmo de cuota' (copia en UMBRALES).
El fichero de relevo sigue una de las dos plantillas de ciclo_de_tandas (con plan de tandas o sin plan) y el DoD del
ambito tiene que estar sellado y vigente (node _meta/dod.mjs) antes de relevarse.
Si el proceso tiene CLAUDE_CONFIG_DIR, el panel B la recibe con --env (la cuenta de la sucesora es la de esta sesion).`;

class Salida extends Error { constructor(codigo, msg) { super(msg); this.codigo = codigo; } }

// ---------- utilidades ----------

// Copia de los umbrales de higiene_contexto_y_tokens ("Umbrales de relevo y ritmo de cuota"); la ata el caso R20 de probar-espacios.mjs.
export const UMBRALES = { contextoCierre: 30, contextoFrontera: 50, sueloTokens: 100000, cincoHoras: 90, semanal: 90, frescuraMin: 15 };

export function leerLineaEstado(ruta) {
  if (!ruta) return { error: 'sin HERDR_PANE_ID ni --linea-estado' };
  if (!existsSync(ruta)) return { error: `no existe ${ruta}` };
  try { return JSON.parse(readFileSync(ruta, 'utf8')); } catch { return { error: `no se lee o no es JSON: ${ruta}` }; }
}

const pad2 = (n) => String(n).padStart(2, '0');
const hora = (epoch) => { const d = new Date(epoch * 1000); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
const fechaHora = (epoch) => { const d = new Date(epoch * 1000); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${hora(epoch)}`; };
const millar = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const numero = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);

// Pura: no lee ficheros ni el entorno. Devuelve { lineas: [{nivel, msg}], sigue, avisoCuota, resumen }.
export function veredictoLineaEstado(datos, { ahora: ahoraMs = Date.now(), sesion = null, recargar = false, prueba = false } = {}) {
  const U = UMBRALES;
  const res = { lineas: [], sigue: false, avisoCuota: null, resumen: null };
  const invalido = (motivo) => {
    res.lineas = [{ nivel: 'AVISO', msg: `linea de estado: ${motivo}; no se aplican los umbrales de contexto ni de cuota` }];
    res.resumen = { veredicto: `sin dato: ${motivo}` };
    return res;
  };
  if (!datos || datos.error) return invalido((datos && datos.error) || 'sin datos');
  if (!datos.written_at) return invalido('sin written_at');
  const escrita = Date.parse(String(datos.written_at).replace(/([+-]\d{2})(\d{2})$/, '$1:$2'));
  if (!Number.isFinite(escrita)) return invalido(`written_at ilegible: ${datos.written_at}`);
  const hace = Math.round((ahoraMs - escrita) / 1000);
  if (hace > U.frescuraMin * 60) return invalido(`escrita hace ${Math.round(hace / 60)} min (mas de ${U.frescuraMin})`);
  if (sesion && datos.session_id !== sesion) return invalido(`es de otra sesion (${datos.session_id}; esta es ${sesion})`);
  const add = (nivel, msg) => res.lineas.push({ nivel, msg });
  add('OK', `linea de estado: escrita hace ${hace} s, sesion ${sesion ? 'coincide' : 'sin comprobar'}`);

  const cw = datos.context_window || {};
  const pct = numero(cw.used_percentage); const tam = numero(cw.context_window_size);
  const tokens = pct !== null && tam !== null ? Math.round(pct / 100 * tam) : null;
  if (pct === null) add('AVISO', 'contexto: sin dato');
  else {
    let v;
    if (pct >= U.contextoFrontera) v = `desde el ${U.contextoFrontera} %: relevate en esta frontera, sin abrir bloque nuevo`;
    else if (pct >= U.contextoCierre) v = `desde el ${U.contextoCierre} %: cierra el bloque en curso y relevate`;
    else if (U.sueloTokens > 0 && tokens !== null && tokens < U.sueloTokens) {
      const suelo = `${millar(U.sueloTokens)} tokens`;
      if (recargar) v = `por debajo del suelo de ${suelo}, pero --recargar: se releva`;
      else if (prueba) v = 'por debajo del suelo, no aplica en la prueba';
      else { v = `por debajo del suelo de ${suelo}: sigue en esta sesion (--recargar para relevarte igual)`; res.sigue = true; }
    } else v = 'relevo al cerrar el bloque';
    add('OK', `contexto ${Math.floor(pct)} %${tokens !== null ? ` (${millar(tokens)} tokens)` : ''}: ${v}`);
  }

  const ahoraS = ahoraMs / 1000;
  const ventana = (clave, etiqueta, umbral, durS, textoNo, textoAviso) => {
    const w = (datos.rate_limits || {})[clave] || {};
    const used = numero(w.used_percentage); const resets = numero(w.resets_at);
    if (used === null) { add('AVISO', `${etiqueta}: sin dato, no se aplica el umbral`); return; }
    if (resets !== null && resets <= ahoraS) { add('OK', `${etiqueta}: la ventana reinicio a las ${hora(resets)}, sin uso nuevo`); return; }
    const n = Math.floor(used);
    const trans = resets !== null ? Math.max(0, Math.min(100, Math.floor((1 - (resets - ahoraS) / durS) * 100))) : null;
    if (used >= umbral) { add('NO', textoNo(n, resets)); return; }
    if (trans !== null && used > trans) {
      const msg = textoAviso(n, trans);
      add('AVISO', msg); res.avisoCuota = res.avisoCuota ? `${res.avisoCuota}; ${msg}` : msg; return;
    }
    add('OK', trans !== null ? `${etiqueta} al ${n} % (${trans} % de ${clave === 'five_hour' ? 'la ventana' : 'la semana'} transcurrido; reinicia ${hora(resets)})` : `${etiqueta} al ${n} %`);
  };
  ventana('five_hour', '5 h', U.cincoHoras, 18000,
    (n, r) => `5 h al ${n} % (desde el ${U.cincoHoras} %): nada nuevo hasta el reinicio${r !== null ? `, ${fechaHora(r)}` : ''}`,
    (n, m) => `5 h al ${n} %, por delante del ritmo (${m} % de la ventana transcurrido): una ejecutora a la vez`);
  ventana('seven_day', 'semanal', U.semanal, 604800,
    (n, r) => `semanal al ${n} % (desde el ${U.semanal} %): nada nuevo; decide el director${r !== null ? ` (reinicia ${fechaHora(r)})` : ''}`,
    (n, m) => `semanal al ${n} %, por delante del ritmo (${m} % de la semana transcurrido): prioriza lo urgente y avisa al director`);

  const w5 = (datos.rate_limits || {}).five_hour || {}; const w7 = (datos.rate_limits || {}).seven_day || {};
  res.resumen = { ctx: pct, tokens, h5: numero(w5.used_percentage), d7: numero(w7.used_percentage), escrita: datos.written_at, veredicto: 'aplicado' };
  return res;
}

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

export function argsSplit(paneId, cwd, env = process.env) {
  const a = ['pane', 'split', paneId, '--direction', 'right', '--cwd', cwd, '--no-focus'];
  if (env.CLAUDE_CONFIG_DIR) a.push('--env', 'CLAUDE_CONFIG_DIR=' + env.CLAUDE_CONFIG_DIR);
  return a;
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
  let tipo = null; let slug = null; let espacio = null; let amb = null;
  if (raiz) {
    amb = ambitoDe(raiz, c);
    if (amb.tipo === 'general' && amb.exacto) tipo = 'general';
    else if (amb.tipo === 'asunto' && amb.exacto) { tipo = 'asunto'; slug = amb.slug; espacio = amb.espacio; }
  }
  const dirCoord = tipo === 'general' ? '_meta' : 'coordinacion';
  const ambito = tipo ? pathspecDe(amb, listarAsuntos(raiz)) : ['.'];
  const script = tipo === 'asunto' ? '../../general/comun/scripts/relevo.mjs' : 'general/comun/scripts/relevo.mjs';
  return {
    cwd, raiz, amb, tipo, slug, espacio, dirCoord, ambito, script,
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

export function leerRelevo(ruta) {
  const r = { existe: false, modo: null, plan: null, cerrado: null, hash: null, siguiente: null, siguienteTexto: null, ninguna: false };
  if (!existsSync(ruta)) return r;
  let texto;
  try { texto = readFileSync(ruta, 'utf8'); } catch { return r; }
  r.existe = true;
  const l = texto.split('\n');
  const m1 = (l[0] || '').match(/`([^`]*plan-tanda-[^`]+\.md)`/);
  if (m1) r.plan = m1[1];
  const m2 = (l[1] || '').match(/Último bloque cerrado: ([A-Z][0-9]?), en el commit ([0-9a-f]{7,40})\. Siguiente: bloque ([A-Z][0-9]?) — /);
  const m3 = (l[1] || '').match(/^Último cierre: (.+), en el commit ([0-9a-f]{7,40})\. Siguiente: (.+)$/);
  if (r.plan && m2) { r.modo = 'plan'; r.cerrado = m2[1]; r.hash = m2[2]; r.siguiente = m2[3]; }
  else if (!r.plan && m3) { r.modo = 'sinplan'; r.cerrado = m3[1]; r.hash = m3[2]; r.siguienteTexto = m3[3].trim(); }
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
  const rutaLinea = opts.lineaEstado || (process.env.HERDR_PANE_ID ? path.join(os.homedir(), '.cache', 'claude-statusline', process.env.HERDR_PANE_ID.replace(/:/g, '_') + '.json') : null);
  const ver = veredictoLineaEstado(leerLineaEstado(rutaLinea), { sesion: process.env.CLAUDE_CODE_SESSION_ID || null, recargar: Boolean(opts.recargar), prueba: Boolean(opts.prueba) });
  for (const x of ver.lineas) L.push({ ok: x.nivel !== 'NO', nivel: x.nivel, msg: x.msg });
  L.sigue = ver.sigue; L.avisoCuota = ver.avisoCuota; L.lineaEstado = { ruta: rutaLinea, ...ver.resumen };
  if (a) {
    add(a.problemas.length === 0, a.problemas.length ? `panel de A: ${a.problemas.join('; ')}` : 'panel de A (cwd, proceso y agente)');
  }
  add(ctx.tipo !== null, ctx.tipo ? `contenedor: ${ctx.tipo === 'general' ? 'raiz del vault' : `${ctx.espacio}/${ctx.slug}`}` : `contenedor: ${ctx.cwd} no es la raiz del vault ni <espacio>/<slug>`);
  if (!ctx.tipo) return L;

  const sucio = git(['status', '--porcelain', '--', ...ctx.ambito], ctx.cwd);
  add(sucio === '', sucio === '' ? 'arbol limpio en el ambito' : `arbol sucio en el ambito (${(sucio || '?').split('\n').length} entradas)`);

  const rutaRelevo = opts.relevo || path.join(ctx.dirCoord, 'relevo-actual.local.md');
  const rel = leerRelevo(path.resolve(ctx.cwd, rutaRelevo));
  add(rel.existe && rel.modo, rel.existe ? (rel.modo ? `fichero de relevo legible (${rel.modo === 'plan' ? 'con plan y bloques' : 'sin plan'})` : 'fichero de relevo: no casan las lineas 1 o 2 con ninguna de las dos plantillas') : `fichero de relevo inexistente: ${rutaRelevo}`);
  add(hashVigente(ctx, rel.hash), `el hash del relevo (${rel.hash || 'ninguno'}) es el ultimo del ambito y ancestro de HEAD`);
  add(rel.ninguna, 'la linea 3 del relevo dice "ninguna" (sin decisiones por escribir)');

  const sello = ctx.raiz && ctx.amb ? estadoSello(ctx.raiz, ctx.amb) : null;
  if (!sello) add(true, 'DoD del ambito: este arbol no usa sello');
  else if (sello.ok) add(true, `DoD del ambito sellado y vigente (${sello.por})`);
  else add(false, `DoD del ambito: ${sello.por} — corre ${ctx.tipo === 'general' ? 'node _meta/dod.mjs' : 'node ../../_meta/dod.mjs'} antes de relevarte`);

  const rutaTab = opts.tablero || path.join(ctx.dirCoord, 'tablero-tandas.md');
  const tabAbs = path.resolve(ctx.cwd, rutaTab);
  let tab = null;
  if (!existsSync(tabAbs)) { if (rel.modo === 'sinplan') add(true, 'sin plan: el tablero no hace falta'); else add(false, `tablero inexistente: ${rutaTab}`); }
  else {
    let valido = true; let detalle = '';
    try { execFileSync('node', [TABLERO_MJS, '--comprobar', tabAbs], { stdio: 'pipe', encoding: 'utf8' }); }
    catch (e) { valido = false; detalle = String(e.stderr || '').trim().split('\n').join(' / '); }
    add(valido, valido ? 'el tablero pasa --comprobar' : `el tablero no pasa --comprobar: ${detalle}`);
    if (valido) tab = leerTablero(readFileSync(tabAbs, 'utf8'));
  }
  if (rel.modo === 'sinplan') {
    const sig = rel.siguienteTexto || '';
    add(sig !== '' && !/^(nada|ninguno|ninguna)\b/i.test(sig), sig !== '' && !/^(nada|ninguno|ninguna)\b/i.test(sig) ? 'hay trabajo siguiente (la linea 2 lo nombra)' : 'sin trabajo siguiente: no se releva, se para (para cargar reglas nuevas sin trabajo, el general reinicia la sesion con --reiniciar-coordinador)');
    if (tab) {
      const abiertas = tab.filas.filter((f) => f.estado === '[EN CURSO]' || f.estado.startsWith('[BLOQUEADA'));
      add(abiertas.length === 0, abiertas.length ? `hay filas en curso o bloqueadas: ${abiertas.map((f) => f.id).join(', ')}` : 'ninguna fila en curso ni bloqueada');
      const vivas = tab.filas.filter((f) => !/^\[HECHA/.test(f.estado));
      const vivo = tab.plan && tab.plan !== 'ninguno' && vivas.length > 0;
      add(!vivo, vivo ? `el tablero tiene un plan vivo (${tab.plan}) con filas sin HECHA: usa el relevo con plan` : 'el tablero no tiene un plan vivo');
    }
  } else if (tab) {
    add(rel.plan && tab.plan === rel.plan, `el Plan del tablero (${tab.plan}) es el plan del relevo (${rel.plan})`);
    const versionado = rel.plan ? git(['ls-files', '--error-unmatch', rel.plan], ctx.cwd) !== null : false;
    add(versionado, `el plan del relevo existe y esta versionado (${rel.plan})`);
    const delBloque = tab.filas.filter((f) => f.bloque === rel.cerrado);
    add(delBloque.length > 0 && delBloque.every((f) => /^\[HECHA/.test(f.estado)), `todas las filas del bloque cerrado ${rel.cerrado} estan HECHA`);
    const abiertas = tab.filas.filter((f) => f.estado === '[EN CURSO]' || f.estado.startsWith('[BLOQUEADA'));
    add(abiertas.length === 0, abiertas.length ? `hay filas en curso o bloqueadas: ${abiertas.map((f) => f.id).join(', ')}` : 'ninguna fila en curso ni bloqueada');
    const pend = tab.filas.filter((f) => f.bloque === rel.siguiente && f.estado === '[PENDIENTE]');
    add(pend.length > 0, `el bloque siguiente ${rel.siguiente} tiene filas PENDIENTE (si no, el plan se acabo: si queda trabajo, escribe el relevo sin plan)`);
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
  for (const x of L) console.log(`[${x.nivel && x.ok ? x.nivel : x.ok ? 'OK' : 'NO'}] ${x.msg}`);
  return L.filter((x) => !x.ok).length;
}

function nombres(prueba, ctx, a) {
  if (prueba) return { base: 'prueba-relevo', nombreB: 'prueba-relevo-b' };
  const base = (a && a.nombre) || (ctx.tipo === 'asunto' ? ctx.slug : 'general');
  return { base, nombreB: `${base}-relevo` };
}

// ---------- modos ----------

const SIGUE = 'SIGUE EN ESTA SESION: contexto por debajo del suelo (--recargar para relevarte igual)';

function comprobar(args) {
  const opts = { relevo: opcion(args, '--relevo'), tablero: opcion(args, '--tablero'), lineaEstado: opcion(args, '--linea-estado'), recargar: bandera(args, '--recargar'), prueba: false };
  if (args.length) throw new Salida(2, `argumento sobrante: ${args.join(' ')}`);
  const hayEnv = entorno().length === 0;
  const a = hayEnv ? panelA(false) : null;
  const cwd = (a && a.cwd) || process.cwd();
  const ctx = contexto(cwd, false);
  Object.assign(opts, nombres(false, ctx, a));
  const L = precondiciones(ctx, a, opts);
  const n = imprimir(L);
  if (n === 0) {
    if (L.sigue) { console.log(SIGUE); throw new Salida(10, ''); }
    console.log('RELEVO POSIBLE'); return;
  }
  throw new Salida(4, `RELEVO NO POSIBLE (${n})`);
}

function reiniciarCuenta() {
  const ctx = contexto(process.cwd(), false);
  if (!ctx.tipo) throw new Salida(4, 'el cwd no es la raiz del vault ni <espacio>/<slug>');
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
    lineaEstado: prueba ? opcion(args, '--linea-estado') : null,
    recargar: bandera(args, '--recargar'),
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
  if (!ctx.tipo) throw new Salida(4, `el cwd del panel (${a.cwd}) no es la raiz del vault ni <espacio>/<slug>`);
  Object.assign(opts, nombres(prueba, ctx, a));
  // Paso 3
  const L = precondiciones(ctx, a, opts);
  if (imprimir(L)) throw new Salida(4, 'RELEVO NO POSIBLE: no se ha tocado nada');
  if (L.sigue) { console.log(SIGUE); throw new Salida(10, ''); }
  const { rel, seguidos } = L;
  const nombreA = a.nombre || opts.base;
  const hash = rel.hash;

  // Paso 4
  const extra = (opts.relevo ? ` --relevo "${opts.relevo}"` : '') + (opts.tablero ? ` --tablero "${opts.tablero}"` : '');
  const { t1, t2: t2base } = textos(ctx, prueba, sinConfirmar, extra);
  const t2 = L.avisoCuota && !prueba ? `${t2base} Aviso de cuota de la sesión anterior: ${L.avisoCuota}; díselo al director en tu primera respuesta.` : t2base;
  const estado = {
    modo: prueba ? 'prueba' : 'lanzar', fecha: ahora(), contenedor: ctx.tipo === 'general' ? '.' : `${ctx.espacio}/${ctx.slug}`,
    relevo: opts.relevo || path.join(ctx.dirCoord, 'relevo-actual.local.md'), hash,
    modoRelevo: rel.modo,
    bloqueCerrado: rel.modo === 'plan' ? rel.cerrado : null, bloqueSiguiente: rel.modo === 'plan' ? rel.siguiente : null,
    paneA: a.paneId, nombreA, paneB: null, nombreB: opts.nombreB, seguidos, fase: 'lanzado',
    confirmacion: null, resultado: null,
    recargar: opts.recargar,
    lineaEstado: { ruta: L.lineaEstado.ruta, ctx: L.lineaEstado.ctx ?? null, tokens: L.lineaEstado.tokens ?? null, h5: L.lineaEstado.h5 ?? null, d7: L.lineaEstado.d7 ?? null, escrita: L.lineaEstado.escrita ?? null, veredicto: L.lineaEstado.veredicto },
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
    const s = await herdrAsync(argsSplit(a.paneId, a.cwd));
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
  if (!ctx.tipo) throw new Salida(4, 'el cwd no es la raiz del vault ni <espacio>/<slug>');
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

// ---------- reinicio de un coordinador por el general ----------

// Sin Herdr. Devuelve [{ ok, msg }] sobre la carpeta de un asunto.
export function precondicionesReinicio(raiz, carpeta, { tablero } = {}) {
  const L = [];
  const add = (ok, msg) => L.push({ ok: Boolean(ok), msg });
  const c = real(carpeta);
  const amb = ambitoDe(raiz, c);
  if (!(amb.tipo === 'asunto' && amb.exacto)) { add(false, `no es la carpeta de un asunto: ${carpeta}`); return L; }
  add(true, `carpeta de asunto: ${amb.espacio}/${amb.slug}`);
  const ambito = pathspecDe(amb, listarAsuntos(raiz));
  const sucio = git(['status', '--porcelain', '--', ...ambito], c);
  add(sucio === '', sucio === '' ? 'arbol limpio en el ambito del asunto' : `arbol sucio en el ambito del asunto (${(sucio || '?').split('\n').length} entradas)`);
  const sello = estadoSello(raiz, amb);
  if (!sello) add(true, 'DoD del ambito: este arbol no usa sello');
  else if (sello.ok) add(true, `DoD del ambito sellado y vigente (${sello.por})`);
  else add(false, `DoD del ambito: ${sello.por}`);
  const tabAbs = tablero ? path.resolve(tablero) : path.join(c, 'coordinacion', 'tablero-tandas.md');
  if (!existsSync(tabAbs)) add(true, 'sin tablero');
  else {
    let tab = null;
    try { tab = leerTablero(readFileSync(tabAbs, 'utf8')); } catch (e) { add(false, `el tablero no se lee: ${e.message}`); }
    if (tab) {
      const vivas = tab.filas.filter((f) => !/^\[HECHA/.test(f.estado));
      const vivo = tab.plan && tab.plan !== 'ninguno' && vivas.length > 0;
      add(!vivo, vivo ? `el tablero tiene un plan vivo (${tab.plan}) con filas sin HECHA: no esta sin trabajo` : 'sin plan vivo');
      const abiertas = tab.filas.filter((f) => f.estado === '[EN CURSO]' || f.estado.startsWith('[BLOQUEADA'));
      add(abiertas.length === 0, abiertas.length ? `hay filas en curso o bloqueadas: ${abiertas.map((f) => f.id).join(', ')}` : 'ninguna fila en curso ni bloqueada');
    }
  }
  let fase = null;
  const pe = path.join(c, 'coordinacion', 'relevo-estado.local.json');
  if (existsSync(pe)) { try { fase = JSON.parse(readFileSync(pe, 'utf8')).fase || null; } catch { fase = null; } }
  const medias = ['lanzado', 'confirmado', 'continuado'].includes(fase);
  add(!medias, medias ? `relevo a medias (fase ${fase})` : 'sin relevo a medias');
  return L;
}

const sinClaude = (pi) => !(pi.foreground_processes || []).some((x) => x.argv0 === 'claude');

async function reiniciarCoordinador(args) {
  const nombre = args.shift();
  if (!nombre || nombre.startsWith('--')) throw new Salida(2, 'falta el nombre del coordinador: --reiniciar-coordinador <nombre>');
  const seco = bandera(args, '--seco');
  const prompt = opcion(args, '--prompt', 'Sesión reiniciada por el coordinador general para que cargues las reglas nuevas. Arranca como coordinador de este asunto y dime en tres líneas su estado.');
  const tSalida = entero(opcion(args, '--timeout-salida', '60000'), '--timeout-salida');
  const tArranque = entero(opcion(args, '--timeout-arranque', '60000'), '--timeout-arranque');
  if (args.length) throw new Salida(2, `argumento sobrante: ${args.join(' ')}`);
  const ctx = contexto(process.cwd(), false);
  if (ctx.tipo !== 'general') throw new Salida(4, 'solo el coordinador general reinicia coordinadores (desde la raiz del vault)');
  const env = entorno();
  if (env.length) throw new Salida(3, `entorno: ${env.join('; ')}`);

  const L = [];
  const add = (ok, msg) => L.push({ ok: Boolean(ok), msg });
  let ag = null; let panel = null; let cwdAg = null;
  try { ag = herdrSync(['agent', 'get', nombre]).result.agent; } catch { ag = null; }
  add(ag, ag ? `el agente ${nombre} existe (${ag.pane_id}, ${ag.agent_status})` : `el agente ${nombre} no existe en Herdr`);
  if (ag) {
    panel = ag.pane_id; cwdAg = ag.cwd;
    add(panel !== process.env.HERDR_PANE_ID, panel !== process.env.HERDR_PANE_ID ? 'no es el panel propio' : 'es este panel: para relevarte a ti, --lanzar');
    const idle = ag.agent_status === 'idle' || ag.agent_status === 'done';
    add(idle, idle ? `estado ${ag.agent_status}` : `${ag.agent_status}: no se reinicia una sesion con turno en curso o con un dialogo`);
    try {
      const pi = herdrSync(['pane', 'process-info', '--pane', panel]).result.process_info;
      const cl = (pi.foreground_processes || []).find((x) => x.argv0 === 'claude');
      const bien = cl && JSON.stringify(cl.argv) === JSON.stringify(['claude', '--dangerously-skip-permissions']);
      add(bien, bien ? 'proceso claude con --dangerously-skip-permissions en el panel' : cl ? `argv de claude no es exactamente --dangerously-skip-permissions: ${JSON.stringify(cl.argv)}` : 'no hay proceso claude en primer plano del panel');
    } catch (e) { add(false, `herdr pane process-info falla: ${e.message}`); }
    for (const x of precondicionesReinicio(ctx.raiz, real(cwdAg))) L.push(x);
  }
  const n = imprimir(L);
  if (n > 0) throw new Salida(4, 'REINICIO NO POSIBLE: no se ha tocado nada');
  if (seco) { console.log('REINICIO POSIBLE'); return; }

  try { herdrSync(['agent', 'prompt', nombre, '/exit']); }
  catch (e) { throw new Salida(7, `no se pudo mandar /exit a ${nombre}: ${e.message}; no se ha arrancado nada`); }
  const limite = Date.now() + tSalida;
  let fuera = false;
  while (Date.now() < limite) {
    await dormir(1000);
    try {
      const pi = herdrSync(['pane', 'process-info', '--pane', panel]).result.process_info;
      if (sinClaude(pi) && String(pi.foreground_process_group_id) === String(pi.shell_pid)) { fuera = true; break; }
    } catch { /* se reintenta */ }
  }
  if (!fuera) throw new Salida(7, `la sesion vieja no salio en ${tSalida} ms: no se ha arrancado nada; mira el panel ${panel}`);
  // Herdr suelta el nombre del agente un poco despues de que la shell vuelva a primer plano (medido
  // el 2026-10-22: el primer agent start fallaba y el de un instante despues entraba). Se reintenta.
  const limiteArranque = Date.now() + tArranque;
  let ultimoError = '';
  for (;;) {
    try {
      await herdrAsync(['agent', 'start', nombre, '--kind', 'claude', '--pane', panel, '--timeout', String(tArranque), '--', '--dangerously-skip-permissions'], { timeout: tArranque + 10000 });
      break;
    } catch (e) {
      ultimoError = e.message;
      if (Date.now() >= limiteArranque) throw new Salida(6, `la sesion nueva no arranco (${ultimoError}): el panel ${panel} queda en la shell y el coordinador sin sesion; arrancala con: herdr agent start ${nombre} --kind claude --pane ${panel} -- --dangerously-skip-permissions`);
      await dormir(2000);
    }
  }
  try { herdrSync(['agent', 'prompt', nombre, prompt]); }
  catch { throw new Salida(8, `la sesion nueva arranco pero no recibio el prompt de arranque: mandaselo con herdr agent prompt ${nombre} "<prompt>"`); }
  console.log(`COORDINADOR REINICIADO ${nombre} (${panel})`);
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
    case '--reiniciar-coordinador': return reiniciarCoordinador(args);
    default: throw new Salida(2, `modo desconocido o ausente: ${modo || '(ninguno)'}\n${AYUDA}`);
  }
}

if (process.argv[1] && realpathSync(path.resolve(process.argv[1])) === realpathSync(AQUI)) main().catch((e) => {
  if (e instanceof Salida) { if (e.message) console.error(e.message); process.exit(e.codigo); }
  console.error(e && e.message ? e.message : String(e));
  process.exit(1);
});
