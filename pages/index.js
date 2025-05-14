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
  // Rol de usuario: "free", "premium", "admin"
  const userRole = 'premium'; // <-- cámbialo aquí cuando quieras
  const isPremium = userRole === 'premium' || userRole === 'admin';
  const isAdmin   = userRole === 'admin';

  // Temáticas (solo premium)
  const themes = ["amor", "carrera", "sombra", "intuicion", "destino"];
  const labels = {
    amor:      "Amor & Relaciones",
    carrera:   "Carrera & Abundancia",
    sombra:    "Sombra & Transformación",
    intuicion: "Intuición & Misterio",
    destino:   "Propósito & Destino"
  };
  const [selected, setSelected] = useState(themes[0]);

  // Estado UI
  const [reading,  setReading]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [used,     setUsed]     = useState(0);
  const [nextReset,setNextReset]= useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const timeoutRef = useRef(null);

  // Límite de tiradas
  const maxDraws = isAdmin ? Infinity : isPremium ? 3 : 1;

  // Clave de periodo (mes para free/admin, semana ISO para premium)
  const getPeriodKey = () => {
    const now = new Date();
    if (isPremium && !isAdmin) {
      const w = getWeekNumber(now);
      return `${now.getFullYear()}-W${String(w).padStart(2,'0')}`;
    }
    return `${now.getFullYear()}-M${String(now.getMonth()+1).padStart(2,'0')}`;
  };

  // Próxima fecha de reset
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

  // Resetea contador
  const resetPeriod = () => {
    localStorage.setItem("periodKey", getPeriodKey());
    localStorage.setItem("drawsUsed", "0");
    setUsed(0);
  };

  // Inicializar + programar reset
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

  // Cuenta atrás hasta reset
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

  // Llama a la API y aumenta contador
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
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      minHeight:      '100vh',
      background:     '#000',
      color:          '#fff',
      fontFamily:     `"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
      padding:        '2rem 1rem'
    }}>
      <Head><title>Arcana</title></Head>

      <h1 style={{
        fontSize:      '3rem',
        letterSpacing: '0.05em',
        marginBottom:  '1.5rem'
      }}>
        Arcana
      </h1>

      {/* GIF místico */}
      <img
        src="/Art%20Glow%20GIF%20by%20xponentialdesign.gif"
        alt="Animación Mística"
        style={{
          width:        '300px',
          height:       '300px',
          marginBottom: '2rem',
          objectFit:    'cover'
        }}
      />

      {isPremium && !isAdmin && (
        <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem' }}>
          {themes.map(t => (
            <button
              key={t}
              onClick={() => setSelected(t)}
              style={{
                padding:     '0.5rem 1rem',
                border:      '1px solid rgba(255,255,255,0.3)',
                borderRadius:'4px',
                background:  selected===t ? '#fff' : 'none',
                color:       selected===t ? '#000' : '#fff',
                cursor:      'pointer',
                transition:  'background 0.2s, color 0.2s'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.color = '#000';
              }}
              onMouseOut={e => {
                if (selected===t) return;
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = '#fff';
              }}
            >
              {labels[t]}
            </button>
          ))}
        </div>
      )}

      <p style={{
        marginBottom:  '0.25rem',
        letterSpacing: '0.02em',
        fontSize:      '1rem'
      }}>
        <strong>
          {isAdmin ? 'Administrador' : isPremium ? 'Usuario Arcana' : 'Usuario Libre'}
        </strong>
        {' – Tiradas restantes: '}{isFinite(drawsLeft) ? drawsLeft : '∞'}
      </p>
      <p style={{
        marginBottom:  '1rem',
        letterSpacing: '0.02em',
        fontSize:      '0.9rem',
        opacity:       0.8
      }}>
        Próxima tirada en: {timeLeft}
      </p>

      <button
        onClick={getReading}
        disabled={drawsLeft<=0 && !isAdmin}
        style={{
          padding:        '1rem 2rem',
          fontSize:       '1.25rem',
          border:         'none',
          borderRadius:   '8px',
          backgroundColor:'#fff',
          color:          '#333',
          boxShadow:      '0 4px 8px rgba(0,0,0,0.2)',
          cursor:         drawsLeft>0 || isAdmin ? 'pointer' : 'not-allowed',
          opacity:        drawsLeft>0 || isAdmin ? 1 : 0.5,
          transition:     'transform 0.2s',
          marginBottom:   '2rem'
        }}
      >
        {loading ? 'Leyendo…' : 'Haz tu tirada'}
      </button>

      {reading && (
        <div style={{
          padding:      '1rem 2rem',
          background:   'rgba(200,200,200,0.2)',
          borderRadius: '8px'
        }}>
          {reading}
        </div>
      )}
    </div>
  );
}
