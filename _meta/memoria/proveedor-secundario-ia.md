---
name: proveedor-secundario-ia
description: "Interruptor del segundo proveedor de IA del vault. Nace en FALSE: ninguna sesion lanza su CLI ni le manda nada. El deny de los perfiles es la barrera real; esta ficha solo declara el estado."
metadata: 
  node_type: memory
  type: project
---

> **Esta ficha nace con la plantilla y es la única de `memoria/` que no se crea sobre la marcha.** Un interruptor que hay que acordarse de crear no protege de nada: tiene que existir desde el primer arranque, apagado. Rellena la fecha del estado al inicializar el vault y borra este bloque.

## ESTADO — esta línea manda

**`PROVEEDOR_SECUNDARIO_IA = false`** *(desde el arranque del vault)*

Mientras diga `false`, **ninguna sesión de este vault lanza el CLI de un segundo proveedor, ni le manda contenido, ni cuenta con él para planificar una tanda.** No es "todavía no está montado": es que **no está autorizado**. Si una tanda parece necesitarlo, la respuesta es parar y decírselo al director, no improvisar la vía.

**Lo que de verdad lo impide no es esta ficha, es el `deny` de los perfiles de `settings.json`.** Esto lo **declara** para que cualquier agente sepa en qué estado está sin tener que leer cinco ficheros de configuración; la barrera es la otra. Si algún día los dos se contradicen, **gana el `deny`** y lo que hay que arreglar es esta ficha.

## Qué habilita cada estado

| | `false` (por defecto) | `true` |
|---|---|---|
| Lanzar su CLI desde una sesión | **No**, denegado en los perfiles | Sí, **solo en proceso aparte**, como se lanza una ejecutora |
| Mandarle material del vault | **No** | Solo lo que permita [[soberania_datos_local]]: **nunca secretos**; material de trabajo sí a cuaderno cerrado |
| Que escriba en el vault | **No** | **Tampoco.** Un solo escritor, y no cambia al girar la llave |
| Que coordine o decida | **No** | **Tampoco.** Ejecutar, leer, resumir y extraer sí; coordinar y decidir no |
| Contar con él al planificar | **No** | Sí, y **midiendo**: el reparto se justifica por tarea, no por marca |

**Las dos filas que no cambian al girar la llave son el punto entero.** El interruptor decide **si existe el canal**, no qué se le confía: eso lo fija [[reparto_entre_proveedores_ia]] y es igual con el flag en `true` o en `false`.

## Qué hace falta para ponerlo en `true`

No es un gesto, son cuatro, y **el director da el último**:

1. **Cuenta contratada.** Sin ella no hay caso de uso presente, y el gate de adopción exige presente, no futuro → [[adopcion_tooling_externo_caso_uso_concreto]].
2. **Verificar cómo se autentica**, en la propia máquina y no en un informe. Si pide clave de API o proyecto facturable, **se para**: factura aparte en silencio. Si automatiza una sesión de navegador, **se descarta** por condiciones de uso.
3. **Piloto medido como lector**, lanzado por consola igual que una ejecutora, con el criterio de éxito escrito **antes** de empezar.
4. **El director gira la llave**: se cambia esta línea a `true` y se retira el `deny` de los perfiles, **en el mismo commit**. Los dos gestos o ninguno.

**Y el procedimiento concreto se deja deliberadamente EN BLANCO hasta el paso 3.** Lo que se sepa del CLI candidato antes de ejecutarlo viene de informes, y un informe recomendó una vez como mecanismo principal una herramienta retirada dos meses antes. **Escribir el procedimiento antes del piloto es inventarlo.**

## Por qué existe este fichero estando el flag en `false`

Porque **apagado es cuando sirve**. Un vault sin interruptor no está protegido: está sin decidir, y una sesión futura con una tanda pesada delante puede improvisar la integración por su cuenta y creer que hace lo correcto. **El estado por defecto tiene que quedar escrito, y escrito donde lo alcanza cualquier coordinador** — por eso vive en `_meta/memoria/`, que es directorio de lectura también para los coordinadores de asunto.

Relacionadas: [[reparto_entre_proveedores_ia]], [[soberania_datos_local]], [[modelo_por_tarea]].
