"use strict";

document.addEventListener("DOMContentLoaded", () => {
    renderCart();
    updateBadges(); 
});

function getCart() {
    try {
        return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem("cart", JSON.stringify(cart));
        updateBadges();
    } catch (e) {
        console.error("Lỗi lưu giỏ hàng:", e);
    }
}

function getCartImage(imagePath) {
    if (!imagePath) return "../../assets/images/clubs/manchester-united-2025-home.jpg";
    if (imagePath.startsWith("http") || imagePath.startsWith("data:")) return imagePath;
    const fileName = imagePath.split("/").pop();
    return "../../assets/images/clubs/" + fileName;
}

function renderCart() {
    const cart = getCart();
    const tableBody = document.getElementById("cartTableBody");
    const tableWrapper = document.getElementById("cartTableWrapper");
    const giftWrapChecked = document.getElementById("giftWrap")?.checked || false;
    const shippingNotice = document.getElementById("shippingNotice");
    const checkoutBtn = document.getElementById("checkoutBtn");
    
    let subTotal = 0;
    const shippingThreshold = 2000000; // Miễn phí vận chuyển cho đơn trên 2tr

    if (cart.length === 0) {
        if (tableWrapper) {
            tableWrapper.innerHTML = `
                <div class="empty-box" style="text-align: center; padding: 48px 20px; background: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1;">
                    <p class="empty-text" style="font-size: 16px; color: #64748b; margin-bottom: 20px; font-weight: 500;">Giỏ hàng của bạn đang trống! Hãy chọn những mẫu áo đấu yêu thích.</p>
                    <a href="../home/products/products.html" class="btn-primary" style="display: inline-block; text-decoration: none; padding: 12px 28px; border-radius: 6px;">Khám phá sản phẩm ngay</a>
                </div>`;
        }
        if (shippingNotice) shippingNotice.style.display = "none";
        if (document.getElementById("subTotal")) document.getElementById("subTotal").textContent = "0đ";
        if (document.getElementById("giftWrapPrice")) document.getElementById("giftWrapPrice").textContent = "0đ";
        if (document.getElementById("grandTotal")) document.getElementById("grandTotal").textContent = "0đ";
        if (checkoutBtn) {
            checkoutBtn.style.pointerEvents = "none";
            checkoutBtn.style.opacity = "0.5";
        }
        return;
    }

    if (checkoutBtn) {
        checkoutBtn.style.pointerEvents = "auto";
        checkoutBtn.style.opacity = "1";
    }

    if (tableBody) {
        tableBody.innerHTML = cart.map((item, index) => {
            const itemPrice = Number(item.price) || 0;
            const itemQty = Number(item.quantity) || 1;
            const itemTotal = itemPrice * itemQty;
            subTotal += itemTotal;
            const imgSrc = getCartImage(item.image);

            return `
                <tr>
                    <td style="padding: 12px 8px;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <img src="${imgSrc}" width="65" height="65" style="object-fit: contain; border-radius: 6px; background: #f1f5f9;" alt="${item.name}" onerror="this.src='../../assets/images/clubs/manchester-united-2025-home.jpg'">
                            <div>
                                <a href="../home/products/products-detail.html?id=${item.id}" style="font-weight: 600; color: #0f172a; text-decoration: none; display: block; margin-bottom: 4px;">${item.name}</a>
                                <small style="color: #64748b; font-size: 12px;">Size: <strong>${item.size || 'M'}</strong> ${item.color ? `| Màu: ${item.color}` : ''}</small>
                            </div>
                        </div>
                    </td>
                    <td style="padding: 12px 8px; font-weight: 600;">${itemPrice.toLocaleString("vi-VN")}đ</td>
                    <td style="padding: 12px 8px;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <button type="button" onclick="updateQuantity(${index}, ${itemQty - 1})" style="width: 28px; height: 28px; border: 1px solid #cbd5e1; background: #fff; border-radius: 4px; cursor: pointer; font-weight: bold;">-</button>
                            <span style="min-width: 24px; text-align: center; font-weight: 600;">${itemQty}</span>
                            <button type="button" onclick="updateQuantity(${index}, ${itemQty + 1})" style="width: 28px; height: 28px; border: 1px solid #cbd5e1; background: #fff; border-radius: 4px; cursor: pointer; font-weight: bold;">+</button>
                        </div>
                    </td>
                    <td style="padding: 12px 8px; font-weight: 700; color: #0f172a;">${itemTotal.toLocaleString("vi-VN")}đ</td>
                    <td style="padding: 12px 8px; text-align: center;">
                        <button onclick="removeItem(${index})" style="color: #ef4444; cursor: pointer; border: 1px solid #fecaca; background: #fef2f2; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600;">Xóa</button>
                    </td>
                </tr>`;
        }).join("");
    }

    if (shippingNotice) {
        shippingNotice.style.display = "block";
        if (subTotal < shippingThreshold) {
            const remaining = shippingThreshold - subTotal;
            shippingNotice.innerHTML = `Mua thêm <strong>${remaining.toLocaleString("vi-VN")}đ</strong> để được miễn phí vận chuyển`;
        } else {
            shippingNotice.innerHTML = `Chúc mừng! Đơn hàng của bạn được <strong>Miễn phí vận chuyển</strong>`;
        }
    }

    const giftWrapFee = giftWrapChecked ? 10000 : 0;
    const shippingFee = subTotal >= shippingThreshold ? 0 : 30000;

    if (document.getElementById("subTotal")) {
        document.getElementById("subTotal").textContent = subTotal.toLocaleString("vi-VN") + "đ";
    }
    if (document.getElementById("giftWrapPrice")) {
        document.getElementById("giftWrapPrice").textContent = giftWrapFee.toLocaleString("vi-VN") + "đ";
    }
    if (document.getElementById("grandTotal")) {
        document.getElementById("grandTotal").textContent = (subTotal + shippingFee + giftWrapFee).toLocaleString("vi-VN") + "đ";
    }
}

function updateQuantity(index, qty) {
    const cart = getCart();
    if (qty > 0) {
        cart[index].quantity = parseInt(qty);
        saveCart(cart);
        renderCart();
    } else {
        removeItem(index);
    }
}

function removeItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
}

function updateBadges() {
    try {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        
        const cartBadge = document.getElementById("cart-badge");
        const wishlistBadge = document.getElementById("wishlist-badge");
        
        const totalCount = cart.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0);

        if (cartBadge) {
            cartBadge.textContent = totalCount;
            cartBadge.style.display = totalCount > 0 ? "inline-flex" : "none";
        }
        if (wishlistBadge) {
            wishlistBadge.textContent = wishlist.length;
            wishlistBadge.style.display = wishlist.length > 0 ? "inline-flex" : "none";
        }
    } catch (e) {}
}
