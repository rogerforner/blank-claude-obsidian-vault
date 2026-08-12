# `_meta/estudios/` — vigilancia e investigaciones a nivel de kit/vault

Estudios que **no** pertenecen a un proyecto concreto, sino a la mejora del propio kit y del vault (métodos de coordinación, el agente en uso, modelos, plataformas de apoyo). Para investigaciones de un proyecto, ver `asuntos/<slug>/estudios/`.

## Organización

- **Un tema por carpeta:** `_meta/estudios/<tema>/`.
- Cada tema arranca vacío y se puebla cuando el director dispara la vigilancia sobre ese tema (bajo demanda, no por calendario).
- **Un tema puede tener varios briefs en paralelo**, uno por herramienta o proveedor comparable (por ejemplo, el mismo cuestionario para dos chats web distintos). Se mantienen **los dos** y se relanzan a la vez: así la comparación es de igual a igual y se ve qué diferencia es de **capacidad** y cuál de **soberanía de datos**, que no son lo mismo.

## Qué se conserva y qué se borra

Un estudio **no se guarda por haber existido**. Hay dos clases y se tratan distinto:

- **De un solo uso → se borra al aplicarse.** Un estudio que respondía a una pregunta concreta y ya está fundido en el kit **se elimina** (`git rm` + commit) en cuanto sus decisiones están escritas donde se aplican. El histórico de git conserva el texto íntegro, y el resultado perdura en las reglas, la cola y la bitácora. Mantenerlo en el árbol solo invita a releer un informe cuando lo vigente es la regla.
- **De referencia → se queda y se refresca.** Un estudio cuya respuesta **caduca pero cuya pregunta sigue valiendo** se conserva, con su brief listo para relanzar cada cierto tiempo. Son los que dan información que conviene volver a mirar para mejorar.

**Antes de borrar un estudio, comprueba dos cosas:** que lo que aún no se ha ejecutado esté **extraído a su sitio definitivo** (un procedimiento pendiente no puede vivir solo dentro del informe que lo propuso), y que **ningún fichero lo enlace**, o arréglalo en el mismo commit.

## Ciclo de vigilancia de cada tema

El estudio nace de una necesidad real y recorre siempre las mismas etapas:

1. **El brief** (prompt) que enmarca la pregunta: qué se quiere saber, restricciones conocidas, qué NO investigar. Es lo que el director copiará al **chat web** para lanzar la investigación. La investigación con información externa se prepara aquí y se ejecuta en el chat web; **no** se lanza con subagentes de la sesión coordinadora (esos son solo lectura del vault local).
2. **El informe** — el resultado: hallazgos, fuentes, contexto. Es material **crudo**, aún sin decidir. Al archivarlo, **traduce su marcado al nuestro**: muchos informes llaman "medido" a lo que solo está *documentado*, y en este vault medido significa *comprobado en esta máquina*.
3. **La síntesis** — la síntesis accionable del coordinador: qué se decide, qué se descarta y por qué, con recomendación cuando la decisión final es del director. **Aquí es donde se discute con el informe**, no antes: un informe largo puede contradecirse entre bloques, y traer recomendaciones con supuestos de otra plataforma.
4. **Fundir al kit** — lo que la síntesis apruebe se integra en su sitio (doctrinas, plantillas, checklists, ficheros de contexto, bitácora). El **brief cumplido se borra**; el estudio se conserva o se borra según el criterio de abajo; el kit queda mejorado.

## Vacío al arrancar este vault; se puebla durante el uso.

Cada carpeta de tema (`<tema>/`) se crea cuando surge la necesidad y se llena siguiendo el ciclo anterior.
