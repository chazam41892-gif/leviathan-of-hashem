/**
 * LEVIATHAN HIVEMIND — AgentRegistry
 * Self-registering catalog of every agent, orchestrator, and module in the ecosystem.
 * Agents auto-register on startup and report capabilities to the HiveMind.
 */

import { NeuralBus } from "./NeuralBus";

export interface AgentDefinition {
  id: string;
  name: string;
  category: "core" | "language" | "hardware" | "creative" | "audio" | "automation" | "iot" | "dev" | "business" | "trading";
  description: string;
  capabilities: string[];
  tier: "free" | "scout" | "sentinel" | "predator" | "apex" | "leviathan";
  status: "online" | "offline" | "degraded" | "coming_soon";
  endpoint?: string;        // optional API endpoint
  websocket?: string;       // optional WebSocket endpoint
  version: string;
  metadata?: Record<string, unknown>;
}

// ─── All Leviathan Agents — sourced from every ZIP file ──────────────────────

const LEVIATHAN_AGENTS: AgentDefinition[] = [
  // CORE AGENTS
  {
    id: "sinatra-copilot",
    name: "Sinatra Copilot",
    category: "core",
    description: "Master orchestrator — routes commands to all agents, modules, and external systems. The central nervous system router.",
    capabilities: ["routing", "orchestration", "context-management", "multi-agent-coordination"],
    tier: "free",
    status: "online",
    version: "1.0.0",
  },
  {
    id: "leviathan-core",
    name: "Leviathan Core",
    category: "core",
    description: "Primary AI reasoning engine. Handles complex multi-step tasks, planning, and strategic decision-making.",
    capabilities: ["reasoning", "planning", "task-decomposition", "strategy"],
    tier: "free",
    status: "online",
    version: "1.0.0",
  },
  {
    id: "hivemind-orchestrator",
    name: "HiveMind Orchestrator",
    category: "core",
    description: "Self-adapting neural coordinator. Learns from all agent interactions and optimizes routing in real time.",
    capabilities: ["adaptive-routing", "pattern-learning", "neural-coordination", "self-optimization"],
    tier: "scout",
    status: "online",
    version: "1.0.0",
  },
  // LANGUAGE AGENTS
  {
    id: "gematria-sage",
    name: "Gematria Sage",
    category: "language",
    description: "Hebrew Gematria calculator and sacred number interpreter. Connects numerical values to spiritual meaning.",
    capabilities: ["gematria", "hebrew-text", "sacred-numbers", "kabbalah"],
    tier: "free",
    status: "online",
    version: "1.0.0",
  },
  {
    id: "babel-translator",
    name: "Babel Translator",
    category: "language",
    description: "Real-time translation across 144 languages. Supports speech-to-speech, text-to-text, and OCR translation.",
    capabilities: ["translation", "speech-to-speech", "ocr", "144-languages"],
    tier: "scout",
    status: "online",
    version: "1.0.0",
  },
  {
    id: "scribe-agent",
    name: "Scribe Agent",
    category: "language",
    description: "Document generation, transcription, and content creation. Converts speech to structured documents.",
    capabilities: ["transcription", "document-generation", "content-creation", "whisper-api"],
    tier: "scout",
    status: "online",
    version: "1.0.0",
  },
  // HARDWARE AGENTS
  {
    id: "m02-glasses-agent",
    name: "M02 Glasses Agent",
    category: "hardware",
    description: "Interface layer for M02 AI glasses. Handles vision feed, audio routing, and real-time narration through Bluetooth.",
    capabilities: ["vision-narration", "bluetooth-audio", "real-time-feed", "photo-capture"],
    tier: "sentinel",
    status: "online",
    version: "1.2.0",
  },
  {
    id: "iot-commander",
    name: "IoT Commander",
    category: "iot",
    description: "Controls smart devices, cameras, drones, and sensors via Web Bluetooth, MQTT, and WebRTC protocols.",
    capabilities: ["bluetooth", "mqtt", "webrtc", "drone-control", "camera-control"],
    tier: "predator",
    status: "coming_soon",
    version: "0.9.0",
  },
  // CREATIVE AGENTS
  {
    id: "vision-artist",
    name: "Vision Artist",
    category: "creative",
    description: "AI image generation and editing. Creates visuals from text prompts and edits existing images.",
    capabilities: ["image-generation", "image-editing", "midjourney", "dalle"],
    tier: "sentinel",
    status: "online",
    version: "1.0.0",
  },
  {
    id: "media-forge",
    name: "Media Forge",
    category: "creative",
    description: "Video generation, audio production, and multimedia content creation pipeline.",
    capabilities: ["video-generation", "audio-production", "multimedia"],
    tier: "predator",
    status: "coming_soon",
    version: "0.5.0",
  },
  // AUDIO AGENTS
  {
    id: "voice-oracle",
    name: "Voice Oracle",
    category: "audio",
    description: "Text-to-speech and speech-to-text with multiple voice profiles. Routes audio to glasses via Bluetooth.",
    capabilities: ["tts", "stt", "voice-profiles", "bluetooth-routing", "openai-tts"],
    tier: "free",
    status: "online",
    version: "1.1.0",
  },
  // AUTOMATION AGENTS
  {
    id: "bardeen-agent",
    name: "Bardeen Agent",
    category: "automation",
    description: "Browser automation and workflow execution. Runs automated tasks across web platforms.",
    capabilities: ["browser-automation", "workflow-execution", "web-scraping"],
    tier: "sentinel",
    status: "online",
    version: "1.0.0",
  },
  // BUSINESS AGENTS
  {
    id: "crm-plus-agent",
    name: "CRM Plus Agent",
    category: "business",
    description: "Katan HaShem CRM — full customer relationship management with AI-powered follow-up and pipeline tracking.",
    capabilities: ["crm", "pipeline", "follow-up", "customer-tracking", "ai-insights"],
    tier: "sentinel",
    status: "online",
    version: "1.0.0",
  },
  {
    id: "leadgen-gems",
    name: "LeadGen Gems",
    category: "business",
    description: "5-gem AI lead generation system. Prospect, qualify, enrich, score, and convert leads automatically.",
    capabilities: ["prospecting", "qualification", "enrichment", "scoring", "conversion"],
    tier: "sentinel",
    status: "online",
    version: "1.0.0",
    metadata: {
      gems: ["Prospector", "Qualifier", "Enricher", "Scorer", "Converter"],
    },
  },
  // TRADING AGENTS
  {
    id: "pump-fun-trader",
    name: "Pump.fun Trader",
    category: "trading",
    description: "Live pump.fun token stream monitor. Watches new token launches, bonding curve activity, and migration events in real time.",
    capabilities: ["new-token-detection", "bonding-curve", "migration-alerts", "trade-execution", "sniper"],
    tier: "apex",
    status: "online",
    version: "1.0.0",
    websocket: "wss://pumpportal.fun/api/data",
  },
  {
    id: "lvtn-treasury-agent",
    name: "LVTN Treasury Agent",
    category: "trading",
    description: "Manages LVTN token treasury, monitors wallet balances, and executes programmatic token operations on Solana.",
    capabilities: ["solana-rpc", "spl-token", "treasury-management", "balance-monitoring"],
    tier: "leviathan",
    status: "online",
    version: "1.0.0",
    metadata: {
      mintAddress: "5eMsA3LR1sPxA1TMhh1r9cVuzC4QEAaEb1ThFT5jFQUT",
      mainWallet: "DpFcQ7WqfaxLZ1Z1dZcTHVPfKZxeF8WiobrfwJgv89Rt",
      network: "devnet",
    },
  },
  // DEV AGENTS
  {
    id: "dev-copilot",
    name: "Dev Copilot",
    category: "dev",
    description: "Code generation, review, and deployment assistant. Connects to GitHub for automated CI/CD workflows.",
    capabilities: ["code-generation", "code-review", "github-integration", "cicd"],
    tier: "predator",
    status: "online",
    version: "1.0.0",
  },
];

