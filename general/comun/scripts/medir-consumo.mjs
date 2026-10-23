#!/usr/bin/env node
// medir-consumo.mjs -- mide el consumo de las sesiones y subagentes de Claude Code
// a partir de las transcripciones locales. Solo recuentos: nunca imprime texto de una
// conversacion ni rutas ajenas al vault.
//
// Uso:
//   --resumen [--desde AAAA-MM-DD] [--proyectos <dir>]
//   --calibrar [--desde AAAA-MM-DD] [--proyectos <dir>] [--historial <fichero>]
//   --prueba      datos sinteticos en un directorio temporal, cinco casos
//   --ayuda
//
// Codigos de salida: 0 bien, 1 error interno (o prueba fallida), 2 uso, 4 sin datos.
//
// Valores por defecto (se calculan con os.homedir(), sin rutas de maquina en el codigo):
//   proyectos: ~/.claude/projects
//   historial: ~/.local/share/claude-uso/historial.jsonl
//
// PRECIOS: dolares por millon de tokens. Son un PROXY de coste relativo entre modelos
// ("$eq"), no una factura: el vault opera por suscripcion. Origen: general/comun/modelos-y-esfuerzo.md
// seccion 1. Escritura de cache: 1,25 x entrada a 5 min y 2 x entrada a 1 h [OFICIAL, verificado 2026-10-23,
// platform.claude.com/docs/en/about-claude/pricing]. Lectura de cache: 0,05 x en Opus y Sonnet 5.5, 0,1 x en Haiku 5.5,
// 0,025 x en Fable 5.1. Haiku 5.5 multiplica por 5 todos sus precios si el prompt supera 100k tokens.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const PRECIOS = {
  'claude-opus-5-5':   { ent: 4,    sal: 20,  lec: 0.20 },
  'claude-sonnet-5-5': { ent: 2,    sal: 10,  lec: 0.10 },
  'claude-haiku-5-5':  { ent: 0.10, sal: 0.50, lec: 0.01 },
  'claude-fable-5-1':  { ent: 10,   sal: 50,  lec: 0.25 },
};
const PRECIO_DEFECTO = PRECIOS['claude-sonnet-5-5']; // modelo desconocido: se tarifa como Sonnet
const MAX_LINEAS = 40;
const TIPOS = ['sesion', 'planificador', 'ejecutora', 'ejecutora-mecanica', 'probador-ui', 'otros'];

const AYUDA = `medir-consumo.mjs -- consumo de sesiones y subagentes (solo recuentos)
  --resumen [--desde AAAA-MM-DD] [--proyectos <dir>]
  --calibrar [--desde AAAA-MM-DD] [--proyectos <dir>] [--historial <fichero>]
  --prueba   cinco casos sinteticos en un directorio temporal
  --ayuda
Defecto: proyectos ~/.claude/projects, historial ~/.local/share/claude-uso/historial.jsonl
Salida: 0 bien, 1 error interno, 2 uso, 4 sin datos. Maximo ${MAX_LINEAS} lineas.
Precios: proxy en $eq, ver comentario del script y general/comun/modelos-y-esfuerzo.md seccion 1.`;

// ---------- utilidades ----------
const mediana = (a) => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const suma = (a) => a.reduce((x, y) => x + y, 0);
const fmtN = (n) => Math.round(n).toLocaleString('es-ES');
const fmtD = (n, d = 2) => n.toFixed(d).replace('.', ',');
const diaLocal = (ts) => new Date(ts).toLocaleDateString('sv'); // AAAA-MM-DD en hora local

function costes(u, modelo) {
  const base = PRECIOS[modelo] || PRECIO_DEFECTO;
  const cc = u.cache_creation || {};
  const w1 = cc.ephemeral_1h_input_tokens ?? 0;
  const w5 = cc.ephemeral_5m_input_tokens ?? Math.max(0, (u.cache_creation_input_tokens || 0) - w1);
  const prompt = (u.input_tokens || 0) + (u.cache_creation_input_tokens ?? (w1 + w5)) + (u.cache_read_input_tokens || 0);
  const k = modelo === 'claude-haiku-5-5' && prompt > 100000 ? 5 : 1; // Haiku 5.5: x5 por encima de 100k de prompt
  const p = { ent: base.ent * k, sal: base.sal * k, lec: base.lec * k };
  const sinLect = ((u.input_tokens || 0) * p.ent + w5 * p.ent * 1.25 + w1 * p.ent * 2 + (u.output_tokens || 0) * p.sal) / 1e6;
  const lect = ((u.cache_read_input_tokens || 0) * p.lec) / 1e6;
  return { sinLect, total: sinLect + lect, w5, w1 };
}

