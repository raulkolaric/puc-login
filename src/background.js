const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

// Load saved data when the popup opens
chrome.storage.local.get(["username", "password"], (data) => {
  if (data.username) usernameInput.value = data.username;
  if (data.password) passwordInput.value = data.password;
});

// Save on input
usernameInput.addEventListener("input", () => {
  chrome.storage.local.set({ username: usernameInput.value });
});

passwordInput.addEventListener("input", () => {
  chrome.storage.local.set({ password: passwordInput.value });
});
