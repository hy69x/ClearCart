// Access patterns injected before this script
const patterns = window.DARK_PATTERNS || [];
let currentScore = 0;
let detectedPatterns = [];

// Avoid processing the same node multiple times
const processedNodes = new WeakSet();

function processTextNode(node) {
  if (processedNodes.has(node)) return;
  processedNodes.add(node);

  const text = node.textContent.trim();
  if (!text || text.length < 5) return;

  // Don't process our own tooltips
  if (node.parentElement && node.parentElement.classList.contains('dark-shield-tooltip')) return;

  let matched = false;

  for (const pattern of patterns) {
    if (pattern.regex.test(text)) {
      matched = true;
      highlightElement(node.parentElement, pattern);
      
      // Update score and list
      currentScore = Math.min(100, currentScore + pattern.score);
      detectedPatterns.push({
        text: text,
        category: pattern.category,
        severity: pattern.severity,
        description: pattern.description
      });
      break; // Only match one pattern per node to avoid multiple highlights
    }
  }

  // Optionally send ambiguous text to background for Claude API classification
  if (!matched && text.length > 20 && text.length < 200 && Math.random() < 0.05) { // Sample a small percentage of long texts
    chrome.runtime.sendMessage({ action: "analyzeText", text: text }, (response) => {
      if (chrome.runtime.lastError) {
          // Ignore error, background might not be ready
      } else if (response && response.isDarkPattern) {
        highlightElement(node.parentElement, {
          severity: response.severity,
          description: `AI Detected: ${response.description}`
        });
        currentScore = Math.min(100, currentScore + response.score);
        detectedPatterns.push({
          text: text,
          category: "ai_detected",
          severity: response.severity,
          description: response.description
        });
        updateBadge();
      }
    });
  }
}

function highlightElement(element, pattern) {
  if (!element || element.tagName === 'BODY' || element.tagName === 'HTML' || element.tagName === 'SCRIPT' || element.tagName === 'STYLE') return;
  
  if (element.classList.contains(`dark-shield-highlight-${pattern.severity}`)) return; // Already highlighted
  
  element.classList.add(`dark-shield-highlight-${pattern.severity}`);
  
  // Create tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'dark-shield-tooltip';
  tooltip.textContent = pattern.description;
  element.appendChild(tooltip);
}

function scanDOM(rootNode) {
  const treeWalker = document.createTreeWalker(
    rootNode,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        // Skip script and style tags
        if (node.parentElement && (node.parentElement.tagName === 'SCRIPT' || node.parentElement.tagName === 'STYLE' || node.parentElement.tagName === 'NOSCRIPT')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const nodesToProcess = [];
  let currentNode = treeWalker.nextNode();
  while (currentNode) {
    nodesToProcess.push(currentNode);
    currentNode = treeWalker.nextNode();
  }

  nodesToProcess.forEach(processTextNode);
  updateBadge();
}

function updateBadge() {
  chrome.runtime.sendMessage({
    action: "updateState",
    score: currentScore,
    patterns: detectedPatterns
  }).catch(() => {}); // Catch error if popup is not open or bg is asleep
}

// Initial scan
scanDOM(document.body);

// Observe DOM mutations for dynamically loaded content
const observer = new MutationObserver((mutations) => {
  let shouldUpdate = false;
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        scanDOM(node);
        shouldUpdate = true;
      } else if (node.nodeType === Node.TEXT_NODE) {
        processTextNode(node);
        shouldUpdate = true;
      }
    });
  });
  if (shouldUpdate) updateBadge();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Listen for popup requests for current state
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getState") {
    sendResponse({
      score: currentScore,
      patterns: detectedPatterns
    });
  }
});