#!/usr/bin/env node
// Verificador del kit. Autosuficiente: no depende de nada fuera de este vault.
//   node _meta/verificar-kit.mjs
// Sale con codigo 0 si todo esta en verde, 1 si hay hallazgos.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, basename, dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
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
  { frase: 'copia a memoria/', desde: '2026-08-01',
    motivo: 'es la misma politica retirada dicha con otras palabras: el catalogo se LEE y memoria/ es para lo propio del asunto' },
  { frase: 'Haiku redacta los commits', desde: '2026-08-12',
    motivo: 'ningun mecanismo lo implementa, y cambiar de modelo cuesta un cache miss completo' },
  { frase: 'subagentes son solo de lectura', desde: '2026-10-04',
    motivo: 'los subagentes ejecutan tandas (ciclo de tandas); los de solo lectura se nombran como tales' },
];
const sinCitas = (l) => l.replace(/"[^"\n]*"/g, '').replace(/[«“][^»”\n]*[»”]/g, '');
// El enfasis se quita ANTES de buscar la frase retirada. Sin esto, escribir `se **instala por
// copia**` se escapa: la cadena real lleva asteriscos en medio y deja de contener la frase. Y el
// enfasis es justo lo que se le pone a una afirmacion importante, o sea que la regla fallaba
// precisamente en el caso que mas importa. Cazado el 2026-08-27 al acotar la excepcion de arriba:
// salto la copia del pack -- escrita en llano -- y NO la del catalogo, escrita en negrita.
const sinEnfasis = (l) => l.replace(/[*_`]/g, '');
for (const f of md.filter(zonaDeEstiloEstricto)) {
  readFileSync(f, 'utf8').split('\n').forEach((linea, i) => {
    // La excepcion es SOLO para el pie y el changelog, que son REGISTRO: alli una redaccion
    // retirada es historia y no se reescribe. Antes saltaba cualquier linea que empezara por `>`
    // -- toda cita en bloque -- y por ahi se colo durante semanas la cabecera del indice del
    // catalogo, que es una cita en bloque AFIRMANDO politica vigente: decia "se instala por copia"
    // contra el `CLAUDE.md`, que dice que el catalogo se lee y no se copia. Lo cazo una tanda de
    // extraccion del metodo, no el verificador. Una excepcion mas ancha que su motivo es un agujero.
    if (/^\s*>\s*(\*\*v[\d.]|Pieza de catálogo|Adaptada al enfoque neutro)/.test(linea)) return;
    const limpia = sinEnfasis(sinCitas(sinLiterales(linea))); // lo entrecomillado se cita, no se dice
    for (const r of RETIRADAS)
      if (limpia.toLowerCase().includes(r.frase.toLowerCase()))
        nota('redaccion retirada', f, `"${r.frase}" (retirada el ${r.desde}: ${r.motivo}) en la linea ${i + 1}`);
  });
}

// --- 9. datos con CADUCIDAD declarada que ya venció ----------------------
// Sale del informe de continuidad (2026-08-23): el kit tenia varios datos con fecha de
// caducidad -- una ampliacion de limites, un precio introductorio, un plazo -- y ninguno
// se caia solo al vencer. El unico que se despacho a tiempo fue por casualidad, un dia
// tarde. Un dato que depende de que alguien mire el calendario NO es un dato vigilado.
// Sintaxis: `caduca: AAAA-MM-DD` en el frontmatter, o `[CADUCA AAAA-MM-DD]` en el cuerpo.
// El disparador NO es un planificador externo: es este verificador, que ya se ejecuta tras
// cualquier cambio del kit y ahora tambien al arrancar la sesion (hook de coordinacion).
// Fecha LOCAL, no UTC. `toISOString()` da UTC, y con el equipo en UTC+2 eso significa que entre
// medianoche y las dos de la madrugada el verificador cree que sigue siendo ayer: cualquier cosa
// fechada hoy con el reloj local sale como "fecha futura". Cazado en vivo el 2026-08-24 a las
// 00:0x escribiendo un cierre con la fecha del dia. El hook de arranque ya sellaba la fecha local,
// asi que las dos piezas del kit que hablan de "hoy" decian dias distintos durante dos horas.
const ahoraLocal = new Date();
const HOY = new Date(ahoraLocal.getTime() - ahoraLocal.getTimezoneOffset() * 60000)
  .toISOString().slice(0, 10);
const CADUCA = /(?:^caduca:\s*|\[CADUCA\s+)(\d{4}-\d{2}-\d{2})/gm;
for (const f of md) {
  const t = readFileSync(f, 'utf8');
  for (const m of t.matchAll(CADUCA)) {
    if (m[1] < HOY) {
      const linea = t.slice(0, m.index).split('\n').length;
      nota('dato caducado', f, `caduco el ${m[1]} (hoy es ${HOY}), linea ${linea} — verificalo en su fuente y actualizalo o retiralo`);
    }
  }
}

// --- 10. una fecha de ESTADO no puede estar en el futuro -----------------
// Los marcadores de abajo declaran CUANDO SE HIZO algo, asi que una fecha posterior a hoy
// es imposible por definicion y delata una de dos cosas: una fecha escrita de memoria, o un
// reloj en el que no se puede confiar. Las dos pasaron en este vault en la misma semana.
// AMBITO ACOTADO A PROPOSITO: no se miran TODAS las fechas del arbol, porque una fecha futura
// puede ser legitima (un plazo, un vencimiento, una fecha de revision). Solo se miran las que
// afirman un hecho pasado. Ampliarla a todas las fechas la llenaria de falsos positivos, y una
// regla que grita en falso se acaba ignorando, que es como se pierde un verificador.
const FECHA_DE_ESTADO = /(?:\[(?:HECHO|MEDIDO|VERIFICADO|RESUELTO|CERRADO|DIRIMIDO|ABIERTO|CONFIRMADO|INVESTIGADO|EJECUTADO|APLICADO|CORREGIDO|PUBLICADA|AMPLIADO)\s+|^version:\s*[\d.]+\s*\()(\d{4}-\d{2}-\d{2})/gm;
for (const f of md) {
  const t = readFileSync(f, 'utf8');
  for (const m of t.matchAll(FECHA_DE_ESTADO)) {
    if (m[1] > HOY) {
      const linea = t.slice(0, m.index).split('\n').length;
      nota('fecha futura', f, `declara como ya ocurrido algo fechado el ${m[1]}, y hoy es ${HOY} (linea ${linea})`);
    }
  }
}

// --- 11. el indice de doctrinas es DERIVADO, no mantenido a mano ---------
// La regla 7 comprueba que el indice y sus ficheros se correspondan; esta comprueba que el
// TEXTO de cada entrada siga siendo el de su ficha. Es el hueco que dejaba la regla en prosa
// "si cambias una ficha, actualiza su entrada del indice en el mismo commit": dependia de que
// alguien se acordase, y las dos redacciones son plausibles por separado, asi que releyendo no
// se nota. El resumen vive en el `index_summary` del frontmatter de la ficha -- fuente unica --
// y el indice se rellena desde ahi con `generar-indice-doctrinas.mjs --escribir`.
try {
  const gen = join(RAIZ, '_meta', 'generar-indice-doctrinas.mjs');
  if (existsSync(gen)) {
    try {
      execFileSync(process.execPath, [gen], { encoding: 'utf8', timeout: 20000, stdio: ['ignore', 'pipe', 'ignore'] });
    } catch (e) {
      for (const l of (e.stdout || '').split('\n')) {
        const m = l.match(/^\s{2}(\S.*?) :: (.*)$/);
        if (m) nota('indice derivado', join(RAIZ, m[1].split(' ')[0]), m[2]);
      }
    }
  }
} catch { /* si el generador no esta, esta regla simplemente no aplica */ }

// --- 12. el fichero de TRABAJO EN CURSO se mantiene legible para el hook ---
// El hook de arranque vuelca las lineas abiertas de cada `trabajo-en-curso.md` por contexto:
// eso es lo unico que convierte el fichero en mecanismo, porque nadie tiene que acordarse de
// abrirlo. El hook las reconoce solo por su prefijo `- [ABIERTO fecha]`, A PROPOSITO laxo: una
// linea mal escrita se vuelca igual, mutilada, en vez de desaparecer del aviso. Fallar a la
// vista es mejor que fallar en silencio. Lo que esta regla protege es lo OTRO -- que la linea
// diga de QUIEN es el trabajo y DONDE vive --, porque sin esos dos campos el volcado no sirve
// para lo unico que existe: saber a quien preguntar antes de abrir el mismo frente.
// (La primera redaccion de este comentario decia que el hook dejaria de volcarla. Se probo y era
// FALSO; queda escrito porque el error es el que el kit persigue: justificar sin comprobar.)
// Las lineas de dentro de un bloque de codigo son el ejemplo de formato, no trabajo declarado.
const EN_CURSO_OK = /^- \[ABIERTO \d{4}-\d{2}-\d{2}\] \*\*.+\*\* · dueño: `[^`]+` · artefacto: `[^`]+` — .+$/;
for (const f of md.filter((x) => basename(x) === 'trabajo-en-curso.md')) {
  const lineas = readFileSync(f, 'utf8').split('\n');
  let enEjemplo = false;
  lineas.forEach((linea, i) => {
    if (linea.startsWith('```')) { enEjemplo = !enEjemplo; return; }
    if (enEjemplo) return;
    if (!linea.startsWith('- [ABIERTO')) return;
    if (!EN_CURSO_OK.test(linea)) {
      nota('trabajo en curso ilegible', f, `linea ${i + 1}: el hook la volcara sin dueño ni artefacto, o sea sin lo que sirve para algo — formato: - [ABIERTO AAAA-MM-DD] **que** · dueño: \`quien\` · artefacto: \`ruta DESDE LA RAIZ DEL VAULT\` — estado`);
    }
  });
}

