#!/usr/bin/env node
// estado.mjs: lee, verifica y escribe el estado vivo de un ambito (estado_vivo_por_comando).
// Sin dependencias. Salidas: 0 bien, 1 error interno, 2 uso, 4 invariantes rotos, Id o fichero inexistente.
import { readFileSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync, realpathSync, renameSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { raizVault, ambitoDe, listarAsuntos } from './espacios.mjs';

const SITUACIONES = ['abierto', 'en_curso', 'bloqueado', 'diferido', 'cerrado'];
export const ACTIVAS = ['abierto', 'en_curso', 'bloqueado'];
const ORDEN_ACTIVAS = ['en_curso', 'bloqueado', 'abierto'];
const CLAVES_ELEMENTO = ['id', 'titulo', 'situacion', 'dueno', 'abierto', 'caduca', 'bloqueado_por_decision', 'porque', 'nota', 'cerrado', 'resultado'];
const CLAVES_RAIZ = ['_lee_esto_primero', 'siguiente_id', 'elementos'];
const LEE_PRIMERO = 'Estado vivo de este ámbito: qué queda y de quién es. Se cambia con general/comun/scripts/estado.mjs (--ayuda); la regla, en la doctrina estado_vivo_por_comando.';
const TOPE_TITULO = 140;
const TOPE_NOTA = 300;

const AYUDA = `Uso:
  estado.mjs [--todo] [--mio <rol>] [--de <general|espacio/asunto>]
  estado.mjs --id <Id> [--de <ambito>]
  estado.mjs --verificar [--todos] [--de <ambito>]
  estado.mjs --iniciar
  estado.mjs --nuevo --titulo "<t>" --dueno <rol> [--situacion abierto|en_curso|bloqueado|diferido] [--porque <ruta>] [--caduca AAAA-MM-DD] [--bloqueado-por-decision <n>] [--nota "<n>"]
  estado.mjs --cambiar <Id> [--titulo] [--situacion] [--dueno] [--porque] [--caduca|--sin-caduca] [--bloqueado-por-decision|--sin-bloqueado-por-decision] [--nota|--sin-nota]
  estado.mjs --cerrar <Id> --resultado "<r>"
  estado.mjs --podar [--dias N]
  estado.mjs --prueba
  estado.mjs --ayuda
Sin modo: la vista de los activos del ambito del directorio de trabajo (la raiz o la carpeta de un asunto).
  --todo       ademas los diferidos y los cerrados.
  --mio <rol>  solo los de ese dueno.
  --id <Id>    el elemento entero, con su nota.
  --de <a>     el mismo modo sobre el fichero de otro ambito (general o espacio/asunto), solo lectura.
  --verificar  invariantes del fichero propio; con --todos, los de todos los ambitos con fichero.
  --hoy AAAA-MM-DD  solo para pruebas; por defecto, la fecha local.
  --iniciar    crea el fichero vacio del ambito (si ya existe, sale 4).
  --nuevo      anade un elemento (situacion abierto por defecto, abierto = hoy) e imprime su id.
  --cambiar    cambia campos de un elemento; para cerrarlo, --cerrar.
  --cerrar     situacion cerrado, cerrado = hoy; pide --resultado.
  --podar      quita los cerrados de hace mas de N dias (30 por defecto); siguiente_id no baja.
  Los modos de escritura solo tocan el fichero del ambito del directorio de trabajo; con --de salen 2.
  Antes de escribir se verifica el resultado: si sale un hallazgo nuevo, sale 4 y no se escribe.
  --prueba     bateria de pruebas en un vault temporal.
Ficheros: general -> _meta/estado.json; asunto -> <espacio>/<asunto>/coordinacion/estado.json.
Salidas: 0 bien, 1 error interno, 2 uso, 4 invariantes rotos, Id o fichero inexistente.`;

class Salida extends Error { constructor(codigo, msg) { super(msg); this.codigo = codigo; } }

export function rutaEstado(raiz, ambito) {
  if (ambito.tipo === 'general') return path.join(raiz, '_meta', 'estado.json');
  return path.join(raiz, ambito.espacio, ambito.slug, 'coordinacion', 'estado.json');
}

export function vacio() {
  return { _lee_esto_primero: LEE_PRIMERO, siguiente_id: 1, elementos: [] };
}

export function serializar(estado) {
  const salida = {};
  for (const k of CLAVES_RAIZ) {
    if (k === 'elementos' && Array.isArray(estado.elementos)) {
      salida.elementos = estado.elementos.map((e) => {
        if (e === null || typeof e !== 'object' || Array.isArray(e)) return e;
        const o = {};
        for (const c of CLAVES_ELEMENTO) if (e[c] !== undefined) o[c] = e[c];
        return o;
      });
    } else if (estado[k] !== undefined) salida[k] = estado[k];
  }
  return JSON.stringify(salida, null, 2) + '\n';
}

export function leer(ruta) {
  let texto;
  try { texto = readFileSync(ruta, 'utf8'); } catch { throw new Salida(4, `${ruta} no existe`); }
  try { return JSON.parse(texto); } catch (e) { throw new Salida(4, `${ruta} no es JSON valido: ${e.message}`); }
}

function fechaLocal() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function fechaValida(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [a, m, d] = s.split('-').map(Number);
  const f = new Date(Date.UTC(a, m - 1, d));
  return f.getUTCFullYear() === a && f.getUTCMonth() === m - 1 && f.getUTCDate() === d;
}

function numId(e) { const m = /^E(\d+)$/.exec(String(e.id)); return m ? Number(m[1]) : 0; }

function caducado(e, hoy) { return ACTIVAS.includes(e.situacion) && typeof e.caduca === 'string' && e.caduca < hoy; }

function linea(e, hoy) {
  const p = [`${e.id} [${e.situacion}] ${e.dueno}`.trimEnd() + ' · ' + e.titulo];
  if (e.caduca) p.push(`caduca ${caducado(e, hoy) ? 'CADUCADO ' : ''}${e.caduca}`);
  if (e.abierto) p.push(`desde ${e.abierto}`);
  if (e.cerrado) p.push(`cerrado ${e.cerrado}`);
  if (e.resultado) p.push(e.resultado);
  if (e.porque) p.push(e.porque);
  return p.join(' · ');
}

export function vista(estado, { todo = false, mio = null, hoy = fechaLocal() } = {}) {
  let els = Array.isArray(estado.elementos) ? estado.elementos : [];
  if (mio) els = els.filter((e) => e.dueno === mio);
  const activos = els.filter((e) => ACTIVAS.includes(e.situacion));
  const cad = activos.filter((e) => caducado(e, hoy)).sort((a, b) => a.caduca.localeCompare(b.caduca) || numId(a) - numId(b));
  const con = activos.filter((e) => e.caduca && !caducado(e, hoy)).sort((a, b) => a.caduca.localeCompare(b.caduca) || numId(a) - numId(b));
  const resto = activos.filter((e) => !e.caduca).sort((a, b) => ORDEN_ACTIVAS.indexOf(a.situacion) - ORDEN_ACTIVAS.indexOf(b.situacion) || numId(a) - numId(b));
  const orden = [...cad, ...con, ...resto];
  const dif = els.filter((e) => e.situacion === 'diferido').sort((a, b) => numId(a) - numId(b));
  const cer = els.filter((e) => e.situacion === 'cerrado').sort((a, b) => numId(a) - numId(b));
  const out = orden.map((e) => linea(e, hoy));
  if (todo) {
    out.push(...dif.map((e) => linea(e, hoy)), ...cer.map((e) => linea(e, hoy)));
    if (!orden.length && !dif.length && !cer.length) out.push('(nada activo en este ámbito)');
    else if (!orden.length) out.unshift('(nada activo en este ámbito)');
  } else {
    if (!orden.length) out.push('(nada activo en este ámbito)');
    if (dif.length || cer.length) out.push(`(${dif.length} diferidos y ${cer.length} cerrados: --todo)`);
  }
  return out.join('\n');
}

function entero(e) {
  return CLAVES_ELEMENTO.filter((c) => e[c] !== undefined).map((c) => `${c}: ${e[c]}`).join('\n');
}

function leerDecisiones(raiz) {
  let t;
  try { t = readFileSync(path.join(raiz, '_meta', 'decisiones-abiertas.md'), 'utf8'); } catch { return new Map(); }
  const m = new Map();
  for (const l of t.split('\n')) {
    const h = /^### (\d+)\./.exec(l);
    if (h) m.set(Number(h[1]), l.includes('**Resuelto'));
  }
  return m;
}

export function verificar(texto, { raiz, ambito, hoy = fechaLocal() } = {}) {
  const h = [];
  const add = (detalle) => h.push({ detalle });
  let obj;
  try { obj = JSON.parse(texto); } catch (e) { add(`1: no es JSON valido (${e.message})`); return h; }
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) { add('1: la raiz no es un objeto'); return h; }
  const claves = Object.keys(obj);
  if (claves.length !== 3 || !CLAVES_RAIZ.every((k) => claves.includes(k))) {
    add(`1: las claves tienen que ser exactamente ${CLAVES_RAIZ.join(', ')}; hay ${claves.join(', ') || 'ninguna'}`);
  }
  if (!Array.isArray(obj.elementos)) { add('1: elementos no es una lista'); return h; }
  if (texto !== serializar(obj)) add('2: el fichero no esta en formato canonico (dos espacios, claves en orden, salto final); reescribelo con estado.mjs');
  const sig = obj.siguiente_id;
  if (!Number.isInteger(sig) || sig < 1) add('3: siguiente_id tiene que ser un entero mayor o igual que 1');
  const slugs = ambito && raiz ? listarAsuntos(raiz).map((a) => a.slug) : [];
  const decisiones = ambito && ambito.tipo === 'general' && raiz ? leerDecisiones(raiz) : null;
  const vistos = new Set();
  obj.elementos.forEach((e, i) => {
    if (e === null || typeof e !== 'object' || Array.isArray(e)) { add(`elementos[${i}]: no es un objeto`); return; }
    const q = typeof e.id === 'string' ? e.id : `elementos[${i}]`;
    for (const k of Object.keys(e)) if (!CLAVES_ELEMENTO.includes(k)) add(`${q}: clave desconocida ${k}`);
    if (typeof e.id !== 'string' || !/^E[1-9]\d*$/.test(e.id)) add(`${q}: 3: el id no tiene la forma E<n>`);
    else {
      if (vistos.has(e.id)) add(`${q}: 3: id duplicado`);
      vistos.add(e.id);
      if (Number.isInteger(sig) && Number(e.id.slice(1)) >= sig) add(`${q}: 3: el numero del id no es menor que siguiente_id (${sig})`);
    }
    if (typeof e.titulo !== 'string' || e.titulo.trim() === '' || /[\r\n]/.test(e.titulo) || e.titulo.length > TOPE_TITULO) add(`${q}: 4: titulo vacio, con saltos de linea o de mas de ${TOPE_TITULO} caracteres`);
    for (const c of ['nota', 'resultado']) {
      if (e[c] !== undefined && (typeof e[c] !== 'string' || e[c].length > TOPE_NOTA)) add(`${q}: 4: ${c} no es texto o pasa de ${TOPE_NOTA} caracteres`);
    }
    if (!SITUACIONES.includes(e.situacion)) add(`${q}: 5: situacion ${JSON.stringify(e.situacion)} no es una de ${SITUACIONES.join(', ')}`);
    const d = e.dueno;
    const dueñoOk = typeof d === 'string' && (d === 'director' || d === 'coordinador-general' || (d.startsWith('coordinador-') && slugs.includes(d.slice(12))));
    if (!dueñoOk) add(`${q}: 6: dueno ${JSON.stringify(d)} no es director, coordinador-general ni coordinador-<asunto existente>`);
    for (const c of ['abierto', 'caduca', 'cerrado']) {
      if (c === 'abierto' ? !fechaValida(e[c]) : (e[c] !== undefined && !fechaValida(e[c]))) add(`${q}: 7: ${c} no es una fecha AAAA-MM-DD valida`);
    }
    const activo = ACTIVAS.includes(e.situacion);
    if (activo && d === 'director' && e.caduca === undefined) add(`${q}: 8: un activo del director lleva caduca`);
    if (caducado(e, hoy) && fechaValida(e.caduca)) add(`${q}: 9: caducado el ${e.caduca}`);
    const cerrado = e.situacion === 'cerrado';
    if (cerrado !== (e.cerrado !== undefined && e.resultado !== undefined) || (!cerrado && (e.cerrado !== undefined || e.resultado !== undefined))) {
      add(`${q}: 10: cerrado y resultado estan si y solo si la situacion es cerrado`);
    }
    if (e.porque !== undefined) {
      const p = e.porque;
      if (typeof p !== 'string' || p === '' || /^[/~]/.test(p) || /^[A-Za-z]:/.test(p) || p.includes('\\') || p.split('/').includes('..') || !p.includes('/')) {
        add(`${q}: 11: porque tiene que ser una ruta relativa a la raiz del vault (con /, sin .. ni ruta absoluta)`);
      }
    }
    if (e.bloqueado_por_decision !== undefined) {
      const n = e.bloqueado_por_decision;
      if (ambito && ambito.tipo !== 'general') add(`${q}: 12: bloqueado_por_decision solo se usa en el ambito general`);
      else if (!Number.isInteger(n)) add(`${q}: 12: bloqueado_por_decision tiene que ser un entero`);
      else if (decisiones) {
        if (!decisiones.has(n)) add(`${q}: 12: la decision ${n} no tiene encabezado "### ${n}." en _meta/decisiones-abiertas.md`);
        else if (decisiones.get(n) && activo) add(`${q}: 12: la decision ${n} ya esta resuelta y el pendiente sigue abierto`);
      }
    }
  });
  return h;
}

