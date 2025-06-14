chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "copyText") {
    navigator.clipboard.writeText(message.text).then(() => {
      showNotification("Text erfolgreich kopiert", false);
    }).catch(() => {
      showNotification("Fehler beim Kopieren des Textes", true);
    });
  } else if (message.action === "copyImage") {
    performOCR(message.url);
  }
});

function performOCR(imageUrl) {
  chrome.storage.sync.get(['ocrLanguage'], (result) => {
    const lang = result.ocrLanguage || 'eng';
    showNotification("Text wird aus Bild extrahiert...", false);
    Tesseract.recognize(
      imageUrl,
      lang,
      { logger: m => console.log(m) }
    ).then(({ data: { text } }) => {
      navigator.clipboard.writeText(text).then(() => {
        showNotification("Text aus Bild kopiert", false);
      }).catch(() => {
        showNotification("Fehler beim Kopieren des Bildtextes", true);
      });
    }).catch(() => {
      showNotification("OCR fehlgeschlagen", true);
    });
  });
}

function showNotification(message, isError = false) {
  const notification = document.createElement("div");
  notification.className = `smartcopy-notification ${isError ? "error" : ""}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

let agentBox = null;
let agentBoxPinned = false;
let agentBoxTimeout = null;
let agentBoxTarget = null;

function showMouseAgent(message, mouseX, mouseY, targetEl) {
  removeMouseAgent();
  agentBox = document.createElement('div');
  agentBox.className = 'smartcopy-agent-box';
  agentBox.innerHTML = `
    <span class="agent-spinner"></span>
    <span class="material-icons-outlined agent-icon">content_copy</span>
    <span class="agent-text">${message}</span>
  `;
  agentBox.style.left = (mouseX + 16) + 'px';
  agentBox.style.top = (mouseY + 16) + 'px';
  document.body.appendChild(agentBox);
  agentBoxPinned = false;
  agentBoxTarget = targetEl;

  agentBox.addEventListener('mouseenter', () => {
    if (agentBoxTimeout) clearTimeout(agentBoxTimeout);
  });
  agentBox.addEventListener('mouseleave', () => {
    if (!agentBoxPinned) scheduleRemoveAgentBox();
  });
  agentBox.addEventListener('click', () => {
    agentBoxPinned = true;
    if (agentBoxTimeout) clearTimeout(agentBoxTimeout);
  });
}

function removeMouseAgent() {
  if (agentBox) {
    agentBox.remove();
    agentBox = null;
    agentBoxPinned = false;
    agentBoxTarget = null;
  }
}

function scheduleRemoveAgentBox() {
  if (agentBoxPinned) return;
  if (agentBoxTimeout) clearTimeout(agentBoxTimeout);
  agentBoxTimeout = setTimeout(() => {
    removeMouseAgent();
  }, 200);
}

document.addEventListener('mousemove', (e) => {
  if (agentBox && !agentBoxPinned) {
    // Prüfen, ob die Maus außerhalb der Box und des Code-Elements ist
    const isOverBox = agentBox.contains(e.target);
    const isOverTarget = agentBoxTarget && agentBoxTarget.contains(e.target);
    if (!isOverBox && !isOverTarget) {
      removeMouseAgent();
    }
  }
  lastMouseEvent = e;
});

// Nach 1,5 Sekunden Hover über Code-Elemente: markieren, kopieren, Animation anzeigen
let hoverTimer = null;
let lastHovered = null;
let lastMouseEvent = null;

function isCodeElement(el) {
  return (
    el.tagName === 'CODE' ||
    el.tagName === 'PRE' ||
    el.classList.contains('code-block')
  );
}

function selectElementText(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

document.addEventListener('mouseover', (e) => {
  const target = e.target;
  if (isCodeElement(target)) {
    if (lastHovered === target) return;
    lastHovered = target;
    hoverTimer = setTimeout(() => {
      if (lastMouseEvent) {
        selectElementText(target);
        const text = target.innerText || target.textContent;
        if (text && text.trim().length > 0) {
          navigator.clipboard.writeText(text).then(() => {
            showMouseAgent('Kopiert!', lastMouseEvent.clientX, lastMouseEvent.clientY, target);
          }).catch(() => {
            showMouseAgent('Fehler beim Kopieren', lastMouseEvent.clientX, lastMouseEvent.clientY, target);
          });
        }
        setTimeout(() => { window.getSelection().removeAllRanges(); }, 800);
      }
    }, 1500);
  }
});

document.addEventListener('mouseout', (e) => {
  if (hoverTimer) {
    clearTimeout(hoverTimer);
    hoverTimer = null;
    lastHovered = null;
    window.getSelection().removeAllRanges();
  }
});