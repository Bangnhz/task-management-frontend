# ==========================================
# STAGE 1: Build React App bằng Node.js
# ==========================================
FROM node:20-alpine AS builder

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy các file cấu hình thư viện trước để tận dụng Docker Cache
COPY package.json package-lock.json* ./

# Cài đặt toàn bộ dependencies (kèm devDependencies để build typescript/tailwind)
RUN npm ci

# Copy toàn bộ mã nguồn vào container
COPY . .

# Khai báo biến môi trường API nếu cần cấu hình lúc build (mặc định trỏ về backend local)
ARG REACT_APP_API_URL=http://localhost:8080/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build dự án ra thư mục tĩnh (thường là /app/build)
RUN npm run build

# ==========================================
# STAGE 2: Chạy ứng dụng bằng Web Server Nginx nhẹ
# ==========================================
FROM nginx:alpine-slim

# Xóa trang mặc định của Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy sản phẩm đã build ở STAGE 1 sang thư mục phục vụ web của Nginx
COPY --from=builder /app/build /usr/share/nginx/html
# Sau COPY 

# Stage 1:
# /app/build/
# ├── index.html
# ├── static/
# │   ├── css/
# │   └── js/
# └── ...

# Stage 2:
# /usr/share/nginx/html/
# ├── index.html
# ├── static/
# │   ├── css/
# │   └── js/
# └── ...

# Tạo cấu hình Nginx để hỗ trợ React Router (tránh lỗi 404 khi F5 trang)
RUN echo 'server {' \
    '  listen 80;' \
    '  location / {' \
    '    root /usr/share/nginx/html;' \
    '    index index.html index.htm;' \
    '    try_files $uri $uri/ /index.html;' \
    '  }' \
    '}' > /etc/nginx/conf.d/default.conf

# Khai báo port container lắng nghe
EXPOSE 80

# Chạy Nginx ở chế độ foreground
CMD ["nginx", "-g", "daemon off;"]

# STAGE 1
# Source code
#     ↓
# npm ci
#     ↓
# npm run build
#     ↓
# /app/build/          ← sản phẩm build
#     ├── index.html
#     ├── static/
#     │   ├── css/
#     │   └── js/
#     └── Node
# ├── React
# ├── TypeScript
# ├── Tailwind
# ├── Vite
# └── node_modules

# Stage 2:

# /app/build/
# ├── index.html
# ├── CSS
# └── JS
#       ↓
# Nginx
#       ↓
# /usr/share/nginx/html/
#       ↓
# Frontend container

# Ví dụ source ban đầu:

# project/
# ├── src/
# │   ├── App.js
# │   ├── components/
# │   └── ...
# ├── public/
# ├── package.json
# ├── package-lock.json
# ├── node_modules/
# └── Dockerfile

# Sau: RUN npm run build

# /app/build/
# ├── index.html
# ├── static/
# │   ├── css/
# │   │   └── ...
# │   └── js/
# │       └── ...
# └── ...

# CODE REACT
#    │
#    ▼
# ┌──────────────────────────────┐
# │ STAGE 1: NODE                │
# │                              │
# │ 1. Lấy Node.js               │
# │ 2. Tạo /app                  │
# │ 3. Copy package.json         │
# │ 4. npm ci                    │
# │ 5. Copy source code          │
# │ 6. npm run build             │
# │                              │
# │ KẾT QUẢ: /app/build          │
# └──────────────┬───────────────┘
#                │
#                │ COPY --from=builder
#                ▼
# ┌──────────────────────────────┐
# │ STAGE 2: NGINX               │
# │                              │
# │ 7. Lấy Nginx                 │
# │ 8. Xóa trang mặc định        │
# │ 9. Lấy /app/build             │
# │10. Cấu hình React Router     │
# │11. Nginx chạy port 80        │
# └──────────────┬───────────────┘
#                │
#                ▼
#          WEBSITE REACT

# React source code
#       ↓
# Node.js
#       ↓
# npm run build
#       ↓
# /app/build
#       ↓
# HTML + CSS + JS + images
#       ↓
# Nginx
#       ↓
# Browser

# ┌──────────────┐
# │   Browser    │
# │ localhost:   │
# │    3000      │
# └──────┬───────┘
#        │
#        │ HTTP request
#        ▼
# ┌──────────────┐
# │ Docker       │
# │ port 3000    │
# │      ↓       │
# │ container 80 │
# └──────┬───────┘
#        │
#        ▼
# ┌──────────────┐
# │    Nginx     │
# │              │
# │ /html/       │
# │   ↓          │
# │ index.html   │
# └──────┬───────┘
#        │
#        ▼
# ┌──────────────┐
# │   Browser    │
# │              │
# │ React chạy   │
# └──────────────┘

# STAGE 2 không cần mang Node.js sang từ Stage 1.
# Vì khi chạy website:

# Browser
#    ↓
# Nginx
#    ↓
# index.html
#    ↓
# JavaScript

# Browser không cần:

# Node.js
# npm
# TypeScript
# Tailwind
# node_modules
