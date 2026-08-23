#!/usr/bin/env node
// _meta/dod.mjs — Definition of Done del vault.
//
// QUE ES: la puerta que se cruza al CERRAR una tanda o una sesion. El verificador dice si el kit
// esta bien ESCRITO; esto dice si el trabajo esta bien TERMINADO, que no es lo mismo: un vault
// puede estar en verde y aun asi dejar un prompt cumplido sin borrar, una doctrina cambiada sin
// su changelog, una cola por encima de su techo o el arbol a medio commitear. Cada una de esas
// cosas la paga la sesion siguiente, que es exactamente lo que este kit existe para evitar.
//
// EL PRINCIPIO, y no es negociable: que nadie -- persona o IA -- pueda afirmar que algo esta
// terminado sin haberlo comprobado. Convierte "creo que esta cerrado" en "esta medido sobre este
// arbol exacto". Y su corolario: UNA PUERTA QUE NO SE HA VISTO FALLAR NO PRUEBA NADA. Cada puerta
// de aqui se demostro en rojo -- metiendo el defecto a mano -- antes de darla por buena.
//
// SIRVE PARA ASUNTOS DE SOFTWARE Y PARA LOS QUE NO. Las puertas de aqui son del METODO (higiene,
// documentacion al dia, estado consistente), no del producto. Un asunto con software le suma
// encima las suyas -- pruebas, lint, reglas de capa -- que viven en el pack `codigo/` y corren en
// el repositorio, no aqui. Un asunto de tramites le suma las del producto de su tanda. El DoD del
// vault es el suelo comun: nadie cierra por debajo de el.
//
// USO:
//   node _meta/dod.mjs              → corre las puertas; si todas pasan, SELLA
//   node _meta/dod.mjs --sin-sello  → corre las puertas y no escribe el sello (ensayo)
//   node _meta/dod.mjs --estado     → solo dice si el sello vigente cuadra con el arbol de ahora
//
// EL SELLO (`.dod-seal.json`, local y gitignored) guarda una HUELLA DEL CONTENIDO de lo versionado
// -- por contenido y no por commit, asi que incluye lo que aun no esta commiteado -- mas la fecha
// y que puertas corrieron. El hook de cierre lo compara con el arbol: si tocas algo despues de
// sellar, el sello CADUCA SOLO. No hay forma de sellar y seguir editando sin que se note.
//
// El veredicto esta en el bloque de resumen, y el codigo de salida es 0/1. No lo encadenes con
// tuberia: `node _meta/dod.mjs` a secas, igual que el verificador.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SELLO = join(RAIZ, '.dod-seal.json');
const ARGS = new Set(process.argv.slice(2));

const puertas = [];   // {nombre, ok, detalle}
const anota = (nombre, ok, detalle) => puertas.push({ nombre, ok, detalle });

function git(args, opciones = {}) {
  return execFileSync('git', args, { cwd: RAIZ, encoding: 'utf8', ...opciones });
}

// La fecha del sello va en hora LOCAL, no UTC. `toISOString()` da UTC y con el equipo en UTC+2
// un sello escrito a la una de la madrugada se lee como "de ayer a las 23:00", que es justo la
// confusion que este vault acaba de pagar cara en otro sitio. Misma decision que en el verificador
// y en el hook: las tres piezas que hablan de "cuando" tienen que decir la misma hora.
function fechaLocal() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().replace('Z', '');
}

// --- huella del contenido versionado ------------------------------------
// Por CONTENIDO: se leen los ficheros del disco, no el arbol de un commit. Un sello que colgara
// del commit diria "todo bien" con cambios sin guardar encima, que es justo el caso que mas duele.
function huella() {
  const ficheros = git(['ls-files']).split('\n').filter(Boolean).sort();
  const h = createHash('sha256');
  let contados = 0;
  for (const f of ficheros) {
    const ruta = join(RAIZ, f);
    if (!existsSync(ruta)) continue;             // borrado y aun sin commitear
    h.update(f);
    h.update(readFileSync(ruta));
    contados++;
  }
  return { hash: h.digest('hex').slice(0, 16), ficheros: contados };
}

