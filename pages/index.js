import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const isPremium = false;

  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [drawsLeft, setDrawsLeft] = useState(0);
  const [nextReset, setNextReset] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [gifSrc, setGifSrc] = useState("/Art Glow GIF by xponentialdesign.gif");

  const getNextReset = () => {
    const now = new Date();
    let next;
    if (isPremium) {
      const day = now.getDay();
      const diff = (8 - day) % 7;
      next = new Date(now);
      next.setDate(now.getDate() + diff);
    } else {
      next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    next.setHours(0, 0, 0, 0);
    return next;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (nextReset) {
        const now = new Date();
        const diff = nextReset - now;
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / (1000 * 60)) % 60);
          const seconds = Math.floor((diff / 1000) % 60);
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft("¡Ya puedes tirar!");
          resetDraws();
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [nextReset]);

  const resetDraws = () => {
    const max = isPremium ? 3 : 1;
    setDrawsLeft(max);
    if (typeof window !== "undefined") {
      localStorage.setItem("drawsLeft", max);
      localStorage.setItem("lastReset", new Date().toISOString());
    }
    setNextReset(getNextReset());
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const lastResetRaw = localStorage.getItem("lastReset");
    const now = new Date();
    const next = getNextReset();
    setNextReset(next);

    if (!lastResetRaw) {
      resetDraws();
    } else {
      const lastReset = new Date(lastResetRaw);
      if (
