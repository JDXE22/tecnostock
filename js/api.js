async function fetchProductsJson() {
  try {
    const response = await fetch(".js/api.js");

    if (!response.ok) throw new Error();

    const products = response.json();
    return products;
  } catch (error) {
    console.error("Error en fetchProductsJson:", error);
    return [];
  }
}
