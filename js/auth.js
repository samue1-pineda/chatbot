// js/auth.js

const USERS_JSON_FILENAME = 'users.json';
let currentUsersData = [];
// let allProductsData = window.allProductsData || []; // Para detalles del carrito, se carga en products.js

async function loadUsersFromJSON() {
    try {
        const response = await fetch(USERS_JSON_FILENAME);
        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`${USERS_JSON_FILENAME} no encontrado. Se iniciará con una lista de usuarios vacía.`);
                currentUsersData = [];
                return;
            }
            throw new Error(`Error HTTP al cargar ${USERS_JSON_FILENAME}: ${response.status}`);
        }
        const users = await response.json();
        currentUsersData = users.map(user => ({
            ...user,
            cart: user.cart || []
        }));
        console.log("Usuarios cargados desde JSON (con carritos asegurados):", currentUsersData); // Citado de la imagen: "Usuarios cargados desde JSON (con carritos asegurados): [] auth.js:27"
    } catch (error) {
        console.error(`Error al cargar o parsear ${USERS_JSON_FILENAME}:`, error);
        currentUsersData = [];
    }
}

function saveUsersToJSON() {
    try {
        const jsonData = JSON.stringify(currentUsersData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = USERS_JSON_FILENAME;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert(`Por favor, guarda el archivo "${USERS_JSON_FILENAME}" y reemplaza el existente en el servidor/proyecto para persistir los cambios de usuario.`);
        console.log("Datos de usuario preparados para descarga:", currentUsersData);
    } catch (error) {
        console.error("Error al generar el archivo JSON para descarga:", error);
        alert("Error al intentar guardar los datos de usuario.");
    }
}

function generateUserId() {
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

// ***** FUNCIÓN handleRegistration CORREGIDA *****
async function handleRegistration(event) {
    event.preventDefault();
    const messageElem = document.getElementById('registrationMessage');
    if (!messageElem) {
        console.error("Elemento registrationMessage no encontrado");
        return;
    }
    messageElem.textContent = '';
    messageElem.className = 'form-message';


    // Obtener valores de los campos del formulario
    const usernameInput = document.getElementById('regUsername');
    const passwordInput = document.getElementById('regPassword');
    const emailInput = document.getElementById('regEmail');
    const countryCodeInput = document.getElementById('regCountryCode');
    const phoneNumberInput = document.getElementById('regPhoneNumber');

    if (!usernameInput || !passwordInput || !emailInput || !countryCodeInput || !phoneNumberInput) {
        messageElem.textContent = 'Error interno: Faltan campos del formulario en el DOM.';
        messageElem.className = 'form-message error';
        console.error("Uno o más campos del formulario de registro no fueron encontrados.");
        return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const email = emailInput.value.trim();
    const countryCode = countryCodeInput.value;
    const phoneNumber = phoneNumberInput.value.trim();

    // Validaciones básicas
    if (!username || !password) {
        messageElem.textContent = 'Nombre de usuario y contraseña son requeridos.';
        messageElem.className = 'form-message error';
        return;
    }

    // Asegurar que los usuarios estén cargados (aunque ya debería estarlo por DOMContentLoaded)
    // Esta es una doble verificación.
    if (currentUsersData.length === 0 && USERS_JSON_FILENAME) {
        // Podríamos intentar cargar aquí si es absolutamente necesario,
        // pero confiamos en la carga inicial de DOMContentLoaded.
        // Si no hay usuarios, y el archivo existe, es una situación que loadUsersFromJSON ya maneja.
        // Si el archivo no existe, currentUsersData será [] y está bien.
        console.log("currentUsersData está vacío. La verificación de duplicados se hará sobre un array vacío si es el primer usuario.");
    }

    // Verificar si el usuario ya existe
    if (currentUsersData.find(user => user.username === username)) {
        messageElem.textContent = 'El nombre de usuario ya existe.';
        messageElem.className = 'form-message error';
        return;
    }
    if (email && currentUsersData.find(user => user.email === email)) {
        messageElem.textContent = 'El correo electrónico ya está registrado.';
        messageElem.className = 'form-message error';
        return;
    }

    const newUser = {
        id: generateUserId(),
        username: username,
        password: password,
        email: email || null,
        countryCode: countryCode || null,
        phoneNumber: phoneNumber || null,
        registrationTime: new Date().toISOString(),
        lastLoginTime: null,
        cart: [] // Inicializar carrito vacío
    };

    currentUsersData.push(newUser);

    messageElem.textContent = '¡Registro exitoso! Haz clic en "Guardar Usuarios" para descargar el archivo actualizado.';
    messageElem.className = 'form-message success';
    console.log("--- Usuario Registrado (con carrito inicializado) ---");
    console.log(newUser);
    
    // Preguntar para guardar el archivo JSON
    if (confirm("Registro exitoso. ¿Deseas descargar el archivo de usuarios actualizado ahora?")) {
        saveUsersToJSON();
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const messageElem = document.getElementById('loginMessage');

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (currentUsersData.length === 0) {
       await loadUsersFromJSON(); 
       if (currentUsersData.length === 0) { 
            messageElem.textContent = `No hay datos de usuario cargados. Si es la primera vez, asegúrate que '${USERS_JSON_FILENAME}' existe o registra un usuario.`;
            messageElem.className = 'form-message error';
            return;
       }
    }

    const userFound = currentUsersData.find(user =>
        user.username === username &&
        user.password === password
    );

    if (userFound) {
        userFound.lastLoginTime = new Date().toISOString();
        localStorage.setItem('loggedInUser', JSON.stringify({
            userId: userFound.id,
            username: userFound.username
        }));
        if(messageElem) {
            messageElem.textContent = '¡Inicio de sesión exitoso! Redirigiendo...';
            messageElem.className = 'form-message success';
        }
        console.log("--- Usuario Logueado ---", userFound);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        if(messageElem){
            messageElem.textContent = 'Nombre de usuario o contraseña incorrectos.';
            messageElem.className = 'form-message error';
        }
    }
}

function handleLogout() {
    const loggedInUserJSON = localStorage.getItem('loggedInUser');
    if (loggedInUserJSON) {
        const loggedInUser = JSON.parse(loggedInUserJSON);
        const userInMemory = currentUsersData.find(u => u.id === loggedInUser.userId);
        if (userInMemory && userInMemory.lastLoginTime) {
            if (confirm("Has cerrado sesión. ¿Deseas guardar los datos de usuario actualizados (ej. última conexión) antes de salir?")) {
                saveUsersToJSON();
            }
        }
    }
    localStorage.removeItem('loggedInUser');
    alert("Has cerrado sesión.");
    window.location.href = 'index.html';
}

function getLoggedInUser() {
    const user = localStorage.getItem('loggedInUser');
    return user ? JSON.parse(user) : null;
}

async function loadUserDataForManagement() {
    const loggedInUserSession = getLoggedInUser();
    if (!loggedInUserSession) return;

    if (currentUsersData.length === 0) {
        await loadUsersFromJSON();
    }
    const currentUser = currentUsersData.find(u => u.id === loggedInUserSession.userId);
    if (currentUser) {
        const mngEmailEl = document.getElementById('mngEmail');
        if(mngEmailEl) mngEmailEl.value = currentUser.email || '';
        
        const mngCountryCodeSelect = document.getElementById('mngCountryCode');
        if (mngCountryCodeSelect) {
             if (typeof populateCountryCodes === 'function') populateCountryCodes('mngCountryCode');
             mngCountryCodeSelect.value = currentUser.countryCode || '';
        }
        const mngPhoneNumberEl = document.getElementById('mngPhoneNumber');
        if(mngPhoneNumberEl) mngPhoneNumberEl.value = currentUser.phoneNumber || '';
    }
}

async function handleUpdateUserInfo() {
    const loggedInUserSession = getLoggedInUser();
    if (!loggedInUserSession) return;
    if (currentUsersData.length === 0) await loadUsersFromJSON();

    const messageElem = document.getElementById('manageInfoMessage');
    const userIndex = currentUsersData.findIndex(u => u.id === loggedInUserSession.userId);

    if (userIndex === -1) {
        if(messageElem) {
            messageElem.textContent = 'Error: Usuario no encontrado en los datos cargados.';
            messageElem.className = 'form-message error';
        }
        return;
    }

    const newEmail = document.getElementById('mngEmail').value.trim();
    const newCountryCode = document.getElementById('mngCountryCode').value;
    const newPhoneNumber = document.getElementById('mngPhoneNumber').value.trim();

    if (newEmail && currentUsersData.some(u => u.email === newEmail && u.id !== loggedInUserSession.userId)) {
        if(messageElem) {
            messageElem.textContent = 'El correo electrónico ya está en uso.';
            messageElem.className = 'form-message error';
        }
        return;
    }

    currentUsersData[userIndex].email = newEmail || null;
    currentUsersData[userIndex].countryCode = newCountryCode || null;
    currentUsersData[userIndex].phoneNumber = newPhoneNumber || null;

    if(messageElem) {
        messageElem.textContent = 'Información actualizada. Haz clic en "Guardar Usuarios" para descargar los cambios.';
        messageElem.className = 'form-message success';
    }
    console.log(`Información actualizada para ${currentUsersData[userIndex].username}.`);
    if(confirm("Información actualizada. ¿Descargar archivo de usuarios ahora?")) {
        saveUsersToJSON();
    }
}

async function handleUpdatePassword() {
    const loggedInUserSession = getLoggedInUser();
    if (!loggedInUserSession) return;
    if (currentUsersData.length === 0) await loadUsersFromJSON();

    const messageElem = document.getElementById('managePasswordMessage');
    const userIndex = currentUsersData.findIndex(u => u.id === loggedInUserSession.userId);

    if (userIndex === -1) {
        if(messageElem) {
            messageElem.textContent = 'Error: Usuario no encontrado.';
            messageElem.className = 'form-message error';
        }
        return;
    }

    const oldPassword = document.getElementById('mngOldPassword').value;
    const newPassword = document.getElementById('mngNewPassword').value;
    const confirmNewPassword = document.getElementById('mngConfirmNewPassword').value;

    if (currentUsersData[userIndex].password !== oldPassword) {
        if(messageElem) {
            messageElem.textContent = 'La contraseña actual es incorrecta.';
            messageElem.className = 'form-message error';
        }
        return;
    }
    if (!newPassword || newPassword.length < 1) {
        if(messageElem) {
            messageElem.textContent = 'La nueva contraseña no puede estar vacía.';
            messageElem.className = 'form-message error';
        }
        return;
    }
    if (newPassword !== confirmNewPassword) {
        if(messageElem) {
            messageElem.textContent = 'Las nuevas contraseñas no coinciden.';
            messageElem.className = 'form-message error';
        }
        return;
    }

    currentUsersData[userIndex].password = newPassword;
    if(messageElem) {
        messageElem.textContent = 'Contraseña actualizada. Haz clic en "Guardar Usuarios" para descargar los cambios.';
        messageElem.className = 'form-message success';
    }
    console.log(`Contraseña cambiada para ${currentUsersData[userIndex].username}.`);
    if(confirm("Contraseña actualizada. ¿Descargar archivo de usuarios ahora?")) {
        saveUsersToJSON();
    }

    const mngOldPasswordEl = document.getElementById('mngOldPassword');
    const mngNewPasswordEl = document.getElementById('mngNewPassword');
    const mngConfirmNewPasswordEl = document.getElementById('mngConfirmNewPassword');

    if(mngOldPasswordEl) mngOldPasswordEl.value = '';
    if(mngNewPasswordEl) mngNewPasswordEl.value = '';
    if(mngConfirmNewPasswordEl) mngConfirmNewPasswordEl.value = '';
}

async function handleForgotPassword() {
    const emailOrPhoneInput = document.getElementById('resetEmailOrPhone');
    const messageElem = document.getElementById('resetStatusMessage');
    if (!emailOrPhoneInput || !messageElem) return;

    const emailOrPhone = emailOrPhoneInput.value.trim();

    if (currentUsersData.length === 0) await loadUsersFromJSON();
    if (currentUsersData.length === 0) {
        messageElem.textContent = 'No hay datos de usuario cargados.';
        messageElem.className = 'form-message error';
        return;
    }
    if (!emailOrPhone) {
        messageElem.textContent = 'Ingresa tu correo o teléfono.';
        messageElem.className = 'form-message error';
        return;
    }

    const userFound = currentUsersData.find(user =>
        user.email === emailOrPhone ||
        (user.countryCode && user.phoneNumber && (user.countryCode + user.phoneNumber) === emailOrPhone) ||
        (user.phoneNumber && user.phoneNumber === emailOrPhone)
    );

    if (userFound) {
        messageElem.textContent = `Si existe una cuenta asociada con ${emailOrPhone}, se ha enviado un enlace de restablecimiento (simulación).`;
        messageElem.className = 'form-message success';
    } else {
        messageElem.textContent = 'Si tu correo o teléfono están registrados, recibirás un enlace (simulación).';
        messageElem.className = 'form-message success';
    }
}

async function checkLoginStatus() {
    const loggedInUser = getLoggedInUser();
    const userGreeting = document.getElementById('userGreeting');
    const navAuth = document.querySelector('.nav-auth');
    const navUser = document.querySelector('.nav-user');

    if (loggedInUser) {
        if (userGreeting) {
            userGreeting.innerHTML = `<a href="user_profile.html" style="color: inherit; text-decoration: none; font-weight:500;">Hola, ${loggedInUser.username}</a>`;
        }
        if (navAuth) navAuth.style.display = 'none';
        if (navUser) navUser.style.display = 'flex';
        
        const logoutButton = document.getElementById('logoutButton'); // Mover aquí para asegurar que solo se muestra si navUser está visible
        if (logoutButton) logoutButton.style.display = 'inline-block'; // o 'flex'

    } else {
        if (userGreeting) userGreeting.textContent = '';
        if (navAuth) navAuth.style.display = 'flex';
        if (navUser) navUser.style.display = 'none'; // Ocultar todo el div .nav-user
    }
}

// --- Funciones del Carrito ---
function addToCart(productId, productName) {
    const loggedInUserSession = getLoggedInUser();
    if (!loggedInUserSession) {
        alert("Debes iniciar sesión para añadir productos al carrito.");
        return;
    }

    const userIndex = currentUsersData.findIndex(u => u.id === loggedInUserSession.userId);
    if (userIndex === -1) {
        console.error("Usuario logueado no encontrado en currentUsersData.");
        alert("Error: No se pudo encontrar tu información de usuario. Intenta iniciar sesión de nuevo.");
        return;
    }

    const user = currentUsersData[userIndex];
    user.cart = user.cart || []; // Asegurar que el carrito exista

    const productInCartIndex = user.cart.findIndex(item => item.productId === productId);

    if (productInCartIndex > -1) {
        user.cart[productInCartIndex].quantity += 1;
    } else {
        user.cart.push({ productId: productId, quantity: 1 });
    }

    alert(`"${productName}" añadido al carrito. Cantidad actualizada.`);
    console.log("Carrito actualizado:", user.cart);
    saveUsersToJSON();
}

function removeFromCart(productId, removeAll = false) {
    const loggedInUserSession = getLoggedInUser();
    if (!loggedInUserSession) return;

    const userIndex = currentUsersData.findIndex(u => u.id === loggedInUserSession.userId);
    if (userIndex === -1) return;
    
    const user = currentUsersData[userIndex];
    if (!user.cart || user.cart.length === 0) return;

    const productInCartIndex = user.cart.findIndex(item => item.productId === productId);

    if (productInCartIndex > -1) {
        if (removeAll || user.cart[productInCartIndex].quantity <= 1) {
            user.cart.splice(productInCartIndex, 1);
            alert("Producto eliminado del carrito.");
        } else {
            user.cart[productInCartIndex].quantity -= 1;
            alert("Cantidad del producto reducida en el carrito.");
        }
        saveUsersToJSON();
        if (window.location.pathname.includes('user_profile.html') && typeof displayUserProfile === 'function') {
            displayUserProfile(); 
        }
    }
}

function updateCartItemQuantity(productId, newQuantity) {
    const loggedInUserSession = getLoggedInUser();
    if (!loggedInUserSession) return;

    const userIndex = currentUsersData.findIndex(u => u.id === loggedInUserSession.userId);
    if (userIndex === -1) return;

    const user = currentUsersData[userIndex];
    if (!user.cart) return;

    const productInCartIndex = user.cart.findIndex(item => item.productId === productId);
    newQuantity = parseInt(newQuantity, 10);

    if (productInCartIndex > -1) {
        if (newQuantity <= 0) {
            removeFromCart(productId, true);
        } else {
            user.cart[productInCartIndex].quantity = newQuantity;
            saveUsersToJSON();
            if (window.location.pathname.includes('user_profile.html') && typeof displayUserProfile === 'function') {
                displayUserProfile();
            }
        }
    }
}

async function getUserCartDetails() {
    const loggedInUserSession = getLoggedInUser();
    if (!loggedInUserSession) return [];

    const user = currentUsersData.find(u => u.id === loggedInUserSession.userId);
    if (!user || !user.cart) return [];

    let productsData = window.allProductsData || [];
    if (productsData.length === 0 && typeof window.fetchProductsData === 'function') {
        productsData = await window.fetchProductsData();
    }
    if (productsData.length === 0) {
        console.error("No se pudieron obtener los datos de los productos para detallar el carrito.");
        return user.cart.map(item => ({ ...item, name: "Producto no encontrado", price: 0, imagen: "img/no-image.png" }));
    }

    return user.cart.map(cartItem => {
        const productDetails = productsData.find(p => p.id === cartItem.productId);
        if (productDetails) {
            return {
                ...cartItem,
                nombre: productDetails.nombre,
                precio: productDetails.precio,
                imagen: productDetails.imagen || `img/productos/${productDetails.id}.jpg`
            };
        }
        return { ...cartItem, nombre: "Detalles no disponibles", precio: 0, imagen: "img/no-image.png" };
    });
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', async () => {
    await loadUsersFromJSON();
    checkLoginStatus();

    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) registrationForm.addEventListener('submit', handleRegistration);
    
    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    const updateInfoBtn = document.getElementById('updateUserInfoButton');
    if (updateInfoBtn) updateInfoBtn.addEventListener('click', handleUpdateUserInfo);

    const updatePassBtn = document.getElementById('updatePasswordButton');
    if (updatePassBtn) updatePassBtn.addEventListener('click', handleUpdatePassword);
    
    const forgotPasswordForm = document.getElementById('forgotPasswordForm'); // Para la página de inicio de sesión
    const sendResetLinkButton = document.getElementById('sendResetLinkButton'); // Para el modal
    if (forgotPasswordForm) { // Si el formulario existe como tal
         forgotPasswordForm.addEventListener('submit', (e) => { e.preventDefault(); handleForgotPassword(); });
    } else if (sendResetLinkButton) { // Si solo existe el botón en el modal
         sendResetLinkButton.addEventListener('click', handleForgotPassword);
    }


    const manualSaveButton = document.getElementById('manualSaveUsersButton');
    if (manualSaveButton) manualSaveButton.addEventListener('click', saveUsersToJSON);
});

// Exportar funciones globalmente
window.handleRegistration = handleRegistration;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.checkLoginStatus = checkLoginStatus;
window.loadUserDataForManagement = loadUserDataForManagement;
window.handleUpdateUserInfo = handleUpdateUserInfo;
window.handleUpdatePassword = handleUpdatePassword;
window.saveUsersToJSON = saveUsersToJSON;
window.getLoggedInUser = getLoggedInUser;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartItemQuantity = updateCartItemQuantity;
window.getUserCartDetails = getUserCartDetails;
window.handleForgotPassword = handleForgotPassword; // Asegurarse que esté global si se llama desde HTML inline