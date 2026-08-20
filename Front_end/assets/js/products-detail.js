"use strict";

// ==========================================================================
// TRẠNG THÁI ỨNG DỤNG TRANG CHI TIẾT SẢN PHẨM (STATE MANAGEMENT)
// ==========================================================================
let allProducts = [];         // Toàn bộ danh sách sản phẩm từ database
let currentProduct = null;     // Sản phẩm hiện tại đang xem chi tiết
let currentImages = [];        // Danh sách hình ảnh của sản phẩm hiện tại
let currentImageIndex = 0;     // Vị trí hình ảnh đang được phóng to / hiển thị chính
let selectedSize = "";         // Kích cỡ (Size) đang được người dùng chọn
let selectedColor = "";        // Màu sắc (Color) đang được người dùng chọn
let quantity = 1;              // Số lượng sản phẩm muốn đặt mua

// ==========================================================================
// CÁC PHẦN TỬ GIAO DIỆN (DOM ELEMENTS)
// ==========================================================================
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

// ==========================================================================
// CÁC HÀM TIỆN ÍCH & TRÍCH XUẤT THÔNG TIN (HELPER FUNCTIONS)
// ==========================================================================

// Định dạng số thành chuỗi tiền tệ VND (ví dụ: 350.000đ)
// Tham số price: Mức giá cần định dạng
// Trả về: Chuỗi tiền tệ đã định dạng
function formatPrice(price) {
    return Number(price).toLocaleString("vi-VN") + "đ";
}

// Trích xuất tham số ID sản phẩm từ URL Query String (ví dụ: ?id=1)
// Trả về: ID sản phẩm hoặc null nếu không tìm thấy
function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// Chuẩn hóa đường dẫn hình ảnh sản phẩm để hiển thị chính xác ở mọi cấp thư mục
// Tham số imagePath: Đường dẫn ảnh từ dữ liệu sản phẩm
// Trả về: Đường dẫn ảnh đã chuẩn hóa
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

// ==========================================================================
// TẢI VÀ NẠP DỮ LIỆU SẢN PHẨM (DATA LOADING)
// ==========================================================================

// Tải dữ liệu toàn bộ sản phẩm từ file json với cơ chế thử lại nhiều đường dẫn tương đối/tuyệt đối
// Trả về: Mảng dữ liệu các sản phẩm
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
            console.warn("Không tải được đường dẫn:", path);
        }
    }

    throw new Error("Không thể tải dữ liệu sản phẩm.");
}

// Tìm nạp thông tin chi tiết của sản phẩm dựa theo ID trên URL và kích hoạt render giao diện
async function loadProductDetail() {
    try {
        const productId = getProductId();

        if (!productId) {
            throw new Error("Không có ID sản phẩm trên thanh URL.");
        }

        allProducts = await loadProductsData();

        // Tìm sản phẩm có ID khớp với ID từ URL
        currentProduct = allProducts.find(
            product => String(product.id) === String(productId)
        );

        if (!currentProduct) {
            throw new Error("Không tìm thấy sản phẩm.");
        }

        // Hiển thị chi tiết sản phẩm, danh sách gợi ý và cập nhật giỏ hàng
        displayProduct();
        renderRelatedProducts();
        updateCartCount();

    } catch (error) {
        console.error(error);
        if (productName) productName.textContent = "Lỗi tải sản phẩm";
        if (productDescription) productDescription.textContent = error.message;
    }
}

// ==========================================================================
// HIỂN THỊ CHI TIẾT SẢN PHẨM (RENDER PRODUCT DETAILS)
// ==========================================================================

