/**
 * LEVIATHAN HIVEMIND — PumpFunStream
 * Live pump.fun WebSocket feed piped directly into the NeuralBus.
 * Every new token launch, trade, and migration event flows into the HiveMind
 * and triggers quantum cross-pollination across all trading and business agents.
 *
 * WebSocket: wss://pumpportal.fun/api/data
 * Subscriptions: newToken, tokenTrade, accountTrade, migration
 */

import WebSocket from "ws";
import { NeuralBus } from "./NeuralBus";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PumpFunToken {
  mint: string;
  name: string;
  symbol: string;
  description?: string;
  image_uri?: string;
  metadata_uri?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  creator: string;
  created_timestamp: number;
  market_cap?: number;
  usd_market_cap?: number;
  virtual_sol_reserves?: number;
  virtual_token_reserves?: number;
  bonding_curve_key?: string;
}

export interface PumpFunTrade {
  signature: string;
  mint: string;
  sol_amount: number;
  token_amount: number;
  is_buy: boolean;
  user: string;
  timestamp: number;
  tx_index?: number;
  username?: string;
  profile_image?: string;
  market_cap?: number;
  usd_market_cap?: number;
  name?: string;
  symbol?: string;
}

export interface PumpFunMigration {
  signature: string;
  mint: string;
  pool_address?: string;
  timestamp: number;
}

export interface StreamStats {
  connected: boolean;
  reconnectCount: number;
  newTokensReceived: number;
  tradesReceived: number;
  migrationsReceived: number;
  lastEventAt: number | null;
  watchedTokens: string[];
  watchedAccounts: string[];
  recentTokens: PumpFunToken[];
  recentTrades: PumpFunTrade[];
}

// ─── PumpFunStream ────────────────────────────────────────────────────────────

class PumpFunStreamClass {
  private ws: WebSocket | null = null;
  private connected = false;
  private reconnectCount = 0;
  private readonly MAX_RECONNECTS = 20;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private watchedTokens: Set<string> = new Set();
  private watchedAccounts: Set<string> = new Set();

  private stats: StreamStats = {
    connected: false,
    reconnectCount: 0,
    newTokensReceived: 0,
    tradesReceived: 0,
    migrationsReceived: 0,
    lastEventAt: null,
    watchedTokens: [],
    watchedAccounts: [],
    recentTokens: [],
    recentTrades: [],
  };

  private readonly RECENT_LIMIT = 50;

  // ─── Connection ─────────────────────────────────────────────────────────────

