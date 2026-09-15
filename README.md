# 🖨️ PrintHub 3D - Frontend

Dự án Frontend cho nền tảng dịch vụ in 3D **PrintHub 3D**, được xây dựng với **React 19**, **TypeScript**, **Vite** và **Three.js**.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

- **Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/)
- **3D Graphics & Viewer**: [Three.js](https://threejs.org/), `@react-three/fiber`, `@react-three/drei`
- **UI Components & Icons**: [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/)
- **Routing**: [React Router v7](https://reactrouter.com/)

---

## 📋 Yêu cầu hệ thống (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt:
- **Node.js**: Phiên bản `18.x` trở lên (Khuyến nghị sử dụng Node LTS v20+)
- **npm**: Đi kèm khi cài đặt Node.js (phiên bản 9.x+)

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy (Getting Started)

### 1. Clone Repository

```bash
git clone https://github.com/FeliCd/exe202-printhub3d-fe.git
cd EXE-FE
```

### 2. Cài đặt Dependencies

Bạn cần cài đặt các gói phụ thuộc bên trong thư mục `exe-fe`:

```bash
cd exe-fe
npm install
```

### 3. Cấu hình Biến môi trường (.env)

Trong thư mục `exe-fe`, tạo tệp `.env` (hoặc sao chép từ `.env.example`):

```bash
# Trên Windows PowerShell
cp .env.example .env
```

Nội dung tệp `.env`:
```env
VITE_APP_NAME=PrintHub 3D
VITE_API_BASE_URL=http://localhost:3000/api
```

### 4. Khởi chạy Ứng dụng (Development)

Bạn có thể chạy dự án bằng một trong hai cách:

#### Cách 1: Chạy từ thư mục gốc (`EXE-FE/`)
```bash
npm run dev
```

#### Cách 2: Chạy trực tiếp trong thư mục `exe-fe/`
```bash
cd exe-fe
npm run dev
```

Sau khi chạy lệnh trên, mở trình duyệt và truy cập: `http://localhost:5173` (hoặc cổng mà Vite thông báo).

---

## 📜 Các Lệnh Khác (Scripts)

| Lệnh | Mô tả |
| --- | --- |
| `npm run dev` | Khởi chạy môi trường phát triển (Dev server) |
| `npm run build` | Kiểm tra TypeScript và đóng gói dự án cho production (`dist/`) |
| `npm run preview` | Xem trước bản build production trên máy cục bộ |
| `npm run lint` | Kiểm tra lỗi cú pháp và quy chuẩn mã nguồn với ESLint |

---

## 📁 Cấu trúc Thư mục Dự án

```text
EXE-FE/
├── package.json         # Cấu hình script chung ở thư mục gốc
├── README.md            # Tài liệu hướng dẫn cài đặt & phát triển
└── exe-fe/              # Mã nguồn ứng dụng Frontend
    ├── public/          # Tài nguyên tĩnh (images, icons, models 3D, v.v.)
    ├── src/             # Mã nguồn chính (React Components, Pages, Assets...)
    ├── .env             # Biến môi trường local (không commit git)
    ├── .env.example     # Tệp mẫu biến môi trường
    ├── package.json     # Khai báo dependencies của dự án
    ├── vite.config.ts   # Cấu hình Vite
    └── tsconfig.json    # Cấu hình TypeScript
```

---

## 🤝 Quy trình Đóng góp (Workflow Guidelines)

1. Kiểm tra kĩ code và đảm bảo không còn lỗi TypeScript hoặc ESLint (`npm run lint`).
2. Trước khi push code, chạy `npm run build` để xác nhận dự án biên dịch thành công.
