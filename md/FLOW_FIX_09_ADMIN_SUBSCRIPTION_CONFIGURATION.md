# Flow 09 — Cấu hình đầy đủ subscription và thực thi quyền lợi từ BE đến FE

Ngày: 26/10/2026. Trạng thái: đặc tả sửa, chưa triển khai tính năng hay chạy test cho bản sửa.

Phạm vi: admin cấu hình đủ số ngày, giá tiền, giá điểm, phương thức nhận gói và quyền lợi có hiệu lực thật; đồng nhất dữ liệu cho redeem, mua tiền, tặng và áp dụng vào marketplace/custom/bulk. Đây là phần hợp đồng dùng chung của các flow mới, không chỉ bổ sung vài ô input.

## 1. Tài liệu và phạm vi liên quan

- [Kết quả rà soát hiện tại](./REVIEW_REWARDS_SUBSCRIPTION_CONFIG_2026-10-26.md).
- [06 — Cộng điểm và ví điểm](./FLOW_FIX_06_REWARD_POINTS_LIFECYCLE.md).
- [07 — Dùng điểm đổi gói](./FLOW_FIX_07_SUBSCRIPTION_POINT_REDEMPTION.md).
- [08 — Mua gói bằng tiền](./FLOW_FIX_08_SUBSCRIPTION_CASH_PURCHASE.md).
- [04 — Tặng gói và phản hồi đúng kết quả](./FLOW_FIX_04_ADMIN_SUBSCRIPTION_GIFT_FEEDBACK.md).
- [01 — Payment](./FLOW_FIX_01_CUSTOM_PRICING_PAYMENT.md), [05 — Giá custom/bulk](./FLOW_FIX_05_BULK_QUOTE_PRICING.md), [kế hoạch tách giỏ](./PLAN_SPLIT_MARKETPLACE_CUSTOM_CART_ORDER.md).

Trong nhóm flow 06–09, các lựa chọn chính sách bên dưới là **đề xuất mặc định để triển khai nhất quán**, không phải chức năng đã tồn tại hoặc quyết định nghiệp vụ ngầm được cho là đã xác nhận. Không đổi nội dung popup giỏ hàng. Trang hai tab và popup vẫn dùng cùng một nguồn dữ liệu/lưu/đồng bộ, mục mở trang nằm trên menu; các nút mở popup giữ nguyên.

## 2. Hiện trạng phải thay

BE tính từ `D:/semester 7/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d/`; FE tính từ `D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/`.

| Vị trí thực tế | Hiện trạng | Việc cần làm |
| --- | --- | --- |
| BE `entity/SubscriptionPlan.java` | name/type/price/benefits String/requiredPoints/isActive | Thêm duration, flags, version và quyền lợi cấu trúc |
| BE `dto/subscription/SubscriptionPlanRequestDTO.java` | Chưa có duration/flags/benefit policy | DTO/validator đồng nhất trường form |
| BE `SubscriptionPlanServiceImpl.createPlan/updatePlan` | Ghi trực tiếp cùng plan | Tạo revision bất biến và phân biệt sửa catalog với quyền lợi đã cấp |
| BE `UserSubscriptionServiceImpl.processSubscriptionActivation` | Cố định 30 ngày, tìm theo type rồi gia hạn gói cũ | Dùng duration snapshot và activation chung đúng plan |
| BE `SubscriptionPlanController` | CRUD cố định CUSTOMER | Hỗ trợ các loại hợp lệ, xử lý CUSTOMER_VIP legacy nhất quán |
| FE `features/subscriptions/SubscriptionPanel.tsx` | Form chỉ có tên, mô tả, điểm; price mặc định 0, card 30 ngày | Bổ sung đủ input, capability, preview và trạng thái lưu |
| FE `pages/CustomOrderCheckoutPage.tsx` | ADMIN được coi VIP, giảm 15%/ship hardcode | Bỏ suy đoán, chỉ hiển thị quyền lợi/tổng do server trả |
| BE order/checkout/custom services | Không đọc quyền lợi thực thi theo plan | Đưa vào pricing/entitlement service và quota usage |

