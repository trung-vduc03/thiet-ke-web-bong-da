"use strict";

// ==========================================================================
// TRẠNG THÁI ỨNG DỤNG (STATE MANAGEMENT)
// ==========================================================================
let allProducts = [];        // Danh sách toàn bộ sản phẩm tải từ database
let filteredProducts = [];   // Danh sách sản phẩm sau khi áp dụng tìm kiếm, lọc và sắp xếp

let currentPage = 1;         // Trang hiện tại đang hiển thị
const productsPerPage = 12;  // Số lượng sản phẩm hiển thị trên mỗi trang

// Trạng thái của cửa sổ Xem Nhanh (Quick View Modal)
let currentQuickProduct = null;  // Sản phẩm đang được xem trong Quick View
let selectedQuickSize = "";      // Kích thước (Size) được chọn trong Quick View
let selectedQuickColor = "";     // Màu sắc (Color) được chọn trong Quick View
let quickQuantity = 1;           // Số lượng sản phẩm muốn mua trong Quick View

// ==========================================================================
// CÁC PHẦN TỬ DOM (DOM ELEMENTS SELECTION)
// ==========================================================================
// Khu vực danh sách sản phẩm và phân trang
const productGrid = document.getElementById("productGrid");
const productCount = document.getElementById("productCount");
const noProducts = document.getElementById("noProducts");
const pagination = document.getElementById("pagination");

// Bộ lọc mức giá
const priceFilter = document.getElementById("priceFilter");
const priceValue = document.getElementById("priceValue");

// Sắp xếp và nút xóa bộ lọc
const sortProducts = document.getElementById("sortProducts");
const clearFilters = document.getElementById("clearFilters");

// Ô tìm kiếm và hiển thị tag bộ lọc đang áp dụng
const productSearch = document.getElementById("productSearch");
const searchButton = document.getElementById("searchButton");
const resetSearch = document.getElementById("resetSearch");
const activeFilters = document.getElementById("activeFilters");

// Danh sách các checkbox lọc theo Size, Màu sắc, Danh mục
const sizeFilters = document.querySelectorAll('input[name="size"]');
const colorFilters = document.querySelectorAll('input[name="color"]');
const categoryFilters = document.querySelectorAll('input[name="category"]');

// Các phần tử trong Modal Xem Nhanh (Quick View Modal)
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

// Điều khiển số lượng trong Quick View
const quantityValue = document.getElementById("quantityValue");
const quantityMinus = document.getElementById("quantityMinus");
const quantityPlus = document.getElementById("quantityPlus");

// Các nút hành động trong Quick View
const btnAddCart = document.getElementById("btnAddCart") ||
    document.getElementById("quickAddCart") ||
    document.querySelector(".btn-add-cart");

const btnBuyNow = document.getElementById("btnBuyNow") ||
    document.getElementById("quickBuyNow") ||
    document.querySelector(".btn-buy-now");

// Thông báo Toast
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

// ==========================================================================
// CÁC HÀM TIỆN ÍCH & XỬ LÝ ĐƯỜNG DẪN (HELPER FUNCTIONS)
// ==========================================================================

// Định dạng số thành chuỗi tiền tệ Việt Nam Đồng (VND)
// Tham số price: Số tiền cần định dạng (ví dụ 250000)
// Trả về: Chuỗi tiền tệ có dấu chấm phân cách và chữ đ (ví dụ "250.000đ")
function formatPrice(price) {
    return Number(price || 0).toLocaleString("vi-VN") + "đ";
}

// Xác định URL gốc của dự án dựa trên đường dẫn hiện tại của trình duyệt.
// Giúp tương thích khi chạy trên Live Server hoặc thư mục con tùy ý.
function getProjectRootUrl() {
    const marker = "/Front_end/";
    const path = window.location.pathname;
    const index = path.indexOf(marker);

    if (index >= 0) {
        return `${window.location.origin}${path.slice(0, index)}`;
    }

    return window.location.origin;
}

