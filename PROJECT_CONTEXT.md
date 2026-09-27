# PrintHub 3D — ngữ cảnh FE và BE

> Cập nhật: 2026-09-27. Tài liệu mô tả mã nguồn đang có, không phải cam kết mọi chức năng đã chạy end-to-end.
> FE HEAD: `88e5076`; BE HEAD: `85692a3`; cả hai có thay đổi chưa commit tại thời điểm đọc, đã được tính vào phân tích.
> Phạm vi: chỉ `exe202-printhub3d-fe` và `PrintHub_3D`. Không sử dụng project `printhub-fe`.

## 1. Đọc nhanh trước mỗi tác vụ

- PrintHub 3D là ứng dụng mua/đặt in 3D, FE tập trung thước kỹ thuật cho sinh viên, cá nhân hóa tên/MSSV, thiết kế và xuất STL; có khu vực người mua và quản trị.
- FE là React + TypeScript + Vite. Source thật nằm trong `exe-fe/src`, không phải ngay tại root repository.
- BE là Java 21 + Spring Boot 3.4.1, Spring Security/JWT, JPA, SQL Server hoặc PostgreSQL, Redis; tích hợp Resend, Cloudinary, PayOS.
- **FE phần lớn vẫn là giao diện demo/local state.** Có service API không có nghĩa màn hình đang gọi service đó. Catalog, checkout, danh sách đơn và nhiều trang admin chưa nối BE.
- **Role:** FE `BUYER | ADMIN`; BE enum chỉ `USER | ADMIN`. Một số annotation BE vẫn đòi `MAKER`, nhưng enum không có role này.
- **Luồng đơn thật ở BE:** tạo đơn từ product UUID → tách theo seller → trừ tồn kho → `PENDING` → tạo payment → webhook thành công chuyển `PAID`. Chưa thấy API hoàn thiện toàn bộ tiến trình sản xuất/giao hàng.
- **Thanh toán chưa hoàn chỉnh:** trang kết quả luôn hiển thị thành công; BE verify trả `PAID` cố định; chữ ký webhook chưa được xác minh thật; custom payment và mã giao dịch có lệch hợp đồng.
- Giỏ hàng/địa chỉ FE lưu localStorage; không đồng bộ giỏ với BE. Giá/giảm giá FE không phải giá được BE xác nhận.
- Tài liệu là bản đồ để đọc ít file hơn. Khi sửa, đọc phần liên quan dưới đây và đúng source được chỉ ra; nếu source khác tài liệu thì source hiện tại là căn cứ, rồi cập nhật tài liệu.
- Không suy diễn entity/DTO, nút bấm, comment TODO hoặc số liệu demo thành tính năng đã triển khai.

## 2. Phạm vi, đường dẫn và cách sử dụng

| Ký hiệu trong tài liệu | Đường dẫn tuyệt đối |
|---|---|
| FE | `D:/semester 7/EXE/exe202-printhub3d-fe` |
| F | `D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src` |
| BE | `D:/semester 7/EXE/PrintHub_3D` |
| B | `D:/semester 7/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d` |
| R | `D:/semester 7/EXE/PrintHub_3D/src/main/resources` |

Đường dẫn `F/...`, `B/...`, `R/...` bên dưới được ghép với các gốc trên. Tài liệu không chứa khóa API, mật khẩu hay nội dung `.env`.

Prompt tái sử dụng:

```text
Đọc PROJECT_CONTEXT.md ở gốc exe202-printhub3d-fe trước.
Chỉ làm việc với FE exe202-printhub3d-fe và BE PrintHub_3D.
Dựa vào bản đồ file trong tài liệu, chỉ đọc thêm source liên quan tới yêu cầu.
Phân biệt rõ API thật với mock/local state. Cập nhật tài liệu nếu thay đổi luồng hoặc hợp đồng.
Yêu cầu lần này: ...
```

File Markdown không tự bảo đảm mọi công cụ sẽ tự nạp nó; hãy tham chiếu/đính kèm file trong phiên làm việc mới hoặc cấu hình công cụ đọc nó. Không cần đưa toàn bộ tài liệu vào từng prompt khi công cụ có quyền đọc file.

## 3. Kiến trúc và quy ước

### FE

