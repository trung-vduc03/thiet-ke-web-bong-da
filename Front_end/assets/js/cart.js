// ==========================================================================
// FOOTBALL FASHION - CART.JS (Quản lý giỏ hàng)
// Hiển thị danh sách giỏ hàng, cập nhật số lượng, tính phí vận chuyển & gói quà
// ==========================================================================

// Lấy danh sách sản phẩm trong giỏ hàng từ localStorage
// Trả về: Mảng các sản phẩm trong giỏ hoặc mảng rỗng nếu chưa có dữ liệu
function getCart() {
    try { 
        return JSON.parse(localStorage.getItem('cart')) || []; 
    } catch { 
        return []; 
    }
}

// Lưu danh sách giỏ hàng mới vào localStorage và cập nhật số lượng trên badge ở Header
// Tham số cart: Mảng giỏ hàng cần lưu
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (typeof updateBadges === 'function') {
        updateBadges();
    }
}

// Chuẩn hóa đường dẫn ảnh của sản phẩm trong giỏ hàng để tránh lỗi hiển thị khi chuyển trang
// Tham số image: Đường dẫn ảnh cần xử lý
// Trả về: Đường dẫn ảnh đã chuẩn hóa
function normalizeCartImage(image) {
    if (typeof normalizeProductImage === 'function') {
        return normalizeProductImage(image);
    }
    const p = String(image || '');
    const i = p.lastIndexOf('Front_end/assets/');
    if (i >= 0) return '/' + p.substring(i);
    if (p.startsWith('../assets/')) return '/Front_end/' + p.substring(3);
    if (p.startsWith('./assets/')) return '/Front_end/' + p.substring(2);
    if (!p.includes('/')) return '/Front_end/assets/images/clubs/' + p;
    return p;
}

// Hiển thị danh sách sản phẩm trong giỏ hàng ra giao diện bảng giỏ hàng.
// - Tính tổng tiền tạm tính (subtotal)
// - Kiểm tra điều kiện miễn phí vận chuyển (ngưỡng 2.000.000đ)
// - Gắn các sự kiện thay đổi số lượng và xóa từng sản phẩm
function renderCart() {
    const cart = getCart();
    const tableBody = document.getElementById('cartTableBody');
    const giftWrap = document.getElementById('giftWrap');
    const shippingNotice = document.getElementById('shippingNotice');
    if (!tableBody) return;

    const giftWrapChecked = !!(giftWrap && giftWrap.checked);
    const threshold = 2000000; // Ngưỡng miễn phí vận chuyển là 2.000.000 VND

    // Trường hợp giỏ hàng trống
    if (cart.length === 0) {
        tableBody.innerHTML = `
            <div class="cart-empty">
                <p class="empty-text">Giỏ hàng trống! Hãy chọn áo đấu yêu thích.</p>
                <a href="../home/products/products.html" class="btn-primary">Khám phá sản phẩm</a>
            </div>`;
        updateTotals(0, giftWrapChecked);
        if (shippingNotice) {
            shippingNotice.innerHTML = 'Mua thêm <strong>2.000.000đ</strong> để được miễn phí vận chuyển';
        }
        return;
    }

    // Render từng sản phẩm trong giỏ hàng
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

    // Hiển thị thông báo ưu đãi miễn phí vận chuyển
    if (shippingNotice) {
        shippingNotice.innerHTML = subtotal < threshold
            ? `Mua thêm <strong>${(threshold - subtotal).toLocaleString('vi-VN')}đ</strong> để được miễn phí vận chuyển`
            : 'Chúc mừng! Đơn hàng của bạn được <strong>Miễn phí vận chuyển</strong>';
    }

    // Cập nhật các ô tổng tiền
    updateTotals(subtotal, giftWrapChecked);

    // Gắn sự kiện thay đổi số lượng khi người dùng chỉnh sửa ô input số lượng
    tableBody.querySelectorAll('[data-cart-quantity]').forEach(function (input) {
        input.addEventListener('change', function () {
            updateQuantity(Number(this.dataset.cartQuantity), this.value);
        });
    });

    // Gắn sự kiện xóa sản phẩm khi người dùng nhấn nút 'Xóa'
    tableBody.querySelectorAll('[data-cart-remove]').forEach(function (button) {
        button.addEventListener('click', function () {
            removeItem(Number(this.dataset.cartRemove));
        });
    });
}

// Tính toán và cập nhật các dòng tổng tiền (Tạm tính, Phí gói quà, Phí vận chuyển, Tổng thanh toán)
// Tham số subtotal: Tổng tiền hàng tạm tính
// Tham số giftWrapChecked: Trạng thái checkbox tùy chọn gói quà tặng
function updateTotals(subtotal, giftWrapChecked) {
    const gift = giftWrapChecked ? 10000 : 0;           // Phí gói quà 10.000 VND
    const shipping = subtotal >= 2000000 ? 0 : 30000;    // Phí ship 30.000 VND (miễn phí nếu đơn >= 2 triệu)
    
    const sub = document.getElementById('subTotal');
    const giftEl = document.getElementById('giftWrapPrice');
    const grand = document.getElementById('grandTotal');

    if (sub) sub.textContent = subtotal.toLocaleString('vi-VN') + 'đ';
    if (giftEl) giftEl.textContent = gift.toLocaleString('vi-VN') + 'đ';
    if (grand) grand.textContent = (subtotal + gift + shipping).toLocaleString('vi-VN') + 'đ';
}

// Cập nhật số lượng của một sản phẩm tại vị trí index trong giỏ hàng
// Tham số index: Vị trí của sản phẩm trong mảng giỏ hàng
// Tham số value: Số lượng mới được nhập
function updateQuantity(index, value) {
    const cart = getCart();
    const qty = parseInt(value, 10);
    if (!cart[index] || !Number.isFinite(qty) || qty < 1) return;
    cart[index].quantity = qty;
    saveCart(cart);
    renderCart();
}

// Xóa một sản phẩm tại vị trí index khỏi giỏ hàng
// Tham số index: Vị trí cần xóa trong mảng giỏ hàng
function removeItem(index) {
    const cart = getCart();
    if (cart[index]) {
        cart.splice(index, 1);
        saveCart(cart);
        renderCart();
    }
}

// ==========================================================================
// KHỞI TẠO SỰ KIỆN KHI TRANG TẢI XONG
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Lắng nghe sự kiện tick chọn gói quà để tính lại tổng tiền ngay
    const giftWrap = document.getElementById('giftWrap');
    if (giftWrap) {
        giftWrap.addEventListener('change', renderCart);
    }

    // Render danh sách sản phẩm trong giỏ hàng
    renderCart();

    // Cập nhật số lượng trên badge ở Header
    if (typeof updateBadges === 'function') {
        updateBadges();
    }
});