function leerJsonl(f) {
  let t;
  try { t = fs.readFileSync(f, 'utf8'); } catch { return []; }
  const r = [];
  for (const l of t.split('\n')) {
    if (!l) continue;
    try { r.push(JSON.parse(l)); } catch { /* linea rota: se ignora */ }
  }
  return r;
}

// ---------- lectura de transcripciones ----------
// Devuelve [{tipo, sesion, desc, reqs:[{ts,modelo,ctx,sal,total,sinLect,lect,w5,w1,herr:[..]}]}]
function escanear(dirProyectos, desde) {
  const vistos = new Set();
  const out = [];
  let proyectos;
  try { proyectos = fs.readdirSync(dirProyectos, { withFileTypes: true }).filter((d) => d.isDirectory()); } catch { return out; }
  const candidatos = []; // {f, tipo, sesion, desc}
  for (const p of proyectos) {
    const dp = path.join(dirProyectos, p.name);
    for (const e of fs.readdirSync(dp, { withFileTypes: true })) {
      if (e.isFile() && e.name.endsWith('.jsonl')) {
        candidatos.push({ f: path.join(dp, e.name), tipo: 'sesion', sesion: e.name.replace(/\.jsonl$/, ''), desc: '' });
      } else if (e.isDirectory()) {
        const ds = path.join(dp, e.name, 'subagents');
        if (!fs.existsSync(ds)) continue;
        for (const s of fs.readdirSync(ds)) {
          if (!s.endsWith('.jsonl')) continue;
          let meta = {};
          try { meta = JSON.parse(fs.readFileSync(path.join(ds, s.replace(/\.jsonl$/, '.meta.json')), 'utf8')); } catch { /* sin meta */ }
          const tipo = TIPOS.includes(meta.agentType) ? meta.agentType : 'otros';
          candidatos.push({ f: path.join(ds, s), tipo, sesion: e.name, desc: meta.description || '' });
        }
      }
    }
  }
  for (const c of candidatos) {
    const lineas = leerJsonl(c.f);
    const primero = lineas.find((o) => o.timestamp)?.timestamp || '';
    const clave = `${path.basename(c.f)}|${primero}`; // misma sesion en dos carpetas de proyecto
    if (vistos.has(clave)) continue;
    vistos.add(clave);
    const ids = new Set();
    const reqs = [];
    for (const o of lineas) {
      if (o.type !== 'assistant' || !o.message?.usage) continue;
      const m = o.message;
      if (m.id) { if (ids.has(m.id)) continue; ids.add(m.id); }
      if (!o.timestamp || (desde && diaLocal(o.timestamp) < desde)) continue;
      const u = m.usage;
      const k = costes(u, m.model);
      const herr = (Array.isArray(m.content) ? m.content : [])
        .filter((b) => b && b.type === 'tool_use')
        .map((b) => ({ n: b.name, cmd: b.name === 'Bash' ? String(b.input?.command || '') : '' }));
      reqs.push({
        ts: o.timestamp, modelo: m.model || '?',
        ctx: (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0),
        sal: u.output_tokens || 0, lect: u.cache_read_input_tokens || 0,
        total: k.total, sinLect: k.sinLect, w5: k.w5, w1: k.w1, herr,
      });
    }
    if (reqs.length) out.push({ tipo: c.tipo, sesion: c.sesion, desc: c.desc, reqs });
  }
  return out;
}

// ---------- --resumen ----------
const FAMILIAS = [
  ['tablero.mjs', /tablero\.mjs/], ['estado.mjs', /estado\.mjs/], ['relevo.mjs', /relevo\.mjs/],
  ['dod.mjs', /dod\.mjs/], ['verificar-kit', /verificar-kit/], ['herdr', /\bherdr\b/],
  ['git add/commit', /\bgit\s+(add|commit)\b/], ['git status/diff/log/show', /\bgit\s+(status|diff|log|show)\b/],
  ['lectura grep/sed/cat', /\b(grep|sed|cat|head|tail)\b/],
];
function familia(h) {
  if (h.n === 'Agent' || h.n === 'Task') return 'subagentes';
  if (h.n === 'Bash') {
    for (const [n, re] of FAMILIAS) if (re.test(h.cmd)) return n;
    return 'Bash otros';
  }
  if (h.n === 'SendMessage' || h.n === 'ListAgents') return h.n;
  return 'otras herramientas';
}

