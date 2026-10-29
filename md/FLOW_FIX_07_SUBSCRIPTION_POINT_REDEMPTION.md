# Flow 07 — Sửa đổi điểm lấy subscription từ BE đến FE

Ngày: 26/10/2026. Trạng thái: kế hoạch sửa dựa trên mã nguồn; chưa sửa tính năng, chưa chạy test cho flow mới.

Phạm vi: đổi đúng gói đã chọn, trừ điểm đúng một lần, không mất điểm khi lỗi/gói xung đột, snapshot giá điểm và quyền lợi, đồng bộ hội viên/ví/profile.

## 1. Hợp đồng dùng chung và hiện trạng

- [06 — Vòng đời điểm](./FLOW_FIX_06_REWARD_POINTS_LIFECYCLE.md) sở hữu wallet/ledger và quy tắc mọi writer dùng chung khóa.
- [08 — Mua bằng tiền](./FLOW_FIX_08_SUBSCRIPTION_CASH_PURCHASE.md) dùng cùng activation/term, không cấp một membership thứ hai khác nghĩa.
- [09 — Cấu hình subscription](./FLOW_FIX_09_ADMIN_SUBSCRIPTION_CONFIGURATION.md) sở hữu durationDays, price, requiredPoints, các cờ kênh và benefits có cấu trúc.
- [04 — Phản hồi admin gift](./FLOW_FIX_04_ADMIN_SUBSCRIPTION_GIFT_FEEDBACK.md) tiếp tục áp dụng success/error/idempotency; storage activation mới theo term ở tài liệu này thay chi tiết cộng endDate tại chỗ của flow cũ.

Đường BE dưới `D:/semester 7/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d/`; FE dưới `D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/`.

| Vị trí thực tế | Hiện trạng / lỗi |
| --- | --- |
| BE `service/impl/UserSubscriptionServiceImpl.redeemSubscription` | Đọc requiredPoints rồi trừ wallet, ghi REDEEM và activation trong transaction; chưa có idempotency cho retry |
| Cùng file `processSubscriptionActivation` | durationDays hardcode 30; tìm theo type rồi chỉ cộng endDate gói đang có, kể cả khách chọn gói khác |
| BE `repository/UserSubscriptionRepository.findActiveSubscriptionByUserAndType` | Dựa vào plan.type và endDate, không snapshot revision/benefits hoặc kiểm tra các term tương lai |
| BE `repository/PointWalletRepository` | Chưa có phương thức khóa wallet; redeem khóa User nhưng các writer điểm khác chưa chắc dùng chung quy tắc |
| BE `entity/User.java`, `getRewardPoints` | Trả số dư từ PointWallet; profile và membership phải cùng nguồn wallet |
| BE `getAvailablePlansForUser` | Chỉ lấy CUSTOMER, trong khi redeem/gift cũng chấp nhận CUSTOMER_VIP |
| FE `features/subscriptions/SubscriptionPanel.tsx` | Hiện requiredPoints và 30 ngày hardcode; confirm rồi POST redeem chỉ có planId; reload membership nhưng chưa bảo đảm profile/header cùng cập nhật |

Ví dụ lỗi: user có A/CUSTOMER còn hạn, chọn B/CUSTOMER tốn 500 điểm. Backend trừ 500 rồi gia hạn A, response vẫn là A; khách không nhận B.

## 2. Quy tắc đích phải chốt

