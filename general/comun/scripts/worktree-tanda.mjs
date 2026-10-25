#!/usr/bin/env node
// worktree-tanda.mjs: integra en el principal el trabajo de una tanda hecha en un worktree
// (variante W de ciclo_de_tandas) y lo retira. Sin dependencias.
// Salidas: 0 bien, 1 error interno, 2 uso, 4 precondicion sin tocar nada.
import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync, realpathSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = fileURLToPath(import.meta.url);
const TABLERO_JS = path.join(path.dirname(AQUI), 'tablero.mjs');

const AYUDA = `Uso:
  worktree-tanda.mjs --integrar <Id> --worktree <ruta> [--mensaje "<texto>"] [--tablero <ruta>]
      Se corre desde la carpeta del coordinador en el arbol principal (la raiz o la del asunto).
      Comprueba que el worktree solo cambio los ficheros de la fila <Id> del tablero (cuarta
      celda: rutas literales entre acentos graves, relativas a esa carpeta; las que empiezan
      por ~ o por / no se comparan), trae su rama con cherry-pick --no-commit, pasa la fila a HECHA,
      commitea por pathspec ("<Id> <mensaje>") y retira el worktree y su rama.
  worktree-tanda.mjs --foto <fichero>
      Guarda 'git status --porcelain' antes de lanzar una tanda en serie. El fichero va fuera del
      arbol o en uno ignorado; la ruta se pasa por argumento.
  worktree-tanda.mjs --cerrar <Id> --foto <fichero> --mensaje "<texto>" [--tablero <ruta>]
      Cierra una tanda en serie. Calcula los caminos que cambiaron desde la foto (lo que ya estaba
      en ella, de otras sesiones, no cuenta ni se commitea), sale 4 sin tocar nada si alguno no esta
      en la fila <Id> o si no cambio ninguno; si cuadra, pasa la fila a HECHA, hace git add y
      commitea por pathspec ("<Id> <mensaje>") las rutas y el tablero. No corre la comprobacion
      de la tanda: esa la corre el coordinador antes.
  worktree-tanda.mjs --listar     worktrees distintos del principal: 0 si no hay, 4 si hay
  worktree-tanda.mjs --prueba     prueba en un repositorio temporal, nueve casos
  worktree-tanda.mjs --ayuda
Salidas: 0 bien, 1 error interno, 2 uso, 4 precondicion sin tocar nada.`;

class Salida extends Error { constructor(codigo, msg) { super(msg); this.codigo = codigo; } }

