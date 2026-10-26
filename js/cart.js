// Copia el carrito para no modificar el original
function copyCart(cart) {
  const newCart = {};
  for (const id in cart) {
    newCart[id] = { product: cart[id].product, quantity: cart[id].quantity };
  }
  return newCart;
}

export function isCartEmpty(cart) {
  for (const id in cart) {
    return false;
  }
  return true;
}

export function addItemToCart(cart, product) {
  if (!product || typeof product.id !== "number" || isNaN(product.id)) {
    throw new Error("El producto no tiene un id numérico válido.");
  }

  const newCart = copyCart(cart);

  if (newCart[product.id]) {
    newCart[product.id].quantity = newCart[product.id].quantity + 1;
  } else {
    newCart[product.id] = { product: product, quantity: 1 };
  }
  return newCart;
}

export function removeItemFromCart(cart, productId) {
  const newCart = copyCart(cart);
  delete newCart[productId];
  return newCart;
}

export function updateItemQuantity(cart, productId, quantity) {
  const newCart = copyCart(cart);

  if (!newCart[productId]) {
    return newCart;
  }

  // parseInt quita los decimales; si no es un número da NaN
  const newQuantity = parseInt(quantity, 10);

  if (isNaN(newQuantity) || newQuantity < 1) {
    delete newCart[productId];
  } else {
    newCart[productId].quantity = newQuantity;
  }
  return newCart;
}

export function calculateTotals(cart) {
  let totalAmount = 0;
  let totalCount = 0;

  for (const id in cart) {
    const item = cart[id];

    if (
      !item ||
      !item.product ||
      typeof item.product.price !== "number" ||
      isNaN(item.product.price)
    ) {
      console.error(
        "Producto con precio inválido, no se suma (id: " + id + ").",
      );
      continue;
    }

    totalAmount = totalAmount + item.product.price * item.quantity;
    totalCount = totalCount + item.quantity;
  }

  return { totalAmount: totalAmount, totalCount: totalCount };
}

// Dibuja el carrito. No guarda nada: eso lo hace main.js.
export function renderCart(
  cart,
  cartContainerElement,
  counterElement,
  onRemoveItem,
  onChangeQuantity,
) {
  const totals = calculateTotals(cart);
  const totalElement = document.getElementById("cart-total");

  if (counterElement) {
    counterElement.textContent = totals.totalCount;
  }
  if (totalElement) {
    totalElement.textContent = "$" + totals.totalAmount.toFixed(2);
  }
  if (!cartContainerElement) return;

  cartContainerElement.innerHTML = "";

  if (isCartEmpty(cart)) {
    cartContainerElement.innerHTML =
      '<p class="empty-cart-message">Tu carrito está vacío.</p>';
    return;
  }

  for (const id of cart) {
    const product = cart[id].product;
    const quantity = cart[id].quantity;
    const subtotal = product.price * quantity;

    const article = document.createElement("article");
    article.className = "cart-item";
    article.innerHTML = `
      <img class="cart-item-image" />
      <div class="cart-item-details">
        <h3></h3>
        <p></p>
        <div class="cart-item-quantity">
          <button class="quantity-btn btn-minus" type="button">−</button>
          <span class="quantity-value"></span>
          <button class="quantity-btn btn-plus" type="button">+</button>
        </div>
        <strong></strong>
      </div>
      <button class="remove-cart-item" type="button">Eliminar</button>
    `;

    const image = article.querySelector(".cart-item-image");
    image.src = product.image;
    image.alt = product.title;
    article.querySelector("h3").textContent = product.title;
    article.querySelector("p").textContent =
      "$" + Number(product.price).toFixed(2) + " c/u";
    article.querySelector(".quantity-value").textContent = quantity;
    article.querySelector("strong").textContent =
      "Subtotal: $" + subtotal.toFixed(2);

    const minusButton = article.querySelector(".btn-minus");
    const plusButton = article.querySelector(".btn-plus");
    const removeButton = article.querySelector(".remove-cart-item");

    minusButton.setAttribute(
      "aria-label",
      "Disminuir cantidad de " + product.title,
    );
    plusButton.setAttribute(
      "aria-label",
      "Aumentar cantidad de " + product.title,
    );
    removeButton.setAttribute("aria-label", "Eliminar " + product.title);

    minusButton.addEventListener("click", () => {
      if (typeof onChangeQuantity === "function") {
        onChangeQuantity(product.id, quantity - 1);
      }
    });
    plusButton.addEventListener("click", () => {
      if (typeof onChangeQuantity === "function") {
        onChangeQuantity(product.id, quantity + 1);
      }
    });
    removeButton.addEventListener("click", () => {
      if (typeof onRemoveItem === "function") {
        onRemoveItem(product.id);
      }
    });

    cartContainerElement.appendChild(article);
  }
}