export function ambitosConEstado(raiz) {
  const out = [];
  const g = { nombre: 'general', ambito: { tipo: 'general' } };
  out.push(g);
  for (const a of listarAsuntos(raiz)) out.push({ nombre: a.rel, ambito: { tipo: 'asunto', espacio: a.espacio, slug: a.slug, prefijo: `${a.rel}/` } });
  return out.map((x) => ({ ...x, ruta: rutaEstado(raiz, x.ambito) })).filter((x) => existsSync(x.ruta));
}

function relativa(raiz, ruta) { return path.relative(raiz, ruta).split(path.sep).join('/'); }

function ambitoNombrado(raiz, nombre) {
  if (nombre === 'general') return { tipo: 'general' };
  const a = listarAsuntos(raiz).find((x) => x.rel === nombre);
  if (!a) throw new Salida(2, `--de ${nombre}: no es general ni un espacio/asunto del vault\n${AYUDA}`);
  return { tipo: 'asunto', espacio: a.espacio, slug: a.slug, prefijo: `${a.rel}/` };
}

function parsear(args) {
  const o = { todo: false, mio: null, id: null, de: null, verificar: false, todos: false, hoy: null, prueba: false, ayuda: false,
    iniciar: false, nuevo: false, cambiar: null, cerrar: null, podar: false, campos: {}, dias: null, resultado: null, sin: [] };
  const CAMPOS = ['titulo', 'situacion', 'dueno', 'porque', 'caduca', 'bloqueado-por-decision', 'nota'];
  const SIN = ['caduca', 'bloqueado-por-decision', 'nota'];
  const valor = (i, f) => { if (i + 1 >= args.length || args[i + 1].startsWith('--')) throw new Salida(2, `${f} pide un valor\n${AYUDA}`); return args[i + 1]; };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--todo') o.todo = true;
    else if (a === '--verificar') o.verificar = true;
    else if (a === '--todos') o.todos = true;
    else if (a === '--prueba') o.prueba = true;
    else if (a === '--ayuda') o.ayuda = true;
    else if (a === '--iniciar') o.iniciar = true;
    else if (a === '--nuevo') o.nuevo = true;
    else if (a === '--podar') o.podar = true;
    else if (a === '--mio' || a === '--id' || a === '--de' || a === '--hoy' || a === '--cambiar' || a === '--cerrar' || a === '--dias' || a === '--resultado') { o[a.slice(2)] = valor(i, a); i++; }
    else if (CAMPOS.includes(a.slice(2))) { o.campos[a.slice(2)] = valor(i, a); i++; }
    else if (a.startsWith('--sin-') && SIN.includes(a.slice(6))) o.sin.push(a.slice(6));
    else throw new Salida(2, `argumento desconocido: ${a}\n${AYUDA}`);
  }
  if (o.todos && !o.verificar) throw new Salida(2, `--todos solo va con --verificar\n${AYUDA}`);
  if (o.hoy !== null && !fechaValida(o.hoy)) throw new Salida(2, `--hoy tiene que ser AAAA-MM-DD\n${AYUDA}`);
  const modos = ['iniciar', 'nuevo', 'cambiar', 'cerrar', 'podar'].filter((m) => o[m] !== false && o[m] !== null);
  o.modoEscritura = modos[0] || null;
  if (modos.length > 1) throw new Salida(2, `un solo modo de escritura a la vez (${modos.join(', ')})\n${AYUDA}`);
  if (o.modoEscritura) {
    if (o.verificar || o.id !== null || o.todo || o.mio !== null || o.todos) throw new Salida(2, `--${o.modoEscritura} no se combina con modos de lectura\n${AYUDA}`);
  }
  const usados = [...Object.keys(o.campos), ...o.sin.map((x) => 'sin-' + x)];
  const permitidos = { nuevo: CAMPOS, cambiar: [...CAMPOS, ...SIN.map((x) => 'sin-' + x)], cerrar: [], iniciar: [], podar: [] }[o.modoEscritura] || [];
  for (const u of usados) if (!permitidos.includes(u)) throw new Salida(2, `--${u} no va con ${o.modoEscritura ? '--' + o.modoEscritura : 'ese modo'}\n${AYUDA}`);
  if (o.resultado !== null && o.modoEscritura !== 'cerrar') throw new Salida(2, `--resultado solo va con --cerrar\n${AYUDA}`);
  if (o.dias !== null && o.modoEscritura !== 'podar') throw new Salida(2, `--dias solo va con --podar\n${AYUDA}`);
  if (o.dias !== null && !/^\d+$/.test(o.dias)) throw new Salida(2, `--dias tiene que ser un entero\n${AYUDA}`);
  for (const x of SIN) if (o.sin.includes(x) && o.campos[x] !== undefined) throw new Salida(2, `--${x} y --sin-${x} a la vez\n${AYUDA}`);
  if (o.campos['bloqueado-por-decision'] !== undefined && !/^\d+$/.test(o.campos['bloqueado-por-decision'])) throw new Salida(2, `--bloqueado-por-decision tiene que ser un entero\n${AYUDA}`);
  const sit = o.campos.situacion;
  if (sit !== undefined && !['abierto', 'en_curso', 'bloqueado', 'diferido'].includes(sit)) {
    throw new Salida(2, sit === 'cerrado' ? 'para cerrar, usa --cerrar <Id> --resultado "<r>"' : `--situacion tiene que ser abierto, en_curso, bloqueado o diferido\n${AYUDA}`);
  }
  if (o.modoEscritura === 'nuevo' && (o.campos.titulo === undefined || o.campos.dueno === undefined)) throw new Salida(2, `--nuevo pide --titulo y --dueno\n${AYUDA}`);
  if (o.modoEscritura === 'cambiar' && !usados.length) throw new Salida(2, `--cambiar no cambia nada: falta algun campo\n${AYUDA}`);
  if (o.modoEscritura === 'cerrar' && (o.resultado === null || o.resultado.trim() === '')) throw new Salida(2, `--cerrar pide --resultado "<r>"\n${AYUDA}`);
  return o;
}

