"use server";

import { z } from "zod";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { siteConfig } from "@/lib/site-config";

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
  if (company) {
    return { status: "success", whatsappMessage };
  }

  if (resend) {
    const emailTo = siteConfig.email;
    try {
      const sends: Promise<unknown>[] = [];

      if (emailTo) {
        sends.push(
          resend.emails.send({
            from: EMAIL_FROM,
            to: [emailTo],
            replyTo: email || undefined,
            subject: `Nueva consulta desde la web — ${name}`,
            html: `<p><strong>Nombre:</strong> ${name}</p>
<p><strong>Teléfono:</strong> ${phone}</p>
<p><strong>Email:</strong> ${email || "No proporcionado"}</p>
<p><strong>Motivo:</strong> ${reason}</p>`,
          })
        );
      }

      if (email) {
        sends.push(
          resend.emails.send({
            from: EMAIL_FROM,
            to: [email],
            subject: "Recibimos tu mensaje — Dr. Juan Carlos Angulo",
            html: `<p>Hola ${name},</p>
<p>Gracias por escribir. Recibimos tu consulta y te contactaremos a la brevedad.</p>
<p>Si prefieres una respuesta más rápida, escríbenos directo por WhatsApp: ${siteConfig.whatsapp.displayNumber}</p>`,
          })
        );
      }

      await Promise.allSettled(sends);
    } catch {
      // El envío de email es un plus, no un requisito — el paciente siempre puede
      // continuar por WhatsApp con el mensaje ya armado.
    }
  }

  return { status: "success", whatsappMessage };
}
