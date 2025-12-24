# reference: https://chatgpt.com/c/694c2de6-a7b4-8327-aa15-afa603dc990e
# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (for better layer caching)
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --omit=dev

# Copy the rest of the project files
COPY . .

# Create uploads directory (used by Multer)
RUN mkdir -p uploads

# Expose app port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
