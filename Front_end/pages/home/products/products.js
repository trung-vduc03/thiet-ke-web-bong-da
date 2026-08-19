"use strict";

let allProducts = [];
let filteredProducts = [];

let currentPage = 1;
const productsPerPage = 12;

let currentQuickProduct = null;
let selectedQuickSize = "";
let selectedQuickColor = "";
let quickQuantity = 1;

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

const quickViewSize = document.getElementById("quickViewSize");

const quantityValue = document.getElementById("quantityValue");
const quantityMinus = document.getElementById("quantityMinus");
const quantityPlus = document.getElementById("quantityPlus");

const btnAddCart = document.getElementById("btnAddCart") ||
    document.getElementById("quickAddCart") ||
    document.querySelector(".btn-add-cart");

const btnBuyNow = document.getElementById("btnBuyNow") ||
    document.getElementById("quickBuyNow") ||
    document.querySelector(".btn-buy-now");

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

function formatPrice(price) {
    return Number(price || 0).toLocaleString("vi-VN") + "đ";
}

function convertImagePath(imagePath) {
    if (!imagePath) {
        return "/Front_end/assets/images/clubs/manchester-united-2025-home.jpg";
    }

    if (imagePath.startsWith("../assets/")) {
        return "/Front_end/" + imagePath.replace("../", "");
    }

    if (imagePath.startsWith("./assets/")) {
        return "/Front_end/" + imagePath.replace("./", "");
    }

    if (imagePath.startsWith("/")) {
        return imagePath;
    }

    if (imagePath.startsWith("Front_end/")) {
        return "/" + imagePath;
    }

    return "/Front_end/" + imagePath;
}

function getProductColor(product) {
    return String(
        product.color ||
        product.colors?.[0] ||
        ""
    ).toLowerCase();
}

function getProductCategory(product) {
    return String(
        product.category ||
        "Áo đấu"
    ).toLowerCase();
}

async function loadProducts() {
    try {
        const response = await fetch(
            "../../../../database/products.json"
        );

        if (!response.ok) {
            throw new Error("Không thể tải products.json");
        }

        allProducts = await response.json();

        if (!Array.isArray(allProducts)) {
            throw new Error("products.json không phải mảng dữ liệu");
        }

        filteredProducts = [...allProducts];

        updatePriceValue();
        applyFilters();
    } catch (error) {
        console.error(error);

        if (productGrid) {
            productGrid.innerHTML = "";
        }

        if (noProducts) {
            noProducts.hidden = false;

            const title = noProducts.querySelector("h2");
            const text = noProducts.querySelector("p");

            if (title) {
                title.textContent = "Không thể tải sản phẩm";
            }

            if (text) {
                text.textContent =
                    "Hãy kiểm tra lại đường dẫn database/products.json.";
            }
        }

        if (productCount) {
            productCount.textContent = "0";
        }
    }
}