## 3. Hợp đồng plan chuẩn cho cả bốn flow

### 3.1. Các trường quản trị

| Field đề xuất | Kiểu / validation | Ý nghĩa |
| --- | --- | --- |
| id | UUID, server cấp | Identity ổn định của gói |
| planVersion | Số nguyên tăng, bắt buộc khi update | Chống ghi đè cấu hình cũ |
| type | CUSTOMER / CUSTOMER_VIP thuộc danh sách cho phép | Phân loại hiển thị/legacy; không thay cho planId |
| membershipScope | CUSTOMER cho hai loại trên | Miền độc quyền quyền lợi/kiểm tra xung đột gói |
| name | Chuỗi trim, 1–255 | Tên gói |
| description | Chuỗi, giới hạn phù hợp | Mô tả marketing, không chứa logic thực thi |
| durationDays | Số nguyên >0, giới hạn cấu hình server | Số ngày của một kỳ nhận gói |
| allowMoneyPurchase | Boolean | Cho phép mua bằng tiền |
| price | VND nguyên >0 khi money bật; null khi tắt | Giá mua một kỳ, không lấy từ FE để thu tùy ý |
| allowPointRedemption | Boolean | Cho phép đổi bằng điểm |
| requiredPoints | Nguyên >0 khi redeem bật; null khi tắt | Điểm cần cho một kỳ |
| allowAdminGift | Boolean | Cho phép admin tặng |
| isActive | Boolean | Cho nhận mới; không thu hồi gói đã cấp |
| benefits | Object theo mục 3.2 | Quyền lợi máy đọc được, không parse mô tả |
| createdAt/updatedAt, createdBy/updatedBy | Server/principal | Lịch sử quản trị |

Ít nhất một phương thức nhận gói phải bật để publish active. Cho lưu bản nháp/inactive nếu chưa đủ giá/quyền lợi, nhưng không để người dùng mua/đổi draft đó. Khi tắt phương thức thì không suy từ null/0 rằng đó là nhận gói miễn phí; gift là hành động riêng có role/audit.

Điểm giữ integer dương khi bật, không dùng số thập phân; tiền BigDecimal có kiểm tra scale VND và mức tối đa. Số ngày không phải text “tháng/năm” để service tự hiểu theo cách khác nhau. Bản đầu dùng ngày cố định, đồng hồ UTC; 30 ngày không được quảng bá thành mọi tháng lịch đều bằng 30 ngày.

### 3.2. Quyền lợi cấu trúc đề xuất

```json
{
  "discount": {
    "percent": 10,
    "appliesTo": ["MARKETPLACE", "CUSTOM"],
    "minEligibleSubtotal": 0,
    "maxDiscountAmount": 50000
  },
  "shipping": {
    "freeUsesPerTerm": 2,
    "maxDiscountAmountPerUse": 30000,
    "appliesTo": ["MARKETPLACE", "CUSTOM"]
  },
  "production": {
    "priorityEnabled": true,
    "appliesTo": ["CUSTOM"]
  }
}
```

- discount.percent trong miền 0–100; min/max tiền không âm, max có thể null nếu chính sách không giới hạn. Server phải chặn publish tổ hợp làm phát sinh đơn 0đ nếu quy trình FREE_ORDER chưa được triển khai; không sửa tổng thành 1đ hoặc fake payment SUCCESS để lách gateway.
- freeUsesPerTerm nguyên >=0; 0 là không có lượt. Khi >0 phải có maxDiscountAmountPerUse >0. Thực tế chỉ giảm tối đa phí giao và cap; nếu phí cao hơn cap, khách trả phần còn lại. UI không ghi miễn toàn bộ khi thực chất có giới hạn.
- Quota reset theo **mỗi SubscriptionTerm**, không theo tháng lịch. Renewal tạo term mới với quota mới; không reset quota chỉ vì user mở lại trang hoặc admin sửa plan.
- Bulk thuộc CUSTOM, không là một scope ưu đãi thứ ba. Một file/yêu cầu là một order; không tự gom số lượng mọi file thành một bậc giảm toàn lô.
- priority chỉ có nghĩa khi hàng đợi gia công thực sự đọc cờ/policy đó. Không hứa quyền lợi chỉ vì đã lưu boolean nhưng chưa nối scheduler/admin queue.
- Trước publish, validate capability backend đã hỗ trợ từng benefit. Quyền lợi chưa được thực thi không được bày như đã có; có thể giữ draft kèm lý do.

