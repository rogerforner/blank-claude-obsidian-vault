#!/usr/bin/env node
// tablero.mjs: lee, comprueba y edita el tablero de tandas (ciclo_de_tandas).
// Sin dependencias. Salidas: 0 bien, 1 error interno, 2 uso, 4 tablero invalido o Id inexistente.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CABECERA = '| Id | Bloque | Objetivo | Ficheros | Ejecuta | Depende de | Estado |';
const SEPARADOR = '|---|---|---|---|---|---|---|';
const RE_ESTADO = /^\[(PENDIENTE|EN CURSO|HECHA|HECHA [0-9a-f]{4,40}|BLOQUEADA: .+)\]$/;
const ESTADOS = { PENDIENTE: '[PENDIENTE]', 'EN-CURSO': '[EN CURSO]', HECHA: '[HECHA]' };

const AYUDA = `Uso:
  tablero.mjs --comprobar [<ruta>]
  tablero.mjs --estado <Id> <PENDIENTE|EN-CURSO|HECHA|BLOQUEADA> [motivo] [--tablero <ruta>]
  tablero.mjs --desde-plan <plan> [--tablero <ruta>]
  tablero.mjs --ayuda
Salidas: 0 bien, 1 error interno, 2 uso, 4 tablero invalido o Id inexistente.`;

class Salida extends Error { constructor(codigo, msg) { super(msg); this.codigo = codigo; } }

