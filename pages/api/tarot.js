// Variable global para almacenar la última lectura generada
let lastReading = "";

export default function handler(req, res) {
  const readings = [
    "El camino se abre ante ti. Nuevas oportunidades te esperan.",
    "Confía en tu intuición; hoy es un día de revelaciones.",
    "La paciencia es tu aliada. No apresures el proceso.",
    "Un cambio inesperado traerá sabiduría y crecimiento.",
    "La armonía regresa a tu vida. Equilibra mente y corazón.",
    "Una sorpresa agradable se aproxima en tu horizonte.",
    "El universo te envía un mensaje de esperanza y renovación.",
    "Escucha a tu corazón, él sabe lo que necesitas.",
    "Hoy es un buen día para tomar decisiones importantes.",
    "Una persona especial cruzará tu camino muy pronto.",
    "La perseverancia te llevará a alcanzar tus metas.",
    "Tu creatividad está en su punto máximo. Aprovecha este impulso.",
    "Confía en el proceso; cada paso te acerca a tu destino.",
    "Una pequeña acción hoy tendrá grandes repercusiones mañana.",
    "El equilibrio entre dar y recibir es la clave de tu bienestar.",
    "El éxito está al alcance de tu mano, solo debes esforzarte.",
    "Una oportunidad laboral única se presentará en tu camino.",
    "Tus emociones te guiarán hacia un nuevo comienzo.",
    "El amor propio te abrirá puertas que ni imaginabas.",
    "La claridad mental te ayudará a resolver viejos problemas.",
    "Una amistad sincera se convertirá en tu mayor apoyo.",
    "Los desafíos de hoy son las lecciones de mañana.",
    "Tu intuición nunca falla. Confía en ella plenamente.",
    "Un viaje corto podría abrirte la mente a grandes descubrimientos.",
    "El universo conspira a favor de tus sueños.",
    "La confianza en ti mismo es el primer paso hacia el éxito.",
    "Algo que has olvidado volverá a tu vida de forma positiva.",
    "La energía positiva que emanas te abrirá nuevos caminos.",
    "Hoy es el día perfecto para reinventarte.",
    "Un acto de bondad se te devolverá multiplicado.",
    "El momento de actuar es ahora; no dejes pasar la oportunidad.",
    "Tu fortaleza interior te guiará en tiempos difíciles.",
    "Una decisión pendiente se resolverá de manera inesperada.",
    "El cambio es inevitable y te traerá evolución personal.",
    "Una luz en el camino te ayudará a superar la oscuridad.",
    "El optimismo y la fe te llevarán a nuevas alturas.",
    "Un secreto guardado saldrá a la luz de forma beneficiosa.",
    "Tu sabiduría interior te permite ver la verdad en cada situación.",
    "Cada obstáculo es una oportunidad para crecer y aprender.",
    "La armonía en tus relaciones traerá paz a tu vida.",
    "Estás a punto de iniciar un ciclo de transformación positiva.",
    "La serenidad y la calma te llenarán de energía renovadora.",
    "Recuerda que cada final es el comienzo de algo nuevo.",
    "La compasión y el amor serán tus mejores aliados.",
    "Tu determinación romperá todas las barreras del pasado.",
    "El éxito llega a quienes se atreven a soñar en grande.",
    "La claridad en tu visión te permitirá ver oportunidades donde otros ven obstáculos.",
    "Un acto impulsivo se convertirá en una sabia lección de vida.",
    "Tu futuro se ilumina con la promesa de nuevos comienzos.",
    "Abre tu mente y espíritu; lo inesperado te espera."
  ];

  let randomIndex, selectedReading;
  
  // Genera una lectura que sea diferente a la anterior
  do {
    randomIndex = Math.floor(Math.random() * readings.length);
    selectedReading = readings[randomIndex];
  } while (selectedReading === lastReading && readings.length > 1);

  lastReading = selectedReading;
  
  res.status(200).json({ reading: selectedReading });
