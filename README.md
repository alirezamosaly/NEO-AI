
# Neo AI

Neo AI is an intelligent coding assistant designed to streamline your development workflow. It leverages powerful AI (Google's Gemini via Genkit) to help you generate new code from descriptions, normalize existing code for better formatting and best practices, and correct code by identifying errors or suggesting improvements.

**IMPORTANT: This is a PRE-RELEASE PROTOTYPE intended for development and testing purposes only. The full app release is anticipated in approximately 2 months.**

## Core Features

*   **AI Code Generation:** Describe the code you need, and Neo AI will generate it for you.
*   **AI Code Normalization:** Clean up formatting and ensure adherence to common best practices for existing code snippets.
*   **AI Code Correction:** Analyze code for errors, bugs, or potential improvements, and apply fixes.

## How to Use Neo AI

Neo AI consists of a web application and a prototype Chrome Extension.

### 1. Neo AI Web Application

The main web application serves as a hub for demonstrating Neo AI's capabilities and managing user access (currently mock).

*   **Interactive Demos:** Visit the homepage to try out the AI code generation, normalization, and correction features in live demo areas. The on-page "Agent Action Box" system demonstrates how AI can interact with code blocks intelligently.
*   **User Dashboard (Prototype):** Register and log in (mock authentication) to access a user dashboard. The dashboard provides information and access instructions for the Chrome extension prototype.
*   **Legal Information:** The EULA, Imprint, Privacy Policy, and Terms of Service pages contain **placeholder content**. These **MUST** be replaced with professionally drafted legal documents before any public release.

### 2. Neo AI SmartCopy Chrome Extension (Prototype)

This browser extension (prototype) brings Neo AI's power directly into your browsing experience. It allows you to interact with code snippets on any webpage.

*   **Creating Icon Files (Required):**
    Before loading the extension, you need to create SVG icon files.
    1.  Ensure the directory `public/extensions/smartcopy-chrome/images/` exists.
    2.  Create three files in this directory: `icon16.svg`, `icon48.svg`, `icon128.svg`.
    3.  Copy the SVG code (provided in previous steps or design your own) into the respective files. For example:
        ```xml
        <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="128" height="128" rx="24" fill="#1A0F2A"/>
          <path d="M40.5 92V36H50.86L68.62 62.64L69.1 63.52V36H77.5V92H67.14L49.38 65.36L48.9 64.48V92H40.5Z" fill="#9353FF"/>
        </svg>
        ```
        *Note: Adjust the `width` and `height` attributes in the SVG for `icon16.svg` and `icon48.svg` if you want to create specifically sized SVGs, or let Chrome scale the 128x128 version.*

*   **Loading the Extension:**
    1.  Open Google Chrome.
    2.  Navigate to `chrome://extensions`.
    3.  Enable "Developer mode" (usually a toggle in the top right).
    4.  Click "Load unpacked".
    5.  Select the `public/extensions/smartcopy-chrome/` directory from this project.
    6.  The Neo AI icon should appear in your Chrome toolbar.

*   **Using the Extension Popup:**
    1.  Click the Neo AI icon in your Chrome toolbar to open the popup.
    2.  **Get Code:** Select some text/code on a webpage, then click "Get Page Selection" in the popup. The selected text will appear in the "Current Text for AI" area.
    3.  **Perform AI Actions:**
        *   **Generate Code:** Type a description in the "Your Prompt / Code Input" area and click "Generate Code". The result will appear in "Current Text for AI".
        *   **Normalize Current Text:** Uses the text in "Current Text for AI" for normalization.
        *   **Correct Current Text:** Uses the text in "Current Text for AI" for correction.
    4.  **Use the Result:**
        *   **Copy Current Text to Clipboard:** Copies the content of "Current Text for AI" to your system clipboard.
        *   **Replace Page Selection with Current Text:** Replaces the currently selected text on the active webpage with the content from "Current Text for AI".
    5.  **Debug:** A "Debug: Open Console" button is available in the popup to help inspect its behavior.

*   **Important Notes for Extension:**
    *   The extension communicates with the Neo AI web application's backend API. Ensure the Next.js application is running.
    *   The `API_BASE_URL` in `public/extensions/smartcopy-chrome/popup.js` MUST be correctly set.
        *   For local development with the Next.js app on port 9002: `const API_BASE_URL = 'http://localhost:9002';`
        *   If your app is deployed: `const API_BASE_URL = 'https://your-neo-ai-app-domain.com';`
    *   The `host_permissions` in `public/extensions/smartcopy-chrome/manifest.json` MUST include your API domain (e.g., `"http://localhost:9002/*"` or `"https://your-neo-ai-app-domain.com/*"`).

## Developer Guide: Building out the Chrome Extension

This guide outlines how the Chrome Extension (`public/extensions/smartcopy-chrome/`) is structured and how a developer can continue to build it to achieve functionality similar to the on-page "AI Agent Box" system found in the main web application.

The goal is to have the extension popup act as a control panel for AI operations on text selected from or to be inserted into the current webpage.

### 1. Core Architecture

*   **`manifest.json` (The Blueprint):**
    *   Defines the extension's properties, permissions, and components.
    *   **Key Permissions:**
        *   `"activeTab"`: Allows the extension to interact with the currently active tab (e.g., to run content scripts).
        *   `"scripting"`: Enables programmatic injection of content scripts and execution of scripts in the page context. Essential for getting selected text and replacing content.
        *   `"clipboardWrite"`: Allows the extension to write text to the user's clipboard (for the "Copy Current Text" feature).
        *   `"debugger"`: Allows the "Debug: Open Console" button to programmatically open the DevTools for the popup.
        *   `"host_permissions"`: **Crucial for API calls.** Must include the URL(s) of your Neo AI backend API (e.g., `"http://localhost:9002/*"` for local development, `"https://your-deployed-app.com/*"` for production). Without this, `fetch` requests from `popup.js` to your API will fail.
    *   **Action (Popup):**
        *   `"default_popup": "popup.html"` specifies the HTML file for the extension's main UI when the toolbar icon is clicked.
    *   **Icons:** Specifies paths to `icon16.svg`, `icon48.svg`, `icon128.svg` in the `images/` directory.
    *   **Content Scripts (Conceptual for Advanced Interaction):** While the current popup primarily uses `chrome.scripting.executeScript` for targeted interactions, `content_scripts` declared in the manifest could be used for more persistent page listeners or UI modifications if needed in the future. The current `content.js` is primarily a message listener.
    *   **Background Script (`background.js`):**
        *   Can handle persistent tasks, manage complex state across the extension, or orchestrate communication if the popup isn't always open.
        *   Currently, it's minimal, mainly listening for messages and could be expanded. For the current scope, `popup.js` handles most direct API calls and communication.

*   **`popup.html` (The User Interface):**
    *   Provides the visual elements for the user to interact with.
    *   Key elements include:
        *   Textarea for "Your Prompt / Code Input" (for generation prompts).
        *   Textarea for "Current Text for AI" (displays fetched/processed text, acts as input for Normalize/Correct).
        *   Buttons for actions: "Get Page Selection", "Generate Code", "Normalize Current Text", "Correct Current Text".
        *   Buttons for output: "Copy Current Text to Clipboard", "Replace Page Selection with Current Text".
        *   A "Debug: Open Console" button.
    *   Links to `styles.css` for styling and `popup.js` for logic.

*   **`popup.js` (The Brain of the Popup):**
    *   **State Management:**
        *   It maintains the `currentTextForAI` (the text currently being worked on or the last AI result).
        *   It updates the content of the "Current Text for AI" textarea in `popup.html`.
    *   **Event Listeners:** Attaches listeners to all buttons in `popup.html`.
    *   **API Interaction (`performAiAction` function):**
        *   Constructs the request body (`AiCodeActionInput`) based on the selected action and input text.
        *   Uses `fetch` to send requests to the `API_BASE_URL + '/api/smartcopy'`.
        *   Handles the JSON response and updates `currentTextForAI` or shows errors.
        *   **`API_BASE_URL` Configuration:** This constant *must* be correctly set to your backend's URL.
    *   **Content Script Communication (`sendMessageToContentScript` and message listener):**
        *   **Getting Text:** When "Get Page Selection" is clicked, it sends a `{ type: "GET_SELECTED_TEXT" }` message to `content.js`.
        *   **Replacing Text:** When "Replace Page Selection..." is clicked, it sends a `{ type: "REPLACE_SELECTED_TEXT", text: currentTextForAI }` message to `content.js`.
        *   **Receiving Text:** It listens for `SELECTED_TEXT_RESULT` messages from `content.js` to update `currentTextForAI`.
    *   **Clipboard Interaction:** Uses `navigator.clipboard.writeText()` for the "Copy Current Text" button.
    *   **Debugging:** The "Debug: Open Console" button uses `chrome.tabs.create({ url: 'chrome://inspect/#extensions' });` and then guides the user, or more directly, if the `debugger` permission is available, can try to open the specific extension's DevTools (though this can be finicky and often just opening `chrome://extensions` and clicking "Inspect popup" is more reliable for the popup itself). The current implementation of the debug button will attempt to open the extension's devtools via `chrome.developerPrivate.openDevTools` if the permission were granted (which it isn't by default for security, and `debugger` permission is used instead for `chrome.debugger.attach` which is more complex). A simpler approach, which is implemented, is to log to the popup's own console and provide a button that helps the user find the inspect view.

*   **`content.js` (The Page Interactor):**
    *   Runs in the context of the active webpage.
    *   **Message Listener (`chrome.runtime.onMessage.addListener`):**
        *   Listens for messages from `popup.js`.
        *   **Handles `GET_SELECTED_TEXT`:**
            *   Uses `window.getSelection().toString()` to get the selected text.
            *   Sends the selected text back to `popup.js` using `sendResponse()`.
        *   **Handles `REPLACE_SELECTED_TEXT`:**
            *   This is the most complex part of page interaction. The current implementation tries to replace the selection by:
                1.  Focusing the active element.
                2.  Checking if it's an input/textarea; if so, it manipulates `value` and `selectionStart/End`.
                3.  If not, it tries to use `document.execCommand('insertText', false, newText)`. This command is somewhat legacy and might not work reliably on all modern sites or complex editors.
                *   **Further Development:** More robust page content replacement might involve directly manipulating the DOM around the selection, which requires careful handling of different element types and content editable regions.
    *   **Important Note:** Content scripts operate in an isolated world. Direct function calls between popup and content script are not possible; they must communicate via messages.

*   **`styles.css`:** Contains basic CSS to make the popup usable.

### 2. Replicating "AI Agent Box" Functionality

The on-page `AgentActionBox` appears on hover and has an internal "clipboard" linked to that hover. The Chrome Extension popup achieves similar goals through more explicit user actions:

| On-Page Feature             | Chrome Extension Popup Equivalent                                  | Implementation Notes (popup.js, content.js)                                                                      |
| :-------------------------- | :----------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| Hover block -> auto-copy    | Click "Get Page Selection" button                                  | `popup.js` sends "GET_SELECTED_TEXT" to `content.js`. `content.js` replies. `popup.js` updates its internal state. |
| AgentActionBox appears      | Popup UI is always available when opened                           | UI defined in `popup.html`, logic in `popup.js`.                                                                 |
| AI: Generate                | Type prompt, click "Generate Code"                                 | `popup.js` calls API with `{ action: "generate", generationPrompt: ... }`. Result updates popup's "Current Text". |
| AI: Normalize / Correct     | Click "Normalize/Correct Current Text" (after getting/generating)  | `popup.js` calls API with `{ action: "normalize/correct", text: currentTextInPopup }`. Result updates popup.   |
| Clipboard: Replace          | Click "Replace Page Selection with Current Text"                   | `popup.js` sends "REPLACE_SELECTED_TEXT" with `currentTextInPopup` to `content.js`. `content.js` attempts replacement. |
| Clipboard: Copy Again       | Click "Copy Current Text to Clipboard"                             | `popup.js` uses `navigator.clipboard.writeText(currentTextInPopup)`.                                              |
| Update code block content   | Text in "Current Text for AI" updates; "Replace Page Selection..." | AI results update the popup's internal state and textarea. Page update is explicit.                          |
| Visual Feedback             | UI updates in popup (textareas, status messages)                   | Managed by `popup.js`.                                                                                           |

### 3. Development Steps & Considerations

1.  **Set `API_BASE_URL` in `popup.js`:** This is critical. Point it to your local or deployed Neo AI backend. For local development, it's likely `http://localhost:9002`.
2.  **Configure `host_permissions` in `manifest.json`:** Allow `popup.js` to `fetch` from your API domain (e.g., `http://localhost:9002/*`).
3.  **Load as Unpacked Extension:** Follow the "Loading the Extension" steps above.
4.  **Iterative Development & Debugging:**
    *   **Popup Console:** Right-click the extension icon, choose "Inspect popup", or use the "Debug: Open Console" button in the popup. Check for errors in `popup.js`.
    *   **Content Script Console:** Open DevTools for the webpage you're testing on (F12 or Ctrl/Cmd+Shift+I). Errors from `content.js` will appear here. You can also select `content.js` from the "Sources" tab under the extension's context.
    *   **Background Script Console:** Go to `chrome://extensions`, find Neo AI, and click the "service worker" (or "background page") link to open its console.
    *   Use `console.log` extensively in all scripts during development.
5.  **Refining Page Interaction (`content.js`):**
    *   The `REPLACE_SELECTED_TEXT` logic in `content.js` is basic. For a production-quality extension, this needs to be much more robust to handle various scenarios:
        *   Replacing selections in simple text inputs.
        *   Replacing selections in `textarea` elements.
        *   Replacing selections in `contenteditable` divs (like rich text editors).
        *   Handling cases where there's no active editable selection.
    *   This might involve more complex DOM manipulation or using libraries designed for rich text interaction if you target complex web editors.
6.  **Error Handling and User Feedback:**
    *   Improve error messages in the popup (e.g., if API call fails, if page selection fails).
    *   Provide visual cues for loading states (e.g., a spinner while AI is processing).
7.  **Styling:** Enhance `styles.css` for a more polished look and feel.
8.  **Advanced Features (Future):**
    *   **Persistent State:** Use `chrome.storage.local` or `chrome.storage.sync` if you need to store user preferences or history across popup sessions.
    *   **Context Menus:** Add right-click context menu items on selected text to trigger AI actions directly.
    *   **More sophisticated `background.js` usage:** If the extension needs to perform actions when the popup is closed or listen for global browser events.

This guide should provide a solid foundation for any developer looking to understand and extend the Neo AI Chrome Extension prototype.

## Technology Stack

*   **Frontend:** Next.js, React, TypeScript
*   **Styling:** Tailwind CSS, ShadCN UI components
*   **AI Backend:** Genkit (using Google Gemini models)
*   **Extension:** Standard Web Technologies (HTML, CSS, JavaScript) for the Chrome Extension.

## Getting Started (Development)

1.  **Prerequisites:**
    *   Node.js (v20 or newer recommended)
    *   npm or yarn

2.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd neo-ai
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

4.  **Environment Variables:**
    *   Create a `.env` file in the root of the project. Genkit, by default, will use Application Default Credentials if a `GOOGLE_API_KEY` is not explicitly set. For Google AI (Gemini) specific API keys, you might set `GOOGLE_API_KEY=your_api_key_here` in the `.env` file if not using ADC.

5.  **Run the development server for the web application:**
    ```bash
    npm run dev
    ```
    This will start the Next.js application, typically on [http://localhost:9002](http://localhost:9002).

6.  **Prepare and Load the Chrome Extension:**
    *   Create the SVG icon files as described in the "Neo AI SmartCopy Chrome Extension (Prototype)" section above.
    *   Ensure `API_BASE_URL` in `public/extensions/smartcopy-chrome/popup.js` (e.g., `http://localhost:9002`) and `host_permissions` in `public/extensions/smartcopy-chrome/manifest.json` (e.g., `http://localhost:9002/*`) are correctly set for your API endpoint.
    *   Follow the steps for loading the unpacked extension.

---

This README provides an overview of Neo AI in its current prototype stage.
