# Flow sửa 04 — Admin tặng subscription: phản hồi đúng kết quả BE → FE

Ngày: 26/10/2026. Đây là đặc tả triển khai, chưa thay đổi code tính năng và chưa xác minh bằng giao dịch API thật.

Phạm vi chính: sửa lỗi API tặng thất bại nhưng UI vẫn báo thành công. Các phần validation, trả kết quả thật và chống retry trùng bên dưới bảo đảm thông báo thành công phản ánh đúng một lần cấp gói đã commit. Không triển khai lại toàn bộ cơ chế quyền lợi/giảm giá subscription trong tài liệu này.

Tham chiếu: [Kế hoạch tách giỏ/order](./PLAN_SPLIT_MARKETPLACE_CUSTOM_CART_ORDER.md), [Rà soát lỗi hiện tại](./REVIEW_ORDER_SUBSCRIPTION_BULK_2026-10-26.md). Thay đổi này không đụng popup giỏ hàng, hai tab giỏ hoặc nút giỏ trên menu.

## 1. Bằng chứng trong mã nguồn hiện tại

Các đường FE tính từ `D:/semester 7/EXE/exe202-printhub3d-fe/`; đường BE tính từ `D:/semester 7/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d/`.

| File / phương thức thực tế | Hành vi hiện tại | Hệ quả |
| --- | --- | --- |
| FE `exe-fe/src/features/subscriptions/SubscriptionPanel.tsx`, `handleGiftPlan` | `await action.run(...)` rồi `alert(...thành công)` vô điều kiện | API reject vẫn chạy alert thành công |
| FE `exe-fe/src/hooks/useRemote.ts`, `useAction.run` | Bắt exception, đặt error và trả `false`; thành công trả `true`, không trả payload API | Caller không thể dựa vào việc await xong để kết luận thành công |
| FE `exe-fe/src/utils/singleFlight.ts`, `createSingleFlight` | Request chồng nhau bị trả `false` ngay | Lần bấm bị bỏ qua cũng không được hiện thông báo tặng thành công |
| FE `exe-fe/src/services/api.ts`, `send/unwrap` | Unwrap `result`; timeout Axios 30 giây | Caller cần typed response; timeout không chứng minh server chưa cấp gói |
| BE `controller/UserSubscriptionController.java`, `giftSubscription` | Có `@PreAuthorize("hasRole('ADMIN')")`, trả 201 với `UserSubscriptionResponseDTO` | Quyền admin đã có; không bỏ guard khi sửa UI |
| BE `controller/api/UserSubscriptionAPI.java` | POST `/api/admin/subscriptions/gift`, `@Valid` request | FE gọi `/admin/subscriptions/gift` vì wrapper đã có `/api` |
| BE `dto/subscription/GiftSubscriptionRequestDTO.java` | userId, planId bắt buộc; reason không rỗng | Hiện chưa có khóa chống tặng trùng khi retry |
| BE `service/impl/UserSubscriptionServiceImpl.java`, `giftSubscription` | Khóa user, kiểm tra gói active, user role USER, type CUSTOMER/CUSTOMER_VIP; gọi activation trong transaction | Cần phân biệt thất bại trước commit và kết quả commit nhưng mất response |
| BE `processSubscriptionActivation` | Tìm subscription theo loại; nếu có thì chỉ gia hạn endDate, không đổi planId | Đang có A, tặng B cùng type có thể trả lại A; UI không được báo đã nhận B |

Response DTO hiện có: `subscriptionId`, `userId`, `username`, `planId`, `planName`, `planType`, `startDate`, `endDate`, `isActive`. Tên user của dropdown là dữ liệu FE, còn thời hạn/gói được cấp phải đọc từ response thật.

## 2. Hành vi phải đạt sau sửa

