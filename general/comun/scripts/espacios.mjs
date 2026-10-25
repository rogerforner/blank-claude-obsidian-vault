#!/usr/bin/env node
// espacios.mjs: modulo comun que dice que carpetas del vault son espacios, que asuntos tienen y
// de que ambito es un directorio o una ruta. Sin dependencias. Salidas: 0 bien, 2 uso.
//
// Un espacio es un directorio hijo directo de la raiz cuyo README.md empieza por un frontmatter
// con `tipo: espacio`. Dentro de cada espacio, un asunto es un hijo con `charter-coordinador.md`.
import { readFileSync, readdirSync, existsSync, statSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SISTEMA = ['_meta', 'general', 'inicializador', 'kanban'];
export const RESERVADOS = [...SISTEMA, 'docs', 'referencia', 'cerrados', 'node_modules', 'repo', 'coordinacion', 'estudios', 'memoria'];

const TIPOS = ['espacio', 'archivo', 'libre'];

const AYUDA = `Uso:
  espacios.mjs --listar
  espacios.mjs --ambito [dir]
  espacios.mjs --pathspec [dir]
  espacios.mjs --ayuda
--listar: una linea <espacio>/<slug> por asunto. --ambito: JSON con el ambito de dir (por defecto el cwd).
--pathspec: el pathspec de ese ambito, separado por espacios, listo para git log -- ...
Salidas: 0 bien, 2 uso.`;

class Salida extends Error { constructor(codigo, msg) { super(msg); this.codigo = codigo; } }

export function raizVault(desde) {
  let d = path.resolve(desde || path.dirname(fileURLToPath(import.meta.url)));
  for (;;) {
    if (existsSync(path.join(d, '_meta', 'verificar-kit.mjs'))) return d;
    const up = path.dirname(d);
    if (up === d) return null;
    d = up;
  }
}

function esDir(p) {
  try { return statSync(p).isDirectory(); } catch { return false; }
}

function hijos(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
      .map((e) => e.name)
      .sort();
  } catch { return []; }
}

// El valor de `tipo:` del frontmatter de un README, o null si no hay frontmatter ni marca.
function marcaDe(readme) {
  let texto;
  try { texto = readFileSync(readme, 'utf8'); } catch { return null; }
  const lineas = texto.split('\n').map((l) => l.replace(/\r$/, ''));
  if (lineas[0] !== '---') return null;
  for (let i = 1; i < lineas.length; i++) {
    if (lineas[i] === '---') return null;
    const m = lineas[i].match(/^tipo:\s*(\S+)\s*$/);
    if (m) return m[1];
  }
  return null;
}

export function tipoDeCarpeta(raiz, nombre) {
  const dir = path.join(raiz, nombre);
  if (!esDir(dir)) return null;
  if (SISTEMA.includes(nombre)) return 'sistema';
  const marca = marcaDe(path.join(dir, 'README.md'));
  return TIPOS.includes(marca) ? marca : null;
}

export function listarEspacios(raiz) {
  return hijos(raiz).filter((n) => tipoDeCarpeta(raiz, n) === 'espacio');
}

export function listarAsuntos(raiz) {
  const out = [];
  for (const espacio of listarEspacios(raiz)) {
    for (const slug of hijos(path.join(raiz, espacio))) {
      if (existsSync(path.join(raiz, espacio, slug, 'charter-coordinador.md'))) {
        out.push({ espacio, slug, rel: `${espacio}/${slug}` });
      }
    }
  }
  return out;
}

function real(p) {
  try { return realpathSync(p); } catch { return path.resolve(p); }
}

export function ambitoDe(raiz, dir) {
  const r = real(raiz);
  const rel = path.relative(r, real(dir === undefined ? process.cwd() : dir)).split(path.sep).join('/');
  if (rel === '') return { tipo: 'general', exacto: true };
  if (rel.startsWith('..')) return { tipo: 'invalido', rel };
  const partes = rel.split('/');
  if (partes.length >= 2) {
    const asunto = listarAsuntos(r).find((a) => a.espacio === partes[0] && a.slug === partes[1]);
    if (asunto) {
      return { tipo: 'asunto', espacio: asunto.espacio, slug: asunto.slug, prefijo: `${asunto.rel}/`, exacto: partes.length === 2 };
    }
  }
  return { tipo: 'invalido', rel };
}

export function esDelAmbito(ambito, rutaRel, asuntos) {
  const ruta = String(rutaRel).replace(/\\/g, '/').replace(/^\.\//, '');
  if (ambito.tipo === 'asunto') return ruta === ambito.prefijo.slice(0, -1) || ruta.startsWith(ambito.prefijo);
  if (ambito.tipo === 'general') return !asuntos.some((a) => ruta === a.rel || ruta.startsWith(a.rel + '/'));
  return false;
}

export function pathspecDe(ambito, asuntos) {
  if (ambito.tipo === 'general') return ['.', ...asuntos.map((a) => ':(exclude)' + a.rel)];
  return ['.'];
}

function main() {
  const args = process.argv.slice(2);
  const modo = args.shift();
  if (modo === '--ayuda') { console.log(AYUDA); return; }
  if (!['--listar', '--ambito', '--pathspec'].includes(modo)) throw new Salida(2, AYUDA);
  const raiz = raizVault();
  if (!raiz) throw new Salida(2, 'no encuentro la raiz del vault');
  if (modo === '--listar') {
    for (const a of listarAsuntos(raiz)) console.log(a.rel);
    return;
  }
  const ambito = ambitoDe(raiz, args[0] === undefined ? process.cwd() : path.resolve(args[0]));
  if (modo === '--ambito') { console.log(JSON.stringify(ambito)); return; }
  console.log(pathspecDe(ambito, listarAsuntos(raiz)).join(' '));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (e) {
    if (e instanceof Salida) { console.error(e.message); process.exit(e.codigo); }
    console.error(e && e.message ? e.message : String(e)); process.exit(1);
  }
}
