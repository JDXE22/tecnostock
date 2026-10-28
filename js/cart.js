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
  if (!product || typeof product.id !== 'number' || isNaN(product.id)) {
    throw new Error('El producto no tiene un id numérico válido.');
  }

  if (!product.active) {
    throw new Error('El producto está inactivo y no se puede agregar.');
  }
  if (product.stock < 1) {
    throw new Error('El producto está agotado.');
  }

  const newCart = copyCart(cart);

  if (newCart[product.id]) {
    if (newCart[product.id].quantity + 1 > product.stock) {
      throw new Error('No hay más unidades disponibles de este producto.');
    }
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

  const newQuantity = parseInt(quantity, 10);

  if (isNaN(newQuantity) || newQuantity < 1) {
    delete newCart[productId];
  } else if (newQuantity > newCart[productId].product.stock) {
    throw new Error(
      'La cantidad no puede superar el inventario (' +
        newCart[productId].product.stock +
        ' unidades).',
    );
  } else {
    newCart[productId].quantity = newQuantity;
  }
  return newCart;
}

// Ajusta el carrito guardado al catálogo actual: usa los precios vigentes,
// quita productos que ya no existen o no están disponibles y recorta
// cantidades que superen el inventario.
export function syncCartWithCatalog(cart, products) {
  const newCart = {};
  for (const id in cart) {
    let catalogProduct = null;
    for (let i = 0; i < products.length; i++) {
      if (String(products[i].id) === id) {
        catalogProduct = products[i];
      }
    }
    if (!catalogProduct || !catalogProduct.active || catalogProduct.stock < 1) {
      continue;
    }
    let quantity = cart[id].quantity;
    if (quantity > catalogProduct.stock) {
      quantity = catalogProduct.stock;
    }
    newCart[id] = { product: catalogProduct, quantity: quantity };
  }
  return newCart;
}

// Revisa el carrito contra el catálogo cargado.
// Devuelve un texto con el problema, o "" si todo es válido.
export function validateCartForOrder(cart, products) {
  if (isCartEmpty(cart)) {
    return 'El carrito está vacío.';
  }
  for (const id in cart) {
    let catalogProduct = null;
    for (let i = 0; i < products.length; i++) {
      if (String(products[i].id) === id) {
        catalogProduct = products[i];
      }
    }
    const quantity = cart[id].quantity;

    if (!catalogProduct) {
      return 'Un producto del carrito ya no existe en el catálogo.';
    }
    if (!catalogProduct.active) {
      return catalogProduct.name + ' ya no está activo.';
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return 'La cantidad de ' + catalogProduct.name + ' no es válida.';
    }
    if (quantity > catalogProduct.stock) {
      return 'No hay suficiente inventario de ' + catalogProduct.name + '.';
    }
  }
  return '';
}

export function calculateTotals(cart) {
  let subtotal = 0;
  let totalCount = 0;

  for (const id in cart) {
    const item = cart[id];

    if (
      !item ||
      !item.product ||
      typeof item.product.price !== 'number' ||
      isNaN(item.product.price)
    ) {
      console.error(
        'Producto con precio inválido, no se suma (id: ' + id + ').',
      );
      continue;
    }

    subtotal = subtotal + item.product.price * item.quantity;
    totalCount = totalCount + item.quantity;
  }

  // Descuento del 10 % si el subtotal llega a $300.000
  let discount = 0;
  if (subtotal >= 300000) {
    discount = subtotal * 0.1;
  }

  return {
    subtotal: subtotal,
    discount: discount,
    totalAmount: subtotal - discount,
    totalCount: totalCount,
  };
}
