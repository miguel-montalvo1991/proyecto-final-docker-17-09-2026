# Dockerfile - imagen propia de la API de usuarios
# Usamos node:20-alpine porque es una imagen liviana (menor tamaño y superficie de ataque)

FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# 1) Copiamos SOLO los archivos de dependencias primero.
#    Así Docker reutiliza la capa de "npm install" en cache mientras no cambien
#    package.json / package-lock.json, aunque cambiemos el código fuente.
COPY package*.json ./

# 2) Instalamos dependencias (solo producción, sin devDependencies)
RUN npm install --omit=dev

# 3) Ahora sí copiamos el resto del código fuente
COPY src ./src

# Puerto en el que escucha la API dentro del contenedor
EXPOSE 3000

# Comando de arranque
CMD ["node", "src/server.js"]