function celdas(linea) {
  return linea.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

function esFila(linea) { return /^\| T\d\d \|/.test(linea); }

export function leerTablero(texto) {
  const lineas = texto.split('\n');
  const plan = (lineas.find((l) => l.startsWith('Plan:')) || '').slice(5).trim().replace(/^`|`$/g, '');
  const pl = (lineas.find((l) => l.startsWith('Paradas:')) || '').slice(8).trim();
  const paradas = [...pl.matchAll(/bloque ([A-Z])/g)].map((m) => m[1]);
  const filas = lineas.filter(esFila).map((l) => {
    const c = celdas(l);
    return { id: c[0], bloque: c[1], ejecuta: c[4], depende: c[5], estado: c[6] };
  });
  return { plan, paradas, filas };
}

function problemas(texto) {
  const p = [];
  const lineas = texto.split('\n');
  if (!lineas.some((l) => l.startsWith('Plan:'))) p.push('falta la linea Plan:');
  if (!lineas.some((l) => l.startsWith('Paradas:'))) p.push('falta la linea Paradas:');
  if (!lineas.some((l) => l.trim() === CABECERA)) p.push('la cabecera de la tabla no es la canonica');
  const vistos = new Set();
  lineas.forEach((l, i) => {
    if (!esFila(l)) return;
    const c = celdas(l);
    if (c.length !== 7) { p.push(`linea ${i + 1}: la fila tiene ${c.length} celdas, no 7`); return; }
    if (vistos.has(c[0])) p.push(`linea ${i + 1}: Id repetido ${c[0]}`);
    vistos.add(c[0]);
    if (!RE_ESTADO.test(c[6])) p.push(`linea ${i + 1}: estado no valido en ${c[0]}: ${c[6]}`);
  });
  return p;
}

function raizVault() {
  let d = path.dirname(fileURLToPath(import.meta.url));
  for (;;) {
    if (existsSync(path.join(d, '_meta', 'verificar-kit.mjs'))) return d;
    const up = path.dirname(d);
    if (up === d) return null;
    d = up;
  }
}

function rutaPorDefecto() {
  const raiz = raizVault();
  const cwd = process.cwd();
  if (raiz) {
    if (path.resolve(cwd) === raiz) return path.join('_meta', 'tablero-tandas.md');
    if (path.dirname(path.resolve(cwd)) === path.join(raiz, 'asuntos')) return path.join('coordinacion', 'tablero-tandas.md');
  }
  throw new Salida(2, 'sin --tablero: el cwd no es la raiz del vault ni asuntos/<slug>');
}

function opcion(args, nombre) {
  const i = args.indexOf(nombre);
  if (i < 0) return null;
  const v = args[i + 1];
  if (v === undefined) throw new Salida(2, `falta el valor de ${nombre}`);
  args.splice(i, 2);
  return v;
}

function comprobar(args) {
  const ruta = args[0] || rutaPorDefecto();
  if (!existsSync(ruta)) throw new Salida(4, `no existe ${ruta}`);
  const p = problemas(readFileSync(ruta, 'utf8'));
  if (p.length) throw new Salida(4, p.join('\n'));
}

function estado(args) {
  const tab = opcion(args, '--tablero') || rutaPorDefecto();
  const [id, est, ...resto] = args;
  if (!id || !est) throw new Salida(2, 'uso: --estado <Id> <ESTADO> [motivo]');
  let nuevo;
  if (est === 'BLOQUEADA') {
    const motivo = resto.join(' ').trim();
    if (!motivo) throw new Salida(4, 'BLOQUEADA exige motivo');
    nuevo = `[BLOQUEADA: ${motivo}]`;
  } else if (ESTADOS[est]) nuevo = ESTADOS[est];
  else throw new Salida(2, `estado desconocido: ${est}`);
  if (!existsSync(tab)) throw new Salida(4, `no existe ${tab}`);
  const lineas = readFileSync(tab, 'utf8').split('\n');
  const i = lineas.findIndex((l) => esFila(l) && celdas(l)[0] === id);
  if (i < 0) throw new Salida(4, `Id inexistente: ${id}`);
  const c = celdas(lineas[i]);
  if (c.length !== 7) throw new Salida(4, `la fila de ${id} no tiene 7 celdas`);
  c[6] = nuevo;
  lineas[i] = `| ${c.join(' | ')} |`;
  writeFileSync(tab, lineas.join('\n'));
}

function desdePlan(args) {
  const tab = opcion(args, '--tablero') || rutaPorDefecto();
  const planRuta = args[0];
  if (!planRuta) throw new Salida(2, 'uso: --desde-plan <plan>');
  if (!existsSync(planRuta)) throw new Salida(4, `no existe ${planRuta}`);
  const lineas = readFileSync(planRuta, 'utf8').split('\n');
  const ini = lineas.findIndex((l, i) => l.trim() === CABECERA && lineas[i + 1] && lineas[i + 1].trim() === SEPARADOR);
  if (ini < 0) throw new Salida(4, 'el plan no tiene tabla con la cabecera canonica');
  let fin = ini + 2;
  while (fin < lineas.length && lineas[fin].startsWith('|')) fin++;
  const tabla = lineas.slice(ini, fin);
  let pIdx = -1;
  for (let i = fin; i < lineas.length && i < fin + 6; i++) if (lineas[i].startsWith('Paradas:')) { pIdx = i; break; }
  if (pIdx < 0) pIdx = lineas.findIndex((l, i) => i > fin && l.startsWith('Paradas:'));
  const paradas = pIdx >= 0 ? lineas[pIdx] : 'Paradas: ninguna';

  const planRel = path.relative(process.cwd(), path.resolve(planRuta)).split(path.sep).join('/');
  const tabRel = path.relative(process.cwd(), path.resolve(tab)).split(path.sep).join('/');

  if (existsSync(tab)) {
    const ant = leerTablero(readFileSync(tab, 'utf8'));
    const abiertas = ant.filas.some((f) => !/^\[HECHA/.test(f.estado));
    if (ant.plan && ant.plan !== 'ninguno' && ant.plan !== planRel && abiertas)
      throw new Salida(4, `el tablero tiene otro plan (${ant.plan}) con filas sin HECHA`);
  }

  const raiz = raizVault();
  const cwd = path.resolve(process.cwd());
  const titulo = raiz && cwd === raiz ? 'coordinador general' : `coordinador de ${path.basename(cwd)}`;
  const script = raiz && cwd === raiz ? 'general/comun/scripts/tablero.mjs' : '../../general/comun/scripts/tablero.mjs';
  const texto = [
    `# Tablero de tandas — ${titulo}`,
    '',
    `> Tabla de tandas viva del plan en curso (\`ciclo_de_tandas\`). Se reemplaza al empezar un plan y se actualiza al cerrar cada tanda, en el mismo commit, con \`node general/comun/scripts/tablero.mjs\` (desde un asunto, \`../../general/comun/scripts/tablero.mjs\`).`,
    '',
    `Plan: \`${planRel}\``,
    paradas,
    '',
    ...tabla,
    '',
  ].join('\n').replace(script, script);
  writeFileSync(tab, texto);

  const puntero = `La tabla de tandas vive en el tablero, \`${tabRel}\`.`;
  const nuevo = [...lineas.slice(0, ini), puntero, ...lineas.slice(fin, pIdx >= 0 ? pIdx : fin), ...lineas.slice(pIdx >= 0 ? pIdx + 1 : fin)];
  writeFileSync(planRuta, nuevo.join('\n'));
}

function main() {
  const args = process.argv.slice(2);
  const modo = args.shift();
  if (modo === '--ayuda') { console.log(AYUDA); return; }
  if (modo === '--comprobar') return comprobar(args);
  if (modo === '--estado') return estado(args);
  if (modo === '--desde-plan') return desdePlan(args);
  throw new Salida(2, AYUDA);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (e) {
    if (e instanceof Salida) { console.error(e.message); process.exit(e.codigo); }
    console.error(e && e.message ? e.message : String(e)); process.exit(1);
  }
}