function resumen(datos, desde) {
  const L = [];
  const totalEq = suma(datos.flatMap((t) => t.reqs.map((r) => r.total)));
  L.push(`Resumen${desde ? ` desde ${desde}` : ''}: ${datos.length} transcripciones, ${fmtN(suma(datos.map((t) => t.reqs.length)))} peticiones, ${fmtD(totalEq, 1)} $eq (proxy)`);
  // por tipo y modelo
  const grupos = new Map();
  for (const t of datos) {
    const modelo = t.reqs.map((r) => r.modelo).sort((a, b) => t.reqs.filter((r) => r.modelo === b).length - t.reqs.filter((r) => r.modelo === a).length)[0];
    const k = `${t.tipo}|${modelo}`;
    if (!grupos.has(k)) grupos.set(k, []);
    grupos.get(k).push(t);
  }
  L.push('tipo / modelo: n | med.peticiones | ctx 1a / ult. | med.salida | med.$eq | total $eq (%)');
  const filas = [...grupos.entries()].map(([k, ts]) => ({ k, ts, eq: suma(ts.flatMap((t) => t.reqs.map((r) => r.total))) })).sort((a, b) => b.eq - a.eq);
  for (const { k, ts, eq } of filas) {
    const [tipo, modelo] = k.split('|');
    const e = (t) => suma(t.reqs.map((r) => r.total));
    L.push(`${tipo} / ${modelo.replace('claude-', '')}: ${ts.length} | ${fmtN(mediana(ts.map((t) => t.reqs.length)))} | ${fmtN(mediana(ts.map((t) => t.reqs[0].ctx)))} / ${fmtN(mediana(ts.map((t) => t.reqs.at(-1).ctx)))} | ${fmtN(mediana(ts.map((t) => suma(t.reqs.map((r) => r.sal)))))} | ${fmtD(mediana(ts.map(e)))} | ${fmtD(eq, 1)} (${fmtD(totalEq ? (100 * eq) / totalEq : 0, 1)} %)`);
  }
  // TTL por sesion y por subagente (millones de tokens escritos en cache)
  const ttl = (ts) => [suma(ts.flatMap((t) => t.reqs.map((r) => r.w5))), suma(ts.flatMap((t) => t.reqs.map((r) => r.w1)))];
  const [s5, s1] = ttl(datos.filter((t) => t.tipo === 'sesion'));
  const [a5, a1] = ttl(datos.filter((t) => t.tipo !== 'sesion'));
  L.push(`TTL escritura de cache (tokens): sesiones 5min=${fmtN(s5)} 1h=${fmtN(s1)} | subagentes 5min=${fmtN(a5)} 1h=${fmtN(a1)}`);
  // coordinador por tramos de contexto
  const ses = datos.filter((t) => t.tipo === 'sesion').flatMap((t) => t.reqs);
  L.push('Peticiones de sesion por contexto: peticiones | lecturas de cache (tokens)');
  for (const [n, lo, hi] of [['<100k', 0, 1e5], ['100-200k', 1e5, 2e5], ['200-300k', 2e5, 3e5], ['>300k', 3e5, Infinity]]) {
    const rs = ses.filter((r) => r.ctx >= lo && r.ctx < hi);
    L.push(`  ${n}: ${fmtN(rs.length)} | ${fmtN(suma(rs.map((r) => r.lect)))}`);
  }
  // herramientas del coordinador por familia
  const fam = new Map();
  for (const h of ses.flatMap((r) => r.herr)) { const f = familia(h); fam.set(f, (fam.get(f) || 0) + 1); }
  const totalH = suma([...fam.values()]);
  L.push(`Herramientas de sesion (${fmtN(totalH)}): ${[...fam.entries()].sort((a, b) => b[1] - a[1]).map(([n, c]) => `${n} ${c}`).join(', ')}`);
  // tandas con Id lanzadas mas de una vez en la misma sesion
  const veces = new Map();
  for (const t of datos.filter((x) => x.tipo !== 'sesion')) {
    const id = /T\d\d/.exec(t.desc)?.[0];
    if (!id) continue;
    const k = `${t.sesion}|${id}`;
    veces.set(k, (veces.get(k) || 0) + 1);
  }
  const rep = [...veces.values()].filter((v) => v > 1).length;
  L.push(`Tandas con Id lanzadas: ${veces.size}; repetidas en la misma sesion: ${rep}${veces.size ? ` (${fmtD((100 * rep) / veces.size, 0)} %)` : ''}`);
  return L;
}

