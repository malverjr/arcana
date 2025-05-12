import { useEffect, useState } from 'react';
import Head from 'next/head';

// Utilidad para calcular ISO week number
function getWeekNumber(d) {
  // Copiado del estándar ISO-8601
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil( ((((d - yearStart) / 86400000) + 1) / 7) );
}

export default function Home() {
  const isPremium = false; // Cambia a true para simular Premium

  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [drawsLeft, setDrawsLeft] = useState(0);
  const [nextReset, setNextReset] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [gifSrc] = useState("/Art Glow GIF by xponentialdesign.gif");

  // Calcula la fecha del próximo reset (lunes o primer día de mes)
  const getNextResetDate = () => {
    const now = new Date();
    let next;
    if (isPremium) {
      // Próximo lunes 00:00
      const day = now.getDay();
      const daysUntilMonday = (8 - day) % 7;
      next = new Date(now);
      next.setDate(now.getDate() + daysUntilMonday);
    } else {
      // Primer día del mes siguiente a las 00:00
      next = new Date(now.getFullYear(), now.getMonth()+1, 1);
    }
    next.setHours(0,0,0,0);
    return next;
  };

  // Identificador de período: "YYYY-M" para mensual, "YYYY-Www" para semanal
  const getPeriodKey = () => {
    const now = new Date();
    if (isPremium) {
      const week = getWeekNumber(now);
      return `${now.getFullYear()}-W${week.toString().padStart(2,'0')}`;
    } else {
      return `${now.getFullYear()}-M${(now.getMonth()+1).toString().padStart(2,'0')}`;
    }
  };

  // Resetea las tiradas al máximo
  const resetDraws = () => {
    const max = isPremium ? 3 : 1;
    setDrawsLeft(max);
    localStorage.setItem("drawsLeft", max);
    const period = getPeriodKey();
    localStorage.setItem("periodKey", period);
    setNextReset(getNextResetDate());
  };

  // Al montar: comprueba si cambió de período y resetea solo entonces
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedPeriod = localStorage.getItem("periodKey");
    const currentPeriod = getPeriodKey();
    setNextReset(getNextResetDate());

    if (storedPeriod !== currentPeriod) {
      // Nuevo período → full reset
      resetDraws();
    } else {
      // Mismo período → restaurar resto de tiradas
      const saved = Number(localStorage.getItem("drawsLeft") || 0);
      setDrawsLeft(saved);
    }
  }, []);

  // Contador regresivo
  useEffect(() => {
    const iv = setInterval(() => {
      if (!nextReset) return;
      const now = new Date();
      const diff = nextReset - now;
      if (diff > 0) {
        const days    = Math.floor(diff / (1000*60*60*24));
        const hours   = Math.floor((diff / (1000*60*60)) % 24);
        const minutes = Math.floor((diff / (1000*60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft("¡Ya puedes tirar!");
        clearInterval(iv);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [nextReset]);

  // Función para pedir lectura
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
      <h1 style={{ fontSize:"3rem", textShadow:"1px 1px 4px rgba(255,255,255,0.3)" }}>
        Arcana
      </h1>
      <img
        src={gifSrc}
        alt="Animación Mística"
        style={{ width:"300px", height:"300px", marginBottom:"2rem", objectFit:"cover" }}
      />
      <p style={{ marginBottom:".25rem" }}>
        {isPremium ? "Usuario Premium" : "Usuario Normal"} – Tiradas restantes: {drawsLeft}
      </p>
      <p style={{ marginBottom:"1rem", fontSize:".9rem", opacity:.8 }}>
        Próxima tirada disponible en: {timeLeft}
      </p>
      <button
        onClick={getReading}
        disabled={drawsLeft <= 0}
        style={{
          padding:"1rem 2rem", fontSize:"1.25rem",
          border:"none", borderRadius:"8px",
          cursor: drawsLeft>0 ? "pointer":"not-allowed",
          backgroundColor:"#fff", color:"#333",
          boxShadow:"0 4px 8px rgba(255,255,255,0.2)",
          transition:"transform .2s", opacity: drawsLeft>0?1:.5
        }}
        onMouseOver={e=>e.currentTarget.style.transform="scale(1.05)"}
        onMouseOut={e=>e.currentTarget.style.transform="scale(1)"}
      >
        {loading ? "Leyendo..." : "Haz tu tirada"}
      </button>
      {reading && (
        <div style={{
          marginTop:"2rem", fontSize:"1.5rem", color:"#fff",
          background:"rgba(255,255,255,0.1)", padding:"1rem 2rem",
          borderRadius:"8px", boxShadow:"0 2px 4px rgba(255,255,255,0.2)"
        }}>
          {reading}
        </div>
      )}
    </div>
  );
}
