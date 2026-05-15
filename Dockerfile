# Use Node.js 20 as the base image
FROM node:20-slim

# Install system dependencies (Tesseract, Python, and Pip)
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package files and install Node dependencies
COPY package*.json ./
RUN npm install

# Copy requirements.txt and install Python dependencies
COPY requirements.txt ./
RUN pip3 install --no-cache-dir --upgrade pip --break-system-packages && \
    pip3 install --no-cache-dir -r requirements.txt --break-system-packages

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port Next.js runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
