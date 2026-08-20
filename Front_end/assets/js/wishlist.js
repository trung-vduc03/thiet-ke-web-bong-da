// FOOTBALL FASHION - WISHLIST.JS
function getWishlist() {
    try { return JSON.parse(localStorage.getItem('wishlist')) || []; }
    catch { return []; }
}

function saveWishlist(wishlist) {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    if (typeof updateBadges === 'function') updateBadges();
}

function normalizeWishlistImage(image) {
    if (typeof normalizeProductImage === 'function') return normalizeProductImage(image);
    const p = String(image || '');
    const i = p.lastIndexOf('Front_end/assets/');
    if (i >= 0) return '/' + p.substring(i);
    if (!p.includes('/')) return '/Front_end/assets/images/clubs/' + p;
    return p;
}

function renderWishlist() {
    const wishlist = getWishlist();
    const grid = document.getElementById('wishlistGrid');
    const emptyMsg = document.getElementById('emptyWishlistMsg');
    if (!grid || !emptyMsg) return;

    if (wishlist.length === 0) {
        grid.classList.add('hidden');
        emptyMsg.classList.remove('hidden');
        if (typeof updateBadges === 'function') updateBadges();
        return;
    }

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
    if (typeof updateBadges === 'function') updateBadges();
}

function removeWishlist(id) {
    const wishlist = getWishlist().filter(item => String(item.id) !== String(id));
    saveWishlist(wishlist);
    renderWishlist();
    bindWishlistDeleteButtons();
}

function bindWishlistDeleteButtons() {
    document.querySelectorAll('[data-remove-wishlist]').forEach(function (button) {
        button.addEventListener('click', function () {
            removeWishlist(this.dataset.removeWishlist);
        });
    });
}

document.addEventListener('DOMContentLoaded', function () { renderWishlist(); bindWishlistDeleteButtons(); });
