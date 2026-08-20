/* Football Fashion - responsive navigation */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-mobile-nav]').forEach(function (header) {
    const button = header.querySelector('.mobile-menu-toggle');
    const nav = header.querySelector('.main-nav, .simple-nav');
    if (!button || !nav) return;
    button.addEventListener('click', function () {
      const open = header.classList.toggle('menu-open');
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        header.classList.remove('menu-open');
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-label', 'Mở menu');
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768) {
        header.classList.remove('menu-open');
        button.setAttribute('aria-expanded', 'false');
      }
    });
  });
});
