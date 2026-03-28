const assert = require('assert');
const PATTERNS = require('./dark-shield/patterns.js');

function testPattern(text, categoryExpected, shouldMatch) {
  let matched = false;
  let categoryMatched = null;

  for (const pattern of PATTERNS) {
    if (pattern.regex.test(text)) {
      matched = true;
      categoryMatched = pattern.category;
      break;
    }
  }

  if (shouldMatch) {
    assert.strictEqual(matched, true, `Expected "${text}" to match a pattern.`);
    if (categoryExpected) {
      assert.strictEqual(categoryMatched, categoryExpected, `Expected "${text}" to match category ${categoryExpected}, but got ${categoryMatched}`);
    }
  } else {
    assert.strictEqual(matched, false, `Expected "${text}" to NOT match any pattern. Matched: ${categoryMatched}`);
  }
}

console.log("Running DarkShield Pattern Tests...\n");

try {
  // --- Fake Urgency Tests ---
  testPattern("Hurry up, only 2 left in stock!", "fake_urgency", true);
  testPattern("Offer expires in 10 minutes", "fake_urgency", true);
  testPattern("45 people are viewing this item right now", "fake_urgency", true);
  testPattern("This is a limited time offer", "fake_urgency", true);
  
  // --- Hidden Fees Tests ---
  testPattern("A small convenience fee applies", "hidden_fees", true);
  testPattern("Total includes processing fee", "hidden_fees", true);
  
  // --- Social Proof Tests ---
  testPattern("This is a bestseller product", "social_proof", true);
  testPattern("Over 1000 people bought in last week", "social_proof", true);
  testPattern("Trending item in your area", "social_proof", true);
  
  // --- Fake Discount Tests ---
  testPattern("Get 55% off today!", "fake_discount", true);
  testPattern("Save ₹500 on your purchase", "fake_discount", true);
  
  // --- Guilt Tripping Tests ---
  testPattern("No thanks, I don't want to save money", "guilt_tripping", true);
  testPattern("I'll pay full price instead", "guilt_tripping", true);

  // --- False Positives (Normal Text) ---
  testPattern("This item is a great choice.", null, false);
  testPattern("Free shipping on all orders.", null, false);
  testPattern("Please review your order before checkout.", null, false);
  testPattern("Your cart has 2 items.", null, false);

  console.log("✅ All pattern tests passed successfully!");
} catch (error) {
  console.error("❌ Test failed:");
  console.error(error.message);
  process.exit(1);
}