// Chuẩn hóa và chuyển đổi đường dẫn ảnh của sản phẩm sang đường dẫn tuyệt đối chính xác
// Tham số imagePath: Tên tệp hoặc đường dẫn ảnh thô từ database
// Trả về: Đường dẫn URL hoàn chỉnh để hiển thị hình ảnh
function convertImagePath(imagePath) {
    // Nếu không có ảnh, dùng ảnh đại diện mặc định của CLB Manchester United
    const fallback = "manchester-united-2025-home.jpg";
    const raw = String(imagePath || "").trim().replace(/\\/g, "/");
    const fileName = raw.split("/").pop() || fallback;
    const safeFileName = encodeURIComponent(fileName);

    return `${getProjectRootUrl()}/Front_end/assets/images/clubs/${safeFileName}`;
}

// Lấy đường dẫn URL đến tệp dữ liệu JSON chứa danh sách sản phẩm
function convertDatabasePath() {
    return `${getProjectRootUrl()}/database/products.json`;
}

// Trích xuất màu sắc chính của sản phẩm dưới dạng chữ thường
function getProductColor(product) {
    return String(
        product.color ||
        product.colors?.[0] ||
        ""
    ).toLowerCase();
}

// Trích xuất danh mục của sản phẩm dưới dạng chữ thường (mặc định là "Áo đấu")
function getProductCategory(product) {
    return String(
        product.category ||
        "Áo đấu"
    ).toLowerCase();
}

// ==========================================================================
// TẢI DỮ LIỆU SẢN PHẨM TỪ SERVER / FILE JSON (LOAD DATA)
// ==========================================================================

