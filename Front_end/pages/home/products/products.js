"use strict";

let allProducts = [];
let filteredProducts = [];

/* =========================
   DOM ELEMENTS
========================= */

const productGrid = document.getElementById("productGrid");
const productCount = document.getElementById("productCount");
const noProducts = document.getElementById("noProducts");

const priceFilter = document.getElementById("priceFilter");
const priceValue = document.getElementById("priceValue");

const sortProducts = document.getElementById("sortProducts");

const sizeFilters = document.querySelectorAll(
    'input[name="size"]'
);

const colorFilters = document.querySelectorAll(
    'input[name="color"]'
);


/* =========================
   FORMAT PRICE
========================= */

function formatPrice(price) {
    return Number(price).toLocaleString("vi-VN") + "đ";
}


/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts() {

    try {

        const response = await fetch("/data/products.json");

        if (!response.ok) {
            throw new Error(
                "Không thể tải dữ liệu sản phẩm."
            );
        }

        allProducts = await response.json();

        filteredProducts = [...allProducts];

        updatePriceValue();

        renderProducts();

    } catch (error) {

        console.error(
            "Lỗi tải sản phẩm:",
            error
        );

        productGrid.innerHTML = `
            <p class="no-products">
                Không thể tải danh sách sản phẩm.
            </p>
        `;

        productCount.textContent = "0";
    }
}


/* =========================
   RENDER PRODUCTS
========================= */

function renderProducts() {

    productGrid.innerHTML = "";

    productCount.textContent =
        filteredProducts.length;


    if (filteredProducts.length === 0) {

        noProducts.hidden = false;

        return;
    }

    noProducts.hidden = true;


    filteredProducts.forEach((product) => {

        const card =
            createProductCard(product);

        productGrid.appendChild(card);

    });
}


/* =========================
   CREATE PRODUCT CARD
========================= */

function createProductCard(product) {

    const article =
        document.createElement("article");

    article.className =
        "product-card";


    /* =====================
       IMAGE
    ===================== */

    const imageBox =
        document.createElement("div");

    imageBox.className =
        "product-img-box";


    const image =
        document.createElement("img");

    image.src =
        convertImagePath(product.image);

    image.alt =
        product.name;

    image.loading =
        "lazy";


    image.addEventListener(
        "error",
        () => {

            image.src =
                "/Front_end/assets/images/clubs/manchester-united-2025-home.jpg";

        },
        { once: true }
    );


    imageBox.appendChild(image);


    /* =====================
       PRODUCT INFO
    ===================== */

    const info =
        document.createElement("div");

    info.className =
        "product-card-info";


    /* PRODUCT NAME */

    const title =
        document.createElement("a");

    title.className =
        "product-title";

    title.href =
        `product-detail.html?id=${product.id}`;

    title.textContent =
        product.name;


    /* PRICE */

    const price =
        document.createElement("p");

    price.className =
        "product-price";

    price.textContent =
        formatPrice(product.price);


    /* =====================
       DETAIL BUTTON
    ===================== */

    const actions =
        document.createElement("div");

    actions.className =
        "card-actions";


    const detailLink =
        document.createElement("a");

    detailLink.className =
        "btn-detail";

    detailLink.href =
        `product-detail.html?id=${product.id}`;

    detailLink.textContent =
        "Xem chi tiết";


    actions.appendChild(
        detailLink
    );


    /* =====================
       APPEND
    ===================== */

    info.appendChild(title);

    info.appendChild(price);

    info.appendChild(actions);

    article.appendChild(imageBox);

    article.appendChild(info);


    return article;
}


/* =========================
   IMAGE PATH
========================= */

function convertImagePath(imagePath) {

    if (!imagePath) {

        return "/Front_end/assets/images/clubs/manchester-united-2025-home.jpg";
    }


    /*
     * JSON:
     * ../assets/images/clubs/...
     *
     * Chuyển thành:
     * /Front_end/assets/images/clubs/...
     */

    if (
        imagePath.startsWith(
            "../assets/"
        )
    ) {

        return "/Front_end/" +
            imagePath.replace(
                "../",
                ""
            );
    }


    if (
        imagePath.startsWith(
            "./assets/"
        )
    ) {

        return "/Front_end/" +
            imagePath.replace(
                "./",
                ""
            );
    }


    return imagePath;
}


/* =========================
   FILTER PRODUCTS
========================= */

function applyFilters() {

    const selectedSizes =
        [...sizeFilters]
            .filter(
                (checkbox) =>
                    checkbox.checked
            )
            .map(
                (checkbox) =>
                    checkbox.value
            );


    const selectedColors =
        [...colorFilters]
            .filter(
                (checkbox) =>
                    checkbox.checked
            )
            .map(
                (checkbox) =>
                    checkbox.value
            );


    const maxPrice =
        Number(priceFilter.value);


    filteredProducts =
        allProducts.filter(
            (product) => {


                /* SIZE */

                const sizeMatch =
                    selectedSizes.length === 0 ||
                    selectedSizes.some(
                        (size) =>
                            Array.isArray(
                                product.sizes
                            ) &&
                            product.sizes.includes(
                                size
                            )
                    );


                /* COLOR */

                const colorMatch =
                    selectedColors.length === 0 ||
                    selectedColors.includes(
                        String(
                            product.color
                        ).toLowerCase()
                    );


                /* PRICE */

                const priceMatch =
                    Number(
                        product.price
                    ) <= maxPrice;


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


/* =========================
   SORT PRODUCTS
========================= */

function applySorting() {

    const sortType =
        sortProducts.value;


    if (
        sortType ===
        "price-low"
    ) {

        filteredProducts.sort(
            (a, b) =>
                Number(a.price) -
                Number(b.price)
        );
    }


    if (
        sortType ===
        "price-high"
    ) {

        filteredProducts.sort(
            (a, b) =>
                Number(b.price) -
                Number(a.price)
        );
    }
}


/* =========================
   PRICE VALUE
========================= */

function updatePriceValue() {

    priceValue.textContent =
        formatPrice(
            priceFilter.value
        );
}


/* =========================
   FILTER EVENTS
========================= */

sizeFilters.forEach(
    (checkbox) => {

        checkbox.addEventListener(
            "change",
            applyFilters
        );

    }
);


colorFilters.forEach(
    (checkbox) => {

        checkbox.addEventListener(
            "change",
            applyFilters
        );

    }
);


priceFilter.addEventListener(
    "input",
    () => {

        updatePriceValue();

        applyFilters();

    }
);


/* =========================
   SORT EVENT
========================= */

sortProducts.addEventListener(
    "change",
    () => {

        applySorting();

        renderProducts();

    }
);


/* =========================
   START
========================= */

loadProducts();