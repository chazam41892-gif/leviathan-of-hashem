/**
 * LEVIATHAN HIVEMIND — Neural Dashboard
 * The living nervous system of the Leviathan ecosystem.
 * Real-time: agent constellation, quantum entanglement map, pump.fun stream,
 * adaptive memory patterns, neural bus signal feed, intelligence score.
 */

import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

// ─── Utility ──────────────────────────────────────────────────────────────────

function timeAgo(ts: number | null): string {
  if (!ts) return "never";
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function formatSol(lamports: number): string {
  return (lamports / 1e9).toFixed(4);
}

function shortAddr(addr: string): string {
  if (!addr || addr.length < 8) return addr;
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

// ─── Animated Background ──────────────────────────────────────────────────────

function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const nodes: Array<{ x: number; y: number; vx: number; vy: number; r: number; color: string }> = [];
    const colors = ["#7c3aed", "#06b6d4", "#a855f7", "#0ea5e9", "#8b5cf6"];

    for (let i = 0; i < 60; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2.5 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animId: number;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = 0.6;
        ctx.fill();
        ctx.globalAlpha = 1;

        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      });

      animId = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: "linear-gradient(135deg, #0a0014 0%, #050020 50%, #0a0014 100%)" }}
    />
  );
}

// ─── Intelligence Score Ring ──────────────────────────────────────────────────

function IntelligenceRing({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#1e1040" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <text x="70" y="65" textAnchor="middle" fill="#e2d9f3" fontSize="28" fontWeight="bold" fontFamily="monospace">{score}</text>
        <text x="70" y="85" textAnchor="middle" fill="#7c6fa0" fontSize="11" fontFamily="monospace">IQ SCORE</text>
      </svg>
      <div className="text-xs font-mono text-purple-400 uppercase tracking-widest">System Intelligence</div>
    </div>
  );
}

// ─── Signal Feed ──────────────────────────────────────────────────────────────

