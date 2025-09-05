// API service for Top Signals Browser
// Handles server API integration and signals data processing

export interface TokenSignal {
  symbol: string;
  type: 'major coin' | 'memecoin';
  hx_mom6: number; // required for ranking
  hx_liq6?: number;
  hx_buzz6?: number;
  hx_rankimp6?: number;
  hx_galchg6?: number;
  hx_sent6?: number;
  hx_ret6?: number;
  price?: number;
  market_cap?: number;
  volume_24h?: number;
  social_dominance?: number;
  contributors_active?: number;
  sentiment?: number;
  timestamp?: number;
}

export interface TokenDetail extends TokenSignal {
  description?: string;
  website?: string;
  social_links?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
}

// No mock data: UI uses only server-provided data

// API service class
export class SignalsAPI {
  private static instance: SignalsAPI;
  private watchlist: Set<string> = new Set();
  private readonly baseUrl: string;
  private cacheSignals: TokenSignal[] | null = null;
  private cacheAtMs: number = 0;
  private readonly cacheTtlMs: number = 60_000; // 1 minute

  private constructor() {
    // Load watchlist from localStorage
    const saved = localStorage.getItem('signals-watchlist');
    if (saved) {
      this.watchlist = new Set(JSON.parse(saved));
    }

    // Prefer Vite env; fallback to local dev default
    // Example: VITE_SIGNALS_API_BASE_URL=https://your-server.example.com
    this.baseUrl = (import.meta as any).env.VITE_SIGNALS_API_BASE_URL || 'https://farcaster.maxxit.ai';
    console.log('baseUrl', (import.meta as any).env.VITE_SIGNALS_API_BASE_URL);
  }

  public static getInstance(): SignalsAPI {
    if (!SignalsAPI.instance) {
      SignalsAPI.instance = new SignalsAPI();
    }
    return SignalsAPI.instance;
  }

