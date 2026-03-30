# Use Debian-based slim image to avoid Alpine/musl OpenSSL Prisma issues
FROM node:20-slim

# Install OpenSSL which is required by Prisma
RUN apt-get update -y && apt-get install -y openssl

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Copy the prisma directory since it's needed for installation step
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate the Prisma client
RUN npx prisma generate

# Build the TypeScript code
RUN npm run build

# Expose the API port your server runs on
EXPOSE 5000

# Start the compiled application
CMD ["npm", "run", "start"]
