# Step 1: Build React app
FROM node:18-alpine as build

WORKDIR /app
COPY . .

# Install dependencies
RUN npm install

# Build the app
RUN npm run build

# Step 2: Serve the app using nginx
FROM nginx:alpine

# Copy custom nginx config (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build files to nginx public directory
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
