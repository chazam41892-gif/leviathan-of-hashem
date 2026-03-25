/**
 * LEVIATHAN HIVEMIND — AdaptiveMemory
 * Self-learning pattern storage with quantum weighting.
 * Every interaction, trade, agent signal, and user command is stored,
 * weighted by recency and frequency, and used to improve future routing.
 *
 * The memory is not static — it decays, strengthens, and evolves.
 * Patterns that repeat get stronger. Patterns that don't get used decay.
 * This is how the HiveMind learns without being retrained.
 */

import { NeuralBus } from "./NeuralBus";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MemoryPattern {
  id: string;
  type: "agent_interaction" | "trade_signal" | "user_command" | "cross_pollination" | "error_recovery" | "market_event";
  key: string;                    // semantic key, e.g. "pump_fun:new_token:high_mcap"
  weight: number;                 // 0-100 — learned importance
  frequency: number;              // how many times this pattern was observed
  lastSeen: number;               // timestamp
  firstSeen: number;              // timestamp
  relatedAgents: string[];        // which agents triggered or responded to this pattern
  payload: Record<string, unknown>; // last observed payload
  decayRate: number;              // how fast this pattern fades without reinforcement
  quantumAmplitude: number;       // 0-1 — quantum weight from cross-pollination
}

export interface MemorySnapshot {
  totalPatterns: number;
  activePatterns: number;         // weight > 10
  strongPatterns: number;         // weight > 50
  topPatterns: MemoryPattern[];
  systemLearningRate: number;     // patterns learned per hour
  memoryEfficiency: number;       // 0-100 — how well memory is being utilized
}

// ─── AdaptiveMemory ───────────────────────────────────────────────────────────

class AdaptiveMemoryClass {
  private patterns: Map<string, MemoryPattern> = new Map();
  private readonly MAX_PATTERNS = 10_000;
  private readonly DECAY_INTERVAL_MS = 60_000;   // decay every 60 seconds
  private patternCountHistory: Array<{ ts: number; count: number }> = [];

  constructor() {
    this._wireNeuralBus();
    this._startDecayCycle();
    console.log("[AdaptiveMemory] Self-learning memory initialized");
  }

  // ─── NeuralBus Wiring ────────────────────────────────────────────────────────

  private _wireNeuralBus(): void {
    // Learn from every signal that flows through the NeuralBus
    NeuralBus.on("signal", (signal) => {
      this._observe({
        type: this._classifySignal(signal.type),
        key: `${signal.type}:${signal.source}`,
        relatedAgents: [signal.source, ...(signal.target ? [signal.target] : [])],
        payload: signal.payload,
        priority: signal.priority,
      });
    });

    // Reinforce patterns when cross-pollination confirms them
    NeuralBus.on("memory:pattern_matched", (signal) => {
      const pattern = signal.payload as { pattern?: string; strength?: number };
      if (pattern.pattern) {
        this._reinforce(pattern.pattern, (pattern.strength || 0.5) * 10);
      }
    });

    // Boost trading patterns — they are high-value signals
    NeuralBus.on("trade:new_token", (signal) => {
      const payload = signal.payload as Record<string, unknown>;
      const key = `new_token:${payload.symbol || "unknown"}`;
      this._observe({
        type: "trade_signal",
        key,
        relatedAgents: ["pump-fun-trader"],
        payload: signal.payload,
        priority: "high",
        baseWeight: 20,
      });
    });

    NeuralBus.on("trade:migration", (signal) => {
      this._observe({
        type: "market_event",
        key: `migration:${(signal.payload as Record<string, unknown>).mint || "unknown"}`,
        relatedAgents: ["pump-fun-trader", "lvtn-treasury-agent"],
        payload: signal.payload,
        priority: "critical",
        baseWeight: 40,
      });
    });

    // Learn from errors to improve routing
    NeuralBus.on("agent:error", (signal) => {
      this._observe({
        type: "error_recovery",
        key: `error:${signal.source}`,
        relatedAgents: [signal.source],
        payload: signal.payload,
        priority: "high",
        baseWeight: 15,
      });
    });
  }

  // ─── Core Learning ───────────────────────────────────────────────────────────

  private _observe(opts: {
    type: MemoryPattern["type"];
    key: string;
    relatedAgents: string[];
    payload: Record<string, unknown>;
    priority?: string;
    baseWeight?: number;
  }): void {
    const existing = this.patterns.get(opts.key);
    const now = Date.now();

    // Priority → weight boost
    const priorityBoost = opts.priority === "critical" ? 20
      : opts.priority === "high" ? 10
      : opts.priority === "normal" ? 5
      : 2;

    const baseWeight = opts.baseWeight || 5;

    if (existing) {
      // Reinforce existing pattern
      existing.frequency++;
      existing.lastSeen = now;
      existing.weight = Math.min(100, existing.weight + baseWeight + priorityBoost);
      existing.quantumAmplitude = Math.min(1.0, existing.quantumAmplitude + 0.05);

      // Merge related agents
      opts.relatedAgents.forEach(agent => {
        if (!existing.relatedAgents.includes(agent)) {
          existing.relatedAgents.push(agent);
        }
      });

      existing.payload = opts.payload; // update with latest payload
    } else {
      // New pattern discovered
      if (this.patterns.size >= this.MAX_PATTERNS) {
        this._evictWeakestPattern();
      }

      const newPattern: MemoryPattern = {
        id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: opts.type,
        key: opts.key,
        weight: baseWeight + priorityBoost,
        frequency: 1,
        lastSeen: now,
        firstSeen: now,
        relatedAgents: opts.relatedAgents,
        payload: opts.payload,
        decayRate: this._calculateDecayRate(opts.type),
        quantumAmplitude: 0.1,
      };

      this.patterns.set(opts.key, newPattern);

      // Emit pattern learned event
      NeuralBus.transmit({
        type: "memory:pattern_learned",
        source: "adaptive-memory",
        payload: {
          key: opts.key,
          type: opts.type,
          weight: newPattern.weight,
          isNew: true,
        },
        priority: "low",
      });
    }
  }