1. Một thao tác đổi điểm cấp đúng planId và planVersion khách đã xem, cùng duration/benefits của immutable revision đó.
2. Mỗi lần cấp tạo **SubscriptionTerm bất biến** với sourceType=POINT_REDEMPTION và sourceId duy nhất; không sửa quyền lợi của term đang chạy.
3. Cùng planId: append term mới. startsAt = max(now, thời điểm kết thúc cuối đã cấp trong cùng membership scope), endsAt = startsAt + durationDays của revision được đổi lần này.
4. Khác planId đang active **hoặc đã có term tương lai** cùng scope: ACTIVE_PLAN_CONFLICT trước khi trừ điểm. Không gia hạn A thay B, không tự nâng/hạ gói hoặc quy đổi ngày.
5. Membership scope mới thống nhất CUSTOMER. CUSTOMER_VIP legacy được map khi xác minh đúng nghĩa khách hàng; không dùng enum khác nhau để lách xung đột cùng scope.
6. requiredPoints là số nguyên dương khi allowPointRedemption=true. Null/0/âm không phải “đổi miễn phí”. Kênh tắt thì không đổi được dù còn số điểm cũ.
7. Điểm chỉ trừ khi debit ledger, term và kết quả command có thể commit cùng nhau. Mọi lỗi trước commit không mất điểm/không cấp term một phần.
8. Timeout không chứng minh thất bại. Retry cùng key trả kết quả cũ; không trừ/gia hạn hai lần.

Cờ tắt cho phép requiredPoints=null; migration chuẩn hóa giá điểm legacy 0 thành kênh tắt/null sau khi kiểm tra dữ liệu, không suy ra “đổi miễn phí”. Cùng hợp đồng file 09: kênh tiền bật yêu cầu price>0 nguyên VND, durationDays>0; không bật đổi điểm chỉ vì price=0. Applicability và quota quyền lợi được snapshot cho từng term/revision, không đọc cấu hình gói sống để sửa quota của quyền lợi đã cấp.

Ví dụ: term A v1 hết 01/11, ngày 26/10 đổi A v2 60 ngày. Term v1 giữ benefits cũ đến 01/11; term v2 bắt đầu 01/11 và có đúng benefits v2 trong 60 ngày. UI phải nói rõ quyền lợi mới bắt đầu khi nào.

## 3. Model BE và constraints đề xuất

Các trường/model sau là hợp đồng mới cần triển khai, không phải bảng đã tồn tại.

```text
SubscriptionPlan
  id, isActive, planVersion
  allowMoneyPurchase, allowPointRedemption, allowAdminGift
  currentRevisionId

SubscriptionPlanRevision             bất biến
  id, planId, planVersion
  durationDays, price, requiredPoints
  benefits object, membershipScope
  displayName / mô tả và metadata cần snapshot

RedemptionCommand
  id, actorId, idempotencyKey, requestHash
  planId, planRevisionId, pointCost, sourceId
  resultSnapshot, createdAt, completedAt
  UNIQUE(actorId, operationType, idempotencyKey)

SubscriptionTerm                     bất biến sau grant
  id, userId, membershipScope
  planId, planRevisionId, benefitsSnapshot, durationDays
  sourceType=POINT_REDEMPTION|MONEY_PURCHASE|ADMIN_GIFT
  sourceId, startsAt, endsAt
  UNIQUE(sourceType, sourceId)

PointTransaction
  walletId, amount=-pointCost, type=REDEEM
  sourceType=POINT_REDEMPTION, sourceId=commandId, event=REDEEM
  balanceAfter, walletVersionAfter, createdAt
  UNIQUE(sourceType, sourceId, event)
```

- Wallet có walletVersion/khóa, balance không âm và projection availableToSpend theo flow 06; không dùng field rewardPoints FE làm ví thứ hai. Pending reward chưa ghi ledger không được tiêu. Debt/reconciliation/spend hold nếu có phải chặn hoặc giới hạn tiêu theo policy công bố rõ.
- API công khai `benefits` object; chuỗi `benefits` legacy map sang `description`, không parse text thành quyền lợi. Nếu model nội bộ đặt tên structuredBenefits thì phải mapper về cùng hợp đồng API file 09.
- Term thời gian UTC, startsAt < endsAt. “Ngày” là duration theo chính sách UTC thống nhất; FE chỉ định dạng giờ địa phương, không cộng ngày để cấp quyền.
- Dùng membership slot duy nhất `(userId, membershipScope)` để serialize kiểm tra active/future term; khóa slot, không chỉ query “chưa tồn tại” rồi cả hai cùng insert.
- Nếu cần thu hồi/đối soát term, dùng event/trạng thái hiệu lực có audit thay vì sửa snapshot hoặc xóa ledger. Không tự hoàn điểm hai lần cho cùng nguồn.
- Index giúp tìm tail term theo user/scope; các term kế tiếp không được chồng thời gian do concurrent redeem/gift/cash activation.

