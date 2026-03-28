const PATTERNS = [
  // High severity: Fake urgency, hidden fees
  {
    category: "fake_urgency",
    severity: "high",
    score: 30,
    regex: /\b(only\s+\d+\s+left|hurry up|expires\s+in|offer\s+ends|limited\s+time|viewing\s+this)\b/i,
    description: "Fake Urgency: Creates artificial pressure to buy quickly."
  },
  {
    category: "hidden_fees",
    severity: "high",
    score: 30,
    regex: /\b(processing\s+fee|convenience\s+fee|handling\s+fee\s+applies)\b/i, // Basic check, real detection is harder
    description: "Hidden Fees: Extra costs added at checkout."
  },

  // Medium severity: Social proof, inflated MRP
  {
    category: "social_proof",
    severity: "medium",
    score: 15,
    regex: /\b(bestseller|trending|bought\s+in\s+last|people\s+bought|high\s+demand)\b/i,
    description: "Social Proof: Uses popularity claims to manipulate behavior."
  },
  {
    category: "fake_discount",
    severity: "medium",
    score: 15,
    regex: /\b(\d{2,3}%\s+off|save\s+₹?\d+)\b/i, // Very simplified, requires context
    description: "Potential Fake Discount: Exaggerated savings compared to actual market price."
  },

  // Low severity: Guilt-tripping, confusing language
  {
    category: "guilt_tripping",
    severity: "low",
    score: 5,
    regex: /\b(no\s+thanks,\s+i\s+don't|i'll\s+pay\s+full|i\s+don't\s+want\s+to\s+save)\b/i,
    description: "Confirmshaming: Guilt-tripping users into opting in."
  }
];

// In a real scenario, this would be exported for modularity if using ES modules
// but for a simple injected script, global scope is often used or wrapped in an IIFE.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PATTERNS;
} else {
  window.DARK_PATTERNS = PATTERNS;
}