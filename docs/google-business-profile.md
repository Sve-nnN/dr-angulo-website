# Estrategia de Google Business Profile — Dr. Juan Carlos Angulo Totesaut

Actualizado con las 4 sedes reales confirmadas por el consultorio (9 de agosto de 2026).
Direcciones, teléfonos y coordenadas verificados contra Google Maps.

---

## 1. Las 4 sedes y qué controla el doctor en cada una

| Sede | Dirección verificada | Días y horario | Teléfono | Agenda | ¿Controla el doctor? |
|---|---|---|---|---|---|
| **Consultorio privado** | Av. El Derby 254, piso 24, of. 2403, Lima Central Tower, Santiago de Surco 15023 | Viernes y sábados | +51 964 305 682 | WhatsApp | **Sí. Todo.** |
| Clínica Ricardo Palma | Av. Javier Prado Este 1066, San Isidro 15036 | Lunes y miércoles, 9:00 a. m. a 6:00 p. m. | (01) 224-2224 | Central de la clínica o su web | No |
| SANNA Centro Clínico La Molina | Av. Raúl Ferrero 1256, La Molina 15024 | Martes 8:00 a. m. a 7:00 p. m. / Jueves 8:00 a. m. a 12:00 p. m. | (01) 635-5000 | App de Sanna o llamada | No |
| Clínica Padre Luis Tezza | El Polo 570, Santiago de Surco 15023 | Jueves y viernes, 2:00 p. m. a 6:00 p. m. | (01) 610-5050 | Web de la clínica o llamada | No |

Coordenadas para el pin de cada ficha:
- Consultorio privado: `-12.0977043, -76.9729404`
- Ricardo Palma: `-12.0906021, -77.0182762`
- Sanna La Molina: `-12.0902268, -76.9505892`
- Tezza: `-12.1023734, -76.9714170` (zona El Polo)

**Dato que falta:** el viernes aparece en dos sedes (Tezza 2-6 p. m. y consultorio privado). Confirmar el reparto antes de publicar cualquier horario.

**Corrección pendiente en el sitio:** Clínica Montefiori figura hoy como sede actual en `src/lib/site-config.ts`, `src/content/cv.ts`, `PRODUCT.md` y el JSON-LD de `structured-data.tsx`. Ninguna de las 4 sedes reales es Montefiori. Preguntar si dejó de atender ahí para actualizar o para moverla a trayectoria.

---

## 2. La estrategia, en una frase

**Un solo perfil fuerte en el consultorio privado, no cuatro perfiles débiles.**

El razonamiento:

Google permite que un profesional de la salud tenga una ficha por cada sede donde atiende. La letra chica es que cada ficha necesita contacto directo del profesional en esa dirección, y que el profesional esté realmente ahí en el horario publicado. En Ricardo Palma, Sanna y Tezza el doctor no tiene teléfono propio, no controla la agenda, no puede responder reseñas de la clínica y atiende dos días o menos por semana. Crear fichas ahí produce cuatro problemas concretos:

1. **Se parten las reseñas en cuatro.** Es la variable que decide el ranking local. 40 reseñas en un perfil rankean; 10 en cada uno de cuatro, no.
2. **Riesgo de suspensión por duplicado.** Cuatro fichas con el mismo nombre y el mismo rubro en el mismo distrito de Lima es exactamente el patrón que dispara la revisión manual de Google.
3. **El teléfono no es del doctor.** Poner (01) 224-2224 en una ficha que dice "Dr. Angulo" manda al paciente a la central de la clínica, que le ofrecerá cualquier traumatólogo disponible. Se paga el marketing para entregarle el paciente a la clínica.
4. **No se pueden responder las reseñas.** Las gestiona la clínica.

La única sede donde nada de eso pasa es el consultorio privado de Lima Central Tower: dirección propia, número propio, agenda propia, reseñas propias.

Como bonus, la ubicación juega a favor. El Derby 254 está en el eje Surco / Monterrico, que es justo donde están los competidores fuertes (Castro Bejarano en Surco, Munguía en El Polo 670, y la propia Tezza en El Polo 570). Es el barrio donde se pelea la búsqueda de columna en Lima.

