#!/usr/bin/env node
// kanban.mjs: genera el tablero kanban de Obsidian (Bases) a partir del estado vivo de cada ambito.
// Sin dependencias. Es DERIVADO: la fuente es el estado.json de cada ambito; lo generado vive en kanban/
// (ignorado por git) y se puede borrar y regenerar sin perder nada, salvo el ajuste manual de los .base.
// En exito la CLI no imprime nada (la dispara estado.mjs y no debe costar tokens). Solo --prueba y --ayuda hablan.
// Salidas: 0 bien, 1 error interno, 2 uso, 4 kanban/ no ignorado o estado ilegible.
import { readFileSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync, realpathSync, renameSync, readdirSync, chmodSync, statSync, lstatSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { raizVault, ambitoDe, listarAsuntos } from './espacios.mjs';
import { ambitosConEstado, leer, rutaEstado } from './estado.mjs';

const AYUDA = `Uso:
  kanban.mjs                       genera el tablero del ambito del directorio de trabajo
  kanban.mjs --de <general|espacio/asunto>
  kanban.mjs --todos               todos los ambitos con estado
  kanban.mjs --rehacer-bases       ademas reescribe los .base (por defecto solo se crean si faltan)
  kanban.mjs --prueba | --ayuda
Escribe kanban/tarjetas/<ambito>/E<n>.md (una nota por elemento, en solo lectura, ocultas en el explorador)
y kanban/<ambito con - en vez de />.base (agrupado por una columna calculada, no editable).
No imprime nada si va bien. Si kanban/ no esta en .gitignore no escribe y sale 4.
Si algo falla al generar, escribe kanban/ERROR.md con el motivo (se borra en la siguiente generacion buena).
Salidas: 0 bien, 1 error interno, 2 uso, 4 kanban/ no ignorado o estado ilegible.`;

class Salida extends Error { constructor(codigo, msg) { super(msg); this.codigo = codigo; } }

const VALOR_FECHA = /^\d{4}-\d{2}-\d{2}$/;

function nombreDe(ambito) { return ambito.tipo === 'general' ? 'general' : ambito.prefijo.replace(/\/$/, ''); }

function ignorado(raiz) {
  const r = spawnSync('git', ['check-ignore', '-q', 'kanban/x.md'], { cwd: raiz, encoding: 'utf8' });
  return r.status === 0;
}

// Escritura atomica (temporal y rename) y solo si el contenido cambia.
// Con modo (p. ej. 0o444) deja el fichero en ese modo; el rename sustituye tambien a un fichero de solo lectura.
function escribir(ruta, texto, modo) {
  if (existsSync(ruta) && readFileSync(ruta, 'utf8') === texto) {
    if (modo !== undefined && (statSync(ruta).mode & 0o777) !== modo) chmodSync(ruta, modo);
    return;
  }
  mkdirSync(path.dirname(ruta), { recursive: true });
  const tmp = path.join(path.dirname(ruta), `.${path.basename(ruta)}.tmp`);
  writeFileSync(tmp, texto);
  if (modo !== undefined) chmodSync(tmp, modo);
  renameSync(tmp, ruta);
}

// Borra las carpetas del diseno viejo (kanban/<espacio>/..., kanban/general/) que contengan solo E<n>.md
// y subcarpetas en las mismas condiciones. No toca kanban/tarjetas ni nada que no sea E<n>.md.
function soloNotas(dir) {
  return readdirSync(dir).every((f) => {
    const st = lstatSync(path.join(dir, f));
    return st.isDirectory() ? soloNotas(path.join(dir, f)) : (st.isFile() && /^E\d+\.md$/.test(f));
  });
}
function migrar(dir, cima = true) {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    if (!lstatSync(p).isDirectory() || (cima && f === 'tarjetas')) continue;
    if (soloNotas(p)) rmSync(p, { recursive: true, force: true });
    else migrar(p, false);
  }
}

const CSS = `/* Generado por kanban.mjs: oculta las tarjetas del tablero en el explorador de archivos. */
.nav-folder:has(> .nav-folder-title[data-path="kanban/tarjetas"]) { display: none; }
`;

function texto(v) { return JSON.stringify(String(v)); }