| Tình huống | UI đúng | Có được bấm tặng lại không? |
| --- | --- | --- |
| Admin hủy hộp xác nhận | Không gửi request, không thông báo thành công/lỗi API | Có, như một thao tác mới |
| Chưa chọn người nhận/gói không hợp lệ | Hiện validation tại chỗ | Sau khi sửa dữ liệu |
| 201 và response khớp người/gói đã xác nhận, đã commit | Hiện “Đã tặng/gia hạn gói … cho …, đến …” từ kết quả thật | Có, nhưng lần tặng mới cần xác nhận mới và requestId mới |
| 400/403/404/409 được BE xác nhận chưa có tác động | Hiện lỗi tương ứng, không hiện thành công | Sau khi sửa lỗi/refresh dữ liệu; nếu payload thay đổi dùng requestId mới |
| Double-click trong khi request đang chạy | Chỉ một mutation; lần bấm bị bỏ qua không có toast thành công thứ hai | Đợi kết quả |
| Timeout/mất kết nối/5xx chưa rõ commit | “Chưa xác định kết quả. Kiểm tra yêu cầu trước khi thử lại.” | Chỉ kiểm tra/replay **cùng requestId**, không tự sinh khóa mới |
| 2xx nhưng thiếu payload hoặc trả plan/user khác | “Kết quả không khớp yêu cầu, cần kiểm tra”; không xác nhận tặng gói được chọn | Không tự tặng lại; đối chiếu theo requestId |
| Đã cấp gói thành công, sau đó refresh danh sách lỗi | Giữ thông báo cấp gói thành công, báo lỗi tải lại riêng | Nút tải lại chỉ GET; không gọi POST tặng lần nữa |

## 3. Ràng buộc BE cần chốt trước FE

Khi triển khai đầy đủ subscription theo [flow 09](./FLOW_FIX_09_ADMIN_SUBSCRIPTION_CONFIGURATION.md), gift cũng dùng chung plan revision, durationDays, allowAdminGift và SubscriptionTerm với redeem/purchase. Cùng planId gia hạn bằng append term có snapshot; mô tả cộng endDate của bản sửa nhanh bên dưới chỉ là tương thích với storage cũ, không được sửa quyền lợi của kỳ hiện tại. Success/error/unknown và chống lặp ở tài liệu này vẫn áp dụng, response cần adapter/version cho term mới.

### 3.1. Một yêu cầu thành công phải có nghĩa cụ thể

Với phạm vi sửa hiện tại, chọn quy tắc an toàn sau cho thao tác gift:

1. Không có gói đang active cùng loại: tạo subscription với chính planId được chọn.
2. Đang có **chính planId đó**: gia hạn gói đó theo thời lượng hiện hành; response nói rõ `EXTENDED` và endDate trước/sau.
3. Đang có **planId khác nhưng cùng type**: trả 409 `ACTIVE_PLAN_CONFLICT`, không gia hạn A khi admin yêu cầu B. Admin phải xử lý chuyển gói qua flow được đặc tả riêng, không âm thầm thay thế hoặc mất thời hạn cũ.
4. Dữ liệu có nhiều subscription active xung đột cùng type: trả lỗi cần đối soát thay vì lấy tùy ý một bản ghi.

Không sửa chung `processSubscriptionActivation` rồi vô tình đổi hành vi redeem khi chưa có test. Có thể tách policy activation cho gift hoặc dùng service chung với policy tường minh; kiểm tra ảnh hưởng các caller.

Thời lượng 30 ngày là giá trị hiện tại của service, không để FE tự cộng ngày. `endDate` thành công lấy từ BE; khi chuẩn hóa thời gian nên trả timestamp có offset/UTC. Nếu còn dùng LocalDateTime legacy, thống nhất múi giờ ứng dụng và không tự suy đoán thời hạn ở FE.

### 3.2. Validation và quyền

- Giữ `@PreAuthorize` ở controller và method security. actor lấy từ phiên đăng nhập, không nhận adminId do client tự khai.
- DTO validate UUID, reason không trắng và giới hạn độ dài phù hợp; `requestId` UUID bắt buộc khi bật hợp đồng mới.
- Xác thực người nhận còn tồn tại, có role USER và đang active. FE chỉ lọc dropdown để hỗ trợ, BE quyết định cuối.
- Gói tồn tại, active và thuộc loại được phép tặng. Khóa/kiểm tra version gói nếu có thể bị vô hiệu hóa đồng thời; không chỉ dựa trên bản đọc cũ.
- Tặng gói không trừ điểm user. Không ghi một giao dịch REDEEM giả để biểu diễn quà tặng.
- Ghi actor, người nhận, plan, lý do, requestId, kết quả create/extend và thời hạn trước/sau trong audit có thể truy vết.
- Quyền xem kết quả request phải kiểm tra actor/phạm vi được cấp; không trả thông tin subscription cho user thường biết requestId.