function guardar(ruta, estado, antes, ctx) {
  const texto = serializar(estado);
  const previos = new Set(antes === null ? [] : verificar(antes, ctx).map((f) => f.detalle));
  const nuevos = verificar(texto, ctx).filter((f) => !previos.has(f.detalle));
  if (nuevos.length) throw new Salida(4, `no se escribe ${relativa(ctx.raiz, ruta)}; el cambio deja hallazgos:\n` + nuevos.map((f) => f.detalle).join('\n'));
  mkdirSync(path.dirname(ruta), { recursive: true });
  const tmp = `${ruta}.${process.pid}.tmp`;
  writeFileSync(tmp, texto);
  renameSync(tmp, ruta);
}

function diasAtras(hoy, n) {
  const [a, m, d] = hoy.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d - n)).toISOString().slice(0, 10);
}

function escribir(o, raiz, ambito, ruta, hoy) {
  const ctx = { raiz, ambito, hoy };
  if (o.modoEscritura === 'iniciar') {
    if (existsSync(ruta)) throw new Salida(4, `${relativa(raiz, ruta)} ya existe; no se toca`);
    guardar(ruta, vacio(), null, ctx);
    console.log(`creado ${relativa(raiz, ruta)}`);
    return;
  }
  if (!existsSync(ruta)) throw new Salida(4, `${relativa(raiz, ruta)} no existe: crea el estado con --iniciar`);
  const antes = readFileSync(ruta, 'utf8');
  const estado = leer(ruta);
  if (!Array.isArray(estado.elementos)) throw new Salida(4, `${relativa(raiz, ruta)}: elementos no es una lista`);
  const c = o.campos;
  const poner = (e) => {
    for (const k of ['titulo', 'situacion', 'dueno', 'porque', 'nota', 'caduca']) if (c[k] !== undefined) e[k] = c[k];
    if (c['bloqueado-por-decision'] !== undefined) e.bloqueado_por_decision = Number(c['bloqueado-por-decision']);
    for (const x of o.sin) delete e[x.replace(/-/g, '_')];
  };
  if (o.modoEscritura === 'nuevo') {
    const sig = Number.isInteger(estado.siguiente_id) ? estado.siguiente_id : 1;
    const e = { id: `E${sig}`, situacion: 'abierto', abierto: hoy };
    poner(e);
    estado.elementos.push(e);
    estado.siguiente_id = sig + 1;
    guardar(ruta, estado, antes, ctx);
    console.log(e.id);
    return;
  }
  if (o.modoEscritura === 'podar') {
    const corte = diasAtras(hoy, o.dias === null ? 30 : Number(o.dias));
    const fuera = estado.elementos.filter((e) => e.situacion === 'cerrado' && typeof e.cerrado === 'string' && e.cerrado < corte);
    estado.elementos = estado.elementos.filter((e) => !fuera.includes(e));
    guardar(ruta, estado, antes, ctx);
    console.log(fuera.length ? fuera.map((e) => e.id).join(',') : '(nada que podar)');
    return;
  }
  const id = o.modoEscritura === 'cambiar' ? o.cambiar : o.cerrar;
  const e = estado.elementos.find((x) => x && x.id === id);
  if (!e) throw new Salida(4, `${id} no existe en ${relativa(raiz, ruta)}`);
  if (o.modoEscritura === 'cerrar') { e.situacion = 'cerrado'; e.cerrado = hoy; e.resultado = o.resultado; } else poner(e);
  guardar(ruta, estado, antes, ctx);
  console.log(`${id} actualizado`);
}

