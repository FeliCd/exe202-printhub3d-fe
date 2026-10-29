# Flow 08 — Mua subscription bằng tiền: BE → API → FE

Ngày: 26/10/2026. Đây là đặc tả triển khai theo mã nguồn đã rà, chưa phải tính năng đã sửa hoặc kết quả test runtime.

## 1. Phạm vi và hợp đồng dùng chung

- [Báo cáo hiện trạng](./REVIEW_REWARDS_SUBSCRIPTION_CONFIG_2026-10-26.md).
- [01 — Thanh toán](./FLOW_FIX_01_CUSTOM_PRICING_PAYMENT.md): giữ Payment aggregate, PaymentAttempt và receipt/đối soát; không xây payment engine thứ hai.
- [06 — Điểm thưởng](./FLOW_FIX_06_REWARD_POINTS_LIFECYCLE.md): mặc định đề xuất không thưởng điểm cho tiền mua subscription để tránh vòng mua gói → nhận điểm → đổi gói.
- [07 — Đổi điểm](./FLOW_FIX_07_SUBSCRIPTION_POINT_REDEMPTION.md): dùng chung activation, quy tắc gia hạn và kiểm tra gói xung đột.
- [09 — Cấu hình gói](./FLOW_FIX_09_ADMIN_SUBSCRIPTION_CONFIGURATION.md): nguồn hợp đồng durationDays, price, requiredPoints, flags phương thức và benefits có cấu trúc.

Chỉ bán bằng PAYOS thanh toán toàn bộ trong bản này; subscription là quyền lợi số, không có COD, giao hàng hoặc trừ tồn Product. Gift và đổi điểm không được tính là doanh thu tiền. Mọi model/endpoint mới dưới đây là đề xuất, không phải API hiện có.

## 2. Hiện trạng cần bổ sung

BE tính từ `D:/semester 7/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d/`; FE tính từ `D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/`.

| Vị trí | Hiện trạng / khoảng trống |
| --- | --- |
| BE `service/UserSubscriptionService.java`, `controller/api/UserSubscriptionAPI.java` | Chỉ có plans, me, redeem và gift, chưa có purchase |
| BE `entity/SubscriptionPlan.java`, DTO plan | Có price nhưng chưa có đơn mua/snapshot thanh toán |
| BE `Payment.java`, `CreatePaymentLinkRequestDTO`, `PaymentServiceImpl` | Chỉ ORDER/CUSTOM_ORDER/CHECKOUT_ORDER; chưa liên kết lần mua subscription |
| BE `service/impl/FinanceServiceImpl.getRevenueAnalytics` | customerSubscriptionRevenue đang cố định bằng 0 |
| FE `features/subscriptions/SubscriptionPanel.tsx` | User chỉ đổi điểm; admin không có input price dù payload có price |
| FE `pages/PaymentResultPage.tsx` | Hướng về đơn hàng in và có nội dung thưởng/biên nhận giả; chưa phân loại mua gói |

Không chỉ thêm nút mua rồi gọi createPaymentLink với planId giả làm orderId. Cần một đối tượng mua có giá/quyền lợi đóng băng và activation được ghi đúng một lần sau receipt xác minh.

## 3. Các quyết định nghiệp vụ đề xuất

1. Có `SubscriptionPurchase` riêng, cùng payment engine với hàng hóa nhưng không vào giỏ marketplace/custom.
2. Khách xác nhận đúng planVersion, giá, durationDays và quyền lợi trước tạo purchase; server không tin giá từ FE.
3. Chỉ tạo purchase mới khi plan active, allowMoneyPurchase=true, price>0 và user đủ điều kiện.
4. Cùng planId: gia hạn bằng cách **thêm SubscriptionTerm mới**, không đổi snapshot quyền lợi của term đang dùng.
5. Term mới bắt đầu tại `max(now, end của term đã được cấp cuối cùng)`, kết thúc sau durationDays theo snapshot đã mua. Lưu UTC, UI hiển thị giờ Việt Nam.
6. Có planId khác đang active hoặc đã có term tương lai trong cùng membership scope CUSTOMER: trả ACTIVE_PLAN_CONFLICT khi tạo. Không thu tiền B rồi âm thầm gia hạn A.
7. Mua pending chưa giữ khóa User đến lúc trả tiền; eligibility có thể đổi bởi gift/redeem. Settlement phải kiểm tra lại dưới khóa User, nếu xung đột thì ghi tiền/hold/đối soát, không cấp sai gói.
8. Plan bị ngừng bán sau khi purchase đã chốt không tự đổi giá hoặc hủy quyền đã mua. Pending purchase hợp lệ trong deadline được giữ snapshot cũ, trừ khi có recall tường minh với audit/đối soát.
9. Không cấp quyền từ query success/cancel, trạng thái frontend hoặc chỉ vì link đã được tạo.
10. Không cộng điểm thưởng mua hàng cho subscription cash purchase trong mặc định này. Nếu có chiến dịch thưởng sau này phải có policy/event riêng.