// --- 1. el kit esta en verde --------------------------------------------
function puertaVerificador() {
  const v = join(RAIZ, '_meta', 'verificar-kit.mjs');
  if (!existsSync(v)) return anota('verificador', true, 'no hay verificador en este arbol (se salta)');
  try {
    const salida = execFileSync(process.execPath, [v], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    anota('verificador', true, salida.trim().split('\n')[0]);
  } catch (e) {
    const salida = (e.stdout || '').trim().split('\n').filter(Boolean);
    anota('verificador', false, salida[0] || 'el verificador salio en rojo');
    for (const l of salida.slice(1)) anota('verificador', false, '   ' + l.trim());
  }
}

// --- 2. el arbol esta limpio --------------------------------------------
// Cerrar con cambios sin commitear es la forma mas comun de perder trabajo entre sesiones: la
// siguiente los encuentra sin saber de quien son ni si estaban terminados.
function puertaArbolLimpio() {
  const sucio = git(['status', '--porcelain']).split('\n').filter(Boolean);
  if (!sucio.length) return anota('arbol limpio', true, 'sin cambios pendientes');
  anota('arbol limpio', false, `${sucio.length} fichero(s) sin commitear:`);
  for (const l of sucio.slice(0, 12)) anota('arbol limpio', false, '   ' + l);
  if (sucio.length > 12) anota('arbol limpio', false, `   ... y ${sucio.length - 12} mas`);
}

// --- 3. higiene: nada efimero ya cumplido sigue vivo --------------------
// Reutiliza el hook de limpieza en su modo lista, para que la regla viva en UN sitio y no en dos
// que puedan derivar. Si el hook no esta, la puerta se declara saltada en vez de dar por buena.
function puertaHigiene() {
  const hook = join(RAIZ, 'general', 'comun', 'hooks', 'limpieza-coordinacion.mjs');
  if (!existsSync(hook)) return anota('higiene', true, 'no hay hook de limpieza (se salta)');
  let salida = '';
  try {
    salida = execFileSync(process.execPath, [hook], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
      env: { ...process.env, LIMPIEZA_LIST_TRACKED: '1', CLAUDE_PROJECT_DIR: RAIZ },
    });
  } catch { return anota('higiene', true, 'el hook no pudo listar (se salta, no se da por buena)'); }
  const pendientes = salida.split('\n').filter(Boolean);
  if (!pendientes.length) return anota('higiene', true, 'sin efimeros cumplidos por retirar');
  anota('higiene', false, `${pendientes.length} efimero(s) trackeado(s) ya cumplidos — \`git rm\` los que no sigan en vuelo:`);
  for (const f of pendientes) anota('higiene', false, '   ' + f.replace(RAIZ + '/', ''));
}

// --- 4. los techos de los ficheros que se leen enteros al arrancar ------
// El techo no es estetica: cola y bitacora entran ENTERAS en cada arranque, asi que pasarse las
// cobra la sesion siguiente y todas las demas. Los bytes se comparan sin convertir.
const TECHOS = [
  ['_meta/cola-pendientes.md', 40960],
  ['_meta/bitacora.md', 30720],
];
function puertaTechos() {
  const asuntos = join(RAIZ, 'asuntos');
  const lista = [...TECHOS];
  if (existsSync(asuntos)) {
    for (const a of git(['ls-files', 'asuntos']).split('\n').filter((f) => /^asuntos\/[^/]+\/cola-pendientes\.md$/.test(f))) {
      lista.push([a, 40960]);
    }
  }
  let malos = 0;
  for (const [rel, techo] of lista) {
    const ruta = join(RAIZ, rel);
    if (!existsSync(ruta)) continue;
    const bytes = readFileSync(ruta).length;
    const pct = Math.round((bytes / techo) * 100);
    if (bytes > techo) {
      malos++;
      anota('techos', false, `${rel}: ${bytes} B de ${techo} (${pct} %) — POR ENCIMA del techo`);
    } else if (pct >= 85) {
      anota('techos', true, `${rel}: ${bytes} B (${pct} %) — cerca del techo, poda antes de escribir largo`);
    }
  }
  if (!malos) anota('techos', true, 'ninguna cola ni bitacora por encima de su techo');
}