- `main.tsx`: `StrictMode → BrowserRouter → AuthProvider → NotificationProvider → App`.
- `App.tsx`: giữ giỏ hàng, địa chỉ đang chọn, CartDrawer, AddressModal, LockOverlayModal; truyền props vào routes.
- `routes/index.tsx`: định nghĩa route, lazy-load phần lớn pages, chia AuthLayout/UserLayout/AdminLayout; dùng PageTransition/Framer Motion.
- `context/AuthContext.tsx`: user/role, đăng nhập, profile, passcode và khóa tài khoản local.
- `services/api.ts`: Axios, `VITE_API_BASE_URL` mặc định `http://localhost:8080/api`, tự bỏ dấu `/` cuối và bổ sung `/api` nếu thiếu. Tự gắn Bearer token, trừ login/register. Khi 401 xóa token nhưng không tự refresh hoặc đồng bộ toàn bộ AuthContext.
- `types/index.ts`: model giao diện, **không phải DTO BE**. Nhiều trường/enum khác nhau.
- `index.css`, `layouts/`, `components/`: theme tối, xanh neon, Tailwind 4, responsive layout, modal và thành phần chung.
- `features/products/`: catalog và dữ liệu sản phẩm tĩnh. `features/cart/`: local cart. `features/address/`: local address.
- `components/3d/RulerConfigurator.tsx`: phần thiết kế Three.js/React Three Fiber/Drei, xuất STL bằng `three-stdlib`.
- `HomePage.tsx`, các layout cũ có thể tồn tại mà không nằm trong cây route hiện tại; kiểm tra import trước khi sửa.

### BE

- Luồng phổ biến: `controller/api/*API.java` (mapping/validation/OpenAPI) → `controller/*Controller.java` (role/current user/envelope) → `service/impl/*ServiceImpl.java` → `repository` → `entity`.
- Address, Category, Notification, Warranty là các controller CRUD trực tiếp qua repository, không theo đầy đủ lớp service trên.
- `common/response/ApiResponse.java`: `{code, message, result, errors?, errorKey?, timestamp?, path?}`; trường null được bỏ. Một số CRUD trực tiếp trả entity/list raw.
- `common/exception/GlobalExceptionHandler.java` và các `*ErrorCode.java`: tập trung chuyển exception/validation thành lỗi API.
- `common/security/`: JWT filter/service, user details, Redis blacklist; `common/util/SecurityUtils.java` lấy user hiện tại.
- Entity nghiệp vụ chính thường UUID; Category/Address và một số bảng chi tiết dùng Long. Giá BE dùng BigDecimal; FE dùng number.
- Nhiều status entity là String dù có enum trong `entity/Enumeration`; không giả định mọi enum đều được enforce.

## 4. Bản đồ màn hình và mức tích hợp

`Local` = dữ liệu tĩnh hoặc state trình duyệt; `API + fallback` = có gọi BE nhưng có thể che lỗi bằng demo. Không nhãn nào dưới đây thay cho kiểm thử runtime.

| Route | Page/nguồn chính | Hiện trạng |
|---|---|---|
| `/` | LandingPage, LandingNavbar | Marketing/public |
| `/login` | LoginPage, AuthContext | API login/forgot OTP; login có fallback local |
| `/signup` | SignupPage | API register/OTP; network/5xx có fallback local |
| `/catalog-preview` | CatalogPreviewPage | Preview public |
| `/catalog` | CatalogPage → MainContent → products data | Local, tìm kiếm `q`, lọc/sắp xếp phía FE |
| `/cart` | CartPage, useCart | Local; nút đặt hàng chỉ bật trạng thái thành công |
| `/custom` | CustomOrderPage → RulerConfigurator | Thiết kế/STL thật ở browser; upload/list yêu cầu local; payment chưa khớp BE |
| `/ruler-3d` | Ruler3DPage | Trang viewport minh họa riêng; không phải configurator thật |
| `/bulk-order` | BulkOrderPage | Local, thêm tên file/dòng hàng, giảm giá giả lập |
| `/dashboard` | DashboardPage | Nội dung dashboard/demo với thông tin AuthContext |
| `/orders` | OrdersPage | Mảng mockOrders |
| `/order-history` | OrderHistoryPage | mockPastOrders, thao tác mua lại demo |
| `/file-vault` | FileVaultPage | Local; fileVaultService chưa được trang sử dụng |
| `/quotations` | QuotationsPage | API + fallback; BE chưa có nhóm `/quotations` |
| `/payment-result` | PaymentResultPage | Luôn thành công; không kiểm tra query/API |
| `/subscriptions` | SubscriptionsPage | Gói tĩnh, đổi activePlan trong state |
| `/warranty` | WarrantyPage | API + fallback; sai đường dẫn/shape ở một số thao tác |
| `/disputes` | DisputesPage | Tạo dispute/chat local |
| `/profile` | ProfilePage | Profile và đổi mật khẩu qua API; thông tin sinh viên local |
| `/help-center` | HelpCenterPage | FAQ tĩnh |
| `/admin/dashboard` | AdminDashboardPage | Số liệu demo, có mô phỏng khóa tài khoản local |
| `/admin/users` | AdminUsersPage | API + fallback; chưa có controller users tương ứng |
| `/admin/products` | AdminProductsPage | Dữ liệu catalog local, thao tác local |
| `/admin/orders` | AdminGlobalOrdersPage | API + fallback; ép hoàn tiền local |
| `/admin/finance` | AdminFinancePage | Số liệu tĩnh dù BE có API finance |
| `/admin/production` | AdminProductionPage | Danh sách máy/trạng thái demo; không có telemetry thật |
| `/admin/subscriptions` | AdminSubscriptionsPage | Giao diện/gói local |
| `/admin/disputes` | AdminDisputesPage | Quyết định xử lý local |
| `/admin/settings` | AdminSettingsPage | State local, nút lưu hiển thị thành công tạm thời |

