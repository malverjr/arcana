import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { Menu, X } from 'lucide-react';

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export default function Home() {
  const userRole = 'arcana+';
  const isArcana = userRole === 'arcana';
  const isArcanaPlus = userRole === 'arcana+';
  const isAdmin = userRole === 'admin';

  const themes = [
    ...(isArcana || isArcanaPlus || isAdmin ? ["amor", "carrera", "sombra", "intuicion", "destino"] : []),
    ...(isArcanaPlus || isAdmin ? ["crecimiento", "salud", "pasado", "presente", "futuro"] : [])
  ];

  const labels = {
    amor: "Amor & Relaciones",
    carrera: "Carrera & Abundancia",
    sombra: "Sombra & Transformación",
    intuicion: "Intuición & Misterio",
    destino: "Propósito & Destino",
    crecimiento: "Crecimiento Personal",
    salud: "Salud & Bienestar",
    pasado: "Pasado",
    presente: "Presente",
    futuro: "Futuro / Potencial"
  };

  const colors = {
    amor: "#ff80b5",
    carrera: "#ffd86b",
    sombra: "#8f5fff",
    intuicion: "#5bb6ff",
    destino: "#3a4eff",
    crecimiento: "#85f6a2",
    salud: "#5ce6cc",
    pasado: "#c6b7ff",
    presente: "#ffffff",
    futuro: "#8cc5f2"
  };

  const [selected, setSelected] = useState(themes[0]);
  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [used, setUsed] = useState(0);
  const [nextReset, setNextReset] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [chartData, setChartData] = useState([]);
  const timeoutRef = useRef(null);

  const maxDraws = isAdmin ? Infinity : isArcanaPlus ? 5 : isArcana ? 3 : 1;
  const drawsLeft = maxDraws - used;

  const getPeriodKey = () => {
    const now = new Date();
    if (isArcana || isArcanaPlus) {
      const w = getWeekNumber(now);
      return `${now.getFullYear()}-W${String(w).padStart(2, '0')}`;
    }
    return `${now.getFullYear()}-M${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const getNextResetDate = () => {
    const now = new Date();
    let nxt;
    if (isArcana || isArcanaPlus) {
      const daysToMonday = (8 - now.getDay()) % 7;
      nxt = new Date(now);
      nxt.setDate(now.getDate() + daysToMonday);
    } else {
      nxt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    nxt.setHours(0, 0, 0, 0);
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
    if (used >= maxDraws) return;
    setLoading(true);
    setReading("");
    try {
      const url = `/api/tarot?theme=${selected}`;
      const res = await fetch(url);
      const { reading } = await res.json();
      setReading(reading);

      const key = "tiradasPorTematica";
      const data = JSON.parse(localStorage.getItem(key) || "{}");
      data[selected] = (data[selected] || 0) + 1;
      localStorage.setItem(key, JSON.stringify(data));

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

  const handleMenuToggle = () => setMenuOpen(!menuOpen);
  const handleOpenMap = () => {
    setMenuOpen(false);
    setShowMap(true);
    const stored = JSON.parse(localStorage.getItem("tiradasPorTematica") || "{}");
    const formatted = Object.keys(stored).map(key => ({
      name: labels[key],
      value: stored[key],
      color: colors[key]
    }));
    setChartData(formatted);
  };
  const handleCloseMap = () => setShowMap(false);

  return (
    <div style={{
      background: '#000', color: '#fff', minHeight: '100vh',
      padding: '2rem 1rem 3rem', fontFamily: `"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
    }}>
      <Head><title>Arcana</title></Head>

      {(isArcana || isArcanaPlus) && (
        <button onClick={handleMenuToggle} style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'none', border: 'none', color: '#fff',
          fontSize: '1.5rem', cursor: 'pointer'
        }}>
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      )}

      {menuOpen && (
        <div style={{
          position: 'absolute', top: '3.5rem', right: '1rem',
          background: '#111', border: '1px solid #444',
          borderRadius: '8px', overflow: 'hidden'
        }}>
          <button onClick={handleOpenMap} style={{
            padding: '0.75rem 1.5rem', background: 'none',
            color: '#fff', border: 'none', width: '100%',
            textAlign: 'left', cursor: 'pointer'
          }}>Mapa sentimental</button>
        </div>
      )}

      {showMap ? (
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', letterSpacing: '0.05em' }}>Mapa sentimental</h2>

          <svg viewBox="0 0 200 200" width="100%" height="auto">
            {chartData.length > 0 && (() => {
              const total = chartData.reduce((acc, d) => acc + d.value, 0);
              let angle = 0;
              return chartData.map((d, i) => {
                const portion = d.value / total;
                const [x1, y1] = [100 + 100 * Math.cos(2 * Math.PI * angle), 100 + 100 * Math.sin(2 * Math.PI * angle)];
                angle += portion;
                const [x2, y2] = [100 + 100 * Math.cos(2 * Math.PI * angle), 100 + 100 * Math.sin(2 * Math.PI * angle)];
                const largeArc = portion > 0.5 ? 1 : 0;
                return (
                  <path
                    key={i}
                    d={`M100,100 L${x1},${y1} A100,100 0 ${largeArc} 1 ${x2},${y2} Z`}
                    fill={d.color}
                    style={{
                      transformOrigin: '100px 100px',
                      animation: `fanIn 0.6s ease-out forwards`,
                      animationDelay: `${i * 0.15}s`,
                      filter: 'drop-shadow(0 0 6px rgba(0, 153, 255, 0.4))',
                      opacity: 0
                    }}
                  />
                );
              });
            })()}
          </svg>

          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', marginTop: '2rem', gap: '0.4rem'
          }}>
            {chartData.map((d, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                opacity: 0.9, animation: 'fadeIn 0.5s ease forwards',
                animationDelay: `${i * 0.2}s`
              }}>
                <span style={{
                  width: '12px', height: '12px', borderRadius: '50%',
                  backgroundColor: d.color, display: 'inline-block'
                }}></span>
                {d.name}
              </div>
            ))}
          </div>

          <button onClick={handleCloseMap} style={{
            marginTop: '2rem', padding: '0.6rem 1.2rem',
            background: '#fff', color: '#000', borderRadius: '8px',
            cursor: 'pointer', fontSize: '1rem'
          }}>Volver</button>

          <style jsx global>{`
            @keyframes fanIn {
              0% { transform: scale(0); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
          `}</style>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Arcana</h1>
          <img src="/Art%20Glow%20GIF%20by%20xponentialdesign.gif" alt="GIF" style={{
            width: '300px', height: '300px', marginBottom: '2rem', objectFit: 'cover'
          }} />
          <p><strong>Tiradas restantes:</strong> {drawsLeft}</p>
          <p style={{ opacity: 0.8 }}>Próxima tirada en: {timeLeft}</p>
          <button onClick={getReading} disabled={drawsLeft <= 0 && !isAdmin} style={{
            padding: '1rem 2rem', fontSize: '1.25rem',
            borderRadius: '8px', backgroundColor: '#fff', color: '#333',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            cursor: drawsLeft > 0 || isAdmin ? 'pointer' : 'not-allowed',
            opacity: drawsLeft > 0 || isAdmin ? 1 : 0.5
          }}>{loading ? 'Leyendo…' : 'Haz tu tirada'}</button>
          {reading && <div style={{
            marginTop: '2rem', padding: '1rem 2rem',
            background: 'rgba(255,255,255,0.1)', borderRadius: '8px',
            animation: 'fadeIn 0.5s ease', maxWidth: '90vw'
          }}>{reading}</div>}
        </div>
      )}
    </div>
  );
}