### Qué se hace con las otras tres sedes

No fichas de Google, sino presencia donde sí conviene:

- **Perfil de médico en la web de cada clínica.** crp.com.pe, sanna.pe y clinicatezza.com.pe tienen directorio de especialistas. Pedir alta o actualización del perfil, con foto, especialidades y enlace al sitio propio. Son enlaces desde dominios médicos con autoridad alta, valen más que una ficha fantasma.
- **Página propia por sede en el sitio.** Una URL para cada consultorio (`/consultorios/ricardo-palma`, etc.) con dirección, mapa, días, y el canal de agenda correcto. Eso captura la búsqueda "Dr. Angulo Ricardo Palma" sin depender de Google Business Profile.
- **Mencionar las tres sedes dentro de la ficha del consultorio privado**, en la descripción y en publicaciones. Google lee ese texto y asocia al doctor con esas clínicas.

### Cuándo reevaluar

Cuando el perfil principal tenga verificación aprobada y unas 15 reseñas, se puede pedir a la clínica donde más volumen tenga (probablemente Ricardo Palma) un anexo telefónico directo. Con teléfono propio, esa segunda ficha ya cumple los requisitos y vale la pena. Antes de eso, no.

---

## 3. Ficha principal, campo por campo

### Nombre
```
Dr. Juan Carlos Angulo Totesaut
```
Opción con descriptor, solo si existe placa o membrete que lo diga igual:
```
Dr. Juan Carlos Angulo Totesaut - Traumatólogo y Cirujano de Columna
```
La política pide el nombre del mundo real. La competencia usa descriptores y sobrevive, pero una denuncia puede suspender la ficha. Si hay placa, tomarle foto y guardarla como evidencia.

### Categoría principal
```
Cirujano ortopédico
```

### Categorías secundarias
```
Traumatólogo
Médico
Ortopedista pediátrico
```
Verificar una por una en el buscador del panel, porque no todas existen en Perú. Nunca agregar "Neurocirujano": no corresponde al título y es causa de suspensión.

### Dirección
```
Av. El Derby 254, Piso 24, Oficina 2403
Edificio Lima Central Tower
Santiago de Surco, Lima 15023, Perú
```
Tres cuidados, porque es un edificio corporativo:
- El número de oficina va sí o sí en la línea 2. Sin eso, Google fusiona la ficha con la del edificio.
- Lima Central Tower aloja un Regus y varias oficinas virtuales. Google es estricto con las direcciones de coworking y las rechaza. Hay que poder demostrar consultorio real: placa en la puerta de la 2403 con el nombre del doctor, y foto de la puerta.
- Arrastrar el pin a mano a `-12.0977043, -76.9729404`.

### Zona de servicio
No activar. Es atención en consultorio. Activarla oculta la dirección y hunde el ranking local.

### Horario
```
Viernes: [horario a confirmar]
Sábado:  [horario a confirmar]
Lunes a jueves: cerrado
```
Es tentador poner horario amplio para aparecer como "abierto ahora", pero la ficha es del consultorio privado y ahí atiende viernes y sábados. Un horario inflado produce pacientes que llegan y encuentran cerrado, y esa reseña de una estrella cuesta más que el clic ganado. Cargar además los feriados peruanos como horario especial.

### Teléfono
```
+51 964 305 682
```
El mismo de WhatsApp y el mismo del sitio. Un solo número en todas partes.

### Sitio web
```
https://[dominio]/?utm_source=google&utm_medium=organic&utm_campaign=gbp
```

### Enlace de citas
```
https://[dominio]/agendar?utm_source=google&utm_medium=organic&utm_campaign=gbp_cita
```
Apunta a la página selector de sede (ver sección 6), no directo a WhatsApp. Así el paciente que quiere atenderse en Ricardo Palma un lunes no termina escribiéndole al doctor para algo que la asistente no puede resolver.

