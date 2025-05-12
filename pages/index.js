import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Home() {
  // Cambia a true para simular usuario premium
  const isPremium = false;

  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [drawsLeft, setDrawsLeft] = useState(0);
  const [nextReset, setNextReset] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [gifSrc] = useState("/Art Glow GIF by xponentialdesign.gif");

  // Calcula cuándo es el próximo reset
  const getNextReset = () => {
    const now = new Date();
    let next;
    if (isPremium) {
      // Reset cada lunes 00:00
      const day = now.getDay();
      const diff = (8 - day) % 7;
      next = new Date(now);
      next.setDate(now.getDate() + diff);
    } else {
      // Reset el día 1 del mes siguiente a las 00:00
      next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    next.setHours(0, 0, 0, 0);
    return next;
  };

  // Reset de tiradas al máximo
  const resetDraws = () => {
    const max = isPremium ? 3 : 1;
    setDrawsLeft(max);
    if (typeof window !== "undefined") {
      localStorage.setItem("drawsLeft", max.toString());
      localStorage.setItem("lastReset", new Date().toISOString());
    }
    setNextReset(getNextReset());
  };

  // Al montar, inicializa tiradas y nextReset
  useEffect(() => {
    if (typeof window === "undefined") return;
    const lastResetRaw = localStorage.getItem("lastReset");
    const now = new Date();
    const next = getNextReset();
    setNextReset(next);

    if (!lastResetRaw) {
      resetDraws();
    } else {
      const lastReset = new Date(lastResetRaw);
      if (now >= next) {
        resetDraws();
      } else {
        const stored = Number(localStorage.getItem("drawsLeft") || "0");
        setDrawsLeft(stored);
      }
    }
  }, []);

  // Contador regresivo
  useEffect(() => {
    if (!nextReset) return;
    const iv = setInterval(() => {
      const now = new Date();
      const diff = nextReset - now;
      if (diff > 0) {
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft("¡Ya puedes tirar!");
        clearInterval(iv);
        // opcional: resetDraws();  <-- estaba aquí antes
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [nextReset]);

  // Obtiene la lectura
  async function getReading() {
    if (drawsLeft <= 0) return;
    setLoading(true);
    setReading("");
    try {
      const res = await fetch('/api/tarot');
      const { reading } = await res.json();
      setReading(reading);
      setDrawsLeft(prev => {
        const upd = prev - 1;
        if (typeof window !== "undefined") localStorage.setItem("drawsLeft", upd.toString());
        return upd;
      });
    } catch {
      setReading("Error al obtener la tirada. Inténtalo de nuevo.");
    }
    setLoading(false);
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center",
      minHeight: "100vh", background: "black",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: "white", padding: "0 1rem"
    }}>
      <Head><title>Arcana</title></Head>

      <h1 style={{
        fontSize: "3rem",
        textShadow: "1px 1px 4px rgba(255,255,255,0.3)"
      }}>Arcana</h1>

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
          boxShadow: "0 4px 8px rgba(255,255,255,0.2)",
          transition: "transform 0.2s",
          opacity: drawsLeft > 0 ? 1 : 0.5
        }}
        onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
      >
        {loading ? "Leyendo..." : "Haz tu tirada"}
      </button>

      {reading && (
        <div style={{
          marginTop: "2rem",
          fontSize: "1.5rem",
          background: "rgba(255,255,255,0.1)",
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