Guard: dashboard/orders/order-history/file-vault/quotations/subscriptions/warranty/disputes/profile cho `BUYER, ADMIN`; toàn bộ nhóm admin chỉ `ADMIN`. Catalog/cart/custom/bulk/ruler/payment-result/help không có guard route, một số nút yêu cầu đăng nhập. `/app → /dashboard`, `/admin/factories → /admin/dashboard`, `/factory/* → /dashboard`, route lạ → `/`.

## 5. Các luồng nghiệp vụ

### 5.1 Tài khoản, OTP, profile và phân quyền

1. FE register gửi `fullName, email, username, phone, password, confirmPassword`, tùy chọn `address`. `studentId/university` không được gửi trong đăng ký BE.
2. BE kiểm tra mật khẩu khớp, email/username/phone trùng; nếu có `cccdFrontImageUrl` thì quét QR và kiểm tra CCCD trùng/blacklist. Tạo user `USER`, `isActive=false`, BCrypt password.
3. Lưu OTP 6 số theo email, hạn 5 phút; gửi template qua **Resend HTTP API**, không phải SMTP dù properties SMTP vẫn có.
4. Verify OTP kích hoạt user và xóa OTP; FE đăng nhập tự động, chuyển dashboard.
5. BE login trả accessToken, refreshToken, userId, fullName, username, email, role. Access token cấu hình 15 phút; refresh 7 ngày và lưu Redis. Chưa có endpoint refresh trong AuthAPI hiện tại.
6. FE lưu riêng access token ở key `token`, dựng user trong memory. Reload gọi `/auth/profile` (fallback `/auth/me`). Profile BE chỉ có fullName/email/phone/address, **thiếu id/role**, nên FE khôi phục thành BUYER và id dự phòng; admin có thể mất role trên UI khi reload.
7. Forgot password: gửi OTP theo email → `email, otpCode, newPassword, confirmPassword`. Đổi mật khẩu: thêm `oldPassword`; BE kiểm tra OTP và mật khẩu cũ. Xem AuthController cho việc chọn email/current principal.
8. Logout FE chỉ xóa token/user local; không gọi BE `/auth/logout` vốn blacklist access token bằng Redis.
9. Profile update FE vẫn cập nhật state dù gọi API lỗi. Passcode mặc định `123456`, thay passcode/lock/unlock chỉ ở AuthContext; không phải bảo mật BE.

**Fallback cần nhớ:** AuthContext bắt mọi lỗi login rồi tạo user local, username/email chứa `admin` được role ADMIN trên UI. Signup khi network/5xx cũng đi vào local login. Những trường hợp này không cấp JWT hợp lệ và không chứng minh đã có tài khoản/quyền BE.

BE dùng stateless security, method security và authority `ROLE_` + enum. Public matcher có toàn bộ `/api/auth/**`, các GET marketplace/custom services, webhook/verify payment, tài liệu Swagger và uploads; các API khác yêu cầu authentication. Không suy ra endpoint có chữ `admin` tự được role ADMIN: kiểm tra annotation. Một số CRUD chưa có kiểm tra role/ownership.

### 5.2 Catalog, giỏ hàng và địa chỉ

