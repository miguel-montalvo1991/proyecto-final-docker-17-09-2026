# API de Productos — Proyecto 1 (Docker)

API REST simple para gestión de productos, construida con Node.js/Express y empaquetada en una imagen Docker.

## Requisitos

- Docker Desktop instalado y corriendo
- (Opcional para desarrollo local sin Docker) Node.js 20+

## Estructura

- `index.js` — servidor Express con 5 endpoints CRUD sobre un arreglo en memoria
- `Dockerfile` — instrucciones para construir la imagen
- `.dockerignore` — excluye `node_modules` y `.git` del build

## Cómo construir la imagen

\`\`\`bash
docker build -t productos-api:1.0 .
\`\`\`

## Cómo correr el contenedor

\`\`\`bash
docker run -d --name productos-api -p 3000:3000 productos-api:1.0
\`\`\`

La API queda disponible en `http://localhost:3000`

## Endpoints

| Método | Ruta               | Descripción                          |
|--------|--------------------|---------------------------------------|
| GET    | /productos         | Lista todos los productos             |
| GET    | /productos/:id     | Obtiene un producto (404 si no existe)|
| POST   | /productos         | Crea un producto                      |
| PUT    | /productos/:id     | Actualiza un producto (404 si no existe)|
| DELETE | /productos/:id     | Elimina un producto                   |

## Ejemplos de uso

\`\`\`bash
curl http://localhost:3000/productos
curl -X POST http://localhost:3000/productos -H "Content-Type: application/json" -d "{\"nombre\":\"Monitor\",\"precio\":500000}"
\`\`\`

## Evidencia

### docker ps
\`\`\`
CONTAINER ID   IMAGE               COMMAND                  STATUS         PORTS
9e220653a357   productos-api:1.0   "docker-entrypoint.s…"   Up 2 minutes   0.0.0.0:3000->3000/tcp
\`\`\`

### docker logs productos-api

Servidor corriendo en http://localhost:3000


## Notas técnicas

- Se usa `node:20-alpine` como imagen base por su tamaño reducido frente a `node:20`.
- `package*.json` se copia y se instalan dependencias antes de copiar el resto del código, para aprovechar el cacheo de capas de Docker.


## evidencia de  docker ps y docker logs productos-api

C:\Users\luism\proyecto-final-17-09-2026\proyecto1-docker-image>docker ps
CONTAINER ID   IMAGE               COMMAND                  CREATED         STATUS         PORTS                                         NAMES
9e220653a357   productos-api:1.0   "docker-entrypoint.s…"   2 minutes ago   Up 2 minutes   0.0.0.0:3000->3000/tcp, [::]:3000->3000/tcp   productos-api

C:\Users\luism\proyecto-final-17-09-2026\proyecto1-docker-image>docker logs productos-api
Servidor corriendo en http://localhost:3000

C:\Users\luism\proyecto-final-17-09-2026\proyecto1-docker-image>