#!/bin/bash
# Prueba de statusline.sh: casos S1-S6 con HOME aislado y un herdr falso.
# Uso: probar-statusline.sh   (STATUSLINE=<ruta> para probar otra copia)
# Salida: 0 si pasan todos, 1 si alguno falla, 2 si el uso es incorrecto.
[ $# -eq 0 ] || { echo "uso: [STATUSLINE=<ruta>] $0" >&2; exit 2; }
aqui=$(cd "$(dirname "$0")" && pwd)
SL="${STATUSLINE:-$aqui/statusline.sh}"
[ -f "$SL" ] || { echo "no existe: $SL" >&2; exit 2; }
command -v jq >/dev/null || { echo "falta jq" >&2; exit 2; }

fallos=0
ok()  { echo "[OK] $1"; }
mal() { echo "[FALLA] $1"; fallos=$((fallos+1)); }

nuevo_home() {
  H=$(mktemp -d); mkdir -p "$H/bin"
  printf '#!/bin/sh\necho "$@" >> "%s/herdr.log"\n' "$H" > "$H/bin/herdr"
  chmod +x "$H/bin/herdr"
}
# corre el script: $1 = entrada JSON; el resto, variables de entorno VAR=valor
correr() {
  local entrada="$1"; shift
  printf '%s' "$entrada" | env -i HOME="$H" PATH="$H/bin:$PATH" "$@" /bin/bash "$SL"
}
lineas() { [ -f "$1" ] && wc -l < "$1" | tr -d ' ' || echo 0; }

BASE='{"session_id":"s1","workspace":{"current_dir":"/p"},"model":{"id":"m"},"effort":{"level":"high"},"context_window":{"used_percentage":42.7,"context_window_size":200000}}'
CON='{"session_id":"s1","workspace":{"current_dir":"/p"},"model":{"id":"m"},"effort":{"level":"high"},"context_window":{"used_percentage":42.7,"context_window_size":200000},"rate_limits":{"five_hour":{"used_percentage":10.5,"resets_at":1700000000},"seven_day":{"used_percentage":3.2,"resets_at":1700500000}}}'

# S1
nuevo_home
out=$(correr "$BASE")
if [ "$out" = "ctx 42% · 5h -% · 7d -%" ] && [ ! -e "$H/.cache/claude-limits/latest" ] \
   && [ ! -d "$H/.cache/claude-statusline" ] && [ "$(lineas "$H/.local/share/claude-uso/historial.jsonl")" = 1 ]; then
  ok "S1 sin rate_limits ni panel"; else mal "S1 sin rate_limits ni panel (salida: $out)"; fi

# S2
nuevo_home
correr "$CON" HERDR_PANE_ID=wA:pK >/dev/null; sleep 1
l="$H/.cache/claude-limits/latest"; p="$H/.cache/claude-statusline/wA_pK.json"
if [ -f "$l" ] && [ "$(wc -w < "$l" | tr -d ' ')" = 3 ] \
   && jq -e '.rate_limits.five_hour and .rate_limits.seven_day' "$p" >/dev/null 2>&1 \
   && grep -q 'ctx=ctx 42%' "$H/herdr.log" 2>/dev/null; then
  ok "S2 limites, panel y herdr"; else mal "S2 limites, panel y herdr"; fi

# S3
nuevo_home
correr "$BASE" >/dev/null; correr "$BASE" >/dev/null
a=$(lineas "$H/.local/share/claude-uso/historial.jsonl")
correr "${BASE/42.7/50.1}" >/dev/null
b=$(lineas "$H/.local/share/claude-uso/historial.jsonl")
if [ "$a" = 1 ] && [ "$b" = 2 ]; then ok "S3 solo escribe si cambia"; else mal "S3 solo escribe si cambia (a=$a b=$b)"; fi

# S4
nuevo_home
correr "$BASE" CLAUDE_USO_MAX_BYTES=10 >/dev/null
correr "${BASE/42.7/50.1}" CLAUDE_USO_MAX_BYTES=10 >/dev/null
if [ -f "$H/.local/share/claude-uso/historial.jsonl.1" ]; then ok "S4 rotacion"; else mal "S4 rotacion"; fi

# S5
nuevo_home
T="${CON%\}},\"transcript_path\":\"/secreto/conv.jsonl\"}"
correr "$T" HERDR_PANE_ID=wA:pK >/dev/null; sleep 1
if ! grep -rq 'transcript\|secreto' "$H/.local/share/claude-uso" "$H/.cache" 2>/dev/null; then
  ok "S5 sin transcript_path"; else mal "S5 sin transcript_path"; fi

# S6
nuevo_home
correr "$CON" CLAUDE_CONFIG_DIR=/x/.claude-prueba >/dev/null
if [ -f "$H/.cache/claude-limits/latest-.claude-prueba" ] && [ ! -e "$H/.cache/claude-limits/latest" ]; then
  ok "S6 cuenta en latest"; else mal "S6 cuenta en latest"; fi

[ "$fallos" -eq 0 ] && exit 0 || exit 1
