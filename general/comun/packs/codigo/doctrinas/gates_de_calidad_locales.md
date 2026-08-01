---
name: Gates de calidad locales (el agente no cierra tarea con la puerta en rojo)
description: La confianza en el código que escribe la IA no se asume: se ejecuta. Gates deterministas locales (sin CI en la nube) montados con hooks de Claude Code, pre-commit y un script de definition-of-done: PostToolUse para lint rápido por edición, Stop/SubagentStop con exit 2 para impedir cerrar tarea con gates en rojo, pre-commit para secretos e integridad. Mutation score (no cobertura) como señal antifraude. El agente NUNCA edita sus propios criterios de aprobación.
type: doctrine
version: 2.0
---

El código que escribe la IA **no se valida leyéndolo entero**: se rodea de **puertas mecánicas** que fallan solas. La regla de oro: *"las pruebas pasan"* deja de ser una afirmación **asumida** en un reporte y pasa a ser un **gate ejecutado** que **impide cerrar la tarea** si está en rojo.

**Por qué es obligatorio (evidencia, no opinión):** el código generado por LLM introduce una vulnerabilidad OWASP Top 10 detectable en ~**45%** de los casos (Veracode 2025, >100 modelos), sin mejora en 2026; DORA 2024 mide que **+25% de adopción de IA ≈ −7,2% de estabilidad de entrega**; y los agentes hacen **reward hacking** medible: con un test en conflicto con la spec, los modelos punteros **modifican o hardcodean el test** en tasas del ~39-76%. Los tests que escribe la propia IA **no capturan** esas clases de defecto.

## Los tres tiempos del gate (y qué va en cada uno)

Regla de reparto: **rápido y local por edición · barato y de integridad por commit · caro y completo por tanda.**

| Tiempo | Mecanismo | Qué corre | Latencia |
|---|---|---|---|
| **Por edición** | hook **`PostToolUse`** (matcher `Write\|Edit\|MultiEdit`) | formateo + linter (+ typecheck **solo si el asunto tiene tipos**) **del fichero tocado**; si no hay typecheck, su sitio lo ocupan las **reglas de arquitectura** | **< 2-3 s** (por encima, degrada al agente) |
| **Al cerrar turno** | hook **`Stop`** / **`SubagentStop`** con **exit 2** | **VERIFICA que el DoD se ejecutó** (no lo ejecuta él) — ver §"El `Stop` no ejecuta, comprueba" | **<1 s** |
| **Por commit** | **pre-commit** local (lefthook / pre-commit) | `gitleaks --staged`, lint-staged, **guard antifraude** de tests | < 1-2 s |
| **Por tanda** | script DoD invocado a mano o en `Stop` | mutation testing **incremental**, E2E/smoke, property-based, auditoría de dependencias | minutos |

**Semántica de hooks (verificada en la doc oficial):** `exit 0` = éxito (su stdout puede inyectar contexto) · **`exit 2` = error bloqueante**: en `PreToolUse` bloquea la herramienta, y en **`Stop`/`SubagentStop` impide que el agente (o el subagente) termine**, devolviéndole el `stderr` como razón para que corrija · otro código = error no bloqueante. **`PostToolUse` NO deshace** el cambio: solo expone `stderr` al modelo. Handlers disponibles: `command` (shell), `prompt`, `agent`, `http`.

## El `Stop` no EJECUTA los gates: comprueba que se ejecutaron (patrón sello)

**El hook `Stop` corre al final de CADA TURNO**, no una vez por tanda. Si le cuelgas la suite o los gates caros, cada respuesta del agente paga ese coste — y el gate **acaba desactivado por insoportable**. *(Medido en una implantación real: suite **284 s**, gates "rápidos" **35 s** sumados.)*

**Diseño correcto:** el script de **definition-of-done** se ejecuta **por tanda** (a mano o al cerrar el trabajo) y, al pasar en verde, **escribe un sello** con una **huella del contenido real del código** (p. ej. hash del árbol de fuentes). El hook `Stop` solo **recalcula la huella y la compara con el sello**: si no coinciden (o no hay sello), **exit 2** → el agente no puede cerrar sin haber pasado el DoD sobre el código **tal como está ahora**. *(Coste medido de esa comprobación: **0,23 s**.)*

