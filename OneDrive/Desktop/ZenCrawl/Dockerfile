# Use the official Node.js LTS image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install TypeScript globally to avoid permission issues
RUN npm install -g typescript

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Install type definitions
RUN npm install --save-dev @types/node @types/express @types/cors

# Install Playwright and its dependencies
RUN npx playwright install chromium
RUN npx playwright install-deps

# Copy source files and config
COPY src/ ./src/
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Verify build output
RUN ls -la dist/

# Expose the port Cloud Run expects
EXPOSE 8080

# Start the app with Node directly instead of npm
CMD [ "node", "dist/index.js" ] 