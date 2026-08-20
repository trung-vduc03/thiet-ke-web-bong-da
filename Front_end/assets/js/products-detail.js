"use strict";

/* ========================================
   STATE
======================================== */
let allProducts = [];
let currentProduct = null;
let currentImages = [];
let currentImageIndex = 0;
let selectedSize = "";
let selectedColor = "";
let quantity = 1;

/* ========================================
   DOM
======================================== */
const productImage = document.getElementById("productImage");
const productThumbnails = document.getElementById("productThumbnails");
const productCategory = document.getElementById("productCategory");
const productName = document.getElementById("productName");
const productRating = document.getElementById("productRating");
const stockStatus = document.getElementById("stockStatus");
const productPrice = document.getElementById("productPrice");
const productDescription = document.getElementById("productDescription");
const breadcrumbTitle = document.getElementById("breadcrumbTitle");
const sizeOptionsContainer = document.getElementById("sizeOptionsContainer");
const colorOptionsContainer = document.getElementById("colorOptionsContainer");
const sizeError = document.getElementById("sizeError");
const colorError = document.getElementById("colorError");
const decreaseBtn = document.getElementById("decreaseBtn");
const increaseBtn = document.getElementById("increaseBtn");
const quantityElement = document.getElementById("quantity");
const addToCartBtn = document.getElementById("addToCartBtn");
const toggleWishlistBtn = document.getElementById("toggleWishlistBtn");
const cartMessage = document.getElementById("cartMessage");
const relatedProducts = document.getElementById("relatedProducts");
const prevImageBtn = document.getElementById("prevImageBtn");
const nextImageBtn = document.getElementById("nextImageBtn");

/* ========================================
   FORMAT PRICE
======================================== */
function formatPrice(price) {
    return Number(price).toLocaleString("vi-VN") + "đ";
}

/* ========================================
   GET PRODUCT ID
======================================== */
function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

/* ========================================
   IMAGE PATH
======================================== */
function convertImagePath(imagePath) {
    if (!imagePath) return '/Front_end/assets/images/clubs/manchester-united-2025-home.jpg';
    if (typeof normalizeProductImage === 'function') return normalizeProductImage(imagePath);
    const p = String(imagePath).replace(/\\/g, '/');
    const i = p.lastIndexOf('Front_end/assets/');
    if (i >= 0) return '/' + p.substring(i);
    if (p.startsWith('../assets/')) return '/Front_end/' + p.substring(3);
    if (p.startsWith('./assets/')) return '/Front_end/' + p.substring(2);
    if (p.startsWith('/')) return p;
    if (p.startsWith('assets/')) return '/Front_end/' + p;
    return '/Front_end/assets/images/clubs/' + p.split('/').pop();
}

/* ========================================
   LOAD DATA
======================================== */
async function loadProductsData() {
    const paths = [
        "../../../../database/products.json",
        "/database/products.json"
    ];

    for (const path of paths) {
        try {
            const response = await fetch(path);

            if (!response.ok) {
                continue;
            }

            const data = await response.json();

            if (Array.isArray(data)) {
                return data;
            }
        } catch (error) {
            console.warn("Không tải được:", path);
        }
    }

    throw new Error("Không thể tải dữ liệu sản phẩm.");
}

/* ========================================
   LOAD DETAIL
======================================== */
async function loadProductDetail() {
    try {
        const productId = getProductId();

        if (!productId) {
            throw new Error("Không có ID sản phẩm trên thanh URL.");
        }

        allProducts = await loadProductsData();

        currentProduct = allProducts.find(
            product => String(product.id) === String(productId)
        );

        if (!currentProduct) {
            throw new Error("Không tìm thấy sản phẩm.");
        }

        displayProduct();
        renderRelatedProducts();
        updateCartCount();

    } catch (error) {
        console.error(error);
        productName.textContent = "Lỗi tải sản phẩm";
        productDescription.textContent = error.message;
    }
}