**`stop_hook_active`: riesgo de BUCLE INFINITO.** Si el hook `Stop` bloquea y **no comprueba ese flag**, el agente responde, el hook vuelve a bloquear, y así indefinidamente. **Comprobar `stop_hook_active` siempre** en un hook `Stop` que pueda devolver exit 2.

**Coste de cuota:** los hooks **`command` (shell) no consumen cuota de modelo**; los de tipo **`prompt`/`agent` sí**. → **Gates deterministas primero y siempre; gates con modelo, solo por excepción.** El coste real aparece cuando el gate falla y el agente **itera** para arreglarlo: pon un **escape a humano tras N fallos** (evidencia: ofrecer una salida "abort/flag for human" bajó el *cheating* de un modelo puntero del 54% al 9%).

## Umbrales: defendibles vs gameables

- **Cobertura de líneas → INFORMATIVA, nunca gate absoluto.** El 100% sin aserciones útiles es el ejemplo canónico de métrica falseable (induce tests-basura).
- **Cobertura del DIFF → sí es gate razonable** (exigir cobertura solo en el código nuevo/tocado; **80%** como umbral de arranque). **Branch coverage** ≥70-80% en módulos nuevos como gate suave.
- **Mutation score → el gate de calidad-de-los-tests, y la pieza clave del modelo.** No se puede falsear ejecutando código: exige aserciones que **restrinjan** el comportamiento. Es lo único que garantiza que valen algo unos unit tests **que nadie lee**. Arranque: `break` (bloqueante) **60% por módulo crítico**, con **ratchet** (solo puede subir); global informativo; ejecución **incremental** (no full en cada edición).
- **Complejidad y tamaño → gates duros** (p. ej. complejidad ciclomática ≤10-15 por función; función ≤40-60 líneas). Son *constraints ex ante*, no limpieza *ex post*.
- **Duplicación →** informativa.
- **Contraproducentes:** cobertura de líneas al 100% bloqueante; mutation score global al 100% (los *equivalent mutants* lo hacen inalcanzable y caro).

## Regla dura y primera: **verificar ≠ impedir**

Un gate **mide** lo que ya se escribió y corre **después** de escribirlo. Eso da consistencia y no cuesta **un gramo de libertad**. **Nada en esta doctrina autoriza impedir escribir:** la IA es **un compañero de desarrollo más** y escribe código, **tests**, migraciones y configuración con la misma libertad que una persona del equipo. Un mecanismo que impide escribir no mide nada — solo bloquea, y bloquear no aporta consistencia: **aporta parálisis**. Si un gate no puede expresarse como *"comprueba X sobre lo ya escrito"*, **no se instala**.

> **Se aprendió pagándolo.** Una versión anterior de esta doctrina legitimaba dejar los tests en **solo lectura durante la implementación**. Implantado de verdad, el guard impidió escribir **cualquier** test en un proyecto cuyo definition-of-done los **exige** — y, al ser `PreToolUse`, corría al margen del modo de permisos: ni el flag de permisos amplios lo esquivaba. **Paró el trabajo.** Lo único que sí se protege es el **sello** del DoD (y la configuración de detección de secretos): es la **afirmación** de que las puertas pasaron, no el trabajo.

## Antifraude sin bloquear: no se rebaja el listón para pasar

El fraude que importa **no es escribir tests: es ablandar la puerta** para que pase un trabajo que no cumple. Todo lo de aquí ataca eso **sin impedir ni una escritura**:

1. **La IA escribe tests libremente — son parte de su trabajo.** Lo que no hace es **rebajar umbrales, desactivar gates o relajar la baseline** para que pase un cambio suyo, y eso se detecta **sobre el estado final** en el definition-of-done (comparar umbrales, y el sello con la huella del código), no cerrando la puerta de edición. Si algún día proteges una ruta, **verifica dónde vive de verdad**: en un caso real los tests estaban en `src/test/` y un guard sobre `test/**` habría protegido un **directorio inexistente** — falsa sensación de seguridad.
2. **El humano revisa la ESPECIFICACIÓN, no la implementación:** acceptance criteria, contratos y diseño. No los unit tests ni el código.
   > **AVISO de plataforma, medido:** las reglas de permiso **`Write(ruta)` NO se evalúan — solo `Edit(ruta)`**, que cubre toda edición. Un `deny` de `Write(...)` es **inerte**: crees tener una barrera y no la tienes, que es peor que no tener ninguna. Es la misma familia que `--allowedTools`, que **concede y no restringe**. Si de verdad quieres impedir algo, exprésalo como `deny` de `Edit(...)` y **compruébalo**, no lo des por hecho.
3. **Un commit que toca tests + implementación a la vez es una SEÑAL INFORMATIVA, no un rechazo:** es el caso normal de cualquier desarrollo (escribes el test y el código que lo satisface), y bloquearlo genera falsos positivos garantizados — *un gate con falsos positivos acaba desactivado, que es la única forma real de perderlo*.
4. **Mutation score como antifraude estructural:** aunque el agente escriba los tests, si no matan mutantes, el gate lo detecta.
5. **El `PreToolUse` NO es suficiente por sí solo: solo ve `Edit`/`Write`.** Una escritura por **Bash** (`cat > fichero`, `sed -i`, redirecciones) **lo esquiva por completo** — verificado en la implantación real. Por eso **todo invariante que importe debe comprobarse también sobre el ESTADO FINAL del código en el script de definition-of-done** (un `grep` sobre el árbol, venga el cambio por donde venga), no solo en la puerta de edición. Regla: **la puerta de edición disuade; el DoD verifica.** *(Ejemplo real: prohibir `set_config` de `app.*` sin `true` se implementó en el DoD, no en el `PreToolUse`, precisamente por esto.)*
6. **Ratchet en baselines** (PHPStan, cobertura): la baseline **solo puede encoger**; **nunca** se auto-actualiza en el gate (requiere commit humano explícito).

## LLM-as-judge: triaje, nunca puerta

Un segundo agente revisor es **red informativa**, no gate bloqueante: alcanza ~80% de acuerdo con humanos pero arrastra sesgos (posición, verbosidad, *self-enhancement*), *overcorrection*, y su consistencia cae del ~95% (temperatura 0) a ~70% (temperatura 1). Además **consume cuota**. Lo que sí da garantía objetiva son las **fitness functions deterministas** (reglas de dependencia/arquitectura ejecutables). Evita la validación circular (LLM validando LLM).

## Practicidad (Windows) y caveats

