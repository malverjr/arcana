<style jsx>{`
  .container {
    max-width: 800px;
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
    margin-bottom: 2rem;
  }
  .cube {
    width: 300px;
    height: 300px;
    margin-bottom: 2rem;
    object-fit: cover;
    animation: float 4s ease-in-out infinite;
  }
  .themes {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    flex-wrap: wrap; /* permite varias filas si falta espacio */
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
    white-space: nowrap;
  }
  .theme-btn:hover {
    background: rgba(255,255,255,0.15);
  }
  .theme-btn.selected {
    background: rgba(255,255,255,0.15);
    border-color: #fff;
    text-decoration: underline;
  }
  .status {
    letter-spacing: .02em;
    font-size: 1rem;
    margin-bottom: .5rem;
  }
  .timer {
    font-size: .9rem;
    opacity: .8;
    margin-bottom: 2rem;
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
    transition: opacity .2s;
  }
  .draw-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .reading {
    margin-top: 2rem;
    padding: 1rem 2rem;
    background: rgba(200,200,200,0.2);
    border-radius: 8px;
    animation: fadeIn .5s ease;
  }

  @keyframes float {
    0%,100% { transform: translateY(0); }
    50%     { transform: translateY(-10px); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes bounce {
    0%,100% { transform: scale(1); }
    50%     { transform: scale(1.05); }
  }

  /* Ajustes responsivos */
  @media (max-width: 600px) {
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
    }
    .cube {
      width: 80%;
      height: auto;
      max-width: 250px;
      margin-bottom: 1.5rem;
    }
    .themes {
      gap: 0.25rem;
      margin-bottom: 1.5rem;
    }
    .theme-btn {
      flex: 1 1 auto;
      font-size: .9rem;
      padding: .5rem;
    }
    .draw-btn {
      width: 100%;
      font-size: 1.1rem;
      padding: .75rem;
    }
    .status, .timer {
      text-align: center;
    }
  }
`}</style>