- Catalog dùng `F/features/products/data/products.ts`, id kiểu slug. API BE `/marketplace/product` dùng UUID và trả Page trong `result.content`; cần adapter `title → name`, `primaryImageUrl → imageUrl`, category, giá, v.v. trước khi tích hợp.
- Giỏ lưu `printhub_cart_items`; gộp theo product.id, tăng/giảm quantity, xóa khi quantity=0. Chưa tách theo user.
- FE shipping 15.000đ khi có hàng; coupon khởi tạo `SINHVIEN2024`, giảm tối đa 15.000đ; mọi mã không rỗng đều được xem hợp lệ. Đây là logic local.
- Địa chỉ lưu `printhub_shipping_addresses`; `loadSelectedAddress` lấy mặc định hoặc đầu tiên. AddressModal không dùng addressService.
- CartPage chỉ `setOrderSuccess(true)` và hiển thị mã cố định `ORD-9024`; không gọi createOrder, không tạo PayOS và không clear cart sau một giao dịch thật.
- BE Cart/CartItem entity đã có nhưng chưa có API giỏ hàng trong controller hiện tại.

### 5.3 Đặt đơn catalog thật ở BE

`POST /api/orders` dành cho USER; body:

```json
{
  "recipientName": "Tên người nhận",
  "phone": "Số điện thoại",
  "address": "Địa chỉ",
  "province": "Tỉnh/thành",
  "items": [{"productId": "UUID thực", "quantity": 1, "color": "BLUE", "engravingText": "Tên/MSSV"}],
  "paymentMethod": "COD"
}
```

- Kiểm tra items, product tồn tại/ACTIVE, seller active, stock; màu cho phép GREEN/BLUE/PINK/WHITE/BLACK.
- Nhóm items theo seller; **một request trả danh sách nhiều order**, không phải một order duy nhất.
- Tổng tiền = giá DB × số lượng; commission 5%; không có trường coupon/shipping fee trong request và phép tính hiện tại.
- Tạo order PENDING, ShippingInfo, OrderItem, trừ stock ngay trong transaction.
- COD tạo Payment PENDING; PAYOS chờ gọi create-link. Chưa thấy luồng hoàn tồn kho khi bỏ thanh toán hoặc hủy đơn.
- `GET /orders/my-orders` lấy đơn của current buyer cùng items/shipping.
- `POST /orders/{id}/complete-rewards` ADMIN: yêu cầu order đã COMPLETED, cộng `floor(totalAmount/10000)` vào **User.rewardPoints**, dùng rewardProcessed để tránh xử lý lặp tuần tự. Endpoint này không tự chuyển order thành COMPLETED.

### 5.4 Thiết kế 3D, custom request và bulk

- Configurator thật nằm trong `/custom`: chọn mẫu, vật liệu, màu, infill, chữ tên/MSSV/font; canvas nét vẽ, stamp/sticker và biến đổi bề mặt; preview bằng React Three Fiber.
- Giá là phép tính FE theo model/vật liệu/infill/màu, chưa được BE xác nhận.
- Xác nhận thiết kế dùng STLExporter xuất binary từ groupRef, tải `.stl` về máy rồi mở modal đơn hàng. Xuất STL không đồng nghĩa đã upload hoặc tạo custom order; STL không lưu màu như hình preview.
- COD ở modal chỉ đóng modal và chuyển `/orders`. PAYOS gọi create-link với CUSTOM_ORDER/customAmount nhưng **không có orderId**, trong khi BE bắt buộc UUID orderId.
- Modal đọc `checkoutUrl`, trong khi DTO BE trả `paymentLinkUrl`. Nếu lỗi/không có URL thì vẫn chuyển `/orders`.
- Tab upload của CustomOrderPage chỉ tạo request local PENDING_QUOTE; chưa gửi multipart. BulkOrderPage đọc tên file, gán thông số/giá mẫu và giảm 20%; chưa có endpoint bulk được expose dù có BulkOrderRequestDTO.
- BE custom: GET services public, POST services đòi MAKER; POST requests đòi USER, multipart `makerId, requirements, file`. Service chỉ kiểm tra maker tồn tại, lưu STL vào `BE/uploads/custom-prints`, tạo CustomOrder REQUESTED.
- BE chỉ nhận `.stl` trong FileStorageServiceImpl, không phải mọi định dạng STEP/OBJ được UI nhắc tới. `/uploads/**` được phục vụ public qua WebConfig.
- CustomOrder có các field rulerModel/customName/customStudentId/color/fontStyle/quantity nhưng createRequest hiện chưa gán các cấu hình này.
- Enum BE: REQUESTED, QUOTED, ACCEPTED, PRINTING, COMPLETED, CANCELLED. Chưa thấy API báo giá/chấp nhận/chuyển trạng thái custom; không coi chuỗi trạng thái này là workflow đầy đủ.

