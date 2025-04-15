import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [gifSrc, setGifSrc] = useState("/1744681156832.gif"); // Asegúrate de que el GIF se llama wizard.gif y esté en public/

  async function getReading() {
    setLoading(true);
    setReading("");
    try {
      const res = await fetch('/api/tarot');
      const data = await res.json();
      setReading(data.reading);

      // Reiniciar el GIF forzando una recarga desde el inicio:
      // Se genera un valor único, por ejemplo, usando Date.now()
      const randomParam = Date.now();
      setGifSrc(`/wizard.gif?_t=${randomParam}`);
    } catch (error) {
      setReading("Error al obtener la tirada. Inténtalo de nuevo.");
    }
    setLoading(false);
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #000428, #004e92)",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: "0 1rem"
    }}>
      <Head>
        <title>Tarot Místico IA</title>
      </Head>

      <h1 style={{
          color: "#fff",
          fontSize: "3rem",
          textShadow: "1px 1px 4px rgba(0,0,0,0.3)"
        }}>
        Tarot Místico IA
      </h1>

      {/* Mostrar el GIF con src dinámico */}
      <img
        src={gifSrc}
        alt="Mago animado"
        style={{ width: "200px", height: "200px", marginBottom: "2rem" }}
      />

      <button 
        onClick={getReading} 
        style={{
          padding: "1rem 2rem",
          fontSize: "1.25rem",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          backgroundColor: "#fff",
          color: "#333",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          transition: "transform 0.2s"
        }}
        onMouseOver={(e)=>e.currentTarget.style.transform="scale(1.05)"}
        onMouseOut={(e)=>e.currentTarget.style.transform="scale(1)"}
      >
        {loading ? "Leyendo..." : "Haz tu tirada"}
      </button>

      {reading && (
        <div style={{
          marginTop: "2rem",
          fontSize: "1.5rem",
          color: "#333",
          background: "rgba(255, 255, 255, 0.8)",
          padding: "1rem 2rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
        }}>
          {reading}
        </div>
      )}
    </div>
  );
}
