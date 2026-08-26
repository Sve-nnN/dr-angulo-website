# Indexación y enlaces de entrada (fase 17, issue #1)

Material de trabajo para las tres tareas que pueden mover las 20 URLs que Google
descubrió y nunca rastreó: pedir el rastreo, conseguir enlaces desde otros
dominios y publicar entradas del perfil de Google Business hacia páginas
internas.

La ejecución material es de Juan y del doctor, porque hace falta acceso a Search
Console, al perfil de Google Business y a las clínicas. Acá está lo que se hace,
en qué orden, con qué texto y cómo se mide.

---

## 1. Dónde estamos, medido el 2026-08-26

Inspección de las ocho páginas núcleo en `sc-domain:drangulocolumna.com`:

| URL | Estado | Último rastreo |
|---|---|---|
| `/servicios/escoliosis-y-deformidades` | Indexada, sirviendo breadcrumbs | 2026-08-17 |
| `/servicios` | Descubierta, sin indexar | nunca |
| `/servicios/hernia-discal` | Descubierta, sin indexar | nunca |
| `/servicios/estenosis-espinal` | Descubierta, sin indexar | nunca |
| `/servicios/ortopedia-infantil` | Descubierta, sin indexar | nunca |
| `/sobre-el-doctor` | Descubierta, sin indexar | nunca |
| `/preguntas-frecuentes` | Descubierta, sin indexar | nunca |
| `/sedes/consultorio-privado` | Desconocida para Google | nunca |

Dos novedades contra la auditoría del 23 de agosto. La primera es buena:
escoliosis pasó a indexada y ya sirve migas de pan en el resultado, así que el
schema de la fase 10 hace lo que promete. La segunda es que `/sedes/consultorio-privado`
figura peor que el resto, como desconocida y no como descubierta.

### Por qué la sede desconocida no es un error del sitio

Se revisó entera antes de escribir esto:

- Responde 200 en producción.
- Declara `index, follow` y canonical propio hacia sí misma.
- No tiene `x-robots-tag` de bloqueo y `robots.txt` solo cierra `/api/`.
- Está en el sitemap, que sirve las 23 URLs.
- La enlazan siete páginas del sitio con un `<a href>` real: `/agendar`, `/sedes`
  y cinco páginas de servicio.

No hay nada que arreglar en el código. Las siete páginas que la enlazan tampoco
están rastreadas, así que Google todavía no leyó ninguno de esos enlaces. Es el
mismo cuello de botella del issue, visto desde una URL: sin señales externas, el
sitio no recibe presupuesto de rastreo suficiente para bajar del primer nivel.

---

## 2. IDX-01: solicitar el rastreo

En Search Console, inspección de URL, botón "Solicitar indexación", una por una.
Google permite alrededor de diez o doce pedidos por día por propiedad.

Orden sugerido, de mayor a menor valor comercial:

| # | URL | Fecha del pedido | Rastreo confirmado |
|---|---|---|---|
| 1 | `/servicios/hernia-discal` | | |
| 2 | `/servicios/estenosis-espinal` | | |
| 3 | `/servicios` | | |
| 4 | `/sedes/consultorio-privado` | | |
| 5 | `/servicios/ortopedia-infantil` | | |
| 6 | `/sobre-el-doctor` | | |
| 7 | `/preguntas-frecuentes` | | |
| 8 | `/servicios/cirugia-minimamente-invasiva` | | |

Se anota la fecha en la misma tabla, porque el criterio de fallo se cuenta desde
ahí.

**Fecha de corte: 21 días después del último pedido.** Si para entonces las
páginas siguen sin fecha de rastreo, el cuello no es de rastreo sino de
autoridad, y el esfuerzo se mueve entero al punto 3 en lugar de escribir
contenido nuevo. Eso reabre FUT-IDX-01, no esta fase.

---

## 3. IDX-02: enlaces desde otros dominios

Es lo único que puede destrabar el fondo del problema. Un sitio nuevo sin
enlaces entrantes no justifica gasto de rastreo, por bien construido que esté.

La meta del issue son tres dominios de terceros apuntando a páginas internas, no
a la portada. Los candidatos ordenados por facilidad y por valor:

| Objetivo | Dónde | Qué se pide | A quién |
|---|---|---|---|
| Clínica Ricardo Palma | crp.com.pe, directorio de especialistas | Alta o actualización del perfil del doctor con enlace a `/sobre-el-doctor` | Coordinación médica de la clínica |
| SANNA La Molina | sanna.pe, staff médico | Lo mismo, enlace a `/sedes/sanna-la-molina` | Coordinación de la sede |
| Clínica Padre Luis Tezza | clinicatezza.com.pe, especialidades | Lo mismo, enlace a `/sedes/clinica-tezza` | Coordinación de la clínica |
| Doctoralia | Perfil del doctor | Campo de sitio web apuntando a `/sobre-el-doctor` | Se edita solo, desde el panel |
| Colegio Médico del Perú | Registro del colegiado | Verificar que los datos coincidan con el sitio | Trámite del doctor |

Los tres perfiles de clínica valen más que cualquier directorio: son dominios
médicos con recorrido y el enlace es legítimo, porque el doctor efectivamente
atiende ahí.

### Texto para pedir el perfil en la clínica

Para mandar por correo a la coordinación de cada clínica. Reemplazar lo que está
entre corchetes.

