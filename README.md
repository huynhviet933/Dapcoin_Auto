# Dapcoin_Auto
Auto ref , Note My ref , Check in , Auto Task Daily 

Link Aidrop : https://t.me/HVchannelss/319

Tham Gia Discor ( Vip ) : https://discord.gg/gKxvTNu5

Tham gia NHóm VIp Với Chi Phí 8u/1thang Lợi ích tham gia nhóm ViP Sẽ được cấp keey sử dụng các tool vip trong discor hỗ trợ Và tham khao Code các tool dự án mà các bạn đề xuất

Gửi Phí tháng vào đây và chụp hình gửi trực tiếp cho tôi tại discor để xác nhận Role VIp ☕ https://huynhviet933.github.io/donate_viet_mmo/ Có thể tặng tôi ít cafe tại đây


================================================================================
HƯỚNG DẪN SỬ DỤNG SCRIPT DAPCOIN (FREE & VIP)
================================================================================

1. CÀI ĐẶT MÔI TRƯỜNG (NODE.JS):
-------------------------------------------
Mở Terminal/Command Prompt và chạy lệnh sau để cài đặt các thư viện cần thiết:

npm install axios bs58 tweetnacl uuid fs-extra https-proxy-agent colors crypto

2. CHUẨN BỊ CÁC FILE DỮ LIỆU (CÙNG THƯ MỤC):
-------------------------------------------
Bạn cần có các file .txt sau trước khi chạy script:

- privatekey.txt  : Danh sách mã ví Privatekey SOL (mỗi dòng 1 mã).
- proxy.txt       : Danh sách proxy (định dạng http://user:pass@ip:port hoặc http://ip:port).
- user_agents.txt : Danh sách User-Agent (mỗi dòng 1 cái).
- ref.txt         : Mã mời của bạn (dòng đầu tiên 1 dòng 1 mã ) 

3. CÁCH CHỌN PHIÊN BẢN ĐỂ CHẠY:
-------------------------------------------
- Bản Free (Free.js): Chạy tuần tự từng ví, mỗi ví xong nghỉ 120s - 300s. Đảm bảo an toàn.
  Lệnh chạy: node Free.js

- Bản Vip (Vip.js): Chạy đa luồng (mặc định 3 luồng), có hệ thống lưu Profile và HWID.
  Lệnh chạy: node Vip.js
  (Lưu ý: Bản Vip sẽ yêu cầu nhập Key License khi khởi động lần đầu).

4. MÔ TẢ TÍNH NĂNG TỰ ĐỘNG:
-------------------------------------------
Cả hai bản script đều tự động thực hiện:
- Login & Xác thực chữ ký ví.
- Điểm danh hằng ngày (Check-in).
- Tự động quét và làm toàn bộ nhiệm vụ (Tasks) DAILY và ONCE.
- Tự động lấy mã Ref của ví và lưu vào file uref.txt.
- Hiển thị tổng số Point hiện có sau khi hoàn thành.

5. CẤU TRÚC FILE TRONG THƯ MỤC:
-------------------------------------------
/DapCoin-Bot
├── Free.js           # File script bản miễn phí
├── Vip.js            # File script bản Vip
├── privatekey.txt    # Dữ liệu ví
├── proxy.txt         # Dữ liệu mạng
├── user_agents.txt   # Dữ liệu trình duyệt
├── ref.txt           # Mã ref gốc
├── profiles.json     # (Tự sinh) Lưu trữ token để không phải login lại
└── license.txt       # (Tự sinh) Lưu key bản quyền cho bản Vip

================================================================================
