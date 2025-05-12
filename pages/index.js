import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';

// Obtiene número de semana ISO del año
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export default function Home() {
  const isPremium = false; // 👉 Pásalo a true para probar premium

  // UI state
  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [drawsUsed, setDrawsUsed] = useState(0);
  const [nextReset, setNextReset] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [gifSrc] = useState("/Art Glow GIF by xponentialdesign.gif");

  const maxDraws = isPremium ? 3 : 1;
  const resetTimeoutRef = useRef(null);

  // 1) Construye el key de período actual
  const getPeriodKey = () => {
    const now = new Date();
    if (isPremium) {
      const w = getWeekNumber(now);
      return `${now.getFullYear()}-W${w.toString().padStart(2, "0")}`;
    } else {
      const m = (now.getMonth() + 1).toString().padStart(2, "0");
      return `${now.getFullYear()}-M${m}`;
    }
  };

  // 2) Calcula la próxima fecha de reset
  const getNextResetDate = () => {
    const now = new Date();
    let nxt;
    if (isPremium) {
      const day = now.getDay(),
            daysToMon = (8 - day) % 7;
      nxt = new Date(now);
      nxt.setDate(now.getDate() + daysToMon);
    } else {
      nxt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    nxt.setHours(0, 0, 0, 0);
    return nxt;
  };

  // 3) Resetea tiradas usadas
  const resetPeriod = () => {
    localStorage.setItem("periodKey", getPeriodKey());
    localStorage.setItem("drawsUsed", "0");
    setDrawsUsed(0);
  };

  // 4) Al montar: inicializa drawsUsed y programa el reset futuro
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("periodKey"),
          current = getPeriodKey();

    if (stored !== current) resetPeriod();
    else setDrawsUsed(Number(localStorage.getItem("drawsUsed") || "0"));

    // Programa el reset exacto
    const next = getNextResetDate();
    setNextReset(next);
    const msUntil = next.getTime() - Date.now();
    resetTimeoutRef.current = setTimeout(() => {
      resetPeriod();
      // y reprograma el siguiente reset
      const following = getNextResetDate();
      setNextReset(following);
      const ms2 = following.getTime() - Date.now();
      resetTimeoutRef.current = setTimeout(resetPeriod, ms2);
    }, msUntil);

    return () => clearTimeout(resetTimeoutRef.current);
  }, []);

  // 5) Solo UI: contador regresivo
  useEffect(() => {
    if (!nextReset) return;
    const iv = setInterval(() => {
      const diff = nextReset - new Date();
      if (diff > 0) {
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
      } else {
        setTimeLeft("¡Ya puedes tirar!");
      }
    }, 500);
    return () => clearInterval(iv);
  }, [nextReset]);

  // 6) Lanza la API y marca un uso
  const getReading = async () => {
    if (drawsUsed >= maxDraws) return;
    setLoading(true);
    setReading("");
    try {
      const res = await fetch("/api/tarot");
      const { reading } = await res.json();
      setReading(reading);
      setDrawsUsed(prev => {
        const upd = prev + 1;
        localStorage.setItem("drawsUsed", upd.toString());
        return upd;
      });
    } catch {
      setReading("Error al obtener la tirada. Inténtalo de nuevo.");
    }
    setLoading(false);
  };

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
      }}>
        Próxima tirada en: {timeLeft}
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
