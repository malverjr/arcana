import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Home() {
  // ⚠️ CAMBIA ESTO para simular premium o normal
  const isPremium = false;

  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [drawsLeft, setDrawsLeft] = useState(0);
  const [nextReset, setNextReset] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [gifSrc, setGifSrc] = useState("/Art Glow GIF by xponentialdesign.gif");

  const getNextReset = () => {
    const now = new Date();
    let next;
    if (isPremium) {
      // Lunes 00:00
      const day = now.getDay();
      const diff = (8 - day) % 7;
      next = new Date(now);
      next.setDate(now.getDate() + diff);
    } else {
      // Día 1 del próximo mes
      next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    next.setHours(0, 0, 0, 0);
    return next;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (nextReset) {
        const now = new Date();
        const diff = nextReset - now;
        if (diff > 0) {
          const hours = Math.floor(diff / 1000 / 60 / 60);
          const minutes = Math.floor((diff / 1000 / 60) % 60);
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft("¡Ya puedes tirar!");
          resetDraws();
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [nextReset]);

  const resetDraws = () => {
    const max = isPremium ? 3 : 1;
    setDrawsLeft(max);
    localStorage.setItem("drawsLeft", max);
    localStorage.setItem("lastReset", new Date().toISOString());
    setNextReset(getNextReset());
  };

  useEffect(() => {
    const lastReset = new Date(localStorage.getItem("lastReset"));
    const now = new Date();
    const next = getNextReset();
    setNextReset(next);

    if (!lastReset || now >= next) {
      resetDraws();
    } else {
      setDrawsLeft(Number(localStorage.getItem("drawsLeft") || 0));
    }
  }, []);

  async function getReading() {
    if (drawsLeft <= 0) return;

    setLoading(true);
    setReading("");
    try {
      const res = await fetch('/api/tarot');
      const data = await res.json();
      setReading(data.reading);
      setDrawsLeft(prev => {
        const updated = prev - 1;
        localStorage.setItem("drawsLeft", updated);
        return updated;
      });
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
      background: "black",
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

      {/* GIF central */}
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

      {/* Estado del usuario y contador */}
      <p style={{ marginBottom: "0.25rem" }}>
        {isPremium ? "Usuario Premium" : "Usuario Normal"} – Tiradas restantes: {drawsLeft}
      </p>
      <p style={{ marginBottom: "1rem", fontSize: "0.9rem", opacity: 0.8 }}>
        Próxima tirada disponible en: {timeLeft}
      </p>

      <button
        onClick={getReading}
        disabled={drawsLeft <= 0}
        style={{
          padding: "1rem 2rem",
          fontSize: "1.25rem",
          border: "none",
          borderRadius: "8px",
          cursor: drawsLeft > 0 ? "pointer" : "not-allowed",
          backgroundColor: "#fff",
          color: "#333",
          boxShadow: "0 4px 8px rgba(255, 255, 255, 0.2)",
          transition: "transform 0.2s",
          opacity: drawsLeft > 0 ? 1 : 0.5
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
