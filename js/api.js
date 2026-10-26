const url = ".data/products.js";
async function fetchProductsJson() {
  try {
    const response = await fetch(url);

    if (!response.ok) throw new Error();

    const products = await response.json();
    return products;
  } catch (error) {
    console.error("Error en fetchProductsJson:", error);
    return [];
  }
}