## 4. Revision và kỳ quyền lợi — không sửa ngược gói khách đã nhận

### 4.1. Dữ liệu đề xuất

```text
SubscriptionPlan                       catalog identity, active gate, latest version
SubscriptionPlanRevision               immutable
  planId + planVersion UNIQUE
  name, type, membershipScope
  durationDays, price, requiredPoints, acquisition flags, description
  structured benefits, schemaVersion, publishedAt

SubscriptionTerm                       immutable grant/snapshot
  id, userId, membershipScope, planId, planRevisionId
  startsAt, endsAt, sourceType, sourceId
  acquisitionSnapshot, benefitsSnapshot
  state/lifecycle flags, revokedAt/reason nếu có quy trình
  UNIQUE(sourceType, sourceId)

MembershipSlot                         coordination theo user + scope
  UNIQUE(userId, membershipScope), version

EntitlementUsage
  termId, benefitCode, businessOrderType/id, allocationId
  state=RESERVED|CONSUMED|RELEASED
  validUntil nếu còn chờ thanh toán, quotaUnits, discountAmount
  unique key chống một allocation được áp hai lần
```

Tạo/sửa plan sinh revision mới; active/inactive và latest pointer nằm ở catalog. SubscriptionTerm đã cấp không đổi benefits/duration/price chỉ vì admin sửa catalog.

### 4.2. Một activation service cho điểm, tiền và quà

Đầu vào: userId, planRevisionId, sourceType POINT_REDEMPTION/MONEY_PURCHASE/ADMIN_GIFT, sourceId và chứng cứ điểm/tiền/quyền tặng đã được kiểm tra. Client không được tự dùng endpoint này để cấp gói.

1. Chống lặp theo sourceType+sourceId và command key. Kết quả cũ được replay trước kiểm tra version/trạng thái đã thay đổi.
2. Với thao tác mới, khóa User, gate plan nếu cần, Wallet nếu có debit, rồi MembershipSlot/terms.
3. Nếu có term active/scheduled của **planId khác trong cùng membershipScope**, trả ACTIVE_PLAN_CONFLICT. Không trừ điểm/gia hạn A khi user chọn B. Nếu tiền đã nhận trước khi phát hiện conflict thì giữ receipt và chuyển đối soát theo flow 08, không rollback mất tiền nhận.
4. Nếu cùng planId: tạo term mới ở `max(now, endsAt cuối của các term còn hợp lệ)`; giữ snapshot của revision vừa nhận. Không gộp vào term cũ rồi vô tình đổi quyền lợi kỳ hiện tại.
5. Nếu không còn term hợp lệ: startsAt=now, endsAt=startsAt+durationDays theo revision được chấp nhận.
6. Lưu grant source unique, term, audit và response atomic với debit/activation liên quan. UTC, khoảng hiệu lực `[startsAt, endsAt)`.

Danh sách hiển thị phân biệt **gói đang có hiệu lực** với **kỳ đã gia hạn, chờ hiệu lực**. Giá/điểm có thể trả hôm nay nhưng quyền lợi revision mới chỉ áp khi term mới bắt đầu. Cần nói rõ trước xác nhận mua/đổi/tặng.

Các flow cũ mô tả “gia hạn endDate” vẫn giữ ý nghĩa thời gian cùng gói; khi triển khai shared activation mới, việc lưu term thay cho mutate một dòng endDate là hợp đồng mới. Cập nhật gift flow 04 cùng service, không để gift tiếp tục sửa lịch sử trong khi redeem/purchase append term.

## 5. Backend — CRUD cấu hình và kiểm tra quyền

