# DarkShield

DarkShield is a Chrome Extension designed to detect and expose dark patterns on major e-commerce websites in real time. Built for hackathons, this extension actively monitors page content and warns users about manipulative user interface tricks designed to pressure them into purchases.

## Features

- **Real-Time DOM Scanning:** Utilizes `MutationObserver` to evaluate text nodes dynamically as they are loaded into the page.
- **Pattern Categorization:** Detects various classes of dark patterns:
  - High Severity: Fake urgency (e.g., countdown timers, stock warnings) and hidden checkout fees.
  - Medium Severity: Social proof manipulation (e.g., viewing/purchasing metrics) and exaggerated fake discounts.
  - Low Severity: Guilt-tripping dialogs and confirmshaming text.
- **Visual Highlighting:** Injects customized CSS outlines (Red, Orange, Yellow) corresponding to the severity of the detected pattern.
- **Contextual Tooltips:** Provides immediate explanations to the user when hovering over highlighted text.
- **Manipulation Scoring System:** Calculates a cumulative manipulation score (0-100) per tab, visually represented in the extension popup and toolbar badge.
- **AI Classification (Optional):** Includes a framework to analyze ambiguous text via the Claude API.

## Repository Structure

- `dark-shield/manifest.json`: Manifest V3 configuration outlining required permissions and script injection points.
- `dark-shield/patterns.js`: The central configuration file holding the regular expressions, categories, severities, and scores for each dark pattern.
- `dark-shield/content.js`: The content script responsible for parsing the DOM, injecting highlights, and monitoring mutations.
- `dark-shield/background.js`: The background service worker managing state across tabs and handling API communication.
- `dark-shield/styles.css`: Stylesheet injected into the target pages to render highlights and tooltips.
- `dark-shield/popup.html` & `dark-shield/popup.js`: The user interface for the toolbar extension popup.
- `test.js`: A Node.js automated test script for verifying the accuracy of the regular expressions defined in `patterns.js`.
- `test.html`: A mock e-commerce page containing simulated dark patterns for manual browser testing.

## Installation for Testing

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable "Developer mode" via the toggle switch in the upper right corner.
3. Click the "Load unpacked" button.
4. Select the `dark-shield` directory from this repository.
5. The DarkShield icon will appear in your Chrome toolbar.

## Verification Process

### 1. Automated Testing
To verify the pattern detection logic, ensure you have Node.js installed, then run:

```bash
node test.js
```
This script will execute against `patterns.js` to confirm that manipulative text is accurately flagged and normal text is ignored.

### 2. Manual Testing
1. Load the extension in Chrome following the instructions above.
2. Open the included `test.html` file in Chrome.
3. Observe the highlighted text on the mock product page.
4. Hover over the highlighted elements to read the tooltips.
5. Click the DarkShield extension icon in the toolbar to view the calculated Manipulation Score and the complete list of detected patterns.

## Technical Details

- **Environment:** Google Chrome (Manifest V3)
- **Permissions Required:** `activeTab`, `storage`, `scripting`
- **Host Permissions:** Restricted to specific e-commerce domains (e.g., Amazon, Flipkart) but easily expandable in `manifest.json`.