### 5.5 PayOS và payment

- `POST /payments/create-link`: USER, `orderId, orderType=ORDER|CUSTOM_ORDER, description?, customAmount?, paymentOption?`.
- ORDER: kiểm tra ownership, trạng thái PENDING, chưa SUCCESS. Số tiền ưu tiên customAmount dương; nếu DEPOSIT lấy 50%; còn lại helper lấy 20% khi tổng ≥200.000đ, dưới ngưỡng lấy 100%. Vì vậy `FULL` **không thực sự bảo đảm 100%** trong nhánh hiện tại.
- CUSTOM_ORDER: yêu cầu owner, ACCEPTED và quotedPrice; tính qua helper ngưỡng 200.000đ. Nhánh này không dùng customAmount như ORDER.
- `PayOSServiceImpl` là @Primary, dùng SDK tạo link, hạn 15 phút. Khi SDK lỗi lại trả URL mock; `MockPayOSServiceImpl` cũng tồn tại nhưng không phải bean ưu tiên.
- PaymentService lưu transactionId dạng `PH3D-...`; PayOSService chuyển thành số để gửi gateway và trả numeric orderCode. Webhook lại tìm transactionId bằng request.orderCode: cần thống nhất mapping trước khi kết luận webhook chạy đúng.
- Custom payment đặt `Payment.order=null`, nhưng entity quan hệ order là bắt buộc (`optional=false`); chưa có quan hệ customOrder. Đây là phần chưa hoàn tất.
- Webhook nhận DTO phẳng, tạo raw payload rồi gọi verify signature; implementation hiện **return true**. Nếu status SUCCESS thì Payment SUCCESS, paidAt, Order PAID; FAILED/CANCELLED → Payment FAILED. Payment đã không còn PENDING thì bỏ qua xử lý lại.
- TODO escrow freeze/notification chưa triển khai. Ghi Refund entity cũng không chứng minh tiền đã hoàn qua gateway.
- `GET /payments/verify/{orderCode}` BE trả PAID cố định; paymentService FE cũng trả PAID khi gọi verify lỗi. PaymentResultPage hiện không gọi verify, chỉ hiển thị thành công cố định.
- Return/cancel mặc định trong PayOS service chứa `/#/payment-result` nhưng FE dùng BrowserRouter; khi nối lại cần thống nhất URL cấu hình với router.

### 5.6 Hội viên, điểm và tài chính

- FE SubscriptionsPage và AdminSubscriptionsPage dùng gói/state local.
- BE admin tạo/sửa/xóa gói CUSTOMER hoặc MAKER; requiredPoints chỉ gán cho CUSTOMER.
- BE danh sách gói người mua lại lọc CUSTOMER_VIP. Enum có cả CUSTOMER/MAKER/CUSTOMER_VIP/MAKER_MARKETING; đây là lệch hiện tại giữa quản lý gói và sử dụng gói.
- Đổi gói kiểm tra user/plan/active/requiredPoints/số dư, trừ **PointWallet.balance**, ghi PointTransaction REDEEM rồi kích hoạt 30 ngày. Nếu có active subscription cùng type thì cộng thêm 30 ngày vào gói hiện tại.
- Admin gift kích hoạt/gia hạn mà không trừ điểm. Chưa có luồng thanh toán tiền mua gói được FE tích hợp.
- Điểm đơn hàng đang cộng User.rewardPoints, đổi gói trừ PointWallet.balance; chưa thấy đồng bộ hai nguồn.
- FinanceService tính quỹ = 1% tổng commission; commission order = 5% tổng hàng. Revenue là commission theo khoảng thời gian; doanh thu subscription hiện gán 0. Không mặc định số này là tiền thực thu/đã settlement.

### 5.7 Đánh giá, tranh chấp, bảo hành, thông báo

