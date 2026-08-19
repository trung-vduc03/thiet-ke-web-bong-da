document.addEventListener("DOMContentLoaded", () => {
    renderCheckoutSummary();
    updateBadges();
});

function renderCheckoutSummary() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const container = document.getElementById("checkoutItems");
    const totalEl = document.getElementById("checkoutTotal");
    
    let subTotal = 0;
    container.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        subTotal += itemTotal;
        return `
            <div class="summary-row">
                <span>${item.name} (x${item.quantity})</span>
                <strong>${itemTotal.toLocaleString("vi-VN")}đ</strong>
            </div>`;
    }).join("");

    totalEl.textContent = (subTotal + 30000).toLocaleString("vi-VN") + "đ";
}

// Logic Mã giảm giá
function applyDiscount() {
    const code = document.getElementById("discountCode").value;
    if (code === "FASCO30") {
        alert("Áp dụng mã giảm giá 30.000đ thành công!");
        // Thêm logic trừ tiền vào grandTotal tại đây
    } else {
        alert("Mã giảm giá không hợp lệ.");
    }
}

document.getElementById("checkoutForm").addEventListener("submit", (e) => {
    e.preventDefault();
    // Giả lập lưu đơn hàng vào danh sách orders
    const orderData = {
        customer: document.getElementById("fullName").value,
        items: JSON.parse(localStorage.getItem("cart")),
        date: new Date().toISOString()
    };
    
    alert("Đặt hàng thành công! FASCO sẽ liên hệ bạn sớm.");
    localStorage.removeItem("cart"); // Xóa giỏ hàng sau khi thanh toán 
    window.location.href = "success.html"; // Chuyển đến trang thành công
});