import { calculateTotals, isCartEmpty } from '../cart.js';
import { formatPrice } from '../utils.js';

// Muestra las líneas del carrito y sus importes. Cuando el usuario pide
class ShoppingCart extends HTMLElement {
  set cart(value) {
    this._cart = value;
    this.render();
  }

  get cart() {
    return this._cart;
  }

  sendEvent(name, detail) {
    this.dispatchEvent(
      new CustomEvent(name, { detail: detail, bubbles: true, composed: true }),
    );
  }

  render() {
    const cart = this._cart || {};
    this.innerHTML = '';

    if (isCartEmpty(cart)) {
      this.innerHTML =
        '<p class="empty-cart-message">Tu carrito está vacío.</p>';
    }

    for (const id in cart) {
      const product = cart[id].product;
      const quantity = cart[id].quantity;

      const article = document.createElement('article');
      article.className = 'cart-item';
      article.innerHTML = `
        <div class="cart-item-details">
          <h3></h3>
          <p></p>
          <div class="cart-item-quantity">
            <button class="quantity-btn btn-minus" type="button">−</button>
            <span class="quantity-value"></span>
            <button class="quantity-btn btn-plus" type="button">+</button>
          </div>
          <strong></strong>
        </div>
        <button class="remove-cart-item" type="button">Eliminar</button>
      `;

      article.querySelector('h3').textContent = product.name;
      article.querySelector('p').textContent =
        formatPrice(product.price) + ' c/u';
      article.querySelector('.quantity-value').textContent = quantity;
      article.querySelector('strong').textContent =
        'Subtotal: ' + formatPrice(product.price * quantity);

      const minusButton = article.querySelector('.btn-minus');
      const plusButton = article.querySelector('.btn-plus');
      const removeButton = article.querySelector('.remove-cart-item');

      minusButton.setAttribute(
        'aria-label',
        'Disminuir cantidad de ' + product.name,
      );
      plusButton.setAttribute(
        'aria-label',
        'Aumentar cantidad de ' + product.name,
      );
      removeButton.setAttribute('aria-label', 'Eliminar ' + product.name);

      minusButton.addEventListener('click', () => {
        this.sendEvent('change-quantity', {
          productId: product.id,
          quantity: quantity - 1,
        });
      });
      plusButton.addEventListener('click', () => {
        this.sendEvent('change-quantity', {
          productId: product.id,
          quantity: quantity + 1,
        });
      });
      removeButton.addEventListener('click', () => {
        this.sendEvent('remove-item', { productId: product.id });
      });

      this.appendChild(article);
    }

    // Importes del carrito
    const totals = calculateTotals(cart);
    const summary = document.createElement('div');
    summary.className = 'cart-summary';
    summary.setAttribute('aria-live', 'polite');
    summary.innerHTML = `
      <div class="cart-total-row"><span>Subtotal:</span><span class="cart-subtotal"></span></div>
      <div class="cart-total-row"><span>Descuento (10 % desde $300.000):</span><span class="cart-discount"></span></div>
      <div class="cart-total-row"><span>Total:</span><span class="cart-total"></span></div>
    `;
    summary.querySelector('.cart-subtotal').textContent = formatPrice(
      totals.subtotal,
    );
    summary.querySelector('.cart-discount').textContent =
      '-' + formatPrice(totals.discount);
    summary.querySelector('.cart-total').textContent = formatPrice(
      totals.totalAmount,
    );
    this.appendChild(summary);
  }
}

customElements.define('shopping-cart', ShoppingCart);
