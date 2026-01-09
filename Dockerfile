FROM node:22-alpine AS builder
WORKDIR /app

# Update OS packages di builder
RUN apk update && apk upgrade --no-cache

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app

# Update OS packages di runtime image
RUN apk update && apk upgrade --no-cache

COPY --from=builder /app . 
EXPOSE 3000
CMD ["npm", "start"]



# FROM node:20.17-alpine AS builder
# WORKDIR /app
# RUN apk update && apk upgrade --no-cache
# RUN npm install -g npm@latest

# COPY . .
# RUN npm install
# RUN npm run build

# FROM node:22-alpine
# WORKDIR /app

# RUN npm install -g npm@latest

# COPY --from=builder /app .
# EXPOSE 3000
# CMD ["npm", "start"]


# FROM node:20-alpine AS builder
# WORKDIR /app
# COPY . .
# RUN npm install
# RUN npm run build

# FROM node:20-alpine
# WORKDIR /app
# COPY --from=builder /app .
# EXPOSE 3000
# CMD ["npm", "start"]

# FROM node:20-alpine AS builder
# WORKDIR /app

# COPY package*.json ./
# RUN npm ci

# COPY . .
# RUN npm run build

# FROM node:20-alpine
# WORKDIR /app

# COPY --from=builder /app ./

# EXPOSE 3000

# CMD ["node", "node_modules/next/dist/bin/next", "start"]