function faltante(raiz, ambito, ruta) {
  return new Salida(4, `${relativa(raiz, ruta)} no existe: ese ámbito no tiene estado.json; créalo con --iniciar`);
}

function ejecutar(args) {
  const o = parsear(args);
  if (o.ayuda) { console.log(AYUDA); return; }
  if (o.prueba) { prueba(); return; }
  const raiz = raizVault();
  if (!raiz) throw new Salida(2, 'no encuentro la raiz del vault');
  const hoy = o.hoy || fechaLocal();
  if (o.modoEscritura && o.de !== null) throw new Salida(2, `--de es de solo lectura: --${o.modoEscritura} escribe solo el ambito del directorio de trabajo`);
  let ambito;
  if (o.de !== null) ambito = ambitoNombrado(raiz, o.de);
  else {
    ambito = ambitoDe(raiz, process.cwd());
    if (ambito.tipo === 'invalido' || !ambito.exacto) {
      throw new Salida(2, 'el directorio de trabajo tiene que ser la raiz del vault o la carpeta de un asunto (o usa --de)');
    }
  }
  if (o.modoEscritura) { escribir(o, raiz, ambito, rutaEstado(raiz, ambito), hoy); return; }
  if (o.verificar && o.todos) {
    const hall = [];
    for (const x of ambitosConEstado(raiz)) {
      const texto = readFileSync(x.ruta, 'utf8');
      for (const f of verificar(texto, { raiz, ambito: x.ambito, hoy })) hall.push(`${relativa(raiz, x.ruta)} :: ${f.detalle}`);
    }
    if (hall.length) throw new Salida(4, hall.join('\n'));
    console.log('estado: sin hallazgos');
    return;
  }
  const ruta = rutaEstado(raiz, ambito);
  if (!existsSync(ruta)) throw faltante(raiz, ambito, ruta);
  if (o.verificar) {
    const hall = verificar(readFileSync(ruta, 'utf8'), { raiz, ambito, hoy });
    if (hall.length) throw new Salida(4, hall.map((f) => `${relativa(raiz, ruta)} :: ${f.detalle}`).join('\n'));
    console.log('estado: sin hallazgos');
    return;
  }
  const estado = leer(ruta);
  if (o.id !== null) {
    const e = (estado.elementos || []).find((x) => x.id === o.id);
    if (!e) throw new Salida(4, `${o.id} no existe en ${relativa(raiz, ruta)}`);
    console.log(entero(e));
    return;
  }
  console.log(vista(estado, { todo: o.todo, mio: o.mio, hoy }));
}

