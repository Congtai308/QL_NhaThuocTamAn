# Stage 1: build app
FROM node:20-alpine AS builder

# Cài vài thứ nhỏ giúp build ổn định hơn
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy file cấu hình dependency trước
COPY package*.json ./

# Cài dependency (không cần node_modules trong Git)
RUN npm install

# Copy toàn bộ source vào container
COPY . .

# Build Next.js ở chế độ production
RUN npm run build

# Stage 2: image chạy thật
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy node_modules & build output từ stage builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Next.js của bạn đang start trên cổng 3000
EXPOSE 3000

# Lệnh chạy app (dùng script "start" trong package.json)
CMD ["npm", "start"]
