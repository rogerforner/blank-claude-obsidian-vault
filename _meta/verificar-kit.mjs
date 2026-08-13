#!/usr/bin/env node
// Verificador del kit. Autosuficiente: no depende de nada fuera de este vault.
//   node _meta/verificar-kit.mjs
// Sale con codigo 0 si todo esta en verde, 1 si hay hallazgos.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const hallazgos = [];
const nota = (regla, fichero, detalle) =>
  hallazgos.push({ regla, fichero: relative(RAIZ, fichero).replace(/\\/g, '/'), detalle });

// --- recoger ficheros ---------------------------------------------------
// repo/ (el repositorio de código de un asunto con perfil `asunto con software`, ver
// estructura_contenedor_asunto.md) es un árbol AJENO al kit: es el código de un asunto, con
// sus propias reglas (README con emojis, rutas de ejemplo, sin frontmatter de doctrina). El
// caso NORMAL es que el repositorio viva FUERA del vault (nada que caminar aquí); esta
// exclusión es la red de seguridad para el caso EXCEPCIONAL en que, declaradamente, queda
// anidado dentro del contenedor. El verificador comprueba el kit, no el código de un asunto,
// así que delimita su ámbito excluyéndolo igual que ya excluye .git/.obsidian/node_modules —
// esto NO es ajustar el verificador para que pase: es que esas reglas nunca le aplicaron a repo/.
const md = [];
const mjs = []; // scripts del kit (hooks, este mismo verificador): tambien son "lo escrito"
(function walk(p) {
  if (/[\\/](\.git|\.obsidian|node_modules|repo)$/.test(p)) return;
  for (const e of readdirSync(p)) {
    const f = join(p, e);
    if (statSync(f).isDirectory()) walk(f);
    else if (f.endsWith('.md')) md.push(f);
    else if (f.endsWith('.mjs')) mjs.push(f);
  }
})(RAIZ);

const esDoctrina = (f) => /[\\/]doctrinas[\\/]/.test(f) && !basename(f).startsWith('MEMORY-');
const esCore = (f) => esDoctrina(f) && !/[\\/]packs[\\/]/.test(f);

// --- 1. frontmatter completo en cada doctrina ---------------------------
for (const f of md.filter(esDoctrina)) {
  const t = readFileSync(f, 'utf8');
  if (!t.startsWith('---')) { nota('frontmatter', f, 'no empieza por frontmatter'); continue; }
  for (const clave of ['name', 'description', 'type', 'version'])
    if (!new RegExp(`^${clave}:`, 'm').test(t)) nota('frontmatter', f, `falta "${clave}"`);
  if (!/^> .*(Se \*\*lee\*\* desde el catálogo|Pieza de catálogo)/m.test(t))
    nota('footer', f, 'sin la linea de pie de catalogo');
}

// Un `[[wikilink]]` entre comillas es la PALABRA, no un enlace: se ignora.
const sinLiterales = (t) => t.replace(/`[^`\n]*`/g, '');
// Una remision explicita al pack es legitima (regla: se marca, no se prohibe).
const remiteAlPack = (linea) => /pack\s+`?codigo/i.test(linea);

