# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Tres audiencias primarias con el mismo peso, ninguna subordinada a otra:

1. **Adulto con dolor de columna** (aprox. 40-70 años, Lima). Llega con dolor lumbar o cervical persistente, hernia discal, estenosis o dolor irradiado a piernas. Suele llegar asustado por la palabra "cirugía" y busca saber si la necesita y en quién confiar.
2. **Paciente de traumatología general.** Lesión, fractura, dolor articular. Busca un traumatólogo con credenciales verificables en Lima.
3. **Padres o madres de niños con problema ortopédico.** Buscan ortopedia infantil (deformidades, escoliosis, evaluación temprana). Deciden por el hijo, no por sí mismos.

Los tres llegan casi siempre desde el celular, muchas veces por búsqueda en Google o desde el Instagram del doctor, y el trabajo que quieren terminar es el mismo: decidir si este es el médico correcto y agendar la cita sin fricción.

## Product Purpose

Sitio de captación de pacientes para el Dr. Juan Carlos Angulo Totesaut (consulta privada, Clínica Montefiori, La Molina, Lima). Existe para que un paciente que busca traumatólogo o cirujano de columna en Lima encuentre el sitio, confíe en el doctor a partir de credenciales, trayectoria y testimonios reales, y agende cita por WhatsApp en menos de dos clics. Éxito = citas agendadas por WhatsApp o formulario, con cada evento de contacto rastreado por ubicación de CTA.

## Positioning

Un solo médico con trayectoria verificable en tres especialidades que en Lima suelen estar repartidas entre distintos profesionales: traumatología, ortopedia infantil y cirugía de columna. 15 años de experiencia, traumatólogo por la Universidad de Oriente (Núcleo Bolívar), especialización de columna en el Instituto de Columna de Caracas (Hospital de Clínicas Caracas). CMP 83189 / RNE 35310. Maneja tanto procedimientos convencionales como mínimamente invasivos para deformidades (escoliosis), enfermedad degenerativa y procesos inflamatorios. La competencia directa en Lima (drcarranzacolumna.com, drciezatraumatologia.com, cirujanocolumna-elaos.com) se limita a columna.

## Operating Context

- Consulta privada, **no trabaja con seguros**. Sede actual: Clínica Montefiori, Av. Separadora Industrial 1820, La Molina, Lima.
- WhatsApp (+51 964 305 682) es el canal real de agendamiento, no un extra. El propio doctor lo usa a diario y lo pone en casi todos sus posts de Instagram. El formulario de contacto es el canal secundario.
- El paciente peruano promedio no reserva por calendario web: escribe por WhatsApp. Por eso no hay sistema de reservas y esa decisión es deliberada.
- El contenido educativo del doctor vive en Instagram @dr.juancarlosangulo (3,429 seguidores), incluidos testimonios en video. El sitio enlaza a Instagram porque la plataforma bloquea el scraping.
- El contenido del sitio se edita por código, sin CMS. Pedido explícito del cliente para mantener el stack simple.
- Deploy en infraestructura propia (Dokploy self-hosted sobre Hetzner, proyecto `client-dr-angulo`), no en Vercel. Sin dominio público asignado todavía: el registro DNS y las variables de entorno de Resend, GA4 y Meta Pixel quedan pendientes de esa decisión.

## Capabilities and Constraints

**Funcionalidad confirmada:** Home, Sobre el doctor con trayectoria, Servicios y condiciones tratadas, Testimonios, Preguntas frecuentes, Blog educativo, Contacto con formulario (Resend) más mapa de la clínica, botón flotante de WhatsApp en todo el sitio con mensaje prellenado por ubicación, JSON-LD `Physician` + `FAQPage`, sitemap y robots, tracking de eventos en GA4 y Meta Pixel, política de privacidad, carrusel de reels de Instagram (en fallback hasta configurar el token).

**Stack:** Next.js 16 App Router + TypeScript + Tailwind CSS 4. Sin CMS ni backend propio.

**Fuera de alcance (v1):** calendario o reservas en vivo, pagos en línea, portal de paciente, inglés o multi-idioma, panel de administración.

**Restricción de veracidad — no negociable:** no inventar credenciales médicas, cifras de cirugías realizadas, años de experiencia ni testimonios. Solo se publica lo verificado o lo que el doctor confirme. Cualquier trabajo futuro que necesite un dato nuevo lo pide, no lo estima.

**Cumplimiento:** Ley de Protección de Datos Personales (Perú). El aviso de cookies debe cargar antes que GA4 y Meta Pixel.