/* ========================================
   DISPLAY PRODUCT
======================================== */
function displayProduct() {
    document.title = currentProduct.name + " | Football Fashion";
    productName.textContent = currentProduct.name;
    breadcrumbTitle.textContent = currentProduct.name;
    productCategory.textContent = currentProduct.category || "Áo đấu";
    productPrice.textContent = formatPrice(currentProduct.price);
    productDescription.textContent = currentProduct.description || "Sản phẩm thời trang bóng đá chất lượng cao.";
    productRating.textContent = `(${currentProduct.rating || 0} đánh giá)`;
    stockStatus.textContent = Number(currentProduct.stock || 1) > 0 ? "Còn hàng" : "Hết hàng";

    currentImages = getProductImages();
    currentImageIndex = 0;

    renderMainImage();
    renderThumbnails();
    renderSizeOptions();
    renderColorOptions();
    
    quantity = 1;
    updateQuantity();
}

/* ========================================
   PRODUCT IMAGES
======================================== */
function getProductImages() {
    if (Array.isArray(currentProduct.images) && currentProduct.images.length > 0) {
        return currentProduct.images.map(convertImagePath);
    }

    if (currentProduct.image) {
        return [convertImagePath(currentProduct.image)];
    }

    return [normalizeProductImage("manchester-united-2025-home.jpg")];
}

/* ========================================
   MAIN IMAGE
======================================== */
function renderMainImage() {
    if (!currentImages.length) {
        return;
    }

    productImage.src = currentImages[currentImageIndex];
    productImage.alt = currentProduct.name;

    productImage.onerror = function () {
        this.onerror = null;
        this.src = normalizeProductImage("manchester-united-2025-home.jpg");
    };
}

/* ========================================
   THUMBNAILS
======================================== */
function renderThumbnails() {
    productThumbnails.innerHTML = "";

    currentImages.forEach(function (image, index) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "thumbnail";

        if (index === currentImageIndex) {
            button.classList.add("active");
        }

        const img = document.createElement("img");
        img.src = image;
        img.alt = `${currentProduct.name} - ảnh ${index + 1}`;

        button.appendChild(img);

        button.addEventListener("click", function () {
            currentImageIndex = index;
            renderMainImage();
            renderThumbnails();
        });

        productThumbnails.appendChild(button);
    });

    const multiple = currentImages.length > 1;
    prevImageBtn.hidden = !multiple;
    nextImageBtn.hidden = !multiple;
}

/* ========================================
   NEXT / PREVIOUS
======================================== */
function showPreviousImage() {
    if (currentImages.length <= 1) {
        return;
    }

    currentImageIndex--;

    if (currentImageIndex < 0) {
        currentImageIndex = currentImages.length - 1;
    }

    renderMainImage();
    renderThumbnails();
}

function showNextImage() {
    if (currentImages.length <= 1) {
        return;
    }

    currentImageIndex++;

    if (currentImageIndex >= currentImages.length) {
        currentImageIndex = 0;
    }

    renderMainImage();
    renderThumbnails();
}

/* ========================================
   SIZE
======================================== */
function renderSizeOptions() {
    sizeOptionsContainer.innerHTML = "";
    selectedSize = "";

    const sizes = Array.isArray(currentProduct.sizes) ? currentProduct.sizes : ["S", "M", "L", "XL"];

    sizes.forEach(function (size) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "size-button";
        button.textContent = size;

        button.addEventListener("click", function () {
            selectedSize = size;

            document.querySelectorAll(".size-button").forEach(btn => btn.classList.remove("selected"));
            button.classList.add("selected");
            sizeError.textContent = "";
        });

        sizeOptionsContainer.appendChild(button);
    });
}

/* ========================================
   COLOR
======================================== */
function renderColorOptions() {
    colorOptionsContainer.innerHTML = "";
    selectedColor = "";

    let colors = [];

    if (Array.isArray(currentProduct.colors)) {
        colors = currentProduct.colors;
    } else if (Array.isArray(currentProduct.color)) {
        colors = currentProduct.color;
    } else if (currentProduct.color) {
        colors = [currentProduct.color];
    } else {
        colors = ["Đỏ", "Trắng", "Đen"];
    }

    colors.forEach(function (color) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "color-button";
        button.textContent = color;

        button.addEventListener("click", function () {
            selectedColor = color;

            document.querySelectorAll(".color-button").forEach(btn => btn.classList.remove("selected"));
            button.classList.add("selected");
            colorError.textContent = "";
        });

        colorOptionsContainer.appendChild(button);
    });
}

