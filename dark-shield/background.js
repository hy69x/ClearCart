// background.js

let pageStates = {};

// Keep track of score per tab
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateState" && sender.tab) {
    pageStates[sender.tab.id] = {
      score: request.score,
      patterns: request.patterns
    };
    
    // Update badge text and color based on score
    chrome.action.setBadgeText({ 
      text: request.score > 0 ? request.score.toString() : "",
      tabId: sender.tab.id 
    });
    
    let color = "#00FF00"; // Green
    if (request.score >= 50) color = "#FF0000"; // Red
    else if (request.score >= 20) color = "#FFA500"; // Orange
    
    chrome.action.setBadgeBackgroundColor({ 
      color: color,
      tabId: sender.tab.id 
    });
    
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === "getPageState") {
    // If popup asks for state, try to get from cache, otherwise query tab
    const tabId = request.tabId;
    if (pageStates[tabId]) {
      sendResponse(pageStates[tabId]);
    } else {
      sendResponse({ score: 0, patterns: [] });
    }
    return true;
  }

  if (request.action === "analyzeText") {
    // Optional Claude API Call placeholder
    analyzeWithClaude(request.text).then(sendResponse);
    return true; // Keep message channel open for async response
  }
});

// Clean up state when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  delete pageStates[tabId];
});

// Optional Claude integration
async function analyzeWithClaude(text) {
  // NOTE: In a real extension, DO NOT put your API key here.
  // It should be fetched from a secure backend or user settings.
  const API_KEY = "YOUR_CLAUDE_API_KEY"; // Placeholder
  
  if (API_KEY === "YOUR_CLAUDE_API_KEY") {
    return { isDarkPattern: false }; // Disabled by default
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true" // Required for client-side call
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022", // updated to a valid model
        max_tokens: 150,
        messages: [{
          role: "user",
          content: `Analyze this text from an Indian shopping website: "${text}". 
          Is it a dark pattern (fake urgency, fake discount, social proof manipulation, guilt-tripping)? 
          Reply ONLY with a JSON object: 
          {"isDarkPattern": boolean, "severity": "high"|"medium"|"low", "score": number, "description": "short reason"}`
        }]
      })
    });
    
    const data = await response.json();
    const resultText = data.content[0].text;
    const jsonResult = JSON.parse(resultText.substring(resultText.indexOf('{'), resultText.lastIndexOf('}') + 1));
    return jsonResult;
  } catch (error) {
    console.error("Claude API Error:", error);
    return { isDarkPattern: false };
  }
}