// --- 2. todo wikilink resuelve a un fichero del kit ----------------------
const nombres = new Set(md.map((f) => basename(f, '.md')));
for (const f of md) {
  for (const m of sinLiterales(readFileSync(f, 'utf8')).matchAll(/\[\[([^\]|#]+)/g)) {
    const destino = m[1].trim();
    if (!nombres.has(destino)) nota('wikilink colgado', f, `[[${destino}]]`);
  }
}

// --- 3. el core no depende del pack SIN DECIRLO -------------------------
const delPack = new Set(md.filter((f) => /[\\/]packs[\\/]/.test(f)).map((f) => basename(f, '.md')));
for (const f of md.filter(esCore)) {
  readFileSync(f, 'utf8').split('\n').forEach((linea, i) => {
    if (remiteAlPack(linea)) return; // la remision marcada es legitima
    for (const m of sinLiterales(linea).matchAll(/\[\[([^\]|#]+)/g))
      if (delPack.has(m[1].trim()))
        nota('core depende del pack', f, `[[${m[1].trim()}]] sin marcar (linea ${i + 1})`);
  });
}

// --- 4. portabilidad: ni rutas de maquina ni nombres ajenos -------------
// Exige un SEGMENTO REAL despues de Users/home: "C:\Users\PD\..." es una fuga,
// pero "C:\Users\…" escrito como patron de busqueda es documentacion, no una ruta.
// Los .json de inicializador/ (perfiles de settings, p. ej. plantilla-settings-*.json) no son
// .md y sin esto la regla nunca los mira: una ruta de maquina colada en un perfil de permisos
// pasaria desapercibida. No es opcional (tanda repo-fuera, D6).
const jsonInicializador = [];
(function walkJson(p) {
  for (const e of readdirSync(p)) {
    const f = join(p, e);
    statSync(f).isDirectory() ? walkJson(f) : f.endsWith('.json') && jsonInicializador.push(f);
  }
})(join(RAIZ, 'inicializador'));

const SEG = '[A-Za-z0-9_.-]';
const RUTAS = new RegExp(`([A-Za-z]:\\\\{1,2}[Uu]sers\\\\{1,2}${SEG}|/home/${SEG}|/Users/${SEG})`);
for (const f of [...md, ...jsonInicializador, ...['.claude/settings.json', '.gitignore'].map((p) => join(RAIZ, p))]) {
  if (!existsSync(f)) continue;
  readFileSync(f, 'utf8').split('\n').forEach((l, i) => {
    if (RUTAS.test(l)) nota('ruta de maquina', f, `linea ${i + 1}`);
  });
}

// --- 5. sin emojis EN EL KIT (flechas, matematicos y arboles NO son emojis) -------
// AMBITO ACOTADO (2026-08-12, decision del director): la regla se exige donde el texto se lee
// muchas veces, lo heredan otras sesiones y viaja a otros vaults -- catalogo, plantillas y los
// ficheros de reglas e identidad de cualquier carpeta. En las ZONAS DE TRABAJO (cola, bitacora,
// estudios, coordinacion, docs de un asunto, informes de tanda) ya NO se mira: escribir emojis le
// sale natural al modelo y la reescritura para quitarlos costaba mas que el beneficio; ademas un
// emoji en un informe de tanda -- que no es el kit -- ponia el kit ENTERO en rojo.
// Los .mjs y .json del kit se miran SIEMPRE: el hook escribe directo al contexto del coordinador.
const REGLAS_E_IDENTIDAD = /^(CLAUDE|README|charter-coordinador|PRIMEROS-PASOS|MEMORY-.+)\.md$/;
const zonaDeEstiloEstricto = (f) => {
  const r = relative(RAIZ, f).replace(/\\/g, '/');
  return r.startsWith('general/') || r.startsWith('inicializador/') || REGLAS_E_IDENTIDAD.test(basename(f));
};
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu;
const FUNCIONALES = new Set(['\u{1F916}']); // va dentro de un patron de deteccion, no es decoracion
for (const f of [...md.filter(zonaDeEstiloEstricto), ...mjs, ...jsonInicializador]) {
  for (const m of readFileSync(f, 'utf8').matchAll(EMOJI))
    if (!FUNCIONALES.has(m[0])) nota('emoji', f, m[0]);
}

// --- 6. vocabulario: el core no habla de software -----------------------
const PROHIBIDAS = ['repositorio', 'repos', 'push', 'pull request', 'rama de desarrollo',
                    'typecheck', 'mutation', 'pnpm', 'Podman', 'Docker', 'GitHub'];
for (const f of md.filter(esCore)) {
  readFileSync(f, 'utf8').split('\n').forEach((linea, i) => {
    if (remiteAlPack(linea)) return; // dentro de una remision explicita, el termino es legitimo
    for (const p of PROHIBIDAS) {
      const re = new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (re.test(linea)) nota('vocabulario del core', f, `"${p}" en la linea ${i + 1}`);
    }
  });
}

// --- 7. cada indice de doctrinas cuadra con sus ficheros ----------------
// El par indice <-> ficha es fuente unica: una doctrina que no esta en su indice NO EXISTE para
// quien lee el catalogo, porque el arranque manda leer el indice y abrir solo lo que toque. Esto
// ha fallado dos veces (una doctrina fuera del indice durante meses; tres ficheros declarando un
// recuento inventado), y las dos veces el kit salio en verde: se comprueba por comando, no a ojo.
// Solo se miran las carpetas `doctrinas/` que tienen indice propio (`MEMORY-*.md`); una carpeta
// de doctrinas PROPIAS de un asunto, sin indice, no esta obligada a tenerlo.
for (const dir of [...new Set(md.filter(esDoctrina).map(dirname))]) {
  const entradas = readdirSync(dir).filter((e) => e.endsWith('.md'));
  const indices = entradas.filter((e) => e.startsWith('MEMORY-'));
  if (!indices.length) continue;
  const fichas = entradas.filter((e) => !e.startsWith('MEMORY-'));
  const enlazados = new Set();
  for (const i of indices)
    for (const m of readFileSync(join(dir, i), 'utf8').matchAll(/\]\(([^)\s]+\.md)\)/g))
      if (!m[1].includes('/')) enlazados.add(m[1]); // solo las del propio directorio
  for (const f of fichas)
    if (!enlazados.has(f))
      nota('doctrina fuera del indice', join(dir, f), `no la enlaza ${indices.join(' ni ')}`);
  for (const e of enlazados)
    if (!fichas.includes(e))
      nota('indice apunta a nada', join(dir, indices[0]), `${e} no existe en la carpeta`);
}

// --- 8. redacciones RETIRADAS que no deben sobrevivir a un cambio de politica ---
// Motivada por un caso real (2026-08-14): la politica del catalogo cambio el 2026-08-01 de
// "se instala por copia" a "se LEE", y la plantilla siguio diciendo lo viejo en su charter y en
// su README. Nadie lo vio porque el verificador miraba el vault, donde SI se habia corregido.
// El fallo de fondo no es de la plantilla: es que **subir la version de una doctrina no propaga
// nada**. Lo que se actualizo fue lo que algo comprueba; lo que no comprueba nadie, se quedo atras.
// Por eso: cuando una politica cambia, su redaccion vieja entra AQUI y pasa a ser un error duro.
// Ambito: la misma zona que el estilo estricto (catalogo, plantillas y ficheros de reglas), que es
// donde vive el metodo que viaja a otros vaults.
// DOS EXCEPCIONES, y las dos son necesarias: un changelog CITA la redaccion vieja a proposito
// ("antes decia X"), asi que se ignoran las lineas de cita (`>`) y lo que va entrecomillado.
const RETIRADAS = [
  { frase: 'se instala por copia', desde: '2026-08-01',
    motivo: 'el catalogo se LEE; no se copia al contenedor ni se hereda' },
  { frase: 'Haiku redacta los commits', desde: '2026-08-12',
    motivo: 'ningun mecanismo lo implementa, y cambiar de modelo cuesta un cache miss completo' },
];
const sinCitas = (l) => l.replace(/"[^"\n]*"/g, '').replace(/[«“][^»”\n]*[»”]/g, '');
for (const f of md.filter(zonaDeEstiloEstricto)) {
  readFileSync(f, 'utf8').split('\n').forEach((linea, i) => {
    if (/^\s*>/.test(linea)) return;              // pie de doctrina / bloque de cita: describe, no afirma
    const limpia = sinCitas(sinLiterales(linea)); // lo entrecomillado se esta citando, no diciendo
    for (const r of RETIRADAS)
      if (limpia.toLowerCase().includes(r.frase.toLowerCase()))
        nota('redaccion retirada', f, `"${r.frase}" (retirada el ${r.desde}: ${r.motivo}) en la linea ${i + 1}`);
  });
}

// --- resultado ----------------------------------------------------------
const revisados = `${md.length} markdown y ${mjs.length + jsonInicializador.length} script/config`;
if (!hallazgos.length) {
  console.log(`RESULTADO: VERDE — ${revisados} revisados, 0 hallazgos.`);
  process.exit(0);
}
console.log(`RESULTADO: ROJO — ${hallazgos.length} hallazgos\n`);
for (const h of hallazgos) console.log(`  [${h.regla}] ${h.fichero} :: ${h.detalle}`);
process.exit(1);
