# Trabajo en curso — quién está haciendo qué, ahora mismo

**Una línea por trabajo abierto.** Esto NO es la cola: la cola dice qué falta, esto dice **qué hay alguien haciendo ya**. Existe para una sola cosa, y es evitar que dos sesiones abran el mismo frente sin saberlo — o que un coordinador reciba un handoff pidiéndole algo que ya tiene a medias.

**El hook de arranque lo vuelca por contexto en cada sesión de coordinación**, la de la raíz y la de cada asunto, así que no hace falta abrirlo para verlo. Ese volcado es lo que lo convierte en mecanismo: una regla que dependa de que alguien se acuerde de mirar un fichero no es una regla.

## Cómo se escribe una línea

Formato **exacto** —lo comprueba el verificador, porque un formato que deriva deja de ser legible para el hook y el aviso se pierde en silencio—:

```
- [ABIERTO AAAA-MM-DD] **<qué se está haciendo>** · dueño: `<quién>` · artefacto: `<ruta o ->` — <estado en una frase>
```

- **`<quién>`** es el rol, no la persona: `coordinador-general`, `coordinador-climatizacion`, `coordinador-homeassistant`, `ejecutora-<nombre>`, `director`.
- **`<artefacto>`** es dónde vive el trabajo. Si todavía no hay fichero, un guion.
- **La fecha es la de apertura**, no la de la última vez que se tocó. Si una línea lleva semanas abierta, eso es exactamente lo que hay que ver.

## Cuándo se toca

- **Al abrir** un frente que va a sobrevivir a tu sesión: añade su línea **en el mismo commit** en que empiezas.
- **Al cerrarlo:** borra la línea. Git es el histórico; aquí solo vive lo abierto.
- **Antes de mandar un handoff a otro coordinador:** míralo. Si el destinatario ya tiene abierto lo que ibas a encargarle, el handoff cambia — o no se manda.
- **Lo que no cruza sesiones no entra.** Una tarea que abres y cierras en la misma sesión no se escribe aquí; se escribe en la cola si deja algo.

## Abierto

*(Ninguno.)*