### 5.1. Create

1. ADMIN principal, DTO validation tên/type/số ngày/phương thức/giá/quyền lợi.
   DTO mới phải có validator liên trường cho flags/price/requiredPoints: thay `@NotNull price` vô điều kiện của DTO cũ bằng quy tắc bắt buộc giá khi bật mua tiền, tương tự điểm khi bật redeem. Khi tắt phương thức, null là hợp lệ theo hợp đồng mới; không giữ annotation cũ rồi khiến form đúng vẫn bị backend từ chối.
2. Server resolve membershipScope từ type được hỗ trợ; không tin một scope client tự khai để tránh xung đột gói.
3. Chuẩn hóa tên/tiền/điểm và kiểm tra uniqueness theo identity chính sách; không tự đổi currency khác VND.
4. Trong transaction: tạo catalog và immutable revision đầu, audit, trả planVersion + fields đầy đủ + capabilities/publish issues.
5. Notification nếu có sau commit. API lỗi không trả thông báo thành công.

### 5.2. Update, disable, enable

1. GET bản hiện tại; request update kèm planVersion và idempotency key cho thao tác quản trị nếu retry.
2. Lookup key/hash trước version; thao tác mới khóa catalog, kiểm tra role/version, validate toàn payload.
3. Tạo revision mới rồi đổi latest pointer, ghi lịch sử before/after. Hai admin cùng sửa một version chỉ một người thắng; người còn lại nhận 409.
4. Không đổi planId/type/scope của plan đã có grants để biến thành gói khác; tạo plan mới nếu thay identity. Giá, số ngày và benefits mới chỉ áp cho lượt nhận revision mới.
5. Disable chỉ chặn nhận mới. Không xóa các term/receipt đã cấp. Enable trở lại phải validate capability và dữ liệu đầy đủ.
6. Không hard-delete plan có revision/term/purchase tham chiếu. Không tự vô hiệu pending purchase đã được khách chấp nhận trong deadline; xử lý theo flow 08. Nếu có recall thật phải có claim/reason, vô hiệu hóa link và đối soát riêng.

### 5.3. Query cho user và admin

- Admin xem cả active/inactive/draft và lịch sử revision, không chỉ CUSTOMER khi hệ thống còn hỗ trợ CUSTOMER_VIP.
- User nhận danh sách plan active hỗ trợ scope/role đúng, cùng durationDays, price/requiredPoints, flags và capability canBuy/canRedeem. Gói gift-only không giả thành mua 0đ; chỉ hiển thị ở catalog nhận mới nếu chính sách muốn cho xem, không hiện nút nhận miễn phí.
- Membership summary trả currentTerm, scheduledTerms, totalRegisteredUntil, benefits đang hiệu lực, quota còn lại và serverTime.
- Hết hạn dùng now so với startsAt/endsAt; scheduled không được tính active chỉ vì isActive=true. Query repository hiện chỉ lọc endDate phải cập nhật thêm startsAt và lifecycle.
- CUSTOMER/CUSTOMER_VIP legacy: map membershipScope theo nghiệp vụ đã xác minh, không tự gộp/xóa các grants trùng. Nếu đang có hai gói chồng lấn thì đánh dấu cần đối soát.

## 6. Thực thi quyền lợi trong order và báo giá

### 6.1. Discount do server tính

