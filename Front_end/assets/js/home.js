function quickAddHomeProduct(id, name, price, image) {
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            let index = cart.findIndex(item => item.id === id);
            
            if (index !== -1) {
                cart[index].quantity += 1;
            } else {
                cart.push({ id, name, price, image, quantity: 1, size: 'M' });
            }
            
            localStorage.setItem("cart", JSON.stringify(cart));
            if (typeof updateBadges === "function") updateBadges();
            alert(`Đã thêm "${name}" vào giỏ hàng!`);
        }

        function quickAddWishlist(id, name, price, image) {
            let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
            if (!wishlist.some(item => item.id === id)) {
                wishlist.push({ id, name, price, image });
                localStorage.setItem("wishlist", JSON.stringify(wishlist));
                if (typeof updateBadges === "function") updateBadges();
                alert(`Đã thêm "${name}" vào danh sách yêu thích!`);
            } else {
                alert(`Sản phẩm này đã có trong danh sách yêu thích!`);
            }
        }


document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('[data-navigate]').forEach(function(el){
    el.addEventListener('click', function(event){
      if (event.target.closest('button')) return;
      window.location.href = el.dataset.navigate;
    });
  });
  document.querySelectorAll('[data-quick-add]').forEach(function(button){
    button.addEventListener('click', function(event){
      event.stopPropagation();
      quickAddHomeProduct(Number(button.dataset.id), button.dataset.name, Number(button.dataset.price), button.dataset.image);
    });
  });
});
