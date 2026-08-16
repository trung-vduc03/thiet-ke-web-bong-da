"use strict";

let allProducts = [];
let filteredProducts = [];


/* ========================================
   DOM
======================================== */

const productGrid = document.getElementById("productGrid");
const productCount = document.getElementById("productCount");
const noProducts = document.getElementById("noProducts");

const priceFilter = document.getElementById("priceFilter");
const priceValue = document.getElementById("priceValue");

const sortProducts = document.getElementById("sortProducts");
const clearFilters = document.getElementById("clearFilters");

const sizeFilters = document.querySelectorAll(
    'input[name="size"]'
);

const colorFilters = document.querySelectorAll(
    'input[name="color"]'
);


/* QUICK VIEW */

const quickViewModal =
    document.getElementById("quickViewModal");

const closeQuickView =
    document.getElementById("closeQuickView");

const quickViewImage =
    document.getElementById("quickViewImage");

const quickViewTitle =
    document.getElementById("quickViewTitle");

const quickViewCategory =
    document.getElementById("quickViewCategory");

const quickViewPrice =
    document.getElementById("quickViewPrice");

const quickViewDescription =
    document.getElementById("quickViewDescription");

const quickViewDetail =
    document.getElementById("quickViewDetail");


/* ========================================
   FORMAT PRICE
======================================== */

function formatPrice(price) {

    return Number(price).toLocaleString("vi-VN") + "đ";

}


/* ========================================
   IMAGE PATH
======================================== */

function convertImagePath(imagePath) {

    if (!imagePath) {

        return "/Front_end/assets/images/clubs/manchester-united-2025-home.jpg";

    }


    if (imagePath.startsWith("../assets/")) {

        return "/Front_end/" +
            imagePath.replace("../", "");

    }


    if (imagePath.startsWith("./assets/")) {

        return "/Front_end/" +
            imagePath.replace("./", "");

    }


    if (imagePath.startsWith("/")) {

        return imagePath;

    }


    return "/Front_end/" + imagePath;

}


/* ========================================
   LOAD PRODUCTS
======================================== */

async function loadProducts() {

    try {

        const response =
            await fetch("/database/products.json");

        if (!response.ok) {

            throw new Error(
                "Không thể tải products.json"
            );

        }

        allProducts =
            await response.json();


        filteredProducts =
            [...allProducts];


        updatePriceValue();

        applySorting();

        renderProducts();

    } catch (error) {

        console.error(error);

        productGrid.innerHTML = `
            <div class="no-products">
                <h2>Không thể tải sản phẩm</h2>
                <p>Vui lòng kiểm tra lại dữ liệu sản phẩm.</p>
            </div>
        `;

        productCount.textContent = "0";

    }

}


/* ========================================
   CREATE PRODUCT CARD
======================================== */

function createProductCard(product) {

    const article =
        document.createElement("article");

    article.className =
        "product-card";


    const imageBox =
        document.createElement("div");

    imageBox.className =
        "product-img-box";


    const image =
        document.createElement("img");

    image.src =
        convertImagePath(product.image);

    image.alt =
        product.name || "Sản phẩm";

    image.loading =
        "lazy";


    image.addEventListener(
        "error",
        function () {

            this.onerror = null;

            this.src =
                "/Front_end/assets/images/clubs/manchester-united-2025-home.jpg";

        }
    );


    imageBox.appendChild(image);


    const info =
        document.createElement("div");

    info.className =
        "product-card-info";


    const category =
        document.createElement("p");

    category.className =
        "product-category";

    category.textContent =
        product.category || "Áo đấu";


    const title =
        document.createElement("a");

    title.className =
        "product-title";

    title.href =
        `product-detail.html?id=${product.id}`;

    title.textContent =
        product.name;


    const price =
        document.createElement("p");

    price.className =
        "product-price";

    price.textContent =
        formatPrice(product.price);


    const actions =
        document.createElement("div");

    actions.className =
        "card-actions";


    const quickViewButton =
        document.createElement("button");

    quickViewButton.type =
        "button";

    quickViewButton.className =
        "quick-view-btn";

    quickViewButton.textContent =
        "Xem nhanh";


    quickViewButton.addEventListener(
        "click",
        function () {

            openQuickView(product);

        }
    );


    const detailLink =
        document.createElement("a");

    detailLink.className =
        "btn-detail";

    detailLink.href =
        `product-detail.html?id=${product.id}`;

    detailLink.textContent =
        "Chi tiết";


    actions.appendChild(
        quickViewButton
    );

    actions.appendChild(
        detailLink
    );


    info.appendChild(category);

    info.appendChild(title);

    info.appendChild(price);

    info.appendChild(actions);


    article.appendChild(imageBox);

    article.appendChild(info);


    return article;

}