// --- 13. cuantas reglas tiene el verificador NO se escribe a mano -------
// Aparecio solo, y por eso esta aqui: al anadir la regla 12 habia TRES sitios distintos
// diciendo "diez reglas" -- el README publico, el informe de metodo y el indice de `_meta/` --
// cuando ya eran once desde el dia anterior. Nadie miente en ninguno; simplemente el numero se
// copio a mano en cuatro sitios y solo se actualizo en uno. Es el mismo fallo que la regla 11
// persigue en el indice de doctrinas: un dato derivable escrito a mano deriva en silencio, y
// releyendo no se nota porque cada frase es plausible por separado.
// AMBITO: lo que es METODO. El registro -- historico, bitacora, informes y los changelog de las
// doctrinas -- NO se reescribe: alli "ocho reglas" era cierto cuando se escribio. Tambien quedan
// fuera los handoffs, que son efimeros y se borran solos.
const REGLAS_REALES = new Set([...readFileSync(fileURLToPath(import.meta.url), 'utf8')
  .matchAll(/^\/\/ --- (\d+)\./gm)].map((m) => Number(m[1]))).size;
const PALABRAS = { cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11,
  doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18 };
// AMBITO: lo que es METODO. Queda fuera el REGISTRO -- lo que relata, cita o describe un estado
// pasado: historico, bitacora, informes, sintesis, handoffs, extracciones y los changelog. Alli
// "ocho reglas" era cierto cuando se escribio, y una frase como "nacio de que diez reglas decian
// lo mismo" es historia correcta, no una cuenta desactualizada. Se anadio `extraccion-` el
// 2026-08-27, cuando una extraccion del propio metodo salto por eso. NO es relajar el criterio:
// es que esa pieza pertenece a una categoria que la regla ya excluia y el patron no nombraba.
const ES_REGISTRO = (f) => /historico-kit\.md$|bitacora\.md$|brief-.*\.md$|handoff-.*\.md$|sintesis-.*\.md$|extraccion-.*\.md$|informe-.*\.md$/.test(f);
const CUENTA = /\*{0,2}(\d{1,2}|[A-Za-zÁÉÍÓÚáéíóúñ]+)\*{0,2}\s+regla/gi;
for (const f of md.filter((x) => !ES_REGISTRO(x))) {
  const lineas = readFileSync(f, 'utf8').split('\n');
  lineas.forEach((linea, i) => {
    if (linea.startsWith('> **v')) return;                      // changelog: es registro
    if (!/verificar-kit|verificador/i.test(linea)) return;       // solo donde se habla de ESTE script
    // Lo entrecomillado y lo que va entre acentos graves se CITA, no se dice -- mismo criterio que
    // la regla 8, que ya lo hacia y esta no. Sin esto, un documento de analisis que cita la cuenta
    // de OTRO fichero se lleva el hallazgo como si la afirmara el. Cazado el 2026-08-27 por una
    // extraccion del propio metodo que citaba tres cuentas ajenas en la misma linea.
    const dicha = sinEnfasis(sinCitas(sinLiterales(linea)));
    for (const m of dicha.matchAll(CUENTA)) {
      const crudo = m[1].toLowerCase();
      const n = /^\d+$/.test(crudo) ? Number(crudo) : PALABRAS[crudo.normalize('NFD').replace(/[̀-ͯ]/g, '')];
      if (n === undefined) continue;                             // "las reglas", "sus reglas": no es una cuenta
      if (n !== REGLAS_REALES) {
        nota('cuenta de reglas', f, `linea ${i + 1}: dice ${n} regla(s) y el verificador tiene ${REGLAS_REALES} — no se escribe a mano, se cuenta`);
      }
    }
  });
}

