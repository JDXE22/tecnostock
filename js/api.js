const url = 'data/products.json';

// Revisa que un producto tenga la estructura esperada
function isValidProduct(product) {
  return (
    product !== null &&
    typeof product === 'object' &&
    typeof product.id === 'number' &&
    typeof product.name === 'string' &&
    typeof product.category === 'string' &&
    typeof product.price === 'number' &&
    product.price > 0 &&
    Number.isInteger(product.stock) &&
    product.stock >= 0 &&
    typeof product.active === 'boolean'
  );
}

export async function fetchProducts() {
  let response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new Error('No se pudo conectar para cargar el catálogo.');
  }

  if (!response.ok) {
    throw new Error(
      'Error HTTP ' + response.status + ' al cargar el catálogo.',
    );
  }

  let products;
  try {
    products = await response.json();
  } catch (error) {
    throw new Error('El catálogo no tiene un formato JSON válido.');
  }

  if (!Array.isArray(products)) {
    throw new Error('El catálogo tiene datos inválidos.');
  }
  for (let i = 0; i < products.length; i++) {
    if (!isValidProduct(products[i])) {
      throw new Error('El catálogo contiene un producto inválido.');
    }
  }
  return products;
}
