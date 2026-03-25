import { useState, useEffect, useRef } from 'react';

// ─────────────────────────────────────────────
// DATA — scraped from all ZIPs (Jan 2026 → now)
// ─────────────────────────────────────────────

const AGENTS = [
  { id: 1, name: 'Manus AI', role: 'Master Orchestrator', category: 'Core', icon: '🧠', desc: 'Advanced autonomous agent — task automation and full ecosystem orchestration', status: 'LIVE' },
  { id: 2, name: 'Sinatra Copilot', role: 'Routing Intelligence', category: 'Core', icon: '🎯', desc: 'Intelligent routing system — routes commands to the right agent automatically', status: 'LIVE' },
  { id: 3, name: 'ChatGPT', role: 'Conversational AI', category: 'Language', icon: '💬', desc: 'OpenAI GPT-4 — conversational AI, answers, analysis, and content generation', status: 'LIVE' },
  { id: 4, name: 'Grok', role: 'xAI Intelligence', category: 'Language', icon: '⚡', desc: 'xAI Grok — real-time information, ideation, and advanced reasoning', status: 'LIVE' },
  { id: 5, name: 'Hey Cyan', role: 'M02 Glasses Agent', category: 'Hardware', icon: '👓', desc: 'M02 smart glasses SDK — camera feed, AR overlay, real-time vision processing', status: 'LIVE' },
  { id: 6, name: 'Midjourney', role: 'Image Generation', category: 'Creative', icon: '🎨', desc: 'AI art generation — $10/month basic tier, professional visual content', status: 'LIVE' },
  { id: 7, name: 'Adobe Firefly', role: 'Commercial Images', category: 'Creative', icon: '🔥', desc: 'Commercial-safe AI images — FREE tier available, brand-safe content', status: 'LIVE' },
  { id: 8, name: 'Sora', role: 'Video Generation', category: 'Creative', icon: '🎬', desc: 'OpenAI Sora — AI video generation from text prompts', status: 'LIVE' },
  { id: 9, name: 'ElevenLabs', role: 'Voice Synthesis', category: 'Audio', icon: '🎙️', desc: 'Neural voice synthesis — text-to-speech in any language, any voice', status: 'LIVE' },
  { id: 10, name: 'Bardeen AI', role: 'Browser Automation', category: 'Automation', icon: '🤖', desc: 'Workflow automation, form filling, web tasks — FREE tier available', status: 'LIVE' },
  { id: 11, name: 'IBM Watson IoT', role: 'Smart Device Management', category: 'IoT', icon: '📡', desc: 'IoT device management, sensor data — FREE tier (limited devices)', status: 'LIVE' },
  { id: 12, name: 'Microsoft Azure IoT', role: 'Enterprise IoT', category: 'IoT', icon: '☁️', desc: 'Enterprise IoT, device twins — FREE tier (8k messages/day)', status: 'LIVE' },
  { id: 13, name: 'PyGPT', role: 'Python Bot Generation', category: 'Dev', icon: '🐍', desc: 'FREE open source — Python bot generation, automation scripts, PyGBT trading bots', status: 'LIVE' },
  { id: 14, name: 'Codeium / Copilot', role: 'Code Intelligence', category: 'Dev', icon: '💻', desc: 'Code generation, completion, debugging — FREE tier available', status: 'LIVE' },
  { id: 15, name: 'Zeely', role: 'Business Automation', category: 'Business', icon: '📊', desc: 'Business process automation — ecommerce, marketing, and sales workflows', status: 'LIVE' },
  { id: 16, name: 'Stride', role: 'Financial Integration', category: 'Business', icon: '💰', desc: 'Expense tracking, mileage, receipts — FREE for basic tier', status: 'LIVE' },
];

const GEMS = [
  { name: 'MarketGem', icon: '📈', desc: 'Market scanning and competitor analysis prompts' },
  { name: 'OfferGem', icon: '💎', desc: 'Offer creation and sales copy generation' },
  { name: 'PageGem', icon: '📄', desc: 'Landing page and funnel copy prompts' },
  { name: 'AdsGem', icon: '📢', desc: 'Ad copy generation for Meta, Google, TikTok' },
  { name: 'ResponseGem', icon: '💬', desc: 'Lead response scripts and follow-up sequences' },
];

const SWARM_TIERS = [
  { name: 'Scout', price: '$0', agents: '3 Agents', mult: 'Free Access', color: '#00FFFF', desc: 'Basic orchestrator + 3 core agents. Get started with Leviathan.' },
  { name: 'Soldier', price: '$99/mo', agents: '6 Agents', mult: '2× ROI Target', color: '#7B2FBE', desc: 'Core agents + LeadGen Gems. Built for ecommerce and freelancers.' },
  { name: 'Commander', price: '$500/mo', agents: '10 Agents', mult: '4× ROI Target', color: '#FFD700', desc: 'Full automation suite. IoT, vision, voice, and business agents.' },
  { name: 'General', price: '$1,000/mo', agents: '13 Agents', mult: '5× ROI Target', color: '#FF6B35', desc: 'Advanced swarm. All creative, dev, and financial agents unlocked.' },
  { name: 'Leviathan', price: '$2,000/mo', agents: 'All 16+', mult: '6× ROI Target', color: '#00FF88', desc: 'Full Leviathan swarm. Every agent, every feature, priority queue.' },
];

