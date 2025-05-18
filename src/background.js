// The target login page URL
const LOGIN_PAGE_URL = "https://portal.fundasp.org.br/FrameHTML/web/app/edu/PortalEducacional/login/";

// Listen for when a navigation is committed in any tab
chrome.webNavigation.onCommitted.addListener((details) => {
  // Ensure this is the main frame (frameId === 0) and not an iframe.
  // Also, ensure we are not already on the login page to prevent redirect loops.
  if (details.frameId === 0 && !details.url.startsWith(LOGIN_PAGE_URL)) {
    chrome.storage.local.get(
      ["redirectPortalEnabled", "redirectPucHomeEnabled"],
      (data) => {
        if (chrome.runtime.lastError) {
          console.error("PUC-SP Extension: Error retrieving from storage:", chrome.runtime.lastError);
          return;
        }

        const currentUrl = new URL(details.url); // Use URL object for easier parsing
        const currentOriginAndPath = currentUrl.origin + currentUrl.pathname; // e.g., "https://portal.fundasp.org.br/"

        // 1. Handle redirect for portal.fundasp.org.br (including variants with query params)
        if (data.redirectPortalEnabled) {
          if (
            (currentOriginAndPath === "https://portal.fundasp.org.br/" ||
             currentOriginAndPath === "http://portal.fundasp.org.br/")
          ) {
            console.log(`PUC-SP Extension: Redirecting from ${details.url} to ${LOGIN_PAGE_URL} (Portal)`);
            chrome.tabs.update(details.tabId, { url: LOGIN_PAGE_URL }, () => {
              if (chrome.runtime.lastError) {
                console.error("PUC-SP Extension: Error updating tab for portal redirect:", chrome.runtime.lastError.message);
              }
            });
            return;
          }
        }

        // 2. Handle redirect for PUC SP home pages
        if (data.redirectPucHomeEnabled) {
          const normalizedUrlForPucHome = details.url.toLowerCase(); // Normalize for easier comparison

          if (
            normalizedUrlForPucHome.startsWith("https://www.pucsp.br/home") ||
            normalizedUrlForPucHome.startsWith("http://www.pucsp.br/home") ||
            normalizedUrlForPucHome.startsWith("https://www5.pucsp.br/paginainicial") // Check without trailing slash for flexibility
          ) {
            // For www.pucsp.br/home, ensure it's exactly /home or /home/
            if (normalizedUrlForPucHome.startsWith("https://www.pucsp.br/home") || normalizedUrlForPucHome.startsWith("http://www.pucsp.br/home")) {
              if (currentUrl.pathname !== "/home" && currentUrl.pathname !== "/home/") {
                return; // Not the exact /home or /home/ path, so don't redirect
              }
            }
            // For www5.pucsp.br/paginainicial, ensure it's exactly /paginainicial or /paginainicial/
            if (normalizedUrlForPucHome.startsWith("https://www5.pucsp.br/paginainicial")) {
               if (currentUrl.pathname !== "/paginainicial" && currentUrl.pathname !== "/paginainicial/") {
                return; // Not the exact /paginainicial or /paginainicial/ path, so don't redirect
               }
            }

            console.log(`PUC-SP Extension: Redirecting from ${details.url} to ${LOGIN_PAGE_URL} (PUC Home)`);
            chrome.tabs.update(details.tabId, { url: LOGIN_PAGE_URL }, () => {
              if (chrome.runtime.lastError) {
                console.error("PUC-SP Extension: Error updating tab for PUC Home redirect:", chrome.runtime.lastError.message);
              }
            });
            return; // Redirect initiated
          }
        }
      }
    );
  }
}, {
  // URL filters to make the listener more efficient.
  url: [
    { hostEquals: "portal.fundasp.org.br", pathEquals: "/" },
    { hostEquals: "www.pucsp.br", pathPrefix: "/home" }, // Catches www.pucsp.br/home...
    { hostEquals: "www5.pucsp.br", pathPrefix: "/paginainicial" } // <<<< ADDED THIS LINE
  ]
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("PUC-SP Login Helper installed.");
    chrome.storage.local.set({
        autoFillEnabled: true,
        redirectPortalEnabled: false,
        redirectPucHomeEnabled: false
    });
  } else if (details.reason === "update") {
    console.log("PUC-SP Login Helper updated to version " + chrome.runtime.getManifest().version);
  }
});