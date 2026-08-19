"use strict";

let allProducts = [];
let filteredProducts = [];

let currentPage = 1;
const productsPerPage = 12;

let currentQuickProduct = null;
let selectedQuickSize = "";
let selectedQuickColor = "";
let quickQuantity = 1;
let toastTimer = null;

const DATA_PATHS = [
    "../../../database/products.json",
    "../../database/products.json",
    "../database/products.json",
    "/database/products.json",
    "/Front_end/database/products.json",
    "../../../data/products.json",
    "../../data/products.json",
    "../data/products.json",
    "/data/products.json",
    "/Front_end/data/products.json"
];

const CART_KEY = "cart";
const WISHLIST_KEY = "wishlist";

const productGrid = document.getElementById("productGrid");
const productCount = document.getElementById("productCount");
const noProducts = document.getElementById("noProducts");
const pagination = document.getElementById("pagination");

const priceFilter = document.getElementById("priceFilter");
const priceValue = document.getElementById("priceValue");

const sortProducts = document.getElementById("sortProducts");
const clearFilters = document.getElementById("clearFilters");

const productSearch = document.getElementById("productSearch");
const searchButton = document.getElementById("searchButton");
const resetSearch = document.getElementById("resetSearch");
const activeFilters = document.getElementById("activeFilters");

const sizeFilters = document.querySelectorAll('input[name="size"]');
const colorFilters = document.querySelectorAll('input[name="color"]');
const categoryFilters = document.querySelectorAll('input[name="category"]');

const quickViewModal = document.getElementById("quickViewModal");
const closeQuickView = document.getElementById("closeQuickView");

const quickViewImage = document.getElementById("quickViewImage");
const quickViewTitle = document.getElementById("quickViewTitle");
const quickViewCategory = document.getElementById("quickViewCategory");
const quickViewPrice = document.getElementById("quickViewPrice");
const quickViewDescription = document.getElementById("quickViewDescription");

const quickViewSizes = document.getElementById("quickViewSizes");
const quickViewColors = document.getElementById("quickViewColors");

const quantityValue = document.getElementById("quantityValue");
const quantityMinus = document.getElementById("quantityMinus");
const quantityPlus = document.getElementById("quantityPlus");

const btnAddCart = document.getElementById("btnAddCart") || document.getElementById("quickAddCart");
const btnBuyNow = document.getElementById("btnBuyNow") || document.getElementById("quickBuyNow");
const quickViewDetail = document.getElementById("quickViewDetail");

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

function formatPrice(price) {
    const number = Number(price);
    if (!Number.isFinite(number)) {
        return "0đ";
    }
    return number.toLocaleString("vi-VN") + "đ";
}

function getValueArray(value) {
    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }
    if (typeof value === "string" && value.trim()) {
        return [value.trim()];
    }
    return [];
}

function getProductImageValues(product) {
    if (!product || typeof product !== "object") {
        return [];
    }

    const values = [];
    [
        product.image,
        product.imageUrl,
        product.thumbnail,
        product.imageURL,
        product.img,
        product.photo,
        product.picture,
        product.src
    ].forEach(function (value) {
        values.push(...getValueArray(value));
    });

    if (Array.isArray(product.images)) {
        product.images.forEach(function (value) {
            values.push(...getValueArray(value));
        });
    }

    return values.filter(Boolean);
}

