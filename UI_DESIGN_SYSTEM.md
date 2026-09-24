# 🎨 TỔNG THỂ PHONG CÁCH GIAO DIỆN & UI DESIGN SYSTEM (JA DESKTOP & CROSS-PLATFORM)

Tài liệu này tổng hợp và chuẩn hóa toàn bộ **ngôn ngữ thiết kế (Design Language)**, **kiến trúc Theme (Dart & C++)**, **hiệu ứng kính mờ (Glassmorphism / Acrylic / Aero Blur)**, và **quy tắc UI/UX** áp dụng cho tất cả các ứng dụng Flutter Desktop (Windows 10/11, macOS, Linux) và Mobile của hệ sinh thái JA Tech.

---

## 🌟 1. Triết lý Thiết kế (Core Design Philosophy)

1. **Modern Glassmorphic & Clean Precision**: Giao diện trong suốt hiện đại, tận dụng tối đa hiệu ứng làm mờ phần cứng (Hardware-accelerated backdrop blur) của hệ điều hành mà không làm giảm tốc độ phản hồi (60–120 FPS).
2. **Platform-Adaptive (Thích ứng theo OS)**:
   - **Windows 11**: Khai thác native **Mica / Acrylic** (`DWMSBT_TRANSIENTWINDOW`) kết hợp góc bo tròn tự nhiên.
   - **Windows 10**: Sử dụng **Aero Blur** (`ACCENT_ENABLE_BLURBEHIND`) tối ưu bằng margin 1px và Zero-Alpha Guard để kéo thả mượt mà 100%, không bị drop FPS hay lỗi viền đen.
   - **macOS / Linux / Mobile**: Sử dụng semi-translucent dark/light surfaces với phân lớp bóng đổ tinh tế.
3. **Performance First (Hiệu năng là số 1)**:
   - Luôn sử dụng `const` constructor cho mọi Widget tĩnh.
   - Không lồng Widget quá 4 cấp trong một hàm `build()`.
   - Lazy load dữ liệu bất đồng bộ ngầm (`unawaited`), render khung placeholder tức thì trong 16ms đầu tiên.

---

## 📐 2. Hệ thống Typography & Phông chữ Chuẩn

- **Phông chữ chủ đạo (Primary Font)**: **`Outfit`** (Google Fonts / Local Asset).
- **Phông chữ dự phòng (Fallbacks)**: `Segoe UI Variable` (Windows), `SF Pro Text` (macOS), `Roboto` (Android/Linux).
- **Cấu hình toàn cục trong `ThemeData`**:

```dart
ThemeData get themeData {
  return ThemeData(
    fontFamily: 'Outfit',
    textTheme: const TextTheme(
      headlineLarge: TextStyle(fontFamily: 'Outfit', fontSize: 24, fontWeight: FontWeight.w700),
      headlineMedium: TextStyle(fontFamily: 'Outfit', fontSize: 18, fontWeight: FontWeight.w600),
      bodyLarge: TextStyle(fontFamily: 'Outfit', fontSize: 14, fontWeight: FontWeight.w500),
      bodyMedium: TextStyle(fontFamily: 'Outfit', fontSize: 13, fontWeight: FontWeight.w400),
      bodySmall: TextStyle(fontFamily: 'Outfit', fontSize: 11, fontWeight: FontWeight.w400),
    ),
  );
}
```

### Độ tương phản chữ trên nền kính mờ (Dynamic Text Colors):
| Thành phần | Dark Mode (Chế độ tối) | Light Mode (Chế độ sáng) |
| :--- | :--- | :--- |
| **Tiêu đề / Text chính (`textPrimary`)** | `Colors.white` (`#FFFFFF`) | `Colors.black87` (`#1F1F1F`) |
| **Phụ đề / Text phụ (`textSecondary`)** | `Colors.white70` (`rgba(255,255,255,0.7)`) | `Colors.black54` (`rgba(0,0,0,0.54)`) |
| **Ghi chú / Muted (`textMuted`)** | `Colors.white38` (`rgba(255,255,255,0.38)`) | `Colors.black38` (`rgba(0,0,0,0.38)`) |
| **Icon mờ / Hint (`iconMuted`)** | `Colors.white54` | `Colors.black45` |