- Preferir **binarios estáticos** (Go) que funcionan sin runtime: `gitleaks`, `hadolint`, `goss`. `jq` en el PATH si se usan los ejemplos oficiales.
- **Trampa real en Windows:** un hook que invoque un script `.sh` puede resolver a `C:\Windows\System32\bash.exe` (**stub de WSL**) en vez de a Git Bash y **colgar la TUI ignorando el timeout** (issues #37634, #23556). → usa **ruta explícita** (`"C:/Program Files/Git/bin/bash.exe"`), declara `"shell": "powershell"`, o invoca directamente el intérprete (p. ej. `node script.mjs`), que es lo más portable.
- **Precedencia entre decisiones de hook: `deny > defer > ask > allow`.** Un **`deny` gana incluso bajo `bypassPermissions` / `--dangerously-skip-permissions`** → es el sitio donde poner lo inviolable (push, producción, `.env`, `.git/`, `rm -rf`). Lo inverso no aplica: un `allow` no afloja una deny rule.
- **Gates lentos fuera del camino de edición** (solo en `Stop`/DoD, e incrementales).
- **Falsos positivos:** el análisis estático genera ruido → **baseline + allowlists comentadas** para evitar la fatiga que lleva a ignorar el gate.
- **Hook `defer`** (pausa para aprobación humana) funciona **solo en modo no interactivo (`-p`)**; en sesión interactiva se ignora con warning.
- **Nada de SaaS** de coverage/quality/security ([[prohibido_uso_herramientas_github_excepto_commits_push]]): **soberanía del dato — todo local o en infraestructura propia**. Verificar el `LICENSE` real de cada herramienta ([[licencias_permisivas_estrictas]]).

## Lo que ningún gate cubre (frontera explícita)

Errores semánticos que satisfacen el test · deuda de diseño · vulnerabilidades sutiles (authz, aislamiento de tenant) · requisito mal entendido · condiciones de carrera. **Se cubre con revisión humana de arquitectura/contratos/ADRs + fitness functions**, no con más tests ni con un juez LLM. Acepta esta frontera de forma explícita: el modelo **desplaza** el modo de fallo una capa arriba, no lo elimina.

Relacionada: [[estrategia_de_pruebas_por_tipo_de_proyecto]] (qué exigir a cada asunto), [[verificacion_e2e_por_agente]] (quién ejecuta y reporta), [[no_push_por_subagentes]] (el push exige gate en verde, ejecutado), [[modelo_por_tarea]] (coste de cuota), [[licencias_permisivas_estrictas]].

> Pieza de catálogo `general/comun/packs/codigo/doctrinas/`. **v2.0 (2026-08-01):** la etiqueta se pone al día con un cuerpo que ya lo estaba — **verificar ≠ impedir** es la primera regla dura desde el 29-jul, pero el fichero seguía marcado v1.3, que es justo la versión que legitimaba dejar los tests read-only. Un fichero que dice v1.3 y contiene v2.0 es peor que uno desfasado: al compararlo por versión parece que hay que arreglarlo hacia atrás. Añadido además el aviso de que las reglas **`Write(ruta)` son INERTES** (solo se evalúa `Edit(ruta)`), de la misma familia que `--allowedTools` concede-no-restringe. **v1.3 (2026-07-29):** el **`PreToolUse` solo ve `Edit`/`Write`** → una escritura por **Bash** lo esquiva (verificado), así que **los invariantes se comprueban también sobre el estado final en el DoD**: *la puerta de edición disuade, el DoD verifica*. **v1.2 (2026-07-29):** correcciones traídas de la **primera implantación real**: el hook **`Stop` corre por TURNO**, así que **no ejecuta** el DoD (suite de 284 s ⇒ gate insoportable ⇒ desactivado) sino que **verifica que se ejecutó** mediante **sello + huella del código** (0,23 s); aviso de **`stop_hook_active`** (bucle infinito si el hook bloquea sin comprobarlo); **verificar dónde viven los tests** antes de escribir el guard antifraude (`test/**` no existía: estaban en `src/test/`); y el **typecheck es condicional** (un asunto sin tipos no lo tiene → su sitio lo ocupan las reglas de arquitectura). **v1.1 (2026-07-28):** añadidas la **precedencia `deny > defer > ask > allow`** (el `deny` gana incluso a `bypassPermissions` → es donde va lo inviolable) y la **trampa de Windows** con hooks que invocan `.sh` (stub de WSL que cuelga la TUI ignorando el timeout). v1.0 (2026-07-28). Se **lee** desde el catálogo; **no** se copia al contenedor salvo motivo declarado (`memoria/` es para lo propio del asunto) y **no se hereda** automáticamente.

> Adaptada al esqueleto del seed (`asuntos/<asunto>/`) conservando el vocabulario técnico: el framing neutro del seed aplica al core, no a este pack — 2026-07-29. Cambios del traslado: la unidad pasa de `proyectos/<repo>/` a `asuntos/<asunto>/` (el asunto es el contenedor; el repositorio de código vive dentro de él); se retiran los nombres de los asuntos reales del kit de origen, conservando la medida y el hallazgo de cada caso; el enlace a la doctrina de soberanía del dato queda como texto (`nada de SaaS: todo local o en infraestructura propia`) porque esa pieza **no existe en el catálogo**, ni en el core del seed ni en el kit de origen; y la remisión al estudio de origen se retira porque los estudios **no viajan en el seed** (la evidencia citada en el cuerpo se conserva íntegra).
