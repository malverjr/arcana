import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';

// Calcula número de semana ISO
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export default function Home() {
  const isPremium = true; // true = Premium user

  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [drawsUsed, setDrawsUsed] = useState(0);
  const [nextReset, setNextReset] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const resetTimeoutRef = useRef(null);
  const maxDraws = isPremium ? 3 : 1;

  // 1. Period key
  const getPeriodKey = () => {
    const now = new Date();
    if (isPremium) {
      const w = getWeekNumber(now);
      return `${now.getFullYear()}-W${String(w).padStart(2,'0')}`;
    } else {
      const m = String(now.getMonth()+1).padStart(2,'0');
      return `${now.getFullYear()}-M${m}`;
    }
  };

  // 2. Next reset date
  const getNextResetDate = () => {
    const now = new Date();
    let nxt;
    if (isPremium) {
      const daysToMon = (8 - now.getDay()) % 7;
      nxt = new Date(now);
      nxt.setDate(now.getDate() + daysToMon);
    } else {
      nxt = new Date(now.getFullYear(), now.getMonth()+1, 1);
    }
    nxt.setHours(0,0,0,0);
    return nxt;
  };

  // 3. Reset period usage
  const resetPeriod = () => {
    const key = getPeriodKey();
    localStorage.setItem("periodKey", key);
    localStorage.setItem("drawsUsed", "0");
    setDrawsUsed(0);
  };

  // 4. On mount: init drawsUsed, schedule reset
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("periodKey");
    const current = getPeriodKey();
    if (stored !== current) resetPeriod();
    else setDrawsUsed(+localStorage.getItem("drawsUsed")||0);

    const nr = getNextResetDate();
    setNextReset(nr);
    const ms = nr.getTime() - Date.now();
    resetTimeoutRef.current = setTimeout(() => {
      resetPeriod();
      // schedule next reset
      const next2 = getNextResetDate();
      setNextReset(next2);
      const ms2 = next2.getTime() - Date.now();
      resetTimeoutRef.current = setTimeout(resetPeriod, ms2);
    }, ms);

    return ()=>{
      clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  // 5. Pure countdown UI
  useEffect(() => {
    if (!nextReset) return;
    const iv = setInterval(()=>{
      const diff = nextReset - Date.now();
      if (diff>0) {
        const d = Math.floor(diff/86400000);
        const h = Math.floor((diff%86400000)/3600000);
        const m = Math.floor((diff%3600000)/60000);
        const s = Math.floor((diff%60000)/1000);
        setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
      } else {
        setTimeLeft(`0d 0h 0m 0s`);
      }
    },500);
    return ()=>clearInterval(iv);
  },[nextReset]);

  // 6. Fetch reading & mark usage
  const getReading = async ()=>{
    if (drawsUsed>=maxDraws) return;
    setLoading(true);
    setReading("");
    try {
      const res = await fetch('/api/tarot');
      const { reading } = await res.json();
      setReading(reading);
      setDrawsUsed(prev=>{
        const u = prev+1;
        localStorage.setItem("drawsUsed", String(u));
        return u;
      });
    } catch {
      setReading("Error al obtener la tirada. Inténtalo de nuevo.");
    }
    setLoading(false);
  };

  const drawsLeft = maxDraws - drawsUsed;

  return (
    <div style={{
      display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',
      minHeight:'100vh',background:'black',color:'white',
      fontFamily:"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding:'0 1rem'
    }}>
      <Head><title>Arcana</title></Head>
      <h1 style={{fontSize:'3rem',textShadow:'1px 1px 4px rgba(255,255,255,0.3)'}}>Arcana</h1>
      <img
        src="/Art Glow GIF by xponentialdesign.gif"
        alt="Animación Mística"
        style={{width:300,height:300,marginBottom:'2rem',objectFit:'cover'}}
      />
      <p style={{marginBottom:4}}>
        {isPremium?'Usuario Premium':'Usuario Normal'} – Tiradas restantes: {drawsLeft}
      </p>
      <p style={{marginBottom:'1rem',opacity:0.8}}>
        Próxima tirada en: {timeLeft}
      </p>
      <button
        onClick={getReading}
        disabled={drawsLeft<=0}
        style={{
          padding:'1rem 2rem',fontSize:'1.25rem',border:'none',borderRadius:8,
          cursor:drawsLeft>0?'pointer':'not-allowed',background:'#fff',color:'#333',
          boxShadow:'0 4px 8px rgba(255,255,255,0.2)',transition:'transform .2s',
          opacity:drawsLeft>0?1:0.5
        }}
        onMouseOver={e=>e.currentTarget.style.transform='scale(1.05)'}
        onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}
      >
        {loading?'Leyendo...':'Haz tu tirada'}
      </button>
      {reading && (
        <div style={{
          marginTop:'2rem',padding:'1rem 2rem',background:'rgba(255,255,255,0.1)',
          borderRadius:8,boxShadow:'0 2px 4px rgba(255,255,255,0.2)',fontSize:'1.5rem'
        }}>
          {reading}
        </div>
      )}
    </div>
  );
}
