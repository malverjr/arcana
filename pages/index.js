import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';

// Calcula número de semana ISO
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export default function Home() {
  // Pásalo a true para Usuario Arcana
  const isPremium = true;

  // Temáticas y labels
  const themes = ["amor", "carrera", "sombra", "intuicion", "destino"];
  const labels = {
    amor:      "Amor & Relaciones",
    carrera:   "Carrera & Abundancia",
    sombra:    "Sombra & Transformación",
    intuicion: "Intuición & Misterio",
    destino:   "Propósito & Destino"
  };
  const [selected, setSelected] = useState(themes[0]);

  // Estado de la UI
  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [used, setUsed] = useState(0);
  const [nextReset, setNextReset] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const timeoutRef = useRef(null);

  const max = isPremium ? 3 : 1;

  // Período
  const getPeriod = () => {
    const now = new Date();
    if (isPremium) {
      const w = getWeekNumber(now);
      return `${now.getFullYear()}-W${String(w).padStart(2, "0")}`;
    }
    return `${now.getFullYear()}-M${String(now.getMonth()+1).padStart(2, "0")}`;
  };

  // Próximo reset
  const getNext = () => {
    const now = new Date();
    let nx;
    if (isPremium) {
      const daysToMon = (8 - now.getDay()) % 7;
      nx = new Date(now);
      nx.setDate(now.getDate() + daysToMon);
    } else {
      nx = new Date(now.getFullYear(), now.getMonth()+1, 1);
    }
    nx.setHours(0,0,0,0);
    return nx;
  };

  // Resetea conteo
  const reset = () => {
    localStorage.setItem("periodKey", getPeriod());
    localStorage.setItem("drawsUsed", "0");
    setUsed(0);
  };

  // Init y programación reset
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("periodKey");
    const current = getPeriod();
    if (stored !== current) reset();
    else setUsed(Number(localStorage.getItem("drawsUsed")||"0"));

    const nr = getNext();
    setNextReset(nr);
    const ms = nr.getTime() - Date.now();
    timeoutRef.current = setTimeout(() => {
      reset();
      const n2 = getNext();
      setNextReset(n2);
      const ms2 = n2.getTime() - Date.now();
      timeoutRef.current = setTimeout(reset, ms2);
    }, ms);

    return () => clearTimeout(timeoutRef.current);
  }, []);

  // Contador UI
  useEffect(() => {
    if (!nextReset) return;
    const iv = setInterval(() => {
      const diff = nextReset.getTime() - Date.now();
      if (diff>0) {
        const d = Math.floor(diff/86400000);
        const h = Math.floor((diff%86400000)/3600000);
        const m = Math.floor((diff%3600000)/60000);
        const s = Math.floor((diff%60000)/1000);
        setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
      } else {
        setTimeLeft("0d 0h 0m 0s");
      }
    }, 500);
    return () => clearInterval(iv);
  }, [nextReset]);

  // Obtener lectura
  const getReading = async () => {
    if (used >= max) return;
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
        const nu = u+1;
        localStorage.setItem("drawsUsed", String(nu));
        return nu;
      });
    } catch {
      setReading("Error al obtener la tirada. Inténtalo de nuevo.");
    }
    setLoading(false);
  };

  const left = max - used;

  return (
    <div style={{
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      minHeight:"100vh", background:"#000", color:"#fff",
      fontFamily:"'Segoe UI', Tahoma, Geneva, sans-serif",
      padding:"0 1rem"
    }}>
      <Head><title>Arcana</title></Head>

      <h1 style={{
        fontSize:"3rem", textShadow:"1px 1px 4px rgba(0,0,0,0.3)",
        marginBottom:"1.5rem"
      }}>Arcana</h1>

      <img
        src="/Art Glow GIF by xponentialdesign.gif"
        alt="Animación Mística"
        style={{
          width:300, height:300, marginBottom:"2rem",
          objectFit:"cover"
        }}
      />

      {isPremium && (
        <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1.5rem" }}>
          {themes.map(t => (
            <button
              key={t}
              onClick={() => setSelected(t)}
              style={{
                padding:"0.5rem 1rem",
                border:"1px solid rgba(255,255,255,0.3)",
                borderRadius:"4px",
                background:"none",
                color:"#fff",
                cursor:"pointer",
                transition:"background 0.2s, color 0.2s"
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.color = "#000";
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.color = "#fff";
              }}
            >
              {labels[t]}
            </button>
          ))}
        </div>
      )}

      <p style={{ marginBottom:".25rem" }}>
        <strong>{isPremium?"Usuario Arcana":"Usuario Libre"}</strong>
        {" – Tiradas restantes: "}{left}
      </p>
      <p style={{ marginBottom:"1rem", opacity:0.8 }}>
        Próxima tirada en: {timeLeft}
      </p>

      <button
        onClick={getReading}
        disabled={left<=0}
        style={{
          padding:"1rem 2rem", fontSize:"1.25rem",
          border:"none", borderRadius:"8px",
          background:"#fff", color:"#333",
          boxShadow:"0 4px 8px rgba(0,0,0,0.2)",
          cursor:left>0?"pointer":"not-allowed",
          opacity:left>0?1:0.5,
          transition:"transform 0.2s"
        }}
        onMouseOver={e => left>0 && (e.currentTarget.style.transform="scale(1.05)")}
        onMouseOut={e => e.currentTarget.style.transform="scale(1)"}
      >
        {loading?"Leyendo...":"Haz tu tirada"}
      </button>

      {reading && (
        <div style={{
          marginTop:"2rem", padding:"1rem 2rem",
          background:"rgba(200,200,200,0.2)", borderRadius:"8px"
        }}>
          {reading}
        </div>
      )}
    </div>
  );
}