function cleanImagePath(value) {
    if (!value) return "";
    let path = String(value).trim();
    if (!path) return "";
    path = path.replace(/\\/g, "/");
    path = path.replace(/^file:\/\/\/?/i, "");
    if (/^https?:\/\//i.test(path) || /^data:image\//i.test(path)) {
        return path;
    }
    path = path.replace(/^["']|["']$/g, "");
    return path;
}

function addCandidate(list, value) {
    if (!value) return;
    const path = cleanImagePath(value);
    if (!path) return;
    if (!list.includes(path)) {
        list.push(path);
    }
}

function getImageCandidatesFromPath(value) {
    const candidates = [];
    let path = cleanImagePath(value);
    if (!path) return candidates;

    if (/^https?:\/\//i.test(path) || /^data:image\//i.test(path)) {
        addCandidate(candidates, path);
        return candidates;
    }

    const fileName = path.split("/").pop();
    const cleanRelative = path.replace(/^(\.\.\/)+/, "").replace(/^\/+/, "");

    addCandidate(candidates, "../../../assets/images/clubs/" + fileName);
    addCandidate(candidates, "../../../assets/images/" + fileName);
    addCandidate(candidates, "../../../" + cleanRelative);
    addCandidate(candidates, "../../assets/images/clubs/" + fileName);
    addCandidate(candidates, "../../assets/images/" + fileName);
    addCandidate(candidates, "../assets/images/clubs/" + fileName);
    addCandidate(candidates, "../assets/images/" + fileName);
    addCandidate(candidates, "/Front_end/assets/images/clubs/" + fileName);
    addCandidate(candidates, "/Front_end/assets/images/" + fileName);
    addCandidate(candidates, "/assets/images/clubs/" + fileName);
    addCandidate(candidates, "/assets/images/" + fileName);
    addCandidate(candidates, "../../" + cleanRelative);
    addCandidate(candidates, "../" + cleanRelative);
    addCandidate(candidates, "/" + cleanRelative);
    addCandidate(candidates, "/Front_end/" + cleanRelative);
    addCandidate(candidates, path);

    return candidates;
}

function getProductImageCandidates(product) {
    const values = getProductImageValues(product);
    const candidates = [];

    values.forEach(function (value) {
        const paths = getImageCandidatesFromPath(value);
        paths.forEach(function (path) {
            addCandidate(candidates, path);
        });
    });

    return candidates;
}

function getProductImage(product) {
    const candidates = getProductImageCandidates(product);
    return candidates.length ? candidates[0] : "";
}

function setImageWithFallback(img, product) {
    if (!img || !product) return;

    const candidates = getProductImageCandidates(product);
    img.alt = product.name || "Sản phẩm bóng đá";

    if (!candidates.length) {
        img.src = "https://placehold.co/400x500?text=No+Image";
        return;
    }

    let currentIndex = 0;
    img.onerror = function () {
        if (currentIndex < candidates.length) {
            img.src = candidates[currentIndex];
            currentIndex++;
        } else {
            img.onerror = null;
            img.src = "https://placehold.co/400x500?text=Image+Not+Found";
        }
    };

    img.src = candidates[currentIndex];
    currentIndex++;
}

function normalizeColorCode(colorStr) {
    if (!colorStr) return "";
    const c = String(colorStr).toLowerCase().trim();

    if (c === "red" || c === "đỏ" || c === "do" || c.includes("đỏ") || c.includes("red")) return "red";
    if (c === "white" || c === "trắng" || c === "trang" || c.includes("trắng") || c.includes("white")) return "white";
    if (c === "black" || c === "đen" || c === "den" || c.includes("đen") || c.includes("black")) return "black";
    if (c === "blue" || c === "navy" || c === "xanh dương" || c === "xanh da trời" || c === "xanh biển" || c.includes("navy") || c.includes("blue") || c.includes("dương")) return "blue";
    if (c === "green" || c === "xanh lá" || c === "xanh lục" || c.includes("green") || c.includes("lá") || c.includes("lục")) return "green";
    if (c === "yellow" || c === "vàng" || c === "gold" || c.includes("vàng") || c.includes("yellow") || c.includes("gold")) return "yellow";
    if (c === "orange" || c === "cam" || c.includes("cam") || c.includes("orange")) return "orange";
    if (c === "pink" || c === "hồng" || c.includes("hồng") || c.includes("pink")) return "pink";
    if (c === "purple" || c === "tím" || c.includes("tím") || c.includes("purple")) return "purple";
    if (c === "grey" || c === "gray" || c === "xám" || c === "ghi" || c.includes("xám") || c.includes("gray") || c.includes("grey")) return "grey";

    return c;
}

function getProductColors(product) {
    if (!product) return [];
    const colors = [];

    if (Array.isArray(product.colors)) {
        colors.push(...product.colors);
    }
    if (product.color) {
        if (typeof product.color === "string" && product.color.includes(",")) {
            colors.push(...product.color.split(","));
        } else {
            colors.push(product.color);
        }
    }

    return [...new Set(colors.filter(Boolean).map(color => String(color).trim()))];
}

function getProductSizes(product) {
    if (!product) return [];
    if (Array.isArray(product.sizes)) {
        return product.sizes.filter(Boolean).map(size => String(size).trim());
    }
    if (product.size) {
        return [String(product.size).trim()];
    }
    return [];
}

function getProductCategory(product) {
    if (!product) return "";
    return String(product.category || product.type || "").trim().toLowerCase();
}

function getProductSearchText(product) {
    if (!product) return "";
    const values = [
        product.name,
        product.category,
        product.brand,
        product.club,
        product.team,
        product.description,
        product.id,
        product.color
    ];

    if (Array.isArray(product.colors)) values.push(...product.colors);
    if (Array.isArray(product.sizes)) values.push(...product.sizes);

    return values.filter(Boolean).join(" ").toLowerCase();
}

async function loadProducts() {
    let data = null;
    let lastError = null;

    for (const url of DATA_PATHS) {
        try {
            const response = await fetch(url, { cache: "no-store" });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const result = await response.json();
            if (!Array.isArray(result)) throw new Error("Dữ liệu sản phẩm không phải mảng");
            data = result;
            break;
        } catch (error) {
            lastError = error;
        }
    }

    if (!Array.isArray(data)) {
        console.error("Không thể tải products.json:", lastError);
        showLoadError();
        return;
    }

    allProducts = data.filter(product => product && typeof product === "object");
    setPriceRange();
    currentPage = 1;
    applyFilters();
}

function setPriceRange() {
    if (!priceFilter) return;

    const prices = allProducts
        .map(product => Number(product.price))
        .filter(price => Number.isFinite(price));

    if (!prices.length) return;

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    priceFilter.min = minPrice;
    priceFilter.max = maxPrice;
    priceFilter.step = 10000;

    const currentValue = Number(priceFilter.value);
    if (!currentValue || currentValue > maxPrice || currentValue < minPrice) {
        priceFilter.value = maxPrice;
    }

    updatePriceValue();
}

function showLoadError() {
    if (productGrid) productGrid.innerHTML = "";
    if (pagination) pagination.innerHTML = "";
    if (productCount) productCount.textContent = "0";

    if (noProducts) {
        noProducts.hidden = false;
        const title = noProducts.querySelector("h2");
        const description = noProducts.querySelector("p");
        if (title) title.textContent = "Không thể tải sản phẩm";
        if (description) description.textContent = "Hãy kiểm tra lại đường dẫn tệp products.json.";
    }
}

function createProductCard(product) {
    const article = document.createElement("article");
    article.className = "product-card";

    const category = product.category || "Áo đấu";
    const rating = Number(product.rating) || 4.8;
    const hasSale = Boolean(product.discount || product.oldPrice);
    const badge = hasSale ? '<span class="product-badge sale">SALE</span>' : '';

    const oldPriceHTML = product.oldPrice
        ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>`
        : "";

    article.innerHTML = `
        <div class="product-img-box">
            ${badge}
            <button
                type="button"
                class="wishlist-btn"
                title="Thêm vào yêu thích"
                aria-label="Thêm vào yêu thích">
                <i class="fa-regular fa-heart"></i>
            </button>
            <img
                alt="${escapeHTML(product.name || "Sản phẩm bóng đá")}"
                loading="lazy"
                decoding="async">
        </div>

        <div class="product-card-info">
            <p class="product-category">${escapeHTML(category)}</p>
            <h3 class="product-title">
                <a href="./products-detail.html?id=${product.id}" style="text-decoration: none; color: inherit;">
                    ${escapeHTML(product.name || "Sản phẩm bóng đá")}
                </a>
            </h3>

            <div class="product-rating">
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <span>(${rating})</span>
            </div>

            <div class="price-box">
                <p class="product-price">${formatPrice(product.price)}</p>
                ${oldPriceHTML}
            </div>

            <div class="card-actions">
                <button type="button" class="quick-view-btn">
                    <i class="fa-solid fa-eye"></i> Xem nhanh
                </button>
            </div>
        </div>
    `;

    const img = article.querySelector("img");
    setImageWithFallback(img, product);

    const quickButton = article.querySelector(".quick-view-btn");
    if (quickButton) {
        quickButton.addEventListener("click", function () {
            openQuickView(product);
        });
    }

    const wishlistButton = article.querySelector(".wishlist-btn");
    if (wishlistButton) {
        updateWishlistIcon(wishlistButton, product.id);
        wishlistButton.addEventListener("click", function () {
            toggleWishlist(product, wishlistButton);
        });
    }

    return article;
}

function escapeHTML(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderProducts() {
    if (!productGrid) return;
    productGrid.innerHTML = "";

    if (productCount) {
        productCount.textContent = filteredProducts.length;
    }

    if (!filteredProducts.length) {
        if (noProducts) {
            noProducts.hidden = false;
            const title = noProducts.querySelector("h2");
            const description = noProducts.querySelector("p");
            if (title) title.textContent = "Không tìm thấy sản phẩm";
            if (description) description.textContent = "Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.";
        }
        if (pagination) pagination.innerHTML = "";
        return;
    }

    if (noProducts) {
        noProducts.hidden = true;
    }

    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const productsToRender = filteredProducts.slice(start, end);

    productsToRender.forEach(function (product) {
        productGrid.appendChild(createProductCard(product));
    });

    renderPagination();
}

function applyFilters() {
    const selectedSizes = [...sizeFilters]
        .filter(input => input.checked)
        .map(input => String(input.value).trim().toLowerCase());

    const selectedColors = [...colorFilters]
        .filter(input => input.checked)
        .map(input => String(input.value).trim().toLowerCase());

    const selectedCategories = [...categoryFilters]
        .filter(input => input.checked)
        .map(input => String(input.value).trim().toLowerCase());

    const maxPrice = priceFilter ? Number(priceFilter.value) : Infinity;
    const keyword = productSearch ? productSearch.value.trim().toLowerCase() : "";

    filteredProducts = allProducts.filter(function (product) {
        const sizes = getProductSizes(product).map(size => size.toLowerCase());
        const colors = getProductColors(product).map(color => color.toLowerCase());
        const category = getProductCategory(product);
        const nameDesc = (product.name + " " + (product.description || "")).toLowerCase();

        const sizeMatch =
            selectedSizes.length === 0 ||
            selectedSizes.some(size => sizes.some(productSize => productSize === size || productSize.includes(size) || size.includes(productSize)));

        const colorMatch =
            selectedColors.length === 0 ||
            selectedColors.some(function (selectedColor) {
                const normSelected = normalizeColorCode(selectedColor);

                const directMatch = colors.some(function (productColor) {
                    const normProductColor = normalizeColorCode(productColor);
                    return (
                        productColor === selectedColor ||
                        normProductColor === normSelected ||
                        productColor.includes(selectedColor) ||
                        selectedColor.includes(productColor)
                    );
                });

                if (directMatch) return true;

                return nameDesc.includes(selectedColor) || (normSelected && nameDesc.includes(normSelected));
            });

        const categoryMatch =
            selectedCategories.length === 0 ||
            selectedCategories.some(selectedCategory => category === selectedCategory || category.includes(selectedCategory) || selectedCategory.includes(category));

        const price = Number(product.price);
        const priceMatch = Number.isFinite(price) ? price <= maxPrice : true;
        const searchMatch = keyword === "" || getProductSearchText(product).includes(keyword);

        return sizeMatch && colorMatch && categoryMatch && priceMatch && searchMatch;
    });

    applySorting();
    currentPage = 1;
    updatePriceValue();
    renderActiveFilters();
    renderProducts();
}

function applySorting() {
    if (!sortProducts) return;
    const sortType = sortProducts.value;

    if (sortType === "price-low") {
        filteredProducts.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortType === "price-high") {
        filteredProducts.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortType === "name-az") {
        filteredProducts.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "vi"));
    } else if (sortType === "name-za") {
        filteredProducts.sort((a, b) => String(b.name || "").localeCompare(String(a.name || ""), "vi"));
    }
}

function updatePriceValue() {
    if (!priceValue || !priceFilter) return;
    priceValue.textContent = formatPrice(priceFilter.value);
}

function renderActiveFilters() {
    if (!activeFilters) return;
    activeFilters.innerHTML = "";

    const checkedFilters = [
        ...categoryFilters,
        ...sizeFilters,
        ...colorFilters
    ].filter(input => input.checked);

    checkedFilters.forEach(function (input) {
        const tag = document.createElement("span");
        tag.className = "filter-tag";
        tag.innerHTML = `
            ${escapeHTML(input.value)}
            <button type="button" aria-label="Xóa bộ lọc">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;

        tag.querySelector("button").addEventListener("click", function () {
            input.checked = false;
            applyFilters();
        });

        activeFilters.appendChild(tag);
    });
}