## 4. BE bước 1 — Danh sách gói có thể đổi

1. Giữ API danh sách hiện tại nếu phù hợp nhưng query theo membership scope và kênh, không cố định một enum legacy làm mất VIP.
2. Xác minh actor role USER, tài khoản active. ADMIN xem quản trị không đồng nghĩa có quyền đổi bằng điểm của khách.
3. Chỉ công khai gói active với revision hợp lệ. Trả planVersion, durationDays, requiredPoints, benefits object/description, allowPointRedemption và khả năng thao tác theo user.
4. Trả `canRedeem`/blockedReason như thiếu điểm, khác gói đang có hoặc dữ liệu cần kiểm tra. Đây là hỗ trợ UI; POST phải kiểm tra lại.
5. Có thể dùng balance từ summary để preview; không khóa wallet lâu chỉ để vẽ danh sách.
6. Nếu có CUSTOMER_VIP legacy đủ điều kiện, dùng mapper có kiểm chứng để cùng hiện ở scope CUSTOMER; không nhân đôi cùng plan giữa hai nguồn.

## 5. BE bước 2 — Redeem transaction chuẩn

Endpoint hiện có `POST /api/subscriptions/redeem/{planId}` có thể giữ, bổ sung body/version theo mục 7. Không nhận userId để đổi hộ hoặc số điểm client quyết định.

```text
Request authenticated USER
  -> tra/claim idempotency key + requestHash
  -> khóa User
  -> kiểm tra/khóa plan active gate + đúng immutable revision
  -> khóa/tạo Wallet
  -> khóa membership slot + đọc active/future terms
  -> kiểm tra quyền / channel / phiên bản / pointCost / plan conflict / balance
  -> ghi debit + append term + audit + resultSnapshot
  -> commit
  -> response / thông báo sau commit
```

### 5.1. Idempotency phải đi trước validation thay đổi được

1. Key đã hoàn tất và hash trùng: trả resultSnapshot cũ, dù gói nay hết active, wallet đã đổi hay planVersion hiện tại khác.
2. Key trùng hash khác: IDEMPOTENCY_CONFLICT, không trừ thêm.
3. Hai request cùng key: unique claim chỉ cho một mutation; request còn lại nhận kết quả hoặc IN_PROGRESS. Không chỉ kiểm tra exists rồi insert không constraint.
4. Chưa hoàn tất/timeout: server cung cấp query command hoặc replay cùng key. Không sinh key mới cho retry kỹ thuật.

### 5.2. Kiểm tra trước debit

- User đúng quyền/active; gói tồn tại, active và allowPointRedemption=true.
- planVersion client đã xem trùng revision được phép bán/đổi; thay đổi cấu hình cần PLAN_VERSION_CONFLICT, không tự trừ mức điểm mới.
- requiredPoints nguyên dương, durationDays hợp lệ, benefits có cấu trúc đúng schema. Không cấp gói có revision cấu hình thiếu rồi trừ điểm trước.
- Có plan khác active/future cùng scope thì conflict. Nếu nhiều term legacy bất nhất, MEMBERSHIP_REVIEW_REQUIRED; không lấy ngẫu nhiên một Optional.
- Dưới Wallet lock, tính lại availableToSpend và kiểm tra availableToSpend >= pointCost; kiểm tra debt/reconciliation/spend hold theo flow 06. Balance đủ nhưng có hold/nợ hoặc điểm chỉ đang pending vẫn không được coi là đủ điểm tiêu. Client gửi cost/balance giả không ảnh hưởng phép tính.
- Chưa có debit/term cho sourceId. Constraint vẫn là lớp cuối bảo vệ.

### 5.3. Ghi và commit

