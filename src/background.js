// The target login page URL
const LOGIN_PAGE_URL = "https://portal.fundasp.org.br/FrameHTML/web/app/edu/PortalEducacional/login/";

// Listen for when a navigation is committed in any tab
chrome.webNavigation.onCommitted.addListener((details) => {
  // Ensure this is the main frame (frameId === 0) and not an iframe.
  // Also, ensure we are not already on the login page to prevent redirect loops.
  if (details.frameId === 0 && details.url !== LOGIN_PAGE_URL) {
    chrome.storage.local.get(
      ["redirectPortalEnabled", "redirectPucHomeEnabled"],
      (data) => {
        if (chrome.runtime.lastError) {
          console.error("Error retrieving from storage:", chrome.runtime.lastError);
          return;
        }

        const currentUrl = details.url;

        // 1. Handle redirect for portal.fundasp.org.br
        if (data.redirectPortalEnabled) {
          // Redirect if the user is exactly on https://portal.fundasp.org.br/
          if (currentUrl === "https://portal.fundasp.org.br/" || currentUrl === "http://portal.fundasp.org.br/") {
            chrome.tabs.update(details.tabId, { url: LOGIN_PAGE_URL }, () => {
              if (chrome.runtime.lastError) {
                console.error("Error updating tab for portal redirect:", chrome.runtime.lastError.message);
              }
            });
            return; // Redirect initiated, no need to check other conditions for this event
          }
        }

        // 2. Handle redirect for www.pucsp.br/home (and variants like www.pucsp.br/home#)
        if (data.redirectPucHomeEnabled) {
          // details.url will give something like "https://www.pucsp.br/home"
          // The fragment (#) is client-side and might not be in details.url directly,
          // but this check covers the base path.
          if (currentUrl.startsWith("https://www.pucsp.br/home") || currentUrl.startsWith("http://www.pucsp.br/home")) {
            // Further check to ensure it's /home or /home/ and not /home-something-else
            const urlPath = new URL(currentUrl).pathname;
            if (urlPath === "/home" || urlPath === "/home/") {
              chrome.tabs.update(details.tabId, { url: LOGIN_PAGE_URL }, () => {
                if (chrome.runtime.lastError) {
                  console.error("Error updating tab for PUC Home redirect:", chrome.runtime.lastError.message);
                }
              });
            }
          }
        }
      }
    );
  }
}, {
  // URL filters to make the listener more efficient.
  // It will only trigger for navigations matching these patterns.
  url: [
    { urlEquals: "https://portal.fundasp.org.br/" },
    { urlEquals: "http://portal.fundasp.org.br/" },
    { hostEquals: "www.pucsp.br", pathPrefix: "/home" } // Catches /home and /home/
  ]
});

// Optional: Log when the extension is installed or updated for debugging
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("PUC-SP Login Helper installed.");
    // Initialize default settings here if needed, though your popup script handles defaults on load.
    chrome.storage.local.set({
        autoFillEnabled: true,
        redirectPortalEnabled: false,
        redirectPucHomeEnabled: false
    });
  } else if (details.reason === "update") {
    console.log("PUC-SP Login Helper updated.");
  }
});