FROM node:20-alpine

# Install dependencies required by Prisma and PostgreSQL
RUN apk add --no-cache \
    postgresql-client \
    ca-certificates

RUN update-ca-certificates

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3000
EXPOSE 5555

CMD ["npm", "start"]