## 4. Backend bước 1 — Model và migration additive

```text
SubscriptionPurchase
  id, version, userId, membershipScope=CUSTOMER
  planId, planRevisionId, planVersion
  planSnapshot: tên, type, membershipScope, durationDays, price, currency,
                acquisition flags, benefits có cấu trúc/schemaVersion
  expectedAmount, currency=VND
  purchaseStatus=PENDING_PAYMENT|SETTLED|CANCELLED|EXPIRED
  grantStatus=NOT_GRANTED|GRANTED|HELD|REVOKED
  paymentId, grantedTermId, paymentDueAt
  recalledAt/reason nếu có, createdAt, settledAt

SubscriptionTerm
  id, userId, membershipScope, planId, planRevisionId
  sourceType=MONEY_PURCHASE, sourceId=purchaseId
  immutable snapshot thời lượng/quyền lợi đã mua
  startsAt, endsAt UTC
  UNIQUE(sourceType, sourceId)
```

- Plan/SubscriptionPlanRevision và cấu trúc benefits theo file 09. Không copy chỉ planId rồi đọc lại plan sống lúc nhận tiền.
- SubscriptionTerm chứa snapshot bất biến. Thu hồi/hoàn tiền dùng entitlement adjustment/audit liên kết, không xóa term làm mất chứng cứ nguồn cấp.
- Thêm `subscription_purchase_id` vào Payment. Constraint đích thanh toán thành **đúng một trong** orderId/customOrderId/legacyCheckoutOrderId/subscriptionPurchaseId; giữ unique nghĩa vụ tiền.
- PaymentAttempt giữ nguyên paymentId/snapshotId/expectedAmount/gatewayOrderCode như file 01; không đưa purchase payment vào bảng subscription payment song song.
- Thêm `SUBSCRIPTION_PURCHASE` vào enum/validator/DTO/router payment. Không mở endpoint public để khách sửa payment SUCCESS.
- Command idempotency unique `(actorId, scope, key)` và requestHash/resultSnapshot. Có thể giới hạn một purchase PENDING_PAYMENT mỗi user/scope bằng unique claim/index phù hợp DB để tránh nhiều màn tạo các đơn chờ không chủ đích.
- Money BigDecimal/số nguyên VND theo policy chung; price=0 không gửi gateway, bản này yêu cầu tắt mua tiền nếu chưa có giá dương.
- Theo file 09, allowMoneyPurchase=false cho phép price=null; legacy price=0 chuyển thành tắt mua tiền/null sau kiểm chứng, không tự xem là gói miễn phí. allowMoneyPurchase=true bắt buộc price nguyên VND >0 và durationDays>0.

## 5. Backend bước 2 — Tạo đơn mua gói

