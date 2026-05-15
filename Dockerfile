# Use an official Node.js runtime as a parent image
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# --- Production Image ---
FROM node:20-slim

WORKDIR /app

# Install Python, Pip, and Tesseract OCR
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    tesseract-ocr \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy built application from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/requirements.txt ./

# Install Python dependencies globally in the container
RUN pip3 install --no-cache-dir -r requirements.txt --break-system-packages

# Set environment variables
ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

# Start the Next.js application
CMD ["npm", "start"]
