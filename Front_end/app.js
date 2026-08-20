// FOOTBALL FASHION - APP.JS
function getCart() {
    try { return JSON.parse(localStorage.getItem('cart')) || []; }
    catch { return []; }
}

function getWishlist() {
    try { return JSON.parse(localStorage.getItem('wishlist')) || []; }
    catch { return []; }
}

function updateBadges() {
    const cart = getCart();
    const wishlist = getWishlist();
    const cartCount = cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);

    document.querySelectorAll('#cart-badge, .cart-badge')
        .forEach(el => el.textContent = cartCount);
    document.querySelectorAll('#wishlist-badge, .wishlist-badge')
        .forEach(el => el.textContent = wishlist.length);
}

document.addEventListener('DOMContentLoaded', updateBadges);


// Chuẩn hóa đường dẫn ảnh dùng chung cho toàn bộ project.
// APP_ROOT được xác định một lần khi app.js được tải để không phụ thuộc
// vào document.currentScript sau khi DOMContentLoaded/rendering chạy.
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

function normalizeProductImage(image) {
    const fallback = 'assets/images/clubs/manchester-united-2025-home.jpg';
    let p = String(image || '').trim().replace(/\\/g, '/');

    if (!p) {
        return new URL(fallback, APP_ROOT).href;
    }

    const marker = 'Front_end/assets/';
    const markerIndex = p.lastIndexOf(marker);

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

function migrateStoredImagePaths() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        let changed = false;

        cart.forEach(item => {
            const normalized = normalizeProductImage(item.image);
            if (item.image !== normalized) {
                item.image = normalized;
                changed = true;
            }
        });

        wishlist.forEach(item => {
            const normalized = normalizeProductImage(item.image);
            if (item.image !== normalized) {
                item.image = normalized;
                changed = true;
            }
        });

        if (changed) {
            localStorage.setItem('cart', JSON.stringify(cart));
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        }
    } catch (e) {
        console.warn('Không thể chuẩn hóa đường dẫn ảnh:', e);
    }
}

// Chạy trước khi các trang render dữ liệu.
migrateStoredImagePaths();
