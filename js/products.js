// Filtra por búsqueda y categoría, y luego ordena.
// filter devuelve un arreglo nuevo, así que no se modifica la lista original.
export function filterAndSortProducts(products = [], filters = {}) {
  if (!Array.isArray(products)) {
    return [];
  }

  const search = (filters.searchTerm || "").trim().toLowerCase();
  const category = filters.category || "all";
  const sortBy = filters.sortBy || "";
  const onlyAvailable = filters.onlyAvailable === true;

  const result = products.filter((product) => {
    const title = (product.name || "").toLowerCase();
    const description = (product.description || "").toLowerCase();
    const matchesSearch =
      title.includes(search) || description.includes(search);
    const matchesCategory =
      category === "all" || product.category.toLowerCase() === category;
    const matchesAvailable =
      !onlyAvailable || (product.active && product.stock > 0);
    return matchesSearch && matchesCategory && matchesAvailable;
  });

  if (sortBy === "price-asc") {
    result.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    result.sort((a, b) => b.price - a.price);
  } else if (sortBy === "name-asc") {
    result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  } else if (sortBy === "name-desc") {
    result.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
  }

  return result;
}
