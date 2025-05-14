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
  // Rol de usuario: "free", "premium", "admin"
  const userRole = 'premium';
  const isPremium = userRole === 'premium' || userRole === 'admin';
  const isAdmin   = userRole === 'admin';

  // Temáticas y sus labels (solo para premium)
  const themes = ["amor", "carrera", "sombra", "intuicion", "destino"];
  const labels = {
    amor:      "Amor & Relaciones",
    carrera:   "Carrera & Abundancia",
    sombra:    "Sombra & Transformación",
    intuicion: "Intuición & Misterio",
    destino:   "Propósito & Destino"
  };
  const [selected, setSelected] = useState(themes[0]);

  // Estados de UI
  const [reading,  setReading]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [used,     setUsed]     = useState(0);
  const [nextReset,setNextReset]= useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const timeoutRef = useRef(null);

  // Máximo de tiradas según rol
  const maxDraws = isAdmin ? Infinity : isPremium ? 3 : 1;

  // Clave del período actual
  const getPeriodKey = () => {
    const now = new Date();
    if (isPremium && !isAdmin) {
      const w = getWeekNumber(now);
      return `${now.getFullYear()}-W${String(w).padStart(2, '0')}`;
    }
    return `${now.getFullYear()}-M${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  // Fecha exacta del próximo reset
  const getNextResetDate = () => {
    const now = new Date();
    let nxt;
    if (isPremium && !isAdmin) {
      const daysToMonday = (8 - now.getDay()) % 7;
      nxt = new Date(now);
      nxt.setDate(now.getDate() + daysToMonday);
    } else {
      nxt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    nxt.setHours(0, 0, 0, 0);
    return nxt;
  };

  // Resetea el conteo de tiradas
  const resetPeriod = () => {
    localStorage.setItem("periodKey", getPeriodKey());
    localStorage.setItem("drawsUsed", "0");
    setUsed(0);
  };

  // Init / schedule reset
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem("periodKey");
    const current = getPeriodKey();
    if (stored !== current) resetPeriod();
    else setUsed(Number(localStorage.getItem("drawsUsed") || "0"));

    const nr = getNextResetDate();
    setNextReset(nr);
    const msUntil = nr.getTime() - Date.now();
    timeoutRef.current = setTimeout(() => {
      resetPeriod();
      const next2 = getNextResetDate();
      setNextReset(next2);
      const ms2 = next2.getTime() - Date.now();
      timeoutRef.current = setTimeout(resetPeriod, ms2);
    }, msUntil);

    return () => clearTimeout(timeoutRef.current);
  }, []);

  // Contador regresivo UI
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

  // Solicita lectura y cuenta uso
  const getReading = async () => {
    if (used >= maxDraws) return;
    setLoading(true);
    setReading("");
    try {
      const url = isPremium
        ? `/api/tarot?theme=${selected}`
        : `/api/tarot`;
      const res = await fetch(url);
      const { reading } = await res.json();
      setReading(reading);
      setUsed(u => {
        const nu = u + 1;
        localStorage.setItem("drawsUsed", String(nu));
        return nu;
      });
    } catch {
      setReading("Error al obtener la tirada. Inténtalo de nuevo.");
    }
    setLoading(false);
  };

  const drawsLeft = maxDraws - used;

  return (
    <div className="container">
      <Head><title>Arcana</title></Head>

      <h1>Arcana</h1>

      <img
        src="/Art%20Glow%20GIF%20by%20xponentialdesign.gif"
        alt="Animación Mística"
        className="cube"
      />

      {isPremium && !isAdmin && (
        <div className="themes">
          {themes.map(t => (
            <button
              key={t}
              onClick={() => setSelected(t)}
              className={selected === t ? 'theme-btn selected' : 'theme-btn'}
            >
              {labels[t]}
            </button>
          ))}
        </div>
      )}

      <p className="status">
        <strong>
          {isAdmin ? 'Administrador' : isPremium ? 'Usuario Arcana' : 'Usuario Libre'}
        </strong>
        {' – Tiradas restantes: '}{isFinite(drawsLeft) ? drawsLeft : '∞'}
      </p>
      <p className="timer">Próxima tirada en: {timeLeft}</p>

      <button
        onClick={getReading}
        disabled={drawsLeft <= 0 && !isAdmin}
        className="draw-btn"
      >
        {loading ? 'Leyendo…' : 'Haz tu tirada'}
      </button>

      {reading && <div className="reading">{reading}</div>}

      <style jsx>{`
        .container {
          max-width: 600px;
          margin: auto;
          padding: 2rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #000;
          color: #fff;
          min-height: 100vh;
          font-family: "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        h1 {
          font-size: 3rem;
          letter-spacing: .05em;
          margin-bottom: 1.5rem;
        }
        .cube {
          width: 80%;
          max-width: 300px;
          margin-bottom: 2rem;
          object-fit: cover;
        }
        .themes {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          justify-content: center;
        }
        .theme-btn {
          padding: 0.5rem 1rem;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 4px;
          background: none;
          color: #fff;
          cursor: pointer;
          transition: background .2s, color .2s;
        }
        .theme-btn:hover {
          background: rgba(255,255,255,0.15);
        }
        .selected {
          background: rgba(255,255,255,0.15);
          border-color: #fff;
          text-decoration: underline;
        }
        .status {
          letter-spacing: .02em;
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }
        .timer {
          font-size: .9rem;
          opacity: .8;
          margin-bottom: 1rem;
        }
        .draw-btn {
          padding: 1rem 2rem;
          font-size: 1.25rem;
          border: none;
          border-radius: 8px;
          background-color: #fff;
          color: #333;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          opacity: ${drawsLeft > 0 || isAdmin ? 1 : 0.5};
        }
        .draw-btn:disabled {
          cursor: not-allowed;
        }
        .reading {
          margin-top: 2rem;
          padding: 1rem 2rem;
          background: rgba(200,200,200,0.2);
          border-radius: 8px;
          animation: fadeIn .5s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @media (max-width: 480px) {
          h1 { font-size: 2.5rem; }
          .draw-btn { width: 100%; }
        }
      `}</style>
    </div>
  );
}
