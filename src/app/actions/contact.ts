"use server";

import { z } from "zod";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { siteConfig } from "@/lib/site-config";

/**
 * Prefijo estable para filtrar el log del contenedor en Dokploy.
 * Se declara una sola vez y se referencia en cada punto de registro.
 */
const LOG_PREFIX = "[contact]";

/**
 * Escapa los caracteres que el cliente de correo del doctor podria interpretar
 * como marcado. Lo que escribe el paciente es entrada no confiable y viaja
 * interpolada dentro del HTML del correo.
 */
function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const contactSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre completo."),
  phone: z.string().trim().min(6, "Escribe un teléfono válido."),
  email: z.union([z.literal(""), z.string().trim().email("El correo no es válido.")]),
  reason: z.string().trim().min(5, "Cuéntame brevemente el motivo de tu consulta."),
  // honeypot: campo oculto para humanos; si un bot lo rellena, se detecta más abajo
  // sin fallar la validación (para no revelarle al bot por qué fue rechazado).
  company: z.string().optional(),
});

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  whatsappMessage?: string;
};

export async function submitContactForm(
  _prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  const raw = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    reason: formData.get("reason"),
    company: formData.get("company"),
  };

  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message || "Revisa los datos del formulario.",
    };
  }

  const { name, phone, email, reason, company } = parsed.data;

  const whatsappMessage = `Hola Dr. Angulo, soy ${name} (${phone}). ${reason}`;

  // Honeypot: bots rellenan campos ocultos. Fingimos éxito sin enviar nada.
  // No se registra nada a propósito, para no darle señal al bot.
  if (company) {
    return { status: "success", whatsappMessage };
  }

  // Valores escapados para el cuerpo HTML de los correos. El asunto va en texto
  // plano, así que ahí se usan los valores tal como los escribió el paciente.
  const safeName = escapeHtml(name);
  const safePhone = escapeHtml(phone);
  const safeEmail = email ? escapeHtml(email) : "";
  const safeReason = escapeHtml(reason);

  if (resend) {
    const emailTo = siteConfig.email;

    // Ninguna línea de registro puede llevar datos personales del paciente: el
    // log del contenedor no es un almacén apto para eso. Solo se registra el
    // motivo del fallo y lo que devuelva Resend.
    if (!emailTo) {
      console.error(`${LOG_PREFIX} no se despacha al doctor: falta la casilla destino en el entorno`);
    }

    try {
      const sends: Promise<unknown>[] = [];

      if (emailTo) {
        sends.push(
          resend.emails.send({
            from: EMAIL_FROM,
            to: [emailTo],
            replyTo: email || undefined,
            subject: `Nueva consulta desde la web — ${name}`,
            html: `<p><strong>Nombre:</strong> ${safeName}</p>
<p><strong>Teléfono:</strong> ${safePhone}</p>
<p><strong>Email:</strong> ${safeEmail || "No proporcionado"}</p>
<p><strong>Motivo:</strong> ${safeReason}</p>`,
          })
        );
      }

      if (email) {
        sends.push(
          resend.emails.send({
            from: EMAIL_FROM,
            to: [email],
            subject: "Recibimos tu mensaje — Dr. Juan Carlos Angulo",
            html: `<p>Hola ${safeName},</p>
<p>Gracias por escribir. Recibimos tu consulta y te contactaremos a la brevedad.</p>
<p>Si prefieres una respuesta más rápida, escríbenos directo por WhatsApp: ${siteConfig.whatsapp.displayNumber}</p>`,
          })
        );
      }

      const results = await Promise.allSettled(sends);

      for (const result of results) {
        if (result.status === "rejected") {
          // La razón se asigna antes de registrar: la llamada de registro no
          // puede recibir accesos a propiedad crudos.
          const rejectionReason = result.reason;
          console.error(`${LOG_PREFIX} un despacho quedó rechazado`, rejectionReason);
          continue;
        }

        // El SDK de Resend resuelve la promesa igual y mete el fallo dentro del
        // objeto de respuesta, así que hay que inspeccionar el resultado.
        const settledValue = result.value as { error?: unknown } | null | undefined;
        const sendError = settledValue?.error;

        if (sendError) {
          console.error(`${LOG_PREFIX} Resend devolvió un fallo de despacho`, sendError);
        }
      }
    } catch (thrown) {
      // El envío de correo es un plus, no un requisito: el paciente siempre
      // puede continuar por WhatsApp con el mensaje ya armado.
      console.error(`${LOG_PREFIX} excepción inesperada al despachar`, thrown);
    }
  } else {
    console.error(`${LOG_PREFIX} no se despacha nada: falta la API key de Resend en el entorno`);
  }

  return { status: "success", whatsappMessage };
}
