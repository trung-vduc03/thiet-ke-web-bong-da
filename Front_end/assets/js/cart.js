document.addEventListener("DOMContentLoaded", () => {
    renderCart();
});

function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function renderCart() {
    const cart = getCart();
    const tbody = document.getElementById("cartTableBody");
    const emptyMsg = document.getElementById("emptyCartMsg");
    const tableWrapper = document.querySelector(".cart-table-wrapper");
    const btnCheckout = document.getElementById("btnCheckout");

    if (!tbody) return;

    if (cart.length === 0) {
        if (tableWrapper) tableWrapper.classList.add("hidden");
        if (emptyMsg) emptyMsg.classList.remove("hidden");
        if (btnCheckout) {
            btnCheckout.style.pointerEvents = "none";
            btnCheckout.style.opacity = "0.5";
        }
        updateTotalSummary(0);
        return;
    }

    if (tableWrapper) tableWrapper.classList.remove("hidden");
    if (emptyMsg) emptyMsg.classList.add("hidden");
    if (btnCheckout) {
        btnCheckout.style.pointerEvents = "auto";
        btnCheckout.style.opacity = "1";
    }

    let subTotal = 0;

    tbody.innerHTML = cart.map((item, index) => {
        const total = item.price * item.quantity;
        subTotal += total;
        return `
            <tr>
                <td>
                    <div class="product-item">
                        <img src="${item.image}" alt="${item.name}" class="product-thumb">
                        <div>
                            <strong>${item.name}</strong>
                            <div class="product-meta">Size: ${item.size || 'M'}</div>
                        </div>
                    </div>
                </td>
                <td>${Number(item.price).toLocaleString("vi-VN")}đ</td>
                <td>
                    <button onclick="changeQty(${index}, -1)" class="btn-qty">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQty(${index}, 1)" class="btn-qty">+</button>
                </td>
                <td><strong>${total.toLocaleString("vi-VN")}đ</strong></td>
                <td>
                    <button onclick="removeItem(${index})" class="btn-remove">Xóa</button>
                </td>
            </tr>
        `;
    }).join('');

    updateTotalSummary(subTotal);
}

function changeQty(index, delta) {
    let cart = getCart();
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveCart(cart);
    renderCart();
}

function removeItem(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
}

function updateTotalSummary(subTotal) {
    const shipping = subTotal > 0 ? 30000 : 0;
    const subTotalElem = document.getElementById("subTotal");
    const grandTotalElem = document.getElementById("grandTotal");
    
    if (subTotalElem) subTotalElem.textContent = ${subTotal.toLocaleString("vi-VN")}đ;
    if (grandTotalElem) grandTotalElem.textContent = ${(subTotal + shipping).toLocaleString("vi-VN")}đ;
}