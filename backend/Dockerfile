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

# Generate Prisma client during image build
RUN npx prisma generate

EXPOSE 5000

# Start server directly using npm
CMD ["npm", "run", "dev"]
