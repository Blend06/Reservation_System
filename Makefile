# Reservo - Developer Commands

# Start all services (runs migrations automatically)
up:
	docker-compose up --build

# Start in detached mode
up-d:
	docker-compose up --build -d

# Stop all services
down:
	docker-compose down

# Run migrations manually (if needed after model changes)
migrate:
	docker-compose exec backend python manage.py migrate

# Create new migrations after model changes
makemigrations:
	docker-compose exec backend python manage.py makemigrations

# Open Django shell
shell:
	docker-compose exec backend python manage.py shell

# Create a superuser
createsuperuser:
	docker-compose exec backend python manage.py createsuperuser

# View backend logs
logs:
	docker-compose logs -f backend

# View all logs
logs-all:
	docker-compose logs -f

# Rebuild only backend
rebuild-backend:
	docker-compose up --build backend

# Reset database (WARNING: destroys all data)
reset-db:
	docker-compose down -v
	docker-compose up --build