1. Lưu pointCost, planRevisionId, durationDays và benefits snapshot vào nguồn redeem.
2. Trừ wallet, tăng walletVersion; ghi ledger amount âm với sourceType=POINT_REDEMPTION, sourceId=commandId, event=REDEEM duy nhất, balanceAfter và walletVersionAfter. Cập nhật projection availableToSpend theo policy hold/debt.
3. Gọi activation chung để append term đúng lịch, không gọi hàm cũ chỉ cộng endDate theo type.
4. Lưu audit và kết quả gồm actual plan/revision, termId, startsAt/endsAt, pointsSpent, balanceAfter, availableToSpend và walletVersion.
5. Commit một transaction. Lỗi tạo term/ledger/result phải rollback toàn bộ debit.
6. Notification sau commit/outbox. Lỗi gửi thông báo hoặc GET refresh không khiến server/FE cấp gói lại.

## 6. Khóa đồng thời với các writer khác

- Mọi đường ghi điểm phải có cùng thứ tự **User → Wallet**: redeem, admin chỉnh điểm, hoàn điểm và cộng thưởng đơn.
- Redeem: claim → User → plan gate/revision nếu cần khóa → Wallet → membership slot/terms. Không lấy order/payment lock sau khi đã giữ User.
- Hoàn đơn: khóa order/payment chain trước, sau đó User → Wallet theo flow 06. Không có đường giữ Wallet rồi quay lại khóa order/User.
- Activation cash/gift phải dùng cùng User/membership slot khi sắp xếp term. Không tự giữ một slot theo enum CUSTOMER_VIP khác với CUSTOMER.
- Quản trị plan khóa plan/revision nhưng không duyệt khóa từng User trong cùng transaction; publication không cập nhật các term đã cấp. Cần test lock order thật giữa redeem và deactivate/publish revision.
- Tạo wallet lần đầu dưới User lock và unique userId; không để hai thread cùng tạo wallet. Không fallback balance=0 rồi overwrite wallet đã có.
- Nếu debit dùng atomic update thay row lock thì vẫn giữ policy khóa User cho toàn hệ thống và validate số row affected; không trộn hai chiến lược làm mất ledger/balance.

## 7. API và response BE → FE

Body đề xuất cho POST hiện có:

```json
{
  "planVersion": 4,
  "idempotencyKey": "uuid-cua-lan-khach-xac-nhan"
}
```

Response ví dụ: user có 800 điểm, gói A v4 cần 300 điểm, durationDays=60, term bắt đầu ngay:

```json
{
  "code": 201,
  "result": {
    "commandId": "uuid-redeem",
    "termId": "uuid-term",
    "planId": "uuid-plan-a",
    "planVersion": 4,
    "planName": "Hoi vien A",
    "membershipScope": "CUSTOMER",
    "pointsSpent": 300,
    "balanceAfter": 500,
    "availableToSpend": 500,
    "walletVersion": 25,
    "durationDays": 60,
    "startsAt": "2026-10-26T02:00:00Z",
    "endsAt": "2026-12-25T02:00:00Z",
    "activationStatus": "ACTIVE",
    "sourceType": "POINT_REDEMPTION"
  }
}
```

Nếu nối sau term hiện có, activationStatus=SCHEDULED và thời gian tương lai; không nói benefits mới có hiệu lực ngay. Replay có thể HTTP 200 cùng result; `balanceAfter` trong snapshot là số dư ngay sau thao tác đó, không giả là số dư hiện tại nếu sau đó đã phát sinh giao dịch khác. Summary/wallet GET cung cấp balance mới nhất.

