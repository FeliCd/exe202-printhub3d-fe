# Flow 06 — Cộng điểm mua hàng và đồng bộ ví điểm từ BE → API → FE

Ngày: 26/10/2026. Trạng thái: đặc tả sửa lỗi; chưa sửa code chức năng, chưa chạy kiểm thử runtime hoặc giao dịch thật.

Nguồn: [Rà soát điểm và subscription](./REVIEW_REWARDS_SUBSCRIPTION_CONFIG_2026-10-26.md). BE là `D:/semester 7/EXE/PrintHub_3D/src/main/java/com/fpt/printhub_3d/`; FE là `D:/semester 7/EXE/exe202-printhub3d-fe/exe-fe/src/`.

## 1. Phạm vi và phụ thuộc

- Sửa thời điểm/công thức thưởng, thiếu thưởng custom/bulk, thưởng đơn chưa trả tiền, thưởng trùng, race balance, review thiếu ledger, điểm hiển thị giả và profile cache cũ.
- [01 — Giá/payment](./FLOW_FIX_01_CUSTOM_PRICING_PAYMENT.md): nguồn xác minh tiền và receipt; [03 — Trạng thái admin](./FLOW_FIX_03_ADMIN_ORDER_STATUS.md): điều kiện COMPLETED, COD, audit/outbox.
- [07 — Đổi điểm](./FLOW_FIX_07_SUBSCRIPTION_POINT_REDEMPTION.md): writer trừ ví phải cùng cơ chế khóa; [08 — Mua gói bằng tiền](./FLOW_FIX_08_SUBSCRIPTION_CASH_PURCHASE.md): không tự phát thưởng mua hàng cho subscription purchase.
- [09 — Cấu hình gói](./FLOW_FIX_09_ADMIN_SUBSCRIPTION_CONFIGURATION.md): quyền lợi gói có thể ảnh hưởng giá hàng ròng, nhưng không biến mô tả marketing thành công thức thưởng.
- Các model/API/chính sách đích bên dưới là đề xuất. Không mô tả những chức năng đó như đã có sẵn trong source.

## 2. Bằng chứng hiện tại

| File/phương thức | Hành vi hiện tại | Điểm cần sửa |
| --- | --- | --- |
| BE `PaymentServiceImpl.handleWebhook/verify/settle` | Nhận PAYOS chỉ cập nhật tiền/trạng thái/thông báo | Không có cộng điểm lúc trả trước; FE phải phản ánh đúng |
| BE `OrderServiceImpl.completeRewards`, khoảng dòng 207–261 | Chỉ kiểm tra COMPLETED; tính floor(totalAmount/10.000), ghi EARN và rewardProcessed | Thiếu kiểm tra tiền, khóa đồng nhất và unique nguồn-sự kiện |
| BE `OrderServiceImpl.updateOrderStatus`, khoảng 405/427 | PENDING có thể sản xuất và khi COMPLETED vẫn gọi thưởng | PAYOS chưa thanh toán vẫn có đường nhận điểm |
| BE `CustomOrderServiceImpl.updateCustomOrderStatus` | Hoàn custom chỉ lưu payment COD/trạng thái/thông báo | Custom/bulk chưa được thưởng hoàn thành |
| BE `ReviewServiceImpl.rewardPointsForReview` | Thưởng ảnh 20 điểm khi tạo review mới; sửa balance nhưng không ghi PointTransaction | Ledger không giải thích đủ balance, cùng race với earn/redeem |
| BE `PointWallet`, `PointTransaction` | Chưa có walletVersion và unique nguồn đơn/sự kiện | Retry/concurrency không được bảo vệ đầy đủ |
| BE `User.getRewardPoints` | Getter lấy trực tiếp PointWallet.balance | Ví đã là nguồn BE chung; không cần thêm một số dư độc lập trên User |
| FE `PaymentResultPage.tsx:79-80,335` | max(8,floor(amount/1.000)), fallback 8.000đ; ghi “Đã cộng vào ví” | Sai công thức và thời điểm, không có giao dịch cộng thật |
| FE `PaymentResultPage.tsx:221` | Nhánh success mặc định không yêu cầu verify PAID | Có thể hiện success/điểm khi PENDING, lỗi verify hoặc thiếu code |
| FE `AuthContext`, `ProfilePage`, `SubscriptionPanel` | Profile dùng cached user.rewardPoints; subscription đọc `/subscriptions/me` riêng | Chưa invalidation điểm dùng chung, có thể lệch giữa màn |

