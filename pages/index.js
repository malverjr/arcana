import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';

// Calcula el número de semana ISO
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export default function Home() {
  const isPremium = false; // Cambia a true para probar premium

  // Estados para UI
  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [drawsUsed, setDrawsUsed] = useState(0);
  const [nextReset, setNextReset] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [gifSrc] = useState("/Art Glow GIF by xponentialdesign.gif");

  // Máximo de tiradas según tipo de usuario
  const maxDraws = isPremium ? 3 : 1;

  // Flag para que el reset en el intervalo solo ocurra UNA vez
  const hasResetRef = useRef(false);

  // Identificador de periodo (mes o semana ISO)
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

  // Fecha del próximo reset (mañana lunes o primer día de mes)
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

  // Resetea las tiradas usadas y marca nuevo periodo
  const resetPeriod = () => {
    localStorage.setItem("periodKey", getPeriodKey());
    localStorage.setItem("drawsUsed", "0");
    setDrawsUsed(0);
  };

  // Al montar: inicializa drawsUsed y nextReset
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedPeriod = localStorage.getItem("periodKey");
    const currentPeriod = getPeriodKey();

    if (storedPeriod !== currentPeriod) {
      resetPeriod();
    } else {
      const used = Number(localStorage.getItem("drawsUsed") || "0");
      setDrawsUsed(used);
    }

    setNextReset(getNextResetDate());
  }, []);

  // Contador regresivo y reset puntual solo UNA vez
  useEffect(() => {
    if (!nextReset) return;
    hasResetRef.current = false;
    const intervalId = setInterval(() => {
      const now = new Date();
      const diff = nextReset - now;

      if (diff > 0) {
        const days    = Math.floor(diff / 86400000);
        const hours   = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft("¡Ya puedes tirar!");
        // Reset SOLO LA PRIMERA VEZ que diff llega a <=0
        if (!hasResetRef.current) {
          hasResetRef.current = true;
          resetPeriod();
          // Actualiza nextReset para el siguiente periodo
          setNextReset(getNextResetDate());
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [nextReset]);

  // Llama a la API para obtener lectura y marca un uso
  async function getReading() {
    if (drawsUsed >= maxDraws) return;

    setLoading(true);
    setReading("");
    try {
      const res = await fetch('/api/tarot');
      const { reading } = await res.json();
      setReading(reading);

      setDrawsUsed(prev => {
        const updated = prev + 1;
        localStorage.setItem("drawsUsed", updated.toString());
        return updated;
      });
    } catch {
      setReading("Error al obtener la tirada. Inténtalo de nuevo.");
    }
    setLoading(false);
  }

  const drawsLeft = maxDraws - drawsUsed;

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
      <img src={gifSrc} alt="Animación Mística" style={{
        width: "300px", height: "300px",
        marginBottom: "2rem", objectFit: "cover"
      }} />
      <p style={{ marginBottom: ".25rem" }}>
        {isPremium ? "Usuario Premium" : "Usuario Normal"} – Tiradas restantes: {drawsLeft}
      </p>
      <p style={{
        marginBottom: "1rem",
        fontSize: ".9rem",
        opacity: .8
      }}>Próxima tirada en: {timeLeft}</p>
      <button
        onClick={getReading}
        disabled={drawsLeft <= 0}
        style={{
          padding: "1rem 2rem", fontSize: "1.25rem",
          border: "none", borderRadius: "8px",
          cursor: drawsLeft > 0 ? "pointer" : "not-allowed",
          backgroundColor: "#fff", color: "#333",
          boxShadow: "0 4px 8px rgba(255,255,255,0.2)",
          transition: "transform .2s", opacity: drawsLeft > 0 ? 1 : .5
        }}
        onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
      >
        {loading ? "Leyendo..." : "Haz tu tirada"}
      </button>
      {reading && (
        <div style={{
          marginTop: "2rem", fontSize: "1.5rem",
          background: "rgba(255,255,255,0.1)", padding: "1rem 2rem",
          borderRadius: "8px", boxShadow: "0 2px 4px rgba(255,255,255,0.2)"
        }}>
          {reading}
        </div>
      )}
    </div>
  );
}

