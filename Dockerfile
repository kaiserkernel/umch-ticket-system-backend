# Use official Node.js image as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./ 

# Install backend dependencies
RUN npm install

# Copy the entire project (backend)
COPY . .

# Copy SSL files into the container
COPY ./ssl /app/ssl

# If the React build is located in a separate frontend folder, build it
# Copy React frontend source code (assuming it's inside a "frontend" directory)
COPY ./frontend /usr/src/app/frontend

# Build the React frontend
WORKDIR /usr/src/app/frontend
RUN npm install && npm run build

# Copy the build folder from React to the public folder in the backend
WORKDIR /usr/src/app
COPY ./frontend/build /usr/src/app/build

# Expose the backend port
EXPOSE 5000

# Start the backend (Express) server
CMD ["npm", "start"]