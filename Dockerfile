# Use official Node.js image as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy the entire backend project (including all code)
COPY . .

# Copy SSL files into the container
COPY ./ssl /app/ssl

# Copy the already built React frontend into the backend build directory
COPY ./build /usr/src/app/build

# Expose the backend port (5000) and frontend port (3000) if needed for different services
EXPOSE 5000
EXPOSE 3000

# Start the backend (Express) server
CMD ["npm", "start"]
