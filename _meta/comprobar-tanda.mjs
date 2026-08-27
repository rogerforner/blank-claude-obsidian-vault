#!/usr/bin/env node
// _meta/comprobar-tanda.mjs — ¿la tanda hizo el trabajo, o solo terminó?
//
// POR QUE EXISTE: una sesion ejecutora puede devolver codigo de salida 0, `subtype: success` y
// `permission_denials: []` **sin haber entregado nada**. Pasa por dos motivos distintos y los dos
// se han visto en esta maquina:
//
//   1. CUOTA AGOTADA. Documentado como fallo del sector: agotar la cuota devuelve exito con salida
//      vacia. Quien mire el codigo de salida creera que fue bien.
//   2. LA SESION NO PUDO ESCRIBIR. El 2026-08-27 una tanda arranco en modo plan sin que nadie lo
//      pidiera, hizo la investigacion entera, gasto 5 USD y no pudo crear su entregable. Devolvio
//      exito.
//
// Una investigacion de agosto de 2026 sobre orquestadores de agentes encontro que **NINGUNA
// herramienta del sector detecta el caso 1**. Este script es la version domestica, y es barato:
// mira el disco y el informe en vez de fiarse del codigo de salida.
//
// USO:
//   node _meta/comprobar-tanda.mjs <salida.json> [<entregable-esperado> ...]
//
// Devuelve 0 solo si la tanda produjo trabajo comprobable. Cualquier otra cosa es 1, y el motivo
// va escrito. NO sustituye a leer el informe: sustituye a dar por buena una tanda sin mirarla.

import { readFileSync, existsSync, statSync } from 'node:fs';

const [salidaJson, ...entregables] = process.argv.slice(2);
if (!salidaJson) {
  console.log('Uso: node _meta/comprobar-tanda.mjs <salida.json> [<entregable> ...]');
  process.exit(1);
}

const fallos = [];
const notas = [];

// --- 1. el informe existe y NO esta vacio -------------------------------
// `--output-format json` no emite nada hasta que la tanda termina, asi que un fichero de cero
// bytes significa que la cortaron o que murio: no es "sin novedad", es "sin nada".
if (!existsSync(salidaJson)) {
  fallos.push(`no existe el fichero de salida ${salidaJson} — la tanda no llego a escribir nada`);
} else if (statSync(salidaJson).size === 0) {
  fallos.push(`${salidaJson} tiene CERO bytes — la tanda se corto antes de terminar (watchdog, cuota o caida)`);
} else {
  let d;
  try { d = JSON.parse(readFileSync(salidaJson, 'utf8')); }
  catch { fallos.push(`${salidaJson} no es JSON valido — salida truncada`); }

  if (d) {
    const texto = String(d.result || '');
    // --- 2. el informe dice algo -----------------------------------------
    if (!texto.trim()) {
      fallos.push('el informe viene VACIO con codigo de exito — es la firma de la cuota agotada');
    } else if (texto.trim().length < 200) {
      notas.push(`el informe son ${texto.trim().length} caracteres: muy corto para una tanda real, leelo entero`);
    }
    // --- 3. senales explicitas de haber muerto por limite ----------------
    const limite = /max_budget|budget.*exceed|rate.?limit|quota|usage limit|max_turns/i;
    if (limite.test(String(d.subtype)) || limite.test(String(d.terminal_reason)) || limite.test(String(d.api_error_status))) {
      fallos.push(`la tanda murio por un limite: subtype=${d.subtype} terminal_reason=${d.terminal_reason}`);
    }
    // --- 4. la tanda misma dice que no pudo ------------------------------
    // Se mira el informe, no el codigo de salida: una ejecutora bien hecha PARA y lo dice, y ese
    // aviso queda enterrado si quien lanza solo mira `success`.
    if (/no he podido|no pude|parada en seco|no puedo escribir|sin poder entregar/i.test(texto)) {
      fallos.push('el informe declara que la tanda NO pudo entregar — leelo antes de darla por buena');
    }
    if (d.num_turns !== undefined && Number(d.num_turns) <= 1) {
      fallos.push(`solo ${d.num_turns} turno(s): la tanda no llego a trabajar`);
    }
    if (d.total_cost_usd !== undefined) notas.push(`coste ${Number(d.total_cost_usd).toFixed(2)} USD en ${d.num_turns} turnos`);
    if (Array.isArray(d.permission_denials) && d.permission_denials.length) {
      notas.push(`${d.permission_denials.length} permiso(s) denegado(s): puede haber trabajo a medias`);
    }
  }
}

// --- 5. LO QUE MANDA: el entregable esta en el disco ---------------------
// El resto son indicios; esto es la prueba. `success` es el veredicto del runner, no del trabajo.
for (const e of entregables) {
  if (!existsSync(e)) fallos.push(`el entregable ${e} NO existe en el disco`);
  else if (statSync(e).size === 0) fallos.push(`el entregable ${e} existe pero esta VACIO`);
  else notas.push(`${e}: ${statSync(e).size} bytes`);
}
if (!entregables.length) {
  notas.push('sin entregable declarado: solo se ha mirado el informe, que es la mitad de la comprobacion');
}

console.log('\n=== COMPROBACION DE TANDA ===\n');
for (const n of notas) console.log(`  [nota]  ${n}`);
for (const f of fallos) console.log(`  [FALLO] ${f}`);

if (fallos.length) {
  console.log(`\nRESULTADO: LA TANDA NO ENTREGO — ${fallos.length} motivo(s).`);
  console.log('  No la des por buena. Si el trabajo esta hecho pero desviado, recuperalo antes de relanzar.\n');
  process.exit(1);
}
console.log('\nRESULTADO: LA TANDA ENTREGO — informe con contenido y entregables en disco.');
console.log('  Esto dice que produjo algo, NO que sea correcto: eso lo dice leer el informe.\n');
process.exit(0);