function git(cwd, args, opts = {}) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (r.error) throw new Salida(1, `no se pudo correr git: ${r.error.message}`);
  if (r.status !== 0 && !opts.tolerar) throw new Salida(1, `git ${args.join(' ')}: ${(r.stderr || r.stdout).trim()}`);
  return { ok: r.status === 0, out: opts.crudo ? (r.stdout || '') : (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}

function opcion(args, nombre) {
  const i = args.indexOf(nombre);
  if (i < 0) return null;
  const v = args[i + 1];
  if (v === undefined) throw new Salida(2, `falta el valor de ${nombre}`);
  args.splice(i, 2);
  return v;
}

function ficherosDeFila(textoTablero, id) {
  const linea = textoTablero.split('\n').find((l) => /^\| T\d\d \|/.test(l) && l.split('|')[1].trim() === id);
  if (!linea) throw new Salida(4, `Id inexistente en el tablero: ${id}`);
  const celda = linea.trim().replace(/^\|/, '').replace(/\|$/, '').split('|')[3] || '';
  const rutas = [...celda.matchAll(/`([^`]+)`/g)].map((m) => m[1]).filter((r) => !r.startsWith('~') && !r.startsWith('/'));
  if (!rutas.length) throw new Salida(4, `la fila ${id} no lista ficheros`);
  return rutas;
}

const dentro = (f, lista) => lista.some((r) => f === r || f.startsWith(r.endsWith('/') ? r : r + '/'));

function porcelain(cwd, extra = []) {
  const o = git(cwd, ['status', '--porcelain', '--untracked-files=all', ...extra], { crudo: true }).out;
  return o ? o.split('\n').filter(Boolean).map((l) => l.slice(3).replace(/^.* -> /, '').replace(/^"|"$/g, '')) : [];
}

// rutas que git add acepta: existen en disco o siguen en el index. Un borrado ya preparado
// (git rm) no casa con nada y haria fallar el git add; el commit por pathspec ya lo incluye.
function aniadibles(cwd, rutas) {
  const top = git(cwd, ['rev-parse', '--show-toplevel']).out;
  return rutas.filter((r) => existsSync(path.join(top, r)) || git(top, ['ls-files', '--', r]).out);
}

// git add de las rutas aniadibles: las que el index ya conoce van con -f (un fichero versionado
// dentro de una carpeta ignorada, p. ej. .obsidian/, si no hace fallar el add); las no versionadas
// van sin -f, de modo que una ruta ignorada sigue fallando y no se versiona sin querer.
function aniadir(cwd, rutas) {
  const ok = aniadibles(cwd, rutas);
  const top = git(cwd, ['rev-parse', '--show-toplevel']).out;
  const conocidas = ok.filter((r) => git(top, ['ls-files', '--', r]).out);
  const nuevas = ok.filter((r) => !conocidas.includes(r));
  if (conocidas.length) git(cwd, ['add', '-A', '-f', '--', ...conocidas]);
  if (nuevas.length) git(cwd, ['add', '-A', '--', ...nuevas]);
}

function integrar(args) {
  const id = opcion(args, '--integrar');
  const wt = opcion(args, '--worktree');
  const mensaje = opcion(args, '--mensaje') || 'tanda integrada';
  let tab = opcion(args, '--tablero');
  if (args.length) throw new Salida(2, `argumento sobrante: ${args.join(' ')}`);
  if (!id || !wt) throw new Salida(2, 'uso: --integrar <Id> --worktree <ruta> [--mensaje "<texto>"] [--tablero <ruta>]');
  const top = git(process.cwd(), ['rev-parse', '--show-toplevel']).out;
  const cwd = process.cwd();
  let pref = path.relative(realpathSync(top), realpathSync(cwd)).split(path.sep).join('/');
  if (pref) pref += '/';
  if (!existsSync(wt)) throw new Salida(4, `no existe el worktree ${wt}`);
  const wtTop = git(wt, ['rev-parse', '--show-toplevel']).out;
  if (realpathSync(wtTop) === realpathSync(top)) throw new Salida(4, 'el worktree es el arbol principal');
  if (!tab) {
    tab = ['_meta/tablero-tandas.md', 'coordinacion/tablero-tandas.md'].find((t) => existsSync(path.join(cwd, t)));
    if (!tab) throw new Salida(4, `no hay tablero en ${cwd} (_meta/tablero-tandas.md ni coordinacion/tablero-tandas.md)`);
  }
  const tabAbs = path.resolve(cwd, tab);
  if (!existsSync(tabAbs)) throw new Salida(4, `no existe el tablero ${tab}`);
  const tabRel = path.relative(top, tabAbs).split(path.sep).join('/');
  const ficheros = ficherosDeFila(readFileSync(tabAbs, 'utf8'), id).map((r) => pref + r);
  const rama = git(wt, ['rev-parse', '--abbrev-ref', 'HEAD']).out;
  if (!rama || rama === 'HEAD') throw new Salida(4, 'el worktree no esta en una rama');

  // b. todo lo cambiado (sin commitear y ya commiteado en la rama) esta en la lista
  const sucios = porcelain(wt);
  const base = git(top, ['merge-base', 'HEAD', rama]).out;
  const commiteados = git(wt, ['diff', '--name-only', base, rama]).out.split('\n').filter(Boolean);
  const sobran = [...new Set([...sucios, ...commiteados])].filter((f) => !dentro(f, ficheros));
  if (sobran.length) throw new Salida(4, `cambios fuera de la tanda ${id}:\n${sobran.join('\n')}\nla celda Ficheros de la fila ${id} tiene que listar esas rutas literales, desde la carpeta desde la que se corre (ciclo_de_tandas)`);

  // c (antes de tocar nada). el principal no tiene cambios en esos ficheros ni en el tablero
  const ocupados = porcelain(top, ['--', ...ficheros, tabRel]);
  if (ocupados.length) throw new Salida(4, `el principal tiene cambios sin commitear en:\n${ocupados.join('\n')}`);

  if (sucios.length) {
    aniadir(wt, sucios);
    git(wt, ['commit', '-m', `${id} ${mensaje}`, '--', ...sucios]);
  }
  if (!git(top, ['rev-list', `${base}..${rama}`]).out) throw new Salida(4, 'la rama del worktree no trae cambios');

  const cp = git(top, ['cherry-pick', '--no-commit', `${base}..${rama}`], { tolerar: true });
  if (!cp.ok) {
    const ab = git(top, ['cherry-pick', '--abort'], { tolerar: true });
    if (!ab.ok) {
      git(top, ['reset', '--quiet'], { tolerar: true });
      git(top, ['checkout', '--', '.'], { tolerar: true });
      git(top, ['clean', '-fdq', '--', ...ficheros], { tolerar: true });
    }
    throw new Salida(4, `conflicto al traer ${rama}; abortado, el worktree sigue intacto\n${cp.err}`);
  }

  // primero el git add de los ficheros (si falla, el tablero sigue intacto); luego la fila y el tablero
  aniadir(top, ficheros);
  const t = spawnSync(process.execPath, [TABLERO_JS, '--estado', id, 'HECHA', '--tablero', tabAbs], { cwd: top, encoding: 'utf8' });
  if (t.status !== 0) throw new Salida(1, `tablero.mjs --estado fallo: ${(t.stderr || '').trim()}`);
  git(top, ['add', '--', tabRel]);
  git(top, ['commit', '-m', `${id} ${mensaje}`, '--', ...ficheros, tabRel]);
  git(top, ['worktree', 'remove', '--force', wt]);
  git(top, ['branch', '-D', rama]);
  console.log(`${id} integrada: ${ficheros.join(', ')}`);
}

function lineasPorcelain(cwd) {
  const o = git(cwd, ['status', '--porcelain', '--untracked-files=all'], { crudo: true }).out;
  return o ? o.split('\n').filter(Boolean) : [];
}
const rutaDeLinea = (l) => l.slice(3).replace(/^.* -> /, '').replace(/^"|"$/g, '');

function foto(args) {
  const f = opcion(args, '--foto');
  if (args.length) throw new Salida(2, `argumento sobrante: ${args.join(' ')}`);
  if (!f) throw new Salida(2, 'uso: --foto <fichero>');
  const top = git(process.cwd(), ['rev-parse', '--show-toplevel']).out;
  writeFileSync(f, lineasPorcelain(top).join('\n') + '\n');
  console.log(`foto guardada en ${f}`);
}

function cerrar(args) {
  const id = opcion(args, '--cerrar');
  const f = opcion(args, '--foto');
  const mensaje = opcion(args, '--mensaje');
  let tab = opcion(args, '--tablero');
  if (args.length) throw new Salida(2, `argumento sobrante: ${args.join(' ')}`);
  if (!id || !f || !mensaje) throw new Salida(2, 'uso: --cerrar <Id> --foto <fichero> --mensaje "<texto>" [--tablero <ruta>]');
  const top = git(process.cwd(), ['rev-parse', '--show-toplevel']).out;
  const cwd = process.cwd();
  let pref = path.relative(realpathSync(top), realpathSync(cwd)).split(path.sep).join('/');
  if (pref) pref += '/';
  if (!existsSync(f)) throw new Salida(4, `no existe la foto ${f}`);
  if (!tab) {
    tab = ['_meta/tablero-tandas.md', 'coordinacion/tablero-tandas.md'].find((t) => existsSync(path.join(cwd, t)));
    if (!tab) throw new Salida(4, `no hay tablero en ${cwd} (_meta/tablero-tandas.md ni coordinacion/tablero-tandas.md)`);
  }
  const tabAbs = path.resolve(cwd, tab);
  if (!existsSync(tabAbs)) throw new Salida(4, `no existe el tablero ${tab}`);
  const tabRel = path.relative(realpathSync(top), realpathSync(tabAbs)).split(path.sep).join('/');
  const ficheros = ficherosDeFila(readFileSync(tabAbs, 'utf8'), id).map((r) => pref + r);

  // cambiado desde la foto: linea nueva o con otro estado (el mismo camino con la misma marca no cuenta)
  const antes = new Set(readFileSync(f, 'utf8').split('\n').filter(Boolean));
  const fotoRel = (() => { try { return path.relative(realpathSync(top), realpathSync(f)).split(path.sep).join('/'); } catch { return null; } })();
  const cambiados = [...new Set(lineasPorcelain(top).filter((l) => !antes.has(l)).map(rutaDeLinea))]
    .filter((c) => c !== tabRel && c !== fotoRel);
  const sobran = cambiados.filter((c) => !dentro(c, ficheros));
  if (sobran.length) throw new Salida(4, `cambios fuera de la tanda ${id}:\n${sobran.join('\n')}\nla celda Ficheros de la fila ${id} tiene que listar esas rutas literales, desde la carpeta desde la que se corre (ciclo_de_tandas)`);
  if (!cambiados.length) throw new Salida(4, `la tanda ${id} no cambio ningun fichero desde la foto`);

  // primero el git add de los ficheros (si falla, el tablero sigue intacto); luego la fila y el tablero
  aniadir(top, cambiados);
  const t = spawnSync(process.execPath, [TABLERO_JS, '--estado', id, 'HECHA', '--tablero', tabAbs], { cwd: top, encoding: 'utf8' });
  if (t.status !== 0) throw new Salida(1, `tablero.mjs --estado fallo: ${(t.stderr || '').trim()}`);
  git(top, ['add', '--', tabRel]);
  git(top, ['commit', '-q', '-m', `${id} ${mensaje}`, '--', ...cambiados, tabRel]);
  console.log(`${id} cerrada: ${cambiados.join(', ')}`);
}

function listar(args) {
  if (args.length > 1) throw new Salida(2, `argumento sobrante: ${args.slice(1).join(' ')}`);
  const top = git(process.cwd(), ['rev-parse', '--show-toplevel']).out;
  const ls = git(top, ['worktree', 'list', '--porcelain']).out.split('\n')
    .filter((l) => l.startsWith('worktree ')).map((l) => l.slice(9));
  const otros = ls.filter((p) => realpathSync(p) !== realpathSync(top));
  if (otros.length) throw new Salida(4, otros.join('\n'));
}

function prueba(args) {
  if (args.length > 1) throw new Salida(2, `argumento sobrante: ${args.slice(1).join(' ')}`);
  const dir = realpathSync(mkdtempSync(path.join(os.tmpdir(), 'wt-tanda-')));
  const repo = path.join(dir, 'repo');
  let fallos = 0;
  const caso = (nombre, ok, detalle = '') => {
    console.log(`${ok ? '[OK]' : '[FALLA]'} ${nombre}${ok ? '' : ' — ' + detalle}`);
    if (!ok) fallos++;
  };
  const g = (cwd, ...a) => git(cwd, a, { tolerar: true });
  const escribir = (rel, txt, base = repo) => writeFileSync(path.join(base, rel), txt);
  const correr = () => (a) => spawnSync(process.execPath, [AQUI, ...a], { cwd: repo, encoding: 'utf8' });
  const run = correr();
  try {
    spawnSync('mkdir', ['-p', path.join(repo, '_meta')]);
    g(repo, 'init', '-q', '-b', 'main');
    g(repo, 'config', 'user.email', 'prueba@example.com');
    g(repo, 'config', 'user.name', 'prueba');
    const fila = (id, f) => `| ${id} | A | objetivo | \`${f}\` | ejecutora | - | [PENDIENTE] |`;
    escribir('_meta/tablero-tandas.md', [
      '# Tablero', '', 'Plan: `plan.md`', 'Paradas: ninguna', '',
      '| Id | Bloque | Objetivo | Ficheros | Ejecuta | Depende de | Estado |',
      '|---|---|---|---|---|---|---|',
      fila('T01', 'a.txt'), fila('T02', 'b.txt'), fila('T03', 'c.txt'), fila('T05', 'e.txt'),
      fila('T06', 'f.txt'), fila('T07', 'g.txt'), fila('T08', 'h.txt'), fila('T09', '.cfg/a.json'), ''].join('\n'));
    spawnSync('mkdir', ['-p', path.join(repo, 'esp/a1/coordinacion')]);
    escribir('esp/a1/coordinacion/tablero-tandas.md', [
      '# Tablero', '', 'Plan: `plan.md`', 'Paradas: ninguna', '',
      '| Id | Bloque | Objetivo | Ficheros | Ejecuta | Depende de | Estado |',
      '|---|---|---|---|---|---|---|',
      fila('T04', 'd.txt'), ''].join('\n'));
    escribir('esp/a1/d.txt', 'd\n'); escribir('e.txt', 'e\n');
    escribir('a.txt', 'a\n'); escribir('b.txt', 'b\n'); escribir('c.txt', 'c\n');
    escribir('f.txt', 'f\n'); escribir('g.txt', 'g\n'); escribir('h.txt', 'h\n'); escribir('o.txt', 'o\n');
    // fichero versionado a la fuerza dentro de una carpeta ignorada (caso 9)
    spawnSync('mkdir', ['-p', path.join(repo, '.cfg')]);
    escribir('.gitignore', '.cfg/\n'); escribir('.cfg/a.json', '{}\n');
    g(repo, 'add', '.'); g(repo, 'add', '-f', '--', '.cfg/a.json'); g(repo, 'commit', '-q', '-m', 'inicial');
    const nuevoWt = (n) => {
      const p = path.join(dir, `wt-${n}`);
      g(repo, 'worktree', 'add', '-q', '-b', `rama-${n}`, p);
      return p;
    };
    const wt1 = nuevoWt('1'), wt2 = nuevoWt('2'), wt3 = nuevoWt('3'), wt4 = nuevoWt('4'), wt5 = nuevoWt('5');

    // 1. integracion buena
    escribir('a.txt', 'a cambiado\n', wt1);
    let r = run(['--integrar', 'T01', '--worktree', wt1, '--mensaje', 'prueba']);
    const tab = readFileSync(path.join(repo, '_meta/tablero-tandas.md'), 'utf8');
    caso('integracion buena',
      r.status === 0 && readFileSync(path.join(repo, 'a.txt'), 'utf8') === 'a cambiado\n'
      && /\| T01 .*\[HECHA\] \|/.test(tab) && !existsSync(wt1)
      && !g(repo, 'rev-parse', '--verify', 'rama-1').ok && g(repo, 'status', '--porcelain').out === '',
      `rc=${r.status} ${r.stderr}`);

    // 2. fichero fuera de la tanda
    escribir('b.txt', 'b cambiado\n', wt2); escribir('intruso.txt', 'x\n', wt2);
    const h2 = g(repo, 'rev-parse', 'HEAD').out;
    r = run(['--integrar', 'T02', '--worktree', wt2]);
    caso('fichero fuera de la tanda: salida 4 y nada tocado',
      r.status === 4 && existsSync(wt2) && g(repo, 'rev-parse', 'HEAD').out === h2
      && g(repo, 'status', '--porcelain').out === ''
      && readFileSync(path.join(repo, 'b.txt'), 'utf8') === 'b\n'
      && g(wt2, 'status', '--porcelain').out.includes('intruso.txt'),
      `rc=${r.status} ${r.stderr}`);

    // 3. conflicto
    escribir('c.txt', 'c en worktree\n', wt3);
    escribir('c.txt', 'c en principal\n');
    g(repo, 'commit', '-q', '-m', 'c en principal', '--', 'c.txt');
    const h3 = g(repo, 'rev-parse', 'HEAD').out;
    r = run(['--integrar', 'T03', '--worktree', wt3]);
    caso('conflicto: salida 4, cherry-pick abortado, worktree intacto',
      r.status === 4 && existsSync(wt3) && g(repo, 'rev-parse', 'HEAD').out === h3
      && g(repo, 'status', '--porcelain').out === ''
      && !existsSync(path.join(repo, '.git', 'CHERRY_PICK_HEAD'))
      && g(repo, 'rev-parse', '--verify', 'rama-3').ok,
      `rc=${r.status} ${r.stderr}`);

    // 4. desde un asunto
    const tabRaiz = () => readFileSync(path.join(repo, '_meta/tablero-tandas.md'), 'utf8');
    const tabRaiz4 = tabRaiz();
    escribir('esp/a1/d.txt', 'd cambiado\n', wt4);
    r = spawnSync(process.execPath, [AQUI, '--integrar', 'T04', '--worktree', wt4], { cwd: path.join(repo, 'esp/a1'), encoding: 'utf8' });
    caso('desde un asunto: rutas de la celda relativas a su carpeta',
      r.status === 0 && readFileSync(path.join(repo, 'esp/a1/d.txt'), 'utf8') === 'd cambiado\n'
      && /\| T04 .*\[HECHA\] \|/.test(readFileSync(path.join(repo, 'esp/a1/coordinacion/tablero-tandas.md'), 'utf8'))
      && tabRaiz() === tabRaiz4 && g(repo, 'status', '--porcelain').out === '',
      `rc=${r.status} ${r.stderr}`);

    // 5. opcion mal escrita
    escribir('e.txt', 'e cambiado\n', wt5);
    const h5 = g(repo, 'rev-parse', 'HEAD').out;
    r = run(['--integrar', 'T05', '--worktree', wt5, '--mensjae', 'x']);
    caso('opcion mal escrita: salida 2 y nada tocado',
      r.status === 2 && g(repo, 'rev-parse', 'HEAD').out === h5
      && g(repo, 'status', '--porcelain').out === '' && existsSync(wt5),
      `rc=${r.status} ${r.stderr}`);

    // 6. cierre en serie bueno: solo lo de la tanda, y lo de otra sesion (ya en la foto) se queda sin commitear
    const foto = path.join(dir, 'foto.txt');
    escribir('o.txt', 'o de otra sesion\n');
    r = run(['--foto', foto]);
    const rFoto = r.status;
    escribir('f.txt', 'f cambiado\n');
    const h6 = g(repo, 'rev-parse', 'HEAD').out;
    r = run(['--cerrar', 'T06', '--foto', foto, '--mensaje', 'cierre']);
    caso('cierre en serie bueno: commit solo con la tanda y el tablero',
      rFoto === 0 && r.status === 0 && g(repo, 'rev-parse', 'HEAD').out !== h6
      && g(repo, 'log', '-1', '--format=%s').out === 'T06 cierre'
      && g(repo, 'show', '--name-only', '--format=', 'HEAD').out.split('\n').sort().join(',') === '_meta/tablero-tandas.md,f.txt'
      && /\| T06 .*\[HECHA\] \|/.test(tabRaiz())
      && g(repo, 'status', '--porcelain').out === 'M o.txt',
      `rc=${r.status} ${r.stderr}`);

    // 7. cierre con un fichero de mas: salida 4, sin commit y sin tocar nada
    r = run(['--foto', foto]);
    escribir('g.txt', 'g cambiado\n'); escribir('intruso2.txt', 'x\n');
    const h7 = g(repo, 'rev-parse', 'HEAD').out;
    const tab7 = tabRaiz();
    r = run(['--cerrar', 'T07', '--foto', foto, '--mensaje', 'cierre']);
    caso('cierre con un fichero de mas: salida 4, sin commit y tablero intacto',
      r.status === 4 && g(repo, 'rev-parse', 'HEAD').out === h7 && tabRaiz() === tab7
      && /intruso2\.txt/.test(r.stderr) && g(repo, 'status', '--porcelain').out.includes('g.txt'),
      `rc=${r.status} ${r.stderr}`);

    // 8. cierre en serie de una tanda que borra con git rm (borrado ya preparado en el index)
    g(repo, 'checkout', '-q', '--', 'g.txt'); g(repo, 'clean', '-fdq', '--', 'intruso2.txt');
    r = run(['--foto', foto]);
    g(repo, 'rm', '-q', 'h.txt');
    r = run(['--cerrar', 'T08', '--foto', foto, '--mensaje', 'borrado']);
    caso('cierre en serie con borrado hecho con git rm: commit con el borrado y fila en HECHA',
      r.status === 0 && g(repo, 'log', '-1', '--format=%s').out === 'T08 borrado'
      && g(repo, 'show', '--name-status', '--format=', 'HEAD').out.split('\n').sort().join(',') === 'D\th.txt,M\t_meta/tablero-tandas.md'
      && /\| T08 .*\[HECHA\] \|/.test(tabRaiz()) && !existsSync(path.join(repo, 'h.txt')),
      `rc=${r.status} ${r.stderr}`);

    // 9. cierre en serie de un fichero versionado dentro de una carpeta ignorada
    r = run(['--foto', foto]);
    escribir('.cfg/a.json', '{"x":1}\n');
    r = run(['--cerrar', 'T09', '--foto', foto, '--mensaje', 'ignorada']);
    caso('cierre en serie con fichero versionado dentro de carpeta ignorada: commit y fila en HECHA',
      r.status === 0 && g(repo, 'log', '-1', '--format=%s').out === 'T09 ignorada'
      && g(repo, 'show', '--name-only', '--format=', 'HEAD').out.split('\n').sort().join(',') === '.cfg/a.json,_meta/tablero-tandas.md'
      && /\| T09 .*\[HECHA\] \|/.test(tabRaiz()),
      `rc=${r.status} ${r.stderr}`);
  } catch (e) {
    console.log(`[FALLA] error en la prueba: ${e.message}`); fallos++;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  if (fallos) throw new Salida(1, `${fallos} casos en rojo`);
}

function main() {
  const args = process.argv.slice(2);
  const modo = args[0];
  if (modo === '--ayuda') { console.log(AYUDA); return; }
  if (modo === '--integrar') return integrar(args);
  if (modo === '--foto') return foto(args);
  if (modo === '--cerrar') return cerrar(args);
  if (modo === '--listar') return listar(args);
  if (modo === '--prueba') return prueba(args);
  throw new Salida(2, AYUDA);
}

try { main(); } catch (e) {
  if (e instanceof Salida) { console.error(e.message); process.exit(e.codigo); }
  console.error(e && e.message ? e.message : String(e)); process.exit(1);
}
