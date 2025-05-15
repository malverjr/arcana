import SentimentalChart from "../components/SentimentalChart";
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
  const isNormal = userRole === 'normal';
  const isArcana = userRole === 'arcana';
  const isArcanaPlus = userRole === 'arcana+';
  const isAdmin = userRole === 'admin';

  const themes = [
    ...(isArcana || isArcanaPlus || isAdmin ? [
      "amor", "carrera", "sombra", "intuicion", "destino"
    ] : []),
    ...(isArcanaPlus || isAdmin ? [
      "crecimiento", "salud", "pasado", "presente", "futuro"
    ] : [])
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
  const timeoutRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [chartData, setChartData] = useState([]);

  const maxDraws = isAdmin ? Infinity : isArcanaPlus ? 5 : isArcana ? 3 : 1;

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
  const drawsLeft = maxDraws - used;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh',
      background: '#000', color: '#fff', padding: '2rem 1rem 3rem 1rem',
      fontFamily: `"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
      position: 'relative'
    }}>
      <Head><title>Arcana</title></Head>

      {(isArcana || isArcanaPlus) && (
        <button onClick={handleMenuToggle} style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'none', border: 'none', color: '#fff',
          fontSize: '1.5rem', cursor: 'pointer', zIndex: 20
        }}>
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      )}

      {menuOpen && (
        <div style={{
          position: 'absolute', top: '3.5rem', right: '1rem',
          background: '#111', border: '1px solid #444',
          borderRadius: '8px', overflow: 'hidden', zIndex: 10
        }}>
          <button onClick={handleOpenMap} style={{
            padding: '0.75rem 1.5rem', background: 'none',
            color: '#fff', border: 'none', width: '100%',
            textAlign: 'left', cursor: 'pointer'
          }}>Mapa sentimental</button>
          <button style={{
            padding: '0.75rem 1.5rem', background: 'none',
            color: '#fff', border: 'none', width: '100%',
            textAlign: 'left', cursor: 'pointer'
          }}>Cuenta</button>
        </div>
      )}

{showMap ? <SentimentalChart /> : (
        <>
          <h1 style={{ fontSize: '3rem', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>Arcana</h1>
          <img
            src="/Art%20Glow%20GIF%20by%20xponentialdesign.gif"
            alt="Animación Mística"
            style={{ width: '300px', height: '300px', marginBottom: '2rem', objectFit: 'cover' }}
          />
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '0.5rem', marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {themes.slice(0, 5).map(t => (
                <button
                  key={t} onClick={() => setSelected(t)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '4px',
                    background: selected === t ? '#fff' : 'none',
                    color: selected === t ? '#000' : '#fff',
                    cursor: 'pointer'
                  }}>
                  {labels[t]}
                </button>
              ))}
            </div>
            {themes.length > 5 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {themes.slice(5).map(t => (
                  <button
                    key={t} onClick={() => setSelected(t)}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '4px',
                      background: selected === t ? '#fff' : 'none',
                      color: selected === t ? '#000' : '#fff',
                      cursor: 'pointer'
                    }}>
                    {labels[t]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <p style={{ marginBottom: '0.25rem' }}>
            <strong>{isAdmin ? 'Administrador' : isArcanaPlus ? 'Usuario Arcana+' : isArcana ? 'Usuario Arcana' : 'Usuario Libre'}</strong>
            {' – Tiradas restantes: '}{isFinite(drawsLeft) ? drawsLeft : '∞'}
          </p>
          <p style={{ marginBottom: '1rem', opacity: 0.8 }}>
            Próxima tirada en: {timeLeft}
          </p>

          <button onClick={getReading} disabled={drawsLeft <= 0 && !isAdmin} style={{
            padding: '1rem 2rem', fontSize: '1.25rem',
            borderRadius: '8px', backgroundColor: '#fff', color: '#333',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            cursor: drawsLeft > 0 || isAdmin ? 'pointer' : 'not-allowed',
            opacity: drawsLeft > 0 || isAdmin ? 1 : 0.5
          }}>
            {loading ? 'Leyendo…' : 'Haz tu tirada'}
          </button>

          {reading && (
            <div style={{
              marginTop: '2rem', padding: '1rem 2rem',
              background: 'rgba(200,200,200,0.2)', borderRadius: '8px',
              animation: 'fadeIn 0.5s ease', maxWidth: '90vw', textAlign: 'center'
            }}>
              <span>{reading}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
