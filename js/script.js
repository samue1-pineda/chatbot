// js/script.js

function elementExists(id) {
  return document.getElementById(id) !== null;
}

function initPage() {
  const checkLoginStatusFunc = window.checkLoginStatus;
  if (typeof checkLoginStatusFunc === "function") {
    checkLoginStatusFunc();
  }

  // REMOVED displayProducts calls from here.
  // They are now handled in index.html and productos.html specific scripts.

  // Registration form logic
  if (elementExists("registrationForm")) {
    const form = document.getElementById("registrationForm");
    const handleRegistrationFunc = window.handleRegistration;
    if (form && typeof handleRegistrationFunc === "function") {
      form.addEventListener("submit", handleRegistrationFunc);
    }
    const populateCountryCodesFunc = window.populateCountryCodes;
    if (typeof populateCountryCodesFunc === "function") {
      populateCountryCodesFunc("regCountryCode");
    }
    const nextStepButton = document.getElementById("nextStepButton");
    if (nextStepButton) {
      nextStepButton.addEventListener("click", () => {
        const username = document.getElementById("regUsername").value;
        const pass = document.getElementById("regPassword").value;
        const confirmPass = document.getElementById("regConfirmPassword").value;
        const messageElem = document.getElementById("registrationMessage");

        if (!username || !pass || !confirmPass) {
          messageElem.textContent = "Por favor, completa todos los campos.";
          messageElem.className = "form-message error";
          return;
        }
        if (pass !== confirmPass) {
          messageElem.textContent = "Las contraseñas no coinciden.";
          messageElem.className = "form-message error";
          return;
        }
        messageElem.textContent = "";
        document.getElementById("initialRegistrationStep").style.display = "none";
        document.getElementById("additionalInfoStep").style.display = "block";
      });
    }
  }

  // Login form logic
  if (elementExists("loginForm")) {
    const form = document.getElementById("loginForm");
    const handleLoginFunc = window.handleLogin;
    if (form && typeof handleLoginFunc === "function") {
      form.addEventListener("submit", handleLoginFunc);
    }
  }

  // Logout button
  const logoutButton = document.getElementById("logoutButton");
  const handleLogoutFunc = window.handleLogout;
  if (logoutButton && typeof handleLogoutFunc === "function") {
    logoutButton.addEventListener("click", handleLogoutFunc);
  }

  // Product search (Enter key)
  const searchInput = document.getElementById("searchInput"); // Corrected ID from your HTML
  const searchProductsFunc = window.searchProducts;
  if (searchInput && typeof searchProductsFunc === "function") { // Check if searchProducts exists
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        searchProductsFunc(); // Call the search function from products.js
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", initPage);