/* ========================================
   QUANTITY
======================================== */
function updateQuantity() {
    quantityElement.textContent = quantity;
}

function decreaseQuantity() {
    if (quantity > 1) {
        quantity--;
    }
    updateQuantity();
}

function increaseQuantity() {
    const stock = Number(currentProduct?.stock || 99);
    if (quantity < stock) {
        quantity++;
    }
    updateQuantity();
}

/* ========================================
   CART
======================================== */
function getCart() {
    try {
        return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart() {
    sizeError.textContent = "";
    colorError.textContent = "";

    if (Array.isArray(currentProduct.sizes) && currentProduct.sizes.length > 0 && !selectedSize) {
        sizeError.textContent = "Vui lòng chọn size.";
        return;
    }

    if (currentProduct.color || currentProduct.colors) {
        if (!selectedColor) {
            colorError.textContent = "Vui lòng chọn màu.";
            return;
        }
    }

    const cart = getCart();

    const existing = cart.find(
        item =>
            String(item.id) === String(currentProduct.id) &&
            item.size === selectedSize &&
            item.color === selectedColor
    );

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            id: currentProduct.id,
            name: currentProduct.name,
            price: Number(currentProduct.price),
            image: convertImagePath(currentProduct.image),
            size: selectedSize,
            color: selectedColor,
            quantity: quantity
        });
    }

    saveCart(cart);
    updateCartCount();

    cartMessage.textContent = "Đã thêm sản phẩm vào giỏ hàng thành công!";
    setTimeout(() => { cartMessage.textContent = ""; }, 3000);
}

/* ========================================
   CART COUNT
======================================== */
function updateCartCount() {
    const cart = getCart();

    const count = cart.reduce((total, item) => total + Number(item.quantity || 0), 0);

    const cartLinks = document.querySelectorAll('a[href*="cart"]');

    cartLinks.forEach(function (link) {
        const original = link.textContent.replace(/\s+\d+$/, "");
        link.textContent = `${original} ${count}`;
    });
}

/* ========================================
   WISHLIST
======================================== */
function getWishlist() {
    try {
        return JSON.parse(localStorage.getItem("wishlist")) || [];
    } catch {
        return [];
    }
}

function toggleWishlist() {
    const wishlist = getWishlist();

    const index = wishlist.findIndex(item => String(item.id) === String(currentProduct.id));

    if (index !== -1) {
        wishlist.splice(index, 1);
        toggleWishlistBtn.textContent = "♥ Thêm vào yêu thích";
    } else {
        wishlist.push({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            image: currentProduct.image
        });
        toggleWishlistBtn.textContent = "♥ Đã yêu thích";
    }

    localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

/* ========================================
   RELATED PRODUCTS
======================================== */
function renderRelatedProducts() {
    relatedProducts.innerHTML = "";

    const related = allProducts
        .filter(product => String(product.id) !== String(currentProduct.id))
        .slice(0, 4);

    related.forEach(function (product) {
        const card = document.createElement("article");
        card.className = "related-card";

        const image = document.createElement("img");
        image.src = convertImagePath(product.image);
        image.addEventListener("error", function () {
            this.onerror = null;
            this.src = "/Front_end/assets/images/clubs/manchester-united-2025-home.jpg";
        });
        image.alt = product.name;

        const info = document.createElement("div");
        info.className = "related-card-info";

        const link = document.createElement("a");
        link.href = `product-detail.html?id=${product.id}`;
        link.textContent = product.name;

        const price = document.createElement("p");
        price.textContent = formatPrice(product.price);

        info.appendChild(link);
        info.appendChild(price);

        card.appendChild(image);
        card.appendChild(info);

        relatedProducts.appendChild(card);
    });
}

/* ========================================
   EVENTS
======================================== */
prevImageBtn.addEventListener("click", showPreviousImage);
nextImageBtn.addEventListener("click", showNextImage);
decreaseBtn.addEventListener("click", decreaseQuantity);
increaseBtn.addEventListener("click", increaseQuantity);
addToCartBtn.addEventListener("click", addToCart);
toggleWishlistBtn.addEventListener("click", toggleWishlist);

/* ========================================
   START
======================================== */
loadProductDetail();