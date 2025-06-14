document.addEventListener('DOMContentLoaded', () => {
  const languageSelect = document.getElementById('language');
  const pasteButton = document.getElementById('pasteButton');
  const customTextInput = document.getElementById('customText');
  const statusDiv = document.getElementById('status');

  // Lade gespeicherte OCR-Sprache
  chrome.storage.sync.get(['ocrLanguage'], (result) => {
    if (result.ocrLanguage) {
      languageSelect.value = result.ocrLanguage;
    }
  });

  // Speichere OCR-Sprache bei Änderung
  languageSelect.addEventListener('change', () => {
    chrome.storage.sync.set({ocrLanguage: languageSelect.value}, () => {
      showStatus('Sprache gespeichert', false);
    });
  });

  // Einfüge-Button Logik
  pasteButton.addEventListener('click', () => {
    if (customTextInput.value) {
      navigator.clipboard.writeText(customTextInput.value).then(() => {
        showStatus('Text in Zwischenablage kopiert', false);
        customTextInput.value = '';
      }).catch(() => {
        showStatus('Fehler beim Kopieren', true);
      });
    } else {
      navigator.clipboard.readText().then(text => {
        customTextInput.value = text;
        showStatus('Text aus Zwischenablage eingefügt', false);
      }).catch(() => {
        showStatus('Fehler beim Lesen der Zwischenablage', true);
      });
    }
  });

  function showStatus(message, isError) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${isError ? 'error' : ''}`;
    statusDiv.style.display = 'block';
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
});