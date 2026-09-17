# WordPress persistente con Docker Compose — Proyecto 2

Stack de WordPress + MySQL usando Docker Compose, con persistencia de datos verificada mediante volúmenes nombrados.

## Requisitos

- Docker Desktop instalado y corriendo

## Estructura

- `docker-compose.yml` — define los servicios `db` (MySQL 8) y `wordpress`
- `.env.example` — plantilla de variables de entorno (copiar a `.env` y completar con datos reales)
- `.gitignore` — excluye `.env` (nunca se sube con credenciales reales)

## Cómo levantar

\`\`\`bash
cp .env.example .env
# completar .env con tus propias credenciales
docker compose up -d
\`\`\`

WordPress queda disponible en `http://localhost:8080`

## Arquitectura

- **db**: MySQL 8, con healthcheck (`mysqladmin ping`) para confirmar que está listo antes de que WordPress intente conectarse
- **wordpress**: espera a que `db` esté "healthy" (`depends_on: condition: service_healthy`) antes de arrancar
- Ambos servicios comparten la red `wp_network`, por lo que WordPress se conecta a la base de datos usando el nombre del servicio (`db`) como host, no una IP
- Volúmenes nombrados:
  - `db_data` → persiste los datos de MySQL (`/var/lib/mysql`)
  - `wp_content` → persiste uploads y plugins de WordPress (`/var/www/html/wp-content`)

## Prueba de persistencia realizada

1. Se instaló WordPress y se creó una entrada de prueba ("Prueba de persistencia")
2. Se verificaron los volúmenes existentes:

\`\`\`
[DRIVER    VOLUME NAME
local     07a52ebf63964c10568801b271c4bd05b44fc1c78bb85abc3aa7ac63f670ae1c
local     76f815e8907ebe9ef9d290dcf4b8412ed45722e0c9e5d12b6e6ae69fd6b7c37d
local     598aab210b6ee670cee911c6e0aec9a345e32bb834064cd4c5cbdc8729ffd5f7
local     9544b12380180c3433e7f6e158ce3968801d1cd2bf571bef1a1e6e5f962ebb3e
local     ad1769986a85ee6c68936dbc144f41b22caa05f318bff2d566794af27d588e8f
local     c8182c6d054e0c374b89a9e0065a4d1c7e37c2d22ac507f5bbf43202c8ad61cc
local     datos
local     datos_db
local     edcda1e15f021b1ee44f79dcc6905820e45e28940a0b4027c6460d93707acb0d
local     ejemplo_pg_data
local     ejercicio_mi_wordpress_data
local     ejercicio_mi_wordpress_files
local     ejercicio_pg_data_ejercicio
local     ejercicio_wordpress_files
local     ffe6c316ee7d5bf78eb83d4645383c2a7c2bd5ea1ad99316f1e93bdc2be41481
local     mi-app-docker_datos
local     mi-stack-ej9_datos_db
local     mi-stack_datos_db
local     minikube
local     proyecto2-wordpress-compose_db_data
local     proyecto2-wordpress-compose_wp_content
local     vol_demo]
\`\`\`

3. Se ejecutó `docker compose down` (elimina contenedores, NO volúmenes):

\`\`\`
[ Container proyecto2-wordpress-compose-wordpress-1 Removed                                                               6.6s
 ✔ Container proyecto2-wordpress-compose-db-1        Removed                                                               1.7s
 ✔ Network proyecto2-wordpress-compose_wp_network    Removed         ]
\`\`\`

4. Se confirmó que los volúmenes seguían existiendo tras el down:

\`\`\`
[C:\Users\luism\proyecto-final-17-09-2026\proyecto2-wordpress-compose>docker volume ls
DRIVER    VOLUME NAME
local     07a52ebf63964c10568801b271c4bd05b44fc1c78bb85abc3aa7ac63f670ae1c
local     76f815e8907ebe9ef9d290dcf4b8412ed45722e0c9e5d12b6e6ae69fd6b7c37d
local     598aab210b6ee670cee911c6e0aec9a345e32bb834064cd4c5cbdc8729ffd5f7
local     9544b12380180c3433e7f6e158ce3968801d1cd2bf571bef1a1e6e5f962ebb3e
local     ad1769986a85ee6c68936dbc144f41b22caa05f318bff2d566794af27d588e8f
local     c8182c6d054e0c374b89a9e0065a4d1c7e37c2d22ac507f5bbf43202c8ad61cc
local     datos
local     datos_db
local     edcda1e15f021b1ee44f79dcc6905820e45e28940a0b4027c6460d93707acb0d
local     ejemplo_pg_data
local     ejercicio_mi_wordpress_data
local     ejercicio_mi_wordpress_files
local     ejercicio_pg_data_ejercicio
local     ejercicio_wordpress_files
local     ffe6c316ee7d5bf78eb83d4645383c2a7c2bd5ea1ad99316f1e93bdc2be41481
local     mi-app-docker_datos
local     mi-stack-ej9_datos_db
local     mi-stack_datos_db
local     minikube
local     proyecto2-wordpress-compose_db_data
local     proyecto2-wordpress-compose_wp_content]
\`\`\`

5. Se ejecutó `docker compose up -d` nuevamente y se verificó en `http://localhost:8080/wp-admin` que la entrada "Prueba de persistencia" seguía existiendo.

[Proyecto-Final-Docker

Página de ejemplo

Blog

PRUEBA DE PERSISTENCIA

17 septiembre, 2026

¡Hola mundo!

Bienvenido(a) a WordPress. Esta es tu primera entrada. Editala o bórrala jy
comienza a publicar!

17 septiembre, 2026

Proyecto-Final-Docker]

## Preguntas de reflexión

**¿Qué comando elimina también los datos, y por qué usarlo con cuidado?**
[El comando docker compose down -v elimina los contenedores, las redes y también los volúmenes. Hay que usarlo con cuidado porque al borrar los volúmenes se eliminan los datos almacenados, como la base de datos de WordPress, y esa información puede perderse definitivamente]

**¿Por qué WordPress se conecta a `db` y no a una IP?**
[WordPress se conecta a db porque Docker Compose crea una red interna donde los servicios pueden encontrarse por su nombre. Así, si la dirección IP cambia, WordPress seguirá encontrando la base de datos usando el nombre db, lo que hace la configuración más simple y estable.]

**¿Qué aporta el healthcheck frente a un depends_on simple?**
[Un depends_on simple solo controla el orden de inicio de los contenedores, pero no verifica que el servicio esté listo para funcionar. En cambio, el healthcheck comprueba que el servicio realmente esté operativo y respondiendo correctamente antes de que otros contenedores dependan de él. Esto evita errores por intentar conectarse a servicios que aún no están preparados.]