## 4. BE — flow transaction và chống lặp

### 4.1. Bản sửa nhanh để chặn thông báo sai

Không cần chờ migration chống retry mới sửa FE kiểm tra `action.run` boolean. BE hiện có thể giữ response `UserSubscriptionResponseDTO`; bổ sung guard planId cùng type nêu trên và trả đúng HTTP lỗi là phần bảo đảm ngữ nghĩa.

Bản nhanh **chưa giải quyết** việc timeout rồi admin gửi lại làm gia hạn hai lần. UI phải cho biết kết quả chưa rõ và không khuyến khích bấm tặng mới khi chưa kiểm tra.

### 4.2. Bản hoàn chỉnh đề xuất

Giữ endpoint POST hiện có, bổ sung requestId trong body; đây là trường **đề xuất**, chưa có trong DTO hiện tại.

```json
{
  "requestId": "11111111-1111-4111-8111-111111111111",
  "userId": "22222222-2222-4222-8222-222222222222",
  "planId": "33333333-3333-4333-8333-333333333333",
  "reason": "Tri an khach hang"
}
```

Thêm ledger/command gift, tối thiểu:

```text
SubscriptionGiftCommand
  actorId + requestId     UNIQUE
  requestHash             userId, planId, reason đã normalize
  userId / requestedPlanId / subscriptionId
  resultSnapshot          kết quả đã commit, không tính lại ngày khi replay
  createdAt / completedAt
```

Trong một transaction database cho thao tác mới:

1. Sau xác thực actor, tra/claim khóa `(actorId, requestId)` **trước khi** kiểm tra trạng thái user/gói có thể đã thay đổi sau lần thành công trước.
2. Key đã hoàn tất và hash khớp: trả kết quả cũ, không kích hoạt/gia hạn thêm. Hash khác: 409 `IDEMPOTENCY_CONFLICT`.
3. Hai request cùng key đồng thời: unique claim bảo đảm chỉ một request thực hiện; request còn lại chờ có giới hạn hoặc nhận “đang xử lý” rồi GET kết quả. Không trả 201 giả khi chưa có kết quả.
4. Khóa tài nguyên theo một thứ tự nhất quán giữa các đường gift/redeem/quản trị gói. Kiểm tra user/plan và active subscription, áp dụng policy cùng plan/khác plan.
5. Tạo/gia hạn đúng một subscription; lưu audit và resultSnapshot trong cùng transaction với mutation. Không lưu command COMPLETED nếu activation rollback.
6. Commit rồi trả response. Notification nếu bổ sung dùng after-commit/outbox; notification lỗi không làm UI hiểu gift thất bại rồi tặng lại.
7. Lỗi nghiệp vụ phải rollback toàn bộ thay đổi subscription. Không trả 2xx với message thành công khi bắt exception.

Không gọi dịch vụ ngoài/HTTP trong transaction này. Nếu bổ sung gửi email thì gửi sau commit; không biến thời gian gửi email thành điều kiện cấp gói thành công.

### 4.3. Kết quả request và lỗi không rõ

Endpoint đề xuất `GET /api/admin/subscriptions/gift-requests/{requestId}` trả kết quả của actor được phép. Nếu response POST bị mất sau commit, GET/replay cùng requestId lấy lại đúng snapshot.

Nếu GET chưa thấy record, **chưa đủ bằng chứng thao tác không chạy**: transaction đầu có thể chưa commit. UI có thể thử lại cùng key dưới cơ chế serialize của BE. Không hướng dẫn admin tạo requestId mới chỉ vì GET 404 hoặc request đầu timeout.

