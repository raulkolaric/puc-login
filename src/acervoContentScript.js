// src/acervoContentScript.js
console.log("PUC-SP Acervo Script Loaded");

const ACERVO_SETTINGS = {
    raKey: "RA",
    acervoPasswordKey: "SENHA_ACERVO",
    acervoLoginEnabledKey: "acervoLoginEnabled"
};

// Helper function to wait for an element to appear
function waitForElement(selector, timeout = 15000, checkFrequency = 500) {
    console.log(`Waiting for element: ${selector}`);
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const intervalId = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(intervalId);
                console.log(`Element found: ${selector}`);
                resolve(element);
            } else if (Date.now() - startTime > timeout) {
                clearInterval(intervalId);
                console.error(`Element ${selector} not found within ${timeout}ms.`);
                reject(new Error(`Element ${selector} not found within ${timeout}ms.`));
            }
        }, checkFrequency);
    });
}

// Helper function to dispatch input events (useful for frameworks)
function dispatchInputEvents(element) {
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
}

async function performAcervoLogin() {
    try {
        const data = await new Promise((resolve, reject) => {
            chrome.storage.local.get([
                ACERVO_SETTINGS.raKey,
                ACERVO_SETTINGS.acervoPasswordKey,
                ACERVO_SETTINGS.acervoLoginEnabledKey
            ], (result) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                resolve(result);
            });
        });

        if (!data[ACERVO_SETTINGS.acervoLoginEnabledKey]) {
            console.log("Acervo auto-login is disabled.");
            return;
        }

        const ra = data[ACERVO_SETTINGS.raKey];
        const senhaAcervo = data[ACERVO_SETTINGS.acervoPasswordKey];

        if (!ra || !senhaAcervo) {
            console.log("RA or Acervo password not set.");
            return;
        }

        console.log("Acervo auto-login enabled. Starting process...");

        // 1. Find and click "Acesso restrito" button/span
        // Selector for the span: span.link.hover1.f500.azul[title="Clique para acessar o material com acesso restrito"]
        // More robust: find the div, then the span with the lock icon
        const acessoRestritoButton = await waitForElement('div.d-inline-block span.link.hover1.f500.azul[title="Clique para acessar o material com acesso restrito"]');
        // Alternative if title changes: 'div.d-inline-block span.link:has(svg[data-icon="lock"])'
        // Note: :has() has good support now but ensure target browsers are compatible or use a more verbose parent/child query.
        // For now, the title attribute is specific.
        if (acessoRestritoButton) {
            console.log("Clicking 'Acesso restrito' button...");
            acessoRestritoButton.click();
        } else {
            console.log("'Acesso restrito' button not found or user already clicked it. Checking for login form directly.");
        }


        // 2. Wait for and fill login form
        // Username input: input#username[name="username"]
        // Password input: input#password[name="password"]
        const usernameField = await waitForElement('input#username[name="username"]');
        const passwordField = await waitForElement('input#password[name="password"]'); // Should appear after username

        console.log("Populating login form...");
        usernameField.value = ra;
        dispatchInputEvents(usernameField);

        passwordField.value = senhaAcervo;
        dispatchInputEvents(passwordField);

        // 3. Click the "Acessar" (Login Submit) button
        // Selector: button.bkverde.branco[type="button"] containing "Acessar" and the specific SVG
        // Simpler approach: find a distinctive button within the form context after password field is found
        // Or a very specific class string if stable.
        // const loginSubmitButton = await waitForElement('button.bkverde.branco.b-none.sverde.hover.hpreto.pad5.rad5.t10.r10.f770.s13.btn.btn-secondary');
        // More reliable might be by looking for the button with the specific SVG icon
        const loginSubmitButton = await waitForElement('button.bkverde.branco.btn.btn-secondary:has(svg[data-icon="sign-in-alt"])');
        // If :has is an issue, iterate:
        // const buttons = document.querySelectorAll('button.bkverde.branco.btn.btn-secondary');
        // let loginSubmitButton;
        // for (const btn of buttons) {
        //   if (btn.textContent.trim().includes("Acessar") && btn.querySelector('svg[data-icon="sign-in-alt"]')) {
        //     loginSubmitButton = btn;
        //     break;
        //   }
        // }

        if (!loginSubmitButton) {
            console.error("Login form 'Acessar' button not found.");
            return;
        }
        console.log("Clicking login form 'Acessar' button...");
        loginSubmitButton.click();

        // 4. Wait for and click the Toastify popup link
        console.log("Waiting for Toastify popup link...");
        // The container div.Toastify__toast-container--top-center has pointer-events: none.
        // We need to observe it for added child nodes (the actual toasts).
        const toastContainer = await waitForElement('div.Toastify__toast-container--top-center', 20000); // Wait longer for toast

        await new Promise((resolve, reject) => {
            const observer = new MutationObserver((mutationsList, obs) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        for (const node of mutation.addedNodes) {
                            // Check if the added node is a toast message
                            if (node.matches && node.matches('.Toastify__toast')) {
                                console.log("Toast message appeared:", node);
                                // Now search for a clickable link or button INSIDE this toast
                                // This selector is a GUESS - you MUST inspect the actual toast content
                                const clickableLinkInToast = node.querySelector('.Toastify__close-button.Toastify__close-button--info');
                                if (clickableLinkInToast) {
                                    console.log("Found clickable element in toast:", clickableLinkInToast);
                                    // Make sure it's visible and interactable
                                    setTimeout(() => { // Small delay for it to be fully ready
                                      clickableLinkInToast.click();
                                      console.log("Clicked link/button in toast.");
                                      obs.disconnect(); // Stop observing
                                      resolve();
                                    }, 500);
                                    return;
                                } else {
                                    console.warn("Toast appeared, but no obvious clickable link/button found inside. Structure:", node.innerHTML);
                                }
                            }
                        }
                    }
                }
            });

            observer.observe(toastContainer, { childList: true, subtree: true });
            console.log("MutationObserver started for Toastify container.");

            // Timeout for the observer itself if no toast with a link appears
            setTimeout(() => {
                observer.disconnect();
                reject(new Error("Timeout waiting for a clickable toast message."));
                console.error("Timeout waiting for a clickable toast message.");
            }, 20000); // 20 seconds for toast to appear and have a link
        });

        console.log("Acervo restricted access process completed.");

    } catch (error) {
        console.error("Error during Acervo auto-login process:", error);
    }
}


// Only run if the relevant toggle is enabled
chrome.storage.local.get([ACERVO_SETTINGS.acervoLoginEnabledKey], (data) => {
    if (chrome.runtime.lastError) {
        console.error("Error checking Acervo settings:", chrome.runtime.lastError);
        return;
    }
    if (data[ACERVO_SETTINGS.acervoLoginEnabledKey]) {
        // Wait a bit for the page to settle, especially if there are initial animations or loads
        setTimeout(performAcervoLogin, 1500); // Adjust delay as needed
    } else {
        console.log("Acervo login automation is not enabled in settings.");
    }
});