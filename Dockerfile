FROM node:20-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json ./

# Install Angular CLI
RUN npm install -g @angular/cli@19

# Install dependencies
RUN npm install

# Copy config files
COPY angular.json ./
COPY tsconfig*.json ./

# Copy source code
COPY src ./src
COPY public ./public

EXPOSE 4200

# Start dev server with SSL disabled (Angular handles it internally)
CMD ["ng", "serve", "--host", "0.0.0.0", "--poll", "2000", "--ssl=false"]