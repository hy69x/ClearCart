document.addEventListener('DOMContentLoaded', async () => {
  const scoreValueEl = document.getElementById('scoreValue');
  const patternListEl = document.getElementById('patternList');
  const noPatternsEl = document.getElementById('noPatterns');

  // Get active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab) return;

  // Ask background script for current state of this tab
  chrome.runtime.sendMessage({ action: "getPageState", tabId: tab.id }, (response) => {
    if (chrome.runtime.lastError || !response) {
      // Background script might not have info or it's a restricted page
      renderState({ score: 0, patterns: [] });
      
      // Try asking content script directly just in case
      chrome.tabs.sendMessage(tab.id, { action: "getState" }, (contentResponse) => {
        if (!chrome.runtime.lastError && contentResponse) {
          renderState(contentResponse);
        }
      });
    } else {
      renderState(response);
    }
  });

  function renderState(state) {
    const score = state.score || 0;
    const patterns = state.patterns || [];

    // Update Score
    scoreValueEl.textContent = score;
    scoreValueEl.className = 'score-value'; // reset
    if (score >= 50) scoreValueEl.classList.add('score-high');
    else if (score >= 20) scoreValueEl.classList.add('score-medium');
    else scoreValueEl.classList.add('score-low');

    // Update List
    patternListEl.innerHTML = '';
    
    if (patterns.length === 0) {
      patternListEl.style.display = 'none';
      noPatternsEl.style.display = 'block';
    } else {
      patternListEl.style.display = 'block';
      noPatternsEl.style.display = 'none';

      // Deduplicate patterns for display
      const uniqueTexts = new Set();
      const uniquePatterns = patterns.filter(p => {
        if (uniqueTexts.has(p.text)) return false;
        uniqueTexts.add(p.text);
        return true;
      });

      uniquePatterns.forEach(pattern => {
        const li = document.createElement('li');
        li.className = `pattern-item severity-${pattern.severity}`;
        
        const desc = document.createElement('div');
        desc.className = 'pattern-desc';
        desc.textContent = pattern.description;
        
        const text = document.createElement('div');
        text.className = 'pattern-text';
        text.textContent = `"${pattern.text}"`;
        
        li.appendChild(desc);
        li.appendChild(text);
        patternListEl.appendChild(li);
      });
    }
  }
});