**Mercado y lenguaje:** Lima, Perú. Español neutro, moneda soles (S/).

**Decisiones abiertas:**
- Dominio público sin definir. El sitio corre sin dominio por decisión explícita del cliente.
- CV completo del doctor (nombres y fechas de cursos y entrenamientos internacionales) pendiente de entrega. Lo confirmado el 2026-08-08 ya está publicado.
- Archivo vectorial del logo pendiente.
- La paleta actual (teal + dorado) **no** quedó marcada como vinculante: es la identidad incumbente y puede revisarse en trabajo visual futuro.

## Brand Commitments

- **Nombre:** "Dr. Juan Carlos Angulo Totesaut" en formal, "Dr. Juan Angulo" en corto.
- **Logo JA actual (vinculante).** Monograma J+A con la diagonal de la A formada por puntos que simulan una columna vertebral. El archivo en repo es un recorte de captura de Instagram y se mantiene como logo oficial hasta que llegue el vectorial. No se reemplaza ni se rediseña por cuenta propia.
- **Fotos reales del doctor (vinculante).** `public/dr-angulo-consulta.avif`, `public/dr-angulo-implante-disco.avif`, `public/dr-angulo-modelo-columna.avif`. Son el material visual obligatorio del sitio. Nada de stock ni de retratos genéricos para representar al doctor. (El retrato antiguo `public/dr-angulo-portrait.png`, un frame de video con marca de agua, se borró del repo en la fase 10 por SEO-11.)
- **Voz:** educativa y tranquilizadora, no alarmista. El miedo a la cirugía de columna es el tema recurrente de su Instagram y el sitio lo trata de frente. Cercana pero profesional, sin infantilizar al paciente.
- **Paleta teal + dorado:** identidad incumbente, no declarada vinculante.

## Evidence on Hand

**Real y disponible:**
- Fotos profesionales del doctor (agosto 2026), listadas arriba.
- Credenciales verificables: CMP 83189, RNE 35310.
- Trayectoria: Hospital Ruiz y Páez (2007-2009), Clínica San Juan de Dios San Luis (2018-2019), Clínica Montefiori desde diciembre 2018.
- Perfiles públicos: Instagram @dr.juancarlosangulo, Doctoralia.
- Temas educativos ya validados en su Instagram, base del blog (miedo a operarse, 5 síntomas de alerta, dolor de espalda vs hernia discal, estenosis degenerativa, dolor irradiado a la pierna, mitos sobre crujirse la espalda, valoración temprana, carga asimétrica).
- Testimonios en video en el post `https://www.instagram.com/p/CoE2FSWOJgR/`, enlazados desde Home y Testimonios.

**Ausencias que no se rellenan inventando:**
- No hay cifra pública de cirugías realizadas ni tasa de éxito.
- No hay reseñas de Google Business Profile: el perfil todavía no está reclamado.
- **No se muestra precio de consulta.** Decisión tomada: el precio se conversa por WhatsApp. El dato de Doctoralia (~S/130 presencial, ~S/100 online) nunca se confirmó y no se publica.
- Los testimonios en texto no se transcriben ni se parafrasean sin el material original del doctor.

## Product Principles

1. **WhatsApp gana siempre.** Cualquier recorrido, en cualquier página, tiene que terminar a un toque de escribirle al doctor con un mensaje ya escrito y el evento rastreado.
2. **La confianza se construye con lo verificable.** Credenciales, sedes, años y fotos reales hacen el trabajo que en otros rubros haría el copy persuasivo. Un dato inventado destruye más de lo que cualquier titular aporta.
3. **Bajar el miedo antes de vender la cirugía.** El paciente llega asustado. El sitio educa primero y convierte después; ese es el mismo movimiento que ya funciona en su Instagram.
4. **Tres puertas de entrada, una sola casa.** Columna, traumatología y ortopedia infantil merecen recorridos legibles por separado sin fragmentar la identidad del doctor.
5. **Móvil primero, de verdad.** Casi todo el tráfico llega desde el celular por Google o Instagram. Lo que no funciona a una mano en un celular de gama media, no funciona.

## Accessibility & Inclusion

Se aplican estrictamente las reglas de A11Y.md (https://github.com/fecarrico/A11Y.md/blob/main/docs/en/A11Y.md), requisito permanente del cliente para todo el frontend. Peso extra en este proyecto por el perfil de los usuarios: pacientes adultos mayores con posible baja visión y personas con dolor o movilidad reducida navegando desde el celular. Objetivos de tamaño amplios, contraste alto y nada de interacciones que exijan precisión fina.