function nota(nombre, e) {
  const f = ['---', `ambito: ${texto(nombre)}`, `id: ${texto(e.id)}`, `titulo: ${texto(e.titulo)}`,
    `situacion: ${texto(e.situacion)}`, `dueno: ${texto(e.dueno)}`, `ordenado_por: ${texto(e.ordenado_por || 'sin dato')}`];
  for (const c of ['abierto', 'caduca', 'cerrado']) {
    if (e[c] !== undefined) f.push(`${c}: ${VALOR_FECHA.test(String(e[c])) ? e[c] : texto(e[c])}`);
  }
  for (const c of ['resultado', 'porque']) if (e[c] !== undefined) f.push(`${c}: ${texto(e[c])}`);
  f.push('---');
  return f.join('\n') + '\n' + (e.nota ? String(e.nota) + '\n' : '');
}

// Columna calculada: no se puede escribir, asi que arrastrar una tarjeta no tiene donde guardar nada.
const COLUMNA = 'if(situacion == "en_curso", "1 en curso", if(situacion == "abierto", "2 abierto", if(situacion == "bloqueado", "3 bloqueado", if(situacion == "diferido", "4 diferido", "5 cerrado"))))';

function base(nombre) {
  return [
    'filters:', '  and:', `    - ${JSON.stringify(`file.inFolder("kanban/tarjetas/${nombre}")`)}`, `    - ${JSON.stringify(`ambito == "${nombre}"`)}`,
    'formulas:', `  columna: ${JSON.stringify(COLUMNA)}`,
    'views:', '  - type: kanban', `    name: ${JSON.stringify(nombre)}`,
    '    groupBy:', '      property: formula.columna', '      direction: ASC',
    '    order:', ...['titulo', 'dueno', 'ordenado_por', 'abierto', 'caduca'].map((c) => `      - note.${c}`), '',
  ].join('\n');
}

function rutaError(raiz) { return path.join(raiz, 'kanban', 'ERROR.md'); }

// Genera el tablero de un ambito. Devuelve true si va bien; false si no se ha podido
// (kanban/ no ignorado: no escribe nada; otro fallo: deja kanban/ERROR.md).
export function generar(raiz, ambito, { rehacerBases = false } = {}) {
  if (!ignorado(raiz)) return false;
  const nombre = nombreDe(ambito);
  try {
    const estado = leer(rutaEstado(raiz, ambito));
    const els = Array.isArray(estado.elementos) ? estado.elementos : [];
    const dir = path.join(raiz, 'kanban', 'tarjetas', nombre);
    if (existsSync(path.join(raiz, 'kanban'))) migrar(path.join(raiz, 'kanban'));
    escribir(path.join(raiz, '.obsidian', 'snippets', 'kanban.css'), CSS);
    const vivos = new Set();
    for (const e of els) {
      if (e === null || typeof e !== 'object' || !/^E\d+$/.test(String(e.id))) throw new Error(`elemento sin id valido en ${nombre}`);
      vivos.add(`${e.id}.md`);
      escribir(path.join(dir, `${e.id}.md`), nota(nombre, e), 0o444);
    }
    if (existsSync(dir)) {
      for (const f of readdirSync(dir)) if (/^E\d+\.md$/.test(f) && !vivos.has(f)) rmSync(path.join(dir, f), { force: true });
    }
    const b = path.join(raiz, 'kanban', `${nombre.split('/').join('-')}.base`);
    if (rehacerBases || !existsSync(b)) escribir(b, base(nombre));
    return true;
  } catch (e) {
    try {
      mkdirSync(path.join(raiz, 'kanban'), { recursive: true });
      writeFileSync(rutaError(raiz), `# Fallo al generar el tablero\n\nAmbito: ${nombre}\n\n${e && e.message ? e.message : String(e)}\n`);
    } catch { /* sin sitio donde dejar el motivo: solo queda el codigo de salida */ }
    return false;
  }
}

function ambitoNombrado(raiz, nombre) {
  if (nombre === 'general') return { tipo: 'general' };
  const a = listarAsuntos(raiz).find((x) => x.rel === nombre);
  if (!a) throw new Salida(2, `--de ${nombre}: no es general ni un espacio/asunto del vault\n${AYUDA}`);
  return { tipo: 'asunto', espacio: a.espacio, slug: a.slug, prefijo: `${a.rel}/` };
}