// Tải danh sách sản phẩm từ database/products.json qua Fetch API
// - Nếu thành công: Cập nhật allProducts, khởi tạo giá trị khoảng giá và gọi applyFilters()
// - Nếu thất bại: Hiển thị thông báo lỗi thân thiện trên giao diện
async function loadProducts() {
    try {
        const response = await fetch(convertDatabasePath(), {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Không thể tải products.json");
        }

        allProducts = await response.json();

        if (!Array.isArray(allProducts)) {
            throw new Error("products.json không phải mảng dữ liệu");
        }

        // Tạo bản sao dữ liệu ban đầu cho danh sách lọc
        filteredProducts = [...allProducts];

        // Khởi tạo hiển thị giá lọc và thực hiện lọc dữ liệu lần đầu
        updatePriceValue();
        applyFilters();
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu sản phẩm:", error);

        if (productGrid) {
            productGrid.innerHTML = "";
        }

        // Hiển thị thông báo không tìm thấy / lỗi tải dữ liệu
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

// ==========================================================================
// TẠO GIAO DIỆN THẺ SẢN PHẨM & HIỂN THỊ (RENDER PRODUCTS)
// ==========================================================================

// Tạo phần tử DOM thẻ sản phẩm (Product Card) chứa thông tin hình ảnh, tên, giá, nút xem nhanh, wishlist
// Tham số product: Dữ liệu chi tiết của một sản phẩm
// Trả về: Thẻ article chứa toàn bộ HTML của sản phẩm
function createProductCard(product) {
    const article = document.createElement("article");
    article.className = "product-card";

    const image = convertImagePath(product.image);
    const category = product.category || "Áo đấu";
    const rating = product.rating || "4.8";
    const hasSale = product.discount || product.oldPrice;

    // Hiển thị nhãn SALE hoặc MỚI tùy vào thuộc tính giảm giá của sản phẩm
    const badge = hasSale
        ? `<span class="product-badge sale">SALE</span>`
        : `<span class="product-badge">MỚI</span>`;

    // Hiển thị giá cũ (gạch ngang) nếu có giảm giá
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
                class="product-image"
                src="${image}"
                alt="${product.name || "Sản phẩm bóng đá"}"
                decoding="async">
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

    // Cấu hình tối ưu tải ảnh và xử lý fallback khi ảnh bị lỗi (error event)
    const img = article.querySelector("img");
    if (img) {
        img.loading = "eager";
        img.fetchPriority = "high";
        img.width = 600;
        img.height = 600;
        img.src = convertImagePath(product.image);

        img.addEventListener("error", function () {
            this.onerror = null;
            this.src = convertImagePath("manchester-united-2025-home.jpg");
        });
    }

    // Gắn sự kiện click mở modal Xem Nhanh
    const quickButton = article.querySelector(".quick-view-btn");
    if (quickButton) {
        quickButton.addEventListener("click", function () {
            openQuickView(product);
        });
    }

    // Gắn sự kiện click thêm/xóa sản phẩm khỏi danh sách yêu thích (Wishlist)
    const wishlistButton = article.querySelector(".wishlist-btn");
    if (wishlistButton) {
        updateWishlistIcon(wishlistButton, product.id);

        wishlistButton.addEventListener("click", function () {
            toggleWishlist(product, wishlistButton);
        });
    }

    return article;
}

// Hiển thị danh sách sản phẩm đã được lọc lên giao diện theo phân trang (Pagination)
function renderProducts() {
    if (!productGrid) {
        return;
    }

    // Xóa nội dung lưới sản phẩm cũ
    productGrid.innerHTML = "";

    // Cập nhật tổng số lượng sản phẩm tìm thấy
    if (productCount) {
        productCount.textContent = filteredProducts.length;
    }

    // Trường hợp không có sản phẩm nào khớp với bộ lọc
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

    // Tính toán khoảng phần tử cần cắt theo trang hiện tại
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const productsToRender = filteredProducts.slice(start, end);

    // Chèn từng thẻ sản phẩm vào lưới giao diện
    productsToRender.forEach(function (product) {
        productGrid.appendChild(createProductCard(product));
    });

    // Cập nhật thanh phân trang
    renderPagination();
}

// ==========================================================================
// BỘ LỌC VÀ TÌM KIẾM SẢN PHẨM (FILTERING & SEARCH LOGIC)
// ==========================================================================

// Áp dụng tất cả các tiêu chí lọc: Size, Màu sắc, Danh mục, Khoảng giá, và Từ khóa tìm kiếm.
// Sau khi lọc sẽ kích hoạt sắp xếp (applySorting), đưa trang về trang 1 và render lại giao diện.
function applyFilters() {
    // 1. Lấy danh sách các Size đang được check
    const selectedSizes = [...sizeFilters]
        .filter(item => item.checked)
        .map(item => item.value);

    // 2. Lấy danh sách các Màu sắc đang được check
    const selectedColors = [...colorFilters]
        .filter(item => item.checked)
        .map(item => item.value.toLowerCase());

    // 3. Lấy danh sách các Danh mục đang được check
    const selectedCategories = [...categoryFilters]
        .filter(item => item.checked)
        .map(item => item.value.toLowerCase());

    // 4. Lấy mức giá tối đa từ thanh trượt
    const maxPrice = priceFilter ? Number(priceFilter.value) : Infinity;

    // 5. Lấy từ khóa tìm kiếm
    const keyword = productSearch ? productSearch.value.trim().toLowerCase() : "";

    // Lọc mảng sản phẩm gốc dựa trên tất cả các tiêu chí đã chọn
    filteredProducts = allProducts.filter(function (product) {
        const productSizes = Array.isArray(product.sizes) ? product.sizes : [];

        // Kiểm tra khớp Size (nếu không chọn size nào thì mặc định coi là khớp)
        const sizeMatch =
            selectedSizes.length === 0 ||
            selectedSizes.some(size => productSizes.includes(size));

        // Kiểm tra khớp Màu sắc
        const productColor = getProductColor(product);
        const colorMatch =
            selectedColors.length === 0 ||
            selectedColors.some(color => productColor.includes(color));

        // Kiểm tra khớp Danh mục
        const productCategory = getProductCategory(product);
        const categoryMatch =
            selectedCategories.length === 0 ||
            selectedCategories.some(category => productCategory.includes(category));

        // Kiểm tra khớp Khoảng giá
        const priceMatch = Number(product.price) <= maxPrice;

        // Kiểm tra khớp Từ khóa tìm kiếm (tìm kiếm trong tên, danh mục, màu, thương hiệu, clb, mô tả)
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

        // Phải thỏa mãn đồng thời tất cả các điều kiện lọc
        return (
            sizeMatch &&
            colorMatch &&
            categoryMatch &&
            priceMatch &&
            searchMatch
        );
    });

    // Sắp xếp danh sách đã lọc theo tiêu chí đang chọn
    applySorting();

    // Reset về trang đầu tiên
    currentPage = 1;

    // Cập nhật giao diện thanh giá, các tag bộ lọc và render danh sách sản phẩm
    updatePriceValue();
    renderActiveFilters();
    renderProducts();
}

// Sắp xếp danh sách sản phẩm filteredProducts theo tùy chọn người dùng:
// - 'price-low': Giá từ thấp đến cao
// - 'price-high': Giá từ cao xuống thấp
// - 'name-az': Tên từ A đến Z (chuẩn tiếng Việt)
// - 'name-za': Tên từ Z đến A (chuẩn tiếng Việt)
function applySorting() {
    if (!sortProducts) {
        return;
    }

    const sortType = sortProducts.value;

    if (sortType === "price-low") {
        filteredProducts.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sortType === "price-high") {
        filteredProducts.sort((a, b) => Number(b.price) - Number(a.price));
    }

    if (sortType === "name-az") {
        filteredProducts.sort((a, b) =>
            String(a.name).localeCompare(String(b.name), "vi")
        );
    }

    if (sortType === "name-za") {
        filteredProducts.sort((a, b) =>
            String(b.name).localeCompare(String(a.name), "vi")
        );
    }
}

// Cập nhật nhãn hiển thị giá trị hiện tại của thanh trượt khoảng giá (Ví dụ: "1.000.000đ")
function updatePriceValue() {
    if (!priceFilter || !priceValue) {
        return;
    }

    priceValue.textContent = formatPrice(priceFilter.value);
}

// Hiển thị danh sách các tag bộ lọc đang được kích hoạt (Size, Danh mục, Màu sắc)
// Cho phép người dùng bấm vào dấu 'X' để gỡ bỏ nhanh từng tiêu chí lọc.
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
        const tag = document.createElement("span");
        tag.className = "filter-tag";

        tag.innerHTML = `
            ${input.value}
            <button
                type="button"
                aria-label="Xóa bộ lọc">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;

        // Khi bấm nút X trên tag, bỏ chọn checkbox tương ứng và lọc lại
        const removeButton = tag.querySelector("button");
        if (removeButton) {
            removeButton.addEventListener("click", function () {
                input.checked = false;
                applyFilters();
            });
        }

        activeFilters.appendChild(tag);
    });
}

// Xóa bỏ toàn bộ các điều kiện lọc và tìm kiếm, đưa giao diện về trạng thái ban đầu
function resetFilters() {
    categoryFilters.forEach(input => input.checked = false);
    sizeFilters.forEach(input => input.checked = false);
    colorFilters.forEach(input => input.checked = false);

    if (priceFilter) {
        priceFilter.value = priceFilter.max;
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

// ==========================================================================
// PHÂN TRANG (PAGINATION)
// ==========================================================================

// Tính toán và tạo các nút phân trang tương ứng với số lượng sản phẩm sau khi lọc
function renderPagination() {
    if (!pagination) {
        return;
    }

    pagination.innerHTML = "";

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    // Nếu chỉ có 1 trang hoặc không có trang nào thì không cần hiển thị thanh phân trang
    if (totalPages <= 1) {
        return;
    }

    for (let page = 1; page <= totalPages; page++) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "page-btn";
        button.textContent = page;

        if (page === currentPage) {
            button.classList.add("active");
        }

        // Khi người dùng bấm chuyển trang
        button.addEventListener("click", function () {
            currentPage = page;
            renderProducts();

            // Cuộn mượt lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });

        pagination.appendChild(button);
    }
}

// ==========================================================================
// XEM NHANH SẢN PHẨM - QUICK VIEW MODAL
// ==========================================================================

// Mở cửa sổ Xem Nhanh cho một sản phẩm và điền đầy đủ dữ liệu (ảnh, tên, giá, size, màu, mô tả)
// Tham số product: Đối tượng sản phẩm được chọn để xem nhanh
function openQuickView(product) {
    if (!quickViewModal) {
        window.location.href = `./products-detail.html?id=${encodeURIComponent(product.id)}`;
        return;
    }

    currentQuickProduct = product;

    // Đặt lại các tùy chọn lựa chọn ban đầu
    selectedQuickSize = "";
    selectedQuickColor = "";
    quickQuantity = 1;

    if (quantityValue) {
        quantityValue.textContent = quickQuantity;
    }

    if (quickViewImage) {
        quickViewImage.src = convertImagePath(product.image);
        quickViewImage.alt = product.name || "Sản phẩm bóng đá";
    }

    if (quickViewTitle) {
        quickViewTitle.textContent = product.name || "Sản phẩm";
    }

    if (quickViewCategory) {
        quickViewCategory.textContent = product.category || "Áo đấu bóng đá";
    }

    if (quickViewPrice) {
        quickViewPrice.textContent = formatPrice(product.price);
    }

    if (quickViewDescription) {
        quickViewDescription.textContent = product.description || "Sản phẩm thời trang bóng đá chất lượng cao.";
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

    // Hiển thị modal và khóa cuộn trang body
    quickViewModal.hidden = false;
    quickViewModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
}

// Tạo danh sách các nút chọn kích cỡ (Size) trong modal Xem Nhanh
function renderQuickSizes(product) {
    if (!quickViewSizes) {
        return;
    }

    quickViewSizes.innerHTML = "";

    const sizes = Array.isArray(product.sizes)
        ? product.sizes
        : ["S", "M", "L", "XL"];

    sizes.forEach(function (size) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "option-btn";
        button.textContent = size;

        button.addEventListener("click", function () {
            selectedQuickSize = size;

            // Xóa active của nút khác và thêm active cho nút vừa bấm
            quickViewSizes.querySelectorAll(".option-btn").forEach(btn =>
                btn.classList.remove("active")
            );
            button.classList.add("active");
        });

        quickViewSizes.appendChild(button);
    });
}

// Tạo danh sách các nút chọn màu sắc trong modal Xem Nhanh
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
        const button = document.createElement("button");
        button.type = "button";
        button.className = "option-btn";
        button.textContent = color;

        button.addEventListener("click", function () {
            selectedQuickColor = color;

            // Xóa active của nút khác và thêm active cho nút vừa bấm
            quickViewColors.querySelectorAll(".option-btn").forEach(btn =>
                btn.classList.remove("active")
            );
            button.classList.add("active");
        });

        quickViewColors.appendChild(button);
    });
}

// Đóng cửa sổ modal Xem Nhanh và khôi phục trạng thái cuộn của trang web
function closeQuickViewModal() {
    if (!quickViewModal) {
        return;
    }

    // Hủy focus nếu phần tử đang focus nằm trong modal để tránh lỗi trợ năng (a11y aria-hidden)
    if (quickViewModal.contains(document.activeElement)) {
        document.activeElement.blur();
    }

    quickViewModal.hidden = true;
    quickViewModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
}

// ==========================================================================
// QUẢN LÝ GIỎ HÀNG (SHOPPING CART LOGIC)
// ==========================================================================

// Lấy dữ liệu giỏ hàng hiện tại từ localStorage
function getCart() {
    try {
        return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
        return [];
    }
}

// Lưu dữ liệu giỏ hàng mới vào localStorage
function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Thêm sản phẩm cùng các thuộc tính được chọn (Size, Màu sắc, Số lượng) vào giỏ hàng
function addToCart(product) {
    const cart = getCart();

    // Lấy size và màu sắc đã chọn hoặc giá trị mặc định
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

    // Khóa định danh duy nhất cho từng biến thể sản phẩm (id + size + color)
    const cartId = `${product.id}-${size}-${color}`;

    // Kiểm tra xem sản phẩm cùng biến thể đã có trong giỏ chưa
    const existing = cart.find(
        item => String(item.cartId) === String(cartId)
    );

    if (existing) {
        existing.quantity += quickQuantity;
    } else {
        cart.push({
            cartId,
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: convertImagePath(product.image),
            size,
            color,
            quantity: quickQuantity
        });
    }

    saveCart(cart);

    // Cập nhật số lượng hiển thị trên icon giỏ hàng ở header (nếu hàm updateBadges tồn tại)
    if (typeof updateBadges === "function") {
        updateBadges();
    }

    // Hiển thị thông báo Toast thông báo đã thêm thành công
    showToast(`Đã thêm "${product.name}" vào giỏ hàng`);
}

// ==========================================================================
// QUẢN LÝ DANH SÁCH YÊU THÍCH (WISHLIST LOGIC)
// ==========================================================================

// Lấy danh sách sản phẩm yêu thích từ localStorage
function getWishlist() {
    try {
        return JSON.parse(localStorage.getItem("wishlist")) || [];
    } catch {
        return [];
    }
}

// Lưu danh sách sản phẩm yêu thích vào localStorage
function saveWishlist(wishlist) {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

// Bật/tắt trạng thái yêu thích của sản phẩm:
// - Nếu đã có trong danh sách -> Xóa khỏi wishlist và đổi icon về hình trái tim rỗng
// - Nếu chưa có -> Thêm vào wishlist và đổi icon về hình trái tim đặc
function toggleWishlist(product, button) {
    let wishlist = getWishlist();

    const exists = wishlist.some(
        item => String(item.id) === String(product.id)
    );

    if (exists) {
        wishlist = wishlist.filter(
            item => String(item.id) !== String(product.id)
        );

        button.classList.remove("active");
        button.innerHTML = '<i class="fa-regular fa-heart"></i>';
        showToast("Đã xóa khỏi yêu thích");
    } else {
        wishlist.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image
        });

        button.classList.add("active");
        button.innerHTML = '<i class="fa-solid fa-heart"></i>';
        showToast("Đã thêm vào yêu thích");
    }

    saveWishlist(wishlist);

    // Cập nhật số lượng trên icon wishlist ở header (nếu hàm updateBadges tồn tại)
    if (typeof updateBadges === "function") {
        updateBadges();
    }
}

// Cập nhật giao diện nút icon trái tim dựa trên trạng thái sản phẩm có trong wishlist hay không
function updateWishlistIcon(button, productId) {
    const wishlist = getWishlist();

    const exists = wishlist.some(
        item => String(item.id) === String(productId)
    );

    if (exists) {
        button.classList.add("active");
        button.innerHTML = '<i class="fa-solid fa-heart"></i>';
    }
}

// ==========================================================================
// THÔNG BÁO TOAST (TOAST NOTIFICATION)
// ==========================================================================
let toastTimer;

// Hiển thị thông báo Toast ngắn nổi ở góc màn hình và tự ẩn sau 2.5 giây
function showToast(message) {
    if (!toast || !toastMessage) {
        return;
    }

    toastMessage.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 2500);
}

// ==========================================================================
// GẮN SỰ KIỆN TƯƠNG TÁC NGƯỜI DÙNG (EVENT LISTENERS)
// ==========================================================================

// Sự kiện giảm số lượng trong Quick View
if (quantityMinus) {
    quantityMinus.addEventListener("click", function () {
        if (quickQuantity > 1) {
            quickQuantity--;
        }
        if (quantityValue) {
            quantityValue.textContent = quickQuantity;
        }
    });
}

// Sự kiện tăng số lượng trong Quick View (tối đa 10)
if (quantityPlus) {
    quantityPlus.addEventListener("click", function () {
        if (quickQuantity < 10) {
            quickQuantity++;
        }
        if (quantityValue) {
            quantityValue.textContent = quickQuantity;
        }
    });
}

// Sự kiện nút "Thêm vào giỏ hàng" trong modal Quick View
if (btnAddCart) {
    btnAddCart.addEventListener("click", function () {
        if (!currentQuickProduct) {
            return;
        }
        addToCart(currentQuickProduct);
    });
}

// Sự kiện nút "Mua ngay" trong modal Quick View: Thêm giỏ hàng và chuyển hướng đến trang Cart
if (btnBuyNow) {
    btnBuyNow.addEventListener("click", function () {
        if (!currentQuickProduct) {
            return;
        }
        addToCart(currentQuickProduct);
        window.location.href = "../../cart-checkout/cart.html";
    });
}

// Sự kiện tìm kiếm sản phẩm realtime khi gõ phím
if (productSearch) {
    productSearch.addEventListener("input", applyFilters);
}

// Sự kiện bấm nút tìm kiếm
if (searchButton) {
    searchButton.addEventListener("click", applyFilters);
}

// Sự kiện thay đổi các checkbox bộ lọc Danh mục
categoryFilters.forEach(function (input) {
    input.addEventListener("change", applyFilters);
});

// Sự kiện thay đổi các checkbox bộ lọc Kích cỡ (Size)
sizeFilters.forEach(function (input) {
    input.addEventListener("change", applyFilters);
});

// Sự kiện thay đổi các checkbox bộ lọc Màu sắc
colorFilters.forEach(function (input) {
    input.addEventListener("change", applyFilters);
});

// Sự kiện kéo thanh trượt khoảng giá
if (priceFilter) {
    priceFilter.addEventListener("input", function () {
        updatePriceValue();
        applyFilters();
    });
}

// Sự kiện chọn tùy chọn sắp xếp trong dropdown
if (sortProducts) {
    sortProducts.addEventListener("change", applyFilters);
}

// Sự kiện bấm nút xóa tất cả bộ lọc
if (clearFilters) {
    clearFilters.addEventListener("click", resetFilters);
}

// Sự kiện bấm nút đặt lại tìm kiếm
if (resetSearch) {
    resetSearch.addEventListener("click", resetFilters);
}

// Sự kiện đóng modal Xem Nhanh khi bấm nút đóng (X)
if (closeQuickView) {
    closeQuickView.addEventListener("click", closeQuickViewModal);
}

// Sự kiện đóng modal Xem Nhanh khi bấm vào vùng nền mờ bên ngoài
if (quickViewModal) {
    quickViewModal.addEventListener("click", function (event) {
        if (event.target.hasAttribute("data-close-modal")) {
            closeQuickViewModal();
        }
    });
}

// Sự kiện đóng modal Xem Nhanh khi nhấn phím Escape trên bàn phím
document.addEventListener("keydown", function (event) {
    if (
        event.key === "Escape" &&
        quickViewModal &&
        !quickViewModal.hidden
    ) {
        closeQuickViewModal();
    }
});

// ==========================================================================
// KHỞI CHẠY TẢI DỮ LIỆU BAN ĐẦU
// ==========================================================================
loadProducts();