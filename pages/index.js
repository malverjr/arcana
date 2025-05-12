import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';

// Calcula el número de semana ISO del año
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export default function Home() {
  // Pasa a `true` para probar modo Usuario Arcana
  const isPremium = true;

  // Temáticas para Usuario Arcana
  const themes = ["amor", "carrera", "sombra", "intuicion", "destino"];
  const themeLabels = {
    amor:      "Amor & Relaciones",
    carrera:   "Carrera & Abundancia",
    sombra:    "Sombra & Transformación",
    intuicion: "Intuición & Misterio",
    destino:   "Propósito & Destino"
  };
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);

  // Estado de la UI
  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [drawsUsed, setDrawsUsed] = useState(0);
  const [nextReset, setNextReset] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const resetTimeoutRef = useRef(null);

  // Máximo de tiradas según tipo de usuario
  const maxDraws = isPremium ? 3 : 1;

  // Clave del período actual ("YYYY-Mmm" o "YYYY-Www")
  const getPeriodKey = () => {
    const now = new Date();
    if (isPremium) {
      const week = getWeekNumber(now);
      return `${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
    } else {
      const m = String(now.getMonth() + 1).padStart(2, "0");
      return `${now.getFullYear()}-M${m}`;
    }
  };

  // Fecha exacta del próximo reset (lunes o día 1)
  const getNextResetDate = () => {
    const now = new Date();
    let nxt;
    if (isPremium) {
      const daysToMonday = (8 - now.getDay()) % 7;
      nxt = new Date(now);
      nxt.setDate(now.getDate() + daysToMonday);
    } else {
      nxt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    nxt.setHours(0, 0, 0, 0);
    return nxt;
  };

  // Resetea tiradas usadas y guarda el nuevo período
  const resetPeriod = () => {
    localStorage.setItem("periodKey", getPeriodKey());
    localStorage.setItem("drawsUsed", "0");
    setDrawsUsed(0);
  };

  // Al montar: inicializa `drawsUsed` y programa el reset
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

    const nr = getNextResetDate();
    setNextReset(nr);
    const msUntil = nr.getTime() - Date.now();

    resetTimeoutRef.current = setTimeout(() => {
      resetPeriod();
      const next2 = getNextResetDate();
      setNextReset(next2);
      const ms2 = next2.getTime() - Date.now();
      resetTimeoutRef.current = setTimeout(resetPeriod, ms2);
    }, msUntil);

    return () => clearTimeout(resetTimeoutRef.current);
  }, []);

  // Contador regresivo (solo UI)
  useEffect(() => {
    if (!nextReset) return;
    const iv = setInterval(() => {
      const diff = nextReset.getTime() - Date.now();
      if (diff > 0) {
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
      } else {
        setTimeLeft("0d 0h 0m 0s");
      }
    }, 500);
    return () => clearInterval(iv);
  }, [nextReset]);

  // Solicita lectura y marca uso
  const getReading = async () => {
    if (drawsUsed >= maxDraws) return;
    setLoading(true);
    setReading("");
    try {
      const url = isPremium
        ? `/api/tarot?theme=${selectedTheme}`
        : `/api/tarot`;
      const res = await fetch(url);
      const { reading } = await res.json();
      setReading(reading);

      setDrawsUsed(prev => {
        const updated = prev + 1;
        localStorage.setItem("drawsUsed", String(updated));
        return updated;
      });
    } catch {
      setReading("Error al obtener la tirada. Inténtalo de nuevo.");
    }
    setLoading(false);
  };

  const drawsLeft = maxDraws - drawsUsed;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "black",
      color: "white",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
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

      <img
        src="/Art Glow GIF by xponentialdesign.gif"
        alt="Animación Mística"
        style={{
          width: "300px",
          height: "300px",
          marginBottom: "2rem",
          objectFit: "cover"
        }}
      />

      {/* Selector de temática solo para Usuario Arcana */}
      {isPremium && (
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          {themes.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTheme(t)}
              style={{
                padding: "0.5rem 1rem",
                border: t === selectedTheme
                  ? "2px solid #fff"
                  : "2px solid rgba(255,255,255,0.3)",
                background: "transparent",
                color: "#fff",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              {themeLabels[t]}
            </button>
          ))}
        </div>
      )}

      <p style={{ marginBottom: "0.25rem" }}>
        {isPremium ? "Usuario Arcana" : "Usuario Libre"} – Tiradas restantes: {drawsLeft}
      </p>
      <p style={{ marginBottom: "1rem", opacity: 0.8 }}>
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
          padding: "1rem 2rem",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(255,255,255,0.2)",
          fontSize: "1.5rem"
        }}>
          {reading}
        </div>
      )}
    </div>
  );
}
