import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);

  // Ruta de tu GIF con fondo negro (asegúrate de subirlo a /public)
  // Por ejemplo: /Art Glow GIF by xponentialdesign.gif
  const [gifSrc, setGifSrc] = useState("/Art Glow GIF by xponentialdesign.gif");

  async function getReading() {
    setLoading(true);
    setReading("");
    try {
      const res = await fetch('/api/tarot');
      const data = await res.json();
      setReading(data.reading);
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
      // Fondo completamente negro
      background: "black",
      // Cambiamos la fuente y el color de textos
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: "white",
      padding: "0 1rem"
    }}>
      <Head>
        <title>Arcana</title>
      </Head>

      <h1 style={{
        fontSize: "3rem",
        textShadow: "1px 1px 4px rgba(255,255,255,0.3)"
      }}>
        Arcana
      </h1>
      
      {/* GIF central con fondo negro */}
      <img
        src={gifSrc}
        alt="Animación Mística"
        style={{
          width: "300px",
          height: "300px",
          marginBottom: "2rem",
          objectFit: "cover"
        }}
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
          boxShadow: "0 4px 8px rgba(255, 255, 255, 0.2)",
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
          color: "#fff",
          background: "rgba(255, 255, 255, 0.1)",
          padding: "1rem 2rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(255,255,255,0.2)"
        }}>
          {reading}
        </div>
      )}
    </div>
  );
}