1. Pricing service đọc currentTerm có hiệu lực, không đọc latest catalog để áp cho khách đã mua revision cũ.
2. Xác định scope MARKETPLACE/CUSTOM, cơ sở tính hợp lệ và min subtotal. Mặc định discount chỉ trên giá hàng/sản xuất, không giảm phí ship hai lần.
3. Tính discount với BigDecimal, áp cap và quy tắc làm tròn thống nhất. Snapshot termId, revision, rule và số tiền vào order/quote.
4. Bản đầu đề xuất không stack giảm subscription và voucher ngoài chính sách; server trả lý do/ưu đãi được chọn. Không để FE tự cộng các phần trăm.
5. Marketplace preview chỉ là dự kiến; tại checkout khóa/kiểm tra lại quyền lợi và giá trước giữ tồn/tạo đơn. Nếu term vừa hết hạn thì trả BENEFIT_CHANGED/PRICE_CHANGED và chờ khách xác nhận lại.
6. Custom quote lưu rule/term làm cơ sở nhưng quyền lợi còn phải hợp lệ khi accept; hạn quote không vượt quá hạn benefit cần dùng. Khi benefit thay đổi/hết hạn trước accept phải báo lại hoặc tạo bản tổng mới để khách duyệt, không tự tăng tiền lúc thu.
7. Sau accept/checkout hợp lệ, tổng đã chốt được giữ trong deadline thanh toán. Term hết hạn giữa lúc thanh toán không được đổi amount của snapshot/link đang sống.

### 6.2. Lượt miễn/giảm ship có quota

1. Preview không tiêu quota. Custom QUOTED chưa accept không giữ quota vô thời hạn.
2. Checkout marketplace hoặc accept custom claim một allocation duy nhất từ term theo thứ tự khóa; kiểm tra `CONSUMED + mọi RESERVED chưa được release có thẩm quyền < freeUsesPerTerm`. Không bỏ một RESERVED khỏi phép đếm chỉ vì timestamp đã qua trong khi đơn/payment chưa được giải quyết.
3. Dùng User/membership/usage lock hoặc conditional atomic claim để hai order đồng thời không cùng dùng lượt cuối. allocation gắn business order/snapshot/idempotency.
4. Bản đầu đề xuất CONSUMED khi admin bắt đầu PREPARING của đơn đủ điều kiện. PAYOS còn chờ tiền có thời hạn dự kiến theo paymentDueAt, nhưng quota chỉ release khi cancel/expire order được backend finalize sau đối chiếu gateway. Khi nhận SUCCESS hợp lệ, RESERVED được giữ bền cho order (bỏ payable TTL), đến PREPARING mới CONSUMED. COD đã được khách xác nhận cũng giữ RESERVED không có TTL của PAYOS; không tự trả lượt trong lúc đợi admin xử lý.
5. Hủy/hết hạn hợp lệ trước PREPARING release RESERVED đúng một lần; sau PREPARING không tự hoàn lượt chỉ vì có refund. Chính sách bồi hoàn lượt nếu có là adjustment có audit riêng.
6. Nếu hủy sau khi đã trả tiền nhưng trước PREPARING cần flow hủy/refund được phê duyệt; release chỉ sau xác nhận command, không chỉ từ query cancel của browser.
7. Không restore quota khi mở link khác, renew cùng gói hoặc sửa plan. Term mới có quota riêng và chỉ dùng sau startsAt.

### 6.3. Ưu tiên gia công

Custom order nhận priority snapshot khi accept, có term/rule nguồn. Đề xuất deadline quyền lợi được chốt theo thời điểm accept, nên không tự đảo thứ tự order đã được chấp nhận khi term hết hạn ngày hôm sau.

Hàng đợi admin/scheduler phải dùng priorityEnabled kết hợp createdAt/FIFO theo policy có kiểm thử; không cho FE tự truyền mức priority. Nếu scheduler chưa hỗ trợ thì chặn publish quyền lợi này, không quảng bá “ưu tiên” chỉ bằng một badge.

## 7. Khóa và transaction dùng chung

Catalog CRUD khóa Plan, không giữ rồi chờ User/order. Thao tác nhận gói khóa User → Plan gate nếu cần → Wallet nếu có điểm → MembershipSlot → terms/usage. Không có đường giữ User/Wallet rồi quay lại lấy khóa existing Order/Purchase/Payment.

Nếu đang xử lý order/purchase: root → Payment → Attempt → reservation/products nếu có → User → Plan gate nếu cần → Wallet nếu có → membership/terms/usage. Các bước không cần tài nguyên có thể bỏ qua, nhưng không đảo thứ tự. Flow tạo order mới dùng các row chưa commit theo kế hoạch inventory; mọi writer wallet cũng dùng User → Wallet.

