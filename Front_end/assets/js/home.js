// ==========================================================================
// FOOTBALL FASHION - HOME.JS (Tiện ích tương tác trang chủ)
// Thêm nhanh vào giỏ hàng, thêm nhanh vào danh sách yêu thích và điều hướng
// ==========================================================================

// Thêm nhanh một sản phẩm vào giỏ hàng trực tiếp từ trang chủ
// Tham số id: ID sản phẩm
// Tham số name: Tên sản phẩm
// Tham số price: Đơn giá sản phẩm
// Tham số image: Đường dẫn hình ảnh sản phẩm
function quickAddHomeProduct(id, name, price, image) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let index = cart.findIndex(item => item.id === id);

    if (index !== -1) {
        // Nếu sản phẩm đã tồn tại trong giỏ thì tăng số lượng lên 1
        cart[index].quantity += 1;
    } else {
        // Nếu chưa có thì thêm sản phẩm mới (mặc định size 'M', số lượng 1)
        cart.push({ id, name, price, image, quantity: 1, size: 'M' });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    if (typeof updateBadges === "function") {
        updateBadges();
    }
    alert(`Đã thêm "${name}" vào giỏ hàng!`);
}

// Thêm nhanh một sản phẩm vào danh sách yêu thích trực tiếp từ trang chủ
// Tham số id: ID sản phẩm
// Tham số name: Tên sản phẩm
// Tham số price: Đơn giá sản phẩm
// Tham số image: Đường dẫn hình ảnh sản phẩm
function quickAddWishlist(id, name, price, image) {
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    if (!wishlist.some(item => item.id === id)) {
        wishlist.push({ id, name, price, image });
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        if (typeof updateBadges === "function") {
            updateBadges();
        }
        alert(`Đã thêm "${name}" vào danh sách yêu thích!`);
    } else {
        alert(`Sản phẩm này đã có trong danh sách yêu thích!`);
    }
}

// ==========================================================================
// KHỞI TẠO SỰ KIỆN TƯƠNG TÁC
// ==========================================================================
document.addEventListener('DOMContentLoaded', function () {
    // Gắn sự kiện chuyển hướng trang khi click vào các phần tử có thuộc tính [data-navigate]
    document.querySelectorAll('[data-navigate]').forEach(function (el) {
        el.addEventListener('click', function (event) {
            // Bỏ qua nếu người dùng click trúng vào một nút bấm bên trong
            if (event.target.closest('button')) return;
            window.location.href = el.dataset.navigate;
        });
    });

    // Gắn sự kiện click nút "Thêm nhanh" [data-quick-add]
    document.querySelectorAll('[data-quick-add]').forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            quickAddHomeProduct(
                Number(button.dataset.id),
                button.dataset.name,
                Number(button.dataset.price),
                button.dataset.image
            );
        });
    });
});
