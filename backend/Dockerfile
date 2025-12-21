FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

ENV PORT=5000

# Expose the port the app runs on
EXPOSE $PORT

# Default command to run the app
CMD ["npm", "run", "dev"]
