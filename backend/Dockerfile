# Backend PHP de CasaSwap para Railway
# Usa el servidor web integrado de PHP (simple y fiable para una API).
FROM php:8.2-cli

# Extensión PDO MySQL
RUN docker-php-ext-install pdo pdo_mysql

# Copiar el código del backend
COPY . /var/www/html/
WORKDIR /var/www/html

# Railway asigna el puerto en la variable $PORT.
# El servidor de PHP escucha en ese puerto.
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-8080} -t /var/www/html"]