function resetFilters() {
    [
        ...categoryFilters,
        ...sizeFilters,
        ...colorFilters
    ].forEach(input => {
        input.checked = false;
    });

    if (priceFilter) priceFilter.value = priceFilter.max;
    if (sortProducts) sortProducts.value = "default";
    if (productSearch) productSearch.value = "";

    currentPage = 1;
    updatePriceValue();
    applyFilters();
}

function renderPagination() {
    if (!pagination) return;
    pagination.innerHTML = "";

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (totalPages <= 1) return;

    const fragment = document.createDocumentFragment();

    for (let page = 1; page <= totalPages; page++) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "page-btn";
        button.textContent = page;

        if (page === currentPage) {
            button.classList.add("active");
        }

        button.addEventListener("click", function () {
            currentPage = page;
            renderProducts();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        fragment.appendChild(button);
    }

    pagination.appendChild(fragment);
}

function openQuickView(product) {
    if (!quickViewModal || !product) return;

    currentQuickProduct = product;
    selectedQuickSize = "";
    selectedQuickColor = "";
    quickQuantity = 1;

    if (quantityValue) quantityValue.textContent = quickQuantity;
    if (quickViewImage) setImageWithFallback(quickViewImage, product);
    if (quickViewTitle) quickViewTitle.textContent = product.name || "Sản phẩm bóng đá";
    if (quickViewCategory) quickViewCategory.textContent = product.category || "Áo đấu bóng đá";
    if (quickViewPrice) quickViewPrice.textContent = formatPrice(product.price);
    if (quickViewDescription) {
        quickViewDescription.textContent = product.description || "Sản phẩm thời trang bóng đá chất lượng cao, phù hợp để sử dụng khi thi đấu hoặc đi chơi.";
    }

    if (quickViewDetail) {
        quickViewDetail.href = `./products-detail.html?id=${product.id}`;
    }

    const sizeSelect = document.getElementById("quickViewSize");
    if (sizeSelect) {
        sizeSelect.innerHTML = "";
        const sizes = getProductSizes(product);
        const finalSizes = sizes.length ? sizes : ["S", "M", "L", "XL"];
        finalSizes.forEach(size => {
            const opt = document.createElement("option");
            opt.value = size;
            opt.textContent = `Size ${size}`;
            sizeSelect.appendChild(opt);
        });
        sizeSelect.value = finalSizes[0] || "M";
    }

    renderQuickSizes(product);
    renderQuickColors(product);

    quickViewModal.hidden = false;
    quickViewModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
}

function renderQuickSizes(product) {
    if (!quickViewSizes) return;
    quickViewSizes.innerHTML = "";

    const sizes = getProductSizes(product);
    const finalSizes = sizes.length ? sizes : ["S", "M", "L", "XL"];

    finalSizes.forEach(function (size) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "option-btn";
        button.textContent = size;

        button.addEventListener("click", function () {
            selectedQuickSize = size;
            quickViewSizes.querySelectorAll(".option-btn").forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
        });

        quickViewSizes.appendChild(button);
    });
}

