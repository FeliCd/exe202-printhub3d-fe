# Kiểm tra cộng điểm, đổi/mua subscription và cấu hình gói

Ngày: 26/10/2026. Phương pháp: rà mã nguồn frontend/backend trong workspace, đối chiếu caller, model, DTO, form và endpoint. Chưa gọi API thật, kiểm tra database đang chạy hoặc thực hiện thanh toán. Chưa sửa code tính năng.

BE: `D:/semester 7/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d/`.

FE: `D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/`.

Các file FLOW_FIX và PLAN đã viết trước đây là tài liệu đề xuất; không được coi là các tính năng đã có trong source hiện tại.

## 1. Kết luận về trạng thái hiện tại

| Chức năng | Kết quả rà soát |
| --- | --- |
| Cộng điểm lúc trả trước PAYOS | Backend chưa cộng; frontend đang hiển thị đã cộng với công thức khác backend |
| Cộng điểm lúc đơn marketplace hoàn thành | Có, floor(totalAmount / 10.000); còn thiếu guard tiền và chống race |
| Cộng điểm lúc custom/bulk hoàn thành | Chưa có đường thưởng tương ứng |
| Dùng điểm đổi subscription | Có kiểm tra/trừ điểm và kích hoạt/gia hạn; còn lỗi đổi gói khác, retry và đồng bộ wallet |
| Dùng tiền mua subscription | Chưa có flow purchase/payment/webhook activation tương ứng trong source đã kiểm tra |
| Admin cấu hình số ngày | Chưa có field; cố định 30 ngày ở backend và FE |
| Admin cấu hình giá tiền | Có field backend, nhưng form FE không có ô nhập; tạo mới gửi mặc định 0 |
| Admin cấu hình giá điểm | Có requiredPoints, input và logic redeem |
| Admin cấu hình quyền lợi thực thi | Chỉ có văn bản benefits; chưa có field/policy để áp quyền lợi tự động trong BE order |

## 2. Điểm khi thanh toán trước và khi hoàn thành

### 2.1. Backend không cộng điểm khi nhận tiền PAYOS

`service/impl/PaymentServiceImpl.java`, các phương thức handleWebhook/verify gọi settle. Phần settle khoảng dòng 300–365 cập nhật payment/đơn và thông báo, không có cập nhật PointWallet, insert PointTransaction hay gọi completeRewards.

Vì vậy, người dùng trả trước thành công chưa nhận điểm từ đường này. Nếu chính sách mong muốn chỉ thưởng sau giao xong thì thời điểm backend này phù hợp; lỗi hiện tại là UI nói đã cộng ngay. Nếu muốn thưởng trả trước riêng thì cần policy/event thưởng riêng, chưa có trong source.

### 2.2. Marketplace hoàn thành mới cộng điểm thật

`service/impl/OrderServiceImpl.java:426-427` gọi completeRewards khi chuyển COMPLETED. `completeRewards` tại dòng 207 kiểm tra order COMPLETED, tính tại dòng 227–229:

```text
earnedPoints = floor(order.totalAmount / 10000)
```

Sau đó cộng vào wallet, ghi EARN, đánh dấu rewardProcessed và rewardPointsEarned. Ví dụ totalAmount=100.000đ thì được 10 điểm; dưới 10.000đ được 0 điểm.

Cơ sở tính hiện tại là totalAmount của từng Order marketplace theo seller. Giá hàng được cộng trong createOrders; Order con do CheckoutOrder tạo cũng chỉ có tiền marketplace của seller. Không tự lấy tổng cha bao gồm custom/phí ship. Việc làm tròn thực hiện trên từng đơn con, không trên tổng một lần mua nhiều seller.

`entity/User.java:79-80` đọc rewardPoints từ PointWallet.balance. Không có hai số dư độc lập “user points” và “wallet points” trong getter này.

### 2.3. Custom/bulk chưa được thưởng khi hoàn thành

