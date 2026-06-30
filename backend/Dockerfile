FROM node:18-alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate prisma client
# --legacy-peer-deps: @nestjs/schedule peer çakışmasını gevşek geçer (NestJS 11 uyumu)
RUN npm install --legacy-peer-deps
RUN npx prisma generate

# Bundle app source
COPY . .

# Build the app
RUN npm run build

# --- Production image ---
FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 3001

# Command to run the application
CMD [ "npm", "run", "start:prod" ]