/* ========================================
   RENDER PRODUCTS
======================================== */

function renderProducts() {

    productGrid.innerHTML = "";

    productCount.textContent =
        filteredProducts.length;


    if (
        filteredProducts.length === 0
    ) {

        noProducts.hidden = false;

        return;

    }


    noProducts.hidden = true;


    filteredProducts.forEach(
        function (product) {

            productGrid.appendChild(
                createProductCard(product)
            );

        }
    );

}


/* ========================================
   FILTER
======================================== */

function applyFilters() {

    const selectedSizes =
        [...sizeFilters]
            .filter(
                checkbox => checkbox.checked
            )
            .map(
                checkbox => checkbox.value
            );


    const selectedColors =
        [...colorFilters]
            .filter(
                checkbox => checkbox.checked
            )
            .map(
                checkbox =>
                    checkbox.value.toLowerCase()
            );


    const maxPrice =
        Number(priceFilter.value);


    filteredProducts =
        allProducts.filter(
            function (product) {

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
                    String(
                        product.color || ""
                    ).toLowerCase();


                const colorMatch =
                    selectedColors.length === 0 ||
                    selectedColors.includes(
                        productColor
                    );


                const priceMatch =
                    Number(product.price) <=
                    maxPrice;


                return (
                    sizeMatch &&
                    colorMatch &&
                    priceMatch
                );

            }
        );


    applySorting();

    renderProducts();

}


/* ========================================
   SORT
======================================== */

function applySorting() {

    const sortType =
        sortProducts.value;


    if (sortType === "price-low") {

        filteredProducts.sort(
            (a, b) =>
                Number(a.price) -
                Number(b.price)
        );

    }


    else if (sortType === "price-high") {

        filteredProducts.sort(
            (a, b) =>
                Number(b.price) -
                Number(a.price)
        );

    }


    else if (sortType === "name-az") {

        filteredProducts.sort(
            (a, b) =>
                String(a.name).localeCompare(
                    String(b.name),
                    "vi"
                )
        );

    }


    else if (sortType === "name-za") {

        filteredProducts.sort(
            (a, b) =>
                String(b.name).localeCompare(
                    String(a.name),
                    "vi"
                )
        );

    }

}


/* ========================================
   PRICE
======================================== */

function updatePriceValue() {

    priceValue.textContent =
        formatPrice(
            priceFilter.value
        );

}


/* ========================================
   CLEAR FILTERS
======================================== */

function resetFilters() {

    sizeFilters.forEach(
        checkbox => {
            checkbox.checked = false;
        }
    );


    colorFilters.forEach(
        checkbox => {
            checkbox.checked = false;
        }
    );


    priceFilter.value =
        priceFilter.max;


    sortProducts.value =
        "default";


    updatePriceValue();


    filteredProducts =
        [...allProducts];


    renderProducts();

}


/* ========================================
   QUICK VIEW
======================================== */

function openQuickView(product) {

    quickViewImage.src =
        convertImagePath(product.image);

    quickViewImage.alt =
        product.name;


    quickViewTitle.textContent =
        product.name;


    quickViewCategory.textContent =
        product.category || "Áo đấu";


    quickViewPrice.textContent =
        formatPrice(product.price);


    quickViewDescription.textContent =
        product.description ||
        "Sản phẩm thời trang bóng đá chính hãng."


    quickViewDetail.href =
        `product-detail.html?id=${product.id}`;


    quickViewModal.hidden =
        false;

    quickViewModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );

}


function closeQuickViewModal() {

    quickViewModal.hidden =
        true;

    quickViewModal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "modal-open"
    );

}


/* ========================================
   EVENTS
======================================== */

sizeFilters.forEach(
    checkbox => {

        checkbox.addEventListener(
            "change",
            applyFilters
        );

    }
);


colorFilters.forEach(
    checkbox => {

        checkbox.addEventListener(
            "change",
            applyFilters
        );

    }
);


priceFilter.addEventListener(
    "input",
    function () {

        updatePriceValue();

        applyFilters();

    }
);


sortProducts.addEventListener(
    "change",
    function () {

        applySorting();

        renderProducts();

    }
);


clearFilters.addEventListener(
    "click",
    resetFilters
);


closeQuickView.addEventListener(
    "click",
    closeQuickViewModal
);


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


document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeQuickViewModal();

        }

    }
);


/* ========================================
   START
======================================== */

loadProducts();