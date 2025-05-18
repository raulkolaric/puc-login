// src/contentScript.js

function fillAndSubmitForm(data) {
  const usernameField = document.getElementById("User");
  const passwordField = document.getElementById("Pass");
  const loginButton = document.querySelector("input[type='submit'][value='Acessar']");

  // This check is now crucial AFTER we've found the elements
  if (!usernameField || !passwordField) {
    console.warn("PUC-SP Extension: Username or Password field not found even after waiting. Aborting fill.");
    return false; // Indicate failure
  }

  let fieldsFilled = false;

  usernameField.value = data.RA;
  fieldsFilled = true;
  usernameField.dispatchEvent(new Event('input', { bubbles: true }));
  usernameField.dispatchEvent(new Event('change', { bubbles: true }));
  usernameField.dispatchEvent(new Event('blur', { bubbles: true }));
  console.log("PUC-SP Extension: RA field populated.");

  passwordField.value = data.SENHA;
  fieldsFilled = true;
  passwordField.dispatchEvent(new Event('input', { bubbles: true }));
  passwordField.dispatchEvent(new Event('change', { bubbles: true }));
  passwordField.dispatchEvent(new Event('blur', { bubbles: true }));
  console.log("PUC-SP Extension: Senha field populated.");

  if (fieldsFilled && loginButton) {
    console.log("PUC-SP Extension: Attempting to click login button.");
    // Give a bit more time for Angular to process after fields are filled,
    // especially with animations on the page.
    setTimeout(() => {
      if (!loginButton.disabled) {
        loginButton.click();
      } else {
        console.warn("PUC-SP Extension: Login button is disabled, cannot auto-submit.");
      }
    }, 750); // Increased delay slightly
  } else if (fieldsFilled && !loginButton) {
    console.warn("PUC-SP Extension: Login button not found for auto-submit.");
  }
  return true; // Indicate success
}

function attemptAutoLogin() {
  chrome.storage.local.get(["RA", "SENHA", "autoFillEnabled"], (data) => {
    if (chrome.runtime.lastError) {
      console.error("PUC-SP Extension: Error retrieving data from storage:", chrome.runtime.lastError);
      return;
    }

    if (data.autoFillEnabled && data.RA && data.SENHA) {
      // Wait for elements to be available
      const maxAttempts = 20; // Try for 10 seconds (20 * 500ms)
      let attempts = 0;

      const intervalId = setInterval(() => {
        attempts++;
        const usernameField = document.getElementById("User");
        const passwordField = document.getElementById("Pass");

        if (usernameField && passwordField) {
          clearInterval(intervalId); // Stop polling
          console.log("PUC-SP Extension: Login fields found. Proceeding to fill.");
          fillAndSubmitForm(data);
        } else if (attempts >= maxAttempts) {
          clearInterval(intervalId); // Stop polling
          console.warn("PUC-SP Extension: Login fields not found after multiple attempts. Auto-login aborted.");
        } else {
          console.log(`PUC-SP Extension: Login fields not yet available. Attempt: ${attempts}`);
        }
      }, 500); // Check every 500 milliseconds

    } else {
      if (!data.autoFillEnabled) {
        console.log("PUC-SP Extension: Auto-login is disabled in settings.");
      }
      if (!data.RA || !data.SENHA) {
        console.log("PUC-SP Extension: RA or Senha not set in extension storage.");
      }
    }
  });
}

// Initial trigger
console.log("PUC-SP Extension: Content script loaded. Waiting for page elements if auto-login is enabled.");
// `document_idle` should mean the main HTML is parsed, but dynamic content might still be loading.
// The polling mechanism inside attemptAutoLogin will handle waiting for specific elements.
attemptAutoLogin();