> Buenos días, [nombre]:
>
> Escribo de parte del Dr. Juan Carlos Angulo Totesaut, traumatólogo y cirujano
> de columna que atiende en [clínica] los días [días].
>
> Vi que la web de la clínica tiene un directorio de especialistas. Quería pedir
> que se dé de alta su perfil, o que se actualice si ya existe. Puedo enviar la
> foto, el número de colegiatura, el RNE y el detalle de especialidades en el
> formato que usen.
>
> Si el directorio permite incluir la web del especialista, la del doctor es
> https://drangulocolumna.com.
>
> Quedo atento a lo que necesiten de nuestro lado.
>
> [firma]

### Qué no hacer

No conviene comprar altas en directorios médicos de baja calidad ni sembrar
perfiles en sitios donde el doctor no atiende. Tres enlaces reales resuelven el
issue; treinta enlaces de relleno dejan un rastro que después cuesta limpiar.

---

## 4. IDX-03: entradas del perfil de Google Business

Ocho entradas listas para copiar y pegar: una por sede y una por condición. Cada
una abre una página interna concreta, que es el punto del requisito.

**Los enlaces van sin `utm`.** Es la decisión de MEAS-01, escrita en
`docs/google-business-profile.md` y medida en
`audit/baselines/2026-08-25-baseline-utm-gbp.md`: los parámetros partían el
informe de Search Console en varias filas por la misma página. El canal sigue
medido, pero por el informe propio del perfil, que ya cuenta clics al sitio.

Botón sugerido para todas: "Más información", con la URL de la entrada.

### Sedes

**Consultorio privado, Surco**

> El consultorio propio del doctor queda en Lima Central Tower, Av. El Derby 254,
> piso 24. Atiende viernes y sábados de 9 a. m. a 5 p. m., y es la única sede
> donde la cita se coordina directamente por WhatsApp, sin pasar por una
> central. Si necesitas que te vea por un dolor de espalda o de cuello, o traes
> una resonancia para que la revise, esta es la puerta más rápida.
>
> https://drangulocolumna.com/sedes/consultorio-privado

**Clínica Ricardo Palma**

> El doctor atiende en Clínica Ricardo Palma, Av. Javier Prado Este 1066, San
> Isidro, los lunes y miércoles de 9 a. m. a 6 p. m. Las citas de esta sede se
> reservan por la central de la clínica, al (01) 224-2224, o por su web. En la
> página está el detalle de cómo llegar y qué llevar a la consulta.
>
> https://drangulocolumna.com/sedes/clinica-ricardo-palma

**SANNA Centro Clínico La Molina**

> En SANNA La Molina, Av. Raúl Ferrero 1256, el doctor atiende los martes de 8
> a. m. a 7 p. m. y los jueves de 8 a. m. a 12 p. m. La cita se saca por la app
> de Sanna o llamando a la clínica. En la página de la sede está la dirección,
> el mapa y el canal correcto para reservar.
>
> https://drangulocolumna.com/sedes/sanna-la-molina

**Clínica Padre Luis Tezza**

> Los jueves y viernes de 2 a 6 p. m. el doctor atiende en Clínica Padre Luis
> Tezza, El Polo 570, Surco. Las citas se reservan por la web de la clínica o
> por teléfono al (01) 610-5050. La página de la sede tiene la ubicación exacta
> y el canal de reserva.
>
> https://drangulocolumna.com/sedes/clinica-tezza

### Condiciones

**Hernia discal**

> Una hernia discal no siempre se opera. Antes de esa conversación están el
> diagnóstico, el tiempo de evolución y qué tanto responde al tratamiento
> conservador. En la guía del sitio está explicado qué síntomas la distinguen de
> un dolor de espalda común, qué estudios sirven de verdad y cuáles son las
> señales que sí obligan a consultar sin esperar.
>
> https://drangulocolumna.com/servicios/hernia-discal

**Estenosis espinal**

> Si caminas dos cuadras y tienes que sentarte porque las piernas se cansan o se
> duermen, y al sentarte mejora, vale la pena leer sobre estenosis espinal. La
> guía explica por qué aparece, qué la diferencia de un problema de circulación
> y qué opciones hay antes de pensar en cirugía.
>
> https://drangulocolumna.com/servicios/estenosis-espinal

**Escoliosis y deformidades**

> La escoliosis se sigue con controles y medición, no con una sola radiografía.
> En la guía está cómo se evalúa el ángulo, qué cambia entre un caso de
> adolescente en crecimiento y uno de adulto, y en qué momento el corsé o la
> cirugía entran en la conversación.
>
> https://drangulocolumna.com/servicios/escoliosis-y-deformidades

**Ortopedia infantil**

> Muchos papás llegan a consulta preocupados porque el niño camina raro, se para
> con las rodillas juntas o tiene un pie plano. Buena parte de eso es parte del
> desarrollo y se resuelve solo. La guía explica qué sí conviene revisar a
> tiempo y a qué edad, para consultar cuando corresponde y no antes.
>
> https://drangulocolumna.com/servicios/ortopedia-infantil

### Reglas del copy de estas entradas

Las ocho respetan la restricción de contenido médico del proyecto: no afirman
cifras de cirugías, tasas de éxito ni resultados, y no atribuyen al doctor
credenciales que no estén verificadas. Si el doctor quiere sumar algo clínico,
se agrega después de su revisión, no antes.

---

## 5. Cómo se sabe si funcionó

El issue #1 se cierra con dos números, a 60 días del primer pedido:

- **15 o más URLs con impresiones** en el informe de Rendimiento, contra las 6
  del punto de partida.
- **18 o más URLs indexadas**, contra la que había confirmada al abrir el issue.

Vale la pena volver a correr la inspección de las ocho páginas núcleo cada
semana y anotar el resultado en la tabla del punto 2. Es un minuto de trabajo y
es lo que permite decidir con dato y no con impresión.
