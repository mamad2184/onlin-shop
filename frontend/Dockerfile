# Use the official Node.js image as the base
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies first
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the frontend source code
COPY . ./

# Expose Vite's default development port
EXPOSE 5173

# Start the Vite development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
