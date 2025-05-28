// js/products.js

const NO_IMAGE_URL = "img/no-image.png"; // From original file
// const PRODUCT_IMG_BASE_PATH = "img/productos/"; // From original file (ya está en products.JSON)

let allProductsData = []; // From original file

async function fetchProductsData() { // From original file
    if (allProductsData.length > 0) { // From original file
        return allProductsData; // From original file
    }
    try {
        const response = await fetch('products.JSON'); // From original file // Nombre de archivo corregido a products.JSON
        if (!response.ok) { // From original file
            throw new Error(`HTTP error! status: ${response.status}`); // From original file
        }
        allProductsData = await response.json(); // From original file
        // Hacer allProductsData globalmente accesible para auth.js (si es necesario)
        window.allProductsData = allProductsData; 
        console.log("Productos cargados desde JSON:", allProductsData); // From original file
        return allProductsData; // From original file
    } catch (error) { // From original file
        console.error("No se pudieron cargar los productos desde products.JSON:", error); // From original file
        window.allProductsData = [];
        return []; // From original file
    }
}
// Asegurarse de que fetchProductsData es llamado temprano, por ejemplo, en el DOMContentLoaded de páginas que lo necesiten,
// o en el propio products.js al final.
// document.addEventListener('DOMContentLoaded', fetchProductsData); // Opcional: precargar al inicio

function createProductCard(product) {
    const card = document.createElement("div"); // From original file
    card.className = "product-card"; // From original file

    const productImage = document.createElement("img"); // From original file
    const imagePath = product.imagen || `${PRODUCT_IMG_BASE_PATH}${product.id}.jpg`; // From original file
    productImage.src = imagePath; // From original file
    productImage.onerror = function () { // From original file
        this.src = NO_IMAGE_URL; // From original file
    };
    productImage.alt = product.nombre; // From original file
    productImage.className = "product-image"; // From original file

    const productName = document.createElement("h3"); // From original file
    productName.textContent = product.nombre; // From original file
    productName.className = "product-name"; // From original file

    const productIdElement = document.createElement("p"); // From original file // Cambiado el nombre de la variable para evitar conflicto con el parámetro
    productIdElement.textContent = `Código: ${product.id}`; // From original file
    productIdElement.className = "product-id"; // From original file

    const productPrice = document.createElement("p"); // From original file
    productPrice.textContent = `Precio: $${product.precio.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`; // From original file
    productPrice.className = "product-price"; // From original file

    const productSpecs = document.createElement("p"); // From original file
    productSpecs.textContent = product.especificaciones; // From original file
    productSpecs.className = "product-specs"; // From original file

    const addToCartButton = document.createElement("button"); // From original file
    addToCartButton.textContent = "Añadir al Carrito"; // From original file
    addToCartButton.className = "add-to-cart-btn"; // From original file
    // MODIFICADO: Llamar a la nueva función addToCart de auth.js
    addToCartButton.onclick = () => {
        if (typeof window.addToCart === 'function') {
            window.addToCart(product.id, product.nombre); // Pasar ID y nombre del producto
        } else {
            alert("Error: La función para añadir al carrito no está disponible.");
            console.error("La función addToCart no está definida globalmente.");
        }
    };

    card.appendChild(productImage); // From original file
    card.appendChild(productName); // From original file
    card.appendChild(productIdElement); // From original file
    card.appendChild(productPrice); // From original file
    card.appendChild(productSpecs); // From original file
    card.appendChild(addToCartButton); // From original file

    return card; // From original file
}

async function displayProducts(isFeatured = false, limit = 0, searchTerm = "") { // From original file
    const products = await fetchProductsData(); // From original file

    const containerId = isFeatured ? "featured-products-grid" : "all-products-grid"; // From original file
    const productGrid = document.getElementById(containerId); // From original file

    if (!productGrid) { // From original file
        console.error(`Elemento con ID '${containerId}' no encontrado.`); // From original file
        return; // From original file
    }
    productGrid.innerHTML = ""; // From original file

    let productsToDisplay = [...products]; // From original file

    if (searchTerm) { // From original file
        productsToDisplay = productsToDisplay.filter( // From original file
            (p) =>
            p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || // From original file
            p.id.toLowerCase().includes(searchTerm.toLowerCase()) || // From original file
            (p.especificaciones && p.especificaciones.toLowerCase().includes(searchTerm.toLowerCase())) // From original file
        );
    }

    if (isFeatured && limit > 0) { // From original file
        productsToDisplay = productsToDisplay.slice(0, limit); // From original file
    }

    if (productsToDisplay.length === 0) { // From original file
        if (searchTerm) { // From original file
            productGrid.innerHTML = "<p class='no-products-message'>No se encontraron productos que coincidan con tu búsqueda.</p>"; // From original file
        } else { // From original file
            productGrid.innerHTML = "<p class='no-products-message'>No hay productos disponibles en este momento.</p>"; // From original file
        }
        return; // From original file
    }

    productsToDisplay.forEach((product, index) => { // From original file
        const card = createProductCard(product); // From original file
        productGrid.appendChild(card); // From original file
        setTimeout(() => { // From original file
            card.classList.add("visible"); // From original file
        }, 20 * (index + 1)); // From original file
    });
}

function searchProducts() { // From original file
    const searchInput = document.getElementById("searchProduct"); // From original file
    if (!searchInput) return; // From original file
    const searchTerm = searchInput.value.trim(); // From original file
    displayProducts(false, 0, searchTerm); // From original file
}

window.displayProducts = displayProducts; // From original file
window.searchProducts = searchProducts; // From original file
window.fetchProductsData = fetchProductsData; // From original file