- Review BE: USER phải là buyer, order COMPLETED, mỗi order một review. FE chưa có luồng nối API review.
- Dispute BE: người gửi phải buyer/seller của order, mỗi order một dispute → OPEN. Admin resolve nhận RESOLVED/REJECTED; có thể ghi Refund FULL/PARTIAL nếu amount dương. Chưa có API list/chat trong nhóm controller này; FE dispute/chat/resolve là local.
- Warranty FE gọi `/warranty/user/me`, BE nhận UUID ở `{userId}` nên `me` không hợp lệ. FE gửi shape description/imageUrl/issueType; entity BE dùng reason/imageProofUrl/user/orderId. Update status FE gửi JSON nhưng BE nhận query `status`.
- WarrantyController tạo PENDING và CRUD trực tiếp entity; các endpoint admin chưa có @PreAuthorize ADMIN và chưa thấy ownership enforcement.
- NotificationProvider khởi tạo thông báo demo, chỉ fetch lúc mount nếu có token, chỉ thay dữ liệu nếu list không rỗng; không polling/websocket. Mark read cập nhật optimistic local.
- BE notifications trả findAll, chưa lọc current user; field isRead/createdAt khác read/timestamp FE. Chưa có endpoint read-all dù FE gọi.
- AddressController cũng findAll, create không gán user dù entity bắt buộc user; set default chỉ bật một địa chỉ, chưa bỏ default khác hoặc kiểm tra owner.
- File Vault: UI local, service `/vault/*` có khai báo nhưng không tìm thấy controller BE tương ứng.

## 6. API BE hiện có

Tất cả đường dẫn dưới đây có prefix `/api`. Kiểm tra quyền trong controller và SecurityConfig; bảng là inventory mapping, không chứng nhận đã kiểm thử.

| Nhóm | Method và path |
|---|---|
| Auth | POST `/auth/login`, `/auth/logout`, `/auth/register`, `/auth/verify-register-otp` |
| Password | POST `/auth/forgot-password/send-otp?email=...`, `/auth/forgot-password`, `/auth/reset-password/send-otp`, `/auth/reset-password` |
| Profile/blacklist | GET/PUT `/auth/profile`; POST `/auth/admin/blacklist` |
| Marketplace | GET/POST `/marketplace/product`; GET/PUT/DELETE `/marketplace/product/{id}` |
| Category | GET/POST `/categories` |
| Order | POST `/orders`; GET `/orders/my-orders`; POST `/orders/{id}/complete-rewards` |
| Custom print | GET/POST `/custom-prints/services`; POST multipart `/custom-prints/requests` |
| Payment | POST `/payments/create-link`, `/payments/payos-webhook`; GET `/payments/verify/{orderCode}` |
| Subscription admin | POST `/admin/subscriptions/customer` và `/maker`; PUT/DELETE các path đó thêm `/{id}` |
| Subscription user/gift | GET `/subscriptions/plans`; POST `/subscriptions/redeem/{planId}`, `/admin/subscriptions/gift` |
| Review/dispute | POST `/reviews`, `/disputes`; PUT `/admin/disputes/{id}/resolution` |
| Finance | GET `/admin/finance/commission-fund`, `/admin/analytics/revenue` |
| Address | GET/POST `/addresses`; PUT `/addresses/{id}/default`; DELETE `/addresses/{id}` |
| Notification | GET `/notifications`; PUT `/notifications/{id}/read` |
| Warranty | POST `/warranty/claim`; GET `/warranty/user/{userId}`, `/warranty/admin/claims`; PUT `/warranty/admin/claim/{id}/status?status=...` |
| Upload | POST multipart `/upload/image` → Cloudinary |

Marketplace list hỗ trợ keyword/categoryId/type/minPrice/maxPrice/sortBy/sortDirection/page/size; mặc định page=0, size=12, tối đa 100, sort createdAt desc. Custom service list mặc định size=10, tối đa 50, hỗ trợ keyword/material/giá/sort/paging.

**Các path FE khai báo nhưng không thấy mapping BE tương ứng:** `/products` và `/products/{id}`; `/auth/me`; `/orders/me`, `/orders/history`, GET `/orders/{id}`, PUT `/orders/{id}/status`; `/quotations*`; `/vault/*`; `/admin/users*`, GET `/admin/orders`, `/admin/factories`, GET `/admin/disputes`; `/notifications/read-all`; `/payments/create-payos`, `/payments/create-vnpay-url`. Phân biệt GET list disputes chưa có với PUT resolution có thật.

## 7. Mô hình dữ liệu cần nhớ

