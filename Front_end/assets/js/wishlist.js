// ==========================================================================
// FOOTBALL FASHION - WISHLIST.JS (Quản lý trang Danh sách yêu thích)
// Hiển thị các sản phẩm đã lưu, xóa sản phẩm và đồng bộ số lượng
// ==========================================================================

// Lấy danh sách sản phẩm yêu thích từ localStorage
// Trả về: Mảng các sản phẩm yêu thích hoặc mảng rỗng nếu chưa có dữ liệu
function getWishlist() {
    try { 
        return JSON.parse(localStorage.getItem('wishlist')) || []; 
    } catch { 
        return []; 
    }
}

// Lưu danh sách sản phẩm yêu thích vào localStorage và cập nhật lại badge Header
// Tham số wishlist: Mảng danh sách yêu thích cần lưu
function saveWishlist(wishlist) {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    if (typeof updateBadges === 'function') {
        updateBadges();
    }
}

// Chuẩn hóa đường dẫn hình ảnh của sản phẩm yêu thích
// Tham số image: Đường dẫn ảnh đầu vào
// Trả về: Đường dẫn ảnh đã chuẩn hóa
function normalizeWishlistImage(image) {
    if (typeof normalizeProductImage === 'function') {
        return normalizeProductImage(image);
    }
    const p = String(image || '');
    const i = p.lastIndexOf('Front_end/assets/');
    if (i >= 0) return '/' + p.substring(i);
    if (p.startsWith('../assets/')) return '/Front_end/' + p.substring(3);
    if (p.startsWith('./assets/')) return '/Front_end/' + p.substring(2);
    if (!p.includes('/')) return '/Front_end/assets/images/clubs/' + p;
    return p;
}

// Hiển thị danh sách sản phẩm trong trang Yêu thích:
// - Nếu không có sản phẩm: Ẩn lưới và hiển thị thông báo danh sách trống
// - Nếu có sản phẩm: Render từng thẻ sản phẩm kèm nút xóa
function renderWishlist() {
    const wishlist = getWishlist();
    const grid = document.getElementById('wishlistGrid');
    const emptyMsg = document.getElementById('emptyWishlistMsg');
    if (!grid || !emptyMsg) return;

    // Trường hợp danh sách yêu thích trống
    if (wishlist.length === 0) {
        grid.classList.add('hidden');
        emptyMsg.classList.remove('hidden');
        if (typeof updateBadges === 'function') {
            updateBadges();
        }
        return;
    }

    // Hiển thị lưới và render danh sách sản phẩm
    grid.classList.remove('hidden');
    emptyMsg.classList.add('hidden');
    grid.innerHTML = wishlist.map(item => `
        <div class="wishlist-card">
            <img src="${normalizeWishlistImage(item.image)}" alt="${item.name}" class="wishlist-thumb">
            <h2>${item.name}</h2>
            <p class="price-text">${Number(item.price || 0).toLocaleString('vi-VN')}đ</p>
            <button type="button" class="btn-delete" data-remove-wishlist="${String(item.id)}">Xóa khỏi Yêu thích</button>
        </div>
    `).join('');

    if (typeof updateBadges === 'function') {
        updateBadges();
    }
}

// Xóa một sản phẩm khỏi danh sách yêu thích theo ID
// Tham số id: ID sản phẩm cần xóa
function removeWishlist(id) {
    const wishlist = getWishlist().filter(item => String(item.id) !== String(id));
    saveWishlist(wishlist);
    renderWishlist();
    bindWishlistDeleteButtons();
}

// Gắn sự kiện click cho các nút "Xóa khỏi Yêu thích"
function bindWishlistDeleteButtons() {
    document.querySelectorAll('[data-remove-wishlist]').forEach(function (button) {
        button.addEventListener('click', function () {
            removeWishlist(this.dataset.removeWishlist);
        });
    });
}

// ==========================================================================
// KHỞI TẠO KHI TRANG TẢI XONG
// ==========================================================================
document.addEventListener('DOMContentLoaded', function () {
    renderWishlist();
    bindWishlistDeleteButtons();
});
