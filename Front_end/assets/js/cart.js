document.addEventListener("DOMContentLoaded", () => {
    renderCart();
    updateBadges(); 
});

function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateBadges(); // Cập nhật số lượng trên icon mỗi khi thay đổi
}

function renderCart() {
    const cart = getCart();
    const tableBody = document.getElementById("cartTableBody");
    const giftWrapChecked = document.getElementById("giftWrap")?.checked || false;
    const shippingNotice = document.getElementById("shippingNotice");
    
    let subTotal = 0;
    const shippingThreshold = 2000000; // Miễn phí vận chuyển cho đơn trên 2tr

    if (cart.length === 0) {
        document.getElementById("cartContent").innerHTML = `
            <div class="empty-box">
                <p class="empty-text">Giỏ hàng trống! Hãy chọn áo đấu yêu thích.</p>
                <a href="../home/products/products.html" class="btn-primary">Khám phá sản phẩm</a>
            </div>`;
        return;
    }

    tableBody.innerHTML = cart.map((item, index) => {
        const itemTotal = item.price * item.quantity;
        subTotal += itemTotal;
        return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <img src="${item.image}" width="60" alt="${item.name}">
                        <div>
                            <strong>${item.name}</strong><br>
                            <small class="text-muted">Size: ${item.size || 'M'}</small>
                        </div>
                    </div>
                </td>
                <td>${Number(item.price).toLocaleString("vi-VN")}đ</td>
                <td>
                    <input type="number" min="1" value="${item.quantity}" 
                    onchange="updateQuantity(${index}, this.value)" style="width: 50px;">
                </td>
                <td>${itemTotal.toLocaleString("vi-VN")}đ</td>
                <td><button onclick="removeItem(${index})" style="color: var(--color-danger); cursor:pointer; border:none; background:none;">Xóa</button></td>
            </tr>`;
    }).join("");

    //  Thông báo vận chuyển 
    if (subTotal < shippingThreshold) {
        const remaining = shippingThreshold - subTotal;
        shippingNotice.innerHTML = `Mua thêm <strong>${remaining.toLocaleString("vi-VN")}đ</strong> để được miễn phí vận chuyển`;
    } else {
        shippingNotice.innerHTML = `Chúc mừng! Đơn hàng của bạn được <strong>Miễn phí vận chuyển</strong>`;
    }

    const giftWrapFee = giftWrapChecked ? 10000 : 0;
    const shippingFee = subTotal >= shippingThreshold ? 0 : 30000;

    document.getElementById("subTotal").textContent = subTotal.toLocaleString("vi-VN") + "đ";
    document.getElementById("giftWrapPrice").textContent = giftWrapFee.toLocaleString("vi-VN") + "đ";
    document.getElementById("grandTotal").textContent = (subTotal + shippingFee + giftWrapFee).toLocaleString("vi-VN") + "đ";
}

function updateQuantity(index, qty) {
    const cart = getCart();
    if (qty > 0) {
        cart[index].quantity = parseInt(qty);
        saveCart(cart);
        renderCart();
    }
}

function removeItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
}
function updateBadges() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    
    const cartBadge = document.getElementById("cart-badge");
    const wishlistBadge = document.getElementById("wishlist-badge");
    
    if (cartBadge) cartBadge.textContent = cart.length;
    if (wishlistBadge) wishlistBadge.textContent = wishlist.length;
}
