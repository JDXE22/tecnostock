import { addItemToCart, removeItemFromCart, updateItemQuantity } from "./cart";
import { renderProducts } from "./products";
import { loadCartFromStorage } from "./storage";

let allProducts = [];
let cart = loadCartFromStorage();
let selectedProduct = null;

async function init() {
  const productsGrid = document.getElementById("products-grid");
  const searchInput = document.getElementById("search-input");
  const categoryFilter = document.getElementById("category-filter");
  const sortFilter = document.getElementById("sort-filter");

  const cartCount = document.getElementById("cart-count");
  const cartModal = document.getElementById("cart-modal");
  const cartOverlay = document.querySelector(".cart-overlay");
  const cartToggleBtn = document.getElementById("cart-toggle-btn");
  const cartCloseBtn = document.getElementById("cart-close-btn");
  const cartItems = document.getElementById("cart-items");
  const checkoutBtn = document.getElementById("checkout-btn");

  const productDetail = document.getElementById("product-detail");
  const detailCloseBtn = document.querySelector(".product-detail-close");
  const detailImage = document.getElementById("detail-image");
  const detailCategory = document.getElementById("detail-category");
  const detailTitle = document.getElementById("detail-title");
  const detailRating = document.getElementById("detail-rating");
  const detailPrice = document.getElementById("detail-price");
  const detailDescription = document.getElementById("detail-description");
  const detailAddBtn = document.getElementById("detail-add-to-cart");

  const checkoutModal = document.getElementById("checkout-modal");
  const checkoutCloseBtn = document.querySelector(".checkout-close");
  const checkoutForm = document.getElementById("checkout-form");
  const checkoutConfirmation = document.getElementById("checkout-confirmation");
  const checkoutDoneBtn = document.getElementById("checkout-done-btn");

  if (
    !productsGrid ||
    !searchInput ||
    !categoryFilter ||
    !sortFilter ||
    !cartModal ||
    !cartItems ||
    !cartCount ||
    !checkoutBtn
  ) {
    console.error(
      "Faltan elementos en el HTML, no se puede iniciar la página.",
    );
    return;
  }

  function openCart() {
    cartModal.setAttribute("aria-hidden", "false");
    cartToggleBtn.setAttribute("aria-expanded", "true");
    cartCloseBtn.focus();
  }

  function closeCart() {
    cartModal.setAttribute("aria-hidden", "true");
    cartToggleBtn.setAttribute("aria-expanded", "false");
    cartToggleBtn.focus();
  }

  function showCart() {
    renderCart(
      cart,
      cartItems,
      cartCount,
      handleRemoveFromCart,
      handleQuantityChange,
    );
    checkoutBtn.disabled = isCartEmpty(cart);
  }

  // Cambia el carrito, lo guarda y lo vuelve a dibujar
  function updateCart(newCart) {
    cart = newCart;
    saveCartToStorage(cart);
    showCart();
  }

  function handleAddToCart(product) {
    updateCart(addItemToCart(cart, product));
    openCart();
  }

  function handleRemoveFromCart(productId) {
    updateCart(removeItemFromCart(cart, productId));
  }

  function handleQuantityChange(productId, quantity) {
    updateCart(updateItemQuantity(cart, productId, quantity));
  }

  function handleFilterChange() {
    const filtered = filterAndSortProducts(allProducts, {
      searchTerm: searchInput.value,
      category: categoryFilter.value,
      sortBy: sortFilter.value,
    });
    renderProducts(filtered, productsGrid, handleAddToCart, openProductDetail);
  }

  function openProductDetail(product) {
    selectedProduct = product;
    detailImage.src = product.image;
    detailImage.alt = product.title;
    detailCategory.textContent = product.category;
    detailTitle.textContent = product.title;
    detailPrice.textContent = "$" + product.price.toFixed(2);
    detailDescription.textContent = product.description;

    if (product.rating) {
      detailRating.textContent =
        "★ " +
        product.rating.rate +
        " de 5 · " +
        product.rating.count +
        " opiniones";
    } else {
      detailRating.textContent = "";
    }

    productDetail.showModal();
  }

  function openCheckout() {
    if (isCartEmpty(cart)) {
      return;
    }
    checkoutForm.reset();
    checkoutForm.hidden = false;
    checkoutConfirmation.hidden = true;
    closeCart();
    checkoutModal.showModal();
  }

  // Carrito
  cartToggleBtn.addEventListener("click", openCart);
  cartCloseBtn.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);
  checkoutBtn.addEventListener("click", openCheckout);
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      cartModal.getAttribute("aria-hidden") === "false"
    ) {
      closeCart();
    }
  });

  // Filtros
  searchInput.addEventListener("input", handleFilterChange);
  categoryFilter.addEventListener("change", handleFilterChange);
  sortFilter.addEventListener("change", handleFilterChange);

  // Detalle del producto
  detailCloseBtn.addEventListener("click", () => productDetail.close());
  productDetail.addEventListener("click", (event) => {
    // Si se hace clic en el fondo oscuro (fuera del contenido) se cierra
    if (event.target === productDetail) {
      productDetail.close();
    }
  });
  detailAddBtn.addEventListener("click", () => {
    productDetail.close();
    handleAddToCart(selectedProduct);
  });

  // Compra
  checkoutCloseBtn.addEventListener("click", () => checkoutModal.close());
  checkoutForm.addEventListener("submit", handleCheckoutSubmit);
  checkoutDoneBtn.addEventListener("click", () => {
    checkoutModal.close();
    cartToggleBtn.focus();
  });

  // Primero el carrito guardado, así el contador aparece aunque la API tarde
  showCart();

  productsGrid.innerHTML = '<p class="no-products">Cargando productos...</p>';
  allProducts = await fetchProducts();

  if (allProducts.length === 0) {
    productsGrid.innerHTML =
      '<p class="no-products">No se pudieron cargar los productos. Intenta recargar la página.</p>';
    return;
  }

  handleFilterChange();
}

document.addEventListener("DOMContentLoaded", init);