`service/impl/CustomOrderServiceImpl.java`, nhánh COMPLETED xử lý payment COD, lưu status và thông báo; không gọi completeRewards hoặc point service. `BulkOrderPage.tsx` dùng CustomRequestForm bulk, form gửi `/custom-orders`, nên cũng đi đường chưa thưởng này.

Mixed checkout cũ chỉ có thể nhận thưởng từ các Order marketplace con khi từng con COMPLETED. Không có bước cộng thưởng toàn cha hoặc cho toàn custom chỉ vì payment cha SUCCESS.

### 2.4. [P1] Frontend báo thưởng sai và có thể báo thành công khi chưa xác minh

`pages/PaymentResultPage.tsx:79-80`:

```text
displayAmount = remote.data?.amount ?? 8000
rewardPoints = max(8, floor(displayAmount / 1000))
```

Dòng 335 hiển thị “Đã cộng vào ví”. Với cùng cơ sở 100.000đ, FE hiển thị 100 điểm trong khi BE thưởng hoàn thành là 10 điểm; FE còn đặt tối thiểu 8 điểm, BE không có mức tối thiểu này. Giá trị FE chỉ tính để hiển thị, không thực sự ghi wallet.

Nhánh success tại dòng 221 là nhánh mặc định sau loading/cancel/unauthenticated, không yêu cầu remote.data.status === PAID. Khi verify PENDING/lỗi hoặc thiếu code, người đã đăng nhập vẫn có thể nhìn thấy thành công và điểm giả. Cần sửa state machine UI trước khi dựa vào màn này để kiểm chứng cộng điểm.

### 2.5. [P1] Đơn chưa trả tiền vẫn có thể được thưởng và wallet chưa an toàn khi đồng thời

- `OrderServiceImpl.java:405` cho PENDING vào sản xuất dù PAYOS chưa SUCCESS. Khi admin đi tiếp đến COMPLETED, dòng 427 vẫn cộng thưởng.
- completeRewards chỉ kiểm tra status, chưa kiểm tra payment đã thu đủ/đúng nguồn. Endpoint complete-rewards có ADMIN guard; đây không phải endpoint người dùng thường được tự cộng điểm tùy ý.
- rewardProcessed chặn xử lý lặp tuần tự nhưng `findById` order/wallet không khóa, PointWallet không có @Version và PointTransaction không có business key/unique theo đơn-sự kiện. Hai request đồng thời có thể tạo EARN trùng hoặc ghi đè số dư; cần test database để xác minh lịch xen kẽ thực tế.
- Redeem khóa User nhưng earn không dùng cùng khóa. ReviewServiceImpl cũng đọc/sửa wallet thường. Cộng điểm, đổi điểm và thưởng review đồng thời có thể mất cập nhật.
- Thưởng review ảnh 20 điểm tại ReviewServiceImpl là một nguồn điểm khác; helper chỉ cập nhật balance và chưa ghi PointTransaction tương ứng. Vì vậy tổng ledger EARN/REDEEM chưa chắc giải thích được toàn bộ balance.

### 2.6. [P2] Profile có thể hiển thị điểm cũ

AuthContext lấy profile lúc mount/login/updateProfile và cache user; chưa có refreshPoints/invalidations khi được thưởng hoặc redeem. Trang subscription lấy `/subscriptions/me` riêng và reload query của mình, trong khi ProfilePage đọc user.rewardPoints từ cache. Hai màn có thể hiển thị khác số dư dù backend cùng đọc wallet.

## 3. Dùng điểm đổi subscription

### 3.1. Phần đã có

POST `/api/subscriptions/redeem/{planId}` gọi `UserSubscriptionServiceImpl.redeemSubscription`:

1. Khóa User bằng findLockedById.
2. Kiểm tra plan tồn tại/active, type CUSTOMER hoặc CUSTOMER_VIP, role người đổi là USER.
3. requiredPoints phải >0; lấy/tạo wallet.
4. Kiểm tra đủ điểm, trừ balance, ghi PointTransaction REDEEM âm.
5. Kích hoạt/gia hạn subscription trong cùng transaction, trả subscription thật.

