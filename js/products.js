// Filtra por búsqueda y categoría, y luego ordena.
// filter devuelve un arreglo nuevo, así que no se modifica la lista original.
export function filterAndSortProducts(products = [], filters = {}) {
  if (!Array.isArray(products)) {
    return [];
  }

  const search = (filters.searchTerm || "").trim().toLowerCase();
  const category = filters.category || "all";
  const sortBy = filters.sortBy || "";

  const result = products.filter((product) => {
    const title = (product.title || "").toLowerCase();
    const description = (product.description || "").toLowerCase();
    const matchesSearch =
      title.includes(search) || description.includes(search);
    const matchesCategory = category === "all" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  if (sortBy === "price-asc") {
    result.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    result.sort((a, b) => b.price - a.price);
  } else if (sortBy === "name-asc") {
    result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  } else if (sortBy === "name-desc") {
    result.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
  }

  return result;
}

export function renderProducts(
  products,
  containerElement,
  onAddToCart,
  onShowDetail,
) {
  if (!containerElement) return;

  containerElement.innerHTML = "";

  if (!Array.isArray(products) || products.length === 0) {
    containerElement.innerHTML =
      '<p class="no-products">No se encontraron productos que coincidan con la búsqueda.</p>';
    return;
  }

  for (let i = 0; i < products.length; i++) {
    const product = products[i];

    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-image-container">
        <button class="product-image-button" type="button">
          <img class="product-image" loading="lazy" />
          <span class="product-image-hint" aria-hidden="true">Ver detalles</span>
        </button>
      </div>
      <div class="product-info">
        <span class="product-category"></span>
        <h3 class="product-title"></h3>
        <p class="product-description"></p>
        <div class="product-footer">
          <span class="product-price"></span>
          <button class="add-to-cart-btn" type="button">Agregar al carrito</button>
        </div>
      </div>
    `;

    const image = card.querySelector(".product-image");
    image.src = product.image;
    image.alt = product.title;
    card.querySelector(".product-category").textContent = product.category;
    card.querySelector(".product-title").textContent = product.title;
    card.querySelector(".product-description").textContent =
      product.description;
    card.querySelector(".product-price").textContent =
      "$" + Number(product.price).toFixed(2);

    const detailButton = card.querySelector(".product-image-button");
    const addButton = card.querySelector(".add-to-cart-btn");

    detailButton.setAttribute("aria-label", "Ver detalles de " + product.title);
    addButton.setAttribute(
      "aria-label",
      "Agregar " + product.title + " al carrito",
    );

    if (typeof onShowDetail === "function") {
      detailButton.addEventListener("click", () => onShowDetail(product));
    }
    if (typeof onAddToCart === "function") {
      addButton.addEventListener("click", () => onAddToCart(product));
    }

    containerElement.appendChild(card);
  }
}