function renderQuickColors(product) {
    if (!quickViewColors) return;
    quickViewColors.innerHTML = "";

    const colors = getProductColors(product);
    colors.forEach(function (color) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "option-btn";
        button.textContent = color;

        button.addEventListener("click", function () {
            selectedQuickColor = color;
            quickViewColors.querySelectorAll(".option-btn").forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
        });

        quickViewColors.appendChild(button);
    });
}

function closeQuickViewModal() {
    if (!quickViewModal) return;
    quickViewModal.hidden = true;
    quickViewModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    currentQuickProduct = null;
    selectedQuickSize = "";
    selectedQuickColor = "";
    quickQuantity = 1;
}

function getCart() {
    try {
        const cart = JSON.parse(localStorage.getItem(CART_KEY));
        return Array.isArray(cart) ? cart : [];
    } catch (error) {
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error("Không thể lưu giỏ hàng:", error);
    }
}

function addToCart(product) {
    if (!product) return;

    const cart = getCart();
    const productSizes = getProductSizes(product);
    const productColors = getProductColors(product);

    const sizeSelect = document.getElementById("quickViewSize");
    const size = (sizeSelect && sizeSelect.value) ? sizeSelect.value : (selectedQuickSize || productSizes[0] || "M");
    const color = selectedQuickColor || productColors[0] || "";
    const cartId = `${product.id}-${size}-${color}`;

    const existing = cart.find(item => String(item.id) === String(product.id) && item.size === size);

    if (existing) {
        existing.quantity = Number(existing.quantity || 0) + (quickQuantity || 1);
    } else {
        cart.push({
            cartId: cartId,
            id: product.id,
            name: product.name,
            price: Number(product.price || 0),
            image: getProductImage(product),
            size: size,
            color: color,
            quantity: quickQuantity || 1
        });
    }

    saveCart(cart);
    updateBadges();
    showToast(`Đã thêm "${product.name}" (Size ${size}) vào giỏ hàng!`);
    closeQuickViewModal();
}