1. Nhận planId, planVersion và idempotencyKey; principal quyết định người mua, không nhận userId tùy ý.
2. Lookup/claim key trước mutable validation. Replay cùng key/hash trả purchase cũ kể cả plan hiện đã đổi/ẩn; khác payload trả conflict.
3. Với thao tác mới, khóa User, đọc plan hiện hành và revision đã chọn, kiểm tra active/allowMoneyPurchase/price/role; planVersion lệch thì trả PLAN_VERSION_CONFLICT trước tạo nghĩa vụ tiền.
4. Kiểm tra membership slot/terms hiện tại và tương lai. Khác planId cùng scope trả conflict; cùng planId được mua thời hạn kế tiếp.
5. Snapshot giá, duration và benefits vào purchase mới; tạo Payment PAYOS/PENDING tham chiếu purchase và lưu command result cùng transaction.
6. Mặc định đề xuất deadline thanh toán 15 phút; server trả paymentDueAt/serverTime. Gia hạn link không kéo dài deadline purchase vô hạn.
7. Commit; FE nhận purchaseId và bước tạo link. Lỗi tạo link không rollback hoặc tạo lại purchase; có đường tiếp tục từ purchase đã lưu.

Không giữ khóa User hoặc DB transaction xuyên suốt bước chờ khách/gateway. Các kiểm tra khi tạo cho biết khả năng mua lúc đó, không thay thế kiểm tra activation tại settlement.

## 6. Backend bước 3 — Tạo/tra link bằng payment engine chung

1. Orchestration không có outer transaction; các pha DB qua Spring proxy collaborator hoặc TransactionTemplate. `PaymentServiceImpl` hiện có @Transactional cấp class nên phải bỏ transaction bao ngoài đường HTTP, không chỉ tách private method tự gọi trong cùng class.
2. Pha DB ngắn: khóa Purchase → Payment → PaymentAttempt, kiểm tra ownership, PENDING_PAYMENT, deadline, PAYOS, snapshot/amount; reuse attempt phù hợp hoặc tạo attempt CREATING có mã ổn định.
3. Commit rồi gọi gateway ngoài transaction. Timeout nghĩa là chưa biết kết quả; tra/retry cùng gatewayOrderCode, không tự tạo mã khác.
4. Khóa lại, finalize url/expiry nếu purchase còn payable. Nếu đã cancel/nhận tiền trong lúc gateway chạy thì không trả link như còn khả năng thanh toán; ghi việc đóng/đối soát ngoài transaction.
5. Return/cancel URL do server cấu hình/whitelist; FE chỉ mở https và domain gateway phù hợp.

## 7. Backend bước 4 — Verified payment → cấp term đúng một lần

### 7.1. Thứ tự khóa chung

```text
Existing SubscriptionPurchase -> Payment -> PaymentAttempt
  -> User -> plan gate nếu thực sự cần -> membership slot -> SubscriptionTerm
```

Idempotency/event receipt được claim trước side effects. Lookup không ghi để tìm IDs được phép, sau đó đọc lại dưới khóa. Không có đường giữ User/Wallet/slot rồi quay lại lấy khóa một purchase/order/payment đã tồn tại. Redeem/gift dùng User rồi plan/wallet/slot theo file 07/09; không gọi ngược sang purchase root. Quy tắc này phải áp cho admin activation, cancel/refund và worker.

### 7.2. Settlement

1. Webhook xác minh chữ ký/nguồn; verify user kiểm tra ownership rồi gọi gateway ngoài transaction. Không lấy query browser làm bằng chứng.
2. Trong transaction ngắn, khóa theo trên; deduplicate receipt bằng gateway transaction/event key ổn định.
3. Đối chiếu attempt, merchant, amount, currency nếu có và immutable snapshot. Ghi receipt xác thực kể cả khi cần đối soát; amount sai không được sửa expectedAmount cho khớp.
4. Khi purchase còn hợp lệ và amount đủ, Payment SUCCESS/attempt SUCCESS. Kiểm tra User và membership scope dưới khóa trước grant.
5. Nếu source MONEY_PURCHASE/purchaseId đã có term, trả đúng term cũ, không tăng ngày lần nữa.
6. Nếu eligibility vẫn hợp lệ: gọi activation chung, append term theo revision đã trả tiền, ghi grantStatus=GRANTED, grantedTermId và purchaseStatus=SETTLED trong cùng transaction với receipt/payment.
7. Nếu receipt đúng/đủ nhưng khác plan active/future, purchase bị recalled hoặc điều kiện cấp chưa giải quyết được: Payment SUCCESS là sự thật nhận đủ tiền; purchase đang PENDING_PAYMENT chuyển SETTLED, grantStatus=HELD và reconciliationStatus=REQUIRED. Không để purchase vẫn trông như chưa trả và cho thu tiếp; không gán plan cũ hoặc trả success kích hoạt giả. Receipt sai amount/snapshot chỉ ghi nhận tiền thực vào đối soát, không fake Payment SUCCESS.
8. Receipt đến sau CANCELLED/EXPIRED vẫn được ghi; giữ trạng thái terminal và đối soát, không tự hồi sinh đơn mua hoặc cấp quyền muộn không được duyệt.
9. Commit rồi outbox thông báo, invalidate membership projection. Notification lỗi không gây grant lại khi callback retry.

