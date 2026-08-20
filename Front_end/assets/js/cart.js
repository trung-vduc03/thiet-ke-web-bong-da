// FOOTBALL FASHION - CART.JS
function getCart() {
    try { return JSON.parse(localStorage.getItem('cart')) || []; }
    catch { return []; }
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (typeof updateBadges === 'function') updateBadges();
}

function normalizeCartImage(image) {
    if (typeof normalizeProductImage === 'function') return normalizeProductImage(image);
    const p = String(image || '');
    const i = p.lastIndexOf('Front_end/assets/');
    if (i >= 0) return '/' + p.substring(i);
    if (p.startsWith('../assets/')) return '/Front_end/' + p.substring(3);
    if (p.startsWith('./assets/')) return '/Front_end/' + p.substring(2);
    if (!p.includes('/')) return '/Front_end/assets/images/clubs/' + p;
    return p;
}

function renderCart() {
    const cart = getCart();
    const tableBody = document.getElementById('cartTableBody');
    const giftWrap = document.getElementById('giftWrap');
    const shippingNotice = document.getElementById('shippingNotice');
    if (!tableBody) return;

    const giftWrapChecked = !!(giftWrap && giftWrap.checked);
    const threshold = 2000000;

    if (cart.length === 0) {
        tableBody.innerHTML = `
            <div class="cart-empty">
                <p class="empty-text">Giỏ hàng trống! Hãy chọn áo đấu yêu thích.</p>
                <a href="../home/products/products.html" class="btn-primary">Khám phá sản phẩm</a>
            </div>`;
        updateTotals(0, giftWrapChecked);
        if (shippingNotice) shippingNotice.innerHTML = 'Mua thêm <strong>2.000.000đ</strong> để được miễn phí vận chuyển';
        return;
    }

    let subtotal = 0;
    tableBody.innerHTML = cart.map((item, index) => {
        const price = Number(item.price) || 0;
        const quantity = Math.max(1, Number(item.quantity) || 1);
        const total = price * quantity;
        subtotal += total;
        return `
            <article class="cart-item">
                <img class="cart-item-image" src="${normalizeCartImage(item.image)}" alt="${item.name}">
                <div class="cart-item-info">
                    <a class="cart-item-name" href="../home/products/products-detail.html?id=${encodeURIComponent(item.id)}">${item.name}</a>
                    <p class="cart-item-meta">Size: ${item.size || 'M'}</p>
                    <p class="cart-item-price">${price.toLocaleString('vi-VN')}đ</p>
                </div>
                <div class="cart-item-controls">
                    <label class="quantity-control-label" for="cartQty-${index}">Số lượng</label>
                    <input id="cartQty-${index}" class="cart-quantity" type="number" min="1" value="${quantity}" data-cart-quantity="${index}">
                    <strong class="cart-item-total">${total.toLocaleString('vi-VN')}đ</strong>
                    <button type="button" class="cart-remove" data-cart-remove="${index}">Xóa</button>
                </div>
            </article>`;
    }).join('');

    if (shippingNotice) {
        shippingNotice.innerHTML = subtotal < threshold
            ? `Mua thêm <strong>${(threshold-subtotal).toLocaleString('vi-VN')}đ</strong> để được miễn phí vận chuyển`
            : 'Chúc mừng! Đơn hàng của bạn được <strong>Miễn phí vận chuyển</strong>';
    }
    updateTotals(subtotal, giftWrapChecked);

    tableBody.querySelectorAll('[data-cart-quantity]').forEach(function (input) {
        input.addEventListener('change', function () {
            updateQuantity(Number(this.dataset.cartQuantity), this.value);
        });
    });
    tableBody.querySelectorAll('[data-cart-remove]').forEach(function (button) {
        button.addEventListener('click', function () {
            removeItem(Number(this.dataset.cartRemove));
        });
    });
}

function updateTotals(subtotal, giftWrapChecked) {
    const gift = giftWrapChecked ? 10000 : 0;
    const shipping = subtotal >= 2000000 ? 0 : 30000;
    const sub = document.getElementById('subTotal');
    const giftEl = document.getElementById('giftWrapPrice');
    const grand = document.getElementById('grandTotal');
    if (sub) sub.textContent = subtotal.toLocaleString('vi-VN') + 'đ';
    if (giftEl) giftEl.textContent = gift.toLocaleString('vi-VN') + 'đ';
    if (grand) grand.textContent = (subtotal + gift + shipping).toLocaleString('vi-VN') + 'đ';
}

function updateQuantity(index, value) {
    const cart = getCart();
    const qty = parseInt(value, 10);
    if (!cart[index] || !Number.isFinite(qty) || qty < 1) return;
    cart[index].quantity = qty;
    saveCart(cart);
    renderCart();
}

function removeItem(index) {
    const cart = getCart();
    if (cart[index]) {
        cart.splice(index, 1);
        saveCart(cart);
        renderCart();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const giftWrap = document.getElementById('giftWrap');
    if (giftWrap) giftWrap.addEventListener('change', renderCart);
    renderCart();
    if (typeof updateBadges === 'function') updateBadges();
});