Đề xuất result wrapper:

```json
{
  "code": 201,
  "message": "Phat goi thanh cong",
  "result": {
    "requestId": "11111111-1111-4111-8111-111111111111",
    "operation": "CREATED",
    "subscription": {
      "subscriptionId": "44444444-4444-4444-8444-444444444444",
      "userId": "22222222-2222-4222-8222-222222222222",
      "planId": "33333333-3333-4333-8333-333333333333",
      "planName": "Goi hoi vien A",
      "planType": "CUSTOMER",
      "startDate": "2026-10-26T09:00:00+07:00",
      "endDate": "2026-11-25T09:00:00+07:00",
      "isActive": true
    }
  }
}
```

`operation=EXTENDED` có thể kèm previousEndDate. Replay có thể trả 200 cùng resultSnapshot và cờ replayed; FE không cần dựa duy nhất vào HTTP 201 để phân loại thành công. Envelope ví dụ là hợp đồng đề xuất; khi triển khai phải version/adapter cho DTO phẳng hiện tại để không làm hỏng caller cũ.

| HTTP / code đề xuất | Nghĩa |
| --- | --- |
| 400 `INVALID_GIFT_REQUEST` | UUID/reason/requestId hoặc loại gói không hợp lệ |
| 403 `GIFT_FORBIDDEN` | Actor không có quyền |
| 404 `GIFT_TARGET_NOT_FOUND` / `PLAN_NOT_FOUND` | Người/gói không tồn tại |
| 409 `PLAN_INACTIVE` / `TARGET_INACTIVE` | Dữ liệu thay đổi, không còn đủ điều kiện |
| 409 `ACTIVE_PLAN_CONFLICT` | Đang có gói khác cùng loại; không có mutation |
| 409 `IDEMPOTENCY_CONFLICT` | Cùng key với payload khác |
| 202 `GIFT_IN_PROGRESS` | Chưa hoàn tất, không hiển thị thành công |

Các mã trên chưa phải enum hiện có; cần map error handler nhất quán. Không gửi HTTP 200 cho failure nghiệp vụ. Nếu còn API legacy 200 nhưng envelope code là lỗi, gift service FE phải phát hiện và reject, không chỉ unwrap mù.

## 5. FE — sửa tối thiểu an toàn, không phá helper chung

### 5.1. Nguyên tắc trong handleGiftPlan

1. Kiểm tra người nhận tồn tại trong dữ liệu đã tải và đúng role USER; không chỉ `role !== ADMIN`. Hiển thị lỗi tải user nếu không có dữ liệu.
2. Chụp snapshot `userId/userName/planId/planName/reason` **trước** confirm và trước await. Mọi validation response/toast dùng snapshot của lần đó, không dùng dropdown mới đã đổi.
3. Nếu confirm bị hủy thì return. Khi gửi, disable nút gift và điều khiển chọn người/gói của thao tác đó; guard single-flight vẫn cần vì React render không đồng bộ tức thời.
4. Xóa thông báo thành công của lần trước ngay khi bắt đầu một thao tác mới.
5. Chỉ báo thành công nếu `action.run(...) === true` và response được kiểm tra khớp người/gói/thời hạn.
6. Nếu response khác user/plan hoặc thiếu subscriptionId/endDate: không xác nhận đã tặng gói chọn; lưu requestId, hiển thị cần kiểm tra và chặn retry với key mới.

Pseudocode cho DTO hiện tại và useAction boolean:

```ts
const captured = captureGiftSelection();
if (!captured.valid || !confirmGift(captured)) return;

let actual: GiftSubscriptionResponse | undefined;
const ok = await giftAction.run(async () => {
  const result = await giftApi.send(captured);
  assertMatches(result, captured.userId, captured.planId);
  actual = result;
});

if (!ok || !actual) return; // false cũng có thể là single-flight từ chối
showCommittedGift(actual, captured.userName);
invalidateRecipientMembership(actual.userId); // refresh tách khỏi kết quả POST
```