Grant có thể là term tương lai khi cùng plan đang còn hiệu lực; GRANTED nghĩa quyền đã được cấp vào lịch, không đồng nghĩa mọi benefits revision mới có hiệu lực ngay. UI phải trả startsAt/endsAt và phân biệt đang dùng/sắp có hiệu lực.

### 7.3. Khôi phục grant và bảo toàn receipt

- Chiến lược bản này: receipt/payment và grant hoặc HELD được chốt cùng transaction. Kiểm tra xung đột dưới khóa trước ghi grant; activation trả typed outcome GRANTED/CONFLICT/ALREADY_GRANTED cho lỗi nghiệp vụ, không ném RuntimeException rồi bị caller bắt để tiếp tục commit. Đặc biệt không nuốt exception của collaborator @Transactional đã đánh dấu transaction rollback-only rồi vẫn ACK thành công.
- Nếu lỗi DB/exception kỹ thuật xảy ra, rollback toàn transaction và không ACK như đã persist; để webhook retry/verify xử lý lại cùng receipt. Không chỉ catch lỗi rồi trả success trong khi receipt đã rollback. Khi chỉ là business conflict, ghi SETTLED/HELD/reconciliation và receipt trong cùng commit để giữ đúng bằng chứng tiền.
- Worker kiểm tra purchase đã có receipt đúng nhưng chưa grant, khóa lại theo cùng thứ tự và replay activation theo sourceType/sourceId. Chỉ grant khi đủ điều kiện và chưa bị refund/revoke; không tự xóa hold có lý do chưa giải quyết.
- Nếu grant đã tồn tại mà response/outbox mất, khôi phục projection từ chính term đó; không tạo term thứ hai hoặc tính startsAt lại từ thời gian worker chạy.
- Nếu database fail trước commit receipt thì gateway retry/verify phải có thể xử lý lại; chỉ ACK webhook đã lưu bền theo hợp đồng gateway. Không dựa vào việc browser còn mở để hoàn tất activation.

## 8. Backend bước 5 — Hủy, hết hạn, hoàn tiền và doanh thu

- Cancel trước trả tiền dùng claim dưới root lock → verify/cancel gateway ngoài transaction → khóa lại finalize; nếu tiền vừa về thì đối soát. Browser cancel chỉ điều hướng kiểm tra, không tự kết luận chưa trừ tiền.
- Expire job cũng recheck receipt/attempt, không tin một query candidate cũ; gateway unknown thì để pending review, không tự vứt receipt/link mapping.
- Refund cần actor/quyền/lý do và idempotent refund operation; không xóa payment/term. Đã thu hồi term phải có entitlement adjustment tường minh, không sửa lịch sử snapshot.
- Nếu term đã dùng hoặc có term xếp sau, hoàn/thu hồi phải tính tác động quyền và lịch; không âm thầm dịch chuyển các term khác hoặc thu thêm tiền. Trường hợp chưa có policy tự động đưa hỗ trợ/đối soát.
- `FinanceServiceImpl` thay customerSubscriptionRevenue=0 bằng tổng receipt tiền mua gói được ghi nhận theo thời gian/tiền tệ, loại trừ khoản chưa phân bổ và trừ refunds theo policy báo cáo rõ. Không cộng số request purchase, giá catalogue, gift hoặc điểm đổi gói vào doanh thu tiền.
- Doanh thu tiền nhận và nghĩa vụ dịch vụ chưa cấp có thể cần hiển thị riêng; HELD vẫn là tiền đã nhận cần xử lý, không được mất khỏi báo cáo đối soát.