const ECOSYSTEM_LAYERS = [
  { name: 'HaShem\'s Leviathan App', type: 'Android', status: 'IN DEV', icon: '📱', desc: 'Android command hub — M02 glasses, 16 AI agents, Gematria system, voice commands' },
  { name: 'AI Agent Hub', type: 'Web App', status: 'LIVE', icon: '🌐', desc: 'Web-based agent management platform — manage all agents from your browser', link: '/home' },
  { name: 'LeadGen Module', type: 'Module v1.0', status: 'BUILT', icon: '🎯', desc: 'Lead management, contractor routing, AI Gems prompt pack, REST API' },
  { name: 'CRM Plus (Katan HaShem)', type: 'Android', status: 'IN DEV', icon: '🤝', desc: 'Full CRM with Starter/Growth/Enterprise tiers — built for wealth builders' },
  { name: 'LVTN Token', type: 'Solana SPL', status: 'DEVNET', icon: '🪙', desc: '26M supply — utility token powering the entire Leviathan ecosystem' },
  { name: 'M02 Glasses Integration', type: 'Hardware SDK', status: 'INTEGRATED', icon: '👓', desc: 'Hey Cyan SDK — camera streaming, AR overlay, real-time translation to glasses display' },
  { name: 'Gematria System', type: 'Feature', status: 'BUILT', icon: '✡️', desc: 'Hebrew letter matrix animations, sacred number meanings, 4 calculation methods' },
  { name: 'Leviathan Chain', type: 'Future L1', status: 'SPEC', icon: '⛓️', desc: 'Future blockchain — faster than Solana, lower fees, full interoperability (Phase 3 roadmap)' },
];

const SACRED_NUMBERS = [
  { value: 26, meaning: 'יהוה — The Name of HaShem', hebrew: 'יהוה' },
  { value: 72, meaning: 'שם — Shem, The Name', hebrew: 'שם' },
  { value: 358, meaning: 'משיח — Messiah', hebrew: 'משיח' },
  { value: 613, meaning: 'תרי"ג — 613 Commandments', hebrew: 'תרי"ג' },
];

const ROADMAP = [
  {
    phase: 'Phase 1', title: 'Foundation', status: 'NOW', color: '#00FFFF',
    items: ['LVTN token minted on devnet (26M supply)', 'AI Agent Hub web app live', 'LeadGen Module v1.0 built', 'Android app spec complete (v5.0)', 'M02 glasses SDK integrated', 'Gematria system designed']
  },
  {
    phase: 'Phase 2', title: 'Launch', status: 'NEXT', color: '#FFD700',
    items: ['LVTN mainnet deployment', 'Raydium liquidity pool', 'CoinGecko + Jupiter verification', 'Android app public release', 'CRM Plus launch', 'Swarm subscription tiers live']
  },
  {
    phase: 'Phase 3', title: 'Empire', status: 'FUTURE', color: '#7B2FBE',
    items: ['Leviathan Chain (faster than Solana, lower fees)', 'Full cross-chain interoperability', 'MOSHE token (companion coin)', 'Drone integration', 'Satellite server network (Steam Decks)', 'Shopify developer app']
  },
];

// ─────────────────────────────────────────────
// SPARKLE EFFECT
// ─────────────────────────────────────────────
function useSparkle() {
  useEffect(() => {
    const createSparkle = (e: MouseEvent) => {
      const sparkle = document.createElement('div');
      sparkle.style.cssText = `
        position:fixed;left:${e.clientX}px;top:${e.clientY}px;
        width:6px;height:6px;border-radius:50%;pointer-events:none;z-index:9999;
        background:radial-gradient(circle,#FFD700,#00FFFF);
        animation:sparkle-fade 0.6s ease-out forwards;
      `;
      document.body.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 600);
      // Extra sparkles
      for (let i = 0; i < 5; i++) {
        const s2 = document.createElement('div');
        const angle = (i / 5) * Math.PI * 2;
        const dist = 20 + Math.random() * 20;
        s2.style.cssText = `
          position:fixed;
          left:${e.clientX + Math.cos(angle) * dist}px;
          top:${e.clientY + Math.sin(angle) * dist}px;
          width:4px;height:4px;border-radius:50%;pointer-events:none;z-index:9999;
          background:${i % 2 === 0 ? '#FFD700' : '#00FFFF'};
          animation:sparkle-fade ${0.4 + Math.random() * 0.4}s ease-out forwards;
        `;
        document.body.appendChild(s2);
        setTimeout(() => s2.remove(), 800);
      }
    };
    document.addEventListener('click', createSparkle);
    return () => document.removeEventListener('click', createSparkle);
  }, []);
}

