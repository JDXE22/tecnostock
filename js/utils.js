// Muestra un número como pesos colombianos, por ejemplo 189900 -> $189.900
export function formatPrice(amount) {
  return "$" + Number(amount).toLocaleString("es-CO");
}