ApiException là RuntimeException; lỗi nghiệp vụ trong transaction có thể rollback phần trừ điểm cùng activation. Hai redeem cùng user đã được serialize bằng User lock; không kết luận riêng hai redeem đó chắc chắn cùng tiêu một số dư. Vấn đề khóa không thống nhất là khi cạnh tranh với các đường earn/review khác.

FE SubscriptionPanel có nút đổi điểm, kiểm tra points hiển thị và reload membership sau action thành công. Backend vẫn quyết định đủ điểm, không chỉ tin trạng thái disable phía FE.

### 3.2. Các lỗi/khoảng trống còn lại

- **[P1] Chọn B nhưng gia hạn A:** processSubscriptionActivation tìm active subscription theo TYPE, nếu có chỉ tăng endDate và không đổi plan. Điểm bị trừ theo B nhưng user vẫn có A nếu hai gói cùng type.
- **[P1] Race balance:** earn/review chưa dùng cùng khóa với redeem, có thể ghi đè balance.
- **[P2] Retry không idempotent:** endpoint chưa có operation key; request timeout sau commit rồi gửi lại có thể trừ thêm điểm và gia hạn thêm 30 ngày. Cần phân biệt một lần đổi mới với retry kỹ thuật.
- **[P2] Danh sách loại gói không thống nhất:** getAvailablePlansForUser chỉ lấy CUSTOMER trong khi redeem/gift cho CUSTOMER_VIP. Gói VIP legacy có thể đổi bằng ID nhưng không xuất hiện để chọn.
- **[P2] Thiếu snapshot/version plan khi đổi:** nếu admin sửa điểm/quyền lợi trong lúc user đang xem thì server dùng plan hiện tại, chưa có bước đối chiếu version/điểm mà khách đã xác nhận.
- **[P2] Không có lịch sử quyền lợi đóng băng:** UserSubscription liên kết trực tiếp plan, không snapshot quyền lợi; khi admin sửa benefits, lịch sử gói cũ cũng có thể hiển thị nội dung mới.

## 4. Mua subscription bằng tiền

Kết quả: chưa có một luồng mua hoàn chỉnh trong các controller/service/FE đã kiểm tra.

- UserSubscriptionAPI/Service hiện chỉ có list plans, me, redeem và gift, không có purchase/create subscription order.
- Payment DTO/service chỉ có ORDER, CUSTOM_ORDER, CHECKOUT_ORDER; chưa có đối tượng mua gói, plan snapshot hay webhook kích hoạt subscription sau trả tiền.
- Payment entity không liên kết một lần mua subscription; price có trong SubscriptionPlan không tự biến gói thành món có thể thanh toán.
- SubscriptionPanel user chỉ có nút đổi điểm, không có nút mua bằng tiền/PayOS.
- FinanceServiceImpl để customerSubscriptionRevenue = BigDecimal.ZERO, phù hợp với việc chưa có đường doanh thu mua gói trong service này.

Vì vậy không thể coi “đã có price trong database” là đã có chức năng mua gói bằng tiền. Cần bổ sung order mua gói, snapshot plan/giá/thời lượng/quyền lợi, attempts và kích hoạt đúng một lần sau payment được xác minh.

## 5. Các field cấu hình subscription admin đã đủ chưa?