| Cụm | Quan hệ/chức năng |
|---|---|
| User, OTP, RefreshTokenRedis, SystemBlacklist | Tài khoản/CCCD/điểm trường user; OTP theo email; refresh token Redis; blacklist CCCD |
| Product, Category, ProductImage | Product thuộc seller(User) và Category; nhiều image, ảnh đầu thường primary |
| Order, OrderItem, ShippingInfo | Order có buyer/seller, items tham chiếu Product; ShippingInfo một-một chia sẻ id order |
| Payment | Một-một Order, amount/gateway/status/transactionId; chưa hỗ trợ liên kết CustomOrder |
| CustomPrintService, CustomOrder, PrintProof | Dịch vụ maker, yêu cầu buyer/maker/file/báo giá, bằng chứng in; PrintProof chưa có API luồng đầy đủ |
| Review, Dispute, Refund, DisputeRespons | Review/dispute gắn order; Refund chia sẻ id dispute; DisputeRespons là entity phản hồi, chưa có API chat |
| SubscriptionPlan, UserSubscription | Loại gói/quyền lợi/điểm yêu cầu; thời hạn gói user |
| PointWallet, PointTransaction | Ví điểm và lịch sử; khác User.rewardPoints |
| Wallet, WalletTransaction | Entity ví tiền; chưa có triển khai escrow/settlement đầy đủ |
| Address, Notification, WarrantyClaim | Dữ liệu thuộc user trong entity nhưng một số controller chưa scope theo user |
| Cart, CartItem | Schema giỏ hàng BE, FE chưa dùng API giỏ |

Không áp trực tiếp FE type lên response BE: OrderStatus FE thiếu PAID; paymentMethod FE Order có BANKING/VNPAY trong khi tạo đơn BE chỉ COD/PAYOS; custom FE dùng PENDING_QUOTE/IN_PRODUCTION khác REQUESTED/PRINTING; dispute FE có RESOLVED_REFUND_FULL/PARTIAL nhưng BE dùng RESOLVED + refundType riêng.

## 8. Chạy dự án và cấu hình

### FE

Chạy tại FE root; root package.json chỉ ủy quyền scripts cho `exe-fe`:

```powershell
npm --prefix exe-fe ci
npm run dev
npm run build
npm run lint
```

Build là `tsc -b && vite build`; output thường `exe-fe/dist`. Cấu hình `VITE_API_BASE_URL` vào môi trường Vite; không đưa secret BE vào biến VITE. FE dùng BrowserRouter; Vercel rewrite về index.html đã có ở root và có file riêng trong exe-fe ở working tree. Chọn đúng root/output khi deploy.

### BE

- JDK 21, Maven hoặc Maven wrapper nếu môi trường có đủ wrapper support; dependencies xem pom.xml.
- Profile `postgres` hoặc `mssql`; profile `local` có override dev cho một số tích hợp, không tự cung cấp đầy đủ datasource. `SPRING_PROFILES_ACTIVE` mặc định rỗng, cần cấu hình phù hợp.
- DB env: DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD. Redis: REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_SSL tùy profile; mặc định base/local port 6380, postgres port 6379 và SSL=true.
- JWT_SECRET; RESEND_API_KEY/MAIL_FROM; CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET; PAYOS_CLIENT_ID/API_KEY/CHECKSUM_KEY/RETURN_URL/CANCEL_URL. MAIL_HOST/PORT/USERNAME/PASSWORD vẫn có properties nhưng MailService hiện dùng Resend.
- CORS property `app.cors.allowed-origins` mặc định `*` dưới dạng allowed origin patterns.
- Có `.env`, `.env.local`, docker-compose.dev.yml và Dockerfile; không mặc định Spring tự đọc `.env`, cần xác nhận launcher/IDE/Compose inject env.
- DB profiles dùng `ddl-auto=update`; DataInitializer seed có kiểm tra bảng rỗng, gồm user/category/product/subscription/custom service. Có data.sql riêng; kiểm tra cách init đang bật trước khi chạy vào DB có dữ liệu.
- Custom file storage tương đối theo working directory; multipart giới hạn 20MB/file, 25MB/request trong DB profiles. Deploy container cần đảm bảo thư mục uploads ghi được và được lưu bền vững.
- Swagger: `/swagger-ui.html`, OpenAPI: `/v3/api-docs`. Server mặc định Spring 8080 nếu không override.

```powershell
# Tại BE, sau khi cấu hình env/profile và DB/Redis
mvn spring-boot:run
mvn test
mvn package
```

Dockerfile build Maven/JDK21, package với `-DskipTests`, runtime JRE21 non-root. Build Docker thành công không xác nhận test đã chạy.

## 9. Bản đồ đọc source theo yêu cầu

