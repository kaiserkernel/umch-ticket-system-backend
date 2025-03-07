# Use official Node.js image as the base image
FROM node:18

# Install necessary dependencies for Puppeteer/Chrome
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxi6 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libgtk-3-0 \
    libxss1 \
    && rm -rf /var/lib/apt/lists/*

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

# Ensure the node user has the right permissions
RUN chown -R node:node /usr/src/app /usr/src/app/node_modules
RUN chmod 755 /usr/src/app

USER node

# Expose the backend port (5000) and frontend port (3000) if needed for different services
EXPOSE 5000

# Start the backend server using dumb-init
CMD ["npm", "start"]