| HTTP / code đề xuất | FE xử lý |
| --- | --- |
| 401/403 | Đăng nhập lại/không đủ quyền; không tự chọn user khác |
| 404 PLAN_NOT_FOUND | Tải lại danh sách, giữ thông báo gói không còn |
| 409 PLAN_INACTIVE / REDEMPTION_DISABLED | Dừng đổi, cập nhật capability |
| 409 PLAN_VERSION_CONFLICT | Hiện điểm/ngày/quyền lợi mới, bắt buộc xác nhận lại |
| 409 INSUFFICIENT_POINTS | Hiện số dư/cost server, refresh wallet |
| 409 POINT_SPEND_HELD / POINT_DEBT_UNRESOLVED | Giải thích hold/nợ có thẩm quyền, không POST lại để lách |
| 409 ACTIVE_PLAN_CONFLICT / MEMBERSHIP_REVIEW_REQUIRED | Không trừ điểm, hiển thị gói/lịch cần kiểm tra |
| 409 IDEMPOTENCY_CONFLICT | Không dùng key đó với payload khác |
| 202 REDEMPTION_IN_PROGRESS / timeout chưa rõ | Query command/replay cùng key, chưa báo thành công hay thất bại chắc chắn |

Các code/endpoint query là đề xuất, phải đồng nhất exception handler. GET kết quả cần actor ownership; GET chưa thấy command không đủ chứng minh POST chưa commit. Không ghi số điểm/ID người dùng nhạy cảm vào thông báo cho caller không có quyền.

## 8. FE bước 1 — Hiển thị đúng gói và xác nhận

1. Plan model nhận planVersion, durationDays, requiredPoints, channel flags và structured benefits từ API; bỏ chuỗi cố định “30 ngày”.
2. Nút đổi điểm chỉ hiện/enable khi kênh bật và canRedeem hợp lệ; số dư chưa tải xong hiển thị loading, không coi null là đủ điểm hoặc tự reset bằng 0.
3. Hiện tên gói, điểm cần, số ngày, quyền lợi áp dụng và thời điểm bắt đầu dự kiến nếu là gia hạn.
4. Khi confirm, capture planId/version/cost/name/duration/benefits đang xem. Không để state gói mới thay đổi nội dung của request/toast đang chờ.
5. Tạo idempotency key một lần cho confirm đó, disable double submit; single-flight hỗ trợ FE nhưng backend uniqueness vẫn quyết định.

## 9. FE bước 2 — Kết quả, timeout và đồng bộ điểm

1. POST typed request; chỉ success khi result thực tế khớp planId/version/termId và trạng thái commit hợp lệ. Không hiển thị “Đã đổi B” khi response vẫn là A.
2. Hiển thị pointsSpent, số ngày và startsAt/endsAt từ response. Term SCHEDULED phải nói quyền lợi bắt đầu vào ngày nào, không hiển thị gói mới là current active.
3. Refresh/invalidate membership summary, wallet/history và AuthContext/profile cùng user; hiện `User.getRewardPoints()` đọc wallet, FE không duy trì một nguồn điểm độc lập. Dùng shared PointsProvider/query cache ở flow 06 để profile/header/subscription cùng hiển thị balance/availableToSpend/walletVersion.
4. Apply response ví chỉ khi walletVersion mới hơn hoặc bằng version hợp lệ đang giữ; GET/response replay cũ không ghi đè ví mới. `SubscriptionPanel` không chỉ reload plans/membership rồi bỏ profile/header cũ. Không cộng/trừ điểm lần nữa khi nhận thông báo.
5. GET refresh lỗi sau success: giữ kết quả đổi đã commit và báo lỗi tải lại riêng. Nút tải lại chỉ GET, không POST redeem nữa.
6. Timeout/mất mạng: giữ pending key/payload theo user, hiển thị chưa rõ kết quả, nút kiểm tra/query hoặc replay cùng key. Abort component không có nghĩa transaction BE rollback.
7. Logout/đổi user: response cũ không cập nhật ví/profile người mới; pending command chỉ phục hồi cho đúng actor. Mở nhiều browser tab cần revalidate khi focus, không giả là realtime đa thiết bị.
8. Khi phiên bản/cost đổi và backend trả conflict: để khách đọc lại dữ liệu rồi tạo confirm mới/key mới; không tự accept mức điểm mới.

## 10. Migration và rollout