`GiftSubscriptionResponse`/giftApi/assertMatches là tên đề xuất. Nếu giữ helper hiện tại, assertion chạy **bên trong** action để lỗi vào Notice; nếu phải phân biệt kết quả chưa rõ thì giữ trạng thái riêng thay vì gom mọi lỗi thành “không tặng được”. Không đọc response từ `action.run` vì helper hiện tại chỉ trả boolean.

Không dùng chuỗi `plan.name` đang chọn làm bằng chứng gói được cấp. Response A khi yêu cầu B phải được coi là hợp đồng sai/cần đối chiếu, không toast “Đã tặng B”.

### 5.2. Có cần sửa useAction toàn hệ thống không?

Không bắt buộc. Có thể tạo `useGiftSubscription`/service riêng nhận typed payload và trả result; giữ nguyên các caller `useAction` khác.

Nếu muốn typed action chung, thiết kế rõ union:

```ts
type ActionResult<T> =
  | { kind: 'success'; data: T }
  | { kind: 'rejected'; error: DomainError }
  | { kind: 'unknown'; requestId: string; error: NetworkError }
  | { kind: 'busy' };
```

Không đổi return type helper toàn dự án trong một commit rồi để các caller cũ coi mọi object là truthy. Bổ sung adapter hoặc migrate/test từng caller; phạm vi lỗi này chỉ cần đúng flow gift.

### 5.3. Idempotency, timeout và lưu request đang chờ

- Tạo requestId một lần sau confirm và trước POST. Double-click hoặc retry kỹ thuật của cùng thao tác dùng lại key.
- Lưu tối thiểu requestId, actorId và fingerprint/payload cần replay vào trạng thái theo phiên admin; không để key pending bị mất chỉ vì component remount. Không cần lưu thông tin cá nhân không phục vụ kiểm tra.
- Timeout/mất mạng: trạng thái UI `unknown`; có nút **Kiểm tra kết quả** gọi GET status, không có toast thành công hoặc khẳng định chưa cấp gói.
- Nếu BE hỗ trợ replay an toàn, nút **Thử lại yêu cầu này** dùng cùng requestId và payload. Chỉ tạo khóa mới khi admin chủ động xác nhận một lần tặng mới sau khi lần trước đã được xác định.
- Nếu admin đổi tài khoản/quyền, hủy theo dõi response cũ và không hiện toast cho tài khoản mới. Backend vẫn là nơi xác nhận mutation đã xảy ra; abort request browser không rollback transaction.

### 5.4. Reload, cache và thông báo

- Dùng response thành công để hiển thị tên gói, người nhận và ngày hết hạn thật ngay, không chờ refresh.
- Invalidate dữ liệu membership của **người nhận**, lịch sử gift/admin nếu có. Danh sách plan không phải dữ liệu chính thay đổi khi tặng.
- `membership` hiện tại trong admin view dùng path null: `membership.reload()` ở admin không cập nhật membership của user được tặng. Nếu cần xem ngay trong admin phải thêm endpoint/query chi tiết người nhận có quyền, không gọi `/subscriptions/me` rồi tưởng đó là user khác.
- Khi người nhận tự mở trang hội viên, refetch theo server/focus để thấy gói mới. Nếu chưa có push thì không hứa “realtime đa thiết bị”.
- Refresh GET lỗi là một thông báo khác: “Đã cấp gói. Chưa tải lại được dữ liệu.” Không đổi thành gift thất bại, không lặp POST.
- Lỗi trả từ API hiển thị qua Notice/toast lỗi; không vừa error Notice vừa alert thành công.

## 6. File cần sửa khi triển khai