### Descripción (límite 750 caracteres)
```
El Dr. Juan Carlos Angulo Totesaut es traumatólogo y cirujano de columna con 15 años de ejercicio. Atiende en su consultorio privado de Lima Central Tower (Surco) y también en Clínica Ricardo Palma, SANNA La Molina y Clínica Padre Luis Tezza. Trata hernia discal, estenosis de canal, escoliosis y otras deformidades, enfermedad degenerativa, lumbalgia, ciática, cervicalgia y fracturas vertebrales. También ve traumatología general y ortopedia infantil. Opera con técnica mínimamente invasiva cuando el caso lo permite. Primero evalúa el tratamiento conservador: la cirugía se plantea solo si hace falta. CMP 83189, RNE 35310.
```
Nombrar las tres clínicas dentro de la descripción es la forma limpia de asociar al doctor con esas instituciones sin abrir fichas separadas.

### Atributos (marcar los que sean ciertos)
```
Planificación:   Se requiere una cita
Accesibilidad:   Entrada accesible en silla de ruedas, estacionamiento accesible,
                 sanitarios accesibles, ascensor
Comodidades:     Sanitario
Estacionamiento: Estacionamiento pagado en el lugar
Pagos:           Tarjetas de crédito, tarjetas de débito, pagos móviles NFC
Salud:           Consulta en línea (si la ofrece)
Idiomas:         Español
```
Lima Central Tower ya declara accesibilidad y estacionamiento en su propia ficha, así que casi todo aplica. Confirmar en sitio de todos modos.

---

## 4. Servicios de la ficha

Cargar cada uno como servicio individual con descripción corta. Es texto indexable y ninguno de los competidores lo tiene completo.

**Cirugía de columna:** hernia discal lumbar y cervical, cirugía mínimamente invasiva, descompresión por estenosis de canal, corrección de escoliosis y deformidades, artrodesis, fracturas vertebrales, enfermedad degenerativa discal, lumbalgia y ciática, cervicalgia.

**Traumatología y ortopedia:** fracturas, artrosis, lesiones de rodilla, lesiones de cadera, lesiones de hombro, lesiones de codo, desgarros musculares, tendinitis.

**Ortopedia infantil:** displasia congénita de cadera, alteraciones de la marcha, escoliosis en niños y adolescentes, deformidades posturales.

**Consulta:** primera consulta de evaluación, lectura de resonancia y radiografías, segunda opinión quirúrgica.

Modelo de descripción, 300 caracteres, adaptar por servicio: "Evaluación y tratamiento de hernia discal lumbar y cervical en Surco, Lima. Primero se revisa la opción conservadora y, si hace falta operar, se explica el procedimiento, los riesgos reales y la recuperación esperada antes de decidir."

Sin precios. El precio se conversa por WhatsApp.

---

## 5. Fotos, reseñas, publicaciones y preguntas

### Fotos
Ya existen y sirven: logo cuadrado (`logo-icon-square.png`), doctor en consulta, doctor con modelo de columna. Convertir de AVIF a JPG porque Google no acepta AVIF.

Faltan y hay que sacarlas en la oficina 2403: interior del consultorio, sala de espera, la puerta con la placa del nombre, y la fachada del edificio con el ingreso. La foto de la placa cumple doble función porque sirve como evidencia si Google pide verificación adicional por ser un edificio de oficinas.

Mínimo 720 px de lado, sin marcas de agua. Agregar geolocalización EXIF con las coordenadas del consultorio. Subir dos o tres fotos nuevas por mes, no todas de golpe.

### Reseñas
Es lo que decide el ranking local. Hoy hay cero.

El desafío particular de este caso: la mayoría de los pacientes se atienden en las clínicas, no en el consultorio privado, y ahí la tentación es dejar la reseña en la ficha de la clínica. Hay que redirigir ese impulso.

