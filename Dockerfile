FROM node:20-alpine

# Install postgresql-client for pg_isready database connection polling
RUN apk add --no-cache postgresql-client

WORKDIR /app

# Optimize build caching by copying package manifests first
COPY package*.json ./

RUN npm install

# Copy application source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose API Port (3000) and Prisma Studio Port (5555)
EXPOSE 3000
EXPOSE 5555

CMD ["npm", "start"]