Hiện chỉ marketplace Order COMPLETED có đường thưởng mua hàng. Bulk dùng CustomRequestForm gửi `/custom-orders`, nên cùng đường custom chưa thưởng. Cha mixed legacy không có một bước thưởng tổng riêng; marketplace con được tính theo từng Order/seller.

## 3. Chính sách đề xuất phải phân biệt với hiện trạng

### 3.1. Thời điểm và loại nguồn

| Sự kiện | Chính sách đích |
| --- | --- |
| PAYOS trả trước SUCCESS | Chưa cộng điểm mua hàng; chỉ cập nhật estimate/pending |
| Marketplace COMPLETED + đủ tiền hợp lệ | Cộng một lần cho chính Order đó |
| Custom/bulk COMPLETED + đủ tiền hợp lệ | Bổ sung cùng chính sách một lần cho chính CustomOrder |
| COD COMPLETED | Xác nhận đã thu đủ trước, rồi phát event thưởng |
| Thanh toán/gửi yêu cầu chưa giao xong | Không cộng điểm mua hàng |
| Mua subscription bằng tiền | Không thưởng mua hàng, tránh vòng mua gói → điểm → đổi gói |
| Đổi điểm/tặng subscription | Không phát thêm EARN mua hàng |
| Review ảnh được duyệt hợp lệ | Nếu giữ ưu đãi 20 điểm, dùng event riêng REVIEW_APPROVED |

Điều kiện “đủ tiền” gồm đúng amount/currency/đơn/snapshot, receipt hợp lệ hoặc COD collection hợp lệ, `paymentStatus=SUCCESS` và `reconciliationStatus` không còn REQUIRED. Tiền nhận nhưng đang đối soát không đủ điều kiện thưởng.

### 3.2. Công thức và snapshot

```text
eligibleNet = tiền hàng marketplace hoặc tiền gia công custom
              sau điều chỉnh giá hợp lệ và giảm giá đã phân bổ
              không gồm shippingFee, không gồm mua subscription
earnedPoints = floor(max(0, eligibleNet) / 10000)
```

- Ví dụ hàng ròng 100.000đ + ship 30.000đ → 10 điểm; hàng ròng 9.999đ → 0 điểm, không có minimum 8.
- Custom/bulk: dùng production net của quote đã accept, không lấy đơn giá hoặc grandTotal có ship để tính nhầm. Công thức giá lấy theo flow 05, không tự tính lại quote ở RewardService.
- Snapshot `eligibleNet`, currency, rewardPolicyVersion, divisor=10.000 và expectedPoints khi giá cuối được chốt ở checkout/accept; server quyết định. Giảm giá phải phân bổ một lần trước khi snapshot.
- Mỗi Order/CustomOrder là một nguồn thưởng. Nhiều seller làm tròn theo từng Order; một batch gửi bulk nhiều file làm tròn theo từng CustomOrder, không cộng thêm thưởng group/parent.
- Khi COMPLETED, đối chiếu snapshot với tiền thật. Không đọc plan/giá hiện tại để đổi cơ sở thưởng của giao dịch cũ.
- 0 điểm vẫn có kết quả PROCESSED với reason BELOW_THRESHOLD, không để worker thử lại vô hạn hoặc giả một mức thưởng tối thiểu.

## 4. BE bước 1 — Một WalletService và ledger duy nhất

Schema đề xuất additive:

```text
PointWallet
  userId, balance >= 0, walletVersion, updatedAt
PointLedger
  id, userId, delta, balanceAfter, walletVersionAfter
  sourceType, sourceId, event, operationId
  policyVersion, amountBasisSnapshot, originalLedgerId, createdAt
  UNIQUE(sourceType, sourceId, event)
RewardOperation
  id, sourceType, sourceId, event=COMPLETED_REWARD|REVIEW_APPROVED
  state=PENDING|PROCESSING|PROCESSED|BLOCKED|FAILED_RETRYABLE
  expectedPoints, grantedPoints, ledgerId, reasonCode, version
  UNIQUE(sourceType, sourceId, event)
```