| Khi sửa | Đọc FE | Đọc BE (ngoài entity/repository liên quan) |
|---|---|---|
| Login/OTP/profile/role | F/context/AuthContext.tsx, F/services/authService.ts, F/components/ProtectedRoute.tsx, F/pages/LoginPage.tsx, SignupPage.tsx, ProfilePage.tsx | B/controller/AuthController.java, controller/api/AuthAPI.java, service/impl/AuthServiceImpl.java, dto/authen, common/security |
| Catalog/admin product | F/features/products, F/pages/admin/AdminProductsPage.tsx, F/services/productService.ts | B/controller/api/ProductAPI.java, service/impl/ProductServiceImpl.java, dto/marketplace, repository/specification/ProductSpecification.java |
| Cart/checkout/orders | F/features/cart, F/pages/CartPage.tsx, OrdersPage.tsx, F/services/orderService.ts | B/controller/api/OrderAPI.java, service/impl/OrderServiceImpl.java, dto/order |
| Địa chỉ | F/features/address, F/services/addressService.ts, F/App.tsx | B/controller/AddressController.java, dto/address/AddressRequestDTO.java |
| Thiết kế 3D/custom | F/components/3d/RulerConfigurator.tsx, F/pages/CustomOrderPage.tsx | B/controller/api/CustomPrintAPI.java, service/impl/CustomOrderServiceImpl.java, CustomPrintManagementServiceImpl.java, FileStorageServiceImpl.java |
| Thanh toán | F/services/paymentService.ts, F/pages/PaymentResultPage.tsx, F/components/3d/RulerConfigurator.tsx | B/controller/PaymentController.java, service/impl/PaymentServiceImpl.java, PayOSServiceImpl.java, dto/payment, common/config/PayOSConfig.java |
| Hội viên/điểm | F/pages/SubscriptionsPage.tsx, F/pages/admin/AdminSubscriptionsPage.tsx | B/service/impl/UserSubscriptionServiceImpl.java, SubscriptionPlanServiceImpl.java, OrderServiceImpl.java, controller/api/*SubscriptionAPI.java, SubscriptionPlanAPI.java |
| Dispute/review/hoàn tiền | F/pages/DisputesPage.tsx, F/pages/admin/AdminDisputesPage.tsx | B/service/impl/DisputeServiceImpl.java, ReviewServiceImpl.java, controller/api/DisputeAPI.java, ReviewAPI.java |
| Warranty/notification | F/pages/WarrantyPage.tsx, F/context/NotificationContext.tsx, F/services/warrantyService.ts, notificationService.ts | B/controller/WarrantyController.java, NotificationController.java |
| Finance | F/pages/admin/AdminFinancePage.tsx | B/service/impl/FinanceServiceImpl.java, B/repository/OrderRepository.java |
| Layout/navigation/style | F/routes/index.tsx, F/layouts, F/index.css, F/App.tsx | Thường không cần đọc BE |
| Môi trường/deploy | FE/package.json, FE/exe-fe/package.json, vite config, vercel.json | BE/pom.xml, BE/Dockerfile, R/application*.properties, B/common/config |

## 10. Giới hạn xác minh và cập nhật

- Tài liệu dựa trên khảo sát tĩnh routes, pages/handlers, services FE, controller/API, service implementation, DTO, entity/repository, cấu hình và cấu trúc test BE. Không chạy ứng dụng, gọi gateway, gửi email, thay DB hoặc kiểm thử end-to-end trong tác vụ viết tài liệu.
- FE package hiện không có script test; có build/lint. BE có KycServiceTest (parse QR), UserSubscriptionServiceTest (list/redeem/gift) và contextLoads; không coi đó là coverage cho checkout/payment/security.
- Thay đổi chưa commit có trước tác vụ: FE LandingNavbar và một số file deploy/log/lock; BE các file Auth API/controller/service/password DTO. Tài liệu không hoàn tác hoặc sửa các thay đổi đó.
- `.agents/AGENTS.md` tại FE chứa quy định walkthrough sau xây tính năng/sửa lỗi và log merge; cần đọc khi làm các tác vụ đó. Tác vụ hiện tại chỉ thêm tài liệu ngữ cảnh.
- Khi đổi route/API/DTO/state/payment/role/cấu hình: cập nhật mục tương ứng, ghi ngày và nguồn; chuyển nhãn Local/API chỉ sau khi đã kiểm tra code thật. Không giữ một lỗi cũ trong tài liệu sau khi đã sửa.
- Khi yêu cầu chỉ sửa giao diện, không cần khảo sát lại toàn bộ BE. Khi sửa nghiệp vụ, đọc đủ page → service → controller → implementation → DTO/entity liên quan, kể cả fallback và side effect.
