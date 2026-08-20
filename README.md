# FOOTBALL FASHION — ĐỀ 05: CỬA HÀNG THỜI TRANG (E-COMMERCE)

## 1. Thông tin đề tài

- **Tên đề tài:** Cửa hàng thời trang (E-commerce)
- **Tên website:** Football Fashion
- **Giao diện tham khảo:** StyleHub - Online Shopping eCommerce Store UI Kit
- **Phạm vi:** 7 nhóm trang chính: Trang chủ, Danh sách sản phẩm, Chi tiết sản phẩm, Giỏ hàng, Thanh toán, Yêu thích, Đăng nhập/Đăng ký.
- **Công nghệ:** HTML5, CSS3, JavaScript, Tailwind CSS/build CSS, LocalStorage và dữ liệu sản phẩm nội bộ.
- **Responsive:** Mobile, Tablet, Desktop.

## 2. Các chức năng đã hoàn thiện

Trang chủ và Hero banner.
 Menu hamburger trên giao diện mobile.
 Hamburger có đầy đủ: Trang chủ, Sản phẩm, Yêu thích, Giỏ hàng, Đăng nhập.
Danh sách sản phẩm.
 Chi tiết sản phẩm và mở sản phẩm theo `id` trên URL.
 Chọn sản phẩm và chuyển sang giỏ hàng.
 Giỏ hàng: tăng/giảm số lượng, xóa sản phẩm và tính tổng tiền.
 Lưu dữ liệu giỏ hàng bằng LocalStorage.
 Trang thanh toán và hiển thị lại thông tin đơn hàng.
 Trang đăng nhập.
 Trang đăng ký.
 Trang yêu thích.
 Điều hướng giữa các trang.

## 3. Kiểm tra responsive

### Mobile — 390 × 844

Đã kiểm tra các nội dung chính:

 Trang chủ hiển thị đúng.
Hamburger mở/đóng đúng.
 Đăng nhập xuất hiện trong hamburger.
Trang sản phẩm hiển thị đúng.
 Trang chi tiết sản phẩm hiển thị đúng.
 Giỏ hàng hiển thị đúng.
 Thanh toán hiển thị đúng.
 Đăng nhập/Đăng ký hiển thị đúng.

### Tablet — 768 × 1024

- [ ] Kiểm tra lần cuối trước khi nộp.

### Desktop — 1440 × 900

- [ ] Kiểm tra lần cuối trước khi nộp.

## 4. Luồng mua hàng cần kiểm tra trước khi nộp

```text
Trang chủ
   ↓
Danh sách sản phẩm
   ↓
Chi tiết sản phẩm
   ↓
Chọn sản phẩm / số lượng
   ↓
Thêm vào giỏ hàng
   ↓
Giỏ hàng
   ↓
Thanh toán
```

Checklist:

 Sản phẩm mở đúng theo `id`.
 Thêm sản phẩm vào giỏ.
 Thay đổi số lượng.
 Xóa sản phẩm.
Tổng tiền cập nhật.
 Dữ liệu giỏ hàng được giữ khi tải lại trang.
 Chuyển từ giỏ hàng sang thanh toán.
 Thông tin đơn hàng hiển thị trên trang thanh toán.

## 5. Kiểm tra Console

Một số trình duyệt có thể hiển thị cảnh báo liên quan đến Tracking Prevention hoặc WebSocket của Live Server. Đây không phải lỗi chức năng của website nếu trang vẫn tải và các chức năng JavaScript hoạt động bình thường.

Nếu xuất hiện lỗi `favicon.ico 404`, cần khai báo favicon trong `<head>` của các trang hoặc bảo đảm đường dẫn favicon đúng.

## 6. Lighthouse

Kết quả kiểm tra hiện tại trên trang chủ ở mobile:

| Hạng mục | Điểm | Trạng thái |
|---|---:|---|
| Performance | **78** | Chưa đạt mục tiêu 85 |
| Accessibility | **95** | Tốt |
| Best Practices | **100** |  Tốt |
| SEO | **100** | Tốt |

### Các cảnh báo Performance đã ghi nhận

- Improve image delivery — ảnh có dung lượng lớn.
- Render-blocking requests.
- Font display.
- Network dependency tree.
- Reduce unused CSS.
- Minify CSS.
- Avoid enormous network payloads.

**Lưu ý:** Performance hiện là **78**, trong khi mục tiêu của đề là **từ 85 trở lên**. Nếu giảng viên kiểm tra cứng mốc 85, cần tiếp tục tối ưu ảnh/hero trước khi nộp. Nếu ưu tiên giữ bản ổn định hiện tại, có thể giữ nguyên và ghi nhận đây là điểm cần cải thiện.



## 7. Checklist trước khi nộp

 Test 390 × 844.
 Test 768 × 1024.
 Test 1440 × 900.
 Test hamburger ở Trang chủ.
 Test hamburger ở Trang sản phẩm.
 Test hamburger ở Chi tiết sản phẩm.
 Kiểm tra Đăng nhập trong hamburger.
 Test luồng Sản phẩm → Chi tiết → Giỏ hàng → Thanh toán.
 F5 trang Giỏ hàng và kiểm tra LocalStorage.
 F5 trang Thanh toán và kiểm tra dữ liệu.
 Kiểm tra không có lỗi JavaScript nghiêm trọng trong Console.
Chạy Lighthouse lần cuối.
 Nếu yêu cầu Performance ≥ 85 là bắt buộc: tối ưu ảnh và chạy Lighthouse lại.
 Giải nén ZIP sang thư mục mới và chạy thử một lần cuối trước khi nộp.

## 8. Ghi chú

Bản hiện tại ưu tiên **ổn định giao diện và chức năng**. Không nên thay đổi các file JavaScript đang hoạt động tốt nếu không có lỗi cụ thể cần sửa.
