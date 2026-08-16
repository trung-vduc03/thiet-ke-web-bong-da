document.addEventListener("DOMContentLoaded", () => {
    renderCheckoutSummary();

    const form = document.getElementById("checkoutForm");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            
            if (cart.length === 0) {
                alert("Giỏ hàng trống! Vui lòng chọn sản phẩm trước khi thanh toán.");
                return;
            }

            alert("Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại STYLE HUB.");
            localStorage.removeItem("cart");
            window.location.href = "../index.html";
        });
    }
});

function renderCheckoutSummary() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const container = document.getElementById("checkoutItems");
    
    if (!container) return;

    let subTotal = 0;
    container.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        subTotal += itemTotal;
        return `
            <div class="summary-row">
                <span>${item.name} (x${item.quantity})</span>
                <strong>${itemTotal.toLocaleString("vi-VN")}đ</strong>
            </div>
        `;
    }).join('');

    const shipping = cart.length > 0 ? 30000 : 0;
    const totalElem = document.getElementById("checkoutTotal");
    if (totalElem) {
        totalElem.textContent = ${(subTotal + shipping).toLocaleString("vi-VN")}đ;
    }
}