function createProductCard(product) {
    const article = document.createElement("article");
    article.className = "product-card";

    const image = convertImagePath(product.image);
    const category = product.category || "Áo đấu";
    const rating = product.rating || "4.8";
    const hasSale = product.discount || product.oldPrice;

    const badge = hasSale
        ? `<span class="product-badge sale">SALE</span>`
        : `<span class="product-badge">MỚI</span>`;

    const oldPriceHTML = product.oldPrice
        ? `
            <span class="old-price">
                ${formatPrice(product.oldPrice)}
            </span>
        `
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
                src="${image}"
                alt="${product.name || "Sản phẩm bóng đá"}"
                loading="lazy">
        </div>

        <div class="product-card-info">
            <p class="product-category">
                ${category}
            </p>

            <a
                href="./products-detail.html?id=${encodeURIComponent(product.id)}"
                class="product-title">
                ${product.name}
            </a>

            <div class="product-rating">
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>
                <i class="fa-solid fa-star"></i>

                <span>
                    (${rating})
                </span>
            </div>

            <div class="price-box">
                <p class="product-price">
                    ${formatPrice(product.price)}
                </p>

                ${oldPriceHTML}
            </div>

            <div class="card-actions">
                <button
                    type="button"
                    class="quick-view-btn">
                    Xem nhanh
                </button>

                <a
                    href="./products-detail.html?id=${encodeURIComponent(product.id)}"
                    class="btn-detail">
                    Chi tiết
                </a>
            </div>
        </div>
    `;

    const img = article.querySelector("img");

    if (img) {
        img.addEventListener("error", function () {
            this.onerror = null;
            this.src =
                "/Front_end/assets/images/clubs/manchester-united-2025-home.jpg";
        });
    }

    const quickButton = article.querySelector(".quick-view-btn");

    if (quickButton) {
        quickButton.addEventListener("click", function () {
            openQuickView(product);
        });
    }

    const wishlistButton =
        article.querySelector(".wishlist-btn");

    if (wishlistButton) {
        updateWishlistIcon(
            wishlistButton,
            product.id
        );

        wishlistButton.addEventListener(
            "click",
            function () {
                toggleWishlist(
                    product,
                    wishlistButton
                );
            }
        );
    }

    return article;
}

function renderProducts() {
    if (!productGrid) {
        return;
    }

    productGrid.innerHTML = "";

    if (productCount) {
        productCount.textContent =
            filteredProducts.length;
    }

    if (filteredProducts.length === 0) {
        if (noProducts) {
            noProducts.hidden = false;
        }

        if (pagination) {
            pagination.innerHTML = "";
        }

        return;
    }

    if (noProducts) {
        noProducts.hidden = true;
    }

    const start =
        (currentPage - 1) * productsPerPage;

    const end =
        start + productsPerPage;

    const productsToRender =
        filteredProducts.slice(start, end);

    productsToRender.forEach(function (product) {
        productGrid.appendChild(
            createProductCard(product)
        );
    });

    renderPagination();
}

function applyFilters() {
    const selectedSizes =
        [...sizeFilters]
            .filter(item => item.checked)
            .map(item => item.value);

    const selectedColors =
        [...colorFilters]
            .filter(item => item.checked)
            .map(item =>
                item.value.toLowerCase()
            );

    const selectedCategories =
        [...categoryFilters]
            .filter(item => item.checked)
            .map(item =>
                item.value.toLowerCase()
            );

    const maxPrice =
        priceFilter
            ? Number(priceFilter.value)
            : Infinity;

    const keyword =
        productSearch
            ? productSearch.value.trim().toLowerCase()
            : "";

    filteredProducts =
        allProducts.filter(function (product) {
            const productSizes =
                Array.isArray(product.sizes)
                    ? product.sizes
                    : [];

            const sizeMatch =
                selectedSizes.length === 0 ||
                selectedSizes.some(
                    size =>
                        productSizes.includes(size)
                );

            const productColor =
                getProductColor(product);

            const colorMatch =
                selectedColors.length === 0 ||
                selectedColors.some(
                    color =>
                        productColor.includes(color)
                );

            const productCategory =
                getProductCategory(product);

            const categoryMatch =
                selectedCategories.length === 0 ||
                selectedCategories.some(
                    category =>
                        productCategory.includes(category)
                );

            const priceMatch =
                Number(product.price) <= maxPrice;

            const searchableText = [
                product.name,
                product.category,
                product.color,
                product.brand,
                product.club,
                product.description
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const searchMatch =
                keyword === "" ||
                searchableText.includes(keyword);

            return (
                sizeMatch &&
                colorMatch &&
                categoryMatch &&
                priceMatch &&
                searchMatch
            );
        });

    applySorting();

    currentPage = 1;

    updatePriceValue();
    renderActiveFilters();
    renderProducts();
}

function applySorting() {
    if (!sortProducts) {
        return;
    }

    const sortType =
        sortProducts.value;

    if (sortType === "price-low") {
        filteredProducts.sort(
            (a, b) =>
                Number(a.price) -
                Number(b.price)
        );
    }

    if (sortType === "price-high") {
        filteredProducts.sort(
            (a, b) =>
                Number(b.price) -
                Number(a.price)
        );
    }

    if (sortType === "name-az") {
        filteredProducts.sort(
            (a, b) =>
                String(a.name).localeCompare(
                    String(b.name),
                    "vi"
                )
        );
    }

    if (sortType === "name-za") {
        filteredProducts.sort(
            (a, b) =>
                String(b.name).localeCompare(
                    String(a.name),
                    "vi"
                )
        );
    }
}

function updatePriceValue() {
    if (!priceFilter || !priceValue) {
        return;
    }

    priceValue.textContent =
        formatPrice(priceFilter.value);
}

function renderActiveFilters() {
    if (!activeFilters) {
        return;
    }

    activeFilters.innerHTML = "";

    const checkedFilters = [
        ...categoryFilters,
        ...sizeFilters,
        ...colorFilters
    ].filter(item => item.checked);

    checkedFilters.forEach(function (input) {
        const tag =
            document.createElement("span");

        tag.className = "filter-tag";

        tag.innerHTML = `
            ${input.value}

            <button
                type="button"
                aria-label="Xóa bộ lọc">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;

        const removeButton =
            tag.querySelector("button");

        if (removeButton) {
            removeButton.addEventListener(
                "click",
                function () {
                    input.checked = false;
                    applyFilters();
                }
            );
        }

        activeFilters.appendChild(tag);
    });
}