- Nguồn gợi ý: ORDER, CUSTOM_ORDER, REVIEW; reversal/refund dùng nguồn REFUND với ID hoàn tiền để nhiều lần hoàn một phần vẫn phân biệt.
- Mọi thay đổi balance ghi ledger cùng transaction; không update wallet trực tiếp từ OrderService, ReviewService, redeem hoặc công cụ admin.
- Wallet là nguồn số dư duy nhất. `User.rewardPoints` và summary chỉ là projection từ ví, không là cột cập nhật song song.
- Nếu giữ PointTransaction hiện có, mở rộng nó thành ledger có source/event/version; không tạo hai sổ EARN cùng ghi cho một event.
- `rewardProcessed/rewardPointsEarned` trên Order chỉ là projection tương thích; unique ledger/operation mới chống trùng thực sự.
- Ledger đủ để giải thích mọi biến động mới, bao gồm review, redeem, điều chỉnh và bù trừ. Không bắt exception ledger rồi vẫn commit balance.

### 4.1. Khóa bắt buộc cho tất cả writer

```text
Writer ví độc lập: User -> PointWallet
Writer theo order: Order/CustomOrder root -> Payment aggregate/attempt nếu cần
                  -> User -> PointWallet
Legacy: CheckoutOrder -> children theo ID -> Payment/attempt -> User -> Wallet
```

- Khóa User trước để serialize cả trường hợp ví chưa tồn tại; tạo wallet dưới cùng khóa, dùng unique userId. Sau đó khóa/đọc lại wallet, ghi balance và tăng walletVersion.
- Earn/redeem/review/admin adjustment/refund recovery đều dùng thứ tự User → Wallet. Không có flow đang giữ User/Wallet rồi quay lại lấy existing Order/Payment root.
- Khi writer subscription còn cần khóa cấu hình gói, giữ chuỗi `root/payment/inventory nếu có → User → Plan gate nếu cần → Wallet → membership slot/SubscriptionTerm`. Không đảo Wallet rồi quay lại khóa Plan; điều kiện cấp/gia hạn term theo flow 07/08, không do RewardService tự sửa subscription.
- Nếu một operation còn đụng inventory, tiếp tục tuân lock order file 02 và chỉ lấy User/Wallet sau phần root/payment/inventory cần thiết; không lấy lại root từ wallet service.
- Worker đã cần đọc order thì lấy root trước, không gọi từ đoạn redeem đang giữ ví rồi mới tải/khóa order.
- `@Version` là lớp bảo vệ bổ sung; không thay việc thống nhất mọi writer. Không giữ transaction qua HTTP gateway.

## 5. BE bước 2 — Hoàn thành tạo operation, worker cộng đúng một lần

### 5.1. Transaction hoàn thành đơn

1. Command admin thực hiện quyền/version/idempotency và bảng chuyển trạng thái flow 03.
2. Khóa root/payment; PAYOS phải có SUCCESS hợp lệ. COD xác nhận thu đúng grandTotal và lưu collection trong transaction hoàn thành.
3. Kiểm tra không reconciliation REQUIRED, không hoàn tiền/hold mâu thuẫn và có reward basis snapshot rõ.
4. Lưu COMPLETED cùng event outbox và RewardOperation PENDING duy nhất theo nguồn-sự kiện. Chưa hiển thị đã cộng vì chưa có ledger.
5. Commit; trả orderStatus COMPLETED và rewardStatus PENDING. Lỗi gửi thông báo không tạo lại completion/reward.

### 5.2. Worker/replay operation

