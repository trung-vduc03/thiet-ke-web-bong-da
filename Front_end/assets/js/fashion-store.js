// ==========================================================================
// FOOTBALL FASHION - FASHION-STORE.JS (Trang chủ / Sản phẩm nổi bật)
// Tải danh sách 4 sản phẩm tiêu biểu từ database và hiển thị lên trang chủ
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    // Cập nhật số lượng giỏ hàng và yêu thích trên thanh điều hướng
    updateBadges();

    // Tải dữ liệu sản phẩm từ file database/products.json
    fetch("../database/products.json")
        .then((res) => res.json())
        .then((products) => {
            const grid = document.getElementById("homeProductGrid");
            if (!grid) return;

            // Lấy 4 sản phẩm đầu tiên làm sản phẩm nổi bật trên trang chủ
            const featured = products.slice(0, 4);

            // Render giao diện thẻ sản phẩm nổi bật
            grid.innerHTML = featured
                .map(
                    (p) => `
                <div class="product-card fashion-product-card">
                    <a href="pages/home/products/products-detail.html?id=${p.id}" class="fashion-product-link">
                        <div class="fashion-product-image-wrap">
                            <img src="${typeof normalizeProductImage === 'function' ? normalizeProductImage(p.image) : p.image}" alt="${p.name}" class="fashion-product-image" />
                        </div>
                        <h3 class="fashion-product-name">${p.name}</h3>
                    </a>
                    <p class="fashion-product-price">${Number(p.price).toLocaleString("vi-VN")}đ</p>
                    <a href="pages/home/products/products.html" class="fashion-product-detail">Xem chi tiết</a>
                </div>
            `
                )
                .join("");
        })
        .catch(() => {
            // Hiển thị thông báo dự phòng nếu không tải được dữ liệu json
            const grid = document.getElementById("homeProductGrid");
            if (grid) {
                grid.innerHTML = `<p class="fashion-empty">Ghé thăm trang Sản phẩm để chọn áo đấu yêu thích!</p>`;
            }
        });
});

// Cập nhật số lượng giỏ hàng và danh sách yêu thích hiển thị trên các nút điều hướng Header
function updateBadges() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const totalCart = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

    const cartNav = document.getElementById("cartNav");
    const wishlistNav = document.getElementById("wishlistNav");

    if (cartNav) cartNav.textContent = `Giỏ hàng (${totalCart})`;
    if (wishlistNav) wishlistNav.textContent = `Yêu thích (${wishlist.length})`;
}