---

## 🎨 3. Bảng Màu & Phân Cấp Lớp Kính (Color Palette & Elevation Layers)

### 3.1 Cấu trúc độ trong suốt (Alpha/Opacity Tiers)

Để hiệu ứng nền OS (Acrylic/Aero) lộ xuyên qua đẹp mắt nhưng vẫn đảm bảo độ tương phản đọc thông tin:

```text
[ Desktop Wallpaper ] 
       ↓ (Aero Blur / Acrylic DWM Composition)
[ Window Client Area ]    → scaffoldBackgroundColor: Colors.transparent
       ↓
[ Left Sidebar / Nav ]   → Opacity ~65% - 70% (Tách biệt khu vực điều hướng)
       ↓
[ Content Background ]   → Opacity ~40% - 50% (Độ trong cao cho vùng nội dung chính)
       ↓
[ Cards / Data Tiles ]   → Opacity ~80% - 85% (Nổi bật thông tin cần tương tác)
       ↓
[ Modal Dialogs / Popup] → BackdropFilter(sigma: 5.0) + Opacity ~90%
```

### 3.2 Bảng giá trị màu sắc (`styles.dart`)

```dart
// Dark Theme (Kính mờ bóng đêm sang trọng)
static const Color darkScaffoldBg = Colors.transparent;
static const Color darkSidebarBg  = Color(0xB315171E); // ~70% #15171E
static const Color darkContentBg  = Color(0x66181A20); // ~40% #181A20
static const Color darkCardBg     = Color(0xD922252F); // ~85% #22252F
static const Color darkCardHover  = Color(0xF02A2D3A); // ~94% hover
static const Color darkBorder     = Color(0x1FFFFFFF); // 12% White Border
static const Color darkDivider    = Color(0x14FFFFFF); // 8% White Divider

// Light Theme (Kính mờ pha lê ban ngày)
static const Color lightScaffoldBg = Colors.transparent;
static const Color lightSidebarBg  = Color(0xB3F0F2F5); // ~70% #F0F2F5
static const Color lightContentBg  = Color(0x66F8F9FA); // ~40% #F8F9FA
static const Color lightCardBg     = Color(0xD9FFFFFF); // ~85% White
static const Color lightCardHover  = Color(0xF5FFFFFF); // ~96% hover
static const Color lightBorder     = Color(0x1F000000); // 12% Black Border
static const Color lightDivider    = Color(0x14000000); // 8% Black Divider

// Accent & Brand Colors
static const Color primaryAccent   = Color(0xFF00B4D8); // Cyan Blue hiện đại
static const Color secondaryAccent = Color(0xFF7209B7); // Deep Purple
static const Color successColor    = Color(0xFF10B981); // Emerald Green
static const Color warningColor    = Color(0xFFF59E0B); // Amber Orange
static const Color dangerColor     = Color(0xFFEF4444); // Crimson Red
```

---

## 🪟 4. Kiến Trúc Native Windows & C++ Runner

### 4.1 Cấu trúc tách file (`windows/runner/`)
- `theme_win11.cpp`: Kích hoạt Acrylic qua DWM `DWMSBT_TRANSIENTWINDOW (3)` và mở rộng viền `-1, -1, -1, -1`.
- `theme_win10.cpp`: Kích hoạt Aero Blur `ACCENT_ENABLE_BLURBEHIND (3)`, Zero-Alpha Guard (Alpha ≥ 1), viền mở rộng `MARGINS {0, 0, 1, 0}` (ngăn lỗi viền đôi).
- `win32_window.cpp`: Xử lý tự động ẩn chuỗi title `L""` trên Win10 để tránh lỗi vệt trắng chữ (GDI Halo Bounding Box Artifact).
- `main.cpp`: Cơ chế **Single-Instance Mutex** (`Local\<app_id>_single_instance_mutex`) kích hoạt lại cửa sổ cũ khi người dùng mở trùng lặp app.