// ---------- --calibrar ----------
function calibrar(datos, ficheroHist) {
  const L = [];
  const filas = leerJsonl(ficheroHist).filter((o) => o.time).map((o) => ({ ...o, t: Date.parse(o.time) })).filter((o) => !Number.isNaN(o.t)).sort((a, b) => a.t - b.t);
  const reqs = datos.flatMap((t) => t.reqs).map((r) => ({ ...r, t: Date.parse(r.ts) }));
  const tramos = [];
  let descartadas = 0;
  for (const metrica of ['h5', 'd7']) {
    let cur = null; let ini = null; let fin = null;
    const cerrar = () => { if (ini && fin && fin.v > ini.v) tramos.push({ metrica, ini, fin }); };
    for (const o of filas) {
      const v = o[metrica];
      if (v == null) continue;
      if (cur === null) { cur = v; ini = { v, t: o.t }; fin = ini; continue; }
      if (v >= cur) { cur = v; fin = { v, t: o.t }; continue; }
      if (v <= 2) { cerrar(); cur = v; ini = { v, t: o.t }; fin = ini; continue; } // reinicio de ventana: baja a ~0
      descartadas++; // baja sin reinicio: valor viejo de otra sesion
    }
    cerrar();
  }
  if (!tramos.length) return { L: ['Sin tramos monotonos en el historial'], hay: false };
  L.push(`Calibrado: ${tramos.length} tramos, ${descartadas} filas descartadas (bajan sin reinicio)`);
  L.push('metrica hora-ini>fin: subida | $eq total, sin lecturas | $eq por punto, sin lecturas');
  for (const { metrica, ini, fin } of tramos.slice(0, MAX_LINEAS - 4)) {
    const rs = reqs.filter((r) => r.t >= ini.t && r.t <= fin.t);
    const tot = suma(rs.map((r) => r.total)); const sl = suma(rs.map((r) => r.sinLect));
    const sub = fin.v - ini.v;
    const hh = (t) => new Date(t).toLocaleTimeString('sv').slice(0, 5);
    L.push(`${metrica} ${hh(ini.t)}>${hh(fin.t)}: +${sub} | ${fmtD(tot, 1)}, ${fmtD(sl, 1)} | ${fmtD(tot / sub, 2)}, ${fmtD(sl / sub, 2)}`);
  }
  return { L, hay: true, tramos, descartadas };
}

// ---------- salida ----------
function imprimir(lineas) {
  const l = lineas.length > MAX_LINEAS ? [...lineas.slice(0, MAX_LINEAS - 1), '... (recortado a 40 lineas)'] : lineas;
  console.log(l.join('\n'));
}

