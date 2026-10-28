import { fetchProducts } from './api.js';
import {
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  isCartEmpty,
  calculateTotals,
  validateCartForOrder,
  syncCartWithCatalog,
} from './cart.js';
import { filterAndSortProducts } from './products.js';
import './components/product-list.js';
import './components/shopping-cart.js';
import { formatPrice } from './utils.js';
import { loadCartFromStorage, saveCartToStorage } from './storage.js';

let allProducts = [];
let cart = loadCartFromStorage();
let selectedProduct = null;

async function init() {
  const productsGrid = document.getElementById('products-grid');
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const sortFilter = document.getElementById('sort-filter');
  const availableFilter = document.getElementById('available-filter');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');

  const cartCount = document.getElementById('cart-count');
  const cartModal = document.getElementById('cart-modal');
  const cartOverlay = document.querySelector('.cart-overlay');
  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartItems = document.getElementById('cart-items');
  const checkoutBtn = document.getElementById('checkout-btn');

  const productDetail = document.getElementById('product-detail');
  const detailCloseBtn = document.querySelector('.product-detail-close');
  const detailImage = document.getElementById('detail-image');
  const detailCategory = document.getElementById('detail-category');
  const detailTitle = document.getElementById('detail-title');
  const detailRating = document.getElementById('detail-rating');
  const detailPrice = document.getElementById('detail-price');
  const detailDescription = document.getElementById('detail-description');
  const detailAddBtn = document.getElementById('detail-add-to-cart');

  const checkoutModal = document.getElementById('checkout-modal');
  const checkoutCloseBtn = document.querySelector('.checkout-close');
  const checkoutForm = document.getElementById('checkout-form');
  const checkoutConfirmation = document.getElementById('checkout-confirmation');
  const checkoutDoneBtn = document.getElementById('checkout-done-btn');
  const checkoutSummary = document.getElementById('checkout-summary');
  const checkoutError = document.getElementById('checkout-error');
  const checkoutMessage = document.getElementById('checkout-message');
  const confirmationSummary = document.getElementById('confirmation-summary');

  if (
    !productsGrid ||
    !searchInput ||
    !categoryFilter ||
    !sortFilter ||
    !availableFilter ||
    !clearFiltersBtn ||
    !cartModal ||
    !cartItems ||
    !cartCount ||
    !checkoutBtn ||
    !checkoutModal ||
    !checkoutCloseBtn ||
    !checkoutForm ||
    !checkoutConfirmation ||
    !checkoutDoneBtn ||
    !checkoutSummary ||
    !checkoutError ||
    !checkoutMessage ||
    !confirmationSummary
  ) {
    console.error(
      'Faltan elementos en el HTML, no se puede iniciar la página.',
    );
    return;
  }

  function openCart() {
    cartModal.setAttribute('aria-hidden', 'false');
    cartToggleBtn.setAttribute('aria-expanded', 'true');
    cartCloseBtn.focus();
  }

  function closeCart() {
    cartModal.setAttribute('aria-hidden', 'true');
    cartToggleBtn.setAttribute('aria-expanded', 'false');
    cartToggleBtn.focus();
  }

  function showCart() {
    cartItems.cart = cart;
    cartCount.textContent = calculateTotals(cart).totalCount;
    checkoutBtn.disabled = isCartEmpty(cart);
  }

  // Cambia el carrito, lo guarda y lo vuelve a dibujar
  function updateCart(newCart) {
    cart = newCart;
    saveCartToStorage(cart);
    showCart();
  }

  // Si la operación no es válida se avisa y el carrito queda como estaba
  function handleAddToCart(product) {
    try {
      updateCart(addItemToCart(cart, product));
      openCart();
    } catch (error) {
      alert(error.message);
    }
  }

  function handleRemoveFromCart(productId) {
    updateCart(removeItemFromCart(cart, productId));
  }

  function handleQuantityChange(productId, quantity) {
    try {
      updateCart(updateItemQuantity(cart, productId, quantity));
    } catch (error) {
      alert(error.message);
    }
  }

  function handleFilterChange() {
    const filtered = filterAndSortProducts(allProducts, {
      searchTerm: searchInput.value,
      category: categoryFilter.value,
      sortBy: sortFilter.value,
      onlyAvailable: availableFilter.checked,
    });
    productsGrid.products = filtered;
  }

  function openProductDetail(product) {
    selectedProduct = product;
    detailImage.src = product.image;
    detailImage.alt = product.title;
    detailCategory.textContent = product.category;
    detailTitle.textContent = product.title;
    detailPrice.textContent = '$' + product.price.toFixed(2);
    detailDescription.textContent = product.description;

    if (product.rating) {
      detailRating.textContent =
        '★ ' +
        product.rating.rate +
        ' de 5 · ' +
        product.rating.count +
        ' opiniones';
    } else {
      detailRating.textContent = '';
    }

    productDetail.showModal();
  }

  // Dibuja las líneas, subtotal, descuento y total del carrito actual
  function fillOrderSummary(container) {
    container.innerHTML = '';

    const list = document.createElement('ul');
    for (const id in cart) {
      const item = document.createElement('li');
      item.textContent =
        cart[id].product.name +
        ' x' +
        cart[id].quantity +
        ' — ' +
        formatPrice(cart[id].product.price * cart[id].quantity);
      list.appendChild(item);
    }
    container.appendChild(list);

    const totals = calculateTotals(cart);
    const lines = [
      'Subtotal: ' + formatPrice(totals.subtotal),
      'Descuento: -' + formatPrice(totals.discount),
      'Total: ' + formatPrice(totals.totalAmount),
    ];
    for (let i = 0; i < lines.length; i++) {
      const p = document.createElement('p');
      p.textContent = lines[i];
      container.appendChild(p);
    }
  }

  function createOrderId() {
    const random = Math.floor(Math.random() * 1000);
    return 'TS-' + Date.now() + '-' + random;
  }

  function handleCheckoutSubmit(event) {
    event.preventDefault();

    // Se valida otra vez contra el catálogo antes de confirmar
    const problem = validateCartForOrder(cart, allProducts);
    if (problem !== '') {
      checkoutError.textContent = 'No se pudo confirmar el pedido: ' + problem;
      checkoutError.hidden = false;
      return;
    }

    // Primero se guarda el resumen, porque luego el carrito se vacía
    fillOrderSummary(confirmationSummary);
    checkoutMessage.textContent =
      'Pedido ' +
      createOrderId() +
      ' confirmado. Es una simulación local: no se realizó ningún pago real ni se actualizó el inventario.';

    checkoutError.hidden = true;
    checkoutForm.hidden = true;
    checkoutConfirmation.hidden = false;
    updateCart({});
  }

  function openCheckout() {
    if (isCartEmpty(cart)) {
      return;
    }
    const problem = validateCartForOrder(cart, allProducts);
    if (problem !== '') {
      alert('No se puede continuar: ' + problem);
      return;
    }
    checkoutForm.reset();
    checkoutError.hidden = true;
    fillOrderSummary(checkoutSummary);
    checkoutForm.hidden = false;
    checkoutConfirmation.hidden = true;
    closeCart();
    checkoutModal.showModal();
  }

  // Carrito
  cartToggleBtn.addEventListener('click', openCart);
  cartCloseBtn.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  checkoutBtn.addEventListener('click', openCheckout);
  document.addEventListener('keydown', (event) => {
    if (
      event.key === 'Escape' &&
      cartModal.getAttribute('aria-hidden') === 'false'
    ) {
      closeCart();
    }
  });

  // Eventos de los componentes: aquí se valida antes de cambiar el carrito
  productsGrid.addEventListener('add-to-cart', (event) => {
    let product = null;
    for (let i = 0; i < allProducts.length; i++) {
      if (allProducts[i].id === event.detail.productId) {
        product = allProducts[i];
      }
    }
    if (!product) {
      alert('El producto no existe en el catálogo.');
      return;
    }
    handleAddToCart(product);
  });
  cartItems.addEventListener('change-quantity', (event) => {
    handleQuantityChange(event.detail.productId, event.detail.quantity);
  });
  cartItems.addEventListener('remove-item', (event) => {
    handleRemoveFromCart(event.detail.productId);
  });

  // Filtros
  searchInput.addEventListener('input', handleFilterChange);
  categoryFilter.addEventListener('change', handleFilterChange);
  sortFilter.addEventListener('change', handleFilterChange);
  availableFilter.addEventListener('change', handleFilterChange);
  clearFiltersBtn.addEventListener('click', () => {
    searchInput.value = '';
    categoryFilter.value = 'all';
    sortFilter.value = 'default';
    availableFilter.checked = false;
    handleFilterChange();
  });

  // Detalle del producto
  if (productDetail && detailCloseBtn && detailAddBtn) {
    detailCloseBtn.addEventListener('click', () => productDetail.close());
    productDetail.addEventListener('click', (event) => {
      if (event.target === productDetail) {
        productDetail.close();
      }
    });
    detailAddBtn.addEventListener('click', () => {
      productDetail.close();
      handleAddToCart(selectedProduct);
    });
  }

  // Compra
  checkoutCloseBtn.addEventListener('click', () => checkoutModal.close());
  checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  checkoutDoneBtn.addEventListener('click', () => {
    checkoutModal.close();
    cartToggleBtn.focus();
  });

  showCart();

  productsGrid.innerHTML = '<p class="no-products">Cargando productos...</p>';
  try {
    allProducts = await fetchProducts();
  } catch (error) {
    console.error(error);
    productsGrid.innerHTML =
      '<p class="no-products" role="alert">Error: ' +
      error.message +
      ' Intenta recargar la página.</p>';
    return;
  }

  // Respuesta válida pero sin productos (no es un error)
  if (allProducts.length === 0) {
    productsGrid.innerHTML =
      '<p class="no-products">El catálogo está vacío por ahora.</p>';
    return;
  }

  // Ajustar el carrito guardado a los datos actuales del catálogo
  updateCart(syncCartWithCatalog(cart, allProducts));

  handleFilterChange();
}

document.addEventListener('DOMContentLoaded', init);