## 9. API đề xuất

| Endpoint | Chức năng |
| --- | --- |
| `POST /api/subscriptions/purchases` | Tạo purchase từ planId/planVersion và key |
| `GET /api/subscriptions/purchases/{id}` | Chủ purchase/ADMIN có quyền xem snapshot, tiền, grant, actions |
| `GET /api/subscriptions/purchases/me` | Tiếp tục các lần mua sau refresh/đăng nhập lại |
| `POST /api/subscriptions/purchases/{id}/cancel` | Hủy có guard/version/key; 202 khi đang xác minh |
| `POST /api/payments/create-link` | Nhận orderType SUBSCRIPTION_PURCHASE, orderId=purchaseId, key |
| `GET /api/payments/verify/{code}` | Trả targetType/targetId/paymentStatus/grantStatus cùng dữ liệu thật |

```json
{
  "planId": "uuid-plan",
  "planVersion": 4,
  "idempotencyKey": "uuid-lan-mua"
}
```

Response sau tạo chưa phải đã kích hoạt:

```json
{
  "purchaseId": "uuid-purchase",
  "purchaseStatus": "PENDING_PAYMENT",
  "paymentStatus": "PENDING",
  "grantStatus": "NOT_GRANTED",
  "planSnapshot": { "planId": "uuid-plan", "planVersion": 4, "durationDays": 30, "price": 99000, "currency": "VND" },
  "paymentDueAt": "2026-10-26T05:15:00Z",
  "canPay": true,
  "canCancel": true,
  "version": 1
}
```

Response thực tế còn chứa benefitsSnapshot/planRevisionId và tên gói. Khi đã grant trả termId, startsAt, endsAt, isCurrentlyEffective và receipt; không trả một field status dùng chung cho tiền và cấp quyền.

| Lỗi / trạng thái | FE xử lý |
| --- | --- |
| PLAN_INACTIVE / MONEY_PURCHASE_DISABLED | Không thu tiền; tải catalogue mới |
| PLAN_VERSION_CONFLICT | Hiện giá/quyền lợi mới và chờ khách xác nhận lại |
| ACTIVE_PLAN_CONFLICT | Giải thích đang có gói khác; không tạo pending payment mới |
| PURCHASE_IN_PROGRESS / UNKNOWN_GATEWAY_STATE | Theo dõi cùng operation/attempt; không tạo purchase/key mới mù |
| PURCHASE_EXPIRED / CANCELLED | Không phát hành link mới; cho xem lịch sử hoặc thao tác mua mới rõ ràng |
| PAYMENT_RECEIVED_GRANT_HELD | Hiện đã nhận tiền nhưng cần xử lý cấp gói/đối soát; không báo gói đã active |
| IDEMPOTENCY_CONFLICT / VERSION_CONFLICT | Không đổi payload với key cũ, tải state server |

## 10. Frontend thực hiện tuần tự

1. `SubscriptionPanel`: lấy allowMoneyPurchase/price/durationDays/benefits từ catalogue server, thêm CTA **Mua gói — …đ** bên cạnh đổi điểm khi phương thức được bật. Không có giá dương thì không dựng một nút mua 0đ.
2. Confirm hiển thị snapshot khách sắp mua: tổng giá VND, số ngày, quyền lợi, ngày dự kiến bắt đầu nếu gia hạn và điều kiện cùng/khác gói.
3. Capture planId/version trước await; tạo key một lần, disable duplicate submit. Timeout tạo purchase phải replay cùng key/tra command, không tự tạo lần mua mới.
4. Nhận purchaseId rồi tạo link bằng paymentService đã mở rộng target type; lỗi link giữ purchase để retry. Reload vẫn mở được chi tiết bằng URL/purchase list, không chỉ location.state.
5. `PaymentResultPage`: phân loại SUBSCRIPTION_PURCHASE qua verify server, không suy chỉ từ query do browser gửi. Không hiển thị tiến trình máy in/giao hàng hoặc “đã cộng điểm” cho mua gói.
6. Chỉ báo **Đã kích hoạt** khi grantStatus=GRANTED và server trả term thật; term tương lai hiển thị **Đã gia hạn, bắt đầu từ …**. Payment SUCCESS nhưng HELD hiển thị cần xử lý, giữ receipt và kênh hỗ trợ.
7. PENDING/unknown/error/missing code có giao diện riêng, polling giới hạn/backoff và nút kiểm tra lại; không rơi vào success mặc định.
8. Khi grant thành công invalidate membership/current-entitlements/purchase queries theo user. Profile/Subscriptions dùng chung projection hoặc refresh chung; không tự cộng 30 ngày hoặc gắn VIP từ role ADMIN.
9. Hủy/thoát payment không sửa hai giỏ hàng hay restore backup. Subscription purchase không consume dòng marketplace/custom và không làm popup thay đổi.