1. Claim operation/outbox với lease/version bằng một transaction ngắn riêng rồi **commit và nhả khóa**. Xác định root trước khi xử lý; không giữ khóa operation/outbox rồi chờ Order/Payment, vì completion đang dùng chiều root → operation. Request trùng được nhận diện qua source/event và operationId.
2. Mở transaction xử lý mới, khóa root/payment trước, rồi đọc lại điều kiện COMPLETED/paid/snapshot/refund hiện tại; không chỉ tin payload event cũ. Kiểm tra lease/version khi finalize, không mang khóa dòng operation từ transaction claim sang chuỗi root.
3. Nếu điều kiện chưa rõ thì BLOCKED có reason và khả năng đối soát; không cấp điểm dựa trên trạng thái trước khi claim.
4. Khóa User → Wallet, kiểm tra ledger nguồn-sự kiện đã có. Có thì dùng kết quả cũ và finalize operation, không cộng lại.
5. Tính từ snapshot, ghi ledger, cập nhật balance/version và finalize RewardOperation PROCESSED bằng lease/version hợp lệ trong cùng transaction xử lý theo chiều root/payment → User → Wallet → ledger → operation. Với 0 điểm lưu kết quả có lý do rõ. Nếu lease bị mất/conflict thì rollback phần xử lý chưa commit và reload, không publish kết quả mơ hồ.
6. Commit rồi phát notification/invalidation có eventId và walletVersion. Worker retry sau crash vẫn trả đúng một ledger/kết quả.
7. Unique conflict phải được xử lý bằng rollback/reload transaction phù hợp; không catch lỗi SQL trong transaction đã bị đánh dấu rollback-only rồi giả commit thành công.

Mặc định đề xuất xử lý qua outbox như trên. Nếu chọn cộng đồng bộ trong transaction completion thì vẫn cùng policy/ledger/lock và tính atomic; không triển khai đồng thời cả hai đường làm hai lần EARN.

### 5.3. Endpoint complete-rewards cũ

`POST /orders/{id}/complete-rewards` giữ ADMIN guard nếu cần tương thích. Endpoint chỉ ensure/retry đúng RewardOperation của đơn đã đủ điều kiện; không nhận amount/points từ caller và không bypass payment guard. Retry trả kết quả PROCESSED/PENDING/BLOCKED đang có.

## 6. BE bước 3 — Review và hoàn tiền không làm sổ điểm sai

### 6.1. Review ảnh

- Hiện thưởng ngay khi tạo mới có imageUrls; sửa không tự thưởng. Nếu tiếp tục ưu đãi 20 điểm, cần quyết định duyệt hợp lệ phía server; đề xuất REVIEW_APPROVED khi ảnh/ownership/đơn hoàn thành được xác nhận.
- Nếu không có moderation thì tên event thể hiện lần server chấp thuận theo policy, không giả có màn duyệt đã tồn tại. Trong khi chưa có tiêu chí xác nhận ảnh, không thưởng chỉ vì URL bất kỳ không rỗng.
- Dùng sourceType=REVIEW, sourceId=reviewId, event=REVIEW_APPROVED và 20 điểm/policyVersion riêng. Sửa/xóa/thêm ảnh hoặc retry không phát lại cùng event.
- Mọi điểm review có ledger và cùng khóa User → Wallet; không dùng helper cũ chỉ setBalance rồi log. Fraud reversal là bút toán mới có lý do.

### 6.2. Refund và điểm đã tiêu

1. Refund chưa có thưởng: operation đọc snapshot/refund mới trước khi cấp, không thưởng rồi phải hoàn lại không cần thiết.
2. Refund sau thưởng: không xóa/sửa ledger EARN. Tạo compensation gắn refundId và originalLedgerId, một operation cho mỗi refund đã xác minh.
3. Cơ sở hoàn chỉ tính eligibleNet đã hoàn, không phải tiền ship hoàn. Với nhiều lần hoàn phần, tính lại entitlement còn được giữ từ eligibleNet gốc trừ tổng eligible refund, rồi trừ đi số đã bù trước để không thu hồi trùng.
4. Khóa root/payment/refund rồi User → Wallet theo cùng thứ tự; review/refund earn hoặc redeem cạnh tranh không được ghi đè balance.
5. Nếu còn đủ điểm, ghi debit compensation và tăng version. Nếu đã tiêu điểm, không tự ép balance âm hoặc xóa subscription đã đổi.
6. Phải có chính sách debt/hold minh bạch trước khi bật tự thu hồi: ví dụ debit tối đa phần còn lại, phần thiếu ghi PointDebt riêng, chặn redeem đến khi giải quyết và hiển thị cho user. Điểm earn mới có thể bù nợ nếu policy công bố rõ, với debt settlement ledger riêng.
7. Khi chưa có debt/hold policy được xác nhận, đưa recovery vào đối soát có hold được giải thích; không coi đã thu hồi đủ trong khi chỉ cập nhật balance một phần.