1. Thêm revision/term/source/idempotency và constraint theo hướng additive; giữ UserSubscription cũ để backfill có kiểm chứng.
2. Gói cũ không có duration: backfill revision 30 ngày chỉ khi đối chiếu đúng hành vi service cũ. Không thay ngày hết hạn các subscription đã cấp bằng duration admin vừa nhập.
3. Legacy active subscription được tạo một term giữ startsAt/endsAt và benefits đã xác minh; không gắn benefits hiện tại nếu không có bằng chứng revision khi cấp. Đánh dấu cần kiểm tra nếu lịch sử thiếu.
4. CUSTOMER/CUSTOMER_VIP mapping theo dữ liệu và chính sách thật. Không gom/xóa mọi bản ghi chỉ theo enum rồi làm mất quyền lợi hoặc tạo xung đột âm thầm.
5. Giao dịch REDEEM cũ không có sourceId không tự suy ra trùng; đối soát wallet/term trước khi tạo ledger nguồn mới, không trừ lại điểm khi backfill.
6. Cập nhật mọi point writer dùng User→Wallet trước bật redeem mới. Redeem riêng có khóa đúng vẫn không an toàn nếu completion/admin writer còn ghi tự do.
7. Deploy BE contract/activation chung → FE đúng version/duration → bật flags. Client cũ không được POST planId-only và bỏ qua xác nhận cost/version mới.
8. Gift và cash chuyển sang chung term activation; semantics cùng plan gia hạn vẫn giữ nhưng storage không mutate term hiện hữu. Rollback không xóa term/debit đã commit.

## 11. Kiểm thử và nghiệm thu

| Ca kiểm thử | Kết quả bắt buộc |
| --- | --- |
| 800 điểm đổi gói 300 | Balance 500, một debit −300, một term đúng revision |
| Đang A, đổi B cùng scope | ACTIVE_PLAN_CONFLICT, không debit, không gia hạn A |
| Có B tương lai, đổi A | Conflict trước debit, không tạo lịch chồng nhau |
| Cùng A, revision mới | Append term mới sau tail, term cũ giữ benefits/ngày |
| Cost/duration/benefits đổi khi trang mở | Version conflict, khách phải xác nhận lại |
| Channel off, cost null/0/âm, gói inactive | Từ chối, không mutation |
| Double-click/cùng key/cùng payload | Một debit và một term; trả lại cùng kết quả |
| Cùng key khác plan/version | Conflict, không chi thêm |
| Hai key song song với balance chỉ đủ một | Một thành công, một thiếu điểm; balance không âm |
| Balance đủ nhưng debt/hold hoặc chỉ có pending reward | availableToSpend/guard từ chối đúng policy; không cấp term |
| Redeem đồng thời earn/refund/admin adjust | Ledger/balance bảo toàn, không lost update/deadlock |
| Gift/cash/redeem cùng user/scope | Serialize lịch term, không bypass plan conflict |
| Lỗi tạo term hoặc result sau debit | Transaction rollback wallet/ledger/term toàn bộ |
| Timeout sau commit rồi replay | Kết quả cũ, không gia hạn/trừ điểm lần nữa |
| GET refresh lỗi, đổi tài khoản | Không POST lại, không lộ/cập nhật điểm user khác |
| GET/replay walletVersion cũ đến sau kết quả mới | Shared cache không kéo balance/availableToSpend về phiên bản cũ |
| User có gói VIP legacy hợp lệ | Danh sách/capability đúng, không mất gói do chỉ query CUSTOMER |

Unit test policy activation/calculation; integration test transaction/locks/constraints với database triển khai; UI test selected plan/version, unknown result, scheduled term và refresh profile. Cập nhật mock cũ từ findById sang dependency khóa thực tế trước khi dùng suite subscription làm bằng chứng.

Hoàn thành khi đúng gói/revision được cấp, điểm và term ghi atomically đúng một lần, các kênh dùng chung activation, và mọi màn FE hiển thị số dư/quyền lợi hiện tại hoặc lịch tương lai đúng dữ liệu server. Chỉ viết tài liệu ở yêu cầu hiện tại; checklist này chưa được chạy cho bản sửa.
