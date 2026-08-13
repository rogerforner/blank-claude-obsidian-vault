---
name: Sesión consultor paralelo (read-only)
description: Una sesión Claude Code paralela read-only resuelve dudas factuales del director sin consumir el contexto del coordinador; no decide ni redacta prompts, solo consulta y cita fuentes.
type: convention
version: 1.1
---

El director dispone de una **sesión Claude Code paralela "consultor"**, con permisos **read-only**, para resolver dudas factuales y concretas (qué dice la doctrina X, dónde está el justificante Y, qué plazo tenía el asunto Z, por qué se decidió lo otro) **sin consumir el contexto del coordinador**.

## Forma

```
consultor-paralelo/
├── .claude/settings.json   deny taxativa: Edit/Write y destructivos bloqueados
├── system-prompt.md        identidad + fuentes accesibles + restricciones
└── README.md               instrucciones de uso para el director
```

- Tiene **read-only** sobre las fuentes del asunto (memoria/doctrinas, `docs/`, originales escaneados, copias de seguridad), ordenadas por prioridad en su `system-prompt.md`.
- **No decide, no redacta prompts operativos, no edita.** Si el director plantea una decisión, **redirige al coordinador**.
- Cita siempre la fuente (`fichero:línea`, o documento y página). Si la info no consta, lo dice explícitamente.
- **Modelo y esfuerzo:** los fija la tabla de [[modelo_por_tarea]] y **su perfil de settings ya los trae escritos** — aquí no se repiten, para que no deriven. Coste por sesión bajo; ahorro de contexto del coordinador alto.

## Limitaciones que el consultor debe declarar

- **No ve el contexto vivo del coordinador** ni decisiones aún no registradas en memoria/archivos.
- La memoria persistente puede tener desfase respecto al chat vivo.
- **No sustituye a un profesional.** Si la duda es jurídica, fiscal o técnica con consecuencias, el consultor localiza y cita lo que consta en el asunto; la decisión sigue siendo del director, con asesoramiento humano si procede.

## Implicación para el coordinador

Mantener la memoria/doctrinas **actualizadas con disciplina**: registrar prontamente toda decisión significativa, para que el consultor no responda "no consta" por desfase.

Relacionada: [[modelo_por_tarea]], [[paralelismo_subagent_opus_principal]], [[orquestacion_sesiones_por_herramienta]].

> Pieza de catálogo `general/comun/doctrinas/`. **v1.1 (2026-08-12):** el modelo y el esfuerzo del consultor **dejan de escribirse aquí** y pasan a la tabla de [[modelo_por_tarea]], que es su fuente única; su perfil de settings ya los trae fijados. Antes esta ficha decía "barato, esfuerzo bajo" y la tabla decía otra cosa: dos sitios con el mismo dato derivan siempre. v1.0 (2026-06-05). Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente.
> Adaptada al enfoque neutro de la plantilla (sin referencias al dominio del software) — 2026-07-29.
