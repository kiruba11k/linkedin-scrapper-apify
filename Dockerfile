# Use official Apify base image with Node.js 20
FROM apify/actor-node:20
 
# Copy package files
COPY package*.json ./
 
# Install dependencies (production only to save space)
RUN npm install --only=production --no-optional
 
# Copy source code
COPY . ./
 
# Run the actor
CMD npm start
 
