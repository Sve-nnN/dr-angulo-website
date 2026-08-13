/**
 * Acordeón de preguntas cortas de v1.0. Desde el plan 08-19 solo conserva lo
 * que el cuerpo aprobado de `/preguntas-frecuentes` no responde: recuperación
 * después de operar, plazo de vuelta al trabajo y cómo se saca la cita en cada
 * sede. Las siete preguntas restantes se retiraron porque su respuesta ya vive
 * en el texto del paquete y la página no puede decir dos veces lo mismo con
 * palabras distintas. La comparación pregunta por pregunta está transcrita en
 * `08-19-SUMMARY.md`.
 *
 * Lo consumen tres superficies: la ruta `/preguntas-frecuentes`, el bloque de
 * preguntas del inicio y `llms.txt`.
 */

export type FaqItem = { question: string; answer: string };

export const faqItems: FaqItem[] = [
  {
    question: "¿Cómo es la recuperación después de una cirugía de columna?",
    answer:
      "Depende del procedimiento y de cada paciente. En general se busca una movilización temprana y progresiva, con seguimiento cercano. En la consulta se conversa el plan de recuperación específico antes de decidir cualquier intervención.",
  },
  {
    question: "Después de una cirugía de columna, ¿cuánto tiempo puedo tardar en volver a trabajar?",
    answer:
      "Depende del tipo de cirugía y del paciente. En general puede variar entre 3 y 8 semanas — en la consulta se conversa un estimado más preciso según tu caso y tipo de trabajo.",
  },
  {
    question: "¿Cómo agendo una cita?",
    answer:
      "Depende de dónde quieras atenderte. En el consultorio privado se agenda por WhatsApp al +51 964 305 682, que es la agenda que maneja el propio doctor. En Ricardo Palma, Sanna y Tezza la cita se saca con cada clínica: por su central telefónica, su web o su app, según la sede. El doctor no puede reservar citas de las clínicas por ti porque esas agendas son de cada institución.",
  },
];
