/**
 * LEVIATHAN HIVEMIND — NeuralBus
 * Central event bus and nervous system for all agent communication.
 * Self-adapting, self-learning, connects all agents, orchestrators, and modules.
 * 
 * Architecture: Event-driven pub/sub with adaptive routing and memory.
 * Every agent, module, and data stream connects here.
 */

import { EventEmitter } from "events";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NeuralSignalType =
  | "agent:status"
  | "agent:response"
  | "agent:error"
  | "trade:new_token"
  | "trade:buy"
  | "trade:sell"
  | "trade:migration"
  | "trade:account"
  | "market:price_update"
  | "market:volume_spike"
  | "system:heartbeat"
  | "system:alert"
  | "memory:pattern_learned"
  | "memory:pattern_matched"
  | "orchestrator:command"
  | "orchestrator:result"
  | "module:leadgen"
  | "module:crm"
  | "module:gematria"
  | "glasses:event"
  | "solana:transaction"
  | "solana:balance_change";

export interface NeuralSignal {
  id: string;
  type: NeuralSignalType;
  source: string;           // agent/module that emitted this signal
  target?: string;          // optional: specific agent/module to route to
  payload: Record<string, unknown>;
  timestamp: number;
  priority: "critical" | "high" | "normal" | "low";
  metadata?: {
    confidence?: number;    // 0-1 — how confident the source is
    ttl?: number;           // time-to-live in ms
    retryCount?: number;
    adaptiveWeight?: number; // learned routing weight
  };
}

export interface NeuralNode {
  id: string;
  name: string;
  type: "agent" | "orchestrator" | "module" | "stream" | "sensor";
  status: "online" | "offline" | "degraded" | "learning";
  capabilities: string[];
  lastSeen: number;
  signalCount: number;
  errorCount: number;
  adaptiveScore: number;    // 0-100 — learned reliability score
}

// ─── NeuralBus ────────────────────────────────────────────────────────────────

class NeuralBusClass extends EventEmitter {
  private nodes: Map<string, NeuralNode> = new Map();
  private signalHistory: NeuralSignal[] = [];
  private readonly MAX_HISTORY = 1000;
  private routingWeights: Map<string, Map<string, number>> = new Map();
  private patternMemory: Map<string, number> = new Map();
  private startTime: number = Date.now();

  constructor() {
    super();
    this.setMaxListeners(200); // support many agents
    this._startHeartbeat();
  }

  // ─── Node Registration ──────────────────────────────────────────────────────

  registerNode(node: Omit<NeuralNode, "lastSeen" | "signalCount" | "errorCount" | "adaptiveScore">): void {
    const fullNode: NeuralNode = {
      ...node,
      lastSeen: Date.now(),
      signalCount: 0,
      errorCount: 0,
      adaptiveScore: 100,
    };
    this.nodes.set(node.id, fullNode);
    this.emit("node:registered", fullNode);
    console.log(`[HiveMind] Node registered: ${node.name} (${node.type})`);
  }

  updateNodeStatus(nodeId: string, status: NeuralNode["status"]): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.status = status;
      node.lastSeen = Date.now();
      this.emit("node:status_change", { nodeId, status });
    }
  }

  getNodes(): NeuralNode[] {
    return Array.from(this.nodes.values());
  }

  getOnlineNodes(): NeuralNode[] {
    return this.getNodes().filter(n => n.status === "online" || n.status === "learning");
  }

  // ─── Signal Transmission ────────────────────────────────────────────────────

  transmit(signal: Omit<NeuralSignal, "id" | "timestamp">): void {
    const fullSignal: NeuralSignal = {
      ...signal,
      id: `sig_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
    };

    // Update source node stats
    const sourceNode = this.nodes.get(signal.source);
    if (sourceNode) {
      sourceNode.signalCount++;
      sourceNode.lastSeen = Date.now();
    }

    // Store in history (circular buffer)
    this.signalHistory.push(fullSignal);
    if (this.signalHistory.length > this.MAX_HISTORY) {
      this.signalHistory.shift();
    }

    // Adaptive routing — learn which routes are active
    this._updateRoutingWeights(fullSignal);

    // Emit to all listeners on this signal type
    this.emit(fullSignal.type, fullSignal);

    // Also emit to generic "signal" listeners
    this.emit("signal", fullSignal);

    // If targeted, emit to specific target
    if (fullSignal.target) {
      this.emit(`signal:${fullSignal.target}`, fullSignal);
    }
  }

  // ─── Adaptive Learning ──────────────────────────────────────────────────────

  private _updateRoutingWeights(signal: NeuralSignal): void {
    const key = `${signal.source}:${signal.type}`;
    const current = this.patternMemory.get(key) || 0;
    this.patternMemory.set(key, current + 1);

    // Update adaptive score for source node
    const node = this.nodes.get(signal.source);
    if (node && signal.type !== "agent:error") {
      // Reward active, non-erroring nodes
      node.adaptiveScore = Math.min(100, node.adaptiveScore + 0.1);
    }
  }

  recordError(nodeId: string, error: string): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.errorCount++;
      node.adaptiveScore = Math.max(0, node.adaptiveScore - 5);
      if (node.adaptiveScore < 20) {
        node.status = "degraded";
      }
    }
    this.transmit({
      type: "agent:error",
      source: nodeId,
      payload: { error },
      priority: "high",
    });
  }

  // ─── Query ──────────────────────────────────────────────────────────────────

  getRecentSignals(limit = 50, type?: NeuralSignalType): NeuralSignal[] {
    const signals = type
      ? this.signalHistory.filter(s => s.type === type)
      : this.signalHistory;
    return signals.slice(-limit).reverse();
  }

  getTopPatterns(limit = 10): Array<{ pattern: string; count: number }> {
    return Array.from(this.patternMemory.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([pattern, count]) => ({ pattern, count }));
  }

  getSystemStats() {
    const nodes = this.getNodes();
    return {
      totalNodes: nodes.length,
      onlineNodes: nodes.filter(n => n.status === "online").length,
      degradedNodes: nodes.filter(n => n.status === "degraded").length,
      totalSignals: this.signalHistory.length,
      uptimeMs: Date.now() - this.startTime,
      topPatterns: this.getTopPatterns(5),
    };
  }

  // ─── Heartbeat ──────────────────────────────────────────────────────────────

  private _startHeartbeat(): void {
    setInterval(() => {
      const now = Date.now();
      // Mark nodes as offline if not seen in 60 seconds
      this.nodes.forEach(node => {
        if (node.status === "online" && now - node.lastSeen > 60_000) {
          node.status = "offline";
          this.emit("node:offline", node);
        }
      });

      this.transmit({
        type: "system:heartbeat",
        source: "hivemind",
        payload: this.getSystemStats(),
        priority: "low",
      });
    }, 10_000); // every 10 seconds
  }
}

// Singleton — one NeuralBus for the entire Leviathan system
export const NeuralBus = new NeuralBusClass();
