import { useEffect, useState } from 'react';
import Head from 'next/head';

// Utilidad para calcular el número ISO de semana
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export default function Home() {
  const isPremium = false; // Pon true para simular premium

  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [drawsLeft, setDrawsLeft] = useState(0);
  const [nextReset, setNextReset] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [gifSrc] = useState("/Art Glow GIF by xponentialdesign.gif");

  // Calcula cuándo es el próximo reset
  const getNextResetDate = () => {
    const now = new Date();
    let next;
    if (isPremium) {
      const day = now.getDay();
      const daysUntilMon = (8 - day) % 7;
      next = new Date(now);
      next.setDate(now.getDate() + daysUntilMon);
    } else {
      next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    next.setHours(0, 0, 0, 0);
    return next;
  };

  // Genera un identificador de período
  const getPeriodKey = () => {
    const now = new Date();
    if (isPremium) {
      const week = getWeekNumber(now);
      return `${now.getFullYear()}-W${week.toString().padStart(2, '0')}`;
    } else {
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      return `${now.getFullYear()}-M${month}`;
    }
  };

  // Resetea las tiradas al máximo y guarda el periodo
  const resetDraws = () => {
    const max = isPremium ? 3 : 1;
    setDrawsLeft(max);
    localStorage.setItem("drawsLeft", max);
    localStorage.setItem("periodKey", getPeriodKey());
    setNextReset(getNextResetDate());
  };

  // Al montar: solo resetea si cambió el periodo
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("periodKey");
    const current = getPeriodKey();
    setNextReset(getNextResetDate());
    if (stored !== current) {
      resetDraws();
    } else {
      const saved = Number(localStorage.getItem("drawsLeft") || 0);
      setDrawsLeft(saved);
    }
  }, []);

  // Contador regresivo y reset puntual
  useEffect(() => {
    if (!nextReset) return;
    const id = setInterval(() => {
      const now = new Date();
      const diff = nextReset - now;
      if (diff > 0) {
        const days    = Math.floor(diff / (1000*60*60*24));
        const hours   = Math.floor((diff / (1000*60*60)) % 24);
        const minutes = Math.floor((diff / (1000*60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        // Llego el momento de resetear, limpio intervalo y reseteo
        clearInterval(id);
        setTimeLeft("¡Ya puedes tirar!");
        resetDraws();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [nextReset]);

  // Función para pedir una lectura
  async function getReading() {
    if (drawsLeft <= 0) return;
    setLoading(true);
    setReading("");
    try {
      const res = await fetch('/api/tarot');
      const { reading } = await res.json();
      setReading(reading);
      setDrawsLeft(prev => {
        const updated = prev - 1;
        localStorage.setItem("drawsLeft", updated);
        return updated;
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
      <Head>
        <title>Arcana</title>
      </Head>
      <h1 style={{
        fontSize: "3rem",
        textShadow: "1px 1px 4px rgba(255,255,255,0.3)"
      }}>Arcana</h1>
      <img
        src={gifSrc}
        alt="Animación Mística"
        style={{
          width: "300px", height: "300px",
          marginBottom: "2rem", objectFit: "cover"
        }}
      />
      <p style={{ marginBottom: ".25rem" }}>
        {isPremium ? "Usuario Premium" : "Usuario Normal"} – Tiradas restantes: {drawsLeft}
      </p>
      <p style={{
        marginBottom: "1rem",
        fontSize: ".9rem",
        opacity: .8
      }}>Próxima tirada disponible en: {timeLeft}</p>
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
          transition: "transform .2s",
          opacity: drawsLeft > 0 ? 1 : .5
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