function SignalFeed({ signals }: { signals: Array<{ id: string; type: string; source: string; priority: string; timestamp: number; payload: unknown }> }) {
  const colorMap: Record<string, string> = {
    critical: "text-red-400 border-red-500",
    high: "text-orange-400 border-orange-500",
    normal: "text-cyan-400 border-cyan-500",
    low: "text-gray-400 border-gray-600",
  };

  return (
    <div className="space-y-1 max-h-72 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "#7c3aed transparent" }}>
      {signals.length === 0 && (
        <div className="text-center py-8 text-purple-700 font-mono text-xs">Awaiting signals...</div>
      )}
      {signals.map(sig => (
        <div key={sig.id} className={`flex items-start gap-2 p-2 rounded border-l-2 bg-purple-950/20 ${colorMap[sig.priority] || colorMap.normal}`}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase truncate">{sig.type}</span>
              <span className="text-[9px] text-purple-600 font-mono ml-auto shrink-0">{timeAgo(sig.timestamp)}</span>
            </div>
            <div className="text-[9px] text-purple-500 font-mono">from: {sig.source}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Agent Grid ───────────────────────────────────────────────────────────────

function AgentGrid({ agents }: { agents: Array<{ id: string; name: string; category: string; status: string; tier: string; capabilities: string[]; description: string }> }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const categories = ["all", "core", "trading", "business", "language", "hardware", "creative", "audio", "automation", "iot", "dev"];
  const filtered = filter === "all" ? agents : agents.filter(a => a.category === filter);

  const statusColor: Record<string, string> = {
    online: "bg-green-500",
    offline: "bg-red-500",
    degraded: "bg-yellow-500",
    coming_soon: "bg-blue-500",
  };

  const tierColor: Record<string, string> = {
    free: "text-gray-400",
    scout: "text-green-400",
    sentinel: "text-blue-400",
    predator: "text-orange-400",
    apex: "text-red-400",
    leviathan: "text-purple-400",
  };

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-2 py-0.5 text-[10px] font-mono uppercase rounded border transition-all ${
              filter === cat
                ? "bg-purple-600 border-purple-400 text-white"
                : "bg-transparent border-purple-800 text-purple-500 hover:border-purple-500"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {filtered.map(agent => (
          <div
            key={agent.id}
            onClick={() => setSelected(selected === agent.id ? null : agent.id)}
            className={`cursor-pointer rounded border p-3 transition-all ${
              selected === agent.id
                ? "border-purple-400 bg-purple-900/40"
                : "border-purple-900 bg-purple-950/30 hover:border-purple-600"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full shrink-0 ${statusColor[agent.status] || "bg-gray-500"}`} />
              <span className="text-[11px] font-bold text-purple-200 truncate">{agent.name}</span>
            </div>
            <div className={`text-[9px] font-mono uppercase ${tierColor[agent.tier] || "text-gray-400"}`}>{agent.tier} tier</div>
            <div className="text-[9px] text-purple-600 font-mono mt-0.5">{agent.category}</div>

            {selected === agent.id && (
              <div className="mt-2 pt-2 border-t border-purple-800">
                <p className="text-[10px] text-purple-300 leading-relaxed">{agent.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {agent.capabilities.slice(0, 4).map(cap => (
                    <span key={cap} className="px-1 py-0.5 text-[8px] bg-purple-900/50 text-purple-400 rounded font-mono">{cap}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Pump.fun Live Feed ───────────────────────────────────────────────────────

function PumpFunFeed({
  tokens,
  trades,
  stats,
}: {
  tokens: Array<{ mint: string; name: string; symbol: string; creator: string; usd_market_cap?: number; created_timestamp: number }>;
  trades: Array<{ mint: string; is_buy: boolean; sol_amount: number; user: string; timestamp: number; name?: string; symbol?: string }>;
  stats: { connected: boolean; newTokensReceived: number; tradesReceived: number; migrationsReceived: number; lastEventAt: number | null };
}) {
  const [tab, setTab] = useState<"tokens" | "trades">("tokens");

  return (
    <div className="space-y-3">
      {/* Status Bar */}
      <div className="flex items-center gap-3 text-[10px] font-mono">
        <span className={`flex items-center gap-1 ${stats.connected ? "text-green-400" : "text-red-400"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${stats.connected ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
          {stats.connected ? "LIVE" : "RECONNECTING"}
        </span>
        <span className="text-purple-600">Tokens: <span className="text-cyan-400">{stats.newTokensReceived}</span></span>
        <span className="text-purple-600">Trades: <span className="text-cyan-400">{stats.tradesReceived}</span></span>
        <span className="text-purple-600">Migrations: <span className="text-orange-400">{stats.migrationsReceived}</span></span>
        <span className="text-purple-700 ml-auto">Last: {timeAgo(stats.lastEventAt)}</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["tokens", "trades"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 text-[10px] font-mono uppercase rounded border transition-all ${
              tab === t ? "bg-cyan-600 border-cyan-400 text-white" : "border-cyan-900 text-cyan-700 hover:border-cyan-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Token List */}
      {tab === "tokens" && (
        <div className="space-y-1 max-h-64 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#06b6d4 transparent" }}>
          {tokens.length === 0 && (
            <div className="text-center py-6 text-cyan-800 font-mono text-xs">Waiting for new tokens...</div>
          )}
          {tokens.map(token => (
            <div key={token.mint} className="flex items-center gap-3 p-2 rounded border border-cyan-900/40 bg-cyan-950/20 hover:border-cyan-700 transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-cyan-300">{token.symbol || "?"}</span>
                  <span className="text-[10px] text-cyan-600 truncate">{token.name}</span>
                  {token.usd_market_cap && token.usd_market_cap > 10_000 && (
                    <span className="text-[9px] bg-orange-900/50 text-orange-400 px-1 rounded font-mono ml-auto shrink-0">🔥 HIGH MCAP</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-cyan-700 font-mono">{shortAddr(token.mint)}</span>
                  {token.usd_market_cap && (
                    <span className="text-[9px] text-green-400 font-mono">${token.usd_market_cap.toLocaleString()}</span>
                  )}
                  <span className="text-[9px] text-cyan-800 ml-auto">{timeAgo(token.created_timestamp * 1000)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trade List */}
      {tab === "trades" && (
        <div className="space-y-1 max-h-64 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#06b6d4 transparent" }}>
          {trades.length === 0 && (
            <div className="text-center py-6 text-cyan-800 font-mono text-xs">Waiting for trades...</div>
          )}
          {trades.map((trade, i) => (
            <div key={`${trade.mint}-${i}`} className={`flex items-center gap-3 p-2 rounded border transition-all ${
              trade.is_buy ? "border-green-900/40 bg-green-950/20" : "border-red-900/40 bg-red-950/20"
            }`}>
              <span className={`text-[11px] font-bold font-mono ${trade.is_buy ? "text-green-400" : "text-red-400"}`}>
                {trade.is_buy ? "BUY" : "SELL"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-cyan-300 font-mono">{trade.symbol || shortAddr(trade.mint)}</div>
                <div className="text-[9px] text-cyan-700 font-mono">{formatSol(trade.sol_amount)} SOL · {shortAddr(trade.user)}</div>
              </div>
              <span className="text-[9px] text-cyan-800 shrink-0">{timeAgo(trade.timestamp * 1000)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Memory Patterns ──────────────────────────────────────────────────────────

function MemoryPatterns({ patterns, snapshot }: {
  patterns: Array<{ id: string; key: string; type: string; weight: number; frequency: number; quantumAmplitude: number; relatedAgents: string[] }>;
  snapshot: { totalPatterns: number; activePatterns: number; strongPatterns: number; systemLearningRate: number; memoryEfficiency: number };
}) {
  return (
    <div className="space-y-3">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Total", value: snapshot.totalPatterns, color: "text-purple-400" },
          { label: "Active", value: snapshot.activePatterns, color: "text-cyan-400" },
          { label: "Strong", value: snapshot.strongPatterns, color: "text-green-400" },
          { label: "Efficiency", value: `${snapshot.memoryEfficiency}%`, color: "text-orange-400" },
        ].map(stat => (
          <div key={stat.label} className="text-center p-2 rounded border border-purple-900 bg-purple-950/30">
            <div className={`text-lg font-bold font-mono ${stat.color}`}>{stat.value}</div>
            <div className="text-[9px] text-purple-600 uppercase font-mono">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Top Patterns */}
      <div className="space-y-1 max-h-48 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#7c3aed transparent" }}>
        {patterns.map(p => (
          <div key={p.id} className="flex items-center gap-2 p-1.5 rounded border border-purple-900/40 bg-purple-950/20">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-mono text-purple-300 truncate">{p.key}</div>
              <div className="text-[9px] text-purple-600 font-mono">{p.type} · freq: {p.frequency}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-[10px] font-bold font-mono text-purple-400">{Math.round(p.weight)}</div>
              <div className="w-12 h-1 bg-purple-900 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${p.weight}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Entanglement Map ─────────────────────────────────────────────────────────

function EntanglementMap({ entanglements }: {
  entanglements: Array<{ agentA: string; agentB: string; strength: number; sharedPatterns: string[] }>;
}) {
  return (
    <div className="space-y-1 max-h-48 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#7c3aed transparent" }}>
      {entanglements.map((e, i) => (
        <div key={i} className="flex items-center gap-2 p-2 rounded border border-purple-900/40 bg-purple-950/20">
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className="text-[10px] font-mono text-purple-300 truncate">{e.agentA}</span>
            <span className="text-purple-600 text-[10px]">⟷</span>
            <span className="text-[10px] font-mono text-purple-300 truncate">{e.agentB}</span>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <div className="w-16 h-1.5 bg-purple-900 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${e.strength * 100}%`,
                  background: `linear-gradient(90deg, #7c3aed, #06b6d4)`,
                }}
              />
            </div>
            <span className="text-[9px] font-mono text-cyan-400">{(e.strength * 100).toFixed(0)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main HiveMind Dashboard ──────────────────────────────────────────────────

export default function HiveMind() {
  const [activeTab, setActiveTab] = useState<"overview" | "agents" | "trading" | "memory" | "quantum">("overview");

  // tRPC queries — all auto-refresh every 3 seconds
  const { data: fullStatus } = trpc.hivemind.getFullStatus.useQuery(undefined, { refetchInterval: 3000 });
  const { data: agents = [] } = trpc.hivemind.getAgents.useQuery();
  const { data: signals = [] } = trpc.hivemind.getRecentSignals.useQuery({ limit: 30 }, { refetchInterval: 2000 });
  const { data: pumpTokens = [] } = trpc.hivemind.getRecentPumpTokens.useQuery({ limit: 20 }, { refetchInterval: 3000 });
  const { data: pumpTrades = [] } = trpc.hivemind.getRecentPumpTrades.useQuery({ limit: 20 }, { refetchInterval: 3000 });
  const { data: pumpStats } = trpc.hivemind.getPumpFunStats.useQuery(undefined, { refetchInterval: 3000 });
  const { data: memorySnapshot } = trpc.hivemind.getMemorySnapshot.useQuery(undefined, { refetchInterval: 5000 });
  const { data: topPatterns = [] } = trpc.hivemind.getTopPatterns.useQuery({ limit: 20 }, { refetchInterval: 5000 });
  const { data: entanglements = [] } = trpc.hivemind.getEntanglements.useQuery(undefined, { refetchInterval: 10000 });
  const { data: intelligenceScore } = trpc.hivemind.getSystemIntelligenceScore.useQuery(undefined, { refetchInterval: 5000 });

  const tabs = [
    { id: "overview", label: "OVERVIEW" },
    { id: "agents", label: "AGENTS" },
    { id: "trading", label: "PUMP.FUN" },
    { id: "memory", label: "MEMORY" },
    { id: "quantum", label: "QUANTUM" },
  ] as const;

  return (
    <div className="relative min-h-screen text-purple-100 font-mono overflow-x-hidden">
      <NeuralBackground />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-purple-900/60 bg-black/60 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/leviathan">
                <span className="text-purple-500 hover:text-purple-300 text-sm cursor-pointer">← LEVIATHAN</span>
              </Link>
              <div>
                <h1 className="text-lg font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                  HIVEMIND
                </h1>
                <div className="text-[9px] text-purple-600 uppercase tracking-widest">Quantum Neural Nervous System</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[10px]">
              {fullStatus && (
                <>
                  <span className="text-purple-600">
                    Agents: <span className="text-green-400">{fullStatus.agents.online}/{fullStatus.agents.total}</span>
                  </span>
                  <span className="text-purple-600">
                    Signals/min: <span className="text-cyan-400">{fullStatus.neural.signalsPerMinute}</span>
                  </span>
                  <span className={`flex items-center gap-1 ${fullStatus.pumpFun.connected ? "text-green-400" : "text-red-400"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${fullStatus.pumpFun.connected ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                    PUMP.FUN
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Tab Bar */}
          <div className="max-w-7xl mx-auto px-4 flex gap-1 pb-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-[10px] font-mono uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-purple-400 text-purple-200"
                    : "border-transparent text-purple-600 hover:text-purple-400"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6">

          {/* ─── OVERVIEW TAB ─── */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Intelligence Score */}
              <div className="lg:col-span-1 flex flex-col items-center justify-center p-6 rounded border border-purple-800 bg-black/40 backdrop-blur-sm">
                <IntelligenceRing score={intelligenceScore?.score || 0} />
                {fullStatus && (
                  <div className="mt-4 grid grid-cols-2 gap-3 w-full text-center">
                    {[
                      { label: "Total Agents", value: fullStatus.agents.total },
                      { label: "Online", value: fullStatus.agents.online },
                      { label: "Signals/min", value: fullStatus.neural.signalsPerMinute },
                      { label: "Errors", value: fullStatus.neural.errorCount },
                      { label: "Patterns", value: fullStatus.memory.totalPatterns },
                      { label: "Learning Rate", value: fullStatus.memory.learningRate },
                    ].map(stat => (
                      <div key={stat.label} className="p-2 rounded border border-purple-900 bg-purple-950/30">
                        <div className="text-base font-bold text-purple-300">{stat.value}</div>
                        <div className="text-[9px] text-purple-600 uppercase">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Neural Signal Feed */}
              <div className="lg:col-span-2 p-4 rounded border border-purple-800 bg-black/40 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-purple-300">Live Neural Signal Feed</h2>
                  <span className="text-[9px] text-purple-600 ml-auto">{signals.length} signals</span>
                </div>
                <SignalFeed signals={signals as Parameters<typeof SignalFeed>[0]["signals"]} />
              </div>

              {/* Pump.fun Quick Stats */}
              {pumpStats && (
                <div className="lg:col-span-3 p-4 rounded border border-cyan-900 bg-black/40 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-2 h-2 rounded-full ${pumpStats.connected ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-300">Pump.fun Live Stream</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { label: "Status", value: pumpStats.connected ? "LIVE" : "OFFLINE", color: pumpStats.connected ? "text-green-400" : "text-red-400" },
                      { label: "New Tokens", value: pumpStats.newTokensReceived, color: "text-cyan-400" },
                      { label: "Trades", value: pumpStats.tradesReceived, color: "text-cyan-400" },
                      { label: "Migrations", value: pumpStats.migrationsReceived, color: "text-orange-400" },
                      { label: "Last Event", value: timeAgo(pumpStats.lastEventAt), color: "text-purple-400" },
                    ].map(stat => (
                      <div key={stat.label} className="text-center p-3 rounded border border-cyan-900 bg-cyan-950/20">
                        <div className={`text-base font-bold font-mono ${stat.color}`}>{stat.value}</div>
                        <div className="text-[9px] text-cyan-700 uppercase">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── AGENTS TAB ─── */}
          {activeTab === "agents" && (
            <div className="p-4 rounded border border-purple-800 bg-black/40 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-purple-300">Agent Constellation</h2>
                <span className="text-[9px] text-purple-600 ml-auto">{agents.length} agents registered</span>
              </div>
              <AgentGrid agents={agents as Parameters<typeof AgentGrid>[0]["agents"]} />
            </div>
          )}

          {/* ─── TRADING TAB ─── */}
          {activeTab === "trading" && (
            <div className="p-4 rounded border border-cyan-900 bg-black/40 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-300">Pump.fun Live Trading Feed</h2>
              </div>
              <PumpFunFeed
                tokens={pumpTokens as Parameters<typeof PumpFunFeed>[0]["tokens"]}
                trades={pumpTrades as Parameters<typeof PumpFunFeed>[0]["trades"]}
                stats={pumpStats || { connected: false, newTokensReceived: 0, tradesReceived: 0, migrationsReceived: 0, lastEventAt: null }}
              />
            </div>
          )}

          {/* ─── MEMORY TAB ─── */}
          {activeTab === "memory" && memorySnapshot && (
            <div className="p-4 rounded border border-purple-800 bg-black/40 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-purple-300">Adaptive Memory — Learned Patterns</h2>
              </div>
              <MemoryPatterns
                patterns={topPatterns as Parameters<typeof MemoryPatterns>[0]["patterns"]}
                snapshot={memorySnapshot}
              />
            </div>
          )}

          {/* ─── QUANTUM TAB ─── */}
          {activeTab === "quantum" && (
            <div className="space-y-6">
              <div className="p-4 rounded border border-purple-800 bg-black/40 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-purple-300">Quantum Entanglement Map</h2>
                  <span className="text-[9px] text-purple-600 ml-auto">{entanglements.length} strongest pairs</span>
                </div>
                <EntanglementMap entanglements={entanglements as Parameters<typeof EntanglementMap>[0]["entanglements"]} />
              </div>

              {fullStatus && (
                <div className="p-4 rounded border border-purple-800 bg-black/40 backdrop-blur-sm">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-purple-300 mb-4">Top Entangled Pairs</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {fullStatus.quantum.topEntanglements.map((e, i) => (
                      <div key={i} className="p-3 rounded border border-purple-900 bg-purple-950/30 text-center">
                        <div className="text-[10px] font-mono text-purple-300">{e.agentA}</div>
                        <div className="text-purple-600 my-1">⟷</div>
                        <div className="text-[10px] font-mono text-purple-300">{e.agentB}</div>
                        <div className="mt-2 text-sm font-bold text-cyan-400">{(e.strength * 100).toFixed(0)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
