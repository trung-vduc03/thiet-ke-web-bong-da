// products.js - Xử lý tải dữ liệu, bộ lọc và giỏ hàng
document.addEventListener("DOMContentLoaded", () => {
    let allProducts = [];
    let filteredProducts = [];

    const productGrid = document.getElementById("productGrid");
    const productCount = document.getElementById("productCount");
    const noProducts = document.getElementById("noProducts");
    const searchInput = document.getElementById("searchInput");
    const priceFilter = document.getElementById("priceFilter");
    const priceValue = document.getElementById("priceValue");
    const sortSelect = document.getElementById("sortProducts");
    const resetFilterBtn = document.getElementById("resetFilterBtn");
    const sizeCheckboxes = document.querySelectorAll('input[name="size"]');
    const colorCheckboxes = document.querySelectorAll('input[name="color"]');
    const cartBadge = document.getElementById("cartCountBadge");

    function updateCartBadge() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartBadge) cartBadge.textContent = total;
    }

    async function loadProducts() {
        const candidatePaths = [
            "../../data/products.json",
            "../data/products.json",
            "./data/products.json",
            "/data/products.json"
        ];

        for (const path of candidatePaths) {
            try {
                const res = await fetch(path);
                if (res.ok) {
                    allProducts = await res.json();
                    filteredProducts = [...allProducts];
                    applyFilters();
                    return;
                }
            } catch (err) {
                // Thử path tiếp theo
            }
        }

        if (productGrid) {
            productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #e63946;">Không thể tải tệp products.json. Vui lòng mở bằng Live Server trong VS Code.</p>`;
        }
    }

    function renderProducts(products) {
        if (!productGrid) return;
        productGrid.innerHTML = "";

        if (products.length === 0) {
            if (noProducts) noProducts.style.display = "block";
            if (productCount) productCount.textContent = "0 sản phẩm";
            return;
        }

        if (noProducts) noProducts.style.display = "none";
        if (productCount) productCount.textContent = `Hiển thị ${products.length} sản phẩm`;

        products.forEach((product) => {
            const card = document.createElement("div");
            card.className = "product-card";

            const formattedPrice = new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND"
            }).format(product.price);

            const imageSrc = product.image || (product.images && product.images[0]) || "https://via.placeholder.com/300x300?text=Fashion+Jersey";

            card.innerHTML = `
                <div class="product-card-img-wrap">
                    <a href="product-detail.html?id=${product.id}">
                        <img src="${imageSrc}" alt="${product.name}" class="product-card-img" onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
                    </a>
                </div>
                <div class="product-card-body">
                    <span class="product-card-category">${product.category || "Trang phục"}</span>
                    <h3 class="product-card-title">
                        <a href="product-detail.html?id=${product.id}">${product.name}</a>
                    </h3>
                    <div class="product-card-price">${formattedPrice}</div>
                    <button type="button" class="product-card-btn" data-id="${product.id}">
                        Xem chi tiết
                    </button>
                </div>
            `;

            card.querySelector(".product-card-btn").addEventListener("click", () => {
                window.location.href = `product-detail.html?id=${product.id}`;
            });

            productGrid.appendChild(card);
        });
    }

    function applyFilters() {
        const selectedSizes = Array.from(sizeCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value.toUpperCase());

        const selectedColors = Array.from(colorCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value.toLowerCase());

        const maxPrice = priceFilter ? parseInt(priceFilter.value, 10) : Infinity;
        const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

        filteredProducts = allProducts.filter((product) => {
            const matchSize = selectedSizes.length === 0 || 
                (product.sizes && product.sizes.some(s => selectedSizes.includes(s.toUpperCase())));

            const matchColor = selectedColors.length === 0 || 
                (product.colors && product.colors.some(c => selectedColors.includes(c.toLowerCase())));

            const matchPrice = product.price <= maxPrice;
            const matchQuery = product.name.toLowerCase().includes(query) || 
                               (product.category && product.category.toLowerCase().includes(query));

            return matchSize && matchColor && matchPrice && matchQuery;
        });

        applySorting();
    }

    function applySorting() {
        const sortValue = sortSelect ? sortSelect.value : "default";

        if (sortValue === "price-asc") {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (sortValue === "price-desc") {
            filteredProducts.sort((a, b) => b.price - a.price);
        } else if (sortValue === "name-asc") {
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        }

        renderProducts(filteredProducts);
    }

    if (searchInput) searchInput.addEventListener("input", applyFilters);
    if (priceFilter) {
        priceFilter.addEventListener("input", (e) => {
            if (priceValue) {
                priceValue.textContent = new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND"
                }).format(e.target.value);
            }
            applyFilters();
        });
    }

    sizeCheckboxes.forEach(cb => cb.addEventListener("change", applyFilters));
    colorCheckboxes.forEach(cb => cb.addEventListener("change", applyFilters));
    if (sortSelect) sortSelect.addEventListener("change", applySorting);

    if (resetFilterBtn) {
        resetFilterBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            sizeCheckboxes.forEach(cb => cb.checked = false);
            colorCheckboxes.forEach(cb => cb.checked = false);
            if (priceFilter) {
                priceFilter.value = priceFilter.max;
                if (priceValue) {
                    priceValue.textContent = new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND"
                    }).format(priceFilter.max);
                }
            }
            if (sortSelect) sortSelect.value = "default";
            applyFilters();
        });
    }

    updateCartBadge();
    loadProducts();
});