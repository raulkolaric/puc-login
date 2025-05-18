// Get references to all interactive elements
const raInput = document.getElementById("RA");
const senhaInput = document.getElementById("SENHA");
const autofillToggle = document.getElementById("autofillToggle");
const redirectPortalToggle = document.getElementById("redirectPortalToggle");
const redirectPucHomeToggle = document.getElementById("redirectPucHomeToggle");

// NEW: References for Acervo Login
const acervoLoginToggle = document.getElementById("acervoLoginToggle");
const senhaAcervoInput = document.getElementById("SENHA-ACERVO");

// Load stored values and toggle states on popup open
chrome.storage.local.get(
  [
    "RA",
    "SENHA",
    "autoFillEnabled",
    "redirectPortalEnabled",
    "redirectPucHomeEnabled",
    "SENHA_ACERVO", // NEW: Storage key for Acervo password
    "acervoLoginEnabled" // NEW: Storage key for Acervo toggle state
  ],
  (data) => {
    if (chrome.runtime.lastError) {
        console.error("Error retrieving from storage:", chrome.runtime.lastError);
        return;
    }

    if (raInput && data.RA) raInput.value = data.RA;
    if (senhaInput && data.SENHA) senhaInput.value = data.SENHA;

    if (autofillToggle) {
        autofillToggle.checked = data.autoFillEnabled !== undefined ? data.autoFillEnabled : true;
    }
    if (redirectPortalToggle) {
        redirectPortalToggle.checked = data.redirectPortalEnabled !== undefined ? data.redirectPortalEnabled : false;
    }
    if (redirectPucHomeToggle) {
        redirectPucHomeToggle.checked = data.redirectPucHomeEnabled !== undefined ? data.redirectPucHomeEnabled : false;
    }

    // NEW: Load Acervo values
    if (senhaAcervoInput && data.SENHA_ACERVO) {
        senhaAcervoInput.value = data.SENHA_ACERVO;
    }
    if (acervoLoginToggle) {
        acervoLoginToggle.checked = data.acervoLoginEnabled !== undefined ? data.acervoLoginEnabled : false; // Default to false
    }
  }
);

// Save RA & SENHA (main login) on input
if (raInput) {
    raInput.addEventListener("input", () => {
      chrome.storage.local.set({ RA: raInput.value });
    });
}

if (senhaInput) {
    senhaInput.addEventListener("input", () => {
      chrome.storage.local.set({ SENHA: senhaInput.value });
    });
}

// NEW: Save Acervo Password on input
if (senhaAcervoInput) {
    senhaAcervoInput.addEventListener("input", () => {
        chrome.storage.local.set({ SENHA_ACERVO: senhaAcervoInput.value });
    });
}

// Save toggle states when changed
if (autofillToggle) {
    autofillToggle.addEventListener("change", () => {
      chrome.storage.local.set({ autoFillEnabled: autofillToggle.checked });
    });
}

if (redirectPortalToggle) {
    redirectPortalToggle.addEventListener("change", () => {
      chrome.storage.local.set({ redirectPortalEnabled: redirectPortalToggle.checked });
    });
}

if (redirectPucHomeToggle) {
    redirectPucHomeToggle.addEventListener("change", () => {
      chrome.storage.local.set({ redirectPucHomeEnabled: redirectPucHomeToggle.checked });
    });
}

// NEW: Save Acervo toggle state when changed
if (acervoLoginToggle) {
    acervoLoginToggle.addEventListener("change", () => {
        chrome.storage.local.set({ acervoLoginEnabled: acervoLoginToggle.checked });
    });
}