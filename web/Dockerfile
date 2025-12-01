# ETAPA 1: Construcción (Build)
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Argumento para la URL de la API (se pasará desde docker-compose)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ETAPA 2: Servidor Web (Nginx)
FROM nginx:alpine
# Copiamos los archivos construidos a la carpeta pública de Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Copiamos configuración para que React Router funcione bien (opcional pero recomendado)
# Si no tienes nginx.conf, Nginx usará el default y servirá.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]