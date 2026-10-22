#!/usr/bin/env node
// medir-arranque.mjs: mide que carga una sesion de Claude Code al arrancar en una carpeta (MCP, skills, comandos, contexto).
// Sin dependencias; solo execFile con argumentos separados. Cada medicion real es una sesion `claude -p` de un turno (cuesta cuota).
// Salidas: 0 bien, 1 alguna expectativa falla, 2 uso, 3 entorno (ANTHROPIC_API_KEY, autenticacion por clave, claude ausente, tiempo agotado).
import { readFileSync, existsSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';

const AYUDA = `Uso: node general/comun/scripts/medir-arranque.mjs <carpeta> [opciones]
Lanza en <carpeta> una sesion \`claude -p\` de un turno y cuenta lo que carga: contexto de la primera peticion,
servidores MCP, herramientas MCP por servidor, skills, comandos, plugins y si los conectores de claude.ai estan
desactivados por ajuste.
Opciones:
  --esperar-ausente <nombre>    el nombre exacto no debe estar en mcp_servers, skills ni slash_commands (repetible)
  --esperar-presente <nombre>   el nombre exacto debe estar en alguno de los tres (repetible)
  --json                        salida en JSON
  --desde <stream.jsonl>        analiza un stream-json ya guardado, sin lanzar nada (y sin dato de conectores)
  --timeout MS                  watchdog de la sesion real (def. 240000)
  --ayuda
Salidas: 0 bien; 1 alguna expectativa falla (se listan); 2 uso; 3 entorno (hay ANTHROPIC_API_KEY, apiKeySource
distinto de none, claude ausente o se paso el tiempo).
Notas: keybindings-help no aparece en el init ni antes ni despues, y no se puede comprobar con --esperar-*.
En -p los conectores de claude.ai cargan en segundo plano: que falten aqui no prueba que esten apagados; lo prueba
"conectores-claude.ai: desactivados por ajuste" (sale del registro de depuracion).
Cada medicion real es un turno de Opus (unos 38.000 tokens de entrada) contra la cuota.`;

class Salida extends Error { constructor(codigo, msg) { super(msg); this.codigo = codigo; } }

function leerArgs(argv) {
  const o = { carpeta: null, ausentes: [], presentes: [], json: false, desde: null, timeout: 240000, ayuda: false };
  const valor = (i, nom) => { if (i + 1 >= argv.length) throw new Salida(2, `${nom} necesita un valor`); return argv[i + 1]; };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--ayuda' || a === '-h') o.ayuda = true;
    else if (a === '--json') o.json = true;
    else if (a === '--esperar-ausente') o.ausentes.push(valor(i++, a));
    else if (a === '--esperar-presente') o.presentes.push(valor(i++, a));
    else if (a === '--desde') o.desde = valor(i++, a);
    else if (a === '--timeout') {
      const n = Number(valor(i++, a));
      if (!Number.isInteger(n) || n <= 0) throw new Salida(2, '--timeout necesita un entero positivo (ms)');
      o.timeout = n;
    } else if (a.startsWith('--')) throw new Salida(2, `opcion desconocida: ${a}`);
    else if (o.carpeta === null) o.carpeta = a;
    else throw new Salida(2, `sobra el argumento: ${a}`);
  }
  if (!o.ayuda) {
    if (o.desde === null && o.carpeta === null) throw new Salida(2, 'falta <carpeta>');
    if (o.desde !== null && !existsSync(o.desde)) throw new Salida(2, `no existe ${o.desde}`);
    if (o.desde === null && !(existsSync(o.carpeta) && statSync(o.carpeta).isDirectory())) throw new Salida(2, `no es una carpeta: ${o.carpeta}`);
  }
  return o;
}

const saneado = (n) => n.replace(/[^A-Za-z0-9_-]/g, '_');

// Pura: de las lineas del stream saca init y result.
export function analizarStream(texto) {
  let init = null; let result = null;
  for (const l of texto.split('\n')) {
    if (!l.trim()) continue;
    let m; try { m = JSON.parse(l); } catch { continue; }
    if (m.type === 'system' && m.subtype === 'init') init = m;
    else if (m.type === 'result') result = m;
  }
  if (!init) throw new Salida(3, 'el stream no trae el mensaje system/init');
  const todos = Array.isArray(init.mcp_servers) ? init.mcp_servers : [];
  const tools = Array.isArray(init.tools) ? init.tools : [];
  const normales = todos.filter((s) => !String(s.name).startsWith('plugin:'));
  const deplugin = todos.filter((s) => String(s.name).startsWith('plugin:'));
  const herramientas = {};
  for (const s of normales) herramientas[s.name] = tools.filter((t) => t.startsWith(`mcp__${saneado(s.name)}__`)).length;
  const u = result?.usage;
  const contexto = u ? (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0) : null;
  return {
    apiKeySource: init.apiKeySource,
    contexto,
    mcp: normales.map((s) => ({ nombre: s.name, estado: s.status })),
    mcpPlugin: deplugin.map((s) => ({ nombre: s.name, estado: s.status })),
    herramientasMcp: herramientas,
    herramientasMcpTotal: Object.values(herramientas).reduce((a, b) => a + b, 0),
    skills: init.skills || [],
    comandos: init.slash_commands || [],
    plugins: (init.plugins || []).map((p) => p.name),
  };
}