## 11. File cần sửa khi triển khai

BE: bổ sung SubscriptionPurchase, immutable plan revision/term theo file 09, repository/DTO/controller/service purchase và activation chung; mở rộng Payment target/DTO/dispatch/receipt; FinanceServiceImpl; migrations/unique constraints; expire/notification worker và authorization.

FE: SubscriptionPanel, subscription service/hook, paymentService types, PaymentResultPage theo loại giao dịch, trang chi tiết/lịch sử purchase có reload được, membership projection và query invalidation. Không sửa CartDrawer hoặc nút header mở popup.

## 12. Dữ liệu cũ, rollout và kiểm thử

1. Backfill plan duration=30 chỉ khi phù hợp hành vi thực tế cũ; giá 0/benefits chỉ văn bản không tự bật bán tiền. Terms/grants cũ giữ nguồn gift/redeem/LEGACY_VERIFIED, không chế receipt mua tiền.
2. Deploy schema/plan config/activation chung và payment target mới trước FE CTA; feature flag cash purchase tắt đến khi đủ contract.
3. Kiểm thử create/pay/verify/grant/replay bằng mock và sandbox gateway; migration/payment cũ ORDER/CUSTOM_ORDER/CHECKOUT_ORDER không bị ảnh hưởng bởi XOR mới.
4. Bật từng phần, theo dõi paid-but-not-granted, unknown attempts và refunds; rollback bằng tắt CTA/tạo purchase mới nhưng vẫn nhận receipt/grant/đối soát các purchase đã phát hành.

| Kiểm thử | Kết quả bắt buộc |
| --- | --- |
| Giá FE giả hoặc planVersion cũ | Không thu giá client; conflict trước tạo purchase |
| Double-click/retry/timeout sau commit | Một purchase đúng key, không thu/cấp đôi |
| Hai create-link/webhook+verify đồng thời | Một active attempt hợp lệ; một grant theo sourceId |
| Mua cùng plan với revision mới | Append term snapshot mới; term cũ không đổi quyền lợi |
| Có gói khác trước tạo / được gift gói khác trước settlement | Từ chối trước thu / tiền đã nhận vào HELD, không cấp nhầm |
| Plan ngừng bán sau purchase trong deadline | Dùng snapshot đã chốt, trừ explicit recall có audit |
| Late payment sau expire/cancel hoặc amount lệch | Ghi receipt/đối soát, không kích hoạt giả/mất tiền |
| Callback browser success giả, thiếu code, verify lỗi | Không hiện đã mua/đã active |
| Refund lặp hoặc term đã có usage | Một refund/entitlement adjustment hợp lệ hoặc cần xử lý, không xóa lịch sử |
| Profile/Subscriptions mở lại/đổi tài khoản | Quyền thật từ server, không cache gói của user khác |
| Báo cáo doanh thu | Chỉ tiền mua gói thực đã ghi nhận, không gift/redeem/đếm cả hai attempts |

Hoàn thành khi tạo purchase, nhận tiền, append term và hiển thị quyền lợi vận hành xuyên suốt; receipt/retry không cấp đôi; mọi trường hợp đã nhận tiền nhưng chưa cấp được có đối soát truy vết. Các test nêu trên là kế hoạch cần chạy khi triển khai, chưa được chạy trong lần viết tài liệu này.
