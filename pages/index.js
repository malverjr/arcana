import { useState } from 'react';

export default function Home() {
  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);

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
      background: "linear-gradient(135deg, #fa709a, #fee140)",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: "0 1rem"
    }}>
      <h1 style={{
          color: "#333",
          fontSize: "3rem",
          textShadow: "1px 1px 4px rgba(0,0,0,0.3)"
        }}>Tarot Místico IA</h1>
      <p style={{
          color: "#555",
          fontSize: "1.25rem",
          marginBottom: "2rem"
        }}>
        Obtén tu lectura mística personalizada
      </p>
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
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
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
  )
}