// ---------------------------------------------------------------- prueba

function prueba() {
  const aqui = path.dirname(fileURLToPath(import.meta.url));
  const tmp = realpathSync(mkdtempSync(path.join(os.tmpdir(), 'estado-prueba-')));
  const w = (rel, txt) => { const p = path.join(tmp, rel); mkdirSync(path.dirname(p), { recursive: true }); writeFileSync(p, txt); return p; };
  w('_meta/verificar-kit.mjs', '');
  w('_meta/decisiones-abiertas.md', '# Decisiones\n\n### 1. Algo cerrado — **Resuelto: hecho**\n\n### 2. Algo abierto\n');
  w('casa/README.md', '---\ntipo: espacio\n---\n# Casa\n');
  for (const s of ['uno', 'dos']) { w(`casa/${s}/charter-coordinador.md`, '# Charter\n'); mkdirSync(path.join(tmp, 'casa', s, 'coordinacion'), { recursive: true }); }
  const dest = path.join(tmp, 'general', 'comun', 'scripts');
  mkdirSync(dest, { recursive: true });
  for (const f of ['estado.mjs', 'espacios.mjs']) copyFileSync(path.join(aqui, f), path.join(dest, f));
  const script = path.join(dest, 'estado.mjs');
  const FG = path.join(tmp, '_meta', 'estado.json');
  const FU = path.join(tmp, 'casa', 'uno', 'coordinacion', 'estado.json');
  const HOY = '2026-10-12';
  const run = (cwd, a) => {
    const r = spawnSync(process.execPath, [script, ...a, '--hoy', HOY], { cwd: path.join(tmp, cwd), encoding: 'utf8' });
    return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
  };
  const el = (id, extra) => ({ id, titulo: `Titulo ${id}`, situacion: 'abierto', dueno: 'coordinador-general', abierto: '2026-10-01', ...extra });
  const estado = (elementos, sig) => ({ _lee_esto_primero: LEE_PRIMERO, siguiente_id: sig || 20, elementos });
  const poner = (f, obj) => writeFileSync(f, typeof obj === 'string' ? obj : serializar(obj));
  const base = () => [
    el('E1', { dueno: 'director', caduca: '2026-12-01' }),
    el('E2', { situacion: 'en_curso', nota: 'detalle largo de E2', porque: '_meta/cola-pendientes.md' }),
    el('E3', { dueno: 'director', caduca: '2026-09-01' }),
    el('E4', { situacion: 'bloqueado' }),
    el('E5'),
    el('E6', { situacion: 'diferido' }),
    el('E7', { situacion: 'cerrado', cerrado: '2026-10-05', resultado: 'hecho' }),
  ];

  let fallos = 0, total = 0;
  const caso = (nombre, cond, detalle) => { total++; if (cond) console.log(`[OK] ${nombre}`); else { fallos++; console.log(`[FALLO] ${nombre}${detalle ? ': ' + detalle : ''}`); } };
  const ids = (txt) => txt.split('\n').filter((l) => /^E\d+ /.test(l)).map((l) => l.split(' ')[0]).join(',');

  try {
    // lectura
    let r = run('.', []);
    caso('sin fichero: sale 4 con el aviso de que no tiene estado.json', r.code === 4 && /ese ámbito no tiene estado\.json/.test(r.out), r.out);
    poner(FG, estado([]));
    r = run('.', []);
    caso('vista vacia', r.code === 0 && r.out.trim() === '(nada activo en este ámbito)', r.out);
    poner(FG, estado(base()));
    r = run('.', []);
    caso('orden: caducado, con caduca, en_curso, bloqueado, abierto', r.code === 0 && ids(r.out) === 'E3,E1,E2,E4,E5', r.out);
    caso('el caducado lleva CADUCADO', /^E3 .*caduca CADUCADO 2026-09-01/m.test(r.out), r.out);
    caso('la vista no lleva nota y cierra con el recuento', !/detalle largo/.test(r.out) && /\(1 diferidos y 1 cerrados: --todo\)/.test(r.out), r.out);
    r = run('.', ['--todo']);
    caso('--todo anade diferidos y cerrados', r.code === 0 && ids(r.out) === 'E3,E1,E2,E4,E5,E6,E7' && /cerrado 2026-10-05 · hecho/.test(r.out), r.out);
    r = run('.', ['--mio', 'director']);
    caso('--mio filtra por dueno', r.code === 0 && ids(r.out) === 'E3,E1', r.out);
    r = run('.', ['--id', 'E2']);
    caso('--id existente da la nota', r.code === 0 && /nota: detalle largo de E2/.test(r.out), r.out);
    r = run('.', ['--id', 'E99']);
    caso('--id inexistente sale 4', r.code === 4, r.out);
    poner(FU, estado([el('E1', { dueno: 'coordinador-uno' })]));
    r = run('casa/dos', ['--de', 'casa/uno']);
    caso('--de lee el otro asunto', r.code === 0 && ids(r.out) === 'E1', r.out);
    r = run('casa/uno', []);
    caso('desde la carpeta del asunto lee el suyo', r.code === 0 && ids(r.out) === 'E1', r.out);
    r = run('casa/dos', []);
    caso('asunto sin fichero sale 4', r.code === 4 && /casa\/dos\/coordinacion\/estado\.json no existe/.test(r.out), r.out);
    r = run('casa', []);
    caso('directorio de trabajo invalido sale 2', r.code === 2, r.out);
    r = run('casa/uno/coordinacion', []);
    caso('directorio de trabajo no exacto sale 2', r.code === 2, r.out);
    r = run('.', ['--de', 'casa/tres']);
    caso('--de de un ambito que no existe sale 2', r.code === 2, r.out);

    // verificacion
    poner(FG, estado(base().map((e) => (e.id === 'E3' ? { ...e, caduca: '2026-11-01' } : e))));
    r = run('.', ['--verificar']);
    caso('fichero valido pasa --verificar', r.code === 0, r.out);
    r = run('.', ['--verificar', '--todos']);
    caso('fichero valido pasa --verificar --todos', r.code === 0, r.out);
    poner(FU, estado([el('E1', { dueno: 'coordinador-uno', caduca: '2026-01-01' })]));
    r = run('.', ['--verificar', '--todos']);
    caso('--todos recoge el hallazgo de otro ambito con su ruta', r.code === 4 && /^casa\/uno\/coordinacion\/estado\.json :: .*9:/m.test(r.out), r.out);
    rmSync(FU);

    const rojo = (nombre, texto, patron, cwd = '.', fichero = FG) => {
      poner(fichero, texto);
      const x = run(cwd, ['--verificar']);
      caso(`rojo ${nombre}`, x.code === 4 && patron.test(x.out), x.out);
    };
    const una = (mut) => estado([mut]);
    rojo('1 JSON roto', '{"a":', /1:/);
    rojo('1 claves de mas', serializar({ ...estado([]) }).replace('"elementos"', '"extra": 1,\n  "elementos"'), /1:/);
    rojo('2 formato no canonico', JSON.stringify(estado([el('E1')])), /2:/);
    rojo('3 id sin forma', una(el('X1')), /3: el id/);
    rojo('3 id duplicado', estado([el('E1'), el('E1')]), /3: id duplicado/);
    rojo('3 id no menor que siguiente_id', estado([el('E5')], 5), /3: el numero/);
    rojo('4 titulo vacio', una(el('E1', { titulo: '' })), /4:/);
    rojo('4 titulo largo', una(el('E1', { titulo: 'x'.repeat(141) })), /4:/);
    rojo('4 nota larga', una(el('E1', { nota: 'x'.repeat(301) })), /4:/);
    rojo('5 situacion', una(el('E1', { situacion: 'hecho' })), /5:/);
    rojo('6 dueno', una(el('E1', { dueno: 'roger' })), /6:/);
    rojo('6 coordinador de asunto inexistente', una(el('E1', { dueno: 'coordinador-tres' })), /6:/);
    rojo('7 fecha', una(el('E1', { abierto: '2026-13-40' })), /7: abierto/);
    rojo('8 director sin caduca', una(el('E1', { dueno: 'director' })), /8:/);
    rojo('9 caducado', una(el('E1', { dueno: 'director', caduca: '2026-10-01' })), /9: caducado/);
    rojo('10 cerrado sin resultado', una(el('E1', { situacion: 'cerrado', cerrado: '2026-10-05' })), /10:/);
    rojo('10 resultado en un abierto', una(el('E1', { cerrado: '2026-10-05', resultado: 'x' })), /10:/);
    rojo('11 porque absoluta', una(el('E1', { porque: '/etc/hosts' })), /11:/);
    rojo('11 porque con ..', una(el('E1', { porque: '../fuera/x.md' })), /11:/);
    rojo('11 porque sin /', una(el('E1', { porque: 'cola.md' })), /11:/);
    rojo('12 decision resuelta', una(el('E1', { bloqueado_por_decision: 1 })), /12: la decision 1 ya esta resuelta/);
    rojo('12 decision inexistente', una(el('E1', { bloqueado_por_decision: 9 })), /12: la decision 9 no tiene/);
    rojo('12 en un asunto', una(el('E1', { dueno: 'coordinador-uno', bloqueado_por_decision: 2 })), /12: .*solo se usa en el ambito general/, 'casa/uno', FU);
    poner(FG, una(el('E1', { bloqueado_por_decision: 2 })));
    r = run('.', ['--verificar']);
    caso('12 decision abierta pasa', r.code === 0, r.out);
    poner(FG, una(el('E1', { situacion: 'cerrado', cerrado: '2026-10-05', resultado: 'ok', bloqueado_por_decision: 1 })));
    r = run('.', ['--verificar']);
    caso('12 decision resuelta con el elemento cerrado pasa', r.code === 0, r.out);

    // escritura
    const huella = (f) => (existsSync(f) ? createHash('sha256').update(readFileSync(f)).digest('hex') : 'ausente');
    const FD = path.join(tmp, 'casa', 'dos', 'coordinacion', 'estado.json');
    rmSync(FG, { force: true }); rmSync(FU, { force: true });
    r = run('casa/dos', ['--cambiar', 'E1', '--nota', 'x']);
    caso('escribir sin fichero sale 4 y manda a --iniciar', r.code === 4 && /--iniciar/.test(r.out) && !existsSync(FD), r.out);
    r = run('casa/dos', ['--iniciar']);
    caso('--iniciar crea el fichero', r.code === 0 && existsSync(FD), r.out);
    r = run('casa/dos', ['--verificar']);
    caso('el fichero iniciado pasa --verificar', r.code === 0, r.out);
    let h = huella(FD);
    r = run('casa/dos', ['--iniciar']);
    caso('--iniciar repetido sale 4 y no cambia el fichero', r.code === 4 && huella(FD) === h, r.out);
    r = run('casa/dos', ['--nuevo', '--titulo', 'Primero', '--dueno', 'coordinador-dos']);
    caso('--nuevo da E1', r.code === 0 && r.out.trim() === 'E1', r.out);
    r = run('casa/dos', ['--nuevo', '--titulo', 'Segundo', '--dueno', 'coordinador-dos', '--situacion', 'en_curso', '--porque', 'casa/dos/README.md', '--nota', 'una nota']);
    caso('--nuevo da E2', r.code === 0 && r.out.trim() === 'E2', r.out);
    r = run('casa/dos', ['--verificar']);
    caso('tras --nuevo el fichero pasa --verificar (formato canonico)', r.code === 0, r.out);
    h = huella(FD);
    r = run('casa/dos', ['--nuevo', '--titulo', 'Del director', '--dueno', 'director']);
    caso('--nuevo de director sin --caduca sale 4 y no cambia el fichero', r.code === 4 && /8:/.test(r.out) && huella(FD) === h, r.out);
    r = run('casa/dos', ['--nuevo', '--titulo', 'Cerrado', '--dueno', 'coordinador-dos', '--situacion', 'cerrado']);
    caso('--nuevo con situacion cerrado sale 2', r.code === 2 && huella(FD) === h, r.out);
    r = run('casa/dos', ['--cambiar', 'E1', '--titulo', 'Primero cambiado', '--situacion', 'bloqueado', '--nota', 'nota nueva', '--caduca', '2026-11-01']);
    r = run('casa/dos', ['--id', 'E1']);
    caso('--cambiar cambia los campos', /titulo: Primero cambiado/.test(r.out) && /situacion: bloqueado/.test(r.out) && /nota: nota nueva/.test(r.out) && /caduca: 2026-11-01/.test(r.out), r.out);
    run('casa/dos', ['--cambiar', 'E1', '--sin-nota', '--sin-caduca']);
    r = run('casa/dos', ['--id', 'E1']);
    caso('--sin-nota y --sin-caduca quitan los campos', !/nota:/.test(r.out) && !/caduca:/.test(r.out), r.out);
    r = run('casa/dos', ['--cambiar', 'E1', '--situacion', 'cerrado']);
    caso('--cambiar no admite cerrado (sale 2)', r.code === 2, r.out);
    r = run('casa/dos', ['--cambiar', 'E9', '--nota', 'x']);
    caso('--cambiar de un id inexistente sale 4', r.code === 4, r.out);
    h = huella(FD);
    r = run('casa/dos', ['--cerrar', 'E1']);
    caso('--cerrar sin --resultado sale 2 y no cambia el fichero', r.code === 2 && huella(FD) === h, r.out);
    r = run('casa/dos', ['--cerrar', 'E1', '--resultado', 'hecho y comprobado']);
    r = run('casa/dos', ['--id', 'E1']);
    caso('--cerrar deja cerrado, fecha y resultado', /situacion: cerrado/.test(r.out) && /cerrado: 2026-10-12/.test(r.out) && /resultado: hecho y comprobado/.test(r.out), r.out);
    poner(FD, estado([el('E1', { dueno: 'coordinador-dos', situacion: 'cerrado', cerrado: '2026-08-01', resultado: 'viejo' }),
      el('E2', { dueno: 'coordinador-dos', situacion: 'cerrado', cerrado: '2026-10-05', resultado: 'reciente' }),
      el('E3', { dueno: 'coordinador-dos' })], 4));
    r = run('casa/dos', ['--podar']);
    const sd = JSON.parse(readFileSync(FD, 'utf8'));
    caso('--podar quita el cerrado viejo, conserva el reciente y no baja siguiente_id', r.code === 0 && r.out.trim() === 'E1' && sd.elementos.map((e) => e.id).join(',') === 'E2,E3' && sd.siguiente_id === 4, r.out);
    r = run('casa/dos', ['--nuevo', '--titulo', 'Despues de podar', '--dueno', 'coordinador-dos']);
    caso('un --nuevo tras --podar no reutiliza el id', r.code === 0 && r.out.trim() === 'E4', r.out);
    r = run('casa/dos', ['--verificar']);
    caso('tras cerrar, podar y crear el fichero pasa --verificar', r.code === 0, r.out);
    poner(FG, estado(base()));
    r = run('.', ['--nuevo', '--titulo', 'Con un caducado ajeno', '--dueno', 'coordinador-general']);
    caso('un caducado ajeno al cambio no impide escribir', r.code === 0 && r.out.trim() === 'E20', r.out);
    poner(FU, estado([el('E1', { dueno: 'coordinador-uno' })]));
    h = huella(FU);
    r = run('casa/dos', ['--de', 'casa/uno', '--nuevo', '--titulo', 'Intruso', '--dueno', 'coordinador-uno']);
    caso('--de con escritura sale 2 y el fichero del otro no cambia', r.code === 2 && huella(FU) === h, r.out);
    r = run('casa/dos', ['--de', 'casa/uno', '--iniciar']);
    caso('--de con --iniciar sale 2', r.code === 2 && huella(FU) === h, r.out);
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