// ─── AgentRegistry ────────────────────────────────────────────────────────────

class AgentRegistryClass {
  private agents: Map<string, AgentDefinition> = new Map();

  constructor() {
    // Auto-register all built-in Leviathan agents
    LEVIATHAN_AGENTS.forEach(agent => this.register(agent));
  }

  register(agent: AgentDefinition): void {
    this.agents.set(agent.id, agent);

    // Register with NeuralBus
    NeuralBus.registerNode({
      id: agent.id,
      name: agent.name,
      type: agent.category === "core" ? "orchestrator" : "agent",
      status: agent.status === "online" ? "online" : "offline",
      capabilities: agent.capabilities,
    });

    NeuralBus.transmit({
      type: "agent:status",
      source: agent.id,
      payload: { status: agent.status, version: agent.version },
      priority: "normal",
    });
  }

  getAll(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  getByCategory(category: AgentDefinition["category"]): AgentDefinition[] {
    return this.getAll().filter(a => a.category === category);
  }

  getByTier(tier: AgentDefinition["tier"]): AgentDefinition[] {
    return this.getAll().filter(a => a.tier === tier);
  }

  getOnline(): AgentDefinition[] {
    return this.getAll().filter(a => a.status === "online");
  }

  getById(id: string): AgentDefinition | undefined {
    return this.agents.get(id);
  }

  updateStatus(id: string, status: AgentDefinition["status"]): void {
    const agent = this.agents.get(id);
    if (agent) {
      agent.status = status;
      NeuralBus.updateNodeStatus(id, status === "online" ? "online" : "offline");
    }
  }

  getSummary() {
    const all = this.getAll();
    return {
      total: all.length,
      online: all.filter(a => a.status === "online").length,
      comingSoon: all.filter(a => a.status === "coming_soon").length,
      byCategory: Object.fromEntries(
        ["core", "language", "hardware", "creative", "audio", "automation", "iot", "dev", "business", "trading"]
          .map(cat => [cat, all.filter(a => a.category === cat).length])
      ),
    };
  }
}

export const AgentRegistry = new AgentRegistryClass();