function ejecutar(args) {
  const o = { todos: false, de: null, rehacer: false, prueba: false, ayuda: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--todos') o.todos = true;
    else if (a === '--rehacer-bases') o.rehacer = true;
    else if (a === '--prueba') o.prueba = true;
    else if (a === '--ayuda' || a === '-h') o.ayuda = true;
    else if (a === '--de') {
      if (i + 1 >= args.length || args[i + 1].startsWith('--')) throw new Salida(2, `--de pide un valor\n${AYUDA}`);
      o.de = args[++i];
    } else throw new Salida(2, `opcion desconocida: ${a}\n${AYUDA}`);
  }
  if (o.ayuda) { console.log(AYUDA); return; }
  if (o.prueba) { prueba(); return; }
  if (o.todos && o.de) throw new Salida(2, `--todos y --de no se combinan\n${AYUDA}`);
  const raiz = raizVault(process.cwd());
  if (!raiz) throw new Salida(2, `no encuentro la raiz del vault desde ${process.cwd()}`);
  let lista;
  if (o.todos) lista = ambitosConEstado(raiz).map((x) => x.ambito);
  else if (o.de) lista = [ambitoNombrado(raiz, o.de)];
  else {
    const a = ambitoDe(raiz, process.cwd());
    if (a.tipo === 'invalido') throw new Salida(2, `el directorio de trabajo no es la raiz ni un asunto; usa --de o --todos\n${AYUDA}`);
    lista = [a.tipo === 'general' ? { tipo: 'general' } : a];
  }
  if (!ignorado(raiz)) throw new Salida(4, 'kanban/ no esta en .gitignore (falta la linea /kanban/): no escribo nada');
  let bien = true;
  for (const a of lista) if (!generar(raiz, a, { rehacerBases: o.rehacer })) bien = false;
  if (bien) rmSync(rutaError(raiz), { force: true });
  else process.exitCode = 4;
}

// ---------------------------------------------------------------- prueba

