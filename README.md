# Proyecto 3 — API con base de datos y pgAdmin

API REST de usuarios (Node.js + Express) que persiste en PostgreSQL, administrable desde pgAdmin, todo orquestado con Docker Compose. Cumple con los requisitos del enunciado "Proyecto 3 — API con base de datos y pgAdmin" (ADSO).

## Arquitectura

| Servicio | Imagen | Puerto host | Descripción |
|---|---|---|---|
| `db` | `postgres:16-alpine` | 5432 | Base de datos, con migración automática y healthcheck |
| `api` | imagen propia (`Dockerfile`) | 3000 | API REST de usuarios |
| `pgadmin` | `dpage/pgadmin4` | 5050 | Administración visual de la base de datos |

## Requisitos previos

- Docker y Docker Compose instalados.
- `make` instalado (en Linux/Mac viene por defecto; en Windows usar WSL o Git Bash).

## Puesta en marcha

```bash
# 1. Clona el repo y entra a la carpeta
git clone <URL_DE_TU_REPO>
cd proyecto3-api-postgres-pgadmin

# 2. Copia el archivo de variables de entorno
cp .env.example .env

# 3. Levanta los 3 servicios (construye la imagen de la API)
make up

# 4. Verifica que los 3 contenedores están corriendo
make ps
```

## Endpoints de la API

| Método | Ruta | Descripción | Código de éxito |
|---|---|---|---|
| GET | `/health` | Verifica que la API y la BD están operativas | 200 |
| GET | `/usuarios` | Lista todos los usuarios | 200 |
| GET | `/usuarios/:id` | Obtiene un usuario por id | 200 / 404 |
| POST | `/usuarios` | Crea un usuario (`nombre`, `email` obligatorios) | 201 / 400 |
| PUT | `/usuarios/:id` | Actualiza un usuario | 200 / 400 / 404 |
| DELETE | `/usuarios/:id` | Elimina un usuario | 204 / 404 |

### Probar el CRUD completo

```bash
make test
```

### Demostrar la validación (POST con datos inválidos → 400)

```bash
make test-invalid
```

### Otros comandos útiles

```bash
make logs    # ver logs de los 3 servicios en tiempo real
make down    # detener los contenedores (conserva los datos)
make clean   # detener y BORRAR el volumen de datos (para re-ejecutar la migración desde cero)
```

## Conectar pgAdmin a la base de datos

1. Abre http://localhost:5050 e inicia sesión con las credenciales de `PGADMIN_EMAIL` / `PGADMIN_PASSWORD` (definidas en `.env`).
2. Click derecho en **Servers → Register → Server**.
3. Pestaña **General**: nombre, por ejemplo `Proyecto3`.
4. Pestaña **Connection**:
   - **Host name/address**: `db` (el nombre del servicio en `docker-compose.yml`, **no** `localhost`).
   - **Port**: `5432`
   - **Maintenance database**: el valor de `DB_NAME`
   - **Username**: el valor de `DB_USER`
   - **Password**: el valor de `DB_PASSWORD`
5. Guarda y navega a `Servers → Proyecto3 → Databases → <tu_db> → Schemas → public → Tables → usuarios → View/Edit Data` para ver los registros creados por la API.

## Evidencias a incluir en la entrega

- [ ] Captura de `docker compose ps` con los 3 servicios `Up`/`healthy`.
- [ ] Capturas de `make test` mostrando el CRUD completo (200/201/204).
- [ ] Captura de `make test-invalid` mostrando el 400.
- [ ] Captura de pgAdmin conectado, mostrando la tabla `usuarios` con datos.
- [ ] Historial de commits en Git con mensajes descriptivos.

## Preguntas de reflexión

**¿Por qué el script de migración solo se ejecuta la primera vez que se crea el volumen? ¿Qué harías para volver a ejecutarlo?**

La imagen oficial de `postgres` ejecuta los scripts de `/docker-entrypoint-initdb.d` únicamente durante la **inicialización** del directorio de datos (`PGDATA`), es decir, cuando ese directorio está vacío. Una vez que el volumen ya tiene datos, Postgres asume que la base ya está inicializada y no vuelve a correr esos scripts en arranques posteriores. Para volver a ejecutarlo hay que eliminar el volumen (`make clean`, que corre `docker compose down -v`) y levantar de nuevo con `make up`; así el directorio de datos vuelve a estar vacío y la migración se ejecuta otra vez.

**¿Por qué en pgAdmin el host de conexión es el nombre del servicio y no `localhost`?**

Docker Compose crea una red interna donde cada servicio es accesible por su **nombre de servicio** (funciona como resolución DNS interna). `localhost` dentro del contenedor de pgAdmin apunta al propio contenedor de pgAdmin, no al de la base de datos. Por eso hay que usar `db` (el nombre definido en `docker-compose.yml`), que es el host real donde escucha PostgreSQL dentro de la red de Docker.

**¿Qué ocurre si la API arranca antes de que la base de datos esté lista, y cómo lo previene la configuración del compose?**

Si la API intenta conectarse antes de que Postgres esté aceptando conexiones, las consultas fallan y la API puede caerse o quedar en un estado de error al iniciar. Esto se previene con el `healthcheck` del servicio `db` (que usa `pg_isready`) combinado con `depends_on: db: condition: service_healthy` en el servicio `api`. Con esto, Docker Compose no inicia el contenedor de la API hasta que el healthcheck de la base de datos reporte "healthy", garantizando que Postgres ya está listo para recibir conexiones.

## Retos adicionales (opcional)

- Agregar una tabla `productos` con su propia migración (`migrations/002_productos.sql`) y endpoints CRUD en un nuevo router.
- Montar el código fuente en caliente para desarrollo: agregar un volumen `./src:/app/src` al servicio `api` en un `docker-compose.override.yml`, junto con `nodemon` para recarga automática.
- Añadir un servicio `redis` y cachear `GET /usuarios/:id` con expiración (ej. `EX 60`).
