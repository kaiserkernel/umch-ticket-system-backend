# Use official Node.js image as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy the entire project
COPY . .

# Build the React frontend (optional if the build folder is already present)
RUN npm run build --prefix ./build

# Expose the backend port
EXPOSE 5000

# Start the backend (Express) server
CMD ["npm", "start"]