// Gán các thông tin chi tiết của sản phẩm (tên, giá, mô tả, đánh giá, tồn kho, ảnh, size, màu) lên DOM
function displayProduct() {
    document.title = currentProduct.name + " | Football Fashion";
    if (productName) productName.textContent = currentProduct.name;
    if (breadcrumbTitle) breadcrumbTitle.textContent = currentProduct.name;
    if (productCategory) productCategory.textContent = currentProduct.category || "Áo đấu";
    if (productPrice) productPrice.textContent = formatPrice(currentProduct.price);
    if (productDescription) productDescription.textContent = currentProduct.description || "Sản phẩm thời trang bóng đá chất lượng cao.";
    if (productRating) productRating.textContent = `(${currentProduct.rating || 0} đánh giá)`;
    if (stockStatus) stockStatus.textContent = Number(currentProduct.stock || 1) > 0 ? "Còn hàng" : "Hết hàng";

    // Khởi tạo danh sách ảnh và ảnh đang chọn
    currentImages = getProductImages();
    currentImageIndex = 0;

    renderMainImage();
    renderThumbnails();
    renderSizeOptions();
    renderColorOptions();
    
    // Đặt lại số lượng mua ban đầu là 1
    quantity = 1;
    updateQuantity();
}

// Trích xuất danh sách tất cả các đường dẫn ảnh của sản phẩm
// Trả về: Mảng đường dẫn ảnh
function getProductImages() {
    if (Array.isArray(currentProduct.images) && currentProduct.images.length > 0) {
        return currentProduct.images.map(convertImagePath);
    }

    if (currentProduct.image) {
        return [convertImagePath(currentProduct.image)];
    }

    return [normalizeProductImage("manchester-united-2025-home.jpg")];
}

// Hiển thị hình ảnh chính tại vị trí currentImageIndex
function renderMainImage() {
    if (!currentImages.length || !productImage) {
        return;
    }

    productImage.src = currentImages[currentImageIndex];
    productImage.alt = currentProduct.name;

    // Xử lý ảnh lỗi fallback
    productImage.onerror = function () {
        this.onerror = null;
        this.src = normalizeProductImage("manchester-united-2025-home.jpg");
    };
}

// Tạo danh sách các hình thu nhỏ (Thumbnails) phía dưới ảnh chính và xử lý bấm chọn ảnh
function renderThumbnails() {
    if (!productThumbnails) return;
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

        // Khi người dùng bấm vào một ảnh thu nhỏ
        button.addEventListener("click", function () {
            currentImageIndex = index;
            renderMainImage();
            renderThumbnails();
        });

        productThumbnails.appendChild(button);
    });

    // Ẩn các nút Next/Prev nếu sản phẩm chỉ có 1 ảnh duy nhất
    const multiple = currentImages.length > 1;
    if (prevImageBtn) prevImageBtn.hidden = !multiple;
    if (nextImageBtn) nextImageBtn.hidden = !multiple;
}

// Chuyển sang ảnh trước đó trong gallery
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

// Chuyển sang ảnh kế tiếp trong gallery
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

// ==========================================================================
// TÙY CHỌN SIZE & MÀU SẮC (ATTRIBUTES SELECTION)
// ==========================================================================

// Hiển thị danh sách các nút chọn kích cỡ (Size)
function renderSizeOptions() {
    if (!sizeOptionsContainer) return;
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
            if (sizeError) sizeError.textContent = "";
        });

        sizeOptionsContainer.appendChild(button);
    });
}

// Hiển thị danh sách các nút chọn màu sắc (Color)
function renderColorOptions() {
    if (!colorOptionsContainer) return;
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
            if (colorError) colorError.textContent = "";
        });

        colorOptionsContainer.appendChild(button);
    });
}

// ==========================================================================
// ĐIỀU KHIỂN SỐ LƯỢNG (QUANTITY CONTROLS)
// ==========================================================================

// Cập nhật số lượng hiển thị lên giao diện
function updateQuantity() {
    if (quantityElement) {
        quantityElement.textContent = quantity;
    }
}

// Giảm số lượng mua (tối thiểu là 1)
function decreaseQuantity() {
    if (quantity > 1) {
        quantity--;
    }
    updateQuantity();
}

// Tăng số lượng mua (không vượt quá số lượng tồn kho)
function increaseQuantity() {
    const stock = Number(currentProduct?.stock || 99);
    if (quantity < stock) {
        quantity++;
    }
    updateQuantity();
}

// ==========================================================================
// THÊM VÀO GIỎ HÀNG (ADD TO CART)
// ==========================================================================

