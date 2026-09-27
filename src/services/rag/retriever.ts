import { KnowledgeChunk, RetrievedEvidence, SourceConflict } from '../../types';
import { FINANCIAL_CORPUS } from './corpus';

export class HybridRAGRetriever {
  private corpus: KnowledgeChunk[];
  private docLengths: number[];
  private avgDocLength: number;
  private termFrequencyTable: Map<string, Map<number, number>>; // term -> docIdx -> count
  private docFrequency: Map<string, number>; // term -> number of docs containing it

  constructor(customCorpus?: KnowledgeChunk[]) {
    this.corpus = customCorpus || FINANCIAL_CORPUS;
    this.termFrequencyTable = new Map();
    this.docFrequency = new Map();
    this.docLengths = [];
    this.buildBM25Index();
    this.avgDocLength =
      this.docLengths.reduce((a, b) => a + b, 0) / Math.max(1, this.docLengths.length);
  }

  private tokenize(text: string): string[] {
    const stopwords = new Set([
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'to', 'for',
      'of', 'with', 'as', 'by', 'that', 'this', 'it', 'from', 'be', 'are', 'was',
    ]);
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopwords.has(w));
  }

  private buildBM25Index(): void {
    this.corpus.forEach((doc, idx) => {
      const fullText = `${doc.title} ${doc.domain} ${doc.content} ${doc.keyTakeaway} ${doc.tags.join(' ')}`;
      const tokens = this.tokenize(fullText);
      this.docLengths[idx] = tokens.length;

      const seenInDoc = new Set<string>();
      for (const token of tokens) {
        if (!this.termFrequencyTable.has(token)) {
          this.termFrequencyTable.set(token, new Map());
        }
        const docMap = this.termFrequencyTable.get(token)!;
        docMap.set(idx, (docMap.get(idx) || 0) + 1);

        if (!seenInDoc.has(token)) {
          seenInDoc.add(token);
          this.docFrequency.set(token, (this.docFrequency.get(token) || 0) + 1);
        }
      }
    });
  }

  /**
   * BM25 lexical scoring
   */
  private scoreBM25(queryTokens: string[]): number[] {
    const N = this.corpus.length;
    const k1 = 1.5;
    const b = 0.75;
    const scores = new Array(N).fill(0);

    for (const token of queryTokens) {
      const df = this.docFrequency.get(token) || 0;
      if (df === 0) continue;

      // IDF
      const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);
      const docMap = this.termFrequencyTable.get(token);
      if (!docMap) continue;

      for (const [docIdx, tf] of docMap.entries()) {
        const docLen = this.docLengths[docIdx];
        const denom = tf + k1 * (1 - b + b * (docLen / this.avgDocLength));
        const score = idf * ((tf * (k1 + 1)) / denom);
        scores[docIdx] += score;
      }
    }

    return scores;
  }

  /**
   * Dense semantic vector retrieval simulation (tag & n-gram conceptual similarity)
   */
  private scoreDenseSemantic(query: string, queryTokens: string[]): number[] {
    const qLower = query.toLowerCase();
    const scores = new Array(this.corpus.length).fill(0);

    this.corpus.forEach((doc, idx) => {
      let sim = 0;
      // Tag matching has strong semantic weight
      for (const tag of doc.tags) {
        if (qLower.includes(tag.toLowerCase())) {
          sim += 1.8;
        }
      }

      // Title match
      const titleTokens = this.tokenize(doc.title);
      for (const qt of queryTokens) {
        if (titleTokens.includes(qt)) {
          sim += 1.2;
        }
      }

      // Domain match
      if (qLower.includes(doc.domain.toLowerCase().split('&')[0].trim())) {
        sim += 1.0;
      }

      scores[idx] = sim;
    });

    return scores;
  }

  /**
   * Cross-encoder reranking simulation:
   * Computes query-passage interaction score, sigmoid-scaled to [0.0, 1.0]
   */
  private rerankCrossEncoder(
    queryTokens: string[],
    chunk: KnowledgeChunk,
    rawCombinedScore: number
  ): number {
    const passageTokens = this.tokenize(`${chunk.title} ${chunk.content} ${chunk.keyTakeaway}`);
    let interactionCount = 0;

    for (const qt of queryTokens) {
      if (passageTokens.includes(qt)) {
        interactionCount += 1.5;
      }
      if (chunk.tags.some((t) => t.toLowerCase().includes(qt))) {
        interactionCount += 2.0;
      }
    }

    // Sigmoid mapping: 1 / (1 + exp(- (scaledInteraction - bias)))
    const logit = (interactionCount * 0.45 + rawCombinedScore * 0.5) - 2.0;
    const sigmoid = 1 / (1 + Math.exp(-logit));
    return parseFloat(sigmoid.toFixed(3));
  }

  /**
   * Hybrid retrieval combining BM25, Dense, RRF, and Cross-Encoder
   */
  public retrieve(query: string, topK: number = 3): {
    evidence: RetrievedEvidence[];
    conflict?: SourceConflict;
    isOutOfScope: boolean;
    outOfScopeReason?: string;
  } {
    const queryTokens = this.tokenize(query);

    // Fast non-financial heuristic filter
    if (this.isExplicitlyIrrelevant(query)) {
      return {
        evidence: [],
        isOutOfScope: true,
        outOfScopeReason:
          'This query is outside the scope of FinWise personal finance and investment education. We only answer queries on cash flow, budgeting, loans, credit, taxes, and financial planning.',
      };
    }

    if (queryTokens.length === 0) {
      return {
        evidence: [],
        isOutOfScope: true,
        outOfScopeReason: 'Please provide a clear financial question or inquiry.',
      };
    }

    const bm25Scores = this.scoreBM25(queryTokens);
    const denseScores = this.scoreDenseSemantic(query, queryTokens);

    // Rank documents for BM25
    const bm25Ranked = bm25Scores
      .map((score, idx) => ({ idx, score }))
      .sort((a, b) => b.score - a.score);

    // Rank documents for Dense
    const denseRanked = denseScores
      .map((score, idx) => ({ idx, score }))
      .sort((a, b) => b.score - a.score);

    // Build ranks map
    const bm25RankMap = new Map<number, number>();
    bm25Ranked.forEach((item, rank) => bm25RankMap.set(item.idx, rank + 1));

    const denseRankMap = new Map<number, number>();
    denseRanked.forEach((item, rank) => denseRankMap.set(item.idx, rank + 1));

    // Reciprocal Rank Fusion (RRF) with k = 60
    const candidates = this.corpus.map((chunk, idx) => {
      const rankBm25 = bm25RankMap.get(idx) || 999;
      const rankDense = denseRankMap.get(idx) || 999;
      const rrf = 1 / (60 + rankBm25) + 1 / (60 + rankDense);
      const bm25 = bm25Scores[idx];
      const dense = denseScores[idx];

      const rerank = this.rerankCrossEncoder(queryTokens, chunk, (bm25 > 0 ? 1 : 0) + dense);

      let confidenceLabel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      if (rerank >= 0.72) {
        confidenceLabel = 'HIGH';
      } else if (rerank >= 0.48) {
        confidenceLabel = 'MEDIUM';
      }

      return {
        chunk,
        bm25Score: parseFloat(bm25.toFixed(2)),
        denseScore: parseFloat(dense.toFixed(2)),
        rrfScore: parseFloat(rrf.toFixed(4)),
        rerankScore: rerank,
        confidenceLabel,
      } as RetrievedEvidence;
    });

    candidates.sort((a, b) => b.rerankScore - a.rerankScore);

    const topResults = candidates.slice(0, topK);
    const topScore = topResults[0]?.rerankScore || 0;

    // Out-of-scope gate: if top match is below confidence threshold (0.35)
    if (topScore < 0.35) {
      return {
        evidence: topResults.filter((e) => e.rerankScore >= 0.25),
        isOutOfScope: true,
        outOfScopeReason:
          'No sufficiently relevant financial corpus documents found. FinWise focuses strictly on verified personal budgeting, credit health, loans, tax regimes, and asset allocation.',
      };
    }

    // Check for source conflicts among top results
    const conflict = this.detectSourceConflict(topResults);

    return {
      evidence: topResults,
      conflict,
      isOutOfScope: false,
    };
  }

  /**
   * Source-conflict detector:
   * Flags when two retrieved passages represent contrasting financial doctrines
   */
  private detectSourceConflict(evidence: RetrievedEvidence[]): SourceConflict | undefined {
    if (evidence.length < 2) return undefined;

    const ids = evidence.map((e) => e.chunk.id);

    // Conflict 1: Debt Avalanche vs Debt Snowball
    if (ids.includes('kb-credit-01') && ids.includes('kb-inv-01')) {
      return {
        detected: true,
        topic: 'Debt Elimination vs Equity Investment',
        sourceA: {
          title: 'Debt Avalanche (Liability Liquidation)',
          viewpoint: 'Aggressively liquidating high-interest liabilities yields a guaranteed risk-free return equal to the interest rate (up to 42%).',
        },
        sourceB: {
          title: 'Passive Index Investing',
          viewpoint: 'Starting systematic equity investments early leverages compounding, but entails volatility and does not guarantee fixed returns.',
        },
        nuanceExplanation:
          'Conflict Resolution: Always eliminate high-interest debt (>10% APR like credit cards/personal loans) before investing. For low-rate loans (e.g. 8.5% home loans with tax deductions), concurrent SIP investing is justified.',
      };
    }

    // Conflict 2: New Tax Regime vs Old Tax Regime
    if (ids.includes('kb-tax-01') && ids.includes('kb-tax-04')) {
      return {
        detected: true,
        topic: 'Tax Regime Selection (80C Deductions vs Simplified Slabs)',
        sourceA: {
          title: 'Section 80C Deductions (Old Regime)',
          viewpoint: 'Encourages investing up to ₹1.5L in ELSS/PPF for direct deductions.',
        },
        sourceB: {
          title: 'New Tax Regime Framework (Section 115BAC)',
          viewpoint: 'Eliminates 80C deductions in exchange for lower baseline tax rates and ₹75k standard deduction.',
        },
        nuanceExplanation:
          'Conflict Resolution: If total eligible deductions (HRA + 80C + 80D + Home Loan Interest) exceed ₹3.75 Lakhs, Old Regime is advantageous; otherwise, New Regime minimizes tax without locking capital into 80C.',
      };
    }

    // Conflict 3: Term Insurance vs ULIP / Endowment
    if (ids.includes('kb-ins-01') && ids.includes('kb-tax-01')) {
      return {
        detected: true,
        topic: 'Insurance as Protection vs Tax-Saving Investment',
        sourceA: {
          title: 'Pure Term Insurance Principle (IRDAI)',
          viewpoint: 'Insurance and investments should strictly never be bundled; ULIPs incur high charges and deliver low 4-6% returns.',
        },
        sourceB: {
          title: 'Section 80C Deductions',
          viewpoint: 'Traditional life insurance premiums qualify for 80C deductions, prompting many to treat policies as investments.',
        },
        nuanceExplanation:
          'Conflict Resolution: Financial prudence dictates separating the two: purchase low-cost pure Term Life Cover for protection, and utilize ELSS or PPF for 80C tax optimization.',
      };
    }

    return undefined;
  }

  private isExplicitlyIrrelevant(query: string): boolean {
    const q = query.toLowerCase();
    const bannedPatterns = [
      'recipe', 'cook', 'bake', 'poem', 'write a poem', 'weather forecast',
      'cricket score', 'football', 'movie review', 'actor', 'celebrity gossip',
      'hack bank', 'card crack', 'fake pan card', 'money laundering', 'evade tax illegally',
      'python script for games', 'translate this to spanish',
    ];

    return bannedPatterns.some((pattern) => q.includes(pattern));
  }
}
