#!/usr/bin/env node
// probar-espacios.mjs: humo de la estructura en espacios. Construye en un temporal, fuera del
// vault, dos vaults de prueba con copias de los scripts reales y comprueba el modulo espacios.mjs
// (casos M) y que el hook, el DoD, el tablero y el verificador respetan los espacios (H, D, T, V, G).
// Sin dependencias. Salidas: 0 si todos los casos pasan, 1 si alguno falla, 2 uso.
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const REAL = path.resolve(AQUI, '..', '..', '..');
const EST = await import(pathToFileURL(path.join(AQUI, 'estado.mjs')).href);

const AYUDA = `Uso:
  probar-espacios.mjs [--casos <M,H,V2,...>]
  probar-espacios.mjs --ayuda
Sin --casos corre todos (M, H, D, T, V, G). --casos filtra por prefijo o por id suelto.
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

function casos(c, esp) {
  const R = (cond, motivo) => (cond ? null : motivo);
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

    ['T1', () => { const r = node([path.join(c.v1(), 'general', 'comun', 'scripts', 'tablero.mjs'), '--comprobar'], path.join(c.v1(), 'esp-uno', 'a1')); return R(r.codigo === 0, `sale ${r.codigo}: ${r.salida.trim()}`); }],
    ['T2', () => { const r = node([path.join(c.v1(), 'general', 'comun', 'scripts', 'tablero.mjs'), '--comprobar'], path.join(c.v1(), 'esp-uno')); return R(r.codigo === 2, `sale ${r.codigo}, se esperaba 2`); }],

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
      try { motivo = fn(); } catch (e) { motivo = `error: ${e && e.message ? e.message : e}`; }
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