// Lấy danh sách giỏ hàng từ localStorage
// Trả về: Mảng các mặt hàng
function getCart() {
    try {
        return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
        return [];
    }
}

// Lưu danh sách giỏ hàng vào localStorage
// Tham số cart: Mảng giỏ hàng
function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Xử lý thêm sản phẩm hiện tại vào giỏ hàng:
// - Kiểm tra bắt buộc chọn Size (nếu có)
// - Kiểm tra bắt buộc chọn Màu sắc (nếu có)
// - Thêm hoặc cộng dồn số lượng nếu đã tồn tại cùng biến thể
function addToCart() {
    if (sizeError) sizeError.textContent = "";
    if (colorError) colorError.textContent = "";

    // Kiểm tra đã chọn size chưa
    if (Array.isArray(currentProduct.sizes) && currentProduct.sizes.length > 0 && !selectedSize) {
        if (sizeError) sizeError.textContent = "Vui lòng chọn size.";
        return;
    }

    // Kiểm tra đã chọn màu sắc chưa
    if (currentProduct.color || currentProduct.colors) {
        if (!selectedColor) {
            if (colorError) colorError.textContent = "Vui lòng chọn màu.";
            return;
        }
    }

    const cart = getCart();

    // Tìm kiếm xem biến thể đã có trong giỏ chưa
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

    // Hiển thị thông báo thêm thành công
    if (cartMessage) {
        cartMessage.textContent = "Đã thêm sản phẩm vào giỏ hàng thành công!";
        setTimeout(() => { cartMessage.textContent = ""; }, 3000);
    }
}

// Cập nhật số lượng sản phẩm giỏ hàng trên thanh điều hướng
function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
    const cartLinks = document.querySelectorAll('a[href*="cart"]');

    cartLinks.forEach(function (link) {
        const original = link.textContent.replace(/\s+\d+$/, "");
        link.textContent = `${original} ${count}`;
    });
}

// ==========================================================================
// DANH SÁCH YÊU THÍCH (WISHLIST)
// ==========================================================================

// Lấy danh sách yêu thích từ localStorage
// Trả về: Mảng các sản phẩm yêu thích
function getWishlist() {
    try {
        return JSON.parse(localStorage.getItem("wishlist")) || [];
    } catch {
        return [];
    }
}

// Thêm hoặc xóa sản phẩm hiện tại khỏi danh sách yêu thích
function toggleWishlist() {
    const wishlist = getWishlist();
    const index = wishlist.findIndex(item => String(item.id) === String(currentProduct.id));

    if (index !== -1) {
        wishlist.splice(index, 1);
        if (toggleWishlistBtn) toggleWishlistBtn.textContent = "♥ Thêm vào yêu thích";
    } else {
        wishlist.push({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            image: currentProduct.image
        });
        if (toggleWishlistBtn) toggleWishlistBtn.textContent = "♥ Đã yêu thích";
    }

    localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

// ==========================================================================
// SẢN PHẨM LIÊN QUAN (RELATED PRODUCTS)
// ==========================================================================

// Hiển thị danh sách 4 sản phẩm liên quan (khác với sản phẩm đang xem)
function renderRelatedProducts() {
    if (!relatedProducts) return;
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
        link.href = `products-detail.html?id=${product.id}`;
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

// ==========================================================================
// GẮN SỰ KIỆN TƯƠNG TÁC NGƯỜI DÙNG (EVENT LISTENERS)
// ==========================================================================
if (prevImageBtn) prevImageBtn.addEventListener("click", showPreviousImage);
if (nextImageBtn) nextImageBtn.addEventListener("click", showNextImage);
if (decreaseBtn) decreaseBtn.addEventListener("click", decreaseQuantity);
if (increaseBtn) increaseBtn.addEventListener("click", increaseQuantity);
if (addToCartBtn) addToCartBtn.addEventListener("click", addToCart);
if (toggleWishlistBtn) toggleWishlistBtn.addEventListener("click", toggleWishlist);

// ==========================================================================
// KHỞI CHẠY TẢI DỮ LIỆU BAN ĐẦU
// ==========================================================================
loadProductDetail();