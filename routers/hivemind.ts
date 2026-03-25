/**
 * LEVIATHAN HIVEMIND — tRPC Router
 * All HiveMind procedures exposed to the frontend.
 * Covers: agent registry, quantum states, pump.fun stream, adaptive memory, neural bus.
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { AgentRegistry } from "../hivemind/AgentRegistry";
import { NeuralBus } from "../hivemind/NeuralBus";
import { QuantumCrossPollinationEngine } from "../hivemind/QuantumCrossPollinationEngine";
import { PumpFunStream } from "../hivemind/PumpFunStream";
import { AdaptiveMemory } from "../hivemind/AdaptiveMemory";

// Start the pump.fun stream on server boot
PumpFunStream.connect();

export const hivemindRouter = router({

  // ─── Agent Registry ─────────────────────────────────────────────────────────

  getAgents: publicProcedure.query(() => {
    return AgentRegistry.getAll();
  }),

  getAgentSummary: publicProcedure.query(() => {
    return AgentRegistry.getSummary();
  }),

  getAgentById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return AgentRegistry.getById(input.id) ?? null;
    }),

  getAgentsByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(({ input }) => {
      return AgentRegistry.getByCategory(input.category as Parameters<typeof AgentRegistry.getByCategory>[0]);
    }),

  // ─── Neural Bus ─────────────────────────────────────────────────────────────

  getNeuralBusStats: publicProcedure.query(() => {
    return NeuralBus.getSystemStats();
  }),

  getNeuralNodes: publicProcedure.query(() => {
    return NeuralBus.getNodes();
  }),

  getRecentSignals: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(30) }))
    .query(({ input }) => {
      return NeuralBus.getRecentSignals(input.limit);
    }),

  injectSignal: protectedProcedure
    .input(z.object({
      sourceAgentId: z.string(),
      signalType: z.string(),
      payload: z.record(z.unknown()),
    }))
    .mutation(({ input }) => {
      QuantumCrossPollinationEngine.injectSignal(
        input.sourceAgentId,
        input.signalType as Parameters<typeof QuantumCrossPollinationEngine.injectSignal>[1],
        input.payload as Record<string, unknown>
      );
      return { success: true };
    }),

  // ─── Quantum Cross-Pollination Engine ───────────────────────────────────────

  getQuantumState: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(({ input }) => {
      const state = QuantumCrossPollinationEngine.getQuantumState(input.agentId);
      if (!state) return null;
      return {
        agentId: state.agentId,
        entanglementGroup: state.entanglementGroup,
        resonanceFrequency: state.resonanceFrequency,
        collapseThreshold: state.collapseThreshold,
        lastCollapse: state.lastCollapse,
        stateVectorSize: state.stateVector.size,
        superpositionCount: state.superpositions.size,
        stateVector: Object.fromEntries(state.stateVector),
      };
    }),

  getAllQuantumStates: publicProcedure.query(() => {
    return QuantumCrossPollinationEngine.getAllQuantumStates().map(state => ({
      agentId: state.agentId,
      entanglementGroup: state.entanglementGroup,
      resonanceFrequency: state.resonanceFrequency,
      collapseThreshold: state.collapseThreshold,
      lastCollapse: state.lastCollapse,
      stateVectorSize: state.stateVector.size,
      superpositionCount: state.superpositions.size,
    }));
  }),

  getEntanglements: publicProcedure.query(() => {
    return QuantumCrossPollinationEngine.getStrongestEntanglements(20);
  }),

  getPollinationEvents: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(({ input }) => {
      return QuantumCrossPollinationEngine.getRecentPollinationEvents(input.limit);
    }),

  getGlobalKnowledgeField: publicProcedure.query(() => {
    return QuantumCrossPollinationEngine.getGlobalKnowledgeField();
  }),

  getSystemIntelligenceScore: publicProcedure.query(() => {
    return { score: QuantumCrossPollinationEngine.getSystemIntelligenceScore() };
  }),

  // ─── Pump.fun Stream ────────────────────────────────────────────────────────

  getPumpFunStats: publicProcedure.query(() => {
    const stats = PumpFunStream.getStats();
    return {
      connected: stats.connected,
      reconnectCount: stats.reconnectCount,
      newTokensReceived: stats.newTokensReceived,
      tradesReceived: stats.tradesReceived,
      migrationsReceived: stats.migrationsReceived,
      lastEventAt: stats.lastEventAt,
      watchedTokenCount: stats.watchedTokens.length,
      watchedAccountCount: stats.watchedAccounts.length,
    };
  }),

  getRecentPumpTokens: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(({ input }) => {
      return PumpFunStream.getRecentTokens(input.limit);
    }),

  getRecentPumpTrades: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(({ input }) => {
      return PumpFunStream.getRecentTrades(input.limit);
    }),

  watchToken: protectedProcedure
    .input(z.object({ mintAddress: z.string().min(32).max(44) }))
    .mutation(({ input }) => {
      PumpFunStream.watchToken(input.mintAddress);
      return { success: true, watching: input.mintAddress };
    }),

  watchAccount: protectedProcedure
    .input(z.object({ publicKey: z.string().min(32).max(44) }))
    .mutation(({ input }) => {
      PumpFunStream.watchAccount(input.publicKey);
      return { success: true, watching: input.publicKey };
    }),

  // ─── Adaptive Memory ────────────────────────────────────────────────────────

  getMemorySnapshot: publicProcedure.query(() => {
    const snapshot = AdaptiveMemory.getSnapshot();
    return {
      totalPatterns: snapshot.totalPatterns,
      activePatterns: snapshot.activePatterns,
      strongPatterns: snapshot.strongPatterns,
      systemLearningRate: snapshot.systemLearningRate,
      memoryEfficiency: snapshot.memoryEfficiency,
      topPatterns: snapshot.topPatterns.map(p => ({
        id: p.id,
        key: p.key,
        type: p.type,
        weight: p.weight,
        frequency: p.frequency,
        lastSeen: p.lastSeen,
        relatedAgents: p.relatedAgents,
        quantumAmplitude: p.quantumAmplitude,
      })),
    };
  }),

  getTopPatterns: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(({ input }) => {
      return AdaptiveMemory.getTopPatterns(input.limit).map(p => ({
        id: p.id,
        key: p.key,
        type: p.type,
        weight: p.weight,
        frequency: p.frequency,
        lastSeen: p.lastSeen,
        relatedAgents: p.relatedAgents,
        quantumAmplitude: p.quantumAmplitude,
      }));
    }),

  getPatternsByAgent: publicProcedure
    .input(z.object({ agentId: z.string(), limit: z.number().min(1).max(50).default(10) }))
    .query(({ input }) => {
      return AdaptiveMemory.getPatternsByAgent(input.agentId, input.limit).map(p => ({
        id: p.id,
        key: p.key,
        type: p.type,
        weight: p.weight,
        frequency: p.frequency,
        quantumAmplitude: p.quantumAmplitude,
      }));
    }),

  // ─── HiveMind Full Status ────────────────────────────────────────────────────

  getFullStatus: publicProcedure.query(() => {
    const agentSummary = AgentRegistry.getSummary();
    const neuralStats = NeuralBus.getSystemStats();
    const pumpStats = PumpFunStream.getStats();
    const memorySnapshot = AdaptiveMemory.getSnapshot();
    const intelligenceScore = QuantumCrossPollinationEngine.getSystemIntelligenceScore();
    const entanglements = QuantumCrossPollinationEngine.getStrongestEntanglements(5);

    return {
      agents: agentSummary,
      neural: {
        totalSignals: neuralStats.totalSignals,
        signalsPerMinute: Math.round(neuralStats.totalSignals / Math.max(1, neuralStats.uptimeMs / 60000)),
        activeNodes: neuralStats.onlineNodes,
        errorCount: 0,
      },
      pumpFun: {
        connected: pumpStats.connected,
        newTokens: pumpStats.newTokensReceived,
        trades: pumpStats.tradesReceived,
        migrations: pumpStats.migrationsReceived,
        lastEventAt: pumpStats.lastEventAt,
      },
      memory: {
        totalPatterns: memorySnapshot.totalPatterns,
        strongPatterns: memorySnapshot.strongPatterns,
        learningRate: memorySnapshot.systemLearningRate,
        efficiency: memorySnapshot.memoryEfficiency,
      },
      quantum: {
        intelligenceScore,
        topEntanglements: entanglements.map(e => ({
          agentA: e.agentA,
          agentB: e.agentB,
          strength: e.strength,
        })),
      },
      timestamp: Date.now(),
    };
  }),
});