  // Generic JSON fetch with basic error handling
  private async fetchJson<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  }

  // Map server response into TokenSignal; supports multiple possible field names
  private mapToTokenSignal(item: any): TokenSignal | null {
    if (!item) return null;

    const symbol: string = (item.symbol || item.ticker || item.token || item['Token Mentioned'] || '').toString().toUpperCase();
    if (!symbol) return null;

    const type: 'major coin' | 'memecoin' = (item.type === 'memecoin' ? 'memecoin' : 'major coin');

    // Server wraps computed metrics under item.metrics
    const m = item.metrics || {};

    // Map only available database fields to UI fields
    const hx_mom6 = this.num(m.r_last6h_pct); // r_last6h_pct maps to hx_mom6
    const hx_liq6 = this.num(m.d_pct_mktvol_6h); // d_pct_mktvol_6h maps to hx_liq6
    const hx_buzz6 = this.num(m.d_pct_socvol_6h); // d_pct_socvol_6h maps to hx_buzz6
    const hx_sent6 = this.num(m.d_pct_sent_6h); // d_pct_sent_6h maps to hx_sent6
    const hx_rankimp6 = this.num(m.neg_d_altrank_6h); // neg_d_altrank_6h maps to hx_rankimp6 (rank impact)
    const hx_galchg6 = this.num(m.d_galaxy_6h); // d_galaxy_6h maps to hx_galchg6
    const hx_ret6 = this.num(item.pred_next6h_pct); // pred_next6h_pct maps to hx_ret6

    // These fields are NOT present in the database, so we don't map them
    const contributors_active = this.num(m.d_pct_users_6h); // d_pct_users_6h maps to contributors_active (social contributors)

    // Fields not available in database - leave undefined
    const price = undefined;
    const market_cap = undefined;
    const volume_24h = undefined;
    const social_dominance = undefined;
    const sentiment = undefined;
    const timestamp = Date.now();

    return {
      symbol,
      type,
      hx_mom6: hx_mom6 ?? 0,
      hx_liq6: hx_liq6 ?? 0,
      hx_buzz6: hx_buzz6 ?? 0,
      hx_rankimp6: hx_rankimp6 ?? 0,
      hx_galchg6: hx_galchg6 ?? 0,
      hx_sent6: hx_sent6 ?? 0,
      hx_ret6: hx_ret6 ?? 0,
      price: price ?? 0,
      market_cap: market_cap ?? 0,
      volume_24h: volume_24h ?? 0,
      social_dominance: social_dominance ?? 0,
      contributors_active: contributors_active ?? 0,
      sentiment: sentiment ?? 0,
      timestamp
    };
  }

  private mapToTokenDetail(item: any): TokenDetail | null {
    const base = this.mapToTokenSignal(item);
    if (!base) return null;
    const description = item.description || `${base.symbol} is a ${base.type} with ${base.hx_mom6 > 0 ? 'positive' : 'negative'} momentum signals.`;
    const website = item.website;
    const social_links = item.social_links || {
      twitter: item.twitter,
      telegram: item.telegram,
      discord: item.discord
    };
    return { ...base, description, website, social_links };
  }

  private num(...vals: any[]): number | undefined {
    for (const v of vals) {
      if (v === null || v === undefined) continue;
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
    return undefined;
  }

  // Fetch all signals from server single endpoint /lunarcrush (with simple cache)
  public async getTopSignals(direction: 'gainers' | 'losers' = 'gainers', limit: number = 20): Promise<TokenSignal[]> {
    const now = Date.now();
    try {
      // Check if we have valid cached data
      if (!this.cacheSignals || (now - this.cacheAtMs) > this.cacheTtlMs) {
        console.log('Fetching fresh signals data from server');
        const data = await this.fetchJson<any[]>(`/lunarcrush`);
        const mapped = (Array.isArray(data) ? data : []).map((d) => this.mapToTokenSignal(d)).filter(Boolean) as TokenSignal[];
        this.cacheSignals = mapped;
        this.cacheAtMs = now;
        console.log('Cached', mapped.length, 'signals');
      } else {
        console.log('Using cached signals data');
      }

      const source = this.cacheSignals || [];
      const filtered = source.filter(t => (typeof t.hx_mom6 === 'number') && (direction === 'gainers' ? t.hx_mom6 > 0 : t.hx_mom6 < 0));
      filtered.sort((a, b) => direction === 'gainers' ? (b.hx_mom6 - a.hx_mom6) : (a.hx_mom6 - b.hx_mom6));
      const ranked = filtered.length ? filtered : source;
      return ranked.slice(0, limit);
    } catch (e) {
      console.error('Failed to load signals from server:', e);
      return [];
    }
  }

  // Get detailed token information
  public async getTokenDetail(symbol: string): Promise<TokenDetail | null> {
    const upper = symbol.toUpperCase();

    try {
      // First try to use cached data if available and recent
      if (this.cacheSignals && (Date.now() - this.cacheAtMs) < this.cacheTtlMs) {
        const cachedToken = this.cacheSignals.find(t => t.symbol === upper);
        if (cachedToken) {
          console.log('Using cached data for token detail:', upper);
          return this.mapToTokenDetail(cachedToken);
        }
      }

      // Fetch fresh data
      console.log('Fetching fresh data for token detail:', upper);
      const data = await this.fetchJson<any[]>(`/lunarcrush`);
      const mapped = (Array.isArray(data) ? data : []).map((d) => this.mapToTokenSignal(d)).filter(Boolean) as TokenSignal[];

      // Update cache
      this.cacheSignals = mapped;
      this.cacheAtMs = Date.now();

      const token = mapped.find(t => t.symbol === upper);
      if (token) {
        console.log('Found token data:', token);
        return this.mapToTokenDetail(token);
      } else {
        console.warn('Token not found in API response:', upper, 'Available symbols:', mapped.map(t => t.symbol));
      }
    } catch (e) {
      console.error('Detail lookup failed:', e);
    }
    return null;
  }

  // Watchlist management
  public addToWatchlist(symbol: string): void {
    this.watchlist.add(symbol.toUpperCase());
    this.saveWatchlist();
  }

  public removeFromWatchlist(symbol: string): void {
    this.watchlist.delete(symbol.toUpperCase());
    this.saveWatchlist();
  }

  public isInWatchlist(symbol: string): boolean {
    return this.watchlist.has(symbol.toUpperCase());
  }

  public getWatchlist(): string[] {
    return Array.from(this.watchlist);
  }

  public async getWatchlistTokens(): Promise<TokenSignal[]> {
    const watchlistSymbols = this.getWatchlist();
    if (watchlistSymbols.length === 0) return [];

    try {
      // Ensure we have fresh data by calling getTopSignals
      if (!this.cacheSignals || (Date.now() - this.cacheAtMs) > this.cacheTtlMs) {
        await this.getTopSignals('gainers', 100);
      }

      const source = this.cacheSignals || [];
      const tokens = source.filter(t => watchlistSymbols.includes(t.symbol));
    return tokens.sort((a, b) => Math.abs(b.hx_mom6) - Math.abs(a.hx_mom6));
    } catch (e) {
      console.error('Failed to load watchlist tokens:', e);
      return [];
    }
  }

  private saveWatchlist(): void {
    localStorage.setItem('signals-watchlist', JSON.stringify(Array.from(this.watchlist)));
  }

  // Track token view for analytics
  public async trackTokenView(symbol: string): Promise<void> {
    // In a real implementation, this would send analytics data
    console.log(`Token view tracked: ${symbol}`);
  }
}

// Export singleton instance
export const signalsAPI = SignalsAPI.getInstance();
