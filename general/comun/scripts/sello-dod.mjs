// sello-dod.mjs: el sello del Definition of Done, POR AMBITO. Modulo comun, sin dependencias salvo
// `espacios.mjs`; lo importan `_meta/dod.mjs` (que lo escribe), el hook de arranque y `relevo.mjs`
// (que lo leen), para que haya UNA sola huella y los tres den el mismo veredicto.
//
// POR QUE POR AMBITO (E21): con un sello unico en la raiz, el cierre de un coordinador movia la
// ventana de los demas y cualquier commit ajeno caducaba el sello de todos. El caso que lo cazo:
// el sello de `homelab` (12:07) se escribio despues de `ec27d15` (12:03), que toco una doctrina del
// catalogo sin subir version; el DoD del general ya no vio ese commit en su ventana y la deuda
// paso sin que nadie la marcara. Ahora cada ambito tiene su sello, la huella mira solo los
// ficheros de su ambito y la ventana se cuenta por commit sellado, no por reloj.
//
// DONDE VIVE: el general en `_meta/dod-sello.local.json`; un asunto en
// `<espacio>/<asunto>/coordinacion/dod-sello.local.json`. Los ignora `**/*.local.json`.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { esDelAmbito, listarAsuntos } from './espacios.mjs';

// `ambito` es el objeto de `ambitoDe` de espacios.mjs: {tipo: 'general'|'asunto'|'invalido', ...}.
export function rutaSello(raiz, ambito) {
  if (ambito.tipo === 'general') return join(raiz, '_meta', 'dod-sello.local.json');
  if (ambito.tipo === 'asunto') return join(raiz, ambito.espacio, ambito.slug, 'coordinacion', 'dod-sello.local.json');
  return null;
}

// Misma huella de siempre (por CONTENIDO de disco; trackeados y nuevos sin ignorar), pero solo con
// los ficheros del ambito. Los ignorados quedan fuera a proposito: son estado de la copia.
export function huella(raiz, ambito) {
  const asuntos = listarAsuntos(raiz);
  const ficheros = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: raiz, encoding: 'utf8' })
    .split('\n').filter(Boolean).sort()
    .filter((f) => esDelAmbito(ambito, f, asuntos));
  const h = createHash('sha256');
  let contados = 0;
  for (const f of ficheros) {
    const ruta = join(raiz, f);
    if (!existsSync(ruta)) continue;             // borrado y aun sin commitear
    h.update(f);
    h.update(readFileSync(ruta));
    contados++;
  }
  return { hash: h.digest('hex').slice(0, 16), ficheros: contados };
}

export function leerSello(raiz, ambito) {
  const ruta = rutaSello(raiz, ambito);
  if (!ruta || !existsSync(ruta)) return null;
  try { return JSON.parse(readFileSync(ruta, 'utf8')); } catch { return { ilegible: true }; }
}

export function escribirSello(raiz, ambito, datos) {
  const ruta = rutaSello(raiz, ambito);
  if (!ruta) throw new Error('ambito invalido: no hay donde escribir el sello');
  mkdirSync(dirname(ruta), { recursive: true });
  writeFileSync(ruta, JSON.stringify(datos, null, 2) + '\n');
  return ruta;
}

// null si este arbol no usa DoD o no hay git; si no, {ok, por, sello}.
export function estadoSello(raiz, ambito) {
  if (!existsSync(join(raiz, '_meta', 'dod.mjs'))) return null;
  const s = leerSello(raiz, ambito);
  if (!s) return { ok: false, por: 'no hay sello: la sesion anterior cerro sin correr el DoD', sello: null };
  if (s.ilegible) return { ok: false, por: 'el sello esta ilegible', sello: s };
  let ahora;
  try { ahora = huella(raiz, ambito); } catch { return null; }   // sin git no hay nada que comparar
  const fecha = String(s.fecha).slice(0, 16).replace('T', ' ');
  if (ahora.hash === s.hash) return { ok: true, por: `sellado el ${fecha} sobre ${s.ficheros} ficheros`, sello: s };
  return { ok: false, por: `el sello es del ${fecha} y el arbol ha cambiado desde entonces (${s.ficheros} → ${ahora.ficheros} ficheros)`, sello: s };
}
