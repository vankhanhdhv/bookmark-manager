# Chrome Extension - Bookmark Manager Pro

Chrome extension giúp quản lý bookmark theo danh mục với giao diện thân thiện.

## Tính năng

- Quản lý bookmark theo danh mục
- Thêm/sửa/xóa danh mục và liên kết 
- Tùy chỉnh icon cho danh mục và liên kết
- Export/Import dữ liệu sang máy khác

## Cài đặt

1. Tải source code về máy
2. Mở Chrome > Menu > Extensions > Developer mode
3. Chọn "Load unpacked" > Chọn thư mục source code
4. Extension sẽ hiện icon trên thanh công cụ

## Sử dụng

- Click icon extension để mở popup
- Click "Bổ sung" để thêm danh mục/liên kết
- Click icon edit để sửa/xóa
- Export/Import để sao lưu/khôi phục dữ liệu

## Cấu trúc thư mục

```
extension/
  ├── manifest.json
  ├── popup.html 
  ├── popup.js
  ├── styles.css
  └── images/
      ├── icon16.png
      ├── icon48.png
      └── icon128.png
```

## Yêu cầu quyền

- storage: Lưu trữ dữ liệu
- windows, tabs: Quản lý popup
- host permissions: Truy cập URL

## Công nghệ

- HTML/CSS/JavaScript
- Chrome Extension API
- Font Awesome Icons
```