### 4.2 Cấu trúc phân tách Style Dart (`lib/modules/ui/`)
```text
lib/modules/ui/
├── main_window.dart   # Layout chính: Sidebar + TitleBar + Content Area
├── styles.dart        # Coordinator nhận diện phiên bản OS runtime
├── styles_win10.dart  # Bảng màu tương phản cao cho Aero Blur Win10
├── styles_win11.dart  # Bảng màu trong suốt nhẹ nhàng cho Acrylic Win11
└── dialogs.dart       # Modal Glassmorphic có BackdropFilter
```

---

## 🧩 5. Quy Chuẩn Thành Phần Giao Diện (UI Component Standards)

### 5.1 Card / Panel Chuẩn (Glass Card)
```dart
Container(
  decoration: BoxDecoration(
    color: theme.cardBg,
    borderRadius: BorderRadius.circular(10),
    border: Border.all(color: theme.borderTheme, width: 1),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(0.06),
        blurRadius: 10,
        offset: const Offset(0, 4),
      ),
    ],
  ),
  padding: const EdgeInsets.all(16),
  child: childWidget,
)
```

### 5.2 Modal Popup (Glassmorphic Dialog)
Luôn bọc modal trong `BackdropFilter` với `ImageFilter.blur(sigmaX: 5.0, sigmaY: 5.0)` để tách biệt chiều sâu thị giác.

```dart
showDialog(
  context: context,
  barrierColor: Colors.black38,
  builder: (context) => BackdropFilter(
    filter: ImageFilter.blur(sigmaX: 5.0, sigmaY: 5.0),
    child: AlertDialog(
      backgroundColor: theme.cardBg,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: theme.borderTheme),
      ),
      title: Text('Xác nhận', style: TextStyle(color: theme.textPrimary)),
      content: Text('Nội dung tác vụ', style: TextStyle(color: theme.textSecondary)),
    ),
  ),
);
```

### 5.3 Nút bấm Tác vụ (Modern Action Button)
- **Primary Button**: Nền Accent Gradient hoặc màu `primaryAccent` (`#00B4D8`), chữ trắng đậm, bo góc `8px`.
- **Secondary / Ghost Button**: Nền trong suốt (`theme.cardBg`), viền `theme.borderTheme`, hiệu ứng hover sáng nhẹ.

---

## 🌐 6. Đa Ngôn Ngữ Nhanh & Chuyển Theme (i18n & Theme Cycling)

1. **Cycle Language Toggle**: Đặt 1 icon button `Icons.language` trên thanh điều hướng hoặc góc phải để xoay vòng tức thì `EN` ⇄ `VI` ⇄ `ZH`.
2. **Dark / Light Toggle**: 1 nút `Icons.dark_mode` / `Icons.light_mode` gọi `ThemeProvider.toggleTheme()`, tự động đồng bộ qua `MethodChannel('ja_route/theme')` để hệ thống C++ Runner vẽ lại DWM backdrop tương ứng.

---

## ⚡ 7. Checklist Kiểm Tra UI Chuẩn (UI Quality Gate)

Trước khi nghiệm thu một màn hình hoặc widget mới:
- [x] Đã áp dụng `const` ở tất cả các widget tĩnh.
- [x] Không có widget nào lồng quá 4 cấp trong một hàm `build()`.
- [x] Màu chữ sử dụng từ `theme.textPrimary` / `theme.textSecondary`, không hardcode màu cố định gây khó đọc khi đổi Dark/Light.
- [x] Nền app trong suốt (`scaffoldBackgroundColor: Colors.transparent`) để lộ lớp kính mờ.
- [x] Font chữ mặc định hiển thị đúng chuẩn `Outfit`.
- [x] Chạy kiểm tra bắt buộc: `dart analyze`, `dart format .`.
