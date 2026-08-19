document.addEventListener("DOMContentLoaded", () => {
    // 1. Khởi tạo Badge ngay khi tải trang
    updateBadges();

    // 2. Lắng nghe sự thay đổi của LocalStorage từ các tab khác (nếu có)
    window.addEventListener('storage', () => {
        updateBadges();
    });

    // 3. Logic nạp Header/Footer (Nếu project dùng placeholder)
    // loadComponent("app-header", "/Front_end/components/header.html");
    // loadComponent("app-footer", "/Front_end/components/footer.html");
});


 // Hàm cập nhật số lượng trên icon Giỏ hàng và Yêu thích ở Header
 

function updateBadges() {
    // Lấy dữ liệu từ LocalStorage 
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    // Tìm các thẻ HTML hiển thị số lượng (Badge)
   
    const cartBadge = document.getElementById("cart-badge");
    const wishlistBadge = document.getElementById("wishlist-badge");

    // Cập nhật số lượng cho Giỏ hàng
    if (cartBadge) {
        cartBadge.textContent = cart.length;
        // Ẩn badge nếu giỏ hàng trống 
        cartBadge.style.display = cart.length > 0 ? "flex" : "none";
    }

    // Cập nhật số lượng cho Danh sách yêu thích
    if (wishlistBadge) {
        wishlistBadge.textContent = wishlist.length;
        wishlistBadge.style.display = wishlist.length > 0 ? "flex" : "none";
    }
}


  //Hàm hỗ trợ nạp các thành phần HTML dùng chung
 
async function loadComponent(elementId, filePath) {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        const response = await fetch(filePath);
        if (response.ok) {
            const html = await response.text();
            element.innerHTML = html;

            updateBadges(); 
        }
    } catch (error) {
        console.error("Lỗi khi nạp component:", error);
    }
}