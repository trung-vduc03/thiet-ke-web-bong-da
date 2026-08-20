"use strict";

// ==========================================================================
// FOOTBALL FASHION - CHECKOUT.JS (Quản lý thanh toán và đặt hàng)
// Tính toán hóa đơn, áp dụng mã giảm giá và xử lý hoàn tất đơn hàng
// ==========================================================================

let discountAmount = 0; // Số tiền giảm giá được áp dụng (VND)

// Lấy danh sách sản phẩm cần thanh toán từ localStorage
// Trả về: Mảng các mặt hàng trong giỏ hoặc mảng rỗng
function getCheckoutCart() {
    try { 
        return JSON.parse(localStorage.getItem("cart")) || []; 
    } catch { 
        return []; 
    }
}

// Hiển thị bảng tóm tắt đơn hàng (danh sách món hàng, số lượng, tạm tính, phí ship, giảm giá, tổng tiền)
function renderCheckoutSummary() {
    const cart = getCheckoutCart();
    const container = document.getElementById("checkoutItems");
    const totalEl = document.getElementById("checkoutTotal");
    if (!container || !totalEl) return;

    // Trường hợp giỏ hàng trống
    if (!cart.length) {
        container.innerHTML = '<p class="empty-text">Giỏ hàng đang trống.</p>';
        totalEl.textContent = "0đ";
        return;
    }

    // Tính tổng tiền hàng (subTotal) và render từng dòng tóm tắt sản phẩm
    let subTotal = 0;
    container.innerHTML = cart.map(item => {
        const quantity = Math.max(1, Number(item.quantity) || 1);
        const itemTotal = (Number(item.price) || 0) * quantity;
        subTotal += itemTotal;
        return `<div class="summary-row"><span>${item.name} (x${quantity})</span><strong>${itemTotal.toLocaleString("vi-VN")}đ</strong></div>`;
    }).join("");

    // Phí vận chuyển: Miễn phí nếu tổng đơn >= 2.000.000đ, ngược lại là 30.000đ
    const shipping = subTotal >= 2000000 ? 0 : 30000;

    // Tổng tiền thanh toán cuối cùng sau khi cộng phí ship và trừ mã giảm giá
    const total = Math.max(0, subTotal + shipping - discountAmount);
    totalEl.textContent = total.toLocaleString("vi-VN") + "đ";
}

// Kiểm tra và áp dụng mã giảm giá (Coupon/Voucher code)
// - Ví dụ mã hợp lệ: "FASCO30" -> Giảm 30.000 VND
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

    // Cập nhật lại tổng tiền sau khi áp dụng mã giảm giá
    renderCheckoutSummary();
}

// ==========================================================================
// KHỞI TẠO SỰ KIỆN KHI TRANG TẢI XONG
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    // Hiển thị tóm tắt đơn hàng ban đầu
    renderCheckoutSummary();

    // Cập nhật badge đếm số lượng trên Header
    if (typeof updateBadges === "function") {
        updateBadges();
    }

    // Gắn sự kiện submit form thanh toán
    const form = document.getElementById("checkoutForm");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const cart = getCheckoutCart();

            if (!cart.length) {
                alert("Giỏ hàng đang trống.");
                return;
            }

            // Xóa sạch giỏ hàng trong localStorage sau khi đặt hàng thành công
            localStorage.removeItem("cart");

            // Chuyển hướng người dùng đến trang xác nhận đặt hàng thành công
            window.location.href = "success.html";
        });
    }

    // Gắn sự kiện click cho nút áp dụng mã giảm giá
    const btn = document.getElementById('applyDiscountBtn');
    if (btn) {
        btn.addEventListener('click', applyDiscount);
    }
});