function resetFilters() {
    categoryFilters.forEach(
        input => input.checked = false
    );

    sizeFilters.forEach(
        input => input.checked = false
    );

    colorFilters.forEach(
        input => input.checked = false
    );

    if (priceFilter) {
        priceFilter.value =
            priceFilter.max;
    }

    if (sortProducts) {
        sortProducts.value = "default";
    }

    if (productSearch) {
        productSearch.value = "";
    }

    updatePriceValue();
    applyFilters();
}

function renderPagination() {
    if (!pagination) {
        return;
    }

    pagination.innerHTML = "";

    const totalPages =
        Math.ceil(
            filteredProducts.length /
            productsPerPage
        );

    if (totalPages <= 1) {
        return;
    }

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {
        const button =
            document.createElement("button");

        button.type = "button";
        button.className = "page-btn";
        button.textContent = page;

        if (page === currentPage) {
            button.classList.add("active");
        }

        button.addEventListener(
            "click",
            function () {
                currentPage = page;

                renderProducts();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }
        );

        pagination.appendChild(button);
    }
}

function openQuickView(product) {
    if (!quickViewModal) {
        window.location.href =
            `./products-detail.html?id=${encodeURIComponent(product.id)}`;
        return;
    }

    currentQuickProduct = product;

    selectedQuickSize = "";
    selectedQuickColor = "";
    quickQuantity = 1;

    if (quantityValue) {
        quantityValue.textContent =
            quickQuantity;
    }

    if (quickViewImage) {
        quickViewImage.src =
            convertImagePath(product.image);

        quickViewImage.alt =
            product.name || "Sản phẩm bóng đá";
    }

    if (quickViewTitle) {
        quickViewTitle.textContent =
            product.name || "Sản phẩm";
    }

    if (quickViewCategory) {
        quickViewCategory.textContent =
            product.category ||
            "Áo đấu bóng đá";
    }

    if (quickViewPrice) {
        quickViewPrice.textContent =
            formatPrice(product.price);
    }

    if (quickViewDescription) {
        quickViewDescription.textContent =
            product.description ||
            "Sản phẩm thời trang bóng đá chất lượng cao.";
    }

    if (quickViewSizes) {
        renderQuickSizes(product);
    }

    if (quickViewColors) {
        renderQuickColors(product);
    }

    if (quickViewSize) {
        quickViewSize.value = "";
    }

    quickViewModal.hidden = false;

    quickViewModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );
}

function renderQuickSizes(product) {
    if (!quickViewSizes) {
        return;
    }

    quickViewSizes.innerHTML = "";

    const sizes =
        Array.isArray(product.sizes)
            ? product.sizes
            : ["S", "M", "L", "XL"];

    sizes.forEach(function (size) {
        const button =
            document.createElement("button");

        button.type = "button";
        button.className = "option-btn";
        button.textContent = size;

        button.addEventListener(
            "click",
            function () {
                selectedQuickSize = size;

                quickViewSizes
                    .querySelectorAll(".option-btn")
                    .forEach(
                        btn =>
                            btn.classList.remove(
                                "active"
                            )
                    );

                button.classList.add("active");
            }
        );

        quickViewSizes.appendChild(button);
    });
}

function renderQuickColors(product) {
    if (!quickViewColors) {
        return;
    }

    quickViewColors.innerHTML = "";

    let colors = [];

    if (Array.isArray(product.colors)) {
        colors = product.colors;
    } else if (product.color) {
        colors = [product.color];
    } else {
        colors = ["Đỏ"];
    }

    colors.forEach(function (color) {
        const button =
            document.createElement("button");

        button.type = "button";
        button.className = "option-btn";
        button.textContent = color;

        button.addEventListener(
            "click",
            function () {
                selectedQuickColor = color;

                quickViewColors
                    .querySelectorAll(".option-btn")
                    .forEach(
                        btn =>
                            btn.classList.remove(
                                "active"
                            )
                    );

                button.classList.add("active");
            }
        );

        quickViewColors.appendChild(button);
    });
}

function closeQuickViewModal() {
    if (!quickViewModal) {
        return;
    }

    quickViewModal.hidden = true;

    quickViewModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-open"
    );
}