Không giữ transaction qua gateway. Nếu sau commit cần tạo link/thông báo thì dùng orchestration và outbox; lưu việc claim quota/activation/debit cùng idempotent result đúng transaction, không trả thành công khi chỉ tạo được phần đầu.

## 8. API đề xuất và payload đầy đủ

Giữ route admin đã có để tương thích hoặc version sang route thống nhất. Ví dụ route đề xuất `POST /api/admin/subscriptions/plans`, update `PUT /api/admin/subscriptions/plans/{id}`; nếu còn `/customer` thì phải có adapter/type handling rõ và không bỏ qua fields mới.

```json
{
  "idempotencyKey": "uuid-admin-save",
  "planVersion": 3,
  "type": "CUSTOMER",
  "name": "Hoi vien 60 ngay",
  "description": "Uu dai in 3D va giao hang",
  "durationDays": 60,
  "allowMoneyPurchase": true,
  "price": 99000,
  "allowPointRedemption": true,
  "requiredPoints": 300,
  "allowAdminGift": true,
  "isActive": true,
  "benefits": {
    "discount": {
      "percent": 10,
      "appliesTo": ["MARKETPLACE", "CUSTOM"],
      "minEligibleSubtotal": 0,
      "maxDiscountAmount": 50000
    },
    "shipping": {
      "freeUsesPerTerm": 2,
      "maxDiscountAmountPerUse": 30000,
      "appliesTo": ["MARKETPLACE", "CUSTOM"]
    },
    "production": { "priorityEnabled": true, "appliesTo": ["CUSTOM"] }
  }
}
```

Create không cần planVersion của record chưa tồn tại; update cần version đã đọc. Response trả planId/version và chính dữ liệu đã lưu, không chỉ message; FE render summary từ response.

| Mã lỗi gợi ý | FE xử lý |
| --- | --- |
| INVALID_DURATION / INVALID_MONEY / INVALID_POINT_COST | Gắn lỗi đúng input, không lưu |
| NO_ACQUISITION_METHOD | Chọn ít nhất một cách nhận trước publish |
| BENEFIT_NOT_SUPPORTED / INVALID_BENEFIT_POLICY | Giữ draft, nêu quyền lợi chưa thực thi hoặc giới hạn sai |
| PLAN_VERSION_CONFLICT | Tải revision mới, giữ draft để so sánh, không overwrite im lặng |
| ACTIVE_PLAN_CONFLICT | Khi nhận gói khác scope đang hoạt động; không debit/activation sai |
| PLAN_INACTIVE / METHOD_DISABLED | Nút mua/đổi/tặng cập nhật từ capability, không đoán từ giá 0 |
| BENEFIT_CHANGED / BENEFIT_QUOTA_EXHAUSTED | Tải tổng mới trước xác nhận order/quote, không tự thu thêm tiền |

## 9. Frontend — form, card và hiệu lực thật

### 9.1. Admin form

1. Model PlanForm có đủ field mục 3; không còn price='0' ẩn hoặc card luôn 30 ngày.
2. Nhóm thông tin: tên/type/mô tả; số ngày; giá tiền + checkbox bật; giá điểm + checkbox bật; cho tặng; trạng thái.
3. Nhóm quyền lợi: % giảm/phạm vi/cap/min; số lượt ship/cap/lượt; ưu tiên gia công. Dùng label đúng nghĩa, không gom tất cả vào textarea.
4. Trường disabled được gửi null/giá trị được normalize theo contract; không gửi các số cũ vô tình kích hoạt quyền lợi. Server vẫn validate.
5. Preview trước lưu: “60 ngày, 99.000đ hoặc 300 điểm, giảm 10% tối đa 50.000đ, 2 lượt ship mỗi kỳ tối đa 30.000đ/lượt”. Không tự hứa miễn ship không giới hạn.
6. Thông báo rõ sửa chỉ áp lượt nhận mới, không đổi kỳ đã cấp. Publish nếu backend xác nhận capability hỗ trợ; các quyền lợi chưa hỗ trợ chỉ giữ draft.
7. Capture payload/version khi bấm, disable đang gửi; success theo response thật. Conflict/network unknown giữ draft và key để kiểm tra/retry, không hiện thành công vô điều kiện.
8. Có bật/ngừng lại rõ ràng, xem revision lịch sử và actor; không hard delete plan có khách đang dùng.

