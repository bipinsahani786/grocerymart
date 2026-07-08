FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# Vite uses host binding (0.0.0.0) so it's accessible outside container
CMD ["npm", "run", "dev", "--", "--host"]
