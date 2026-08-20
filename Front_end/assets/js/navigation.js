// ==========================================================================
// FOOTBALL FASHION - NAVIGATION.JS (Thanh điều hướng Responsive)
// Xử lý đóng/mở menu trên thiết bị di động (Mobile Menu Toggle)
// ==========================================================================

document.addEventListener('DOMContentLoaded', function () {
    // Tìm tất cả các khối Header có khai báo thuộc tính [data-mobile-nav]
    document.querySelectorAll('[data-mobile-nav]').forEach(function (header) {
        const button = header.querySelector('.mobile-menu-toggle');
        const nav = header.querySelector('.main-nav, .simple-nav');
        if (!button || !nav) return;

        // Bật/tắt mở menu khi bấm vào nút hamburger trên mobile
        button.addEventListener('click', function () {
            const open = header.classList.toggle('menu-open');
            button.setAttribute('aria-expanded', String(open));
            button.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
        });

        // Tự động đóng menu khi người dùng click vào bất kỳ liên kết điều hướng nào
        nav.addEventListener('click', function (event) {
            if (event.target.closest('a')) {
                header.classList.remove('menu-open');
                button.setAttribute('aria-expanded', 'false');
                button.setAttribute('aria-label', 'Mở menu');
            }
        });

        // Tự động đóng menu mobile khi màn hình được kéo dãn về kích thước Desktop (>= 768px)
        window.addEventListener('resize', function () {
            if (window.innerWidth >= 768) {
                header.classList.remove('menu-open');
                button.setAttribute('aria-expanded', 'false');
            }
        });
    });
});
