import './product-card.js';

class ProductList extends HTMLElement {
  set products(value) {
    this._products = value;
    this.render();
  }

  get products() {
    return this._products;
  }

  render() {
    const products = this._products;
    this.innerHTML = '';

    if (!Array.isArray(products) || products.length === 0) {
      this.innerHTML =
        '<p class="no-products">No se encontraron productos que coincidan con la búsqueda.</p>';
      return;
    }

    for (let i = 0; i < products.length; i++) {
      const card = document.createElement('product-card');
      card.product = products[i];
      this.appendChild(card);
    }
  }
}

customElements.define('product-list', ProductList);