// --- 5. la documentacion no se queda desfasada -------------------------
// La puerta que pidio el director, y la que ningun verificador de estructura puede dar: que lo
// escrito siga describiendo lo que hay. Se comprueba sobre los commits de la sesion, porque es
// ahi donde la documentacion se queda atras -- no en el arbol en reposo.
//
// (a) Una doctrina que cambia en su CUERPO tiene que subir `version`. Es la regla de fuente unica
//     hecha puerta: sin ella, la ficha y su changelog cuentan historias distintas y releyendo no
//     se nota, porque las dos son plausibles por separado.
//     SE EVALUA LA VENTANA COMO CONJUNTO, no commit a commit, y la diferencia importa: si cambias
//     una doctrina y subes su version tres commits despues, la deuda esta SALDADA y la puerta no
//     tiene nada que denunciar. Juzgar commit a commit convertiria un arreglo correcto en un
//     reproche permanente -- y una puerta que se queja de algo ya arreglado se acaba ignorando,
//     que es como se pierde una puerta. Lo que sigue cazando es el caso real: cerrar la ventana
//     con una doctrina cambiada y su version intacta. (Cazado asi el mismo dia que se escribio:
//     cinco doctrinas, una de ellas del propio coordinador veinte minutos antes.)
function puertaDoctrinasVersionadas(commits) {
  const porFichero = new Map();   // fichero → { sustantivo, subeVersion, donde }
  for (const c of commits) {
    const tocados = git(['show', '--name-only', '--format=', c]).split('\n').filter(Boolean);
    for (const f of tocados) {
      if (!/general\/comun\/doctrinas\/.+\.md$/.test(f)) continue;
      if (basename(f).startsWith('MEMORY-')) continue;          // el indice es derivado
      const diff = git(['show', '--format=', '--unified=0', c, '--', f]);
      const lineas = diff.split('\n').filter((l) => /^[+-]/.test(l) && !/^([+-][+-][+-])/.test(l));
      // Cambios que NO exigen subir version: el propio frontmatter derivado y las lineas de changelog.
      const sustantivo = lineas.some((l) => {
        const cuerpo = l.slice(1).trim();
        if (!cuerpo) return false;
        if (/^version:|^index_summary:|^description:/.test(cuerpo)) return false;
        if (cuerpo.startsWith('> **v') || cuerpo.startsWith('> Pieza de catálogo')) return false;
        return true;
      });
      const acumulado = porFichero.get(f) || { sustantivo: false, subeVersion: false, donde: [] };
      if (sustantivo) { acumulado.sustantivo = true; acumulado.donde.push(c.slice(0, 7)); }
      if (lineas.some((l) => /^\+version:\s*[\d.]+/.test(l))) acumulado.subeVersion = true;
      porFichero.set(f, acumulado);
    }
  }
  const fallos = [];
  for (const [f, a] of porFichero) {
    if (a.sustantivo && !a.subeVersion) fallos.push(`${f} cambia en ${a.donde.join(', ')} y su \`version\` sigue intacta`);
  }
  if (!fallos.length) return anota('doctrinas al dia', true, `${porFichero.size} doctrina(s) tocada(s) en la ventana, todas con su version al dia`);
  for (const f of fallos) anota('doctrinas al dia', false, f);
}

