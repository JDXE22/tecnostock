const CART_KEY = "cart_items";

function isValidItem(id, item) {
  if (!item || !item.product) {
    return false;
  }
  if (String(item.product.id) !== id) {
    return false;
  }
  if (typeof item.product.price !== "number") {
    return false;
  }
  if (!Number.isInteger(item.quantity) || item.quantity < 1) {
    return false;
  }
  return true;
}

export function loadCartFromStorage() {
  let savedCart;

  try {
    const text = localStorage.getItem(CART_KEY);
    if (text === null) {
      return {};
    }
    savedCart = JSON.parse(text);
  } catch (error) {
    console.error(
      'No se pudo leer el carrito guardado en "cart_items":',
      error,
    );
    return {};
  }

  if (
    typeof savedCart !== "object" ||
    savedCart === null ||
    Array.isArray(savedCart)
  ) {
    console.error(
      'El carrito guardado en "cart_items" no tiene el formato correcto.',
    );
    return {};
  }

  const cart = {};
  for (const id of savedCart) {
    if (isValidItem(id, savedCart[id])) {
      cart[id] = savedCart[id];
    } else {
      console.error(
        "Se descartó un producto inválido del carrito (id: " + id + ").",
      );
    }
  }
  return cart;
}

export function saveCartToStorage(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("No se pudo guardar el carrito:", error);
  }
}
