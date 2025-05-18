const raInput = document.getElementById("raInput");
const senhaInput = document.getElementById("senhaInput");
const autofillToggle = document.getElementById("autofillToggle");

// Load stored values and toggle state on popup open
chrome.storage.local.get(["RA", "SENHA", "autoFillEnabled"], (data) => {
  if (data.RA) raInput.value = data.RA;
  if (data.SENHA) senhaInput.value = data.SENHA;
  autofillToggle.checked = data.autoFillEnabled ?? true; // default true
});

// Save RA & SENHA on input
raInput.addEventListener("input", () => {
  chrome.storage.local.set({ RA: raInput.value });
});

senhaInput.addEventListener("input", () => {
  chrome.storage.local.set({ SENHA: senhaInput.value });
});

// Save toggle state when changed
autofillToggle.addEventListener("change", () => {
  chrome.storage.local.set({ autoFillEnabled: autofillToggle.checked });
});
