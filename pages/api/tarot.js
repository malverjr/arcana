export default function handler(req, res) {
  const readings = [
    "El camino se abre ante ti. Nuevas oportunidades te esperan.",
    "Confía en tu intuición; hoy es un día de revelaciones.",
    "La paciencia es tu aliada. No apresures el proceso.",
    "Un cambio inesperado traerá sabiduría y crecimiento.",
    "La armonía regresa a tu vida. Equilibra mente y corazón."
  ];

  const randomIndex = Math.floor(Math.random() * readings.length);
  const selectedReading = readings[randomIndex];

  res.status(200).json({ reading: selectedReading });
}
