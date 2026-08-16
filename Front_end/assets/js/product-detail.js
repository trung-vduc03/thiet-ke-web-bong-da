document.addEventListener("DOMContentLoaded", async () => {
    // 1. Lấy ID sản phẩm từ thanh địa chỉ URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    const breadcrumbTitle = document.getElementById("breadcrumbTitle");
    const productName = document.getElementById("productName");
    const productCategory = document.getElementById("productCategory");
    const productPrice = document.getElementById("productPrice");
    const productOriginalPrice = document.getElementById("productOriginalPrice");
    const productDescription = document.getElementById("productDescription");
    const productImage = document.getElementById("productImage");
    const productThumbnails = document.getElementById("productThumbnails");
    
    // Nếu không có ID trên URL
    if (!productId) {
        if (productName) productName.textContent = "Không tìm thấy sản phẩm!";
        if (breadcrumbTitle) breadcrumbTitle.textContent = "Lỗi";
        return;
    }

    // 2. Hàm tải dữ liệu thông minh (tự động dò tìm file JSON)
    let currentProduct = null;
    let allProducts = [];
    const paths = ["../../data/products.json", "../data/products.json", "./data/products.json"];
    
    for (let path of paths) {
        try {
            let response = await fetch(path);
            if (response.ok) {
                allProducts = await response.json();
                // So sánh bằng chuỗi để tránh lỗi kiểu dữ liệu
                currentProduct = allProducts.find(p => String(p.id) === String(productId));
                break;
            }
        } catch (e) {
            console.log("Đang thử tìm file JSON ở đường dẫn khác...");
        }
    }

    // Nếu không tìm thấy sản phẩm trong data
    if (!currentProduct) {
        if (productName) productName.textContent = "Sản phẩm không tồn tại hoặc đã bị xóa!";
        if (breadcrumbTitle) breadcrumbTitle.textContent = "Không tìm thấy";
        return;
    }

    // =