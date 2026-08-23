#!/usr/bin/env node
// Generador y verificador de los indices de doctrinas.
//
//   node _meta/generar-indice-doctrinas.mjs            -> VERIFICA (sale 1 si algo difiere)
//   node _meta/generar-indice-doctrinas.mjs --escribir -> REGENERA los indices desde las fichas
//   node _meta/generar-indice-doctrinas.mjs --extraer  -> MIGRACION, una sola vez: mueve la
//                                                         descripcion que hoy vive en el indice
//                                                         al frontmatter de su ficha
//
// POR QUE EXISTE. El par indice-ficha derivaba en silencio: se corregia la ficha y su resumen
// del indice seguia describiendo la version anterior, con las dos redacciones plausibles por
// separado y nadie capaz de notarlo leyendo. Paso mas de una vez, y una de ellas la
// desactualizacion estaba en dos sitios a la vez. La regla en prosa -- "si cambias una ficha,
// actualiza su entrada del indice en el mismo commit" -- depende de que alguien se acuerde, y
// lo que depende de acordarse no es una regla.
//
// COMO LO RESUELVE. El resumen pasa a vivir en UN solo sitio, el `index_summary` del
// frontmatter de la ficha, y el indice pasa a ser DERIVADO: su linea se rellena desde ahi. El
// esqueleto del indice -- sus secciones tematicas, el orden y el titulo de cada entrada -- sigue
// siendo suyo y se escribe a mano, porque eso es criterio editorial y no un dato de la ficha.
// Lo que se genera es solo el texto que venia detras del guion largo.
//
// El verificador lo llama en modo verificacion, asi que una ficha corregida sin su resumen
// deja el kit en ROJO en vez de dejar una mentira suelta.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const INDICES = [
  'general/comun/doctrinas/MEMORY-doctrinas-index.md',
  'general/comun/packs/codigo/doctrinas/MEMORY-doctrinas-index-codigo.md',
];
const MODO = process.argv.includes('--escribir') ? 'escribir'
  : process.argv.includes('--extraer') ? 'extraer' : 'verificar';

// Una entrada del indice: "- [Titulo](fichero.md) — resumen"
const ENTRADA = /^(- \[[^\]]+\]\((\.\.\/)*([A-Za-z0-9_./-]+\.md)\) — )(.*)$/;

// Lee `index_summary` del frontmatter. Se guarda como bloque plegado (`>-`) porque el resumen
// lleva comillas, dos puntos y comillas invertidas: en bloque no hay que escapar nada.
function leerResumen(txt) {
  const fm = txt.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return null;
  const plegado = fm[1].match(/^index_summary:\s*>-\s*\n((?:[ \t]+.*\n?)+)/m);
  if (plegado) return plegado[1].split('\n').map((l) => l.trim()).filter(Boolean).join(' ');
  const plano = fm[1].match(/^index_summary:[ \t]+(.*)$/m);
  return plano ? plano[1].trim() : null;
}

function escribirResumen(txt, resumen) {
  const fm = txt.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return null;
  let cuerpo = fm[1].replace(/^index_summary:\s*>-\s*\n(?:[ \t]+.*\n?)+/m, '').replace(/^index_summary:[ \t]+.*$\n?/m, '');
  cuerpo = cuerpo.replace(/\n+$/, '');
  return txt.replace(fm[0], `---\n${cuerpo}\nindex_summary: >-\n  ${resumen}\n---`);
}

const problemas = [];
let tocados = 0;

for (const rel of INDICES) {
  const rutaIndice = join(RAIZ, rel);
  if (!existsSync(rutaIndice)) continue;
  const original = readFileSync(rutaIndice, 'utf8');
  const salida = [];

  for (const linea of original.split('\n')) {
    const m = linea.match(ENTRADA);
    if (!m) { salida.push(linea); continue; }
    const ficha = resolve(dirname(rutaIndice), m[3]);
    if (!existsSync(ficha)) { salida.push(linea); continue; }
    const txtFicha = readFileSync(ficha, 'utf8');

    if (MODO === 'extraer') {
      const nuevo = escribirResumen(txtFicha, m[4]);
      if (nuevo && nuevo !== txtFicha) { writeFileSync(ficha, nuevo); tocados++; }
      salida.push(linea);
      continue;
    }

    const resumen = leerResumen(txtFicha);
    if (resumen === null) {
      problemas.push(`${m[3]} :: no declara "index_summary" en su frontmatter, asi que su linea del indice no tiene fuente`);
      salida.push(linea);
      continue;
    }
    salida.push(m[1] + resumen);
    if (resumen !== m[4]) {
      problemas.push(`${rel} :: la entrada de ${m[3]} NO coincide con el "index_summary" de su ficha (manda la ficha)`);
    }
  }

  if (MODO === 'escribir') {
    const nuevo = salida.join('\n');
    if (nuevo !== original) { writeFileSync(rutaIndice, nuevo); tocados++; }
  }
}

if (MODO === 'extraer') {
  console.log(`EXTRAIDO: ${tocados} ficha(s) con su "index_summary" escrito desde el indice.`);
  process.exit(0);
}
if (MODO === 'escribir') {
  console.log(`REGENERADO: ${tocados} indice(s) reescrito(s) desde las fichas.`);
  process.exit(0);
}
if (!problemas.length) {
  console.log('INDICES: en verde — cada entrada coincide con el "index_summary" de su ficha.');
  process.exit(0);
}
console.log(`INDICES: ROJO — ${problemas.length} desajuste(s)\n`);
for (const p of problemas) console.log('  ' + p);
console.log('\n  Arreglo: corrige el "index_summary" de la ficha (es la fuente) y luego\n  `node _meta/generar-indice-doctrinas.mjs --escribir`.');
process.exit(1);