### 9.2. User card và membership

- Card đọc durationDays thật, price khi allowMoneyPurchase, requiredPoints khi allowPointRedemption; CTA theo capability và reason server.
- Nội dung quyền lợi render từ structured benefits; description không được trình bày như một quyền lợi thực thi nếu không có rule tương ứng.
- Membership hiển thị currentTerm, quyền lợi/quota đang dùng, scheduledTerms và tổng hạn đã đăng ký. Không áp quyền lợi của kỳ mới trước startsAt.
- Không suy VIP từ role ADMIN hoặc field subscriptionType tự dựng trong FE. AuthContext chứa role không phải entitlement engine.
- Profile, subscription và checkout dùng cùng query nguồn; refresh sau redeem/purchase/gift hoặc khi focus, không hứa realtime đa thiết bị khi chưa có push.

### 9.3. Các màn đặt hàng

- CartPage/CustomRequests/quote details đọc breakdown/benefit snapshot server. Không tự tính giảm 15% hardcode rồi gửi tổng để BE tin.
- Phí/điểm/tổng thay đổi khi user đổi địa chỉ, quantity hoặc benefit hết hạn phải preview/quote lại trước xác nhận.
- Popup giữ nguyên nội dung; adapter chỉ hiển thị dữ liệu hiện có, không cấp quyền lợi hoặc tạo một tổng chung để checkout hai loại.
- Menu Giỏ hàng và hai tab vẫn cùng store; subscription feature không tạo thêm cart/storage riêng.

## 10. Migration dữ liệu và tương thích

1. Add schema/version/revision/terms/usage trước, giữ cột benefits String legacy để đọc lịch sử.
2. Với plan cũ, durationDays=30 chỉ vì service hiện tại đã dùng 30; ghi migration provenance. Không đổi ngày hết hạn thực tế user đã có thành now+30.
3. price=0/null cũ không tự cho nhận miễn phí: mặc định allowMoneyPurchase=false. requiredPoints>0 có thể map redeem=true sau kiểm tra; null/0 map false. Gift bật theo chính sách hiện hành đã xác minh.
4. Không parse câu “giảm 15%, miễn ship” thành policy tự chạy. Chuyển chuỗi cũ sang description; structured benefits mặc định không áp cho đến khi admin xác nhận. Hiển thị thông tin cần hoàn thiện thay vì hứa quyền lợi chưa triển khai.
5. UserSubscription cũ tạo term từ startDate/endDate hiện có, tham chiếu revision/snapshot có chứng cứ; không invent grant source purchase hoặc nhận tiền khi chưa có receipt.
6. Gói cũ bị chỉnh mô tả nhiều lần không có lịch sử thì đánh dấu snapshot cần xác minh; không khẳng định biết chính xác quyền lợi đã bán.
7. CUSTOMER_VIP/các gói chồng lấn cần kiểm kê. Không gom/xóa làm mất thời gian đã nhận. Read model legacy có thể tiếp tục hiển thị để đối soát, block nhận mới xung đột.
8. Các DTO `benefits: string` cũ không được bị đổi thành object âm thầm cho client cũ. Version API hoặc adapter có trường description/structuredBenefits rõ trước khi cutover contract mới.
9. Gift flow 04, redeem và purchase cùng chuyển sang term activation; không để một path còn mutate endDate phá lịch sử.

## 11. Trình tự triển khai và rollback

