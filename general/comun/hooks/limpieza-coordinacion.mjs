#!/usr/bin/env node
// general/comun/hooks/limpieza-coordinacion.mjs
//
// Hook SessionStart de higiene de coordinación (doctrina convencion_organizacion_carpeta_trabajo).
// Al arrancar/reanudar una sesión de coordinación:
//   1. AUTO-BORRA los handoffs y buffers `tmp-otros-actual.md` que estén GITIGNORED y superados
//      (no son el más reciente de su serie y su fecha no es de hoy) → cero impacto en git.
//   2. AVISA por stdout (que Claude recibe como contexto) de los prompts/briefs TRACKEADOS ya
//      cumplidos, para que el coordinador los quite con `git rm` (con criterio: puede haber en vuelo).
//
// Nunca borra nada trackeado. Siempre termina con exit 0 (jamás rompe el arranque).
// Modo prueba: LIMPIEZA_DRY_RUN=1 → reporta lo que borraría, sin borrar.
//
// Se referencia desde el `settings.json` de perfil coordinador:
//   contenedor: node ${CLAUDE_PROJECT_DIR}/../../general/comun/hooks/limpieza-coordinacion.mjs
//   raíz:       node ${CLAUDE_PROJECT_DIR}/general/comun/hooks/limpieza-coordinacion.mjs

import { readdirSync, statSync, rmSync, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';

const DRY = process.env.LIMPIEZA_DRY_RUN === '1';
// Modo utilitario: imprime SOLO las rutas trackeadas obsoletas (una por línea), no borra nada.
// Uso para limpieza manual:  LIMPIEZA_LIST_TRACKED=1 node <script> | while IFS= read -r f; do git rm -- "$f"; done
const LIST = process.env.LIMPIEZA_LIST_TRACKED === '1';
const NO_DELETE = DRY || LIST;
const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const ZONES = ['coordinacion', 'estudios', '_meta'];
const SKIP_DIRS = new Set(['cerrados', 'node_modules', '.git', '.claude', 'docs', 'referencia']);

function todayStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function walk(dir, out) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(full, out);
    } else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) {
      out.push(full);
    }
  }
}

function isIgnored(file) {
  // git check-ignore: exit 0 = ignorado; exit 1 = no ignorado; error = asumir NO ignorado (seguro).
  try {
    execFileSync('git', ['check-ignore', '-q', file], { cwd: ROOT, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function mtimeOf(file) {
  try { return statSync(file).mtime; } catch { return new Date(0); }
}

// Clave de serie de un handoff: nombre sin la fecha final (para agrupar series paralelas).
function seriesKey(file) {
  const b = basename(file).replace(/\.md$/i, '');
  const stripped = b.replace(/[-_]?\d{4}-\d{2}-\d{2}.*$/, '');
  return dirname(file) + '::' + (stripped || b);
}

function main() {
  const files = [];
  for (const z of ZONES) walk(join(ROOT, z), files);
  if (files.length === 0) return;

  const today = todayStr();
  const deleted = [];
  const surfaced = [];

  // --- 1. Handoffs + tmp gitignored superados → auto-borrar ---
  const handoffs = files.filter((f) => /^handoff[-_]/i.test(basename(f)));
  const groups = new Map();
  for (const f of handoffs) {
    const k = seriesKey(f);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(f);
  }
  for (const [, group] of groups) {
    group.sort((a, b) => mtimeOf(b) - mtimeOf(a)); // más reciente primero
    const newest = group[0];
    for (const f of group) {
      if (f === newest) continue;                              // conserva el vivo de la serie
      const st = statSync(f);
      if (st.mtime.toISOString().slice(0, 10) === today) continue; // conserva lo de hoy
      if (!isIgnored(f)) { surfaced.push([f, 'handoff TRACKEADO (revisar)']); continue; }
      if (!NO_DELETE) { try { rmSync(f); } catch { continue; } }
      deleted.push(f);
    }
  }
  for (const f of files.filter((x) => basename(x).toLowerCase() === 'tmp-otros-actual.md')) {
    const st = statSync(f);
    if (st.mtime.toISOString().slice(0, 10) === today) continue;
    if (!isIgnored(f)) continue;
    if (!NO_DELETE) { try { rmSync(f); } catch { continue; } }
    deleted.push(f);
  }

  // --- 2. Prompts + briefs-con-informe trackeados y no-de-hoy → avisar (no borrar) ---
  for (const f of files) {
    const b = basename(f);
    const st = statSync(f);
    const isToday = st.mtime.toISOString().slice(0, 10) === today;
    if (isToday) continue;
    if (/^prompt/i.test(b) && f.includes(`${'coordinacion'}`)) {
      if (isIgnored(f)) continue; // solo trackeados
      surfaced.push([f, 'prompt ejecutado (git rm si ya cumplido)']);
    } else if (/brief/i.test(b) && !/-informe\.md$/i.test(b)) {
      const informe = f.replace(/\.md$/i, '-informe.md');
      if (existsSync(informe) && !isIgnored(f)) {
        surfaced.push([f, 'brief ya con informe (git rm)']);
      }
    }
  }

  // Modo lista: solo rutas trackeadas obsoletas, sin decoración (para `git rm`).
  if (LIST) {
    for (const [f] of surfaced) process.stdout.write(f + '\n');
    return;
  }

  // --- salida (stdout → contexto de Claude) ---
  const rel = (f) => f.startsWith(ROOT) ? f.slice(ROOT.length + 1).replace(/\\/g, '/') : f;
  const lines = [];
  if (deleted.length) {
    lines.push(`[HIGIENE] Coordinación: ${DRY ? '[DRY-RUN] borraría' : 'borrados'} ${deleted.length} handoff/buffer superado(s) (gitignored, cero impacto git):`);
    for (const f of deleted) lines.push(`  - ${rel(f)}`);
  }
  if (surfaced.length) {
    lines.push(`[AVISO] Higiene de coordinación: ${surfaced.length} fichero(s) trackeado(s) probablemente obsoleto(s). Revísalos y quita con \`git rm\` los ya cumplidos (git conserva el histórico); CONSERVA los que sigan en vuelo. Doctrina: convencion_organizacion_carpeta_trabajo.`);
    for (const [f, why] of surfaced) lines.push(`  - ${rel(f)}  (${why})`);
  }
  if (lines.length) process.stdout.write(lines.join('\n') + '\n');
}

// No usar process.exit(): trunca el buffer de stdout (Node/Windows con pipe) y se
// perdería el aviso. Salida natural con exitCode 0 → drena stdout antes de terminar.
try { main(); } catch { /* nunca romper el arranque */ }
process.exitCode = 0;