- Generar el enlace corto de reseña en el panel (`https://g.page/r/XXXX/review`).
- Pedirla siempre, sin importar la sede donde se atendió. La reseña habla del médico, no del local.
- El mejor momento es el control postoperatorio o la consulta de resultados.
- Enviarla por WhatsApp el mismo día, con un mensaje breve del propio doctor.
- Meta: 10 el primer mes, 5 por mes después. Un salto de 50 en una semana dispara el filtro antispam y Google las borra.
- Responder todas en menos de 48 horas, sin mencionar diagnóstico ni tratamiento del paciente. Eso rompe confidencialidad y viola las políticas de Google. Fórmula segura: agradecer, reafirmar el compromiso, invitar a escribir ante cualquier duda.
- Nunca ofrecer descuentos ni regalos a cambio.

### Publicaciones
Una por semana. Los temas ya están validados en su Instagram: 5 señales de alerta en el dolor de espalda, dolor de espalda contra hernia discal, miedo a operarse, qué es la cirugía mínimamente invasiva, mitos sobre crujirse la espalda, escoliosis en adolescentes, dolor que baja por la pierna.

De 150 a 300 palabras, foto propia, y botón "Más información" hacia el artículo del blog con `?utm_source=google&utm_medium=organic&utm_campaign=gbp_post`.

Ningún competidor de Lima usa publicaciones. Es terreno libre.

### Preguntas y respuestas
Sembrar estas cinco. Se publican desde una cuenta personal y se responden desde la ficha.

1. **¿En qué clínicas atiende el doctor?**
   Atiende en su consultorio privado de Lima Central Tower (Surco) los viernes y sábados, en Clínica Ricardo Palma los lunes y miércoles, en SANNA La Molina los martes y jueves por la mañana, y en Clínica Padre Luis Tezza los jueves y viernes por la tarde. Cada sede tiene su propia forma de agendar.

2. **¿Atiende por seguro o EPS?**
   En el consultorio privado la atención es particular. Para atención por seguro conviene consultar directamente con la clínica correspondiente.

3. **¿Un dolor de espalda siempre termina en cirugía?**
   No. La mayoría de los casos se maneja primero con tratamiento conservador: medicación, terapia física y cambios de hábitos. La cirugía se considera solo cuando eso no funciona o hay compromiso neurológico.

4. **¿Atiende niños?**
   Sí. Ortopedia infantil: displasia de cadera, alteraciones de la marcha, escoliosis en niños y adolescentes, y otras condiciones del desarrollo.

5. **¿Qué llevo a la primera consulta?**
   Si ya tienes radiografías o resonancias, llévalas o envíalas por WhatsApp antes de la cita. Si no tienes estudios previos, igual puedes agendar.

La primera pregunta es la más importante de todas: resuelve en la propia ficha de Google la confusión que hoy termina en mensajes a la asistente pidiendo citas que ella no puede agendar.

---

## 6. La página "Agendar cita" (respuesta a lo que planteó Yuly)

Sí, se puede, y además es la solución correcta al problema de fondo. Hoy todos los botones del sitio van al mismo WhatsApp, así que el paciente que quiere atenderse un lunes en Ricardo Palma escribe igual y pide una cita que la asistente no puede gestionar. El selector corta eso de raíz.

**Cómo queda:**

- Nueva página `/agendar`. Todos los CTA principales del sitio apuntan ahí, con una excepción: el botón flotante de WhatsApp se queda como está, porque sirve para consultas, no para agendar.
- Arriba, una línea que fija la expectativa: "El doctor atiende en cuatro sedes. Cada una tiene su propia forma de reservar."
- Debajo, cuatro tarjetas en orden de utilidad para el paciente, cada una con sede, días, horario, dirección y **un solo botón con el canal correcto**:

| Sede | Botón | Destino |
|---|---|---|
| Consultorio privado, Surco (viernes y sábados) | Escribir por WhatsApp | `wa.me/51964305682` con mensaje prellenado |
| Clínica Ricardo Palma (lunes y miércoles) | Reservar en Ricardo Palma | Web de citas de la clínica + botón secundario "Llamar (01) 224-2224" |
| SANNA La Molina (martes y jueves a. m.) | Reservar en SANNA | Enlace a la app o web de Sanna + "Llamar (01) 635-5000" |
| Clínica Tezza (jueves y viernes p. m.) | Reservar en Tezza | Web de citas de Tezza + "Llamar (01) 610-5050" |

