// ========================================
// FOOTBALL FASHION - PRODUCT DETAIL JS
// ========================================

document.addEventListener("DOMContentLoaded", function () {
    // 1. Lấy Product ID từ URL (Ví dụ: product-detail.html?id=1)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = Number(urlParams.get("id")) || 1; // Mặc định là ID 1 nếu không có trên URL

    // Các phần tử HTML trên trang
    const productImage = document.getElementById("productImage");
    const productName = document.getElementById("productName");
    const productPrice = document.getElementById("productPrice");
    const productDescription = document.getElementById("productDescription");
    const productCategory = document.getElementById("productCategory");
    const breadcrumbTitle = document.getElementById("breadcrumbTitle");

    // Các biến lưu trạng thái lựa chọn của người dùng
    let selectedSize = null;
    let selectedColor = null;
    let quantity = 1;
    let currentProductData = null;

    // 2. Load dữ liệu từ products.json
    async function loadProductDetail() {
        try {
            const response = await fetch("../data/products.json");
            if (!response.ok) {
                throw new Error("Không thể tải tệp products.json");
            }
            const products = await response.json();
            
            // Tìm sản phẩm khớp với ID trên URL
            currentProductData = products.find(function (item) {
                Number(item.id) === productId
            }) || products[0]; // Fallback lấy sản phẩm đầu tiên nếu không tìm thấy

            renderProductDetail(currentProductData);
        } catch (error) {
            console.error("Lỗi tải chi tiết sản phẩm:", error);
        }
    }

    // 3. Hiển thị thông tin sản phẩm ra giao diện
    function renderProductDetail(product) {
        if (!product) return;

        // Đổ dữ liệu cơ bản
        productName.textContent = product.name || "Sản phẩm thời trang";
        breadcrumbTitle.textContent = product.name || "Chi tiết sản phẩm";
        productCategory.textContent = product.category || "Áo đấu bóng đá";
        productPrice.textContent = new Intl.NumberFormat("vi-VN").format(product.price) + "đ";
        productDescription.textContent = product.description || "Chưa có mô tả chi tiết cho sản phẩm này.";
        
        if (product.image) {
            productImage.src = product.image;
            productImage.alt = product.name;
        }

        // Render danh sách Size động theo dữ liệu sản phẩm (nếu có)
        const sizeContainer = document.getElementById("sizeOptionsContainer");
        if (sizeContainer && Array.isArray(product.sizes)) {
            sizeContainer.innerHTML = "";
            product.sizes.forEach(function (size, index) {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "size-btn" + (index === 0 ? " active" : "");
                btn.textContent = size;
                btn.dataset.size = size;
                if (index === 0) selectedSize = size; // Mặc định chọn size đầu tiên
                
                sizeContainer.appendChild(btn);
            });
        }
    }

    // 4. Xử lý sự kiện chọn Size (Event Delegation)
    document.addEventListener("click", function (event) {
        if (event.target.matches(".size-btn")) {
            document.querySelectorAll(".size-btn").forEach(function (b) {
                b.classList.remove("active");
            });
            event.target.classList.add("active");
            selectedSize = event.target.dataset.size;
        }

        // Xử lý sự kiện chọn Màu (nếu giao diện có màu)
        if (event.target.matches(".color-btn")) {
            document.querySelectorAll(".color-btn").forEach(function (b) {
                b.classList.remove("active");
            });
            event.target.classList.add("active");
            selectedColor = event.target.dataset.color;
        }
    });

    // 5. Xử lý tăng giảm số lượng
    const decreaseBtn = document.getElementById("decreaseBtn");
    const increaseBtn = document.getElementById("increaseBtn");
    const quantitySpan = document.getElementById("quantity");

    if (decreaseBtn && increaseBtn && quantitySpan) {
        decreaseBtn.addEventListener("click", function () {
            if (quantity > 1) {
                quantity--;
                quantitySpan.textContent = quantity;
            }
        });

        increaseBtn.addEventListener("click", function () {
            quantity++;
            quantitySpan.textContent = quantity;
        });
    }

    // 6. Xử lý Thêm vào giỏ hàng (Add to Cart)
    const addToCartBtn = document.getElementById("addToCartBtn");
    if (addToCartBtn) {
        addToCartBtn.addEventListener("click", function () {
            if (!currentProductData) return;

            // Thu thập đủ 4 thông tin bắt buộc: product, size, color, quantity
            const cartItem = {
                id: currentProductData.id,
                name: currentProductData.name,
                price: currentProductData.price,
                image: currentProductData.image,
                size: selectedSize || "M",
                color: selectedColor || "Mặc định",
                quantity: quantity
            };

            // Lưu vào localStorage (hoặc gọi hàm giỏ hàng của nhóm nếu có)
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            
            // Kiểm tra xem sản phẩm cùng ID, size, màu đã có trong giỏ chưa
            const existingIndex = cart.findIndex(function (item) {
                return item.id === cartItem.id && item.size === cartItem.size && item.color === cartItem.color;
            });

            if (existingIndex > -1) {
                cart[existingIndex].quantity += cartItem.quantity;
            } else {
                cart.push(cartItem);
            }

            localStorage.setItem("cart", JSON.stringify(cart));
            alert("Đã thêm sản phẩm vào giỏ hàng thành công!");
        });
    }

    // Khởi chạy load dữ liệu trang chi tiết
    loadProductDetail();
});