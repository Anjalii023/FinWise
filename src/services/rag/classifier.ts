import { QueryClass } from '../../types';

export class QueryClassifier {
  public static classify(query: string): QueryClass {
    const q = query.trim().toLowerCase();

    // Check Out of Scope
    const outOfScopePatterns = [
      /\b(recipe|cook|baking|poem|poetry|song lyrics|weather|forecast|cricket|football|nba|movie review)\b/,
      /\b(hack|crack|bypass|fake pan|counterfeit|launder|evade tax illegally)\b/,
      /\b(who is the president|capital of france|write code for snake game)\b/,
    ];
    for (const pat of outOfScopePatterns) {
      if (pat.test(q)) return 'out_of_scope';
    }

    // What-If Simulation
    const whatIfPatterns = [
      /\bwhat if\b/,
      /\bsimulate\b/,
      /\bif i (cut|reduce|slash|decrease|lower|increase|boost)\b/,
      /\bhow much (would|will) i save if\b/,
      /\bprojected impact\b/,
      /\bnew emi of\b/,
    ];
    for (const pat of whatIfPatterns) {
      if (pat.test(q)) return 'what_if';
    }

    // Goal Planning
    const goalPatterns = [
      /\bcan i (afford|buy|purchase|reach|achieve)\b/,
      /\bgoal to (save|buy|reach)\b/,
      /\bin \d+ months?\b/,
      /\bhow (long|many months) (will it take|to save)\b/,
      /\btarget (of|amount)\b/,
      /\bplanning to buy\b/,
    ];
    for (const pat of goalPatterns) {
      if (pat.test(q)) return 'goal_planning';
    }

    // Financial Decision Assistant (Trade-offs)
    const decisionPatterns = [
      /\bshould i (pay off|prepay|invest|choose|keep|put)\b/,
      /\bor (should i|invest in|start sip|prepay loan)\b/,
      /\btrade[- ]?off\b/,
      /\bvs\.?\b/,
      /\bbetter to (pay|invest|save|keep)\b/,
      /\bliquid fund or fixed deposit\b/,
      /\bold regime or new regime\b/,
      /\bterm insurance or ulip\b/,
      /\bavalanche or snowball\b/,
    ];
    for (const pat of decisionPatterns) {
      if (pat.test(q)) return 'decision';
    }

    // User's Deterministic Analytics
    const analyticsPatterns = [
      /\bhow much (did i|have i) (spend|spent|earn|save)\b/,
      /\bmy (income|expense|expenses|savings|savings rate|cash flow)\b/,
      /\bwhat is my (savings rate|total spend|net income)\b/,
      /\bbreakdown of my\b/,
      /\bmy recurring (expenses|merchants|bills|subscriptions)\b/,
      /\bhow much on (dining|food|swiggy|zomato|amazon|rent|groceries|uber)\b/,
      /\bmy highest (spend|category|expense)\b/,
    ];
    for (const pat of analyticsPatterns) {
      if (pat.test(q)) return 'analytics';
    }

    // Default to Knowledge (RAG)
    return 'knowledge';
  }
}