function getWishlist() {
    try {
        const wishlist = JSON.parse(localStorage.getItem(WISHLIST_KEY));
        return Array.isArray(wishlist) ? wishlist : [];
    } catch (error) {
        return [];
    }
}

function saveWishlist(wishlist) {
    try {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch (error) {
        console.error("Không thể lưu yêu thích:", error);
    }
}

function toggleWishlist(product, button) {
    if (!product || !button) return;

    let wishlist = getWishlist();
    const exists = wishlist.some(item => String(item.id) === String(product.id));

    if (exists) {
        wishlist = wishlist.filter(item => String(item.id) !== String(product.id));
        button.classList.remove("active");
        button.innerHTML = '<i class="fa-regular fa-heart"></i>';
        showToast("Đã xóa khỏi yêu thích");
    } else {
        wishlist.push({
            id: product.id,
            name: product.name,
            price: Number(product.price || 0),
            image: getProductImage(product)
        });
        button.classList.add("active");
        button.innerHTML = '<i class="fa-solid fa-heart"></i>';
        showToast("Đã thêm vào yêu thích");
    }

    saveWishlist(wishlist);
}

function updateWishlistIcon(button, productId) {
    if (!button) return;
    const wishlist = getWishlist();
    const exists = wishlist.some(item => String(item.id) === String(productId));

    if (exists) {
        button.classList.add("active");
        button.innerHTML = '<i class="fa-solid fa-heart"></i>';
    } else {
        button.classList.remove("active");
        button.innerHTML = '<i class="fa-regular fa-heart"></i>';
    }
}

function showToast(message) {
    let t = document.getElementById("toast");
    let msg = document.getElementById("toastMessage");
    if (!t) {
        t = document.createElement("div");
        t.id = "toast";
        t.style.cssText = "position: fixed; bottom: 30px; right: 30px; background: #0b1727; color: #fff; border-left: 4px solid #22c55e; padding: 14px 22px; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 10px; z-index: 9999; font-weight: 600; font-size: 14px;";
        t.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #22c55e; font-size: 18px;"></i><span id="toastMessage">${message}</span>`;
        document.body.appendChild(t);
        msg = document.getElementById("toastMessage");
    }
    if (msg) msg.textContent = message;
    t.style.display = "flex";

    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
        t.style.display = "none";
    }, 2500);
}