| Vùng | Công việc |
| --- | --- |
| BE `dto/subscription/GiftSubscriptionRequestDTO.java` | requestId, validate reason length và hợp đồng rõ |
| BE `controller/api/UserSubscriptionAPI.java`, `controller/UserSubscriptionController.java` | Giữ role guard; response/HTTP rõ, thêm GET kết quả nếu dùng |
| BE `service/impl/UserSubscriptionServiceImpl.java` | Policy đúng plan, transaction gift, idempotency/audit |
| BE entity/repository/migration command gift mới | Unique key, fingerprint và resultSnapshot atomic |
| BE exception handler/error enum | Map lỗi nghiệp vụ đúng status, không thành công giả |
| FE `features/subscriptions/SubscriptionPanel.tsx` | Kiểm tra ok/response, capture selection, không alert vô điều kiện |
| FE service/hook subscription mới hoặc hiện có | Typed response, phân loại unknown, replay/GET request |
| FE `hooks/useRemote.ts`, `utils/singleFlight.ts` | Giữ hợp đồng cũ nếu không cần; test boolean/busy để tránh caller hiểu sai |
| FE `services/api.ts` / adapter gift | Hiểu unwrap và HTTP/envelope; không thay global error semantics tùy tiện |

## 7. Ma trận kiểm thử

| Kiểm thử | Kết quả bắt buộc |
| --- | --- |
| Confirm cancel | Không POST, không success/error mới |
| POST trả 400/403/404/409 | Một thông báo lỗi đúng, không success, không gia hạn |
| Single-flight trả false vì đang chạy | Không gửi request thứ hai, không toast thành công thứ hai |
| 201 hợp lệ | Success dùng actual planName/endDate; đúng userId/planId; chỉ một grant |
| 201 thiếu result hoặc mismatch A/B | Không success cho B; chuyển cần kiểm tra; không tự POST lại |
| User đổi dropdown khi POST chậm | Toast vẫn gắn snapshot yêu cầu, không nói đã tặng cho lựa chọn mới |
| Timeout trước/ sau commit | UI unknown; GET/replay cùng key; tối đa một lần cấp/gia hạn |
| Hai POST đồng thời cùng key | Một mutation, cùng resultSnapshot hoặc pending; hash khác conflict |
| Success POST, GET refresh fail | Gift vẫn success; lỗi tải riêng; nút retry chỉ GET |
| User inactive/plan vừa deactivate | Server từ chối hoặc serialize hợp lệ, không dùng trạng thái FE cũ |
| Đang có A, tặng B cùng type | 409 ACTIVE_PLAN_CONFLICT, endDate A không tăng |
| Đang có A, tặng lại A với thao tác mới | EXTENDED đúng thời lượng server; replay key không cộng lần nữa |
| Transaction lỗi trước commit | Subscription/audit-result không ghi thành công một phần |
| Tài khoản admin thay đổi khi đang chờ | Không toast/lộ kết quả sang phiên khác; status query kiểm tra quyền |

Unit FE nên kiểm tra hành vi người dùng và request/notice, không chỉ mock lại điều kiện `if (ok)` của implementation. BE cần test integration uniqueness/transaction với hai request đồng thời để chứng minh chống grant trùng.

Các test subscription cũ đã được rà soát trước đây có mock `findById` trong khi service dùng `findLockedById`; khi triển khai cập nhật fixture theo dependency thật trước khi coi suite là bằng chứng. Tài liệu này không tuyên bố test đã chạy hoặc đã pass.

## 8. Trình tự phát hành và tiêu chí hoàn thành

1. Sửa FE success gate ngay, thêm test API failure và busy/cancel. Không chờ thay schema mới để chặn alert sai.
2. Sửa BE đúng plan/validation/HTTP và kiểm thử transaction; bổ sung response schema guard ở FE.
3. Thêm idempotency ledger và GET request-status, triển khai hợp đồng additive/adapter rồi chuyển FE sang chế độ unknown/replay.
4. Kiểm tra log/audit để truy vết một requestId; không log token hoặc payload thừa dữ liệu cá nhân.
5. Dữ liệu grant cũ không có requestId không tự suy ra đã cấp trùng. Chỉ đối soát những lần cần thiết; không tự trừ ngày user đã nhận.

Hoàn thành khi API lỗi/cancel/busy không bao giờ hiện thành công, success luôn khớp subscription đã commit, timeout không gây tặng trùng, và refresh lỗi không bị nhầm thành mutation lỗi. Không yêu cầu sửa giỏ hàng/popup hoặc tái thiết kế toàn bộ subscription để nghiệm thu flow này.