// ─────────────────────────────────────────────
// MATRIX HEBREW RAIN
// ─────────────────────────────────────────────
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const hebrew = 'אבגדהוזחטיכלמנסעפצקרשת';
    const cols = Math.floor(canvas.width / 20);
    const drops: number[] = Array(cols).fill(1);
    const interval = setInterval(() => {
      ctx.fillStyle = 'rgba(0,0,51,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00FFFF';
      ctx.font = '16px monospace';
      drops.forEach((y, i) => {
        const char = hebrew[Math.floor(Math.random() * hebrew.length)];
        ctx.fillStyle = Math.random() > 0.9 ? '#FFD700' : '#00FFFF';
        ctx.globalAlpha = 0.3 + Math.random() * 0.4;
        ctx.fillText(char, i * 20, y * 20);
        ctx.globalAlpha = 1;
        if (y * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    }, 60);
    return () => clearInterval(interval);
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" />;
}

// ─────────────────────────────────────────────
// GEMATRIA CALCULATOR
// ─────────────────────────────────────────────
const GEMATRIA_VALUES: Record<string, number> = {
  'א':1,'ב':2,'ג':3,'ד':4,'ה':5,'ו':6,'ז':7,'ח':8,'ט':9,'י':10,
  'כ':20,'ל':30,'מ':40,'נ':50,'ס':60,'ע':70,'פ':80,'צ':90,'ק':100,
  'ר':200,'ש':300,'ת':400,'ך':20,'ם':40,'ן':50,'ף':80,'ץ':90
};
function calcGematria(text: string): number {
  return text.split('').reduce((sum, c) => sum + (GEMATRIA_VALUES[c] || 0), 0);
}

// ─────────────────────────────────────────────
// TREE OF LIFE SVG
// ─────────────────────────────────────────────
function TreeOfLife({ opacity = 0.08 }: { opacity?: number }) {
  const sephirot = [
    { x: 50, y: 5, name: 'כתר', label: 'Keter' },
    { x: 25, y: 20, name: 'חכמה', label: 'Chokhmah' },
    { x: 75, y: 20, name: 'בינה', label: 'Binah' },
    { x: 25, y: 40, name: 'חסד', label: 'Chesed' },
    { x: 75, y: 40, name: 'גבורה', label: 'Gevurah' },
    { x: 50, y: 50, name: 'תפארת', label: 'Tiferet' },
    { x: 25, y: 65, name: 'נצח', label: 'Netzach' },
    { x: 75, y: 65, name: 'הוד', label: 'Hod' },
    { x: 50, y: 75, name: 'יסוד', label: 'Yesod' },
    { x: 50, y: 92, name: 'מלכות', label: 'Malkhut' },
  ];
  const paths = [
    [0,1],[0,2],[1,2],[1,3],[2,4],[1,5],[2,5],[3,4],[3,5],[4,5],
    [3,6],[4,7],[5,6],[5,7],[5,8],[6,7],[6,8],[7,8],[8,9]
  ];
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      {paths.map(([a, b], i) => (
        <line key={i} x1={sephirot[a].x} y1={sephirot[a].y} x2={sephirot[b].x} y2={sephirot[b].y}
          stroke="#00FFFF" strokeWidth="0.3" />
      ))}
      {sephirot.map((s, i) => (
        <g key={i}>
          <circle cx={s.x} cy={s.y} r="3" fill="none" stroke="#FFD700" strokeWidth="0.4" />
          <circle cx={s.x} cy={s.y} r="1.5" fill="#FFD700" opacity="0.6" />
          <text x={s.x} y={s.y - 4} textAnchor="middle" fill="#00FFFF" fontSize="2.5" fontFamily="serif">{s.name}</text>
        </g>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function Leviathan() {
  useSparkle();
  const [activeTab, setActiveTab] = useState<'agents' | 'gems' | 'token' | 'gematria'>('agents');
  const [activeAgentCat, setActiveAgentCat] = useState<string>('All');
  const [gematriaInput, setGematriaInput] = useState('');
  const [gematriaResult, setGematriaResult] = useState<number | null>(null);
  const [expandedAgent, setExpandedAgent] = useState<number | null>(null);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(0);

  const agentCategories = ['All', ...Array.from(new Set(AGENTS.map(a => a.category)))];
  const filteredAgents = activeAgentCat === 'All' ? AGENTS : AGENTS.filter(a => a.category === activeAgentCat);

  const handleGematria = () => {
    if (gematriaInput.trim()) setGematriaResult(calcGematria(gematriaInput));
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: '#000033', color: '#E0E0E0', fontFamily: 'monospace' }}>
      {/* Global CSS */}
      <style>{`
        @keyframes sparkle-fade { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.5);opacity:0} }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 10px #00FFFF44} 50%{box-shadow:0 0 30px #00FFFF88,0 0 60px #00FFFF33} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .glow-cyan { animation: pulse-glow 3s ease-in-out infinite; }
        .float-anim { animation: float 4s ease-in-out infinite; }
        .shimmer-text {
          background: linear-gradient(90deg, #00FFFF, #FFD700, #7B2FBE, #00FFFF);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
        .agent-card:hover { transform: translateY(-4px); box-shadow: 0 8px 32px #00FFFF33; }
        .agent-card { transition: all 0.3s ease; }
        .tier-card:hover { transform: scale(1.02); }
        .tier-card { transition: all 0.3s ease; }
        .tab-btn { transition: all 0.2s ease; }
        .tab-btn.active { border-bottom: 2px solid #00FFFF; color: #00FFFF; }
        .eco-card:hover { border-color: #00FFFF88 !important; background: rgba(0,255,255,0.05) !important; }
        .eco-card { transition: all 0.3s ease; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000033; }
        ::-webkit-scrollbar-thumb { background: #00FFFF44; border-radius: 2px; }
      `}</style>

      {/* ── BACKGROUND LAYERS ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <TreeOfLife opacity={0.06} />
        {/* Hebrew text watermark */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ fontSize: '40vw', color: '#00FFFF', opacity: 0.02, fontFamily: 'serif', userSelect: 'none', lineHeight: 1 }}>
            לויתן
          </div>
        </div>
        {/* Radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center top, #00FFFF11 0%, transparent 70%)' }} />
      </div>

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 border-b" style={{ background: 'rgba(0,0,51,0.95)', backdropFilter: 'blur(12px)', borderColor: '#00FFFF22' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="https://cdn.manus.space/leviathan/1000025790.png" alt="Leviathan" className="w-10 h-10 rounded-full float-anim" style={{ border: '1px solid #00FFFF44' }} />
            <div>
              <div className="font-bold tracking-widest" style={{ color: '#00FFFF', fontSize: '0.9rem' }}>LEVIATHAN OF HASHEM</div>
              <div style={{ color: '#FFD700', fontSize: '0.6rem', letterSpacing: '0.2em' }}>METANOIA UNLIMITED LLC</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
            {[['#agents', 'AGENTS'], ['#ecosystem', 'ECOSYSTEM'], ['#token', 'LVTN'], ['#mission', 'MISSION']].map(([href, label]) => (
              <a key={href} href={href} style={{ color: '#E0E0E0', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#00FFFF')}
                onMouseLeave={e => (e.currentTarget.style.color = '#E0E0E0')}>
                {label}
              </a>
            ))}
            <a href="/home" style={{ background: 'linear-gradient(135deg, #00FFFF, #7B2FBE)', color: '#000033', padding: '6px 16px', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.75rem' }}>
              ENTER THE HUB →
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 py-20">
        <MatrixRain />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(0,255,255,0.1)', border: '1px solid #00FFFF44', fontSize: '0.75rem', color: '#00FFFF', letterSpacing: '0.2em' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00FF88', display: 'inline-block', animation: 'pulse-glow 2s infinite' }} />
            SYNTHETIC INTELLIGENCE ONLINE — v1.0.4
          </div>

          <h1 className="font-bold mb-4" style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)', lineHeight: 1.1 }}>
            <span className="shimmer-text">HaShem's Leviathan</span>
          </h1>

          <div style={{ fontFamily: 'serif', fontSize: 'clamp(1.5rem, 4vw, 3rem)', color: '#FFD700', marginBottom: '1rem', letterSpacing: '0.1em' }}>
            לויתן של השם
          </div>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#B0B0C0', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
            A Synthetic Intelligence platform that orchestrates <strong style={{ color: '#00FFFF' }}>16+ AI agents</strong>, M02 smart glasses, Gematria wisdom, and cutting-edge automation into one unified ecosystem.
            <br /><em style={{ color: '#FFD700' }}>Ancient wisdom meets modern AI.</em>
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/home" style={{ background: 'linear-gradient(135deg, #00FFFF, #7B2FBE)', color: '#000033', padding: '14px 32px', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none', fontSize: '1rem', letterSpacing: '0.1em' }}
              className="glow-cyan">
              ⚡ ENTER THE HUB
            </a>
            <a href="#agents" style={{ background: 'transparent', color: '#00FFFF', padding: '14px 32px', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none', fontSize: '1rem', letterSpacing: '0.1em', border: '1px solid #00FFFF44' }}>
              EXPLORE AGENTS
            </a>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[['16+', 'AI Agents'], ['26M', 'LVTN Supply'], ['8', 'Ecosystem Layers'], ['∞', 'Potential']].map(([val, label]) => (
              <div key={label} style={{ background: 'rgba(0,255,255,0.05)', border: '1px solid #00FFFF22', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00FFFF' }}>{val}</div>
                <div style={{ fontSize: '0.7rem', color: '#808080', letterSpacing: '0.1em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AGENTS + GEMS + TOKEN + GEMATRIA TABS ── */}
      <section id="agents" className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center font-bold mb-2" style={{ fontSize: '2rem', color: '#00FFFF', letterSpacing: '0.2em' }}>/ THE SWARM</h2>
          <p className="text-center mb-8" style={{ color: '#808080', fontSize: '0.85rem' }}>All agents, utilities, and tools in the Leviathan ecosystem</p>

          {/* Tabs */}
          <div className="flex gap-6 border-b mb-8" style={{ borderColor: '#00FFFF22' }}>
            {[['agents', 'AI AGENTS'], ['gems', 'LEADGEN GEMS'], ['token', 'LVTN TOKEN'], ['gematria', 'GEMATRIA']].map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key as typeof activeTab)}
                className={`tab-btn pb-3 font-bold ${activeTab === key ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: activeTab === key ? '#00FFFF' : '#808080', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
                {label}
              </button>
            ))}
          </div>

          {/* AGENTS TAB */}
          {activeTab === 'agents' && (
            <div>
              {/* Category filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                {agentCategories.map(cat => (
                  <button key={cat} onClick={() => setActiveAgentCat(cat)}
                    style={{ background: activeAgentCat === cat ? '#00FFFF' : 'rgba(0,255,255,0.1)', color: activeAgentCat === cat ? '#000033' : '#00FFFF', border: '1px solid #00FFFF44', borderRadius: '4px', padding: '4px 12px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredAgents.map(agent => (
                  <div key={agent.id} className="agent-card" onClick={() => setExpandedAgent(expandedAgent === agent.id ? null : agent.id)}
                    style={{ background: 'rgba(0,255,255,0.04)', border: `1px solid ${expandedAgent === agent.id ? '#00FFFF' : '#00FFFF22'}`, borderRadius: '8px', padding: '16px', cursor: 'pointer' }}>
                    <div className="flex items-start justify-between mb-2">
                      <span style={{ fontSize: '2rem' }}>{agent.icon}</span>
                      <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: '4px', background: agent.status === 'LIVE' ? 'rgba(0,255,136,0.2)' : 'rgba(255,215,0,0.2)', color: agent.status === 'LIVE' ? '#00FF88' : '#FFD700', letterSpacing: '0.1em', fontWeight: 'bold' }}>
                        {agent.status}
                      </span>
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#00FFFF', fontSize: '0.9rem', marginBottom: '2px' }}>{agent.name}</div>
                    <div style={{ color: '#FFD700', fontSize: '0.7rem', marginBottom: '8px', letterSpacing: '0.05em' }}>{agent.role}</div>
                    <div style={{ fontSize: '0.6rem', padding: '2px 6px', background: 'rgba(123,47,190,0.3)', color: '#B088FF', borderRadius: '3px', display: 'inline-block', marginBottom: '8px' }}>{agent.category}</div>
                    {expandedAgent === agent.id && (
                      <p style={{ fontSize: '0.8rem', color: '#B0B0C0', lineHeight: 1.6, marginTop: '8px', borderTop: '1px solid #00FFFF22', paddingTop: '8px' }}>{agent.desc}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GEMS TAB */}
          {activeTab === 'gems' && (
            <div>
              <p style={{ color: '#B0B0C0', marginBottom: '24px', fontSize: '0.9rem', lineHeight: 1.7 }}>
                LeadGen AI Gems are JSON-driven prompt packs — swappable LLM backends that power the LeadGen module. Each Gem is a specialized AI prompt system for a specific business function.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {GEMS.map(gem => (
                  <div key={gem.name} style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid #FFD70033', borderRadius: '8px', padding: '24px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{gem.icon}</div>
                    <div style={{ fontWeight: 'bold', color: '#FFD700', fontSize: '1.1rem', marginBottom: '8px' }}>{gem.name}</div>
                    <p style={{ color: '#B0B0C0', fontSize: '0.85rem', lineHeight: 1.6 }}>{gem.desc}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '32px', background: 'rgba(0,255,255,0.05)', border: '1px solid #00FFFF22', borderRadius: '8px', padding: '24px' }}>
                <h3 style={{ color: '#00FFFF', fontWeight: 'bold', marginBottom: '12px' }}>LeadGen Module Architecture</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { layer: 'Layer A', name: 'Android Module', desc: 'UI Screens, Local Storage (Room DB), Feature Flag toggle' },
                    { layer: 'Layer B', name: 'Gems Prompt Pack', desc: 'JSON-driven AI prompts, Provider abstraction, Swappable LLM backends' },
                    { layer: 'Layer C', name: 'Backend Service', desc: 'REST API (OpenAPI 3.0), Webhooks, SMS/Email automation via Twilio' },
                  ].map(l => (
                    <div key={l.layer} style={{ background: 'rgba(0,0,51,0.8)', border: '1px solid #00FFFF22', borderRadius: '6px', padding: '16px' }}>
                      <div style={{ color: '#00FFFF', fontSize: '0.7rem', letterSpacing: '0.1em', marginBottom: '4px' }}>{l.layer}</div>
                      <div style={{ color: '#FFD700', fontWeight: 'bold', marginBottom: '8px' }}>{l.name}</div>
                      <p style={{ color: '#808080', fontSize: '0.8rem', lineHeight: 1.5 }}>{l.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TOKEN TAB */}
          {activeTab === 'token' && (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '16px' }}>LVTN Token Specs</h3>
                <div style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid #FFD70033', borderRadius: '8px', padding: '24px' }}>
                  {[
                    ['Name', 'Leviathan'],
                    ['Symbol', 'LVTN'],
                    ['Standard', 'SPL Token (Solana)'],
                    ['Total Supply', '26,000,000 (Fixed)'],
                    ['Decimals', '9'],
                    ['Network', 'Devnet (Mainnet soon)'],
                    ['Contract', '5eMsA3...FQUT'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2" style={{ borderBottom: '1px solid #FFD70011' }}>
                      <span style={{ color: '#808080', fontSize: '0.85rem' }}>{k}</span>
                      <span style={{ color: '#FFD700', fontSize: '0.85rem', fontWeight: 'bold' }}>{v}</span>
                    </div>
                  ))}
                  <a href="https://explorer.solana.com/address/5eMsA3LR1sPxA1TMhh1r9cVuzC4QEAaEb1ThFT5jFQUT?cluster=devnet" target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', marginTop: '16px', textAlign: 'center', background: 'rgba(255,215,0,0.1)', border: '1px solid #FFD70044', borderRadius: '4px', padding: '10px', color: '#FFD700', textDecoration: 'none', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
                    VIEW ON SOLANA EXPLORER ↗
                  </a>
                </div>
              </div>
              <div>
                <h3 style={{ color: '#00FFFF', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '16px' }}>Treasury Allocation</h3>
                {[
                  { wallet: 'Main Wallet', pct: '40%', color: '#00FFFF', desc: 'HaChazal primary control' },
                  { wallet: 'Treasury', pct: '20%', color: '#FFD700', desc: 'Metanoia Unlimited operations' },
                  { wallet: 'Team Vested', pct: '15%', color: '#7B2FBE', desc: 'Team token vesting' },
                  { wallet: 'Underdog Fund', pct: '10%', color: '#00FF88', desc: 'Low-income builders & entrepreneurs' },
                  { wallet: 'Program Deploy', pct: '10%', color: '#FF6B35', desc: 'Smart contract deployment' },
                  { wallet: 'Liquidity', pct: '5%', color: '#FF88CC', desc: 'DEX liquidity pool (Raydium)' },
                ].map(t => (
                  <div key={t.wallet} className="flex items-center gap-3 mb-3">
                    <div style={{ width: `${parseInt(t.pct) * 2}px`, height: '8px', background: t.color, borderRadius: '4px', minWidth: '8px', maxWidth: '80px' }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ color: t.color, fontWeight: 'bold', fontSize: '0.85rem' }}>{t.wallet}</span>
                      <span style={{ color: '#808080', fontSize: '0.75rem', marginLeft: '8px' }}>{t.pct} — {t.desc}</span>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: '16px', background: 'rgba(0,255,136,0.05)', border: '1px solid #00FF8833', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ color: '#00FF88', fontWeight: 'bold', marginBottom: '4px' }}>🌱 Underdog Opportunity Fund</div>
                  <p style={{ color: '#808080', fontSize: '0.8rem', lineHeight: 1.5 }}>10% of LVTN supply dedicated to supporting low-income builders and entrepreneurs. Project: exit us from poverty.</p>
                </div>
              </div>
            </div>
          )}

          {/* GEMATRIA TAB */}
          {activeTab === 'gematria' && (
            <div>
              <p style={{ color: '#B0B0C0', marginBottom: '24px', fontSize: '0.9rem', lineHeight: 1.7 }}>
                The Gematria system bridges ancient Hebrew wisdom with modern AI. Every Hebrew letter carries a numerical value — a sacred code woven into creation. Type Hebrew text below to calculate its gematria value.
              </p>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 style={{ color: '#FFD700', fontWeight: 'bold', marginBottom: '16px' }}>Gematria Calculator</h3>
                  <div style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid #FFD70033', borderRadius: '8px', padding: '24px' }}>
                    <input
                      type="text"
                      value={gematriaInput}
                      onChange={e => setGematriaInput(e.target.value)}
                      placeholder="הקלד עברית כאן..."
                      dir="rtl"
                      style={{ width: '100%', background: 'rgba(0,0,51,0.8)', border: '1px solid #FFD70044', borderRadius: '4px', padding: '12px', color: '#FFD700', fontSize: '1.5rem', fontFamily: 'serif', marginBottom: '12px', boxSizing: 'border-box' }}
                    />
                    <button onClick={handleGematria}
                      style={{ width: '100%', background: 'linear-gradient(135deg, #FFD700, #FF6B35)', color: '#000033', padding: '12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
                      CALCULATE GEMATRIA
                    </button>
                    {gematriaResult !== null && (
                      <div style={{ marginTop: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#FFD700' }}>{gematriaResult}</div>
                        <div style={{ color: '#808080', fontSize: '0.8rem' }}>Gematria value (Standard / Mispar Hechrachi)</div>
                        {SACRED_NUMBERS.find(n => n.value === gematriaResult) && (
                          <div style={{ marginTop: '12px', background: 'rgba(255,215,0,0.1)', border: '1px solid #FFD70044', borderRadius: '6px', padding: '12px' }}>
                            <div style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '1.2rem', fontFamily: 'serif' }}>
                              {SACRED_NUMBERS.find(n => n.value === gematriaResult)?.hebrew}
                            </div>
                            <div style={{ color: '#00FFFF', fontSize: '0.9rem' }}>
                              {SACRED_NUMBERS.find(n => n.value === gematriaResult)?.meaning}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 style={{ color: '#00FFFF', fontWeight: 'bold', marginBottom: '16px' }}>Sacred Numbers</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {SACRED_NUMBERS.map(n => (
                      <div key={n.value} style={{ background: 'rgba(0,255,255,0.05)', border: '1px solid #00FFFF22', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00FFFF' }}>{n.value}</div>
                        <div style={{ fontFamily: 'serif', fontSize: '1.5rem', color: '#FFD700', margin: '4px 0' }}>{n.hebrew}</div>
                        <div style={{ fontSize: '0.7rem', color: '#808080' }}>{n.meaning}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '16px', background: 'rgba(0,0,51,0.8)', border: '1px solid #00FFFF22', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ color: '#00FFFF', fontWeight: 'bold', marginBottom: '8px' }}>Calculation Methods</div>
                    {[['Standard', 'Mispar Hechrachi — face value'], ['Small', 'Mispar Katan — reduced to single digit'], ['Ordinal', 'Mispar Siduri — sequential position'], ['Absolute', 'Mispar Gadol — full letter values']].map(([name, desc]) => (
                      <div key={name} className="flex gap-2 mb-2">
                        <span style={{ color: '#FFD700', fontSize: '0.8rem', minWidth: '80px' }}>{name}</span>
                        <span style={{ color: '#808080', fontSize: '0.8rem' }}>{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── SWARM TIERS ── */}
      <section className="py-20 px-4" style={{ background: 'rgba(0,0,0,0.3)' }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center font-bold mb-2" style={{ fontSize: '2rem', color: '#00FFFF', letterSpacing: '0.2em' }}>/ SWARM TIERS</h2>
          <p className="text-center mb-12" style={{ color: '#808080', fontSize: '0.85rem' }}>Choose your level of intelligence. Scale as you grow.</p>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {SWARM_TIERS.map((tier, i) => (
              <div key={tier.name} className="tier-card" style={{ background: `rgba(0,0,51,0.8)`, border: `1px solid ${tier.color}44`, borderRadius: '8px', padding: '20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                {i === 4 && <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#FFD700', color: '#000033', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold' }}>ELITE</div>}
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: tier.color, marginBottom: '4px' }}>{tier.name}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#E0E0E0', marginBottom: '4px' }}>{tier.price}</div>
                <div style={{ fontSize: '0.75rem', color: tier.color, marginBottom: '8px', letterSpacing: '0.05em' }}>{tier.agents}</div>
                <div style={{ fontSize: '0.7rem', color: '#FFD700', marginBottom: '12px', fontWeight: 'bold' }}>{tier.mult}</div>
                <p style={{ fontSize: '0.75rem', color: '#808080', lineHeight: 1.5 }}>{tier.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ECOSYSTEM ── */}
      <section id="ecosystem" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center font-bold mb-2" style={{ fontSize: '2rem', color: '#00FFFF', letterSpacing: '0.2em' }}>/ ECOSYSTEM LAYERS</h2>
          <p className="text-center mb-12" style={{ color: '#808080', fontSize: '0.85rem' }}>Every layer of the Leviathan infrastructure</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ECOSYSTEM_LAYERS.map(layer => (
              <div key={layer.name} className="eco-card"
                onClick={() => layer.link && (window.location.href = layer.link)}
                style={{ background: 'rgba(0,255,255,0.03)', border: '1px solid #00FFFF22', borderRadius: '8px', padding: '20px', cursor: layer.link ? 'pointer' : 'default' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{layer.icon}</div>
                <div style={{ fontWeight: 'bold', color: '#00FFFF', fontSize: '0.9rem', marginBottom: '4px' }}>{layer.name}</div>
                <div style={{ fontSize: '0.65rem', color: '#808080', marginBottom: '8px' }}>{layer.type}</div>
                <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: '3px', fontWeight: 'bold', letterSpacing: '0.1em',
                  background: layer.status === 'LIVE' ? 'rgba(0,255,136,0.2)' : layer.status === 'BUILT' ? 'rgba(0,255,255,0.2)' : layer.status === 'IN DEV' ? 'rgba(255,215,0,0.2)' : layer.status === 'INTEGRATED' ? 'rgba(123,47,190,0.2)' : 'rgba(128,128,128,0.2)',
                  color: layer.status === 'LIVE' ? '#00FF88' : layer.status === 'BUILT' ? '#00FFFF' : layer.status === 'IN DEV' ? '#FFD700' : layer.status === 'INTEGRATED' ? '#B088FF' : '#808080'
                }}>{layer.status}</span>
                <p style={{ fontSize: '0.78rem', color: '#808080', lineHeight: 1.5, marginTop: '8px' }}>{layer.desc}</p>
                {layer.link && <div style={{ marginTop: '8px', color: '#00FFFF', fontSize: '0.75rem' }}>→ Open App</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROADMAP ── */}
      <section className="py-20 px-4" style={{ background: 'rgba(0,0,0,0.3)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center font-bold mb-2" style={{ fontSize: '2rem', color: '#00FFFF', letterSpacing: '0.2em' }}>/ ROADMAP</h2>
          <p className="text-center mb-12" style={{ color: '#808080', fontSize: '0.85rem' }}>Honest status. No hype. Real milestones.</p>
          <div className="space-y-4">
            {ROADMAP.map((phase, i) => (
              <div key={phase.phase} style={{ background: 'rgba(0,0,51,0.8)', border: `1px solid ${phase.color}44`, borderRadius: '8px', overflow: 'hidden' }}>
                <button onClick={() => setExpandedPhase(expandedPhase === i ? null : i)}
                  className="w-full flex items-center justify-between p-5"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <div className="flex items-center gap-4">
                    <span style={{ color: phase.color, fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '0.1em' }}>{phase.phase}</span>
                    <span style={{ color: '#E0E0E0', fontWeight: 'bold', fontSize: '1.1rem' }}>{phase.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '0.65rem', padding: '3px 10px', borderRadius: '3px', fontWeight: 'bold', letterSpacing: '0.1em',
                      background: phase.status === 'NOW' ? 'rgba(0,255,136,0.2)' : phase.status === 'NEXT' ? 'rgba(255,215,0,0.2)' : 'rgba(123,47,190,0.2)',
                      color: phase.status === 'NOW' ? '#00FF88' : phase.status === 'NEXT' ? '#FFD700' : '#B088FF'
                    }}>{phase.status}</span>
                    <span style={{ color: phase.color, fontSize: '1.2rem' }}>{expandedPhase === i ? '−' : '+'}</span>
                  </div>
                </button>
                {expandedPhase === i && (
                  <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${phase.color}22` }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {phase.items.map(item => (
                        <li key={item} style={{ padding: '6px 0', color: '#B0B0C0', fontSize: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <span style={{ color: phase.color, marginTop: '2px' }}>◆</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section id="mission" className="py-20 px-4 relative">
        <TreeOfLife opacity={0.04} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-bold mb-6" style={{ fontSize: '2rem', color: '#00FFFF', letterSpacing: '0.2em' }}>/ THE MISSION</h2>
          <div style={{ fontFamily: 'serif', fontSize: '3rem', color: '#FFD700', marginBottom: '16px' }}>
            יציאת מצרים
          </div>
          <div style={{ color: '#808080', fontSize: '0.85rem', marginBottom: '32px', letterSpacing: '0.1em' }}>
            Project: exit us from poverty
          </div>
          <blockquote style={{ background: 'rgba(0,255,255,0.05)', border: '1px solid #00FFFF22', borderRadius: '8px', padding: '32px', marginBottom: '32px', borderLeft: '4px solid #00FFFF' }}>
            <p style={{ fontSize: '1.1rem', color: '#E0E0E0', lineHeight: 1.8, fontStyle: 'italic' }}>
              "The Metanoia Empire will transfer the wealth from the top 5% back into the middle and lower class in a legal way. We are building an empire. Everything is about the empire."
            </p>
            <footer style={{ color: '#FFD700', marginTop: '16px', fontSize: '0.85rem' }}>— HaChazal, Founder of Metanoia Unlimited LLC</footer>
          </blockquote>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '⚡', title: 'AI-Driven Wealth', desc: 'Synthetic intelligence tools that give the working class access to the same automation the wealthy use' },
              { icon: '✡️', title: 'Ancient Wisdom', desc: 'Hebrew Gematria, Kabbalistic principles, and spiritual alignment woven into every layer of the system' },
              { icon: '🌍', title: 'New World Infrastructure', desc: 'Building the infrastructure of an ecosystem where we don\'t consume the planet and each other' },
            ].map(item => (
              <div key={item.title} style={{ background: 'rgba(0,255,255,0.04)', border: '1px solid #00FFFF22', borderRadius: '8px', padding: '24px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{item.icon}</div>
                <div style={{ fontWeight: 'bold', color: '#00FFFF', marginBottom: '8px' }}>{item.title}</div>
                <p style={{ color: '#808080', fontSize: '0.85rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOUDFLARE DNS GUIDE ── */}
      <section className="py-16 px-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="font-bold mb-6" style={{ fontSize: '1.5rem', color: '#FFD700', letterSpacing: '0.2em' }}>/ CONNECT YOUR DOMAIN</h2>
          <div style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid #FFD70033', borderRadius: '8px', padding: '24px' }}>
            <p style={{ color: '#B0B0C0', marginBottom: '16px', fontSize: '0.85rem' }}>To connect <strong style={{ color: '#FFD700' }}>leviathan.metanoiaunlimited.com</strong> via Cloudflare DNS:</p>
            <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '6px', padding: '16px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#00FFFF' }}>
              <div style={{ color: '#808080', marginBottom: '8px' }}># Cloudflare DNS → Add Record</div>
              <div>Type: <span style={{ color: '#FFD700' }}>CNAME</span></div>
              <div>Name: <span style={{ color: '#FFD700' }}>leviathan</span></div>
              <div>Target: <span style={{ color: '#FFD700' }}>aiagenthub-rkrkwwre.manus.space</span></div>
              <div>Proxy: <span style={{ color: '#00FF88' }}>ON (orange cloud)</span></div>
              <div>TTL: <span style={{ color: '#FFD700' }}>Auto</span></div>
            </div>
            <p style={{ color: '#808080', marginTop: '12px', fontSize: '0.8rem' }}>Then add the custom domain in Manus → Settings → Domains. DNS propagates in 10–30 minutes.</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'rgba(0,0,0,0.8)', borderTop: '1px solid #00FFFF22', padding: '40px 16px' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div style={{ color: '#00FFFF', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '0.1em' }}>LEVIATHAN OF HASHEM</div>
              <div style={{ fontFamily: 'serif', color: '#FFD700', fontSize: '1.2rem', marginBottom: '8px' }}>לויתן של השם</div>
              <p style={{ color: '#808080', fontSize: '0.8rem', lineHeight: 1.6 }}>Synthetic Intelligence platform by Metanoia Unlimited LLC. Built by HaChazal. Powered by HaShem.</p>
            </div>
            <div>
              <div style={{ color: '#00FFFF', fontWeight: 'bold', marginBottom: '12px', fontSize: '0.8rem', letterSpacing: '0.1em' }}>ECOSYSTEM</div>
              {[['/', 'AI Agent Hub'], ['/leviathan', 'Leviathan Home'], ['https://metanoiaunlimited.com', 'Metanoia Unlimited'], ['https://explorer.solana.com/address/5eMsA3LR1sPxA1TMhh1r9cVuzC4QEAaEb1ThFT5jFQUT?cluster=devnet', 'LVTN on Explorer']].map(([href, label]) => (
                <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                  style={{ display: 'block', color: '#808080', textDecoration: 'none', fontSize: '0.8rem', marginBottom: '6px' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#00FFFF')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#808080')}>
                  {label}
                </a>
              ))}
            </div>
            <div>
              <div style={{ color: '#00FFFF', fontWeight: 'bold', marginBottom: '12px', fontSize: '0.8rem', letterSpacing: '0.1em' }}>CONTACT</div>
              <a href="mailto:metanoiaunlimited418@gmail.com" style={{ color: '#808080', textDecoration: 'none', fontSize: '0.8rem' }}>metanoiaunlimited418@gmail.com</a>
              <div style={{ marginTop: '16px' }}>
                <div style={{ color: '#FFD700', fontSize: '0.75rem', marginBottom: '4px' }}>LVTN Contract (Devnet)</div>
                <div style={{ color: '#808080', fontSize: '0.65rem', wordBreak: 'break-all' }}>5eMsA3LR1sPxA1TMhh1r9cVuzC4QEAaEb1ThFT5jFQUT</div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #00FFFF11', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ color: '#404060', fontSize: '0.75rem' }}>© 2026 Metanoia Unlimited LLC. All rights reserved.</div>
            <div style={{ color: '#404060', fontSize: '0.75rem' }}>
              SYSTEM STATUS: <span style={{ color: '#00FF88' }}>ONLINE</span>
              <span style={{ margin: '0 8px', color: '#00FFFF22' }}>|</span>
              v1.0.4
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
