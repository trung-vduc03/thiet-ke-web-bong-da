document.addEventListener("DOMContentLoaded", () => {
        updateBadges();

        // ĐƯỜNG DẪN FETCH CHUẨN XÁC: Lùi ra khỏi Front_end để vào thư mục data gốc
        fetch("../database/products.json")
          .then((res) => res.json())
          .then((products) => {
            const grid = document.getElementById("homeProductGrid");
            if (!grid) return;
            const featured = products.slice(0, 4);

            grid.innerHTML = featured
              .map(
                (p) => `
              <div class="product-card" class="fashion-product-card">
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
            const grid = document.getElementById("homeProductGrid");
            if(grid) grid.innerHTML = `<p class="fashion-empty">Ghé thăm trang Sản phẩm để chọn áo đấu yêu thích!</p>`;
          });
      });

      function updateBadges() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        const totalCart = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

        const cartNav = document.getElementById("cartNav");
        const wishlistNav = document.getElementById("wishlistNav");

        if (cartNav) cartNav.textContent = `Giỏ hàng (${totalCart})`;
        if (wishlistNav) wishlistNav.textContent = `Yêu thích (${wishlist.length})`;
      }