| Field / chức năng | BE entity/DTO/API | Admin FE | Thực thi thực tế |
| --- | --- | --- | --- |
| Tên gói | Có name | Có input | Có lưu/hiển thị |
| Số ngày sử dụng | Không có durationDays trên plan | Không có input | Service hardcode 30; card cũng ghi cố định 30 ngày |
| Giá mua tiền | Có price, validate >=0 | Có state/payload nhưng không có input; tạo mặc định 0 | Chưa có purchase flow |
| Giá đổi điểm | Có requiredPoints | Có input | Có redeem; API chấp nhận null/0 để không hỗ trợ đổi, UI tạo hiện min=1 |
| Mô tả quyền lợi | Có benefits String | Có textarea | Chỉ mô tả, không phải policy thực thi |
| % giảm giá, phạm vi áp dụng | Chưa có field cấu trúc | Chưa có | Order BE chưa áp theo subscription |
| Miễn ship/số lượt/thời kỳ reset | Chưa có field/quota | Chưa có | Chưa có quota/usage ledger |
| Ưu tiên gia công | Chưa có field/policy | Chưa có | Chưa điều phối hàng đợi theo gói |
| Cho mua bằng tiền / đổi điểm / tặng | Chưa có flags riêng | Không có cấu hình phương thức | Redeem và gift hiện có, purchase chưa có |
| Hoạt động | Có isActive; soft delete=false | Có Ngừng áp dụng | Chưa thấy thao tác bật lại qua update DTO hiện có |
| Loại gói | Có CUSTOMER/CUSTOMER_VIP trong enum | CRUD cố định CUSTOMER | Chưa quản trị đầy đủ hai loại |
| Ngày bắt đầu/kết thúc hiệu lực từng user | Có ở UserSubscription | Hiện ngày hết hạn | Do activation tính, không thay thế duration cấu hình của plan |

Bằng chứng chính: SubscriptionPlan.java có type/name/price/benefits/requiredPoints/isActive; SubscriptionPlanRequestDTO chỉ có name/price/benefits/requiredPoints. UserSubscriptionServiceImpl.java:169 cố định durationDays=30. SubscriptionPanel.tsx:31 đặt price='0', :55 vẫn gửi Number(form.price), nhưng form chỉ có name/benefits/requiredPoints; :281 hiển thị “30 ngày”.

`CustomOrderCheckoutPage.tsx:143-146` còn tự suy VIP từ ADMIN hoặc user.subscriptionType, hardcode giảm 15%/miễn ship. Đây không phải quyền lợi được đọc từ cấu hình plan và thực thi thống nhất phía backend. Không dùng màn này làm chứng cứ subscription thật đang áp ưu đãi.

## 6. Hướng sửa cần chốt

1. Thống nhất chính sách điểm: khuyến nghị điểm mua hàng cộng **một lần khi COMPLETED và đã thu đủ tiền**; trả trước chỉ hiển thị dự kiến. Nếu có thưởng trả trước bổ sung, dùng event/policy riêng để không thưởng hai lần ngoài ý muốn.
2. Có RewardService/WalletService chung, khóa wallet/order và ledger unique theo source-event; nối marketplace/custom/bulk theo chính sách được xác định, kiểm tra payment trước thưởng.
3. PaymentResultPage chỉ hiện thành công/đã cộng khi server xác nhận đúng trạng thái và có reward transaction. Đồng bộ số dư Profile/Subscription từ cùng query hoặc invalidate chung.
4. Redeem có idempotency/version plan, trừ điểm và cấp đúng plan trong một transaction; quy định rõ đổi A→B thay vì âm thầm gia hạn A.
5. Bổ sung durationDays, price, requiredPoints, phương thức nhận gói và benefits có cấu trúc cho admin. Tách mô tả marketing khỏi policy giảm giá/ship/priority được server thực thi.
6. Mua gói bằng tiền cần SubscriptionPurchase/snapshot → PaymentAttempt → verified SUCCESS → activation idempotent; không cấp gói chỉ vì browser quay về success.
7. Kiểm thử payment trước/completion, custom/bulk, hai complete đồng thời, earn+redeem/review, timeout retry redeem/purchase và admin sửa plan khi user đang xác nhận.

Các hướng trên là đề xuất sau rà soát, chưa được triển khai. Không thay đổi chính sách thưởng hoặc tự bổ sung một loại thưởng mà chưa phân biệt với điểm hoàn thành.
