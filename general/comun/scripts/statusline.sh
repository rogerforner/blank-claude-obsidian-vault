#!/usr/bin/env bash
# Linea de estado de Claude Code: contexto de la sesion y uso de 5 horas y semanal.
# Local: sin red y sin credenciales; lee solo el JSON que Claude Code le pasa por la entrada.
# No guarda nada de la conversacion ni el transcript_path: solo cifras de uso y metadatos de la sesion.
input=$(cat)
ahora=$(date +%Y-%m-%dT%H:%M:%S%z)
ctx=$(jq -r '.context_window.used_percentage // empty | floor' <<<"$input")
h5=$(jq -r '.rate_limits.five_hour.used_percentage // empty | floor' <<<"$input")
d7=$(jq -r '.rate_limits.seven_day.used_percentage // empty | floor' <<<"$input")
r5=$(jq -r '.rate_limits.five_hour.resets_at // empty' <<<"$input")

# Cuenta: nombre de la carpeta de configuracion si hay CLAUDE_CONFIG_DIR; "defecto" si no
if [ -n "$CLAUDE_CONFIG_DIR" ]; then
  cuenta=$(basename "$CLAUDE_CONFIG_DIR"); sufijo="-$cuenta"
else
  cuenta="defecto"; sufijo=""
fi

# Cache global de limites para la barra de pestanas de Herdr (solo si hay dato)
if [ -n "$h5" ]; then
  d="$HOME/.cache/claude-limits"; mkdir -p "$d"
  printf '%s %s %s\n' "$h5" "${d7:--}" "${r5:-0}" > "$d/latest$sufijo.tmp" && mv "$d/latest$sufijo.tmp" "$d/latest$sufijo"
fi

# Fichero por pestana de Herdr para que los coordinadores lean estos datos
if [ -n "$HERDR_PANE_ID" ]; then
  d="$HOME/.cache/claude-statusline"; mkdir -p "$d"; f="$d/${HERDR_PANE_ID//:/_}.json"
  jq --arg t "$ahora" '{session_id, written_at: $t,
      context_window: {used_percentage: .context_window.used_percentage, context_window_size: .context_window.context_window_size},
      rate_limits: {five_hour: {used_percentage: .rate_limits.five_hour.used_percentage, resets_at: .rate_limits.five_hour.resets_at},
                    seven_day: {used_percentage: .rate_limits.seven_day.used_percentage, resets_at: .rate_limits.seven_day.resets_at}}}' \
    <<<"$input" > "$f.tmp" && mv "$f.tmp" "$f"
fi

# Historial: una linea solo cuando cambia algun valor de la sesion; rotacion a .1 al pasar del umbral (20 MB por defecto)
h="$HOME/.local/share/claude-uso"; mkdir -p "$h/ultimo"
fila=$(jq -c --arg pane "${HERDR_PANE_ID:-}" --arg cuenta "$cuenta" '{session_id, pane: (if $pane == "" then null else $pane end),
    cuenta: $cuenta,
    cwd: (.workspace.current_dir // .cwd), model: .model.id, effort: .effort.level,
    ctx: .context_window.used_percentage, h5: .rate_limits.five_hour.used_percentage,
    d7: .rate_limits.seven_day.used_percentage}' <<<"$input")
sid=$(jq -r '.session_id // empty' <<<"$fila")
if [ -n "$sid" ] && [ "$fila" != "$(cat "$h/ultimo/$sid" 2>/dev/null)" ]; then
  printf '%s\n' "$fila" > "$h/ultimo/$sid"
  [ -f "$h/historial.jsonl" ] && [ "$(wc -c < "$h/historial.jsonl")" -gt "${CLAUDE_USO_MAX_BYTES:-20971520}" ] && mv "$h/historial.jsonl" "$h/historial.jsonl.1"
  jq -c --arg t "$ahora" '{time: $t} + .' <<<"$fila" >> "$h/historial.jsonl"
fi

# Contexto de este panel en la barra lateral de Herdr (fuera de Herdr no hace nada)
if [ -n "$HERDR_PANE_ID" ] && [ -n "$ctx" ] && command -v herdr >/dev/null; then
  herdr pane report-metadata "$HERDR_PANE_ID" --source user:claude-ctx \
    --token ctx="ctx ${ctx}%" --ttl-ms 3600000 >/dev/null 2>&1 &
fi

echo "ctx ${ctx:--}% · 5h ${h5:--}% · 7d ${d7:--}%"