- En las tres tarjetas de clínica, una nota corta y visible: "La cita se agenda directamente con la clínica. El WhatsApp del doctor es solo para consultas."
- El mensaje prellenado del consultorio privado se marca por origen, para saber después qué canal trajo al paciente: `Hola Dr. Angulo, quisiera agendar una cita en su consultorio privado de Surco.`
- Cada botón dispara su propio evento en GA4 y Meta Pixel con la sede como parámetro. Así se mide qué sede pide más gente y se decide con datos, no por intuición.
- Accesibilidad: las tarjetas tienen que ser navegables por teclado, con área táctil grande y contraste alto. Es el patrón del proyecto y aquí importa más, porque son pacientes adultos mayores decidiendo desde el celular.

**Efecto secundario útil:** esa misma página es el destino del enlace de citas de Google Business Profile, del link de Instagram y de cualquier campaña. Un solo lugar que ordena las cuatro puertas de entrada.

**Trabajo de código que implica:** nueva ruta `/agendar`, extender `siteConfig` de una clínica a un arreglo de sedes, actualizar los CTA que hoy van directo a WhatsApp, sumar eventos de tracking por sede, y actualizar el JSON-LD para que el `Physician` tenga la dirección del consultorio privado y las tres clínicas como `hospitalAffiliation`.

---

## 7. Orden de ejecución

1. Confirmar los datos faltantes de la sección 9. Sin eso no se publica nada.
2. Corregir Montefiori en el sitio: `site-config.ts`, `cv.ts`, `PRODUCT.md` y `structured-data.tsx`.
3. Construir `/agendar` con las cuatro sedes.
4. Reclamar la ficha del consultorio privado. Verificación por video es lo más probable en salud: tener a mano la oficina 2403, la placa con el nombre y el carnet del CMP.
5. Cargar nombre, categorías, dirección, teléfono, horario y atributos.
6. Subir logo, portada y las fotos existentes. Programar la sesión de fotos en la 2403.
7. Cargar los servicios uno por uno y publicar la descripción.
8. Sembrar las cinco preguntas y respuestas.
9. Activar el pedido de reseñas en consulta, en las cuatro sedes.
10. Gestionar el perfil de médico en las webs de Ricardo Palma, SANNA y Tezza, con enlace al sitio.
11. Publicar una vez por semana.
12. A los tres meses: revisar si conviene abrir una segunda ficha en la clínica de mayor volumen.

---

## 8. Consistencia NAP

Idéntico, carácter por carácter, en Google Business Profile, el sitio, Doctoralia e Instagram:

```
Dr. Juan Carlos Angulo Totesaut
Av. El Derby 254, Piso 24, Of. 2403, Lima Central Tower, Santiago de Surco, Lima 15023, Perú
+51 964 305 682
```

Doctoralia y el sitio hoy apuntan a Montefiori. Ambos hay que actualizarlos junto con la ficha, o la inconsistencia le resta confianza a la señal local.

---

## 9. Datos que faltan

- **Reparto del viernes.** Aparece en Tezza (2 a 6 p. m.) y en el consultorio privado. ¿Cómo se divide?
- **Horario exacto del consultorio privado** los viernes y sábados.
- **¿Sigue atendiendo en Clínica Montefiori?** Si no, pasa a trayectoria; si sí, es una quinta sede.
- **Placa en la oficina 2403.** ¿Existe? Es requisito práctico para verificar una dirección en edificio corporativo.
- **URL exacta de reserva** de Ricardo Palma, SANNA y Tezza, para los botones de `/agendar`.
- **¿Tiene anexo telefónico propio en alguna clínica?** Define si en el futuro se puede abrir una segunda ficha.
- **¿Ofrece teleconsulta?** Habilita un atributo que casi nadie marca.
- **Dominio definitivo del sitio.**