1. Chặn lời hứa/giá giả hiện tại: bỏ hardcode UI 30 ngày/0đ/15% làm nguồn có thẩm quyền; chỉ render dữ liệu thật hoặc trạng thái chưa cấu hình.
2. Schema/catalog revisions + shared ActivationService/WalletService contract. Viết tests policy/validation/terms trước nối các cách nhận.
3. Backend CRUD/list/summary/capabilities, benefit pricing/quota service; chỉ bật quyền lợi đã được server thực thi.
4. Triển khai redeem 07 và gift04 theo shared activation; purchase08 dùng snapshot/revision/payment chuẩn; reward06 đọc net snapshot nhất quán.
5. FE admin form/card/detail, user acquire/membership, order/quote pricing và shared query invalidation.
6. Migration thử trên bản sao DB, kiểm tra active/future intervals, giá đã thu, quota và dữ liệu legacy. Bật feature flag đồng bộ BE/FE.
7. Theo dõi version conflicts, activation duplicate, overlapping terms, quota race và pricing mismatch. Rollback tắt nhận/publish mới nhưng vẫn đọc/verify/đối soát các snapshot đã phát hành.

Không rollback bằng cách xóa revision/term/receipt hoặc áp latest benefits vào mọi user để “đồng bộ”.

## 12. Ma trận kiểm thử và nghiệm thu

| Ca | Kết quả phải đạt |
| --- | --- |
| Tạo gói 7/30/60 ngày | Lưu/hiện đúng ngày, activation dùng duration snapshot |
| Money bật nhưng 0/null/âm hoặc scale sai | Validation lỗi, không publish/mua miễn phí |
| Redeem bật nhưng điểm 0/null/lẻ | Validation lỗi, không trừ/cấp gói |
| Hai phương thức tắt, gift bật | Gift-only đúng; user không có CTA nhận 0đ |
| Tất cả phương thức tắt | Chỉ draft/inactive, không publish active |
| Hai admin update cùng version | Một success, một conflict không mất bản mới |
| Sửa giá/duration/benefits khi khách đang có term | Kỳ hiện tại giữ snapshot cũ; kỳ nhận mới dùng revision mới |
| Gia hạn cùng plan revision mới | Append future term, không áp sớm quyền lợi/không reset quota cũ |
| Chọn B khi có A active/future cùng scope | Conflict, không trừ điểm/gia hạn A |
| Một lượt ship cuối, hai order đồng thời | Chỉ một allocation thành công; order kia preview lại |
| PAYOS đã SUCCESS/COD đã xác nhận, admin chưa PREPARING khi deadline QR cũ qua | RESERVED vẫn giữ/count đúng lượt; không cho order khác tái dùng |
| Hủy/retry trước PREPARING | Release reserved quota đúng một lần |
| PREPARING/refund/callback lặp | Không tự hoàn lượt hoặc nhận quyền lợi hai lần |
| Term hết hạn trước accept, sau accept trước trả tiền | Trước accept báo lại; snapshot accept hợp lệ giữ tổng trong deadline |
| Priority chưa có engine | Chặn publish quyền lợi; không chỉ thêm badge |
| ADMIN/user thường chưa có gói | Không tự có giảm giá chỉ vì role |
| Legacy price0/benefits String | Không tự free purchase/không parse thành policy |
| Date boundary startsAt/endsAt UTC | Chỉ current term hưởng quyền lợi, không scheduled/expired |
| Cash SUCCESS + gift/redeem đồng thời | Shared activation serialize, không term chồng/lost grant |

- [ ] Form admin đủ tên, loại, số ngày, giá tiền, giá điểm, cách nhận, trạng thái và quyền lợi thực thi.
- [ ] Backend/DTO/FE cùng contract; không còn field chỉ hiển thị nhưng không lưu hoặc lưu mà không áp.
- [ ] Active và scheduled terms rõ ràng, revision không sửa ngược quyền lợi khách đã nhận.
- [ ] Buy/redeem/gift cấp đúng plan, đúng thời lượng, đúng một lần theo source.
- [ ] Discount/ship/priority hoạt động phía server và có audit/quota; frontend không tự cấp quyền lợi.
- [ ] Dữ liệu cũ bảo toàn; popup và màn giỏ hai tab đúng ràng buộc đã chốt.

Các tests/checklist là kế hoạch khi triển khai, không phải kết quả đã chạy trong lần viết tài liệu này.
