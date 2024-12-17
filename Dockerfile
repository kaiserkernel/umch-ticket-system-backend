# Use official Node.js image as base
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of your app
COPY . .

# Expose the port the backend will run on
EXPOSE 5000

# Command to run the backend API
CMD ["npm", "start"]
