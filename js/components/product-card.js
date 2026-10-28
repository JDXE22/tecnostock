import { formatPrice } from '../utils.js';

class ProductCard extends HTMLElement {
  set product(value) {
    this._product = value;
    this.render();
  }

  get product() {
    return this._product;
  }

  render() {
    const product = this._product;
    if (!product) return;

    this.classList.add('product-card');
    this.innerHTML = `
      <div class="product-image-container">
        <img class="product-image" />
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

    const image = this.querySelector('.product-image');
    if (product.image) {
      image.src = product.image;
    }
    image.alt = product.name;
    this.querySelector('.product-category').textContent = product.category;
    this.querySelector('.product-title').textContent = product.name;
    this.querySelector('.product-description').textContent =
      product.description;
    this.querySelector('.product-price').textContent = formatPrice(
      product.price,
    );

    const addButton = this.querySelector('.add-to-cart-btn');
    addButton.setAttribute(
      'aria-label',
      'Agregar ' + product.name + ' al carrito',
    );

    // Productos inactivos o agotados no se pueden agregar
    if (!product.active || product.stock < 1) {
      addButton.disabled = true;
      addButton.textContent = product.active ? 'Agotado' : 'No disponible';
    }

    addButton.addEventListener('click', () => {
      this.dispatchEvent(
        new CustomEvent('add-to-cart', {
          detail: { productId: product.id },
          bubbles: true,
          composed: true,
        }),
      );
    });
  }
}

customElements.define('product-card', ProductCard);
