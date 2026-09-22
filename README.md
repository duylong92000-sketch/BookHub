# BOOKHUB - Ứng dụng quản lý cửa hàng sách

BOOKHUB là dự án website mô phỏng **quản lý cửa hàng sách**, được xây dựng bằng HTML, CSS và JavaScript.

Dự án tập trung vào giao diện và các chức năng phía frontend. Dữ liệu được lưu trữ bằng `localStorage` để mô phỏng hoạt động của hệ thống mà **không sử dụng backend hoặc database**.

## Công nghệ sử dụng

- HTML5
- CSS3
- JavaScript
- localStorage
- Git / GitHub

## Cấu trúc dự án

```text
BOOKHUB/
│
├── index.html
│
├── customer/
│   ├── login.html
│   ├── register.html
│   ├── profile.html
│   ├── products.html
│   ├── product-detail.html
│   ├── cart.html
│   ├── checkout.html
│   └── orders.html
│   └── successorder.html
│
├── admin/
│   ├── login.html
│   ├── dashboard.html
│   ├── customers.html
│   ├── categories.html
│   ├── products.html
│   ├── import.html
│   ├── prices.html
│   ├── orders.html
│   └── inventory.html
│
├── css/
│   ├── style.css
│   ├── customer.css
│   └── admin.css
│
├── js/
│   ├── admin.js
│   ├── categories.js
│   └── cart.js
│   └── checkout.js
│   └── order.js
│   └── products.js
│   └── register.js
│
├── images/
│
└── README.md
```

## Chức năng chính

### Khách hàng

- Đăng ký tài khoản
- Đăng nhập / đăng xuất
- Xem và cập nhật thông tin cá nhân
- Xem danh sách sách
- Xem chi tiết sách
- Tìm kiếm sách
- Lọc sách theo danh mục
- Thêm sách vào giỏ hàng
- Tăng / giảm số lượng sản phẩm
- Xóa sản phẩm khỏi giỏ hàng
- Tính tổng tiền
- Thanh toán và tạo đơn hàng
- Xem lịch sử đơn hàng

### Quản trị viên

- Đăng nhập trang quản trị
- Xem dashboard
- Quản lý khách hàng
- Quản lý danh mục sách
- Quản lý sách
- Quản lý nhập sách
- Quản lý giá
- Quản lý đơn hàng
- Quản lý tồn kho

## Lưu trữ dữ liệu

Dự án không sử dụng MySQL, MongoDB hoặc database/server backend.

Dữ liệu demo được xử lý bằng JavaScript và lưu trong trình duyệt thông qua:

```javascript
localStorage
```

## Lưu ý

Đây là dự án frontend mô phỏng hệ thống quản lý cửa hàng sách.

- Không có server backend.
- Không có database thật.
- Không nên sử dụng dữ liệu cá nhân hoặc mật khẩu thật.
- Dữ liệu đăng nhập, giỏ hàng và đơn hàng chỉ phục vụ mục đích demo.
- Khi xóa dữ liệu trình duyệt, dữ liệu `localStorage` của website có thể bị mất.

## Mục tiêu dự án

Dự án nhằm xây dựng một website mô phỏng quy trình hoạt động của cửa hàng sách, bao gồm hai nhóm người dùng:

- **Khách hàng:** tìm kiếm, xem sách, thêm vào giỏ hàng và đặt hàng.
- **Quản trị viên:** quản lý khách hàng, sách, danh mục, giá, nhập hàng, đơn hàng và tồn kho.

**BOOKHUB — Bookstore Management System**
