"use strict";

document.addEventListener("DOMContentLoaded", () => {
    renderCheckoutSummary();
    updateBadges();
});

let discountAmount = 0;

function renderCheckoutSummary() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const container = document.getElementById("checkoutItems");
    const totalEl = document.getElementById("checkoutTotal");
    
    if (!container || !totalEl) return;

    if (cart.length === 0) {
        container.innerHTML = `<p style="color: #64748b; font-size: 14px; padding: 12px 0;">Giỏ hàng trống.</p>`;
        totalEl.textContent = "0đ";
        return;
    }

    let subTotal = 0;
    container.innerHTML = cart.map(item => {
        const itemPrice = Number(item.price) || 0;
        const itemQty = Number(item.quantity) || 1;
        const itemTotal = itemPrice * itemQty;
        subTotal += itemTotal;
        return `
            <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
                <span style="color: #334155;">${item.name} <strong style="color: #0f172a;">(x${itemQty})</strong></span>
                <strong style="color: #0f172a;">${itemTotal.toLocaleString("vi-VN")}đ</strong>
            </div>`;
    }).join("");

    const shippingFee = subTotal >= 2000000 ? 0 : 30000;
    const finalTotal = Math.max(0, subTotal + shippingFee - discountAmount);

    totalEl.textContent = finalTotal.toLocaleString("vi-VN") + "đ";
}

// Logic Mã giảm giá
function applyDiscount() {
    const input = document.getElementById("discountCode");
    const code = input ? input.value.trim().toUpperCase() : "";
    if (code === "FOOTBALL20" || code === "FASCO30") {
        discountAmount = 50000;
        alert("Áp dụng mã giảm giá 50.000đ thành công!");
        renderCheckoutSummary();
    } else if (code) {
        alert("Mã giảm giá không hợp lệ.");
    } else {
        alert("Vui lòng nhập mã giảm giá.");
    }
}

const checkoutForm = document.getElementById("checkoutForm");
if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        if (cart.length === 0) {
            alert("Giỏ hàng của bạn đang trống!");
            return;
        }

        const fullName = (document.getElementById("lastName")?.value || "") + " " + (document.getElementById("firstName")?.value || "");
        
        alert(`Chúc mừng ${fullName.trim() || "Quý khách"}! Đặt hàng thành công.\nFootball Fashion sẽ liên hệ để xác nhận và giao hàng trong thời gian sớm nhất.`);
        localStorage.removeItem("cart");
        window.location.href = "../../../index.html";
    });
}

function updateBadges() {
    try {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        const cartBadge = document.getElementById("cart-badge");
        const wishlistBadge = document.getElementById("wishlist-badge");
        
        const totalCart = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

        if (cartBadge) {
            cartBadge.textContent = totalCart;
            cartBadge.style.display = totalCart > 0 ? "inline-flex" : "none";
        }
        if (wishlistBadge) {
            wishlistBadge.textContent = wishlist.length;
            wishlistBadge.style.display = wishlist.length > 0 ? "inline-flex" : "none";
        }
    } catch(e) {}
}