// --- 14. un asunto con SOFTWARE no puede existir sin su ficha de emplazamiento ---
// La brecha que dejo el informe de OpenSpec, y era del kit, no de la herramienta: el checklist
// obliga EN PROSA a la ficha de emplazamiento y al perfil de permisos correcto, y nada impedia
// arrancar sin ellos. El propio kit tiene escrito que una regla que depende de que alguien se
// acuerde no es una regla, asi que se estaba incumpliendo a si mismo.
// ACOTADA A PROPOSITO, porque esto se hace mal si se automatiza de mas: NO se comprueba el
// contenido de la ficha (eso es criterio, y una ficha rellenada a la fuerza para callar al
// verificador es peor que ninguna), solo que EXISTA cuando el asunto es de software. Y no se
// exige a nadie declarar un perfil: los asuntos que arrancaron antes de que el paso 6-bis
// existiera no declaran ninguno, y sacarlos en rojo por trabajo que el general no puede tocar
// -- los contenedores son de sus coordinadores -- convertiria el verificador en ruido.
// Dos detonantes independientes: lo DECLARADO en el charter y lo que se ve DE HECHO en el
// contenedor. El segundo existe porque el caso que duele es justo el que no declaro nada.
const asuntosDir = join(RAIZ, 'asuntos');
if (existsSync(asuntosDir)) {
  for (const nombre of readdirSync(asuntosDir, { withFileTypes: true })
      .filter((e) => e.isDirectory()).map((e) => e.name)) {
    const cont = join(asuntosDir, nombre);
    const charter = join(cont, 'charter-coordinador.md');
    if (!existsSync(charter)) continue;                       // sin charter no hay asunto que juzgar
    const textoCharter = readFileSync(charter, 'utf8');
    // Se mira SOLO la linea del encabezado del perfil, no el charter entero. Buscar la cadena en
    // todo el fichero es un falso positivo garantizado, y ademas SISTEMATICO: la plantilla de
    // charter invita a razonar por que se descarta cada uno de los otros tres perfiles, asi que
    // **nombrar el perfil para DESCARTARLO bastaba para darlo por declarado**. Y fallaba en la
    // direccion mala -- exigia ficha de emplazamiento y perfil de software a quien acababa de
    // escribir que no es de software. Lo diagnostico el coordinador de `homeassistant` el
    // 2026-08-28, con la linea del codigo en la mano, cuando le salto en rojo por una tabla en la
    // que descartaba ese perfil. (Correccion en el verificador y no en su texto: un parche en el
    // charter le habria funcionado a el y el asunto siguiente habria tropezado igual.)
    const encabezado = (textoCharter.match(/^##+\s*Perfil del asunto:.*$/mi) || [''])[0];
    const declarado = /asunto con software/i.test(encabezado) && !/\{\{PERFIL\}\}/.test(encabezado);
    const porElPack = new RegExp(`\\[\\[(${[...delPack].join('|')})\\]\\]|packs/codigo`).test(textoCharter);
    const porElRepo = existsSync(join(cont, 'repo'));
    if (!declarado && !porElPack && !porElRepo) continue;      // no es un asunto de software
    const porQue = declarado ? 'su charter declara el perfil `asunto con software`'
      : porElRepo ? 'tiene un `repo/` dentro del contenedor'
      : 'su charter se apoya en el pack `codigo/`';
    if (!existsSync(join(cont, 'docs', 'emplazamiento-runtime.md'))) {
      nota('arranque de software incompleto', charter,
        `${porQue}, y falta \`asuntos/${nombre}/docs/emplazamiento-runtime.md\` — sin ella nadie sabe donde vive el codigo ni como se entra a ejecutarlo (checklist-arranque paso 6-bis)`);
    }
    // El perfil de permisos solo se exige a quien lo declaro: deducirlo del `repo/` seria adivinar.
    const settings = join(cont, '.claude', 'settings.json');
    if (declarado && existsSync(settings) && !/docker|podman|kubectl/.test(readFileSync(settings, 'utf8'))) {
      nota('arranque de software incompleto', settings,
        `el asunto declara perfil de software pero su settings no es \`plantilla-settings-coordinador-software.json\` — le falta el comando que entra al runtime`);
    }
  }
}

// --- 15. los enlaces RELATIVOS de markdown tambien resuelven ------------
// La regla 2 verifica los `[[wikilinks]]` y por eso el grafo del metodo tiene CERO rotos. Pero los
// enlaces markdown normales -- `[texto](../ruta.md)` -- no los miraba nadie, y ahi vive el 62 % del
// corpus: los contenedores de asunto. Medido el 2026-08-31 al escribir esta regla: 554 enlaces
// relativos y **10 rotos**, todos en asuntos, sin que nadie lo supiera.
//
// Y el patron de los 10 explica por que hacia falta: casi todos apuntan a ficheros que la HIGIENE
// borro correctamente -- prompts cumplidos, plantillas retiradas --. O sea que el kit tenia una
// regla que manda borrar el efimero y ninguna que avisara de los enlaces que ese borrado dejaba
// colgados. Una pieza correcta creando trabajo invisible para otra.
//
// Sale del informe de RAG y grafos (2026-08-31) como el punto 1 de "que copiar sin adoptar nada":
// extender al resto del vault la puerta determinista que el marco comun ya tenia. Se implementa
// como regla propia y NO con un comprobador externo, que era la otra via: cero dependencias
// nuevas, mismo formato de hallazgo, y falla en rojo igual que las otras catorce.
const ENLACE_MD = /(?<!!)\[[^\]\n]*\]\(([^)\s]+)\)/g;
for (const f of md) {
  // Fuera los bloques de codigo Y los literales de una linea: `[texto](archivo.md)` escrito entre
  // acentos graves es un EJEMPLO DE SINTAXIS, no un enlace. La primera version solo quitaba los
  // bloques y denuncio justo eso en la plantilla del contenedor de asunto -- el fichero que
  // ENSENA a escribir enlaces relativos --. Es la cuarta vez esta semana que una pieza nueva
  // repite un criterio que el kit ya tenia resuelto (la regla 2 usa `sinLiterales` desde siempre):
  // un criterio resuelto en un sitio no esta resuelto en el kit hasta que se aplica donde se
  // vuelve a necesitar.
  const texto = sinLiterales(readFileSync(f, 'utf8').replace(/```[\s\S]*?```/g, ''));
  for (const m of texto.matchAll(ENLACE_MD)) {
    const crudo = m[1].trim();
    // Fuera: web, correo, anclas del propio fichero y esquemas raros. Solo se juzga lo local.
    if (/^(https?:|mailto:|#|<)/.test(crudo)) continue;
    const rel = decodeURIComponent(crudo.split('#')[0].split('?')[0]);
    if (!rel) continue;                                   // enlace solo a un ancla: no es ruta
    const destino = resolve(dirname(f), rel);
    if (existsSync(destino)) continue;
    // Segunda oportunidad por NORMALIZACION UNICODE: en este arbol hay al menos un nombre con
    // tilde donde `find` y `git ls-files` ya discrepan (NFC contra NFD). Sin esto, la regla
    // denunciaria un enlace que el sistema de ficheros SI resuelve.
    const dir = dirname(destino);
    let existePorNombre = false;
    try {
      const base = basename(destino);
      existePorNombre = readdirSync(dir).some(
        (n) => n.normalize('NFC') === base.normalize('NFC'));
    } catch { /* el directorio tampoco existe: es un roto de verdad */ }
    if (existePorNombre) continue;
    const linea = texto.slice(0, m.index).split('\n').length;
    nota('enlace relativo colgado', f, `\`${crudo}\` no resuelve (linea ${linea}) — o el fichero se borro y el enlace se quedo, o la ruta esta mal`);
  }
}

// --- 16. los agentes de cada contenedor son copia idéntica de su plantilla ---
// Cada `<contenedor>/.claude/agents/<x>.md` (la raiz y cada `asuntos/<asunto>/`) tiene que ser
// identico byte a byte a `inicializador/plantilla-agente-<x>.md`. Las copias derivan sin avisar,
// el mismo fallo que persiguen las reglas 7 y 11, y aqui sale mas caro: una sesion de asunto
// carga sus agentes Y los de la raiz, y con el mismo nombre GANA el del asunto sin avisar
// (medido el 2026-10-04). O sea que una copia que diverge cambia el comportamiento de la
// ejecutora sin que nadie lo vea. Un agente sin plantilla de ese nombre tambien es hallazgo:
// es una definicion que no viene del kit. Que un contenedor no tenga `.claude/agents/` no lo es.
const contenedores = [RAIZ];
const dirAsuntos = join(RAIZ, 'asuntos');
if (existsSync(dirAsuntos)) {
  for (const e of readdirSync(dirAsuntos)) {
    const d = join(dirAsuntos, e);
    if (statSync(d).isDirectory()) contenedores.push(d);
  }
}
for (const c of contenedores) {
  const dirAg = join(c, '.claude', 'agents');
  if (!existsSync(dirAg)) continue;
  for (const e of readdirSync(dirAg).filter((n) => n.endsWith('.md'))) {
    const f = join(dirAg, e);
    const plantilla = join(RAIZ, 'inicializador', `plantilla-agente-${e}`);
    if (!existsSync(plantilla)) {
      nota('agente sin plantilla', f, `no existe inicializador/plantilla-agente-${e}: una definicion de agente que no viene del kit`);
    } else if (!readFileSync(f).equals(readFileSync(plantilla))) {
      nota('agente distinto de su plantilla', f, `difiere de inicializador/plantilla-agente-${e} — la copia se vuelve a sacar de la plantilla, no se edita a mano`);
    }
  }
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
