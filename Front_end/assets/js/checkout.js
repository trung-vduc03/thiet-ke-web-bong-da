"use strict";

let discountAmount = 0;

function getCheckoutCart() {
    try { return JSON.parse(localStorage.getItem("cart")) || []; }
    catch { return []; }
}

function renderCheckoutSummary() {
    const cart = getCheckoutCart();
    const container = document.getElementById("checkoutItems");
    const totalEl = document.getElementById("checkoutTotal");
    if (!container || !totalEl) return;

    if (!cart.length) {
        container.innerHTML = '<p class="empty-text">Giỏ hàng đang trống.</p>';
        totalEl.textContent = "0đ";
        return;
    }

    let subTotal = 0;
    container.innerHTML = cart.map(item => {
        const quantity = Math.max(1, Number(item.quantity) || 1);
        const itemTotal = (Number(item.price) || 0) * quantity;
        subTotal += itemTotal;
        return `<div class="summary-row"><span>${item.name} (x${quantity})</span><strong>${itemTotal.toLocaleString("vi-VN")}đ</strong></div>`;
    }).join("");

    const shipping = subTotal >= 2000000 ? 0 : 30000;
    const total = Math.max(0, subTotal + shipping - discountAmount);
    totalEl.textContent = total.toLocaleString("vi-VN") + "đ";
}

function applyDiscount() {
    const input = document.getElementById("discountCode");
    const code = (input?.value || "").trim().toUpperCase();
    if (code === "FASCO30") {
        discountAmount = 30000;
        alert("Áp dụng mã giảm giá 30.000đ thành công!");
    } else {
        discountAmount = 0;
        alert("Mã giảm giá không hợp lệ.");
    }
    renderCheckoutSummary();
}

document.addEventListener("DOMContentLoaded", () => {
    renderCheckoutSummary();
    if (typeof updateBadges === "function") updateBadges();

    const form = document.getElementById("checkoutForm");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const cart = getCheckoutCart();
            if (!cart.length) {
                alert("Giỏ hàng đang trống.");
                return;
            }
            localStorage.removeItem("cart");
            window.location.href = "success.html";
        });
    }
});

document.addEventListener('DOMContentLoaded', function(){ const btn=document.getElementById('applyDiscountBtn'); if(btn) btn.addEventListener('click', applyDiscount); });