// ---------- --prueba ----------
function prueba() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'medir-consumo-'));
  let fallos = 0;
  const caso = (ok, nombre) => { console.log(`${ok ? '[OK]' : '[FALLO]'} ${nombre}`); if (!ok) fallos++; };
  try {
    const mk = (id, ts, modelo, w5, w1, texto) => ({
      type: 'assistant', timestamp: ts,
      message: {
        id, model: modelo, content: [{ type: 'text', text: texto }, { type: 'tool_use', name: 'Bash', input: { command: 'node tablero.mjs SECRETO-PRUEBA' } }],
        usage: { input_tokens: 10, output_tokens: 100, cache_read_input_tokens: 1000, cache_creation_input_tokens: w5 + w1, cache_creation: { ephemeral_5m_input_tokens: w5, ephemeral_1h_input_tokens: w1 } },
      },
    });
    const sesionId = 'aaaaaaaa-0000-0000-0000-000000000001';
    const lineas = [
      { type: 'user', timestamp: '2026-10-22T10:00:00.000Z', message: { role: 'user', content: 'SECRETO-PRUEBA' } },
      mk('msg_1', '2026-10-22T10:00:01.000Z', 'claude-opus-5-5', 0, 500, 'SECRETO-PRUEBA'),
      mk('msg_1', '2026-10-22T10:00:01.000Z', 'claude-opus-5-5', 0, 500, 'SECRETO-PRUEBA'), // mismo message.id
      mk('msg_2', '2026-10-22T10:00:02.000Z', 'claude-opus-5-5', 0, 300, 'SECRETO-PRUEBA'),
    ].map((o) => JSON.stringify(o)).join('\n') + '\n';
    const sub = [
      { type: 'user', timestamp: '2026-10-22T10:01:00.000Z', message: { role: 'user', content: 'x' } },
      mk('msg_s1', '2026-10-22T10:01:01.000Z', 'claude-sonnet-5-5', 400, 0, 'SECRETO-PRUEBA'),
    ].map((o) => JSON.stringify(o)).join('\n') + '\n';
    for (const p of ['proyA', 'proyB']) { // la misma sesion en dos carpetas de proyecto
      const d = path.join(tmp, 'proy', p);
      fs.mkdirSync(path.join(d, sesionId, 'subagents'), { recursive: true });
      fs.writeFileSync(path.join(d, `${sesionId}.jsonl`), lineas);
      fs.writeFileSync(path.join(d, sesionId, 'subagents', 'agent-x.jsonl'), sub);
      fs.writeFileSync(path.join(d, sesionId, 'subagents', 'agent-x.meta.json'), JSON.stringify({ agentType: 'ejecutora', description: 'T01 SECRETO-PRUEBA' }));
    }
    const datos = escanear(path.join(tmp, 'proy'), null);
    const sesiones = datos.filter((t) => t.tipo === 'sesion');
    caso(sesiones.length === 1 && datos.filter((t) => t.tipo === 'ejecutora').length === 1, 'dos copias de la misma transcripcion en dos proyectos cuentan una vez');
    caso(sesiones.length === 1 && sesiones[0].reqs.length === 2, 'dos lineas con el mismo message.id cuentan una peticion');
    const sw = (ts) => suma(ts.flatMap((t) => t.reqs.map((r) => r.w5)));
    const sx = (ts) => suma(ts.flatMap((t) => t.reqs.map((r) => r.w1)));
    const subs = datos.filter((t) => t.tipo !== 'sesion');
    caso(sw(sesiones) === 0 && sx(sesiones) === 800 && sw(subs) === 400 && sx(subs) === 0, 'el TTL se separa bien');
    // calibrar con historial sintetico: 10 -> 20 -> 15 (baja sin reinicio) -> 30
    const hist = path.join(tmp, 'historial.jsonl');
    const fila = (min, h5) => JSON.stringify({ time: `2026-10-22T10:${String(min).padStart(2, '0')}:00+00:00`, session_id: 's', h5, d7: null });
    fs.writeFileSync(hist, [fila(0, 10), fila(1, 20), fila(2, 15), fila(3, 30)].join('\n') + '\n');
    const cal = calibrar(datos, hist);
    const salida = [...resumen(datos, null), ...cal.L].join('\n');
    caso(!salida.includes('SECRETO-PRUEBA'), 'un texto SECRETO-PRUEBA en el contenido de un mensaje no sale nunca en la salida');
    caso(cal.hay && cal.descartadas === 1 && cal.tramos.length === 1 && cal.tramos[0].fin.v - cal.tramos[0].ini.v === 20, '--calibrar descarta una fila que baja sin reinicio');
  } catch (e) {
    console.log(`[FALLO] error interno de la prueba: ${e.message}`);
    fallos++;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  return fallos === 0 ? 0 : 1;
}

// ---------- main ----------
function main(argv) {
  const arg = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
  const modos = ['--resumen', '--calibrar', '--prueba', '--ayuda'].filter((m) => argv.includes(m));
  if (modos.length !== 1) { console.error('Uso: indica exactamente un modo (--resumen, --calibrar, --prueba o --ayuda).'); return 2; }
  const desde = arg('--desde');
  if (desde !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(desde)) { console.error('Uso: --desde AAAA-MM-DD'); return 2; }
  if (modos[0] === '--ayuda') { console.log(AYUDA); return 0; }
  if (modos[0] === '--prueba') return prueba();
  const proy = arg('--proyectos') || path.join(os.homedir(), '.claude', 'projects');
  const datos = escanear(proy, desde);
  if (!datos.length) { console.error('Sin datos: no hay peticiones en el rango pedido.'); return 4; }
  if (modos[0] === '--resumen') { imprimir(resumen(datos, desde)); return 0; }
  const hist = arg('--historial') || path.join(os.homedir(), '.local', 'share', 'claude-uso', 'historial.jsonl');
  if (!fs.existsSync(hist)) { console.error('Sin datos: no existe el historial.'); return 4; }
  const c = calibrar(datos, hist);
  imprimir(c.L);
  return c.hay ? 0 : 4;
}

try { process.exitCode = main(process.argv.slice(2)); } catch (e) { console.error(`Error interno: ${e.message}`); process.exitCode = 1; }
