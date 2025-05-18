// Get references to all interactive elements
const raInput = document.getElementById("RA"); // Corrected ID from your HTML
const senhaInput = document.getElementById("SENHA"); // Corrected ID from your HTML
const autofillToggle = document.getElementById("autofillToggle");
const redirectPortalToggle = document.getElementById("redirectPortalToggle");
const redirectPucHomeToggle = document.getElementById("redirectPucHomeToggle");

// Load stored values and toggle states on popup open
chrome.storage.local.get(
  ["RA", "SENHA", "autoFillEnabled", "redirectPortalEnabled", "redirectPucHomeEnabled"],
  (data) => {
    if (raInput && data.RA) raInput.value = data.RA;
    if (senhaInput && data.SENHA) senhaInput.value = data.SENHA;

    if (autofillToggle) {
        autofillToggle.checked = data.autoFillEnabled !== undefined ? data.autoFillEnabled : true; // Default true
    }
    if (redirectPortalToggle) {
        redirectPortalToggle.checked = data.redirectPortalEnabled !== undefined ? data.redirectPortalEnabled : false; // Default false
    }
    if (redirectPucHomeToggle) {
        redirectPucHomeToggle.checked = data.redirectPucHomeEnabled !== undefined ? data.redirectPucHomeEnabled : false; // Default false
    }
  }
);

// Save RA & SENHA on input
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