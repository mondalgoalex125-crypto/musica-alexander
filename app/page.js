'use client';
import { useState, useRef, useEffect } from 'react';
import { CANCIONES } from '../canciones';

// ── SVG Icons (sin emojis, íconos vectoriales limpios) ──────────────────────
const IconShuffle = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 3 21 3 21 8"/><polyline points="16 21 21 21 21 16"/>
    <line x1="4" y1="4" x2="21" y2="21"/><line x1="21" y1="4" x2="14.5" y2="10.5"/>
    <line x1="3" y1="21" x2="9.5" y2="14.5"/>
  </svg>
);
const IconPrev = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
  </svg>
);
const IconNext = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 18l8.5-6L6 6v12zm2.5-6 5.5 4-5.5 4V6l5.5 4-5.5 4z" style={{display:'none'}}/>
    <path d="M16 6h2v12h-2zm-2.5 6L5 6v12z"/>
  </svg>
);
const IconPlay = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);
const IconPause = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);
const IconRepeat = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--accent)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);
const IconVolume = ({ level }) => level === 0 ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
  </svg>
) : level < 50 ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconPlus = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconX = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconNote = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
  </svg>
);

export default function Home() {
  const [playlist] = useState(CANCIONES);
  const [cancionActual, setCancionActual] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [cola, setCola] = useState([]);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [volume, setVolume] = useState(80);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('playlist');
  const [toastMsg, setToastMsg] = useState('');

  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const volBarRef = useRef(null);

  const filteredPlaylist = playlist.filter(c =>
    c.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.artista.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Actualizar gradiente de sliders directamente en el DOM (sin re-render) ──
  useEffect(() => {
    if (progressBarRef.current) {
      progressBarRef.current.style.setProperty('--val', `${progress}%`);
    }
  }, [progress]);

  useEffect(() => {
    if (volBarRef.current) {
      volBarRef.current.style.setProperty('--val', `${volume}%`);
    }
  }, [volume]);

  const accentColors = [
    '#A855F7','#EC4899','#3B82F6','#10B981','#F59E0B',
    '#EF4444','#06B6D4','#8B5CF6','#F97316','#14B8A6'
  ];
  const accentColor = cancionActual
    ? accentColors[cancionActual.id % accentColors.length]
    : '#A855F7';

  const currentIndex = cancionActual
    ? playlist.findIndex(s => s.id === cancionActual.id)
    : -1;

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const togglePlay = () => {
    if (!cancionActual) return;
    if (isPlaying) { audioRef.current.pause(); }
    else { audioRef.current.play(); }
    setIsPlaying(!isPlaying);
  };

  const seleccionarCancion = (cancion) => {
    setCancionActual(cancion);
    setIsPlaying(true);
    setProgress(0);
  };

  const agregarAlCola = (e, cancion) => {
    e.stopPropagation();
    setCola(prev => [...prev, cancion]);
    showToast(`"${cancion.titulo}" añadida a la cola`);
  };

  const quitarDeCola = (index) => {
    setCola(prev => prev.filter((_, i) => i !== index));
  };

  const siguienteCancion = () => {
    if (!cancionActual) return;
    if (cola.length > 0) {
      setCancionActual(cola[0]);
      setCola(prev => prev.slice(1));
      setIsPlaying(true);
      return;
    }
    if (isShuffle) {
      setCancionActual(playlist[Math.floor(Math.random() * playlist.length)]);
    } else {
      const idx = playlist.findIndex(s => s.id === cancionActual.id);
      setCancionActual(playlist[idx < playlist.length - 1 ? idx + 1 : 0]);
    }
    setIsPlaying(true);
  };

  const anteriorCancion = () => {
    if (!cancionActual) return;
    const idx = playlist.findIndex(s => s.id === cancionActual.id);
    setCancionActual(playlist[idx > 0 ? idx - 1 : playlist.length - 1]);
    setIsPlaying(true);
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // onTimeUpdate NO toca el DOM de React para el slider — solo actualiza estado necesario
  const onTimeUpdate = () => {
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration || 0;
    const pct = (current / total) * 100 || 0;

    // Actualizar barra directamente sin setState (evita re-render del footer)
    if (progressBarRef.current) {
      progressBarRef.current.value = pct;
      progressBarRef.current.style.setProperty('--val', `${pct}%`);
    }

    // Solo estos dos causan re-render (solo el time display, no el footer entero)
    setCurrentTime(formatTime(current));
    if (audioRef.current.duration) setDuration(formatTime(total));
  };

  const handleProgressChange = (e) => {
    if (!cancionActual || !audioRef.current.duration) return;
    const val = parseFloat(e.target.value);
    audioRef.current.currentTime = (val / 100) * audioRef.current.duration;
    if (progressBarRef.current) progressBarRef.current.style.setProperty('--val', `${val}%`);
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol / 100;
  };

  const onEnded = () => {
    if (isRepeat) { audioRef.current.currentTime = 0; audioRef.current.play(); }
    else { siguienteCancion(); }
  };

  useEffect(() => {
    if (audioRef.current && cancionActual) {
      audioRef.current.load();
      if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [cancionActual]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --accent: ${accentColor};
          --accent-dim: ${accentColor}28;
          --accent-mid: ${accentColor}77;
          --bg: #060608;
          --s1: #0f0f14;
          --s2: #16161d;
          --s3: #1e1e28;
          --border: #ffffff0d;
          --tp: #f0f0f6;
          --ts: #6e6e8a;
          --tm: #35354a;
          --r-sm: 6px; --r-md: 12px; --r-lg: 18px;
          --ease: 0.2s cubic-bezier(0.4,0,0.2,1);
        }

        html,body { height:100%; background:var(--bg); }

        .app {
          font-family:'Inter',sans-serif;
          background:var(--bg);
          color:var(--tp);
          min-height:100vh;
          display:flex;
          flex-direction:column;
          padding-bottom:96px;
          position:relative;
          overflow-x:hidden;
        }

        .bg-glow {
          position:fixed; inset:0; pointer-events:none; z-index:0;
          background:
            radial-gradient(ellipse 55% 45% at 15% 8%, ${accentColor}15 0%, transparent 60%),
            radial-gradient(ellipse 35% 35% at 85% 85%, ${accentColor}0d 0%, transparent 60%);
          transition: background 1s ease;
        }

        /* HEADER */
        .header {
          position:relative; z-index:10;
          display:flex; align-items:center; justify-content:space-between;
          padding:18px 28px 14px;
          border-bottom:1px solid var(--border);
        }
        .logo { display:flex; align-items:center; gap:10px; }
        .logo-icon {
          width:34px; height:34px;
          background:linear-gradient(135deg, var(--accent), ${accentColor}55);
          border-radius:9px;
          display:flex; align-items:center; justify-content:center;
          box-shadow: 0 0 18px ${accentColor}44;
          transition: box-shadow 0.8s;
          color:#fff;
        }
        .logo-text {
          font-family:'Space Grotesk',sans-serif;
          font-size:1.08rem; font-weight:700; letter-spacing:-0.02em;
          color:var(--tp);
        }
        .logo-text span { color:var(--accent); transition:color 0.8s; }
        .pill {
          background:var(--accent-dim);
          color:var(--accent);
          font-size:0.7rem; font-weight:700;
          padding:4px 10px; border-radius:99px;
          border:1px solid ${accentColor}44;
          letter-spacing:0.06em; text-transform:uppercase;
          transition: background 0.8s, color 0.8s, border-color 0.8s;
        }

        /* SEARCH */
        .search-wrap {
          position:relative; z-index:10;
          padding:14px 28px 0;
        }
        .search-icon-wrap {
          position:absolute; left:44px; top:50%; transform:translateY(-50%);
          color:var(--tm); pointer-events:none;
          display:flex; align-items:center;
        }
        .search-input {
          width:100%; max-width:400px;
          background:var(--s2);
          border:1px solid var(--border);
          border-radius:var(--r-md);
          color:var(--tp);
          font-family:'Inter',sans-serif; font-size:0.875rem;
          padding:9px 14px 9px 38px;
          outline:none;
          transition:border-color var(--ease), box-shadow var(--ease);
        }
        .search-input:focus {
          border-color:var(--accent-mid);
          box-shadow:0 0 0 3px var(--accent-dim);
        }
        .search-input::placeholder { color:var(--tm); }

        /* MAIN GRID */
        .main {
          position:relative; z-index:5;
          display:grid;
          grid-template-columns:1fr 300px;
          gap:14px;
          padding:14px 28px;
          flex:1;
        }
        @media(max-width:900px){
          .main { grid-template-columns:1fr; }
          .right-panel { order:-1; }
        }
        @media(max-width:600px){
          .main { padding:10px 12px; }
          .header { padding:14px 14px 12px; }
          .search-wrap { padding:10px 12px 0; }
          .search-icon-wrap { left:28px; }
          .app { padding-bottom:120px; }
          .footer-left,.footer-right { display:none; }
          .player-footer { grid-template-columns:1fr; height:auto; padding:10px 14px; }
        }

        /* LEFT PANEL */
        .left-panel {
          background:var(--s1);
          border:1px solid var(--border);
          border-radius:var(--r-lg);
          overflow:hidden;
          display:flex; flex-direction:column;
        }
        .panel-tabs { display:flex; border-bottom:1px solid var(--border); padding:0 18px; }
        .tab-btn {
          background:none; border:none;
          color:var(--ts);
          font-family:'Inter',sans-serif; font-size:0.78rem; font-weight:700;
          text-transform:uppercase; letter-spacing:0.07em;
          padding:13px 14px;
          cursor:pointer; position:relative;
          transition:color var(--ease);
          display:flex; align-items:center; gap:7px;
        }
        .tab-btn.active { color:var(--accent); }
        .tab-btn.active::after {
          content:'';
          position:absolute; bottom:0; left:0; right:0; height:2px;
          background:var(--accent);
          border-radius:2px 2px 0 0;
          transition:background 0.8s;
        }
        .tab-count {
          background:var(--s3);
          color:var(--ts);
          font-size:0.66rem; font-weight:800;
          min-width:17px; height:17px;
          border-radius:99px; padding:0 4px;
          display:inline-flex; align-items:center; justify-content:center;
        }
        .tab-btn.active .tab-count { background:var(--accent-dim); color:var(--accent); }

        /* TABLE HEADER */
        .table-header {
          display:grid;
          grid-template-columns:38px 1fr 1fr 40px;
          gap:6px;
          padding:10px 18px;
          font-size:0.68rem; font-weight:700; color:var(--tm);
          text-transform:uppercase; letter-spacing:0.09em;
          border-bottom:1px solid var(--border);
        }

        /* PLAYLIST SCROLL */
        .playlist-scroll { overflow-y:auto; flex:1; }
        .playlist-scroll::-webkit-scrollbar { width:3px; }
        .playlist-scroll::-webkit-scrollbar-track { background:transparent; }
        .playlist-scroll::-webkit-scrollbar-thumb { background:var(--tm); border-radius:2px; }

        /* SONG ROW */
        .song-row {
          display:grid;
          grid-template-columns:38px 1fr 1fr 40px;
          gap:6px;
          align-items:center;
          padding:9px 18px;
          cursor:pointer;
          transition:background var(--ease);
          border-bottom:1px solid var(--border);
          position:relative;
        }
        .song-row:last-child { border-bottom:none; }
        .song-row:hover { background:var(--s2); }
        .song-row:hover .row-num { opacity:0; }
        .song-row:hover .row-play-ico { opacity:1; }
        .song-row.active { background:linear-gradient(90deg, var(--accent-dim) 0%, transparent 100%); }

        .row-num-wrap {
          position:relative; display:flex; align-items:center;
          justify-content:center; width:30px; height:30px;
        }
        .row-num { font-size:0.78rem; color:var(--ts); transition:opacity var(--ease); }
        .song-row.active .row-num { color:var(--accent); font-weight:700; }
        .row-play-ico {
          position:absolute; opacity:0;
          color:var(--tp);
          transition:opacity var(--ease);
          display:flex; align-items:center;
        }

        .row-title {
          font-size:0.88rem; font-weight:500; color:var(--tp);
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
          padding-right:6px;
        }
        .song-row.active .row-title { color:var(--accent); }
        .row-artist {
          font-size:0.8rem; color:var(--ts);
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
          padding-right:6px;
        }

        .queue-add-btn {
          width:26px; height:26px; border-radius:50%;
          background:none; border:1px solid var(--tm);
          color:var(--tm);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; opacity:0;
          transition:all var(--ease);
        }
        .song-row:hover .queue-add-btn { opacity:1; }
        .queue-add-btn:hover {
          background:var(--accent); border-color:var(--accent);
          color:#fff; transform:scale(1.12);
        }

        /* PLAYING BARS */
        .playing-bars { display:flex; align-items:flex-end; gap:2px; height:14px; }
        .bar { width:3px; border-radius:1px; background:var(--accent); animation:bbar 0.8s ease-in-out infinite; }
        .bar:nth-child(1){animation-delay:0s;height:6px}
        .bar:nth-child(2){animation-delay:0.15s;height:10px}
        .bar:nth-child(3){animation-delay:0.3s;height:7px}
        @keyframes bbar{0%,100%{transform:scaleY(0.3)}50%{transform:scaleY(1)}}

        /* QUEUE TAB */
        .queue-empty {
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:8px; padding:50px 20px; color:var(--tm); font-size:0.88rem;
        }
        .queue-item-row {
          display:flex; align-items:center; justify-content:space-between;
          gap:10px; padding:11px 18px;
          border-bottom:1px solid var(--border);
          transition:background var(--ease);
        }
        .queue-item-row:hover { background:var(--s2); }
        .queue-pos {
          width:18px; height:18px; background:var(--accent-dim); color:var(--accent);
          border-radius:50%; display:inline-flex; align-items:center; justify-content:center;
          font-size:0.62rem; font-weight:800; flex-shrink:0; margin-right:10px;
        }
        .queue-remove {
          background:none; border:none; color:var(--tm);
          cursor:pointer; padding:5px; border-radius:4px;
          display:flex; align-items:center;
          transition:color var(--ease);
        }
        .queue-remove:hover { color:#ef4444; }

        /* EMPTY SEARCH */
        .empty-state {
          display:flex; flex-direction:column; align-items:center;
          justify-content:center; gap:8px; padding:50px 20px;
          color:var(--tm); font-size:0.88rem;
        }

        /* RIGHT PANEL */
        .right-panel { display:flex; flex-direction:column; gap:12px; }

        .now-playing-card {
          background:var(--s1);
          border:1px solid var(--border);
          border-radius:var(--r-lg);
          padding:22px 18px;
          text-align:center;
          position:relative; overflow:hidden;
        }
        .now-playing-card::before {
          content:''; position:absolute; inset:0;
          background:radial-gradient(ellipse 80% 55% at 50% 0%, var(--accent-dim) 0%, transparent 70%);
          pointer-events:none; transition:background 0.8s;
        }
        .np-label {
          font-size:0.65rem; font-weight:700; letter-spacing:0.12em;
          text-transform:uppercase; color:var(--accent);
          margin-bottom:16px; transition:color 0.8s;
        }
        .album-art {
          width:150px; height:150px;
          background:var(--s3);
          border-radius:var(--r-md);
          margin:0 auto 16px;
          display:flex; align-items:center; justify-content:center;
          color:var(--ts);
          position:relative; overflow:hidden;
          box-shadow:0 10px 36px rgba(0,0,0,0.5), 0 0 0 1px var(--border);
          transition:box-shadow 0.8s;
        }
        .album-art.playing {
          animation:art-glow 2.4s ease-in-out infinite;
        }
        @keyframes art-glow{
          0%,100%{box-shadow:0 10px 36px rgba(0,0,0,0.5),0 0 18px var(--accent-mid),0 0 0 1px var(--border)}
          50%{box-shadow:0 10px 36px rgba(0,0,0,0.5),0 0 36px var(--accent),0 0 0 1px var(--border)}
        }
        .vinyl-ring {
          position:absolute; width:40px; height:40px; border-radius:50%;
          border:3px solid rgba(0,0,0,0.45);
          background:radial-gradient(circle,#1a1a1a 28%,transparent 29%);
          bottom:7px; right:7px; opacity:0.55;
        }
        .np-title {
          font-family:'Space Grotesk',sans-serif;
          font-size:1rem; font-weight:700; color:var(--tp);
          margin-bottom:4px;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .np-artist { font-size:0.8rem; color:var(--ts); }

        /* STATS */
        .stats-card {
          background:var(--s1); border:1px solid var(--border);
          border-radius:var(--r-lg); padding:16px 18px;
        }
        .stats-title {
          font-size:0.65rem; font-weight:700; letter-spacing:0.12em;
          text-transform:uppercase; color:var(--tm); margin-bottom:12px;
        }
        .stat-row {
          display:flex; justify-content:space-between; align-items:center;
          padding:7px 0; border-bottom:1px solid var(--border);
          font-size:0.8rem;
        }
        .stat-row:last-child { border-bottom:none; }
        .stat-label { color:var(--ts); }
        .stat-value { font-weight:700; color:var(--accent); transition:color 0.8s; }

        /* FOOTER */
        .player-footer {
          position:fixed; bottom:0; left:0; right:0;
          height:88px;
          background:rgba(8,8,12,0.94);
          backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
          border-top:1px solid var(--border);
          display:grid;
          grid-template-columns:1fr 1fr 1fr;
          align-items:center;
          padding:0 22px;
          z-index:100;
        }
        .footer-left { display:flex; align-items:center; gap:11px; min-width:0; }
        .footer-art {
          width:42px; height:42px; border-radius:8px;
          background:var(--s3); flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          color:var(--ts); border:1px solid var(--border);
          position:relative; overflow:hidden;
        }
        .footer-art-glow { position:absolute; inset:0; background:var(--accent-dim); transition:background 0.8s; }
        .footer-art-ico { position:relative; z-index:1; }
        .footer-meta { min-width:0; }
        .footer-title { font-size:0.83rem; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .footer-artist { font-size:0.73rem; color:var(--ts); }

        .footer-center {
          display:flex; flex-direction:column; align-items:center; gap:5px;
          justify-self:center; width:100%; max-width:460px;
        }
        .controls { display:flex; align-items:center; gap:14px; }
        .ctrl-btn {
          background:none; border:none; color:var(--ts);
          cursor:pointer; padding:5px; border-radius:6px;
          display:flex; align-items:center; justify-content:center;
          transition:color var(--ease), transform var(--ease);
        }
        .ctrl-btn:hover { color:var(--tp); transform:scale(1.1); }
        .ctrl-btn.active { color:var(--accent); }
        .play-btn {
          width:36px; height:36px; border-radius:50%;
          background:var(--tp); border:none;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; color:#000;
          transition:transform var(--ease), box-shadow var(--ease);
          box-shadow:0 0 0 0 var(--accent-mid);
        }
        .play-btn:hover { transform:scale(1.07); box-shadow:0 0 16px var(--accent-mid); }
        .play-btn:active { transform:scale(0.94); }

        /* PROGRESS ROW — SIN inline background en React */
        .progress-row { display:flex; align-items:center; gap:8px; width:100%; }
        .time-lbl { font-size:0.68rem; color:var(--tm); min-width:28px; text-align:center; }

        /* Slider base — usa CSS custom property --val para el gradiente fill */
        .am-slider {
          flex:1;
          -webkit-appearance:none; appearance:none;
          height:3px; border-radius:99px;
          outline:none; cursor:pointer;
          background:linear-gradient(
            to right,
            var(--accent) 0%,
            var(--accent) var(--val,0%),
            var(--s3) var(--val,0%),
            var(--s3) 100%
          );
          transition:height var(--ease);
        }
        .am-slider:hover { height:5px; }
        .am-slider::-webkit-slider-thumb {
          -webkit-appearance:none; appearance:none;
          width:12px; height:12px; border-radius:50%;
          background:var(--tp); cursor:pointer;
          opacity:0; transition:opacity var(--ease);
        }
        .am-slider:hover::-webkit-slider-thumb { opacity:1; }
        .am-slider::-moz-range-thumb {
          width:12px; height:12px; border-radius:50%;
          background:var(--tp); border:none; cursor:pointer;
        }

        .footer-right { display:flex; align-items:center; justify-content:flex-end; }
        .volume-row { display:flex; align-items:center; gap:8px; }
        .vol-ico { display:flex; align-items:center; color:var(--ts); }
        .vol-slider { width:82px; --val:80%; }

        /* TOAST */
        .toast {
          position:fixed; bottom:104px; left:50%; transform:translateX(-50%) translateY(8px);
          background:var(--s3); border:1px solid var(--border);
          color:var(--tp); font-size:0.8rem; font-weight:500;
          padding:9px 16px; border-radius:99px;
          z-index:200; pointer-events:none;
          box-shadow:0 8px 24px rgba(0,0,0,0.4);
          white-space:nowrap; opacity:0;
          transition:all 0.28s cubic-bezier(0.4,0,0.2,1);
        }
        .toast.show { opacity:1; transform:translateX(-50%) translateY(0); }
      `}</style>

      <div className="app">
        <div className="bg-glow" />

        {/* HEADER */}
        <header className="header">
          <div className="logo">
            <div className="logo-icon"><IconNote /></div>
            <div className="logo-text">alexander<span>_music</span></div>
          </div>
          <span className="pill">{playlist.length} tracks</span>
        </header>

        {/* SEARCH */}
        <div className="search-wrap" style={{ position: 'relative' }}>
          <span className="search-icon-wrap"><IconSearch /></span>
          <input
            className="search-input"
            placeholder="Buscar canciones o artistas..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* MAIN */}
        <main className="main">
          {/* LEFT */}
          <div className="left-panel">
            <div className="panel-tabs">
              <button className={`tab-btn ${activeTab === 'playlist' ? 'active' : ''}`} onClick={() => setActiveTab('playlist')}>
                Playlist <span className="tab-count">{filteredPlaylist.length}</span>
              </button>
              <button className={`tab-btn ${activeTab === 'queue' ? 'active' : ''}`} onClick={() => setActiveTab('queue')}>
                Cola <span className="tab-count">{cola.length}</span>
              </button>
            </div>

            {activeTab === 'playlist' && (
              <>
                <div className="table-header">
                  <span style={{ textAlign: 'center' }}>#</span>
                  <span>Título</span>
                  <span>Artista</span>
                  <span />
                </div>
                <div className="playlist-scroll">
                  {filteredPlaylist.length === 0 ? (
                    <div className="empty-state">
                      <span>No se encontraron canciones</span>
                    </div>
                  ) : filteredPlaylist.map((cancion, index) => {
                    const isActive = cancionActual?.id === cancion.id;
                    return (
                      <div
                        key={cancion.id}
                        className={`song-row ${isActive ? 'active' : ''}`}
                        onClick={() => seleccionarCancion(cancion)}
                      >
                        <div className="row-num-wrap">
                          {isActive && isPlaying ? (
                            <div className="playing-bars"><div className="bar"/><div className="bar"/><div className="bar"/></div>
                          ) : (
                            <>
                              <span className="row-num">{index + 1}</span>
                              <span className="row-play-ico"><IconPlay /></span>
                            </>
                          )}
                        </div>
                        <span className="row-title">{cancion.titulo}</span>
                        <span className="row-artist">{cancion.artista}</span>
                        <button className="queue-add-btn" onClick={(e) => agregarAlCola(e, cancion)} title="Añadir a la cola">
                          <IconPlus />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {activeTab === 'queue' && (
              <div className="playlist-scroll">
                {cola.length === 0 ? (
                  <div className="queue-empty">
                    <span>Tu cola está vacía</span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--tm)' }}>Añade canciones con el botón +</span>
                  </div>
                ) : cola.map((c, i) => (
                  <div key={i} className="queue-item-row">
                    <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                      <span className="queue-pos">{i + 1}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.titulo}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ts)' }}>{c.artista}</div>
                      </div>
                    </div>
                    <button className="queue-remove" onClick={() => quitarDeCola(i)} title="Quitar"><IconX /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="right-panel">
            <div className="now-playing-card">
              <div className="np-label">▶ Reproduciendo ahora</div>
              <div className={`album-art ${isPlaying ? 'playing' : ''}`}>
                <IconNote />
                <div className="vinyl-ring" />
              </div>
              <div className="np-title">{cancionActual ? cancionActual.titulo : 'Elige una canción'}</div>
              <div className="np-artist">{cancionActual ? cancionActual.artista : '—'}</div>
            </div>

            <div className="stats-card">
              <div className="stats-title">Sesión</div>
              <div className="stat-row"><span className="stat-label">Total canciones</span><span className="stat-value">{playlist.length}</span></div>
              <div className="stat-row"><span className="stat-label">En cola</span><span className="stat-value">{cola.length}</span></div>
              <div className="stat-row"><span className="stat-label">Modo</span>
                <span className="stat-value">{isShuffle ? 'Shuffle' : isRepeat ? 'Repeat' : 'Normal'}</span>
              </div>
              {cancionActual && (
                <div className="stat-row"><span className="stat-label">Pista</span><span className="stat-value">{currentIndex + 1} / {playlist.length}</span></div>
              )}
            </div>
          </div>
        </main>

        <audio ref={audioRef} onTimeUpdate={onTimeUpdate} onEnded={onEnded}>
          {cancionActual && <source src={cancionActual.url} type="audio/mpeg" />}
        </audio>

        {/* FOOTER */}
        <footer className="player-footer">
          <div className="footer-left">
            {cancionActual && (
              <>
                <div className="footer-art">
                  <div className="footer-art-glow" />
                  <span className="footer-art-ico"><IconNote /></span>
                </div>
                <div className="footer-meta">
                  <div className="footer-title">{cancionActual.titulo}</div>
                  <div className="footer-artist">{cancionActual.artista}</div>
                </div>
              </>
            )}
          </div>

          <div className="footer-center">
            <div className="controls">
              <button className={`ctrl-btn ${isShuffle ? 'active' : ''}`} onClick={() => setIsShuffle(!isShuffle)} title="Shuffle">
                <IconShuffle active={isShuffle} />
              </button>
              <button className="ctrl-btn" onClick={anteriorCancion} title="Anterior"><IconPrev /></button>
              <button className="play-btn" onClick={togglePlay} title={isPlaying ? 'Pausar' : 'Reproducir'}>
                {isPlaying ? <IconPause /> : <IconPlay />}
              </button>
              <button className="ctrl-btn" onClick={siguienteCancion} title="Siguiente"><IconNext /></button>
              <button className={`ctrl-btn ${isRepeat ? 'active' : ''}`} onClick={() => setIsRepeat(!isRepeat)} title="Repetir">
                <IconRepeat active={isRepeat} />
              </button>
            </div>
            <div className="progress-row">
              <span className="time-lbl">{currentTime}</span>
              <input
                ref={progressBarRef}
                type="range" min="0" max="100" defaultValue="0"
                onChange={handleProgressChange}
                className="am-slider"
                style={{ '--val': '0%' }}
              />
              <span className="time-lbl">{duration}</span>
            </div>
          </div>

          <div className="footer-right">
            <div className="volume-row">
              <span className="vol-ico"><IconVolume level={Number(volume)} /></span>
              <input
                ref={volBarRef}
                type="range" min="0" max="100" defaultValue="80"
                onChange={handleVolumeChange}
                className="am-slider vol-slider"
                style={{ '--val': '80%' }}
              />
            </div>
          </div>
        </footer>

        <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
      </div>
    </>
  );
}