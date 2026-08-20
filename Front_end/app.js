// ==========================================================================
// FOOTBALL FASHION - APP.JS (Core Application Utilities)
// Quản lý trạng thái dùng chung, badge thông báo và chuẩn hóa đường dẫn tài nguyên
// ==========================================================================

// Lấy danh sách sản phẩm trong giỏ hàng từ localStorage
// Trả về mảng các sản phẩm trong giỏ hoặc mảng rỗng nếu chưa có/lỗi
function getCart() {
    try { 
        return JSON.parse(localStorage.getItem('cart')) || []; 
    } catch { 
        return []; 
    }
}

// Lấy danh sách sản phẩm yêu thích từ localStorage
// Trả về mảng các sản phẩm yêu thích hoặc mảng rỗng nếu chưa có/lỗi
function getWishlist() {
    try { 
        return JSON.parse(localStorage.getItem('wishlist')) || []; 
    } catch { 
        return []; 
    }
}

// Cập nhật số lượng hiển thị trên các huy hiệu (badge) giỏ hàng và danh sách yêu thích ở Header
// - Badge giỏ hàng: Tổng số lượng tất cả mặt hàng (tổng item.quantity)
// - Badge yêu thích: Tổng số lượng sản phẩm đã lưu
function updateBadges() {
    const cart = getCart();
    const wishlist = getWishlist();
    const cartCount = cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);

    // Cập nhật tất cả các phần tử hiển thị badge giỏ hàng trên giao diện
    document.querySelectorAll('#cart-badge, .cart-badge')
        .forEach(el => el.textContent = cartCount);

    // Cập nhật tất cả các phần tử hiển thị badge yêu thích trên giao diện
    document.querySelectorAll('#wishlist-badge, .wishlist-badge')
        .forEach(el => el.textContent = wishlist.length);
}

// Lắng nghe sự kiện khi DOM được tải xong để cập nhật badge ngay lập tức
document.addEventListener('DOMContentLoaded', updateBadges);


// ==========================================================================
// CHUẨN HÓA ĐƯỜNG DẪN ẢNH VÀ DỮ LIỆU
// ==========================================================================

// Tự động xác định URL gốc của thư mục Front_end để các trang con ở bất kỳ cấp thư mục nào
// (ví dụ /Front_end/pages/home/products/...) đều có thể truy cập ảnh và tài nguyên chính xác.
const APP_ROOT = (() => {
    const currentScript = document.currentScript;
    if (currentScript && currentScript.src) {
        return new URL('./', currentScript.src);
    }

    const marker = '/Front_end/';
    const markerIndex = window.location.pathname.indexOf(marker);
    if (markerIndex >= 0) {
        return new URL(
            window.location.origin + window.location.pathname.slice(0, markerIndex + marker.length)
        );
    }

    return new URL('./', window.location.href);
})();

// Chuẩn hóa đường dẫn hình ảnh sản phẩm từ nhiều nguồn/định dạng khác nhau về URL hợp lệ tuyệt đối
// Tham số image: Đường dẫn ảnh đầu vào (tương đối, tuyệt đối, hoặc chỉ tên file)
// Trả về: Đường dẫn URL ảnh hoàn chỉnh và hợp lệ
function normalizeProductImage(image) {
    const fallback = 'assets/images/clubs/manchester-united-2025-home.jpg';
    let p = String(image || '').trim().replace(/\\/g, '/');

    // Nếu không có đường dẫn ảnh, trả về ảnh mặc định dự phòng
    if (!p) {
        return new URL(fallback, APP_ROOT).href;
    }

    const marker = 'Front_end/assets/';
    const markerIndex = p.lastIndexOf(marker);

    // Xử lý các định dạng đường dẫn khác nhau
    if (markerIndex >= 0) {
        p = p.substring(markerIndex + 'Front_end/'.length);
    } else if (p.startsWith('/Front_end/')) {
        p = p.substring('/Front_end/'.length);
    } else if (p.startsWith('../assets/')) {
        p = p.substring('../'.length);
    } else if (p.startsWith('./assets/')) {
        p = p.substring('./'.length);
    } else if (p.startsWith('/assets/')) {
        p = p.substring(1);
    } else if (p.startsWith('/')) {
        return new URL(p, window.location.origin).href;
    } else if (!p.startsWith('assets/')) {
        p = 'assets/images/clubs/' + p.split('/').pop();
    }

    try {
        return new URL(p, APP_ROOT).href;
    } catch (error) {
        return new URL(fallback, APP_ROOT).href;
    }
}

// Tự động di chuyển và cập nhật lại các đường dẫn ảnh cũ được lưu trong localStorage (cart, wishlist)
// sang định dạng chuẩn hóa mới, tránh lỗi hiển thị ảnh vỡ khi chuyển đổi môi trường hoặc chạy Live Server.
function migrateStoredImagePaths() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        let changed = false;

        // Chuẩn hóa ảnh trong giỏ hàng
        cart.forEach(item => {
            const normalized = normalizeProductImage(item.image);
            if (item.image !== normalized) {
                item.image = normalized;
                changed = true;
            }
        });

        // Chuẩn hóa ảnh trong danh sách yêu thích
        wishlist.forEach(item => {
            const normalized = normalizeProductImage(item.image);
            if (item.image !== normalized) {
                item.image = normalized;
                changed = true;
            }
        });

        // Lưu lại nếu có sự thay đổi
        if (changed) {
            localStorage.setItem('cart', JSON.stringify(cart));
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        }
    } catch (e) {
        console.warn('Không thể chuẩn hóa đường dẫn ảnh:', e);
    }
}

// Thực thi chuẩn hóa dữ liệu lưu trữ ngay khi app.js được nạp
migrateStoredImagePaths();