function prueba() {
  const aqui = path.dirname(fileURLToPath(import.meta.url));
  const tmp = realpathSync(mkdtempSync(path.join(os.tmpdir(), 'kanban-prueba-')));
  const w = (rel, txt) => { const p = path.join(tmp, rel); mkdirSync(path.dirname(p), { recursive: true }); writeFileSync(p, txt); return p; };
  w('_meta/verificar-kit.mjs', '');
  w('casa/README.md', '---\ntipo: espacio\n---\n# Casa\n');
  for (const s of ['uno', 'dos']) { w(`casa/${s}/charter-coordinador.md`, '# Charter\n'); mkdirSync(path.join(tmp, 'casa', s, 'coordinacion'), { recursive: true }); }
  const dest = path.join(tmp, 'general', 'comun', 'scripts');
  mkdirSync(dest, { recursive: true });
  for (const f of ['estado.mjs', 'espacios.mjs', 'kanban.mjs']) copyFileSync(path.join(aqui, f), path.join(dest, f));
  const script = path.join(dest, 'kanban.mjs');
  const git = (a) => spawnSync('git', a, { cwd: tmp, encoding: 'utf8' });
  git(['init', '-q']);
  const GI = path.join(tmp, '.gitignore');
  writeFileSync(GI, '/kanban/\n');
  const FG = path.join(tmp, '_meta', 'estado.json');
  const FU = path.join(tmp, 'casa', 'uno', 'coordinacion', 'estado.json');
  const run = (cwd, a) => {
    const r = spawnSync(process.execPath, [script, ...a], { cwd: path.join(tmp, cwd), encoding: 'utf8' });
    return { code: r.status, out: r.stdout || '', err: r.stderr || '' };
  };
  const el = (id, extra) => ({ id, titulo: `Titulo ${id}`, situacion: 'abierto', dueno: 'coordinador-general', abierto: '2026-10-01', ...extra });
  const poner = (f, elementos) => writeFileSync(f, JSON.stringify({ siguiente_id: 20, elementos }, null, 2) + '\n');
  const leerT = (rel) => { try { return readFileSync(path.join(tmp, rel), 'utf8'); } catch { return null; } };
  let total = 0, fallos = 0;
  const caso = (nombre, ok, det) => { total++; if (!ok) { fallos++; console.log(`FALLA: ${nombre}${det ? `\n  ${String(det).trim().split('\n').join('\n  ')}` : ''}`); } };
  try {
    poner(FG, [el('E1', { dueno: 'director', ordenado_por: 'director', caduca: '2026-12-01', nota: 'detalle de E1', porque: '_meta/cola-pendientes.md' }),
      el('E2', { titulo: 'Con "comillas": y dos puntos', situacion: 'cerrado', cerrado: '2026-10-05', resultado: 'hecho' })]);
    poner(FU, [el('E1', { dueno: 'coordinador-uno' })]);
    let r = run('.', ['--todos']);
    caso('--todos sale 0 y no imprime nada', r.code === 0 && r.out === '' && r.err === '', r.out + r.err);
    const n1 = leerT('kanban/tarjetas/general/E1.md') || '';
    caso('nota E1 del general con su frontmatter',
      n1.startsWith('---\nambito: "general"\nid: "E1"\ntitulo: "Titulo E1"\nsituacion: "abierto"\ndueno: "director"\nordenado_por: "director"\nabierto: 2026-10-01\ncaduca: 2026-12-01\nporque: "_meta/cola-pendientes.md"\n---\ndetalle de E1\n'), n1);
    const n2 = leerT('kanban/tarjetas/general/E2.md') || '';
    caso('titulo con comillas y dos puntos escapado, sin ordenado_por = sin dato',
      n2.includes('titulo: "Con \\"comillas\\": y dos puntos"\n') && n2.includes('ordenado_por: "sin dato"\n') && n2.includes('cerrado: 2026-10-05\nresultado: "hecho"\n'), n2);
    caso('nota del asunto en kanban/casa/uno/', (leerT('kanban/tarjetas/casa/uno/E1.md') || '').includes('ambito: "casa/uno"'), leerT('kanban/tarjetas/casa/uno/E1.md'));
    const b = leerT('kanban/casa-uno.base') || '';
    caso('.base con kanban, filtro por ambito y groupBy situacion',
      b.includes('type: kanban') && b.includes('ambito == \\"casa/uno\\"') && b.includes('property: formula.columna') && b.includes('direction: ASC') && b.includes('- note.ordenado_por'), b);
    caso('existe general.base', leerT('kanban/general.base') !== null);
    caso('.base con formula de columna ordenable y filtro por carpeta',
      b.includes('formulas:') && b.includes('1 en curso') && b.includes('5 cerrado') && b.includes('property: formula.columna') && b.includes('file.inFolder(\\"kanban/tarjetas/casa/uno\\")'), b);
    const modo = (rel) => statSync(path.join(tmp, rel)).mode & 0o777;
    caso('las notas quedan en solo lectura (0444)', modo('kanban/tarjetas/general/E1.md') === 0o444 && modo('kanban/tarjetas/casa/uno/E1.md') === 0o444);
    caso('snippet CSS escrito, oculta kanban/tarjetas', (leerT('.obsidian/snippets/kanban.css') || '').includes('.nav-folder-title[data-path="kanban/tarjetas"]'));
    // regeneracion sobre notas 0444
    poner(FG, [el('E1', { dueno: 'director', titulo: 'Cambio sobre 0444' }), el('E2', { situacion: 'cerrado', cerrado: '2026-10-05', resultado: 'hecho' })]);
    r = run('.', ['--de', 'general']);
    caso('con cambio, una nota 0444 se sustituye y sigue 0444', r.code === 0 && r.out === '' && (leerT('kanban/tarjetas/general/E1.md') || '').includes('Cambio sobre 0444') && modo('kanban/tarjetas/general/E1.md') === 0o444, r.out + r.err);
    r = run('.', ['--de', 'general']);
    caso('sin cambio, no se reescribe', r.code === 0 && r.out === '');
    // migracion del diseno viejo
    w('kanban/casa/uno/E1.md', 'viejo\n'); w('kanban/general/E9.md', 'viejo\n');
    w('kanban/equipos/mac/E1.md', 'viejo\n'); w('kanban/equipos/mac/otro.txt', 'ajeno\n');
    w('kanban/equipos/mac/ERROR.md', 'ajeno\n');
    r = run('.', ['--de', 'general']);
    caso('la migracion borra el diseno viejo solo con E<n>.md', r.code === 0 && !existsSync(path.join(tmp, 'kanban/casa')) && !existsSync(path.join(tmp, 'kanban/general')), r.out + r.err);
    caso('la migracion no toca carpetas con otros ficheros, ERROR.md ni tarjetas', leerT('kanban/equipos/mac/otro.txt') !== null && leerT('kanban/equipos/mac/E1.md') !== null && leerT('kanban/equipos/mac/ERROR.md') === 'ajeno\n' && leerT('kanban/tarjetas/casa/uno/E1.md') !== null);
    rmSync(path.join(tmp, 'kanban/equipos'), { recursive: true, force: true });
    poner(FG, [el('E1', { dueno: 'director' }), el('E2', { situacion: 'cerrado', cerrado: '2026-10-05', resultado: 'hecho' })]);
    run('.', ['--de', 'general']);
    // (b) poda
    poner(FG, [el('E1', { dueno: 'director' })]);
    r = run('.', ['--de', 'general']);
    caso('la poda borra la nota del elemento quitado y deja la otra', r.code === 0 && leerT('kanban/tarjetas/general/E2.md') === null && leerT('kanban/tarjetas/general/E1.md') !== null, r.out + r.err);
    // (c) .base editado
    const bg = path.join(tmp, 'kanban', 'general.base');
    writeFileSync(bg, '# editado a mano\n');
    run('.', ['--todos']);
    caso('un .base editado no se pisa', leerT('kanban/general.base') === '# editado a mano\n');
    run('.', ['--todos', '--rehacer-bases']);
    caso('--rehacer-bases lo reescribe', (leerT('kanban/general.base') || '').includes('type: kanban'));
    // sin argumentos: ambito del cwd
    poner(FU, [el('E1', { dueno: 'coordinador-uno', titulo: 'Cambiado' })]);
    r = run('casa/uno', []);
    caso('sin modo usa el ambito del directorio de trabajo', r.code === 0 && r.out === '' && (leerT('kanban/tarjetas/casa/uno/E1.md') || '').includes('titulo: "Cambiado"'), r.out + r.err);
    r = run('.', ['--de', 'casa/nada']);
    caso('--de con un ambito inexistente sale 2', r.code === 2, r.err);
    // (f) estado ilegible
    writeFileSync(FU, '{ esto no es json');
    r = run('.', ['--todos']);
    caso('estado ilegible: sale 4, sin salida estandar y con ERROR.md', r.code === 4 && r.out === '' && (leerT('kanban/ERROR.md') || '').includes('casa/uno'), `${r.code} ${r.out} ${leerT('kanban/ERROR.md')}`);
    poner(FU, [el('E1', { dueno: 'coordinador-uno' })]);
    r = run('.', ['--todos']);
    caso('la siguiente generacion buena borra ERROR.md', r.code === 0 && leerT('kanban/ERROR.md') === null, r.out + r.err);
    // (e) sin la linea en .gitignore
    rmSync(path.join(tmp, 'kanban'), { recursive: true, force: true });
    writeFileSync(GI, '# vacio\n');
    r = run('.', ['--todos']);
    caso('sin /kanban/ en .gitignore: sale 4, avisa en stderr y no escribe nada', r.code === 4 && r.out === '' && r.err !== '' && !existsSync(path.join(tmp, 'kanban')), `${r.code} ${r.err} ${existsSync(path.join(tmp, 'kanban'))}`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  console.log(fallos ? `${fallos} de ${total} casos fallan.` : `Todos los casos pasan (${total}).`);
  if (fallos) throw new Salida(1, 'la prueba falla');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { ejecutar(process.argv.slice(2)); } catch (e) {
    if (e instanceof Salida) { console.error(e.message); process.exit(e.codigo); }
    console.error(e && e.message ? e.message : String(e)); process.exit(1);
  }
}