## 7. API đọc số dư và kết quả thưởng

Các API sau là đề xuất; `/subscriptions/me` hiện có cần projection/adapter cùng nguồn, không trở thành một wallet thứ hai.

| Endpoint | Nội dung |
| --- | --- |
| `GET /api/points/me` | balance, availableToSpend, walletVersion, pendingRewards, debt/hold nếu có |
| `GET /api/points/me/transactions` | Ledger phân trang, nguồn/event/điểm/lý do, không lộ người khác |
| `GET /api/orders/{id}` và custom detail | rewardOperationId, rewardStatus, estimatedPoints/grantedPoints/ledgerId, policyVersion |
| `GET /api/reward-operations/{id}` | Kết quả PENDING/PROCESSED/BLOCKED đúng chủ hoặc ADMIN có quyền |

```json
{
  "balance": 150,
  "availableToSpend": 150,
  "walletVersion": 24,
  "pendingRewards": [{ "operationId": "uuid", "estimatedPoints": 10 }]
}
```

- estimatedPoints không được cộng vào balance/availableToSpend. PROCESSED chỉ nói “đã cộng” khi có grantedPoints và ledgerId đã commit.
- DTO thời gian ISO có UTC/offset; điểm là integer, tiền tính bằng BigDecimal. Không gửi token/nội dung file dư thừa trong reward event.
- Payment verify trả paymentStatus và order link; nếu kèm reward summary thì lấy RewardOperation server, không tự tính từ amount ở FE.
- Lookup quyền theo principal; không nhận userId tùy ý từ browser để xem/ghi ví. Không thêm public endpoint `addPoints` cho user.

## 8. FE từng bước — Trả tiền, hoàn đơn và số dư chung

### 8.1. PaymentResultPage

1. Xây state rõ LOADING, PENDING, VERIFIED_SUCCESS, CANCELLED/FAILED, ERROR/UNKNOWN; chỉ SUCCESS/PAID được server xác minh mới hiện “Thanh toán thành công”.
2. Thiếu orderCode/verify lỗi: hiện không đủ dữ liệu và nút kiểm tra lại; không rơi vào nhánh thành công mặc định.
3. Bỏ amount fallback 8.000, reward min 8 và phép chia 1.000. Không có dữ liệu thì không hiển thị số giả.
4. Trả trước SUCCESS chỉ hiển thị “Điểm dự kiến: …; nhận khi đơn hoàn thành và đủ điều kiện” từ server estimate. Không có estimate thì chỉ giải thích thời điểm nhận.
5. Chỉ ghi “Đã cộng X điểm” khi nhận RewardOperation PROCESSED/ledger từ server, thường sau khi đơn hoàn thành; không tự phát mutation thưởng từ trang kết quả.
6. Browser refresh/return/query cancel không tạo EARN, không gọi complete-rewards và không tự xác nhận receipt.

### 8.2. Một query ví cho Profile/Subscription

- Tạo PointsProvider/query cache theo userId ở cấp ứng dụng; `/points/me` là nguồn hiển thị chung. Profile và SubscriptionPanel cùng đọc balance/availableToSpend/version từ cache này.
- AuthContext chỉ giữ phiên/profile; user.rewardPoints legacy là projection tương thích, không duy trì một bộ điểm riêng có thể bị stale. Không sửa điểm bằng updateProfile từ client.
- Khi completion được xác nhận, đọc rewardStatus; nếu pending thì poll có giới hạn/backoff hoặc dùng notification event để refetch. Không cộng balance lạc quan trước ledger.
- Earn/redeem/refund/review thành công invalidate query ví và ledger cùng user. Flow 07 có thể cập nhật từ response walletVersion mới rồi refetch; không để GET cũ ghi đè balance mới hơn.
- Refresh GET lỗi sau mutation đã commit: giữ số dư/kết quả cuối kèm trạng thái chưa tải lại; không retry mutation bằng key mới và không reset balance về 0.
- Logout/đổi account xóa hoặc cô lập cache theo identity, hủy response cũ; refetch khi focus/navigation nếu không có push đa thiết bị.
- Badge, Profile, trang subscription và lịch sử điểm dùng cùng phiên bản; pending reward/debt/hold có nhãn riêng, không gộp vào điểm được tiêu.