function getCart() {
    try {
        return JSON.parse(
            localStorage.getItem(
                "footballFashionCart"
            )
        ) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(
        "footballFashionCart",
        JSON.stringify(cart)
    );
}

function addToCart(product) {
    const cart = getCart();

    const size =
        selectedQuickSize ||
        quickViewSize?.value ||
        product.sizes?.[0] ||
        "M";

    const color =
        selectedQuickColor ||
        product.color ||
        product.colors?.[0] ||
        "";

    const cartId =
        `${product.id}-${size}-${color}`;

    const existing =
        cart.find(
            item =>
                String(item.cartId) ===
                String(cartId)
        );

    if (existing) {
        existing.quantity +=
            quickQuantity;
    } else {
        cart.push({
            cartId,
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            size,
            color,
            quantity: quickQuantity
        });
    }

    saveCart(cart);

    showToast(
        `Đã thêm "${product.name}" vào giỏ hàng`
    );
}

function getWishlist() {
    try {
        return JSON.parse(
            localStorage.getItem(
                "footballFashionWishlist"
            )
        ) || [];
    } catch {
        return [];
    }
}

function saveWishlist(wishlist) {
    localStorage.setItem(
        "footballFashionWishlist",
        JSON.stringify(wishlist)
    );
}

function toggleWishlist(product, button) {
    let wishlist = getWishlist();

    const exists =
        wishlist.some(
            item =>
                String(item.id) ===
                String(product.id)
        );

    if (exists) {
        wishlist =
            wishlist.filter(
                item =>
                    String(item.id) !==
                    String(product.id)
            );

        button.classList.remove("active");

        button.innerHTML =
            '<i class="fa-regular fa-heart"></i>';

        showToast(
            "Đã xóa khỏi yêu thích"
        );
    } else {
        wishlist.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image
        });

        button.classList.add("active");

        button.innerHTML =
            '<i class="fa-solid fa-heart"></i>';

        showToast(
            "Đã thêm vào yêu thích"
        );
    }

    saveWishlist(wishlist);
}

function updateWishlistIcon(button, productId) {
    const wishlist = getWishlist();

    const exists =
        wishlist.some(
            item =>
                String(item.id) ===
                String(productId)
        );

    if (exists) {
        button.classList.add("active");

        button.innerHTML =
            '<i class="fa-solid fa-heart"></i>';
    }
}

let toastTimer;

function showToast(message) {
    if (!toast || !toastMessage) {
        return;
    }

    toastMessage.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer =
        setTimeout(function () {
            toast.classList.remove("show");
        }, 2500);
}

if (quantityMinus) {
    quantityMinus.addEventListener(
        "click",
        function () {
            if (quickQuantity > 1) {
                quickQuantity--;
            }

            if (quantityValue) {
                quantityValue.textContent =
                    quickQuantity;
            }
        }
    );
}

if (quantityPlus) {
    quantityPlus.addEventListener(
        "click",
        function () {
            if (quickQuantity < 10) {
                quickQuantity++;
            }

            if (quantityValue) {
                quantityValue.textContent =
                    quickQuantity;
            }
        }
    );
}

if (btnAddCart) {
    btnAddCart.addEventListener(
        "click",
        function () {
            if (!currentQuickProduct) {
                return;
            }

            addToCart(
                currentQuickProduct
            );
        }
    );
}

if (btnBuyNow) {
    btnBuyNow.addEventListener(
        "click",
        function () {
            if (!currentQuickProduct) {
                return;
            }

            addToCart(
                currentQuickProduct
            );

            window.location.href =
                "../../cart-checkout/cart.html";
        }
    );
}

if (productSearch) {
    productSearch.addEventListener(
        "input",
        applyFilters
    );
}

if (searchButton) {
    searchButton.addEventListener(
        "click",
        applyFilters
    );
}

categoryFilters.forEach(function (input) {
    input.addEventListener(
        "change",
        applyFilters
    );
});

sizeFilters.forEach(function (input) {
    input.addEventListener(
        "change",
        applyFilters
    );
});

colorFilters.forEach(function (input) {
    input.addEventListener(
        "change",
        applyFilters
    );
});

if (priceFilter) {
    priceFilter.addEventListener(
        "input",
        function () {
            updatePriceValue();
            applyFilters();
        }
    );
}

if (sortProducts) {
    sortProducts.addEventListener(
        "change",
        applyFilters
    );
}

if (clearFilters) {
    clearFilters.addEventListener(
        "click",
        resetFilters
    );
}

if (resetSearch) {
    resetSearch.addEventListener(
        "click",
        resetFilters
    );
}

if (closeQuickView) {
    closeQuickView.addEventListener(
        "click",
        closeQuickViewModal
    );
}

if (quickViewModal) {
    quickViewModal.addEventListener(
        "click",
        function (event) {
            if (
                event.target.hasAttribute(
                    "data-close-modal"
                )
            ) {
                closeQuickViewModal();
            }
        }
    );
}

document.addEventListener(
    "keydown",
    function (event) {
        if (
            event.key === "Escape" &&
            quickViewModal &&
            !quickViewModal.hidden
        ) {
            closeQuickViewModal();
        }
    }
);

loadProducts();