  connect(): void {
    if (this.connected) return;

    console.log("[PumpFunStream] Connecting to wss://pumpportal.fun/api/data ...");

    try {
      this.ws = new WebSocket("wss://pumpportal.fun/api/data");

      this.ws.on("open", () => {
        this.connected = true;
        this.stats.connected = true;
        this.reconnectCount = 0;
        this.stats.reconnectCount = 0;
        console.log("[PumpFunStream] Connected — subscribing to streams");

        NeuralBus.updateNodeStatus("pump-fun-trader", "online");
        NeuralBus.transmit({
          type: "system:alert",
          source: "pump-fun-trader",
          payload: { event: "stream_connected", url: "wss://pumpportal.fun/api/data" },
          priority: "high",
        });

        // Subscribe to all streams on a single connection (PumpPortal rule: ONE connection)
        this._subscribe("subscribeNewToken");
        this._subscribe("subscribeMigration");

        // Re-subscribe to any previously watched tokens/accounts
        if (this.watchedTokens.size > 0) {
          this._subscribeTokens(Array.from(this.watchedTokens));
        }
        if (this.watchedAccounts.size > 0) {
          this._subscribeAccounts(Array.from(this.watchedAccounts));
        }
      });

      this.ws.on("message", (data: WebSocket.Data) => {
        try {
          const msg = JSON.parse(data.toString());
          this._handleMessage(msg);
        } catch {
          // ignore malformed messages
        }
      });

      this.ws.on("close", () => {
        this.connected = false;
        this.stats.connected = false;
        NeuralBus.updateNodeStatus("pump-fun-trader", "degraded");
        console.log("[PumpFunStream] Disconnected — scheduling reconnect");
        this._scheduleReconnect();
      });

      this.ws.on("error", (err) => {
        console.error("[PumpFunStream] WebSocket error:", err.message);
        NeuralBus.recordError("pump-fun-trader", err.message);
      });

    } catch (err) {
      console.error("[PumpFunStream] Failed to create WebSocket:", err);
      this._scheduleReconnect();
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.stats.connected = false;
  }

  private _scheduleReconnect(): void {
    if (this.reconnectCount >= this.MAX_RECONNECTS) {
      console.error("[PumpFunStream] Max reconnects reached — giving up");
      NeuralBus.updateNodeStatus("pump-fun-trader", "offline");
      return;
    }
    const delay = Math.min(30_000, 1_000 * Math.pow(2, this.reconnectCount)); // exponential backoff
    this.reconnectCount++;
    this.stats.reconnectCount = this.reconnectCount;
    console.log(`[PumpFunStream] Reconnecting in ${delay}ms (attempt ${this.reconnectCount})`);
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  // ─── Subscriptions ──────────────────────────────────────────────────────────

  private _subscribe(method: string, keys?: string[]): void {
    if (!this.ws || !this.connected) return;
    const payload: Record<string, unknown> = { method };
    if (keys && keys.length > 0) payload.keys = keys;
    this.ws.send(JSON.stringify(payload));
  }

  watchToken(mintAddress: string): void {
    this.watchedTokens.add(mintAddress);
    this.stats.watchedTokens = Array.from(this.watchedTokens);
    if (this.connected) {
      this._subscribeTokens([mintAddress]);
    }
    console.log(`[PumpFunStream] Now watching token: ${mintAddress}`);
  }

  watchAccount(publicKey: string): void {
    this.watchedAccounts.add(publicKey);
    this.stats.watchedAccounts = Array.from(this.watchedAccounts);
    if (this.connected) {
      this._subscribeAccounts([publicKey]);
    }
    console.log(`[PumpFunStream] Now watching account: ${publicKey}`);
  }

  private _subscribeTokens(mints: string[]): void {
    this._subscribe("subscribeTokenTrade", mints);
  }

  private _subscribeAccounts(accounts: string[]): void {
    this._subscribe("subscribeAccountTrade", accounts);
  }

  // ─── Message Handling ────────────────────────────────────────────────────────

  private _handleMessage(msg: Record<string, unknown>): void {
    this.stats.lastEventAt = Date.now();

    // New token launch
    if (msg.txType === "create" || (msg.mint && msg.creator && !msg.is_buy !== undefined)) {
      const token = msg as unknown as PumpFunToken;
      if (token.mint && token.creator) {
        this._handleNewToken(token);
        return;
      }
    }

    // Trade event
    if (msg.signature && msg.is_buy !== undefined) {
      this._handleTrade(msg as unknown as PumpFunTrade);
      return;
    }

    // Migration event
    if (msg.signature && msg.pool_address !== undefined) {
      this._handleMigration(msg as unknown as PumpFunMigration);
      return;
    }
  }

  private _handleNewToken(token: PumpFunToken): void {
    this.stats.newTokensReceived++;

    // Add to recent tokens (circular buffer)
    this.stats.recentTokens.unshift(token);
    if (this.stats.recentTokens.length > this.RECENT_LIMIT) {
      this.stats.recentTokens.pop();
    }

    // Pipe into NeuralBus — triggers cross-pollination across all trading/business agents
    NeuralBus.transmit({
      type: "trade:new_token",
      source: "pump-fun-trader",
      payload: {
        mint: token.mint,
        name: token.name,
        symbol: token.symbol,
        creator: token.creator,
        marketCap: token.usd_market_cap,
        timestamp: token.created_timestamp,
        twitter: token.twitter,
        telegram: token.telegram,
        website: token.website,
      },
      priority: "high",
      metadata: { confidence: 1.0 },
    });

    // Check for volume spike potential
    if (token.usd_market_cap && token.usd_market_cap > 10_000) {
      NeuralBus.transmit({
        type: "market:volume_spike",
        source: "pump-fun-trader",
        payload: {
          mint: token.mint,
          symbol: token.symbol,
          marketCap: token.usd_market_cap,
          alert: "new_token_high_mcap",
        },
        priority: "critical",
      });
    }
  }

  private _handleTrade(trade: PumpFunTrade): void {
    this.stats.tradesReceived++;

    // Add to recent trades
    this.stats.recentTrades.unshift(trade);
    if (this.stats.recentTrades.length > this.RECENT_LIMIT) {
      this.stats.recentTrades.pop();
    }

    NeuralBus.transmit({
      type: trade.is_buy ? "trade:buy" : "trade:sell",
      source: "pump-fun-trader",
      payload: {
        mint: trade.mint,
        solAmount: trade.sol_amount,
        tokenAmount: trade.token_amount,
        isBuy: trade.is_buy,
        user: trade.user,
        marketCap: trade.usd_market_cap,
        name: trade.name,
        symbol: trade.symbol,
        timestamp: trade.timestamp,
      },
      priority: "normal",
    });
  }

  private _handleMigration(migration: PumpFunMigration): void {
    this.stats.migrationsReceived++;

    // Migration = token graduated from bonding curve to Raydium — significant event
    NeuralBus.transmit({
      type: "trade:migration",
      source: "pump-fun-trader",
      payload: {
        mint: migration.mint,
        poolAddress: migration.pool_address,
        timestamp: migration.timestamp,
        alert: "token_graduated_to_raydium",
      },
      priority: "critical",
    });
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  getStats(): StreamStats {
    return { ...this.stats };
  }

  getRecentTokens(limit = 20): PumpFunToken[] {
    return this.stats.recentTokens.slice(0, limit);
  }

  getRecentTrades(limit = 20): PumpFunTrade[] {
    return this.stats.recentTrades.slice(0, limit);
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const PumpFunStream = new PumpFunStreamClass();
