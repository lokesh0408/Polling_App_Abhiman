# Use Node.js image
FROM node:18

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Ensure .env is copied
COPY .env .env

# Expose the port (optional)
EXPOSE 3000

# Run the app
CMD ["npm", "run", "start"]