  private _reinforce(key: string, boost: number): void {
    const pattern = this.patterns.get(key);
    if (pattern) {
      pattern.weight = Math.min(100, pattern.weight + boost);
      pattern.quantumAmplitude = Math.min(1.0, pattern.quantumAmplitude + 0.1);
      pattern.lastSeen = Date.now();
    }
  }

  private _calculateDecayRate(type: MemoryPattern["type"]): number {
    // Trading signals decay faster — markets change quickly
    // Error patterns decay slower — we need to remember failures
    const rates: Record<MemoryPattern["type"], number> = {
      trade_signal: 0.15,
      market_event: 0.10,
      agent_interaction: 0.05,
      user_command: 0.03,
      cross_pollination: 0.04,
      error_recovery: 0.02,
    };
    return rates[type] || 0.05;
  }

  private _classifySignal(signalType: string): MemoryPattern["type"] {
    if (signalType.startsWith("trade:") || signalType.startsWith("market:")) return "trade_signal";
    if (signalType.startsWith("agent:")) return "agent_interaction";
    if (signalType.startsWith("memory:")) return "cross_pollination";
    if (signalType.startsWith("system:")) return "error_recovery";
    if (signalType.startsWith("orchestrator:")) return "user_command";
    return "agent_interaction";
  }

  private _evictWeakestPattern(): void {
    let weakestKey = "";
    let weakestWeight = Infinity;

    this.patterns.forEach((pattern, key) => {
      if (pattern.weight < weakestWeight) {
        weakestWeight = pattern.weight;
        weakestKey = key;
      }
    });

    if (weakestKey) {
      this.patterns.delete(weakestKey);
    }
  }

  // ─── Decay Cycle ─────────────────────────────────────────────────────────────

  private _startDecayCycle(): void {
    setInterval(() => {
      const now = Date.now();
      const toDelete: string[] = [];

      this.patterns.forEach((pattern, key) => {
        const ageMinutes = (now - pattern.lastSeen) / 60_000;
        const decay = pattern.decayRate * ageMinutes;
        pattern.weight = Math.max(0, pattern.weight - decay);
        pattern.quantumAmplitude = Math.max(0, pattern.quantumAmplitude - decay * 0.1);

        // Evict patterns that have fully decayed
        if (pattern.weight <= 0 && pattern.frequency < 3) {
          toDelete.push(key);
        }
      });

      toDelete.forEach(key => this.patterns.delete(key));

      // Record pattern count for learning rate calculation
      this.patternCountHistory.push({ ts: now, count: this.patterns.size });
      if (this.patternCountHistory.length > 60) this.patternCountHistory.shift(); // keep 1 hour

    }, this.DECAY_INTERVAL_MS);
  }

  // ─── Query API ───────────────────────────────────────────────────────────────

  getTopPatterns(limit = 20): MemoryPattern[] {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit);
  }

  getPatternsByType(type: MemoryPattern["type"], limit = 20): MemoryPattern[] {
    return Array.from(this.patterns.values())
      .filter(p => p.type === type)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit);
  }

  getPatternsByAgent(agentId: string, limit = 20): MemoryPattern[] {
    return Array.from(this.patterns.values())
      .filter(p => p.relatedAgents.includes(agentId))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit);
  }

  getSnapshot(): MemorySnapshot {
    const all = Array.from(this.patterns.values());
    const active = all.filter(p => p.weight > 10);
    const strong = all.filter(p => p.weight > 50);

    // Learning rate: patterns per hour
    const oneHourAgo = Date.now() - 3_600_000;
    const recentHistory = this.patternCountHistory.filter(h => h.ts > oneHourAgo);
    const learningRate = recentHistory.length > 1
      ? Math.abs(recentHistory[recentHistory.length - 1].count - recentHistory[0].count)
      : 0;

    // Memory efficiency: ratio of strong patterns to total
    const efficiency = all.length > 0
      ? Math.round((strong.length / all.length) * 100)
      : 0;

    return {
      totalPatterns: all.length,
      activePatterns: active.length,
      strongPatterns: strong.length,
      topPatterns: this.getTopPatterns(10),
      systemLearningRate: learningRate,
      memoryEfficiency: efficiency,
    };
  }

  // Force-inject a pattern (used for seeding known-good patterns)
  seed(key: string, type: MemoryPattern["type"], weight: number, relatedAgents: string[]): void {
    this._observe({ type, key, relatedAgents, payload: { seeded: true }, baseWeight: weight });
  }
}

export const AdaptiveMemory = new AdaptiveMemoryClass();