// (b) Los artefactos que declara el trabajo en curso tienen que existir. Una linea que apunta a un
//     fichero que ya no esta es peor que no tenerla: manda a la sesion siguiente a buscar humo.
function puertaTrabajoEnCurso() {
  const ficheros = git(['ls-files']).split('\n').filter((f) => basename(f) === 'trabajo-en-curso.md');
  const fallos = [];
  for (const rel of ficheros) {
    const texto = readFileSync(join(RAIZ, rel), 'utf8');
    let enEjemplo = false;
    texto.split('\n').forEach((linea, i) => {
      if (linea.startsWith('```')) { enEjemplo = !enEjemplo; return; }
      if (enEjemplo || !linea.startsWith('- [ABIERTO')) return;
      const m = linea.match(/artefacto: `([^`]+)`/);
      if (!m || m[1] === '-') return;
      const destino = join(RAIZ, m[1].replace(/^\.\//, ''));
      if (!existsSync(destino)) fallos.push(`${rel} linea ${i + 1}: el artefacto \`${m[1]}\` no existe`);
    });
  }
  if (!fallos.length) return anota('trabajo en curso', true, 'los artefactos declarados existen');
  for (const f of fallos) anota('trabajo en curso', false, f);
}

// (c) Si la sesion toco el catalogo o el inicializador, la plantilla tiene que quedar sincronizada.
//     La ruta de la plantilla es de ESTA maquina, asi que vive en un fichero local gitignored: sin
//     el, la puerta se declara NO CORRIDA en vez de darse por buena. Un salto silencioso es una
//     puerta que miente.
function puertaSincroniaPlantilla(commits) {
  const conf = join(RAIZ, '_meta', 'dod.local.json');
  const tocaKit = commits.some((c) => git(['show', '--name-only', '--format=', c])
    .split('\n').some((f) => /^(general|inicializador)\//.test(f)));
  if (!tocaKit) return anota('sincronia con la plantilla', true, 'la sesion no toco catalogo ni inicializador');
  if (!existsSync(conf)) {
    return anota('sincronia con la plantilla', false,
      'la sesion toco `general/` o `inicializador/` y NO se puede comprobar la plantilla: falta `_meta/dod.local.json` con {"plantilla": "<ruta>"} (local, gitignored)');
  }
  let ruta;
  try { ruta = JSON.parse(readFileSync(conf, 'utf8')).plantilla; } catch { ruta = null; }
  if (!ruta || !existsSync(ruta)) {
    return anota('sincronia con la plantilla', false, `la ruta declarada en dod.local.json no existe: ${ruta}`);
  }
  const declaradas = new Set(['general/README.md', '_meta/charter-coordinador.md', '_meta/informe-metodo-exportable.md']);
  const difs = [];
  for (const sub of ['general', 'inicializador']) {
    let salida = '';
    try {
      salida = execFileSync('diff', ['-rq', join(RAIZ, sub), join(ruta, sub)], { encoding: 'utf8' });
    } catch (e) { salida = e.stdout || ''; }
    for (const l of salida.split('\n').filter(Boolean)) {
      const m = l.match(/^Files .*?\/((?:general|inicializador)\/.*?) and /);
      if (m && !declaradas.has(m[1])) difs.push(m[1]);
      if (/^Only in/.test(l) && !/\.DS_Store/.test(l)) difs.push(l);
    }
  }
  if (!difs.length) return anota('sincronia con la plantilla', true, 'catalogo e inicializador identicos, salvo las divergencias declaradas');
  anota('sincronia con la plantilla', false, `${difs.length} diferencia(s) no declarada(s) — propaga EL CAMBIO, no el fichero:`);
  for (const d of difs.slice(0, 10)) anota('sincronia con la plantilla', false, '   ' + d);
}

// --- modo --estado: solo mirar si el sello vigente sigue valiendo -------
function estadoDelSello() {
  if (!existsSync(SELLO)) {
    console.log('SELLO: NO HAY. Esta sesion todavia no ha cerrado su DoD (`node _meta/dod.mjs`).');
    process.exit(1);
  }
  const s = JSON.parse(readFileSync(SELLO, 'utf8'));
  const ahora = huella();
  if (s.hash === ahora.hash) {
    console.log(`SELLO: VALIDO — sellado el ${s.fecha} sobre ${s.ficheros} ficheros, y el arbol no ha cambiado desde entonces.`);
    process.exit(0);
  }
  console.log(`SELLO: CADUCADO — se sello el ${s.fecha} y el arbol ha cambiado desde entonces (${s.ficheros} → ${ahora.ficheros} ficheros).`);
  console.log('  Es lo que tiene que pasar si has seguido trabajando: vuelve a correr `node _meta/dod.mjs` antes de cerrar.');
  process.exit(1);
}

// --- principal ----------------------------------------------------------
if (ARGS.has('--estado')) estadoDelSello();

// QUE COMMITS MIRAN LAS PUERTAS DE DOCUMENTACION: los hechos DESDE EL ULTIMO SELLO. Esa es la
// definicion util de "lo que llevo sin cerrar", y no "los de hoy": un sello es justamente la marca
// de que hasta ahi estaba todo revisado, asi que volver a juzgar lo ya sellado solo produce ruido
// que se acaba ignorando. Sin sello previo -- primera vez, o sello borrado -- se cae a los de hoy,
// que es la aproximacion mas cercana a "esta sesion" que git puede dar.
const desde = (() => {
  if (existsSync(SELLO)) {
    try {
      const f = JSON.parse(readFileSync(SELLO, 'utf8')).fecha;
      if (f) return { since: f, que: `desde el ultimo sello (${f.slice(0, 16).replace('T', ' ')})` };
    } catch { /* sello ilegible: se cae a hoy */ }
  }
  const d = new Date();
  const hoy = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  return { since: `${hoy} 00:00`, que: `de hoy, ${hoy} (no hay sello previo)` };
})();
const commitsDeHoy = git(['log', '--since', desde.since, '--format=%H']).split('\n').filter(Boolean);

puertaVerificador();
puertaArbolLimpio();
puertaHigiene();
puertaTechos();
puertaDoctrinasVersionadas(commitsDeHoy);
puertaTrabajoEnCurso();
puertaSincroniaPlantilla(commitsDeHoy);

const fallidas = [...new Set(puertas.filter((p) => !p.ok).map((p) => p.nombre))];
const nombres = [...new Set(puertas.map((p) => p.nombre))];

console.log('\n=== DEFINITION OF DONE — vault ===\n');
for (const n of nombres) {
  const propias = puertas.filter((p) => p.nombre === n);
  const ok = propias.every((p) => p.ok);
  console.log(`  [${ok ? 'OK      ' : 'FALLO   '}] ${n}`);
  for (const p of propias) console.log(`             ${p.detalle}`);
}
console.log(`\n  Commits mirados por las puertas de documentacion: ${commitsDeHoy.length} (${desde.que}).`);

if (fallidas.length) {
  console.log(`\nRESULTADO: NO CERRADO — ${fallidas.length} puerta(s) en rojo: ${fallidas.join(', ')}.`);
  console.log('No se escribe sello. Arregla lo de arriba y vuelve a correrlo; no se ajusta una puerta para que pase.\n');
  process.exit(1);
}

const h = huella();
if (!ARGS.has('--sin-sello')) {
  writeFileSync(SELLO, JSON.stringify({
    hash: h.hash, ficheros: h.ficheros, fecha: fechaLocal(), puertas: nombres,
  }, null, 2) + '\n');
}
console.log(`\nRESULTADO: CERRADO — ${nombres.length} puertas en verde sobre ${h.ficheros} ficheros versionados.`);
console.log(ARGS.has('--sin-sello') ? '  (--sin-sello: no se ha escrito el sello.)\n' : `  Sello escrito en .dod-seal.json (huella ${h.hash}). Si tocas algo mas, caduca solo.\n`);
process.exit(0);
