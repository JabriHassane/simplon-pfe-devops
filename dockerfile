# Use Node.js 18
FROM node:18-bullseye

WORKDIR /app

# Install shared dependencies
COPY shared/package*.json ./shared/
WORKDIR /app/shared
RUN npm install

WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install

# Copy full server and shared code
WORKDIR /app
COPY server ./server
COPY shared ./shared

# Build server
WORKDIR /app/server
RUN npx prisma generate
RUN npm run build

EXPOSE 8080

# Run built server
CMD ["npm", "start"]