## 9. Migration và triển khai

1. Sửa UI giả success/đã cộng và guard unpaid completion trước; đây là chặn thông báo sai, chưa tự bổ sung thưởng trả trước.
2. Thêm walletVersion, source-event ledger, operation/outbox; chuyển toàn bộ writer earn/redeem/review/adjustment qua WalletService cùng khóa trước khi bật nguồn thưởng mới.
3. Snapshot cơ sở thưởng cho đơn mới; mở chính sách custom/bulk khi pricing/payment/completion guard đã đồng bộ. Không retroactively thưởng mọi custom cũ chỉ vì status COMPLETED.
4. Đối soát ledger cũ với balance/rewardProcessed/payment. Review trước đây có thể không có ledger; giữ opening balance/migration adjustment có audit và lý do, không tự dựng từng giao dịch đã không được ghi.
5. Backfill unique nguồn-sự kiện chỉ khi có bằng chứng order/receipt/reward; bản ghi không rõ đưa needsReview, không chạy EARN lần nữa để “khớp sổ”.
6. Dữ liệu wallet có số dư không hợp lệ phải được báo cáo/xử lý trước khi validate CHECK; không cắt về 0 âm thầm làm mất quyền lợi.
7. Thêm `/points/me` và adapter API cũ, chuyển FE đọc chung, rồi bật worker/feature flag. Rollback không xóa ledger đã ghi hoặc mở lại helper cộng trực tiếp.

## 10. Kiểm thử và nghiệm thu

| Ca cần thử khi triển khai | Bất biến |
| --- | --- |
| Trả trước marketplace/custom thành công, chưa COMPLETED | Chưa có EARN mua hàng; FE chỉ dự kiến |
| Hoàn 100.000đ hàng ròng + 30.000đ ship | 10 điểm; amount FE không tự quyết định |
| Hoàn 9.999đ hoặc eligibleNet=0 | PROCESSED 0 có reason, không min 8 |
| Custom/bulk quantity>1, nhiều file | Mỗi CustomOrder theo snapshot; không nhân quote/tổng/points lần nữa |
| Mua/đổi/tặng subscription | Không phát EARN mua hàng |
| COMPLETED nhưng payment thiếu/sai/đối soát | BLOCKED, không cộng balance |
| Hai completion/worker/admin retry đồng thời | Một source-event ledger, một lần tăng balance |
| Worker crash sau commit trước ack | Replay không thưởng lại; operation truy ra kết quả |
| Earn + redeem + review đồng thời, wallet chưa tồn tại | Một wallet; đủ ledger, không mất cập nhật/tiêu vượt |
| Review ảnh mới/duyệt lại/sửa review | Một REVIEW_APPROVED nếu đủ policy; ledger giải thích được số dư |
| Refund trước/sau thưởng, hoàn phần lặp | Không thưởng sai, compensation unique, không xóa lịch sử |
| Điểm đã tiêu khi refund | Debt/hold minh bạch hoặc đối soát; không âm/sửa gói âm thầm |
| GET cũ trả sau redeem/refund response | walletVersion cũ không ghi đè số dư mới |
| Profile/Subscription mở lại, logout A→B | Cùng balance nguồn server, không leak cache |
| Payment verify PENDING/lỗi/thiếu code | Không success giả/đã cộng giả, không fallback tiền |

Unit policy cần kiểm tra cơ sở tính và guard; integration database cần hai transaction thật để chứng minh unique/lock/rollback. FE test hành vi query, notification và invalidation; không chỉ test phép tính số dự kiến. Chưa có test nào được tuyên bố đã chạy trong tài liệu này.

Hoàn thành khi mỗi nguồn đủ điều kiện có đúng một ledger thưởng đã commit, mọi biến động ví mới truy vết được, trả trước không nói đã cộng sai và Profile/Subscription cùng đọc đúng ví. Chính sách mở rộng custom/bulk và debt là đề xuất cần được áp dụng có chủ đích, không được hiểu là dữ liệu hiện tại đã hỗ trợ.