function updateBadges() {
    try {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        const cartBadge = document.getElementById("cart-badge");
        const wishlistBadge = document.getElementById("wishlist-badge");

        const totalCart = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

        if (cartBadge) {
            cartBadge.textContent = totalCart;
            cartBadge.style.display = totalCart > 0 ? "inline-flex" : "none";
        }
        if (wishlistBadge) {
            wishlistBadge.textContent = wishlist.length;
            wishlistBadge.style.display = wishlist.length > 0 ? "inline-flex" : "none";
        }
    } catch (e) {}
}

if (quantityMinus) {
    quantityMinus.addEventListener("click", function () {
        if (quickQuantity > 1) quickQuantity--;
        if (quantityValue) quantityValue.textContent = quickQuantity;
    });
}

if (quantityPlus) {
    quantityPlus.addEventListener("click", function () {
        if (quickQuantity < 10) quickQuantity++;
        if (quantityValue) quantityValue.textContent = quickQuantity;
    });
}

if (btnAddCart) {
    btnAddCart.addEventListener("click", function () {
        if (!currentQuickProduct) return;
        addToCart(currentQuickProduct);
    });
}

if (btnBuyNow) {
    btnBuyNow.addEventListener("click", function () {
        if (!currentQuickProduct) return;
        addToCart(currentQuickProduct);
        window.location.href = "../../cart-checkout/cart.html";
    });
}

if (productSearch) productSearch.addEventListener("input", applyFilters);
if (searchButton) searchButton.addEventListener("click", applyFilters);
if (resetSearch) resetSearch.addEventListener("click", resetFilters);

categoryFilters.forEach(function (input) {
    input.addEventListener("change", applyFilters);
});

sizeFilters.forEach(function (input) {
    input.addEventListener("change", applyFilters);
});

colorFilters.forEach(function (input) {
    input.addEventListener("change", applyFilters);
});

if (priceFilter) {
    priceFilter.addEventListener("input", function () {
        updatePriceValue();
        applyFilters();
    });
}

if (sortProducts) {
    sortProducts.addEventListener("change", applyFilters);
}

if (clearFilters) {
    clearFilters.addEventListener("click", resetFilters);
}

if (closeQuickView) {
    closeQuickView.addEventListener("click", closeQuickViewModal);
}

if (quickViewModal) {
    quickViewModal.addEventListener("click", function (event) {
        if (event.target.closest("[data-close-modal]")) {
            closeQuickViewModal();
        }
    });
}

document.addEventListener("DOMContentLoaded", updateBadges);
window.addEventListener("storage", updateBadges);

loadProducts().then(() => {
    updateBadges();
});