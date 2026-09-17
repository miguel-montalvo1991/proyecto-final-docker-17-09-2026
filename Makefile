# Makefile - atajos para operar el proyecto (Proyecto 3 - API + PostgreSQL + pgAdmin)
# Uso: make <objetivo>   (ej: make up)

.PHONY: up down logs ps build test test-invalid clean

## Levanta los 3 servicios en segundo plano (construye la imagen si hace falta)
up:
	docker compose up -d --build

## Detiene y elimina los contenedores (conserva el volumen de datos)
down:
	docker compose down

## Elimina TODO, incluyendo el volumen de datos (vuelve a ejecutar la migración desde cero)
clean:
	docker compose down -v

## Muestra el estado de los servicios
ps:
	docker compose ps

## Construye/reconstruye solo la imagen de la API
build:
	docker compose build api

## Muestra los logs de todos los servicios en tiempo real
logs:
	docker compose logs -f

## Prueba rápida del CRUD completo usando curl
test:
	@echo "--- Health check ---"
	curl -s http://localhost:3000/health
	@echo "\n--- Listar usuarios ---"
	curl -s http://localhost:3000/usuarios
	@echo "\n--- Crear usuario ---"
	curl -s -X POST http://localhost:3000/usuarios \
		-H "Content-Type: application/json" \
		-d '{"nombre":"Prueba Make","email":"prueba.make@example.com"}'
	@echo "\n--- Obtener usuario con id 1 ---"
	curl -s http://localhost:3000/usuarios/1
	@echo "\n--- Actualizar usuario con id 1 ---"
	curl -s -X PUT http://localhost:3000/usuarios/1 \
		-H "Content-Type: application/json" \
		-d '{"nombre":"Ana Torres Editada","email":"ana.torres@example.com"}'
	@echo "\n--- Eliminar usuario con id 1 ---"
	curl -s -X DELETE http://localhost:3000/usuarios/1 -w "status: %{http_code}\n"

## Demuestra que un POST con datos inválidos devuelve 400
test-invalid:
	@echo "--- POST sin nombre ni email (debe devolver 400) ---"
	curl -s -X POST http://localhost:3000/usuarios \
		-H "Content-Type: application/json" \
		-d '{}' -w "\nstatus: %{http_code}\n"
	@echo "--- POST con email inválido (debe devolver 400) ---"
	curl -s -X POST http://localhost:3000/usuarios \
		-H "Content-Type: application/json" \
		-d '{"nombre":"Test","email":"no-es-un-email"}' -w "\nstatus: %{http_code}\n"
