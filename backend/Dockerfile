FROM node:20-alpine

# Install Chromium and system font dependencies for Alpine (required by Puppeteer for PDF generation)
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      dos2unix

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Convert startup script line endings to Unix format (prevents CRLF errors)
RUN dos2unix start.sh

# Generate Prisma client during image build
RUN npx prisma generate

# Make startup script executable
RUN chmod +x start.sh

EXPOSE 5000

# ✅ FIX: Startup — push schema + seed DB + start server (DB health check handled by docker-compose healthcheck)
CMD ["sh", "start.sh"]
