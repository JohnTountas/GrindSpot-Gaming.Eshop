FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ARG VITE_API_URL=http://localhost:5050/api
ARG VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_STRIPE_PUBLIC_KEY=${VITE_STRIPE_PUBLIC_KEY}
RUN npm run build

# -------- Production stage --------
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
