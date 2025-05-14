import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';

// Calcula el número de semana ISO del año
function getWeekNumber(date) {
  const d = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export default function Home() {
  const userRole = 'premium'; // "free", "premium" o "admin"
  const isPremium = userRole === 'premium' || userRole === 'admin';
  const isAdmin   = userRole === 'admin';

  const themes = ["amor", "carrera", "sombra", "intuicion", "destino"];
  const labels = {
    amor:      "Amor & Relaciones",
    carrera:   "Carrera & Abundancia",
    sombra:    "Sombra & Transformación",
    intuicion: "Intuición & Misterio",
    destino:   "Propósito & Destino"
  };
  const [selected, setSelected] = useState(themes[0]);

  const [reading,  setReading]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [used,     setUsed]     = useState(0);
  const [nextReset,setNextReset]= useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const timeoutRef = useRef(null);

  const maxDraws = isAdmin ? Infinity : isPremium ? 3 : 1;

  const getPeriodKey = () => {
    const now = new Date();
    if (isPremium && !isAdmin) {
      const w = getWeekNumber(now);
      return `${now.getFullYear()}-W${String(w).padStart(2,'0')}`;
    }
    return `${now.getFullYear()}-M${String(now.getMonth()+1).padStart(2,'0')}`;
  };

  const getNextResetDate = () => {
    const now = new Date();
    let nxt;
    if (isPremium && !isAdmin) {
      const daysToMonday = (8 - now.getDay()) % 7;
      nxt = new Date(now);
      nxt.setDate(now.getDate() + daysToMonday);
    } else {
      nxt = new Date(now.getFullYear(), now.getMonth()+1, 1);
    }
    nxt.setHours(0,0,0,0);
    return nxt;
  };

  const resetPeriod = () => {
    localStorage.setItem("periodKey", getPeriodKey());
    localStorage.setItem("drawsUsed", "0");
    setUsed(0);
  };

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

  const getReading = async () => {
    if (used >= maxDraws && !isAdmin) return;
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
        src="/Art Glow GIF by xponentialdesign.gif"
        alt="Animación Mística"
      />

      {isPremium && !isAdmin && (
        <div className="themes">
          {themes.map(t => (
            <button
              key={t}
              onClick={() => setSelected(t)}
              className={selected===t ? 'selected' : ''}
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
      <p className="status">
        Próxima tirada en: {timeLeft}
      </p>

      <button
        onClick={getReading}
        disabled={drawsLeft<=0 && !isAdmin}
        className="draw-btn"
      >
        {loading ? 'Leyendo…' : 'Haz tu tirada'}
      </button>

      {reading && (
        <div className="result">{reading}</div>
      )}

      <style jsx>{`
        .container {
          max-width: 480px;
          width: 100%;
          margin: 0 auto;
          padding: 2rem 1rem;
          text-align: center;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          color: #fff;
        }
        img {
          width: 100%;
          max-width: 300px;
          height: auto;
          margin-bottom: 2rem;
        }
        .themes {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }
        .themes button {
          padding: 0.5rem 1rem;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 4px;
          background: none;
          color: #fff;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .themes button:hover {
          background: #fff;
          color: #000;
        }
        .themes button.selected {
          background: #fff;
          color: #000;
        }
        .status {
          margin: 0.25rem 0;
          color: #fff;
          font-size: 1rem;
        }
        .draw-btn {
          margin: 2rem 0;
          padding: 1rem 2rem;
          font-size: 1.25rem;
          border: none;
          border-radius: 8px;
          background: #fff;
          color: #333;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .draw-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .result {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #fff;
        }

        @media (max-width: 500px) {
          h1 { font-size: 2rem; }
          .themes button { flex: 1 1 45%; }
          .draw-btn { width: 100%; }
        }
      `}</style>
    </div>
  );
}