export function estadoConectores(depuracion) {
  if (depuracion === null) return 'sin dato';
  return /\[claudeai-mcp\] Disabled via/.test(depuracion) ? 'desactivados por ajuste' : 'no desactivados por ajuste';
}

export function comprobarExpectativas(m, ausentes, presentes) {
  const nombres = new Set([...m.mcp.map((s) => s.nombre), ...m.mcpPlugin.map((s) => s.nombre), ...m.skills, ...m.comandos]);
  const fallos = [];
  for (const n of ausentes) if (nombres.has(n)) fallos.push(`esperaba ausente y esta presente: ${n}`);
  for (const n of presentes) if (!nombres.has(n)) fallos.push(`esperaba presente y falta: ${n}`);
  return fallos;
}

function medirReal(carpeta, timeout) {
  if (process.env.ANTHROPIC_API_KEY) throw new Salida(3, 'hay ANTHROPIC_API_KEY en el entorno: no se lanza nada (se facturaria por API)');
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'medir-arranque-'));
  const dbg = path.join(tmp, 'debug.txt');
  const args = ['-p', 'Responde solo: OK', '--max-turns', '1', '--no-session-persistence', '--output-format', 'stream-json', '--verbose',
    '--settings', '{"disableAllHooks":true}', '--debug-file', dbg];
  const env = { ...process.env }; delete env.ANTHROPIC_API_KEY;
  return new Promise((resolve, reject) => {
    const limpiar = () => rmSync(tmp, { recursive: true, force: true });
    execFile('claude', args, { cwd: carpeta, env, timeout, killSignal: 'SIGKILL', maxBuffer: 64 * 1024 * 1024 }, (err, stdout) => {
      let depuracion = null;
      try { depuracion = readFileSync(dbg, 'utf8'); } catch { /* sin registro */ }
      limpiar();
      if (err) {
        if (err.code === 'ENOENT') return reject(new Salida(3, 'no se encuentra el ejecutable claude'));
        if (err.killed || err.signal) return reject(new Salida(3, `la sesion no termino en ${timeout} ms`));
        if (!stdout || !stdout.includes('"system"')) return reject(new Salida(3, `claude fallo: ${err.message}`));
      }
      resolve({ stdout, depuracion });
    });
  });
}

const millar = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function texto(m, conectores) {
  const l = [];
  l.push(`contexto: ${m.contexto === null ? 'sin dato' : millar(m.contexto)}`);
  l.push(`mcp: ${m.mcp.length ? m.mcp.map((s) => `${s.nombre} (${s.estado})`).join(', ') : 'ninguno'}${m.mcpPlugin.length ? `; de plugins: ${m.mcpPlugin.map((s) => `${s.nombre} (${s.estado})`).join(', ')}` : ''}`);
  const h = Object.entries(m.herramientasMcp).map(([k, v]) => `${k} ${v}`).join(', ');
  l.push(`herramientas-mcp: ${m.herramientasMcpTotal}${h ? ` (${h})` : ''}`);
  l.push(`skills: ${m.skills.length} (${m.skills.join(', ')})`);
  l.push(`comandos: ${m.comandos.length}`);
  l.push(`plugins: ${m.plugins.length ? m.plugins.join(', ') : 'ninguno'}`);
  l.push(`conectores-claude.ai: ${conectores}`);
  l.push('aviso: en -p los conectores de claude.ai cargan en segundo plano: que falten aqui no prueba que esten apagados; lo prueba "conectores-claude.ai: desactivados por ajuste".');
  return l.join('\n');
}

async function main() {
  const o = leerArgs(process.argv.slice(2));
  if (o.ayuda) { console.log(AYUDA); return 0; }
  let stdout; let depuracion = null;
  if (o.desde) stdout = readFileSync(o.desde, 'utf8');
  else ({ stdout, depuracion } = await medirReal(o.carpeta, o.timeout));
  const m = analizarStream(stdout);
  if (m.apiKeySource !== 'none') throw new Salida(3, `apiKeySource es "${m.apiKeySource}" y no "none": la sesion se factura por API; se para`);
  const conectores = estadoConectores(depuracion);
  const fallos = comprobarExpectativas(m, o.ausentes, o.presentes);
  if (o.json) console.log(JSON.stringify({ ...m, conectoresClaudeAi: conectores, fallos }, null, 2));
  else {
    console.log(texto(m, conectores));
    for (const f of fallos) console.log(`FALLA: ${f}`);
  }
  return fallos.length ? 1 : 0;
}

main().then((c) => process.exit(c), (e) => {
  if (e instanceof Salida) { console.error(`medir-arranque: ${e.message}`); process.exit(e.codigo); }
  console.error(e); process.exit(1);
});
