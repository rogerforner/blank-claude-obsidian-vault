# Trabajo en curso — asunto {{ASUNTO}}

**Una línea por trabajo abierto de ESTE asunto.** No es la cola: la cola dice qué falta, esto dice **qué hay alguien haciendo ya**. Existe para evitar que dos sesiones abran el mismo frente sin saberlo, y para que quien te mande un handoff sepa antes qué tienes a medias.

**El hook de arranque te vuelca por contexto este fichero, y solo este**: cada coordinador ve su propio trabajo en curso y no el de los demás. Quien vaya a mandarte un handoff lo abre en ese momento para no pedirte algo que ya tienes a medias.

## Cómo se escribe una línea

Formato **exacto**; lo comprueba el verificador del kit:

```
- [ABIERTO AAAA-MM-DD] **<qué se está haciendo>** · dueño: `<quién>` · artefacto: `<ruta o ->` — <estado en una frase>
```

- **`<quién>`** es el rol: `coordinador-{{ASUNTO}}`, `ejecutora-<nombre>`, `director`.
- **`<artefacto>` va SIEMPRE desde la raíz del vault**, no desde tu contenedor: `asuntos/{{SLUG}}/cola-pendientes.md`, no `cola-pendientes.md`. **Es la piedra con la que han tropezado ya dos sesiones**, porque el fichero vive en tu carpeta y la ruta parece relativa a ella. El motivo es que quien lo lee —el hook y la puerta del DoD— trabaja sobre el vault entero, no sobre un contenedor. Si todavía no hay fichero, un guion.
- **La fecha es la de apertura.** Si una línea lleva semanas ahí, eso es justo lo que hay que ver.
- **Al cerrar el frente, borra la línea.** Git es el histórico; aquí solo vive lo abierto.
- **Lo que empieza y acaba en tu misma sesión no entra.**

## Abierto

*(Ninguno.)*
